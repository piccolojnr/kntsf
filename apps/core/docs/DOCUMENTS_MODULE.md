# Documents Module

## Purpose

The Documents module manages downloadable files such as SRC constitution documents, permit requirements, election guidelines, meeting minutes, and forms.

It uses the shared content foundation for publishing status, visibility, slug generation, and audit logging, and uses Spatie Media Library for file storage.

## Data Model

`documents` stores document metadata:

- `author_id`: user who uploaded or owns the document record.
- `title`, `slug`, `excerpt`, `description`: searchable document content.
- `category`: lightweight grouping such as `Minutes`, `Forms`, `Guidelines`, or `Permits`.
- `status`: `draft`, `scheduled`, `published`, or `archived`.
- `visibility`: `public` or `internal`.
- `is_featured`: marks important documents for future surfaces.
- `published_at`, `archived_at`: publishing lifecycle timestamps.
- `metadata`: future extension data.

## Media Usage

Media Library collections:

- `files`: downloadable document attachments.
- `featured_image`: optional single visual preview.

Supported file types:

- PDF
- Word: DOC, DOCX
- Excel: XLS, XLSX
- PowerPoint: PPT, PPTX

Current upload limit is 10 MB per document file and 5 MB for the featured image.

## Publishing Rules

A document cannot be published until at least one file is attached. This is enforced in the backend actions, not only in the UI.

Publishing sets:

- `status = published`
- `published_at = now()` when no date is supplied
- `archived_at = null`

Archiving sets:

- `status = archived`
- `archived_at = now()`

## Permissions

The module adds:

- `documents.view`
- `documents.create`
- `documents.update`
- `documents.publish`
- `documents.delete`

`super_admin` receives all permissions. `admin` receives full document management. `staff` receives view-only access.

## Routes

Dashboard routes are protected by `auth` and `verified` middleware:

```txt
GET    /documents
GET    /documents/create
POST   /documents
GET    /documents/{document}
GET    /documents/{document}/edit
PATCH  /documents/{document}
POST   /documents/{document}/publish
POST   /documents/{document}/archive
DELETE /documents/{document}
```

## Audit Logging

The module records:

- `document.created`
- `document.updated`
- `document.published`
- `document.archived`
- `document.deleted`

## Future Public Access

This phase only exposes documents inside the authenticated dashboard. Public downloads can later reuse the same model and media collections, but should add explicit visibility checks, public routes, and download logging if needed.

## Not Built Yet

- Public document listing/download pages.
- Version history.
- File replacement/removal controls per attachment.
- Download analytics.
