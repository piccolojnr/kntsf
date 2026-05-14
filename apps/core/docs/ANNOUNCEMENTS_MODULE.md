# Announcements Module

The Announcements module is the first content module built on the shared content foundation.

## Model

Backend model:

```txt
App\Models\Announcement
```

Table:

```txt
announcements
```

Important fields:

- `author_id`: user who created the announcement
- `title`
- `slug`
- `excerpt`
- `content`
- `category`
- `status`: `draft`, `scheduled`, `published`, `archived`
- `visibility`: `public`, `internal`
- `is_featured`
- `published_at`
- `archived_at`
- `metadata`

Soft deletes are enabled.

## Publishing

The module uses:

- `App\Enums\PublishStatus`
- `App\Enums\Visibility`
- `App\Support\Publishing`
- `App\Support\SlugGenerator`

Published announcements receive a `published_at` timestamp if one is not provided. Archived announcements receive `status = archived` and `archived_at`.

## Media

Spatie Media Library collections:

- `featured_image`
- `gallery`

Image conversions are not implemented yet. Future conversions should use queued media conversions.

## Permissions

Configured permissions:

- `announcements.view`
- `announcements.create`
- `announcements.update`
- `announcements.publish`
- `announcements.delete`

Admins receive all announcement permissions. Staff can view announcements.

## Routes

Protected by `auth` and `verified`:

```txt
GET    /announcements
GET    /announcements/create
POST   /announcements
GET    /announcements/{announcement}
GET    /announcements/{announcement}/edit
PATCH  /announcements/{announcement}
POST   /announcements/{announcement}/publish
POST   /announcements/{announcement}/archive
DELETE /announcements/{announcement}
```

## Frontend

Page entry points:

```txt
resources/js/pages/announcements/index.tsx
resources/js/pages/announcements/create.tsx
resources/js/pages/announcements/edit.tsx
resources/js/pages/announcements/show.tsx
```

Feature components:

```txt
resources/js/features/announcements/components/announcement-form.tsx
resources/js/features/announcements/components/announcement-list.tsx
resources/js/features/announcements/components/announcement-status-badge.tsx
resources/js/features/announcements/components/announcement-featured-badge.tsx
```

Shared content components reused:

- publish status badge
- publish status select
- visibility badge
- textarea-backed rich text editor

## Audit Logs

Audit events:

- `announcement.created`
- `announcement.updated`
- `announcement.published`
- `announcement.archived`
- `announcement.deleted`

## Not Built Yet

- Public homepage listing
- Public announcement detail route
- Rich WYSIWYG editor
- Image conversions
- Commenting
- Push/mobile announcement delivery
