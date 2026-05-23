# CHAPTER THREE — SYSTEM ANALYSIS AND DESIGN

## 3.1 Introduction

Chapter Two reviewed the concepts and technologies that support the development of an NFC-based student permit verification and governance management system. It examined client-server architecture, role-based access control, mobile application architecture, REST API design, digital identity verification, contactless authentication, electronic voting, payment integration, and related systems. The review showed that the proposed system should not be treated as a single-purpose permit database or an isolated NFC scanner. It requires a coordinated design that connects student records, permit workflows, payment verification, mobile access, election voting, public communication, audit logging, and reporting.

This chapter presents the system analysis and design for the proposed system. It begins by analyzing the existing manual and fragmented workflows that affect student governance operations. It then defines the system request, functional requirements, non-functional requirements, user interface requirements, hardware requirements, and software requirements. The second major part of the chapter explains the proposed architecture, database design, workflow design, mobile API structure, security design, queue and cache strategy, user interface design, and validation plan.

The purpose of system analysis is to understand the problem environment before proposing a technical solution. A system designed without careful analysis may digitize existing weaknesses instead of solving them. For example, a permit request form alone would not address payment verification, duplicate permit prevention, NFC card lifecycle management, or audit logging. Similarly, an election screen without eligibility checks would not provide adequate governance control. This chapter therefore explains why the system is designed as an integrated student governance platform rather than as a set of unrelated tools.

System design translates the analysis into a structured technical plan. The design presented in this chapter uses a centralized Laravel backend, an operations dashboard, a public portal, a mobile application supported through a Sanctum-protected mobile API, PostgreSQL data storage, Paystack payment verification, NFC-based and non-NFC verification methods, audit logging, and queue/cache infrastructure. These design choices are based on the problems identified in Chapter One and the theoretical and technological review presented in Chapter Two.

The chapter avoids implementation-level code discussion. Detailed code snippets, screenshots, test outputs, and deployment evidence will be presented in Chapter Four. The focus here is on system structure, design reasoning, workflows, security boundaries, and the relationship between the major modules.

## 3.2 Analysis of Existing System

The existing system, as analyzed for this project, is a manual and fragmented student governance process. It depends on physical documents, informal communication channels, manual verification, separate payment evidence, and limited operational reporting. These processes may work in small or low-volume situations, but they become weak when student numbers, permit requests, payment records, elections, and verification activities increase.

The main weakness of the existing approach is not the absence of effort by users. Staff and SRC executives may still perform their duties carefully. The problem is that the process does not provide a unified source of truth for student governance operations. Permit records, payment records, student identity details, election information, and public announcements may exist in different places. As a result, verification and reporting depend on manual reconciliation.

### 3.2.1 Existing manual processes

#### Manual permit issuance workflow

In the manual permit issuance workflow, a student typically initiates a permit request by contacting an SRC officer, visiting an office, filling a paper form, or submitting details through an informal channel. The student may then be required to provide proof of payment or wait for an officer to confirm payment. Once the officer is satisfied, the permit may be written, printed, stamped, signed, or recorded in a register.

This workflow is understandable because it reflects how many institutions begin administrative processes. It requires little technical infrastructure and can be handled by officers who are familiar with paper records. However, it creates several operational weaknesses. The first weakness is the separation between request, payment, and issuance. A student may submit a request in one place, pay through another channel, and receive a permit through a third process. If any part is delayed or incorrectly recorded, the permit status becomes unclear.

The second weakness is duplicate prevention. In a manual workflow, preventing a student from receiving more than one active permit for the same academic period depends on careful checking. If registers are incomplete, if different officers issue permits at different times, or if previous permits are not easy to search, duplicate active permits may be issued. This weakens the integrity of the permit system.

The third weakness is traceability. A manual permit may show that it was issued, but it may not reliably show who issued it, what payment record was used, whether the student had an active permit already, or whether the permit was later revoked. These details matter when students raise disputes or when executives need to review permit operations.

Figure 3.1 should represent the existing manual permit issuance workflow. It should show the student request, manual payment confirmation, officer review, permit recording, and physical permit delivery.

[INSERT FIGURE — Existing Manual Permit Issuance Workflow]

Figure 3.1: Existing Manual Permit Issuance Workflow

The workflow shown in Figure 3.1 explains why the proposed system separates request creation, payment verification, permit issuance, and audit logging as distinct but connected steps.

#### Manual student verification workflow

Manual student verification depends on visual inspection, physical permits, printed lists, handwritten registers, or direct confirmation from an officer. During an examination, SRC activity, or security check, a verifier may ask a student to present a permit or student identity card. The verifier may then compare the details with a paper list or decide based on the visible permit.

This approach can be slow and inconsistent. A verifier may not know whether a permit has expired, whether it was revoked, whether the student has a valid permit for the current academic period, or whether the permit was issued after a verified payment. If the verifier has no access to the latest permit records, the decision depends heavily on the document presented by the student.

Manual verification also creates limited audit evidence. When a student is verified, there may be no record of the verification attempt, the method used, the result, the verifier, or the time. This makes it difficult to review patterns of invalid permits, repeated failed checks, or suspicious attempts. In a governance system, verification should produce evidence instead of ending as a momentary decision.

The proposed system responds to this weakness by supporting verification through student number, permit code, and NFC UID. Each verification attempt is designed to produce a normalized result and an audit-friendly verification log without storing raw sensitive identifiers.

#### Existing communication workflow

Student governance communication often relies on notice boards, messaging groups, social media posts, forwarded documents, and verbal announcements. These channels are convenient in some situations, but they are not always reliable as official records. A notice may be missed by students who are not physically present. A message in a group may be forwarded without context. A document link may expire or become difficult to locate later.

The communication workflow becomes more problematic when announcements, events, documents, executive profiles, and election information are not maintained in a structured public portal. Students may not know whether a message is official, current, or complete. SRC executives may also struggle to show a consistent archive of published information.

The proposed system includes a public portal to address this issue. The public portal is designed to expose only published and public records, while internal drafts, archived content, and administrative metadata remain within the dashboard. This separation supports communication without weakening internal data protection.

#### Existing election workflow

The existing election workflow may involve manual nomination, candidate screening, ballot preparation, voting, counting, and result announcement. In a manual process, election officials may need to confirm eligibility using student records or permit evidence. They may also need to ensure that a student votes only once. These checks become difficult if voter lists are outdated or if the voting process is not connected to current student records.

Manual elections have the advantage of visibility when well organized. Students can observe ballot boxes and counting processes. The weakness is that manual processes can be slow and difficult to audit afterward. It may be hard to prove that every voter was eligible, that duplicate voting did not occur, or that candidate approval status was consistently applied.

The proposed system treats election voting as a controlled student governance workflow. Elections have lifecycle states, candidates require approval, students vote once per position, and vote records are immutable. Election eligibility is also linked to student account and permit status, because the system is designed for student governance participation rather than anonymous public polling.

#### Existing student identity management workflow

Student identity management in a manual or fragmented environment may depend on student numbers, physical cards, separate lists, emails, and informal confirmation. A student may be known to one officer but not properly linked to a system account. A student may have a permit record but no activated user account. A card may exist without a clear lifecycle status. These gaps make identity verification difficult.

The proposed system separates related identity concerns while keeping them connected. A student record represents the student. A user account represents system login access. A permit represents authorization for a given academic period. An NFC card represents a physical verification token linked to a student. A verification log represents a recorded check. This distinction is important because each record has a different purpose and lifecycle.

### 3.2.2 Problems with existing system

The existing system has several problems that affect efficiency, accountability, security, and student experience. These problems are related, so solving only one of them would not be sufficient.

#### Permit fraud and duplicate permits

Permit fraud can occur when a permit is forged, altered, reused, expired, or presented by someone other than the rightful holder. Manual verification makes fraud harder to detect because the verifier may not have immediate access to the current permit record. Duplicate permits may also be issued when officers cannot easily confirm whether a student already has an active permit for the academic period.

The proposed system addresses this by centralizing permit records and blocking duplicate active permits for the same student and academic period. The design stores permit codes as protected hashes and exposes only safe display values such as last-four support references. This means that verification depends on backend records rather than visual trust in a physical document alone.

#### Impersonation and weak identity checks

Impersonation becomes possible when student identity is verified only through visible details on a card or permit. A person may present another student's permit, use an outdated card, or rely on the verifier's inability to confirm the record. Manual processes may also fail to detect whether a card has been lost, replaced, or revoked.

The proposed design connects NFC cards to student records and card lifecycle states. Only active cards are valid for NFC verification. Lost, revoked, replaced, damaged, or inactive cards should not verify as valid. This reduces dependence on visual inspection and strengthens the link between the physical card and the current backend record.

#### Delayed verification

Manual verification is slow because it often requires searching through paper records, checking student details by hand, or contacting another officer. During periods of high student traffic, delays can disrupt examinations, events, or SRC operations. Delays also encourage shortcuts, such as accepting permits without full confirmation.

The proposed system supports faster verification through NFC scan, permit code, and student number checks. The verifier receives a normalized result such as valid, invalid, expired, revoked, or not found. This design reduces the time needed to determine whether a permit is acceptable.

#### Fragmented governance operations

Permit management, payment confirmation, announcements, elections, documents, and reports may be handled through different tools or manual records. Fragmentation creates inconsistent information and repeated data entry. A student may be known in a permit register but absent from an election list. A payment may be successful but not reflected in a permit request. An announcement may be shared in one channel but not available as an official public record.

The proposed system is designed as a student governance platform because these workflows are operationally connected. A single backend can coordinate students, permits, payments, NFC cards, verification logs, content, elections, audit logs, and reports. The design does not require every user to access every module, but it ensures that related modules share consistent records.

#### Poor election management

Manual election management can become difficult when eligibility checks, candidate approval, vote casting, and result visibility are handled separately. Duplicate voting and unclear eligibility rules can lead to disputes. Manual counting can also delay results and make later review difficult.

The proposed election design uses lifecycle states for elections, candidate approval statuses, one vote per student per position, and immutable vote records. Results are visible only when configured. These decisions help preserve election integrity without turning the election module into an informal poll.

#### Lack of centralized audit trails

Manual systems often fail to record who performed sensitive actions and when those actions occurred. Permit issuance, payment verification, NFC card replacement, candidate approval, and verification checks should be traceable. Without audit logs, it is difficult to investigate disputes or identify operational misuse.

The proposed system includes audit logging as a cross-cutting design concern. Audit logs record important operational events, affected records, actors, timestamps, and safe metadata. Verification logs also record every verification attempt without storing raw submitted identifiers. This supports accountability while protecting sensitive data.

#### Weak reporting visibility

SRC executives and administrators need reports on students, permits, payments, NFC cards, verification attempts, and permit request recovery states. In the existing approach, these figures may be spread across registers, spreadsheets, receipts, and messages. Producing a report becomes slow and may depend on manual counting.

The proposed design includes a reporting module and dashboard summary. Reports use existing operational records to show counts and warnings such as pending setup accounts, active or expired permits, pending payments, failed verification attempts, stuck permit requests, and paid but unissued permit requests. The design is intentionally operational rather than analytics-heavy at this stage.

#### Lack of mobile accessibility

Students increasingly expect services to be accessible through mobile devices. If permit requests, payment status checks, election voting, and governance content are available only through physical offices or desktop systems, access becomes inconvenient. Staff may also need mobile verification during field operations.

The proposed system includes a mobile application supported by a Sanctum-protected mobile API. Students can access their own profile, permits, permit requests, NFC card information, content, and elections. Staff and authorized users can access selected operations such as verification, permit issue options, and NFC card management through controlled mobile endpoints.

#### Disconnected communication systems

Student governance communication loses reliability when announcements, events, documents, executive information, and election updates are scattered across informal channels. Students may receive incomplete or outdated information. The SRC also lacks a structured public archive of official content.

The proposed public portal addresses this by exposing only published and public records. It provides a formal channel for announcements, events, documents, executives, election information, and self-service permit requests. Internal and draft content remain inside the dashboard.

### 3.2.3 System request definition

The system request defines what Knutsford University and the SRC require from the proposed system. The request is for a centralized student governance platform that can manage permit issuance, student verification, payment verification, NFC card lifecycle, public communication, election voting, audit logging, reporting, and mobile access.

The institution needs a system that can provide a reliable source of truth for permit and verification workflows. A student record should be connected to permits, permit requests, payments, NFC cards, user accounts, verification logs, and election participation where applicable. This does not mean all records are identical. It means that related records must be traceable through clear relationships.

The proposed system must solve the problems of manual verification, duplicate permit risk, weak payment traceability, fragmented communication, disconnected election management, and poor auditability. It must provide controlled access so that students, executives, staff, and administrators interact with the system according to their responsibilities.

Operationally, the system is expected to support the following:

- authenticated dashboard access for administrators, staff, and executives;
- public access to published governance information and self-service permit request pages;
- mobile access for students and authorized staff through a mobile API;
- permit issuance, revocation, duplicate prevention, and verification;
- self-service permit requests with server-side payment verification;
- NFC card registration, replacement, revocation, and verification;
- election setup, candidate approval, student voting, and result visibility;
- audit logging for sensitive actions;
- operational reporting and dashboard summaries;
- security boundaries between public, dashboard, and mobile access.

The system also needs to be designed for growth. It should support future improvements such as push notifications, offline verification, exports, advanced analytics, QR fallback verification, and broader institutional integrations. The first design, however, should remain focused enough to be implemented and tested within the final year project scope.

Security expectations are central to the system request. Public users should not access dashboard records. Students should not see other students' permit records. Staff should not manage roles unless assigned permission. Raw NFC UIDs, full permit codes, password hashes, token hashes, and internal payment metadata should not be exposed. Payment verification should occur server-side, and election voting should enforce eligibility rules.

Scalability expectations are moderate and realistic. The system should support the current institutional use case with a path to higher volume through queue workers, cache improvements, database indexing, and optional future Redis/Horizon support. The design should avoid premature complexity while still making future scaling possible.

## 3.3 Analysis of Proposed System

The proposed system is a centralized student governance platform with three main access surfaces: an operations dashboard, a public portal, and a mobile application supported by a mobile API. The backend coordinates these surfaces and enforces the business rules. The design is based on the principle that sensitive workflow decisions should be made on the server, not inside the user interface.

The system connects student management, permit management, self-service permit requests, payment verification, NFC card management, verification, elections, polling, public content, audit logging, reporting, and mobile access. The following subsections define the requirements that guide the design.

### 3.3.1 Functional requirements

Functional requirements describe what the system must do. The proposed system contains several modules, but the modules are connected through shared student, user, permit, payment, and audit records.

Table 3.1 summarizes the major functional requirements of the proposed system. The table is intentionally organized by module so that later design and testing can trace each requirement to a system area.

Table 3.1: Functional Requirements of the Proposed System

| Requirement ID | Module | Requirement Description |
| --- | --- | --- |
| FR-01 | Authentication and authorization | The system shall authenticate dashboard users through secure login and restrict dashboard access to verified authenticated users. |
| FR-02 | Authentication and authorization | The system shall support role-based access control for administrators, staff, executives, and students. |
| FR-03 | Authentication and authorization | The system shall support account activation through setup-password links for created users and linked student accounts. |
| FR-04 | Student management | The system shall allow authorized users to create, view, update, search, and manage student records. |
| FR-05 | Student management | The system shall link student records to user accounts where account activation is required. |
| FR-06 | Permit management | The system shall allow authorized users to issue permits to eligible students. |
| FR-07 | Permit management | The system shall prevent duplicate active permits for the same student and academic period. |
| FR-08 | Permit management | The system shall support permit revocation and record revocation details. |
| FR-09 | Permit management | The system shall track permit validity using status, start date, expiry date, academic period, and issuing user. |
| FR-10 | Self-service permit requests | The public portal shall allow students to initiate permit requests through student lookup or provisional student creation. |
| FR-11 | Self-service permit requests | The mobile application shall allow linked authenticated students to create permit requests using their own student profile. |
| FR-12 | Self-service permit requests | The system shall block checkout when a student already has an active permit or open request where applicable. |
| FR-13 | Payment integration | The system shall initialize Paystack payment for eligible permit requests. |
| FR-14 | Payment integration | The system shall verify payment server-side before completing permit issuance. |
| FR-15 | Payment integration | The system shall support callback, webhook, mobile verification, and admin retry verification flows. |
| FR-16 | Payment integration | The system shall prevent duplicate permit issuance when callbacks or webhooks repeat. |
| FR-17 | NFC card management | The system shall register NFC card UIDs to students without storing raw UID values. |
| FR-18 | NFC card management | The system shall enforce one active NFC card per student. |
| FR-19 | NFC card management | The system shall support card replacement, lost-card reporting, revocation, and lifecycle status changes. |
| FR-20 | Verification system | The system shall verify students by student number, permit code, and NFC UID. |
| FR-21 | Verification system | The system shall record every verification attempt without storing raw submitted identifiers. |
| FR-22 | Elections and voting | The system shall support election setup, election lifecycle states, positions, candidates, and result visibility. |
| FR-23 | Elections and voting | The system shall require candidate approval before a candidate can receive votes. |
| FR-24 | Elections and voting | The system shall enforce one vote per student per position and store votes as immutable records. |
| FR-25 | Elections and voting | The system shall restrict voting to eligible students with active accounts and required permit status. |
| FR-26 | Polling | The system shall support polls separately from formal elections. |
| FR-27 | Public portal | The public portal shall display only published public announcements, events, documents, executives, and permitted election information. |
| FR-28 | Content management | Authorized dashboard users shall manage announcements, events, documents, and media according to visibility and publication rules. |
| FR-29 | Audit logging | The system shall record sensitive operational actions such as permit issuance, payment changes, NFC card changes, verification, content publishing, and election voting. |
| FR-30 | Reporting | The system shall provide operational counts and warnings for students, permits, payments, NFC cards, verification, and permit requests. |
| FR-31 | Mobile application | The mobile application shall allow students to access profile, permit, permit request, content, NFC card, and election functions. |
| FR-32 | Mobile API | The mobile API shall expose authenticated JSON endpoints for student, content, permit request, election, verification, and staff operation workflows. |
| FR-33 | Mobile API | The mobile API shall return paginated responses where lists may grow beyond a single page. |
| FR-34 | Mobile API | The mobile API shall protect staff operation endpoints using backend permissions. |

#### Authentication and authorization requirements

The system requires two authentication boundaries. Dashboard access uses session-based authentication for users who operate administrative and governance functions. Mobile access uses bearer token authentication through Sanctum. Public portal access is generally unauthenticated, except that self-service permit request actions must still be validated and rate limited.

Authorization must be role and permission based. The design separates students, staff, executives, and administrators because these users have different responsibilities. Students should access their own profile, permits, permit requests, NFC card information, and elections. Staff may perform verification and operational actions based on assigned permissions. Executives may manage governance content and view reports depending on role configuration. Administrators manage sensitive settings, roles, and broad system operations.

This design is necessary because frontend visibility alone is not enough. A button may be hidden from a user interface, but the backend must still enforce authorization when a request is submitted. Therefore, policies, form request authorization, and middleware are part of the functional design.

#### Student management requirements

Student management provides the foundation for the other modules. The system must maintain student records with identifiers such as student number, name, contact details, course, level, account link, and verification status where applicable. Student records support permit issuance, permit requests, NFC card assignment, election eligibility, and reporting.

The design separates student records from user accounts. A student record may exist before the student has activated a system account. This is important because the dashboard may manage institutional student data while mobile application access requires a login account. Account activation links the student record to a user account and assigns the student role.

#### Permit management requirements

Permit management requires controlled issuance, revocation, validity tracking, duplicate prevention, and verification support. A permit belongs to a student and academic period. It includes validity dates, status, issuing user, payment-related values, and a protected permit code reference.

The system must not store plaintext permit codes. A permit code should be generated once, shown once where appropriate, and stored only as a secure hash with a last-four display value. This design supports verification while reducing the risk of exposing full codes.

Duplicate prevention is a core requirement. A student should not receive multiple active permits for the same academic period. This rule must be enforced in the backend action that issues permits rather than only in the user interface, because permit issuance may be triggered from dashboard, payment completion, mobile operation, or recovery workflows.

#### Self-service permit request requirements

The self-service workflow allows students to request permits without dashboard access. The public flow supports student lookup by student number. If the student exists, the system displays only a masked preview and allows missing contact details to be completed. If the student does not exist, the system can create a provisional student record that requires admin review after payment.

The mobile self-service flow is stricter. It is available only to authenticated students with linked student profiles. Unknown or unlinked students are directed to the public website flow, where provisional records can be reviewed safely. This distinction is important because mobile authentication assumes the system already knows the student account.

Self-service requests must include expiry and recovery handling. A request may await payment, become paid, require review, be issued, fail, be cancelled, or expire. These states allow administrators to resolve incomplete or disputed workflows.

#### Payment integration requirements

Payment integration supports permit requests by initializing Paystack checkout and verifying payment status. The system must not issue a permit based only on a browser redirect. It must verify the transaction directly with Paystack using server-side logic.

The system must handle callbacks, webhooks, and mobile verification because payment events can arrive in different ways. A callback may occur when the student returns from checkout. A webhook may arrive server-to-server from Paystack. A mobile application may call verification after the student returns to the app. An administrator may retry verification when a request is stuck. All these paths should reuse the same verification and completion logic.

Idempotency is required. If Paystack sends repeated webhook events or if a user retries verification, the system should not issue duplicate permits. This is achieved by locking relevant records during verification and by reusing the permit issuance rule that blocks duplicate active permits.

#### NFC card management requirements

NFC card management includes registration, replacement, lost-card handling, revocation, and status tracking. A student should have only one active NFC card at a time. When a new card is registered, any previous active card for that student should be replaced.

Raw NFC UID values must not be stored. The system should normalize the submitted UID, store an HMAC hash, and keep only a last-four display value for support. This allows the system to compare future scans while avoiding unnecessary exposure of raw UID values.

The card lifecycle is important. Verification should accept only active cards. Lost, stolen, revoked, damaged, inactive, or replaced cards should not verify as valid. This prevents the system from treating a card tap as valid simply because the card existed at some point.

#### Verification system requirements

The verification system must support student number, permit code, and NFC UID methods. These alternatives are necessary because NFC may not always be available, and a verifier may need a fallback method. Each method should produce a normalized result such as valid, invalid, expired, revoked, not found, or error.

Every verification attempt must be logged. Verification logs should include method, result, hashed identifier, reason, resolved student where available, resolved permit where available, verifier, IP address, user agent, and created timestamp. Raw submitted identifiers should not be stored.

#### Elections and voting requirements

The election module must support election lifecycle states, positions, candidates, candidate approval, voting, and result visibility. Only approved candidates should be returned for voting. Votes should be immutable, and a student should vote only once per position.

Eligibility is a design requirement, not an optional enhancement. A student must have a linked profile, active user account, and active permit for the election academic period where required. The election must also be active and within its voting window. These checks protect election integrity and distinguish election voting from ordinary polls.

#### Public portal and content requirements

The public portal must expose official governance content without exposing dashboard data. Public content includes announcements, events, documents, executive profiles, and public election information. Only published and public records should be shown. Draft, archived, internal, unpublished, and scheduled content should not appear publicly before the allowed time.

This design protects the public/private boundary while giving students a formal channel for SRC information. It also supports the mobile content API, which reuses the same visibility rules while returning JSON resources instead of dashboard payloads.

#### Audit logging and reporting requirements

Audit logging is required for sensitive operations. The system should record actions such as student account activation, permit issuance and revocation, payment success or failure, permit request recovery, NFC card registration and replacement, verification attempts, content publication, and election voting.

Reporting should provide operational summaries rather than advanced analytics in the first version. Reports should show counts and warnings that help SRC executives and administrators identify operational issues, such as students without activated accounts, permits nearing expiry, pending payments, failed verification attempts, and paid but unissued permit requests.

### 3.3.2 Non-functional requirements

Non-functional requirements describe how the system should behave. These requirements are important because the proposed platform handles sensitive student records, payment workflows, verification events, elections, and public information.

Table 3.2 summarizes the non-functional requirements.

Table 3.2: Non-Functional Requirements of the Proposed System

| Requirement Area | Requirement Description | Relevance to the Proposed System |
| --- | --- | --- |
| Security | The system must protect authentication, authorization, sensitive identifiers, payment data, and public/private boundaries. | Prevents unauthorized access to permits, payments, verification logs, elections, and dashboard records. |
| Scalability | The system should support growth through a centralized backend, queue workers, caching, pagination, and database optimization. | Allows the platform to handle more students, content, requests, and verification activity over time. |
| Reliability | Core workflows should avoid partial updates and inconsistent records. | Permit issuance, payment verification, and election voting require dependable state changes. |
| Maintainability | The system should separate interface, validation, authorization, and business logic. | Makes future changes easier without duplicating rules across dashboard, public, and mobile flows. |
| Availability | The system should be deployable with queue workers, scheduler, database, storage, and HTTPS. | Supports continuous access to dashboard, public portal, mobile API, and background tasks. |
| Performance | The system should use pagination, caching, and background jobs where appropriate. | Reduces delays in dashboard summaries, public content, mobile lists, and notification work. |
| Usability | Interfaces should be role-specific, clear, and suitable for the task being performed. | Students, executives, staff, and administrators have different workflows and information needs. |
| Data integrity | The system should enforce relationships, uniqueness, transactions, and validation rules. | Prevents duplicate active permits, duplicate votes, invalid payment completion, and orphaned records. |
| Auditability | Sensitive actions should be traceable through audit logs and verification logs. | Supports accountability and dispute review. |
| Mobile responsiveness | Mobile workflows should use secure token authentication and lightweight JSON resources. | Supports student access and staff verification outside desktop environments. |

#### Security

Security is a primary requirement because the system manages student records, permit codes, NFC UIDs, payments, elections, and audit logs. The design protects security through authentication boundaries, RBAC, backend authorization, request validation, rate limiting, token hashing, permit code hashing, NFC UID hashing, and careful public/private data separation.

The public portal exposes only published public data. The dashboard requires authenticated and verified users. The mobile API requires Sanctum bearer tokens. This separation reduces the chance that internal records are exposed through public pages or mobile resources.

#### Scalability

The system is designed for moderate institutional growth. It does not begin with overly complex infrastructure, but it includes a path to scale. Database-backed queues and cache are used by default, with a future path to Redis and Horizon if traffic or queue volume increases. Pagination is used for mobile and dashboard lists where records may grow. Caching is used for dashboard summaries, public content, settings, and active academic period lookup.

This design is appropriate because a final year project should avoid unnecessary infrastructure complexity while still respecting growth requirements.

#### Reliability

Reliability is critical in payment, permit, and election workflows. If a payment is verified but permit issuance fails, the system must preserve enough state for recovery. If a webhook is repeated, it should not issue a duplicate permit. If a student casts a vote, the system should prevent the same student from voting again for the same position.

The proposed design uses transactions, idempotent workflows, unique constraints, and recovery states to reduce inconsistent outcomes. This is particularly important for permit request completion and election voting.

#### Maintainability

The system must remain understandable as modules increase. A design that places all rules inside page controllers or frontend components would become difficult to maintain. The proposed design keeps business rules in backend actions, authorization in policies and form requests, interface logic in dashboard/mobile components, and persistent state in models and database tables.

This separation allows the same permit issuance or payment verification logic to be reused from dashboard, public, and mobile workflows.

#### Performance

Performance requirements include fast verification response, paginated mobile lists, responsive dashboard pages, and efficient public content loading. The system uses caching for repeated summaries and public content where appropriate. It uses queue workers for work that should not delay the user-facing request.

Performance must not weaken correctness. Payment verification, voting eligibility, and permit validity should use authoritative records rather than stale cache values unless the cache strategy explicitly accounts for freshness.

#### Usability

Usability is required across dashboard, public portal, and mobile application. Dashboard users need efficient tables, filters, dialogs, and status indicators. Students need simple permit request and election voting screens. Verifiers need direct feedback that clearly states whether a permit is valid, expired, revoked, invalid, or not found.

The public portal should be accessible and easy to navigate because it represents official SRC communication. Mobile screens should avoid exposing unnecessary administrative detail.

#### Data integrity

Data integrity supports trust in the system. Permit issuance should respect academic periods and duplicate prevention. NFC card registration should enforce one active card per student. Election voting should enforce one vote per student per position. Payment verification should update payment and permit request states consistently.

The proposed design uses database relationships, constraints, validation, and transactions to preserve this integrity.

#### Auditability

Auditability is treated as a design requirement because the system supports governance operations. Sensitive actions should be traceable. Audit logs and verification logs should preserve operational evidence without exposing raw secret identifiers. This helps administrators review disputes, detect misuse, and understand operational patterns.

### 3.3.3 User interface requirements

The system has three main user interface contexts: the operations dashboard, the public portal, and the mobile application. Each interface must support different users and responsibilities.

#### Dashboard usability

The operations dashboard is used by administrators, staff, and SRC executives. It must support repeated operational work rather than casual browsing. Dashboard screens should include search, filters, status indicators, action dialogs, confirmation prompts, and detail views. Users should be able to manage students, permits, payments, permit requests, NFC cards, elections, content, reports, roles, and audit logs from structured pages.

The dashboard should not rely only on frontend hiding for security. Navigation filtering improves usability, but backend policies remain authoritative. The interface should therefore match the user's role while the backend enforces the final permission decision.

#### Mobile usability

The mobile application must support student-centered and staff-centered workflows. Students need quick access to permit status, permit request options, payment progress, announcements, events, documents, executive information, elections, and NFC card status. Staff users may need verification and selected operational functions.

Mobile screens must be concise because the display area is limited. Long administrative tables should be avoided in student screens. Lists should be paginated or filtered. Errors such as unauthenticated, forbidden, validation failed, not found, or rate limited should be handled clearly.

#### Verification workflow usability

Verification interfaces must reduce decision time. A verifier should be able to submit student number, permit code, or NFC UID and receive a clear result. The result should identify the method, status, reason, resolved student where available, and permit summary where available. It should not display raw submitted identifiers in logs.

The interface should distinguish valid, expired, revoked, invalid, not found, and error states using clear labels. This prevents users from treating all failed outcomes as the same problem.

#### Public portal accessibility

The public portal should provide a simple and official communication channel. It should separate public information from dashboard operations. Students and visitors should be able to view published announcements, events, documents, executive profiles, public election information, and permit request pages without accessing internal administrative screens.

The portal should not expose draft, archived, internal, unpublished, or administrative metadata. This is both a usability and security requirement.

#### Role-specific interfaces

Different roles require different interface priorities. Students need personal service access. Staff need verification and operational actions. Executives need governance content and reporting visibility. Administrators need management access across users, roles, settings, and sensitive workflows. The design should prevent users from seeing unnecessary complexity.

### 3.3.4 Hardware requirements

The hardware requirements for the proposed system are realistic for an institutional web and mobile platform. The system does not require specialized server hardware for the first deployment, but it requires reliable hosting and compatible mobile devices for NFC workflows.

Table 3.3: Hardware Requirements

| Hardware Component | Minimum Requirement | Purpose |
| --- | --- | --- |
| Application server | VPS or equivalent hosting environment with sufficient CPU, memory, and storage for Laravel, queue worker, scheduler, and web server | Hosts the backend, dashboard, public portal, and mobile API. |
| Database server | PostgreSQL-capable server; may run on the same VPS for small deployment or separate server for production growth | Stores student, permit, payment, NFC, election, audit, and content records. |
| Administrator workstation | Desktop or laptop with a modern browser and internet access | Used for dashboard administration and reporting. |
| Staff verification device | Laptop, tablet, or smartphone with browser/API access | Used for permit verification and staff operations. |
| NFC-capable Android device | Android smartphone with NFC support | Used for mobile-assisted NFC card scanning and verification. |
| Student smartphone | Android or iOS smartphone capable of running the mobile application | Used for student mobile access, permit requests, and election voting. |
| Internet connection | Stable connection for server and users | Required for dashboard, mobile API, public portal, payment verification, and reporting. |
| NFC cards | Compatible NFC cards or tags | Used as physical verification tokens assigned to students. |
| Optional backup storage | External or cloud backup target | Supports database and media backup strategy. |

NFC-capable Android devices are listed because Android commonly provides broader NFC reading support for custom mobile workflows. Other mobile platforms may support selected NFC features depending on device and operating system restrictions. Because of these differences, the system includes permit code and student number verification as fallback methods.

### 3.3.5 Software requirements

The software requirements reflect the project's backend, frontend, mobile, data, authentication, payment, queue, and security needs.

Table 3.4: Software Requirements

| Software Component | Purpose in the Proposed System |
| --- | --- |
| Laravel | Backend framework for routing, controllers, validation, authorization, actions, queues, API endpoints, and dashboard/public integration. |
| PHP | Server-side programming language used by Laravel. |
| PostgreSQL | Relational database for student, permit, payment, NFC, election, content, audit, and verification records. |
| React | Component-based frontend library used for dashboard and public interfaces. |
| Inertia.js | Connects Laravel routes to React pages without requiring a completely separate dashboard API. |
| TypeScript | Provides typed frontend development for dashboard and mobile-related code. |
| Tailwind CSS | Utility-first styling for dashboard and public portal interface consistency. |
| Expo React Native | Cross-platform mobile application framework for student and staff mobile workflows. |
| Laravel Sanctum | Token-based authentication for mobile API requests. |
| Laravel Fortify | Authentication support for dashboard login and related account flows. |
| Spatie Permission | Role and permission management for RBAC. |
| Spatie Media Library | Media and file handling for announcements, events, documents, candidates, and related content. |
| Paystack API | Payment initialization, callback handling, webhook handling, and server-side transaction verification for permit requests. |
| Queue system | Background processing for notifications, media conversions, future imports/exports, and long-running tasks. |
| Cache system | Dashboard summaries, public content payloads, settings, and active academic period lookups. |
| Web server with HTTPS | Secure delivery of dashboard, public portal, webhook endpoint, and mobile API. |

The software stack is selected to support the system's integrated design. Laravel provides the backend structure. React and Inertia.js support dashboard interactivity without separating the dashboard entirely from backend authorization. Expo React Native supports mobile access. PostgreSQL supports relational integrity. Sanctum secures mobile requests. Paystack supports payment verification. Queue and cache systems support responsiveness and operational growth.

## 3.4 Design and Architecture of Proposed System

The proposed architecture is designed around one central idea: all sensitive decisions should pass through the backend. The dashboard, public portal, and mobile application are access surfaces, but they do not independently decide whether a permit is valid, whether a payment succeeded, whether a student may vote, or whether a user may perform an administrative action.

The system uses a Laravel backend with domain actions, policies, form requests, Eloquent models, queue workers, cache support, and audit logging. The dashboard uses Laravel, Inertia.js, React, TypeScript, and Tailwind CSS. The public portal uses separate public routes and public visibility rules. The mobile application communicates through a Sanctum-protected JSON API. Paystack handles payment checkout and transaction verification. PostgreSQL stores the authoritative records.

### 3.4.1 Overall system architecture

The overall system architecture connects the operations dashboard, public portal, mobile application, Paystack payment gateway, PostgreSQL database, queue workers, cache, media storage, and audit logs through a centralized Laravel backend. This design is shown in Figure 3.2.

[INSERT FIGURE — Overall System Architecture]

Figure 3.2: Overall System Architecture

Figure 3.2 should show three main access surfaces feeding into the backend: dashboard UI, public portal, and mobile API. It should also show Paystack, database, queue workers, cache, media storage, audit logs, and notification processing.

The Laravel backend is the main coordination layer. It receives requests from the dashboard, public portal, mobile API, and Paystack webhook endpoint. It validates input, checks authorization, applies domain rules, reads and writes database records, dispatches queued tasks, updates cache where appropriate, and records audit events. This design keeps workflow decisions in one place.

The dashboard is used by administrators, staff, and executives. It supports internal operations such as student management, permit issuance, payment oversight, permit request recovery, NFC card management, verification logs, elections, content management, roles, audit logs, and reports. The dashboard is protected by authentication and verification middleware. Its navigation may hide features based on permissions, but backend policies remain the final control.

The public portal is the public-facing surface. It exposes published public announcements, events, documents, executive profiles, public election information, and self-service permit request pages. The portal does not expose dashboard metadata, draft content, internal content, archived content, token hashes, payment metadata, raw identifiers, or administrative records. This separation matters because public communication should be open without making internal operations public.

The mobile application uses the mobile API. The API is protected by Sanctum bearer tokens for authenticated endpoints. Students use mobile endpoints for profile, permits, permit requests, payment verification, content, NFC card status, and election voting. Staff or authorized users use mobile operation endpoints for verification and selected permit/NFC workflows. The mobile API returns JSON resources shaped for mobile use rather than exposing dashboard payloads.

Paystack is integrated as an external payment service. The system initializes checkout, receives callbacks, receives webhooks, and verifies transaction status server-side. Paystack redirects and webhook messages do not directly issue permits. They trigger backend verification and permit request completion logic.

PostgreSQL stores the core records. These include users, students, academic periods, permits, permit requests, payments, NFC cards, verification logs, announcements, events, documents, polls, elections, votes, audit logs, cache records, jobs, and media references. The database is central to integrity because it enforces relationships and supports transactions.

Queue workers process background work such as notifications and media conversions. The scheduler handles pruning, expiry tasks, and maintenance commands. Cache is used for dashboard summaries, public content, settings, active academic period lookup, and other repeated data that can be safely cached.

This architecture was selected because the system combines several related workflows. A separated set of tools would make auditability and consistency weak. A fully client-controlled design would be unsafe for payment, verification, and election workflows. A centralized backend with multiple access surfaces provides a better balance between accessibility and control.

The architecture also supports future growth. The first deployment can use database-backed queues and cache. If traffic grows, queue and cache services can move to Redis and Horizon. The mobile API can later introduce versioning if breaking changes are needed. Additional verification methods, exports, analytics, and notification channels can be added without changing the core principle of backend-controlled workflows.

### 3.4.2 Dashboard and mobile interaction architecture

The dashboard and mobile application interact with the same backend but through different mechanisms. The dashboard uses Inertia.js pages returned through Laravel routes, while the mobile application uses JSON API endpoints under the mobile API route group. This separation is deliberate.

The dashboard is designed for internal administrative work. It needs rich pages, tables, filters, forms, and dialogs. Inertia.js is suitable because it allows Laravel to control routing, authentication, authorization, and page data while React handles interactive interfaces. This keeps dashboard workflow close to backend policies and form requests.

The mobile application requires an API because it is not rendered by Laravel. It sends requests with bearer tokens and receives JSON responses. This allows the mobile application to operate independently as a native mobile client while still relying on the backend for trusted decisions.

[INSERT FIGURE — Dashboard and Mobile Architecture]

Figure 3.3: Dashboard and Mobile Interaction Architecture

Figure 3.3 should show the difference between dashboard session access and mobile token access. It should also show that both access paths reach shared backend actions, policies, models, and database records.

Role separation is central to this architecture. Dashboard users may include administrators, staff, and executives. Mobile users may include students and selected staff. Public users may be unauthenticated. Each access channel has different expectations, but backend authorization prevents cross-boundary misuse.

Mobile synchronization is handled through API reads rather than direct database access. For example, the mobile application requests permit request detail after payment verification because callbacks and webhooks may arrive at different times. Polling or refreshing a specific endpoint allows the mobile application to display the updated state without assuming that payment completion happens instantly.

Public and private boundaries are also preserved. The public portal and mobile content endpoints reuse public visibility rules, but dashboard pages can access draft and internal content for authorized users. Mobile resources are shaped to avoid exposing internal metadata. This design avoids the common mistake of reusing dashboard data payloads directly in public or mobile contexts.

### 3.4.3 Database design

The proposed system uses a relational database design because its records have structured relationships and integrity requirements. Students, users, permits, payments, NFC cards, elections, votes, documents, and audit logs are not independent pieces of text. They form a connected operational model.

The Entity Relationship Diagram in Figure 3.4 should show the main entities and relationships in the system.

[INSERT FIGURE — Entity Relationship Diagram]

Figure 3.4: Entity Relationship Diagram of the Proposed System

Figure 3.4 should include users, students, academic periods, permits, permit requests, payments, NFC cards, verification logs, audit logs, announcements, events, documents, polls, poll options, poll votes, elections, election positions, election candidates, and election votes.

#### Relational structure and integrity

The database design uses relationships to connect records that depend on one another. A student may be linked to a user account. A permit belongs to a student and academic period. A payment may belong to a student and permit request. An NFC card belongs to a student. A verification log may resolve to a student and permit. An election belongs to an academic period, and its positions, candidates, and votes are related to that election.

These relationships allow the system to answer operational questions. For example, the system can determine whether a student has an active permit for an academic period, whether an NFC card belongs to the student, whether a permit request is paid but not issued, or whether a student has already voted for a specific election position.

Integrity constraints are important in this design. Duplicate active permits should be blocked through backend actions and supported by database discipline where applicable. Election votes should enforce one vote per student per position. NFC card hashes should be unique. Payments should have unique references. These constraints protect the system from inconsistent records.

Normalization is applied to avoid storing the same facts in many places. Student details belong to the student record. Permit validity belongs to the permit record. Payment status belongs to the payment record. Election candidates belong to election positions. Audit logs refer to the actor and affected records. This reduces duplication and makes updates safer.

Transactional consistency is required where several records change together. Permit request completion may update a payment, permit request, student review state, and permit record. Election voting inserts a vote and may need to return updated election detail. NFC replacement may deactivate an existing active card and create or activate another card. Transactions reduce the risk of partially completed workflows.

#### Core entity explanations

Table 3.5 summarizes the core data entities.

Table 3.5: Core Data Entities and Their Purposes

| Entity | Purpose |
| --- | --- |
| Users | Stores system login accounts for administrators, staff, executives, and students. |
| Students | Stores student identity and academic details used by permits, NFC cards, mobile access, and elections. |
| Academic Periods | Defines academic years or semesters used for permit validity and election eligibility. |
| Permits | Stores issued student permits, validity dates, status, hashed permit code, and issuing user. |
| Permit Requests | Stores self-service permit request lifecycle, review state, payment status, and request references. |
| Payments | Stores manual or Paystack payment records, references, status, amount, currency, and verification timestamps. |
| NFC Cards | Stores card assignment, hashed UID, last-four display suffix, lifecycle status, and assigned student. |
| Verification Logs | Stores append-only records of verification attempts by student number, permit code, or NFC UID. |
| Announcements | Stores public or internal announcements managed by authorized users. |
| Events | Stores event content, dates, publication status, visibility, and media references. |
| Documents | Stores published or internal documents and public/private media references. |
| Polls | Stores lower-risk participation questions and options separate from formal elections. |
| Elections | Stores election lifecycle, academic period, schedule, result visibility, and public information. |
| Election Positions | Stores contestable positions within an election. |
| Election Candidates | Stores candidate records, approval status, and related media. |
| Election Votes | Stores immutable vote records with student, position, candidate, and cast timestamp. |
| Audit Logs | Stores operational audit events, actors, affected records, metadata, and timestamps. |

#### Relationship explanations

The user-student relationship supports account activation. A student record can exist before login access is created. Once a student activates an account, the student record is linked to a user. This allows mobile endpoints to scope student data to the authenticated user's linked student profile.

The student-permit relationship supports permit history. A student may have permits across multiple academic periods, but the system blocks duplicate active permits for the same academic period. This preserves historical records while controlling current validity.

The permit request-payment-permit relationship supports self-service issuance. A permit request is created before payment. A payment is linked to the request. Once payment is verified and review rules are satisfied, the system issues a permit. This structure makes recovery possible when payment succeeds but issuance is delayed.

The student-NFC card relationship supports card lifecycle management. A student may have historical NFC cards, but only one should be active. Replacement and revocation preserve history rather than deleting old card records.

The verification log relationship supports auditability. A verification attempt may resolve to a student or permit, but even failed attempts should be logged with a hashed identifier. This allows the system to record both successful and unsuccessful checks.

The election relationship structure supports controlled voting. Elections contain positions. Positions contain approved candidates. Votes reference the election position, candidate, and student. A uniqueness rule on student and position prevents duplicate voting for the same position.

#### Data dictionary summary

Table 3.6 provides a brief data dictionary for important records. Detailed schema extracts can be placed in the appendix.

Table 3.6: Data Dictionary Summary

| Table | Key Fields | Design Rationale |
| --- | --- | --- |
| users | name, email, password, is_active | Separates login identity from student identity and supports staff/executive/admin accounts. |
| students | student_number, name, course, level, user_id, verification_status | Provides the central student identity record used across modules. |
| permits | student_id, academic_period_id, code_hash, code_last4, status, starts_at, expires_at | Supports permit validity without storing plaintext permit codes. |
| permit_requests | reference, student_id, status, requires_review, review_status, amount, currency | Tracks self-service request lifecycle and review state. |
| payments | reference, gateway, gateway_reference, status, amount, currency, verified_at | Tracks payment attempts and verification status. |
| nfc_cards | student_id, uid_hash, uid_last4, status, issued_at, activated_at | Supports NFC card lookup without storing raw UIDs. |
| verification_logs | method, result, identifier_hash, reason, student_id, permit_id, verifier_id | Preserves verification evidence without storing raw identifiers. |
| elections | title, status, academic_period_id, starts_at, ends_at, results_visible | Manages election lifecycle and visibility. |
| election_votes | election_position_id, election_candidate_id, student_id, cast_at | Stores immutable vote records and supports duplicate prevention. |
| audit_logs | actor_id, event, auditable_type, auditable_id, metadata, created_at | Records sensitive actions for accountability. |

The database design supports the project's main concern: reliable relationships between student governance records. Without these relationships, the system would only provide separate digital forms. With the relationships, the system can enforce workflow rules and produce meaningful reports.

### 3.4.4 Permit request and payment workflow design

The permit request and payment workflow is one of the most important parts of the proposed system. It connects student access, permit eligibility, payment verification, administrative review, duplicate prevention, and audit logging. The design avoids issuing permits based only on user-submitted payment evidence or browser redirects.

Figure 3.5 presents the overall permit request and payment workflow.

[INSERT FIGURE — Permit Request and Payment Workflow]

Figure 3.5: Permit Request and Payment Workflow

The workflow begins when a student initiates a permit request. In the public portal, the student may be found through student number lookup. If the student exists, the system displays a masked preview and allows missing contact information to be completed. If the student does not exist, the system creates a provisional student record marked for review. This design allows self-service access while preventing unknown student records from being automatically trusted.

In the mobile application, the workflow is different. Only authenticated students with linked student profiles can create mobile permit requests. Unknown students are not created through the mobile API. This restriction is intentional because mobile access assumes that the student has already been identified through account activation. Provisional record creation is safer in the public flow, where dashboard review can be required.

Before checkout, the system checks blocking conditions. If the student already has an active permit for the current academic period, checkout should be blocked. If the student already has a pending request, another request should not be created without resolving the existing one. These checks reduce duplicate records and prevent confusion.

After the request is created, a local pending payment record is created. The system initializes Paystack checkout and receives an authorization URL. The student completes payment through Paystack. The system then verifies the transaction server-side through callback, webhook, mobile verification endpoint, or admin retry verification.

Figure 3.6 focuses on the Paystack verification flow.

[INSERT FIGURE — Paystack Verification Flow]

Figure 3.6: Paystack Verification Flow

The design deliberately avoids trusting browser redirects. A redirect shows that the user returned from Paystack, but it does not prove payment success. The backend uses the payment reference to verify the transaction directly with Paystack. Only after successful verification should the local payment be marked successful.

Once payment is verified, the system attempts to complete the permit request. If the student is an existing verified student and no review is required, the permit is issued. If the request involves a provisional student record, the request remains paid but requires admin review. An authorized dashboard user must approve or reject the review. Approval verifies the student and completes permit issuance. Rejection records the decision and prevents permit issuance.

Idempotency is a major design concern. Payment callbacks and webhooks may arrive more than once or in different order. A student may also retry verification from mobile or public pages. Administrators may retry verification from the dashboard. The system therefore locks relevant payment and permit request records during verification and completion. It also reuses the same permit issuance rule that blocks duplicate active permits.

Recovery workflows are included because payment systems can fail in partial ways. A permit request may be awaiting payment, paid but not issued, failed, expired, cancelled, or requiring review. Dashboard recovery actions allow authorized users to retry payment verification, retry permit issuance, approve review, reject review, cancel the request, or mark unpaid requests as expired. Each recovery action should write an audit log.

This workflow design balances student convenience and administrative control. Students can initiate requests and payments without visiting an office, but the backend still controls payment verification, duplicate prevention, review, and issuance.

### 3.4.5 NFC verification workflow design

The NFC verification workflow is designed to make student permit checks faster while preserving security and auditability. NFC is treated as an input method for identifying a registered card, not as proof of permit validity by itself.

Figure 3.7 presents the NFC verification workflow.

[INSERT FIGURE — NFC Verification Workflow]

Figure 3.7: NFC Verification Workflow

The workflow begins with NFC card registration. An authorized staff member registers a submitted NFC UID to a student. The system normalizes the UID, hashes it using an HMAC-based approach, stores the hash, and stores only a last-four display value. The raw UID is not stored. If the student already has an active card, the previous active card is marked as replaced. This enforces the one-active-card rule.

NFC card lifecycle management includes replacement, lost-card handling, and revocation. These actions are necessary because physical cards can be lost, damaged, replaced, or misused. A lost or revoked card should not verify as valid. The card lifecycle state therefore becomes part of the verification decision.

During verification, the verifier scans or submits an NFC UID through an authorized interface. The system normalizes and hashes the submitted UID, then searches for a matching active card. If no card is found, the result is not found. If the card exists but is inactive, revoked, lost, stolen, damaged, or replaced, the result should indicate that the card is not valid for verification. If the card is active, the system resolves the linked student and checks for an active permit for the relevant academic period.

The result returned to the verifier should be clear and limited to what is necessary. A valid result may include the student's name, student number, permit status, and permit code last-four value. It should not expose the raw NFC UID or internal hashes.

Every NFC verification attempt should create a verification log. This includes failed attempts. Logging failed attempts matters because repeated attempts with unknown or inactive cards may indicate operational problems or misuse. The log stores the method, result, hashed identifier, reason, resolved student or permit where available, verifier, and request context.

The system also supports non-NFC verification through student number and permit code. This is a design tradeoff. NFC improves speed, but it depends on compatible cards, compatible devices, and reliable scanning. Permit code and student number checks provide operational continuity when NFC is unavailable.

### 3.4.6 Election and voting workflow design

The election workflow is designed to support student governance elections with stricter rules than ordinary polls. Elections affect representation, so the design emphasizes eligibility, candidate approval, duplicate prevention, vote immutability, and controlled result visibility.

Figure 3.8 presents the election voting workflow.

[INSERT FIGURE — Election Voting Workflow]

Figure 3.8: Election Voting Workflow

The election lifecycle begins in draft status. In draft status, authorized users can set up the election, define positions, add candidates, and prepare election details. The election may then become scheduled, active, closed, or archived. These statuses help separate preparation, voting, completion, and record retention.

Candidates have their own lifecycle. A candidate may be pending, approved, rejected, or withdrawn. Only approved candidates can be returned to student voters and receive votes. This prevents incomplete or rejected nominations from appearing on the ballot.

Eligibility checks occur before a vote is accepted. The system checks that the election is active, that the current time is inside the voting window where start and end dates are set, that the candidate belongs to the selected position, that the candidate is approved, that the authenticated user is linked to a student profile, that the account is active, and that the student has an active permit for the election academic period where required.

The vote itself is immutable. Once a student votes for a candidate in a position, the vote cannot be edited through the current system design. The database enforces one vote per student per position. This prevents duplicate voting and reduces disputes about changed ballots.

Result visibility is controlled. Results should not be visible to ordinary students until results visibility is enabled, unless the user has permission to view results. This allows election officers to manage the release of results according to governance procedure.

The mobile application is the main voting channel in the proposed design. Students authenticate, view eligible elections, open election detail, select an approved candidate for a position, confirm the vote, and receive a success response. The backend returns updated election detail after a successful vote so that the interface can show that the student has voted for that position.

This design protects the election process while still allowing mobile participation. It also keeps election voting distinct from polls, which may have more flexible participation rules.

### 3.4.7 Mobile API design

The mobile API supports mobile application access to the backend. It uses REST-style JSON endpoints under a mobile route group and Sanctum bearer token authentication for protected operations. The API is separate from the dashboard session flow.

Figure 3.9 presents the mobile API communication flow.

[INSERT FIGURE — Mobile API Communication Flow]

Figure 3.9: Mobile API Communication Flow

The mobile authentication flow begins when the mobile application sends email, password, and optional device name to the login endpoint. The backend validates the credentials, rejects inactive users and users without passwords, and returns a Sanctum token once. The mobile application stores the token securely and sends it in the Authorization header for later requests. Logout revokes the current token.

The API endpoints are organized into groups:

- authentication endpoints;
- student profile and permit endpoints;
- permit request and payment endpoints;
- election endpoints;
- content endpoints;
- staff operation endpoints;
- verification endpoints.

This organization reflects different mobile use cases. Student endpoints are scoped to the authenticated user's linked student profile. Staff operation endpoints require staff/admin roles and specific backend permissions. Content endpoints expose only published public content. Verification endpoints require verification permission and are rate limited.

Table 3.7 summarizes the major mobile API groups.

Table 3.7: Mobile API Endpoint Groups

| Endpoint Group | Example Functions | Access Boundary |
| --- | --- | --- |
| Authentication | Login, logout, current user | Public login, Sanctum for current user and logout |
| Student | Profile, permits, NFC card, report lost card | Authenticated linked student |
| Permit requests | Options, create request, initialize payment, verify payment | Authenticated linked student |
| Elections | List elections, election detail, vote, results | Authenticated linked student with eligibility rules |
| Content | Announcements, events, documents, executives | Authenticated mobile user, public visibility rules |
| Operations | Summary, permits, NFC cards, students, permit requests | Staff/admin permissions |
| Verification | Student number, permit code, NFC verification | `verification.perform` permission and rate limits |

Pagination is used for lists such as announcements, events, documents, permits, NFC cards, verification logs, and permit requests. This prevents mobile responses from becoming too large as records grow.

Error handling is standardized. Unauthenticated requests return an unauthenticated response. Unauthorized requests return a permission error. Validation errors return field-level messages. Not-found responses are used where records should not be exposed or do not exist. Rate-limited endpoints return a too-many-attempts response.

Mobile resources are shaped to avoid exposing internal fields. The API should not return raw NFC UIDs, full permit codes, code hashes, UID hashes, token hashes, password hashes, internal payment metadata, or raw verification identifiers. This protects sensitive data while still giving the mobile application enough information to display useful results.

The mobile API design supports synchronization by allowing the mobile application to refresh request details after payment, election detail after voting, and content lists as needed. The mobile app does not directly manipulate database records. It submits requests to backend endpoints that enforce rules.

### 3.4.8 Security design

Security design is a major part of the proposed system because the platform handles student records, payment references, permit codes, NFC UIDs, election votes, audit logs, and public content. The security design is shown in Figure 3.10.

[INSERT FIGURE — Security and Verification Architecture]

Figure 3.10: Security and Verification Architecture

The first security layer is authentication. Dashboard users authenticate through web sessions. Mobile users authenticate through Sanctum bearer tokens. Public users can access public content and self-service permit pages, but public actions are still validated and rate limited.

The second layer is authorization. The system uses roles, permissions, policies, middleware, and form request authorization. RBAC controls broad access, while policies and form requests control specific actions. For example, a user may be authenticated but still lack permission to revoke permits, manage NFC cards, view audit logs, or approve permit request reviews.

The third layer is sensitive identifier protection. Plain permit codes are not stored. The system stores permit code hashes and last-four display values. Raw NFC UIDs are not stored. The system stores UID hashes and last-four display values. Verification logs store hashed identifiers rather than raw submitted student numbers, permit codes, or NFC UIDs.

The fourth layer is payment security. Paystack secret keys remain server-side. The system does not issue permits based on redirects alone. Callback, webhook, mobile verification, and admin retry flows all perform server-side Paystack verification. Webhook signatures are verified. Payment metadata and access codes are not exposed publicly.

The fifth layer is election integrity. Voting requires authentication, linked student profile, active account, election activity, voting window validity, approved candidate, and active permit where required. The system enforces one vote per student per position and does not allow vote editing. Results are hidden until visibility is enabled or the user has result viewing permission.

The sixth layer is rate limiting. Login, setup password, verification, sensitive actions, public content, mobile login, mobile verification, mobile sensitive actions, and mobile permit request endpoints use rate limits. Rate limiting reduces abuse of sensitive endpoints and protects the system from repeated automated attempts.

The seventh layer is public/private separation. Public routes query only published public content. Draft, scheduled, archived, internal, and unpublished records are not returned publicly. Mobile content endpoints reuse the same visibility rules. Dashboard data is never exposed through public resources.

The eighth layer is audit logging. Sensitive actions create audit records. Audit logs include actor, event, affected record, request metadata, old values, new values, and safe metadata where appropriate. Audit logs should not store raw secret identifiers.

Queue isolation is also part of the security design. Background jobs should not log sensitive payloads. Failed jobs must be reviewed carefully because queued data may contain operational context. Media conversions and notifications should run in queues, but secret values such as raw NFC UIDs, passwords, full permit codes, and tokens should not be logged.

Security tradeoffs are acknowledged. The system does not claim to eliminate all risk. It reduces risk by combining authentication, authorization, hashing, validation, rate limiting, audit logging, public/private boundaries, and server-side verification. These mechanisms are practical for the project's scope and can be extended in future deployments.

### 3.4.9 Queue and cache architecture

Queue and cache architecture supports responsiveness and operational growth. The first deployment is designed to work with database-backed queues and database-backed cache, while allowing future migration to Redis and Horizon if traffic increases.

Figure 3.11 presents the queue and cache architecture.

[INSERT FIGURE — Queue and Cache Architecture]

Figure 3.11: Queue and Cache Architecture

Queued work includes setup-password notifications, permit/payment/NFC operational notifications, media conversions, and future large reports or exports. Moving these tasks into queues prevents them from delaying the main user request. For example, a user action should not wait unnecessarily for a notification or media conversion before receiving a response.

The scheduler supports maintenance tasks. These include pruning expired Sanctum tokens, pruning failed jobs, pruning job batches, expiring permits, and expiring unpaid permit requests. Scheduled expiry is important because permit and request statuses should not remain stale indefinitely.

Caching is used for dashboard counts, warnings, public homepage content, public announcement/event/document lists, public executives, active academic period lookup, permit settings, and content settings. The active academic period cache stores only a scalar ID and re-queries the model to avoid unsafe object serialization.

Cache invalidation is important. Public content changes should update content cache versions. Dashboard changes should flush or update dashboard summaries where appropriate. Cached data should not be used for security-critical decisions unless freshness is guaranteed. Payment verification, voting eligibility, and permit issuance should rely on authoritative records.

The queue and cache design is intentionally moderate. It improves responsiveness without requiring advanced infrastructure at the start. When workload increases, Redis can replace database-backed queues and cache, and Horizon can provide better queue monitoring and worker management.

### 3.4.10 User interface design

The user interface design follows the system's role boundaries. The dashboard, mobile application, public portal, and verification interfaces serve different users and should not be designed as copies of one another.

#### Dashboard interface design

The dashboard is an operational interface. It should provide organized navigation, module pages, searchable tables, filters, detail screens, status badges, action dialogs, and confirmation prompts. The dashboard should support repeated administrative work such as managing students, reviewing permit requests, issuing permits, replacing NFC cards, approving candidates, publishing documents, and viewing reports.

[INSERT FIGURE — Dashboard Interface]

Figure 3.12: Operations Dashboard Interface

Figure 3.12 should show a dashboard screen with navigation, summary cards, operational warnings, and recent activity.

The dashboard should prioritize clarity over decoration. Users need to scan records quickly, identify statuses, and perform controlled actions. Destructive actions such as revocation, cancellation, rejection, and deletion should require confirmation.

#### Mobile application design

The student mobile home screen should present the most relevant student actions: permit status, permit request state, announcements, upcoming events, documents, election access, and profile information. Staff mobile screens should prioritize verification and operational tasks.

[INSERT FIGURE — Student Mobile Home Screen]

Figure 3.13: Student Mobile Home Screen

Mobile screens should avoid showing too much information at once. Payment status and permit request progress should be clear because callback and webhook timing can vary. The application should display pending, paid, issued, failed, or review-required states in understandable language.

[INSERT FIGURE — Permit Request Screen]

Figure 3.14: Student Permit Request Screen

#### Public portal design

The public portal should present official SRC information without exposing dashboard controls. It should include public announcements, events, documents, executive profiles, public election information, and self-service permit request pages. The public portal should use clear navigation and should not require login for public content.

The portal must respect visibility rules. Published public content should appear. Draft, archived, scheduled, internal, and unpublished content should not appear. This protects internal workflow while supporting public communication.

#### Election voting interface

The election voting interface should show the election title, status, voting period, positions, approved candidates, eligibility state, and whether the student has voted for a position. Before casting a vote, the interface should require confirmation because votes are immutable.

[INSERT FIGURE — Election Voting Screen]

Figure 3.15: Election Voting Screen

The interface should avoid ambiguity. If a student is not eligible, the reason should be shown clearly where appropriate. If results are hidden, the interface should not imply that counting failed. It should state that results are not yet visible.

#### Verification interface

The verification interface should support student number, permit code, and NFC UID verification. It should return clear result cards and avoid exposing raw identifiers in logs.

[INSERT FIGURE — Verification Interface]

Figure 3.16: Verification Interface

The result should tell the verifier whether the permit is valid, expired, revoked, invalid, or not found. The interface should show resolved student and permit summary only when available. This design supports fast decisions and protects sensitive data.

### 3.4.11 Test planning and validation strategy

Testing is planned around the system's risk areas. The system handles authentication, permits, payments, NFC cards, verification, elections, public content, mobile API access, audit logging, and security boundaries. Each of these areas requires targeted validation.

Table 3.8 summarizes the test planning strategy.

Table 3.8: System Test Planning Strategy

| Test Area | Purpose | Example Validation Focus |
| --- | --- | --- |
| Unit testing | Validate small pieces of domain logic. | Hashing helpers, status calculations, utility functions, settings behavior. |
| Feature testing | Validate full backend workflows. | Student CRUD, account activation, permit issuance, duplicate prevention, content visibility. |
| API testing | Validate mobile API endpoints and response boundaries. | Login, student profile, permit requests, elections, verification, staff operations. |
| Payment testing | Validate Paystack-related workflows. | Initialization, callback verification, webhook verification, retry verification, idempotency. |
| NFC testing | Validate card lifecycle and verification. | Register card, replace card, revoke card, verify active card, reject inactive card. |
| Election testing | Validate election rules. | Candidate approval, voting window, eligibility, one vote per position, result visibility. |
| Security testing | Validate access boundaries and sensitive data handling. | Permission checks, rate limits, no raw UID/code exposure, public/private content separation. |
| Usability validation | Confirm that workflows are understandable to users. | Permit request steps, verification result clarity, election confirmation, dashboard filters. |

Unit tests are useful for isolated logic, but much of this system depends on workflow behavior. Feature tests are therefore important. A permit issuance test should confirm that a record is created and that duplicate active permits are blocked. A payment test should confirm that a permit is not issued before server-side verification. An election test should confirm that ineligible users cannot vote and that duplicate votes are rejected.

API testing should confirm response structure and access control. Student endpoints must return only the authenticated student's records. Staff endpoints must require permission. Public content endpoints must return only published public records. Mobile resources must avoid internal metadata and secret identifiers.

Payment testing should include repeated callbacks and webhooks because idempotency is a major design requirement. The expected outcome is that repeated verification does not issue duplicate permits and does not corrupt payment state.

NFC testing should include lifecycle states. An active card should verify if the linked student has a valid permit. A lost, revoked, replaced, or inactive card should not verify as valid. Verification attempts should create logs without storing raw UIDs.

Security testing should verify that frontend role checks are not the only protection. Direct requests to protected endpoints should still be denied when the user lacks permission. Rate-limited endpoints should reject excessive attempts. Public routes should not expose dashboard records.

This validation strategy connects directly to the design risks. Chapter Four will present implementation evidence and test results based on these planned areas.

## 3.5 Summary of System Design

This chapter analyzed the existing manual and fragmented student governance processes and presented the design of the proposed NFC-based student permit verification and governance management system for Knutsford University. The analysis showed that the existing approach suffers from manual permit delays, weak verification, duplicate permit risk, fragmented communication, disconnected election workflows, poor reporting visibility, limited mobile access, and weak auditability.

The proposed system was defined as a centralized student governance platform with an operations dashboard, public portal, mobile application, mobile API, PostgreSQL database, Paystack integration, NFC verification, audit logging, queue workers, cache support, and role-based access control. The functional requirements covered authentication, student management, permit management, self-service permit requests, payments, NFC cards, verification, elections, polls, content, audit logging, reporting, mobile access, and API communication. The non-functional requirements addressed security, scalability, reliability, maintainability, availability, performance, usability, data integrity, auditability, and mobile responsiveness.

The design section explained the overall architecture, dashboard and mobile interaction model, database structure, permit request and payment workflow, NFC verification workflow, election voting workflow, mobile API design, security design, queue and cache architecture, user interface design, and test planning strategy. The main design decision is to keep sensitive workflow decisions in the backend while allowing dashboard, public, and mobile interfaces to serve different user groups.

The system design supports the objectives stated in Chapter One and applies the concepts reviewed in Chapter Two. It provides a structured plan for implementing a platform that connects permit issuance, payment verification, NFC card verification, election participation, public communication, audit logging, and operational reporting. Chapter Four will move from design to implementation by explaining how the proposed modules were developed, tested, and prepared for deployment.
