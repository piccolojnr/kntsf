# Final-Year Report Notes

## Proposed Project Title

Design and Implementation of an NFC-Based SRC Permit Verification and Student Services Platform.

## Problem Statement

Student permit verification, payment confirmation, student identity checks, announcements, elections, and operational reporting are often handled through fragmented manual processes. This creates delays, weak auditability, duplicate permit risks, and difficulty verifying students quickly during SRC operations.

## Objectives

- Build a centralized SRC dashboard for managing students, permits, payments, NFC cards, content, polls, and elections.
- Provide a public portal for published SRC information and self-service permit requests.
- Integrate Paystack for secure self-service permit payments.
- Provide NFC/manual verification with privacy-preserving logs.
- Expose a secure mobile API for future Expo mobile app workflows.
- Maintain audit logs and reports for accountability and operational oversight.

## Methodology

The project follows an iterative module-based development approach:

1. Foundation setup: roles, permissions, media, navigation, queues.
2. Core data modules: students, academic periods, permits, payments.
3. Verification modules: NFC cards and verification logs.
4. Administration modules: executives, roles, audit logs, reports.
5. Content modules: announcements, events, documents.
6. Participation modules: polls and elections.
7. Public portal and self-service permit flow.
8. Mobile API, security hardening, and recovery workflows.

## Technologies

- Laravel 13
- PHP 8.4
- Inertia v3
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn-style components
- Fortify
- Sanctum
- Spatie Permission
- Spatie Media Library
- Paystack API
- Pest PHP
- Laravel Herd

## Major Modules

- Student management and account activation
- Executive/user and role management
- Academic periods and permit settings
- Permit issuance and revocation
- Self-service permit request and Paystack payment
- Payment recovery and admin oversight
- NFC card lifecycle
- Manual and NFC verification
- Audit logs and operational reports
- Announcements, events, and documents
- Polls and elections
- Public portal
- Mobile API

## Testing Summary

The system uses Pest feature tests for:

- role/permission foundation
- student CRUD and activation
- permit issuance and duplicate prevention
- self-service permit requests
- Paystack callback/webhook/mobile verification
- payment recovery and expiry
- NFC card registration and verification
- mobile API restrictions
- public content visibility
- polls/elections voting constraints
- security hardening rules

Current full suite status from the latest sync: `php artisan test --compact` passed with 266 tests.

## Deployment Notes

Production deployment requires:

- HTTPS
- database migrations
- queue worker
- Laravel scheduler
- storage symlink
- strong app and hash keys
- Paystack keys
- cache and queue configuration
- secure logging configuration

## Screenshots Needed

Use `SCREENSHOT_CHECKLIST.md` as the working capture list.

## Diagrams Needed

Use `DIAGRAM_CHECKLIST.md` for architecture, data flow, payment flow, NFC flow, and election flow diagrams.

## Suggested Chapter Structure

1. Introduction
2. Literature/Technology Review
3. System Analysis and Requirements
4. System Design
5. Implementation
6. Testing and Evaluation
7. Deployment and Maintenance
8. Conclusion and Future Work

## Future Work

- Expo mobile app UI
- push notifications
- public mobile content browsing
- online payment reconciliation dashboard enhancements
- advanced analytics
- Redis/Horizon for higher queue volume
- public election result pages where appropriate
