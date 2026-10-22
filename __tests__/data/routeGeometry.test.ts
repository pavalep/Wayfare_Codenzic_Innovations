import {
  buildRouteBounds,
  buildRouteCoordinates,
  projectCoordinate,
} from '../../src/data/routeGeometry';
import {SAVED_PLACES} from '../../src/data/places';

const HOME = SAVED_PLACES[0];
const MARINA = SAVED_PLACES[1];

describe('buildRouteCoordinates', () => {
  it('starts at the pickup and ends at the drop-off', () => {
    const coordinates = buildRouteCoordinates(HOME, MARINA);
    expect(coordinates[0].latitude).toBe(HOME.latitude);
    expect(coordinates[0].longitude).toBe(HOME.longitude);
    expect(coordinates[coordinates.length - 1].latitude).toBe(
      MARINA.latitude,
    );
    expect(coordinates[coordinates.length - 1].longitude).toBe(
      MARINA.longitude,
    );
  });
});

describe('projectCoordinate', () => {
  const bounds = buildRouteBounds(HOME, MARINA);

  it('puts the north-west corner of the box at the top-left', () => {
    const point = projectCoordinate(
      {latitude: bounds.maxLatitude, longitude: bounds.minLongitude},
      bounds,
      200,
      100,
    );
    expect(point.x).toBeCloseTo(0);
    expect(point.y).toBeCloseTo(0);
  });

  it('puts the south-east corner of the box at the bottom-right', () => {
    const point = projectCoordinate(
      {latitude: bounds.minLatitude, longitude: bounds.maxLongitude},
      bounds,
      200,
      100,
    );
    expect(point.x).toBeCloseTo(200);
    expect(point.y).toBeCloseTo(100);
  });

  it('puts north above south', () => {
    const north = projectCoordinate(
      {latitude: bounds.maxLatitude, longitude: bounds.minLongitude},
      bounds,
      200,
      100,
    );
    const south = projectCoordinate(
      {latitude: bounds.minLatitude, longitude: bounds.minLongitude},
      bounds,
      200,
      100,
    );
    expect(north.y).toBeLessThan(south.y);
  });

  it('survives a zero-length span instead of dividing by zero', () => {
    const degenerate = {
      minLatitude: 25,
      maxLatitude: 25,
      minLongitude: 51,
      maxLongitude: 51,
    };
    const point = projectCoordinate(
      {latitude: 25, longitude: 51},
      degenerate,
      200,
      100,
    );
    expect(Number.isFinite(point.x)).toBe(true);
    expect(Number.isFinite(point.y)).toBe(true);
  });
});
