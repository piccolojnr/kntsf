# Security Hardening

This document summarizes the production-readiness pass for the Laravel/Inertia SRC permit verification platform.

## Route Security Summary

| Area | Access boundary | Notes |
| --- | --- | --- |
| Public portal | Public, throttled | Only published/public announcements, events, documents, executives, and public election info are exposed. |
| Self-service permits | Public or Sanctum mobile | Public flow can create provisional students; mobile flow requires linked student accounts. Payment is verified server-side. |
| Dashboard | `auth`, `verified` | Operational dashboard data is never public. |
| Students, permits, payments, NFC cards | `auth`, `verified`, policies/Form Requests | Destructive and sensitive actions require permissions and confirmation in the UI. |
| Verification | `auth`, `verified`, `verification.perform`, throttled | Raw identifiers are accepted only as request input and are hashed before logging. |
| Audit logs | `auth`, `verified`, `audit_logs.view` | Read-only audit view for permitted users. |
| Setup password | `guest`, throttled | Uses hashed setup tokens; expired and used tokens fail. |
| Content management | `auth`, `verified`, policies | Draft/internal content stays inside the dashboard. |

## Rate Limiters

Named application limiters are configured in `App\Providers\AppServiceProvider`:

| Limiter | Current use | Limit |
| --- | --- | --- |
| `login` | Fortify login | 5 per minute per email/IP |
| `two-factor` | Fortify 2FA challenge | 5 per minute |
| `setup-password` | Setup-password GET/POST | 6 per minute per IP/token |
| `verification` | Student number, permit code, NFC verification | 30 per minute per user/IP |
| `sensitive-actions` | Payment, permit, and NFC status actions | 20 per minute per user/IP |
| `public-content` | Public portal pages | 120 per minute per IP |
| `mobile-login` | Mobile API login | 5 per minute per email/IP |
| `mobile-verification` | Mobile verification endpoints | 30 per minute per user/IP |
| `mobile-sensitive-actions` | Mobile staff operations | 20 per minute per user/IP |
| `mobile-permit-requests` | Mobile permit request create/init/verify | 12 per minute per user/IP |

## Sensitive Data Rules

- Never store raw NFC UIDs. Store `uid_hash` and `uid_last4` only.
- Never store full permit codes. Store `code_hash` and `code_last4` only.
- Never store raw verification identifiers in logs.
- Never expose password hashes, token hashes, raw UIDs, full permit codes, or internal metadata in Inertia props.
- Public controllers must return explicit payload arrays instead of raw models.
- Paystack metadata and access codes are not returned from permit request resources.

## Token Security

Account setup tokens use these rules:

- Plain tokens are shown only in outbound setup links.
- The database stores SHA-256 token hashes.
- Old unused setup tokens are invalidated when a new setup token is issued.
- Expired or used tokens return a not-found/error response.
- Password setup marks the token as used inside a transaction.

## Upload Rules

Dashboard uploads are validated by Form Requests before Media Library attachment:

- Documents allow office/PDF style files only.
- Featured images and gallery uploads must be images.
- File sizes are capped in the relevant request classes.
- Public document download links are returned only through public document routes after `published` and `public` checks.
- Private/internal media rules should be revisited before cloud storage or public mobile media downloads are added.

## Authorization Rules

The system relies on policies and Form Request authorization for module access:

- Students: `StudentPolicy`
- Executives/users: `UserPolicy`, `ExecutiveProfilePolicy`
- Roles: role controller and role permissions
- Permits: `PermitPolicy`
- Payments: `PaymentPolicy`
- NFC cards: `NfcCardPolicy`
- Verification logs: `VerificationLogPolicy`
- Audit logs: `AuditLogPolicy`
- Announcements, events, documents, polls, elections: module policies

Frontend visibility is not authorization. Sidebar and button filtering improve UX only; backend policies remain authoritative.

## Public/Private Content Boundary

Public routes must only query content through published/public scopes:

- Announcements: `published()` and `publicVisible()`
- Events: `published()` and `publicVisible()`
- Documents: `published()` and `publicVisible()`
- Executives: `published()`
- Elections: `publicVisible()` with results guarded by `results_visible`

Draft, archived, internal, and administrative metadata must not appear in public payloads.

## Error Pages

Inertia error handling renders a simple branded page for:

- `403`
- `404`
- `500`
- `503`

JSON requests keep their normal JSON error responses.

## Audit Coverage

Audit logging is expected for:

- Student create/update/delete and account activation
- Executive create/update/activation/deactivation/setup link
- Role and permission changes
- Permit issue/revoke/card delivery
- Payment create/success/failure/cancel
- Permit request create/payment verify/issue/review/recovery/cancel/expire
- NFC register/replace/lost/revoke
- Verification attempts
- Content publish/archive/delete
- Poll and election voting actions

Audit logs may include metadata, old values, and new values, but must avoid raw secret identifiers.
