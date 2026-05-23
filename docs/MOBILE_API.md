# Mobile API

The mobile API is a Sanctum token-based layer for the future Expo app. It is separate from the Inertia/Fortify web session flow.

## Auth Flow

1. The Expo app sends `POST /api/mobile/auth/login` with email, password, and optional `device_name`.
2. The API rejects inactive users, users without passwords, and invalid credentials.
3. A Sanctum personal access token is returned once.
4. Mobile requests send `Authorization: Bearer <token>`.
5. `POST /api/mobile/auth/logout` revokes the current token.

## Endpoint List

### Auth

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/mobile/auth/login` | Public, throttled | Issue mobile token |
| POST | `/api/mobile/auth/logout` | Sanctum | Revoke current token |
| GET | `/api/mobile/me` | Sanctum | Current user, roles, safe profile |

### Student

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/mobile/student/profile` | Sanctum student account | Own student profile |
| GET | `/api/mobile/student/permits` | Sanctum student account | Own permits |
| GET | `/api/mobile/student/nfc-card` | Sanctum student account | Own active NFC card |
| POST | `/api/mobile/student/nfc-card/report-lost` | Sanctum student account, throttled | Mark own active NFC card lost |

### Student Permit Requests

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/mobile/permit-requests/options` | Sanctum student account | Current settings, active period, and blocking state |
| GET | `/api/mobile/permit-requests` | Sanctum student account | Own permit requests |
| POST | `/api/mobile/permit-requests` | Sanctum student account, throttled | Create own permit request |
| GET | `/api/mobile/permit-requests/{reference}` | Sanctum student account | Own permit request detail |
| POST | `/api/mobile/permit-requests/{reference}/initialize-payment` | Sanctum student account, throttled | Initialize Paystack checkout |
| POST | `/api/mobile/permit-requests/{reference}/verify-payment` | Sanctum student account, throttled | Server-side Paystack verification |

### Elections

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/mobile/elections` | Sanctum student account | List active/scheduled elections and closed elections with visible results |
| GET | `/api/mobile/elections/{election}` | Sanctum student account | Election detail with positions and approved candidates |
| POST | `/api/mobile/elections/{election}/positions/{position}/vote` | Sanctum student account, throttled | Cast immutable vote for one position |
| GET | `/api/mobile/elections/{election}/results` | Sanctum student account | View results when visible or permitted |

### Content

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/mobile/content/home` | Sanctum, throttled | Featured announcements, upcoming events, featured documents, and executives |
| GET | `/api/mobile/content/announcements` | Sanctum, throttled | Paginated published public announcements |
| GET | `/api/mobile/content/announcements/{slug}` | Sanctum, throttled | Published public announcement detail |
| GET | `/api/mobile/content/events` | Sanctum, throttled | Paginated published public events |
| GET | `/api/mobile/content/events/{slug}` | Sanctum, throttled | Published public event detail |
| GET | `/api/mobile/content/documents` | Sanctum, throttled | Paginated published public documents |
| GET | `/api/mobile/content/documents/{slug}` | Sanctum, throttled | Published public document detail and public files |
| GET | `/api/mobile/content/executives` | Sanctum, throttled | Published executive profiles |

### Operations

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/mobile/operations/summary` | `reports.view` or staff/admin role | Aggregate operations counts |
| GET | `/api/mobile/operations/nfc-cards` | Staff/admin + `nfc_cards.view` | Paginated NFC cards list |
| GET | `/api/mobile/operations/permits` | Staff/admin + `permits.view` | Paginated permits list |
| GET | `/api/mobile/operations/permits/options` | Staff/admin + `permits.issue` | Permit issue defaults and optional student blocking state |
| GET | `/api/mobile/operations/verification-logs` | Staff/admin + `verification.view_logs` | Paginated verification logs |
| GET | `/api/mobile/operations/students/search` | Staff/admin permissions | Search students |
| GET | `/api/mobile/operations/students/{student}` | Staff/admin permissions | View student details |
| POST | `/api/mobile/operations/permits/issue` | `permits.issue` | Issue permit using existing action |
| POST | `/api/mobile/operations/nfc-cards/register` | `nfc_cards.manage` | Register NFC card |
| POST | `/api/mobile/operations/nfc-cards/{nfcCard}/replace` | `nfc_cards.manage` | Replace NFC card |
| POST | `/api/mobile/operations/nfc-cards/{nfcCard}/revoke` | `nfc_cards.manage` | Revoke NFC card |
| GET | `/api/mobile/operations/permit-requests` | `permit_requests.view` | Review self-service requests |
| GET | `/api/mobile/operations/permit-requests/{reference}` | `permit_requests.view` | View request detail |
| POST | `/api/mobile/operations/permit-requests/{reference}/approve-review` | `permit_requests.manage` | Approve review-required request |
| POST | `/api/mobile/operations/permit-requests/{reference}/reject-review` | `permit_requests.manage` | Reject review-required request |

### Verification

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/mobile/verification/student-number` | `verification.perform`, throttled | Verify student number |
| POST | `/api/mobile/verification/permit-code` | `verification.perform`, throttled | Verify permit code |
| POST | `/api/mobile/verification/nfc` | `verification.perform`, throttled | Verify NFC UID |

Operations aggregate filters:

| Endpoint | Filters |
| --- | --- |
| `/api/mobile/operations/nfc-cards` | `search`, `status`, `per_page` |
| `/api/mobile/operations/permits` | `search`, `status`, `academic_period_id`, `per_page` |
| `/api/mobile/operations/permits/options` | `student_id`, `academic_period_id` |
| `/api/mobile/operations/verification-logs` | `method`, `result`, `search`, `per_page` |

Operations aggregate resources never expose `uid_hash`, `code_hash`, raw NFC UIDs, full permit codes, raw verification identifiers, or `identifier_hash`.

`/api/mobile/permit-requests/options` remains the student self-service endpoint and uses the authenticated user's linked student profile. Staff permit issuance should use `/api/mobile/operations/permits/options` instead.

Staff permit issuing with `POST /api/mobile/operations/permits/issue` accepts only `student_id`, optional `student_email`, and optional `academic_period_id`. The API does not accept direct `starts_at`, `expires_at`, `amount_paid`, or `currency` overrides. Amount and currency come from Permit Settings; dates come from the selected/active academic period, falling back to configured validity days when the period has no end date.

## Role Restrictions

- Students can only access their linked `students.user_id` profile, permits, and active NFC card.
- Staff/admin users use existing permissions and policies.
- Frontend role checks are only UI hints; API policies and Form Requests are authoritative.

## Response Shape

Responses use JSON resources under `App\Http\Resources\Mobile`.

Example login response:

```json
{
  "token": "plain-sanctum-token-once",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "Student User",
    "email": "student@example.com",
    "roles": ["student"],
    "permissions": []
  }
}
```

Verification responses return normalized result data and never return raw submitted identifiers.

## Security Notes

- Sanctum stores token hashes, not plaintext tokens.
- Raw NFC UIDs are accepted only as input and are never returned.
- Permit resources expose `code_last4` only, never full codes or hashes.
- Verification logs store hashed identifiers only.
- Mobile rate limiters:
  - `mobile-login`
  - `mobile-verification`
  - `mobile-sensitive-actions`
  - `mobile-permit-requests`

## Mobile Permit Request Flow

1. The Expo app calls `GET /api/mobile/permit-requests/options`.
2. If `has_active_permit` or `has_pending_request` is true, the app should block checkout.
3. The student calls `POST /api/mobile/permit-requests` with only missing `contact_email` or `contact_phone`.
4. The app calls `POST /api/mobile/permit-requests/{reference}/initialize-payment`.
5. Expo opens `authorization_url` in a browser tab or secure web view.
6. After Paystack returns, the app calls `POST /api/mobile/permit-requests/{reference}/verify-payment` with the local payment `reference`.
7. The app polls or refreshes the permit request detail until it is `issued`, `paid`, or `failed`.

Unknown or unlinked students are intentionally not supported in the mobile API. They should use the public website self-service flow so provisional records can be reviewed safely.

## Mobile Election Flow

Expected Expo flow:

```txt
Login
→ Elections tab
→ Election detail
→ Select candidate
→ Confirm vote
→ Success
```

Election voting rules:

- requires a linked student profile
- requires active user account
- requires active permit for the election academic period
- only active elections inside their voting window accept votes
- only approved candidates are returned and can receive votes
- one vote per student per position
- votes cannot be edited after submission
- results are hidden until `results_visible` is true unless the user has `elections.view_results`

## Mobile Content Flow

Expected Expo sections:

```txt
Home
Announcements
Events
Documents
Executives
```

Content endpoints reuse the public portal visibility rules:

- `published` status only
- `public` visibility only
- `published_at` must be set and not in the future
- executive profiles must be published
- draft, archived, internal, and unpublished records return `404` on detail routes

List endpoints support lightweight `search`, `category`, and `featured` filters. Events also support `upcoming=true`. Responses are paginated and use mobile resources so dashboard metadata, token hashes, payment metadata, and internal model payloads are not exposed.

## Expo Integration Notes

- Store the bearer token in the platform secure storage layer, not plain async storage.
- Send `Accept: application/json` with all requests.
- Handle `401` by clearing the token and returning the user to login.
- Handle `403` as a permission/role problem.
- Handle `422` validation errors by displaying field-level messages.

## Not Built Yet

- Mobile password reset.
- Push notifications.
