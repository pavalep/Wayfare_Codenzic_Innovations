import React from 'react';
import {StyleSheet, View} from 'react-native';

import {colors, spacing} from '../../../theme';
import {AppIcon} from '../../core/AppIcon';
import {AppText} from '../../core/AppText';
import type {RouteLeg} from '../../../types';

/**
 * The turn-by-turn list on the route screen.
 *
 * Each row is 67 px tall: a 32 px circular manoeuvre glyph on the
 * left, the instruction and its detail in the middle, and the leg's
 * distance right-aligned. Rows after the first carry a hairline.
 *
 * THE GLYPH IS THE SAME ON EVERY ROW
 *
 * That is not a shortcut — it is what the design does. In the Figma,
 * legs 2, 3 and 4 of the list share the component `EL-a5b41d96`, and
 * leg 1 carries a standalone node whose exported artwork is identical
 * to that component's. There is one arrow in the design, so there is
 * one arrow here.
 *
 * `leg.turn` still records the real-world manoeuvre, because that is
 * what a routing API returns and what the sheet's own summary is
 * built from. It is data, not artwork.
 */
export interface TurnByTurnListProps {
  /** The legs to render, in order. */
  legs: RouteLeg[];
}

export const TurnByTurnList: React.FC<TurnByTurnListProps> = ({legs}) => (
  <View>
    {legs.map((leg, index) => (
      <View
        key={leg.id}
        style={[styles.row, index > 0 ? styles.divider : null]}>
        <AppIcon
          name="turn"
          size={32}
          color={colors.text.primary}
          backgroundColor={colors.background.muted}
        />

        <View style={styles.instruction}>
          <AppText variant="instruction" numberOfLines={1}>
            {leg.instruction}
          </AppText>
          <AppText variant="instructionSub" tone="secondary" numberOfLines={1}>
            {leg.detail}
          </AppText>
        </View>

        <AppText variant="chip" tone="secondary" style={styles.distance}>
          {leg.distance}
        </AppText>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 67,
    paddingVertical: spacing.md,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  instruction: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  distance: {
    textAlign: 'right',
  },
});
