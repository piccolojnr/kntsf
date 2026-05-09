# NFC Cards Module

## Scope

Phase 1 supports dashboard-based NFC card registration and lifecycle management.

Included:

- register NFC card UID to a student
- replace an active card
- mark a card lost
- revoke a card
- verify a student through NFC UID from the manual verification page

Not included yet:

- mobile API
- physical NFC reader integration
- public verification endpoints

## UID Hashing

Raw NFC UID values must never be stored.

`NfcUidHasher` normalizes the submitted UID, then stores:

- `uid_hash`: HMAC SHA-256 hash
- `uid_last4`: last four normalized UID characters for dashboard display

The hash key is configured with:

```env
NFC_UID_HASH_KEY=
```

If not set locally, the app falls back to `APP_KEY`.

## Table Design

`nfc_cards` stores card assignment and lifecycle state.

| Column | Purpose |
| --- | --- |
| `student_id` | Assigned student |
| `uid_hash` | Unique HMAC hash of normalized UID |
| `uid_last4` | Display-only UID suffix |
| `status` | Lifecycle status |
| `issued_at` | Registration timestamp |
| `activated_at` | Activation timestamp |
| `deactivated_at` | Deactivation timestamp |
| `replaced_at` | Replacement timestamp |
| `lost_at` | Lost timestamp |
| `created_by_id` | Staff/admin who registered the card |
| `metadata` | Future structured data |

## Statuses

- `active`
- `inactive`
- `revoked`
- `lost`
- `stolen`
- `replaced`
- `damaged`

Only `active` cards can verify as valid.

## One Active Card Rule

A student can only have one active NFC card.

When a new card is registered for a student, previous active cards are marked `replaced`.
The rule is enforced in `RegisterNfcCardAction`, not only in the UI.

## Routes

| Method | URI | Purpose |
| --- | --- | --- |
| `GET` | `/nfc-cards` | Card registry |
| `POST` | `/nfc-cards` | Register card |
| `GET` | `/nfc-cards/{nfc_card}` | Card details |
| `POST` | `/nfc-cards/{nfc_card}/replace` | Replace active card |
| `POST` | `/nfc-cards/{nfc_card}/mark-lost` | Mark card lost |
| `POST` | `/nfc-cards/{nfc_card}/revoke` | Revoke card |
| `DELETE` | `/nfc-cards/{nfc_card}` | Soft delete card |

## Verification Integration

Manual NFC verification is available at:

```txt
POST /verification/nfc
```

The flow:

1. Hash submitted UID.
2. Find matching NFC card by `uid_hash`.
3. Reject missing or inactive cards.
4. Resolve the student.
5. Check the active academic period permit.
6. Log the attempt with a hashed identifier only.

This is dashboard-only for now. Future mobile/NFC reader integrations should reuse the same verification action and log action.
