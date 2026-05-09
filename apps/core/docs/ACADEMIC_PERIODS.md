# Academic Periods

Academic periods define semester windows that future permits can attach to.

## Table

`academic_periods`

| Column | Purpose |
| --- | --- |
| `name` | Human-readable label, such as `2026/2027 First Semester`. |
| `academic_year` | Academic year grouping, such as `2026/2027`. |
| `semester` | Optional semester label. |
| `starts_at`, `ends_at` | Optional date range for the period. |
| `is_active` | Marks the current active period. |
| `metadata` | Reserved JSON extension point. |
| `deleted_at` | Soft delete support. |

## Active Period Rule

Only one academic period should be active at a time.

This is enforced by:

```txt
app/Actions/AcademicPeriods/SetActiveAcademicPeriodAction.php
```

The action runs in a transaction, deactivates any currently active period, then activates the selected period.

## Routes

```txt
GET    /academic-periods
POST   /academic-periods
PATCH  /academic-periods/{academic_period}
DELETE /academic-periods/{academic_period}
POST   /academic-periods/{academic_period}/set-active
```

## Permissions

```txt
academic_periods.view
academic_periods.manage
```

Admins and super admins can manage periods. Staff can view periods.

## Not Built Yet

- No permits table.
- No period usage checks against permits.
- No academic calendar automation.
- No student-facing period UI.
