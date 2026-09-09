# Appendix H — Deployment Configuration

This appendix summarizes deployment preparation for the student governance platform. No live secrets, credentials, or production `.env` values are included.

## H.1 Deployment Architecture Summary

The production design assumes:

- A web server serving Laravel's `public/` directory
- PHP 8.4 runtime
- PostgreSQL database
- HTTPS termination
- Writable `storage/` and `bootstrap/cache/`
- A continuously running queue worker
- A system scheduler invoking `php artisan schedule:run`
- Built frontend assets from Vite

Chapter Four Figure 4.27 illustrates the deployment architecture. Docker may be used to standardize services, but a conventional VPS deployment is also supported.

## H.2 Environment Variable Categories

Table H.1: Environment Variable Categories

| Category | Examples (names only) | Purpose |
| --- | --- | --- |
| Application core | `APP_NAME`, `APP_ENV`, `APP_DEBUG`, `APP_URL`, `APP_KEY` | Application identity and security |
| Permit and NFC security | `PERMIT_CODE_HASH_KEY`, `NFC_UID_HASH_KEY` | Hashing sensitive identifiers |
| Database | `DB_CONNECTION`, `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | PostgreSQL connection |
| Session and cache | `SESSION_DRIVER`, `CACHE_STORE` | Dashboard session and cache storage |
| Queue | `QUEUE_CONNECTION`, `QUEUE_AFTER_COMMIT`, `DB_QUEUE_RETRY_AFTER` | Background job processing |
| Media | `FILESYSTEM_DISK`, `MEDIA_DISK`, `MEDIA_QUEUE` | Uploaded content storage and conversions |
| Mail | `MAIL_MAILER`, `MAIL_HOST`, `MAIL_FROM_ADDRESS` | Account activation and notifications |
| Paystack | `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`, `PAYSTACK_WEBHOOK_SECRET` | Payment initialization and verification |
| Frontend build | `VITE_APP_NAME` | Vite asset compilation |
| Optional bootstrap | `SUPER_ADMIN_NAME`, `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD` | First-time local bootstrap only |

Production values must be stored outside version control. Never commit `.env` files, secret keys, or webhook secrets to the repository.

## H.3 Baseline Service Configuration

| Service | Baseline setting | Note |
| --- | --- | --- |
| Database | PostgreSQL in production | SQLite may be used locally only |
| Queue driver | `database` | Redis-ready for later scaling |
| Cache store | `database` | Redis-ready for later scaling |
| Session driver | `database` | Supports dashboard authentication |
| Media disk | `public` or configured cloud disk | Requires `php artisan storage:link` when local |
| Queue after commit | `true` | Avoids processing jobs before DB commit |

## H.4 Queue Worker Configuration

Table H.2: Queue Worker Configuration

| Setting | Recommended value | Purpose |
| --- | --- | --- |
| Command | `php artisan queue:work --queue=default,media --tries=3 --timeout=120` | Process notifications and media jobs |
| Process manager | Supervisor or systemd | Keep worker alive after reboot or failure |
| Deployment step | `php artisan queue:restart` | Reload workers after code deployment |
| Failed jobs | `php artisan queue:failed` / retry commands | Operational recovery |
| Retry after | `DB_QUEUE_RETRY_AFTER=120` | Database queue visibility timeout |

Queued notifications include permit, payment, NFC card, setup-password, and operational alerts implemented with `ShouldQueue`.

## H.5 Deployment Checklist

Table H.3: Production Deployment Checklist

| Step | Action |
| --- | --- |
| 1 | Set `APP_ENV=production` and `APP_DEBUG=false` |
| 2 | Configure HTTPS `APP_URL` |
| 3 | Configure PostgreSQL credentials and run `php artisan migrate --force` |
| 4 | Run `composer install --no-dev --optimize-autoloader` |
| 5 | Run `npm ci` and `npm run build` for frontend assets |
| 6 | Run `php artisan storage:link` if using local public disk |
| 7 | Run `php artisan config:cache`, `route:cache`, and `view:cache` |
| 8 | Configure Paystack keys and webhook secret |
| 9 | Start queue worker under Supervisor or systemd |
| 10 | Add cron entry for `php artisan schedule:run` every minute |
| 11 | Verify `/up`, `/health/database`, and `/health/queue` |
| 12 | Confirm webhook endpoint reachability and HTTPS |

## H.6 Production Hardening Notes

- Use strong unique values for `APP_KEY`, hash keys, and Paystack secrets.
- Restrict server access to `.env`, storage logs, and database credentials.
- Keep queue workers and scheduler monitored; silent worker failure stops notifications and expiry jobs.
- Back up the database and uploaded media on a scheduled basis.
- Review failed jobs and audit logs after deployment and before election periods.
- Do not expose health endpoints with sensitive configuration details.

## H.7 Post-Deployment Verification

| Check | Expected outcome |
| --- | --- |
| Dashboard login | Authorized users can authenticate |
| Public portal | Published content loads over HTTPS |
| Paystack callback/webhook | Payment verification updates permit requests |
| Queue worker | Jobs are processed and failed jobs remain visible |
| Scheduler | Expired permits and permit requests are maintained automatically |
| Mobile API | Sanctum login and protected endpoints respond correctly |
