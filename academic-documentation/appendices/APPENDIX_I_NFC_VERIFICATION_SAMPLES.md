# Appendix I — NFC Verification Samples

This appendix provides text-only samples of NFC verification behaviour. Screenshots may be added later. Raw NFC UIDs and full student personal data are omitted.

## I.1 NFC Card Lifecycle Examples

Table I.1: NFC Card Lifecycle Examples

| State | Meaning | Operational action |
| --- | --- | --- |
| active | Card is registered and usable | May be scanned for verification |
| lost | Student reported card lost | Verification should fail; replacement required |
| revoked | Card revoked by staff | Verification should fail |
| replaced | Card superseded by a newer card | Old card must not verify successfully |

## I.2 Verification Response Samples

Table I.2: NFC Verification Response Samples (Masked)

| Case | method | result | reason (example) |
| --- | --- | --- | --- |
| Valid active permit | nfc | valid | Active permit found. |
| Unregistered card | nfc | invalid | NFC card is not registered. |
| Revoked card | nfc | invalid | NFC card is revoked. |
| No active permit | nfc | invalid | No active permit for the current period. |

Example valid response structure:

```json
{
  "data": {
    "method": "nfc",
    "result": "valid",
    "reason": "Active permit found.",
    "student": {
      "id": 22,
      "student_number": "2610XXXX",
      "name": "Sample Student"
    },
    "permit": {
      "id": 18,
      "status": "active",
      "code_last4": "7KQ2"
    }
  }
}
```

## I.3 UID Masking Notes

- Raw NFC UIDs are normalized and stored as hashed values in the database.
- API responses do not return raw UID values to mobile clients or appendix samples.
- Verification logs record method, result, and actor without exposing unnecessary personal data.

[INSERT FIGURE I.1 — NFC Verification Result Screenshot] may be added during the screenshot pass.
