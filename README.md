# SpoonUp

React Native CLI application (Android + iOS), with full native project control. This is **not** an Expo-managed app — see [Expo Go / Expo Dev Client](#expo-go--expo-dev-client) below for why, and what to use instead for on-device testing.

## Requirements

| Tool | Version used in this repo |
| --- | --- |
| Node | ≥ 22.11.0 (developed on 26.0.0) |
| npm | 11.x |
| Java (JDK) | 17 (Zulu) |
| Ruby | see `Gemfile` (`>= 2.6.10`) |
| CocoaPods | via Bundler (`Gemfile`), currently 1.15.2 |
| Watchman | recommended |
| Xcode | current stable, with an iOS Simulator runtime installed |
| Android Studio / SDK | compileSdk 37, buildTools 37.0.0, NDK 27.1.12297006 |

Install the JS dependencies first:

```sh
npm install
```

## Environment setup

Values are injected at bundle time via `react-native-dotenv` (`babel.config.js`).

- `.env` — development (default). Set `API_BASE_URL` to your Mac's LAN IP and backend port, e.g. `http://192.168.1.15:5001`. Android emulator may use `http://10.0.2.2:5001`.
- `.env.production` — production (`https://spoonupfoods.com`).
- Staging has no file yet; create `.env.staging` once the staging URL exists.

Select a file for a build with `ENV_FILE`, then reset Metro's cache once:

```sh
ENV_FILE=.env.production npm run android
npx react-native start --reset-cache
```

The app throws at startup if `API_BASE_URL` is missing. Env files are gitignored; `.env.example` documents the keys.

**Do not treat these values as secrets.** They ship inside the JS bundle. Backend credentials stay on the server.

## Android setup

The Android project is otherwise ready to build as-is (SDK/NDK/build-tools versions above are already installed and verified). No additional setup is required beyond having Android Studio's SDK components installed.

## iOS setup

Install Ruby gems (CocoaPods) via Bundler once:

```sh
bundle install
```

Then, and every time native iOS dependencies change:

```sh
cd ios
bundle exec pod install
cd ..
```

## Running the application

Start Metro first, in its own terminal:

```sh
npm start
```

### Android emulator

```sh
npm run android
```

### iOS Simulator

```sh
npm run ios
```

### Physical Android device

1. Enable Developer Options + USB debugging on the device.
2. Connect via USB and confirm the device is visible: `adb devices`
3. `npm run android` — the CLI installs onto the connected device.
4. If Metro can't reach the device, run `adb reverse tcp:8081 tcp:8081`.

### Physical iPhone

1. Open `ios/SpoonUp.xcworkspace` in Xcode.
2. Select your device as the run target, set your Apple ID / development team under Signing & Capabilities.
3. Run from Xcode (⌘R), or `npx react-native run-ios --device "Your iPhone Name"`.
4. Device and Mac must be on the same network (or use USB) for Metro's connection.

## Expo Go / Expo Dev Client

This project is on **React Native 0.87.1**. The nearest Expo SDKs are:

- SDK 57 (latest stable) → bundles react-native **0.86.3**
- SDK 58 (preview, not GA) → bundles react-native **0.88.0-rc.1**

Neither matches 0.87.1 exactly, so installing Expo Go / Expo Dev Client packages now risks native/Fabric build mismatches. Per project decision, Expo is **intentionally not installed**. Physical-device testing uses the native workflows above (USB-debugged Android device, Xcode-signed iPhone build) instead.

If a future React Native upgrade lines up with a stable Expo SDK and on-device testing via Expo Go/Dev Client becomes valuable, that's a deliberate follow-up, not something to bolt on speculatively.

## Testing

```sh
npm test
```

Test files live under `__tests__/`, mirroring `src/` structure as it grows (`components/`, `features/`, `services/`, `utils/`).

## Linting

```sh
npm run lint
```

## Type checking

```sh
npm run typecheck
```

## Formatting

```sh
npm run format        # writes changes
npm run format:check  # CI-safe, fails on unformatted files
```

## Building

### Android debug APK

```sh
cd android && ./gradlew assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Android release

The `release` build type currently reuses the **debug keystore** (React Native CLI default). Before shipping, generate a real release keystore and update `android/app/build.gradle`'s `signingConfigs.release` — see [Signing your app](https://reactnative.dev/docs/signed-apk-android). Do not commit the release keystore or its passwords to git.

```sh
cd android && ./gradlew assembleRelease
```

### iOS

Archive/build through Xcode (`ios/SpoonUp.xcworkspace`) once a valid signing team/provisioning profile is configured — this can't be done headlessly without an Apple Developer account attached to this machine.

## Project architecture

Feature-based structure under `src/`; folders are added as real features land, not pre-created empty.

```
src/
├── assets/        # fonts, icons, images (add subfolders as assets arrive)
├── components/    # shared UI only — business-specific components live in features/
├── config/        # env.ts, constants.ts, appConfig.ts
├── features/      # one folder per feature (screens/components/hooks/services/types)
├── services/
│   └── api/       # client.ts, endpoints.ts, interceptors.ts — centralized fetch wrapper
├── theme/         # colors, spacing, radius, typography tokens
└── types/         # shared/global TypeScript types (e.g. env.d.ts)
```

Data flow: **Screen → hook → feature service → `services/api/client.ts` → backend.** Screens should not call `fetch` directly.

State management: no global store (Redux/Zustand/etc.) is installed. There's no cross-feature state yet to justify one — add it when a real need shows up, not preemptively.

Navigation: no navigation library installed yet — there's only a single placeholder screen. Add `@react-navigation/native` when a second real screen exists, and wire up `src/navigation/` (`AppNavigator`, `AuthNavigator`, `MainNavigator`) at that point.
