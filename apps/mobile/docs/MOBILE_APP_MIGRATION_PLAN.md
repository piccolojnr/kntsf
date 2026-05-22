# Mobile App Migration Plan

## Current Migration Phase

Phase 1 is in progress: API/auth foundation migration for the Laravel mobile API. This phase prepares shared request, response, error, auth, and query-key infrastructure without building new screens or migrating feature workflows.

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

## Old Endpoint Mappings Still In Code

These are still used by current screens and should be migrated in later phases:

| Current app endpoint | Target Laravel endpoint |
| --- | --- |
| `GET /api/mobile/student/card` | `GET /api/mobile/student/nfc-card` |
| `POST /api/mobile/student/card/report-lost` | `POST /api/mobile/student/nfc-card/report-lost` |
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
- Laravel resource and pagination response helpers
- Laravel validation error normalization
- Query-key namespaces for auth, student, permits, permit requests, elections, content, verification, and operations

## Screens Not Yet Migrated

No new UI was built in this phase. These screens still need endpoint/data migration:

- Student home
- Student permits
- Student NFC card
- Student profile
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

- Permit request and Paystack payment flow
- Elections voting
- Content screens for announcements, events, documents, and executives
- Staff permit request review

## Next Steps

1. Migrate student profile, permits, and NFC-card APIs to Laravel response shapes.
2. Migrate staff verification endpoints to `/api/mobile/verification/*`.
3. Migrate card registration/replacement/revocation to operations NFC-card endpoints.
4. Add feature-level response schemas with Zod once endpoint payloads are stable.
5. Decompose oversized screens while migrating each feature, not before.
