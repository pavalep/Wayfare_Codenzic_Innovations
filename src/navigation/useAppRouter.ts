import {useRouter} from 'expo-router';
import {useMemo} from 'react';

import {ROUTES} from './routes';

/**
 * The app's navigation API.
 *
 * One hook, five named moves. A screen never touches Expo Router's
 * `useRouter()` directly, so:
 *
 *   • the route strings live in exactly one file (`routes.ts`)
 *   • the intent of each navigation is readable at the call site
 *     (`goToTripReady()` says more than `router.push('/trip-ready')`)
 *   • swapping the router later would touch this file only
 *
 * `replace` vs `push` is deliberate. Leaving the login screen with
 * `replace` means the back gesture from the location picker cannot
 * return to a login form for a session that already exists. The
 * steps AFTER the login use `push` so the back chevron walks the
 * user back through the trip they were building.
 */
export function useAppRouter() {
  const router = useRouter();

  return useMemo(
    () => ({
      /** Sign in / sign out — always replaces the current screen. */
      goToLogin: () => router.replace(ROUTES.login),
      /**
       * Create an account — PUSHES, not replaces.
       *
       * The register screen is reached from the login screen, so the
       * back chevron has to be able to return there. Replacing it
       * would strand a user who mistyped their email and wanted to
       * go back and fix it.
       */
      goToRegister: () => router.push(ROUTES.register),
      /** Start of the trip-planning flow — replaces the login screen. */
      goToSetLocations: () => router.replace(ROUTES.setLocations),
      /** Confirm the trip — pushes on top of the location picker. */
      goToTripReady: () => router.push(ROUTES.tripReady),
      /** The map — the last step of the flow. */
      goToRouteView: () => router.push(ROUTES.routeView),
      /** Back one step. */
      goBack: () => router.back(),
    }),
    [router],
  );
}
