import React, {useState} from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';

import {colors, radius, shadows, spacing} from '../../../theme';
import {AppIcon} from '../../core/AppIcon';
import {AppText} from '../../core/AppText';
import type {Place} from '../../../types';
import {buildRouteCoordinates, buildRouteRegion} from '../../../data/routeGeometry';
import {StaticRouteMap} from '../StaticRouteMap';

/**
 * The map on the route screen.
 *
 * There are two renderings, and which one is used is decided by the
 * build:
 *
 *   • With a Google Maps API key, a real `react-native-maps` view on
 *     the Google provider — pan, zoom, live traffic.
 *   • Without one, the design's own flat map artwork with the route
 *     drawn over it (`StaticRouteMap`).
 *
 * WHY THE FALLBACK IS NOT OPTIONAL
 *
 * The Google Maps SDK for Android throws
 * `IllegalStateException: API key not found` on a background thread
 * when the key is missing, and the Android runtime turns that into a
 * FATAL EXCEPTION. No JavaScript error boundary can catch it — it
 * kills the process. An APK with no key in it would therefore crash
 * the moment the route screen opened, which is exactly what happens
 * to anyone who installs the hand-over build without one.
 *
 * So the app asks before it renders. `StaticRouteMap` is the
 * design's own answer: the Figma mocked the map as a flat export
 * because Figma cannot render one, and that export is in the repo.
 *
 * The three pieces that match the Figma frame are shared by both
 * renderings:
 *
 *   • the dashed brand-coloured route polyline
 *   • an orange origin pin and a dark destination pin, both ringed
 *     in white
 *   • the floating back / layers buttons and the dark "Heavy traffic"
 *     chip, all positioned absolutely over the map
 */
export interface RouteMapProps {
  /** The trip's origin. */
  pickup: Place | null;
  /** The trip's destination. */
  dropoff: Place | null;
  /** The traffic message shown in the dark chip. */
  trafficMessage: string;
  /** Called when the back button is pressed. */
  onBack: () => void;
  /** Called when the layers button is pressed. */
  onToggleLayers?: () => void;
  /**
   * Called when the map itself is tapped, with the tapped
   * coordinate. Used by the "Pick on map" flow.
   */
  onPressMap?: (coordinate: {latitude: number; longitude: number}) => void;
  /** Hides the traffic chip — used by the map-picker mode. */
  showTrafficChip?: boolean;
  /**
   * Whether the live Google map can be used.
   *
   * `false` swaps in the flat-map fallback. The route screen decides
   * this from the build's configuration; see `utils/maps.ts` for why
   * the question has to be asked at all.
   */
  liveMapEnabled: boolean;
  /** Style for the map container. */
  style?: ViewStyle;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  pickup,
  dropoff,
  trafficMessage,
  onBack,
  onToggleLayers,
  onPressMap,
  showTrafficChip = true,
  liveMapEnabled,
  style,
}) => {
  const coordinates =
    pickup && dropoff ? buildRouteCoordinates(pickup, dropoff) : [];

  const region =
    pickup && dropoff ? buildRouteRegion(pickup, dropoff) : undefined;

  /**
   * The measured height of the map box.
   *
   * The traffic chip is positioned from it, because the chip has to
   * clear the summary sheet that overlaps the bottom of the map. The
   * Figma puts the chip at y 253 in a 340 px map, so its bottom edge
   * sits 51.5 px above the map's floor — a proportion, not a fixed
   * offset, which is what keeps it clear of the sheet on a screen of
   * any height.
   */
  const [mapHeight, setMapHeight] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const {height} = event.nativeEvent.layout;
    setMapHeight(current => (current === height ? current : height));
  };

  return (
    <View
      style={[styles.container, style]}
      onLayout={handleLayout}>
      {liveMapEnabled ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFill}
          region={region}
          scrollEnabled
          zoomEnabled
          rotateEnabled={false}
          pitchEnabled={false}
          showsCompass={false}
          showsUserLocation={false}
          showsMyLocationButton={false}
          toolbarEnabled={false}
          onPress={
            onPressMap
              ? event => onPressMap(event.nativeEvent.coordinate)
              : undefined
          }>
          {coordinates.length > 1 ? (
            <Polyline
              coordinates={coordinates}
              strokeColor={colors.brand.mapAccent}
              strokeWidth={4}
              lineDashPattern={[12, 8]}
              lineCap="round"
            />
          ) : null}

          {pickup ? (
            <Marker
              coordinate={{
                latitude: pickup.latitude ?? 25.2048,
                longitude: pickup.longitude ?? 55.2708,
              }}
              anchor={{x: 0.5, y: 0.5}}
              tracksViewChanges={false}>
              <View style={[styles.pin, styles.pinOrigin]} />
            </Marker>
          ) : null}

          {dropoff ? (
            <Marker
              coordinate={{
                latitude: dropoff.latitude ?? 25.2836,
                longitude: dropoff.longitude ?? 51.5042,
              }}
              anchor={{x: 0.5, y: 0.5}}
              tracksViewChanges={false}>
              <View style={[styles.pin, styles.pinDestination]} />
            </Marker>
          ) : null}
        </MapView>
      ) : (
        /*
          The fallback has to be told to fill this container. It is a
          child of the same box as the live `MapView`, which fills it
          with `StyleSheet.absoluteFill` — without the same instruction
          the fallback's own container collapses to zero height and
          the map area renders as an empty rectangle.
        */
        <StaticRouteMap
          pickup={pickup}
          dropoff={dropoff}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* ── Floating controls ── */}
      <MapButton label="Back" onPress={onBack} style={styles.backButton}>
        <AppIcon name="back" size={20} color={colors.text.primary} />
      </MapButton>

      {onToggleLayers ? (
        <MapButton
          label="Map layers"
          onPress={onToggleLayers}
          style={styles.layersButton}>
          <AppIcon name="layers" size={22} color={colors.text.primary} />
        </MapButton>
      ) : null}

      {/* ── Traffic chip ── */}
      {showTrafficChip ? (
        <View
          style={[
            styles.trafficChip,
            // The chip sits above the sheet that overlaps the map's
            // floor, so it is placed as a proportion of the map's own
            // height rather than a fixed offset.
            {bottom: mapHeight * TRAFFIC_CHIP_BOTTOM_RATIO},
          ]}>
          <AppIcon name="traffic" size={16} color={colors.text.onBrand} />
          <AppText variant="chip" tone="onBrand" numberOfLines={1}>
            {trafficMessage}
          </AppText>
        </View>
      ) : null}
    </View>
  );
};

/**
 * Where the traffic chip's bottom edge sits, as a fraction of the
 * map's height.
 *
 * From the Figma route-view frame: the map is 340 px tall and the
 * chip occupies y 253 → 288.5, so its floor is 51.5 px above the
 * map's own floor — 51.5 / 340.
 */
const TRAFFIC_CHIP_BOTTOM_RATIO = 51.5 / 340;

// ─── Local helper ───────────────────────────────────────────

interface MapButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  children: React.ReactNode;
}

const MapButton: React.FC<MapButtonProps> = ({label, onPress, style, children}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    onPress={onPress}
    android_ripple={{color: colors.overlay.rippleOnLightStrong, borderless: false}}
    style={[styles.button, style]}>
    {children}
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.background.map,
  },
  pin: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.text.onBrand,
    ...shadows.elevated,
  },
  pinOrigin: {
    backgroundColor: colors.marker.origin,
  },
  pinDestination: {
    backgroundColor: colors.marker.destination,
  },
  button: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  backButton: {
    left: spacing.lg,
    top: spacing.lg,
  },
  layersButton: {
    right: spacing.lg,
    top: spacing.lg,
  },
  trafficChip: {
    position: 'absolute',
    left: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.overlay.trafficChip,
  },
});
