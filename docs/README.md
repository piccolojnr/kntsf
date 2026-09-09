# Project documentation and evidence

This directory contains the project material that accompanies the applications. Application code belongs in `apps/core` and `apps/mobile` after the monorepo migration.

## Canonical material

- `academic/final-project-report.docx` is the current final-year report. It describes the Laravel, Inertia, Expo, NFC, and pilot implementation.
- `presentation/current/final-defense-deck.pptx` is the current 13-slide defense deck.
- `defense/` contains the rehearsal, speaking, fact-checking, and technical Q&A material that supports that deck.
- `architecture/system-architecture.md` is the system architecture reference.

## Archived material

`academic/archive/` and `presentation/archive/` retain earlier reports, templates, and deck variants for reference. They are not the source of current technical or presentation claims.

## Demos and presentation sources

- `demo/videos/` contains named recordings; `demo/archive/combined-demo-duplicate.mp4` is a preserved byte-identical duplicate of `demo/videos/combined-demo.mp4`.
- `demo/screenshots/` contains dated web and admin screenshots.
- `presentation/previews/` contains exported slide previews and rendered build output.
- `../tools/presentation/` contains the deck-generation scripts and notes; generated previews remain under `presentation/previews/`.

## Repository guidance

Before the monorepo is created, decide whether binary videos, DOCX/PPTX files, and slide previews should live in Git LFS. Local caches and generated temporary directories do not belong in the repository.
