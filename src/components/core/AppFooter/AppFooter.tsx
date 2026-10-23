import React, {type ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {colors, spacing} from '../../../theme';

/**
 * The white bar at the bottom of a screen.
 *
 * Every screen in the Figma that has a bar at the bottom draws it the
 * same way: a white surface, a 1 px hairline across the top, the
 * action inside it, and the bar running all the way to the bottom
 * edge of the screen.
 *
 * WHY THE SAFE-AREA INSET LIVES HERE
 *
 * The bottom of the screen is not always the bottom of the window:
 * on a phone with a gesture bar or a home button, the system reserves
 * the last few millimetres for that bar, and anything drawn under it
 * would be partly unreachable.
 *
 * There are two ways to deal with that inset, and they look
 * different:
 *
 *   • Pad the whole screen by the inset. Then the inset is painted in
 *     the screen's own background colour — the light grey canvas —
 *     and the white footer stops short of the bottom edge, leaving a
 *     grey band under it. On a screen whose last element is a white
 *     bar, that band reads as a mistake: the bar looks like it was
 *     cut off.
 *
 *   • Pad the footer itself. Then the footer's white runs to the
 *     bottom edge of the screen and the inset is empty white space
 *     inside the bar, with the action sitting above it. That is what
 *     the design draws, and it is what this component does.
 *
 * So a screen that ends in an `AppFooter` must NOT ask `AppScreen`
 * for the bottom safe-area edge — the footer owns it. The screen's
 * `edges` stop at `['top']`.
 *
 * THE SPACE BELOW THE BUTTON
 *
 * There is space below the last thing in the bar, and it is two
 * different things stacked on top of each other:
 *
 *   • the design's own bottom padding. The Figma's footers put their
 *     button 28 px above the bottom of the bar, and this uses the
 *     scale's nearest step, 24.
 *
 *   • the device's safe-area inset — the strip at the bottom of the
 *     screen that the gesture bar or the home button lives in. It is
 *     not part of the design; it is the space the system reserves so
 *     that a button is not sitting under the gesture bar.
 *
 * The bar's white runs to the bottom edge of the screen, so the inset
 * reads as white space inside the bar rather than as a grey band
 * under it.
 */
export interface AppFooterProps {
  children: ReactNode;
  /**
   * The design's own bottom padding, before the safe-area inset is
   * added to it. Defaults to the small spacing step.
   */
  bottomPadding?: number;
}

export const AppFooter: React.FC<AppFooterProps> = ({
  children,
  bottomPadding = spacing.xxl,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.footer,
        {paddingBottom: bottomPadding + insets.bottom},
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: colors.background.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    /*
     * The bar is pinned to the bottom of the screen.
     *
     * `marginTop: 'auto'` is what pins it: the screen is a column and
     * the content above the bar takes what it needs, so the free
     * space is pushed in front of the bar and the bar lands on the
     * bottom edge.
     *
     * It matters when something ABOVE the bar changes height — the
     * register screen's form shortens when the keyboard opens, and
     * without this the bar would ride up with it instead of staying
     * where it is.
     */
    marginTop: 'auto',
  },
});
