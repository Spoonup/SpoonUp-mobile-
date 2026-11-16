# Phone-number OTP login/signup plan

Read-only research, 2026-11-16. Backend: `/Users/sushantnatani/Desktop/SpoonUp/SpoonUp-Website/server` (Express 5, Supabase). No code was changed. Backend changes below are proposals for the backend owner; per CLAUDE.md the backend stays the source of truth.

## 1. How users and sessions work today

- Tables (`supabase/migrate-auth-payments.sql:51-66`): `users(id TEXT PK 'user-<uuid>', username NOT NULL UNIQUE, password_hash NOT NULL, email NOT NULL UNIQUE, phone TEXT NOT NULL, created_at)` and `user_sessions(token PK, user_id FK ON DELETE CASCADE, expires_at)`. Later migrations: case-insensitive unique indexes on username and email (`migrate-security-hardening.sql:26-27`), `google_id` (unique partial index) and `auth_provider ('password'|'google')` (`migrate-google-auth.sql`). RLS on, anon/authenticated revoked, so only the service role touches these.
- **`phone` has no unique index, no verified flag, and is NOT NULL.** Stored as the canonical 10-digit Indian mobile (`normalizePhone`, `server/validators.js:3,20`, regex `^[6-9]\d{9}$`; strips a leading 91 or 0). Legacy rows may hold other spellings; Google-created users have `phone: ''` (`googleAuth.js:206`). Duplicates across users are therefore possible today.
- Token: `createUserSessionToken()` = `usr_` + 32 random bytes hex (`security.js:218`). `dbCreateUserSession(userId)` (`db.js:716`) stores only `sha256(token)` with 30-day expiry (`USER_SESSION_TTL_MS`, `security.js:215`) and returns the raw token once. `dbGetUserBySessionToken` (`db.js` ~745) hashes, looks up, deletes expired. `authenticateUser` (`index.js:~615`) reads `Authorization: Bearer usr_...` or `x-user-token`.
- Routes: `POST /api/auth/signup` (`index.js:1163`, 201 `{success,token,user,referral}`), `/login` (`:1221`, `{success,token,user}`), `/logout`, `GET /api/auth/me` (`:1389`), `PATCH /api/me` (`:1399`, requires username+email+phone). `publicUser` (`db.js:633`) returns `{id,username,email,phone,createdAt}`. Limiter `userAuthLimiter` (`index.js:314`): 10 per 15 min per IP, keyed on `req.clientIp`; `trust proxy` is 1.
- Google already shows the pattern to copy: `linkOrCreateGoogleUser` (`googleAuth.js:186`) links by verified email, otherwise creates a user with a random unknowable password hashed through `hashPassword`, so `password_hash` stays NOT NULL and `/login` needs no change. `uniqueUsername`/`usernameSlug` (`googleAuth.js:159-174`) generate free usernames.
- Helpers to reuse: `dbFindUsersByPhone` (`db.js:1551`, returns an array, already normalizes), `normalizePhone`, `dbCreateUser`, `dbCreateUserSession`, `attachReferral`, `getOrCreateCode`, `hashIp`. `dbUpdateUser` passes keys straight to Supabase, so new snake_case columns need a dedicated function like `dbLinkGoogleAccount` (`db.js:~690`), plus `mapSupabaseUser` (`supabase.js:486`) and `insertSupabaseUser` (`:500`) need the new fields. The local-JSON fallback DB also needs them.

## 2. Phone identity design

Migration `supabase/migrate-phone-otp.sql` (additive, idempotent, same style as the Google one):

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;
-- widen auth_provider check to include 'phone'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_auth_provider_check;
ALTER TABLE users ADD CONSTRAINT users_auth_provider_check
  CHECK (auth_provider IN ('password','google','phone'));
-- Uniqueness ONLY for verified phones. Do NOT make users.phone unique: existing rows can
-- already contain duplicates/blank/legacy spellings and the migration would fail.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_verified_unique
  ON users (phone) WHERE phone_verified_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS phone_otps (
  id            TEXT PRIMARY KEY,                 -- 'otp-<uuid>'
  phone         TEXT NOT NULL,                    -- canonical 10 digits
  code_hash     TEXT NOT NULL,                    -- HMAC-SHA256(code, OTP_PEPPER || phone || id)
  purpose       TEXT NOT NULL DEFAULT 'login' CHECK (purpose IN ('login','link')),
  user_id       TEXT REFERENCES users(id) ON DELETE CASCADE,  -- set for 'link'
  attempts      INT  NOT NULL DEFAULT 0,
  ip_hash       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL,
  consumed_at   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_phone_otps_phone_created ON phone_otps (phone, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_phone_otps_ip_created ON phone_otps (ip_hash, created_at DESC);
ALTER TABLE phone_otps ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE phone_otps FROM anon, authenticated, PUBLIC;
```

A DB table (not in-memory) is required: the app runs on multiple Cloud Run instances (AUTH-PLAN.md already flags per-instance memory as a risk). Cleanup: delete rows older than 1 day opportunistically, like `dbDeleteExpiredUserSessions` on login.

Resolution rules after a successful verify (phone P):
1. `dbFindUsersByPhone(P)` filtered to `phone_verified_at IS NOT NULL`: exactly one -> sign into it.
2. No verified match, but one or more legacy users with phone P (unverified): OTP proves control of P, so if exactly ONE legacy user matches, set `phone_verified_at = now()` and sign into it (this is how existing username/email accounts get a phone login). If MORE than one match (duplicates are possible today), do not guess: refuse with 409 `PHONE_AMBIGUOUS` "Sign in with your username or email, then verify your phone in Account" and let support/link-phone resolve. Decision for the owner.
3. No match: this is a new user. If `name` is missing, respond `{ needsProfile: true }` (see verify below); otherwise create a phone-only account.
   - `username`: reuse `uniqueUsername(name)` from `googleAuth.js` (export it); fallback `user<last4><rand>`.
   - `email`: column is NOT NULL and has a case-insensitive unique index. Use a non-deliverable placeholder `p<phone>@phone.spoonup.invalid`, and have `publicUser` return `email: ''` and `emailIsPlaceholder` (or null) so clients never display it and the customer-email sender (`customerEmail.js`) skips `.invalid`. Alternative: a migration relaxing NOT NULL on email (touches more code: login-by-email, PATCH /api/me, referral log). Placeholder is the smaller, safer change. Needs owner sign-off.
   - `password_hash`: `hashPassword(crypto.randomBytes(32).toString('hex'))` exactly like Google. Phone-only users cannot password-login; a future forgot-password does not exist today (API-CONTRACT.md line 79), so recovery is by OTP.
   - `auth_provider: 'phone'`, `phone_verified_at: now`, `phone: P`. Then `getOrCreateCode(user.id, username)` and optional `referralCode` handled like signup (`index.js:1195-1210`).
- Security note on linking: link ONLY on OTP proof of the phone, never on a client claim. Never auto-link by email/name. A recycled number (telecom reassigns) can reach an old account: mitigate by also showing "last sign in" in the account, and by keeping `/api/auth/logout` and session expiry as is. Accepted residual risk; call out to owner.
- `PATCH /api/me` (`index.js:1399`) lets a user change phone without verification. Must change: if `phone` differs from the stored phone for a verified user, either reject with "Use Verify phone" or clear `phone_verified_at`. Otherwise a user could set an arbitrary phone, then it is unverified so it cannot hijack (the unique index is partial, verified only), which is fine, but a verified user changing phone must drop verification.

## 3. New endpoints (all behind a new `phoneOtpLimiter` plus `userAuthLimiter`; same JSON error shape `{error, code?}` that the app already parses, `interceptors.ts:54-58`)

- `POST /api/auth/otp/request` body `{ phone, purpose?: 'login' }` -> 200 `{ success: true, resendAfterSeconds: 30, expiresInSeconds: 300 }`. Always the same 200 whether the number has an account or not (no enumeration). 400 `INVALID_PHONE` for malformed input (`INVALID_PHONE_MESSAGE`). 429 `{error, code:'OTP_RATE_LIMITED', retryAfterSeconds}`. If the cooldown is active, return 429 with `retryAfterSeconds` and send nothing. This endpoint is also "resend" (same route; it invalidates prior unconsumed OTPs for the phone).
- `POST /api/auth/otp/verify` body `{ phone, code (6 digits), name?, referralCode? }`
  - success -> 200 `{ success, token, user, isNewUser }` (same as `/login`: `{token, user: publicUser}`; 201 not needed). `authService.accept()` already handles this shape unchanged.
  - code right but new number and no `name` -> 200 `{ success:false, needsProfile:true }` WITHOUT consuming the OTP (or issue a short-lived `signupTicket`; simpler: keep the OTP valid and let the client resend the same code with `name`, bounded by the attempts counter).
  - wrong/expired/used -> 400 `{ error:'That code didn’t work. Try again.', code:'OTP_INVALID', attemptsLeft }`; same message for expired and nonexistent (no oracle). Too many attempts -> 429 `OTP_LOCKED`.
- `POST /api/auth/otp/link/request` and `/link/verify` (auth required, same body): verifies a phone for the logged-in user, sets `phone` + `phone_verified_at`. 409 if another user already has that phone verified. Optional for v1; needed so email/username users can add phone login.
- `POST /api/auth/phone` is NOT needed.

## 4. OTP storage and abuse protection

- Code: `crypto.randomInt(0, 1_000_000)` zero-padded to 6 digits. Store only `HMAC-SHA256(secret OTP_PEPPER, phone|id|code)`; compare with `crypto.timingSafeEqual` on equal-length buffers. New env var NAME: `OTP_PEPPER` (plus provider vars). Never log codes; in dev/test log nothing, use the provider's test numbers.
- Expiry 5 min; single use (`consumed_at` set in the same transaction/conditional update `WHERE consumed_at IS NULL` to be race-safe); max 5 wrong attempts per OTP, then it is dead and the phone is locked 15 min.
- Cooldown: 30 s between sends to one phone (look at newest `created_at`). Limits (DB-count based so they work across instances): per phone 5 sends/hour and 10/day; per IP 10 sends/hour (via `hashIp(req.clientIp)`, `index.js`); verify attempts per IP 30/15 min through the express limiter. Global circuit breaker: if sends exceed N/min, return 503 and alert (SMS-pumping defense).
- SMS-pumping protection: allow only Indian numbers (`normalizePhone` enforces `[6-9]\d{9}`, +91 only; do NOT accept international), per-IP/per-phone caps, optionally reuse `recaptcha.js` (admin login captcha) or Play Integrity/App Attest later, daily spend cap at the provider, and provider-side fraud guard/alerts. Caps also protect the SMS bill.
- Idempotency: a second request within the cooldown does not send another SMS (returns the cooldown 429, no side effect). Verify is single-use, so a double-tap returns `OTP_INVALID` after success; the client ignores it while `busy`.
- Fail-safe: if the SMS provider call fails, return 502 `SMS_UNAVAILABLE` ("Couldn't send the code. Try again.") and do not count it against the user's quota. Never block password login.
- Anti-enumeration: identical responses for known/unknown numbers; equalize timing by always doing the HMAC/lookup work; the `needsProfile` response appears only after a correct code, so it leaks nothing to anyone without the phone.

## 5. SMS provider options (India)

All Indian transactional SMS requires TRAI DLT: register the entity (PAN, business proof), a sender ID (header), and an OTP template; each can take 2-10 working days. Start early. Templates must match exactly. (Pricing below is indicative from memory of public price lists; verify before deciding.)

| Option | Fit | Notes |
|---|---|---|
| **MSG91** (SendOTP / Flow API, has OTP widget + retry over voice/WhatsApp) | Best default | India-first, handles DLT mapping (template ID), approx Rs 0.15-0.25/SMS. Simple REST; our backend generates and verifies the code ourselves (full control, matches section 4), or use MSG91's verify API. Test mode via a test template/number. |
| **Twilio Verify** | Good, pricier | Easy API, fraud guard (Fraud Guard blocks pumping), global; India routes need DLT registration with Twilio too; approx Rs 4-6 per verification. Best docs. Reasonable if budget is not tight. |
| **Fast2SMS / Textlocal / similar** | Cheap | Needs DLT; reliability and deliverability vary; weaker API/support. OK as a fallback. |
| **Firebase Phone Auth** | Not recommended | Native SDK (`@react-native-firebase/auth`) needs a dev build, does NOT work in Expo Go; produces a Firebase ID token the backend must verify, adding Firebase as a second identity system next to Supabase and our own sessions; free tier then paid, India SMS often hits quotas. |
| **Supabase Auth phone** | Not recommended | The app uses its own `users` table + `usr_` tokens, not Supabase Auth; adopting it would create a parallel identity store and bypass our session model. (It would just call Twilio/MSG91/Vonage under the hood anyway.) |

Recommendation: **MSG91** (server-side OTP via our own table), Twilio Verify as the paid backup. Server-side OTP works in Expo Go and needs no native library. Keep the provider behind one function `sendOtpSms(phone, code)` in `server/sms.js` so it can be swapped.

## 6. Mobile app changes (spoonup-mobile)

Current state: `AuthScreen.tsx` is username/email + password, "Soon" buttons for phone/Google/Apple; `authService.requestMobileOtp/verifyMobileOtp` (`authService.ts:51-66`) are mocks that refuse in live mode (`MOBILE_UNAVAILABLE`); `AuthSession = {name,email,phone}`; token is saved by `accept()` into `secureTokenStore` (expo-secure-store, key `spoonup.auth.session`). The old `MobileLogin.tsx` (298 lines) and `OtpInput.tsx` were removed in the working tree but exist in git (`git show HEAD:src/features/auth/components/MobileLogin.tsx`, `...:src/components/common/OtpInput.tsx`); both were built on the mock service, so reuse their layout only.

To rebuild:
1. `src/components/common/OtpInput.tsx`: 6 boxes backed by ONE hidden `TextInput` (so iOS `textContentType="oneTimeCode"` and Android SMS autofill `autoComplete="sms-otp"` both work); paste support; 48dp targets; `accessibilityLabel`.
2. `src/features/auth/screens/PhoneAuthScreen.tsx` (or a step inside `AuthScreen`): step 1 phone entry with fixed "+91" prefix, `phoneDigits()`/`validatePhone()` from `validation.ts`, `keyboardType="number-pad"`; step 2 OTP entry, "Sent to +91 98xxxxxx45", a resend countdown (start from the server's `resendAfterSeconds`, default 30), "Change number"; step 3 (only when `needsProfile`) name field then re-submit verify with `name` (+ optional referral reuse of existing field). Cart is unaffected because `AuthScreen` already routes via `finish()`/`returnTo` (`AuthScreen.tsx:~72-80`): the new screens must accept the same `returnTo` param and call the same `signIn` + `finish`.
3. `authService` (replace mocks, keep mock mode for tests): `requestOtp(phone)` -> `POST /api/auth/otp/request`; `verifyOtp(phone, code, {name?, referralCode?})` -> `POST /api/auth/otp/verify`, `accept()` on success, returns `{session} | {needsProfile:true}`. Extend `toError` to surface `code` (`OTP_INVALID`, `OTP_LOCKED`, `OTP_RATE_LIMITED`, `INVALID_PHONE`, `SMS_UNAVAILABLE`) and `retryAfterSeconds`; currently every 429 shows "wait a few minutes" and error bodies go through `message` (mapped from `error` by `interceptors.ts:54-58`, so existing parsing works).
4. `AuthSession` email may now be `''`: adapt Account/profile/checkout to hide placeholder emails and not prefill `PATCH /api/me` with them (`PATCH /api/me` requires a valid email, so profile edit for phone-only users needs the user to add an email, or the backend relaxes this: owner decision).
5. States per CLAUDE.md section 7: loading (button busy), offline (`useOffline`), validation, wrong code with attempts left, locked, rate limited, SMS unavailable, expired (offer resend), session-expired modal unchanged. No secrets; HTTPS only; no code/phone in logs.
6. Tokens: unchanged, `secureTokenStore` + the existing 401 seam. Logout clears token and query cache as today.
7. Tests (jest, existing `__tests__/` style): validation (`validatePhone`), `authService` with mocked `apiClient` for request/verify/needsProfile/error codes, a cooldown-timer unit test, and `noWallet.test.js` stays green. Live tests only against the staging backend with the provider's test numbers.
8. `HelpSignInScreen`, the "Soon" mobile button, and `API-CONTRACT.md`/`SCREEN-STATUS.md` need updating after the backend ships (mark `/api/auth/otp/*` live only after production verification).

## 7. Website parity

Not required for the app to work, but recommended for one coherent identity: if phone-only accounts exist, the website login must also be able to sign them in (otherwise they can never use the website; they have no password). Add the same OTP flow to the website login page (the endpoints are plain JSON and reusable), and show "set a password / add email" in the profile for phone-only users. Google/Apple: Google exists only as a browser redirect (`/api/auth/google` -> exchange code); for native, add `POST /api/auth/google/token {idToken}` (verify signature/aud/iss/exp/email_verified, then `linkOrCreateGoogleUser`) and `POST /api/auth/apple/token {identityToken, fullName?}` (Apple JWKS, `aud` = `com.spoonup.mobile`, store name/email on first sign-in, handle relay emails). Details already in `AUTH-PLAN.md`. Apple/Google native need a dev build, not Expo Go; App Store rules require Sign in with Apple if Google is offered. Phone OTP must come first and stands alone.

## 8. Effort and rollout

| Step | Effort |
|---|---|
| 0. Owner decisions (below) and DLT registration (entity, sender ID, template) | start now; 2-10 days elapsed, little work |
| 1. Backend: migration, `sms.js` provider wrapper, OTP db functions (Supabase + JSON fallback), 3-4 routes, limiter, `mapSupabaseUser`/`insertSupabaseUser`/`publicUser` updates, `PATCH /api/me` rule, tests in the existing `test-*.js` style | 1.5-2.5 days |
| 2. App: `OtpInput`, phone/OTP screens, service methods + error codes, email-placeholder handling, tests | 1.5-2 days |
| 3. Integration on staging with provider test numbers, device testing iOS/Android (SMS autofill), abuse tests (cooldown, attempts, caps) | 1 day |
| 4. Website parity (optional) | 1 day |
| 5. Production: run migration, set `OTP_PEPPER` and provider env vars (names only in docs), enable behind a flag (`PHONE_OTP_ENABLED`), watch SMS spend/alerts, then ship the app build | 0.5 day |

Total about 4-6 working days plus DLT lead time.

Testing/rollout rules: never use production data; test with a staging Supabase project and MSG91/Twilio test numbers/sandbox; a server-side "fixed code for allowlisted test numbers" is only acceptable if gated by `NODE_ENV=test` and never present in production config. Roll out dark (flag off), verify one real number, enable. Keep username/email login untouched.

## Owner decisions needed
1. Provider (MSG91 recommended) and DLT registration owner.
2. New number on login: auto-create account (recommended, with name step) or require signup?
3. Placeholder email for phone-only accounts vs making `users.email` nullable.
4. Duplicate legacy phones: refuse (recommended) or pick oldest.
5. Whether `PATCH /api/me` may still change phone, and whether phone-only users must add an email before checkout/emails.
6. Website gets OTP too (recommended).
