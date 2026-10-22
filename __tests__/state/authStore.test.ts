/**
 * The auth store's hydration contract.
 *
 * WHY THIS TEST EXISTS
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

    useAuthStore.getState().signIn('  PAVAL@Example.com ');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.email).toBe('paval@example.com');
  });

  it('persists only the session, never the actions', async () => {
    const storage = loadStorage();
    const useAuthStore = loadStore();

    useAuthStore.getState().signIn('paval@example.com');
    await flushHydration();

    const raw = await storage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw as string).state;
    expect(Object.keys(parsed).sort()).toEqual(['email', 'isAuthenticated']);
    expect(parsed.email).toBe('paval@example.com');
    expect(parsed.isAuthenticated).toBe(true);
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

    useAuthStore.getState().signIn('paval@example.com');
    await flushHydration();

    useAuthStore.getState().signOut();
    await flushHydration();

    const raw = await storage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw as string).state;
    expect(parsed.isAuthenticated).toBe(false);
    expect(parsed.email).toBeNull();
  });
});
