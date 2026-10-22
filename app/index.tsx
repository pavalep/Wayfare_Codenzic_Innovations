import React from 'react';
import {Redirect} from 'expo-router';

import {useAuthStore} from '../src/state';

/**
 * The entry route.
 *
 * Expo Router needs a root route to start from. This one does not
 * draw anything — it decides where the app should actually be:
 * a signed-in user goes straight to the location picker, everyone
 * else lands on the login screen.
 */
export default function Index(): React.JSX.Element {
  const isSignedIn = useAuthStore(state => state.isAuthenticated);

  return <Redirect href={isSignedIn ? '/set-locations' : '/login'} />;
}
