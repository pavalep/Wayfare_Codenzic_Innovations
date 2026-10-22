// ────────────────────────────────────────────────────────────
// Wayfare — Design Tokens
// ────────────────────────────────────────────────────────────
//
// SINGLE SOURCE OF TRUTH for every colour, spacing step, radius,
// shadow and type size used in the app.
//
// Values are transcribed 1:1 from the Figma source file
// ("React Native Assignment (Copy)", Page 1) via the Figma MCP
// `get_figma_data` export. The raw export is kept verbatim at
// `.design/figma_report.txt` so every number below can be
// traced back to a node id. The exported design assets the icons
// were transcribed from live in `design-reference/`.
//
// RAW LITERALS ARE BANNED OUTSIDE THIS FILE. The ESLint rule
// `no-restricted-syntax` in `.eslintrc.js` fails the build if a
// hex/rgba literal appears in a component, screen or hook. That is
// what keeps the UI honest: there is exactly one place where a
// colour can be changed.
//
// ────────────────────────────────────────────────────────────

// ─── Palette (raw Figma fills) ─────────────────────────────
// Kept separate from the semantic `colors` map so the raw values
// are visible in one place when cross-checking against Figma.

export const palette = {
  /** #FFFFFF — surface / card fill */
  white: '#FFFFFF',
  /** #111F2C — primary text, route-card end marker */
  ink: '#111F2C',
  /** #17212F — map destination marker */
  inkDeep: '#17212F',
  /** #7C8B99 — secondary text (subtitles, meta) */
  slate: '#7C8B99',
  /** #9CA3AF — input placeholder text */
  slateMid: '#9CA3AF',
  /** #A9B4BE — tertiary text (eyebrows, disabled labels) */
  slateSoft: '#A9B4BE',
  /** #E6EBEF — hairline borders and card strokes */
  line: '#E6EBEF',
  /** #F3F5F7 — app canvas + icon chips */
  canvas: '#F3F5F7',
  /** #F1521F — brand orange (primary actions, pickup dot) */
  brand: '#F1521F',
  /** #D3410F — pressed / selected-tab brand text */
  brandDeep: '#D3410F',
  /** #FDEBE3 — selected tab / brand tint surface */
  brandTint: '#FDEBE3',
  /** #F25424 — map route stroke + origin marker */
  brandAccent: '#F25424',
  /** #F5F6F7 — map land */
  mapLand: '#F5F6F7',
  /** #E9E3D9 — map water */
  mapWater: '#E9E3D9',
} as const;

// ─── Semantic colours ──────────────────────────────────────

export const colors = {
  background: {
    /** Screen background behind every surface. */
    canvas: palette.canvas,
    /** Card / sheet / input fill. */
    surface: palette.white,
    /** Circular icon chips that sit on a surface. */
    muted: palette.canvas,
    /** Faint brand surface (selected tab). */
    brandTint: palette.brandTint,
    /** Route-view map backdrop behind the map image. */
    map: palette.mapLand,
    /** Route-view map water tone. */
    mapWater: palette.mapWater,
  },
  text: {
    /** Headings, list titles, values. */
    primary: palette.ink,
    /** Subtitles, addresses, step captions. */
    secondary: palette.slate,
    /** Eyebrows ("Pickup"), disabled labels. */
    tertiary: palette.slateSoft,
    /** Input placeholder. */
    placeholder: palette.slateMid,
    /** Text on a brand-filled surface. */
    onBrand: palette.white,
    /** Brand-coloured text ("Forgot password?"). */
    brand: palette.brand,
    /** Brand-coloured text on the brand tint surface. */
    brandDeep: palette.brandDeep,
  },
  border: {
    /** Hairline border on cards, inputs, list rows. */
    subtle: palette.line,
    /** Same token today; split out so a future heavier border is a one-line change. */
    strong: palette.line,
  },
  brand: {
    /** Primary action fill. */
    primary: palette.brand,
    /** Pressed state of the primary action. */
    pressed: palette.brandDeep,
    /** Selected-mode pill surface. */
    tint: palette.brandTint,
    /** Map route stroke + origin marker. */
    mapAccent: palette.brandAccent,
  },
  marker: {
    /** Trip origin pin. */
    origin: palette.brandAccent,
    /** Trip destination pin. */
    destination: palette.inkDeep,
  },
  overlay: {
    /** "Heavy traffic near the marina" chip. */
    trafficChip: 'rgba(17, 31, 44, 0.9)',
    /** Dashed connector inside the route summary card. */
    dashedConnector: 'rgba(169, 180, 190, 0.6)',
    /** Android press ripple on a white surface. */
    rippleOnLight: 'rgba(17, 31, 44, 0.06)',
    /** The same ripple, slightly stronger, for floating map controls. */
    rippleOnLightStrong: 'rgba(17, 31, 44, 0.08)',
    /** Android press ripple on a brand-filled surface. */
    rippleOnBrand: 'rgba(255, 255, 255, 0.22)',
  },
} as const;

// ─── Spacing ────────────────────────────────────────────────
// A 4 pt base scale. The Figma frames are 420 px wide with a
// 20 px gutter, so `xl` (20) is the default horizontal margin.

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 44,
} as const;

// ─── Corner radii ──────────────────────────────────────────

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  /** Bottom-sheet top corners. */
  sheet: 28,
  /** Fully rounded (dots, pills, circular chips). */
  pill: 9999,
} as const;

// ─── Shadows ────────────────────────────────────────────────
//
// Figma shadow  →  React Native shadow mapping
//   `0px 1px 2px 0px rgba(17,31,44,0.04)`  →  offset {0,1}, blur 2, opacity .04
//   `0px 8px 30px -12px rgba(23,33,47,0.24)` → offset {0,8}, blur 30, opacity .24
//   `0px -12px 32px 0px rgba(17,31,44,0.1)` → offset {0,-12}, blur 32, opacity .1
//
// RN's `shadowRadius` is the iOS blur radius and Figma's "blur" is
// the CSS box-shadow blur, which is 2x the iOS value — hence
// `shadowRadius = blur / 2` below. `elevation` is the Android
// equivalent and is only a rough match; the iOS shadow is the
// reference the design was drawn in.

export const shadows = {
  /** Cards, inputs, list surfaces. */
  card: {
    shadowColor: palette.ink,
    shadowOpacity: 0.04,
    shadowRadius: 1,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
  },
  /** Floating map controls + map pins. */
  elevated: {
    shadowColor: palette.inkDeep,
    shadowOpacity: 0.24,
    shadowRadius: 15,
    shadowOffset: {width: 0, height: 8},
    elevation: 8,
  },
  /** Route-view bottom sheet. */
  sheet: {
    shadowColor: palette.ink,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: -12},
    elevation: 16,
  },
} as const;

// ─── Type scale ────────────────────────────────────────────
//
// Every entry pairs a Figma font size with the Figma line height
// for the same text node. Line height is NOT a ratio — the design
// uses absolute values (13 px text on a 19.5 px line, 15 px text
// on a 22.5 px line, and so on), so the pairs are kept verbatim.

export const fontSize = {
  /** Eyebrow labels ("Pickup", "Set as pickup"). */
  eyebrow: 12,
  /** Addresses, chip labels, turn-by-turn distances. */
  small: 13,
  /** Buttons, list subtitles, meta values. */
  medium: 14,
  /** Body copy, list titles, field values. */
  base: 15,
  /** Primary button label. */
  large: 17,
  /** Screen title ("Where are you going?"). */
  title: 26,
  /** Login heading ("Welcome back"). */
  display: 32,
  /** Route-view duration ("24 min"). */
  metric: 34,
} as const;

export const lineHeight = {
  eyebrow: 18,
  small: 19.5,
  medium: 21,
  base: 22.5,
  /** Body paragraph on the login screen (15 px / 24.38 px). */
  body: 24.38,
  large: 25.5,
  title: 32.5,
  display: 36.8,
  metric: 34,
} as const;

// ─── Letter spacing ────────────────────────────────────────
//
// Figma stores tracking in `em`; React Native needs absolute px,
// so each entry is `em * fontSize`.
//
//   -0.025em @ 32 px → -0.8    (display)
//   -0.025em @ 26 px → -0.65   (title)
//   -0.025em @ 34 px → -0.85   (metric)
//    0.08em  @ 12 px →  0.96   (eyebrow)
//    0.08em  @ 13 px →  1.04   (eyebrow, 13 px variant)

export const letterSpacing = {
  tight: {
    display: -0.8,
    title: -0.65,
    metric: -0.85,
  },
  wide: {
    eyebrow: 0.96,
    eyebrowLarge: 1.04,
  },
} as const;

// ─── Aggregated token set ──────────────────────────────────

export const tokens = {
  colors,
  spacing,
  radius,
  shadows,
  fontSize,
  lineHeight,
  letterSpacing,
} as const;

export type ColorTokens = typeof colors;
export type SpacingTokens = typeof spacing;
export type RadiusTokens = typeof radius;
export type ShadowTokens = typeof shadows;
export type TypographyTokens = typeof tokens;
export type Tokens = typeof tokens;
