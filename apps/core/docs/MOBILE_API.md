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

### Operations

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/mobile/operations/students/search` | Staff/admin permissions | Search students |
| GET | `/api/mobile/operations/students/{student}` | Staff/admin permissions | View student details |
| POST | `/api/mobile/operations/permits/issue` | `permits.issue` | Issue permit using existing action |
| POST | `/api/mobile/operations/nfc-cards/register` | `nfc_cards.manage` | Register NFC card |
| POST | `/api/mobile/operations/nfc-cards/{nfcCard}/replace` | `nfc_cards.manage` | Replace NFC card |
| POST | `/api/mobile/operations/nfc-cards/{nfcCard}/revoke` | `nfc_cards.manage` | Revoke NFC card |

### Verification

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/mobile/verification/student-number` | `verification.perform`, throttled | Verify student number |
| POST | `/api/mobile/verification/permit-code` | `verification.perform`, throttled | Verify permit code |
| POST | `/api/mobile/verification/nfc` | `verification.perform`, throttled | Verify NFC UID |

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

## Expo Integration Notes

- Store the bearer token in the platform secure storage layer, not plain async storage.
- Send `Accept: application/json` with all requests.
- Handle `401` by clearing the token and returning the user to login.
- Handle `403` as a permission/role problem.
- Handle `422` validation errors by displaying field-level messages.

## Not Built Yet

- Mobile password reset.
- Mobile public content browsing.
- Push notifications.
- Gateway payment checkout.
- Mobile election voting flow.
