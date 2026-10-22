import React, {useCallback} from 'react';
import {Pressable, StyleSheet, View, type ViewStyle} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {colors, radius, shadows, spacing} from '../../../theme';
import {AppIcon, type IconName} from '../AppIcon';
import {AppText} from '../AppText';

/**
 * The app's button.
 *
 * Two variants and two sizes, and nothing else:
 *
 *   primary + lg   — the screen's main call to action. 56 px tall,
 *                    brand fill, 16 px radius, ExtraBold 17 px
 *                    label. This is "Log in", "Next", "Start
 *                    navigation".
 *   secondary + md  — an inline action. 51 px tall, white surface,
 *                    1 px hairline, 14 px label. This is "Use
 *                    current" and "Pick on map".
 *
 * The icon/label pair is laid out as one centred group with an 8 px
 * gap, which is how the Figma positions them (the group's left edge
 * is centred inside the button, not left-aligned).
 */
export interface AppButtonProps {
  /** The label. */
  label: string;
  /** Called on press. */
  onPress: () => void;
  /** Visual variant. Defaults to `primary`. */
  variant?: 'primary' | 'secondary';
  /** Size preset. Defaults to `lg`. */
  size?: 'lg' | 'md';
  /** Renders the button in its disabled state and blocks presses. */
  disabled?: boolean;
  /** Optional leading glyph. */
  icon?: IconName;
  /** Overrides the accessibility label when the visible label is not descriptive enough. */
  accessibilityLabel?: string;
  /** Test hook. */
  testID?: string;
  /** Optional style override for the outer pressable. */
  style?: ViewStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  icon,
  accessibilityLabel,
  testID,
  style,
}) => {
  // A press scales the button down a hair. The spring is short and
  // slightly bouncy so the press feels physical rather than linear.
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: withSpring(1 - pressed.value * 0.03, {damping: 18, stiffness: 320})}],
  }));

  const handlePressIn = useCallback(() => {
    // A Reanimated shared value is mutable BY DESIGN. `.value` is the
    // documented write API and it lands on the UI thread, so the
    // press animation never crosses the bridge. The React Compiler's
    // immutability rule cannot tell a shared value apart from a value
    // it must freeze.
    // eslint-disable-next-line react-hooks/immutability
    pressed.value = 1;
  }, [pressed]);

  const handlePressOut = useCallback(() => {
    // eslint-disable-next-line react-hooks/immutability
    pressed.value = 0;
  }, [pressed]);

  const isPrimary = variant === 'primary';
  const isLarge = size === 'lg';

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{disabled}}
        disabled={disabled}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={
          disabled
            ? undefined
            : {
                color: isPrimary
                  ? colors.overlay.rippleOnBrand
                  : colors.overlay.rippleOnLight,
              }
        }
        style={[
          styles.base,
          isLarge ? styles.lg : styles.md,
          isPrimary ? styles.primary : styles.secondary,
          disabled ? (isPrimary ? styles.primaryDisabled : styles.secondaryDisabled) : null,
        ]}>
        <View style={styles.content}>
          {icon ? (
            <AppIcon
              name={icon}
              size={isLarge ? 20 : 18}
              color={
                disabled
                  ? colors.text.tertiary
                  : isPrimary
                    ? colors.text.onBrand
                    : colors.text.primary
              }
              backgroundColor="transparent"
            />
          ) : null}
          <AppText
            variant={isLarge ? 'button' : 'buttonSm'}
            tone={
              disabled
                ? 'tertiary'
                : isPrimary
                  ? 'onBrand'
                  : 'primary'
            }>
            {label}
          </AppText>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  lg: {
    height: 56,
  },
  md: {
    height: 51,
  },
  primary: {
    backgroundColor: colors.brand.primary,
  },
  secondary: {
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    ...shadows.card,
  },
  primaryDisabled: {
    backgroundColor: colors.border.subtle,
  },
  secondaryDisabled: {
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
