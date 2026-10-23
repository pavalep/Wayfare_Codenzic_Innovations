import React, {type ReactNode} from 'react';
import {StyleSheet, View, type ViewStyle} from 'react-native';
import {SafeAreaView, type Edge} from 'react-native-safe-area-context';

import {colors} from '../../../theme';

/**
 * The screen shell.
 *
 * Every screen renders inside one of these so the canvas colour, the
 * safe-area handling and the background are decided once instead of
 * per screen.
 *
 * `edges` defaults to `['top']` because the Figma frames draw their
 * own status bar at the top of the frame and their content — the
 * header, the footer bar — fills the rest. The bottom inset is
 * handled by the footer component, which is where the design puts a
 * safe-area padding: the footer's own white runs to the bottom edge
 * of the screen, so the inset reads as white space inside the bar
 * rather than as a grey band under it.
 *
 * A screen that owns a text field and needs to make room for the
 * soft keyboard wraps its own content in a `KeyboardAvoidingView` —
 * it does not ask the shell for it, because the shell cannot know
 * whether the keyboard should move the content or only part of it.
 */
export interface AppScreenProps {
  children: ReactNode;
  /** Which safe-area edges to inset. Defaults to `['top']`. */
  edges?: Edge[];
  /** Optional style for the inner container. */
  contentStyle?: ViewStyle;
}

export const AppScreen: React.FC<AppScreenProps> = ({
  children,
  edges = ['top'],
  contentStyle,
}) => (
  <SafeAreaView edges={edges} style={styles.safeArea}>
    <View style={[styles.content, contentStyle]}>{children}</View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.canvas,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background.canvas,
  },
});
