# Permits Module

Permits Phase 1 adds permit issuance and management tied to students and academic periods.

## Table Design

`permits`

| Column | Purpose |
| --- | --- |
| `student_id` | Owner student record. |
| `academic_period_id` | Academic period/semester for the permit. Nullable for schema flexibility, but issuance requires a period. |
| `issued_by_id` | Admin/staff user who issued the permit. |
| `code_hash` | HMAC SHA-256 hash of the generated permit code. |
| `code_last4` | Last four characters for support lookup. |
| `status` | `active`, `expired`, or `revoked`. |
| `starts_at`, `expires_at` | Validity window. |
| `amount_paid`, `currency` | Payment placeholder fields. No payment module is built yet. |
| `card_delivered_at` | Marks physical card delivery. |
| `revoked_at`, `revoked_by_id`, `revocation_reason` | Revocation audit fields. |
| `metadata` | Reserved JSON extension point. |
| `deleted_at` | Soft delete support. |

## Issue Flow

Permit issuance is handled by:

```txt
app/Actions/Permits/IssuePermitAction.php
```

The action:

- runs in a database transaction
- requires an active academic period if one is not explicitly selected
- blocks duplicate active permits for the same student and academic period
- generates a one-time public code
- stores only `code_hash` and `code_last4`
- uses permit settings defaults for amount, currency, and validity days
- records the issuing user

The generated code is returned once to the controller and shown once in the UI.

## No Plaintext Code Storage

Plain permit codes are never stored.

Hashing is handled by:

```txt
app/Support/PermitCodeHasher.php
```

It uses HMAC SHA-256 with:

```txt
PERMIT_CODE_HASH_KEY
```

If that key is not set, the app key is used through `config/permits.php`.

## Revocation

Permit revocation is handled by:

```txt
app/Actions/Permits/RevokePermitAction.php
```

Revoked permits cannot be revoked twice. Revocation records who revoked the permit, when, and the optional reason.

## Card Delivery

Physical card delivery is tracked by:

```txt
app/Actions/Permits/MarkPermitCardDeliveredAction.php
```

This only marks `card_delivered_at`. NFC/card provisioning is not built yet.

## Permissions

Existing permit permissions are used:

```txt
permits.view
permits.issue
permits.revoke
```

## Routes

```txt
GET    /permits
POST   /permits
GET    /permits/{permit}
POST   /permits/{permit}/revoke
POST   /permits/{permit}/mark-card-delivered
DELETE /permits/{permit}
```

## Future Integration Points

- Payment reconciliation can attach to `amount_paid` and `currency`.
- NFC card provisioning can attach to permit delivery and a future NFC card table.
- Public/mobile verification can verify submitted permit codes by hashing input and matching `code_hash`.
- Expiration automation can later move active permits to `expired`.
