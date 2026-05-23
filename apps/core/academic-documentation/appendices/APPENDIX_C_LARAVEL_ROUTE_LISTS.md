# Appendix C — Laravel Route Lists

This appendix summarizes Laravel route groups registered for the Knutsford University student governance platform. The summary was generated from `php artisan route:list` and grouped for readability. Full route names support Inertia dashboard navigation, public portal access, and Sanctum-protected mobile API access.

## C.1 Public Portal and Self-Service Routes

Table C.1: Public Portal Routes

| Method | URI | Route name |
| --- | --- | --- |
| GET | `/` | home |
| GET | `announcements` | public.announcements.index |
| GET | `announcements/{slug}` | public.announcements.show |
| GET | `events/public` | public.events.index |
| GET | `events/public/{slug}` | public.events.show |
| GET | `documents/public` | public.documents.index |
| GET | `documents/public/{slug}` | public.documents.show |
| GET | `executives/public` | public.executives.index |
| GET | `elections/public` | public.elections.index |
| GET | `elections/public/{slug}` | public.elections.show |
| GET | `permit-request` | public.permit-request.index |
| POST | `permit-request` | public.permit-request.store |
| GET | `permit-request/preview` | public.permit-request.preview |
| GET | `permit-request/payment/callback` | public.permit-request.callback |
| GET | `permit-request/success/{reference}` | public.permit-request.success |
| GET | `permit-request/{reference}` | public.permit-request.show |

## C.2 Operations Dashboard Route Modules

Table C.2: Dashboard Route Modules

| Module | Route prefix / resource | Main actions |
| --- | --- | --- |
| Dashboard | `dashboard` | Operational summary and warnings |
| Students | `students` | List, create, update, delete, activate account |
| Academic periods | `academic-periods` | Manage academic period records |
| Permits | `permits` | List, issue, show, revoke, mark card delivered |
| Permit requests | `permit-requests` | Review, approve/reject review, retry verification/issuance |
| Permit settings | `permit-settings` | Configure permit request and pricing rules |
| Payments | `payments` | View and manage payment records |
| NFC cards | `nfc-cards` | Register, replace, revoke, and inspect cards |
| Verification | `verification` | Perform verification and inspect logs |
| Announcements | `dashboard/announcements` | Create, edit, publish, and delete announcements |
| Events | `events` | Create, edit, publish, and delete events |
| Documents | `documents` | Create, edit, publish, and delete documents |
| Executives | `executives` | Manage executive profiles |
| Polls | `polls` | Create, publish, vote, and view poll results |
| Elections | `elections` | Manage elections, positions, candidates, and results |
| Roles | `roles` | View and manage role permissions |
| Audit logs | `audit-logs` | Review sensitive action history |
| Reports | `reports` | Access operational summaries |
| Settings | `settings/*` | Profile, password, appearance, and two-factor settings |

Dashboard routes are protected by `auth`, `verified`, and `dashboard_access` middleware. Sensitive POST actions also use `throttle:sensitive-actions` or permission middleware.

## C.3 Mobile API Routes

Table C.3: Mobile API Route List

| Method | URI | Route name |
| --- | --- | --- |
| POST | `api/mobile/auth/login` | mobile.auth.login |
| POST | `api/mobile/auth/logout` | mobile.auth.logout |
| GET | `api/mobile/me` | mobile.me |
| GET | `api/mobile/student/profile` | mobile.student.profile |
| GET | `api/mobile/student/permits` | mobile.student.permits |
| GET | `api/mobile/student/nfc-card` | mobile.student.nfc-card |
| POST | `api/mobile/student/nfc-card/report-lost` | mobile.student.nfc-card.report-lost |
| GET | `api/mobile/permit-requests/options` | mobile.permit-requests.options |
| GET | `api/mobile/permit-requests` | mobile.permit-requests.index |
| POST | `api/mobile/permit-requests` | mobile.permit-requests.store |
| GET | `api/mobile/permit-requests/{reference}` | mobile.permit-requests.show |
| POST | `api/mobile/permit-requests/{reference}/initialize-payment` | mobile.permit-requests.initialize-payment |
| POST | `api/mobile/permit-requests/{reference}/verify-payment` | mobile.permit-requests.verify-payment |
| GET | `api/mobile/elections` | mobile.elections.index |
| GET | `api/mobile/elections/{election}` | mobile.elections.show |
| POST | `api/mobile/elections/{election}/positions/{position}/vote` | mobile.elections.vote |
| GET | `api/mobile/elections/{election}/results` | mobile.elections.results |
| GET | `api/mobile/content/home` | mobile.content.home |
| GET | `api/mobile/content/announcements` | mobile.content.announcements.index |
| GET | `api/mobile/content/announcements/{slug}` | mobile.content.announcements.show |
| GET | `api/mobile/content/events` | mobile.content.events.index |
| GET | `api/mobile/content/events/{slug}` | mobile.content.events.show |
| GET | `api/mobile/content/documents` | mobile.content.documents.index |
| GET | `api/mobile/content/documents/{slug}` | mobile.content.documents.show |
| GET | `api/mobile/content/executives` | mobile.content.executives.index |
| POST | `api/mobile/verification/student-number` | mobile.verification.student-number |
| POST | `api/mobile/verification/permit-code` | mobile.verification.permit-code |
| POST | `api/mobile/verification/nfc` | mobile.verification.nfc |
| GET | `api/mobile/operations/summary` | mobile.operations.summary |
| GET | `api/mobile/operations/students/search` | mobile.operations.students.search |
| GET | `api/mobile/operations/students/{student}` | mobile.operations.students.show |
| GET | `api/mobile/operations/permits` | mobile.operations.permits.index |
| GET | `api/mobile/operations/permits/options` | mobile.operations.permits.options |
| POST | `api/mobile/operations/permits/issue` | mobile.operations.permits.issue |
| GET | `api/mobile/operations/nfc-cards` | mobile.operations.nfc-cards.index |
| POST | `api/mobile/operations/nfc-cards/register` | mobile.operations.nfc-cards.register |
| POST | `api/mobile/operations/nfc-cards/{nfcCard}/replace` | mobile.operations.nfc-cards.replace |
| POST | `api/mobile/operations/nfc-cards/{nfcCard}/revoke` | mobile.operations.nfc-cards.revoke |
| GET | `api/mobile/operations/verification-logs` | mobile.operations.verification-logs.index |
| GET | `api/mobile/operations/permit-requests` | mobile.operations.permit-requests.index |
| GET | `api/mobile/operations/permit-requests/{reference}` | mobile.operations.permit-requests.show |
| POST | `api/mobile/operations/permit-requests/{reference}/approve-review` | mobile.operations.permit-requests.approve-review |
| POST | `api/mobile/operations/permit-requests/{reference}/reject-review` | mobile.operations.permit-requests.reject-review |

Endpoint purposes and request/response rules are documented in Appendix B and in `docs/MOBILE_APP_API_CONTRACT.md`.

## C.4 Health and Account Setup Routes

Table C.4: Health and Account Routes

| Method | URI | Route name |
| --- | --- | --- |
| GET | `health/database` | health.database |
| GET | `health/queue` | health.queue |
| GET | `account/setup-password/{token}` | account.setup-password.show |
| POST | `account/setup-password/{token}` | account.setup-password.store |
| GET | `account/mobile-app` | account.mobile-app |

## C.5 Notes

- Fortify authentication routes (login, logout, password reset, email verification) are registered by the authentication package and are omitted from the module summary tables above.
- Webhook and callback routes related to Paystack are protected with throttling and server-side verification rules described in Chapter Four.
- Route lists should be regenerated before final submission if new modules are added to the codebase.
