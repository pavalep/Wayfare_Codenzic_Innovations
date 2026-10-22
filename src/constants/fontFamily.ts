// ─── Font family constants ────────────────────────────────────
//
// Single source of truth for every `fontFamily` string.
//
// WHY THE WEIGHT IS ENCODED IN THE FAMILY KEY
//
// The fonts come from `@expo-google-fonts/nunito-sans`, which
// registers each weight under its own family name
// (`NunitoSans_700Bold`, `NunitoSans_800ExtraBold`, …).
//
// Android's font manager resolves `fontFamily` first and then
// applies `fontWeight` as a *bias* on top of the resolved file.
// If you register "Nunito Sans" for four weights AND ask for
// `fontWeight: '700'`, Android can pick the wrong file and render
// a chunky Bold where a SemiBold was asked for.
//
// Naming each weight separately removes the ambiguity: there is
// exactly one file per family string, so the lookup is
// deterministic on both Android and iOS.
//
// RULE: when you use one of these families, do NOT also set
// `fontWeight`. The weight is already in the family name.
//
// ─────────────────────────────────────────────────────────────

export const FONT_FAMILY = {
  nunito: {
    /** Nunito Sans Regular (400). */
    regular: 'NunitoSans_400Regular',
    /** Nunito Sans SemiBold (600). */
    semibold: 'NunitoSans_600SemiBold',
    /** Nunito Sans Bold (700). */
    bold: 'NunitoSans_700Bold',
    /** Nunito Sans ExtraBold (800). */
    extrabold: 'NunitoSans_800ExtraBold',
  },
} as const;

export type FontFamily =
  (typeof FONT_FAMILY.nunito)[keyof typeof FONT_FAMILY.nunito];
