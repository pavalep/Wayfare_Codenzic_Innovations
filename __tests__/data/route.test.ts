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
  /**
   * The map is a phone screen and the sheet leaves the top 37 % of it
   * visible at the sheet's resting height.
   */
  const options = {
    mapWidth: 1080,
    mapHeight: 2400,
    anchorRatio: 0.185,
    bandRatio: 0.37,
  };

  const pickup = SAVED_PLACES[0];
  const dropoff = SAVED_PLACES[1];

  it('frames the route inside the band above the sheet', () => {
    const region = buildRouteRegion(pickup, dropoff, options);

    expect(region.latitudeDelta).toBeGreaterThan(0);
    expect(region.longitudeDelta).toBeGreaterThan(0);

    /**
     * Both ends of the route have to be inside what the camera shows,
     * or a marker ends up off the map.
     */
    expect(region.latitudeDelta).toBeGreaterThan(
      Math.abs(dropoff.latitude! - pickup.latitude!),
    );
    expect(region.longitudeDelta).toBeGreaterThan(
      Math.abs(dropoff.longitude! - pickup.longitude!),
    );
  });

  it('moves the route up the screen when the band moves up', () => {
    const low = buildRouteRegion(pickup, dropoff, {
      ...options,
      anchorRatio: 0.1,
    });
    const high = buildRouteRegion(pickup, dropoff, {
      ...options,
      anchorRatio: 0.4,
    });

    /**
     * A lower anchor puts the camera further south, so the route sits
     * higher up the screen.
     */
    expect(low.latitude).toBeLessThan(high.latitude);
  });

  it('keeps the route the same size whichever band it is anchored to', () => {
    const low = buildRouteRegion(pickup, dropoff, {
      ...options,
      anchorRatio: 0.1,
    });
    const high = buildRouteRegion(pickup, dropoff, {
      ...options,
      anchorRatio: 0.4,
    });

    expect(low.latitudeDelta).toBe(high.latitudeDelta);
    expect(low.longitudeDelta).toBe(high.longitudeDelta);
  });
});
