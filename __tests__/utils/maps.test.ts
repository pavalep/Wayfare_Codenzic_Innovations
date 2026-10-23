import {
  buildGoogleMapsRouteUrl,
  formatPlaceForMaps,
  isGoogleMapsConfigured,
  toGoogleTravelMode,
} from '../../src/utils/maps';

const HOME = {
  name: 'Home',
  address: 'Villa 12',
  latitude: 25.1858,
  longitude: 51.5312,
};

const MARINA = {
  name: 'Marina Office Tower',
  address: 'Level 14',
  latitude: 25.2836,
  longitude: 51.5042,
};

describe('isGoogleMapsConfigured', () => {
  it('is false when the build carries no key', () => {
    expect(isGoogleMapsConfigured(null)).toBe(false);
    expect(isGoogleMapsConfigured(undefined)).toBe(false);
    expect(isGoogleMapsConfigured({})).toBe(false);
    expect(isGoogleMapsConfigured({extra: {}})).toBe(false);
    expect(
      isGoogleMapsConfigured({extra: {googleMapsApiKeyConfigured: false}}),
    ).toBe(false);
  });

  it('is true when the build recorded a key', () => {
    expect(
      isGoogleMapsConfigured({extra: {googleMapsApiKeyConfigured: true}}),
    ).toBe(true);
  });
});

describe('toGoogleTravelMode', () => {
  it('maps the app modes onto Google’s travel modes', () => {
    expect(toGoogleTravelMode('drive')).toBe('driving');
    expect(toGoogleTravelMode('walk')).toBe('walking');
  });

  it('maps a ride to driving, because a ride-hailing car is a car', () => {
    expect(toGoogleTravelMode('ride')).toBe('driving');
  });
});

describe('formatPlaceForMaps', () => {
  it('prefers an exact coordinate', () => {
    expect(formatPlaceForMaps(HOME)).toBe('25.1858,51.5312');
  });

  it('falls back to the name when there is no coordinate', () => {
    expect(formatPlaceForMaps({name: 'Somewhere new'})).toBe('Somewhere new');
  });

  it('falls back when only one half of the coordinate is present', () => {
    expect(formatPlaceForMaps({name: 'Half', latitude: 25.2})).toBe('Half');
  });
});

describe('buildGoogleMapsRouteUrl', () => {
  /*
    The `google.navigation:` intent is deliberately NOT used. On the
    Google Maps build this was tested against, it silently drops the
    `saddr` origin parameter and routes from the device's location
    instead — the wrong end of the trip, with nothing on screen to
    say so. The universal Directions URL carries both ends.
  */

  it('is the documented google.com/maps/dir URL', () => {
    expect(buildGoogleMapsRouteUrl(HOME, MARINA, 'drive')).toMatch(
      /^https:\/\/www\.google\.com\/maps\/dir\/\?/,
    );
  });

  it('carries both ends of the trip', () => {
    const url = buildGoogleMapsRouteUrl(HOME, MARINA, 'drive');
    expect(url).toContain('origin=25.1858%2C51.5312');
    expect(url).toContain('destination=25.2836%2C51.5042');
    expect(url).toContain('travelmode=driving');
    expect(url).toContain('api=1');
  });

  it('never falls back to the device location — the origin is explicit', () => {
    const url = buildGoogleMapsRouteUrl(HOME, MARINA, 'drive');
    expect(url).toContain('origin=');
    expect(url).not.toContain('saddr');
  });

  it('uses walking mode for a walk', () => {
    expect(buildGoogleMapsRouteUrl(HOME, MARINA, 'walk')).toContain(
      'travelmode=walking',
    );
  });

  it('maps a ride to driving', () => {
    expect(buildGoogleMapsRouteUrl(HOME, MARINA, 'ride')).toContain(
      'travelmode=driving',
    );
  });

  it('encodes a place that has no coordinate', () => {
    const url = buildGoogleMapsRouteUrl(
      HOME,
      {name: 'Blue Bay Tower'},
      'drive',
    );
    expect(url).toContain('destination=Blue%20Bay%20Tower');
  });

  it('encodes both ends when neither has a coordinate', () => {
    const url = buildGoogleMapsRouteUrl(
      {name: 'Blue Bay Tower'},
      {name: 'Red Bay Tower'},
      'walk',
    );
    expect(url).toContain('origin=Blue%20Bay%20Tower');
    expect(url).toContain('destination=Red%20Bay%20Tower');
    expect(url).toContain('travelmode=walking');
  });
});
