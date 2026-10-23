import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  Alert,
  Linking,
  StyleSheet,
  View,
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSharedValue} from 'react-native-reanimated';

import {STRINGS} from '../../constants';
import {getRouteSummary, TRAVEL_MODES} from '../../data/route';
import {useLiveMapEnabled} from '../../hooks/useLiveMapEnabled';
import {useTripPlan} from '../../hooks/useTripPlan';
import {useAppRouter} from '../../navigation';
import {colors, radius, shadows, spacing} from '../../theme';
import {buildGoogleMapsRouteUrl} from '../../utils/maps';
import type {TravelMode} from '../../types';
import {AppScreen} from '../../components/core/AppScreen';
import {RouteMap} from '../../components/map/RouteMap';
import {RouteSummarySheet} from '../../components/map/RouteSummarySheet';
import {StartNavigationButton} from '../../components/map/StartNavigationButton';

/**
 * Screen 4 — Route view.
 *
 * The map with the route drawn on it, and a snap-point sheet over the
 * bottom of it.
 *
 * THREE STOPS
 *
 * The sheet has three stops, and the user drags between them:
 *
 *   • collapsed — the sheet is down to the headline numbers, the mode
 *     tabs and the card with the two ends of the trip, and the map has
 *     the rest of the screen. ONLY the turn-by-turn list fades out at
 *     this stop: it is the longest block and the least useful at a
 *     glance, and at this stop the map is the point.
 *   • resting — the Figma's own height, 533.5 px of the frame's
 *     844.5 px content area, which is 63 % of the window. This is
 *     where the screen opens.
 *   • expanded — 90 % of the window, which is where the whole
 *     turn-by-turn list is readable and scrollable.
 *
 * Switching the travel mode while the sheet is collapsed opens it up
 * to the resting stop, because the numbers the tabs change are the
 * ones in the sheet and the collapsed sheet is too short to show them.
 *
 * THE MAP IS SIZED BY THE SHEET
 *
 * The map is not a fixed band. It fills the strip of screen between
 * the top of the screen and the top of the sheet, so it always ends
 * exactly where the sheet begins and it grows when the sheet is
 * dragged down. The route therefore stays framed in the visible part
 * of the map at every stop, and the collapsed stop really does show
 * more map.
 *
 * THE "START NAVIGATION" BUTTON
 *
 * It hands the trip to Google Maps rather than showing a message, and
 * it is pinned to the bottom of the screen OUTSIDE the sheet.
 *
 * That is deliberate. A snap-point sheet lays its content out against
 * its tallest stop and slides up inside it, so a button that is the
 * last child of the sheet's content is pushed off the bottom of the
 * screen at every shorter stop — which is exactly what happened to
 * this one before. As an overlay it is on screen at every stop, and
 * because it carries its own white container down to the bottom edge
 * of the screen it still reads as part of the sheet, the way the
 * Figma draws it.
 *
 * The sheet's own bottom safe-area inset is switched OFF for the same
 * reason: with it applied, the sheet's white stopped short of the
 * bottom of the screen, the map showed underneath, and the button
 * read as a bar floating over the map instead of a button sitting on
 * the sheet.
 *
 * THE HAND-OFF TO GOOGLE MAPS
 *
 * The button opens the documented universal Directions URL:
 *
 *     https://www.google.com/maps/dir/?api=1&origin=…&destination=…&travelmode=…
 *
 * It is NOT the `google.navigation:` intent, even though that one
 * would hand over to Google Maps' own turn-by-turn UI. On the Google
 * Maps build this was tested against, that intent silently drops the
 * `saddr` origin parameter: Maps plans the route from the DEVICE's
 * location instead of the trip's origin, and the app cannot tell,
 * because the intent opens without an error. A route from the wrong
 * end of the trip is worse than a route that needs one extra tap to
 * start, so the universal URL is used instead. The URL builder is a
 * pure function in `utils/maps.ts` so it can be unit-tested.
 */
const RouteViewScreen: React.FC = () => {
  const {goBack} = useAppRouter();
  const {pickup, dropoff, mode, selectMode} = useTripPlan();
  const liveMapEnabled = useLiveMapEnabled();
  const insets = useSafeAreaInsets();

  const sheetRef = useRef<BottomSheet>(null);

  /**
   * Where the sheet's top edge is.
   *
   * The map is a sibling of the sheet, not a child of it, so it cannot
   * read the sheet's position for itself. The sheet's content writes
   * the position into this shared value as the sheet moves.
   */
  const sheetTop = useSharedValue(0);

  /**
   * Which stop the sheet is resting on.
   *
   * The map uses it to frame the route in the band of screen the
   * sheet leaves visible, so the route is never half hidden behind
   * the sheet.
   */
  const [detentIndex, setDetentIndex] = useState(SHEET_REST_INDEX);

  const summary = getRouteSummary(mode);

  const modes = TRAVEL_MODES.map(key => ({
    key,
    label: STRINGS.route[key],
  }));

  /**
   * The sheet's three stops.
   *
   * They are percentages of the sheet's container rather than pixel
   * values, so the sheet composes on any screen. The order matters:
   * the lowest stop comes first and the tallest last.
   */
  const snapPoints = useMemo(
    () => [SHEET_COLLAPSED_RATIO, SHEET_REST_RATIO, SHEET_EXPANDED_RATIO],
    [],
  );

  /**
   * The space at the bottom of the screen that the "Start navigation"
   * container takes, safe-area inset included.
   */
  const ctaReserved = CTA_CONTAINER_HEIGHT + insets.bottom;

  const handleStartNavigation = useCallback(async () => {
    if (!dropoff) {
      return;
    }

    const routeUrl = buildGoogleMapsRouteUrl(pickup ?? dropoff, dropoff, mode);

    try {
      await Linking.openURL(routeUrl);
    } catch {
      Alert.alert(
        'Cannot open maps',
        'No app on this device can open a Google Maps route.',
      );
    }
  }, [dropoff, mode, pickup]);

  /**
   * Switching the travel mode.
   *
   * When the sheet is collapsed onto the map, changing the mode also
   * opens the sheet up to its resting height: the numbers the tabs
   * change are the ones in the sheet, and the collapsed sheet is too
   * short to show them.
   */
  const handleModeChange = useCallback(
    (next: TravelMode) => {
      selectMode(next);

      if (detentIndex === SHEET_COLLAPSED_INDEX) {
        sheetRef.current?.snapToIndex(SHEET_REST_INDEX);
      }
    },
    [detentIndex, selectMode],
  );

  return (
    <AppScreen edges={['top']}>
      <View style={styles.container}>
        <RouteMap
          pickup={pickup}
          dropoff={dropoff}
          trafficMessage={STRINGS.route.traffic}
          onBack={goBack}
          liveMapEnabled={liveMapEnabled}
          sheetTop={sheetTop}
          anchorRatio={BAND_RATIOS[detentIndex] / 2}
          bandRatio={BAND_RATIOS[SHEET_REST_INDEX]}
          style={styles.map}
        />

        <BottomSheet
          ref={sheetRef}
          index={SHEET_REST_INDEX}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          enableDynamicSizing={false}
          onChange={setDetentIndex}
          backgroundStyle={styles.sheetBackground}
          handleIndicatorStyle={styles.handle}
          bottomInset={0}>
          <RouteSummarySheet
            summary={summary}
            modes={modes}
            mode={mode}
            onModeChange={handleModeChange}
            pickup={pickup}
            dropoff={dropoff}
            reservedBottom={ctaReserved}
            sheetTop={sheetTop}
          />
        </BottomSheet>

        {/*
          The primary action, pinned to the bottom of the screen over
          the sheet. It is outside the sheet on purpose — see the note
          above the component.
        */}
        <StartNavigationButton
          onPress={handleStartNavigation}
          bottomInset={insets.bottom}
        />
      </View>
    </AppScreen>
  );
};

/**
 * The sheet's resting height, as a fraction of its container.
 *
 * The Figma route-view frame is 880 px tall with a 35.5 px status
 * bar, so the content area is 844.5 px and the sheet is 533.5 px of
 * it — 63.2 %.
 */
const SHEET_REST_RATIO = '63%';

/**
 * The sheet's collapsed height.
 *
 * It is NOT a guess. The shortest stop has to be tall enough to hold
 * everything the design says stays visible at that stop:
 *
 *   • the summary block, the mode tabs and the card with the two
 *     ends of the trip — 249.6 px of content, measured off the
 *     Figma's own route-view frame
 *   • the "Start navigation" container below it — 96 px plus the
 *     device's bottom safe-area inset
 *
 * Anything shorter and the card with the two ends of the trip ends
 * up underneath the button, which is exactly what it did before this
 * was worked out.
 */
const SHEET_COLLAPSED_RATIO = '42%';

/** The sheet's expanded height: near the full screen. */
const SHEET_EXPANDED_RATIO = '90%';

/**
 * The stop the screen opens on: the Figma's own resting height.
 */
const SHEET_REST_INDEX = 1;

/**
 * The collapsed stop: the sheet is down to the headline numbers and
 * the map has the rest of the screen.
 */
const SHEET_COLLAPSED_INDEX = 0;

/**
 * How much of the screen is left visible above the sheet at each
 * stop, as a fraction of the window.
 *
 * The sheet takes 42 %, 63 % and 90 % of the window, so the map is
 * left 58 %, 37 % and 10 % of it.
 */
const BAND_RATIOS = [0.58, 0.37, 0.1];

/**
 * The space at the bottom of the screen that the "Start navigation"
 * container owns.
 *
 * The container is 16 px of padding, the 56 px button and 24 px of
 * padding below it — 96 px — plus the device's bottom safe-area
 * inset, which Android draws over the app's own content.
 *
 * The sheet's content is laid out above this, so the container never
 * covers the card with the two ends of the trip.
 */
const CTA_CONTAINER_HEIGHT = 56 + spacing.xl + spacing.xxl;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  /**
   * The map fills the screen; the sheet floats over the bottom of it.
   */
  map: {
    flex: 1,
  },
  sheetBackground: {
    backgroundColor: colors.background.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    ...shadows.sheet,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border.subtle,
  },
});

export default RouteViewScreen;
