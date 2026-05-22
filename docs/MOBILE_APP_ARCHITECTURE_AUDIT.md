# Mobile App Architecture Audit

Task 35 audit for the current Expo app before migration to the Laravel mobile API.

## Current Architecture Overview

- App: Knutsford SRC mobile app for student self-service and staff/admin operations.
- Framework: Expo SDK `~54.0.33`, React Native `0.81.5`, React `19.1.0`.
- Entry point: `expo-router/entry` from `package.json`; root app layout is `src/app/_layout.tsx`.
- Package manager: pnpm, confirmed by `pnpm-lock.yaml`, `pnpm-workspace.yaml`, and hoisted node linker settings.
- Routing: Expo Router with file-based route groups. React Navigation is used indirectly through Expo Router tabs/stacks plus `@react-navigation/*` packages.
- State: TanStack Query for server state. Zustand is installed but no store usage exists in `src`.
- Styling: React Native `StyleSheet` with shared theme values in `src/constants/theme.ts`. No Tailwind/NativeWind usage found.
- Networking: centralized Axios instance in `src/lib/api/api-client.ts`.
- Storage: auth token stored in `expo-secure-store` through `src/lib/storage/secure-storage.ts`.
- NFC: `react-native-nfc-manager`, dynamically loaded and Android-only, UID read support only.
- Forms/validation: `react-hook-form`, `@hookform/resolvers`, and `zod` are installed, but no active usage was found in `src`.

## Folder Structure

Current structure broadly follows the intended `src` layout:

```txt
src
├── app
│   ├── (auth)
│   ├── (operations)
│   ├── (student)
│   ├── _layout.tsx
│   └── index.tsx
├── components
│   ├── cards
│   ├── forms
│   ├── layout
│   └── ui
├── constants
├── features
│   ├── auth
│   ├── cards
│   ├── operations
│   ├── permits
│   └── students
├── hooks
├── lib
│   ├── api
│   ├── nfc
│   └── storage
└── providers
```

Notable gaps against the target structure:

- No `src/store` usage despite Zustand being installed.
- No `src/lib/validations` folder and no Zod schemas currently used.
- No `src/styles` folder; theme constants are centralized in `src/constants/theme.ts`.
- Feature folders contain API and hooks, but screens still contain substantial workflow logic and large `StyleSheet` blocks.

## App Entry And Providers

`src/app/_layout.tsx` wraps the app with:

- `GestureHandlerRootView`
- `BottomSheetModalProvider`
- `AppProviders`
- root Expo Router `Stack`
- `StatusBar`

`src/providers/app-providers.tsx` creates a default `QueryClient` and wraps `AuthProvider`.

Risk: the `QueryClient` uses default retry/cache behavior. There are no global query defaults for mobile network conditions, auth errors, stale times, or mutation error handling.

## Navigation Flow

The app uses Expo Router with route groups:

- `/` -> `src/app/index.tsx` startup redirect.
- `/(auth)` -> welcome and login.
- `/(student)` -> student role stack and tabs.
- `/(operations)` -> shared staff/admin operations stack and tabs.

Startup flow:

1. `AuthProvider` bootstraps from SecureStore.
2. `src/app/index.tsx` shows a branded loading state while auth is loading.
3. Unauthenticated users redirect to `/(auth)/welcome`.
4. Students redirect to `/(student)`.
5. Staff/admin users redirect to `/(operations)/scan`.

Current route structure:

```txt
/
/(auth)/welcome
/(auth)/login
/(student)/(tabs)
/(student)/(tabs)/index
/(student)/(tabs)/permits
/(student)/(tabs)/card
/(student)/(tabs)/profile
/(operations)/(tabs)/scan
/(operations)/(tabs)/permits
/(operations)/(tabs)/students
/(operations)/(tabs)/profile
/(operations)/student-details
/(operations)/card-assignment
/(operations)/admin-dashboard
/(operations)/cards
/(operations)/settings
/(operations)/audit-logs
/(operations)/reports
```

Tab structure:

- Student tabs: Home, Permits, Card, Profile.
- Operations tabs: Verify, Permits, Students, Profile.

Protected routes:

- `RoleTabsLayout` wraps tab groups with `RoleAccessGuard`.
- Student tabs allow only `student`.
- Operations tabs allow `staff` and `admin`.
- Non-tab operation stack screens are not directly wrapped by `RoleAccessGuard`; they rely on navigation entry from protected tabs and root auth redirect behavior. Deep links to these stack screens should be explicitly guarded during migration.

Navigation setup type:

- Primary: Expo Router.
- Underlying: React Navigation stack/tabs through Expo Router.
- Practical classification: Expo Router app with React Navigation primitives, not a custom hybrid navigator.

Onboarding flow:

- There is a welcome screen and login screen.
- No multi-step onboarding, role-selection persistence, or first-run flow exists.

## Authentication And Session Handling

Current auth files:

- `src/providers/auth-provider.tsx`
- `src/hooks/use-auth.ts`
- `src/features/auth/auth-api.ts`
- `src/lib/storage/secure-storage.ts`
- `src/lib/api/api-client.ts`

Token storage:

- SecureStore key: `auth_token`.
- Token is written on login and deleted on logout or `401`.

Login behavior:

- UI state is local in `src/app/(auth)/login.tsx`.
- `LoginPayload` is `{ username, password }`.
- `auth-api.ts` posts to `/api/mobile/auth/login`.
- Expected response shape is wrapped: `{ success, data: { token, user }, message? }`.

Startup/session restore:

- `AuthProvider` reads the stored token.
- It calls `/api/mobile/me`.
- If `/me` succeeds, user/token are set in memory.
- If `/me` fails, user is cleared and token is removed only if the API layer returns `401`; other failures result in unauthenticated in-memory state, but the token may remain unless the interceptor removed it.

Logout:

- Posts to `/api/mobile/auth/logout`.
- Always removes the token locally in `finally`.

Interceptor logic:

- Request interceptor reads SecureStore on every request and sets `Authorization: Bearer <token>`.
- Response interceptor removes the token on `401`.
- Errors are normalized to `UserFacingApiError`.

Refresh behavior:

- No token refresh exists.
- This aligns with Laravel Sanctum personal access tokens, assuming tokens are long-lived or revoked server-side.

Required Sanctum migration changes:

- Change login payload from `username` to the Laravel contract fields, likely `email`, `password`, and `device_name`.
- Change login response normalization to accept unwrapped Laravel-style responses as documented in `docs/MOBILE_APP_API_CONTRACT.md`.
- Add `Accept: application/json` to the API client headers.
- Ensure role mapping supports Laravel `roles: string[]` and permissions, not only `role: "student" | "staff" | "admin"`.
- Make all protected stack screens guard against direct deep links.
- Decide whether failed `/me` network errors should preserve the token and show retry instead of silently acting unauthenticated.

## API Layer Audit

Centralized client:

- All discovered API calls go through `src/lib/api/api-client.ts`.
- No direct `fetch()` usage found.
- No direct Axios usage outside the shared client and error helper.

Current response assumptions:

- Most feature APIs expect `{ success: boolean, data: T, message?: string }`.
- List endpoints expect `data.items` and `data.pagination`.
- Pagination type is `{ page, limit, total, totalPages? }`.
- The future Laravel API contract documents resource responses with `data`, `links`, and `meta`, so pagination adapters will need changes.

Error handling:

- `normalizeApiError` handles Axios errors, `401`, `403`, network failures, and simple `message`/`error.message` response bodies.
- No field-level validation error extraction exists for Laravel `422` responses.
- No global retry policy beyond TanStack Query defaults.

Environment base URLs:

- `src/constants/config.ts` uses `EXPO_PUBLIC_API_BASE_URL`, fallback `EXPO_PUBLIC_API_URL`, then per-environment defaults.
- All environments currently default to `https://admin.knutsfordsrc.com`.
- `eas.json` repeats the same base URL for development, preview, and production.
- `.env` exists and likely supplies local public environment variables, but it should not be treated as the source of truth for production.

Current API dependencies in code:

```txt
POST /api/mobile/auth/login
POST /api/mobile/auth/logout
GET  /api/mobile/me
GET  /api/mobile/student/profile
GET  /api/mobile/student/permits
GET  /api/mobile/student/card
POST /api/mobile/student/card/report-lost
GET  /api/mobile/operations/students
GET  /api/mobile/operations/cards
GET  /api/mobile/operations/permits
GET  /api/mobile/operations/permit-config
GET  /api/mobile/operations/verifications
GET  /api/mobile/operations/audit-logs
POST /api/mobile/cards/register
POST /api/mobile/cards/replace
POST /api/mobile/cards/revoke
POST /api/mobile/permits/issue
POST /api/mobile/verify/card
POST /api/mobile/verify/student
POST /api/mobile/verify/permit-code
```

Tightly coupled/outdated endpoint assumptions:

- Verification uses `/api/mobile/verify/*`; future contract uses `/api/mobile/verification/*`.
- Student card uses `/api/mobile/student/card`; future contract uses `/api/mobile/student/nfc-card`.
- Card management uses `/api/mobile/cards/*`; future contract uses `/api/mobile/operations/nfc-cards/*`.
- Staff permit issue uses `/api/mobile/permits/issue`; future contract uses `/api/mobile/operations/permits/issue`.
- Staff search/list endpoints use `/api/mobile/operations/students`; future contract lists `/api/mobile/operations/students/search` and detail endpoints.
- Operations permit/card/student lists assume custom `items/pagination`, not Laravel `data/meta`.
- Auth assumes single `role` string and wrapped mobile response.

Migration strategy for `/api/mobile/*`:

1. Keep `apiClient` but update headers and response adapters.
2. Create Laravel response adapters for unwrapped success payloads, resource collections, validation errors, and pagination meta.
3. Migrate feature API modules endpoint-by-endpoint instead of changing screens first.
4. Keep screen hooks stable where possible so screens do not absorb backend-specific mapping.
5. Add Zod schemas at API boundaries once endpoint shapes are final.

## NFC Architecture

Library:

- `react-native-nfc-manager`.

Current implementation:

- `src/lib/nfc/nfc-service.ts` dynamically imports NFC code.
- It returns unsupported when running in Expo Go (`Constants.appOwnership === "expo"`).
- Android-only guard: iOS always returns unsupported.
- Starts NFC manager lazily.
- Checks support and enabled state.
- Requests `NfcA`, `MifareClassic`, and `MifareUltralight`.
- Reads tag `id`, normalizes whitespace, and uppercases UID.
- Uses a 10 second timeout.
- Cancels the technology request in `finally`.
- Prevents concurrent reads through `activeReadPromise`.

Read/write state:

- UID read: implemented.
- NFC writing: not implemented.
- NDEF/NTAG parsing: not implemented.
- Raw student/permit data storage on card: not implemented.

Current NFC screens/integration points:

- `src/app/(operations)/(tabs)/scan.tsx` uses `useVerifyPermit().verifyByNfc()` for staff permit verification.
- `src/app/(operations)/card-assignment.tsx` directly calls `readCardUid()` for registration/replacement.
- `src/hooks/use-nfc-availability.ts` checks availability.

Integration gaps for Laravel API:

- Verification should call future `/api/mobile/verification/nfc` instead of `/api/mobile/verify/card`.
- Staff registration should call future `/api/mobile/operations/nfc-cards/register`.
- Replacement should call future `/api/mobile/operations/nfc-cards/{nfcCard}/replace`.
- Revocation should call future `/api/mobile/operations/nfc-cards/{nfcCard}/revoke`.
- Lost-card flow should call future `/api/mobile/student/nfc-card/report-lost`.
- iOS readiness is not implemented; if iOS NFC is required, capability/plugin/build settings and reader-session behavior must be added.

## Screen Inventory

| Feature | Screen | Current status | Old API dependency | Reuse or rewrite | Migration complexity |
| --- | --- | --- | --- | --- | --- |
| Startup | `src/app/index.tsx` | Working auth redirect/loading screen | `/me` indirectly | Reuse with auth mapping changes | Low |
| Auth | `/(auth)/welcome` | Simple entry screen | None | Reuse | Low |
| Auth | `/(auth)/login` | Working local-state login | Login payload/response shape | Reuse UI, update auth API/form validation | Medium |
| Student Home | `/(student)/(tabs)/index` | Dashboard with current student, permits, card | student profile, permits, card | Reuse structure, add content/home later | Medium |
| Student Permits | `/(student)/(tabs)/permits` | Large detailed permit UI | `/student/permits` | Partially reuse; adapt for permit requests/payment | High |
| Student Card | `/(student)/(tabs)/card` | Student card status and report lost | `/student/card`, `/student/card/report-lost` | Reuse with endpoint rename | Medium |
| Student Profile | `/(student)/(tabs)/profile` | Large profile/status screen | profile, card, permits | Reuse after data shape adapter | Medium |
| Staff Verify | `/(operations)/(tabs)/scan` | Main verification flow with NFC/manual lookup/permit issue | `/verify/*`, `/permits/issue`, permit config | Reuse interaction shell, rewrite API integration | High |
| Operations Permits | `/(operations)/(tabs)/permits` | Staff/admin permit list | `/operations/permits` | Reuse list UI with pagination adapter | Medium |
| Operations Students | `/(operations)/(tabs)/students` | Staff/admin student list | `/operations/students` | Reuse list UI; endpoint/detail contract changes | Medium |
| Operations Profile | `/(operations)/(tabs)/profile` | Profile plus admin tool links/stat summaries | students/cards/permits/logs | Reuse but split stats from profile | Medium |
| Student Details | `/(operations)/student-details` | Large detail/action screen | student search, cards, permit issue | Partially reuse; needs endpoint rewrite and guard | High |
| Card Assignment | `/(operations)/card-assignment` | NFC/manual register/replace workflow | cards register/replace, student search | Reuse workflow, rewrite card endpoints | High |
| Admin Dashboard | `/(operations)/admin-dashboard` | Summary dashboard | students/cards/permits/audit logs | Reuse after adapters | Medium |
| Cards | `/(operations)/cards` | Card list/search | `/operations/cards` | Reuse with nfc-card naming changes | Medium |
| Settings | `/(operations)/settings` | Permit issuance config display | `/operations/permit-config` | Reassess; may not exist in future contract | Medium |
| Audit Logs | `/(operations)/audit-logs` | Audit log list | `/operations/audit-logs` | Reuse if backend exposes endpoint | Medium |
| Reports | `/(operations)/reports` | Simple aggregate reporting | permits/cards/logs | Reuse or replace with backend report endpoint later | Medium |

Missing future screens/features:

- Permit request/payment flow.
- Paystack browser/deep-link return screens.
- Elections list/detail/voting/results.
- Announcements/events/documents/executives content screens.
- Staff permit request review screens.

## State Management Strategy

Current strategy:

- Server state: TanStack Query hooks in feature folders.
- Session state: React context in `AuthProvider`.
- Local screen state: `useState`/`useMemo` in screens.
- Zustand: installed but unused.

Technical concern:

- Large screens own workflow state directly, especially scan, permit detail, profile, student details, and card assignment screens.
- No shared mutation invalidation strategy exists. Some screens manually call `queryClient.invalidateQueries` or refetch multiple queries.
- Query keys are simple arrays but not centralized.

Recommended migration direction:

- Keep TanStack Query for server state.
- Avoid adding Zustand unless there is a cross-screen UI/session state need.
- Centralize query keys by feature during endpoint migration.
- Move mutation workflows out of screens where they currently mix UI and backend assumptions.

## Assets, Fonts, Themes

Assets:

- App icons and brand images live in `assets/images`.
- `app.json` references icon, adaptive icon, splash icon, and favicon.
- Screens use `@assets/images/logo.png`.

Fonts:

- `expo-font` is installed.
- No custom font loading was found in root layout.

Theme:

- `src/constants/theme.ts` defines colors, spacing, radius, font sizes, and light/dark `Colors`.
- Most UI uses `StyleSheet`.
- Some legacy Expo template components remain (`themed-text`, `themed-view`, `parallax-scroll-view`, `hello-wave`, `external-link`).

## Environment And Expo Integration Readiness

Ready or partially ready:

- `expo-secure-store`: installed and used for auth token.
- Deep linking: app scheme `kntsfapp` exists in `app.json`; no payment callback route is implemented.
- Paystack browser flow: `expo-web-browser` is installed; no current Paystack flow exists.
- Push notifications: no notification package or setup found.
- NFC flows: Android dev-client/build ready in code, but Expo Go unsupported by design.
- EAS builds: `eas.json` exists with development, preview, and production profiles.
- Production API switching: environment variables exist but all profiles currently point to the same host.
- Expo Updates: configured with project id and runtime version policy.

Gaps:

- No native NFC config plugin entries beyond package installation.
- No per-channel API host separation.
- No deep-link route for payment return verification.
- No push token registration architecture.
- No API feature flag/config endpoint for mobile capability checks.

## Migration Plan

### Phase 1: Auth + API foundation

- Update `apiClient` headers for Laravel JSON/Sanctum.
- Add response adapters for Laravel resources, collections, pagination, and `422` validation.
- Update login payload and response normalization.
- Support Laravel roles/permissions shape.
- Add explicit guards for operation stack screens.
- Add typecheck script if project checks require it.

Reuse: root providers, SecureStore wrapper, auth context shape with small changes.

Rewrite/adapt: auth DTOs, error normalization, API pagination types.

### Phase 2: Student content screens

- Add content home and published content APIs.
- Decide how announcements/events/documents/executives appear in the student home.
- Keep current home/profile/card shell where useful.

Reuse: student tab layout, UI cards, loading/empty states.

Rewrite/adapt: home data composition.

### Phase 3: Permit/payment flow

- Add permit request options, request creation, Paystack initialize, verify, and polling.
- Add deep-link/browser return handling.
- Update student permits screen to distinguish issued permits from permit requests.

Reuse: permit display components where they represent issued permits.

Rewrite: request/payment workflow screens.

### Phase 4: Elections voting

- Add elections APIs, eligibility handling, vote mutation, result visibility.
- Add new screens/routes for elections list, detail, and results.

Reuse: general UI components only.

Rewrite: feature-specific screens and hooks.

### Phase 5: Staff verification/NFC

- Migrate verification endpoints to `/api/mobile/verification/*`.
- Migrate card registration/replacement/revocation to `/api/mobile/operations/nfc-cards/*`.
- Align verification result statuses with Laravel contract.
- Keep UID-only scanning.

Reuse: NFC service, scan screen interaction shell, card assignment flow.

Rewrite/adapt: verification API, card API, result normalization.

### Phase 6: Cleanup/refactor

- Remove old endpoint names and fallback DTO aliases once migration is complete.
- Split oversized screens into focused components/hooks.
- Add Zod validation at API/form boundaries.
- Remove unused dependencies or start using them intentionally.
- Normalize query keys and mutation invalidation.

## Technical Debt Findings

- Several screens are very large: card assignment, student permits, student home, student profile, scan, and student details exceed typical screen composition size.
- Feature APIs duplicate `MobileApiResponse` and `getMobileData` helpers.
- Many normalizers support multiple historic field names, which hides backend drift.
- Query key construction is duplicated and not centralized.
- Pagination is coupled to a non-Laravel `items/pagination` response shape.
- Form libraries and Zod are installed but unused; login/manual inputs use local state only.
- Zustand is installed but unused.
- Operations stack screens are not individually role-guarded against direct navigation.
- Auth bootstrap can collapse into unauthenticated state on `/me` failure, which may be poor behavior during temporary network errors.
- No explicit `422` validation error mapping for field-level UI.
- `scan.tsx` contains a hardcoded default student ID value (`2610`), likely development residue.
- Several staff/admin aggregate screens fetch broad lists client-side for counts instead of using backend summaries.
- Environment defaults point all app environments to the same production-like host.
- Current endpoint names and response wrappers differ from the documented future Laravel API contract.

## Reusable Areas

- Expo Router group structure.
- Root providers and role-based tab layout.
- SecureStore wrapper.
- Central Axios client concept.
- TanStack Query feature hook pattern.
- Android UID-only NFC service.
- Shared UI components in `src/components/ui` and many display cards.
- Theme constants and StyleSheet-based styling approach.

## Recommended Rewrite Areas

- API response adapters and pagination model.
- Auth DTO mapping for Sanctum/Laravel roles.
- Verification endpoint module.
- Card/NFC API module naming and endpoint mapping.
- Permit request/payment flow.
- Elections and content features, because they are mostly absent.
- Oversized workflow screens should be decomposed during feature migration, not before.

## Output Summary

Architecture quality: moderate. The app has a reasonable Expo Router, provider, feature API, and shared component foundation, but screen-level complexity and backend response coupling are high.

Migration difficulty: medium-high. Auth and student card/profile migration are manageable; permit payments, elections, and staff NFC operations are more involved because they require new workflows and endpoint contracts.

Best reuse candidates: routing skeleton, SecureStore auth persistence, TanStack Query hooks pattern, NFC UID reader, role tabs layout, and most generic UI/card components.

Best rewrite candidates: API adapters, old operation endpoint modules, payment/request flows, elections, and large screens that currently mix UI, workflow, and backend assumptions.

Estimated phases: six phases as listed above, starting with auth/API foundations before any new UI work.
