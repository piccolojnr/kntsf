# CHAPTER TWO — LITERATURE AND REVIEW OF RELATED SYSTEMS

## 2.1 Introduction

This chapter reviews concepts and related systems that support the proposed NFC-based student governance platform. It covers the theoretical framework, technological base, review of two similar systems, comparative analysis, and the state of the art linked to this study.

## 2.2 Theoretical Framework

**Client-server architecture** places business rules, authentication, and data storage on a central server while clients such as web dashboards, public portals, and mobile applications present information to users (Tanenbaum & Wetherall, 2011). The proposed system applies this model so all clients share the same permit, payment, and election rules.

**Role-based access control (RBAC)** limits actions according to assigned roles and permissions (Sandhu et al., 1996). The dashboard separates student, executive, staff, and administrator capabilities so sensitive actions such as permit issuance and candidate approval are restricted.

**Digital identity verification** requires matching presented identifiers to authoritative records without exposing unnecessary personal data. NFC provides a contactless identifier, but permit validity must still be confirmed on the server.

Figure 2.1 illustrates the conceptual client-server relationship between clients, backend services, database, queue workers, and Paystack.

![Figure 2.1 Client-Server Architecture](diagrams/png/figure-2-1-client-server-architecture.png)

Figure 2.1: Client-Server Architecture

## 2.3 Technological Base

The backend uses **Laravel** for routing, validation, authorization, queues, and API resources. **PostgreSQL** stores relational governance data. **React with Inertia.js** delivers the operations dashboard. **Expo React Native** provides cross-platform mobile access. **Laravel Sanctum** issues bearer tokens for the mobile API. **Paystack** handles payment initialization and server-verified callbacks. **Spatie Permission** implements RBAC. **Redis** supports cache and queue drivers where configured.

Figure 2.4 presents the RBAC model used to separate administrative, staff, executive, and student responsibilities.

![Figure 2.4 Role-Based Access Control Model](diagrams/png/figure-2-4-rbac-model.png)

Figure 2.4: Role-Based Access Control Model

## 2.4 Review of Similar Systems

### 2.4.1 University of Ghana SRC e-Voting Platform

Several Ghanaian universities have adopted web-based SRC election platforms that allow students to authenticate and cast ballots online. Such systems typically provide candidate lists, position-based voting, and automated tallying. Strengths include convenience and faster result compilation than manual ballot counting. Limitations include weak integration with permit records, NFC verification, payment workflows, and broader governance reporting. Election data often exists separately from student service records.

### 2.4.2 KNUST Smart Attendance and NFC Campus Card Systems

Kwame Nkrumah University of Science and Technology and similar institutions have explored NFC and RFID attendance or access systems that read card identifiers and log presence events. These systems demonstrate fast contactless identification in campus settings. However, they usually focus on attendance or gate access rather than SRC permit lifecycle management, Paystack payment linkage, election voting, public communication, and audit logging for governance actions.

## 2.5 Comparative Analysis

Table 2.1 compares the reviewed systems with the proposed platform.

| Feature | UG SRC e-Voting (typical) | KNUST NFC attendance (typical) | Proposed system |
| --- | --- | --- | --- |
| Permit management | Limited or absent | Limited or absent | Central module |
| Payment verification | Not integrated | Not integrated | Paystack server verification |
| NFC verification | Not supported | Supported for attendance | Supported for permit lookup |
| Election voting | Supported | Not supported | Supported with eligibility rules |
| Public portal | Election-focused | Not supported | Announcements, events, documents |
| Audit logging | Basic | Event logs | Governance action audit trail |
| Mobile access | Web voting | Reader devices / apps | Student and staff mobile API |

Table 2.1: Comparative Analysis of Related Systems and the Proposed System

## 2.6 Electronic Voting and Payment Verification Concepts

Electronic voting systems improve convenience but require authentication, eligibility enforcement, immutable vote storage, and controlled result publication (ACE Electoral Knowledge Network, n.d.). The proposed election module applies these principles by binding votes to students, positions, and approved candidates rather than treating voting as an informal poll.

Payment gateways such as Paystack provide initialization, callback, and verification endpoints. Institutional systems should treat client redirects as insufficient proof of payment and should verify transactions server-side before completing permit requests (Paystack, n.d.). This reduces disputes when students present receipts that cannot be matched immediately to backend records.

## 2.7 Summary of Literature and State of the Art

Existing systems address parts of student governance—elections, attendance, or identity—but rarely combine permits, payments, NFC verification, elections, public communication, and reporting in one auditable platform. The proposed system fills this gap for Knutsford University SRC operations by integrating these workflows on a single Laravel backend with dashboard, portal, and mobile clients. Chapter Three translates these requirements into analysis and design for the implemented solution.
