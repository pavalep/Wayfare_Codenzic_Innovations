import type {Place} from '../types';
import {ROAD_ROUTES, type RoadRoute} from './roadRoutes';

/** A geographic point, in the shape `react-native-maps` expects. */
export interface LatLng {
  latitude: number;
  longitude: number;
}

/**
 * The baked road route between two places, if there is one.
 *
 * The saved places are all in Doha and every ordered pair has its
 * real road centreline baked into `roadRoutes.ts` (see
 * `scripts/generate-road-routes.mjs` for where that data comes from).
 * A pair that is not in the table (a custom address, or a point the
 * user dropped on the map) has no baked route, and the drawn route
 * falls back to a straight line between the two endpoints.
 */
export function getRoadRoute(
  pickup: Place,
  dropoff: Place,
): RoadRoute | undefined {
  return ROAD_ROUTES[`${pickup.id}>${dropoff.id}`];
}

/**
 * Builds the drawn route between two places.
 *
 * The polyline is the REAL road centreline for the pair, taken from
 * the baked routing data. It follows the streets instead of cutting
 * across the block, and it never crosses the bay.
 *
 * Swapping this for a live routing API means replacing the body of
 * `getRoadRoute` with a call that returns the provider's polyline;
 * nothing else in the app changes.
 */
export function buildRouteCoordinates(pickup: Place, dropoff: Place): LatLng[] {
  const start = {
    latitude: pickup.latitude ?? 25.1858,
    longitude: pickup.longitude ?? 51.5312,
  };
  const end = {
    latitude: dropoff.latitude ?? 25.2836,
    longitude: dropoff.longitude ?? 51.5042,
  };

  const roadRoute = getRoadRoute(pickup, dropoff);

  if (roadRoute) {
    const points = roadRoute.points.map(([latitude, longitude]) => ({
      latitude,
      longitude,
    }));

    /*
     * The baked route begins and ends at the nearest point ON THE
     * ROAD, which is a few metres from the place itself — a road is
     * never in the middle of a building. The drawn line has to meet
     * the markers, so its two ends are pinned to the places and only
     * the middle keeps the road's own shape.
     */
    return [start, ...points.slice(1, -1), end];
  }

  return [start, end];
}

/**
 * How the camera frames a route.
 */
export interface RouteRegionOptions {
  /** The map's own width, in pixels. */
  mapWidth: number;
  /** The map's own height, in pixels. */
  mapHeight: number;
  /**
   * Where the route's middle sits, as a fraction of the map's height.
   *
   * The map fills the whole screen and the sheet floats over the
   * bottom of it, so the route has to sit in the band of screen
   * between the top of the screen and the top of the sheet. This is
   * the middle of that band.
   */
  anchorRatio: number;
  /**
   * How tall that band is, as a fraction of the map's height — but
   * measured against the sheet's RESTING height, not the current one.
   *
   * The route is sized once, against the resting band, and then only
   * moved up and down as the sheet is dragged. Resizing the route
   * every time the sheet moves would zoom the camera on every drag.
   */
  bandRatio: number;
  /**
   * Where the route's middle sits across the map, as a fraction of the
   * map's width.
   *
   * The traffic chip floats over the bottom left of the map, so the
   * route is pushed to the right of it — which is where the Figma
   * draws the route too, diagonally across the right of the map.
   */
  horizontalAnchorRatio?: number;
}

/**
 * The camera region that frames a route.
 *
 * The route is not centred in the map: the sheet covers the bottom of
 * the screen, so a centred route would be half hidden behind it. The
 * region is therefore built around the band of screen that the sheet
 * leaves visible.
 *
 * The route's height is sized against that band, and its middle is
 * then moved to the middle of the band with `anchorRatio`.
 */
export function buildRouteRegion(
  pickup: Place,
  dropoff: Place,
  options: RouteRegionOptions,
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

  const latitudeSpan = Math.max(maxLatitude - minLatitude, 0.002);
  const longitudeSpan = Math.max(maxLongitude - minLongitude, 0.002);

  /**
   * How much of the band the route's height fills.
   */
  const fill = ROUTE_BAND_FILL;

  /**
   * The latitude range the camera has to show for the route to fill
   * that much of the band.
   */
  const latitudeDelta = latitudeSpan / (fill * options.bandRatio);

  /**
   * The camera shows the map's own shape, so the longitude range
   * follows from the latitude range and the map's aspect — unless
   * that would cut the route's width off.
   */
  const longitudeDelta = Math.max(
    latitudeDelta * (options.mapWidth / options.mapHeight),
    longitudeSpan / fill,
  );

  /**
   * How much of the map's width the route itself takes up.
   */
  const routeWidthFraction = longitudeSpan / longitudeDelta;

  /**
   * Where the route's middle sits across the map.
   *
   * It is pushed to the right of the traffic chip, but never so far
   * that the route would run off the edge of the map.
   */
  const horizontalAnchor = Math.min(
    options.horizontalAnchorRatio ?? DEFAULT_HORIZONTAL_ANCHOR,
    1 - ROUTE_EDGE_MARGIN - routeWidthFraction / 2,
  );

  return {
    /**
     * The route's middle is moved to the middle of the band by
     * pushing the camera's centre the same distance the other way.
     */
    latitude:
      (minLatitude + maxLatitude) / 2 -
      (0.5 - options.anchorRatio) * latitudeDelta,
    longitude:
      (minLongitude + maxLongitude) / 2 -
      (horizontalAnchor - 0.5) * longitudeDelta,
    latitudeDelta,
    longitudeDelta,
  };
}

/**
 * Where the route sits across the map, as a fraction of its width.
 *
 * Clear of the traffic chip, which floats over the bottom left.
 */
const DEFAULT_HORIZONTAL_ANCHOR = 0.62;

/**
 * The margin left between the route and the edge of the map.
 */
const ROUTE_EDGE_MARGIN = 0.04;

/**
 * How much of the band above the sheet the route's height fills.
 *
 * The rest of the band is the margin that keeps the two markers off
 * the edge of the visible map.
 */
const ROUTE_BAND_FILL = 0.8;

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
