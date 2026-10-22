import type {Place} from '../types';

/** A geographic point, in the shape `react-native-maps` expects. */
export interface LatLng {
  latitude: number;
  longitude: number;
}

/**
 * Builds the drawn route between two places.
 *
 * There is no routing engine in this build, so the polyline is
 * synthesised from the two endpoints. The shape deliberately mimics
 * the Figma route — out along the bottom, up through the middle, then
 * away on the diagonal — so the map reads like the design instead of
 * like a straight line between two pins.
 *
 * Swapping this for a real routing API means replacing the body of
 * this function with a call that returns the provider's polyline;
 * nothing else in the app changes.
 */
export function buildRouteCoordinates(pickup: Place, dropoff: Place): LatLng[] {
  const start = {latitude: pickup.latitude ?? 25.2048, longitude: pickup.longitude ?? 55.2708};
  const end = {latitude: dropoff.latitude ?? 25.2836, longitude: dropoff.longitude ?? 51.5042};

  const midLongitude = (start.longitude + end.longitude) / 2;
  const midLatitude = (start.latitude + end.latitude) / 2;

  return [
    start,
    {latitude: start.latitude, longitude: midLongitude},
    {latitude: midLatitude, longitude: midLongitude},
    {latitude: midLatitude, longitude: end.longitude},
    end,
  ];
}

/**
 * The camera region that frames a route.
 *
 * The padding keeps the pins clear of the sheet that covers the
 * bottom third of the map.
 */
export function buildRouteRegion(
  pickup: Place,
  dropoff: Place,
): {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} {
  const coordinates = buildRouteCoordinates(pickup, dropoff);
  const latitudes = coordinates.map(c => c.latitude);
  const longitudes = coordinates.map(c => c.longitude);

  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    // 30 % padding around the bounding box so the route never touches
    // the edge of the visible map.
    latitudeDelta: Math.max((maxLatitude - minLatitude) * 1.3, 0.02),
    longitudeDelta: Math.max((maxLongitude - minLongitude) * 1.3, 0.02),
  };
}

// ─── Flat-map projection ──────────────────────────────────────

/** The latitude/longitude box a flat map is drawn against. */
export interface MapBounds {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
}

/**
 * The bounding box of a route.
 *
 * The live map gets its camera from `buildRouteRegion`; the flat-map
 * fallback needs the same box in a form it can project against, so
 * both renderings of a trip frame the same stretch of road.
 */
export function buildRouteBounds(
  pickup: Place,
  dropoff: Place,
): MapBounds {
  const coordinates = buildRouteCoordinates(pickup, dropoff);
  const latitudes = coordinates.map(c => c.latitude);
  const longitudes = coordinates.map(c => c.longitude);

  return {
    minLatitude: Math.min(...latitudes),
    maxLatitude: Math.max(...latitudes),
    minLongitude: Math.min(...longitudes),
    maxLongitude: Math.max(...longitudes),
  };
}

/**
 * Projects a coordinate onto a flat map of a given size.
 *
 * WHY THIS EXISTS
 *
 * The flat-map fallback is a picture of a map, not a map, so it
 * cannot pan, zoom or geolocate anything. But the route drawn on it
 * still has to sit at the right place in the picture — a route whose
 * pins are at random positions would be worse than no route at all.
 *
 * So the same coordinates the live map would draw are projected into
 * the fallback's own coordinate space: longitude left to right,
 * latitude bottom to top (north is up, as on every map).
 */
export function projectCoordinate(
  coordinate: LatLng,
  bounds: MapBounds,
  width: number,
  height: number,
): {x: number; y: number} {
  const longitudeSpan = bounds.maxLongitude - bounds.minLongitude;
  const latitudeSpan = bounds.maxLatitude - bounds.minLatitude;

  // A zero span would divide by zero; the route always has two
  // distinct points, but the fallback must not blow up if it does not.
  const safeLongitudeSpan = longitudeSpan === 0 ? 1 : longitudeSpan;
  const safeLatitudeSpan = latitudeSpan === 0 ? 1 : latitudeSpan;

  const x =
    ((coordinate.longitude - bounds.minLongitude) / safeLongitudeSpan) *
    width;
  const y =
    ((bounds.maxLatitude - coordinate.latitude) / safeLatitudeSpan) *
    height;

  return {x, y};
}

