# Documentation Index

## Architecture and Foundation

| Document | Covers |
| --- | --- |
| `SYSTEM_ARCHITECTURE.md` | Complete system architecture across dashboard, public portal, mobile API, domains, security, and deployment shape |
| `FOUNDATION_SETUP.md` | Packages, folder conventions, roles/permissions, navigation, queue setup |
| `AUTH_FLOW.md` | Fortify login, setup-password, account activation, student auth flow |
| `SECURITY_HARDENING.md` | Route security, rate limits, sensitive data boundaries, upload rules |
| `DEPLOYMENT.md` | Production services, env vars, deployment commands, queue/scheduler/storage |
| `QUEUE_AND_CACHE.md` | Queue worker expectations, scheduler, cache strategy, Redis readiness |

## Core Operations

| Document | Covers |
| --- | --- |
| `STUDENTS_MODULE.md` | Student records, relationships, permissions, activation |
| `PERMITS_MODULE.md` | Permit issuance, code hashing, revocation, card delivery |
| `PAYMENTS_MODULE.md` | Manual payment records and permit linkage |
| `SELF_SERVICE_PERMITS.md` | Public/mobile permit request flow, review, recovery |
| `PAYSTACK_INTEGRATION.md` | Paystack initialization, callback, webhook, mobile verification |
| `NFC_CARDS_MODULE.md` | NFC card lifecycle and UID hashing |
| `VERIFICATION_MODULE.md` | Manual/NFC verification and privacy-preserving logs |
| `AUDIT_LOGS.md` | Central audit logging and activity feed support |
| `REPORTS_MODULE.md` | Dashboard summaries and lightweight reports |

## Administration

| Document | Covers |
| --- | --- |
| `EXECUTIVE_MANAGEMENT.md` | Executives/users management and profiles |
| `ROLE_MANAGEMENT.md` | Roles, permissions, protected roles |
| `ACADEMIC_PERIODS.md` | Academic period CRUD and active period rules |
| `PERMIT_SETTINGS.md` | Permit amount, currency, validity, request toggle |

## Public and Content

| Document | Covers |
| --- | --- |
| `PUBLIC_PORTAL.md` | Public routes, layout, visibility rules |
| `CONTENT_FOUNDATION.md` | Publishing lifecycle, slugs, visibility, media conventions |
| `ANNOUNCEMENTS_MODULE.md` | Announcement management |
| `EVENTS_MODULE.md` | Event management |
| `DOCUMENTS_MODULE.md` | Document uploads and publishing |
| `MEDIA_STRATEGY.md` | Media Library, local-first storage, future cloud |

## Participation Modules

| Document | Covers |
| --- | --- |
| `POLLS_MODULE.md` | Poll creation, options, voting rules |
| `ELECTIONS_MODULE.md` | Election lifecycle, candidates, vote integrity |

## Project Report Support

| Document | Covers |
| --- | --- |
| `FINAL_YEAR_REPORT_NOTES.md` | Academic report outline and project summary |
| `SCREENSHOT_CHECKLIST.md` | Screenshots needed for documentation/demo |
| `DIAGRAM_CHECKLIST.md` | Diagrams needed for architecture/reporting |

## API

| Document | Covers |
| --- | --- |
| `MOBILE_API.md` | Sanctum mobile endpoints, role restrictions, Expo notes |
