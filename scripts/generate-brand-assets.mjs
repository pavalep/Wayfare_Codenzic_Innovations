/**
 * Regenerates the brand images from the logo the design gives us.
 *
 * WHY A SCRIPT AND NOT HAND-DRAWN PNGs
 *
 * Every image the launcher and the splash screen use is built from
 * ONE source — `design-reference/logo.svg`, the orange rounded square
 * with the white route glyph that the Figma file exports. The glyph
 * is copied out of that file verbatim, so the icon, the splash and
 * the in-app logo can never drift apart: they are the same paths,
 * rendered at different sizes.
 *
 * The script exists because the sizes ARE the design work. Android's
 * adaptive icon has a safe zone and a splash screen has a canvas, and
 * getting either wrong produces an icon that is clipped by the
 * launcher's mask or a splash mark that is lost in the middle of the
 * screen. Those numbers are written down here, with the reason for
 * each one, instead of being baked into a binary nobody can inspect.
 *
 * RUN IT
 *
 *     node scripts/generate-brand-assets.mjs
 *
 * It needs `sharp`, which is a devDependency: it rasterises the SVG
 * with the same geometry the browser would use, so the PNG is a
 * faithful render of the design rather than a re-drawing of it.
 */

import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOGO_PATH = path.join(ROOT, 'design-reference', 'logo.svg');
const ASSETS_DIR = path.join(ROOT, 'assets');

/**
 * The brand orange — the fill of the logo's rounded square.
 *
 * It is the same value as the app's `colors.brand.primary`; see
 * `src/theme/tokens.ts`.
 */
const BRAND_ORANGE = '#F1521F';

/**
 * The canvas every brand image is rendered on.
 *
 * 1024 px is the size the Play Store asks for and the size Android's
 * adaptive-icon layers are generated at, so one canvas serves all of
 * them.
 */
const CANVAS = 1024;

/**
 * Where the glyph's ink sits in the logo's own 56 × 56 coordinate
 * space.
 *
 * The glyph is three stroked paths: two circles and the line that
 * joins them. Its ink — the paths plus their 2.5 px stroke — spans
 * x 16.25 → 39.75 and y 15.08 → 40.92, and this is the middle of
 * that box. Anchoring on the INK rather than on the logo's nominal
 * 28 × 28 centre is what keeps the mark optically centred once it
 * is scaled up.
 */
const GLYPH_CENTRE = {x: 28, y: 28};

/**
 * The scale the glyph is drawn at inside a 1024 px canvas.
 *
 * ANDROID'S SAFE ZONE
 *
 * An adaptive icon is a 108 × 108 dp layer whose outer 18 dp on each
 * side may be cropped away, and only the middle 66 dp is guaranteed
 * to survive every mask the launcher might apply. The glyph's own ink
 * has to fit inside that 66 dp circle — not inside the 108 dp square,
 * because a square that fits the square gets its corners cut off by a
 * circular mask.
 *
 * The glyph's ink is 23.5 × 25.84 units in logo space, so its
 * half-diagonal is 17.47 units. The safe circle is 33 dp of a 108 dp
 * canvas, which is 313 px of a 1024 px one. Scaling the glyph by 17
 * puts its half-diagonal at 297 px — inside the circle, with a little
 * room to spare.
 */
const ADAPTIVE_SCALE = 17;

/**
 * The scale the glyph is drawn at for the splash screen.
 *
 * The splash mark is a single image on a plain background, so there
 * is no mask to dodge — only the size to get right. The splash image
 * is drawn into a 100 dp box, and this scale makes the mark fill
 * about 86 % of that box, which reads as a splash mark rather than as
 * a detail on one.
 */
const SPLASH_SCALE = 34;

/**
 * The favicon is the web tab's icon and is drawn at 48 px.
 *
 * It is the same artwork, so it is generated from the same paths
 * rather than being a separate file that can fall out of step.
 */
const FAVICON_SIZE = 48;

/**
 * Pulls the glyph's paths out of the logo.
 *
 * They are taken verbatim — the `d` attributes, the stroke width and
 * the round caps are the design's, not this script's. The only thing
 * that changes between the images below is the colour of the stroke.
 */
function readGlyphPaths(source) {
  const paths = source.match(/<path\b[^>]*\/>/g) ?? [];

  if (paths.length !== 3) {
    throw new Error(
      `Expected the logo to hold 3 glyph paths, found ${paths.length}. ` +
        'The artwork in design-reference/logo.svg has changed — check ' +
        'the geometry notes in this file before regenerating.',
    );
  }

  return paths;
}

/**
 * The glyph on its own, as an SVG.
 *
 * `stroke` is the only thing that differs between the images: white
 * for the foreground and the splash, black for the monochrome layer
 * that the launcher's themed-icon mode tints for itself.
 */
function buildGlyphSvg(stroke, scale, size = CANVAS) {
  const body = readGlyphPaths(LOGO_SOURCE)
    .map(path => path.replace(/stroke="[^"]*"/, `stroke="${stroke}"`))
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">
<g transform="translate(${size / 2} ${size / 2}) scale(${scale}) translate(${-GLYPH_CENTRE.x} ${-GLYPH_CENTRE.y})">
${body}
</g>
</svg>`;
}

/**
 * A solid brand-coloured square.
 *
 * The adaptive icon's background layer is a flat fill: the launcher
 * masks it into whatever shape the device uses, so anything drawn on
 * it would be cropped.
 */
function buildBackground(size = CANVAS) {
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_ORANGE,
    },
  })
    .png()
    .toBuffer();
}

/**
 * Draws the glyph in white on the brand orange.
 *
 * This is the legacy launcher icon: a full-bleed square of orange
 * with the mark on it. It is NOT the rounded square from the logo
 * file — the launcher applies its own shape to a legacy icon, and a
 * rounded square inside it would show transparent corners.
 */
async function writeLegacyIcon() {
  const background = await buildBackground();
  const foreground = await sharp(
    Buffer.from(buildGlyphSvg('#FFFFFF', ADAPTIVE_SCALE)),
  )
    .png()
    .toBuffer();

  await sharp(background)
    .composite([{input: foreground, top: 0, left: 0}])
    .png()
    .toFile(path.join(ASSETS_DIR, 'icon.png'));
}

// ─── Run ──────────────────────────────────────────────────────

const LOGO_SOURCE = await readFile(LOGO_PATH, 'utf8');

/**
 * The legacy launcher icon — orange, with the mark on it.
 */
await writeLegacyIcon();

/**
 * The adaptive icon's background — flat brand orange.
 */
await buildBackground().then(buffer =>
  sharp(buffer).png().toFile(path.join(ASSETS_DIR, 'android-icon-background.png')),
);

/**
 * The adaptive icon's foreground — the mark on transparency.
 */
await sharp(Buffer.from(buildGlyphSvg('#FFFFFF', ADAPTIVE_SCALE)))
  .png()
  .toFile(path.join(ASSETS_DIR, 'android-icon-foreground.png'));

/**
 * The adaptive icon's monochrome layer — the mark in black, for the
 * launcher's themed-icon mode.
 */
await sharp(Buffer.from(buildGlyphSvg('#000000', ADAPTIVE_SCALE)))
  .png()
  .toFile(path.join(ASSETS_DIR, 'android-icon-monochrome.png'));

/**
 * The splash mark — the white glyph on transparency, to sit on the
 * brand-orange splash background.
 */
await sharp(Buffer.from(buildGlyphSvg('#FFFFFF', SPLASH_SCALE)))
  .png()
  .toFile(path.join(ASSETS_DIR, 'splash-icon.png'));

/**
 * The web favicon — the same mark, small.
 */
const faviconBackground = await buildBackground(FAVICON_SIZE);
const faviconForeground = await sharp(
  Buffer.from(
    buildGlyphSvg(
      '#FFFFFF',
      (ADAPTIVE_SCALE * FAVICON_SIZE) / CANVAS,
      FAVICON_SIZE,
    ),
  ),
)
  .png()
  .toBuffer();

await sharp(faviconBackground)
  .composite([{input: faviconForeground, top: 0, left: 0}])
  .png()
  .toFile(path.join(ASSETS_DIR, 'favicon.png'));

console.log('Brand assets regenerated:');
console.log('  assets/icon.png');
console.log('  assets/android-icon-background.png');
console.log('  assets/android-icon-foreground.png');
console.log('  assets/android-icon-monochrome.png');
console.log('  assets/splash-icon.png');
console.log('  assets/favicon.png');
