import React from 'react';
import Svg, {G, Path, Rect} from 'react-native-svg';

import {colors} from '../../../theme';

/**
 * The app's icon set.
 *
 * Every glyph is an inline `react-native-svg` component rather than an
 * imported `.svg` file. Three reasons:
 *
 *   1. Tinting. A glyph that is drawn as JSX can take a `color`
 *      prop, so the same "back chevron" can be ink on a header and
 *      white on a brand button. An imported SVG would need a second
 *      asset for every colour.
 *   2. The chip background is part of the glyph. In the Figma source
 *      the circular/rounded-square backdrop is a sibling layer, not
 *      part of the icon. Baking it in keeps the padding and the
 *      radius in one place and makes the row alignment exact.
 *   3. Testability. A component tree is assertable in a unit test;
 *      an opaque asset file is not.
 *
 * The path data is transcribed verbatim from the exported Figma SVGs
 * (see `design-reference/`), so the shapes are the design's shapes
 * and not approximations.
 *
 * ─── THE `fill="none"` RULE ─────────────────────────────────
 *
 * Every one of the Figma exports opens with
 *
 *     <svg … fill="none">
 *
 * and every shape inside them is a STROKE — an envelope, a padlock, a
 * chevron — with no fill of its own. The root's `fill="none"` is what
 * tells the renderer not to fill them.
 *
 * SVG's own default for `fill` is black, and `react-native-svg`
 * follows it. So a transcription that copies the path data and the
 * stroke but forgets the root's `fill="none"` does not draw a
 * stroked envelope — it draws a SOLID BLACK ENVELOPE with a stroke
 * around it. Every glyph in the app was wrong in exactly that way
 * before this rule was applied: the envelope was a black rectangle,
 * the padlock a black box, and the logo had black blobs inside its
 * white road marking.
 *
 * So: every `<Svg>` in this file carries `fill="none"`, exactly as
 * the Figma export does, and a shape that really is filled says so
 * on the shape itself (`<Rect fill={…}>`). Nothing is left to a
 * default.
 */
export type IconName =
  /** The Wayfare logo mark (56 px, brand fill). */
  | 'logo'
  /** Saved place — building/house glyph on a 40 px circle. */
  | 'place'
  /** Saved place — clock glyph on a 40 px circle. */
  | 'placeClock'
  /** Text-field leading icon (18 px). */
  | 'email'
  /** Password field leading icon (18 px). */
  | 'lock'
  /** Name field leading icon (18 px). */
  | 'person'
  /** Show-password toggle (40 px). */
  | 'eye'
  /** Hide-password toggle (40 px). */
  | 'eyeOff'
  /** Back chevron (40 px). */
  | 'back'
  /** Close / clear (×) on a 28 px circle. */
  | 'close'
  /** "Use current location" — crossed arrows on a 40 px rounded square. */
  | 'currentLocation'
  /** Crosshair (18 px). */
  | 'target'
  /** Folded map (18 px). */
  | 'map'
  /** Traffic warning triangle (16 px). */
  | 'traffic'
  /**
   * The manoeuvre glyph on the turn-by-turn chips (32 px).
   *
   * The Figma draws ONE arrow here — legs 2, 3 and 4 share the
   * component `EL-a5b41d96`, and leg 1 carries a byte-identical
   * standalone copy of the same artwork. There is no second arrow in
   * the design, so there is exactly one glyph here.
   */
  | 'turn'
  /** Navigation arrowhead (20 px). */
  | 'navigation'
  /**
   * The map's back button glyph (20 px) — Figma node #1:352.
   *
   * The design draws the whole button as one SVG — a white 44 px
   * rounded square with the chevron in it — but the white square is
   * drawn by the pressable that carries this glyph, so that the
   * shadow Android casts has the shape of the button.
   */
  | 'mapBack'
  /**
   * The map's layers button glyph (20 px) — Figma node #1:355.
   *
   * The same shape as `mapBack`: the stacked-layers glyph, centred
   * in the design's 20 px clip box.
   */
  | 'mapLayers'
  /**
   * The origin marker on the map (36 px) — the design's orange disc
   * with the white car inside it.
   */
  | 'markerOrigin'
  /**
   * The destination marker on the map (32 px) — the design's deep-navy
   * disc with the white pin inside it.
   */
  | 'markerDestination';

export interface AppIconProps {
  /** Which glyph to draw. */
  name: IconName;
  /**
   * Rendered size in points. Defaults to the glyph's natural size
   * from the Figma source.
   */
  size?: number;
  /**
   * Stroke / glyph colour. Defaults to the design's ink colour.
   * Pass `colors.text.onBrand` for icons that sit on the brand fill.
   */
  color?: string;
  /**
   * Backdrop colour for the glyphs that have one (the place chip,
   * the close chip, the turn chip, …). Defaults to the design's
   * muted surface. Pass `transparent` to drop it.
   */
  backgroundColor?: string;
}

/** Natural sizes, straight from the Figma nodes. */
const NATURAL_SIZE: Record<IconName, number> = {
  logo: 56,
  place: 40,
  placeClock: 40,
  email: 18,
  lock: 18,
  person: 18,
  eye: 40,
  eyeOff: 40,
  back: 40,
  close: 28,
  currentLocation: 40,
  target: 18,
  map: 18,
  traffic: 16,
  turn: 32,
  navigation: 20,
  mapBack: 20,
  mapLayers: 20,
  markerOrigin: 36,
  markerDestination: 32,
};

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size,
  color = colors.text.primary,
  backgroundColor = colors.background.muted,
}) => {
  const box = size ?? NATURAL_SIZE[name];

  switch (name) {
    // ─── Logo ────────────────────────────────────────────────
    case 'logo':
      return (
        <Svg width={box} height={box} viewBox="0 0 56 56" fill="none">
          <Rect width={56} height={56} rx={18} fill={colors.brand.primary} />
          <Path
            d="M17.5 36.17C17.5 34.237 19.067 32.67 21 32.67C22.933 32.67 24.5 34.237 24.5 36.17C24.5 38.103 22.933 39.67 21 39.67C19.067 39.67 17.5 38.103 17.5 36.17Z"
            stroke={colors.text.onBrand}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M24.5 36.16H34.4167C36.6718 36.16 38.5 34.3322 38.5 32.0775C38.5 29.8228 36.6718 27.995 34.4167 27.995H21.5833C19.3282 27.995 17.5 26.1672 17.5 23.9125C17.5 21.6578 19.3282 19.83 21.5833 19.83H31.5"
            stroke={colors.text.onBrand}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M31.5 19.83C31.5 17.897 33.067 16.33 35 16.33C36.933 16.33 38.5 17.897 38.5 19.83C38.5 21.763 36.933 23.33 35 23.33C33.067 23.33 31.5 21.763 31.5 19.83Z"
            stroke={colors.text.onBrand}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    // ─── Saved places ────────────────────────────────────────
    case 'place':
      return (
        <Svg width={box} height={box} viewBox="0 0 40 40" fill="none">
          <Rect width={40} height={40} rx={20} fill={backgroundColor} />
          <Path
            d="M22.25 26.75V20.75C22.25 20.3358 21.9142 20 21.5 20H18.5C18.0858 20 17.75 20.3358 17.75 20.75V26.75"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M13.25 18.2898C13.2499 17.8369 13.4444 17.407 13.7818 17.1146L19.0318 12.5C19.5908 12.0155 20.4092 12.0155 20.9682 12.5L26.2183 17.1146C26.5556 17.407 26.7501 17.8369 26.75 18.2898V25.2118C26.75 26.0613 26.0784 26.75 25.25 26.75H14.75C13.9216 26.75 13.25 26.0613 13.25 25.2118V18.2898Z"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'placeClock':
      return (
        <Svg width={box} height={box} viewBox="0 0 40 40" fill="none">
          <Rect width={40} height={40} rx={20} fill={backgroundColor} />
          <G>
            <Path
              d="M12.5 20C12.5 15.8579 15.8579 12.5 20 12.5C24.1421 12.5 27.5 15.8579 27.5 20C27.5 24.1421 24.1421 27.5 20 27.5C15.8579 27.5 12.5 24.1421 12.5 20Z"
              stroke={color}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M20 15.5V20L23 21.5"
              stroke={color}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </G>
        </Svg>
      );

    // ─── Form fields ─────────────────────────────────────────
    case 'person':
      return (
        <Svg width={box} height={box} viewBox="0 0 18 18" fill="none">
          <Path
            d="M9 2.75C10.6571 2.75 12 4.09289 12 5.75C12 7.40711 10.6571 8.75 9 8.75C7.34289 8.75 6 7.40711 6 5.75C6 4.09289 7.34289 2.75 9 2.75Z"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M2.75 15.75C2.75 12.5123 5.2623 10 8.5 10H9.5C12.7377 10 15.25 12.5123 15.25 15.75"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'email':
      return (
        <Svg width={box} height={box} viewBox="0 0 18 18" fill="none">
          <Path
            d="M16.5 5.25L9.75675 9.75C9.29094 10.0335 8.71581 10.0335 8.25 9.75L1.5 5.25"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M3 3H15C15.8284 3 16.5 3.67157 16.5 4.5V13.5C16.5 14.3284 15.8284 15 15 15H3C2.17157 15 1.5 14.3284 1.5 13.5V4.5C1.5 3.67157 2.17157 3 3 3Z"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'lock':
      return (
        <Svg width={box} height={box} viewBox="0 0 18 18" fill="none">
          <Path
            d="M3.75 8.25H14.25C15.0784 8.25 15.75 8.92157 15.75 9.75V15C15.75 15.8284 15.0784 16.5 14.25 16.5H3.75C2.92157 16.5 2.25 15.8284 2.25 15V9.75C2.25 8.92157 2.92157 8.25 3.75 8.25Z"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M5.25 8.25V5.25C5.25 3.17893 6.92893 1.5 9 1.5C11.0711 1.5 12.75 3.17893 12.75 5.25V8.25"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'eye':
      return (
        <Svg width={box} height={box} viewBox="0 0 40 40" fill="none">
          <Path
            d="M12.5 20.261C12.4371 20.0926 12.4371 19.9074 12.5 19.739C13.7528 16.7199 16.7142 14.75 20 14.75C23.2858 14.75 26.2472 16.7199 27.5 19.739C27.5629 19.9074 27.5629 20.0926 27.5 20.261C26.2472 23.2801 23.2858 25.25 20 25.25C16.7142 25.25 13.7528 23.2801 12.5 20.261Z"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M17.75 20C17.75 18.7574 18.7574 17.75 20 17.75C21.2426 17.75 22.25 18.7574 22.25 20C22.25 21.2426 21.2426 22.25 20 22.25C18.7574 22.25 17.75 21.2426 17.75 20Z"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    // ─── Hide-password toggle ────────────────────────────────
    //
    // The design has ONE eye (Figma node #1:56) because the Figma
    // frame is a static picture of the field with the password
    // hidden. A real toggle needs a second state, so this is the
    // design's own eye with a slash drawn across it — the shape the
    // design's other glyphs are built from, in the design's stroke
    // language, and not a new drawing.
    case 'eyeOff':
      return (
        <Svg width={box} height={box} viewBox="0 0 40 40" fill="none">
          <Path
            d="M12.5 20.261C12.4371 20.0926 12.4371 19.9074 12.5 19.739C13.7528 16.7199 16.7142 14.75 20 14.75C23.2858 14.75 26.2472 16.7199 27.5 19.739C27.5629 19.9074 27.5629 20.0926 27.5 20.261C26.2472 23.2801 23.2858 25.25 20 25.25C16.7142 25.25 13.7528 23.2801 12.5 20.261Z"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M17.75 20C17.75 18.7574 18.7574 17.75 20 17.75C21.2426 17.75 22.25 18.7574 22.25 20C22.25 21.2426 21.2426 22.25 20 22.25C18.7574 22.25 17.75 21.2426 17.75 20Z"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M11 29L29 11"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </Svg>
      );

    // ─── Navigation ───────────────────────────────────────────
    //
    // The header's back chevron — Figma node #1:93, a 40 px SVG
    // whose chevron is 6 px wide and 12 px tall. It is rendered at
    // its own natural size so the chevron comes out at the design's
    // size rather than being scaled inside an oversized box.
    case 'back':
      return (
        <Svg width={box} height={box} viewBox="0 0 40 40" fill="none">
          <Path
            d="M23 26L17 20L23 14"
            stroke={color}
            strokeWidth={2.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'close':
      return (
        <Svg width={box} height={box} viewBox="0 0 28 28" fill="none">
          <Rect width={28} height={28} rx={14} fill={backgroundColor} />
          <Path
            d="M17.5 10.5L10.5 17.5"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M10.5 10.5L17.5 17.5"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'currentLocation':
      return (
        <Svg width={box} height={box} viewBox="0 0 40 40" fill="none">
          <Rect width={40} height={40} rx={12} fill={backgroundColor} />
          <Path
            d="M26.75 23L23.75 26L20.75 23"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M23.75 26V14"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M13.25 17L16.25 14L19.25 17"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M16.25 14V26"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'target':
      return (
        <Svg width={box} height={box} viewBox="0 0 18 18" fill="none">
          <Path d="M1.5 9H3.75" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M14.25 9H16.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M9 1.5V3.75" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M9 14.25V16.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <Path
            d="M3.75 9C3.75 6.10051 6.10051 3.75 9 3.75C11.8995 3.75 14.25 6.10051 14.25 9C14.25 11.8995 11.8995 14.25 9 14.25C6.10051 14.25 3.75 11.8995 3.75 9Z"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M6.75 9C6.75 7.75736 7.75736 6.75 9 6.75C10.2426 6.75 11.25 7.75736 11.25 9C11.25 10.2426 10.2426 11.25 9 11.25C7.75736 11.25 6.75 10.2426 6.75 9Z"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'map':
      return (
        <Svg width={box} height={box} viewBox="0 0 18 18" fill="none">
          <Path
            d="M10.5795 4.04886C11.0016 4.26505 11.4984 4.26505 11.9205 4.04886L14.6648 2.64216C14.8974 2.523 15.1737 2.53589 15.3948 2.67624C15.616 2.81658 15.7504 3.06433 15.75 3.33091V13.1425C15.7498 13.4336 15.5893 13.6996 15.3352 13.8297L11.9205 15.58C11.4984 15.7962 11.0016 15.7962 10.5795 15.58L7.4205 13.9611C6.99838 13.7449 6.50162 13.7449 6.0795 13.9611L3.33525 15.3678C3.10246 15.4871 2.82602 15.4741 2.60484 15.3336C2.38366 15.193 2.24936 14.945 2.25 14.6783V4.86752C2.25015 4.57644 2.4107 4.31042 2.66475 4.18031L6.0795 2.43C6.50162 2.21381 6.99838 2.21381 7.4205 2.43L10.5795 4.04886Z"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path d="M11.25 4.32V15.57" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M6.75 2.43V13.68" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'traffic':
      return (
        <Svg width={box} height={box} viewBox="0 0 16 16" fill="none">
          <Path
            d="M14.6597 11.9999L9.18142 2.66597C8.93824 2.2482 8.48311 1.99 7.98989 1.99C7.49667 1.99 7.04155 2.2482 6.79836 2.66597L1.32007 11.9999C1.07429 12.4143 1.07545 12.9252 1.32311 13.3385C1.57077 13.7519 2.02695 14.0043 2.51845 14H13.475C13.9641 13.9995 14.4158 13.7452 14.6601 13.3327C14.9044 12.9202 14.9042 12.4122 14.6597 11.9999Z"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path d="M8 6V8.67" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M8 11.33H8.01" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    // ─── Turn-by-turn ─────────────────────────────────────────
    //
    // ONE glyph, because the design has one. Legs 2, 3 and 4 of the
    // turn-by-turn list share the Figma component `EL-a5b41d96`, and
    // leg 1 carries a standalone copy of exactly the same artwork —
    // the two exported SVGs differ only in the third decimal of two
    // coordinates. There is no straight arrow in the design, so there
    // is no straight arrow here.
    case 'turn':
      return (
        <Svg width={box} height={box} viewBox="0 0 32 32" fill="none">
          <Rect width={32} height={32} rx={16} fill={backgroundColor} />
          <Path
            d="M18 17.34L21.33 14.005L18 10.67"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M10.6699 21.33V16.6655C10.6699 15.1934 11.8642 14 13.3374 14H21.3399"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'navigation':
      return (
        <Svg width={box} height={box} viewBox="0 0 20 20" fill="none">
          <Path
            d="M2.5 9.16843L18.33 1.67001L10.8316 17.5L9.16526 10.8348L2.5 9.16843Z"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    // ─── Map buttons ──────────────────────────────────────────
    //
    // In the design each of these is ONE svg: a white 44 px rounded
    // square with the glyph in the middle, plus a drop-shadow filter
    // on the group. The filter is dropped — React Native draws its
    // own shadows, and the design's shadow token is applied to the
    // pressable that carries the glyph instead.
    //
    // The white square is NOT baked in here, because the shadow has
    // to be cast by the VIEW that holds it: Android draws an
    // elevation shadow from the view's outline, so a transparent
    // 48 px pressable would cast a square halo around the artwork
    // instead of a shadow shaped like the button. The pressable
    // draws the square; this draws the glyph.
    //
    // Both glyphs use the design's own 20 px clip box, taken from the
    // `btn-map-layers` export, so the paths and their strokes come
    // out at the design's size and weight rather than being scaled.
    case 'mapBack':
      return (
        <Svg width={box} height={box} viewBox="14 13 20 20" fill="none">
          <Path
            d="M27 29L21 23L27 17"
            stroke={color}
            strokeWidth={2.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'mapLayers':
      return (
        <Svg width={box} height={box} viewBox="14 13 20 20" fill="none">
          <Path
            d="M24.8333 24.67C24.3176 24.9815 23.6822 24.9815 23.1665 24.67L16.0824 20.4236C15.8213 20.2688 15.6599 19.979 15.6599 19.665C15.6599 19.351 15.8213 19.0612 16.0824 18.9064L23.1665 14.66C23.6822 14.3485 24.3176 14.3485 24.8333 14.66L31.9174 18.9064C32.1785 19.0612 32.3399 19.351 32.3399 19.665C32.3399 19.979 32.1785 20.2688 31.9174 20.4236L24.8333 24.67Z"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M30.6673 24.9L31.9174 25.6299C32.1785 25.7833 32.3399 26.0704 32.3399 26.3815C32.3399 26.6926 32.1785 26.9797 31.9174 27.133L24.8333 31.34C24.3176 31.6486 23.6822 31.6486 23.1665 31.34L16.0824 27.133C15.8213 26.9797 15.6599 26.6926 15.6599 26.3815C15.6599 26.0704 15.8213 25.7833 16.0824 25.6299L17.3325 24.9"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    // ─── Map markers ──────────────────────────────────────────
    //
    // Both markers are the design's own artwork, exported from the
    // Figma route-view frame and transcribed path for path:
    //
    //   • `marker-origin.svg`      → Figma node #1:1024, 36 px
    //   • `marker-destination.svg` → Figma node #1:1020, 32 px
    //
    // A marker is NOT a plain coloured circle. Each one is a filled
    // disc, a 2 px white ring inset by 1 px, and a white symbol inside
    // it — a van on the origin, a map pin on the destination. Dropping
    // the symbol is what made the map look like flat opaque dots.
    //
    // The white ring is a STROKE, not a fill. SVG fills a shape with
    // black when it is not told otherwise, so the ring has to say
    // `fill="none"` — without it the ring paints a black disc over
    // the marker's own colour and every marker comes out black.
    //
    // The Figma exports carry a drop-shadow filter. React Native draws
    // its own shadows, so the filter is dropped here and the design's
    // shadow token is applied by the caller instead.
    case 'markerOrigin':
      return (
        <Svg width={box} height={box} viewBox="18 10 36 36" fill="none">
          <Rect x={18} y={10} width={36} height={36} rx={18} fill={colors.brand.mapAccent} />
          <Rect
            x={19}
            y={11}
            width={34}
            height={34}
            rx={17}
            fill="none"
            stroke={colors.text.onBrand}
            strokeWidth={2}
          />
          {/* The van. */}
          <Path
            d="M37.3401 31.99V23.9929C37.3401 23.2567 36.7431 22.66 36.0068 22.66H30.6734C29.937 22.66 29.3401 23.2567 29.3401 23.9929V31.3236C29.3401 31.6916 29.6386 31.99 30.0068 31.99H31.3401"
            stroke={colors.text.onBrand}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M38 32H34"
            stroke={colors.text.onBrand}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M40.6713 32H42.0038C42.3718 32 42.6701 31.7014 42.6701 31.333V28.8985C42.6698 28.7471 42.6181 28.6003 42.5235 28.4822L40.205 25.5808C40.0787 25.4226 39.8876 25.3303 39.6853 25.33H37.3401"
            stroke={colors.text.onBrand}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M38 31.995C38 31.2577 38.5977 30.66 39.335 30.66C40.0723 30.66 40.67 31.2577 40.67 31.995C40.67 32.7323 40.0723 33.33 39.335 33.33C38.5977 33.33 38 32.7323 38 31.995Z"
            stroke={colors.text.onBrand}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M31.3401 31.995C31.3401 31.2577 31.9378 30.66 32.6751 30.66C33.4124 30.66 34.0101 31.2577 34.0101 31.995C34.0101 32.7323 33.4124 33.33 32.6751 33.33C31.9378 33.33 31.3401 32.7323 31.3401 31.995Z"
            stroke={colors.text.onBrand}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'markerDestination':
      return (
        <Svg width={box} height={box} viewBox="18 10 32 32" fill="none">
          <Rect x={18} y={10} width={32} height={32} rx={16} fill={colors.marker.destination} />
          <Rect
            x={19}
            y={11}
            width={30}
            height={30}
            rx={15}
            fill="none"
            stroke={colors.text.onBrand}
            strokeWidth={2}
          />
          {/* The pin. */}
          <Path
            d="M39.3399 24.7261C39.3399 28.0877 35.6461 31.5887 34.4057 32.67C34.1683 32.8502 33.8415 32.8502 33.6041 32.67C32.3637 31.5887 28.6699 28.0877 28.6699 24.7261C28.6699 21.7514 31.0585 19.34 34.0049 19.34C36.9514 19.34 39.3399 21.7514 39.3399 24.7261Z"
            stroke={colors.text.onBrand}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M32 24.67C32 23.5654 32.8954 22.67 34 22.67C35.1046 22.67 36 23.5654 36 24.67C36 25.7746 35.1046 26.67 34 26.67C32.8954 26.67 32 25.7746 32 24.67Z"
            stroke={colors.text.onBrand}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    default:
      return null;
  }
};
