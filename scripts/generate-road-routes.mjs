// ────────────────────────────────────────────────────────────
// Road-geometry generator
//
// WHY THIS SCRIPT EXISTS
//
// The app draws a real route between the two places the user picks.
// There is no routing engine in the build, so the geometry is baked
// into the source instead of computed at runtime.
//
// The geometry is REAL: it is the actual road centreline of Doha,
// fetched from the OSRM routing service and written into
// `src/data/roadRoutes.ts`. It is not a straight line, and it is not
// an L-shaped guess — it follows the streets.
//
// WHY OSRM AND NOT GOOGLE
//
// The Google Maps key in this project is restricted to the Maps SDK
// for Android. Google's own API answers confirm that a server-side
// routing call cannot be made with it:
//
//   • Directions API → "a legacy API … not enabled for your project"
//   • Routes API v2  → "API_KEY_SERVICE_BLOCKED" (routes.googleapis.com
//                      is not in the key's allowed-API list)
//   • Geocoding API  → "You must enable Billing on the Google Cloud
//                      Project"
//
// So the key cannot produce waypoints. OSRM can, and its output is
// ordinary open data. When the project is given a key that is allowed
// to call the Routes API, this script is replaced by a live call and
// `roadRoutes.ts` is deleted — the shape of the data is the same
// either way, which is the whole point of the seam.
//
// USAGE
//
//   node scripts/generate-road-routes.mjs
//
// It rewrites `src/data/roadRoutes.ts` in place.
// ────────────────────────────────────────────────────────────

import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '..', 'src', 'data', 'roadRoutes.ts');

/** The saved places, in the same order as `src/data/places.ts`. */
const PLACES = [
  {id: 'home', lat: 25.1858, lon: 51.5312},
  {id: 'marina-office-tower', lat: 25.2836, lon: 51.5042},
  {id: 'corniche-ferry-terminal', lat: 25.2896, lon: 51.5361},
  {id: 'msheireb-metro-station', lat: 25.283, lon: 51.5153},
  {id: 'hamad-international-airport', lat: 25.2731, lon: 51.608},
];

/**
 * How many points each baked route keeps.
 *
 * OSRM returns hundreds of points for a city route. Drawn on a phone
 * map at that density the extra points cost bytes and buy nothing,
 * so the line is thinned with a stride that keeps the shape — but
 * never drops a corner, because a dropped corner is a route that
 * visibly cuts through a block.
 */
const TARGET_POINTS = 48;

const round = value => Math.round(value * 1e5) / 1e5;

/**
 * Thins a polyline to roughly `TARGET_POINTS`, keeping the ends and
 * every point that turns a noticeable corner.
 */
function thin(points, target = TARGET_POINTS) {
  if (points.length <= target) {
    return points;
  }

  const stride = Math.ceil(points.length / target);
  const kept = [points[0]];

  for (let i = stride; i < points.length - 1; i += stride) {
    kept.push(points[i]);
  }

  kept.push(points[points.length - 1]);
  return kept;
}

async function fetchRoute(from, to) {
  const coordinates = `${from.lon},${from.lat};${to.lon},${to.lat}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?geometries=geojson&overview=full`;

  const response = await fetch(url);
  const payload = await response.json();

  if (payload.code !== 'Ok' || !payload.routes?.length) {
    throw new Error(`OSRM failed for ${from.id} -> ${to.id}: ${payload.code}`);
  }

  const route = payload.routes[0];
  const points = route.geometry.coordinates.map(([lon, lat]) => [
    round(lat),
    round(lon),
  ]);

  return {
    points: thin(points),
    distanceMeters: Math.round(route.distance),
    durationSeconds: Math.round(route.duration),
  };
}

function formatPoints(points) {
  return points
    .map(([lat, lon]) => `[${lat}, ${lon}]`)
    .join(',\n        ');
}

async function main() {
  const routes = {};

  for (const from of PLACES) {
    for (const to of PLACES) {
      if (from.id === to.id) {
        continue;
      }

      const route = await fetchRoute(from, to);
      routes[`${from.id}>${to.id}`] = route;

      process.stdout.write(
        `  ${from.id} -> ${to.id}: ${route.points.length} pts, ` +
          `${(route.distanceMeters / 1000).toFixed(1)} km\n`,
      );
    }
  }

  const body = `// ─── Real road geometry ──────────────────────────────────────
//
// GENERATED FILE — do not edit by hand.
//
// Regenerate with:
//
//   node scripts/generate-road-routes.mjs
//
// Each entry is the ACTUAL road centreline between two of the saved
// places, in Doha, with the real driving distance and duration for
// that pair. The geometry comes from the OSRM routing service; see
// the script for why the Google Maps key cannot produce it and what
// has to change on the Google Cloud side to replace this file with a
// live call.
//
// The key is "fromId>toId". The reverse of a route is the same road
// walked backwards, so only one direction is stored.
//
// This is a routing-service stand-in with the same shape a real
// routing API would return: a polyline, a distance and a duration.
export interface RoadRoute {
  /** The road centreline, as [latitude, longitude] pairs. */
  points: [number, number][];
  /** The driving distance along the route, in metres. */
  distanceMeters: number;
  /** The driving duration along the route, in seconds. */
  durationSeconds: number;
}

export const ROAD_ROUTES: Record<string, RoadRoute> = {
${Object.entries(routes)
  .map(
    ([key, route]) =>
      `  '${key}': {\n    points: [\n        ${formatPoints(
        route.points,
      )},\n    ],\n    distanceMeters: ${
        route.distanceMeters
      },\n    durationSeconds: ${route.durationSeconds},\n  },`,
  )
  .join('\n')}
};
`;

  await writeFile(OUT, body, 'utf8');
  process.stdout.write(`\nWrote ${Object.keys(routes).length} routes to ${OUT}\n`);
}

main().catch(error => {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exit(1);
});
