import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';

import {STRINGS} from '../../constants';
import {getRouteSummary} from '../../data/route';
import {useTripPlan} from '../../hooks/useTripPlan';
import {useAppRouter} from '../../navigation';
import {shadows, spacing} from '../../theme';
import {AppFooter} from '../../components/core/AppFooter';
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
 *
 * ONE PLACE FOR THE TWO ENDS OF THE TRIP
 *
 * An earlier version of this screen repeated the pickup and the
 * drop-off in a second card under the summary, which put the same two
 * names on screen twice — once in the location card at the top and
 * once again at the bottom. That is noise, not information: the top
 * card already carries both ends, and a confirmation screen does not
 * need a second, plainer restatement of what it just showed.
 *
 * So the location card is the only place the two ends appear here,
 * and it is read-only: no clear (×) on either end, no swap control,
 * and neither row is pressable. The trip was chosen on the screen
 * before this one; this screen confirms it, and offering to undo it
 * mid-confirmation would only invite a second trip to be set up.
 */
const TripReadyScreen: React.FC = () => {
  const {goBack, goToRouteView} = useAppRouter();
  const {pickup, dropoff, mode} = useTripPlan();

  const summary = getRouteSummary(mode);

  return (
    <AppScreen edges={['top']}>
      <ScreenHeader
        title={STRINGS.tripReady.title}
        subtitle={STRINGS.tripReady.step}
        onBack={goBack}
      />

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}>
        {/*
          The two ends of the trip, as the card shows them.

          This is a CONFIRMATION screen, so the card is read-only here:
          no clear (×) on either end and no swap control, and neither
          row is pressable. The trip was chosen on the screen before
          this one, and offering to undo it here would only invite a
          second trip to be set up mid-confirmation.
        */}
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
      </ScrollView>

      <AppFooter>
        <AppButton
          label={STRINGS.tripReady.showRoute}
          onPress={goToRouteView}
          testID="trip-ready-next"
        />
      </AppFooter>
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
});

export default TripReadyScreen;
