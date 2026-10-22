// ─── Trip-flow rules ──────────────────────────────────────────
//
// The rules that decide which end of the trip the user is currently
// editing, and whether the trip is ready to be routed.
//
// These live outside the screens because they are the part of the
// flow most likely to be got wrong, and because a rule that is buried
// inside a component is a rule that cannot be unit-tested without
// rendering the whole screen.

import type {Place} from '../types';

/** Which end of the trip the user is choosing right now. */
export type LocationTarget = 'pickup' | 'dropoff';

/**
 * The target the flow starts on.
 *
 * The start of the trip is always chosen first — it is the end of the
 * sentence "where are you going from?" — so a fresh screen opens on
 * the pickup. Once a pickup exists, the next thing the user has to
 * do is choose the drop-off.
 *
 * The user can move between the two by tapping the row they want to
 * edit on the location card; this function only supplies the
 * default.
 */
export function defaultLocationTarget(pickup: Place | null): LocationTarget {
  return pickup ? 'dropoff' : 'pickup';
}

/**
 * True when both ends of the trip are chosen.
 *
 * The route screen needs a complete trip to draw a route, and the
 * "Next" button on the location screen is disabled until this holds.
 */
export function isTripComplete(
  pickup: Place | null,
  dropoff: Place | null,
): boolean {
  return Boolean(pickup && dropoff);
}

/**
 * The two ends of the trip, swapped.
 *
 * Used by the swap control on the location card. Swapping with only
 * one end chosen is not a swap — it would silently move a half-built
 * trip — so that case is refused and the caller keeps the current
 * state.
 */
export function swapEnds(
  pickup: Place | null,
  dropoff: Place | null,
): {pickup: Place | null; dropoff: Place | null} {
  if (!pickup || !dropoff) {
    return {pickup, dropoff};
  }

  return {pickup: dropoff, dropoff: pickup};
}
