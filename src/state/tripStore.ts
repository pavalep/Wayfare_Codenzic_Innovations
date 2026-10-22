import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

import type {Place, TravelMode} from '../types';

/**
 * The trip being planned.
 *
 * This is the one piece of state that spans more than a single
 * screen: the pickup chosen on "Set locations" has to survive the
 * navigation to "Trip ready" and on to "Route view".
 *
 * It is persisted so a cold start lands the user back where they
 * were instead of throwing the trip away — the same reason SIMBA
 * persists its session and history stores.
 */
export interface TripState {
  /** The chosen origin. `null` until the user picks one. */
  pickup: Place | null;
  /** The chosen destination. `null` until the user picks one. */
  dropoff: Place | null;
  /** The active travel mode. */
  mode: TravelMode;
  /**
   * True once the persisted trip has been read back from storage.
   *
   * Same reason as the auth store's flag: the app holds its first
   * frame until the saved trip is back, so the location screens never
   * paint an empty trip that is about to be replaced by the real one.
   */
  hasHydrated: boolean;
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
  /** Flag the persisted trip as read. Used by the hydration hook. */
  setHasHydrated: (hasHydrated: boolean) => void;
}

const initialState: TripState = {
  pickup: null,
  dropoff: null,
  mode: 'drive',
  hasHydrated: false,
};

export const useTripStore = create<TripState & TripActions>()(
  persist(
    (set) => ({
      ...initialState,

      setPickup: (place) => set({pickup: place}),
      clearPickup: () => set({pickup: null}),
      setDropoff: (place) => set({dropoff: place}),
      clearDropoff: () => set({dropoff: null}),
      swapEnds: () =>
        set(state => {
          if (!state.pickup || !state.dropoff) {
            return state;
          }
          return {pickup: state.dropoff, dropoff: state.pickup};
        }),
      setMode: (mode) => set({mode}),
      reset: () => set({...initialState}),
      setHasHydrated: (hasHydrated) => set({hasHydrated}),
    }),
    {
      name: 'wayfare.trip',
      storage: createJSONStorage(() => AsyncStorage),
      // Only the trip itself is persisted. The actions are functions
      // and must never be written to storage.
      partialize: (state) => ({
        pickup: state.pickup,
        dropoff: state.dropoff,
        mode: state.mode,
      }),
      /**
       * Flip `hasHydrated` once the read completes — including when
       * it FAILS, so a storage error cannot strand the user on a
       * blank screen.
       */
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn(
            '[wayfare] Could not read the persisted trip; continuing without it.',
            error,
          );
        }

        useTripStore.setState({hasHydrated: true});
      },
    },
  ),
);

/**
 * True when both ends of the trip are chosen — the condition the
 * route view needs in order to render a route.
 */
export function hasCompleteTrip(state: TripState): boolean {
  return Boolean(state.pickup && state.dropoff);
}
