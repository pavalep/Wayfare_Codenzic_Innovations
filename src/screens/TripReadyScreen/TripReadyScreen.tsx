import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';

import {STRINGS} from '../../constants';
import {getRouteSummary} from '../../data/route';
import {useTripPlan} from '../../hooks/useTripPlan';
import {useAppRouter} from '../../navigation';
import {colors, radius, shadows, spacing} from '../../theme';
import {AppButton} from '../../components/core/AppButton';
import {AppCard} from '../../components/core/AppCard';
import {AppScreen} from '../../components/core/AppScreen';
import {AppText} from '../../components/core/AppText';
import {LocationCard} from '../../components/layout/LocationCard';
import {ScreenHeader} from '../../components/layout/ScreenHeader';

/**
 * Screen 3 — Trip ready.
 *
 * The confirmation screen: the two ends of the trip, the numbers the
 * route will have, and one action that opens the map.
 *
 * WHY IT NO LONGER CHOOSES THE DROP-OFF
 *
 * The Figma's third frame is the drop-off step — it draws the
 * "Set as drop-off" heading, a search field and an empty-state card.
 * That work now happens on the "Set locations" screen, because the
 * assignment asks for ONE screen where the user selects the starting
 * location AND the destination, and because splitting the two across
 * two screens made the first screen's own subtitle ("Set pickup and
 * drop-off") untrue.
 *
 * So this frame's content becomes what a confirmation screen should
 * hold: the chosen trip, with nothing left to decide.
 *
 * THE NUMBERS
 *
 * The summary is the design's own — "24 min", "9.6 km",
 * "arrive 10:42" are transcribed from the Figma's route view, and
 * the type styles are the ones the route sheet uses. Nothing here is
 * invented; the summary card is the route sheet's header block,
 * repeated where the trip is confirmed.
 */
const TripReadyScreen: React.FC = () => {
  const {goBack, goToRouteView} = useAppRouter();
  const {pickup, dropoff, mode, clearPickup, clearDropoff} = useTripPlan();

  const summary = getRouteSummary(mode);

  return (
    <AppScreen edges={['top', 'bottom']}>
      <ScreenHeader
        title={STRINGS.tripReady.title}
        subtitle={STRINGS.tripReady.step}
        onBack={goBack}
      />

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}>
        <LocationCard
          pickupLabel={STRINGS.locations.pickupLabel}
          pickupValue={
            pickup ? pickup.name : STRINGS.locations.pickupPlaceholder
          }
          pickupValueTone={pickup ? 'secondary' : 'placeholder'}
          dropoffLabel={STRINGS.locations.dropoffLabel}
          dropoffValue={
            dropoff ? dropoff.name : STRINGS.locations.dropoffPlaceholder
          }
          dropoffValueTone={dropoff ? 'secondary' : 'placeholder'}
          onClearPickup={pickup ? clearPickup : undefined}
          onClearDropoff={dropoff ? clearDropoff : undefined}
        />

        <AppText variant="eyebrowLarge" tone="tertiary" style={styles.sectionLabel}>
          {STRINGS.tripReady.yourTrip}
        </AppText>

        {/*
          The summary card. Its layout is the route sheet's header
          block: the "Fastest route" eyebrow over the big duration on
          the left, and the distance and arrival time on the right.
        */}
        <AppCard radius="xl" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <AppText variant="eyebrowLarge" tone="tertiary">
                {STRINGS.tripReady.fastestRoute}
              </AppText>
              <AppText variant="metric" style={styles.duration}>
                {summary.duration}
              </AppText>
            </View>

            <View style={styles.summaryRight}>
              <AppText variant="meta" tone="secondary">
                {summary.distance}
              </AppText>
              <AppText variant="meta" tone="tertiary">
                {summary.arrival}
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* ── The two ends of the trip, as a journey ── */}
        <AppCard radius="xl" style={styles.journeyCard}>
          <AppText variant="caption" tone="tertiary">
            {STRINGS.locations.pickupLabel}
          </AppText>
          <AppText variant="label" numberOfLines={1}>
            {pickup ? pickup.name : STRINGS.locations.pickupPlaceholder}
          </AppText>
          <AppText variant="caption" tone="tertiary" style={styles.journeyGap}>
            {STRINGS.locations.dropoffLabel}
          </AppText>
          <AppText variant="label" numberOfLines={1}>
            {dropoff ? dropoff.name : STRINGS.locations.dropoffPlaceholder}
          </AppText>
        </AppCard>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          label={STRINGS.tripReady.showRoute}
          onPress={goToRouteView}
          testID="trip-ready-next"
        />
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sectionLabel: {
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  summaryCard: {
    padding: spacing.lg,
    ...shadows.card,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  summaryLeft: {
    flex: 1,
  },
  duration: {
    marginTop: spacing.xs,
  },
  summaryRight: {
    alignItems: 'flex-end',
    paddingBottom: spacing.xs,
  },
  journeyCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
    ...shadows.card,
    borderRadius: radius.lg,
  },
  journeyGap: {
    marginTop: spacing.md,
  },
  footer: {
    backgroundColor: colors.background.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});

export default TripReadyScreen;
