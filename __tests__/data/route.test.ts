import {getRouteSummary, ROUTE_SUMMARIES, TRAVEL_MODES} from '../../src/data/route';
import {buildRouteCoordinates, buildRouteRegion} from '../../src/data/routeGeometry';
import {SAVED_PLACES} from '../../src/data/places';

describe('getRouteSummary', () => {
  it('covers every travel mode', () => {
    for (const mode of TRAVEL_MODES) {
      const summary = getRouteSummary(mode);
      expect(summary.duration).toBeTruthy();
      expect(summary.distance).toBeTruthy();
      expect(summary.arrival).toBeTruthy();
      expect(summary.legs.length).toBeGreaterThan(0);
    }
  });

  it('returns the drive summary for the drive mode', () => {
    expect(getRouteSummary('drive')).toEqual(ROUTE_SUMMARIES.drive);
    expect(getRouteSummary('drive').duration).toBe('24 min');
  });

  it('falls back to the drive summary for an unknown mode', () => {
    // @ts-expect-error — deliberately passing a mode that cannot exist.
    expect(getRouteSummary('teleport')).toEqual(ROUTE_SUMMARIES.drive);
  });
});

describe('buildRouteCoordinates', () => {
  const pickup = SAVED_PLACES[0];
  const dropoff = SAVED_PLACES[1];

  it('starts at the pickup and ends at the drop-off', () => {
    const coordinates = buildRouteCoordinates(pickup, dropoff);
    expect(coordinates[0]).toEqual({
      latitude: pickup.latitude,
      longitude: pickup.longitude,
    });
    expect(coordinates[coordinates.length - 1]).toEqual({
      latitude: dropoff.latitude,
      longitude: dropoff.longitude,
    });
  });

  it('produces at least two points so a polyline can be drawn', () => {
    expect(buildRouteCoordinates(pickup, dropoff).length).toBeGreaterThanOrEqual(2);
  });
});

describe('buildRouteRegion', () => {
  it('centres the camera on the route and pads it', () => {
    const pickup = SAVED_PLACES[0];
    const dropoff = SAVED_PLACES[1];
    const region = buildRouteRegion(pickup, dropoff);

    expect(region.latitudeDelta).toBeGreaterThan(0);
    expect(region.longitudeDelta).toBeGreaterThan(0);
    expect(region.latitude).toBeGreaterThan(
      Math.min(pickup.latitude!, dropoff.latitude!),
    );
    expect(region.latitude).toBeLessThan(
      Math.max(pickup.latitude!, dropoff.latitude!),
    );
  });
});
