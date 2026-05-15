# Public Portal

## Purpose

The public portal is the read-only SRC website surface. It is separate from the authenticated dashboard and only exposes content intended for public viewing.

## Routes

Public routes live in `routes/public.php` and do not use `auth` or `verified` middleware.

| Area | Routes |
| --- | --- |
| Home | `GET /` |
| Announcements | `GET /announcements`, `GET /announcements/{slug}` |
| Events | `GET /events/public`, `GET /events/public/{slug}` |
| Documents | `GET /documents/public`, `GET /documents/public/{slug}` |
| Executives | `GET /executives/public` |
| Elections | `GET /elections/public`, `GET /elections/public/{slug}` |

## Visibility Rules

Public content must be:

- `status = published`
- `visibility = public`
- `published_at` set and not in the future

Draft, scheduled, archived, internal, and unpublished records return `404` on public detail routes.

Executive profiles must have `is_published = true`.

Election pages only expose scheduled, active, or closed elections. Voting is not exposed publicly. Candidate lists include approved candidates only. Vote counts are only shown when `results_visible` is enabled.

## Layout

The public portal uses `resources/js/layouts/public-layout.tsx`.

It intentionally does not reuse the dashboard sidebar layout. Public pages live under:

```txt
resources/js/pages/public
```

## Query Scopes

Reusable scopes are defined on content models:

- `published()`
- `publicVisible()`
- `featured()`
- `upcoming()` for events

These scopes keep public queries consistent and reduce the chance of accidentally exposing private content.

## SEO Notes

Pages set basic titles and meta descriptions through Inertia `Head`. Slug routes provide clean canonical URLs for content.

Future SEO improvements could include SSR, Open Graph images, canonical tags, and sitemap generation.

## Future API Reuse

The same visibility rules should be reused by future mobile/public APIs. Do not expose dashboard payloads directly to public clients.
