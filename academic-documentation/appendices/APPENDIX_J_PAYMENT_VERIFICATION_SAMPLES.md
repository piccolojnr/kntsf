# Appendix J — Payment Verification Samples

This appendix provides text-only samples of Paystack payment verification behaviour. Live secret keys and production transaction references are not included.

## J.1 Payment Verification Sample Cases

Table J.1: Payment Verification Sample Cases

| Case | Request status after processing | Permit outcome |
| --- | --- | --- |
| Successful server-side verification | `paid` or progressing to `issued` | Permit may be issued after business rules pass |
| Failed payment | `failed` | No permit issued |
| Abandoned checkout | `awaiting_payment` until expiry | No permit issued |
| Duplicate callback or verify call | unchanged after first success | Idempotent handling prevents duplicate permits |
| Admin recovery retry | updated after manual verification | Permits issued only after confirmed payment |

## J.2 Initialization Sample

```json
{
  "authorization_url": "https://checkout.paystack.com/<masked>",
  "access_code": "<masked>",
  "reference": "PAY-2026-XXXX",
  "permit_request_reference": "PR-2026-XXXX"
}
```

## J.3 Permit Request Created Sample

```json
{
  "data": {
    "request_reference": "PR-2026-XXXX",
    "status": "awaiting_payment",
    "amount": "50.00",
    "currency": "GHS",
    "requires_review": false,
    "review_status": null
  }
}
```

## J.4 Idempotency Rule

Payment verification must be idempotent. Repeated callback, webhook, or `verify-payment` requests after a successful verification must not create duplicate active permits or duplicate payment records for the same permit request.

[INSERT FIGURE J.1 — Paystack Payment Initialization Screenshot] and [INSERT FIGURE J.2 — Payment Verification Result Screenshot] may be added during the screenshot pass.
