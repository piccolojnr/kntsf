# Appendices Master Plan

Project title: **NFC-Based Student Permit Verification and Governance Management System for Knutsford University**

This document defines the appendix structure for the final year project dissertation. It is not a dissertation chapter. It is an assembly guide for supplementary material that supports the main report without overloading the chapters with raw technical detail.

The appendices should provide evidence for the design, implementation, testing, deployment preparation, security controls, API integration, NFC verification, payment verification, screenshots, and selected code excerpts discussed in Chapters Three, Four, and Five.

## 1. Introduction

The dissertation chapters explain the study background, reviewed literature, system analysis, design decisions, implementation process, testing approach, and final conclusions. The appendices support those chapters by storing detailed artifacts that are useful for academic review but too large or too technical for the main body of the report.

The appendices should be organized, selective, and professionally formatted. Their purpose is not to increase page count artificially. They should make the project easier to verify by showing supporting material such as schema summaries, API endpoint references, route lists, selected screenshots, test summaries, deployment configuration extracts, permission matrices, and sample verification evidence.

Every appendix item should have a clear relationship to the dissertation. If an artifact does not support an argument, requirement, workflow, test result, or implementation claim, it should not be included.

## 2. Appendix Numbering Strategy

Appendices should use letter-based numbering:

```txt
Appendix A — Database Schema
Appendix B — API Endpoints
Appendix C — Laravel Route Lists
```

Use one letter for each major appendix. If an appendix becomes long, divide it into subsections using the appendix letter:

```txt
A.1 Core Database Tables
A.2 Relationship Summary
A.3 Schema Export Notes
```

Figures and tables inside appendices should use appendix-based numbering:

```txt
Figure F.1 — Student Management Dashboard
Figure F.2 — Permit Management Screen
Table K.1 — Role and Permission Matrix
Table B.2 — Mobile Permit Request Endpoints
```

Cross-references should be written clearly:

```txt
The full permission matrix is provided in Appendix K.
The selected payment verification samples are provided in Appendix J.
Additional mobile screenshots are provided in Appendix F.
```

Avoid mixing chapter figure numbers with appendix figure numbers. Main chapter figures should remain `Figure 4.1`, `Figure 4.2`, and so on. Appendix visuals should use appendix lettering such as `Figure F.1`.

## 3. Complete Appendices Structure

| Appendix | Title | Content Type | Status | Notes |
| --- | --- | --- | --- | --- |
| Appendix A | Database Schema | Schema exports, entity tables, relationship summaries | Planned | Supports Chapter Three database design and Chapter Four implementation evidence. |
| Appendix B | API Endpoints | Categorized endpoint listings | Planned | Supports mobile API, verification, permit request, content, and election workflows. |
| Appendix C | Laravel Route Lists | Web, API, public, and operations route exports | Planned | Use `php artisan route:list` outputs in summarized form. |
| Appendix D | Mobile API Contract | Request/response structures and authentication flow | Planned | Reference `MOBILE_APP_API_CONTRACT.md` if available. |
| Appendix E | Testing Results | Test summaries, selected outputs, validation evidence | Planned | Avoid full terminal dumps. Use concise summaries and selected screenshots. |
| Appendix F | System Screenshots | Dashboard, mobile, public portal, and operations screenshots | Planned | Complements Chapter Four figures and `SCREENSHOT_CAPTURE_GUIDE.md`. |
| Appendix G | Selected Code Snippets | Short implementation excerpts | Drafted | See `appendices/APPENDIX_G_SELECTED_CODE_SNIPPETS.md`. |
| Appendix H | Deployment Configuration | Docker, queue worker, scheduler, SSL, environment structure | Planned | Use safe excerpts only. Do not expose secrets. |
| Appendix I | NFC Verification Samples | NFC lifecycle, scan result samples, verification logs | Planned | Mask raw NFC UIDs and sensitive student data. |
| Appendix J | Payment Verification Samples | Paystack initialization, callbacks, verification, recovery examples | Planned | Use test-mode records or masked references. |
| Appendix K | Permission Matrix | Roles, permissions, module access, restrictions | Planned | Should align with Spatie Permission configuration. |
| Appendix L | Queue and Scheduler Configuration | Queue jobs, scheduled tasks, cache invalidation, worker notes | Planned | Supports performance and deployment readiness discussion. |

## 4. Detailed Appendix Definitions

### Appendix A — Database Schema

Appendix A should document the database structure that supports the proposed system. The main report should keep only summary-level database discussion, while the appendix can provide more detailed schema evidence.

Recommended contents:

- PostgreSQL schema export summary.
- Core entity table list.
- Important columns for each major table.
- Primary key and foreign key relationships.
- Relationship summary for permits, payments, NFC cards, elections, votes, verification logs, and audit logs.
- Reference to the Entity Relationship Diagram in Chapter Three.
- Notes on relational integrity, normalization, and transactional consistency.

Suggested tables:

| Appendix Table | Title | Purpose |
| --- | --- | --- |
| Table A.1 | Core Database Tables | Summarizes the major tables and their responsibilities. |
| Table A.2 | Permit and Payment Relationships | Shows how permit requests, payments, and permits are related. |
| Table A.3 | Election Data Relationships | Summarizes elections, positions, candidates, and votes. |
| Table A.4 | Verification and Audit Tables | Shows verification logs and audit log responsibilities. |

Suggested placeholders:

```txt
[INSERT TABLE A.1 — Core Database Tables]
[INSERT TABLE A.2 — Permit and Payment Relationships]
[INSERT TABLE A.3 — Election Data Relationships]
[INSERT TABLE A.4 — Verification and Audit Tables]
```

Do not paste a full raw database dump unless required by the supervisor. A summarized schema is usually more readable and academically useful.

### Appendix B — API Endpoints

Appendix B should document the API endpoints used by the mobile application and operational interfaces. The purpose is to show that the system has a structured communication layer and that backend workflows are exposed through organized routes.

Recommended categories:

#### B.1 Authentication Endpoints

Include endpoints for:

- Login.
- Logout.
- Authenticated user profile.
- Token refresh or session restoration if implemented.

#### B.2 Student Endpoints

Include endpoints for:

- Student profile.
- Student permit status.
- Student NFC card status.
- Student announcements, events, and documents.

#### B.3 Permit Request Endpoints

Include endpoints for:

- Permit request creation.
- Permit request listing.
- Payment initialization.
- Payment verification.
- Permit request status.

#### B.4 Election Endpoints

Include endpoints for:

- Election listing.
- Election detail.
- Candidate retrieval.
- Vote submission.
- Result visibility.

#### B.5 Verification Endpoints

Include endpoints for:

- Student number verification.
- Permit code verification.
- NFC verification.
- Verification result response.
- Verification log creation.

#### B.6 Operations Endpoints

Include endpoints for:

- Student lookup.
- Permit issuance.
- NFC card registration.
- NFC card replacement.
- Operations dashboard summaries.

#### B.7 Content Endpoints

Include endpoints for:

- Announcements.
- Events.
- Documents.
- Public portal content.

Suggested tables:

| Appendix Table | Title | Purpose |
| --- | --- | --- |
| Table B.1 | Authentication API Endpoints | Summarizes login, logout, and user profile endpoints. |
| Table B.2 | Permit Request API Endpoints | Summarizes permit request and payment endpoints. |
| Table B.3 | Election API Endpoints | Summarizes election and voting endpoints. |
| Table B.4 | Verification API Endpoints | Summarizes verification endpoints. |
| Table B.5 | Content API Endpoints | Summarizes public and mobile content endpoints. |

Suggested endpoint table format:

| Method | Endpoint | Authentication | Purpose | Notes |
| --- | --- | --- | --- | --- |
| GET | `/api/mobile/...` | Sanctum token | Describe endpoint purpose | Add validation or pagination note. |

### Appendix C — Laravel Route Lists

Appendix C should contain summarized route exports from the Laravel backend. It should not become a full unreadable wall of terminal output.

Recommended sources:

```bash
php artisan route:list
php artisan route:list --path=api
php artisan route:list --path=dashboard
```

Recommended groupings:

- Web routes.
- API routes.
- Public portal routes.
- Dashboard routes.
- Operations routes.
- Authentication routes.
- Payment callback or webhook routes.

Suggested placeholders:

```txt
[INSERT TABLE C.1 — Web Route Summary]
[INSERT TABLE C.2 — Mobile API Route Summary]
[INSERT TABLE C.3 — Public Portal Route Summary]
[INSERT TABLE C.4 — Operations Route Summary]
```

When including route exports, remove irrelevant vendor routes unless they are necessary for understanding authentication or system behavior.

### Appendix D — Mobile API Contract

Appendix D should document the API contract used by the mobile application. If `MOBILE_APP_API_CONTRACT.md` exists in the project documentation, this appendix should reference it and include only the most relevant sections.

Recommended contents:

- Authentication flow.
- Token storage expectations.
- Standard request headers.
- Standard response format.
- Error response format.
- Pagination structure.
- Permit request payload examples.
- Election voting request examples.
- Verification response examples.
- Mobile API migration notes if endpoint names changed during development.

Suggested tables:

| Appendix Table | Title | Purpose |
| --- | --- | --- |
| Table D.1 | Mobile API Authentication Contract | Shows headers and token requirements. |
| Table D.2 | Standard API Response Structure | Shows success and error response formats. |
| Table D.3 | Pagination Format | Shows paginated list response fields. |
| Table D.4 | Mobile Error Codes | Summarizes common validation and authorization errors. |

Suggested placeholders:

```txt
[INSERT TABLE D.1 — Mobile API Authentication Contract]
[INSERT TABLE D.2 — Standard API Response Structure]
[INSERT SAMPLE D.1 — Permit Request Response]
[INSERT SAMPLE D.2 — Election Vote Error Response]
```

Do not expose live Sanctum tokens or internal secrets.

### Appendix E — Testing Results

Appendix E should provide detailed but readable testing evidence. Chapter Four should summarize testing, while Appendix E can provide additional test case tables and selected output screenshots.

Recommended contents:

- Unit test summary.
- Feature test summary.
- API test summary.
- Payment test summary.
- NFC verification test summary.
- Election voting test summary.
- Permission and authorization test summary.
- Mobile integration validation notes.
- Selected test runner output screenshot.

Suggested test categories:

| Category | Evidence to Include |
| --- | --- |
| Feature tests | Permit request, student activation, elections, content publishing. |
| API tests | Authentication, mobile resources, pagination, validation errors. |
| Payment tests | Initialization, verification, duplicate prevention, failed recovery. |
| NFC tests | Card lookup, invalid card, revoked card, valid permit result. |
| Election tests | Eligibility, candidate approval, duplicate vote prevention, results. |
| Security tests | Permission denial, protected routes, sensitive identifier masking. |

Suggested placeholders:

```txt
[INSERT TEST OUTPUT SUMMARY]
[INSERT TABLE E.1 — Feature Test Summary]
[INSERT TABLE E.2 — API Test Summary]
[INSERT TABLE E.3 — Payment Verification Test Cases]
[INSERT TABLE E.4 — NFC Verification Test Cases]
[INSERT TABLE E.5 — Election Voting Test Cases]
[INSERT FIGURE E.1 — Test Runner Output]
```

Avoid pasting long raw terminal logs. A one-page summary with a screenshot of successful execution is stronger and easier to read.

### Appendix F — System Screenshots

Appendix F should contain supporting screenshots that do not fit cleanly into Chapter Four. The main implementation chapter already includes the most important figures, while Appendix F can provide broader visual evidence.

Use the screenshot storage rules in `SCREENSHOT_CAPTURE_GUIDE.md`.

#### F.1 Dashboard Screenshots

Recommended screenshots:

```txt
Figure F.1 — Login Interface
Figure F.2 — Student Management Dashboard
Figure F.3 — Permit Management Dashboard
Figure F.4 — Permit Request Recovery Dashboard
Figure F.5 — Payment Records Dashboard
Figure F.6 — Election Management Dashboard
Figure F.7 — Election Results Dashboard
Figure F.8 — Reports Dashboard
Figure F.9 — Audit Logs Dashboard
Figure F.10 — Announcement Management Screen
Figure F.11 — Events Management Screen
Figure F.12 — Documents Management Screen
Figure F.13 — Role and Permission Management Screen
```

#### F.2 Mobile Application Screenshots

Recommended screenshots:

```txt
Figure F.14 — Mobile Login Screen
Figure F.15 — Student Home Screen
Figure F.16 — Mobile Permit Status Screen
Figure F.17 — Mobile Permit Request Screen
Figure F.18 — Mobile Payment Return Screen
Figure F.19 — Mobile Election List Screen
Figure F.20 — Mobile Voting Screen
Figure F.21 — Mobile NFC Card Status Screen
Figure F.22 — Mobile Announcements Screen
Figure F.23 — Mobile Events Screen
Figure F.24 — Mobile Documents Screen
```

#### F.3 Public Portal Screenshots

Recommended screenshots:

```txt
Figure F.25 — Public Portal Homepage
Figure F.26 — Public Announcements Listing
Figure F.27 — Public Events Listing
Figure F.28 — Public Documents Listing
Figure F.29 — Public Election Information Page
Figure F.30 — Public Permit Request Page
```

#### F.4 Operations Interface Screenshots

Recommended screenshots:

```txt
Figure F.31 — Operations Verification Screen
Figure F.32 — Student Lookup Result
Figure F.33 — Permit Verification Result
Figure F.34 — NFC Verification Result
Figure F.35 — Card Assignment Screen
Figure F.36 — Card Replacement or Revocation Screen
```

Use realistic seeded data. Avoid empty dashboards, placeholder records, and obviously fake values such as `test@example.com` unless the screenshot is explicitly showing test configuration.

### Appendix G — Selected Code Snippets

Appendix G should include selected implementation excerpts only where the code helps prove or clarify an important technical point. It should not include full source files.

Acceptable code snippet topics:

- Sanctum token generation or mobile authentication.
- Permission middleware or role checks.
- Permit verification logic.
- NFC UID hashing or lookup logic.
- Paystack verification and idempotency handling.
- Election voting transaction or duplicate prevention.
- API resource transformation.
- Queue job dispatch or handling.
- Cache invalidation example.

Preferred snippet size:

```txt
10–35 lines per snippet
```

Longer snippets should be shortened or split only if each part has a clear explanation.

Suggested format:

```txt
Code Snippet G.1 — Mobile Token Generation
Code Snippet G.2 — Permit Verification Logic
Code Snippet G.3 — Paystack Verification Handling
Code Snippet G.4 — Election Vote Submission Control
Code Snippet G.5 — NFC UID Hash Lookup
Code Snippet G.6 — Queue Job Dispatch
```

Each snippet must include:

- Caption.
- Source file reference.
- Short explanation.
- Reason the snippet is relevant.

Avoid:

- Full controller files.
- Full model files.
- Repeated CRUD code.
- Configuration files containing secrets.
- Long vendor-generated code.

### Appendix H — Deployment Configuration

Appendix H should document deployment preparation and production readiness without exposing sensitive configuration.

Recommended contents:

- Docker setup summary.
- Docker Compose excerpt if used.
- Environment variable categories.
- Queue worker configuration.
- Scheduler configuration.
- Cache configuration.
- SSL or HTTPS configuration notes.
- Storage linking and media handling notes.
- Database migration workflow.
- Deployment checklist.
- Production hardening notes.

Suggested placeholders:

```txt
[INSERT CONFIG H.1 — Docker Compose Excerpt]
[INSERT CONFIG H.2 — Queue Worker Configuration]
[INSERT CONFIG H.3 — Scheduler Configuration]
[INSERT TABLE H.1 — Environment Variable Categories]
[INSERT TABLE H.2 — Production Deployment Checklist]
```

Never include real `.env` values, API keys, database passwords, Paystack secret keys, Sanctum tokens, or server credentials.

### Appendix I — NFC Verification Samples

Appendix I should provide supporting evidence for NFC-assisted permit verification.

Recommended contents:

- NFC card registration sample.
- Active card verification response.
- Revoked or lost card response.
- Invalid card response.
- NFC replacement workflow evidence.
- Verification log sample.
- Notes on UID masking.

Suggested placeholders:

```txt
[INSERT FIGURE I.1 — NFC Card Registration Sample]
[INSERT FIGURE I.2 — Valid NFC Verification Result]
[INSERT FIGURE I.3 — Revoked NFC Card Verification Result]
[INSERT TABLE I.1 — NFC Card Lifecycle Examples]
[INSERT TABLE I.2 — NFC Verification Response Samples]
```

Security rules:

- Mask raw NFC UIDs.
- Do not show full student personal data.
- Use test records where possible.
- Show only the information needed to prove verification behavior.

### Appendix J — Payment Verification Samples

Appendix J should document selected Paystack payment verification evidence. It should support the payment workflow discussed in Chapters Three and Four.

Recommended contents:

- Payment initialization sample.
- Paystack callback or return state.
- Backend verification response.
- Successful payment-to-permit issuance sample.
- Failed or abandoned payment sample.
- Recovery workflow sample.
- Duplicate verification prevention sample.

Suggested placeholders:

```txt
[INSERT FIGURE J.1 — Paystack Payment Initialization Sample]
[INSERT FIGURE J.2 — Payment Callback Verification Result]
[INSERT FIGURE J.3 — Permit Request Recovery Case]
[INSERT TABLE J.1 — Payment Verification Sample Cases]
[INSERT TABLE J.2 — Payment Recovery Workflow Outcomes]
```

Discuss idempotency clearly. A payment should not issue duplicate permits if the callback, webhook, or verification request is processed more than once. Transaction references should be masked unless they are Paystack test-mode references.

### Appendix K — Permission Matrix

Appendix K should provide a detailed permission matrix for the system. It supports the RBAC discussion in Chapters Two, Three, and Four.

Core roles:

- `super_admin`
- `admin`
- `staff`
- `student`

Recommended permission categories:

- Dashboard access.
- Student management.
- Permit management.
- Permit request management.
- Payment management.
- NFC card management.
- Verification operations.
- Election management.
- Poll management.
- Announcement management.
- Event management.
- Document management.
- Reports.
- Audit logs.
- Role and permission management.
- Public content management.
- Mobile operations.

Suggested table format:

| Module | Permission | super_admin | admin | staff | student | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Students | View students | Yes | Yes | Limited | No | Scope depends on operational role. |
| Permits | Verify permits | Yes | Yes | Yes | No | Student can only view own permit status. |
| Elections | Vote | No | No | No | Yes | Only eligible students can vote. |

Suggested appendix tables:

```txt
Table K.1 — Role and Permission Matrix
Table K.2 — Module Access Summary
Table K.3 — Restricted Administrative Operations
Table K.4 — Student Mobile Access Permissions
```

The final matrix should reflect the implemented permission configuration, not an idealized version.

### Appendix L — Queue and Scheduler Configuration

Appendix L should document background processing and scheduled tasks. This supports the queue, cache, performance, and deployment sections in Chapter Four.

Recommended contents:

- Queue driver summary.
- Queue worker command.
- Worker process manager notes.
- Failed job handling.
- Notification queue examples.
- Media queue examples.
- Cache invalidation strategy.
- Scheduled task summary.
- Permit expiry jobs if implemented.
- Log pruning jobs if implemented.

Suggested placeholders:

```txt
[INSERT TABLE L.1 — Queue Job Summary]
[INSERT TABLE L.2 — Scheduled Task Summary]
[INSERT CONFIG L.1 — Queue Worker Command]
[INSERT CONFIG L.2 — Scheduler Cron Entry]
[INSERT FIGURE L.1 — Queue Worker Output Sample]
```

Do not include sensitive payloads from failed jobs. Failed queue records may contain operational data and should be reviewed before insertion.

## 5. Appendix Formatting Rules

Appendix formatting should remain consistent with the main report.

Heading rules:

- Use `Appendix A — Database Schema` as the main appendix heading.
- Use `A.1`, `A.2`, and `A.3` for subsections.
- Avoid excessive subsection depth.
- Keep headings descriptive and short.

Figure rules:

- Use appendix figure numbering such as `Figure F.3`.
- Place captions below figures.
- Use descriptive captions.
- Refer to each figure before it appears.

Table rules:

- Use appendix table numbering such as `Table K.1`.
- Place table titles above tables if the university format requires it; otherwise keep the same style used in the main report.
- Keep tables readable on portrait pages where possible.
- Use landscape orientation only for wide matrices such as permission tables.

Code formatting rules:

- Use monospace formatting for code.
- Use syntax highlighting where supported.
- Keep snippets short.
- Add explanation before and after each snippet.

Screenshot rules:

- Use clear PNG screenshots.
- Resize consistently.
- Avoid stretching images.
- Crop unnecessary browser chrome only when the context remains clear.
- Keep text readable when printed.

## 6. Screenshot Quality Rules

Screenshots should look like implementation evidence, not rough development captures.

Use:

- High-resolution screenshots.
- Consistent light or dark theme.
- Clean seeded data.
- Realistic student names.
- Realistic SRC election names.
- Realistic announcements, events, and documents.
- Clear status badges and timestamps.
- Cropped interfaces that still preserve context.

Avoid:

- Empty tables.
- Lorem ipsum.
- `test@example.com` as visible report data.
- Raw NFC UIDs.
- Full payment references.
- Personal notifications.
- Browser password managers.
- Broken layout states.
- Debug toolbars unless the screenshot is explicitly for developer evidence.

Recommended demo data:

| Data Type | Example Style |
| --- | --- |
| Student names | Realistic Ghanaian names using test records. |
| Election names | SRC General Election, Departmental Representative Election. |
| Announcements | Permit registration notice, election nomination notice, meeting reminder. |
| Events | SRC orientation, student forum, verification exercise. |
| Permit statuses | Active, pending, expired, revoked. |

## 7. Code Snippet Rules

Code snippets should be used only when they clarify important implementation behavior.

Acceptable snippet size:

```txt
10–35 lines
```

Each snippet must include:

- Caption.
- Source file path.
- Short purpose statement.
- Explanation of why it matters.

Use snippets for:

- Authentication.
- Authorization.
- Verification.
- Payment verification.
- NFC UID handling.
- Election vote control.
- API resource formatting.
- Queue dispatch.
- Cache invalidation.

Do not use snippets for:

- Entire CRUD controllers.
- Long generated files.
- Full migrations unless the table is unusually important.
- Repetitive validation rules.
- Vendor code.
- Secrets or environment values.

## 8. Appendix Assembly Workflow

Recommended assembly order:

1. Finalize all diagrams used in Chapters Two, Three, and Four.
2. Capture all required Chapter Four screenshots.
3. Capture optional appendix screenshots.
4. Export database schema summaries.
5. Export route lists and summarize them.
6. Prepare API endpoint tables.
7. Prepare mobile API contract samples.
8. Run final tests and prepare test summaries.
9. Capture selected test output screenshot.
10. Prepare deployment configuration excerpts.
11. Prepare payment and NFC sample evidence with masked values.
12. Build the permission matrix from the implemented permission configuration.
13. Prepare queue and scheduler configuration notes.
14. Insert appendix figures and tables.
15. Verify appendix figure/table numbering.
16. Generate or update appendix table of contents if required.
17. Cross-check appendix references from Chapters Three, Four, and Five.

## 9. Missing Assets Checklist

| Asset | Status | Notes |
| --- | --- | --- |
| Database schema table summary | Pending | Prepare from PostgreSQL schema or migrations. |
| Full relationship summary | Pending | Must align with Figure 3.4 ERD. |
| API endpoint list | Pending | Categorize mobile, operations, content, elections, and verification endpoints. |
| Route list export | Pending | Use summarized `php artisan route:list` output. |
| Mobile API contract excerpts | Pending | Reference existing mobile API contract documentation if available. |
| Feature test summary | Pending | Summarize successful test cases. |
| API test summary | Pending | Include validation and authentication coverage. |
| Payment test summary | Pending | Include success, failure, duplicate prevention, and recovery. |
| NFC test summary | Pending | Include valid, invalid, revoked, and lost-card cases. |
| Election test summary | Pending | Include eligibility, duplicate voting, and result visibility. |
| Chapter Four screenshots | Pending | Follow `SCREENSHOT_CAPTURE_GUIDE.md`. |
| Appendix screenshot gallery | Pending | Include only supporting screens not already in Chapter Four. |
| Selected code snippets | Drafted | See `appendices/APPENDIX_G_SELECTED_CODE_SNIPPETS.md`; review again before final Word assembly. |
| Deployment configuration excerpts | Pending | Remove secrets. |
| Payment verification samples | Pending | Use Paystack test mode or masked values. |
| NFC verification samples | Pending | Mask raw UIDs. |
| Permission matrix | Pending | Match implemented roles and permissions. |
| Queue worker configuration | Pending | Include worker command and process manager notes. |
| Scheduler configuration | Pending | Include scheduler command or cron notes. |
| Appendix captions | Pending | Use appendix-based numbering. |
| Appendix cross-references | Pending | Check references from main chapters. |

## 10. Estimated Appendix Contribution

The appendices should be substantial enough to support technical credibility, but not padded. A realistic appendix section may contribute between 20 and 50+ pages depending on how many screenshots, tables, route summaries, and test records are included.

| Appendix | Estimated Pages | Notes |
| --- | ---: | --- |
| Appendix A — Database Schema | 3–6 | Depends on schema detail and table summaries. |
| Appendix B — API Endpoints | 3–6 | Endpoint tables may require several pages. |
| Appendix C — Laravel Route Lists | 2–4 | Summarized route lists only. |
| Appendix D — Mobile API Contract | 3–5 | Include request/response samples selectively. |
| Appendix E — Testing Results | 4–8 | Test tables and one or two output figures. |
| Appendix F — System Screenshots | 8–18 | Largest appendix if dashboard, mobile, and public portal screens are included. |
| Appendix G — Selected Code Snippets | 4–8 | Short excerpts with explanation. |
| Appendix H — Deployment Configuration | 2–5 | Safe deployment excerpts and checklist. |
| Appendix I — NFC Verification Samples | 2–4 | Include masked verification evidence. |
| Appendix J — Payment Verification Samples | 2–4 | Include test-mode payment samples. |
| Appendix K — Permission Matrix | 2–5 | May need landscape pages. |
| Appendix L — Queue and Scheduler Configuration | 2–4 | Queue and scheduler notes with concise tables. |

Estimated total:

```txt
39–77 pages, depending on screenshot density and API/detail level.
```

For a final undergraduate dissertation, a focused appendix closer to 30–45 pages may be more practical unless the supervisor requests extensive evidence.

## 11. Final Appendix Readiness Summary

The appendices should provide structured evidence for the dissertation without duplicating the main chapters. Appendix A should support database design, Appendices B to D should support API and route design, Appendix E should support testing, Appendix F should support implementation screenshots, Appendices G to J should support selected technical workflows, Appendix K should support access control, and Appendix L should support queue and scheduler readiness.

Before final Word assembly, confirm that:

- Appendix letters are consistent.
- Appendix figures use appendix-based numbering.
- Tables are readable and properly titled.
- Screenshots are stored and named consistently.
- Sensitive data is masked.
- Route, API, testing, deployment, payment, NFC, and permission evidence is complete.
- Main chapters refer to appendices only where the reference improves clarity.

Once these items are complete, the appendices will be ready to support the final dissertation submission and the references/appendix assembly stage.
