# System Architecture

## Overview

The Knutsford SRC NFC permit verification platform is a Laravel/Inertia system with a dashboard, public portal, and Sanctum-powered mobile API. The same domain actions power web, public, and mobile flows so permit issuance, payments, NFC verification, and audit logging stay consistent.

```txt
Public Portal ─┐
Dashboard UI ──┼── Laravel Controllers / API Controllers
Mobile API  ───┘              │
                              ▼
                    Domain Actions + Policies
                              │
                              ▼
              Eloquent Models / Database / Media Library
                              │
              Queues, Cache, Audit Logs, Notifications
```

## Application Surfaces

| Surface | Stack | Purpose |
| --- | --- | --- |
| Dashboard | Laravel, Inertia v3, React, TypeScript, Tailwind v4 | Admin/staff/executive operations |
| Public portal | Public Inertia pages with separate layout | Published announcements, events, documents, executives, election info, self-service permits |
| Mobile API | Laravel Sanctum token API | Expo app access for students and staff operations |
| Paystack webhook | Public signed endpoint | Server-side payment reconciliation |

## Backend Architecture

Controllers stay thin and delegate business rules to actions under `app/Actions`. Policies and Form Requests enforce authorization and validation. Eloquent models represent core domains:

- students and users
- academic periods
- permits and permit requests
- payments and Paystack references
- NFC cards and verification logs
- announcements, events, documents
- polls and elections
- audit logs

Shared support classes live in `app/Support` for settings, hashing, caching, references, dashboard summaries, recovery detection, and reusable constants.

## Frontend Architecture

Dashboard pages live in `resources/js/pages`, with domain UI in `resources/js/features/*`. Shared dashboard components live under `resources/js/components`, while public pages use `resources/js/layouts/public-layout.tsx` and public feature components.

Navigation is centralized in `resources/js/navigation` and includes permission metadata. Backend authorization remains authoritative.

## Public Portal

The public portal is read-only except for self-service permit requests. Public content is constrained to published/public records:

- announcements
- events
- documents
- executive profiles
- public election information
- self-service permit request and payment pages

Draft, archived, internal, and administrative metadata are not exposed.

## Mobile API

The mobile API uses Sanctum bearer tokens. Mobile students access only their linked student profile and own permit request data. Staff/admin mobile operations reuse dashboard policies and actions.

Important endpoint groups:

- `/api/mobile/auth`
- `/api/mobile/student`
- `/api/mobile/permit-requests`
- `/api/mobile/operations`
- `/api/mobile/verification`

## Authentication and Account Activation

Dashboard authentication uses Fortify and session-based auth. Public registration is disabled. Admins create executives/users, assign roles, and send setup-password links. Student account activation links a `students` record to the unified `users` table and assigns the `student` role.

Setup tokens are hashed, expire, and are invalidated after use.

## Self-Service Permit and Paystack Flow

```txt
Student lookup / mobile student profile
→ PermitRequest created
→ Payment initialized with Paystack
→ Student pays through authorization_url
→ Callback/webhook/mobile verify calls server-side Paystack verification
→ Payment marked successful
→ CompletePermitRequestAction issues permit or marks review required
```

Rules:

- no permit is issued before verified payment
- redirects are never trusted alone
- verification is idempotent
- duplicate active permits are blocked
- self-created students require admin review
- recovery actions reuse the same verification and issuance actions

Admin recovery supports retry verification, retry issuance, cancellation, and expiry marking.

## NFC Verification

NFC card UIDs are normalized and HMAC-hashed. Raw UIDs are never stored. Verification hashes the submitted UID, resolves the active card, checks the linked student and active permit, and writes a privacy-preserving verification log.

Supported verification methods:

- student number
- permit code
- NFC UID

## Payments

Payments track manual/admin payments and Paystack payments. Manual payments can optionally issue permits through `IssuePermitAction`. Paystack payments are tied to `PermitRequest` and reconciled through callbacks, webhooks, mobile verification, and admin recovery.

## Audit Logging

Audit logs track who performed sensitive actions and what changed. Lifecycle activity is normalized for dashboard activity feeds.

Examples:

- student account activated
- permit issued/revoked
- payment successful/failed/cancelled
- NFC card registered/replaced/lost/revoked
- verification performed
- permit request recovery action
- content published/archived/deleted
- poll/election vote cast

## Queues and Cache

Queues are database-backed by default and prepared for Redis/Horizon later. Notifications and media conversions are queued. The scheduler handles pruning and expiry commands.

Cached areas include dashboard summaries, public content, settings, and active academic period lookup. Caches store scalar/array payloads instead of full Eloquent objects.

## Content Modules

The content foundation provides publish statuses, visibility, slug generation, media conventions, and reusable React publishing components.

Implemented modules:

- Announcements
- Events
- Documents
- Polls
- Elections

## Polls and Elections

Polls support dynamic/fixed options and one vote per student unless vote changes are allowed. Elections are stricter: votes are immutable, one vote per position is enforced, candidates have approval lifecycle, and student eligibility depends on account and permit status.

## Security Boundaries

- Public routes expose only public/published data.
- Dashboard routes require auth/verified users.
- Mobile API requires Sanctum tokens.
- Policies/Form Requests enforce permissions.
- Raw NFC UIDs, full permit codes, token hashes, password hashes, and internal metadata are not exposed.
- Paystack secrets remain server-side.

## Deployment Shape

```txt
HTTPS Web Server
  ├─ Laravel app / public index
  ├─ Queue worker
  ├─ Scheduler
  ├─ Database
  ├─ Storage / Media Library
  └─ Optional future Redis + Horizon
```

Production requires HTTPS, queue workers, scheduler, storage symlink, strong app/hash keys, Paystack keys, and database-backed cache/queue or Redis.
