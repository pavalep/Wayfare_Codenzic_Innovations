import {
  defaultLocationTarget,
  isTripComplete,
  swapEnds,
} from '../../src/utils/tripFlow';
import {SAVED_PLACES} from '../../src/data/places';

const HOME = SAVED_PLACES[0];
const MARINA = SAVED_PLACES[1];

describe('defaultLocationTarget', () => {
  it('opens on the pickup, because the trip starts there', () => {
    expect(defaultLocationTarget(null)).toBe('pickup');
  });

  it('moves to the drop-off once a pickup exists', () => {
    expect(defaultLocationTarget(HOME)).toBe('dropoff');
  });
});

describe('isTripComplete', () => {
  it('needs both ends of the trip', () => {
    expect(isTripComplete(null, null)).toBe(false);
    expect(isTripComplete(HOME, null)).toBe(false);
    expect(isTripComplete(null, MARINA)).toBe(false);
    expect(isTripComplete(HOME, MARINA)).toBe(true);
  });
});

describe('swapEnds', () => {
  it('swaps a complete trip', () => {
    expect(swapEnds(HOME, MARINA)).toEqual({
      pickup: MARINA,
      dropoff: HOME,
    });
  });

  it('refuses to swap a half-built trip', () => {
    // Swapping one end would silently move the place the user chose.
    expect(swapEnds(HOME, null)).toEqual({pickup: HOME, dropoff: null});
    expect(swapEnds(null, MARINA)).toEqual({pickup: null, dropoff: MARINA});
    expect(swapEnds(null, null)).toEqual({pickup: null, dropoff: null});
  });
});
