# Diagram Checklist

Use simple diagrams in the final report. Markdown/code-block diagrams are acceptable when external tools are not required.

## Required Diagrams

### System Architecture

Show:

- public portal
- dashboard
- mobile API
- Laravel controllers/actions
- database
- queues/cache
- Paystack

### ERD

Include core relationships:

- users
- students
- academic periods
- permits
- permit requests
- payments
- NFC cards
- verification logs
- audit logs
- announcements/events/documents
- polls/options/votes
- elections/positions/candidates/votes

### Authentication and Account Activation

Show:

- admin creates user/student link
- setup token creation
- setup password
- role assignment
- login

### Self-Service Permit Payment Flow

Show:

- student lookup
- permit request creation
- Paystack initialization
- payment verification
- permit issuance or review required

### Paystack Callback/Webhook Flow

Show:

- Paystack redirect
- callback endpoint
- webhook endpoint
- server-side verification
- idempotent completion
- admin recovery fallback

### NFC Verification Flow

Show:

- NFC UID input
- normalization
- HMAC hash
- card lookup
- student/permit lookup
- result
- verification log

### Mobile API Flow

Show:

- mobile login
- Sanctum token
- authenticated request
- student profile/permit request
- staff operations
- verification endpoint

### Election Voting Flow

Show:

- election setup
- positions
- candidates
- approval
- student eligibility check
- immutable vote cast
- results visibility

### Public Portal Content Flow

Show:

- dashboard content creation
- draft/scheduled/published/archive lifecycle
- public visibility filter
- public page display

## Optional Diagrams

- Queue and notification flow
- Audit logging flow
- Media upload flow
- Role/permission access flow
