/**
 * The service area — the box the map picker accepts points from.
 *
 * WHY THIS TEST EXISTS
 *
 * The app has no routing backend. The route it draws between two
 * places comes from baked road geometry for the places it knows
 * about, all of them in Doha. A point dropped on the map outside the
 * area would have no geometry to draw and no name to show, so the
 * picker refuses it.
 *
 * That rule is only worth anything if the box and the data agree, so
 * this test pins both halves: every saved place is inside the area,
 * and the boundary itself is treated as inside.
 */

import {SAVED_PLACES} from '../../src/data/places';
import {
  isInsideServiceArea,
  SERVICE_AREA,
  SERVICE_AREA_REGION,
} from '../../src/data/serviceArea';

describe('the service area', () => {
  it('holds every saved place', () => {
    for (const place of SAVED_PLACES) {
      expect(
        isInsideServiceArea({
          latitude: place.latitude as number,
          longitude: place.longitude as number,
        }),
      ).toBe(true);
    }
  });

  it('refuses a point outside the box', () => {
    expect(
      isInsideServiceArea({latitude: 24.4539, longitude: 54.3773}),
    ).toBe(false);
  });

  it('refuses a point that is only one coordinate outside', () => {
    expect(
      isInsideServiceArea({
        latitude: SERVICE_AREA.maxLatitude + 0.001,
        longitude: SERVICE_AREA.maxLongitude - 0.001,
      }),
    ).toBe(false);

    expect(
      isInsideServiceArea({
        latitude: SERVICE_AREA.minLatitude + 0.001,
        longitude: SERVICE_AREA.minLongitude - 0.001,
      }),
    ).toBe(false);
  });

  it('treats the boundary as inside', () => {
    expect(
      isInsideServiceArea({
        latitude: SERVICE_AREA.minLatitude,
        longitude: SERVICE_AREA.minLongitude,
      }),
    ).toBe(true);

    expect(
      isInsideServiceArea({
        latitude: SERVICE_AREA.maxLatitude,
        longitude: SERVICE_AREA.maxLongitude,
      }),
    ).toBe(true);
  });

  it('opens the camera on the middle of the area', () => {
    expect(SERVICE_AREA_REGION.latitude).toBeCloseTo(
      (SERVICE_AREA.minLatitude + SERVICE_AREA.maxLatitude) / 2,
      5,
    );
    expect(SERVICE_AREA_REGION.longitude).toBeCloseTo(
      (SERVICE_AREA.minLongitude + SERVICE_AREA.maxLongitude) / 2,
      5,
    );
  });

  it('shows the whole area inside the camera', () => {
    expect(SERVICE_AREA_REGION.latitudeDelta).toBeGreaterThan(
      SERVICE_AREA.maxLatitude - SERVICE_AREA.minLatitude,
    );
    expect(SERVICE_AREA_REGION.longitudeDelta).toBeGreaterThan(
      SERVICE_AREA.maxLongitude - SERVICE_AREA.minLongitude,
    );
  });
});
