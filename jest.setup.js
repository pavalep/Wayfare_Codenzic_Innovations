/**
 * Jest setup.
 *
 * Expo's own test preset already mocks the native modules this app
 * uses. This file adds the two things it cannot know about:
 *
 *   1. `expo-location` — the "Use current" flow calls
 *      `requestForegroundPermissionsAsync`, which has no native
 *      implementation under Jest. The mock grants the permission and
 *      returns a fixed coordinate, so the flow can be exercised.
 *   2. `react-native-maps` — `MapView` is a native view; the mock
 *      turns it into a plain host component so a screen can be
 *      rendered in a test.
 */

jest.mock('expo-location', () => ({
  Accuracy: {Balanced: 3},
  PermissionStatus: {GRANTED: 'granted', DENIED: 'denied'},
  requestForegroundPermissionsAsync: jest.fn(async () => ({
    status: 'granted',
    granted: true,
  })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: {latitude: 25.2048, longitude: 51.5042},
  })),
}));

jest.mock('react-native-maps', () => {
  const React = require('react');
  const {View} = require('react-native');

  // Named function expressions so React (and the `react/display-name`
  // lint rule) can tell what each mock stands in for.
  const MockMapView = function MockMapView(props) {
    return React.createElement(View, props, props.children);
  };
  MockMapView.Marker = function MockMarker(props) {
    return React.createElement(View, props);
  };
  MockMapView.Polyline = function MockPolyline(props) {
    return React.createElement(View, props);
  };
  MockMapView.UrlTile = function MockUrlTile(props) {
    return React.createElement(View, props);
  };

  return {
    __esModule: true,
    default: MockMapView,
    MapView: MockMapView,
    Marker: MockMapView.Marker,
    Polyline: MockMapView.Polyline,
    UrlTile: MockMapView.UrlTile,
    PROVIDER_GOOGLE: 'google',
  };
});
