import * as Location from 'expo-location';
import {useCallback, useMemo, useState} from 'react';

import type {Place} from '../types';

/**
 * Resolves the device's current position.
 *
 * The permission is requested lazily — the moment the user actually
 * asks for "Use current" — rather than on app start, because a
 * permission prompt the user cannot explain is a bad first
 * impression.
 *
 * If the user declines (or the device has no fix), the hook resolves
 * to the fallback coordinate instead of failing. The flow has to
 * keep working: the trip planner is the product, the GPS is a
 * convenience.
 */
export function useCurrentLocation() {
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * The coordinate used when the real one is unavailable. It is the
   * same place the saved-places list starts from, so the map still
   * frames something sensible.
   *
   * Memoised because `locate` below closes over it — a fresh object
   * on every render would rebuild `locate` on every render too.
   */
  const fallback = useMemo<Place>(
    () => ({
      id: 'current-location',
      name: 'Current location',
      address: 'Using your device location',
      icon: 'target',
      latitude: 25.2048,
      longitude: 51.5042,
    }),
    [],
  );

  const locate = useCallback(async (): Promise<Place> => {
    setIsLocating(true);
    setError(null);

    try {
      const {status} = await Location.requestForegroundPermissionsAsync();

      if (status !== Location.PermissionStatus.GRANTED) {
        setError('Location permission denied — using the default position.');
        return fallback;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        ...fallback,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch {
      setError('Could not read your location — using the default position.');
      return fallback;
    } finally {
      setIsLocating(false);
    }
  }, [fallback]);

  return {locate, isLocating, error};
}
