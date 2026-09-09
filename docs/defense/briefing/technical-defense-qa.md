# Daud's technical defense handbook

**Project:** NFC-Based Student Permit Verification and Governance Management System  
**Purpose:** Personal preparation for technical panel questions  
**Use:** Learn the logic of each answer. Do not memorize every sentence.

---

## Your role in the defense

You are the technical lead, but you do not need to answer every question. Take questions about architecture, code, databases, APIs, security, payments, NFC, testing, deployment, and technical limitations.

Start with the plain answer. Add implementation detail only if the panel asks for it.

### A useful answer pattern

1. Answer the question directly.
2. Name the mechanism used in this project.
3. Explain why it matters.
4. State the limitation if there is one.

Example:

> The app does not decide whether a permit is valid. It reads the NFC UID and sends it through an authenticated request to Laravel. The backend checks the card, student, academic period, and permit status, then logs the attempt. This keeps the decision current, although it means a fresh verification needs network access.

---

## Thirty-second technical overview

> Laravel is the central application and API layer. The dashboard uses Inertia, React, and TypeScript, while the mobile app uses Expo React Native. The mobile app authenticates with Sanctum bearer tokens. Both interfaces reuse backend actions for permits, payments, NFC cards, verification, and audit logging. PostgreSQL stores the related records, and Paystack transactions are verified by the server before a permit can be issued.

## Ninety-second technical overview

> We designed the system around one Laravel backend rather than putting business rules separately in the website and mobile app. The web dashboard uses Inertia with React and TypeScript. The mobile app is built with Expo React Native and communicates through the `/api/mobile` routes. Mobile users receive a Sanctum bearer token after login, and protected requests pass through authentication, validation, permissions, and rate limits.
>
> For payments, the backend creates a local pending record, initializes Paystack, then verifies the transaction from the server. A redirect alone is never treated as proof. The verified payment and permit request are locked inside database transactions before issuance, which helps prevent duplicate processing.
>
> For NFC verification, the Android app reads only the tag UID. Laravel normalizes and HMAC-hashes that UID, finds the linked active card, checks the student's current permit, and returns a result such as valid, expired, revoked, inactive, or not found. The attempt is recorded without storing the raw UID in the verification log.

---

# Architecture and design

## 1. What architecture did you use?

> It is a layered web and mobile architecture with one Laravel backend. The interfaces call controllers, controllers delegate business rules to action classes, and Eloquent models manage database records. Policies and Form Requests enforce authorization and validation around those actions.

**If they push further:** The main surfaces are the public portal, authenticated dashboard, mobile API, and signed Paystack webhook. Shared action classes stop each surface from implementing its own version of the same rule.

## 2. Why did you use one backend for both applications?

> It gives us one source of truth. Permit status, payment verification, permissions, and verification results are enforced in one place. If we duplicated those rules in both clients, the website and mobile app could disagree.

## 3. Is this a monolith or microservices system?

> It is a modular Laravel monolith. The domains are separated into controllers, actions, policies, requests, resources, and models, but they deploy as one application. That was more appropriate for the team size and project scope than introducing distributed services and their operational overhead.

## 4. Why not microservices?

> Microservices would add service discovery, separate deployments, network failure between services, distributed logging, and data consistency problems. We did not need that complexity for this project. The current module boundaries could support later extraction if scale or organizational ownership justified it.

## 5. Why are controllers kept thin?

> Controllers should coordinate the HTTP request and response. The reusable business rules live in action classes such as payment verification, permit completion, and NFC verification. That makes the same logic easier to call from web, mobile, webhook, and recovery flows, and easier to test.

## 6. What design pattern is used by the action classes?

> They follow a service or use-case style. Each class handles a focused domain operation, such as `VerifyNfcUidAction` or `CompletePermitRequestAction`. Dependency injection supplies the collaborators, so the controller does not contain the full workflow.

## 7. What are the main system modules?

> The core modules cover users and roles, students, academic periods, permit requests, permits, payments, NFC cards, verification logs, audit logs, public content, polls, elections, reports, and settings.

## 8. How does Inertia fit into the architecture?

> Inertia connects Laravel routes and controllers to React pages without requiring a separate web API for every dashboard screen. Laravel still controls routing, authentication, and page data, while React renders the interactive interface.

## 9. What is the difference between the dashboard and the mobile API?

> The dashboard mainly uses session authentication and Inertia responses. The mobile app uses JSON endpoints under `/api/mobile` and Sanctum bearer tokens. Both can call the same domain actions and policies.

---

# Mobile application and API

## 10. How is the mobile app structured?

> It uses Expo Router with separate route groups for authentication, students, and operations staff. Feature API modules call one shared Axios client. TanStack Query manages server state, React context manages the authenticated session, and React Native `StyleSheet` with shared theme values handles the UI.

## 11. Why Expo React Native?

> It let us build the mobile application in TypeScript with file-based routing and access to native device functions. It also reduced the amount of separate platform code needed for the project. NFC still requires a compatible native development client or installed build; Expo Go cannot provide that module.

## 12. How does the API client work?

> All mobile requests pass through a shared Axios instance. A request interceptor reads the stored token and adds the bearer authorization header. A response interceptor clears the local token on a `401`, and the API layer converts backend errors into user-facing messages.

## 13. Why use TanStack Query?

> Permit, student, card, and verification data come from the server. TanStack Query manages loading, caching, refetching, and mutation invalidation for that server state. It avoids copying the same server data into a separate local store.

## 14. Do you use Zustand?

> It is available in the mobile project, but the current architecture mainly uses TanStack Query for server state, React context for authentication, and local component state for screen interactions. I would only add Zustand where cross-screen client state genuinely requires it.

## 15. How do roles affect mobile navigation?

> The app separates student and operations route groups and redirects users according to the roles returned by the backend. That improves the interface, but it is not the security boundary. The backend still checks permissions for every protected operation.

## 16. What HTTP responses should the app handle?

> The important cases are `401` for unauthenticated access, `403` for insufficient permission, `422` for validation failure, `404` for missing records, `429` for rate limiting, and `5xx` or network errors for server availability. The UI should explain the result without exposing internal details.

## 17. Why do you normalize API responses in feature modules?

> The backend and interface may use different naming or date formats. Normalizers give the screens one stable TypeScript shape. They also keep compatibility work out of the UI, although too many legacy aliases can hide contract drift and should be cleaned up once the API is stable.

---

# Authentication and authorization

## 18. How does mobile login work?

> The app sends email, password, and a device name to `/api/mobile/auth/login`. Laravel verifies that the user exists, is active, and has a valid password. Sanctum then creates a personal access token with the `mobile` ability, and the app stores the plaintext token in Expo SecureStore.

## 19. Why Sanctum?

> Sanctum fits a first-party mobile client that needs bearer-token access to a Laravel API. It integrates with Laravel's user model and middleware, supports token revocation, and avoids the complexity of a full OAuth server for this use case.

## 20. Where is the token stored?

> The mobile app stores it in Expo SecureStore, not ordinary async storage. Each request reads the token and sends it in the authorization header. Logout deletes the current server token and clears the local copy.

## 21. Do the tokens expire?

> The current Sanctum configuration has no global expiration value. The token remains valid until it is revoked or deleted. For a production rollout, we should define an institutional token-lifetime and device-revocation policy rather than leaving that decision implicit.

## 22. What is authentication versus authorization?

> Authentication proves which user is making the request. Authorization decides whether that user may perform the requested action. Sanctum handles the authenticated mobile identity, while permissions, policies, and Form Request authorization control operations such as verification or permit issuance.

## 23. Can a student change the app and pretend to be staff?

> Changing the interface or local role value should not grant access. Staff-only request classes call the backend permission check, such as `verification.perform`. The backend is authoritative even if the client is modified.

## 24. How is dashboard authentication different?

> The website uses Laravel's session-based web guard and verified-user middleware. The mobile API uses Sanctum bearer tokens. They authenticate through different channels but resolve to the same user and permission model.

## 25. What happens after a `401` response in the mobile app?

> The API interceptor removes the stored token. The authentication flow then returns the user to the login state. A future improvement would distinguish a revoked session from a temporary startup network failure so valid users are not treated as logged out unnecessarily.

---

# Database and data integrity

## 26. Why use a relational database?

> The data has strong relationships. Students have permits, requests, cards, payments, and votes. Permits belong to academic periods. Verification logs refer to a verifier, student, and permit when resolved. PostgreSQL and foreign keys suit that structure.

## 27. What are the most important tables?

> The central tables are `users`, `students`, `academic_periods`, `permit_requests`, `payments`, `permits`, `nfc_cards`, `verification_logs`, and `audit_logs`. Governance modules add elections, positions, candidates, votes, polls, announcements, events, and documents.

## 28. How are students and users related?

> The student record contains the academic identity and can be linked to a user account for authentication. This keeps the student's institutional data separate from account credentials while still allowing the logged-in student to access only their own records.

## 29. Why can one student have several permits?

> Permits are records across academic periods. The system keeps history rather than replacing every earlier permit. Application rules prevent an inappropriate duplicate active permit for the same student and period.

## 30. How do you maintain consistency during payment and issuance?

> The workflow uses database transactions and row locks. Payment and permit-request rows are reloaded with `lockForUpdate` before state changes. Either the transaction completes consistently or it rolls back if an exception occurs.

## 31. What is a database transaction?

> It groups related database changes as one unit. If any required step fails, the changes can be rolled back instead of leaving a successful payment with an incomplete or contradictory permit state.

## 32. Why use row locking?

> A callback, webhook, mobile verification, or admin retry can arrive close together. Row locking prevents two processes from updating the same payment or request at the same time and both issuing a permit.

## 33. Do you use soft deletes?

> Selected records such as students and permits use soft deletion so historical references can be preserved. That supports traceability, but retention policies still need to define when old data should be permanently removed.

## 34. How would you back up the system?

> A production plan should include automated PostgreSQL backups, protected media backups, encryption at rest, retention rules, and tested restoration. A backup that has never been restored in a test is not enough evidence of recoverability.

---

# Permit and payment workflow

## 35. Explain the permit request flow.

> The student creates a request for an academic period. The backend applies request and eligibility rules, creates a pending payment, and initializes Paystack. After payment, the backend verifies the transaction. A verified request is issued automatically or held for review when the rules require it.

## 36. Why is the payment redirect not trusted?

> A browser can be closed, manipulated, or redirected with arbitrary query values. The callback reference is only used to ask Paystack for the real transaction status from the server. Permit issuance depends on that verified response.

## 37. How is the Paystack webhook secured?

> The webhook validates the `x-paystack-signature` using HMAC SHA-512 over the raw request body and the configured secret. CSRF protection is excluded only for that signed webhook path because Paystack is not a browser session.

## 38. What is idempotency in this project?

> Repeating the same successful operation should not create another result. If payment verification runs again, the code checks whether the payment is already successful and whether a permit is already linked. The completion action also returns an already issued request instead of issuing again.

## 39. What if the webhook arrives before the callback?

> Both routes verify with Paystack and reuse the same actions. The database transaction, status checks, row locks, and existing permit link make the result safe when the messages arrive in either order.

## 40. What if the webhook never arrives?

> The callback or the mobile verification endpoint can reconcile the payment. An authorized administrator can also retry verification. All of those paths reuse server-side Paystack verification rather than manually marking the payment as successful.

## 41. What if Paystack reports failure?

> The payment and permit request move through the failure handling path, and no permit is issued. The failure reason can be recorded for support and recovery without exposing Paystack secrets to the client.

## 42. Can an administrator manually issue a permit?

> Authorized operations users have a permit-issuance route, but it is protected by permissions, validation, rate limiting, audit logging, and issuance rules. A student client cannot gain that authority by exposing the button.

---

# NFC and verification

## 43. How does the phone read NFC?

> The Android app uses `react-native-nfc-manager`. It requests supported tag technologies, reads `tag.id`, removes whitespace, converts it to uppercase, and cancels the NFC request after success, cancellation, or a ten-second timeout.

## 44. Why is NFC Android-only in the current build?

> The service explicitly guards for Android, and the current native configuration was built around Android tag UID reading. iOS support would require capability, plugin, build, and reader-session work, followed by device testing.

## 45. Does NFC work in Expo Go?

> No. The NFC library contains native code, so the app must run in a compatible development client or installed native build. The service intentionally returns unsupported when it detects Expo Go.

## 46. What is stored on the NFC tag?

> The MVP reads the hardware UID. It does not write student data, a complete permit, or an NDEF profile to the tag. The backend maps the UID to an NFC card record and student.

## 47. Why hash the UID in the database?

> The UID is normalized and HMAC-hashed with SHA-256 and a secret key. That supports deterministic lookup without storing the raw UID. Only a safe last-four reference is kept for display where needed.

## 48. Why HMAC instead of normal SHA-256?

> A plain hash of a short predictable identifier can be vulnerable to precomputed guessing. HMAC includes a server-side secret, so an attacker cannot reproduce the stored value from the UID without that key.

## 49. Is hashing the same as encryption?

> No. Encryption is reversible with a key. Hashing is one-way. We use deterministic HMAC hashing because the backend needs to compare a submitted identifier with the stored value, but it does not need to recover the original UID from the database.

## 50. Explain the NFC verification sequence.

> The phone reads the UID and sends it to `/api/mobile/verification/nfc` with the user's bearer token. The request checks the `verification.perform` permission. Laravel hashes the UID, finds the card, checks that the card is active, finds the student's current permit for the active academic period, evaluates dates and status, then returns and logs the result.

## 51. What verification results can occur?

> The system can return valid, expired, revoked, invalid, not found, or card inactive, depending on the method and record state. The mobile interface maps those detailed reasons into clear allowed, warning, or denied displays.

## 52. What happens when a permit has passed its expiry date but still says active?

> The verification action compares the expiry timestamp with the current time. If the date has passed, it updates the permit to expired and returns an expired result. It does not rely only on the old status field.

## 53. What happens when the card is lost or revoked?

> The NFC card record changes from active to an inactive lifecycle state. The verification action checks the card status before checking the permit, so an inactive card is rejected even if the student still has a permit.

## 54. Why support student-number and permit-code verification too?

> They provide controlled fallback methods and help staff handle a phone or tag problem. The three methods still call backend verification actions and create logs. The fallback does not move the decision into the mobile interface.

## 55. Can a copied UID defeat the system?

> A copied UID could make a basic tag appear to reference the same backend card, so UID-only NFC is not clone-proof. The system reduces the risk by requiring an authorized verifier and checking current backend state, but a stronger deployment should consider cryptographic tags, controlled devices, or a second factor.

## 56. Why not store the full permit on the card for offline use?

> A stored permit can become stale after expiry or revocation, and exposing personal data on the tag creates privacy risk. Backend lookup gives the verifier the current decision. Offline support would need signed, short-lived data and careful synchronization rather than a permanent profile on the card.

## 57. What if two NFC scans happen at once?

> The mobile service prevents concurrent reads on one device with a shared active promise. Separate devices can verify at the same time because verification is mainly a read plus append-only logging. Any state-changing follow-up remains protected by backend authorization and transactions.

---

# Security and privacy

## 58. What security controls are implemented?

> The main controls are authenticated routes, permission checks, policies, Form Request authorization and validation, rate limits, server-side payment verification, HMAC-hashed sensitive identifiers, audit logs, restricted public payloads, and secure mobile token storage.

## 59. What is the difference between a verification log and an audit log?

> A verification log records the method, outcome, resolved records, verifier, and request context for a permit check. An audit log records sensitive system actions and changes across modules, such as issuing a permit, replacing a card, changing a role, or verifying a payment.

## 60. Why are verification logs append-only?

> They are evidence of what happened at a particular time. Editing an old verification event would weaken the audit trail. The table therefore records creation time without a normal update lifecycle.

## 61. Do logs store raw student numbers, permit codes, or UIDs?

> Verification logs store an HMAC hash of the submitted identifier and references to resolved records where available. They do not need the raw submitted identifier. Permit and card records also use hashes plus safe last-four display values.

## 62. How do you protect public data?

> Public controllers query only content that is published and public. They return explicit payloads rather than exposing full models. Drafts, internal metadata, password hashes, tokens, payment details, full permit codes, and raw UIDs stay out of public responses.

## 63. How do you prevent brute-force verification attempts?

> Verification endpoints are authenticated, permission-gated, validated, logged, and rate-limited. Mobile verification currently allows 30 requests per minute per user and IP combination. Login has a stricter limiter based on email and IP.

## 64. What are the important rate limits?

> Mobile login is 5 per minute, mobile verification is 30 per minute, mobile sensitive actions are 20 per minute, and mobile permit-request actions are 12 per minute. Public content has a higher read limit. The exact values can be tuned from operational evidence.

## 65. Does hiding a button secure an action?

> No. Hiding it improves the interface, but an attacker can still craft a request. Security comes from backend middleware, policies, and Form Request authorization.

## 66. How are passwords protected?

> Laravel stores password hashes rather than plaintext. Login uses Laravel's hash check. In production, the application also applies a stronger password rule with length, mixed case, numbers, symbols, and a compromised-password check.

## 67. How are setup links protected?

> The database stores a hash of the setup token. Tokens expire, used tokens fail, and issuing a replacement invalidates older unused tokens. The password setup is completed inside a database transaction.

## 68. What security work would still be needed before full deployment?

> We would add a formal threat review, penetration testing, token lifetime and device-revocation policy, monitoring and alerting, backup restoration tests, key rotation procedures, privacy retention rules, and stronger NFC credentials if the risk assessment requires them.

---

# Testing and quality

## 69. What kind of tests did you write?

> The Laravel suite uses Pest feature and unit tests. It covers routes, permissions, validation, database state, Inertia responses, mobile JSON contracts, payments, permit requests, NFC cards, verification, elections, public content, auditing, queues, and caching.

## 70. What do 337 tests and 1,657 assertions mean?

> A test is a scenario or behavior being exercised. Assertions are the individual checks made inside those scenarios. The figures show broad automated validation of the current build, but they do not prove every possible production condition.

## 71. Why is the current test count different from the report?

> The report contains the suite result at submission time. Development and validation continued, so the current build has more tests. We label the newer result as post-submission evidence rather than pretending it was in the submitted report.

## 72. What is the most important payment test?

> The critical cases are successful verification, failure without permit issuance, repeated verification without duplicates, and recovery through callback, webhook, mobile verification, or admin retry.

## 73. What is the most important NFC test?

> We test a registered active card with a valid permit, an unknown card, an inactive card, an expired permit, a revoked permit, and missing permit conditions. We also check authorization and logging.

## 74. What does TypeScript checking add?

> It catches incompatible data shapes, missing properties, and incorrect function usage before runtime. It does not replace API tests or device testing because a valid type can still represent wrong business behavior.

## 75. What does linting add?

> Linting catches code-quality and consistency problems in the mobile code. It is useful, but it is not proof that a feature works. We present it alongside tests, not instead of tests.

## 76. What testing is still missing?

> A full institutional rollout would need more user acceptance testing, load testing with realistic traffic, accessibility testing, penetration testing, device coverage, unstable-network testing, and a controlled physical NFC pilot.

---

# Performance, scaling, and operations

## 77. Can the system scale?

> The current architecture can scale beyond one development machine by separating the web process, queue workers, scheduler, database, and storage. Caching reduces repeated summary and public-content work. Real capacity claims would still require load testing with expected university traffic.

## 78. What is cached?

> Short-lived caches cover dashboard summaries, public content, application settings, and active academic-period lookup. Model events invalidate the affected cache after writes so users do not keep seeing stale operational summaries.

## 79. Why use queues?

> Slow background work such as notifications or media conversion should not hold open a user's request. The project is configured for database-backed queues and can move to Redis and Horizon later if throughput or monitoring needs increase.

## 80. What does the scheduler do?

> It runs recurring maintenance such as pruning and expiry-related commands. In production it must run continuously through a cron or platform scheduler alongside the queue worker.

## 81. What must be running in production?

> The Laravel web application, PostgreSQL, a queue worker, the scheduler, persistent storage or object storage, HTTPS, and monitoring. The environment also needs the correct application, hashing, NFC, and Paystack secrets.

## 82. How would you monitor the system?

> I would monitor application errors, request latency, queue failures, failed jobs, database health, payment reconciliation problems, unusual verification rates, authentication failures, storage usage, and backup status. Alerts should be tied to actions the support team can take.

## 83. What happens if the queue stops?

> Core synchronous requests may continue, but queued notifications or media tasks will build up. Monitoring should detect the backlog, and failed jobs should be reviewed or retried after the worker is restored.

## 84. What happens if the database is unavailable?

> The system cannot produce a fresh authoritative permit decision. Health checks should report the failure, the application should return a controlled error, and staff should follow a documented continuity procedure. We should not display a stale valid result as if it were current.

---

# Alternatives and design challenges

## 85. Why NFC instead of QR codes?

> NFC can make repeated staff checks faster because the user taps instead of aligning a camera. A QR code is cheaper and works on more devices, but it is easy to copy as an image. Neither basic UID nor a static QR is perfect proof, so the backend and verifier authorization still matter.

## 86. Why not put the whole project in Firebase?

> Firebase could provide authentication and real-time data quickly, but this system has many relational workflows, administrative policies, payments, academic periods, and audit requirements. Laravel with PostgreSQL gave us clearer server-controlled domain logic and relational integrity.

## 87. Why not use a separate REST backend for the website too?

> Inertia lets the dashboard use Laravel routing and authorization directly while still providing a React interface. The mobile app needs a JSON API because it is a separate native client. Building a second API layer for every dashboard page would add work without a clear project benefit.

## 88. What was the hardest technical problem?

Use your genuine experience. A safe structure is:

> The hardest part was keeping the same business state consistent across payment callbacks, the website, and the mobile app. I addressed it by moving the important rules into shared backend actions and protecting state changes with transactions, row locks, and idempotent checks.

Only use that wording if it matches the work you actually did.

## 89. What technical decision would you change?

> I would lock the API contract earlier and reduce compatibility aliases in the mobile normalizers. Supporting several historic field names helped during migration, but it can hide a mismatch between the client and backend. A versioned contract with automated schema validation would be cleaner.

## 90. What did you learn as the developer?

> I learned that completing the interface is only one part of the system. The difficult work is protecting state transitions, keeping clients consistent, handling delayed external events, and being honest about what the tests and pilot actually prove.

---

# Demonstration questions

## 91. Is the video a simulation?

> It is a recording of the prepared system workflow. It shows the administrator view, student view, and staff verification view using the same prepared permit record. We use a recording to remove network and device setup risk during the timed presentation.

## 92. Does the recorded verification prove NFC was used?

> The recorded verification demonstrates the backend-controlled staff verification result. We should describe the exact input shown. If the recording uses the student-number fallback, we must not call it an NFC scan. The NFC implementation is explained separately and requires a compatible Android build and registered tag.

## 93. Why use student-number fallback?

> It lets authorized staff retrieve the same current backend decision when the physical NFC path is unavailable. It is a fallback lookup method, not a separate validity system.

## 94. What record is used in the demo?

> It uses a seeded demonstration student and permit rather than live private student information. The visible record is only for presentation and should not be confused with the historical pilot dataset.

## 95. Why is the demo amount GHS 50 while the pilot used GHS 100?

> The GHS 50 value belongs to the current seeded demonstration record. The report's GHS 276,900 result came from 2,769 historical pilot transactions at GHS 100. They are separate datasets and we do not combine them.

---

# Questions about limitations

## 96. Is the system production-ready?

> It is implemented and suitable for a controlled demonstration and further pilot work. I would not claim full production readiness until the deployment environment, physical NFC process, monitoring, backups, security review, staff training, and support procedures are validated together.

## 97. What is the biggest technical limitation?

> UID-only NFC is not clone-proof, and online verification depends on network access. Those are known boundaries. The system reduces the risk through backend authorization and current-state checks, while a stronger rollout could add cryptographic tags, controlled devices, and carefully designed resilience.

## 98. Why was NFC not fully piloted?

> The reported pilot focused on the permit and payment workflow. A complete NFC pilot would also require enough physical tags, compatible devices, staff training, registration procedures, and controlled verification points. We should not claim those operational conditions were completed when they were not.

## 99. How would you support offline verification?

> I would not simply cache a permanent valid flag. A safer design would use a signed, short-lived verification credential with an expiry time, device authorization, local revocation limits, and synchronization when the connection returns. That requires a separate threat model and testing.

## 100. What is the next technical priority?

> First, stabilize and monitor one presentation or pilot environment. Next, run a controlled NFC trial on registered Android devices and tags. After that, use the results to decide whether stronger tag credentials, offline support, or infrastructure scaling is the most urgent investment.

---

# Private pre-defense checks for Daud

These are not talking points. They are checks to complete before the presentation.

1. Confirm the public or local backend URL used by the recorded demo.
2. Confirm the final PowerPoint and `docs/demo/videos/combined-demo.mp4` are on the presentation laptop.
3. Open the video locally and verify sound, resolution, and playback controls.
4. Keep the presentation student number `26100001` available as a fallback reference.
5. Do not expose passwords, `.env` values, Paystack secrets, token values, full NFC UIDs, or raw permit codes.
6. Remember that the mobile NFC module is Android-only and does not work in Expo Go.
7. Remember that the pilot did not fully deploy NFC.
8. Do not claim the current Sanctum token has a configured expiry; the current global expiration is `null`.
9. If permit-code verification is demonstrated, verify the mobile request field matches the backend's required `permit_code` field before the defense.
10. Some older documentation says the mobile NFC API was future work. The current route and controller code now includes `/api/mobile/verification/nfc`, so answer from the current implementation.

---

# Short phrases to avoid

Avoid saying:

- "The system is completely secure."
- "NFC cannot be copied."
- "The app verifies the permit by itself."
- "The redirect proves the payment succeeded."
- "All 2,769 permits belonged to different students."
- "The entire university used NFC in the pilot."
- "The automated tests prove there are no bugs."
- "The system is fully deployed."

Use these instead:

- "The system uses several security controls, and we have identified the remaining risks."
- "The backend returns the current permit decision to an authorized verifier."
- "Paystack is verified server-side before issuance."
- "The figures count records and transactions, not 2,769 unique students."
- "The pilot validated permit and payment operations; NFC was demonstrated separately."
- "The current build passed the verified automated suite, with further operational testing still needed."

---

# Final one-minute checklist

Before answering a technical question, ask yourself:

- Is the panel asking about the current code, the historical pilot, or a future rollout?
- Am I describing a backend rule or only something the interface displays?
- Do I have evidence for the claim?
- Is there a limitation I should state in one sentence?
- Can I answer plainly before using framework names?

You do not need to sound like you know everything. You need to show that you understand the design, can explain the decisions, and know where the system's evidence ends.
