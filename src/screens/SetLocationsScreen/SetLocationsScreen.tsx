import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';

import {STRINGS} from '../../constants';
import {createCustomPlace, searchSavedPlaces} from '../../data/places';
import {useCurrentLocation} from '../../hooks/useCurrentLocation';
import {useTripPlan} from '../../hooks/useTripPlan';
import {useAppRouter} from '../../navigation';
import {colors, shadows, spacing} from '../../theme';
import type {Place} from '../../types';
import {
  defaultLocationTarget,
  isTripComplete,
  type LocationTarget,
} from '../../utils/tripFlow';
import {AppButton} from '../../components/core/AppButton';
import {AppCard} from '../../components/core/AppCard';
import {AppScreen} from '../../components/core/AppScreen';
import {AppText} from '../../components/core/AppText';
import {AppTextInput} from '../../components/core/AppTextInput';
import {LocationActions} from '../../components/layout/LocationActions';
import {LocationCard} from '../../components/layout/LocationCard';
import {PlaceListItem} from '../../components/layout/PlaceListItem';
import {ScreenHeader} from '../../components/layout/ScreenHeader';
import {RouteMap} from '../../components/map/RouteMap';

/**
 * Screen 2 — Set locations.
 *
 * WHERE THE TRIP IS PUT TOGETHER
 *
 * The assignment asks for a screen where the user can "select their
 * starting location and destination" and "proceed once the required
 * locations are selected". The Figma splits that across two frames —
 * "Set locations" draws the saved-places list for the pickup, and
 * "Trip ready" draws a search field for the drop-off — which would
 * mean the user picks the start on one screen and the end on the
 * next.
 *
 * This screen does both, because that is what the screen is for and
 * because splitting them makes the first screen's own subtitle a
 * lie: it says "Set pickup and drop-off", then only sets the pickup.
 *
 * So the screen has two phases, and the card shows which one is
 * live:
 *
 *   • PHASE 1 — no pickup yet. The "Pickup" eyebrow is brand
 *     coloured, the list is headed "Set as pickup", and tapping a
 *     saved place chooses the start. This is the Figma's "Set
 *     locations" frame exactly.
 *
 *   • PHASE 2 — a pickup exists. The "Drop-off" eyebrow takes the
 *     brand colour, the list is headed "Set as drop-off", and a
 *     search field appears above it. Tapping a result chooses the
 *     destination. This is the Figma's "Trip ready" frame, moved
 *     here so both ends of the trip are chosen in one place.
 *
 * Either field on the card can be tapped to go back to it, and the
 * rounded-square control on the card swaps the two ends.
 *
 * "Next" is enabled only when BOTH ends are chosen.
 *
 * "Pick on map" swaps the body for the live map: tapping it drops a
 * pin, and the confirm button takes that point as the end currently
 * being edited. The Figma has no frame for that flow, so it reuses
 * the route screen's map rather than inventing a fifth screen.
 */
const SetLocationsScreen: React.FC = () => {
  const {goToLogin, goToTripReady} = useAppRouter();
  const {
    pickup,
    dropoff,
    selectPickup,
    selectDropoff,
    clearPickup,
    clearDropoff,
    swapTripEnds,
  } = useTripPlan();
  const {locate, isLocating} = useCurrentLocation();

  /**
   * Which end of the trip the user has chosen to edit.
   *
   * It is a plain preference, not a mirror of the trip. The EFFECTIVE
   * target is derived from it below, because a pickup has to exist
   * before the drop-off can be edited at all — so clearing the
   * pickup forces the screen back to the pickup without any state
   * juggling to keep the two in sync.
   */
  const [chosenTarget, setChosenTarget] = useState<LocationTarget>(
    defaultLocationTarget(pickup),
  );

  const [isPickingOnMap, setIsPickingOnMap] = useState(false);
  const [mapPick, setMapPick] = useState<Place | null>(null);
  const [query, setQuery] = useState('');

  /**
   * The end of the trip that is live right now.
   *
   * With no pickup chosen there is nothing to edit but the pickup,
   * so the target is forced to it. Once a pickup exists the user's
   * own choice takes over, and it starts on the drop-off because
   * that is the next thing the trip needs.
   */
  const target: LocationTarget = pickup ? chosenTarget : 'pickup';

  const matches = useMemo(() => searchSavedPlaces(query), [query]);
  const isSearching = query.trim().length > 0;

  const isEditingPickup = target === 'pickup';

  /** Applies a choice to whichever end of the trip is being edited. */
  const applyChoice = (place: Place) => {
    if (isEditingPickup) {
      selectPickup(place);
      // The start of the trip is settled, so the work moves on to
      // the destination.
      setChosenTarget('dropoff');
    } else {
      selectDropoff(place);
    }
  };

  const handleUseCurrent = async () => {
    const place = await locate();
    applyChoice(place);
  };

  const handleClearPickup = () => {
    clearPickup();
    setQuery('');
  };

  const handleClearDropoff = () => {
    clearDropoff();
    setQuery('');
  };

  const handleConfirmMapPick = () => {
    if (!mapPick) {
      return;
    }
    applyChoice(mapPick);
    setIsPickingOnMap(false);
    setMapPick(null);
  };

  const tripIsComplete = isTripComplete(pickup, dropoff);

  return (
    <AppScreen edges={['top', 'bottom']}>
      <ScreenHeader
        title={STRINGS.locations.title}
        subtitle={STRINGS.locations.step}
        onBack={goToLogin}
      />

      {isPickingOnMap ? (
        <View style={styles.mapMode}>
          <RouteMap
            pickup={mapPick}
            dropoff={null}
            trafficMessage=""
            showTrafficChip={false}
            liveMapEnabled={false}
            onBack={() => {
              setIsPickingOnMap(false);
              setMapPick(null);
            }}
            onPressMap={coordinate =>
              setMapPick({
                id: `picked-${coordinate.latitude}-${coordinate.longitude}`,
                name: 'Picked location',
                address: `${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`,
                icon: 'target',
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
              })
            }
            style={styles.map}
          />
          <View style={styles.mapFooter}>
            <AppButton
              label={
                mapPick
                  ? STRINGS.locations.useThisLocation
                  : STRINGS.locations.tapTheMap
              }
              onPress={handleConfirmMapPick}
              disabled={!mapPick}
            />
          </View>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
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
              pickupActive={isEditingPickup}
              dropoffActive={!isEditingPickup}
              onPressPickup={() => setChosenTarget('pickup')}
              onPressDropoff={() => setChosenTarget('dropoff')}
              onClearPickup={pickup ? handleClearPickup : undefined}
              onClearDropoff={dropoff ? handleClearDropoff : undefined}
              onSwap={tripIsComplete ? swapTripEnds : undefined}
              swapAccessibilityLabel={STRINGS.locations.swapEnds}
            />

            <View style={styles.actions}>
              <LocationActions
                actions={[
                  {
                    label: STRINGS.locations.useCurrent,
                    icon: 'target',
                    onPress: handleUseCurrent,
                    disabled: isLocating,
                    testID: 'use-current',
                  },
                  {
                    label: STRINGS.locations.pickOnMap,
                    icon: 'map',
                    onPress: () => setIsPickingOnMap(true),
                    testID: 'pick-on-map',
                  },
                ]}
              />
            </View>

            <AppText
              variant="eyebrowLarge"
              tone="tertiary"
              style={styles.sectionLabel}>
              {isEditingPickup
                ? STRINGS.locations.setAsPickup
                : STRINGS.locations.setAsDropoff}
            </AppText>

            {/*
              The search field belongs to the drop-off only. The
              pickup is chosen from the saved list directly, which is
              what the Figma's first frame shows.
            */}
            {!isEditingPickup ? (
              <AppTextInput
                placeholder={STRINGS.locations.searchPlaceholder}
                value={query}
                onChangeText={setQuery}
                autoCapitalize="words"
                returnKeyType="done"
                testID="dropoff-search"
              />
            ) : null}

            {/*
              An empty query means "no filter", so the whole list
              shows. The design's empty-state card appears when the
              user has typed something that matches nothing — which
              is the only time that sentence is true.
            */}
            {isSearching && matches.length === 0 ? (
              <AppCard radius="lg" style={styles.emptyCard}>
                <AppText variant="centered" tone="secondary">
                  {STRINGS.locations.noMatch}
                </AppText>
                <AppButton
                  label={STRINGS.locations.useCustomAddress}
                  variant="secondary"
                  size="md"
                  onPress={() => applyChoice(createCustomPlace(query))}
                  style={styles.customButton}
                />
              </AppCard>
            ) : (
              <AppCard radius="xl" padding={0} style={styles.listCard}>
                {matches.map((place, index) => (
                  <PlaceListItem
                    key={place.id}
                    place={place}
                    onPress={applyChoice}
                    showDivider={index > 0}
                  />
                ))}
              </AppCard>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <AppButton
              label={STRINGS.locations.next}
              onPress={goToTripReady}
              disabled={!tripIsComplete}
              testID="set-locations-next"
            />
          </View>
        </>
      )}
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  actions: {
    marginTop: spacing.lg,
  },
  sectionLabel: {
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  listCard: {
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  emptyCard: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    ...shadows.card,
  },
  customButton: {
    marginTop: spacing.lg,
    alignSelf: 'stretch',
  },
  footer: {
    backgroundColor: colors.background.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  mapMode: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapFooter: {
    padding: spacing.xl,
    backgroundColor: colors.background.canvas,
  },
});

export default SetLocationsScreen;
