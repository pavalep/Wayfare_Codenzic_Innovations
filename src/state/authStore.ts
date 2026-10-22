import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

/**
 * Who is signed in.
 *
 * There is no backend, so `signIn` does not verify a password against
 * anything — it records the session locally. The credential check
 * that DOES matter (email format, password length) lives in
 * `src/utils/validation.ts` and runs before this store is touched.
 *
 * The persisted shape is deliberately tiny. A real build would store
 * a token here, not a password.
 */
export interface AuthState {
  /** The signed-in email, or `null` when signed out. */
  email: string | null;
  /** Whether a session exists. */
  isAuthenticated: boolean;
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
  /** Start a session for the given email. */
  signIn: (email: string) => void;
  /** End the session. */
  signOut: () => void;
  /** Flag the persisted session as read. Used by the hydration hook. */
  setHasHydrated: (hasHydrated: boolean) => void;
}

const initialState: AuthState = {
  email: null,
  isAuthenticated: false,
  hasHydrated: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,

      signIn: (email) =>
        set({email: email.trim().toLowerCase(), isAuthenticated: true}),

      signOut: () => set({...initialState}),

      setHasHydrated: (hasHydrated) => set({hasHydrated}),
    }),
    {
      name: 'wayfare.auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        email: state.email,
        isAuthenticated: state.isAuthenticated,
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
