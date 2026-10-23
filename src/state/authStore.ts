import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

import {digestSecret, secretsMatch} from '../utils/hash';

/**
 * Who is signed in, and which accounts exist on this device.
 *
 * THE ACCOUNTS ARE THE SOURCE OF TRUTH FOR THE LOGIN
 *
 * There is no backend, so the accounts created through the register
 * screen are the only accounts there are, and they live on the
 * device. The login screen therefore accepts an account and nothing
 * else: an email that was never registered is refused, with a message
 * that points at the register screen.
 *
 * Registration does NOT sign the user in. It records the account and
 * sends the user back to the login screen, which is the flow a real
 * product has — you create an account, then you log in with it.
 *
 * THE PASSWORD
 *
 * Only a digest of the password is stored, never the password itself
 * — see `src/utils/hash.ts` for what that digest is and, more to the
 * point, what it is not worth.
 *
 * The persisted shape is deliberately tiny. A real build would store a
 * token here, not a digest.
 */

/** An account created on this device. */
export interface RegisteredAccount {
  /** The name the account was created with. */
  name: string;
  /** The account's email, lower-cased. */
  email: string;
  /** A digest of the account's password. */
  passwordDigest: string;
}

/** How a sign-in attempt ended. */
export type SignInResult = 'ok' | 'unknown-email' | 'wrong-password';

/** How a registration attempt ended. */
export type RegisterResult = 'ok' | 'email-taken';

export interface AuthState {
  /** The signed-in email, or `null` when signed out. */
  email: string | null;
  /** Whether a session exists. */
  isAuthenticated: boolean;
  /**
   * The accounts created on this device.
   *
   * They are persisted, so an account survives a restart and the user
   * can log in with it later.
   */
  accounts: RegisteredAccount[];
  /**
   * True once the persisted session has been read back from storage.
   *
   * WHY THIS FLAG EXISTS
   *
   * AsyncStorage is asynchronous. For the first few frames after a
   * cold start the store still holds its initial — signed-out — state,
   * even though a session IS saved on disk. The router guard reads
   * `isAuthenticated`, so a guard that fires before hydration finishes
   * would bounce a signed-in user to the login screen on every launch,
   * which would make persisting the session pointless.
   *
   * The app therefore holds its first frame until this flag flips. It
   * is deliberately NOT persisted — it describes the hydration, not
   * the session.
   */
  hasHydrated: boolean;
}

export interface AuthActions {
  /**
   * Create an account.
   *
   * Does NOT sign the user in — the caller sends them to the login
   * screen. Refuses an email that is already registered.
   */
  register: (name: string, email: string, password: string) => RegisterResult;
  /**
   * Start a session for an account on this device.
   *
   * Refuses an email that was never registered and a password that
   * does not match the one the account was created with.
   */
  signIn: (email: string, password: string) => SignInResult;
  /** End the session. The accounts stay — they are not the session. */
  signOut: () => void;
  /** Flag the persisted session as read. Used by the hydration hook. */
  setHasHydrated: (hasHydrated: boolean) => void;
}

const initialState: AuthState = {
  email: null,
  isAuthenticated: false,
  accounts: [],
  hasHydrated: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      register: (name, email, password) => {
        const normalised = email.trim().toLowerCase();

        if (
          get().accounts.some(account => account.email === normalised)
        ) {
          return 'email-taken';
        }

        set(state => ({
          accounts: [
            ...state.accounts,
            {
              name: name.trim(),
              email: normalised,
              passwordDigest: digestSecret(password),
            },
          ],
        }));

        return 'ok';
      },

      signIn: (email, password) => {
        const normalised = email.trim().toLowerCase();
        const account = get().accounts.find(
          candidate => candidate.email === normalised,
        );

        if (!account) {
          return 'unknown-email';
        }

        if (!secretsMatch(password, account.passwordDigest)) {
          return 'wrong-password';
        }

        set({email: normalised, isAuthenticated: true});
        return 'ok';
      },

      /**
       * End the session.
       *
       * `hasHydrated` is deliberately left alone: it describes the
       * storage read, not the session, and resetting it would make the
       * app wait for a hydration that is never going to happen.
       */
      signOut: () => set({email: null, isAuthenticated: false}),

      setHasHydrated: (hasHydrated) => set({hasHydrated}),
    }),
    {
      name: 'wayfare.auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        email: state.email,
        isAuthenticated: state.isAuthenticated,
        accounts: state.accounts,
      }),
      /**
       * Flip `hasHydrated` once the read completes — including when
       * it FAILS. A storage error must not strand the user on a blank
       * screen, so the flag is set on the store directly rather than
       * through the rehydrated state (which is undefined on error).
       */
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn(
            '[wayfare] Could not read the persisted session; continuing without it.',
            error,
          );
        }

        useAuthStore.setState({hasHydrated: true});
      },
    },
  ),
);
