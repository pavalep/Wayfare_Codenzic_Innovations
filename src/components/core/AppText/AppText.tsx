import React from 'react';
import {Text, type TextProps, type TextStyle} from 'react-native';

import {
  toneColors,
  typographyVariants,
  type TextTone,
  type TypographyVariant,
} from '../../../theme';

/**
 * The only text primitive in the app.
 *
 * A screen never writes `<Text style={{fontSize: 15, ...}}>`. It
 * writes `<AppText variant="label" tone="primary">`, and the variant
 * resolves to the exact font file, size, line height and tracking
 * that the Figma text node specifies.
 *
 * Keeping every string in one component is what makes the type
 * scale enforceable: a new style has to be added to
 * `theme/typographyStyles.ts` first, and the ESLint colour ban makes
 * sure it is built from tokens.
 */
export interface AppTextProps extends TextProps {
  /** Which type style to use. Defaults to `body`. */
  variant?: TypographyVariant;
  /** Which semantic colour to use. Defaults to `primary`. */
  tone?: TextTone;
  /** Horizontal alignment. Overrides the variant's own alignment. */
  align?: TextStyle['textAlign'];
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  tone = 'primary',
  align,
  style,
  ...rest
}) => (
  <Text
    {...rest}
    style={[
      typographyVariants[variant],
      {color: toneColors[tone]},
      align ? {textAlign: align} : undefined,
      style,
    ]}
  />
);


