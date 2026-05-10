# Audit Logs and Activity Timeline

## Purpose

Audit logs record important operational actions so the platform can answer who did what, when it happened, and which record was affected.

Activity feed support reuses audit logs to show recent lifecycle events on dashboards. It is intentionally lightweight for now and is not an analytics system.

## Audit vs Activity

| Concept | Tracks | Current implementation |
| --- | --- | --- |
| Audit log | Actor, event name, affected model, old/new values, request metadata | `audit_logs` table and `CreateAuditLogAction` |
| Activity event | Recent operational lifecycle summary | `ActivityFeed` reads latest audit logs |

## Event Names

Event names are centralized in `App\Support\AuditEvents`.

Current events:

```txt
student.created
student.updated
student.deleted
student.account_activated

permit.issued
permit.revoked
permit.card_delivered

payment.created
payment.successful
payment.failed
payment.cancelled

nfc.registered
nfc.replaced
nfc.lost
nfc.revoked

verification.performed
```

## Logged Data

Each audit log can store:

- actor user
- event name
- auditable model
- subject model
- description
- IP address and user agent
- old values
- new values
- metadata

Audit logs only have `created_at`; they should not be edited after creation.

## Privacy

Do not store raw sensitive identifiers in audit metadata. Verification identifiers, permit codes, and NFC UIDs should remain hashed or summarized with last-four values only.

Frontend visibility is not authorization. Access to `/audit-logs` is controlled by the `audit_logs.view` permission.

## Current Integrations

Audit logs are created for:

- student create/update/delete
- student account activation
- permit issue/revoke/card delivery
- manual payment create/success/failure/cancel
- NFC register/replace/lost/revoke
- manual verification attempts

## Future Improvements

- Add export capability for administrators.
- Add retained date windows and archival policy.
- Add actor/entity quick filters.
- Add notification hooks for critical audit events.
- Build analytics from aggregated audit/activity data later, not from the operational audit page.
