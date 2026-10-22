import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {colors, spacing} from '../../../theme';
import {AppIcon} from '../../core/AppIcon';
import {AppText} from '../../core/AppText';
import type {Place} from '../../../types';

/**
 * One row of the saved-places list.
 *
 * Geometry from the Figma source: a 40 px circular icon 16 px from
 * the left edge and 16 px from the top, with the title and the
 * address starting 70 px in. Rows after the first carry a 1 px
 * hairline on top.
 */
export interface PlaceListItemProps {
  /** The place to render. */
  place: Place;
  /** Called when the row is pressed. */
  onPress: (place: Place) => void;
  /** Draws the hairline above the row. */
  showDivider?: boolean;
  /** Test hook. */
  testID?: string;
}

/**
 * The Figma list uses two different place glyphs: a building mark for
 * the first two rows and a clock mark for the rest. This mirrors that
 * split so the list reads the same as the design.
 */
function glyphFor(place: Place): 'place' | 'placeClock' {
  return place.icon === 'home' || place.icon === 'office' || place.icon === 'target'
    ? 'place'
    : 'placeClock';
}

export const PlaceListItem: React.FC<PlaceListItemProps> = ({
  place,
  onPress,
  showDivider = false,
  testID,
}) => (
  <Pressable
    testID={testID}
    accessibilityRole="button"
    accessibilityLabel={`${place.name}, ${place.address}`}
    onPress={() => onPress(place)}
    android_ripple={{color: colors.overlay.rippleOnLight}}
    style={[styles.row, showDivider ? styles.divider : null]}>
    <AppIcon
      name={glyphFor(place)}
      size={40}
      color={colors.text.primary}
      backgroundColor={colors.background.muted}
    />

    <View style={styles.text}>
      <AppText variant="label" numberOfLines={1}>
        {place.name}
      </AppText>
      <AppText variant="caption" tone="secondary" numberOfLines={1}>
        {place.address}
      </AppText>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingVertical: spacing.sm,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  text: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
