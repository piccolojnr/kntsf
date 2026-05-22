# Mobile App Migration Plan

## Current Migration Phase

Phase 3 is in progress: mobile permit request and Paystack flow. The API/auth foundation and student core screens are migrated, and students can now create permit requests, launch Paystack checkout, return to the app, verify payment server-side, and inspect request status.

## Laravel API Response Strategy

The app now treats Laravel responses as the default contract:

- Plain resource: `{ "data": { ... } }`
- Plain object response: `{ ... }`
- Paginated collection: `{ "data": [], "links": {}, "meta": {} }`
- Validation error: `{ "message": "...", "errors": { "field": ["..."] } }`

Shared helpers:

- `unwrapData<T>()` unwraps Laravel `{ data }` resources and direct object responses.
- `unwrapPaginated<T>()` converts Laravel paginated collections into app-friendly `{ items, pagination }` results.
- Temporary old `{ success, data, message }` compatibility remains only so unmigrated screens continue to compile during phased endpoint migration.

## Auth Changes

- Login payload is now Laravel/Sanctum-oriented: `email`, `password`, and optional `device_name`.
- Login response supports `token`, `token_type`, `user.roles`, and `user.permissions`.
- `AuthUser` keeps a compatibility `role` field for existing screens, derived from `roles`.
- The app stores Sanctum tokens in Expo SecureStore as before.
- `/api/mobile/me` supports Laravel resource/direct response shapes.
- Logout still calls `/api/mobile/auth/logout` and clears the local token even if the network request fails.
- Auth bootstrap no longer treats network/server timeout during `/me` as logout. It preserves the token and surfaces a recoverable startup state.

## Student Core Migration

Migrated student endpoints:

- `GET /api/mobile/student/profile`
- `GET /api/mobile/student/permits`
- `GET /api/mobile/student/nfc-card`
- `POST /api/mobile/student/nfc-card/report-lost`
- `GET /api/mobile/content/home` helper added for later lightweight home content use

Student response mapping now uses Laravel resource fields such as `student_number`, `starts_at`, `expires_at`, `amount_paid`, `code_last4`, and `uid_last4`. The UI compatibility fields remain normalized inside feature APIs so existing screens do not need a redesign. Raw NFC UIDs and full permit codes are not expected by the student screens.

## Permit Request And Payment Flow

Implemented endpoints:

- `GET /api/mobile/permit-requests/options`
- `GET /api/mobile/permit-requests`
- `POST /api/mobile/permit-requests`
- `GET /api/mobile/permit-requests/{reference}`
- `POST /api/mobile/permit-requests/{reference}/initialize-payment`
- `POST /api/mobile/permit-requests/{reference}/verify-payment`

Implemented routes:

- `/(student)/permit-request`
- `/(student)/permit-request/[reference]`
- `/(student)/permit-request/payment-return`

Payment handling:

- Paystack checkout opens through `expo-web-browser`.
- Redirect return is handled by the payment return route when available.
- Payment is never trusted from redirect alone; the app calls backend verification.
- A manual "I Have Paid, Verify Payment" fallback is available on the request detail screen.

## Elections UI

Implemented endpoints:

- `GET /api/mobile/elections`
- `GET /api/mobile/elections/{election}`
- `POST /api/mobile/elections/{election}/positions/{position}/vote`
- `GET /api/mobile/elections/{election}/results`

Implemented routes:

- `/(student)/elections`
- `/(student)/elections/[id]`
- `/(student)/elections/[id]/results`

Voting handling:

- Authenticated students can view elections, positions, approved candidates, eligibility, and voting status.
- Vote submission goes through the backend endpoint and is confirmed before mutation.
- The UI does not support vote editing and does not duplicate backend eligibility rules.
- Results are shown only when the backend returns them.

## Old Endpoint Mappings Still In Code

These are still used outside the migrated student core screens and should be migrated in later phases:

| Current app endpoint | Target Laravel endpoint |
| --- | --- |
| `GET /api/mobile/operations/students` | `GET /api/mobile/operations/students/search` plus detail endpoint |
| `GET /api/mobile/operations/cards` | New operations NFC-card list endpoint if exposed |
| `GET /api/mobile/operations/permits` | New operations permit list endpoint if exposed |
| `GET /api/mobile/operations/permit-config` | `GET /api/mobile/permit-requests/options` or staff config endpoint if exposed |
| `GET /api/mobile/operations/verifications` | Verification/audit endpoint if exposed |
| `POST /api/mobile/cards/register` | `POST /api/mobile/operations/nfc-cards/register` |
| `POST /api/mobile/cards/replace` | `POST /api/mobile/operations/nfc-cards/{nfcCard}/replace` |
| `POST /api/mobile/cards/revoke` | `POST /api/mobile/operations/nfc-cards/{nfcCard}/revoke` |
| `POST /api/mobile/permits/issue` | `POST /api/mobile/operations/permits/issue` |
| `POST /api/mobile/verify/card` | `POST /api/mobile/verification/nfc` |
| `POST /api/mobile/verify/student` | `POST /api/mobile/verification/student-number` |
| `POST /api/mobile/verify/permit-code` | `POST /api/mobile/verification/permit-code` |

## New Endpoint Foundation

Already aligned or prepared:

- `POST /api/mobile/auth/login`
- `POST /api/mobile/auth/logout`
- `GET /api/mobile/me`
- `GET /api/mobile/student/profile`
- `GET /api/mobile/student/permits`
- `GET /api/mobile/student/nfc-card`
- `POST /api/mobile/student/nfc-card/report-lost`
- `GET /api/mobile/permit-requests/options`
- `GET /api/mobile/permit-requests`
- `POST /api/mobile/permit-requests`
- `GET /api/mobile/permit-requests/{reference}`
- `POST /api/mobile/permit-requests/{reference}/initialize-payment`
- `POST /api/mobile/permit-requests/{reference}/verify-payment`
- `GET /api/mobile/elections`
- `GET /api/mobile/elections/{election}`
- `POST /api/mobile/elections/{election}/positions/{position}/vote`
- `GET /api/mobile/elections/{election}/results`
- Laravel resource and pagination response helpers
- Laravel validation error normalization
- Query-key namespaces for auth, student, permits, permit requests, elections, content, verification, and operations

## Screens Not Yet Migrated

No new UI was built in this phase. These screens still need endpoint/data migration:

- Staff verification scan
- Staff/admin permit list
- Staff/admin student list
- Staff/admin profile dashboard
- Student details
- Card assignment
- Admin dashboard
- Cards
- Settings
- Audit logs
- Reports

Missing future workflows remain out of scope for this phase:

- Content screens for announcements, events, documents, and executives
- Staff permit request review

## Next Steps

1. Confirm the Paystack callback/redirect URL configured by the backend matches the Expo deep-link route.
2. Migrate staff verification endpoints to `/api/mobile/verification/*`.
3. Migrate card registration/replacement/revocation to operations NFC-card endpoints.
4. Add feature-level response schemas with Zod once endpoint payloads are stable.
5. Decompose oversized screens while migrating each feature, not before.
