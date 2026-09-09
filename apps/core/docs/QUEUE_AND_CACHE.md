# Queue and Cache

This project is prepared for database-backed queues and database-backed cache locally, with a clean path to Redis and Horizon later.

## Queue Strategy

Default queue connection:

```env
QUEUE_CONNECTION=database
QUEUE_AFTER_COMMIT=true
DB_QUEUE_RETRY_AFTER=120
```

Run a queue worker in production:

```bash
php artisan queue:work --queue=default,media --tries=3 --backoff=5 --timeout=90
```

Restart workers after deployments:

```bash
php artisan queue:restart
```

Queued work:

- Setup-password notifications
- Permit/payment/NFC operational notifications
- Media conversions
- Future imports/exports
- Future large reports
- Future election result aggregation

## Failed Jobs

Failed jobs use the database failed job store. Review failures with:

```bash
php artisan queue:failed
```

Retry or forget failed jobs only after confirming the payload does not contain sensitive data.

## Scheduler

Production should run Laravel's scheduler every minute:

```cron
* * * * * php /path/to/app/artisan schedule:run >> /dev/null 2>&1
```

Scheduled tasks currently include:

- `sanctum:prune-expired --hours=24`
- `queue:prune-failed --hours=168`
- `queue:prune-batches --hours=168 --unfinished=336 --cancelled=336`
- `permits:expire`
- `permit-requests:expire`

## Cache Strategy

Default cache store:

```env
CACHE_STORE=database
```

Cached areas:

- Dashboard counts, warnings, reports, and content readiness
- Public homepage content sections
- Public announcement/event/document list and detail payloads
- Public executives list
- Active academic period lookup
- Permit settings
- Content settings

The active academic period cache stores only a scalar ID and re-queries the model to avoid unsafe PHP object cache serialization.

The cache uses short TTLs and versioned keys instead of tags so it works with the database cache store. Relevant model changes flush dashboard caches or bump public content versions.

## Redis Readiness

Redis is not required yet. When traffic grows, switch:

```env
CACHE_STORE=redis
QUEUE_CONNECTION=redis
REDIS_QUEUE_RETRY_AFTER=120
```

Horizon can be added later when queue volume, failed-job visibility, or worker balancing justifies it.

## Media Conversions

Media Library conversion defaults are queue-ready:

```env
MEDIA_QUEUE=media
QUEUE_CONVERSIONS_BY_DEFAULT=true
QUEUE_CONVERSIONS_AFTER_DB_COMMIT=true
```

Run the queue worker with the `media` queue included.

## Logging Boundaries

Do not log:

- Raw NFC UIDs
- Full permit codes
- Passwords
- Plain setup tokens
- Sanctum tokens
- Token hashes

Operational failures should log identifiers like model IDs, references, and `*_last4` fields only.
