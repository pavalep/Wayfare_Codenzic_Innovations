import React from 'react';
import {
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
  NunitoSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito-sans';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {useAuthStore, useTripStore} from '../src/state';
import {colors} from '../src/theme';

/**
 * The root layout — the single place the app's providers and its
 * navigation tree are declared.
 *
 * WHY THE FONTS LOAD HERE
 *
 * Every weight of Nunito Sans is a separate font file, and every
 * weight has a different family name (`NunitoSans_400Regular`,
 * `NunitoSans_600SemiBold`, …). They have to be registered before
 * the first screen paints, otherwise the text renders in the
 * platform default face for a frame and then swaps — a visible
 * flicker on Android. `useFonts` blocks that by returning `false`
 * until the fonts are ready.
 *
 * WHY THE PROVIDERS ARE HERE
 *
 * `GestureHandlerRootView` has to be the outermost view so the
 * gesture-handler runtime is initialised before anything else
 * touches it; `SafeAreaProvider` supplies the insets every screen
 * reads through `AppScreen`.
 */
export default function RootLayout(): React.JSX.Element | null {
  const [fontsLoaded, fontError] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
    NunitoSans_800ExtraBold,
  });

  const isSignedIn = useAuthStore(state => state.isAuthenticated);
  const authHydrated = useAuthStore(state => state.hasHydrated);
  const tripHydrated = useTripStore(state => state.hasHydrated);

  /**
   * Hold the first frame until the fonts are registered AND the
   * persisted stores have been read back.
   *
   * The second condition matters as much as the first. AsyncStorage
   * is asynchronous, so on a cold start the auth store still reads as
   * signed-out for a few frames even when a session is saved. The
   * `Stack.Protected` guard below and the entry route's redirect both
   * read that flag, so rendering early would bounce a signed-in user
   * to the login screen on every launch.
   *
   * If the font load FAILS we still render — a wrong typeface is a
   * much smaller problem than a blank screen.
   */
  if ((!fontsLoaded && !fontError) || !authHydrated || !tripHydrated) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {backgroundColor: colors.background.canvas},
            animation: 'slide_from_right',
          }}>
          {/*
            The entry route only decides where to send the user; it
            never renders anything of its own.
          */}
          <Stack.Screen name="index" options={{animation: 'none'}} />

          <Stack.Screen name="login" />

          {/*
            The register screen sits OUTSIDE the signed-in guard: a
            user who has no account yet has no session, and the
            guard would redirect them straight back to the login
            screen the moment they opened it.
          */}
          <Stack.Screen name="register" />

          {/*
            `Stack.Protected` is the idiomatic Expo Router guard. The
            three screens inside it only exist in the navigator while
            the user is signed in; navigating to one without a session
            is redirected to /login before the screen mounts.
          */}
          <Stack.Protected guard={isSignedIn} redirectTo="/login">
            <Stack.Screen name="set-locations" />
            <Stack.Screen name="trip-ready" />
            <Stack.Screen name="route-view" />
          </Stack.Protected>
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
