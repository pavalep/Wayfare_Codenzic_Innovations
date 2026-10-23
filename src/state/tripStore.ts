import {create} from 'zustand';

import type {Place, TravelMode} from '../types';

/**
 * The trip being planned.
 *
 * This is the one piece of state that spans more than a single
 * screen: the pickup chosen on "Set locations" has to survive the
 * navigation to "Trip ready" and on to "Route view".
 *
 * IT IS NOT PERSISTED
 *
 * The trip lives in memory only. A cold start finds it empty, and
 * the user picks the two ends again.
 *
 * That is a deliberate decision, and it is the opposite of what the
 * session does. The session IS persisted — a signed-in user should
 * not have to sign in on every launch — but a trip is a piece of work
 * in progress, and work in progress is not a thing you come back to
 * later. Restoring yesterday's pickup and drop-off onto a fresh
 * launch would be surprising: the screen would open on a trip the
 * user did not just make, and the map would draw a route to somewhere
 * they may no longer want to go.
 *
 * So the trip is cleared when the app closes, and the sign-in is not.
 */
export interface TripState {
  /** The chosen origin. `null` until the user picks one. */
  pickup: Place | null;
  /** The chosen destination. `null` until the user picks one. */
  dropoff: Place | null;
  /** The active travel mode. */
  mode: TravelMode;
}

export interface TripActions {
  /** Set the origin. */
  setPickup: (place: Place) => void;
  /** Clear the origin. */
  clearPickup: () => void;
  /** Set the destination. */
  setDropoff: (place: Place) => void;
  /** Clear the destination. */
  clearDropoff: () => void;
  /**
   * Swap the two ends of the trip.
   *
   * Refuses when either end is missing: swapping a half-built trip
   * would silently move the one end the user has chosen, which is
   * never what they meant.
   */
  swapEnds: () => void;
  /** Switch travel mode. */
  setMode: (mode: TravelMode) => void;
  /** Reset the whole trip. */
  reset: () => void;
}

const initialState: TripState = {
  pickup: null,
  dropoff: null,
  mode: 'drive',
};

export const useTripStore = create<TripState & TripActions>()(set => ({
  ...initialState,

  setPickup: place => set({pickup: place}),
  clearPickup: () => set({pickup: null}),
  setDropoff: place => set({dropoff: place}),
  clearDropoff: () => set({dropoff: null}),
  swapEnds: () =>
    set(state => {
      if (!state.pickup || !state.dropoff) {
        return state;
      }
      return {pickup: state.dropoff, dropoff: state.pickup};
    }),
  setMode: mode => set({mode}),
  reset: () => set({...initialState}),
}));

/**
 * True when both ends of the trip are chosen — the condition the
 * route view needs in order to render a route.
 */
export function hasCompleteTrip(state: TripState): boolean {
  return Boolean(state.pickup && state.dropoff);
}
