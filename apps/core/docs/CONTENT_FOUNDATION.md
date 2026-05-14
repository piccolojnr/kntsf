# Content Foundation

This project now has shared publishing infrastructure for future News, Events, Documents, Polls, and Elections modules. No content module tables or CRUD screens have been created yet.

## Publishing Lifecycle

Content modules should use `App\Enums\PublishStatus`:

- `draft`: editable internal work
- `scheduled`: ready but not visible yet
- `published`: visible according to its visibility setting and publish date
- `archived`: retained but no longer current

`App\Support\Publishing` centralizes common checks such as `isPublished`, `isScheduled`, `isDraft`, `isArchived`, and a reusable published query helper.

## Visibility

`App\Enums\Visibility` supports:

- `public`: intended for public-facing surfaces
- `internal`: dashboard/authenticated use only

Future modules should still enforce access through policies and routes. Frontend visibility is not authorization.

## Slug Strategy

`App\Support\SlugGenerator` generates unique slugs from titles and safely appends numeric suffixes:

```txt
student-election
student-election-2
student-election-3
```

It accepts a model class or query builder and can ignore the current record during updates.

## Content Settings

`App\Support\ContentSettings` stores defaults in `app_settings` under:

```txt
content.settings
```

Current settings:

- `allow_public_news`
- `allow_public_events`
- `allow_public_documents`
- `homepage_featured_limit`
- `enable_comments`

Seed defaults with:

```bash
php artisan db:seed --class=ContentSettingsSeeder
```

## Policy Helpers

`App\Support\ContentPermissions` provides reusable permission checks:

- `canView`
- `canCreate`
- `canUpdate`
- `canPublish`
- `canArchive`
- `canDelete`

It expects future permission names like `news.publish` or fallback manage permissions like `news.manage`.

## Frontend Components

Reusable components live in:

```txt
resources/js/features/content/components
```

Available now:

- `publish-status-badge.tsx`
- `publish-status-select.tsx`
- `visibility-badge.tsx`
- `rich-text-editor.tsx`

The rich text editor is intentionally textarea-backed for now. A heavier editor can be added later when the first real content module needs formatting, embeds, uploads, or collaborative editing.

## Media Conventions

Use Spatie Media Library collections from `App\Support\MediaCollections`:

- `featured_image`
- `banner`
- `gallery`
- `attachments`

Planned conversion names live in `App\Support\MediaConversions`:

- `thumb`
- `preview`
- `hero`

Do not implement conversions until a module has real image requirements. When conversions are added, they should run through the queue.

## Dashboard Readiness

The dashboard now receives a lightweight content readiness payload from `DashboardSummary`. It reflects whether public publishing settings are ready for future modules.

## Future Module Placement

Practical structure for future content modules:

```txt
app/Actions/News
app/Http/Controllers/News
app/Http/Requests/News
app/Models/NewsArticle.php
app/Policies/NewsArticlePolicy.php

resources/js/pages/news
resources/js/features/news
```

Keep shared publishing UI in `resources/js/features/content`. Keep module-specific forms, lists, and dialogs inside each module feature folder.
