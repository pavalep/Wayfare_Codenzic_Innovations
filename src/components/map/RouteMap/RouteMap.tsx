import React, {useCallback, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  type MapType,
  type Region,
} from 'react-native-maps';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

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
 *   • the design's own map markers — an orange disc with a car for
 *     the origin, a deep-navy disc with a pin for the destination,
 *     both ringed in white
 *   • the floating back / layers buttons and the dark "Heavy traffic"
 *     chip, all positioned absolutely over the map
 *
 * The layers button is the design's, opposite the back button in the
 * top-right corner, and it switches the base map between the standard
 * road map and the satellite imagery.
 *
 * THE MAP FILLS THE SCREEN
 *
 * The map is not a fixed band. It fills the whole screen and the
 * sheet floats over the bottom of it, so the route can be framed in
 * the part of the map the sheet leaves visible — which changes as the
 * sheet is dragged. The camera is anchored to that band; see
 * `buildRouteRegion`.
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
  /**
   * Called when the layers button is pressed.
   *
   * Defaults to switching the map between the standard road map and
   * the satellite imagery, which is the pair the button's stacked
   * layers glyph stands for.
   */
  onToggleLayers?: () => void;
  /**
   * Called when the map itself is tapped, with the tapped
   * coordinate. Used by the "Pick on map" flow.
   */
  onPressMap?: (coordinate: {latitude: number; longitude: number}) => void;
  /**
   * The camera, when the caller already knows where the map should
   * look.
   *
   * The route view leaves this unset: it builds its own region from
   * the two ends of the trip and the height of the sheet (see
   * `buildRouteRegion`). The map picker passes the service area
   * instead, because there is no route to frame — only an area to
   * show.
   *
   * When this is set it wins over the computed route region.
   */
  region?: Region;
  /**
   * A single point the user has chosen on the map.
   *
   * It is drawn with the design's own destination marker — the navy
   * disc with the pin in it — because that is the marker the Figma
   * uses for "a point on the map". The route view never passes this:
   * it has two named ends and draws them as the origin and the
   * destination instead.
   */
  pickedPlace?: Place | null;
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
  /**
   * Where the sheet's top edge is, in pixels below the top of the map.
   *
   * The map is a sibling of the sheet rather than a child of it, so it
   * cannot read the sheet's position for itself; the route screen owns
   * this shared value and the sheet writes into it. The traffic chip
   * floats just above the sheet's top edge, so it follows it.
   */
  sheetTop?: SharedValue<number>;
  /**
   * Where the route's middle sits, as a fraction of the map's height.
   *
   * This is the middle of the band of screen the sheet leaves
   * visible, so the route is framed in the part of the map that can
   * actually be seen.
   */
  anchorRatio?: number;
  /**
   * How tall that band is, as a fraction of the map's height,
   * measured against the sheet's resting height.
   */
  bandRatio?: number;
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
  region: regionOverride,
  pickedPlace,
  showTrafficChip = true,
  liveMapEnabled,
  sheetTop,
  anchorRatio = 0.185,
  bandRatio = 0.37,
  style,
}) => {
  const coordinates =
    pickup && dropoff ? buildRouteCoordinates(pickup, dropoff) : [];

  /**
   * The map's own size.
   *
   * The camera is built from it, because the camera has to know the
   * shape of the map it is framing the route in.
   */
  const [size, setSize] = useState({width: 0, height: 0});

  /**
   * Which kind of map is showing.
   *
   * The design puts a layers button in the top-right corner of the
   * route view, opposite the back button, and a layers button means
   * "change what the map is showing". The one thing it can change
   * here is the base map: the standard road map or the satellite
   * imagery, which is the same pair Google Maps offers in its own
   * layers menu.
   */
  const [mapType, setMapType] = useState<MapType>('standard');

  const handleToggleLayers = useCallback(() => {
    setMapType(current => (current === 'standard' ? 'satellite' : 'standard'));
  }, []);

  const handleLayout = (event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout;
    setSize(current =>
      current.width === width && current.height === height
        ? current
        : {width, height},
    );
  };

  /**
   * The camera.
   *
   * The route view frames the two ends of the trip in the band of
   * screen the sheet leaves visible. The map picker has no route to
   * frame, so it uses the region the caller asked for instead.
   */
  const computedRegion =
    pickup && dropoff && size.width > 0
      ? buildRouteRegion(pickup, dropoff, {
          mapWidth: size.width,
          mapHeight: size.height,
          anchorRatio,
          bandRatio,
        })
      : undefined;

  const region = regionOverride ?? computedRegion;

  /**
   * The traffic chip's position.
   *
   * It floats just above the sheet, so its distance from the bottom
   * of the map is whatever is left of the map below the sheet's top
   * edge, plus the gap between the two.
   */
  const chipStyle = useAnimatedStyle(
    () => ({
      bottom:
        size.height - (sheetTop ? sheetTop.value : 0) + TRAFFIC_CHIP_CLEARANCE,
    }),
    [size.height],
  );

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      {liveMapEnabled ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFill}
          region={region}
          mapType={mapType}
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
                latitude: pickup.latitude ?? 25.1858,
                longitude: pickup.longitude ?? 51.5312,
              }}
              anchor={{x: 0.5, y: 0.5}}>
              <View style={styles.marker}>
                <AppIcon name="markerOrigin" size={36} />
              </View>
            </Marker>
          ) : null}

          {dropoff ? (
            <Marker
              coordinate={{
                latitude: dropoff.latitude ?? 25.2836,
                longitude: dropoff.longitude ?? 51.5042,
              }}
              anchor={{x: 0.5, y: 0.5}}>
              <View style={styles.marker}>
                <AppIcon name="markerDestination" size={32} />
              </View>
            </Marker>
          ) : null}

          {/*
            The point the user has chosen on the map. It uses the
            design's own destination marker — the Figma's marker for
            "a point on the map" — so the picker does not invent an
            icon the design never drew.
          */}
          {pickedPlace ? (
            <Marker
              coordinate={{
                latitude: pickedPlace.latitude ?? 25.2836,
                longitude: pickedPlace.longitude ?? 51.5042,
              }}
              anchor={{x: 0.5, y: 0.5}}>
              <View style={styles.marker}>
                <AppIcon name="markerDestination" size={32} />
              </View>
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
      {/*
        The back and layers buttons are the design's OWN button
        artwork — one SVG each, a white 44 px rounded square with the
        glyph in it (Figma nodes #1:352 and #1:355). The white square
        is part of the SVG, so the pressable underneath is
        transparent and only carries the shadow.
      */}
      <MapButton label="Back" onPress={onBack} style={styles.backButton}>
        <AppIcon name="mapBack" color={colors.text.primary} />
      </MapButton>

      <MapButton
        label="Map layers"
        onPress={onToggleLayers ?? handleToggleLayers}
        style={styles.layersButton}>
        <AppIcon
          name="mapLayers"
          color={
            mapType === 'standard' ? colors.text.primary : colors.brand.primary
          }
        />
      </MapButton>

      {/* ── Traffic chip ── */}
      {showTrafficChip ? (
        <Animated.View style={[styles.trafficChip, chipStyle]}>
          <AppIcon name="traffic" size={16} color={colors.text.onBrand} />
          <AppText variant="chip" tone="onBrand" numberOfLines={1}>
            {trafficMessage}
          </AppText>
        </Animated.View>
      ) : null}
    </View>
  );
};

/**
 * How far the traffic chip's bottom edge sits above the sheet.
 *
 * From the Figma route-view frame: the chip occupies y 253 → 288.5
 * and the sheet starts at y 311, so the gap between them is 22.5 px.
 */
const TRAFFIC_CHIP_CLEARANCE = spacing.xxl;

/**
 * The size of the map buttons.
 *
 * From the Figma route-view frame: the back and layers buttons are
 * 44 px squares with a 16 px radius, 16 px in from the top and side
 * edges of the map.
 */
const MAP_BUTTON_SIZE = 44;

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
  /**
   * The marker wrapper.
   *
   * The glyph itself carries the design's artwork; the shadow is the
   * design's shadow token, applied here because a React Native view
   * cannot carry an SVG drop-shadow filter.
   */
  marker: {
    ...shadows.elevated,
  },
  /**
   * The map buttons.
   *
   * The design draws each of these as one SVG — a white 44 px
   * rounded square with a glyph in it, plus a drop-shadow filter on
   * the group (Figma nodes #1:352 and #1:355).
   *
   * The square is drawn HERE rather than inside the SVG, because
   * Android casts an elevation shadow from the VIEW's outline: a
   * transparent pressable casts a square halo around the artwork
   * instead of a shadow shaped like the button. The glyph itself
   * comes from the icon set.
   *
   * The design's own drop shadow is not used. On a live Google map
   * the land is often almost white, and a 4 %-opacity shadow over a
   * white square on white ground reads as a grey smudge floating
   * next to the button rather than as the button's shadow. The 1 px
   * hairline in the design's border colour does the same job — it
   * separates the white button from whatever is behind it — and it
   * is the same hairline the rest of the app uses.
   */
  button: {
    position: 'absolute',
    width: MAP_BUTTON_SIZE,
    height: MAP_BUTTON_SIZE,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
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
