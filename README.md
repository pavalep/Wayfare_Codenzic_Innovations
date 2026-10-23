# Wayfare

A React Native trip planner, built with Expo.

Wayfare plans a route between two points in Doha: you choose a pickup and a drop-off, confirm the trip, and get a live map with the route, the distance, the travel time and turn-by-turn directions, with a hand-off to Google Maps for the actual drive.

<!-- Screens: Login → Create an account → Set locations → Trip ready → Route view -->

---

## What is in the app

| Screen | Route | What it does |
|--------|-------|--------------|
| Login | `/login` | Email and password. Only an account created through the register screen is accepted. |
| Create an account | `/register` | Full name, email, password and confirmation. The account is recorded on the device and the user is sent back to the login screen to sign in with it. |
| Set locations | `/set-locations` | Choose the pickup and the drop-off from the saved places, from the device's location, or by tapping the map. |
| Trip ready | `/trip-ready` | Confirm the two ends of the trip and pick the travel mode. |
| Route view | `/route-view` | The live map, the route, the summary and the turn-by-turn list. |

Four of those five screens come from the Figma file. The fifth — Create an account — does not, because the design draws the "Create an account" link at the foot of the login screen but supplies no frame for where it goes, while the assignment asks the login screen to "provide the login action and the option for a new user to create an account". That screen is therefore built from the login screen's own structure — logo, title, subtitle, labelled fields, pinned footer — so the two read as one product.

**Only a registered account can log in.** There is no backend, so the accounts created through the register screen *are* the accounts: they live on the device, they survive a restart, and the login screen accepts an account and nothing else. An email that was never registered is refused on the email field with a message that points at the register screen, and a password that does not match is refused on the password field. Registering and signing in are kept as two separate acts — the register screen records the account, says so in an alert, and sends the user back to the login screen to sign in with what they just chose.

**Leaving the trip-planning flow ends the session.** The back control on the location screen — the header chevron and the Android hardware back button — asks before it signs the user out, and both are intercepted: the hardware button through React Native's own `BackHandler`, the navigator through React Navigation's `usePreventRemove`.

**A trip does not survive a restart.** The session does, so a signed-in user is not asked to sign in on every launch, but the trip starts empty every time. A trip is work in progress, and restoring yesterday's pickup and drop-off onto a fresh launch would open the app on a trip the user did not just make.

---

## Quick start

```bash
npm install
cp .env.example .env        # macOS / Linux
copy .env.example .env       # Windows CMD
Copy-Item .env.example .env  # Windows PowerShell
```

Then fill in `.env` — at minimum the Google Maps key — and:

```bash
npm start              # the dev server
npm run android        # build and run on an Android device or emulator
```

For an APK:

```bash
npm run build:apk                # debug
npm run build:apk -- --release   # release
```

The build script prebuilds the native project, restores the machine-specific settings a prebuild wipes, hands Gradle the signing values from `.env`, and copies the finished APK to `artifacts/`.

---

## The test APK

The hand-over artefact is a **release** build: the JavaScript is bundled into the APK and compiled to Hermes bytecode, so it runs on its own with no Metro, no dev server and no cable. It is signed with a real release key, so it installs over itself cleanly later.

```
npm run build:apk -- --release
```

The output lands at `android/app/build/outputs/apk/release/app-release.apk`, and the build script copies it to `artifacts/wayfare-release.apk`.

**It is signed with a release keystore, not the debug one.** The key lives at `keystores/wayfare-release.keystore` and its passwords live in `.env`. Neither is committed — a keystore is a private key, and losing it means the app can never be updated in place. The signing block in `android/app/build.gradle` names those values rather than containing them, and the build script puts them into the environment, so the committed project carries no password.

**The Maps key has to know about the release fingerprint.** The Google Maps key is restricted to this app's package name plus a signing SHA-1, and a release APK signed with a different key has a different fingerprint. The release key's SHA-1 is:

```
7E:C4:75:F0:FF:9F:9C:56:D4:CB:9C:2B:FB:94:54:39:C0:D9:28:A9
```

Add it in the Google Cloud console: **Credentials → the API key → Application restrictions → Android apps → Add**, with the package name `com.codenzic.wayfare` and that fingerprint. Until it is added the app installs and runs, but the live map draws blank tiles.

**To install it on a phone**, enable *Install unknown apps* for whatever is opening the file, then tap it. Or over ADB:

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

---

## The Google Maps key, and what happens without one

The route screen uses `react-native-maps` with the Google Maps provider, so it needs a Maps SDK for Android key. The key is **never committed**. `app.config.ts` reads it from the environment and writes it into `android/app/src/main/res/values/key.xml` during `expo prebuild`; the `AndroidManifest.xml` refers to the value **by name** (`@string/google_maps_key`) rather than carrying it literally, so the committed manifest holds no key at all. `.env` and `key.xml` are both git-ignored.

To get one:

1. Open the [Google Cloud console](https://console.cloud.google.com/), create or pick a project, and **enable billing** — the Maps SDK for Android requires it, and the free tier covers 28,000 map loads a month, so a demo app costs nothing.
2. Enable **Maps SDK for Android** under APIs & Services → Library.
3. Create an API key under Credentials → Create credentials → API key.
4. **Restrict it**: Android apps → package name `com.codenzic.wayfare` plus the signing SHA-1. Both the debug key's and the release key's fingerprint should be listed, so the same key works for a development build and for the hand-over APK.

Without a key the app still builds and installs. The Maps SDK for Android throws a `FATAL EXCEPTION` when it is asked for a map it cannot authorise, and no JavaScript error boundary can catch that, so the app never mounts a map it cannot authorise: `useLiveMapEnabled()` reads a flag that `app.config.ts` writes at build time, and the route screen falls back to the design's own flat map artwork instead.

The `key.xml` file is written by every `expo prebuild`, because `expo prebuild` deletes `android/` and writes it again. It has to exist at build time — a manifest that refers to a string resource that is not there is a compile error, not a warning — so `scripts/build-android.mjs` writes it too, in case a build is run against an existing `android/` with `--no-prebuild`.

---

## Architecture

### Navigation — Expo Router, not React Navigation

The `app/` directory is the route table. Every file in it is a one-line re-export; the implementation lives in `src/screens/<Name>/<Name>.tsx`, so a screen is a plain React component that can be rendered in a test without a router. `src/navigation/routes.ts` holds the path strings, because a typo in `/trip-ready` is a runtime 404 in Expo Router but a compile error in `ROUTES.tripReady`.

The three trip screens sit inside `Stack.Protected` with `guard={isSignedIn}` and `redirectTo="/login"`. The register screen deliberately sits outside that guard: a user with no account has no session, so a guard on it would redirect them straight back to the login screen the moment they opened it.

### Styling — `StyleSheet.create` over a strict token layer

`src/theme/tokens.ts` holds the only colours, spacing steps, radii and shadows in the app, and `src/theme/typographyStyles.ts` holds the type styles. There is no CSS-in-JS library and no NativeWind: the design's exact line-heights, letter-spacing and shadow spreads are expressed as values, and a value is easier to match to a Figma frame than a class name is.

The discipline is mechanical rather than aspirational: ESLint bans raw colour literals everywhere except `src/theme/` and `src/constants/`, where the definitions live. Without that rule the tokens rot — one inline `#F1521F` in a screen and the brand colour becomes two values that drift apart.

### State — zustand, with `persist` on the session only

Exactly two stores exist, both in `src/state` with a barrel at `src/state/index.ts`:

- `useAuthStore` (`src/state/authStore.ts`) — the signed-in email, `isAuthenticated`, and the **accounts registered on this device**. `register` records an account (name, email, and a digest of the password); `signIn` accepts an account and nothing else. `signOut` ends the session and leaves the accounts alone, because the accounts are not the session.
- `useTripStore` (`src/state/tripStore.ts`) — the pickup, the drop-off and the active travel mode, plus a `swapEnds` action that exchanges the two ends of the trip and refuses to act while only one of them is chosen. **This store is not persisted.**

`useAuthStore` uses zustand v5's `persist` middleware over AsyncStorage under the key `wayfare.auth`, with `partialize` keeping the functions out of storage.

**The password is never stored in the clear.** The account holds a digest, not the password — see `src/utils/hash.ts`. That module is explicit about what the digest is worth: it is a plain FNV-1a hash, chosen because it is four lines of arithmetic and no dependency, and it exists so the password is not sitting in AsyncStorage as plain text. **It is not a security boundary.** A real build would never do this — the server would hash with bcrypt or argon2 and the client would never see a digest at all.

**The hydration gate.** AsyncStorage is asynchronous, so for the first few frames after a cold start the auth store still holds its initial state even though a session is saved on disk. That matters because the router guard reads `isAuthenticated`: a guard that fired before hydration finished would bounce a signed-in user to `/login` on every launch, and the persisted session would be pointless. The store therefore exposes a `hasHydrated` flag, flipped in `onRehydrateStorage`, and `app/_layout.tsx` holds the first frame until the fonts are ready *and* the session has been read. The flag is set even when the read fails, so a storage error releases the app instead of stranding it on a blank screen.

### Maps — one live map, one flat fallback

`react-native-maps` renders the route view and the map picker. `RouteMap` takes the two ends of the trip, draws the baked road geometry between them, and frames both in the band of screen the bottom sheet leaves visible.

The road geometry is baked, not live. `scripts/generate-road-routes.mjs` calls OSRM's public routing service once for each pair of saved places and writes the result to `src/data/roadRoutes.ts`, so the route follows real roads without the app needing a routing API at run time. `getRoadRoute` is the seam where a live Routes API call would go. The polyline's first and last points are pinned to the pickup's and the drop-off's exact coordinates, because OSRM snaps to the nearest road and the drawn line has to meet the markers.

The map picker restricts the user to the area the app can plan a trip in — a latitude/longitude box around the saved places — and refuses a tap outside it with an alert, because a point out there has no road geometry to draw and no name to show. The rule lives in `src/data/serviceArea.ts` and is unit-tested against the saved places, so the box and the data cannot drift apart.

The map's buttons are the design's own: a back chevron, a layers button that genuinely toggles between the standard and satellite map types, and a traffic chip. The white rounded square behind each button is drawn by the button, not baked into the artwork, and the buttons carry the design's one-pixel hairline rather than a shadow.

### Typography — one file per weight

Each Nunito Sans weight is its own file in `src/assets/fonts/`, and `fontFamily` names the weight. `fontWeight` is never set alongside `fontFamily` — on Android, setting both makes the system pick a synthetic weight and the text stops matching the design.

### Icons — transcribed, never invented

Every icon is a hand-inlined `react-native-svg` component in `src/components/core/AppIcon/`, transcribed from the Figma exports. Nothing is drawn from imagination.

Every `<Svg>` root carries `fill="none"`, exactly as the Figma exports do. This is not a detail: every Figma SVG export starts with `<svg … fill="none">`, and dropping that attribute makes `react-native-svg` fill every stroked path black. Every icon in the app was a black blob until that was fixed.

### The launcher icon and the splash screen

The launcher icon and the splash screen are the same mark: `scripts/generate-brand-assets.mjs` renders them from the Figma logo in `design-reference/logo.svg`, so the app opens with the artwork it is installed as. The script copies the logo's three paths **verbatim** and changes only the colour of the stroke, which is what keeps the icon, the splash and the in-app logo from drifting apart. The sizes are the design work, and they are written down in the script: the adaptive icon's foreground is scaled so the glyph's half-diagonal (297 px) fits inside Android's 313 px safe circle, and the legacy icon is a full-bleed orange square because the launcher applies its own shape to it. Shipping the default Expo logo — a pale grid with guide lines — would have made the installed app read as an unfinished template.

The splash is the brand orange with the white glyph on it, and the native theme's `colorPrimary` is set to the same orange through a small config plugin in `app.config.ts`. The template ships a dark blue there, and the native theme hands that colour to the things React Native does not draw — the text cursor, the default ripple, the system dialogs — so leaving it blue would put a blue cursor in an orange app.

---

## Project layout

```
app/                        Expo Router route tree (thin re-exports only)
  _layout.tsx  index.tsx  login.tsx  register.tsx  set-locations.tsx  trip-ready.tsx  route-view.tsx
src/
  components/
    core/     AppButton  AppCard  AppFooter  AppIcon  AppScreen  AppText  AppTextInput
    layout/   LocationActions  LocationCard  ModeTabs  PlaceListItem  ScreenHeader  TurnByTurnList
    map/      RouteMap  RouteSummarySheet  StartNavigationButton  StaticRouteMap
  constants/  brand.ts  fontFamily.ts  strings.ts
  data/       places.ts  roadRoutes.ts  route.ts  routeGeometry.ts  serviceArea.ts
  hooks/      useCurrentLocation.ts  useKeyboardAwareForm.ts  useLiveMapEnabled.ts
              useLoginForm.ts  useRegisterForm.ts  useTripPlan.ts
  navigation/ routes.ts  useAppRouter.ts
  screens/    LoginScreen  RegisterScreen  SetLocationsScreen  TripReadyScreen  RouteViewScreen
  state/      authStore.ts  tripStore.ts
  theme/      tokens.ts  typographyStyles.ts
  types/      index.ts
  utils/      hash.ts  maps.ts  tripFlow.ts  validation.ts
assets/
  icon.png  splash-icon.png  favicon.png
  android-icon-background.png  android-icon-foreground.png  android-icon-monochrome.png
  map/        map-background.png — the design's flat map export, used by the no-key fallback
android/                     the native project — committed, but not its build output
design-reference/            the exported Figma SVGs the icons were transcribed from
  screens/                   the design frames, for side-by-side comparison
scripts/      build-android.mjs  generate-brand-assets.mjs  generate-road-routes.mjs
```

### Scripts

| Script | Command | What it does |
|--------|---------|--------------|
| `npm start` | `expo start` | Starts the Expo dev server |
| `npm run android` | `expo run:android` | Prebuilds the native project and runs the app on an Android device or emulator |
| `npm run ios` | `expo run:ios` | The same for iOS |
| `npm run web` | `expo start --web` | Runs the app in a browser (the map is Android/iOS only) |
| `npm run prebuild` | `expo prebuild --platform android` | Regenerates the `android/` directory from `app.json` and `app.config.ts` |
| `npm run build:apk` | `node scripts/build-android.mjs` | Prebuilds and then builds the APK through Gradle; `-- --release` for a release build, `-- --no-prebuild` to reuse the existing `android/` |
| `npm run typecheck` | `tsc --noEmit` | Type check |
| `npm run lint` | `eslint .` | Lint, including the raw-colour ban |
| `npm run lint:fix` | `eslint . --fix` | Lint with autofix |
| `npm run format` | `prettier --write "**/*.{ts,tsx,js,json,md}"` | Format the tree |
| `npm run format:check` | `prettier --check "**/*.{ts,tsx,js,json,md}"` | Check formatting |
| `npm test` | `jest` | Run the test suite |
| `npm run test:watch` | `jest --watch` | Run the tests in watch mode |

The `android/` project is generated by `expo prebuild` and is disposable — it is never edited by hand, and the two machine-specific files in it (`local.properties` and the local JVM settings in `gradle.properties`) are not committed. The build script puts them back after a prebuild.

---

## Verification status

Measured in this environment, on the current tree:

| Check | Command | Result |
|-------|---------|--------|
| Type check | `npx tsc --noEmit` | Clean, exit 0 |
| Lint | `npx eslint .` | Clean, exit 0 |
| Tests | `npx jest --verbose` | 9 suites passed, 76 tests passed, 0 failed |

**The app has been run on an Android emulator**, end to end, and the flow was walked screen by screen: registering an account, signing in with it, choosing both ends of the trip, confirming it, and reading the route with its turn-by-turn list and its handoff to Google Maps. That pass is what the map fallback, the two-phase location screen, the Google Maps handoff and the on-device fixes came out of.

The nine test suites cover the pure logic — login and registration validation, the saved-places search, the route summary and geometry helpers, the trip-flow rules, the Google Maps URL builders, the route projection, the service-area boundary and the auth store's persistence contract. There are no component or screen tests.

---

## Known deviations from the Figma source

The app does not match the design frame-for-frame, and the differences are deliberate:

- **The register screen has no frame in the design.** The design draws the "Create an account" link but supplies no screen behind it, so it is built from the login screen's own structure.
- **The drop-off step moved.** The design splits the trip across two frames — "Set locations" draws the saved-places list for the pickup, "Trip ready" draws a search field for the drop-off. Both ends are chosen on one screen instead, because the first screen's own subtitle says "Set pickup and drop-off" and then only sets the pickup.
- **The rounded-square control on the location card swaps the two ends** rather than locating the user. Locating the user is its own action, one row below, with the target icon the design gives it.
- **The map falls back to the design's own flat artwork** when the build carries no API key, because the Maps SDK cannot be mounted without one.
- **"Ride" opens Google's `driving` mode**, because a ride-hailing car is a car and the Maps URL's travel modes do not include a ride-hailing one.
- **The design still shows placeholder text where the app shows the selected place.**

---

## Design traceability

`design-reference/` holds the exported Figma SVGs the icons were transcribed from, and `design-reference/screens/` holds the design frames as images for side-by-side comparison against the running app. `.design/figma_report.txt` holds the node-by-node dump of the design — every element with its position, size and fill — which is what the layout numbers in the code were measured from.

Every icon in the app can be traced back to one of those exports, and every spacing, radius and type value in `src/theme/` came from a measured node rather than from a guess.
