# CHAPTER FIVE — SUMMARY, CONCLUSION, AND RECOMMENDATIONS

## 5.1 Introduction

This chapter presents the summary, conclusion, limitations, recommendations, and suggested future work for the study. The previous chapter described how the NFC-based student permit verification and governance management system was implemented, tested, and prepared for deployment. It explained the backend, dashboard, public portal, mobile application, mobile API, payment integration, NFC verification, elections, audit logging, reporting, and security mechanisms that form the completed system.

The purpose of this chapter is to evaluate the completed project in relation to the original aim and objectives. It does not repeat the full design or implementation discussion from earlier chapters. Instead, it reflects on the main problems addressed, the system outcomes achieved, the practical value of the project to Knutsford University, and the remaining limitations that should be considered before full institutional adoption.

The chapter also provides recommendations for deployment, administration, technical improvement, security management, and future research. These recommendations are included because a student governance platform is not only a software product. It also depends on institutional readiness, user training, operating procedures, maintenance practices, and continuous improvement.

## 5.2 Summary of the Study

The study was motivated by practical challenges in student governance operations, especially where permit issuance, student verification, payment confirmation, elections, public communication, and reporting are handled through manual or fragmented processes. In such an environment, records may exist in paper files, spreadsheets, messaging platforms, payment receipts, or isolated administrative tools. Each of these methods may solve a temporary problem, but they do not provide a unified governance record. This creates delays, weak auditability, inconsistent communication, and difficulty in verifying student identity and permit status when required.

The project focused on Knutsford University and proposed an NFC-based student permit verification and governance management system. The system was designed to support the Students' Representative Council (SRC), students, administrators, security personnel, and other authorized users who participate in student governance workflows. Its main concern was not only to digitize one activity, such as permit issuance, but to connect related governance operations within a controlled platform.

The study began by examining the background of digital governance systems in educational institutions. Chapter One explained that student governance involves several operational activities that affect trust, accountability, and service delivery. Permit issuance, payment verification, student identity checks, elections, announcements, document access, and reporting are linked in practice, even when institutions manage them separately. The chapter also identified the limitations of manual workflows, including permit fraud, impersonation, slow verification, weak reporting visibility, poor communication, and limited mobile accessibility.

The aim of the study was to design and implement an NFC-based student permit verification and governance management system for Knutsford University. The objectives were framed around centralized governance management, student records, permit management, self-service permit requests, Paystack payment verification, NFC verification, mobile access, election voting, public communication, audit logging, reporting, and testing. These objectives provided the structure for the analysis, design, implementation, and final evaluation of the project.

Chapter Two reviewed the literature and related systems needed to understand the project. The review covered client-server architecture, Role-Based Access Control (RBAC), mobile application architecture, REST API architecture, digital identity verification, contactless authentication systems, and electronic voting systems. These concepts established the theoretical basis for the proposed system. The chapter also reviewed relevant technologies such as Laravel, React, Inertia.js, Expo React Native, PostgreSQL, Near Field Communication (NFC), Paystack, queue and cache systems, and Sanctum authentication.

The literature review showed that the proposed system combines several areas that are often treated separately. Many systems address student records, attendance, identity verification, payment processing, or elections as individual modules. The identified gap was the absence of an integrated student governance platform that connects permit management, NFC-based verification, payment verification, mobile access, election voting, public communication, audit logging, and operational reporting. This gap justified the need for a system that could coordinate these activities through shared records and controlled workflows.

Chapter Three analyzed the existing manual system and designed the proposed system. The existing workflows were examined in relation to permit issuance, student verification, communication, elections, and student identity management. The analysis showed that manual processes can be slow, difficult to audit, and prone to inconsistency. For example, a student may present a permit or receipt for verification, but staff may still need to search separate records before confirming status. Election processes may also suffer where eligibility checks, candidate approval, voting records, and result visibility are not managed through a structured system.

The proposed system was designed as a multi-platform architecture consisting of a Laravel backend, an operations dashboard, a public portal, a mobile application, a mobile API, PostgreSQL database storage, Paystack payment integration, NFC verification workflows, queue and cache infrastructure, and audit logging. The design emphasized centralization without exposing all data to every user. Dashboard operations were separated from public content and mobile workflows. Student-facing mobile features were separated from staff operations. Sensitive functions were protected through authentication, authorization, validation, rate limiting, hashed identifiers, and audit records.

The design chapter also described functional and non-functional requirements. Functional requirements included authentication and authorization, student management, permit management, self-service permit requests, payment integration, NFC card management, verification, elections, polling, public portal content, announcements, events, documents, audit logging, reporting, mobile application features, and mobile API access. Non-functional requirements included security, scalability, reliability, maintainability, availability, performance, usability, data integrity, auditability, and mobile responsiveness.

The system design placed strong emphasis on workflow reasoning. Permit requests were designed to move from student request to payment initialization, server-side payment verification, permit issuance, and audit logging. NFC verification was designed to support card registration, replacement, revocation, scanning, hashed UID comparison, and verification logging. Election voting was designed around candidate approval, eligibility checks, one vote per student per position, immutable votes, and controlled result visibility. These workflows were included because the system needed to support real institutional operations rather than only interface screens.

Chapter Four explained the implementation of the system. The backend was implemented with Laravel 13, PHP, PostgreSQL, Sanctum, Spatie Permission, Spatie Media Library, queue and cache systems, and supporting domain actions. The dashboard was implemented with React, Inertia.js, TypeScript, Tailwind CSS, and Shadcn UI. The mobile application was implemented with Expo React Native, Expo Router, TanStack Query, and mobile API integration. Infrastructure preparation covered Docker, queue workers, caching, environment configuration, deployment steps, HTTPS requirements, storage setup, migrations, scheduler tasks, and health checks.

The implementation chapter demonstrated that the major modules were not independent screens with disconnected data. Authentication and authorization controlled access to sensitive routes and operations. Student management supported student profiles, account activation, academic period linkage, and configurable options. Permit management supported issuance, revocation, delivery, lifecycle handling, hashed permit codes, and verification integration. Self-service permit requests connected student actions to payment initialization, Paystack verification, recovery workflows, duplicate prevention, and permit issuance after confirmed payment.

The NFC card management and verification implementation supported card registration, replacement, lost-card reporting, revocation, UID normalization, HMAC hashing, and verification by NFC. The system also retained student number and permit code verification as fallback methods because NFC hardware support cannot be assumed in every operational context. This was a practical design and implementation decision, since verification should remain possible even when a device does not support NFC or when a card cannot be scanned.

The election module was implemented with lifecycle states, positions, candidate approval, eligibility enforcement, immutable vote casting, duplicate vote prevention, result visibility, and mobile integration. The polling module supported less formal voting activities with different rules from elections. Public communication modules supported announcements, events, documents, executives, published content visibility, and public portal exposure. Audit logging and reporting were implemented to give the SRC and authorized users operational visibility across major workflows.

The mobile application extended the system beyond the dashboard. Students can access personal permit information, create permit requests, follow payment status, view governance content, participate in eligible elections, and view NFC card status. Authorized staff can use mobile operations features for verification, student search, permit support, NFC registration, and operations summaries. The mobile API used Sanctum token authentication and endpoint grouping to keep student data scoped and staff actions protected.

Testing and validation were also considered in the implementation chapter. The system was tested across authentication, authorization, student management, permit workflows, payment verification, NFC card management, verification, elections, public content visibility, mobile API access, audit logging, and security restrictions. The project documentation recorded successful automated test coverage for the core system, while final demonstration screenshots and manual validation remain necessary for report appendices and presentation evidence.

Taken as a whole, the study designed and implemented a student governance platform that addresses the main operational weaknesses identified in the problem statement. It provides a structured way to manage student governance activities, verify permits, process self-service permit requests, support digital payment verification, use NFC for contactless checks, manage elections, publish official content, log sensitive actions, and report operational status.

## 5.3 Summary of Objectives Achieved

This section evaluates the completed system against the objectives stated in Chapter One. The assessment focuses on whether each objective was addressed through the analysis, design, and implementation work, and on the institutional value of each outcome.

Table 5.1 summarizes the major objectives and the corresponding outcomes achieved by the implemented system.

[INSERT TABLE — Summary of Objectives Achieved]

Table 5.1: Summary of Objectives Achieved

| Objective | Outcome Achieved | Institutional Value |
| --- | --- | --- |
| Design a centralized operations dashboard | Implemented dashboard modules for students, permits, payments, NFC cards, verification, elections, polls, content, audit logs, reports, roles, and settings. | Reduces dependence on scattered records and gives executives and administrators a single management environment. |
| Manage student records and account activation | Implemented student profiles, academic period linkage, configurable options, and account activation workflows. | Improves identity management and supports student access to mobile and self-service functions. |
| Implement permit management | Implemented permit issuance, lifecycle handling, revocation, delivery tracking, hashed permit codes, and verification integration. | Improves control over permit records and reduces ambiguity during verification. |
| Support self-service permit requests | Implemented student-facing permit request workflows through public and mobile channels. | Reduces unnecessary manual submission steps and improves student access to permit services. |
| Integrate Paystack payment verification | Implemented payment initialization, callbacks, webhooks, server-side verification, recovery workflows, and duplicate prevention. | Improves traceability between payment and permit issuance. |
| Implement NFC verification | Implemented NFC card registration, replacement, revocation, UID hashing, scanning support, and NFC verification. | Supports faster point-of-check permit verification where compatible devices are available. |
| Provide fallback verification methods | Implemented verification by student number and permit code in addition to NFC. | Keeps verification usable when NFC is unavailable or hardware support is limited. |
| Develop a mobile application | Implemented student and operations mobile workflows using Expo React Native and the mobile API. | Improves accessibility for students and supports mobile field operations for authorized staff. |
| Implement election voting | Implemented election lifecycle management, candidate approval, eligibility checks, immutable voting, and result visibility. | Supports more structured student elections and reduces duplicate or ineligible voting risks. |
| Provide public communication modules | Implemented public portal exposure for announcements, events, documents, executives, election information, and permit request access. | Creates a more reliable source for official SRC communication. |
| Implement audit logging | Implemented audit records for sensitive actions across permits, payments, NFC cards, verification, elections, accounts, and content. | Improves accountability and supports later review of administrative decisions. |
| Provide reporting and analytics summaries | Implemented dashboard summaries, report groupings, operational warnings, and activity feeds. | Gives executives and administrators better visibility into system activity and unresolved workflows. |
| Secure the system through controlled access | Implemented RBAC, permission middleware, Sanctum token authentication, validation, rate limiting, hashed identifiers, and public/private data separation. | Protects sensitive operations and supports safer governance workflows. |
| Evaluate the system through testing | Covered core workflows through automated and manual validation planning. | Provides evidence that major workflows behave according to expected requirements. |

The first major objective was to design a centralized operations dashboard. This objective was achieved through a dashboard that brings together student management, permit management, payments, NFC cards, verification, elections, polls, content publishing, audit logs, reports, roles, permissions, and settings. The institutional value of this dashboard is that it reduces the operational distance between related records. A permit is no longer treated as an isolated item. It can be connected to a student record, a payment record, an NFC card, a verification log, and an audit event.

The student management objective was achieved by implementing student profile management, academic period linkage, account activation, and configurable reference options. This outcome is important because many other workflows depend on reliable student identity data. Elections require student eligibility checks, permits require student ownership, mobile access requires account linkage, and verification requires accurate student records. A weak student record foundation would undermine the rest of the platform.

Permit management was achieved through lifecycle handling for permits. The system supports issuing, revoking, delivering, verifying, and tracking permit records. It also protects permit codes through hashing and uses display-safe last-four values where needed. This improves permit integrity because verification does not depend only on visible paper or manually remembered details. The system can determine whether a permit exists, whether it is active, whether it belongs to the student presented, and whether it is usable for the relevant academic period.

The self-service permit issuance objective was achieved through permit request workflows available through student-facing channels. Students can initiate permit requests, proceed to payment, and receive system-managed status updates. The value of this feature is that it reduces physical dependency for routine permit access. It also gives the institution a better record of request status, payment attempts, recovery needs, and issuance results.

Payment integration was achieved through Paystack. The implementation uses payment initialization, server-side verification, callback handling, webhook handling, retry support, and recovery workflows. This is important because permit issuance should not rely only on a student's claim of payment or a browser redirect. Server-side verification gives the system a more reliable basis for deciding whether a permit request should be completed.

NFC verification was achieved through NFC card registration, replacement, revocation, UID normalization, HMAC hashing, and scan-based verification. The implementation recognizes that NFC is useful only when it is part of a controlled workflow. A scanned card must be linked to an active record and evaluated against permit status. The system also logs verification events, which supports accountability when a card is checked.

The fallback verification objective was achieved by supporting student number and permit code verification. This decision strengthens the operational design because NFC cannot be guaranteed on every device or in every situation. Some Android devices support the required NFC workflows, while other devices or platforms may restrict NFC behavior. By retaining other verification methods, the system avoids making field verification depend entirely on one hardware capability.

The mobile application objective was achieved through an Expo React Native application supported by a Laravel mobile API. The mobile application allows students to view personal information, permits, permit requests, payments, content, elections, and NFC card status. It also supports selected operations features for authorized staff. This outcome improves accessibility because students and field users are not limited to desktop dashboard access.

The election voting objective was achieved through a dedicated election module. The system supports election setup, positions, candidates, candidate approval, voting windows, eligibility checks, immutable vote casting, duplicate vote prevention, and controlled result visibility. This implementation treats elections differently from polls, which is necessary because election voting affects student representation and requires stricter controls.

The public communication objective was achieved through public portal content for announcements, events, documents, executive information, and election information. This gives the SRC a more organized channel for official communication. It also separates public information from private administrative records, which is important for both accessibility and data protection.

Audit logging was achieved through records of sensitive actions. The system logs relevant operations such as permit issuance, payment verification, NFC card registration, account activation, candidate approval, election voting, content publication, and administrative changes. This supports accountability because important events can be reviewed later instead of depending entirely on memory, paper forms, or informal messages.

Reporting was achieved through operational summaries, activity feeds, counts, warnings, and module-specific report groupings. This outcome supports executive oversight. For example, the system can surface students without activated accounts, students without active NFC cards, permits expiring soon, stuck permit requests, and paid requests requiring recovery. Such information helps staff and executives respond to operational issues before they become larger disputes.

Security objectives were addressed through RBAC, permission checks, Sanctum authentication, request validation, rate limiting, hashed identifiers, public/private data separation, and safer logging practices. These mechanisms do not remove every possible security risk, but they establish a stronger control structure than an informal or manual system. They also create a basis for future security reviews and policy enforcement.

Finally, the objective of evaluating the system was addressed through planned and documented testing across core modules. Automated tests covered many backend workflows, while manual validation and screenshot preparation remain part of final project evidence. Testing was not treated as a separate afterthought. It was connected to the highest-risk workflows: payment verification, NFC verification, election voting, authorization, and mobile API access.

## 5.4 Conclusions

The project set out to design and implement an NFC-based student permit verification and governance management system for Knutsford University. Based on the completed analysis, design, implementation, and testing, the study concludes that the proposed system provides a practical and technically grounded response to the institutional problems identified in Chapter One. It addresses fragmentation by bringing student records, permits, payments, NFC cards, verification, elections, public communication, audit logging, and reporting into one coordinated platform.

One of the main conclusions is that student permit verification becomes more reliable when it is supported by structured digital records rather than by physical inspection alone. Manual verification can still have a place in institutional operations, but it is limited when records must be confirmed quickly or reviewed later. The implemented system improves this process by allowing authorized users to verify a student through NFC, permit code, or student number. The inclusion of multiple verification methods is important because it gives the institution flexibility. NFC supports faster contactless verification where supported, while permit code and student number checks provide alternatives when NFC is not available.

The study also concludes that payment verification is stronger when it is connected directly to permit request workflows. In a manual process, students may present receipts, screenshots, or verbal claims of payment, and staff may need to reconcile these against separate records. The implemented system improves this by connecting self-service permit requests to Paystack initialization, callback processing, webhook verification, server-side confirmation, and recovery handling. This does not remove the need for administrative oversight, but it reduces uncertainty by giving the system a traceable payment-to-permit pathway.

Another conclusion is that a student governance platform should treat elections as a sensitive governance process rather than as a simple voting feature. The implementation separates elections from general polls and applies stricter rules to election voting. Candidate approval, eligibility checks, voting windows, one-vote restrictions, immutable vote records, and controlled result visibility all contribute to a more credible election workflow. This is significant because student elections affect representation, and the process must be verifiable enough to support confidence in the result.

The project also shows the value of mobile access in student governance. Students are more likely to interact with governance services through mobile devices than through office visits or desktop-only systems. The mobile application supports permit viewing, permit requests, payment return handling, election voting, content access, and NFC card status. Authorized staff can also use mobile features for verification and operational checks. This improves accessibility, but it also required careful API design. Student endpoints had to be scoped to personal records, while operations endpoints required permission-based access.

Security and accountability are central conclusions of the study. The implemented system does not assume that digitization alone creates trust. Instead, trust is supported through specific controls: RBAC, permission middleware, Sanctum token authentication, request validation, rate limiting, hashed permit codes, hashed NFC UIDs, server-side payment verification, immutable election votes, and audit logging. These controls help ensure that sensitive operations are restricted, traceable, and less dependent on informal handling.

The audit logging and reporting components are especially relevant to institutional accountability. In manual systems, it may be difficult to determine who issued a permit, who verified a payment, who registered a card, who approved a candidate, or who published content. The implemented system records important actions and exposes summaries that help executives and administrators review operational activity. This does not replace governance policy or human responsibility, but it provides better evidence for review and decision-making.

The system is also maintainable because it separates major concerns. The Laravel backend coordinates core business logic, the dashboard supports administrative workflows, the public portal exposes approved public content, and the mobile API supports student and staff mobile use. This structure allows related workflows to share the same data foundation without forcing every user group into the same interface. It also gives future developers a clearer basis for extending the system, since modules such as permits, NFC cards, elections, payments, audit logs, and mobile endpoints follow defined responsibilities.

The project does have practical constraints. It depends on internet connectivity, compatible devices, deployment infrastructure, payment gateway availability, staff training, and institutional adoption. These constraints do not invalidate the system. They show that successful deployment must include operational planning in addition to software readiness. A technically complete system can still fail to deliver value if users are not trained, policies are unclear, or required devices and services are not available.

Overall, the study concludes that the implemented system is a realistic and institutionally relevant solution for improving student governance operations at Knutsford University. It provides a stronger structure for permit management, identity verification, payment traceability, election voting, public communication, auditability, and reporting. Its main contribution is the integration of these workflows into a single student governance platform while preserving role boundaries, mobile accessibility, and security controls.

## 5.5 Limitations of the Implemented System

Although the system addresses the main objectives of the study, some limitations remain. These limitations are expected in a final year project of this scope and should be considered during deployment, maintenance, and future improvement. They do not remove the value of the system, but they define the conditions under which the system can operate effectively.

The first limitation is dependence on internet connectivity. The dashboard, public portal, mobile application, Paystack verification, mobile API, audit logging, and reporting all require network access to communicate with the backend. If internet connectivity is unavailable or unstable, students may be unable to submit permit requests, staff may be unable to verify permits in real time, and payment confirmation may be delayed. This limitation is important for field verification activities where network coverage may vary.

The second limitation concerns NFC hardware support. NFC verification depends on compatible devices and readable NFC cards. Not all smartphones support the same NFC capabilities, and some devices may restrict NFC operations depending on the operating system. Android devices generally provide better support for NFC workflows than iOS devices in many custom scanning contexts, but hardware behavior can still vary. The system addresses this partly by supporting student number and permit code verification, but full NFC convenience requires suitable devices.

A related limitation is the handling of NFC card replacement and loss. The system supports replacement, revocation, and lost-card reporting, but the operational success of these workflows depends on user discipline. Students must report lost cards, staff must revoke or replace cards promptly, and verification officers must rely on current system data rather than assumptions about old cards. The software provides the control mechanism, but institutional procedures determine how reliably it is used.

The third limitation is payment gateway dependency. The self-service permit issuance workflow depends on Paystack for payment initialization, callbacks, webhooks, and verification. If the gateway is unavailable, delayed, misconfigured, or affected by network issues, permit request completion may also be delayed. The system includes recovery workflows and admin retry verification, but it cannot fully control external payment gateway availability.

The fourth limitation is deployment infrastructure. The system requires a reliable server environment, database service, queue workers, scheduler configuration, HTTPS, storage permissions, environment secrets, and webhook configuration. A weak deployment environment can reduce system reliability even if the application code is correct. For example, queue workers must run consistently for queued notifications and background work. HTTPS must be configured correctly to protect dashboard sessions, mobile bearer tokens, and Paystack webhook communication.

The fifth limitation is operational training. Users must understand their roles in the system. Administrators and SRC executives need training on student management, permit workflows, payments, NFC cards, elections, content publishing, audit logs, and reporting. Verification officers need training on NFC scanning, permit code verification, student number verification, and interpretation of verification results. Students also need basic guidance on account activation, permit requests, payment return steps, and election voting. Without training, users may misuse features or bypass the system through informal processes.

The sixth limitation is institutional adoption. A student governance platform becomes effective only when the institution agrees on how it should be used. Policies must define which officers can issue permits, approve payments, register NFC cards, manage elections, publish content, view reports, and review audit logs. If these rules are unclear, role-based permissions may be technically correct but operationally confusing. The system therefore needs governance policy alignment before full use.

The seventh limitation is scalability assumptions. The system was designed with maintainability and future scalability in mind, but full production scaling depends on real usage volume. Database-backed queues and cache systems are appropriate for a controlled deployment, but higher transaction volumes may require Redis, dedicated queue monitoring, stronger database tuning, and more advanced infrastructure. These needs should be evaluated after observing actual traffic from students, executives, and staff.

The eighth limitation is the absence of offline synchronization. The current implementation assumes that verification and mobile workflows communicate with the backend when actions occur. Offline NFC scanning with later synchronization is not included in the implemented system. This means verification activities in areas without connectivity may require fallback methods or delayed checks. Offline synchronization is possible as future work, but it would require careful conflict handling, secure local storage, and replay protection.

The ninth limitation is limited advanced analytics. The reporting module provides operational summaries, counts, warnings, and activity feeds. It does not yet provide predictive analytics, anomaly detection, trend forecasting, or advanced visual dashboards for governance planning. This is acceptable for the current project scope because the main objective was to build a functional governance and verification platform. However, future versions could use collected data to support deeper decision-making.

The tenth limitation relates to broader identity assurance. NFC cards, student numbers, permit codes, and authenticated accounts improve verification, but they do not provide biometric confirmation. A student could still share credentials or attempt to misuse another person's card if operational checks are weak. The system reduces such risks through registration, revocation, logging, and fallback verification, but stronger identity assurance would require additional controls such as biometric verification, photo checks, or institutional ID integration.

## 5.6 Recommendations

The completed system provides a strong basis for improving student governance operations, but successful use will depend on how it is deployed, administered, monitored, and extended. The following recommendations are grouped into institutional, technical, and security recommendations.

### 5.6.1 Institutional Recommendations

Knutsford University and the SRC should adopt a structured deployment plan before moving the system into full production use. Deployment should begin with a pilot phase involving a limited group of students, executives, and verification officers. This would allow the institution to observe real workflows, identify training gaps, confirm NFC device behavior, test Paystack configuration, and refine procedures before wider rollout.

The institution should define clear governance policies for system use. These policies should specify who may create student records, activate accounts, issue permits, approve permit requests, verify payments, register NFC cards, revoke cards, manage elections, publish public content, access audit logs, and view reports. The policy should also define escalation procedures for disputed payments, lost cards, failed verification, candidate appeals, and election complaints.

Staff and executive training should be conducted before full deployment. Training should not focus only on where to click in the dashboard. It should explain why workflows must be followed, how audit logs support accountability, how payment verification should be interpreted, and why role permissions must be respected. Verification officers should receive practical training using real or sample NFC cards, permit codes, and student number checks.

Students should also receive orientation on account activation, permit requests, payment flow, mobile access, election voting, and lost NFC card reporting. This can be done through short guides, orientation sessions, public portal announcements, or student help documents. Student awareness is important because the system depends on students using official workflows rather than informal channels.

The SRC should treat the public portal as an official communication channel. Announcements, events, documents, executive information, and election information should be published through the portal in a timely manner. This would reduce dependence on scattered messaging groups and improve the reliability of student-facing communication.

The institution should maintain operational procedures for NFC cards. Card issuance, replacement, revocation, and lost-card handling should follow defined steps. A lost card should be reported quickly, revoked in the system, and replaced through an authorized process. This is necessary because an NFC verification system is only as reliable as its card lifecycle management.

### 5.6.2 Technical Recommendations

The system should be deployed in an environment that supports stable backend operation, database reliability, queue workers, scheduled tasks, HTTPS, and secure environment variables. Production deployment should not rely on informal server setup. It should include documented deployment commands, backup procedures, service monitoring, and recovery steps.

Queue and cache infrastructure should be reviewed after initial usage. The current database-backed approach is practical for early deployment, but Redis and a queue monitoring tool such as Laravel Horizon may be considered if background jobs increase. This would improve queue visibility, worker supervision, and operational response.

Monitoring should be expanded beyond basic health checks. The institution should monitor application uptime, queue status, failed jobs, database performance, payment webhook failures, authentication errors, and unusual verification patterns. Monitoring is useful because governance systems often fail quietly when background services or integrations stop working.

The reporting module should be extended gradually based on user needs. Initial reports should focus on operational questions such as active permits, unpaid requests, stuck permit requests, failed verification attempts, students without active NFC cards, election participation, and content publication status. More advanced analytics should be added only after the institution understands which metrics are useful.

The mobile application should continue to be tested across different Android devices because NFC support and device behavior can vary. If iOS support is required for NFC workflows, the project should evaluate Apple platform restrictions carefully before promising feature parity. Clear device requirements should be documented for staff who perform verification.

Backup and recovery procedures should be implemented before production use. The system stores important student, permit, payment, election, and audit records. Regular database backups, storage backups, restore testing, and secure backup retention policies should be established. A backup that has never been restored should not be considered proven.

### 5.6.3 Security Recommendations

Periodic permission audits should be performed. Roles and permissions can become inaccurate when executives change, staff responsibilities shift, or temporary access is granted and not removed. A scheduled review should confirm that each user has only the access required for current duties.

The institution should protect production secrets carefully. Application keys, database passwords, Sanctum-related secrets, permit hash keys, NFC UID hash keys, Paystack secret keys, and webhook secrets should never be stored in public repositories, screenshots, shared documents, or unsecured devices. Access to server environment files should be limited.

Audit logs should be reviewed, not only stored. The value of audit logging depends on whether responsible users examine suspicious or important activity. The institution should define who reviews audit logs, how often reviews occur, and what actions require investigation. Examples include repeated failed verification, unusual payment recovery attempts, frequent card replacement, permission changes, and election-related administrative actions.

Payment verification procedures should remain server-side. Staff should avoid issuing permits based only on screenshots, messages, or redirect pages. If a payment appears incomplete or delayed, the recovery workflow and admin retry verification should be used. This protects both students and the SRC by keeping payment decisions tied to verified records.

Election security should receive special attention during election periods. Candidate approvals, voter eligibility, voting windows, result visibility, and administrative access should be reviewed before elections start. During voting, audit logs and system status should be monitored. After voting, results should be preserved and exported through approved procedures where necessary.

The institution should establish a security review schedule. At minimum, reviews should cover dependencies, framework updates, access control, rate limiting, logging, backup security, webhook configuration, server patches, and mobile API exposure. This will help keep the system reliable after the final year project submission.

## 5.7 Suggestions for Future Work

The implemented system provides a strong foundation, but several improvements could make future versions more capable and resilient. These suggestions are realistic extensions of the current platform rather than unrelated features.

### 5.7.1 Push Notification System

Future work may add push notifications for the mobile application. Notifications could alert students when a permit request is approved, payment is verified, a permit is issued, an election opens, an announcement is published, or an event is approaching. For executives and staff, notifications could identify pending permit reviews, failed payment verification, stuck requests, or election actions requiring attention. This would reduce dependence on users manually checking the platform for updates.

### 5.7.2 Offline NFC Synchronization

Offline NFC synchronization would improve verification in areas with poor internet connectivity. In such a design, authorized devices could temporarily store a limited, encrypted set of verification data and sync logs when connectivity returns. This feature would be useful during events, examinations, or field activities where network access is unreliable. It would require careful design because offline verification introduces risks such as stale data, device loss, replay attempts, and synchronization conflicts.

### 5.7.3 QR-Code Fallback Verification

A QR-code fallback could complement NFC and permit code verification. The system could generate secure QR codes linked to permit records, allowing authorized scanners to verify permits even when NFC hardware is unavailable. This would be especially useful for devices without NFC support. The QR code should not expose raw sensitive data; it should use a signed or tokenized reference that the backend verifies.

### 5.7.4 Biometric Verification

Future versions could explore biometric verification for high-risk workflows. Biometric checks such as fingerprint or face verification may help reduce impersonation during elections, permit checks, or sensitive student services. This feature should be approached carefully because biometric data creates privacy and legal responsibilities. If implemented, biometric processing should follow institutional policy, consent requirements, secure storage practices, and relevant data protection expectations.

### 5.7.5 AI-Assisted Fraud Detection

The audit logs, verification logs, payment records, permit request records, and card replacement histories could support anomaly detection in future work. An AI-assisted fraud detection feature could flag unusual patterns such as repeated failed verification attempts, frequent lost-card reports, suspicious payment recovery activity, or abnormal permit issuance behavior. Such a system should assist administrators rather than automatically punish users. Human review would still be necessary before action is taken.

### 5.7.6 Advanced Election Analytics

The election module could be expanded with advanced analytics for voter turnout, position-level participation, candidate approval timelines, abstention patterns, and result comparison across academic periods. These analytics would help the SRC understand student engagement and improve election planning. Care should be taken to avoid exposing individual voter choices, since vote privacy is central to election credibility.

### 5.7.7 Student Analytics Dashboard

A future student analytics dashboard could provide insights into account activation, permit uptake, event participation, document access, and engagement with governance content. This would help executives make evidence-based decisions about student services. The dashboard should use aggregated data and avoid unnecessary exposure of individual student behavior.

### 5.7.8 Real-Time Communication Features

The system could be extended with real-time communication features such as in-platform messages, moderated student feedback, support tickets, or live election notices. This would reduce dependence on external messaging platforms. However, real-time communication requires moderation policies, notification controls, and clear boundaries between official SRC communication and informal conversation.

### 5.7.9 Expanded Mobile Functionality

The mobile application can be expanded to include richer profile management, document downloads, event registration, permit renewal reminders, payment history, executive contact options, and feedback forms. These additions would make the mobile application a more complete student governance access point. They should be introduced gradually so that the application remains usable and does not become crowded.

### 5.7.10 Cloud-Native Scaling

Future deployment could move toward cloud-native infrastructure with managed databases, object storage, load balancing, container orchestration, automated backups, centralized logging, and autoscaling. This would be useful if the system expands beyond a small deployment or supports multiple institutions. The current system provides a basis for this because the backend, database, queue workers, mobile API, and public portal can be separated operationally.

### 5.7.11 Multi-Campus Support

If Knutsford University or a similar institution operates across multiple campuses, the system could be extended to support campus-specific permits, roles, reports, content, verification locations, and election structures. Multi-campus support would require careful data modeling so that users see the right records without duplicating the entire system for each campus.

### 5.7.12 Advanced Monitoring and Incident Response

Future work could add a stronger monitoring and incident response module. This could include failed login monitoring, webhook failure alerts, queue failure alerts, unusual permission changes, high-volume verification attempts, and system health dashboards. A governance platform handles sensitive workflows, so administrators need early visibility when something behaves unexpectedly.

### 5.7.13 Automated Policy Enforcement

The platform could be extended to enforce more institutional policies automatically. For example, permit eligibility could depend on academic status, payment category, semester registration, or disciplinary restrictions if such data becomes available. Election eligibility could also be linked to academic level, faculty, programme, or membership category. This would require integration with broader university systems and careful policy approval.

### 5.7.14 Integration With Institutional Student Information Systems

Future versions could integrate with the university's official student information system where available. This would reduce duplicate student data entry and improve consistency between academic records and governance records. Such integration should use secure APIs or controlled data imports rather than manual copying. It would also require agreement on data ownership, update frequency, and error handling.

### 5.7.15 Extended Research on Student Acceptance

Further research could study student and staff acceptance of NFC-based verification and digital governance workflows. A usability study, survey, or interview-based evaluation could examine whether students find the mobile application accessible, whether staff trust the verification process, and whether executives find reports useful. This research would provide evidence beyond technical correctness and help improve the system for actual users.

## 5.8 Final Closing Statement

This study designed and implemented an NFC-based student permit verification and governance management system for Knutsford University. The project addressed practical weaknesses in manual and fragmented student governance workflows by providing a centralized platform for permits, payments, NFC verification, elections, public communication, audit logging, reporting, and mobile access.

The completed system shows that student governance can be improved when related workflows share consistent records and controlled access rules. Its contribution is practical as well as technical: it supports faster verification, clearer payment traceability, more structured elections, better public communication, and stronger accountability. While the system still requires proper deployment, user training, institutional policy alignment, and future enhancement, it provides a credible foundation for modernizing student governance operations at Knutsford University.

The dissertation therefore concludes with the view that the proposed system is relevant, feasible, and suitable for continued development. The next parts of the report should present the references and appendices, including supporting materials such as screenshots, API contracts, test evidence, database extracts, and deployment documentation.
