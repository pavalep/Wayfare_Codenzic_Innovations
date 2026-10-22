import React from 'react';
import {Pressable, StyleSheet, TextInput, View, type TextInputProps} from 'react-native';

import {
  colors,
  radius,
  shadows,
  spacing,
  input as inputText,
} from '../../../theme';
import {AppIcon, type IconName} from '../AppIcon';
import {AppText} from '../AppText';

/**
 * The app's text field.
 *
 * Geometry comes straight from the Figma login screen:
 *
 *   • 54 px tall, 16 px corner radius
 *   • white surface, 1 px `#E6EBEF` stroke, 1 px drop shadow
 *   • a 18 px leading glyph sits 16 px from the left edge, so the
 *     text starts 44 px in
 *   • the label sits ABOVE the field, not inside it, and the gap
 *     between the label baseline and the field top is 16 px
 *
 * The trailing slot (the show/hide-password toggle) is a 40 px
 * touch target that ends 8 px from the field's right edge.
 */
export interface AppTextInputProps extends Omit<TextInputProps, 'style'> {
  /** Label rendered above the field. */
  label?: string;
  /** Validation message rendered below the field. */
  error?: string;
  /** 18 px glyph rendered inside the field on the left. */
  leadingIcon?: IconName;
  /** 40 px glyph rendered inside the field on the right. */
  trailingIcon?: IconName;
  /** Called when the trailing glyph is pressed. */
  onPressTrailingIcon?: () => void;
  /** Accessibility label for the trailing control. */
  trailingAccessibilityLabel?: string;
  /** Test hook. */
  testID?: string;
}

export const AppTextInput: React.FC<AppTextInputProps> = ({
  label,
  error,
  leadingIcon,
  trailingIcon,
  onPressTrailingIcon,
  trailingAccessibilityLabel,
  testID,
  onFocus,
  onBlur,
  ...rest
}) => (
  <View>
    {label ? (
      <AppText variant="label" style={styles.label}>
        {label}
      </AppText>
    ) : null}

    <View
      style={[
        styles.field,
        // A field without a trailing control keeps the design's 16 px
        // right padding; one with a trailing control uses 8 px so the
        // 40 px toggle ends 8 px from the edge.
        trailingIcon ? styles.fieldWithTrailing : styles.fieldWithoutTrailing,
        error ? styles.fieldError : null,
      ]}>
      {leadingIcon ? (
        <View style={styles.leading}>
          <AppIcon name={leadingIcon} color={colors.text.tertiary} />
        </View>
      ) : null}

      <TextInput
        {...rest}
        testID={testID}
        onFocus={onFocus}
        onBlur={onBlur}
        accessibilityLabel={rest.accessibilityLabel ?? label}
        placeholderTextColor={colors.text.placeholder}
        style={styles.input}
      />

      {trailingIcon ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={trailingAccessibilityLabel}
          onPress={onPressTrailingIcon}
          hitSlop={8}
          style={styles.trailing}>
          <AppIcon name={trailingIcon} color={colors.text.secondary} />
        </Pressable>
      ) : null}
    </View>

    {error ? (
      <AppText variant="caption" tone="brandDeep" style={styles.error}>
        {error}
      </AppText>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.md,
  },
  field: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingLeft: spacing.lg,
    ...shadows.card,
  },
  fieldWithoutTrailing: {
    paddingRight: spacing.lg,
  },
  fieldWithTrailing: {
    paddingRight: spacing.sm,
  },
  fieldError: {
    borderColor: colors.text.brandDeep,
  },
  leading: {
    marginRight: spacing.md,
  },
  trailing: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    ...inputText,
    color: colors.text.primary,
  },
  error: {
    marginTop: spacing.xs,
  },
});
