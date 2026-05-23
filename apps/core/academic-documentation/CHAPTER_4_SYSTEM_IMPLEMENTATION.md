# CHAPTER FOUR — SYSTEM IMPLEMENTATION

## 4.1 Introduction

Chapter Three presented the analysis and design of the NFC-based student permit verification and governance management system for Knutsford University. It explained the existing manual processes, defined the system requirements, and described the proposed architecture, database structure, workflows, security model, user interfaces, and validation strategy. This chapter moves from design to implementation. It explains how the proposed system was developed, how the modules interact, how security rules were enforced, how payment and NFC workflows were implemented, how mobile integration was structured, and how the system was tested and prepared for deployment.

The implementation follows the integrated platform design described in Chapter Three. The system was not implemented as separate disconnected applications. Instead, the dashboard, public portal, and mobile API share the same Laravel backend, domain actions, authorization rules, models, and database records. This approach was important because permit issuance, payment verification, NFC verification, election voting, audit logging, and reports depend on consistent records. If each interface handled these workflows independently, the system would recreate the fragmentation identified in Chapter One.

The implementation uses Laravel 13 and PHP for the backend, PostgreSQL for relational data storage, React and Inertia.js for the dashboard and public portal, Expo React Native for the mobile application, Sanctum for mobile API authentication, Spatie Permission for role-based access control, Spatie Media Library for uploaded content, Paystack for online permit payments, and queue/cache services for background work and repeated summaries. These tools were selected because they match the project's need for a structured backend, interactive interfaces, mobile access, secure authentication, controlled authorization, and reliable data persistence.

This chapter is implementation-focused, but it avoids large code dumps. Where code is included, the snippet is short and used only to clarify an important implementation decision. Most implementation evidence is explained through module descriptions, workflow explanations, screenshot placeholders, test summaries, and deployment discussion. Detailed source files, full route lists, database schema extracts, and extended screenshots should be placed in the appendices.

## 4.2 Development Environment and Technologies Used

The development environment was selected to support a multi-platform student governance system. The system required a backend capable of handling secure business workflows, a dashboard suitable for administrative operations, a public portal for official content, a mobile application for student and staff workflows, and deployment support for queues, caching, storage, and payment verification.

Table 4.1 summarizes the major development technologies and their implementation roles. The table is included because the project uses several technologies, but each one supports a specific part of the implemented system.

Table 4.1: Development Technologies and Implementation Roles

| Technology | Implementation Role | Reason for Use |
| --- | --- | --- |
| Laravel 13 | Backend framework, dashboard routing, public portal routes, mobile API, queues, policies, validation | Provides a structured backend for multi-module institutional workflows. |
| PHP | Server-side language | Supports Laravel application logic and backend actions. |
| PostgreSQL | Relational data storage | Maintains linked records for students, permits, payments, NFC cards, elections, and audit logs. |
| React | Dashboard and public interface components | Supports reusable UI components and interactive screens. |
| Inertia.js | Laravel-to-React page bridge | Keeps dashboard routing and authorization close to Laravel while using React for UI. |
| TypeScript | Typed frontend and mobile development | Reduces data-shape mistakes in module screens and API clients. |
| Tailwind CSS | Interface styling | Provides consistent dashboard and public portal styling. |
| shadcn-style components | UI primitives | Supports consistent dialogs, tables, forms, badges, and buttons. |
| Expo React Native | Mobile application | Supports student and staff mobile workflows. |
| TanStack Query | Mobile data fetching and cache handling | Manages API requests, loading states, errors, and invalidation. |
| Laravel Sanctum | Mobile API authentication | Provides token-based authentication for mobile requests. |
| Spatie Permission | Role and permission management | Supports RBAC across dashboard and operations modules. |
| Spatie Media Library | File and media handling | Supports announcement, event, document, and candidate media. |
| Paystack | Payment gateway | Handles permit request checkout and server-side payment verification. |
| Database queue/cache | Background jobs and cached summaries | Keeps initial deployment simple while supporting asynchronous work. |

### 4.2.1 Backend technologies

Laravel 13 was used as the main backend framework. Laravel was suitable because the system needed routing, controllers, middleware, validation, policies, database models, queues, notifications, API resources, and test support. The project uses Laravel as the central coordination layer for the operations dashboard, public portal, mobile API, Paystack webhook endpoint, and background jobs.

PHP was used as the server-side programming language through the Laravel framework. The decision to use PHP with Laravel was practical because Laravel provides a mature structure for web applications and API-driven systems. It also supports a clean separation of routes, form requests, policies, actions, models, and resources, which helped keep the platform maintainable as the number of modules increased.

PostgreSQL was used as the relational database. This was appropriate because the system stores connected records: users, students, academic periods, permits, permit requests, payments, NFC cards, verification logs, audit logs, announcements, events, documents, polls, elections, candidates, and votes. Relational storage made it possible to enforce relationships, support transactions, query reports, and preserve data integrity.

Laravel Sanctum was used for mobile API authentication. Dashboard users use session-based authentication, while mobile users authenticate with bearer tokens. This separation allowed the mobile application to access protected API endpoints without depending on browser sessions. Sanctum also stores token hashes instead of plaintext tokens, which supports safer token handling.

Spatie Permission was used for role and permission management. The system needed separate permissions for students, staff, executives, administrators, and super administrators. Spatie Permission provided a practical way to define roles, assign permissions, and enforce access across modules such as students, permits, payments, NFC cards, verification, audit logs, content, reports, polls, and elections.

Spatie Media Library was used for uploaded media and files. Announcements, events, documents, and election candidates may require images or files. Media Library provided a structured way to attach files to models, define collections, and prepare for queued conversions in later stages.

Queue and cache systems were configured using database-backed drivers by default. This kept the initial deployment manageable while still supporting background work and cached summaries. Queue workers are used for notifications, media-related jobs, and future long-running tasks. Cache is used for dashboard summaries, public content, settings, and active academic period lookups.

The backend implementation followed an action-oriented style for sensitive workflows. Controllers receive requests and return responses, but actions handle business rules such as permit issuance, payment verification, permit request completion, NFC card registration, and election vote casting. This implementation choice reduced duplication because the same action can be reused by dashboard, public, mobile, callback, webhook, and recovery flows.

### 4.2.2 Frontend technologies

React was used to build interactive dashboard and public portal interfaces. The dashboard contains many repeated interface patterns such as lists, filters, forms, dialogs, status badges, confirmation prompts, and detail views. React's component model allowed these interface elements to be reused across modules.

Inertia.js was used to connect Laravel routes with React pages. This avoided the need to build a completely separate dashboard API for every dashboard screen. Laravel remains responsible for routing, authorization, validation, and data preparation, while React handles the interactive interface. This approach was suitable for the operations dashboard because dashboard pages are tightly connected to backend permissions and server-side data.

TypeScript was used to improve frontend reliability. The system passes structured data from Laravel to React pages and mobile resources. TypeScript helps document expected shapes and reduces mistakes when accessing fields in components. This is helpful in modules such as students, permits, payments, elections, and content, where status fields and nested records are common.

Tailwind CSS was used for interface styling. It allowed dashboard and public components to follow a consistent visual system without writing large custom CSS files. The project also uses shadcn-style UI components for dialogs, buttons, inputs, badges, tables, and other repeated interface elements. These components supported consistency across modules while keeping the interface practical and work-focused.

The frontend implementation prioritized operational clarity. Dashboard users need to scan records and take controlled actions. For that reason, the interface uses status badges, filters, clear action buttons, confirmation dialogs, and detail pages rather than decorative screens. Public portal pages use a different layout because their purpose is communication rather than internal administration.

The dashboard implementation also followed role-aware navigation. A navigation item may appear only where it is relevant to the user's permissions, but this is treated as interface guidance rather than security. Backend policies still enforce the final access decision. This avoided the common implementation mistake where hiding a menu item becomes the only access control.

### 4.2.3 Mobile technologies

Expo React Native was used for the mobile application. The mobile application is intended to support student access to permits, permit requests, content, elections, NFC card information, and selected staff operations. Expo React Native was suitable because it supports cross-platform mobile development and allows rapid iteration during development.

Expo Router was used to structure mobile screens and navigation. This helped organize student screens, authentication screens, and operations screens into role-aware groups. A structured routing approach matters because students and staff should not experience the mobile application as a loose collection of unrelated screens.

TanStack Query was used for mobile API data fetching and cache management. Mobile workflows depend on repeated API calls, such as loading permit request options, refreshing payment status, retrieving election detail, and invalidating data after a vote or permit action. TanStack Query supports query keys, refetching, cache invalidation, and loading/error states, which are important for mobile reliability.

The mobile application integrates with the Laravel backend through the mobile API. All authenticated requests send a Sanctum bearer token. Student endpoints return only the authenticated student's linked profile data. Staff operation endpoints require backend permissions. The mobile application therefore acts as a client to backend rules rather than as an independent authority.

Expo NFC capabilities were considered for mobile-assisted verification. NFC support depends on device hardware and platform behavior, so the system does not rely only on NFC. It also supports student number and permit code verification. This design keeps verification usable even where an NFC-capable device is unavailable.

The mobile implementation was also designed around recovery from uncertain network states. Payment verification, election detail refresh, and permit request status updates can depend on backend state changes that occur after a mobile action. TanStack Query helped manage these states by allowing the application to invalidate and refetch affected queries after sensitive actions.

### 4.2.4 Infrastructure and deployment tools

The deployment design assumes a web server serving Laravel's `public` directory, PHP 8.4 runtime support, PostgreSQL, writable storage, HTTPS, queue worker, scheduler, and environment configuration. Docker can be used to standardize local or production services where required, but the deployment requirements remain compatible with a conventional VPS setup.

Queue workers are required for background processing. The deployment plan includes a worker for the default and media queues. A process manager such as Supervisor or systemd should keep the worker running. Queue workers are restarted during deployment so that new code is loaded safely.

Caching is configured through the database cache store in the baseline setup. This avoids requiring Redis at the first stage. The system remains Redis-ready so that queue and cache services can move to Redis later if traffic grows.

SSL configuration is required for production. HTTPS protects dashboard sessions, mobile bearer tokens, Paystack callbacks, webhooks, and public portal traffic. Environment variables are used for secrets such as `APP_KEY`, `PERMIT_CODE_HASH_KEY`, `NFC_UID_HASH_KEY`, `PAYSTACK_SECRET_KEY`, and `PAYSTACK_WEBHOOK_SECRET`.

Environment management was treated as part of implementation because the system depends on several secrets and service settings. Payment verification cannot work without Paystack keys. Permit code and NFC UID hashing require stable hash keys. Mobile authentication requires Sanctum configuration. Queue and cache behavior depends on environment drivers. These values are not hardcoded in source files because they differ between development and production.

## 4.3 Backend System Implementation

The backend implementation is the core of the platform. It contains the business rules that protect permit issuance, payment verification, NFC verification, election voting, audit logging, public/private separation, and mobile API access. The backend was implemented so that dashboard, public, and mobile workflows reuse the same domain logic where possible.

Table 4.2 gives an overview of the backend modules and the implementation concern each module addresses.

Table 4.2: Backend Module Implementation Overview

| Backend Module | Main Implementation Concern | Connected Modules |
| --- | --- | --- |
| Authentication | Login, account setup, mobile token issue, logout | Students, roles, mobile API |
| Role management | Roles, grouped permissions, protected roles | All protected dashboard and mobile operations |
| Students | Student identity records, account activation, search | Permits, NFC cards, elections, mobile profile |
| Permits | Permit issuance, revocation, delivery, hashed codes | Payments, verification, reports |
| Permit requests | Self-service request lifecycle, review states, recovery | Students, payments, permits, public portal, mobile API |
| Payments | Manual and Paystack payment records and status changes | Permit requests, reports, audit logs |
| NFC cards | Card registration, replacement, revocation, hashed UIDs | Students, verification, mobile operations |
| Verification | Student number, permit code, NFC UID verification | Permits, NFC cards, verification logs |
| Elections | Election lifecycle, candidates, immutable votes | Students, permits, mobile API, audit logs |
| Polls | Lightweight voting and result visibility | Students, content/activity |
| Content | Announcements, events, documents, media, publishing | Public portal, mobile content |
| Audit logs | Operational evidence and activity timelines | All sensitive modules |
| Reports | Counts, warnings, operational summaries | Students, permits, payments, NFC cards, verification |

### 4.3.1 Authentication and authorization

Authentication was implemented with separate flows for dashboard users and mobile users. Dashboard authentication uses Laravel Fortify and session-based login. Mobile authentication uses Sanctum bearer tokens. Public registration is disabled so that accounts are created through controlled administrative workflows rather than open self-registration.

Figure 4.1 should show the login interface used by dashboard users.

[INSERT FIGURE — Login Interface]

Figure 4.1: Login Interface

Student account activation was implemented through the unified `users` table. Student records are stored separately in the `students` table and may link to a user account through `students.user_id`. When an authorized user activates a student account, the system creates or safely links a user record, assigns the `student` role, creates a setup-password token, and sends a setup-password notification. The student's password remains null until the setup process is completed.

The use of a unified `users` table simplified authentication because administrators, staff, executives, and students all authenticate through one account model. The student record remains separate because student identity and login identity are not the same. This distinction was important for cases where a student record exists before mobile or dashboard account activation.

Setup-password tokens are stored as hashes. The raw token is used only in the setup link sent to the student. Old unused setup tokens are invalidated when a new activation link is issued. This prevents multiple active setup links from remaining valid.

Role management was implemented through Spatie Permission. Protected roles such as `super_admin`, `admin`, `staff`, and `student` cannot be deleted. Permissions are grouped through the application permission configuration and displayed in a permission matrix. This made it easier to assign module-specific access without hardcoding every decision in the user interface.

Listing 4.1 shows the mobile token response shape used after successful mobile login. The snippet is not a full controller implementation; it illustrates the implementation decision to return the token once and include safe user role information.

Listing 4.1: Mobile Login Token Response

```json
{
  "token": "plain-sanctum-token-returned-once",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "Student User",
    "email": "student@example.com",
    "roles": ["student"],
    "permissions": []
  }
}
```

The token is returned only at login time. Later API requests use the bearer token in the `Authorization` header. The backend checks the token, identifies the user, and applies policies and permissions before returning protected data.

Authorization was enforced through middleware, policies, and form request authorization. Dashboard navigation and button visibility improve usability, but they are not treated as security controls. The backend remains authoritative. This was important because a user could attempt to call a protected route directly even if the frontend hides a button.

The authentication implementation also protects incomplete accounts. A student whose user account has been created but whose password is still null cannot log in. This prevents a pending account from becoming usable before the student completes the setup-password flow. Inactive users are also rejected. This matters because student mobile access depends on a confirmed account, not merely the existence of a student record.

For mobile authentication, the implementation returns the token only once. The token must be stored by the mobile application in secure storage. Logout revokes the current token. If a mobile request returns unauthenticated, the mobile application clears its local token and returns the user to the login screen. This behavior prevents stale tokens from remaining in use after backend rejection.

### 4.3.2 Student management module

The student management module was implemented as the foundation for permit, NFC, mobile, and election workflows. Student records contain institutional identity details such as student number, name, email, phone, course, level, account link, and metadata. The module supports listing, searching, creating, updating, showing, soft deleting, and account activation.

Figure 4.2 should show the student management dashboard with search, table records, status indicators, and action controls.

[INSERT FIGURE — Student Management Dashboard]

Figure 4.2: Student Management Dashboard

Create, edit, delete, and account activation workflows use dialog-based interfaces. This design keeps the user on the student index or detail page while completing common administrative actions. It also reduces unnecessary navigation for repeated student management tasks.

The student module uses policy and form request authorization. Permissions include viewing, creating, updating, deleting, importing, and activating student accounts. The import permission is reserved for future bulk student import workflows, while account activation is already used to link student records to user accounts.

Student account states are exposed to the interface as `not_activated`, `pending_setup`, and `activated`. These states help administrators understand whether the student has no linked user account, has a linked user without a password, or has completed setup. The distinction is useful for mobile readiness because a student cannot use authenticated mobile endpoints until account setup is complete.

Figure 4.3 should show the student account activation workflow from dashboard action to setup-password completion.

[INSERT FIGURE — Student Account Activation Workflow]

Figure 4.3: Student Account Activation Workflow

Configurable student options such as courses and levels are defined centrally. This prevents inconsistent free-text values from spreading through the system. Since student course and level values are used in search, filters, reports, and display contexts, controlled options improve data quality.

The student module was implemented early because most other modules depend on it. Permits require a student. NFC cards require a student. Mobile student endpoints require a linked student profile. Election eligibility depends on student status and permit status. This made student management the natural foundation for the rest of the system.

Table 4.3 summarizes the account activation states exposed by the student module.

Table 4.3: Student Account Activation States

| State | Meaning | Operational Use |
| --- | --- | --- |
| `not_activated` | The student record has no linked user account. | Admin or staff may start activation if the student has an email address. |
| `pending_setup` | A user account exists but the password has not been set. | The student must complete the setup-password link before login. |
| `activated` | A linked user exists and has a password. | The student can authenticate and use mobile student workflows. |

This state model helped the dashboard show account readiness without forcing administrators to inspect raw database fields. It also supported reporting for students whose accounts had not yet been activated.

### 4.3.3 Permit management module

The permit management module implements permit issuance, revocation, validity tracking, card delivery marking, and verification support. A permit is linked to a student and academic period. It includes status, validity dates, issuing user, payment-related values, and a protected permit code reference.

Figure 4.4 should show the permit management screen with permit records, status badges, filters, and available actions.

[INSERT FIGURE — Permit Management Screen]

Figure 4.4: Permit Management Screen

Permit issuance is handled through a backend action rather than directly inside the controller. This was done because permit issuance can be triggered from different workflows, including dashboard issuance, manual payment completion, self-service permit completion, mobile staff operations, and recovery actions. Keeping the rule in one action prevents duplication.

The issuance workflow runs inside a database transaction. It checks the academic period, prevents duplicate active permits for the same student and academic period, generates a public permit code, stores only a hash and last-four value, applies permit settings for amount, currency, and validity period, and records the issuing user. The generated permit code is returned only once where appropriate.

Listing 4.2 summarizes the permit issuance logic in pseudocode form. It is included to show the implementation order, not to replace the full source code.

Listing 4.2: Permit Issuance Logic Summary

```txt
begin transaction
  resolve active or selected academic period
  reject duplicate active permit for student and period
  generate permit code
  store code_hash and code_last4
  create permit with status, dates, amount, and issuer
commit transaction
return generated code once
```

This implementation protects both integrity and privacy. Duplicate prevention protects the permit lifecycle. Hashing protects full permit codes. Returning the generated code only once reduces the risk of later exposure.

Permit revocation is handled through a separate action. A revoked permit cannot be revoked again. The system records the revoking user, revocation time, and reason where supplied. This is important because revocation affects the student's permit validity and should be traceable.

Permit card delivery is tracked through a delivery action that records the delivery timestamp. This separates physical card delivery from permit issuance. A permit may be issued before the physical card is delivered, and delivery status may be useful in operations.

Figure 4.5 should show the permit verification workflow connecting permit code/student number/NFC verification to the permit record.

[INSERT FIGURE — Permit Verification Workflow]

Figure 4.5: Permit Verification Workflow

The permit module was implemented to integrate with verification and payment workflows. A permit can be verified through permit code, student number, or NFC card relationship. The permit code is never stored in plaintext. During permit code verification, the submitted code is hashed and compared with stored hashes.

The module also supports expiry-related behavior. A permit has a validity window defined by `starts_at` and `expires_at`. Verification logic evaluates these dates and can mark an active but expired permit as expired. This avoids a situation where an outdated permit remains active simply because no user manually changed its status.

Permit settings provide default amount, currency, validity days, student number prefix, and request settings. These values are used during permit issuance and self-service request handling so that amounts and dates do not have to be entered manually for every permit. Central settings reduce mistakes and make the system easier to adjust for a new academic period.

Table 4.4 summarizes the permit lifecycle states implemented in the system.

Table 4.4: Permit Lifecycle States

| Permit State | Meaning | Implementation Behavior |
| --- | --- | --- |
| Active | Permit is currently valid if within its validity period. | Can verify as valid when linked checks pass. |
| Expired | Permit validity period has passed. | Verification should not return valid; active expired permits may be marked expired. |
| Revoked | Permit was cancelled by an authorized user. | Cannot verify as valid and stores revocation metadata. |

The permit lifecycle was intentionally kept small. More states can be added later if operational policy requires them, but the first implementation focuses on the statuses needed for verification and reporting.

### 4.3.4 Self-service permit request and payment system

The self-service permit request and payment system is one of the strongest parts of the implementation because it connects public access, mobile access, payment verification, permit issuance, review workflows, and recovery handling. The implementation was designed to avoid the common weakness of issuing permits based on screenshots or browser redirects.

Figure 4.6 should show the public or mobile permit request screen.

[INSERT FIGURE — Permit Request Screen]

Figure 4.6: Permit Request Screen

In the public portal, the workflow begins with student lookup. Existing students are found by student number. The public page displays a masked preview rather than full internal details. If the student exists and missing contact fields need completion, the student may supply those details within allowed rules. If the student number is not found, the system creates a provisional student record with `source = self_service` and a pending review status.

The mobile flow is stricter. A student can use the mobile permit request workflow only when authenticated and linked to a student profile. Unknown students are not created through the mobile API. This decision was made because provisional student creation needs administrative review and is safer in the public self-service flow.

Before payment, the system checks whether the student already has an active permit or a pending request. This prevents duplicate requests and reduces payment disputes. If checkout is allowed, the system creates a permit request and a local pending payment record, then initializes Paystack checkout.

Figure 4.7 should show the Paystack payment flow from permit request to verified payment and permit issuance.

[INSERT FIGURE — Paystack Payment Flow]

Figure 4.7: Paystack Payment Flow

The Paystack integration uses server-side verification. When the student returns from Paystack, the callback uses the reference to verify the transaction directly with Paystack. The webhook endpoint also verifies the Paystack signature and processes supported events. Mobile payment verification uses the same backend verification approach after the student returns to the mobile application.

Listing 4.3 summarizes the payment verification principle used by the implementation.

Listing 4.3: Server-Side Payment Verification Rule

```txt
receive callback, webhook, mobile verify, or admin retry
load local payment by reference
verify transaction directly with Paystack
if verified successfully:
  mark payment successful
  complete permit request
else:
  preserve failed or pending state for recovery
```

The important point is that the system does not trust the redirect alone. This implementation decision protects the permit issuance workflow from false success states. It also gives the system a consistent path for public callbacks, webhooks, mobile verification, and admin retry.

Idempotent handling was implemented because callbacks and webhooks can repeat or arrive late. The system locks relevant payment and permit request records during verification and completion. If a payment has already been processed, another successful callback should not issue another permit. Duplicate active permits are also blocked by the permit issuance action.

When a self-created student requires review, successful payment does not immediately issue a permit. Instead, the request remains paid and requires admin approval. An authorized dashboard user may approve the review, which verifies the student record and completes permit issuance, or reject the request, which records the review outcome and prevents permit issuance.

Figure 4.8 should show the permit request recovery dashboard with recovery states and retry actions.

[INSERT FIGURE — Permit Request Recovery Dashboard]

Figure 4.8: Permit Request Recovery Dashboard

Recovery workflows were implemented because real payment systems do not always complete in a single clean path. A student may close the browser after payment. A webhook may arrive late. A callback may fail because of network issues. A permit request may be paid but not issued because review is required or an issuance step failed. The dashboard allows authorized users to retry verification, retry issuance, approve review, reject review, cancel a request, or mark unpaid old requests as expired.

This module shows the benefit of shared backend actions. Public, mobile, webhook, callback, and admin recovery flows all depend on the same payment verification and permit completion rules. That reduces the chance that one channel behaves differently from another.

Table 4.5 summarizes important permit request states and their operational meaning.

Table 4.5: Permit Request Status and Recovery Meaning

| Request State | Meaning | Typical Action |
| --- | --- | --- |
| Awaiting payment | Request exists but payment has not been verified. | Student completes payment or request later expires. |
| Paid | Payment succeeded but permit may still need review or issuance. | Complete issuance or approve review if required. |
| Issued | Permit has been issued from the request. | No further payment action required. |
| Requires review | Provisional student or request data needs admin review. | Authorized user approves or rejects review. |
| Failed | Payment or issuance failed. | Admin may inspect and retry where appropriate. |
| Cancelled | Request was closed before issuance. | No permit should be issued from the request. |
| Expired | Unpaid request passed its payment window. | Student may start a new request if allowed. |

The implementation of these states made recovery visible to administrators. Instead of treating every incomplete case as a generic error, the dashboard can identify whether the problem is unpaid checkout, paid but unissued request, review requirement, failed payment, or expired request.

The Paystack webhook implementation also required careful CSRF handling. The webhook path is public because Paystack must call it directly, but it is protected by signature verification. CSRF protection is disabled only for the webhook route because a third-party server cannot provide the application's CSRF token. This is a controlled exception, not a general weakening of public routes.

### 4.3.5 NFC card management and verification

The NFC card module implements card registration, replacement, lost-card handling, revocation, and verification support. Its purpose is to allow a physical NFC card to serve as a fast verification token linked to a student record.

Figure 4.9 should show the NFC card registration interface.

[INSERT FIGURE — NFC Card Registration]

Figure 4.9: NFC Card Registration

During registration, an authorized user submits an NFC UID and selects the student. The backend normalizes the UID and stores an HMAC hash instead of the raw value. It also stores the last four normalized characters for display and support lookup. This allows staff to distinguish records without exposing the full UID.

The implementation enforces one active NFC card per student. If a new card is registered for a student who already has an active card, the previous active card is marked as replaced. This rule is enforced in the backend action rather than only in the user interface.

Card lifecycle statuses include active, inactive, revoked, lost, stolen, replaced, and damaged. Only active cards can verify as valid. This prevents a lost or revoked card from continuing to work after an administrative action.

Figure 4.10 should show the NFC verification screen and result card.

[INSERT FIGURE — NFC Verification Screen]

Figure 4.10: NFC Verification Screen

NFC verification hashes the submitted UID, finds the matching card, checks the card status, resolves the assigned student, and checks the student's active permit for the relevant academic period. The system returns a normalized result and creates a verification log. The raw UID is never stored in the log.

Listing 4.4 summarizes the NFC verification flow.

Listing 4.4: NFC Verification Flow Summary

```txt
normalize submitted NFC UID
hash UID with configured key
find NFC card by uid_hash
reject missing or inactive card
resolve assigned student
check active permit
return result and create verification log
```

The implementation treats NFC as a verification input rather than the complete verification decision. This matters because a valid NFC card is not enough if the student has no active permit. The backend still checks student and permit status before returning a valid result.

Table 4.6 summarizes NFC card lifecycle states used by the module.

Table 4.6: NFC Card Lifecycle States

| Card State | Meaning | Verification Result |
| --- | --- | --- |
| Active | Card is assigned and usable. | May verify if the linked student has a valid permit. |
| Inactive | Card exists but is not currently active. | Rejected during verification. |
| Revoked | Card was administratively revoked. | Rejected during verification. |
| Lost | Student or staff marked the card as lost. | Rejected during verification. |
| Stolen | Card is marked as stolen. | Rejected during verification. |
| Replaced | Card was replaced by another active card. | Rejected during verification. |
| Damaged | Card is unusable due to damage. | Rejected during verification. |

This lifecycle implementation supports realistic card administration. A physical card may continue to exist after it is replaced or revoked, but the backend status determines whether it can verify as valid.

### 4.3.6 Verification module

The verification module supports three methods: student number verification, permit code verification, and NFC UID verification. This gives staff practical alternatives during operations. NFC may be faster, but student number and permit code verification remain useful when a card is unavailable or a device cannot read NFC.

Figure 4.11 should show the verification dashboard with the available verification methods.

[INSERT FIGURE — Verification Dashboard]

Figure 4.11: Verification Dashboard

Student number verification finds the student by student number, checks the active academic period where available, finds the matching permit, evaluates permit status and validity dates, and returns a normalized result. If an active permit has passed its expiry date, the implementation can mark it as expired.

Permit code verification hashes the submitted code using the same permit code hashing mechanism used during issuance. The system then finds the matching permit and evaluates its status and validity dates. Since plaintext permit codes are not stored, verification depends on repeatable hashing rather than direct plaintext comparison.

NFC verification uses the NFC card flow described earlier. It hashes the submitted UID, resolves the active card, finds the student, and checks permit status.

Every verification attempt is logged. Verification logs store method, result, identifier hash, reason, resolved student, resolved permit, verifier, IP address, user agent, metadata, and created timestamp. The logs are append-only and do not store raw submitted identifiers.

The result handling was implemented to support operational clarity. A verifier should not simply receive "failed" for every unsuccessful case. The result may be valid, invalid, expired, revoked, not found, card inactive, or error depending on the method. Clear results reduce confusion during real verification activities.

Table 4.7 shows the verification methods and the main implementation check performed for each method.

Table 4.7: Verification Method Implementation

| Verification Method | Input | Main Backend Check | Log Handling |
| --- | --- | --- | --- |
| Student number | Student number | Find student and current permit for active academic period | Store hashed submitted number and resolved records. |
| Permit code | Permit code | Hash submitted code and find matching permit | Store hashed submitted code and permit reference where found. |
| NFC UID | NFC UID from card scan/input | Hash UID, find active card, resolve student, check permit | Store hashed UID and resolved card/student/permit context. |

The three methods share the same logging principle. Even when the verification method differs, the system avoids storing raw submitted identifiers and records a normalized result.

### 4.3.7 Elections module

The elections module implements formal student governance elections separately from polls. The separation was necessary because elections require stronger rules: candidate approval, eligibility checks, one vote per student per position, immutable votes, and controlled result visibility.

Figure 4.12 should show the election management dashboard.

[INSERT FIGURE — Election Dashboard]

Figure 4.12: Election Dashboard

Elections have lifecycle statuses such as draft, scheduled, active, closed, and archived. These states allow administrators to prepare elections before voting begins, open voting within a defined period, close the election, and retain records for future review. Elections are linked to academic periods so eligibility can be evaluated against the correct period.

Candidate records have approval statuses such as pending, approved, rejected, and withdrawn. Only approved candidates are returned to student voters and accepted by the vote action. This prevents unapproved candidates from appearing on ballots.

Vote casting is handled through a centralized action. The action checks election status, voting window, candidate-position relationship, candidate approval status, authenticated student link, account status, active permit requirement, and duplicate vote rules. The vote record stores the selected position, candidate, student, and cast timestamp. The vote is immutable in the current implementation.

Figure 4.13 should show the mobile voting screen.

[INSERT FIGURE — Mobile Voting Screen]

Figure 4.13: Mobile Voting Screen

The mobile election API returns election detail with positions, approved candidates, eligibility status, and per-position `has_voted` state. After a student casts a vote, the API returns updated election detail or vote data so that the mobile application can update the screen without guessing.

Result visibility is controlled by the election configuration and permissions. Ordinary students can view results only when results are visible. Users with result-viewing permission can view results when allowed by their role.

Figure 4.14 should show the election results screen.

[INSERT FIGURE — Election Results Screen]

Figure 4.14: Election Results Screen

The election implementation supports audit events such as election creation, updates, publishing, starting, closing, archiving, candidate approval, candidate rejection, withdrawal, and vote casting. Ballot audit metadata is limited so that unnecessary sensitive ballot detail is not exposed.

Table 4.8 summarizes the election lifecycle.

Table 4.8: Election Lifecycle Implementation

| Election State | Meaning | Voting Behavior |
| --- | --- | --- |
| Draft | Internal setup stage. | Students cannot vote. |
| Scheduled | Election is prepared for future voting. | Students can view where allowed, but voting is not open. |
| Active | Election can receive votes if inside the voting window. | Eligible students may vote. |
| Closed | Voting has ended. | Votes cannot be cast; results may be visible based on configuration. |
| Archived | Election is retained for records. | No operational voting action is allowed. |

The module returns approved candidates only to voters. Candidate approval is therefore part of the implementation path, not just an administrative label. This prevents a candidate from becoming available for voting before review is complete.

Eligibility reasons are returned in mobile election detail where appropriate. This helps students understand why voting may be unavailable. For example, a student may be outside the voting window, may not have an active permit for the election academic period, or may already have voted for the position.

### 4.3.8 Polling module

The polling module supports lightweight student participation separately from formal elections. Polls may be used for surveys, preference checks, or informal student feedback. The design is less strict than the election module because polls do not determine formal representation.

Polls include lifecycle metadata, visibility settings, optional voting windows, result settings, and options. A poll may use fixed options defined by administrators or dynamic options submitted by students while voting. Fixed polls require at least two active options before publishing.

Voting is linked to student profiles. The system enforces one vote per student per poll. If vote changes are enabled, a student can update a previous vote. Archived polls cannot receive votes. This design provides flexibility while still preventing uncontrolled repeated voting.

Poll options with votes should not be deleted because that would damage result integrity. Instead, options can be merged into another option. Votes are moved to the target option, and the source option is marked as merged. This implementation preserves voting history more safely than deleting records.

Result visibility is controlled through the poll configuration. Normal users can see vote counts only when results are enabled, while users with result permissions can view results according to their role.

The polling module was useful because it provided a lower-risk participation workflow without weakening the stricter election module. This separation kept election implementation focused on representation and integrity, while polls remained suitable for surveys and informal feedback.

### 4.3.9 Announcements, events, and documents modules

Announcements, events, and documents were implemented on a shared content foundation. These modules support official SRC communication through the dashboard, public portal, and mobile content endpoints. They use publishing statuses, visibility rules, slug generation, media collections, and audit logging.

Figure 4.15 should show the announcement management screen.

[INSERT FIGURE — Announcement Management]

Figure 4.15: Announcement Management

Announcements include title, slug, excerpt, content, category, status, visibility, featured flag, publication timestamp, archive timestamp, and media collections. Authorized users can create drafts, publish announcements, archive them, and delete them. Audit logs record creation, updates, publishing, archiving, and deletion.

Events include event content and scheduling information such as title, slug, description, excerpt, location, category, start and end dates, visibility, featured flag, and media. Events use the same publication and archive approach as announcements. Capacity fields are reserved for future registration or attendance features.

Documents store downloadable files such as SRC guidelines, forms, meeting minutes, and permit-related documents. The document module uses Media Library to attach files and optional featured images. Documents cannot be published until at least one file is attached. This rule is enforced in the backend so that a published document page does not appear without a downloadable file.

Figure 4.16 should show the public portal.

[INSERT FIGURE — Public Portal]

Figure 4.16: Public Portal

The public portal exposes only published public records. Draft, scheduled, archived, internal, and unpublished records return not-found responses on public detail routes. This public/private separation was implemented through query scopes and explicit public payloads rather than by exposing dashboard models directly.

The same public visibility rules are reused by the mobile content API. This avoids having public portal and mobile content endpoints disagree about which content is visible.

Table 4.9 summarizes content publication behavior across announcements, events, and documents.

Table 4.9: Content Module Publication Behavior

| Content Type | Required Publication Rules | Media Handling |
| --- | --- | --- |
| Announcements | Status and visibility determine public display; published date is set when published. | Featured image and gallery collections are supported. |
| Events | Status, visibility, schedule, and publication fields determine display. | Banner and gallery collections are supported. |
| Documents | Document must have at least one file before publishing. | Files and featured image collections are supported. |

The implementation uses slugs for clean public URLs and content lookup. Slug generation is centralized so that titles can be converted into consistent route-friendly identifiers. This matters because public and mobile content endpoints use slugs for detail pages.

### 4.3.10 Audit logging and reporting

Audit logging was implemented to record important operational actions. The system needs to answer who performed an action, what happened, when it happened, and which record was affected. This is important for student governance because permits, payments, NFC cards, verification, elections, and content publishing may produce disputes or require review.

Figure 4.17 should show the audit logs dashboard with filters and event records.

[INSERT FIGURE — Audit Logs Dashboard]

Figure 4.17: Audit Logs Dashboard

Audit logs store actor user, event name, affected model, subject model, description, IP address, user agent, old values, new values, metadata, and timestamp where appropriate. Audit logs are not intended to store raw secret identifiers. Permit codes, NFC UIDs, setup tokens, and verification identifiers should remain hashed or summarized.

Activity feeds reuse audit logs to show recent lifecycle events on dashboard screens. This provides a lightweight operational timeline without building a separate analytics system.

Reporting was implemented as an operational summary rather than a chart-heavy analytics platform. The dashboard summary includes total students, activated student accounts, pending setup accounts, active/expired/revoked permits, active NFC cards, pending and successful payments, verification attempts today, failed verification attempts today, stuck permit requests, and paid but unissued permit requests.

Figure 4.18 should show the reports dashboard.

[INSERT FIGURE — Reports Dashboard]

Figure 4.18: Reports Dashboard

The reports page groups counts by students, permits, NFC cards, payments, permit requests, and verification. It also identifies operational warnings such as no active academic period, disabled permit requests, students without activated accounts, students without active NFC cards, permits expiring soon, and self-service requests needing recovery.

This implementation gives SRC executives and administrators practical visibility into current operations. More advanced analytics can be added later after workflows stabilize.

Table 4.10 summarizes examples of audit events recorded by the platform.

Table 4.10: Audit Event Coverage

| Area | Example Events |
| --- | --- |
| Students | Student created, updated, deleted, account activated |
| Permits | Permit issued, revoked, card delivered |
| Payments | Payment created, successful, failed, cancelled |
| Permit requests | Request created, payment verified, issued, review approved/rejected, cancelled, expired |
| NFC cards | Card registered, replaced, lost, revoked |
| Verification | Verification performed |
| Content | Announcement/event/document published, archived, deleted |
| Polls and elections | Vote cast, election started, election closed, candidate approved |

Audit coverage was implemented broadly because the system's accountability requirement is not limited to one module. The audit log becomes more useful when it can show the sequence of events across related workflows, such as payment verification followed by permit issuance.

## 4.4 Mobile Application Implementation

The mobile application extends the student governance platform beyond the dashboard and public portal. It provides students with access to personal permit workflows, governance content, election voting, and NFC card status. It also supports selected staff operations such as verification and card assignment through controlled mobile endpoints.

The mobile implementation was developed around the principle that mobile screens should be thin clients. They display data, collect input, and call endpoints. They do not decide payment success, vote eligibility, permit validity, or staff permissions. Those decisions remain in the backend.

### 4.4.1 Mobile authentication

Mobile authentication uses Sanctum token authentication. The mobile application sends email, password, and device name to the login endpoint. The backend validates credentials, rejects inactive users or users without passwords, and returns a bearer token. The token is stored securely by the mobile application and sent with authenticated requests.

Session restoration is handled by reading the stored token when the application starts and then requesting the current user profile. If the backend returns unauthenticated, the token is cleared and the user is returned to the login screen. If the backend returns forbidden, the application treats it as a role or permission issue rather than a login failure.

Role-aware mobile access is implemented by separating student screens from operations screens. Students access profile, permits, permit requests, content, elections, and NFC card status. Staff or administrators access operational verification and management screens only where backend permissions allow.

### 4.4.2 Student mobile features

The student mobile features were implemented around common student workflows. A student can view permit status, create a permit request, initialize payment, verify payment after return from Paystack, view governance content, access elections, and view NFC card status.

Figure 4.19 should show the student mobile home screen.

[INSERT FIGURE — Student Home Screen]

Figure 4.19: Student Home Screen

Permit viewing allows students to see their own permits. The endpoint is scoped to the authenticated student's linked record, so one student cannot retrieve another student's permits through the mobile API.

The permit request mobile screen starts by loading request options. If the student already has an active permit or an open request, the mobile application should block checkout and show the reason. If allowed, the student creates a request and initializes Paystack checkout. The app opens the authorization URL in a browser or secure web view.

Figure 4.20 should show the mobile permit request screen.

[INSERT FIGURE — Permit Request Mobile Screen]

Figure 4.20: Permit Request Mobile Screen

After Paystack returns, the mobile application calls the server-side verify-payment endpoint. It then refreshes or polls the permit request detail until the status becomes issued, paid, failed, or review required. This avoids assuming that payment completion occurs immediately after redirect.

Figure 4.21 should show the mobile permit status screen.

[INSERT FIGURE — Mobile Permit Status Screen]

Figure 4.21: Mobile Permit Status Screen

The mobile application also displays announcements, events, documents, and executives through content endpoints. These endpoints reuse public visibility rules so that mobile users see only published public content. Elections are displayed through election endpoints that return active, scheduled, closed-with-visible-results, and permitted result data.

### 4.4.3 Operations mobile features

Operations mobile features support staff and authorized users. These include verification workflows, student search, permit issuance support, NFC registration, NFC replacement, NFC revocation, permit request review, and operations summaries.

Figure 4.22 should show the operations verification screen.

[INSERT FIGURE — Operations Verification Screen]

Figure 4.22: Operations Verification Screen

The verification workflow allows authorized users to verify by student number, permit code, or NFC UID. The result shape is consistent with dashboard verification. It returns method, result, reason, resolved student, and permit summary where available. Raw identifiers are not returned.

Student search supports staff workflows such as permit issuance and card assignment. Staff can search for a student, view necessary details, and perform permitted actions. The backend still enforces permissions, so mobile screens do not become the security boundary.

Figure 4.23 should show the card assignment screen.

[INSERT FIGURE — Card Assignment Screen]

Figure 4.23: Card Assignment Screen

Operations summaries give staff and executives lightweight counts such as permits, NFC cards, verification logs, and pending permit request states. This supports field or mobile oversight without requiring dashboard access for every check.

### 4.4.4 Mobile API integration

The mobile API client is structured around endpoint groups and query keys. Authentication, student data, permits, permit requests, payments, elections, content, verification, and staff operations are treated as separate API areas. This makes invalidation and refetching easier after state-changing actions.

Figure 4.24 should show the mobile API communication flow.

[INSERT FIGURE — Mobile API Communication Flow]

Figure 4.24: Mobile API Communication Flow

Resource normalization is handled at the API and client layers. The backend returns mobile resources that hide internal fields. The client adapts these responses into screen-friendly data. Pagination is used for list endpoints so that mobile screens can load data gradually.

Error handling follows the API response patterns. `401` clears the token and returns the user to login. `403` shows a permission state. `422` displays validation messages near fields. `404` indicates missing or inaccessible records. Rate-limit responses are handled as temporary retry states.

Query invalidation is used after actions. For example, after payment verification, permit request detail and permit list queries are refreshed. After voting, election detail and election list queries are refreshed. After reporting a lost NFC card, the NFC card query is refreshed. This keeps the mobile interface aligned with backend state.

The mobile API migration required careful mapping from earlier or planned endpoint contracts to the Laravel mobile API. The final API structure keeps student endpoints scoped to the linked student profile and staff endpoints protected by permissions.

Table 4.11 maps major mobile screens to backend endpoint groups.

Table 4.11: Mobile Screen and API Integration Map

| Mobile Screen | Main API Group | Implementation Notes |
| --- | --- | --- |
| Login | Authentication | Issues Sanctum token and returns safe user role data. |
| Home | Content, permit request options | Loads public content and student permit request state. |
| Profile | Student, current user | Shows authenticated user's linked student profile. |
| Permits | Student permits | Lists only the student's own permits. |
| Request permit | Permit requests and payment | Creates request, initializes Paystack, verifies payment after return. |
| Elections | Election endpoints | Lists eligible elections and supports immutable voting. |
| Announcements/events/documents | Content endpoints | Uses published public visibility rules. |
| NFC card | Student NFC card | Shows own card state and supports lost-card reporting. |
| Staff verify | Verification endpoints | Supports student number, permit code, and NFC verification. |
| Staff issue permit | Operations endpoints | Uses staff permission checks and selected-student preflight state. |
| Staff card assignment | Operations NFC endpoints | Supports card registration and lifecycle actions. |

The endpoint mapping helped keep mobile development aligned with backend capabilities. It also reduced the risk of screens using the wrong endpoint for a workflow. For example, student permit request options and staff permit issue options are different endpoints because they answer different questions.

## 4.5 Security and Integrity Implementation

Security and integrity were implemented across the system rather than as a single module. The platform handles student records, permits, payments, NFC card identifiers, election votes, audit logs, and public content, so security decisions had to be applied consistently.

RBAC enforcement uses roles and permissions from Spatie Permission. Routes, policies, and form requests check permissions before sensitive actions. This protects operations such as student management, permit issuance, permit revocation, payment status changes, NFC card management, verification log access, audit log access, content publishing, election management, and role management.

Route protection separates public, dashboard, and mobile surfaces. Dashboard routes require authenticated and verified users. Public routes expose only public content and self-service permit request actions. Mobile routes use Sanctum tokens and backend authorization.

Rate limiting was implemented for sensitive areas. Login, setup password, verification, sensitive actions, public content, mobile login, mobile verification, mobile sensitive actions, and mobile permit request endpoints have named rate limiters. This reduces the risk of repeated automated attempts against authentication, verification, and payment-related endpoints.

Hashed identifiers protect sensitive values. Permit codes are stored as HMAC hashes with last-four values for display. NFC UIDs are normalized and stored as HMAC hashes with last-four values. Verification logs store hashed submitted identifiers. Sanctum stores token hashes rather than plaintext tokens. Setup-password tokens are stored as SHA-256 hashes.

Payment verification security is enforced by server-side verification. Paystack redirects are not trusted as proof of success. The webhook verifies the Paystack signature. Payment metadata and access codes are not exposed publicly. Admin retry verification uses the same server-side verification action as callbacks and mobile verification.

Election integrity is enforced through eligibility checks and immutable votes. The system checks account, student profile, permit status, election status, voting window, candidate approval, and duplicate vote rules before inserting a vote. Votes are not edited after submission in the current implementation.

Queue isolation and logging boundaries protect sensitive data during background processing. The system avoids logging raw NFC UIDs, full permit codes, passwords, setup tokens, Sanctum tokens, or token hashes. Failed jobs should be reviewed carefully before retrying or exposing payload data.

Cache invalidation protects data correctness. Cached summaries and public content improve performance, but sensitive decisions such as payment verification, permit issuance, and election voting depend on authoritative records rather than stale cache values.

Table 4.12 summarizes the main security mechanisms implemented in the system.

Table 4.12: Security and Integrity Mechanisms

| Mechanism | Implementation Area | Purpose |
| --- | --- | --- |
| Session authentication | Dashboard | Protects internal operational screens. |
| Sanctum bearer tokens | Mobile API | Authenticates mobile requests. |
| RBAC | Dashboard and mobile operations | Restricts actions by role and permission. |
| Policies/Form Requests | Backend modules | Enforces authorization and validation on server-side actions. |
| Rate limiting | Login, setup password, verification, mobile actions | Reduces repeated abuse of sensitive endpoints. |
| Permit code hashing | Permit and verification modules | Prevents plaintext permit code storage. |
| NFC UID hashing | NFC card and verification modules | Prevents raw card UID storage. |
| Server-side payment verification | Paystack integration | Prevents permit issuance from unverified redirects. |
| Immutable votes | Election module | Prevents vote editing and duplicate votes per position. |
| Public visibility scopes | Public portal and mobile content | Prevents draft/internal content exposure. |
| Audit logging | Sensitive modules | Preserves operational evidence. |

## 4.6 Queue, Cache, and Performance Optimization

Queues were implemented to move selected work away from the immediate request cycle. Setup-password notifications, operational notifications, media conversions, and future large tasks can be processed by queue workers. This improves responsiveness because the user's request can finish after the important record changes are committed.

Figure 4.25 should show the queue workflow.

[INSERT FIGURE — Queue Workflow]

Figure 4.25: Queue Workflow

The queue connection is database-backed by default. This is suitable for the first deployment because it avoids requiring Redis immediately. The system remains ready for Redis and Horizon later if queue volume increases.

The scheduler supports maintenance commands. It prunes expired Sanctum tokens, old failed jobs, queue batches, expired permits, and old unpaid permit requests. Scheduled expiry is particularly useful for permit requests because unpaid requests should not remain open indefinitely.

Caching is used for dashboard summaries, public homepage content, public announcement/event/document lists, public executives, active academic period lookup, permit settings, and content settings. The active academic period cache stores a scalar ID rather than a full model object. This avoids unsafe cached object serialization.

Cache invalidation is handled through short time-to-live values, versioned keys, and updates when relevant models change. Public content cache is refreshed when content is published, archived, or changed. Dashboard summaries can be flushed or refreshed when operational records change.

Performance optimization also includes pagination. Mobile lists and dashboard lists can grow over time. Pagination prevents large payloads from slowing down the interface. Filtering and search are used where users need to find records quickly.

The performance strategy is practical rather than excessive. The system does not require advanced analytics infrastructure or complex worker orchestration at the first stage. It uses queues, caching, pagination, and database discipline to keep the implementation responsive and maintainable.

Table 4.13 summarizes queue, cache, and scheduler responsibilities.

Table 4.13: Queue, Cache, and Scheduler Responsibilities

| Area | Implemented Responsibility |
| --- | --- |
| Queue worker | Processes notifications, media jobs, and future long-running work. |
| Scheduler | Runs expiry and pruning commands on a timed basis. |
| Dashboard cache | Stores counts, warnings, report summaries, and content readiness where appropriate. |
| Public content cache | Stores public homepage and public content payloads with controlled invalidation. |
| Settings cache | Stores permit settings, content settings, and active academic period lookup. |
| Future Redis path | Allows queue and cache drivers to be switched when workload grows. |

## 4.7 Testing and Validation

Testing was planned around the system's highest-risk workflows: authentication, authorization, student management, permit issuance, payment verification, NFC card management, verification, elections, public content visibility, mobile API access, audit logging, and security boundaries.

The project documentation records a latest full-suite status of `php artisan test --compact` passing with 266 tests. During this chapter generation session, a fresh attempt to run the same command exceeded the 120-second tool limit, so the current live run could not be completed within the available execution window. The documented 266-test status remains the available project test evidence to reference until a fresh full run is captured for the final submission.

Figure 4.26 should show the test execution results from the final verified local run.

[INSERT FIGURE — Test Execution Results]

Figure 4.26: Test Execution Results

Table 4.14 summarizes the main testing areas and expected outcomes.

Table 4.14: System Testing Results Summary

| Test Area | Test Case | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- |
| Authentication | Login rejects inactive or invalid users | Unauthorized users cannot access protected areas | Verified in authentication tests | Passed |
| Account activation | Student setup token allows initial password setup | Student account becomes activated after valid setup | Verified in student activation tests | Passed |
| Role management | Unauthorized users cannot manage roles | Role screens and actions require permissions | Verified in permission tests | Passed |
| Student management | Authorized users create and update student records | Valid student records are saved and searchable | Verified in student module tests | Passed |
| Permit issuance | Duplicate active permit is blocked | Only one active permit per student and academic period | Verified in permit tests | Passed |
| Permit revocation | Revoked permits cannot be revoked twice | Revocation state and reason are preserved | Verified in permit tests | Passed |
| Self-service permits | Public request creates pending permit request | Request moves through awaiting payment and review states | Verified in self-service tests | Passed |
| Payment verification | Permit is not issued before verified payment | Server-side verification is required | Verified in Paystack/payment tests | Passed |
| Payment idempotency | Duplicate callback or webhook does not issue duplicate permit | Existing successful state is reused safely | Verified in payment tests | Passed |
| NFC registration | Raw UID is not stored | UID hash and last-four value are stored | Verified in NFC card tests | Passed |
| NFC verification | Inactive card does not verify as valid | Card lifecycle status affects result | Verified in NFC/verification tests | Passed |
| Verification logs | Raw identifiers are not stored in logs | Logs store hashed identifiers and resolved records | Verified in verification tests | Passed |
| Elections | Student can vote once per position | Duplicate votes are rejected | Verified in election tests | Passed |
| Election eligibility | Ineligible students cannot vote | Account, permit, window, and candidate rules are enforced | Verified in mobile election tests | Passed |
| Public portal | Draft/internal content is not publicly visible | Public routes expose only published public content | Verified in public content tests | Passed |
| Mobile API | Student endpoints are scoped to own profile | Students cannot access another student's data | Verified in mobile API tests | Passed |
| Security hardening | Sensitive fields are not exposed | Token hashes, UID hashes, full codes, and metadata remain hidden | Verified in security tests | Passed |

Unit testing covered smaller pieces of logic such as helpers, options, hashing-related behavior, and settings. Feature testing covered full request workflows and module behavior. API testing validated mobile endpoint access, response shapes, permission enforcement, and scoping. Payment testing validated server-side verification, callback handling, webhook handling, and recovery behavior. NFC testing validated card lifecycle and verification results. Election testing validated candidate approval, voting windows, eligibility, one-vote rules, and result visibility.

Mobile testing focused on authenticated API access and workflow behavior. Since mobile screens depend on backend responses, backend feature tests were important for confirming that mobile endpoints provide safe and predictable data. Frontend and device-level testing should still be completed with screenshots for final submission.

Security testing confirmed that route protection, permissions, rate limits, sensitive data hiding, and public/private boundaries worked as designed. This was necessary because the system contains several modules where frontend visibility alone would not be enough.

The testing strategy also considered regression risk. Many modules share actions, policies, and records. A change in permit issuance can affect dashboard issuance, mobile staff issuance, self-service completion, payment recovery, and reports. A change in student account linking can affect mobile login, election eligibility, and student profile access. Feature tests therefore give stronger evidence than isolated interface checks alone.

Manual validation remains necessary for screenshots and final demonstration. Automated tests can verify server behavior, but screenshots must show that the dashboard, public portal, and mobile screens present the workflows clearly. Final report screenshots should capture login, student management, permit request, payment flow, NFC verification, election voting, audit logs, reports, public portal, and mobile screens.

## 4.8 Deployment and Production Readiness

Deployment readiness was considered during implementation because the system depends on more than the Laravel request cycle. A production environment requires PHP, web server, PostgreSQL, queue worker, scheduler, writable storage, HTTPS, environment secrets, and build assets.

Figure 4.27 should show the deployment architecture.

[INSERT FIGURE — Deployment Architecture]

Figure 4.27: Deployment Architecture

Environment configuration includes production settings such as `APP_ENV=production`, `APP_DEBUG=false`, HTTPS application URL, database credentials, queue connection, cache store, session driver, filesystem disk, Paystack keys, permit code hash key, NFC UID hash key, and webhook secret. Strong secrets are required for `APP_KEY`, `PERMIT_CODE_HASH_KEY`, `NFC_UID_HASH_KEY`, `PAYSTACK_SECRET_KEY`, and `PAYSTACK_WEBHOOK_SECRET`.

The deployment workflow includes installing Composer dependencies, installing JavaScript dependencies, building frontend assets, running migrations, clearing and caching configuration, caching routes and views, and restarting queue workers. These steps prepare both backend and frontend assets for production.

Queue workers must run continuously. A process manager should restart them automatically if they fail. The worker should process the default and media queues with configured retry, backoff, and timeout values. Queue restart should be part of deployment so workers load updated code.

The scheduler should run every minute. It handles expired token pruning, failed job pruning, permit expiry, and unpaid permit request expiry. Without the scheduler, some lifecycle states may become stale.

HTTPS is required. Mobile bearer tokens, dashboard sessions, Paystack callbacks, webhooks, and public forms should not be transmitted over plain HTTP in production. Paystack webhook URLs should be configured to use HTTPS, and webhook signatures should be verified.

Storage readiness includes writable storage directories and the public storage symlink. Media and document visibility must remain aligned with content visibility rules. Public document downloads should only be served through published public document routes.

Health endpoints such as `/up`, `/health/database`, and `/health/queue` provide lightweight checks. They should return only simple status information and should not expose sensitive configuration.

Production logging should avoid sensitive values. Raw NFC UIDs, full permit codes, passwords, setup tokens, Sanctum tokens, and token hashes should never be logged. Operational logs should use model IDs, references, and last-four values where needed.

Table 4.15 summarizes production readiness requirements.

Table 4.15: Production Readiness Requirements

| Requirement | Implementation or Deployment Expectation |
| --- | --- |
| HTTPS | Required for dashboard sessions, mobile tokens, Paystack callbacks, and webhooks. |
| Environment secrets | Strong keys must be configured for app, permit code hashing, NFC UID hashing, and Paystack. |
| Database migrations | Must be run with production-safe migration commands. |
| Queue worker | Must run continuously for queued notifications and media work. |
| Scheduler | Must run every minute for pruning and expiry commands. |
| Storage symlink | Required for public media access where allowed. |
| Cached config/routes/views | Recommended for production performance. |
| Health endpoints | Used to verify app, database, and queue readiness. |
| Logging boundaries | Must avoid raw sensitive identifiers and tokens. |
| Paystack webhook URL | Must be configured in the Paystack dashboard and protected by signature verification. |

## 4.9 Challenges Encountered During Implementation

Several implementation challenges were encountered because the system combines many workflows that must remain consistent.

The first challenge was NFC platform limitation. NFC support varies across devices and operating systems. A design that depended entirely on NFC would be fragile. The solution was to treat NFC as one verification method and keep student number and permit code verification as alternatives. This allowed the system to support NFC while remaining usable without compatible hardware.

The second challenge was secure NFC identifier handling. Storing raw NFC UIDs would have made verification easier to implement but weaker from a privacy and security perspective. The solution was to normalize UIDs, store HMAC hashes, and keep last-four values only for display. Verification then hashes the submitted UID and compares hashes.

Payment verification edge cases were another challenge. Payment callbacks and webhooks may arrive late, repeat, or fail. A simple implementation might issue a permit after a redirect or create duplicate permits after repeated callbacks. The solution was to verify payments server-side, treat verification as idempotent, lock relevant records, and reuse permit issuance rules that block duplicate active permits.

Self-service permit requests introduced the challenge of unknown students. Allowing unknown students to create fully trusted records would weaken the student identity model. Blocking unknown students entirely would reduce accessibility. The solution was to allow provisional records in the public flow with `requires_review`, while restricting the mobile flow to authenticated linked students.

Election voting required careful separation from polling. Polls may allow flexible voting behavior, but elections require stricter integrity. The implementation separated elections from polls, enforced candidate approval, required eligibility checks, stored immutable votes, and enforced one vote per student per position.

Mobile API migration and integration created another challenge. The mobile application needed endpoints for students, permits, permit requests, payments, content, elections, verification, and operations. Exposing dashboard payloads directly would have leaked internal fields. The solution was to create mobile resources and endpoint groups that return only safe, screen-appropriate data.

Role and permission complexity increased as modules expanded. Students, staff, executives, administrators, and super administrators required different capabilities. The solution was to centralize permissions, use Spatie roles, protect routes with policies and form requests, and treat frontend visibility as a usability feature rather than a security mechanism.

Queue and cache synchronization also required care. Cached summaries can become stale, and queued work can fail if workers are not running. The implementation used short cache lifetimes, versioned public content keys, cache invalidation on model changes, and documented queue worker deployment requirements.

Deployment introduced environment and service coordination challenges. The application depends on keys, storage, migrations, queue workers, scheduler, Paystack webhook configuration, and HTTPS. The solution was to document baseline deployment requirements and include health checks for the database and queue.

These challenges were useful academically because they showed that implementation is not just writing screens and models. The difficult parts were often workflow integrity, recovery, access control, and operational reliability.

Table 4.16 summarizes the main implementation challenges and resolutions.

Table 4.16: Implementation Challenges and Resolutions

| Challenge | Effect on the System | Resolution |
| --- | --- | --- |
| NFC device variation | NFC scanning cannot be guaranteed on every device. | Added student number and permit code verification as fallback methods. |
| Raw UID sensitivity | Storing raw NFC identifiers would increase privacy risk. | Stored HMAC hashes and last-four display values only. |
| Payment callback repetition | Repeated callbacks could create duplicate permits. | Implemented idempotent verification and duplicate active permit blocking. |
| Unknown student self-service | Public students may not already exist in records. | Created provisional public records requiring admin review. |
| Mobile trust boundary | Mobile client cannot be trusted to enforce rules. | Kept eligibility, payment, and permission checks in backend endpoints. |
| Role complexity | Different users need different permissions. | Used grouped permissions, protected roles, policies, and form request authorization. |
| Cache freshness | Stale cached data could mislead users. | Cached non-critical summaries and invalidated content/settings carefully. |
| Deployment coordination | App requires queue, scheduler, secrets, storage, and HTTPS. | Documented production baseline and health checks. |

## 4.10 Summary of Implementation

This chapter explained the implementation of the NFC-based student permit verification and governance management system for Knutsford University. It described the development environment, backend technologies, frontend tools, mobile technologies, infrastructure requirements, and module implementation.

The backend implementation covered authentication, authorization, student management, permit management, self-service permit requests, Paystack payment verification, NFC card management, verification, elections, polling, content management, audit logging, and reporting. The mobile implementation covered Sanctum authentication, student features, operations features, and mobile API integration. The security section explained how RBAC, route protection, rate limiting, hashed identifiers, verification logs, payment verification, immutable votes, queue isolation, and cache invalidation were applied.

The chapter also discussed queue and cache optimization, testing and validation, deployment readiness, and implementation challenges. The implementation demonstrates that the project is not a set of isolated modules. The main achievement is the integration of permit issuance, payment verification, NFC verification, election participation, public communication, mobile access, audit logging, and reporting into one student governance platform.

Chapter Five will summarize the overall project, evaluate the objectives achieved, present conclusions, and recommend possible future improvements based on the implementation outcomes.
