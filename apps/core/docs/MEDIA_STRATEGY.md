# Media Strategy

## Package Choice

The project uses Spatie Media Library because it gives Laravel-native media attachment, named collections, conversions, responsive images, ordering, custom properties, and disk-aware storage without building a custom file-management layer.

## Local-First Storage

The current foundation is local-first:

```env
FILESYSTEM_DISK=local
MEDIA_DISK=public
```

The `local` disk remains the application default for private storage. Media Library defaults to the `public` disk so public images can be served through Laravel's standard `public/storage` link when needed.

## Public vs Private Rules

Public media should be limited to assets intended for normal browser display, such as avatars, news images, and event banners.

Private media should use private storage for sensitive documents, permit attachments, IDs, payment evidence, and any file that requires authorization before download. Those workflows should expose files through authorized controller responses rather than direct public URLs.

## Future Cloud Storage

S3-compatible storage is intentionally not configured yet. Move media to S3 or another cloud disk when production deployment needs shared storage, CDN delivery, backups, or multiple application servers.

## Expected Collections

| Owner | Collections |
| --- | --- |
| `users` | `avatar` |
| `students` | `avatar` |
| `news_articles` | `featured_image`, `gallery` |
| `events` | `banner`, `gallery` |
| `documents` | `files` |
| `permits` | `attachments` |

Collection names are centralized in `App\Support\MediaCollections`.

## Conversions

Media conversions and thumbnails should be added only when a real upload workflow needs them. When conversions are added, they should use queues so image work does not slow down user-facing requests.
