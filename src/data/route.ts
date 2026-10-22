// ─── Mock route data ───────────────────────────────────────────
//
// Stands in for a routing API. The "Drive" figures and the four
// turn-by-turn legs are transcribed verbatim from the Figma "Route
// view" screen; the "Ride" and "Walk" variants are plausible
// alternatives so the mode tabs actually change the summary.
//
// A real routing backend would return exactly this shape — see
// `src/types/index.ts` for the contract.

import type {RouteLeg, RouteSummary, TravelMode} from '../types';

/** The travel modes offered by the route-view tabs, in tab order. */
export const TRAVEL_MODES: TravelMode[] = ['drive', 'ride', 'walk'];

/** The turn-by-turn legs, shared by every travel mode. */
const LEGS: RouteLeg[] = [
  {
    id: 'leg-1',
    instruction: 'Head north on Street 840',
    detail: 'Keep right past the service road',
    distance: '450 m',
    turn: 'straight',
  },
  {
    id: 'leg-2',
    instruction: 'Turn right onto Al Istiqlal St',
    detail: 'Moderate traffic near the roundabout',
    distance: '1.8 km',
    turn: 'right',
  },
  {
    id: 'leg-3',
    instruction: 'Continue onto Lusail Expressway',
    detail: 'Stay in the two left lanes',
    distance: '6.4 km',
    turn: 'straight',
  },
  {
    id: 'leg-4',
    instruction: 'Exit toward Marina Promenade',
    detail: 'Destination will be on your right',
    distance: '900 m',
    turn: 'right',
  },
];

/**
 * The headline summary per travel mode.
 *
 * `duration` / `distance` / `arrival` are pre-formatted strings
 * because the design specifies exact copy ("24 min", "9.6 km",
 * "arrive 10:42"); a live routing API would format the same way.
 */
export const ROUTE_SUMMARIES: Record<TravelMode, RouteSummary> = {
  drive: {
    durationMinutes: 24,
    duration: '24 min',
    distance: '9.6 km',
    arrival: 'arrive 10:42',
    legs: LEGS,
  },
  ride: {
    durationMinutes: 18,
    duration: '18 min',
    distance: '7.2 km',
    arrival: 'arrive 10:36',
    legs: LEGS,
  },
  walk: {
    durationMinutes: 62,
    duration: '1 hr 2 min',
    distance: '4.8 km',
    arrival: 'arrive 11:20',
    legs: LEGS,
  },
};

/**
 * Returns the summary for a travel mode.
 *
 * Falls back to the drive summary for an unknown mode so the screen
 * can never render an empty state because of bad data.
 */
export function getRouteSummary(mode: TravelMode): RouteSummary {
  return ROUTE_SUMMARIES[mode] ?? ROUTE_SUMMARIES.drive;
}
