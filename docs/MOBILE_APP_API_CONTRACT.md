# Mobile App API Contract

This document is the backend contract for the future Expo mobile app. The current API base is:

```txt
/api/mobile/*
```

Future versioning can be introduced as:

```txt
/api/mobile/v1/*
```

Do not refactor the current route structure until the Expo app has a concrete need for versioned breaking changes.

## Request Rules

All authenticated requests must send:

```txt
Authorization: Bearer <sanctum-token>
Accept: application/json
Content-Type: application/json
```

The API uses Sanctum personal access tokens. The token is returned once during login and must be stored by Expo in secure storage, such as `expo-secure-store`. Do not store the token in plain AsyncStorage.

## Auth Endpoints

| Method | Endpoint                  | Purpose                       |
| ------ | ------------------------- | ----------------------------- |
| POST   | `/api/mobile/auth/login`  | Login and issue Sanctum token |
| POST   | `/api/mobile/auth/logout` | Revoke current token          |
| GET    | `/api/mobile/me`          | Current authenticated user    |

Login body:

```json
{
  "email": "student@example.com",
  "password": "Password123!",
  "device_name": "Expo iPhone"
}
```

## Student Endpoints

| Method | Endpoint                                   | Purpose                             |
| ------ | ------------------------------------------ | ----------------------------------- |
| GET    | `/api/mobile/student/profile`              | Logged-in student's profile         |
| GET    | `/api/mobile/student/permits`              | Logged-in student's permits         |
| GET    | `/api/mobile/student/nfc-card`             | Logged-in student's active NFC card |
| POST   | `/api/mobile/student/nfc-card/report-lost` | Report active NFC card as lost      |

Student endpoints only return data for the authenticated user's linked `students.user_id` record.

## Permit Request and Payment Endpoints

| Method | Endpoint                                                     | Purpose                                                      |
| ------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| GET    | `/api/mobile/permit-requests/options`                        | Student self-service request settings and own blocking state |
| GET    | `/api/mobile/permit-requests`                                | Student's own permit requests                                |
| POST   | `/api/mobile/permit-requests`                                | Create permit request                                        |
| GET    | `/api/mobile/permit-requests/{reference}`                    | Permit request detail                                        |
| POST   | `/api/mobile/permit-requests/{reference}/initialize-payment` | Initialize Paystack checkout                                 |
| POST   | `/api/mobile/permit-requests/{reference}/verify-payment`     | Server-side Paystack verification                            |

Mobile permit requests are for authenticated students with linked student profiles. Unknown students should use the public website self-service flow.

`GET /api/mobile/permit-requests/options` is only for the authenticated student's own self-service flow. Staff permit issuing must use `GET /api/mobile/operations/permits/options`.

### Paystack Flow

1. Call `GET /api/mobile/permit-requests/options`.
2. Block checkout if `has_active_permit` or `has_pending_request` is true.
3. Create a request with `POST /api/mobile/permit-requests`.
4. Initialize payment.
5. Open `authorization_url` in the system browser or a secure web view.
6. After Paystack redirects back, call `verify-payment` with the payment reference.
7. Poll `GET /api/mobile/permit-requests/{reference}` until status is `issued`, `paid`, or `failed`.

The app must not treat Paystack redirect alone as payment proof. The backend verifies directly with Paystack.

## Elections Endpoints

| Method | Endpoint                                                     | Purpose                                |
| ------ | ------------------------------------------------------------ | -------------------------------------- |
| GET    | `/api/mobile/elections`                                      | Eligible election list                 |
| GET    | `/api/mobile/elections/{election}`                           | Election detail, positions, candidates |
| POST   | `/api/mobile/elections/{election}/positions/{position}/vote` | Cast immutable vote                    |
| GET    | `/api/mobile/elections/{election}/results`                   | Election results if visible/permitted  |

Voting requires a linked student profile, active user account, active permit for the election academic period, active election window, and an approved candidate.

## Content Endpoints

| Method | Endpoint                                   | Purpose                          |
| ------ | ------------------------------------------ | -------------------------------- |
| GET    | `/api/mobile/content/home`                 | Featured content home payload    |
| GET    | `/api/mobile/content/announcements`        | Paginated announcements          |
| GET    | `/api/mobile/content/announcements/{slug}` | Announcement detail              |
| GET    | `/api/mobile/content/events`               | Paginated events                 |
| GET    | `/api/mobile/content/events/{slug}`        | Event detail                     |
| GET    | `/api/mobile/content/documents`            | Paginated documents              |
| GET    | `/api/mobile/content/documents/{slug}`     | Document detail and public files |
| GET    | `/api/mobile/content/executives`           | Published executives             |

Only published public content is returned. Draft, internal, archived, and unpublished records return `404` on detail endpoints.

List filters:

| Filter           | Endpoints                                    |
| ---------------- | -------------------------------------------- |
| `search`         | announcements, events, documents, executives |
| `category`       | announcements, events, documents             |
| `featured=true`  | announcements, events, documents             |
| `upcoming=true`  | events                                       |
| `per_page=1..25` | paginated lists                              |

## Verification and Staff Operations

| Method | Endpoint                                                            | Purpose                                                         |
| ------ | ------------------------------------------------------------------- | --------------------------------------------------------------- |
| POST   | `/api/mobile/verification/student-number`                           | Verify by student number                                        |
| POST   | `/api/mobile/verification/permit-code`                              | Verify by permit code                                           |
| POST   | `/api/mobile/verification/nfc`                                      | Verify by NFC UID                                               |
| GET    | `/api/mobile/operations/summary`                                    | Staff operations summary                                        |
| GET    | `/api/mobile/operations/nfc-cards`                                  | Staff paginated NFC card list                                   |
| GET    | `/api/mobile/operations/permits`                                    | Staff paginated permit list                                     |
| GET    | `/api/mobile/operations/permits/options`                            | Staff permit issue defaults and optional selected-student state |
| GET    | `/api/mobile/operations/verification-logs`                          | Staff paginated verification logs                               |
| GET    | `/api/mobile/operations/students/search`                            | Staff student search                                            |
| GET    | `/api/mobile/operations/students/{student}`                         | Staff student detail                                            |
| POST   | `/api/mobile/operations/permits/issue`                              | Staff permit issue                                              |
| POST   | `/api/mobile/operations/nfc-cards/register`                         | Staff NFC registration                                          |
| POST   | `/api/mobile/operations/nfc-cards/{nfcCard}/replace`                | Staff NFC replacement                                           |
| POST   | `/api/mobile/operations/nfc-cards/{nfcCard}/revoke`                 | Staff NFC revocation                                            |
| GET    | `/api/mobile/operations/permit-requests`                            | Staff permit request review list                                |
| GET    | `/api/mobile/operations/permit-requests/{reference}`                | Staff permit request detail                                     |
| POST   | `/api/mobile/operations/permit-requests/{reference}/approve-review` | Staff approve review                                            |
| POST   | `/api/mobile/operations/permit-requests/{reference}/reject-review`  | Staff reject review                                             |

Staff endpoints require server-side permissions. The mobile UI may hide links, but backend policies remain authoritative.

Staff operations filters:

| Endpoint                                   | Filters                                              |
| ------------------------------------------ | ---------------------------------------------------- |
| `/api/mobile/operations/nfc-cards`         | `search`, `status`, `per_page`                       |
| `/api/mobile/operations/permits`           | `search`, `status`, `academic_period_id`, `per_page` |
| `/api/mobile/operations/permits/options`   | `student_id`, `academic_period_id`                   |
| `/api/mobile/operations/verification-logs` | `method`, `result`, `search`, `per_page`             |

The staff permit options endpoint returns form defaults, selectable course/level options, and selected-student preflight state when `student_id` is supplied. It requires a staff/admin role plus permit issue permission.

## Mobile Screen -> API Endpoint

| Mobile Screen       | Primary Endpoints                                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login               | `POST /api/mobile/auth/login`                                                                                                                             |
| Home                | `GET /api/mobile/content/home`, `GET /api/mobile/permit-requests/options`                                                                                 |
| Profile             | `GET /api/mobile/student/profile`, `GET /api/mobile/me`                                                                                                   |
| Permits             | `GET /api/mobile/student/permits`                                                                                                                         |
| Request Permit      | `GET /api/mobile/permit-requests/options`, `POST /api/mobile/permit-requests`, `POST /api/mobile/permit-requests/{reference}/initialize-payment`          |
| Payment Status      | `GET /api/mobile/permit-requests/{reference}`, `POST /api/mobile/permit-requests/{reference}/verify-payment`                                              |
| Elections           | `GET /api/mobile/elections`                                                                                                                               |
| Election Detail     | `GET /api/mobile/elections/{election}`, `POST /api/mobile/elections/{election}/positions/{position}/vote`, `GET /api/mobile/elections/{election}/results` |
| Announcements       | `GET /api/mobile/content/announcements`                                                                                                                   |
| Announcement Detail | `GET /api/mobile/content/announcements/{slug}`                                                                                                            |
| Events              | `GET /api/mobile/content/events`                                                                                                                          |
| Event Detail        | `GET /api/mobile/content/events/{slug}`                                                                                                                   |
| Documents           | `GET /api/mobile/content/documents`, `GET /api/mobile/content/documents/{slug}`                                                                           |
| Executives          | `GET /api/mobile/content/executives`                                                                                                                      |
| NFC Card            | `GET /api/mobile/student/nfc-card`                                                                                                                        |
| Report Lost Card    | `POST /api/mobile/student/nfc-card/report-lost`                                                                                                           |
| Staff Verify        | `POST /api/mobile/verification/student-number`, `POST /api/mobile/verification/permit-code`, `POST /api/mobile/verification/nfc`                          |
| Staff Issue Permit  | `GET /api/mobile/operations/permits/options`, `GET /api/mobile/operations/students/search`, `POST /api/mobile/operations/permits/issue`                   |
| Staff Register Card | `GET /api/mobile/operations/students/search`, `POST /api/mobile/operations/nfc-cards/register`                                                            |

Staff permit issue body:

```json
{
  "student_id": 22,
  "student_email": "student@example.com",
  "academic_period_id": 4
}
```

`student_email` and `academic_period_id` are optional. Do not send `starts_at`, `expires_at`, `amount_paid`, or `currency`; the API rejects those fields. Amount and currency come from Permit Settings. Start and expiry dates come from the selected or active academic period, with configured validity days used only when the academic period has no end date.

## Common Error Response Shape

Unauthenticated:

```json
{
  "message": "Unauthenticated."
}
```

Forbidden:

```json
{
  "message": "This action is unauthorized."
}
```

Validation:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

Not found:

```json
{
  "message": "Not Found"
}
```

Rate limited:

```json
{
  "message": "Too Many Attempts."
}
```

## Pagination Shape

Paginated resources follow Laravel API resource pagination:

```json
{
  "data": [],
  "links": {
    "first": "https://kntsf-core.test/api/mobile/content/announcements?page=1",
    "last": "https://kntsf-core.test/api/mobile/content/announcements?page=3",
    "prev": null,
    "next": "https://kntsf-core.test/api/mobile/content/announcements?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 3,
    "per_page": 10,
    "to": 10,
    "total": 25
  }
}
```

## Sample Responses

### Login Success

```json
{
  "token": "1|plain-text-token-returned-once",
  "token_type": "Bearer",
  "user": {
    "id": 12,
    "name": "Ama Mensah",
    "email": "ama@example.com",
    "roles": ["student"],
    "permissions": []
  }
}
```

### Mobile Home Content

```json
{
  "announcements": [
    {
      "id": 1,
      "slug": "semester-registration",
      "title": "Semester Registration",
      "excerpt": "Registration opens Monday.",
      "status": "published",
      "published_at": "2026-05-20T08:00:00.000000Z",
      "image_url": "https://kntsf-core.test/storage/1/banner.jpg"
    }
  ],
  "events": [],
  "documents": [],
  "executives": [
    {
      "id": 3,
      "name": "SRC President",
      "position": "President",
      "biography": "Student leader profile.",
      "avatar_url": null
    }
  ]
}
```

### Student Permit Request Options

```json
{
  "data": {
    "permit_requests_enabled": true,
    "default_amount": 50,
    "currency": "GHS",
    "active_academic_period": {
      "id": 4,
      "name": "2026 Semester 1",
      "academic_year": "2025/2026",
      "semester": "1"
    },
    "student": {
      "id": 22,
      "student_number": "26102859",
      "name": "Ama Mensah",
      "email": "ama@example.com",
      "phone": "0240000000"
    },
    "has_active_permit": false,
    "has_pending_request": false,
    "missing_email": false,
    "missing_phone": false
  }
}
```

### Staff Permit Issue Options

Request:

```txt
GET /api/mobile/operations/permits/options?student_id=22
```

```json
{
  "data": {
    "default_amount": 50,
    "currency": "GHS",
    "default_validity_days": 120,
    "permit_requests_enabled": true,
    "default_starts_at": "2026-05-23T10:00:00.000000Z",
    "default_expires_at": "2026-09-20T23:59:59.000000Z",
    "student_number_prefix": "2610",
    "courses": ["Computer Science", "Information Technology"],
    "levels": ["100", "200", "300", "400"],
    "active_academic_period": {
      "id": 4,
      "name": "2026 Semester 1",
      "academic_year": "2025/2026",
      "semester": "1",
      "starts_at": "2026-05-01",
      "ends_at": "2026-09-20"
    },
    "student": {
      "id": 22,
      "student_number": "26102859",
      "name": "Ama Mensah",
      "email": null,
      "phone": "0240000000",
      "course": "Computer Science",
      "level": "400"
    },
    "selected_student_state": {
      "has_active_permit": false,
      "has_pending_request": false,
      "missing_email": true,
      "missing_phone": false,
      "blocking_reasons": []
    }
  }
}
```

### Permit Request Created

```json
{
  "data": {
    "request_reference": "PR-2026-8F2KQ1",
    "status": "awaiting_payment",
    "amount": "50.00",
    "currency": "GHS",
    "contact_email": "ama@example.com",
    "contact_phone": "0240000000",
    "requires_review": false,
    "review_status": null,
    "expires_at": "2026-05-22T12:00:00.000000Z"
  }
}
```

### Paystack Initialization

```json
{
  "authorization_url": "https://checkout.paystack.com/abc123",
  "access_code": "abc123",
  "reference": "PAY-2026-A1B2C3",
  "permit_request_reference": "PR-2026-8F2KQ1"
}
```

### Election Detail

```json
{
  "data": {
    "id": 7,
    "title": "SRC General Election",
    "status": "active",
    "starts_at": "2026-05-22T08:00:00.000000Z",
    "ends_at": "2026-05-22T18:00:00.000000Z",
    "results_visible": false,
    "eligibility": {
      "eligible": true,
      "reason": null
    },
    "positions": [
      {
        "id": 2,
        "title": "President",
        "has_voted": false,
        "candidates": [
          {
            "id": 14,
            "student_name": "Kojo Owusu",
            "slogan": "Forward Together",
            "status": "approved",
            "poster_url": null
          }
        ]
      }
    ]
  }
}
```

### Vote Success

```json
{
  "data": {
    "id": 31,
    "election_id": 7,
    "election_position_id": 2,
    "election_candidate_id": 14,
    "cast_at": "2026-05-22T10:30:00.000000Z"
  }
}
```

### Verification Result

```json
{
  "data": {
    "method": "nfc",
    "result": "valid",
    "reason": "Active permit found.",
    "student": {
      "id": 22,
      "student_number": "26102859",
      "name": "Ama Mensah"
    },
    "permit": {
      "id": 18,
      "status": "active",
      "code_last4": "7KQ2"
    }
  }
}
```

## Backend Readiness Checklist

- [x] Sanctum token auth works for mobile login/logout.
- [x] CORS can be configured for app usage if the mobile app calls the API from a web runtime.
- [x] API rate limits are configured for login, verification, sensitive actions, and permit requests.
- [x] Payment secrets, token hashes, raw NFC UIDs, and raw permit codes are not exposed.
- [x] Mobile resources avoid internal metadata.
- [x] Student endpoints are scoped to the authenticated student's linked profile.
- [x] Staff operation endpoints use backend permissions.
- [x] Content endpoints expose only published public content.
- [x] Mobile endpoints are covered by feature tests.

## Expo Handling Notes

- Store token in `expo-secure-store`.
- Keep an in-memory auth state after reading the secure token at app startup.
- Clear secure token on `401`.
- Treat `403` as a role/permission state, not a login failure.
- Treat `422` as field validation and display messages near inputs.
- Open Paystack `authorization_url` in a browser/session flow and verify payment server-side after return.
- Use polling on permit request status after payment because callback and webhook timing can vary.
