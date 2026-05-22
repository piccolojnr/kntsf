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

## Webhook

Endpoint:

```txt
POST /payments/paystack/webhook
```

Supported events:

- `charge.success`
- `charge.failed`

The webhook verifies `x-paystack-signature` using HMAC SHA-512 over the raw request body. CSRF protection is disabled only for this webhook path.

## Security Rules

- Do not store raw permit codes.
- Do not expose internal payment metadata publicly.
- Do not issue permits before server-side verification.
- Treat webhook and callback as idempotent.
- Keep Paystack gateway details inside payment metadata until a second gateway is needed.

## Mobile Reuse

The future Expo app can reuse the same orchestration actions:

- create permit request
- initialize Paystack payment
- verify callback/webhook
- complete permit request

The mobile layer should call API endpoints around these actions rather than duplicating payment or permit issuing logic.
