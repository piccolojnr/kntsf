## Proposed Final Year Project Report Structure

### Knutsford University

### Faculty of Computing & Data Science

---

# Working Report Title

## NFC-Based Student Permit Verification and Governance Management System for Knutsford University

Alternative refined title options:

1. Design and Implementation of an NFC-Based Student Governance and Permit Management System for Knutsford University
2. Development of a Secure Student Governance Platform with NFC Verification, Elections, and Mobile Integration
3. Design and Implementation of a Multi-Platform Student Governance Management System Using Laravel and Expo React Native

---

# Target Report Length

| Section             | Estimated Pages   |
| ------------------- | ----------------- |
| Front Matter        | 10–15             |
| Chapter One         | 10–15             |
| Chapter Two         | 25–35             |
| Chapter Three       | 35–45             |
| Chapter Four        | 40–50             |
| Chapter Five        | 10–15             |
| References          | 5–10              |
| Appendices          | 20–40             |
| **Estimated Total** | **155–210 pages** |

This distribution ensures the report comfortably exceeds the university minimum requirement without artificial padding.

---

# Front Matter Structure

## Front Cover

- University name
- Project title
- Student name
- Month and year

## Title Page

- University name
- Full project title
- Student name and index number
- Faculty and department
- Submission statement
- Month and year

## Declaration

- Candidate declaration
- Supervisor declaration

## Dedication

## Acknowledgement

## Abstract

Target:

- 200–250 words
- Single paragraph
- No citations
- No diagrams

## Table of Contents

## List of Tables

## List of Figures

---

# Main Report Structure

# CHAPTER ONE — INTRODUCTION

### Estimated Length: 10–15 Pages

## 1.1 Background to the Study

Topics:

- Student governance in universities
- Manual permit systems
- Challenges with traditional student verification
- Emergence of digital governance systems
- NFC technology in institutional systems
- Mobile-first student platforms
- Digital payment integration in academic systems

## 1.2 Statement of the Problem

Discuss:

- Manual verification delays
- Permit fraud and impersonation
- Poor election management systems
- Fragmented student communication
- Lack of centralized governance platform
- Inability to verify permits quickly
- Poor auditability and accountability

## 1.3 Aim of the Study

## 1.4 Objectives of the Study

### Main objective

### Specific objectives

Examples:

- Design a centralized governance platform
- Implement NFC verification
- Develop a self-service permit issuance system
- Integrate secure payment processing
- Build mobile election voting capability
- Develop audit and reporting systems

## 1.5 Research Questions

## 1.6 Significance of the Study

Discuss beneficiaries:

- Students
- SRC executives
- University administration
- Security personnel
- Future researchers

## 1.7 Scope of the Study

Include:

- Web dashboard
- Public portal
- Mobile app
- NFC verification
- Elections
- Payments
- Permit management
- Content management

## 1.8 Limitations of the Study

Examples:

- Dependence on internet connectivity
- NFC hardware limitations
- Android NFC write restrictions
- Time constraints
- Financial constraints

## 1.9 Organization of the Study

## 1.10 Definition of Terms

Terms:

- NFC
- Permit verification
- Laravel
- Expo React Native
- API
- Webhook
- RBAC
- Sanctum
- Queue workers
- Self-service permit issuance

---

# CHAPTER TWO — LITERATURE REVIEW AND REVIEW OF RELATED SYSTEMS

### Estimated Length: 25–35 Pages

## 2.1 Introduction

## 2.2 Theoretical Framework

### 2.2.1 Client-Server Architecture

### 2.2.2 Role-Based Access Control (RBAC)

### 2.2.3 Mobile Application Architecture

### 2.2.4 REST API Architecture

### 2.2.5 Digital Identity Verification Systems

### 2.2.6 Contactless Authentication Systems

### 2.2.7 Electronic Voting Systems

## 2.3 Technological Review

### 2.3.1 Laravel Framework

### 2.3.2 React and Inertia.js

### 2.3.3 Expo React Native

### 2.3.4 PostgreSQL

### 2.3.5 NFC Technology

### 2.3.6 Paystack Payment Gateway

### 2.3.7 Queue and Cache Systems

### 2.3.8 API Authentication Using Sanctum

## 2.4 Review of Existing Systems

### 2.4.1 Existing Student Permit Systems

### 2.4.2 Existing University Election Systems

### 2.4.3 Existing Student Identity Verification Systems

### 2.4.4 Existing NFC Attendance and Verification Systems

## 2.5 Comparative Analysis of Existing Systems

| Feature | Existing Systems | Proposed System |
| ------- | ---------------- | --------------- |

## 2.6 Gaps Identified in Existing Systems

## 2.7 Summary of Literature Review

---

# CHAPTER THREE — SYSTEM ANALYSIS AND DESIGN

### Estimated Length: 35–45 Pages

## 3.1 Introduction

---

# 3.2 Analysis of Existing System

## 3.2.1 Existing Manual Processes

### Permit issuance workflow

### Verification workflow

### Election workflow

### Student communication workflow

## 3.2.2 Problems With Existing System

## 3.2.3 System Request Definition

---

# 3.3 Analysis of Proposed System

## 3.3.1 Functional Requirements

### Student management

### Permit management

### NFC card management

### Verification system

### Payment system

### Election system

### Polling system

### Public portal

### Mobile app

### Audit logging

### Reporting

## 3.3.2 Non-Functional Requirements

### Security

### Scalability

### Reliability

### Maintainability

### Performance

### Availability

### Usability

## 3.3.3 User Interface Requirements

## 3.3.4 Hardware Requirements

## 3.3.5 Software Requirements

---

# 3.4 Design and Architecture of Proposed System

## 3.4.1 Overall System Architecture

### Figure Placeholder

[INSERT FIGURE — Overall System Architecture]

Discuss:

- Laravel backend
- Public portal
- Dashboard
- Mobile app
- Paystack integration
- NFC verification
- Database
- Queue workers

---

## 3.4.2 Database Design

### Entity Relationship Diagram

[INSERT FIGURE — ERD]

### Core entities

- Users
- Students
- Permits
- Payments
- Permit Requests
- NFC Cards
- Elections
- Votes
- Announcements
- Events
- Documents
- Audit Logs

### Data Dictionary

Potential tables:

| Table | Purpose |
| ----- | ------- |

---

## 3.4.3 System Logic Design

### Use Case Diagrams

- Student use case
- Staff use case
- Admin use case

### Flowcharts

- Permit issuance flow
- NFC verification flow
- Election voting flow
- Payment verification flow

### Sequence Diagrams

- Self-service permit request
- Paystack verification
- NFC scan verification
- Mobile voting process

---

## 3.4.4 Mobile API Design

### API architecture

### Authentication flow

### Request/response design

### Error handling

### Rate limiting

### Mobile resource serialization

---

## 3.4.5 Security Design

Topics:

- Sanctum authentication
- RBAC
- Permission middleware
- Token hashing
- Permit code hashing
- NFC UID hashing
- Rate limiting
- Queue isolation
- Validation
- Audit logging

---

## 3.4.6 User Interface Design

### Dashboard interfaces

### Mobile interfaces

### Public portal interfaces

### Verification interfaces

Include placeholders:
[INSERT FIGURE — Dashboard]
[INSERT FIGURE — Mobile App]
[INSERT FIGURE — Permit Request Screen]
[INSERT FIGURE — Election Voting Screen]

---

## 3.4.7 System Test Plan

### Unit testing

### Feature testing

### API testing

### NFC testing

### Payment testing

### Security testing

---

# CHAPTER FOUR — SYSTEM IMPLEMENTATION

### Estimated Length: 40–50 Pages

## 4.1 Introduction

---

# 4.2 Programming Languages and Technologies Used

## Backend

- PHP
- Laravel 13
- PostgreSQL

## Frontend

- React
- TypeScript
- Inertia.js

## Mobile

- Expo React Native

## Infrastructure

- Docker
- Queue workers
- Cache systems

---

# 4.3 Frameworks and Development Tools

### Laravel

### Expo

### Inertia.js

### TailwindCSS

### Shadcn UI

### TanStack Query

### Sanctum

### Spatie Permission

### Spatie Media Library

### Paystack

---

# 4.4 Module Implementation

This section will likely become the largest section.

---

## 4.4.1 Authentication and Authorization

### Account activation

### Role management

### Permission management

### Mobile token authentication

---

## 4.4.2 Student Management Module

### Student CRUD

### Student profiles

### Academic periods

### Permit settings

---

## 4.4.3 Permit Management Module

### Permit issuance

### Permit revocation

### Permit verification

### Self-service requests

### Recovery workflows

---

## 4.4.4 Payment Integration

### Paystack initialization

### Webhook verification

### Payment recovery

### Idempotent processing

### Permit request orchestration

---

## 4.4.5 NFC Module

### Card registration

### Card replacement

### Card revocation

### NFC verification

### Mobile NFC scanning

---

## 4.4.6 Election Module

### Election management

### Candidate approval

### Mobile voting

### Result visibility

### Immutable voting logic

---

## 4.4.7 Polling Module

## 4.4.8 Announcements Module

## 4.4.9 Events Module

## 4.4.10 Documents Module

## 4.4.11 Public Portal Module

## 4.4.12 Mobile API Module

## 4.4.13 Audit Logging Module

## 4.4.14 Reporting Module

---

# 4.5 Code Snippets and Evidence

Include:

- Laravel route examples
- API resources
- Queue jobs
- Verification logic
- Payment verification
- NFC handling
- React Native hooks

---

# 4.6 Testing and Results

### Unit testing results

### Feature testing results

### API testing results

### Security testing results

### Mobile testing results

### Payment testing results

### NFC testing results

### Election voting tests

Tables:
| Test Case | Expected Result | Actual Result | Status |

---

# 4.7 Deployment and System Documentation

### Deployment architecture

### VPS/Docker deployment

### Queue workers

### SSL configuration

### Environment configuration

### Mobile app builds

### API deployment

### Database migration strategy

---

# CHAPTER FIVE — SUMMARY, CONCLUSION, AND RECOMMENDATIONS

### Estimated Length: 10–15 Pages

## 5.1 Summary

### Summary of objectives achieved

### Summary of implemented modules

### Summary of methodologies used

---

## 5.2 Conclusions

Discuss:

- effectiveness of system
- scalability
- governance improvements
- security improvements
- usability outcomes

---

## 5.3 Recommendations

### Future enhancements

- Push notifications
- Offline NFC sync
- QR fallback verification
- AI analytics
- Advanced reporting
- Biometric integration

---

## 5.4 Areas for Further Research

---

# References

### Estimated Length: 5–10 Pages

Use APA referencing style as required by Knutsford University.

Potential categories:

- NFC research papers
- Laravel documentation
- React Native research
- RBAC literature
- Electronic voting systems
- Mobile security papers
- Payment integration research

---

# Appendices

### Estimated Length: 20–40 Pages

---

# APPENDIX A — Database Schema

# APPENDIX B — API Endpoints

# APPENDIX C — Laravel Route Lists

# APPENDIX D — Mobile API Contract

# APPENDIX E — Test Results

# APPENDIX F — Screenshots

# APPENDIX G — Code Snippets

# APPENDIX H — Deployment Configuration

# APPENDIX I — NFC Test Samples

# APPENDIX J — Payment Verification Logs

---

# Planned Figures

Examples:

| Figure     | Description                 |
| ---------- | --------------------------- |
| Figure 3.1 | Overall System Architecture |
| Figure 3.2 | Database ERD                |
| Figure 3.3 | Permit Request Flow         |
| Figure 3.4 | NFC Verification Flow       |
| Figure 3.5 | Election Voting Flow        |
| Figure 4.1 | Dashboard Login             |
| Figure 4.2 | Student Management Screen   |
| Figure 4.3 | Permit Request Screen       |
| Figure 4.4 | Mobile Election Screen      |
| Figure 4.5 | NFC Scan Interface          |

---

# Planned Tables

| Table     | Description                    |
| --------- | ------------------------------ |
| Table 2.1 | Comparison of Existing Systems |
| Table 3.1 | Functional Requirements        |
| Table 3.2 | Non-Functional Requirements    |
| Table 3.3 | Hardware Requirements          |
| Table 3.4 | Software Requirements          |
| Table 4.1 | Testing Results                |
| Table 4.2 | API Endpoint Summary           |

---

# Writing Strategy Notes

## Tone

- Formal academic writing
- Technical precision
- Avoid exaggerated AI-style phrasing
- Avoid excessive filler
- Use natural sentence variation

## Writing Style

- Explain architectural decisions clearly
- Justify technology choices
- Discuss tradeoffs honestly
- Use specific technical examples
- Keep implementation grounded in actual system behavior

## Important

Do not artificially inflate complexity. The project is already technically substantial enough to support a strong academic report naturally.
