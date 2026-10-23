import React, {useState} from 'react';
import {Image, StyleSheet, View, type LayoutChangeEvent} from 'react-native';
import Svg, {Polyline} from 'react-native-svg';

import mapBackground from '../../../../assets/map/map-background.png';
import {colors, shadows} from '../../../theme';
import type {Place} from '../../../types';
import {
  buildRouteBounds,
  buildRouteCoordinates,
  projectCoordinate,
} from '../../../data/routeGeometry';
import {AppIcon} from '../../core/AppIcon';

/**
 * The flat-map fallback.
 *
 * WHY THIS EXISTS
 *
 * The Google Maps SDK for Android does not survive a missing API
 * key — it throws on a background thread and takes the whole process
 * with it (see `utils/maps.ts`). An APK handed to a reviewer has no
 * key in it, so the live map would crash the app on the route
 * screen. That is not a state this app can ship in.
 *
 * So when no key is present the route screen falls back to the
 * design's own artwork: the flat map the Figma mocked the map with,
 * which this project exports as `assets/map/map-background.png`. It
 * is a picture of a map, not a map — it cannot pan or zoom — but it
 * is the design's own image, and the route drawn over it is the
 * REAL route between the two places the user chose, projected into
 * the picture's coordinate space.
 *
 * The result is that the route screen works with or without a key:
 * live tiles when a key is configured, the design's preview when it
 * is not. Neither crashes.
 */
export interface StaticRouteMapProps {
  /** The trip's origin. */
  pickup: Place | null;
  /** The trip's destination. */
  dropoff: Place | null;
  /** Style for the map container. */
  style?: object;
}

/**
 * The marker diameters, from the Figma route-view frame: the origin
 * marker is 36 px and the destination marker is 32 px.
 */
const ORIGIN_MARKER_SIZE = 36;
const DESTINATION_MARKER_SIZE = 32;

export const StaticRouteMap: React.FC<StaticRouteMapProps> = ({
  pickup,
  dropoff,
  style,
}) => {
  const [size, setSize] = useState({width: 0, height: 0});

  const handleLayout = (event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout;
    setSize(current =>
      current.width === width && current.height === height
        ? current
        : {width, height},
    );
  };

  const hasRoute = Boolean(pickup && dropoff && size.width > 0);

  const coordinates =
    pickup && dropoff ? buildRouteCoordinates(pickup, dropoff) : [];
  const bounds =
    pickup && dropoff ? buildRouteBounds(pickup, dropoff) : null;

  const points =
    bounds && size.width > 0
      ? coordinates
          .map(coordinate =>
            projectCoordinate(coordinate, bounds, size.width, size.height),
          )
          .map(point => `${point.x},${point.y}`)
          .join(' ')
      : '';

  const origin =
    bounds && size.width > 0 && pickup
      ? projectCoordinate(coordinates[0], bounds, size.width, size.height)
      : null;
  const destination =
    bounds && size.width > 0 && dropoff
      ? projectCoordinate(
          coordinates[coordinates.length - 1],
          bounds,
          size.width,
          size.height,
        )
      : null;

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <Image
        source={mapBackground}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />

      {hasRoute && points.length > 0 ? (
        <Svg
          style={StyleSheet.absoluteFill}
          width={size.width}
          height={size.height}>
          <Polyline
            points={points}
            fill="none"
            stroke={colors.brand.mapAccent}
            strokeWidth={4}
            strokeDasharray="12,8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : null}

      {origin ? (
        <View
          style={[
            styles.marker,
            {left: origin.x - ORIGIN_MARKER_SIZE / 2, top: origin.y - ORIGIN_MARKER_SIZE / 2},
          ]}>
          <AppIcon name="markerOrigin" size={ORIGIN_MARKER_SIZE} />
        </View>
      ) : null}

      {destination ? (
        <View
          style={[
            styles.marker,
            {
              left: destination.x - DESTINATION_MARKER_SIZE / 2,
              top: destination.y - DESTINATION_MARKER_SIZE / 2,
            },
          ]}>
          <AppIcon name="markerDestination" size={DESTINATION_MARKER_SIZE} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.background.map,
  },
  /**
   * The marker wrapper. The glyph carries the design's artwork; the
   * shadow is the design's shadow token, because a React Native view
   * cannot carry an SVG drop-shadow filter.
   */
  marker: {
    position: 'absolute',
    ...shadows.elevated,
  },
});
