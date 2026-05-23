# Appendix B — API Endpoints

This appendix summarizes the mobile API contract used by the Expo React Native application. The authoritative backend contract is maintained in `docs/MOBILE_APP_API_CONTRACT.md`. All authenticated requests use Sanctum bearer tokens with `Accept: application/json` and `Content-Type: application/json`.

Base path:

```txt
/api/mobile/*
```

## B.1 Authentication Endpoints

Table B.1: Authentication API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/mobile/auth/login` | Authenticate user and issue Sanctum token |
| POST | `/api/mobile/auth/logout` | Revoke current token |
| GET | `/api/mobile/me` | Return authenticated user profile |

## B.2 Student Endpoints

Table B.2: Student API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/mobile/student/profile` | Logged-in student profile |
| GET | `/api/mobile/student/permits` | Logged-in student permits |
| GET | `/api/mobile/student/nfc-card` | Active NFC card for logged-in student |
| POST | `/api/mobile/student/nfc-card/report-lost` | Report active NFC card as lost |

Student endpoints are scoped to the authenticated user's linked `students.user_id` record.

## B.3 Permit Request and Payment Endpoints

Table B.3: Permit Request API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/mobile/permit-requests/options` | Self-service options and blocking state |
| GET | `/api/mobile/permit-requests` | Student permit request list |
| POST | `/api/mobile/permit-requests` | Create permit request |
| GET | `/api/mobile/permit-requests/{reference}` | Permit request detail |
| POST | `/api/mobile/permit-requests/{reference}/initialize-payment` | Initialize Paystack checkout |
| POST | `/api/mobile/permit-requests/{reference}/verify-payment` | Server-side Paystack verification |

Payment rule: the mobile client must not treat Paystack redirect alone as proof of payment. The backend verifies transaction status with Paystack before completing permit issuance.

## B.4 Election Endpoints

Table B.4: Election API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/mobile/elections` | Eligible election list |
| GET | `/api/mobile/elections/{election}` | Election detail, positions, candidates |
| POST | `/api/mobile/elections/{election}/positions/{position}/vote` | Cast immutable vote |
| GET | `/api/mobile/elections/{election}/results` | Election results when visible |

## B.5 Verification Endpoints

Table B.5: Verification API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/mobile/verification/student-number` | Verify student by student number |
| POST | `/api/mobile/verification/permit-code` | Verify student by permit code |
| POST | `/api/mobile/verification/nfc` | Verify student by NFC UID |

## B.6 Operations Endpoints

Table B.6: Staff Operations API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/mobile/operations/summary` | Operations summary |
| GET | `/api/mobile/operations/students/search` | Search students |
| GET | `/api/mobile/operations/students/{student}` | Student detail |
| GET | `/api/mobile/operations/permits` | Paginated permit list |
| GET | `/api/mobile/operations/permits/options` | Permit issue defaults and selected-student state |
| POST | `/api/mobile/operations/permits/issue` | Issue permit to student |
| GET | `/api/mobile/operations/nfc-cards` | Paginated NFC card list |
| POST | `/api/mobile/operations/nfc-cards/register` | Register NFC card |
| POST | `/api/mobile/operations/nfc-cards/{nfcCard}/replace` | Replace NFC card |
| POST | `/api/mobile/operations/nfc-cards/{nfcCard}/revoke` | Revoke NFC card |
| GET | `/api/mobile/operations/verification-logs` | Paginated verification logs |
| GET | `/api/mobile/operations/permit-requests` | Staff permit request review list |
| GET | `/api/mobile/operations/permit-requests/{reference}` | Staff permit request detail |
| POST | `/api/mobile/operations/permit-requests/{reference}/approve-review` | Approve permit request review |
| POST | `/api/mobile/operations/permit-requests/{reference}/reject-review` | Reject permit request review |

Staff endpoints require server-side permissions. The mobile UI may hide unavailable actions, but backend authorization remains authoritative.

## B.7 Content Endpoints

Table B.7: Content API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/mobile/content/home` | Featured home payload |
| GET | `/api/mobile/content/announcements` | Paginated announcements |
| GET | `/api/mobile/content/announcements/{slug}` | Announcement detail |
| GET | `/api/mobile/content/events` | Paginated events |
| GET | `/api/mobile/content/events/{slug}` | Event detail |
| GET | `/api/mobile/content/documents` | Paginated documents |
| GET | `/api/mobile/content/documents/{slug}` | Document detail |
| GET | `/api/mobile/content/executives` | Published executives |

Only published public content is returned on detail endpoints. Draft or internal records return `404`.

## B.8 Common API Response Rules

| HTTP status | Meaning | Typical mobile handling |
| --- | --- | --- |
| 401 | Unauthenticated | Clear token and return to login |
| 403 | Forbidden | Show permission or role restriction |
| 422 | Validation failed | Display field-level errors |
| 404 | Not found | Treat as unavailable content or record |
| 429 | Rate limited | Back off and retry later |

Paginated list endpoints return Laravel API resource pagination with `data`, `links`, and `meta` fields. Sensitive values such as raw NFC UIDs, raw permit codes, and payment secrets are not exposed in mobile resources.
