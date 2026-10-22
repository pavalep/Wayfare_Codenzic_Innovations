import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {STRINGS} from '../../../constants';
import {colors, radius, shadows, spacing} from '../../../theme';
import {AppIcon, type IconName} from '../../core/AppIcon';
import {AppText} from '../../core/AppText';

export interface LocationAction {
  /** The label under the glyph. */
  label: string;
  /** The glyph. */
  icon: IconName;
  /** Called when the action is pressed. */
  onPress: () => void;
  /** Disables the action. */
  disabled?: boolean;
  /** Test hook. */
  testID?: string;
}

/**
 * The pair of inline actions under the location card — "Use current"
 * and "Pick on map".
 *
 * From the Figma frame: two 184 px buttons on a 380 px row with a
 * 12 px gap, 51 px tall, each holding an 18 px glyph and a 14 px
 * label with an 8 px gap between them, the pair centred inside the
 * button.
 */
export interface LocationActionsProps {
  actions: LocationAction[];
}

export const LocationActions: React.FC<LocationActionsProps> = ({actions}) => (
  <View style={styles.row}>
    {actions.map(action => (
      <Pressable
        key={action.label}
        testID={action.testID}
        accessibilityRole="button"
        accessibilityLabel={action.label}
        accessibilityState={{disabled: action.disabled}}
        disabled={action.disabled}
        onPress={action.onPress}
        android_ripple={{color: colors.overlay.rippleOnLight}}
        style={[styles.action, action.disabled ? styles.disabled : null]}>
        <AppIcon
          name={action.icon}
          size={18}
          color={action.disabled ? colors.text.tertiary : colors.text.primary}
        />
        <AppText
          variant="buttonSm"
          tone={action.disabled ? 'tertiary' : 'primary'}>
          {action.label}
        </AppText>
      </Pressable>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  action: {
    flex: 1,
    height: 51,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.background.surface,
    ...shadows.card,
  },
  disabled: {
    opacity: 0.6,
  },
});

export {STRINGS};
