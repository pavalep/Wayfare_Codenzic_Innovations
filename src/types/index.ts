// ─── Domain types ─────────────────────────────────────────────
//
// The shapes the UI renders. These are deliberately independent of
// any transport: the app is served by mock data today, but a real
// routing API later would be mapped onto exactly these types, so no
// screen would need to change.

/** A saved place the user can pick as a pickup or drop-off. */
export interface Place {
  /** Stable identifier. */
  id: string;
  /** Short name — "Home", "Marina Office Tower". */
  name: string;
  /** Full address line — "Villa 12, Street 840, Zone 61 · West Bay". */
  address: string;
  /** Which glyph the list row shows. */
  icon: PlaceIcon;
  /** Latitude, when the place has a real coordinate. */
  latitude?: number;
  /** Longitude, when the place has a real coordinate. */
  longitude?: number;
}

/** The glyph set available for a saved place. */
export type PlaceIcon =
  | 'home'
  | 'office'
  | 'ferry'
  | 'metro'
  | 'airport'
  /** The device's current position. */
  | 'target';

/** How the traveller is moving. Mirrors the route-view mode tabs. */
export type TravelMode = 'drive' | 'ride' | 'walk';

/** The kind of manoeuvre a turn-by-turn leg describes. */
export type TurnType = 'straight' | 'right' | 'left' | 'arrive';

/** One step of the turn-by-turn list. */
export interface RouteLeg {
  /** Stable identifier, used as a list key. */
  id: string;
  /** Primary instruction — "Head north on Street 840". */
  instruction: string;
  /** Secondary detail — "Keep right past the service road". */
  detail: string;
  /** Distance for this leg — "450 m", "1.8 km". */
  distance: string;
  /** Which glyph to show. */
  turn: TurnType;
}

/** The headline numbers for one travel mode. */
export interface RouteSummary {
  /** Total duration in minutes — 24. */
  durationMinutes: number;
  /** Formatted duration — "24 min". */
  duration: string;
  /** Formatted distance — "9.6 km". */
  distance: string;
  /** Formatted arrival time — "arrive 10:42". */
  arrival: string;
  /** The ordered turn-by-turn legs. */
  legs: RouteLeg[];
}

/** The two ends of a trip. */
export interface Trip {
  pickup: Place | null;
  dropoff: Place | null;
}
