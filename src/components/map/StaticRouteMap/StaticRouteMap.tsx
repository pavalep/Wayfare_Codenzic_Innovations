import React, {useState} from 'react';
import {Image, StyleSheet, View, type LayoutChangeEvent} from 'react-native';
import Svg, {Polyline} from 'react-native-svg';

import mapBackground from '../../../../assets/map/map-background.png';
import {colors, radius, shadows} from '../../../theme';
import type {Place} from '../../../types';
import {
  buildRouteBounds,
  buildRouteCoordinates,
  projectCoordinate,
} from '../../../data/routeGeometry';

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

/** The diameter of both pins, in pixels. */
const PIN_SIZE = 32;

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
            styles.pin,
            styles.pinOrigin,
            {left: origin.x - PIN_SIZE / 2, top: origin.y - PIN_SIZE / 2},
          ]}
        />
      ) : null}

      {destination ? (
        <View
          style={[
            styles.pin,
            styles.pinDestination,
            {
              left: destination.x - PIN_SIZE / 2,
              top: destination.y - PIN_SIZE / 2,
            },
          ]}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.background.map,
  },
  pin: {
    position: 'absolute',
    width: PIN_SIZE,
    height: PIN_SIZE,
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
});
