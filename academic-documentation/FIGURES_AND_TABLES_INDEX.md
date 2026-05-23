# Figures and Tables Index

This document is the master planning index for figures, tables, diagrams, screenshots, workflow illustrations, and user interface captures used in the final year project report for the NFC-based student permit verification and governance management system for Knutsford University.

It is an internal assembly guide, not a report chapter. It should be used during final formatting, Word compilation, caption insertion, List of Figures generation, List of Tables generation, screenshot collection, and appendix preparation.

## 1. Introduction

The report contains several visual and tabular materials across the literature review, system analysis and design chapter, implementation chapter, and conclusion chapter. These materials include architecture diagrams, workflow diagrams, Entity Relationship Diagrams (ERDs), screenshot placeholders, testing evidence, requirement tables, endpoint summaries, and objective evaluation tables.

This index provides one place to track those materials before the final report is assembled. It helps ensure that figure and table numbering stays consistent, captions are descriptive, screenshots are captured at the correct quality, diagrams support nearby explanations, and missing visual assets are identified early.

During final assembly, this document should be checked against the completed chapters. Any figure or table inserted into a chapter must appear in this index. Any item in this index that is not used in the final report should either be removed or moved to the appendix plan.

## 2. Figure Numbering Strategy

Figures must use chapter-based numbering. The first figure in Chapter Three is `Figure 3.1`, the second is `Figure 3.2`, and the same pattern continues for each chapter. Numbering should restart at the beginning of each chapter.

Recommended format:

```txt
Figure 3.1: Existing Manual Permit Issuance Workflow
Figure 3.2: Overall System Architecture
Figure 4.1: Login Interface
```

Figure captions must be descriptive and specific. A caption should identify what the reader is seeing, not only the type of visual. For example, `Figure 4.6: Permit Request Screen` is acceptable because it identifies the screen and the workflow context. A vague caption such as `Figure 4.6: Screenshot` should not be used.

Every figure must be referenced before it appears in the chapter text. After the figure, the chapter should briefly explain the main point shown by the visual. Diagrams and screenshots should support the argument of the chapter rather than act as decoration.

Figure statuses used in this index:

| Status | Meaning |
| --- | --- |
| pending | Asset has been planned but not yet created. |
| diagram required | A diagram must be drawn using a diagram tool. |
| screenshot required | A screenshot must be captured from the implemented system. |
| placeholder only | The report may keep this as a placeholder until final screenshots are available. |
| completed | Asset has been created and inserted into the final report. |
| optional | Asset may be included if the final page layout requires it. |

## 3. Table Numbering Strategy

Tables must also use chapter-based numbering. The first table in Chapter Two is `Table 2.1`, the first table in Chapter Three is `Table 3.1`, and the first table in Chapter Four is `Table 4.1`.

Recommended format:

```txt
Table 2.1: Comparative Analysis of Existing Systems and the Proposed System
Table 3.1: Functional Requirements of the Proposed System
Table 4.14: System Testing Results Summary
```

Table captions should appear close to the table according to the university report format. If the format requires captions above tables, maintain that rule throughout the report. If captions are placed below tables, apply that placement consistently. The current markdown drafts place captions directly before or near the table content; this can be adjusted during Word formatting.

Every table must be introduced before it appears. The paragraph before the table should explain why the table is included. After the table, add a short interpretation if the table contains analysis, comparison, results, or design evidence.

## 4. Chapter-by-Chapter Figures Index

### 4.1 Chapter One figures

Chapter One should use figures sparingly. It is mainly a problem-background and justification chapter. Figures in this chapter are optional and should be used only if they clarify the existing manual process.

| Figure No. | Figure Title | Type | Chapter | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Figure 1.1 | Existing Manual Verification Workflow | Workflow diagram | Chapter One | optional | Use only if the introduction needs a visual summary of manual verification before Chapter Three. |
| Figure 1.2 | Existing Permit Issuance Workflow | Workflow diagram | Chapter One | optional | May be omitted because Chapter Three already includes the formal existing permit workflow. |

### 4.2 Chapter Two figures

Chapter Two uses conceptual and literature-support diagrams. These should remain high-level and should not expose project implementation details that belong in Chapter Three.

| Figure No. | Figure Title | Type | Chapter | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Figure 2.1 | Client-Server Architecture | Conceptual architecture diagram | Chapter Two | diagram required | Show dashboard, mobile application, public portal, backend services, database, cache, queue workers, and payment gateway at a conceptual level. |
| Figure 2.2 | NFC Verification Workflow | Conceptual workflow diagram | Chapter Two | diagram required | Show card tap, identifier reading, backend lookup, card status check, permit status check, response, and audit log. |
| Figure 2.3 | REST API Communication Model | Conceptual diagram | Chapter Two | optional | Useful if REST API theory needs visual support. Keep separate from the project-specific mobile API flow in Chapter Three. |
| Figure 2.4 | Role-Based Access Control Model | Conceptual security diagram | Chapter Two | optional | Show user, role, permission, and protected resource relationships. |
| Figure 2.5 | Electronic Voting Control Flow | Conceptual workflow diagram | Chapter Two | optional | Show authentication, eligibility, candidate selection, vote submission, storage, and result visibility. |

### 4.3 Chapter Three figures

Chapter Three is the main design chapter, so most diagrams belong here. These figures should explain system structure, data relationships, workflow logic, security design, and interface planning.

| Figure No. | Figure Title | Type | Chapter | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Figure 3.1 | Existing Manual Permit Issuance Workflow | Workflow diagram | Chapter Three | diagram required | Already referenced in Chapter Three. Show student request, manual payment confirmation, officer review, permit recording, and physical delivery. |
| Figure 3.2 | Overall System Architecture | Architecture diagram | Chapter Three | diagram required | Show operations dashboard, public portal, mobile API, Laravel backend, PostgreSQL, Paystack, queue workers, cache, media storage, audit logs, and notification processing. |
| Figure 3.3 | Dashboard and Mobile Interaction Architecture | Architecture diagram | Chapter Three | diagram required | Show session-based dashboard access and Sanctum token-based mobile access reaching shared backend actions and models. |
| Figure 3.4 | Entity Relationship Diagram of the Proposed System | ERD | Chapter Three | diagram required | Include users, students, academic periods, permits, permit requests, payments, NFC cards, verification logs, audit logs, content modules, polls, elections, candidates, and votes. |
| Figure 3.5 | Permit Request and Payment Workflow | Workflow diagram | Chapter Three | diagram required | Show request creation, eligibility checks, payment initialization, callback/webhook verification, issuance, and recovery states. |
| Figure 3.6 | Paystack Verification Flow | Sequence or workflow diagram | Chapter Three | diagram required | Show Paystack callback, webhook, server-side verification, idempotency, and admin retry verification. |
| Figure 3.7 | NFC Verification Workflow | Workflow diagram | Chapter Three | diagram required | Show NFC scan, UID normalization, HMAC hashing, card lookup, status check, permit check, response, and log creation. |
| Figure 3.8 | Election Voting Workflow | Workflow diagram | Chapter Three | diagram required | Show election activation, candidate approval, eligibility check, voting, duplicate prevention, immutable vote storage, and result visibility. |
| Figure 3.9 | Mobile API Communication Flow | API communication diagram | Chapter Three | diagram required | Show mobile application, Sanctum token, endpoint groups, controllers/resources, backend actions, and database records. |
| Figure 3.10 | Security and Verification Architecture | Security architecture diagram | Chapter Three | diagram required | Show RBAC, Sanctum, validation, rate limiting, hashed identifiers, audit logs, payment verification, and election integrity. |
| Figure 3.11 | Queue and Cache Architecture | Infrastructure diagram | Chapter Three | diagram required | Show queue jobs, workers, scheduled tasks, cache store, invalidation points, and dashboard/public content usage. |
| Figure 3.12 | Operations Dashboard Interface | UI design mockup or screenshot | Chapter Three | placeholder only | Use a design mockup or early dashboard capture. Main implementation screenshot can remain in Chapter Four. |
| Figure 3.13 | Student Mobile Home Screen | UI design mockup or screenshot | Chapter Three | placeholder only | Use to illustrate mobile interface planning. Avoid duplicating detailed implementation evidence from Chapter Four. |
| Figure 3.14 | Student Permit Request Screen | UI design mockup or screenshot | Chapter Three | placeholder only | Should support user interface requirements. |
| Figure 3.15 | Election Voting Screen | UI design mockup or screenshot | Chapter Three | placeholder only | Use for design intent only. |
| Figure 3.16 | Verification Interface | UI design mockup or screenshot | Chapter Three | placeholder only | Should show planned verification methods or interface structure. |

### 4.4 Chapter Four figures

Chapter Four contains the implementation evidence screenshots and selected implementation diagrams. These assets should be captured from the working system wherever possible. Screenshots must avoid real sensitive student data.

| Figure No. | Figure Title | Type | Chapter | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Figure 4.1 | Login Interface | Dashboard screenshot | Chapter Four | screenshot required | Capture dashboard login screen. Use clean test account labels if visible. |
| Figure 4.2 | Student Management Dashboard | Dashboard screenshot | Chapter Four | screenshot required | Show student list, filters/search, status indicators, and action controls. |
| Figure 4.3 | Student Account Activation Workflow | Workflow screenshot or composite | Chapter Four | screenshot required | Show activation action and setup-password completion path. |
| Figure 4.4 | Permit Management Screen | Dashboard screenshot | Chapter Four | screenshot required | Show permit records, status badges, filters, and lifecycle actions. |
| Figure 4.5 | Permit Verification Workflow | Workflow diagram | Chapter Four | diagram required | Implementation-focused verification flow connecting student number, permit code, NFC, and logs. |
| Figure 4.6 | Permit Request Screen | Public or mobile screenshot | Chapter Four | screenshot required | Capture self-service permit request form or mobile request screen. |
| Figure 4.7 | Paystack Payment Flow | Workflow screenshot or diagram | Chapter Four | screenshot required | Include payment initialization and verified return state. Mask payment references where needed. |
| Figure 4.8 | Permit Request Recovery Dashboard | Dashboard screenshot | Chapter Four | screenshot required | Show recovery states, stuck requests, and retry actions. |
| Figure 4.9 | NFC Card Registration | Dashboard or mobile screenshot | Chapter Four | screenshot required | Show card assignment/register interface. Do not expose full raw UID. |
| Figure 4.10 | NFC Verification Screen | Mobile or dashboard screenshot | Chapter Four | screenshot required | Show scan result or verification result card. Mask sensitive data. |
| Figure 4.11 | Verification Dashboard | Dashboard screenshot | Chapter Four | screenshot required | Show available verification methods and recent verification context. |
| Figure 4.12 | Election Dashboard | Dashboard screenshot | Chapter Four | screenshot required | Show election lifecycle management, positions, candidates, or status. |
| Figure 4.13 | Mobile Voting Screen | Mobile screenshot | Chapter Four | screenshot required | Capture candidate selection and vote confirmation screen. Use test election data. |
| Figure 4.14 | Election Results Screen | Dashboard or mobile screenshot | Chapter Four | screenshot required | Show result visibility without exposing sensitive voter data. |
| Figure 4.15 | Announcement Management | Dashboard screenshot | Chapter Four | screenshot required | Show content publication workflow and status. |
| Figure 4.16 | Public Portal | Public portal screenshot | Chapter Four | screenshot required | Capture homepage or content listing with official SRC information. |
| Figure 4.17 | Audit Logs Dashboard | Dashboard screenshot | Chapter Four | screenshot required | Show filters and event records. Mask user names if real data appears. |
| Figure 4.18 | Reports Dashboard | Dashboard screenshot | Chapter Four | screenshot required | Show operational summary counts and warnings. |
| Figure 4.19 | Student Home Screen | Mobile screenshot | Chapter Four | screenshot required | Show mobile student landing screen with main actions. |
| Figure 4.20 | Permit Request Mobile Screen | Mobile screenshot | Chapter Four | screenshot required | Show mobile permit request workflow. |
| Figure 4.21 | Mobile Permit Status Screen | Mobile screenshot | Chapter Four | screenshot required | Show active/pending permit state. |
| Figure 4.22 | Operations Verification Screen | Mobile screenshot | Chapter Four | screenshot required | Show staff verification interface. |
| Figure 4.23 | Card Assignment Screen | Mobile or dashboard screenshot | Chapter Four | screenshot required | Show staff NFC assignment flow. |
| Figure 4.24 | Mobile API Communication Flow | API communication diagram | Chapter Four | diagram required | Implementation-level diagram showing endpoint groups and resource flow. |
| Figure 4.25 | Queue Workflow | Infrastructure diagram | Chapter Four | diagram required | Show queued notifications, workers, failed jobs, and scheduled tasks. |
| Figure 4.26 | Test Execution Results | Test screenshot | Chapter Four | screenshot required | Capture final successful test run output. If tests are too long, use a concise terminal capture. |
| Figure 4.27 | Deployment Architecture | Deployment diagram | Chapter Four | diagram required | Show VPS, web server, Laravel app, database, queue worker, scheduler, storage, SSL, and Paystack webhook. |

### 4.5 Chapter Five figures

Chapter Five should remain mostly textual and evaluative. Figures are optional and should be included only if they help summarize outcomes without repeating earlier diagrams.

| Figure No. | Figure Title | Type | Chapter | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Figure 5.1 | Summary of Completed System Modules | Summary chart | Chapter Five | optional | Use only if the chapter needs a compact visual summary of completed modules. |
| Figure 5.2 | Future Enhancement Roadmap | Roadmap chart | Chapter Five | optional | Use only if recommendations need visual grouping. Avoid a promotional roadmap style. |

## 5. Chapter-by-Chapter Tables Index

### 5.1 Chapter One tables

Chapter One does not currently require formal tables. If a table is added, it should support objectives, scope, or definitions without making the introduction look like an implementation chapter.

| Table No. | Table Title | Chapter | Status | Notes |
| --- | --- | --- | --- | --- |
| Table 1.1 | Summary of Study Objectives | Chapter One | optional | May be used if objectives need compact presentation. Current chapter already lists objectives clearly. |
| Table 1.2 | Definition of Key Terms | Chapter One | optional | May be used if the university template prefers term definitions in table format. |

### 5.2 Chapter Two tables

| Table No. | Table Title | Chapter | Status | Notes |
| --- | --- | --- | --- | --- |
| Table 2.1 | Comparative Analysis of Existing Systems and the Proposed System | Chapter Two | pending | Already included in Chapter Two. Review final criteria and ensure claims remain category-based, not based on invented product details. |
| Table 2.2 | Summary of Literature and System Gaps | Chapter Two | optional | Could be added if Chapter Two needs a compact gap mapping before the summary. |

### 5.3 Chapter Three tables

| Table No. | Table Title | Chapter | Status | Notes |
| --- | --- | --- | --- | --- |
| Table 3.1 | Functional Requirements of the Proposed System | Chapter Three | pending | Already included. Verify requirement IDs and module names. |
| Table 3.2 | Non-Functional Requirements of the Proposed System | Chapter Three | pending | Already included. Ensure requirements are measurable where possible. |
| Table 3.3 | Hardware Requirements | Chapter Three | pending | Already included. Check device and server assumptions before final submission. |
| Table 3.4 | Software Requirements | Chapter Three | pending | Already included. Confirm Laravel, PostgreSQL, Expo React Native, Inertia.js, Tailwind CSS, Sanctum, Spatie packages, Paystack, queue/cache systems. |
| Table 3.5 | Core Data Entities and Their Purposes | Chapter Three | pending | Already included. Must match ERD and implementation terminology. |
| Table 3.6 | Data Dictionary Summary | Chapter Three | pending | Already included. Keep summary-level details in chapter and move full schema to appendix. |
| Table 3.7 | Mobile API Endpoint Groups | Chapter Three | pending | Already included. Confirm endpoint groups against final API contract. |
| Table 3.8 | System Test Planning Strategy | Chapter Three | pending | Already included. Should map to Chapter Four testing discussion. |

### 5.4 Chapter Four tables

| Table No. | Table Title | Chapter | Status | Notes |
| --- | --- | --- | --- | --- |
| Table 4.1 | Development Technologies and Implementation Roles | Chapter Four | pending | Already included. Verify technology names and versions before final formatting. |
| Table 4.2 | Backend Module Implementation Overview | Chapter Four | pending | Already included. Keep module names aligned with report terminology. |
| Table 4.3 | Student Account Activation States | Chapter Four | pending | Already included. Check final activation states against implementation. |
| Table 4.4 | Permit Lifecycle States | Chapter Four | pending | Already included. Match permit status names from system. |
| Table 4.5 | Permit Request Status and Recovery Meaning | Chapter Four | pending | Already included. Useful evidence for payment recovery workflow. |
| Table 4.6 | NFC Card Lifecycle States | Chapter Four | pending | Already included. Must reflect active, replaced, lost, revoked, and related states used in the system. |
| Table 4.7 | Verification Method Implementation | Chapter Four | pending | Already included. Cover student number, permit code, and NFC verification. |
| Table 4.8 | Election Lifecycle Implementation | Chapter Four | pending | Already included. Match election states from the implementation. |
| Table 4.9 | Content Module Publication Behavior | Chapter Four | pending | Already included. Cover announcements, events, and documents. |
| Table 4.10 | Audit Event Coverage | Chapter Four | pending | Already included. Avoid exposing sensitive audit payload details. |
| Table 4.11 | Mobile Screen and API Integration Map | Chapter Four | pending | Already included. Check against final mobile screens and endpoint groups. |
| Table 4.12 | Security and Integrity Mechanisms | Chapter Four | pending | Already included. Ensure security claims stay specific. |
| Table 4.13 | Queue, Cache, and Scheduler Responsibilities | Chapter Four | pending | Already included. Confirm deployment readiness notes. |
| Table 4.14 | System Testing Results Summary | Chapter Four | pending | Already included. Update actual results after final successful test run. |
| Table 4.15 | Production Readiness Requirements | Chapter Four | pending | Already included. Confirm before deployment or demonstration. |
| Table 4.16 | Implementation Challenges and Resolutions | Chapter Four | pending | Already included. Keep resolutions realistic and tied to implemented behavior. |

### 5.5 Chapter Five tables

| Table No. | Table Title | Chapter | Status | Notes |
| --- | --- | --- | --- | --- |
| Table 5.1 | Summary of Objectives Achieved | Chapter Five | pending | Already included. Use as the main outcome evaluation table. |
| Table 5.2 | Recommended Future Enhancements | Chapter Five | optional | Use only if recommendations become too long in narrative form. |

## 6. Screenshot Planning Guide

Screenshots should provide evidence of the implemented system. They should be captured after test data has been prepared and sensitive records have been masked or replaced with demonstration data.

### 6.1 Dashboard screenshots

| Screenshot | Related Figure | Status | Notes |
| --- | --- | --- | --- |
| Login interface | Figure 4.1 | screenshot required | Capture clean login screen. |
| Student management dashboard | Figure 4.2 | screenshot required | Show search/filter controls and student status badges. |
| Account activation workflow | Figure 4.3 | screenshot required | Use test student account. |
| Permit management screen | Figure 4.4 | screenshot required | Show permit status and actions. |
| Permit request recovery dashboard | Figure 4.8 | screenshot required | Show stuck or recoverable requests using test data. |
| NFC card registration | Figure 4.9 | screenshot required | Mask full UID values. |
| Verification dashboard | Figure 4.11 | screenshot required | Show student number, permit code, and NFC methods. |
| Election dashboard | Figure 4.12 | screenshot required | Show election state and candidate/position management. |
| Election results screen | Figure 4.14 | screenshot required | Use test election results. |
| Announcement management | Figure 4.15 | screenshot required | Show publication status and content list. |
| Audit logs dashboard | Figure 4.17 | screenshot required | Mask real user names or use seed data. |
| Reports dashboard | Figure 4.18 | screenshot required | Show summary cards and warnings. |

### 6.2 Mobile screenshots

| Screenshot | Related Figure | Status | Notes |
| --- | --- | --- | --- |
| Mobile login screen | Appendix F or optional Chapter Four addition | screenshot required | Capture if appendix includes full mobile gallery. |
| Student home screen | Figure 4.19 | screenshot required | Show main student actions. |
| Permit request mobile screen | Figure 4.20 | screenshot required | Capture request creation or available options. |
| Mobile permit status screen | Figure 4.21 | screenshot required | Show active, pending, or issued permit state. |
| Payment return or verification screen | Appendix F | screenshot required | Capture return state after Paystack verification using test flow if available. |
| Mobile election list/detail screen | Appendix F | screenshot required | Useful supporting evidence. |
| Mobile voting screen | Figure 4.13 | screenshot required | Use a test election and test candidates. |
| Operations verification screen | Figure 4.22 | screenshot required | Show staff verification method options. |
| NFC card status screen | Appendix F | screenshot required | Show card state without raw UID. |
| Card assignment screen | Figure 4.23 | screenshot required | Use test student and masked UID. |
| Mobile announcements/events/documents screens | Appendix F | screenshot required | Use public content data. |

### 6.3 Public portal screenshots

| Screenshot | Related Figure | Status | Notes |
| --- | --- | --- | --- |
| Public portal homepage | Figure 4.16 | screenshot required | Show official SRC or governance content. |
| Announcements listing/detail | Appendix F | screenshot required | Use published announcement data. |
| Events listing/detail | Appendix F | screenshot required | Use published event data. |
| Documents listing/detail | Appendix F | screenshot required | Avoid exposing private documents. |
| Election information page | Appendix F | screenshot required | Show public or published election information only. |
| Public permit request page | Figure 4.6 or Appendix F | screenshot required | Use if public self-service flow is shown instead of mobile. |

### 6.4 Operations screenshots

| Screenshot | Related Figure | Status | Notes |
| --- | --- | --- | --- |
| Student lookup | Appendix F | screenshot required | Use test data only. |
| Permit verification result | Figure 4.10 or Figure 4.11 | screenshot required | Show valid and invalid cases if appendix space allows. |
| NFC scan result | Figure 4.10 | screenshot required | Mask UID and sensitive student fields. |
| Permit code verification | Appendix F | screenshot required | Use generated test permit code. |
| Card assignment and replacement | Figure 4.23 or Appendix F | screenshot required | Show lifecycle operation. |
| Lost-card or revocation workflow | Appendix F | screenshot required | Useful evidence for NFC lifecycle implementation. |

## 7. Diagram Planning Guide

The report should use clean, readable diagrams that can be understood in grayscale print. The diagrams should not try to show every class, route, or database column. They should explain relationships and workflow decisions at the level needed for academic assessment.

Recommended tools:

| Tool | Best Use | Notes |
| --- | --- | --- |
| Draw.io / diagrams.net | Architecture diagrams, ERDs, workflow diagrams | Good default choice for final report diagrams. Export as PNG and keep editable source files. |
| Excalidraw | Simple conceptual diagrams and workflows | Use only if the hand-drawn style is acceptable to the supervisor. Avoid overly casual styling. |
| Lucidchart | Formal workflow, sequence, and architecture diagrams | Useful if collaborative editing or polished exports are needed. |
| Figma | UI mockups and interface flow layouts | Best for interface planning visuals and annotated screen layouts. |

Diagram style rules:

- Use one consistent font family across diagrams, preferably Calibri, Arial, or a clean sans-serif font.
- Use the same terminology found in the report, such as `operations dashboard`, `mobile API`, `public portal`, `permit request`, `NFC card`, and `audit logging`.
- Use consistent arrow styles. Avoid mixing thick arrows, curved arrows, dashed arrows, and decorative connectors without a reason.
- Use no more than four main colors in a diagram. Neutral gray, blue, green, and red/orange for warning or external systems are usually enough.
- Keep labels short. Put detailed explanation in the chapter text, not inside diagram boxes.
- Use left-to-right or top-to-bottom flow consistently.
- Export diagrams at high resolution and check readability after insertion into Word.
- Save editable diagram files separately for later correction.

## 8. Figure Quality Rules

Screenshots and diagrams must be clear enough for printed and digital assessment.

Quality rules:

- Capture screenshots at high resolution.
- Crop screenshots to the relevant interface area.
- Avoid unnecessary browser chrome unless the URL or page context is needed.
- Use consistent light or dark mode across related screenshots. Light mode is usually safer for printed reports.
- Mask real names, email addresses, phone numbers, payment references, tokens, raw NFC UIDs, and full permit codes.
- Use test data that looks realistic but does not identify real students.
- Ensure labels, table text, buttons, and status badges are readable after resizing.
- Avoid crowded screenshots. If a screen is too dense, capture a focused area and place the full screen in the appendix.
- Do not include screenshots with visible error banners unless the purpose is to demonstrate validation or error handling.
- Use PNG for diagrams and screenshots where clarity matters. JPEG should be avoided for text-heavy UI captures.

## 9. Caption Writing Rules

Captions should be concise, descriptive, and academic. A good caption names the visual and its report context.

Recommended captions:

```txt
Figure 3.5: Permit Request and Payment Workflow
Figure 3.7: NFC Verification Workflow
Figure 4.12: Election Dashboard
Figure 4.20: Permit Request Mobile Screen
Table 4.14: System Testing Results Summary
```

Avoid captions such as:

```txt
Figure 4.1: Screenshot
Figure 3.2: Diagram
Table 3.1: Data
Figure 4.8: This is the recovery page
```

Caption rules:

- Use chapter-based numbering.
- Use title case for figure and table captions.
- Keep wording consistent with report terminology.
- Avoid conversational wording.
- Avoid captions that are too long.
- Do not use marketing language.
- Do not reveal sensitive implementation details in captions.

## 10. Assembly Workflow Recommendations

Final report assembly should follow a controlled order. This avoids numbering errors and missing screenshots late in the formatting process.

Recommended order:

1. Review all chapter drafts and confirm which figures and tables remain in the final report.
2. Generate or update all required diagrams for Chapter Two and Chapter Three.
3. Prepare clean test data for screenshots.
4. Capture dashboard screenshots.
5. Capture public portal screenshots.
6. Capture mobile application screenshots.
7. Capture testing and deployment evidence screenshots.
8. Insert figures into the Word document close to their first discussion.
9. Insert figure captions using Word's caption tool if available.
10. Insert tables and table captions using the same numbering convention.
11. Verify that every figure and table is referenced before appearing.
12. Check that every figure and table is discussed after appearing.
13. Update the List of Figures and List of Tables.
14. Export a draft PDF and inspect page breaks, caption placement, and image readability.
15. Move bulky supporting screenshots, full API contracts, route lists, and extended test evidence to appendices.
16. Perform a final consistency check against `REPORT_WRITING_RULES.md`.

During assembly, do not renumber figures manually without checking cross-references. If Word automatic captions are used, update all fields before exporting the final PDF.

## 11. Missing Assets Checklist

This checklist should be updated during final report preparation. `Pending` means the asset is still needed. `Ready` means the screenshot or diagram exists but may not yet be inserted. `Inserted` means it has been placed in the final document with caption and discussion.

| Asset | Status | Notes |
| --- | --- | --- |
| Figure 2.1 Client-Server Architecture | Pending | Draw conceptual architecture diagram. |
| Figure 2.2 NFC Verification Workflow | Pending | Draw high-level NFC workflow. |
| Figure 3.1 Existing Manual Permit Issuance Workflow | Pending | Draw existing workflow. |
| Figure 3.2 Overall System Architecture | Pending | Draw main architecture diagram. |
| Figure 3.3 Dashboard and Mobile Interaction Architecture | Pending | Draw access-channel diagram. |
| Figure 3.4 Entity Relationship Diagram | Pending | Build from final database schema. |
| Figure 3.5 Permit Request and Payment Workflow | Pending | Draw full request/payment/issuance flow. |
| Figure 3.6 Paystack Verification Flow | Pending | Draw callback/webhook/server verification flow. |
| Figure 3.7 NFC Verification Workflow | Pending | Draw UID hashing and verification path. |
| Figure 3.8 Election Voting Workflow | Pending | Draw election lifecycle and vote casting flow. |
| Figure 3.9 Mobile API Communication Flow | Pending | Draw mobile API request/response structure. |
| Figure 3.10 Security and Verification Architecture | Pending | Draw security-control overview. |
| Figure 3.11 Queue and Cache Architecture | Pending | Draw queue/cache/scheduler structure. |
| Figure 4.1 Login Interface | Pending | Capture dashboard login screenshot. |
| Figure 4.2 Student Management Dashboard | Pending | Capture dashboard screenshot. |
| Figure 4.4 Permit Management Screen | Pending | Capture dashboard screenshot. |
| Figure 4.6 Permit Request Screen | Pending | Capture public or mobile permit request screen. |
| Figure 4.7 Paystack Payment Flow | Pending | Capture or diagram verified payment flow. |
| Figure 4.9 NFC Card Registration | Pending | Capture card registration screen. |
| Figure 4.10 NFC Verification Screen | Pending | Capture NFC verification result. |
| Figure 4.12 Election Dashboard | Pending | Capture election management screen. |
| Figure 4.13 Mobile Voting Screen | Pending | Capture mobile voting screen. |
| Figure 4.14 Election Results Screen | Pending | Capture result screen. |
| Figure 4.16 Public Portal | Pending | Capture public portal homepage or listing. |
| Figure 4.17 Audit Logs Dashboard | Pending | Capture audit log screen with masked data. |
| Figure 4.18 Reports Dashboard | Pending | Capture reports dashboard. |
| Figure 4.19 Student Home Screen | Pending | Capture mobile home screen. |
| Figure 4.20 Permit Request Mobile Screen | Pending | Capture mobile permit request screen. |
| Figure 4.21 Mobile Permit Status Screen | Pending | Capture mobile permit status screen. |
| Figure 4.22 Operations Verification Screen | Pending | Capture staff operations screen. |
| Figure 4.23 Card Assignment Screen | Pending | Capture card assignment screen. |
| Figure 4.24 Mobile API Communication Flow | Pending | Draw implementation-level API flow. |
| Figure 4.25 Queue Workflow | Pending | Draw queue worker flow. |
| Figure 4.26 Test Execution Results | Pending | Capture final successful test run output. |
| Figure 4.27 Deployment Architecture | Pending | Draw deployment architecture. |
| Table 2.1 Comparative Analysis | Pending | Verify final comparative criteria. |
| Table 3.1 Functional Requirements | Pending | Verify requirement IDs and module names. |
| Table 3.2 Non-Functional Requirements | Pending | Confirm wording. |
| Table 3.3 Hardware Requirements | Pending | Confirm hardware assumptions. |
| Table 3.4 Software Requirements | Pending | Confirm technology list. |
| Table 3.5 Core Data Entities | Pending | Match ERD. |
| Table 3.6 Data Dictionary Summary | Pending | Match appendix schema. |
| Table 3.7 Mobile API Endpoint Groups | Pending | Match mobile API contract. |
| Table 3.8 System Test Planning Strategy | Pending | Match Chapter Four tests. |
| Table 4.14 System Testing Results Summary | Pending | Update after final successful test execution. |
| Table 5.1 Summary of Objectives Achieved | Pending | Verify against Chapter One objectives. |

## 12. Assembly Readiness Summary

The report already has a clear visual structure. Chapter Two requires a small number of conceptual diagrams. Chapter Three requires the main design diagrams, including architecture, ERD, workflows, security, queue/cache, and interface planning visuals. Chapter Four requires the largest screenshot set because it provides implementation evidence. Chapter Five requires only one table and should remain mostly textual unless a summary chart is genuinely useful.

Before final Word compilation, the main remaining work is to create the Chapter Three diagrams, capture Chapter Four screenshots from a clean test environment, update the testing evidence after the final successful run, and verify that every figure and table has a matching caption, reference, and discussion. Once these assets are prepared, the List of Figures and List of Tables can be generated with less risk of numbering errors.
