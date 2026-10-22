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
 * safe-area padding.
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
