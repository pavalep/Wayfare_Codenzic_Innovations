// ─── Route paths ─────────────────────────────────────────────
//
// The app's route table, in one place.
//
// Expo Router derives the navigation graph from the files in `app/`.
// This map exists so the rest of the code never spells a route as a
// bare string: a typo in `/trip-ready` is a runtime 404 in
// Expo Router, but a typo in `ROUTES.tripReady` is a compile error.
//
// The path strings here MUST match the file names in `app/`.

export const ROUTES = {
  /** The entry route — decides where to send the user. */
  index: '/',
  /** Email + password. */
  login: '/login',
  /** Create an account. */
  register: '/register',
  /** Choose the trip's origin and destination. */
  setLocations: '/set-locations',
  /** Confirm the trip and go to the route. */
  tripReady: '/trip-ready',
  /** The map and the route. */
  routeView: '/route-view',
} as const;

/** Every path the app can navigate to. */
export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
