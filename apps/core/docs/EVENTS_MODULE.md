# Events Module

## Purpose

The Events module manages SRC and student-facing events inside the dashboard. It uses the shared content foundation for publishing status, visibility, slug generation, media collections, and audit logging.

## Data Model

`events` stores event content and scheduling details:

- `organizer_id`: user who created/owns the event.
- `title`, `slug`, `description`, `excerpt`: core content fields.
- `location`, `category`: lightweight organization fields.
- `status`: `draft`, `scheduled`, `published`, or `archived`.
- `visibility`: `public` or `internal`.
- `is_featured`: marks events for future featured surfaces.
- `starts_at`, `ends_at`: event schedule.
- `max_attendees`, `current_attendees`: capacity fields reserved for future registration/attendance work.
- `published_at`, `archived_at`: publishing lifecycle timestamps.
- `metadata`: future extension data.

Media collections:

- `banner`: single banner image.
- `gallery`: multiple event images.

## Permissions

The module adds:

- `events.view`
- `events.create`
- `events.update`
- `events.publish`
- `events.delete`

`super_admin` receives all permissions. `admin` receives full event management. `staff` receives view-only access.

## Routes

Dashboard routes are protected by `auth` and `verified` middleware:

```txt
GET    /events
GET    /events/create
POST   /events
GET    /events/{event}
GET    /events/{event}/edit
PATCH  /events/{event}
POST   /events/{event}/publish
POST   /events/{event}/archive
DELETE /events/{event}
```

## Workflow

1. Admin creates a draft or scheduled event.
2. Slug is generated from the title unless supplied.
3. Publishing sets `status = published` and fills `published_at` when missing.
4. Archiving sets `status = archived` and fills `archived_at`.
5. Delete uses soft deletes and writes an audit log.

## Audit Logging

The module records:

- `event.created`
- `event.updated`
- `event.published`
- `event.archived`
- `event.deleted`

## Not Built Yet

- Public event listing pages.
- Event attendance/registration.
- RSVP workflows.
- Event notifications.
- Advanced analytics or charting.
