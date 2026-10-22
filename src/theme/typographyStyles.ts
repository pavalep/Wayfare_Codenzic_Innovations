// ─── Semantic typography styles ─────────────────────────────────
//
// Every text style the app uses, named by the ROLE it plays rather
// than by its size. Components ask for `variant="title"`; they never
// spell out `fontSize: 26`.
//
// Each style is a verbatim transcription of a Figma text node:
// font family (Nunito Sans), the exact weight the design used, the
// exact font size, the exact line height and the exact tracking.
// Weights map to the per-weight font files from
// `@expo-google-fonts/nunito-sans` — see `constants/fontFamily.ts`
// for why the weight lives in the family name.
//
// NOTE: no `fontWeight` is set on any of these styles. The weight is
// already encoded in the font family, and adding `fontWeight` on top
// makes Android re-bias the resolved file (see fontFamily.ts).

import {Platform, type TextStyle} from 'react-native';

import {FONT_FAMILY} from '../constants/fontFamily';
import {colors, fontSize, letterSpacing, lineHeight} from './tokens';

// ─── Cross-platform safety: android:includeFontPadding ──────
//
// Android text views add extra padding above and below the line
// baseline. Zeroing it out keeps the vertical rhythm identical to
// the design on both platforms.
const zeroFontPadding: TextStyle =
  Platform.OS === 'android' ? {includeFontPadding: false} : {};

// ─── Display / headline ─────────────────────────────────────

/**
 * Login screen headline — "Welcome back".
 * ExtraBold 32 px / 36.8 px line, -0.025em tracking.
 */
export const display: TextStyle = {
  fontFamily: FONT_FAMILY.nunito.extrabold,
  fontSize: fontSize.display,
  lineHeight: lineHeight.display,
  letterSpacing: letterSpacing.tight.display,
  ...zeroFontPadding,
};

/**
 * Screen title — "Where are you going?".
 * ExtraBold 26 px / 32.5 px line, -0.025em tracking.
 */
export const title: TextStyle = {
  fontFamily: FONT_FAMILY.nunito.extrabold,
  fontSize: fontSize.title,
  lineHeight: lineHeight.title,
  letterSpacing: letterSpacing.tight.title,
  ...zeroFontPadding,
};

/**
 * Route duration — "24 min".
 * ExtraBold 34 px / 34 px line, -0.025em tracking.
 */
export const metric: TextStyle = {
  fontFamily: FONT_FAMILY.nunito.extrabold,
  fontSize: fontSize.metric,
  lineHeight: lineHeight.metric,
  letterSpacing: letterSpacing.tight.metric,
  ...zeroFontPadding,
};

// ─── Eyebrows / overlines ───────────────────────────────────

/**
 * Field eyebrow — "Pickup", "Drop-off".
 * ExtraBold 12 px / 18 px line, 0.08em tracking.
 */
export const eyebrow: TextStyle = {
  fontFamily: FONT_FAMILY.nunito.extrabold,
  fontSize: fontSize.eyebrow,
  lineHeight: lineHeight.eyebrow,
  letterSpacing: letterSpacing.wide.eyebrow,
  ...zeroFontPadding,
};

/**
 * Section eyebrow — "Set as pickup", "Turn by turn".
 * ExtraBold 13 px / 19.5 px line, 0.08em tracking.
 */
export const eyebrowLarge: TextStyle = {
  fontFamily: FONT_FAMILY.nunito.extrabold,
  fontSize: fontSize.small,
  lineHeight: lineHeight.small,
  letterSpacing: letterSpacing.wide.eyebrowLarge,
  ...zeroFontPadding,
};

// ─── Body ───────────────────────────────────────────────────

/**
 * Body paragraph — the login subtitle.
 * Regular 15 px / 24.38 px line.
 */
export const body: TextStyle = {
  fontFamily: FONT_FAMILY.nunito.regular,
  fontSize: fontSize.base,
  lineHeight: lineHeight.body,
  ...zeroFontPadding,
};

/**
 * Secondary body — the screen subtitle under the title.
 * Regular 15 px / 22.5 px line.
 */
export const bodySm: TextStyle = {
  fontFamily: FONT_FAMILY.nunito.regular,
  fontSize: fontSize.base,
  lineHeight: lineHeight.base,
  ...zeroFontPadding,
};

/**
 * List / field title — "Home", "Marina Office Tower".
 * Bold 15 px / 22.5 px line.
 */
export const label: TextStyle = {
  fontFamily: FONT_FAMILY.nunito.bold,
  fontSize: fontSize.base,
  lineHeight: lineHeight.base,
  ...zeroFontPadding,
};

/**
 * Field label — "Email", "Password".
 * Bold 15 px / 22.5 px line.
 */
export const labelBold: TextStyle = label;

/**
 * Secondary list text — a saved place's address.
 * Regular 13 px / 19.5 px line.
 */
export const caption: TextStyle = {
  fontFamily: FONT_FAMILY.nunito.regular,
  fontSize: fontSize.small,
  lineHeight: lineHeight.small,
  ...zeroFontPadding,
};

/**
 * Turn-by-turn instruction.
 * Bold 15 px / 20.63 px line.
 */
export const instruction: TextStyle = {
  fontFamily: FONT_FAMILY.nunito.bold,
  fontSize: fontSize.base,
  lineHeight: 20.63,
  ...zeroFontPadding,
};

/**
 * Turn-by-turn sub-line.
 * Regular 13 px / 19.5 px line.
 */
export const instructionSub: TextStyle = caption;

// ─── Controls ───────────────────────────────────────────────

/**
 * Primary button label — "Log in", "Next", "Start navigation".
 * ExtraBold 17 px / 25.5 px line.
 */
export const button: TextStyle = {
  fontFamily: FONT_FAMILY.nunito.extrabold,
  fontSize: fontSize.large,
  lineHeight: lineHeight.large,
  ...zeroFontPadding,
};

/**
 * Secondary button label — "Use current", "Pick on map".
 * Bold 14 px / 21 px line.
 */
export const buttonSm: TextStyle = {
  fontFamily: FONT_FAMILY.nunito.bold,
  fontSize: fontSize.medium,
  lineHeight: lineHeight.medium,
  ...zeroFontPadding,
};

/**
 * Traffic chip label.
 * Bold 13 px / 19.5 px line.
 */
export const chip: TextStyle = {
  fontFamily: FONT_FAMILY.nunito.bold,
  fontSize: fontSize.small,
  lineHeight: lineHeight.small,
  ...zeroFontPadding,
};

/**
 * Right-aligned meta value — "9.6 km", "arrive 10:42", "450 m".
 * SemiBold 14 px / 21 px line.
 */
export const meta: TextStyle = {
  fontFamily: FONT_FAMILY.nunito.semibold,
  fontSize: fontSize.medium,
  lineHeight: lineHeight.medium,
  ...zeroFontPadding,
};

/**
 * Input text — a typed value or a placeholder.
 * SemiBold 15 px / 22.5 px line (the design uses SemiBold for the
 * placeholder, which is what makes the field look "filled" rather
 * than empty; the real value uses the same weight).
 */
export const input: TextStyle = {
  fontFamily: FONT_FAMILY.nunito.semibold,
  fontSize: fontSize.base,
  lineHeight: lineHeight.base,
  ...zeroFontPadding,
};

/**
 * Centred body — "New to Wayfare?" and the empty-state paragraph.
 * Regular 14 px / 21 px line, horizontally centred.
 */
export const centered: TextStyle = {
  fontFamily: FONT_FAMILY.nunito.regular,
  fontSize: fontSize.medium,
  lineHeight: lineHeight.medium,
  textAlign: 'center',
  ...zeroFontPadding,
};

// ─── Tone → colour map ──────────────────────────────────────
//
// Components never pass a raw colour to `<AppText>`. They pass a
// TONE, and this map resolves it to a token. That keeps the
// "raw colour literals are banned" ESLint rule enforceable and makes
// a colour change a one-line edit here rather than a sweep across
// the screens.

export const toneColors = {
  /** Headings, list titles, values. */
  primary: colors.text.primary,
  /** Subtitles, addresses, meta. */
  secondary: colors.text.secondary,
  /** Eyebrows, disabled labels. */
  tertiary: colors.text.tertiary,
  /** Input placeholder. */
  placeholder: colors.text.placeholder,
  /** Text on a brand-filled surface. */
  onBrand: colors.text.onBrand,
  /** Brand-coloured text. */
  brand: colors.text.brand,
  /** Brand-coloured text on the brand tint surface. */
  brandDeep: colors.text.brandDeep,
  /** Dark marker text. */
  inverse: colors.marker.destination,
} as const;

export type TextTone = keyof typeof toneColors;

// ─── Variant map ────────────────────────────────────────────
//
// The map consumed by `<AppText variant="..." />`. Adding a variant
// here is the only supported way to introduce a new text style.

export const typographyVariants = {
  display,
  title,
  metric,
  eyebrow,
  eyebrowLarge,
  body,
  bodySm,
  label,
  labelBold: labelBold,
  caption,
  instruction,
  instructionSub,
  button,
  buttonSm,
  chip,
  meta,
  input,
  centered,
} as const;

export type TypographyVariant = keyof typeof typographyVariants;
