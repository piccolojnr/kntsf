# Knutsford SRC Design System

## Direction

The dashboard UI should feel like an SRC operations console: quiet, dense, accountable, and fast to scan. It should not feel like a marketing landing page.

Use this direction across dashboard/admin pages:

- Graphite structure
- Parchment surfaces
- Brass highlights
- Teal success/active states
- Red risk/destructive states
- Sharp, compact panels with 8px or smaller radii

## Core Tokens

Primary tokens are defined in `resources/css/app.css`.

| Token | Use |
| --- | --- |
| `app-page` | Authenticated page background |
| `app-surface` | Main panels and page sections |
| `app-surface-muted` | Secondary panels, active nav, quiet blocks |
| `app-ink` | Main text |
| `app-muted` | Supporting text |
| `app-brass` | Focus, highlights, key accents |
| `app-teal` | Active, valid, success |
| `app-red` | Warnings, destructive, attention |
| `app-border` | Standard border |

## Layout Rules

- Authenticated pages should sit on `app-page`.
- Use full-width sections or simple panels, not nested cards.
- Keep panels rectangular with `rounded-md` or less.
- Prefer compact grids and tables over decorative layouts.
- Use `min-w-0` on grid/flex children that contain text, charts, or tables.
- Avoid viewport-scaled font sizes.

## Reusable Classes

Global component classes are available:

```txt
app-page
app-shell-surface
app-panel
app-panel-muted
app-kicker
app-muted
```

Use them for new module pages before adding one-off color utilities.

## Navigation

Sidebar links are grouped by operational area:

- Command
- People & Content
- Permit Operations
- Verification
- Administration

Navigation visibility must remain permission-aware through `filterNavItemsForUser`.

Active navigation uses brass and inset left emphasis. Do not replace this with generic muted pills.

## Tables And Lists

- Tables should stretch to their container width.
- Use clear row borders and compact cell padding.
- Empty states should be useful, not decorative.
- Status badges should use the shared module status components where available.

## Forms And Dialogs

- Small actions should use dialogs.
- Large content editing can use full pages.
- Destructive actions must use confirmation dialogs.
- Inputs should be grouped by operational meaning, not by database order.

## Charts

Use `resources/js/components/ui/chart.tsx` with Recharts.

- Keep charts lightweight.
- Use charts to compare operational counts, not to decorate.
- Long labels must truncate or shorten before they overflow.

## Dark Mode

Dark mode should retain the same material logic:

- dark graphite page
- dark panel surfaces
- brass highlights
- readable muted text

Do not introduce unrelated dark blue/purple palettes.

## Avoid

- Marketing hero sections inside the dashboard
- Nested cards
- Large rounded cards
- Purple gradients
- Decorative blobs/orbs
- Unscoped one-off color systems
- Public portal styles leaking into dashboard pages
