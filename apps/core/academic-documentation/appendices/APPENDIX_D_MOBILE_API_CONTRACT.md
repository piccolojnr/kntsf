# Appendix D — Mobile API Contract

This appendix documents the mobile API contract rules used by the Expo application. Endpoint listings appear in Appendix B. The authoritative project reference remains `docs/MOBILE_APP_API_CONTRACT.md`.

## D.1 Mobile API Authentication Contract

Table D.1: Mobile API Authentication Contract

| Requirement | Rule |
| --- | --- |
| Base path | `/api/mobile/*` |
| Login | `POST /api/mobile/auth/login` with email, password, and optional `device_name` |
| Token type | Sanctum personal access token returned as `Bearer` token |
| Authenticated requests | Must send `Authorization: Bearer <token>`, `Accept: application/json`, and `Content-Type: application/json` |
| Token storage | Mobile app must store token in secure storage (for example `expo-secure-store`), not plain AsyncStorage |
| Logout | `POST /api/mobile/auth/logout` revokes the current token |
| Profile | `GET /api/mobile/me` returns authenticated user, roles, and permissions summary |

## D.2 Standard API Response Structure

Successful authenticated responses return JSON payloads shaped by Laravel API resources. Login success returns:

```json
{
  "token": "<issued-once-plain-text-token>",
  "token_type": "Bearer",
  "user": {
    "id": 12,
    "name": "Example Student",
    "email": "student@example.com",
    "roles": ["student"],
    "permissions": []
  }
}
```

List endpoints return paginated resource collections with `data`, `links`, and `meta` fields.

## D.3 Pagination Format

Table D.3: Pagination Fields

| Field | Purpose |
| --- | --- |
| data | Array of resource records |
| links.first / links.last / links.prev / links.next | Page navigation URLs |
| meta.current_page | Active page number |
| meta.per_page | Page size (typically 1–25 on mobile lists) |
| meta.total | Total records |

## D.4 Mobile Error Responses

Table D.4: Common Mobile API Errors

| HTTP status | JSON message pattern | Mobile handling |
| --- | --- | --- |
| 401 | `Unauthenticated.` | Clear secure token and return to login |
| 403 | `This action is unauthorized.` | Show permission restriction |
| 422 | `The given data was invalid.` with `errors` object | Display field validation messages |
| 404 | `Not Found` | Treat record or published content as unavailable |
| 429 | `Too Many Attempts.` | Back off and retry later |

## D.5 Permit Request Contract Rules

| Step | Contract rule |
| --- | --- |
| 1 | Read `GET /api/mobile/permit-requests/options` before creating a request |
| 2 | Block checkout when `has_active_permit` or `has_pending_request` is true |
| 3 | Create request with `POST /api/mobile/permit-requests` |
| 4 | Initialize Paystack with `POST .../initialize-payment` |
| 5 | Open `authorization_url` in browser or secure web view |
| 6 | After redirect, call `POST .../verify-payment` with payment reference |
| 7 | Poll request detail until status becomes `issued`, `paid`, or `failed` |

Redirect alone is not proof of payment. Server-side Paystack verification is required.

## D.6 Election Voting Contract Rules

| Rule | Description |
| --- | --- |
| Eligibility | Requires linked student, active account, active permit for election period, open election window, and approved candidate |
| Vote endpoint | `POST /api/mobile/elections/{election}/positions/{position}/vote` |
| Immutability | Votes are not casually editable once submitted |
| Results | `GET /api/mobile/elections/{election}/results` respects visibility rules |

## D.7 Verification Response Contract

Verification endpoints return a structured result without exposing raw NFC UIDs or full permit codes:

| Field | Meaning |
| --- | --- |
| method | `student_number`, `permit_code`, or `nfc` |
| result | `valid`, `invalid`, or related outcome |
| reason | Human-readable explanation |
| student | Limited student identity fields |
| permit | Status and display-safe permit reference |

## D.8 Security and Scope Rules

- Student endpoints return only the authenticated student's linked records.
- Staff operation endpoints require backend permissions even if the mobile UI hides an action.
- Published content endpoints return `404` for draft or internal records.
- Rate limits apply to login, verification, permit requests, and sensitive operations.
- Live tokens, webhook secrets, hash keys, and raw card identifiers must not appear in appendix samples or screenshots.
