# Payments Module

## Scope

Phase 1 adds manual/admin payment records linked to students and optionally permits.

Included:

- manual payment creation
- pending/success/failed/cancelled statuses
- admin status changes
- optional permit issuance for successful manual payments
- payment registry and details pages

Not included yet:

- Paystack or ExpressPay checkout
- gateway webhooks
- mobile payment API
- public payment verification endpoints

## Table Design

`payments` stores one payment attempt or manual payment record.

| Column | Purpose |
| --- | --- |
| `student_id` | Student the payment belongs to |
| `permit_id` | Optional one-to-one linked permit |
| `reference` | Internal unique readable reference |
| `gateway` | `manual` for this phase |
| `gateway_reference` | Future provider reference |
| `status` | `pending`, `success`, `failed`, or `cancelled` |
| `amount` | Decimal money amount |
| `currency` | Three-letter currency code, default `GHS` |
| `paid_at` | Payment completion timestamp |
| `verified_at` | Admin/gateway verification timestamp |
| `failure_reason` | Required when marking failed |
| `metadata` | Notes and future provider payload summaries |
| `created_by_id` | Admin/staff who created the manual payment |

Money is stored with `decimal(10,2)`.

## Manual Payment Flow

`CreateManualPaymentAction` creates payments with gateway `manual`.

Manual payments may start as:

- `pending`
- `success`

If a successful manual payment should issue a permit, the action calls `IssuePermitAction`. It does not duplicate permit issuance rules.

## Payment Status Flow

Actions:

- `MarkPaymentSuccessfulAction`
- `MarkPaymentFailedAction`
- `CancelPaymentAction`

Cancelled payments cannot be marked successful. Successful payments cannot be cancelled or marked failed in this phase.

## Payment to Permit Relationship

Each payment can link to one permit using `payments.permit_id`.

Each permit can have one linked payment.

This keeps future payment reconciliation straightforward while preserving the existing permit issuance rules.

## Gateway Integration Points

Future gateway support should add:

- gateway checkout initialization action
- gateway verification action
- webhook controller
- idempotency table or idempotency keys
- signed webhook validation
- gateway payload summaries in `metadata`

Webhook handling should be idempotent:

- ignore duplicate successful callbacks for an already successful payment
- never issue duplicate active permits for the same student and academic period
- always reuse `MarkPaymentSuccessfulAction` and `IssuePermitAction`

## Routes

| Method | URI | Purpose |
| --- | --- | --- |
| `GET` | `/payments` | Payment registry |
| `POST` | `/payments` | Create manual payment |
| `GET` | `/payments/{payment}` | Payment details |
| `POST` | `/payments/{payment}/mark-successful` | Mark payment successful |
| `POST` | `/payments/{payment}/mark-failed` | Mark payment failed |
| `POST` | `/payments/{payment}/cancel` | Cancel payment |
| `DELETE` | `/payments/{payment}` | Soft delete payment |
