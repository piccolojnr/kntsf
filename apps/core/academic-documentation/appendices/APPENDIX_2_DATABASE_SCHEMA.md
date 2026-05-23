# Appendix 2: Database Schema Summary

## 2.1 Core Tables

| Table | Purpose |
| --- | --- |
| students | Student biographical and academic identifiers |
| users | Authenticated accounts linked to students or staff |
| permits | Issued permit records and status |
| permit_requests | Self-service requests awaiting payment |
| payments | Paystack transaction references |
| nfc_cards | Registered cards with hashed UID |
| verification_logs | Verification attempts and outcomes |
| elections | Election metadata and windows |
| election_positions | Offices being contested |
| election_candidates | Approved candidates |
| election_votes | Cast votes |
| audit_logs | Sensitive action history |

## 2.2 Relationships

Students link to users, permits, NFC cards, and votes. Permit requests link to payments. Elections link to positions, candidates, and votes. Roles and permissions are managed through Spatie tables.

[INSERT FIGURE — Full ERD export if required by examiner]
