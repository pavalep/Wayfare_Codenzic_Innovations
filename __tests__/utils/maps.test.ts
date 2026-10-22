import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsNavigationUrl,
  formatPlaceForMaps,
  isGoogleMapsConfigured,
  toGoogleTravelMode,
} from '../../src/utils/maps';

const HOME = {
  name: 'Home',
  address: 'Villa 12',
  latitude: 25.2048,
  longitude: 55.2708,
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
    expect(formatPlaceForMaps(HOME)).toBe('25.2048,55.2708');
  });

  it('falls back to the name when there is no coordinate', () => {
    expect(formatPlaceForMaps({name: 'Somewhere new'})).toBe('Somewhere new');
  });

  it('falls back when only one half of the coordinate is present', () => {
    expect(formatPlaceForMaps({name: 'Half', latitude: 25.2})).toBe('Half');
  });
});

describe('buildGoogleMapsNavigationUrl', () => {
  it('targets the destination with the right travel mode', () => {
    expect(buildGoogleMapsNavigationUrl(MARINA, 'drive')).toBe(
      'google.navigation:q=25.2836%2C51.5042&mode=driving',
    );
  });

  it('uses walking mode for a walk', () => {
    expect(buildGoogleMapsNavigationUrl(MARINA, 'walk')).toBe(
      'google.navigation:q=25.2836%2C51.5042&mode=walking',
    );
  });

  it('encodes a name that has no coordinate', () => {
    const url = buildGoogleMapsNavigationUrl(
      {name: 'Blue Bay Tower'},
      'drive',
    );
    expect(url).toBe('google.navigation:q=Blue%20Bay%20Tower&mode=driving');
  });
});

describe('buildGoogleMapsDirectionsUrl', () => {
  it('carries both ends of the trip', () => {
    const url = buildGoogleMapsDirectionsUrl(HOME, MARINA, 'drive');
    expect(url).toContain('origin=25.2048%2C55.2708');
    expect(url).toContain('destination=25.2836%2C51.5042');
    expect(url).toContain('travelmode=driving');
    expect(url).toContain('api=1');
  });

  it('is the documented google.com/maps/dir URL', () => {
    expect(buildGoogleMapsDirectionsUrl(HOME, MARINA, 'drive')).toMatch(
      /^https:\/\/www\.google\.com\/maps\/dir\/\?/,
    );
  });

  it('encodes both ends', () => {
    const url = buildGoogleMapsDirectionsUrl(
      {name: 'Blue Bay Tower'},
      {name: 'Red Bay Tower'},
      'walk',
    );
    expect(url).toContain('origin=Blue%20Bay%20Tower');
    expect(url).toContain('destination=Red%20Bay%20Tower');
    expect(url).toContain('travelmode=walking');
  });
});
