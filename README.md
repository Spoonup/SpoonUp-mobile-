# SpoonUp

Managed **Expo** app (SDK 58, React Native 0.88, React 19.3) for iOS + Android. Runs in **Expo Go**; no native `ios/`/`android/` folders are committed (they are prebuild output and gitignored).

## Requirements

- Node >= 22 and npm
- **Expo Go** on your phone (Play Store / App Store), on the **same Wi-Fi** as this machine

```sh
npm install
```

## Environment setup

Copy `.env.example` to `.env` (gitignored). Expo inlines `EXPO_PUBLIC_*` variables at bundle time:

| Variable | Meaning |
| --- | --- |
| `EXPO_PUBLIC_APP_ENV` | `development` / `staging` / `production` |
| `EXPO_PUBLIC_API_BASE_URL` | Backend origin, no trailing slash (use your Mac's LAN IP, not localhost, on a phone) |
| `EXPO_PUBLIC_USE_MOCKS` | `true` (default) = in-app mocks, `false` = real backend |

Old names `API_BASE_URL`, `APP_ENV`, `USE_MOCKS` (react-native-dotenv) are no longer read. Restart with `npx expo start -c` after changing them. These values ship in the JS bundle: not secrets.

## Running

```sh
npm start            # expo start; scan the QR code with Expo Go
npm run android      # expo start --android
npm run ios          # expo start --ios
```

If the phone cannot reach the LAN URL, use `npx expo start --tunnel` (needs `@expo/ngrok`).

Fonts are loaded at runtime with `expo-font` (`App.tsx`); the session token is stored with `expo-secure-store`. Payment SDKs (Razorpay/Cashfree) are not Expo Go compatible; when added they need a dev build (`npx expo prebuild` + `expo run:*`).

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
