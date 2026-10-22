// ─── Theme barrel ─────────────────────────────────────────────
//
// The single import path for design tokens.
//
//   import {colors, spacing, typographyVariants} from '../theme';
//
// `useTheme()` is the accessor components use. It returns the token
// set today; it exists as a function (rather than components
// importing `tokens` directly) so that introducing a theme switch
// later — light/dark, or a per-tenant palette — is a change to this
// one file instead of a change to every component.

import {tokens} from './tokens';

export * from './tokens';
export * from './typographyStyles';

export type ThemeTokens = typeof tokens;

/**
 * Returns the active design tokens.
 *
 * The Wayfare design ships as a single light theme, so this is
 * currently a constant — see `md/SPECIFICATION.md` §"Theming" for
 * why dark mode was deliberately left out of scope.
 */
export function useTheme(): ThemeTokens {
  return tokens;
}
