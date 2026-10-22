import {useCallback} from 'react';

import {useTripStore} from '../state';
import type {Place, TravelMode} from '../types';

/**
 * The trip-planning state, as the screens want it.
 *
 * A thin wrapper over `useTripStore` so the screens read
 * `trip.pickup` instead of calling four different selectors, and so
 * the set of mutations a screen can perform is explicit.
 *
 * The store itself is the single source of truth — it is persisted,
 * so a cold start lands the user back on the screen they left with
 * their trip intact.
 */
export function useTripPlan() {
  const pickup = useTripStore(state => state.pickup);
  const dropoff = useTripStore(state => state.dropoff);
  const mode = useTripStore(state => state.mode);

  const setPickup = useTripStore(state => state.setPickup);
  const clearPickup = useTripStore(state => state.clearPickup);
  const setDropoff = useTripStore(state => state.setDropoff);
  const clearDropoff = useTripStore(state => state.clearDropoff);
  const swapTripEnds = useTripStore(state => state.swapEnds);
  const setMode = useTripStore(state => state.setMode);
  const reset = useTripStore(state => state.reset);

  /** True once both ends of the trip are chosen. */
  const isComplete = Boolean(pickup && dropoff);

  const selectPickup = useCallback((place: Place) => setPickup(place), [setPickup]);
  const selectDropoff = useCallback(
    (place: Place) => setDropoff(place),
    [setDropoff],
  );
  const selectMode = useCallback(
    (next: TravelMode) => setMode(next),
    [setMode],
  );

  return {
    pickup,
    dropoff,
    mode,
    isComplete,
    selectPickup,
    selectDropoff,
    clearPickup,
    clearDropoff,
    swapTripEnds,
    selectMode,
    reset,
  };
}
