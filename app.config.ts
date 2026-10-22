import type {ConfigContext, ExpoConfig} from 'expo/config';

/**
 * The dynamic app config.
 *
 * WHY A `app.config.ts` AND NOT AN `app.json`
 *
 * `app.json` is static JSON — it cannot read an environment variable.
 * The Google Maps API key has to come from the environment, because a
 * key committed to the repository is a key that ends up in somebody
 * else's APK. `app.config.ts` is the same config written in
 * TypeScript, evaluated at build time, and it can read `process.env`.
 *
 * The static half still lives in `app.json`; this file receives it as
 * `config` and layers the dynamic parts on top. That keeps the
 * difference between "what the app is" and "what the build needs"
 * visible.
 *
 * NOTE FOR AN RN-CLI READER
 *
 * A bare React Native app has no config plugin system at all —
 * native project edits are made by hand in `android/` and `ios/`.
 * Expo's config plugins are the replacement for that: a plugin
 * receives the config, mutates the native projects during
 * `expo prebuild`, and the generated `android/` folder is disposable
 * (it is regenerated, never edited by hand).
 */

/**
 * The Google Maps SDK key for Android.
 *
 * Read from `.env` (Expo loads `.env` files automatically for
 * `EXPO_PUBLIC_*` and `NODE_ENV` variables). The key is restricted in
 * the Google Cloud console to this app's package name and SHA-1, and
 * it is NEVER committed — `.env` is in `.gitignore`.
 */
const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export default ({config}: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Wayfare',
  slug: 'wayfare',
  scheme: 'wayfare',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  ios: {
    ...config.ios,
    bundleIdentifier: 'com.codenzic.wayfare',
    config: {
      googleMapsApiKey,
    },
  },
  android: {
    ...config.android,
    package: 'com.codenzic.wayfare',
    config: {
      googleMaps: {
        apiKey: googleMapsApiKey,
      },
    },
    // "Use current location" needs fine + coarse location.
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
    ],
  },
  plugins: [
    // The Expo Router plugin registers the deep-link scheme and the
    // `expo-router/entry` bootstrap.
    'expo-router',
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey: googleMapsApiKey,
        iosGoogleMapsApiKey: googleMapsApiKey,
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Wayfare uses your location to set the start of your trip.',
      },
    ],
  ],
  experiments: {
    ...config.experiments,
    typedRoutes: true,
  },
  extra: {
    // Exposed to the app through `expo-constants`. Useful for
    // checking at runtime whether the build was made with a Maps key.
    googleMapsApiKeyConfigured: Boolean(googleMapsApiKey),
  },
});
