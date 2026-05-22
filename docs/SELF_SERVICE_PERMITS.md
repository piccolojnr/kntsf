# Self-Service Permits

Self-service permit requests let public students request and pay for SRC permits without dashboard access.

## Lifecycle

```txt
student lookup
→ permit request created
→ pending Paystack payment created
→ Paystack checkout initialized
→ server verifies Paystack reference
→ payment marked successful
→ permit issued, or review required
```

Permits are never issued from the browser redirect alone. The app verifies payment directly with Paystack before marking the request paid.

## Existing Students

Existing students are found by `student_number`. Public pages only expose a masked preview:

```txt
D***** A***
2610****
Computer Science
Level 400
```

If an existing student already has an email, self-service cannot overwrite it. Missing email or phone values may be completed.

## New Students

If the student number is not found, the portal creates a provisional `students` record:

```txt
source = self_service
verification_status = pending_review
```

The related `permit_requests.requires_review` flag is set to `true`. After verified payment, the request remains paid until an admin approves review. Approval verifies the student record and completes permit issuance.

## Admin Review

Dashboard users with `permit_requests.manage` can approve or reject review-required requests.

Approval:

- marks the student verified
- stores reviewer and notes
- issues the permit if payment is verified

Rejection:

- marks the student rejected
- stores review notes
- does not issue a permit

## Idempotency

The workflow locks payment and permit request rows during verification/completion. Duplicate callbacks or webhooks safely return without issuing duplicate permits.

Duplicate active permits for the same student and academic period are still blocked by `IssuePermitAction`.

## Recovery and Admin Oversight

Admins use `/permit-requests` to investigate self-service requests by status, review status, academic period, date range, and student search.

Important recovery states:

- pending payment: request exists but payment is not verified
- paid but not issued: payment succeeded but permit issuance is still pending
- failed payment/request: request failed during payment or issuance
- expired: unpaid request passed its payment window
- requires review: provisional student record needs admin approval

Admin recovery actions:

- retry payment verification: calls Paystack server-side again
- retry permit issuance: reuses `CompletePermitRequestAction` and requires a verified payment
- cancel request: closes a non-issued request
- mark expired: closes an unpaid pending request

Every admin recovery action writes an audit log. Duplicate active permits remain blocked by the existing permit issuance action.

The scheduled command `permit-requests:expire` marks old `awaiting_payment` requests as expired. It does not expire paid or issued requests.

## Mobile API Reuse

Authenticated mobile students use the same `PermitRequest`, `Payment`, Paystack, and permit issuance actions.

Mobile differences:

- only linked student accounts can create requests
- the mobile API never creates unknown/provisional students
- students cannot change student number, name, course, or level from mobile
- missing email or phone can be supplied if the student record does not already have it
- active permits and open requests are reported by `/api/mobile/permit-requests/options` before checkout

Unknown students or students without linked accounts should use the public website flow for now.
