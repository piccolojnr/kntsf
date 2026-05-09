# Verification Module

## Scope

Phase 1 supports manual verification for staff/admin users:

- verify by student number
- verify by permit code
- verify by NFC UID
- log every attempt
- protect logs from raw submitted identifiers

NFC, public verification endpoints, and mobile APIs are intentionally not included yet.

## Data Model

`verification_logs` stores audit records for each verification attempt.

| Column | Purpose |
| --- | --- |
| `method` | `student_number`, `permit_code`, or `nfc` |
| `result` | `valid`, `invalid`, `expired`, `revoked`, `not_found`, or `error` |
| `identifier_hash` | HMAC hash of the submitted identifier |
| `reason` | Human-readable outcome note |
| `student_id` | Resolved student, when available |
| `permit_id` | Resolved permit, when available |
| `verifier_id` | Authenticated user who performed the check |
| `ip_address`, `user_agent` | Request context |
| `metadata` | Structured internal context |
| `created_at` | Audit timestamp |

There is no `updated_at` column because logs are append-only audit records.

## Privacy Rule

Raw submitted student numbers and permit codes must not be stored in verification logs.
Raw NFC UIDs must not be stored either.

The module stores:

- `identifier_hash`
- resolved `student_id`
- resolved `permit_id`
- permit `code_last4` for display
- NFC card metadata references, never the raw UID

The full plaintext permit code is never stored.

## Verification Flow

### Student Number

`VerifyStudentNumberAction`:

1. Hashes the submitted student number for logging.
2. Finds the student by `student_number`.
3. Uses the active academic period when available.
4. Finds the latest matching permit.
5. Returns `valid`, `not_found`, `expired`, `revoked`, or `invalid`.
6. Marks active-but-expired permits as `expired`.

### Permit Code

`VerifyPermitCodeAction`:

1. Hashes the submitted code for logging.
2. Hashes the submitted code with `PermitCodeHasher` to find a permit.
3. Evaluates status and validity dates.
4. Returns normalized result data.
5. Marks active-but-expired permits as `expired`.

`CreateVerificationLogAction` writes the final audit record for all verification flows.

### NFC UID

`VerifyNfcUidAction`:

1. Hashes the submitted NFC UID with `NfcUidHasher`.
2. Finds the matching NFC card by `uid_hash`.
3. Returns `not_found` if no card exists.
4. Returns `card_inactive` if the card status is not `active`.
5. Resolves the assigned student and checks the current permit.
6. Returns `valid`, `expired`, `revoked`, or `invalid`.
7. Logs the attempt using only the hashed UID.

The dashboard NFC form is for internal testing only until mobile/NFC reader support is added.

## Permissions

| Permission | Use |
| --- | --- |
| `verification.perform` | Access verification page and submit checks |
| `verification.view_logs` | View verification logs |

Current seeding gives staff/admin operational access and keeps students out of the module.

## Routes

| Method | URI | Purpose |
| --- | --- | --- |
| `GET` | `/verification` | Manual verification page |
| `POST` | `/verification/student-number` | Verify by student number |
| `POST` | `/verification/permit-code` | Verify by permit code |
| `POST` | `/verification/nfc` | Verify by NFC UID |
| `GET` | `/verification/logs` | Audit log list |

All routes are protected by `auth` and `verified`.

## Frontend

Page entry points:

- `resources/js/pages/verification/index.tsx`
- `resources/js/pages/verification/logs.tsx`

Feature components:

- `student-number-verification-form.tsx`
- `permit-code-verification-form.tsx`
- `nfc-verification-form.tsx`
- `verification-result-card.tsx`
- `verification-log-list.tsx`
- `verification-result-badge.tsx`

The UI shows resolved student/permit details only. It does not display raw submitted identifiers in logs.

## Future NFC Integration

NFC can later call the same verification actions through a dedicated channel:

- hash the NFC-derived permit code
- evaluate the permit
- create a verification log with method metadata

Do not bypass the log action when NFC is added.
