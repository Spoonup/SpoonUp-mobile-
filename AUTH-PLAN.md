# Auth plan: mobile-number login, Google, Apple

Read-only findings from `SpoonUp-Website/server/index.js` and `server/googleAuth.js` (2026-11-14).

## What exists today

- Username/email + password: `POST /api/auth/signup`, `/login`, `/logout`, `GET /api/auth/me`. The app uses these. Session token is `usr_...`, sent as Bearer.
- Google (web only): Authorization Code flow with a server secret. `GET /api/auth/google` redirects to Google; `GET /api/auth/google/callback` creates the session, then redirects to the website path `/auth/google/callback?code=<one-time code>`; `POST /api/auth/google/exchange {code}` returns `{token,user}`. Production reports `googleAuthEnabled: true`. `next` only accepts relative paths, so the flow always ends on the website, never in the app. `state` and exchange codes live in per-instance memory (see risks).
- Phone: only a profile field. There is NO OTP, SMS or phone-login route.
- Apple: nothing.

So the mobile screen's phone login, Google and Apple cannot work against today's backend. The buttons stay disabled ("Soon"); nothing client-side was built that would pretend to work. A WebView cannot reuse the Google web flow: Google rejects OAuth in embedded WebViews.

## Backend endpoints to add (owner/backend team)

1. Phone OTP: `POST /api/auth/otp/send {phone}` and `POST /api/auth/otp/verify {phone, code}` returning the same `{token,user}` as login. Needs an SMS provider (MSG91 is the usual India choice, DLT-registered sender and template; Twilio works too), hashed codes with 5-10 min expiry, max attempts, per-phone and per-IP rate limits, and a rule for new numbers (create account vs. require signup). Phone must be unique per user (check the DB constraint first).
2. Google, smallest change: let `GET /api/auth/google?mobile=1` end on `spoonup://auth?code=<exchange code>` instead of the website path (allow-list that one scheme), then reuse `/api/auth/google/exchange`. No new Google logic.
   Google, native alternative: `POST /api/auth/google/token {idToken}`. Verify signature, `aud` (must match one of your iOS/Android/web client IDs), `iss`, `exp`, `email_verified`, then reuse `linkOrCreateGoogleUser`.
3. Apple: `POST /api/auth/apple/token {identityToken, fullName?}`. Verify against Apple's JWKS (`https://appleid.apple.com/auth/keys`), `iss`, `aud` (= app bundle id `com.spoonup.mobile`), `exp`. Apple sends the name and email only on the first sign-in, so store them then. Handle "hide my email" relay addresses.

All new routes go behind `userAuthLimiter`. Move OAuth `state`/exchange codes out of per-instance memory (DB or shared cache) before relying on them with more than one Cloud Run instance.

## What the app needs

- Phone OTP: no new native library. The UI exists (`MobileLogin`); point `authService.requestMobileOtp/verifyMobileOtp` at the new routes. Works in Expo Go.
- Google, option A (above): `expo-web-browser` (`openAuthSessionAsync`) plus the existing `scheme: spoonup`. Works in Expo Go only if the redirect uses the Expo Go scheme; use a development build for the real `spoonup://` scheme.
- Google, option B: `@react-native-google-signin/google-signin` (needs a dev build, not Expo Go) or `expo-auth-session`. Google Cloud Console OAuth client IDs: iOS (bundle `com.spoonup.mobile`), Android (package `com.spoonup.mobile` plus SHA-1 of the debug and release/Play signing keys), and a Web client ID (used as `webClientId`/audience for the id token).
- Apple: `expo-apple-authentication`, iOS only (hide the button on Android; Apple sign-in on Android needs a web flow, skip it). Needs a paid Apple Developer account, the "Sign in with Apple" capability on the App ID, and a development/production build. It does not work in Expo Go. App Store rule: if Google sign-in is offered, Sign in with Apple must be offered too.
- Expo Go limits: native Google and Apple sign-in need a dev build (`eas build --profile development` or `expo run:ios/android`).

## Order

1. Decide the product rule for phone numbers (one account per number, new numbers auto-create or not) and pick the SMS provider (MSG91 DLT registration takes days; start now).
2. Backend: OTP send/verify. App: wire `authService`. Test with the SMS provider's test mode.
3. Backend: Google mobile redirect (A) or id-token route (B). Create OAuth client IDs. App: add the library, enable the Google button.
4. Apple Developer account and capability. Backend Apple route. App: dev build, `expo-apple-authentication`, iOS-only button.
5. Ship a dev/TestFlight build before store submission; test account-linking (same email via password, Google and Apple).
