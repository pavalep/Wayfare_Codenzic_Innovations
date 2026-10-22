import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {colors, radius, shadows, spacing} from '../../../theme';
import type {TextTone} from '../../../theme';
import {AppIcon} from '../../core/AppIcon';
import {AppText} from '../../core/AppText';

/**
 * The pickup / drop-off card.
 *
 * The Figma node is called "Background" and holds three things:
 *
 *   1. A vertical rail on the left — an orange dot at the top, a
 *      2 px hairline running down between the two dots, and a square
 *      black dot at the bottom. The dots are 10 px and sit on the
 *      card's 17 px inner padding.
 *   2. Two stacked fields, each an eyebrow ("Pickup" / "Drop-off")
 *      over a value ("Choose a starting point"), separated by a
 *      1 px hairline.
 *   3. A 40 px rounded-square button floating on the right.
 *
 * The two fields are `active` one at a time — the active eyebrow
 * takes the brand colour, the inactive one takes the muted colour.
 * That is how the "Set locations" and "Trip ready" screens differ.
 *
 * THE TWO INTERACTIVE ADDITIONS
 *
 * The Figma draws the card as a static summary, but the assignment
 * asks for a screen where the user can choose BOTH the start and the
 * destination. Two things make that work, and both are here rather
 * than in the screen so the card stays the single place that knows
 * about its own layout:
 *
 *   • Each field row is pressable on the screen that is choosing an
 *     end of the trip. Tapping a row makes that end the one the list
 *     below is choosing. The active row is the one with the
 *     brand-coloured eyebrow, so the affordance is the colour the
 *     design already established. Where there is nothing to choose
 *     — the confirmation screen — the rows are plain text and are
 *     NOT reported to the screen reader as buttons, because a
 *     disabled button is still announced as a button.
 *
 *   • The rounded-square button on the right swaps the two ends of
 *     the trip. The glyph the design ships for that button is a pair
 *     of opposed arrows (`icon-current-location.svg` in the exported
 *     assets), so it is a swap control; "use the current location"
 *     is the separate action in the row below the card, which carries
 *     the crosshair glyph.
 *
 * THE VALUE COLOUR
 *
 * A field's value is a PLACEHOLDER ("Choose a destination") until
 * something is chosen, and a real place name afterwards. The design
 * gives placeholders a lighter grey than real values, so the colour
 * follows whether the value is a placeholder — not whether the row
 * happens to be the active one. The screens pass that in explicitly.
 */
export interface LocationCardProps {
  /** Eyebrow for the first field — "Pickup". */
  pickupLabel: string;
  /** Value for the first field. */
  pickupValue: string;
  /** Colour for the first field's value. */
  pickupValueTone?: TextTone;
  /** Eyebrow for the second field — "Drop-off". */
  dropoffLabel: string;
  /** Value for the second field. */
  dropoffValue: string;
  /** Colour for the second field's value. */
  dropoffValueTone?: TextTone;
  /** Whether the first field is the one being edited. */
  pickupActive?: boolean;
  /** Whether the second field is the one being edited. */
  dropoffActive?: boolean;
  /** Shows the clear (×) control on the first field. */
  onClearPickup?: () => void;
  /** Shows the clear (×) control on the second field. */
  onClearDropoff?: () => void;
  /** Called when the first field is tapped — selects it for editing. */
  onPressPickup?: () => void;
  /** Called when the second field is tapped — selects it for editing. */
  onPressDropoff?: () => void;
  /** Called when the swap control is pressed. */
  onSwap?: () => void;
  /** Accessibility label for the swap control. */
  swapAccessibilityLabel?: string;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  pickupLabel,
  pickupValue,
  pickupValueTone = 'secondary',
  dropoffLabel,
  dropoffValue,
  dropoffValueTone = 'secondary',
  pickupActive = false,
  dropoffActive = false,
  onClearPickup,
  onClearDropoff,
  onPressPickup,
  onPressDropoff,
  onSwap,
  swapAccessibilityLabel = 'Swap pickup and drop-off',
}) => (
  <View style={styles.card}>
    {/* ── Rail: origin dot → hairline → destination dot ── */}
    <View style={styles.rail} pointerEvents="none">
      <View style={styles.railTop}>
        <View style={styles.dotOrigin} />
        <View style={styles.connector} />
        <View style={styles.dotDestination} />
      </View>
    </View>

    {/* ── The two fields ── */}
    <View style={styles.fields}>
      <Field
        label={pickupLabel}
        value={pickupValue}
        valueTone={pickupValueTone}
        active={pickupActive}
        onPress={onPressPickup}
        onClear={onClearPickup}
        clearAccessibilityLabel="Clear pickup"
      />

      <View style={styles.divider} />

      <Field
        label={dropoffLabel}
        value={dropoffValue}
        valueTone={dropoffValueTone}
        active={dropoffActive}
        onPress={onPressDropoff}
        onClear={onClearDropoff}
        clearAccessibilityLabel="Clear drop-off"
      />
    </View>

    {/* ── Swap control ── */}
    {onSwap ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={swapAccessibilityLabel}
        onPress={onSwap}
        hitSlop={8}
        style={styles.swap}>
        <AppIcon
          name="currentLocation"
          size={40}
          color={colors.text.primary}
          backgroundColor={colors.background.muted}
        />
      </Pressable>
    ) : null}
  </View>
);

// ─── One field of the card ───────────────────────────────────

interface FieldProps {
  label: string;
  value: string;
  valueTone: TextTone;
  active: boolean;
  onPress?: () => void;
  onClear?: () => void;
  clearAccessibilityLabel: string;
}

/**
 * One eyebrow-over-value row.
 *
 * When there is no `onPress` the row renders as plain text rather
 * than as a disabled button — a screen reader should not announce a
 * control that does nothing.
 */
const Field: React.FC<FieldProps> = ({
  label,
  value,
  valueTone,
  active,
  onPress,
  onClear,
  clearAccessibilityLabel,
}) => {
  const eyebrow = (
    <AppText variant="eyebrow" tone={active ? 'brand' : 'tertiary'}>
      {label}
    </AppText>
  );

  const fieldValue = (
    <AppText variant="label" tone={valueTone} numberOfLines={1}>
      {value}
    </AppText>
  );

  return (
    <View style={styles.field}>
      <View style={styles.eyebrowRow}>
        {onPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit ${label}`}
            onPress={onPress}
            style={styles.eyebrowTarget}>
            {eyebrow}
          </Pressable>
        ) : (
          eyebrow
        )}

        {onClear ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={clearAccessibilityLabel}
            onPress={onClear}
            hitSlop={8}
            style={styles.clear}>
            <AppIcon name="close" size={28} color={colors.text.secondary} />
          </Pressable>
        ) : null}
      </View>

      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Edit ${label}`}
          onPress={onPress}>
          {fieldValue}
        </Pressable>
      ) : (
        fieldValue
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    ...shadows.card,
  },
  rail: {
    width: 10,
    marginLeft: spacing.lg,
  },
  railTop: {
    alignItems: 'center',
  },
  dotOrigin: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.brand.primary,
    marginTop: 5,
  },
  connector: {
    width: 2,
    height: 103,
    marginTop: 4,
    backgroundColor: colors.border.subtle,
  },
  dotDestination: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.marker.destination,
    marginTop: 11,
  },
  fields: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: 72,
  },
  field: {
    paddingTop: 5,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 19,
  },
  eyebrowTarget: {
    flex: 1,
  },
  clear: {
    marginTop: -5,
    marginRight: -4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.subtle,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  swap: {
    position: 'absolute',
    right: spacing.xl,
    top: 39,
  },
});
