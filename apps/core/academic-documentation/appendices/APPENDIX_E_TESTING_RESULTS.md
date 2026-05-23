# Appendix E — Testing Results

This appendix summarizes automated testing evidence for the implemented system. Chapter Four discusses testing at a high level. Detailed terminal logs are omitted in favour of readable module summaries. A screenshot of test runner output may be inserted later as Figure E.1.

## E.1 Testing Approach

The project uses Pest with Laravel's testing tools. Feature tests cover HTTP routes, policies, validation, database state, Inertia responses, and mobile API JSON contracts. Tests run against an isolated application configuration with seeded roles, permissions, and permit settings where required.

## E.2 Feature Test Summary

Table E.1: Feature Test Summary by Module

| Test file / module area | Focus | Approximate tests |
| --- | --- | --- |
| PermitManagementTest | Permit issuance, revocation, delivery, duplicate prevention | 14 |
| SelfServicePermitRequestTest | Public and self-service permit request workflow | 13 |
| MobilePermitRequestApiTest | Mobile permit request and payment API | 13 |
| PaymentModuleTest | Payment initialization, verification, recovery | 13 |
| PermitRequestAdminTest | Admin review, retry, cancellation | 10 |
| VerificationModuleTest | Student number, permit code, NFC verification | 10 |
| NfcCardsModuleTest | Registration, replacement, revocation, lost card | 10 |
| ElectionModuleTest | Election lifecycle, voting, eligibility, results | 15 |
| MobileElectionApiTest | Mobile election API and vote enforcement | 11 |
| MobileOperationsAggregateApiTest | Staff mobile operations endpoints | 10 |
| MobileContentApiTest | Published content visibility and pagination | 8 |
| MobileApiTest | Authentication and protected mobile access | 7 |
| PublicPortalTest | Public portal routes and published content | 7 |
| SecurityHardeningTest | Sensitive route protection and data exposure | 5 |
| StudentAccountActivationTest | Account activation workflow | 11 |
| StudentManagementTest | Student CRUD and operational rules | 8 |
| PermissionFoundationTest | RBAC seeding and enforcement | 7 |
| AuditLogModuleTest | Audit log creation for sensitive actions | 7 |
| QueueCachePerformanceTest | Queue, cache, and summary behaviour | 6 |
| AnnouncementModuleTest, EventModuleTest, DocumentModuleTest | Content publishing modules | 23 combined |
| PollModuleTest | Poll participation rules | 9 |
| ReportsDashboardSummaryTest | Dashboard summaries and warnings | 4 |
| Auth and settings tests | Login, verification, profile, security settings | 35 combined |

The full suite contains approximately **302** automated tests across Feature and Unit directories.

## E.3 API Test Summary

Table E.2: API Test Summary

| Area | Validated behaviour |
| --- | --- |
| Mobile authentication | Login, logout, token-protected access, unauthenticated rejection |
| Student scoping | Student endpoints return only the authenticated student's records |
| Permit requests | Options, create, initialize payment, verify payment, status transitions |
| Elections | Eligible listing, detail, vote submission, duplicate prevention, results visibility |
| Operations API | Permission-gated staff search, permit issue, NFC management, review actions |
| Content API | Published-only visibility, pagination, and detail access |
| Error handling | 401, 403, 422, and 404 responses for invalid access |

## E.4 Payment Verification Test Cases

Table E.3: Payment Verification Test Cases

| Case | Expected result |
| --- | --- |
| Successful Paystack verification | Permit request moves toward issuance and payment marked verified |
| Failed or abandoned payment | Request remains incomplete; no permit issued |
| Duplicate verification attempt | Idempotent handling avoids duplicate permit issuance |
| Admin retry verification | Authorized recovery action can reconcile stuck requests |
| Mobile initialize + verify flow | Mobile API returns authorization URL and accepts server-side verification |

## E.5 NFC Verification Test Cases

Table E.4: NFC Verification Test Cases

| Case | Expected result |
| --- | --- |
| Valid registered card with active permit | `valid` verification result |
| Unknown or unregistered card | Rejected with explanatory reason |
| Revoked or lost card | Rejected and logged |
| Permit code fallback | Valid permit lookup without NFC |
| Student number fallback | Valid student lookup without NFC |

## E.6 Election Voting Test Cases

Table E.5: Election Voting Test Cases

| Case | Expected result |
| --- | --- |
| Eligible student during active window | Vote recorded once per position |
| Duplicate vote attempt | Rejected |
| Ineligible student | Rejected |
| Unapproved candidate | Cannot receive votes |
| Results visibility rules | Results hidden or exposed according to election configuration |

## E.7 Security and Authorization Tests

| Area | Validated behaviour |
| --- | --- |
| RBAC | Unauthorized users cannot access protected dashboard modules |
| Mobile permissions | Staff-only operations rejected for student tokens |
| Sensitive identifiers | Raw permit codes and NFC UIDs are not exposed in API resources |
| Rate limiting | Sensitive routes are throttled according to configuration |

## E.8 Test Execution Notes

- Run the full suite with `php artisan test` from the project root.
- Example targeted run: `php artisan test tests/Feature/PermitManagementTest.php`.
- [INSERT FIGURE E.1 — Test Runner Output Screenshot] should be added before final submission to show a successful full-suite run in the project environment.
