# Public Website Design Guide

This guide documents the visual direction for the public-facing Knutsford SRC pages. Use it when redesigning pages under `resources/js/pages/public`.

## Direction

The public site should feel clean, modern, calm, and slightly artistic. It should not feel like a dashboard, a loud editorial page, or a generic card grid. The design language is:

- Minimal structure with purposeful asymmetry.
- Soft paper-like surfaces, thin borders, and restrained shadows.
- Handwritten notes used sparingly as small accents.
- Subtle scroll movement and hover transitions.
- Real campus/student images where they add context.
- Rich empty states that reserve space and feel intentional.

## Page Structure

Public pages should generally use this rhythm:

1. Page header or hero-like intro with concise copy.
2. Primary content area in a constrained `max-w-7xl` layout.
3. Supporting filters, metadata, or secondary actions arranged as quiet panels.
4. Designed empty states when there is no content.

Avoid landing-page hero patterns on internal public pages. The homepage owns the large full-screen campus hero.

## Layout Rules

- Use full-width sections with constrained inner content.
- Prefer two-column layouts where one side introduces the section and the other side carries the content.
- Avoid nesting cards inside cards.
- Cards are acceptable for repeated content, but keep them practical and low-noise.
- Rounded containers that hold edge-to-edge child links must use `overflow-hidden`.
- Lists with few items should align from the top, not vertically center in large spaces.
- On mobile, all sections should stack cleanly with enough breathing room.

## Surfaces

Use the public surface language already in `resources/css/app.css`:

- `public-sketch-card` for interactive paper-like cards.
- `public-paper-grain` for subtle texture.
- `public-notebook-grid` only as a faint section background.
- `public-empty-lines` inside empty states.

Preferred card styling:

- `rounded-[1.2rem]` to `rounded-[1.6rem]`.
- `border border-app-border`.
- `bg-white/72`, `bg-white/76`, or `bg-[#f8f7f3]`.
- Subtle shadows such as `shadow-[0_18px_55px_rgba(28,24,38,0.06)]`.

## Motion

Motion should make the page feel alive, not busy.

Use:

- `public-scroll-rise` on major page sections.
- `public-scroll-drift` on real images.
- `public-scroll-mark` on handwritten annotations.
- `public-float` on small decorative marks only.

Hover states should be visible but controlled:

- Slight background change.
- Small icon rotation or scale.
- Gentle shadow lift.
- Avoid aggressive movement on edge-to-edge items inside rounded containers.

Respect reduced-motion. Existing CSS disables public animations under `prefers-reduced-motion: reduce`.

## Images

Use real images when they clarify campus life or leadership.

Current homepage image assets:

- `public/images/campus-hero.jpg`
- `public/images/campus-moment.jpg`
- `public/images/leadership-photo.jpg`

Image panels should:

- Use `object-cover`.
- Have a soft gradient overlay for legibility.
- Use an inset border.
- Use a small handwritten caption if useful.
- Avoid dark, blurred, or overly cropped images when users need to inspect the subject.

## Empty States

Empty states must not be a single plain sentence in a large blank box.

Use:

- `EmptyLine` style composition from the homepage.
- Ghost text lines with `public-empty-lines`.
- A small icon.
- One concise message.
- A handwritten accent such as “space reserved”.

## Typography

- Use the existing Montserrat setup.
- Keep headings compact and clean.
- Use wide tracking only for small eyebrow labels.
- Do not use oversized display type inside compact panels.
- Do not scale type with viewport width.

## Links And Actions

- Use Inertia `<Link>` with Wayfinder route helpers.
- Primary actions should be obvious but not loud.
- Inline “View all” links can use an arrow icon and a subtle gap transition.
- Repeated link tiles should use icons from `lucide-react`.

## Header And Footer

The public header is part of the visual identity:

- Floating rounded shell.
- Transparent over the homepage hero.
- Solid/blurred on scroll and on internal pages.
- Pill-style desktop navigation.
- Mobile menu remains solid and readable.

The footer should keep the same paper texture and calm public-record tone.

## Conversion Order

Convert public pages one at a time so the design stays coherent:

1. Announcements index.
2. Announcement show.
3. Events index.
4. Event show.
5. Documents index.
6. Document show.
7. Elections index.
8. Election show.
9. Executives index.
10. Permit request.

## Implementation Notes

- Prefer extracting reusable public components only after two or more pages need the same pattern.
- Keep changes scoped to the public pages and shared public components.
- Do not introduce new dependencies for visual polish.
- Run focused checks after each page conversion:

```bash
pnpm types:check
pnpm build
php artisan test --compact tests/Feature/PublicPortalTest.php
git diff --check
```
