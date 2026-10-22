import {
  SAVED_PLACES,
  createCustomPlace,
  searchSavedPlaces,
} from '../../src/data/places';

describe('SAVED_PLACES', () => {
  it('matches the five places in the Figma design, in order', () => {
    expect(SAVED_PLACES.map(p => p.name)).toEqual([
      'Home',
      'Marina Office Tower',
      'Corniche Ferry Terminal',
      'Msheireb Metro Station',
      'Hamad International Airport',
    ]);
  });

  it('gives every place a unique id', () => {
    const ids = SAVED_PLACES.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('searchSavedPlaces', () => {
  it('returns everything for an empty query', () => {
    expect(searchSavedPlaces('')).toHaveLength(SAVED_PLACES.length);
    expect(searchSavedPlaces('   ')).toHaveLength(SAVED_PLACES.length);
  });

  it('matches on the name, case-insensitively', () => {
    const results = searchSavedPlaces('marina');
    expect(results.map(p => p.id)).toContain('marina-office-tower');
  });

  it('matches on the address', () => {
    const results = searchSavedPlaces('corniche promenade');
    expect(results.map(p => p.id)).toContain('corniche-ferry-terminal');
  });

  it('returns nothing when there is no match', () => {
    expect(searchSavedPlaces('zzzz-no-such-place')).toEqual([]);
  });
});

describe('createCustomPlace', () => {
  it('builds a place from the typed address', () => {
    const place = createCustomPlace('  12 Rue de Paris  ');
    expect(place.name).toBe('12 Rue de Paris');
    expect(place.address).toBe('12 Rue de Paris');
    expect(place.id).toBe('custom-12-rue-de-paris');
  });
});
