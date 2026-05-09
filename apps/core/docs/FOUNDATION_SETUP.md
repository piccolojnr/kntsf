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
