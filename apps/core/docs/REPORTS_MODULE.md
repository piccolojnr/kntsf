# Reports and Dashboard Summary

## Purpose

The reports module provides lightweight operational counts for the modules already implemented. It is intentionally not a chart-heavy analytics system.

## Dashboard Summary

The dashboard uses `App\Support\DashboardSummary` for:

- total students
- activated student accounts
- pending setup student accounts
- active, expired, and revoked permits
- active NFC cards
- pending and successful payments
- verification attempts today
- failed verification attempts today
- stuck self-service permit requests
- paid but unissued permit requests

The same service also returns operational warnings, including:

- no active academic period
- permit requests disabled
- students without activated accounts
- students without active NFC cards
- permits expiring within 14 days
- self-service permit requests that need recovery

## Reports Page

Route:

```txt
GET /reports
```

Permission:

```txt
reports.view
```

The page groups counts by:

- Students
- Permits
- NFC Cards
- Payments
- Permit Requests
- Verification

Permit request reports include:

- paid but not issued
- awaiting payment but expired
- payment success but request failed
- successful payment without a linked permit

## Design Notes

Reports use existing database records only. No external chart library, analytics warehouse, or scheduled aggregation is included at this stage.

Future improvements can add exports, date filters, trend charts, and cached aggregates once operational workflows stabilize.
