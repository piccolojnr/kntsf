# Foundation Setup

## Roles

Initial Spatie Permission roles:

| Role | Purpose |
| --- | --- |
| `super_admin` | Receives every configured permission. Use for local/project owners only. |
| `admin` | Administrative operations across dashboard, users, roles, students, permits, NFC cards, verification, payments, settings, and audit logs. |
| `staff` | Limited operational access for day-to-day student, permit, NFC, verification, payment viewing, and settings viewing workflows. |
| `student` | Student-safe access only. No user, role, student-management, permit-issuing, or payment-management permissions. |

## Permission Source

The single source of truth is:

```text
config/app-permissions.php
```

It contains grouped permission names and the initial role-to-permission mapping used by the seeder.

## Seeder

Run the roles and permissions seeder directly:

```bash
php artisan db:seed --class=RolesAndPermissionsSeeder
```

The main database seeder also calls `RolesAndPermissionsSeeder`.

## Optional Local Super Admin

If no users exist, `RolesAndPermissionsSeeder` can create a local super admin user. All three environment variables must be present:

```env
SUPER_ADMIN_NAME="Local Super Admin"
SUPER_ADMIN_EMAIL="admin@example.com"
SUPER_ADMIN_PASSWORD="password"
```

The password is hashed by the `User` model cast. Do not hardcode credentials in seeders or commit real local credentials.

## Authorization Warning

Frontend visibility is not authorization. Hiding sidebar items or buttons is only a user experience concern. Every protected action still needs backend authorization through middleware, policies, gates, or Form Request authorization.

## Media Library

Spatie Media Library is installed for future uploads, images, documents, thumbnails, responsive images, and named media collections.

Published foundation files:

```text
config/media-library.php
database/migrations/*_create_media_table.php
```

Default environment examples:

```env
MEDIA_DISK=public
MEDIA_QUEUE=media
QUEUE_CONVERSIONS_BY_DEFAULT=true
QUEUE_CONVERSIONS_AFTER_DB_COMMIT=true
```

Future models that accept media must explicitly implement `Spatie\MediaLibrary\HasMedia` and use `Spatie\MediaLibrary\InteractsWithMedia`. Do not attach media behavior to models until the related upload workflow exists.

Use named collections such as `avatar`, `documents`, `images`, or `attachments` on the model that owns the files. Validate all uploads with Form Requests before adding files to a media collection.

More detail is documented in `docs/MEDIA_STRATEGY.md`.

## Project Folders

Backend foundation folders:

```text
app/Actions
app/Enums
app/Events
app/Jobs
app/Mail
app/Notifications
app/Policies
app/Services
app/Support
```

Frontend foundation folders:

```text
resources/js/features
resources/js/navigation
resources/js/services
```

These folders are intentionally empty or near-empty until real features need them. The first real domain module is documented separately in `docs/STUDENTS_MODULE.md`.

Feature-specific React components should live under `resources/js/features/{feature}`. Inertia page entry points should stay under `resources/js/pages`.

Global starter components are grouped by purpose:

```text
resources/js/components/app
resources/js/components/navigation
resources/js/components/settings
resources/js/components/shared
resources/js/components/ui
```

Keep `components/ui` for shadcn-style primitives only. Domain-specific forms, lists, dialogs, and tables should live in their feature folder.

## Navigation

Navigation definitions are centralized under:

```text
resources/js/navigation/app-nav.ts
resources/js/navigation/settings-nav.ts
resources/js/navigation/filter-nav-items.ts
```

The navigation item shape supports `title`, `href`, `icon`, `permission`, `roles`, and `children`. The sidebar, header, mobile menu, and settings layout now import their navigation items from these files.

Permission-aware filtering is prepared through `filterNavItemsForUser()`, but it currently returns all items. Backend authorization remains the source of truth, and frontend filtering should only be added after safe role/permission props are shared with Inertia.

Starter repository/documentation footer links have been removed from the app navigation to reduce template noise.

## Frontend Tooling

This project uses `pnpm` for JavaScript dependencies and scripts:

```bash
pnpm install
pnpm run types:check
pnpm run lint
```

Do not use npm for this project, and do not commit `package-lock.json`.

## Dashboard Shell

The starter placeholder dashboard has been replaced with a minimal operations shell. It includes a welcome section, quick action placeholders, operational overview placeholders, and a recent activity placeholder. No business data, tables, or workflows are implemented yet.

## Queue Setup

Database queues are the default foundation queue driver:

```env
QUEUE_CONNECTION=database
```

Queue tables already exist. No worker is started automatically. Media conversions should be queued when conversions are introduced.

## Intentionally Not Implemented

- No permits, NFC, payments, elections, polls, news, events, or reports modules.
- No student account activation, imports, media attachments, or student-facing auth flows.
- No media collections attached to application models.
- No Sanctum/API token setup.
- No frontend permission filtering enforcement.
