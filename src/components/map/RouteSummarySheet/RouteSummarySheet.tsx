import React from 'react';
import {ScrollView, StyleSheet, View, type ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {colors, radius, shadows, spacing} from '../../../theme';
import {STRINGS} from '../../../constants';
import {AppButton} from '../../core/AppButton';
import {AppText} from '../../core/AppText';
import {ModeTabs} from '../../layout/ModeTabs';
import {TurnByTurnList} from '../../layout/TurnByTurnList';
import type {Place, RouteSummary, TravelMode} from '../../../types';

/**
 * The route summary sheet that slides up over the map.
 *
 * Everything in here comes from the Figma "Route view" frame:
 *
 *   • a grab handle
 *   • "Fastest route" over the big duration, with the distance and
 *     the arrival time right-aligned on the same line
 *   • the Drive / Ride / Walk tabs
 *   • a muted card that repeats the two ends of the trip on a rail,
 *     the same rail the location card uses
 *   • the "Turn by turn" list
 *   • the "Start navigation" button, pinned to the bottom
 *
 * The sheet is taller than the space it occupies on the design
 * frame, so its content scrolls — the same way a real bottom sheet
 * behaves.
 */
export interface RouteSummarySheetProps {
  /** The headline numbers for the active travel mode. */
  summary: RouteSummary;
  /** The travel modes offered by the tabs. */
  modes: {key: TravelMode; label: string}[];
  /** The active travel mode. */
  mode: TravelMode;
  /** Called when a mode tab is pressed. */
  onModeChange: (mode: TravelMode) => void;
  /** The trip's origin. */
  pickup: Place | null;
  /** The trip's destination. */
  dropoff: Place | null;
  /** Called when "Start navigation" is pressed. */
  onStartNavigation: () => void;
  /** Style for the sheet container. */
  style?: ViewStyle;
}

export const RouteSummarySheet: React.FC<RouteSummarySheetProps> = ({
  summary,
  modes,
  mode,
  onModeChange,
  pickup,
  dropoff,
  onStartNavigation,
  style,
}) => {
  const insets = useSafeAreaInsets();

  return (
  <View style={[styles.sheet, style]}>
    <View style={styles.handle} />

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}>
      {/* ── Duration + distance ── */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryLeft}>
          <AppText variant="eyebrowLarge" tone="tertiary">
            {STRINGS.route.fastestRoute}
          </AppText>
          <AppText variant="metric">{summary.duration}</AppText>
        </View>

        <View style={styles.summaryRight}>
          <AppText variant="meta" tone="secondary">
            {summary.distance}
          </AppText>
          <AppText variant="meta" tone="tertiary" style={styles.separator}>
            ·
          </AppText>
          <AppText variant="meta" tone="secondary">
            arrive
          </AppText>
          <AppText variant="meta" tone="tertiary" style={styles.arrival}>
            {summary.arrival.replace('arrive ', '')}
          </AppText>
        </View>
      </View>

      {/* ── Mode tabs ── */}
      <View style={styles.tabs}>
        <ModeTabs modes={modes} active={mode} onChange={onModeChange} />
      </View>

      {/* ── The two ends of the trip ── */}
      <View style={styles.endpointsCard}>
        <View style={styles.endpointsRail} pointerEvents="none">
          <View style={styles.endpointsDotOrigin} />
          <View style={styles.endpointsConnector} />
          <View style={styles.endpointsDotDestination} />
        </View>

        <View style={styles.endpointsText}>
          <AppText variant="label" numberOfLines={1}>
            {pickup ? `${pickup.name} · ${pickup.address.split(',')[0]}` : 'Pickup'}
          </AppText>
          <AppText variant="label" numberOfLines={1}>
            {dropoff
              ? `${dropoff.name} · ${dropoff.address.split(',')[0]}`
              : 'Drop-off'}
          </AppText>
        </View>
      </View>

      {/* ── Turn by turn ── */}
      <View style={styles.turnByTurn}>
        <AppText variant="eyebrowLarge" tone="tertiary">
          {STRINGS.route.turnByTurn}
        </AppText>
        <View style={styles.turnByTurnList}>
          <TurnByTurnList legs={summary.legs} />
        </View>
      </View>
    </ScrollView>

    {/* ── Primary action, pinned to the bottom of the sheet ── */}
    <View style={[styles.footer, {paddingBottom: spacing.xl + insets.bottom}]}>
      <StartNavigationButton onPress={onStartNavigation} />
    </View>
  </View>
  );
};

// ─── Local helper ───────────────────────────────────────────
// Kept local so the sheet owns the only "Start navigation" button
// in the app and the icon/label pair stays in one place.

const StartNavigationButton: React.FC<{onPress: () => void}> = ({onPress}) => (
  <AppButton
    label={STRINGS.route.startNavigation}
    icon="navigation"
    onPress={onPress}
    testID="start-navigation"
  />
);

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    ...shadows.sheet,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border.subtle,
    marginTop: spacing.md,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 26,
  },
  separator: {
    marginHorizontal: spacing.xs,
  },
  arrival: {
    marginLeft: spacing.xs,
  },
  tabs: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  endpointsCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.background.canvas,
  },
  endpointsRail: {
    width: 10,
    alignItems: 'center',
  },
  endpointsDotOrigin: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.brand.primary,
    marginTop: 6,
  },
  endpointsConnector: {
    width: 2,
    height: 21,
    marginTop: 4,
    backgroundColor: colors.overlay.dashedConnector,
  },
  endpointsDotDestination: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.marker.destination,
    marginTop: 4,
  },
  endpointsText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  turnByTurn: {
    marginTop: spacing.xxl,
  },
  turnByTurnList: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
