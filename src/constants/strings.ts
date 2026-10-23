// ─── User-facing copy ─────────────────────────────────────────
//
// Every string the user reads, grouped by screen. Keeping the copy
// here (instead of inline in components) makes it reviewable in one
// place and keeps the components free of hard-coded English.
//
// All text is transcribed verbatim from the Figma source file
// ("React Native Assignment (Copy)", Page 1), except where a line is
// marked as added — the register screen has no Figma frame, and the
// trip-ready screen's title is the one the Figma gives its frame.

export const STRINGS = {
  login: {
    /** "Welcome back" */
    title: 'Welcome back',
    /** "Log in to plan a trip and follow your route turn by turn." */
    subtitle: 'Log in to plan a trip and follow your route turn by turn.',
    /** "Email" */
    emailLabel: 'Email',
    /** "you@example.com" */
    emailPlaceholder: 'you@example.com',
    /** "Password" */
    passwordLabel: 'Password',
    /** "Enter your password" */
    passwordPlaceholder: 'Enter your password',
    /** "Forgot password?" */
    forgotPassword: 'Forgot password?',
    /** "Log in" */
    submit: 'Log in',
    /** "New to Wayfare?" */
    newToBrand: 'New to Wayfare?',
    /** "Create an account" */
    createAccount: 'Create an account',
    /** Validation messages. */
    errors: {
      emailRequired: 'Enter your email address',
      emailInvalid: 'Enter a valid email address',
      passwordRequired: 'Enter your password',
      passwordShort: 'Password must be at least 6 characters',
      /**
       * Added — the login only accepts accounts that were created on
       * the register screen, so an email nobody registered has to be
       * refused with a message that says where to go next.
       */
      unknownAccount:
        'No account with this email. Create an account first.',
      /** Added — the account exists but the password does not match. */
      wrongPassword: 'That password is not right. Try again.',
    },
  },

  /**
   * Added — the register screen is required by the assignment
   * ("the option for a new user to create an account") but the Figma
   * draws no frame for it, so it borrows the login screen's structure
   * exactly: logo, title, subtitle, labelled fields, pinned footer.
   */
  register: {
    /** "Create your account" */
    title: 'Create your account',
    /** "Join Wayfare to plan trips and follow your route turn by turn." */
    subtitle: 'Join Wayfare to plan trips and follow your route turn by turn.',
    /** "Full name" */
    nameLabel: 'Full name',
    /** "Your name" */
    namePlaceholder: 'Your name',
    /** "Email" */
    emailLabel: 'Email',
    /** "you@example.com" */
    emailPlaceholder: 'you@example.com',
    /** "Password" */
    passwordLabel: 'Password',
    /** "Enter your password" */
    passwordPlaceholder: 'Enter your password',
    /** "Confirm password" */
    confirmLabel: 'Confirm password',
    /** "Repeat your password" */
    confirmPlaceholder: 'Repeat your password',
    /** "Create account" */
    submit: 'Create account',
    /** "Already have an account?" */
    haveAccount: 'Already have an account?',
    /** "Log in" */
    signIn: 'Log in',
    /** Validation messages. */
    errors: {
      nameRequired: 'Enter your name',
      emailRequired: 'Enter your email address',
      emailInvalid: 'Enter a valid email address',
      passwordRequired: 'Enter your password',
      passwordShort: 'Password must be at least 6 characters',
      confirmRequired: 'Confirm your password',
      confirmMismatch: 'Passwords do not match',
      /** Added — an account already exists for this email. */
      emailTaken: 'An account with this email already exists',
    },
    /**
     * Added — the alert shown after a successful registration.
     *
     * Registering does NOT sign the user in. The account is recorded
     * and the user is sent back to the login screen, so the message
     * says exactly that.
     */
    successTitle: 'Registration successful',
    successMessage:
      'Your account is ready. Log in with your email and password.',
    /** The alert's dismiss button. */
    successAction: 'Log in',
  },

  locations: {
    /** "Where are you going?" */
    title: 'Where are you going?',
    /** "Step 1 of 2 · Set pickup and drop-off" */
    step: 'Step 1 of 2 · Set pickup and drop-off',
    /** "Pickup" */
    pickupLabel: 'Pickup',
    /** "Drop-off" */
    dropoffLabel: 'Drop-off',
    /** "Choose a starting point" */
    pickupPlaceholder: 'Choose a starting point',
    /** "Choose a destination" */
    dropoffPlaceholder: 'Choose a destination',
    /** "Use current" */
    useCurrent: 'Use current',
    /** "Pick on map" */
    pickOnMap: 'Pick on map',
    /** "Set as pickup" */
    setAsPickup: 'Set as pickup',
    /** "Set as drop-off" */
    setAsDropoff: 'Set as drop-off',
    /** "Next" */
    next: 'Next',
    /** "Home" — the first entry of the saved-places list. */
    homeLabel: 'Home',
    /**
     * Placeholder for the drop-off search field. Added — the Figma
     * prints the sentence "Keep typing to use it as a custom address"
     * but draws no field to type into.
     */
    searchPlaceholder: 'Search for a destination',
    /**
     * "No saved places match that. Keep typing to use it as a custom
     * address." — the empty state of the drop-off search.
     */
    noMatch:
      'No saved places match that. Keep typing to use it as a custom address.',
    /** Label of the button that accepts a typed custom address. */
    useCustomAddress: 'Use this address',
    /** "Use this location" — confirms a point picked on the map. */
    useThisLocation: 'Use this location',
    /** "Tap the map to choose a point" — the map-picker before a tap. */
    tapTheMap: 'Tap the map to choose a point',
    /**
     * Added — the name given to a point the user dropped on the map.
     * The map has no place names of its own, so the app names it.
     */
    pickedLocation: 'Picked location',
    /** Accessibility label for the swap control on the location card. */
    swapEnds: 'Swap pickup and drop-off',
    /** Accessibility label for the clear-selection control. */
    clearSelection: 'Clear selection',
    /**
     * Added — the alert shown when a map tap lands outside the area
     * the app can plan a trip in.
     */
    outOfAreaTitle: 'Outside the service area',
    outOfAreaMessage:
      'Pick a point inside Doha, where the saved places are.',
  },

  /**
   * Added — leaving the trip-planning flow ends the session.
   *
   * The back control on the location screen is the app's only way out
   * of a signed-in state, so it asks before it signs the user out.
   */
  signOut: {
    /** "Sign out?" */
    title: 'Sign out?',
    /** "You will need to log in again to plan a trip." */
    message: 'You will need to log in again to plan a trip.',
    /** The button that signs the user out. */
    confirm: 'Sign out',
    /** The button that stays signed in. */
    cancel: 'Stay signed in',
  },

  tripReady: {
    /**
     * "Trip ready" — the name the Figma gives this frame. The frame's
     * own header still reads "Where are you going?", which is the
     * previous screen's title; the frame name is the honest one for a
     * screen that shows a confirmed trip.
     */
    title: 'Trip ready',
    /** "Step 2 of 2 · Check your route" */
    step: 'Step 2 of 2 · Check your route',
    /** "Show route" — the action that opens the map. */
    showRoute: 'Show route',
    /** "Your trip" — the heading above the trip summary. */
    yourTrip: 'Your trip',
    /** "Fastest route" */
    fastestRoute: 'Fastest route',
    /** "Start navigation" */
    startNavigation: 'Start navigation',
  },

  route: {
    /** "Fastest route" */
    fastestRoute: 'Fastest route',
    /** "Drive" */
    drive: 'Drive',
    /** "Ride" */
    ride: 'Ride',
    /** "Walk" */
    walk: 'Walk',
    /** "Turn by turn" */
    turnByTurn: 'Turn by turn',
    /** "Start navigation" */
    startNavigation: 'Start navigation',
    /** "Heavy traffic near the marina" */
    traffic: 'Heavy traffic near the marina',
    /** A11y labels for the map controls. */
    back: 'Back',
    mapLayers: 'Map layers',
    /**
     * Shown when the app has no Google Maps key and falls back to the
     * design's own flat map. Added — without it the fallback would
     * look like a broken map rather than a deliberate preview.
     */
    mapPreview: 'Map preview',
  },
} as const;

/**
 * The saved places shown in the locations list, in the order the
 * Figma design lists them. Used by the mock places service.
 */
export const SAVED_PLACE_NAMES = [
  'Home',
  'Marina Office Tower',
  'Corniche Ferry Terminal',
  'Msheireb Metro Station',
  'Hamad International Airport',
] as const;
