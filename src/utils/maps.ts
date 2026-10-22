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
 * The `google.navigation:` intent — opens Google Maps straight into
 * turn-by-turn navigation for the destination.
 *
 * This is the deepest handoff the platform offers: the Maps app
 * takes over the screen with its own navigation UI, which is what
 * "Start navigation" should mean on a phone.
 *
 * The intent takes ONE place — the destination. The origin is not
 * part of the scheme, so the URL is built for the destination only.
 */
export function buildGoogleMapsNavigationUrl(
  destination: {name: string; latitude?: number; longitude?: number},
  mode: 'drive' | 'ride' | 'walk',
): string {
  const target = formatPlaceForMaps(destination);
  return `google.navigation:q=${encodeURIComponent(
    target,
  )}&mode=${toGoogleTravelMode(mode)}`;
}

/**
 * The Google Maps Directions URL — the documented, universal
 * fallback.
 *
 * This one carries BOTH ends of the trip, so it is the better
 * fallback: if the Maps app is not installed, the browser opens
 * google.com and shows the same route on the web.
 */
export function buildGoogleMapsDirectionsUrl(
  pickup: {name: string; latitude?: number; longitude?: number},
  destination: {name: string; latitude?: number; longitude?: number},
  mode: 'drive' | 'ride' | 'walk',
): string {
  const params = [
    'api=1',
    `origin=${encodeURIComponent(formatPlaceForMaps(pickup))}`,
    `destination=${encodeURIComponent(formatPlaceForMaps(destination))}`,
    `travelmode=${toGoogleTravelMode(mode)}`,
  ];

  return `https://www.google.com/maps/dir/?${params.join('&')}`;
}
