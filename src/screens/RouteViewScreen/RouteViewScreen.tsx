import React, {useCallback, useState} from 'react';
import {Alert, Linking, StyleSheet, View} from 'react-native';

import {STRINGS} from '../../constants';
import {getRouteSummary, TRAVEL_MODES} from '../../data/route';
import {useLiveMapEnabled} from '../../hooks/useLiveMapEnabled';
import {useTripPlan} from '../../hooks/useTripPlan';
import {useAppRouter} from '../../navigation';
import {colors} from '../../theme';
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsNavigationUrl,
} from '../../utils/maps';
import {AppScreen} from '../../components/core/AppScreen';
import {RouteMap} from '../../components/map/RouteMap';
import {RouteSummarySheet} from '../../components/map/RouteSummarySheet';

/**
 * Screen 4 — Route view.
 *
 * The map with the route drawn on it, and the summary sheet sliding
 * up over the bottom of the map.
 *
 * The proportions come from the Figma frame: the map is 340 px of an
 * 844.5 px content area (40.2 %) and the sheet is 533.5 px (63.2 %),
 * so the sheet covers the bottom 29 px of the map. Those ratios are
 * kept rather than the pixel values, so the screen still composes on
 * a tall phone and on a tablet.
 *
 * THE "START NAVIGATION" BUTTON
 *
 * It hands the trip to Google Maps rather than showing a message.
 * Two URLs are tried in order:
 *
 *   1. `google.navigation:q=<destination>&mode=<mode>` — the
 *      navigation intent. Google Maps takes over the screen with its
 *      own turn-by-turn UI, which is what the button says it does.
 *   2. `https://www.google.com/maps/dir/?api=1&origin=…&destination=…`
 *      — the documented universal fallback, which opens the Maps app
 *      if it is installed and the browser if it is not.
 *
 * If neither can be opened, the app says so rather than doing
 * nothing. The URL builders are pure functions in `utils/maps.ts` so
 * they can be unit-tested.
 */
const RouteViewScreen: React.FC = () => {
  const {goBack} = useAppRouter();
  const {pickup, dropoff, mode, selectMode} = useTripPlan();
  const liveMapEnabled = useLiveMapEnabled();

  const [contentHeight, setContentHeight] = useState(0);

  const summary = getRouteSummary(mode);

  const modes = TRAVEL_MODES.map(key => ({
    key,
    label: STRINGS.route[key],
  }));

  const handleStartNavigation = useCallback(async () => {
    if (!dropoff) {
      return;
    }

    const navigationUrl = buildGoogleMapsNavigationUrl(dropoff, mode);
    const directionsUrl = buildGoogleMapsDirectionsUrl(
      pickup ?? dropoff,
      dropoff,
      mode,
    );

    try {
      await Linking.openURL(navigationUrl);
      return;
    } catch {
      // No Google Maps app on the device — fall through to the
      // universal directions URL, which a browser can open.
    }

    try {
      await Linking.openURL(directionsUrl);
    } catch {
      Alert.alert(
        'Cannot open maps',
        'No app on this device can open a Google Maps route.',
      );
    }
  }, [dropoff, mode, pickup]);

  const mapHeight = contentHeight * 0.402;
  const sheetHeight = contentHeight * 0.632;

  return (
    <AppScreen edges={['top']}>
      <View
        style={styles.container}
        onLayout={event =>
          setContentHeight(event.nativeEvent.layout.height)
        }>
        <RouteMap
          pickup={pickup}
          dropoff={dropoff}
          trafficMessage={STRINGS.route.traffic}
          onBack={goBack}
          liveMapEnabled={liveMapEnabled}
          style={{height: mapHeight}}
        />

        <View style={[styles.sheet, {height: sheetHeight}]}>
          <RouteSummarySheet
            summary={summary}
            modes={modes}
            mode={mode}
            onModeChange={selectMode}
            pickup={pickup}
            dropoff={dropoff}
            onStartNavigation={handleStartNavigation}
            style={styles.sheetInner}
          />
        </View>
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.surface,
  },
  sheetInner: {
    flex: 1,
  },
});

export default RouteViewScreen;
