# Appendix A — Database Schema

This appendix summarizes the PostgreSQL-oriented relational schema implemented through Laravel migrations. The full Entity Relationship Diagram is presented in Chapter Three (Figure 3.4). This appendix provides table-level evidence for implementation and appendix cross-referencing.

## A.1 Core Database Tables

Table A.1: Core Database Tables

| Table | Primary purpose | Key relationships |
| --- | --- | --- |
| users | Authentication and account state | Linked to students, executives, audit actors |
| students | Student identity and academic profile | Belongs to user; has permits, requests, NFC cards, votes |
| academic_periods | Semester or term boundaries | Linked to permits and permit requests |
| permits | Issued student permits | Belongs to student and academic period |
| permit_requests | Self-service or assisted permit workflow | Links student, payment, academic period |
| payments | Paystack payment records | Linked to permit requests |
| nfc_cards | Registered NFC identifiers | Belongs to student; used in verification |
| verification_logs | Permit and identity verification events | References students, permits, cards, users |
| audit_logs | Sensitive administrative actions | Polymorphic subject and causer |
| elections | Student governance elections | Has positions, candidates, votes |
| election_positions | Offices within an election | Belongs to election |
| election_candidates | Approved candidates | Belongs to position and student |
| election_votes | Immutable vote records | Belongs to election, position, candidate, student |
| polls | Informal polls | Has options and votes |
| announcements | Public and dashboard announcements | Media attachments via media library |
| events | Governance events | Media attachments |
| documents | Published documents | Media attachments |
| executive_profiles | SRC executive public profiles | Linked to users |
| app_settings | Configurable institutional options | Key-value settings store |
| account_activation_tokens | Password setup workflow | Linked to users |

Supporting framework tables include `roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `personal_access_tokens`, `media`, `jobs`, `failed_jobs`, `job_batches`, `cache`, and `cache_locks`.

## A.2 Permit and Payment Relationships

Table A.2: Permit and Payment Relationships

| From | To | Relationship rule |
| --- | --- | --- |
| students | permits | One student may have multiple permits across periods; duplicate active permits are prevented in application logic |
| students | permit_requests | A student may create permit requests for an academic period subject to blocking rules |
| permit_requests | payments | A permit request may reference one verified payment record |
| permit_requests | permits | Successful completion may issue a permit record |
| payments | permit_requests | Payment verification updates request status before issuance |
| academic_periods | permits | Permits are scoped to an academic period |
| academic_periods | permit_requests | Requests are created against a selected or active period |

Sensitive permit fields use hashed storage. `permits.code_hash` stores the hashed permit code, while `code_last4` supports display-safe references during verification.

## A.3 Election Data Relationships

Table A.3: Election Data Relationships

| From | To | Relationship rule |
| --- | --- | --- |
| elections | election_positions | One election contains multiple positions |
| election_positions | election_candidates | Each position has approved candidates |
| election_candidates | students | Candidates are linked to student records |
| election_votes | elections | Votes belong to one election |
| election_votes | election_positions | Votes are cast per position |
| election_votes | election_candidates | Votes select one approved candidate |
| election_votes | students | One vote per student per position is enforced |

Election votes are treated as immutable once cast. Poll tables (`polls`, `poll_options`, `poll_votes`) follow a separate, less restrictive participation model.

## A.4 Verification and Audit Tables

Table A.4: Verification and Audit Tables

| Table | Stored evidence | Notes |
| --- | --- | --- |
| verification_logs | Method, result, student, permit, card reference, actor | Supports NFC, permit code, and student number checks |
| nfc_cards | Hashed UID, status, student link, lifecycle timestamps | Raw UID values are not exposed in API responses |
| audit_logs | Action, subject type, subject id, causer, metadata | Used for permits, payments, cards, elections, and content |

## A.5 Selected Column Summary

Table A.5: Selected Columns for High-Risk Entities

| Table | Important columns | Design note |
| --- | --- | --- |
| permits | code_hash, code_last4, status, starts_at, expires_at | Supports validity checks without exposing full permit codes |
| permit_requests | request_reference, status, amount, requires_review, review_status | Supports payment and manual review workflows |
| payments | reference, status, amount, currency, verified_at | Supports Paystack verification and recovery |
| nfc_cards | uid_hash, status, student_id, issued_at, revoked_at | Supports lifecycle management and secure lookup |
| election_votes | election_id, election_position_id, election_candidate_id, student_id | Supports duplicate-vote prevention |
| students | student_number, user_id, course, level | Central identity anchor for governance workflows |

## A.6 Schema Notes

- Migrations are version-controlled under `database/migrations/` and applied with `php artisan migrate`.
- Soft deletes are used on selected entities such as students and permits to preserve historical traceability.
- Foreign keys and indexes support reporting, verification, and expiry queries described in Chapters Three and Four.
- A raw SQL schema dump is not included because summarized tables are more readable for academic review.
