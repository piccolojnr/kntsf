# Appendix K — Permission Matrix

This appendix summarizes role and permission configuration from `config/app-permissions.php` and Spatie Laravel Permission seeding. Backend middleware and policies enforce these permissions on dashboard and mobile routes.

## K.1 System Roles

| Role | Description |
| --- | --- |
| super_admin | Full system access through wildcard permission assignment. |
| admin | Full governance administration across students, permits, payments, content, elections, and settings. |
| staff | Operational access for students, permits, verification, NFC cards, payments, and limited content review. |
| student | Personal dashboard access, permit viewing, payments, polls, elections, and profile settings. |

## K.2 Permission Inventory by Module

| Module | Permission |
| --- | --- |
| dashboard | `dashboard.view` |
| users | `users.view` |
| users | `users.create` |
| users | `users.update` |
| users | `users.delete` |
| executives | `executives.view` |
| executives | `executives.create` |
| executives | `executives.update` |
| executives | `executives.delete` |
| executives | `executives.activate` |
| executives | `executives.manage_profiles` |
| roles | `roles.view` |
| roles | `roles.manage` |
| students | `students.view` |
| students | `students.create` |
| students | `students.update` |
| students | `students.delete` |
| students | `students.import` |
| students | `students.activate_account` |
| academic_periods | `academic_periods.view` |
| academic_periods | `academic_periods.manage` |
| permits | `permits.view` |
| permits | `permits.issue` |
| permits | `permits.revoke` |
| permit_requests | `permit_requests.view` |
| permit_requests | `permit_requests.manage` |
| permit_settings | `permit_settings.view` |
| permit_settings | `permit_settings.update` |
| nfc_cards | `nfc_cards.view` |
| nfc_cards | `nfc_cards.manage` |
| verification | `verification.perform` |
| verification | `verification.view_logs` |
| payments | `payments.view` |
| payments | `payments.manage` |
| settings | `settings.view` |
| settings | `settings.update` |
| audit_logs | `audit_logs.view` |
| reports | `reports.view` |
| announcements | `announcements.view` |
| announcements | `announcements.create` |
| announcements | `announcements.update` |
| announcements | `announcements.publish` |
| announcements | `announcements.delete` |
| events | `events.view` |
| events | `events.create` |
| events | `events.update` |
| events | `events.publish` |
| events | `events.delete` |
| documents | `documents.view` |
| documents | `documents.create` |
| documents | `documents.update` |
| documents | `documents.publish` |
| documents | `documents.delete` |
| polls | `polls.view` |
| polls | `polls.create` |
| polls | `polls.update` |
| polls | `polls.publish` |
| polls | `polls.delete` |
| polls | `polls.vote` |
| polls | `polls.view_results` |
| elections | `elections.view` |
| elections | `elections.create` |
| elections | `elections.update` |
| elections | `elections.publish` |
| elections | `elections.manage_candidates` |
| elections | `elections.vote` |
| elections | `elections.view_results` |
| elections | `elections.delete` |

## K.3 Role and Permission Matrix

| Permission | super_admin | admin | staff | student |
| --- | --- | --- | --- | --- |
| `dashboard.view` | Yes | Yes | Yes | Yes |
| `users.view` | Yes | Yes | — | — |
| `users.create` | Yes | Yes | — | — |
| `users.update` | Yes | Yes | — | — |
| `users.delete` | Yes | Yes | — | — |
| `executives.view` | Yes | Yes | — | — |
| `executives.create` | Yes | Yes | — | — |
| `executives.update` | Yes | Yes | — | — |
| `executives.delete` | Yes | Yes | — | — |
| `executives.activate` | Yes | Yes | — | — |
| `executives.manage_profiles` | Yes | Yes | — | — |
| `roles.view` | Yes | Yes | — | — |
| `roles.manage` | Yes | Yes | — | — |
| `students.view` | Yes | Yes | Yes | — |
| `students.create` | Yes | Yes | — | — |
| `students.update` | Yes | Yes | Yes | — |
| `students.delete` | Yes | Yes | — | — |
| `students.import` | Yes | Yes | — | — |
| `students.activate_account` | Yes | Yes | — | — |
| `academic_periods.view` | Yes | Yes | Yes | — |
| `academic_periods.manage` | Yes | Yes | — | — |
| `permits.view` | Yes | Yes | Yes | Yes |
| `permits.issue` | Yes | Yes | Yes | — |
| `permits.revoke` | Yes | Yes | Yes | — |
| `permit_requests.view` | Yes | Yes | Yes | — |
| `permit_requests.manage` | Yes | Yes | — | — |
| `permit_settings.view` | Yes | Yes | — | — |
| `permit_settings.update` | Yes | Yes | — | — |
| `nfc_cards.view` | Yes | Yes | Yes | — |
| `nfc_cards.manage` | Yes | Yes | — | — |
| `verification.perform` | Yes | Yes | Yes | — |
| `verification.view_logs` | Yes | Yes | Yes | — |
| `payments.view` | Yes | Yes | Yes | Yes |
| `payments.manage` | Yes | Yes | — | — |
| `settings.view` | Yes | Yes | Yes | Yes |
| `settings.update` | Yes | Yes | — | Yes |
| `audit_logs.view` | Yes | Yes | — | — |
| `reports.view` | Yes | Yes | Yes | — |
| `announcements.view` | Yes | Yes | Yes | — |
| `announcements.create` | Yes | Yes | — | — |
| `announcements.update` | Yes | Yes | — | — |
| `announcements.publish` | Yes | Yes | — | — |
| `announcements.delete` | Yes | Yes | — | — |
| `events.view` | Yes | Yes | Yes | — |
| `events.create` | Yes | Yes | — | — |
| `events.update` | Yes | Yes | — | — |
| `events.publish` | Yes | Yes | — | — |
| `events.delete` | Yes | Yes | — | — |
| `documents.view` | Yes | Yes | Yes | — |
| `documents.create` | Yes | Yes | — | — |
| `documents.update` | Yes | Yes | — | — |
| `documents.publish` | Yes | Yes | — | — |
| `documents.delete` | Yes | Yes | — | — |
| `polls.view` | Yes | Yes | Yes | Yes |
| `polls.create` | Yes | Yes | — | — |
| `polls.update` | Yes | Yes | — | — |
| `polls.publish` | Yes | Yes | — | — |
| `polls.delete` | Yes | Yes | — | — |
| `polls.vote` | Yes | Yes | — | Yes |
| `polls.view_results` | Yes | Yes | — | — |
| `elections.view` | Yes | Yes | Yes | Yes |
| `elections.create` | Yes | Yes | — | — |
| `elections.update` | Yes | Yes | — | — |
| `elections.publish` | Yes | Yes | — | — |
| `elections.manage_candidates` | Yes | Yes | Yes | — |
| `elections.vote` | Yes | Yes | — | Yes |
| `elections.view_results` | Yes | Yes | — | — |
| `elections.delete` | Yes | Yes | — | — |

## K.4 Module Access Summary

| Module | super_admin | admin | staff | student |
| --- | --- | --- | --- | --- |
| dashboard | Full | Full | Full | Full |
| users | Full | Full | — | — |
| executives | Full | Full | — | — |
| roles | Full | Full | — | — |
| students | Full | Full | Partial (2/6) | — |
| academic_periods | Full | Full | Partial (1/2) | — |
| permits | Full | Full | Full | Partial (1/3) |
| permit_requests | Full | Full | Partial (1/2) | — |
| permit_settings | Full | Full | — | — |
| nfc_cards | Full | Full | Partial (1/2) | — |
| verification | Full | Full | Full | — |
| payments | Full | Full | Partial (1/2) | Partial (1/2) |
| settings | Full | Full | Partial (1/2) | Full |
| audit_logs | Full | Full | — | — |
| reports | Full | Full | Full | — |
| announcements | Full | Full | Partial (1/5) | — |
| events | Full | Full | Partial (1/5) | — |
| documents | Full | Full | Partial (1/5) | — |
| polls | Full | Full | Partial (1/7) | Partial (2/7) |
| elections | Full | Full | Partial (2/8) | Partial (2/8) |

## K.5 Notes

- Executive profile management is controlled through `executives.*` permissions, typically assigned to admin users.
- Mobile staff operations require both role membership and endpoint-level permission checks.
- Student election and poll participation still depends on backend eligibility rules in addition to `elections.vote` and `polls.vote`.

