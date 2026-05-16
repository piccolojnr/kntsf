# Deployment

This document captures the baseline production requirements before mobile APIs and public traffic grow.

## Required Services

- PHP 8.4 compatible runtime
- Web server serving `public/`
- Database
- Queue worker
- Scheduler
- Writable storage directories
- HTTPS

## Environment Baseline

Production defaults should include:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.example

LOG_CHANNEL=stack
LOG_STACK=daily
LOG_LEVEL=warning

QUEUE_CONNECTION=database
QUEUE_AFTER_COMMIT=true
CACHE_STORE=database
SESSION_DRIVER=database

FILESYSTEM_DISK=local
MEDIA_DISK=public
```

Set strong secrets:

```env
APP_KEY=
PERMIT_CODE_HASH_KEY=
NFC_UID_HASH_KEY=
```

## Deployment Commands

Typical release sequence:

```bash
composer install --no-dev --optimize-autoloader
pnpm install --frozen-lockfile
pnpm run build
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart
```

## Queue Worker

Run at least one worker:

```bash
php artisan queue:work --queue=default,media --tries=3 --backoff=5 --timeout=90
```

Use Supervisor/systemd/process manager to restart workers automatically.

## Scheduler

Run every minute:

```cron
* * * * * php /path/to/app/artisan schedule:run >> /dev/null 2>&1
```

The scheduler prunes expired Sanctum tokens, prunes old queue records, and expires permits.

## Storage

Create the public storage symlink:

```bash
php artisan storage:link
```

Keep document/media visibility rules aligned with module policies. Public document downloads should only come from published/public documents.

## Sanctum and Mobile API

The Expo app uses bearer tokens:

```http
Authorization: Bearer <token>
Accept: application/json
```

Requirements:

- HTTPS only
- Never log bearer tokens
- Revoke tokens on logout
- Prune expired tokens through the scheduler

## Health Checks

Available checks:

- `GET /up`
- `GET /health/database`
- `GET /health/queue`

The custom health endpoints intentionally return only lightweight status information.

## Logging

Recommended production channel:

```env
LOG_CHANNEL=stack
LOG_STACK=daily
LOG_LEVEL=warning
```

Never log raw NFC UIDs, full permit codes, passwords, setup tokens, Sanctum tokens, or token hashes.

## Future Redis/Horizon

Move to Redis when queue throughput or cache traffic increases:

```env
QUEUE_CONNECTION=redis
CACHE_STORE=redis
```

Add Horizon only when operational visibility and worker balancing are worth the extra service.
