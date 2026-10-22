import Constants from 'expo-constants';
import {useMemo} from 'react';

/**
 * Whether this build can use the live Google map.
 *
 * The answer is baked into the build, not decided at runtime: the
 * config plugin writes the API key into the Android manifest during
 * `expo prebuild`, and `app.config.ts` records whether a key was
 * present in `extra.googleMapsApiKeyConfigured`. Reading that flag
 * here means the route screen never mounts a Google map view that
 * the SDK cannot authorise.
 *
 * WHY THAT MATTERS ENOUGH TO HAVE A HOOK
 *
 * The Google Maps SDK for Android throws
 * `IllegalStateException: API key not found` on a background thread
 * when the key is missing, and the Android runtime turns that into a
 * FATAL EXCEPTION that no JavaScript error boundary can catch. The
 * only way to survive it is not to ask for the map in the first
 * place.
 */
export function useLiveMapEnabled(): boolean {
  return useMemo(() => {
    const extra = Constants.expoConfig?.extra as
      | {googleMapsApiKeyConfigured?: boolean}
      | undefined;

    return Boolean(extra?.googleMapsApiKeyConfigured);
  }, []);
}
