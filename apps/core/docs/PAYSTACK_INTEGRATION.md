# Paystack Integration

The app uses Laravel's HTTP client directly for Paystack.

## Environment

```env
PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_PAYMENT_URL=https://api.paystack.co
PAYSTACK_WEBHOOK_SECRET=
```

`PAYSTACK_SECRET_KEY` is used for API calls and webhook signature validation.

## Payment Flow

```txt
Create permit request
→ Create local pending payment
→ POST /transaction/initialize
→ Redirect student to authorization_url
→ Paystack redirects to callback
→ GET /permit-request/payment/callback?reference=...
→ GET /transaction/verify/{reference}
→ Mark payment successful
→ Complete permit request
```

The callback never trusts query parameters as proof of payment. It only uses the reference to perform server-side verification.

## Late Callback and Recovery Handling

Paystack callbacks and webhooks can arrive late, repeat, or race each other. The app handles this by treating verification and permit completion as idempotent operations:

- callbacks/webhooks verify the payment directly with Paystack
- successful payments are locked before status changes
- permit completion reuses `CompletePermitRequestAction`
- duplicate active permits for the same student and academic period are blocked

If a request gets stuck, admins can retry verification from the permit request dashboard. This calls the same server-side Paystack verification action used by callbacks and mobile verification.

## Webhook

Endpoint:

```txt
POST /payments/paystack/webhook
```

Supported events:

- `charge.success`
- `charge.failed`

The webhook verifies `x-paystack-signature` using HMAC SHA-512 over the raw request body. CSRF protection is disabled only for this webhook path.

If webhook delivery fails or arrives after the student leaves checkout, admin retry verification or the mobile/public callback can still reconcile the local payment.

## Security Rules

- Do not store raw permit codes.
- Do not expose internal payment metadata publicly.
- Do not issue permits before server-side verification.
- Treat webhook and callback as idempotent.
- Keep Paystack gateway details inside payment metadata until a second gateway is needed.

## Mobile Reuse

The Expo app reuses the same orchestration actions:

- create permit request
- initialize Paystack payment
- verify callback/webhook
- complete permit request

Mobile endpoints:

```txt
POST /api/mobile/permit-requests/{reference}/initialize-payment
POST /api/mobile/permit-requests/{reference}/verify-payment
```

The app should open the returned `authorization_url` in a browser/web view. After the Paystack return, it should call the verify endpoint with the local payment reference and then refresh the permit request. Verification remains server-side and idempotent.
