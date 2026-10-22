import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {colors, radius, spacing} from '../../../theme';
import {AppText} from '../../core/AppText';
import type {TravelMode} from '../../../types';

/**
 * The travel-mode tabs on the route screen.
 *
 * From the Figma source: three 121 px pills on a 380 px row with an
 * 8 px gap between them, 43 px tall and 16 px rounded. The selected
 * pill is filled with the brand tint and outlined in the brand
 * colour; the others are a plain white surface with a hairline.
 */
export interface ModeTabsProps {
  /** The modes to show, in tab order. */
  modes: {key: TravelMode; label: string}[];
  /** The currently selected mode. */
  active: TravelMode;
  /** Called when a tab is pressed. */
  onChange: (mode: TravelMode) => void;
}

export const ModeTabs: React.FC<ModeTabsProps> = ({modes, active, onChange}) => (
  <View style={styles.row}>
    {modes.map(mode => {
      const selected = mode.key === active;
      return (
        <Pressable
          key={mode.key}
          testID={`mode-tab-${mode.key}`}
          accessibilityRole="tab"
          accessibilityState={{selected}}
          onPress={() => onChange(mode.key)}
          android_ripple={{color: colors.overlay.rippleOnLight}}
          style={[styles.tab, selected ? styles.tabSelected : styles.tabIdle]}>
          <AppText variant="buttonSm" tone={selected ? 'brandDeep' : 'primary'}>
            {mode.label}
          </AppText>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  tabSelected: {
    backgroundColor: colors.brand.tint,
    borderColor: colors.brand.primary,
  },
  tabIdle: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
  },
});
