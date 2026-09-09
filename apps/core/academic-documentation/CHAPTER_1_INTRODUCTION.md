# CHAPTER ONE — INTRODUCTION

## 1.1 Background to the Study

Student governance at universities depends on reliable identification, permit issuance, payment confirmation, elections, and public communication. When these activities are handled manually or through disconnected tools, verification becomes slow, records are difficult to audit, and students receive inconsistent information. The Students' Representative Council (SRC) at Knutsford University coordinates permits, events, elections, and student-facing services that require accurate records and accountable workflows.

Digital governance platforms address this problem by linking student records, user accounts, permits, payments, and verification events in one system. Mobile access allows students to request permits, view status, and participate in elections without visiting offices repeatedly. Near Field Communication (NFC) supports faster permit verification when a registered card is presented to an authorized device. Digital payment integration through Paystack allows self-service permit requests while server-side verification confirms successful transactions before issuance.

This study develops a centralized NFC-based student permit verification and governance management system for Knutsford University. The platform connects an operations dashboard, public portal, and mobile application to shared backend rules for authentication, permits, payments, NFC verification, elections, audit logging, and reporting.

## 1.2 Statement of the Problem

SRC operations currently face fragmentation across manual permit checks, informal payment confirmation, separate communication channels, and limited election controls. Permit fraud and impersonation are possible when verification depends on visual inspection alone. Payment disputes arise when receipts cannot be matched quickly to permit requests. Election integrity suffers when eligibility and vote records are not enforced systematically. Executives lack consolidated reports on permits, payments, verification attempts, and student account activation. The study addresses the need for a coordinated, secure, and auditable student governance platform.

## 1.3 Objectives of the Study

The purpose of the study is to design and implement a centralized student governance platform for Knutsford University.

The specific objectives are to:

1. design an operations dashboard for students, permits, payments, content, elections, roles, and reports;
2. implement permit issuance, revocation, verification, and duplicate prevention;
3. integrate NFC-based verification with student number and permit code fallbacks;
4. provide self-service permit requests with Paystack payment verification;
5. develop a mobile application and API for student and staff workflows;
6. implement controlled election voting with candidate approval and eligibility checks;
7. publish governance content through a public portal;
8. record audit logs and operational reports for accountability;
9. enforce role-based access control across modules;
10. test authentication, permits, payments, NFC, elections, and API security.

## 1.4 Research Questions

1. How can a centralized platform improve permit management and reduce fragmentation in SRC operations?
2. How can NFC technology support faster and more reliable permit verification?
3. How can server-side payment verification reduce permit issuance errors?
4. How can mobile access improve student participation in governance services?
5. How can role-based access control and audit logging improve accountability?

## 1.5 Significance of the Study

The system benefits students through self-service permits and mobile access. SRC executives gain consolidated reporting and communication channels. Security and verification staff receive structured verification results. The university benefits from improved auditability and a reusable governance platform.

## 1.6 Scope of the Study

The study covers permit management, Paystack payment verification, NFC card registration and verification, election voting, public content, audit logging, reporting, and mobile API access for Knutsford University SRC operations. It does not replace the university's official student information system. Offline NFC verification and full production deployment are noted as future work.

## 1.7 Limitations of the Study

The evaluation used test data and controlled environments. NFC availability depends on compatible mobile hardware. Payment testing used Paystack test mode. Some literature sources require final verification before submission.

## 1.8 Organisation of the Study

Chapter Two reviews literature and related systems. Chapter Three presents system analysis and design. Chapter Four describes implementation and testing. Chapter Five summarizes findings, conclusions, and recommendations.

## 1.9 Definition of Terms

**Permit** — An SRC-issued authorization linked to a student and academic period. **NFC card** — A contactless card registered to a student for verification lookup. **Operations dashboard** — The authenticated web interface for SRC administrators. **Mobile API** — Sanctum-protected endpoints used by the mobile application. **Public portal** — The student-facing website for content and permit requests.
