import {useFocusEffect, usePreventRemove} from 'expo-router';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {STRINGS} from '../../constants';
import {createCustomPlace, searchSavedPlaces} from '../../data/places';
import {isInsideServiceArea, SERVICE_AREA_REGION} from '../../data/serviceArea';
import {useCurrentLocation} from '../../hooks/useCurrentLocation';
import {useLiveMapEnabled} from '../../hooks/useLiveMapEnabled';
import {useTripPlan} from '../../hooks/useTripPlan';
import {useAppRouter} from '../../navigation';
import {useAuthStore} from '../../state';
import {colors, shadows, spacing} from '../../theme';
import type {Place} from '../../types';
import {
  defaultLocationTarget,
  isTripComplete,
  type LocationTarget,
} from '../../utils/tripFlow';
import {AppFooter} from '../../components/core/AppFooter';
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
 * LEAVING THE SCREEN ENDS THE SESSION
 *
 * This screen sits inside the signed-in guard, so the back control is
 * the app's only way out of a session that the user has started. It
 * does not just navigate away — it asks first, and signing out is
 * what confirming does.
 *
 * Both ways out are covered: the header chevron, and the Android
 * hardware back button. The hardware button is intercepted with
 * React Native's own `BackHandler`, which is the documented API for
 * it — returning `true` there stops the press before the navigator
 * sees it, so the screen does not pop behind the alert. The
 * navigator is covered as well with `usePreventRemove`, so no other
 * navigation action can remove the screen either.
 */
const SetLocationsScreen: React.FC = () => {
  const {goToLogin, goToTripReady} = useAppRouter();
  const signOut = useAuthStore(state => state.signOut);
  const liveMapEnabled = useLiveMapEnabled();
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
   * The bottom safe-area inset.
   *
   * The screen does not ask `AppScreen` for the bottom edge, because
   * the white footer owns that inset — otherwise the strip under the
   * footer would be painted in the canvas grey and the footer would
   * look cut off. The map mode has its own grey bar over the map, and
   * it needs the same inset so its button clears the gesture bar.
   */
  const insets = useSafeAreaInsets();

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
   * Whether the sign-out alert is already on screen.
   *
   * The header chevron, the hardware back button and the navigator
   * can all ask to leave, and two of them can fire for one press. The
   * flag keeps one press to one alert — a second alert would stack on
   * top of the first.
   */
  const isAskingToLeave = useRef(false);

  /**
   * The navigator's own removal switch.
   *
   * `usePreventRemove` has to be switched off in the SAME tick as the
   * navigation it is allowing: the navigator checks the flag while it
   * dispatches, so a state update would come too late and the
   * navigation would be blocked. The hook returns a function that
   * switches it off immediately, and it is kept in a ref so the
   * alert's button can reach it.
   */
  const disableRemovalPreventionRef = useRef<(() => void) | null>(null);

  /** Leaves the map picker and throws the picked point away. */
  const leaveMapPicker = useCallback(() => {
    setIsPickingOnMap(false);
    setMapPick(null);
  }, []);

  /**
   * Asks whether the user really wants to sign out.
   */
  const requestSignOut = useCallback(() => {
    if (isAskingToLeave.current) {
      return;
    }

    isAskingToLeave.current = true;

    Alert.alert(
      STRINGS.signOut.title,
      STRINGS.signOut.message,
      [
        {
          text: STRINGS.signOut.cancel,
          style: 'cancel',
        },
        {
          text: STRINGS.signOut.confirm,
          style: 'destructive',
          onPress: () => {
            // The screen is about to be removed, so the navigator's
            // protection has to come off first — otherwise it would
            // refuse the very navigation that signs the user out.
            disableRemovalPreventionRef.current?.();
            signOut();
            goToLogin();
          },
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {
          isAskingToLeave.current = false;
        },
      },
    );
  }, [goToLogin, signOut]);

  /**
   * What happens when the user tries to leave the screen.
   *
   * In the map picker the back control means "put the map away" —
   * it is a mode, not a step out of the app. Everywhere else it means
   * "leave the session", which is what the alert asks about.
   */
  const handleLeaveRequest = useCallback(() => {
    if (isPickingOnMap) {
      leaveMapPicker();
      return;
    }

    requestSignOut();
  }, [isPickingOnMap, leaveMapPicker, requestSignOut]);

  /**
   * The navigator must not remove this screen on its own.
   *
   * This is the hook React Navigation documents for exactly this: it
   * catches any navigation action that would remove the route, not
   * just the ones a button triggers.
   */
  const disableRemovalPrevention = usePreventRemove(
    true,
    handleLeaveRequest,
  );

  useEffect(() => {
    disableRemovalPreventionRef.current = disableRemovalPrevention;
  }, [disableRemovalPrevention]);

  /**
   * The Android hardware back button.
   *
   * React Native's `BackHandler` is the documented way to intercept
   * it. Returning `true` tells the runtime the press has been handled,
   * and the navigator never sees it — so the screen does not pop
   * behind the alert.
   *
   * The listener is registered through `useFocusEffect` so it only
   * exists while this screen is on top, and it is removed when the
   * screen loses focus.
   */
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          handleLeaveRequest();
          return true;
        },
      );

      return () => subscription.remove();
    }, [handleLeaveRequest]),
  );

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

  /**
   * A point dropped on the map.
   *
   * A point outside the area the app can plan a trip in is refused
   * with an alert rather than being accepted silently — the app has
   * no road geometry and no place name for it, so accepting it would
   * produce a route the app cannot honour.
   */
  const handleMapPress = useCallback(
    (coordinate: {latitude: number; longitude: number}) => {
      if (!isInsideServiceArea(coordinate)) {
        Alert.alert(
          STRINGS.locations.outOfAreaTitle,
          STRINGS.locations.outOfAreaMessage,
        );
        return;
      }

      setMapPick({
        id: `picked-${coordinate.latitude.toFixed(5)}-${coordinate.longitude.toFixed(5)}`,
        name: STRINGS.locations.pickedLocation,
        address: `${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`,
        icon: 'target',
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });
    },
    [],
  );

  const handleConfirmMapPick = () => {
    if (!mapPick) {
      return;
    }

    applyChoice(mapPick);
    leaveMapPicker();
  };

  const tripIsComplete = isTripComplete(pickup, dropoff);

  return (
    <AppScreen edges={['top']}>
      {/*
        The header belongs to the list screen. The map picker is a
        mode, not a step — it says "tap the map", not "step 1 of 2" —
        so the header steps aside and the map's own back button takes
        over.
      */}
      {isPickingOnMap ? (
        <View style={styles.mapMode}>
          <RouteMap
            pickup={null}
            dropoff={null}
            pickedPlace={mapPick}
            region={SERVICE_AREA_REGION}
            trafficMessage=""
            showTrafficChip={false}
            liveMapEnabled={liveMapEnabled}
            onBack={leaveMapPicker}
            onPressMap={handleMapPress}
            style={styles.map}
          />
          <View
            style={[
              styles.mapFooter,
              {paddingBottom: spacing.xl + insets.bottom},
            ]}>
            <AppButton
              label={
                mapPick
                  ? STRINGS.locations.useThisLocation
                  : STRINGS.locations.tapTheMap
              }
              onPress={handleConfirmMapPick}
              disabled={!mapPick}
              testID="map-pick-confirm"
            />
          </View>
        </View>
      ) : (
        <>
          <ScreenHeader
            title={STRINGS.locations.title}
            subtitle={STRINGS.locations.step}
            onBack={handleLeaveRequest}
          />

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
                    /*
                      The picker needs a real map: the flat-map
                      fallback is a picture and cannot be panned or
                      tapped, so the action is offered only when the
                      live map is there.
                    */
                    label: STRINGS.locations.pickOnMap,
                    icon: 'map',
                    onPress: () => setIsPickingOnMap(true),
                    disabled: !liveMapEnabled,
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

          <AppFooter>
            <AppButton
              label={STRINGS.locations.next}
              onPress={goToTripReady}
              disabled={!tripIsComplete}
              testID="set-locations-next"
            />
          </AppFooter>
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
