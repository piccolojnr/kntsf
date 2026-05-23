# Appendix L — Queue and Scheduler Configuration

This appendix documents background processing and scheduled maintenance tasks. It supports the queue and performance discussion in Chapter Four.

## L.1 Queue Driver Summary

| Component | Configuration | Purpose |
| --- | --- | --- |
| Default connection | `database` (from `QUEUE_CONNECTION`) | Stores jobs in the `jobs` table |
| After commit | `QUEUE_AFTER_COMMIT=true` | Dispatches jobs only after database transactions commit |
| Retry after | `DB_QUEUE_RETRY_AFTER=120` | Requeues reserved jobs after 120 seconds |
| Media queue | `MEDIA_QUEUE=media` | Separates media conversion work |
| Failed jobs | `failed_jobs` table | Stores failed job diagnostics for review |

The system remains Redis-ready. Higher traffic deployments may switch queue and cache drivers to Redis and adopt Laravel Horizon for monitoring.

## L.2 Queue Job Summary

Table L.1: Queue Job Summary

| Job category | Examples | Why queued |
| --- | --- | --- |
| Account activation | `SetupPasswordNotification` | Avoid blocking account setup request |
| Permit notifications | `PermitIssuedNotification`, `PermitRevokedNotification` | Send email after permit state changes |
| Payment notifications | `PaymentSuccessfulNotification`, `PaymentFailedNotification`, `PaymentDueNotification`, `PaymentCancelledNotification` | Notify users after payment events |
| Permit request notifications | `PermitRequestPaymentVerifiedNotification`, `PermitRequestFailedNotification`, `PermitRequestReviewRequiredNotification` | Notify students and staff after request changes |
| NFC notifications | `NfcCardRegisteredNotification`, `NfcCardLostNotification`, `NfcCardRevokedNotification` | Notify after card lifecycle events |
| Media processing | Spatie Media Library conversions on `media` queue | Avoid delaying content uploads |

## L.3 Queue Worker Command

Recommended worker command:

```bash
php artisan queue:work --queue=default,media --tries=3 --timeout=120
```

During deployment, run:

```bash
php artisan queue:restart
```

[INSERT FIGURE L.1 — Queue Worker Output Sample] may be added later as screenshot evidence that the worker is processing jobs in the deployment environment.

## L.4 Scheduler Configuration

Table L.2: Scheduled Task Summary

| Scheduled command | Frequency | Purpose |
| --- | --- | --- |
| `sanctum:prune-expired --hours=24` | Daily | Remove expired Sanctum tokens |
| `queue:prune-failed --hours=168` | Daily | Prune old failed queue jobs |
| `queue:prune-batches --hours=168 --unfinished=336 --cancelled=336` | Daily | Prune old queue batches |
| `permits:expire` | Hourly | Expire permits past validity |
| `permit-requests:expire` | Hourly | Expire unpaid or stale permit requests |

Scheduler registration is defined in `routes/console.php`.

## L.5 Cron Entry

The server cron should invoke Laravel's scheduler every minute:

```bash
* * * * * cd /path/to/kntsf-core && php artisan schedule:run >> /dev/null 2>&1
```

Replace `/path/to/kntsf-core` with the deployed application directory.

## L.6 Cache Invalidation Strategy

| Cached item | Invalidation approach |
| --- | --- |
| Dashboard summaries | Refreshed on relevant model changes or TTL expiry |
| Public content lists | Cached for repeated reads; invalidated when content is published or updated |
| Permit settings | Read from `app_settings` with cache-aware helpers |
| Active academic period | Cached lookup invalidated when period records change |

Sensitive workflow decisions such as payment verification, vote eligibility, and permit validity always use authoritative database records at request time.

## L.7 Operational Monitoring Notes

- Monitor `failed_jobs` after deployments and payment incidents.
- Confirm the queue worker is running before election periods or permit issuance peaks.
- Confirm the scheduler is active so expired permits and permit requests do not accumulate indefinitely.
- Do not paste failed job payloads containing student or payment metadata into the dissertation appendices.
