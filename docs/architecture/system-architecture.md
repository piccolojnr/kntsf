# Knutsford SRC NFC Permit Verification Platform: System Architecture

## 1. High-Level Architecture Overview

The Knutsford SRC NFC permit verification platform is a two-client system backed by one authoritative database.

- `kntsf_dashboard_fork` is the Next.js application. It provides the administrative dashboard, public/backend API routes, mobile API routes, authentication, permit issuing, NFC card management, verification, audit logging, email delivery, and Prisma database access.
- `kntsf-app` is the Expo React Native mobile application. It provides student self-service screens and operations staff tools for NFC scanning, permit verification, card assignment, permit issuing, and audit review.
- The Prisma/MySQL database is the system of record for students, staff users, student mobile accounts, NFC cards, permits, payments, verification logs, audit logs, and configuration.

```text
+----------------------+        HTTPS / JSON        +-----------------------------+
| Expo mobile app      | -------------------------> | Next.js mobile API routes   |
| kntsf-app            |                            | /api/mobile/*              |
|                      | <------------------------- | JWT protected responses     |
+----------------------+                            +--------------+--------------+
                                                                 |
                                                                 | service layer
                                                                 v
+----------------------+        browser/session     +------------+----------------+
| Admin dashboard      | -------------------------> | Next.js app/backend        |
| kntsf_dashboard_fork |                            | pages, actions, API routes |
+----------------------+                            +------------+----------------+
                                                                 |
                                                                 | Prisma Client
                                                                 v
                                                    +------------+----------------+
                                                    | MySQL database              |
                                                    | Students, Permits, Cards,  |
                                                    | Auth, Logs, Config, Payment|
                                                    +-----------------------------+
```

The platform intentionally keeps all verification decisions on the backend. The mobile app reads NFC UIDs and submits them to the server; it does not decide permit validity locally.

## 2. Backend Architecture

The backend is implemented in `kntsf_dashboard_fork` using Next.js App Router, Prisma, NextAuth, JWTs, server services, and route handlers.

Key layers:

- UI routes: `src/app/dashboard/*` for staff/admin workflows.
- Public/API routes: `src/app/api/*`.
- Mobile API routes: `src/app/api/mobile/*`.
- Domain services: `src/lib/services/*`.
- Mobile helpers: `src/lib/mobile/*`.
- Database access: `src/lib/prisma/client.ts`.
- Validation schemas: `src/lib/schemas/*`.
- Authentication: `src/lib/auth/*` for dashboard sessions and `src/lib/mobile/auth.ts` for mobile JWTs.

```text
Next.js route handler / server action
        |
        v
Zod validation and auth guard
        |
        v
Domain service
        |
        v
Prisma transaction/query
        |
        v
Normalized response or ServiceResponse
```

Important backend services:

- `verification.service.ts`: verifies by student ID, NFC UID, or permit code and writes `VerificationLog` records.
- `nfc-card.service.ts`: registers, replaces, revokes, and looks up NFC cards.
- `permit.service.ts`: creates, issues, revokes, reactivates, checks, emails, and lists permits.
- `student-auth.service.ts`: creates student mobile accounts, sends setup/reset links, validates password tokens, and stores password hashes.
- `audit.service.ts`: records administrative actions.
- `config.service.ts`: exposes permit and semester configuration used during mobile issuing.

## 3. Mobile App Architecture

The mobile application is implemented in `kntsf-app` with Expo Router, React Query, Axios, SecureStore, Zustand-compatible patterns, and `react-native-nfc-manager`.

Main areas:

- `src/app/(auth)/*`: login/welcome screens.
- `src/app/(student)/*`: student tabs for profile, permits, and card status.
- `src/app/(operations)/*`: staff/admin operational tools.
- `src/features/auth/*`: login/logout/current-user API wrappers.
- `src/features/operations/*`: verification and audit API wrappers.
- `src/features/cards/*`: card registration/replacement/revocation API wrappers.
- `src/features/permits/*`: permit listing/config/issuing API wrappers.
- `src/lib/api/api-client.ts`: central Axios client.
- `src/lib/nfc/nfc-service.ts`: Android NFC UID reading.
- `src/lib/storage/secure-storage.ts`: mobile JWT storage.

```text
Screen
  -> feature hook / API function
  -> Axios apiClient
  -> SecureStore token interceptor
  -> Next.js /api/mobile endpoint
  -> normalized UI model
```

The app supports two user modes from the same login flow:

- `student`: can view own profile, permits, and active card; can report own active card lost.
- `staff` or `admin`: can scan cards, verify students/permits, issue permits, assign/replace/revoke cards, and inspect operational logs.

## 4. Authentication Flows

### Dashboard Staff Authentication

Dashboard users authenticate through NextAuth credentials.

```text
Staff enters username/password
        |
        v
NextAuth CredentialsProvider
        |
        v
Prisma User lookup by username
        |
        v
bcrypt password comparison
        |
        v
JWT session with user id, username, email, image, role
        |
        v
/dashboard routes protected by middleware
```

Dashboard session lifetime is configured for 30 days. The middleware redirects unauthenticated dashboard requests to `/auth/login`.

### Mobile Authentication

Mobile login uses `/api/mobile/auth/login` and supports both staff/admin users and student mobile accounts.

```text
Mobile login
        |
        v
POST /api/mobile/auth/login
        |
        +--> Check User by username/email
        |       -> bcrypt compare User.password
        |       -> role = admin or staff
        |
        +--> Else check StudentAuth by username/email
                -> account must be active
                -> passwordHash must exist
                -> bcrypt compare StudentAuth.passwordHash
                -> update lastLoginAt/loginCount
        |
        v
Sign mobile JWT for 7 days
        |
        v
Store token in Expo SecureStore
```

Mobile route guards:

- `requireMobileUser`: any valid mobile JWT.
- `requireOperationsUser`: staff/admin only.
- `requireStudentUser`: student only.

## 5. Student Account Activation Flow

Student mobile access is separate from dashboard staff access. It is based on `StudentAuth`.

```text
Admin/staff opens student account tools
        |
        v
Activate account for Student.studentId
        |
        v
Create or update StudentAuth
  username = studentId
  email = student email or fallback local address
  passwordHash = null until setup
        |
        v
Create StudentAuthToken
  type = setup_password
  tokenHash = SHA-256(raw token)
  expiresAt = now + 24 hours
        |
        v
Email password setup link
        |
        v
Student opens /student-auth/setup-password?token=...
        |
        v
Validate token: exists, unused, not expired
        |
        v
Hash password with bcrypt and mark token used
```

Password setup rules:

- Minimum length is 8 characters.
- Must include uppercase, lowercase, and a number.
- Setup/reset tokens are stored as hashes, not raw tokens.
- Existing unused tokens of the same type are marked used before a new token is created.
- Token sending has a short cooldown to prevent repeated sends.

## 6. NFC Card Lifecycle

NFC cards are represented by the `NfcCard` model. A card belongs to exactly one student. Verification resolves a card to its student, then checks the student's permit.

Card states:

- `inactive`
- `active`
- `revoked`
- `lost`
- `stolen`
- `replaced`
- `damaged`

Lifecycle:

```text
Unregistered physical NFC card
        |
        | staff scans/enters UID for a student
        v
Registered active card
  uidHash stored
  uidLast4 stored for display
  issuedAt/activatedAt set
        |
        +--> replace card
        |       old active card -> replaced
        |       new card -> active
        |
        +--> revoke card
        |       card -> revoked
        |
        +--> student reports lost
                active card -> lost
                deactivatedAt/lostAt set
```

Security-sensitive card handling:

- Raw UIDs are not stored.
- UIDs are normalized by trimming separators and uppercasing.
- `uidHash` uses HMAC-SHA256 when `NFC_UID_HASH_SECRET` is configured, falling back to SHA-256.
- Only the last four UID characters are stored for staff/student display.
- Registration and replacement use transactions to avoid multiple active cards for one student.

## 7. Permit Lifecycle

Permits are represented by the `Permit` model and linked to a student, optional issuing staff user, optional payment, and verification logs.

Permit states:

- `active`
- `expired`
- `revoked`

Lifecycle:

```text
Permit request or staff issue
        |
        v
Create Permit
  originalCode = visible code, e.g. YY-XXXX
  permitCode = bcrypt hash of visible code
  permitHash = short lookup suffix
  status = active
  expiryDate from PermitConfig
        |
        v
Create Payment record
  status = SUCCESS for staff-issued/manual permits
        |
        v
Email permit code and QR verification URL
        |
        +--> verification after expiry
        |       status active -> expired
        |
        +--> staff revoke
        |       status -> revoked
        |       linked payment -> CANCELLED
        |
        +--> staff reactivate revoked permit
                status -> active
                cancelled payment -> SUCCESS
```

Mobile permit issuing uses `/api/mobile/permits/issue` and is allowed only for operations users. It checks `PermitConfig.enablePermitRequest`, creates a permit and success payment in a transaction, sends the permit email, then returns a fresh verification result for the student.

## 8. Verification Workflow

The platform supports three verification methods:

- NFC UID: `/api/mobile/verify/card`
- Student ID: `/api/mobile/verify/student`
- Permit code: `/api/mobile/verify/permit-code`

### NFC Verification

```text
Staff taps card on Android device
        |
        v
Expo app reads UID with react-native-nfc-manager
        |
        v
POST /api/mobile/verify/card { uid }
        |
        v
Hash normalized UID
        |
        v
Find NfcCard by uidHash
        |
        +--> not found: denied/card_not_registered
        |
        +--> card status not active: denied/card_inactive
        |
        v
Load card.student.permits ordered by expiry
        |
        v
Evaluate active, expired, revoked, or missing permit
        |
        v
Create VerificationLog
        |
        v
Return mobile verification result
```

### Student ID Verification

```text
POST /api/mobile/verify/student { studentId }
        |
        v
Find Student by public studentId
        |
        +--> not found: student_not_found
        |
        v
Evaluate student's latest active permit
        |
        v
Create VerificationLog
```

### Permit Code Verification

```text
POST /api/mobile/verify/permit-code { code }
        |
        v
Find Permit by exact originalCode
        |
        +--> else search candidates by permitHash/originalCode suffix
        |
        v
bcrypt compare submitted code with stored permitCode hash
        |
        v
Evaluate permit status and expiry
        |
        v
Create VerificationLog
```

Verification outcomes are normalized for mobile:

- `allowed`: active permit is valid.
- `warning`: permit exists but expired/revoked/no active permit, often allowing staff to issue a new permit.
- `denied`: student/card/permit not found, inactive card, invalid input, or unknown error.

## 9. Database Model Relationships

Core permit/NFC/auth relationships:

```text
Role 1 ---- * User
User 1 ---- * Permit             (issuedBy)
User 1 ---- * AuditLog
User 1 ---- * VerificationLog    (verifierUser)

Student 1 ---- 0..1 StudentAuth
StudentAuth 1 ---- * StudentAuthToken

Student 1 ---- * NfcCard
Student 1 ---- * Permit
Student 1 ---- * Payment
Student 1 ---- * VerificationLog

Permit 1 ---- 0..1 Payment
Permit 1 ---- * VerificationLog

NfcCard 1 ---- * VerificationLog

Config 1 ---- 0..1 PermitConfig
Config 1 ---- 0..1 SemesterConfig
Config 1 ---- 0..1 ContactInfo
```

Important model responsibilities:

- `Student`: institutional student record. Owns permits, payments, NFC cards, mobile auth, and verification history.
- `StudentAuth`: mobile login account for a student.
- `StudentAuthToken`: setup/reset password token metadata with hashed token value.
- `User`: dashboard/staff/admin account.
- `Role`: dashboard role assignment.
- `Permit`: permit entitlement and expiry/status data.
- `Payment`: payment or manual issue record linked to a student and optionally a permit.
- `NfcCard`: hashed NFC card UID and card status.
- `VerificationLog`: immutable-ish verification event history.
- `AuditLog`: administrative action history.
- `Config`, `PermitConfig`, `SemesterConfig`: system-wide settings used by permit issuing and display.

## 10. Security Considerations

Current security controls:

- Staff dashboard passwords are bcrypt-hashed.
- Student mobile passwords are bcrypt-hashed.
- Dashboard sessions use NextAuth JWT sessions.
- Mobile API uses signed JWT bearer tokens.
- Mobile JWT secret is read from `MOBILE_JWT_SECRET`, falling back to `NEXTAUTH_SECRET` or `JWT_SECRET`.
- NFC UIDs are not stored in plaintext.
- Student password setup/reset tokens are stored as SHA-256 hashes.
- Mobile tokens are stored client-side in Expo SecureStore.
- Operations routes require staff/admin roles.
- Student routes are scoped to the authenticated student's own `studentId`.
- Permit codes are stored as bcrypt hashes, with `originalCode` currently retained for display/email/admin use.
- Route handlers validate input with Zod.
- Verification attempts are logged with hashed identifiers.

Security tradeoffs and risks:

- `Permit.originalCode` stores the visible permit code. This helps dashboard display, email resending, QR generation, and mobile responses, but it means the database contains usable permit codes.
- Mobile logout clears local token state, but JWTs remain valid until expiry unless server-side token revocation is added.
- Offline verification is not supported because the backend is the source of truth.
- NFC UID verification depends on UID uniqueness; basic NFC UIDs can sometimes be cloned depending on card type.
- Some service errors are returned as user-facing internal errors in mobile APIs; production deployments should avoid leaking low-level exception text.

Recommended controls:

- Use HTTPS only in production.
- Set strong `NEXTAUTH_SECRET`, `MOBILE_JWT_SECRET`, and `NFC_UID_HASH_SECRET`.
- Restrict database access to the deployed backend.
- Rotate secrets if exposed.
- Add rate limiting to login, password setup, and verification routes.
- Add server-side mobile token revocation or short-lived access tokens with refresh tokens.
- Consider removing or encrypting `Permit.originalCode` if operationally feasible.

## 11. API Structure

### Mobile Authentication

```text
POST /api/mobile/auth/login
POST /api/mobile/auth/logout
GET  /api/mobile/me
```

### Mobile Student Self-Service

```text
GET  /api/mobile/student/profile
GET  /api/mobile/student/permits
GET  /api/mobile/student/card
POST /api/mobile/student/card/report-lost
```

### Mobile Verification

```text
POST /api/mobile/verify/card
POST /api/mobile/verify/student
POST /api/mobile/verify/permit-code
```

### Mobile Operations

```text
GET  /api/mobile/operations/students
GET  /api/mobile/operations/permits
GET  /api/mobile/operations/cards
GET  /api/mobile/operations/verifications
GET  /api/mobile/operations/audit-logs
GET  /api/mobile/operations/permit-config
```

### Mobile Card and Permit Actions

```text
POST /api/mobile/cards/register
POST /api/mobile/cards/replace
POST /api/mobile/cards/revoke
POST /api/mobile/permits/issue
```

### Dashboard/Public API Families

```text
/api/auth/[...nextauth]
/api/students
/api/students/[studentId]
/api/permits/[permitCode]
/api/permits/status
/api/payments/*
/api/config
/api/news
/api/events
/api/documents
/api/polls
/api/elections
```

Mobile response envelope:

```json
{
  "success": true,
  "data": {}
}
```

Mobile error envelope:

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Student ID is required"
  }
}
```

Known mobile error codes:

- `BAD_REQUEST`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `CONFLICT`
- `INTERNAL_ERROR`

## 12. Error Handling Strategy

Backend strategy:

- Route handlers validate request bodies with Zod.
- Authentication failures are represented by `MobileAuthError`.
- Mobile route handlers call `handleMobileRouteError`.
- Service functions generally return `ServiceResponse<T>` with `success`, `data`, and `error`.
- Verification failures caused by missing cards/students/permits are not transport errors; they return successful HTTP responses with denied verification results.
- Unexpected exceptions are logged and returned as `INTERNAL_ERROR`.

Mobile app strategy:

- `apiClient` attaches bearer tokens automatically.
- `apiClient` removes the stored token on HTTP 401.
- API wrappers normalize backend DTOs into app-facing models.
- Feature APIs convert Axios/backend errors into user-facing messages.
- NFC scan errors are normalized into clear messages such as unsupported, disabled, cancelled, no card detected, or unknown error.

## 13. Offline/Online Assumptions

The current system assumes online verification.

Online assumptions:

- Staff devices must reach `API_BASE_URL`.
- The database must be reachable by the Next.js backend.
- Verification decisions are made live against current permit/card status.
- Logs are written immediately during verification.

Offline limitations:

- The mobile app does not store a local permit/card database.
- NFC UID alone is not enough to verify a permit offline.
- Offline scans are not queued for later submission.
- A revoked/lost/replaced card must be checked against the server to be reliable.

This is a deliberate correctness tradeoff: the platform prioritizes real-time permit status and auditability over offline availability.

## 14. Deployment Architecture

Expected production deployment:

```text
Expo/EAS mobile build
        |
        | HTTPS
        v
admin.knutsfordsrc.com
Next.js app on Node-compatible hosting
        |
        +--> MySQL DATABASE_URL
        +--> SMTP/email provider
        +--> payment gateway APIs/webhooks
        +--> Cloudinary/media services where used
```

Important environment variables:

- `DATABASE_URL`: MySQL connection string for Prisma.
- `NEXTAUTH_SECRET`: dashboard session signing secret.
- `NEXTAUTH_URL`: canonical dashboard URL.
- `MOBILE_JWT_SECRET`: mobile JWT signing secret.
- `JWT_SECRET`: fallback signing secret.
- `NFC_UID_HASH_SECRET`: HMAC secret for NFC UID hashing.
- `NEXT_PUBLIC_APP_URL`: used for student password setup links.
- `EXPO_PUBLIC_API_BASE_URL` or `EXPO_PUBLIC_API_URL`: mobile backend base URL.
- Payment/email/cloud storage provider variables as required by the configured services.

Build/runtime notes:

- Dashboard scripts use port `3001` for development/start.
- The dashboard build runs `prisma generate` before `next build`.
- The mobile app points to `https://admin.knutsfordsrc.com` by default for development, preview, and production unless overridden.
- Android NFC scanning requires a native build; Expo Go does not load the NFC module.

## 15. Future Improvements

Recommended technical improvements:

- Add rate limiting for login, verification, password-token, and issuing endpoints.
- Add mobile refresh tokens and server-side token revocation.
- Add immutable audit entries for NFC register/replace/revoke actions, not only student auth actions.
- Add explicit verification log references in mobile verification responses.
- Encrypt or remove plaintext `Permit.originalCode` if dashboard display requirements can be changed.
- Add a card technology policy and use cards that reduce UID cloning risk.
- Add device registration for operations staff devices.
- Add offline queueing for scan attempts, clearly marked as unverified until synced.
- Add dashboards for suspicious activity, repeated failed verification, and high-frequency card scans.
- Add automated tests around verification edge cases.
- Add database constraints or scheduled jobs for stale permit expiration.
- Add structured logging and request IDs across mobile API routes.
- Add OpenAPI documentation for `/api/mobile/*`.

## 16. Design Decisions and Tradeoffs

### Backend as the Verification Authority

The mobile app reads NFC UIDs but does not determine validity. This prevents stale local data from allowing revoked, expired, or replaced cards. The tradeoff is that verification requires network connectivity.

### Hashing NFC UIDs

The system stores `uidHash` and `uidLast4`, not raw UIDs. This reduces exposure if the database is leaked. The tradeoff is that support/debugging needs staff to use masked UID display or rescan the card.

### Separate Staff and Student Auth Models

Staff/admin users are stored in `User`; student app accounts are stored in `StudentAuth`. This keeps administrative access separate from student self-service access. The tradeoff is two auth paths in the mobile login code.

### Permit Code Hashing with Original Code Retention

The system hashes `permitCode` for verification comparison while also storing `originalCode`. This gives practical admin/email functionality while partially protecting the verification path. The tradeoff is that the original permit code remains sensitive database data.

### Service Layer Reuse

Dashboard routes, mobile routes, and server actions reuse domain services where possible. This reduces duplicated business rules. The tradeoff is that services must return neutral responses usable by both dashboard and mobile callers.

### Transactional Card Replacement

Card registration/replacement uses Prisma transactions to deactivate or replace existing active cards while activating the new one. This protects the invariant that a student should not have multiple active cards. The tradeoff is slightly more complex write logic.

### Live Expiry Updates

Expired active permits may be marked `expired` during verification/checking. This avoids requiring a separate scheduler for correctness during normal use. The tradeoff is that permit status may change during read-like verification requests.

