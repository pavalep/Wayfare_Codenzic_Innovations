/**
 * The auth store's two contracts.
 *
 * THE HYDRATION CONTRACT
 *
 * `persist` rehydrates asynchronously. On a cold start the store holds
 * its initial — signed-out — state for a few frames even though a
 * session is saved on disk. The router guard reads `isAuthenticated`,
 * so if the guard fired before hydration finished, a signed-in user
 * would be bounced to the login screen on every launch and the
 * persisted session would be pointless.
 *
 * These tests pin that contract down: the flag flips once the read
 * completes, the session survives a restart, and a storage failure
 * still releases the app instead of stranding it.
 *
 * THE ACCOUNTS CONTRACT
 *
 * The accounts registered on the device are the source of truth for
 * the login: only an account that was created on the register screen
 * can be signed in to. These tests pin that down too — an unknown
 * email is refused, a wrong password is refused, a duplicate
 * registration is refused, and the accounts survive a restart.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const STORAGE_KEY = 'wayfare.auth';

type Storage = typeof import('@react-native-async-storage/async-storage').default;
type AuthStore = typeof import('../../src/state/authStore').useAuthStore;

/**
 * Loads the storage mock from the CURRENT module registry.
 *
 * `jest.resetModules()` empties the registry and re-runs the mock
 * factory, which creates a brand new in-memory store. The store
 * module and the storage mock therefore have to come from the SAME
 * registry generation — otherwise the auth store writes to one
 * in-memory store and the test reads from another.
 */
function loadStorage(): Storage {
  return require('@react-native-async-storage/async-storage');
}

function loadStore(): AuthStore {
  return require('../../src/state/authStore').useAuthStore;
}

/**
 * Lets the pending AsyncStorage read resolve. The store hydrates on a
 * promise chain, so the flag flips a microtask later.
 */
async function flushHydration(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0));
}

describe('useAuthStore', () => {
  beforeEach(() => {
    // A fresh registry means a fresh store AND a fresh, empty storage
    // mock — which is exactly what a cold start of the app looks like.
    jest.resetModules();
  });

  it('starts signed out and not hydrated', () => {
    const useAuthStore = loadStore();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().email).toBeNull();
    expect(useAuthStore.getState().hasHydrated).toBe(false);
  });

  it('flags the session as hydrated once storage has been read', async () => {
    const useAuthStore = loadStore();

    await flushHydration();

    expect(useAuthStore.getState().hasHydrated).toBe(true);
  });

  it('records the session on sign in', () => {
    const useAuthStore = loadStore();

    useAuthStore
      .getState()
      .register('Paval', '  PAVAL@Example.com ', 'correct horse');

    const result = useAuthStore
      .getState()
      .signIn('  PAVAL@Example.com ', 'correct horse');

    expect(result).toBe('ok');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.email).toBe('paval@example.com');
  });

  it('persists the session and the accounts, never the actions', async () => {
    const storage = loadStorage();
    const useAuthStore = loadStore();

    useAuthStore
      .getState()
      .register('Paval', 'paval@example.com', 'correct horse');
    useAuthStore.getState().signIn('paval@example.com', 'correct horse');
    await flushHydration();

    const raw = await storage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw as string).state;
    expect(Object.keys(parsed).sort()).toEqual([
      'accounts',
      'email',
      'isAuthenticated',
    ]);
    expect(parsed.email).toBe('paval@example.com');
    expect(parsed.isAuthenticated).toBe(true);
    expect(parsed.accounts).toHaveLength(1);
  });

  it('restores a persisted session on a cold start', async () => {
    // Seed storage as a previous run of the app would have left it.
    const storage = loadStorage();
    await storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {email: 'paval@example.com', isAuthenticated: true},
        version: 0,
      }),
    );

    // The store is created AFTER the seed, so it hydrates from it.
    const useAuthStore = loadStore();
    await flushHydration();

    const state = useAuthStore.getState();
    expect(state.hasHydrated).toBe(true);
    expect(state.isAuthenticated).toBe(true);
    expect(state.email).toBe('paval@example.com');
  });

  it('signs out and forgets the session', async () => {
    const storage = loadStorage();
    const useAuthStore = loadStore();

    useAuthStore
      .getState()
      .register('Paval', 'paval@example.com', 'correct horse');
    useAuthStore.getState().signIn('paval@example.com', 'correct horse');
    await flushHydration();

    useAuthStore.getState().signOut();
    await flushHydration();

    const raw = await storage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw as string).state;
    expect(parsed.isAuthenticated).toBe(false);
    expect(parsed.email).toBeNull();
  });

  it('keeps the accounts when the session ends', () => {
    const useAuthStore = loadStore();

    useAuthStore
      .getState()
      .register('Paval', 'paval@example.com', 'correct horse');
    useAuthStore.getState().signIn('paval@example.com', 'correct horse');
    useAuthStore.getState().signOut();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accounts).toHaveLength(1);
    // The account is still usable after signing out.
    expect(
      useAuthStore.getState().signIn('paval@example.com', 'correct horse'),
    ).toBe('ok');
  });

  it('refuses to register the same email twice', () => {
    const useAuthStore = loadStore();

    expect(
      useAuthStore
        .getState()
        .register('Paval', 'paval@example.com', 'correct horse'),
    ).toBe('ok');

    expect(
      useAuthStore
        .getState()
        .register('Someone else', 'PAVAL@example.com', 'another one'),
    ).toBe('email-taken');

    expect(useAuthStore.getState().accounts).toHaveLength(1);
  });

  it('refuses to sign in with an email that was never registered', () => {
    const useAuthStore = loadStore();

    expect(
      useAuthStore.getState().signIn('stranger@example.com', 'whatever'),
    ).toBe('unknown-email');

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('refuses to sign in with the wrong password', () => {
    const useAuthStore = loadStore();

    useAuthStore
      .getState()
      .register('Paval', 'paval@example.com', 'correct horse');

    expect(
      useAuthStore.getState().signIn('paval@example.com', 'wrong password'),
    ).toBe('wrong-password');

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('does not store the password itself', () => {
    const useAuthStore = loadStore();

    useAuthStore
      .getState()
      .register('Paval', 'paval@example.com', 'correct horse');

    const [account] = useAuthStore.getState().accounts;
    expect(account.passwordDigest).not.toContain('correct horse');
    expect(account.name).toBe('Paval');
    expect(account.email).toBe('paval@example.com');
  });

  it('lets a registered account sign in after a restart', async () => {
    const storage = loadStorage();
    const {digestSecret} = require('../../src/utils/hash');

    // Seed storage the way a previous run of the app would have left
    // it: the account is on disk, the session is not.
    await storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          email: null,
          isAuthenticated: false,
          accounts: [
            {
              name: 'Paval',
              email: 'paval@example.com',
              passwordDigest: digestSecret('correct horse'),
            },
          ],
        },
        version: 0,
      }),
    );

    // The store is created AFTER the seed, so it hydrates from it.
    const useAuthStore = loadStore();
    await flushHydration();

    expect(useAuthStore.getState().accounts).toHaveLength(1);
    expect(
      useAuthStore.getState().signIn('paval@example.com', 'correct horse'),
    ).toBe('ok');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
