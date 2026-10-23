import type {LatLng} from './routeGeometry';

/**
 * The area the app can plan a trip in.
 *
 * WHY THIS EXISTS
 *
 * Every place the app knows about is in Doha, and the app draws its
 * routes from baked road geometry for those places — there is no
 * routing service behind it yet. A point dropped on the map outside
 * this area would have no geometry to draw, no saved place to name,
 * and no way for the app to say anything useful about it.
 *
 * So the map picker only accepts points inside the area, and a tap
 * outside it is refused with an alert rather than silently accepted.
 * The rule is the same one the app's own data follows; it is spelled
 * out here so the picker and the data cannot drift apart.
 *
 * THE BOUNDARY
 *
 * It is a plain latitude/longitude box, not a radius and not a
 * polygon, for one reason: it has to be explainable in a sentence and
 * checkable in a unit test. The box is drawn around the five saved
 * places with a margin on every side — the airport at the eastern
 * edge is the one that sets the longitude limit.
 */
export const SERVICE_AREA = {
  minLatitude: 25.15,
  maxLatitude: 25.33,
  minLongitude: 51.47,
  maxLongitude: 51.63,
} as const;

/**
 * The camera the map picker opens with.
 *
 * It is centred on the service area rather than on the device's
 * position, because the map is showing the area the user is choosing
 * from. The deltas are a little wider than the area itself so the
 * boundary is not sitting exactly on the edge of the screen, where a
 * pan would feel like it hit a wall.
 */
export const SERVICE_AREA_REGION = {
  latitude: (SERVICE_AREA.minLatitude + SERVICE_AREA.maxLatitude) / 2,
  longitude: (SERVICE_AREA.minLongitude + SERVICE_AREA.maxLongitude) / 2,
  latitudeDelta: 0.26,
  longitudeDelta: 0.17,
} as const;

/**
 * Whether a point is inside the area the app can plan a trip in.
 *
 * The edges are inclusive: a point exactly on the boundary is inside.
 */
export function isInsideServiceArea(point: LatLng): boolean {
  return (
    point.latitude >= SERVICE_AREA.minLatitude &&
    point.latitude <= SERVICE_AREA.maxLatitude &&
    point.longitude >= SERVICE_AREA.minLongitude &&
    point.longitude <= SERVICE_AREA.maxLongitude
  );
}
