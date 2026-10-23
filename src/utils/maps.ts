// ─── Google Maps helpers ───────────────────────────────────────
//
// Two responsibilities live here, and neither of them belongs in a
// component:
//
//   1. Whether this build has an API key at all.
//   2. The URLs the "Start navigation" button hands to Google Maps.
//
// Both are pure functions so they can be unit-tested without an
// emulator. The URL builders in particular are the kind of thing that
// silently breaks — a missing `encodeURIComponent` on a place name
// with a space is a 404 in the Maps app, and nothing in the app would
// say so.

// ─── Key availability ──────────────────────────────────────────

/**
 * Whether the app was built with a Google Maps API key.
 *
 * WHY THIS CHECK EXISTS
 *
 * `react-native-maps` on the Google provider loads the Google Maps
 * SDK for Android at runtime. That SDK does not tolerate a missing
 * key: it throws
 *
 *     java.lang.IllegalStateException: API key not found.
 *
 * on a background thread, which the Android runtime turns into a
 * FATAL EXCEPTION and kills the process. It is not a JavaScript
 * error, so no `try/catch` around the JSX can catch it and no error
 * boundary can survive it.
 *
 * That means an APK built without a key would crash the moment the
 * user reached the route screen — which is exactly what a reviewer
 * installing the hand-over APK would hit.
 *
 * So the app asks first. With a key it renders the live map; without
 * one it renders the design's own flat map (see `StaticRouteMap`).
 * The app is fully usable either way.
 */
export function isGoogleMapsConfigured(
  expoConfig?: {
    extra?: {googleMapsApiKeyConfigured?: boolean} | null;
  } | null,
): boolean {
  return Boolean(expoConfig?.extra?.googleMapsApiKeyConfigured);
}

// ─── Travel modes ─────────────────────────────────────────────

/**
 * The travel-mode string Google's URL API expects.
 *
 * Google's `travelmode` parameter knows `driving`, `walking`,
 * `bicycling` and `transit`. The app's three tabs are Drive, Ride and
 * Walk:
 *
 *   • Drive → `driving` — the traveller's own car.
 *   • Ride  → `driving` — a ride-hailing car is still a car on the
 *     same roads, and Google's URL API has no "hail a car" mode.
 *   • Walk  → `walking`.
 *
 * Ride and Drive therefore open the same kind of route. That is a
 * limitation of the target app, not of the mapping, and it is stated
 * here rather than hidden.
 */
export function toGoogleTravelMode(mode: 'drive' | 'ride' | 'walk'): string {
  return mode === 'walk' ? 'walking' : 'driving';
}

// ─── Place formatting ─────────────────────────────────────────

/**
 * How a place is addressed to Google Maps.
 *
 * A place with a coordinate is passed as `lat,lng`, which is exact.
 * A place without one (a custom address typed by the user) is passed
 * by name, which Google resolves with its own geocoder.
 */
export function formatPlaceForMaps(
  place: {name: string; latitude?: number; longitude?: number},
): string {
  if (place.latitude != null && place.longitude != null) {
    return `${place.latitude},${place.longitude}`;
  }
  return place.name;
}

// ─── URL builders ─────────────────────────────────────────────

/**
 * The Google Maps route URL — the documented, universal handoff.
 *
 * It opens the trip in Google Maps on a phone, and in a browser
 * everywhere else, with BOTH ends of the trip in it.
 *
 * WHY NOT THE `google.navigation:` INTENT
 *
 * The `google.navigation:` intent is the deeper handoff: it would
 * take over the screen with Google Maps' own turn-by-turn UI. It
 * takes the destination as `q` and the origin as `saddr`.
 *
 * On the Google Maps build this was tested against, `saddr` is
 * silently ignored — the origin comes back as "Your location", the
 * device's position, and the route it plans starts from there. That
 * was reproduced with an origin coordinate and with an origin
 * address, and with both the opaque (`google.navigation:q=…`) and
 * the hierarchical (`google.navigation://q=…`) form of the URL. The
 * intent opens without an error, so the app cannot tell that the
 * origin was dropped — it would send the user to the wrong place
 * without saying anything.
 *
 * A route from the wrong end of the trip is worse than a route that
 * needs one extra tap to start, so the universal Directions URL is
 * used instead. It carries the origin in `origin=`, honours
 * `travelmode=`, and opens the Maps app with the full route when the
 * Maps app is installed.
 */
export function buildGoogleMapsRouteUrl(
  origin: {name: string; latitude?: number; longitude?: number},
  destination: {name: string; latitude?: number; longitude?: number},
  mode: 'drive' | 'ride' | 'walk',
): string {
  const params = [
    'api=1',
    `origin=${encodeURIComponent(formatPlaceForMaps(origin))}`,
    `destination=${encodeURIComponent(formatPlaceForMaps(destination))}`,
    `travelmode=${toGoogleTravelMode(mode)}`,
  ];

  return `https://www.google.com/maps/dir/?${params.join('&')}`;
}
