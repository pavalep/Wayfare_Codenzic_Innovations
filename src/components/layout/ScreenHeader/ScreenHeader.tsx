import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {colors, spacing} from '../../../theme';
import {AppIcon} from '../../core/AppIcon';
import {AppText} from '../../core/AppText';

/**
 * The header used by the two location screens.
 *
 * From the Figma source:
 *
 *   • 88 px tall, white surface, 1 px `#E6EBEF` bottom hairline
 *   • a 40 px back button whose 18 px chevron sits 16 px from the
 *     left edge of the screen
 *   • the title block starts 8 px after the back button and holds an
 *     ExtraBold 26 px title with a Regular 15 px subtitle under it
 */
export interface ScreenHeaderProps {
  /** Screen title — "Where are you going?". */
  title: string;
  /** Subtitle under the title — "Step 1 of 2 · Set pickup and drop-off". */
  subtitle?: string;
  /** Called when the back button is pressed. Omit to hide the button. */
  onBack?: () => void;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBack,
}) => (
  <View style={styles.header}>
    <View style={styles.row}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          hitSlop={8}
          style={styles.backButton}>
          <AppIcon name="back" size={18} color={colors.text.primary} />
        </Pressable>
      ) : null}

      <View style={styles.titles}>
        <AppText variant="title">{title}</AppText>
        {subtitle ? (
          <AppText variant="bodySm" tone="secondary">
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    paddingTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    minHeight: 71,
  },
  backButton: {
    width: 40,
    height: 40,
    marginLeft: -8,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: {
    flex: 1,
    marginLeft: spacing.sm,
  },
});
