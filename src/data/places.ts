// ─── Mock saved places ─────────────────────────────────────────
//
// Static data standing in for a places service. The names and
// addresses are transcribed verbatim from the Figma "Set locations"
// screen so the list matches the design pixel for pixel.
//
// A real backend would return this shape unchanged — see
// `src/types/index.ts` for the contract.

import type {Place} from '../types';

export const SAVED_PLACES: Place[] = [
  {
    id: 'home',
    name: 'Home',
    address: 'Villa 12, Street 840, Zone 61 · West Bay',
    icon: 'home',
    latitude: 25.2048,
    longitude: 55.2708,
  },
  {
    id: 'marina-office-tower',
    name: 'Marina Office Tower',
    address: 'Level 14, Al Fardan Rd · Lusail Marina',
    icon: 'office',
    latitude: 25.2836,
    longitude: 51.5042,
  },
  {
    id: 'corniche-ferry-terminal',
    name: 'Corniche Ferry Terminal',
    address: 'Gate 3, Corniche Promenade',
    icon: 'ferry',
    latitude: 25.2896,
    longitude: 51.5361,
  },
  {
    id: 'msheireb-metro-station',
    name: 'Msheireb Metro Station',
    address: 'Al Kinana St · Msheireb Downtown',
    icon: 'metro',
    latitude: 25.2830,
    longitude: 51.5153,
  },
  {
    id: 'hamad-international-airport',
    name: 'Hamad International Airport',
    address: 'Terminal 1, Departures',
    icon: 'airport',
    latitude: 25.2731,
    longitude: 51.6080,
  },
];

/**
 * Case-insensitive substring search over the saved places.
 *
 * Used by the drop-off search on the trip-ready screen. An empty
 * query returns every place; the screen shows its own empty state
 * instead when the query matches nothing.
 */
export function searchSavedPlaces(query: string): Place[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return SAVED_PLACES;
  }
  return SAVED_PLACES.filter(
    place =>
      place.name.toLowerCase().includes(trimmed) ||
      place.address.toLowerCase().includes(trimmed),
  );
}

/**
 * Builds a one-off place from free text — the "use it as a custom
 * address" path on the trip-ready screen.
 */
export function createCustomPlace(address: string): Place {
  const trimmed = address.trim();
  return {
    id: `custom-${trimmed.toLowerCase().replace(/\s+/g, '-')}`,
    name: trimmed,
    address: trimmed,
    icon: 'ferry',
  };
}
