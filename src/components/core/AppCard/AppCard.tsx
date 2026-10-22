import React from 'react';
import {StyleSheet, View, type ViewProps, type ViewStyle} from 'react-native';

import {colors, radius, shadows, spacing} from '../../../theme';

/**
 * A surface panel — the white rounded card the design uses for the
 * location picker, the saved-places list, the route summary and the
 * trip-ready empty state.
 *
 * The Figma card is always: white fill, 1 px `#E6EBEF` stroke, a
 * 1 px drop shadow and a 24 px (or 16 px) radius. Those four
 * properties are the whole component, which is why it takes a
 * `radius` prop rather than a `variant` enum.
 */
export interface AppCardProps extends ViewProps {
  /** Corner radius. Defaults to `xl` (24) — the design's card radius. */
  radius?: keyof typeof radius;
  /** Remove the hairline border. */
  borderless?: boolean;
  /** Remove the drop shadow. */
  flat?: boolean;
  /** Inner padding. Defaults to `xl` (20). Pass `0` for no padding. */
  padding?: keyof typeof spacing | 0;
  /** Override the background colour. */
  backgroundColor?: string;
  /** Optional style override. */
  style?: ViewStyle | ViewStyle[];
}

export const AppCard: React.FC<AppCardProps> = ({
  radius: radiusKey = 'xl',
  borderless = false,
  flat = false,
  padding = 'xl',
  backgroundColor = colors.background.surface,
  style,
  ...rest
}) => (
  <View
    {...rest}
    style={[
      styles.base,
      {
        backgroundColor,
        borderRadius: radius[radiusKey],
        padding: padding === 0 ? 0 : spacing[padding],
      },      borderless ? null : styles.bordered,
      flat ? null : shadows.card,
      style,
    ]}
  />
);

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  bordered: {
    borderColor: colors.border.subtle,
  },
});

export default AppCard;
