import React from 'react';
import {StyleSheet, View} from 'react-native';

import {STRINGS} from '../../../constants';
import {colors, spacing} from '../../../theme';
import {AppButton} from '../../core/AppButton';

/**
 * The trip's primary action: hand the route to Google Maps.
 *
 * It lives outside the bottom sheet on purpose. The sheet is a
 * snap-point sheet, and its content is laid out against the tallest
 * detent, so anything inside the sheet that is anchored to the bottom
 * of the content ends up below the screen whenever the sheet is
 * resting at a shorter detent. A button that has to be visible at
 * every stop does not belong in there.
 *
 * ─── THE CONTAINER, NOT A FLOATING BUTTON ────────────────────
 *
 * The button is NOT a floating action button, and the Figma is
 * clear about that: in the design the orange bar sits INSIDE the
 * sheet's white, 90 % of the frame's width, with white above it and
 * white below it all the way to the bottom of the screen. It is held
 * by the sheet. It does not hover.
 *
 * Getting that right took three pieces:
 *
 *   1. The sheet has to reach the bottom of the screen. With the
 *      bottom safe-area inset applied to the sheet itself, the
 *      sheet's white stopped short of the bottom edge and the map
 *      showed underneath — and a bar with the map under it reads as
 *      a floating button no matter what it is drawn with.
 *   2. The button needs its own white CONTAINER that runs to the
 *      bottom of the screen, with padding, so the white continues
 *      below the button even where the sheet is not there.
 *   3. The container's top edge is marked with the design's 1 px
 *      `#E6EBEF` hairline — the same hairline the screen header and
 *      the input fields use, and the same one the design's own login
 *      footer uses above its button. That line is what says "this is
 *      a panel with a button in it" rather than "this is a bar".
 *
 * The button inside is the design's own: a 56 px brand-filled
 * rectangle with a 16 px radius and the navigation arrowhead beside
 * the label, inset 20 px from the edges of the screen.
 */
export interface StartNavigationButtonProps {
  /** Called when the button is pressed. */
  onPress: () => void;
  /**
   * The device's bottom safe-area inset.
   *
   * The container is pinned to the bottom of the screen, so it has
   * to clear the gesture bar / home button, which on Android sits
   * over the app's own content.
   */
  bottomInset?: number;
}

export const StartNavigationButton: React.FC<StartNavigationButtonProps> = ({
  onPress,
  bottomInset = 0,
}) => (
  <View
    style={[
      styles.container,
      {paddingBottom: bottomInset + spacing.xxl},
    ]}>
    <AppButton
      label={STRINGS.route.startNavigation}
      icon="navigation"
      onPress={onPress}
      testID="start-navigation"
    />
  </View>
);

const styles = StyleSheet.create({
  /**
   * The white container the button sits in.
   *
   * It runs the full width of the screen and all the way to the
   * bottom edge, so the white under the button is the screen's
   * white and not the map's.
   */
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
});
