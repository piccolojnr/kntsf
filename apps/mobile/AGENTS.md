# AGENTS.md

## Project

Knutsford SRC Mobile App

A role-based mobile system for:

- Students → view permits, card status
- Staff → scan NFC cards and verify permits
- Admin → manage students, permits, and cards

Built with Expo, React Native, TypeScript, Expo Router.

---

## Tech Stack

- Expo SDK 54
- React Native
- Expo Router
- TypeScript
- Axios
- TanStack Query
- Zod
- Zustand
- React Hook Form
- react-native-nfc-manager

---

## Naming Conventions

Use **kebab-case** for all files and folders.

Examples:

- `scan-card-screen.tsx`
- `permit-status-card.tsx`
- `auth-provider.tsx`
- `api-client.ts`

Use **PascalCase** for React components.

Use **camelCase** for variables and functions.

---

## Routing Structure

Use Expo Router with route groups:

- `(auth)` → welcome + login
- `(student)` → student app
- `(staff)` → staff app
- `(admin)` → admin app

Each role must be isolated.

---

## Folder Structure

All code lives in `src`.

```txt
src
├── app
├── components
│   ├── ui
│   ├── layout
│   ├── cards
│   └── forms
├── constants
├── features
├── hooks
├── lib
│   ├── api
│   ├── nfc
│   ├── storage
│   └── validations
├── providers
├── store
├── styles
└── types
```

---

## State Management

- Use **TanStack Query** for server state
- Use **Zustand** for local UI/session state

Do not duplicate server data into Zustand unnecessarily.

---

## API Rules

All API calls must go through:

`src/lib/api/api-client.ts`

Do not call Axios directly inside screens.

Feature APIs should live in feature folders.

---

## Validation

Use Zod for:

- API payload validation
- Form validation

---

## NFC Rules

MVP uses **UID-based scanning only**.

Do NOT implement NFC writing.

Flow:

- Android scans card
- App reads UID
- Backend maps UID → student → permit

Future:

- Add NTAG/NDEF support
- Keep UID fallback

---

## Security Rules

- Do not store student data on NFC cards
- Do not trust frontend roles
- Backend role is source of truth
- Store tokens using Expo Secure Store

---

## Styling

Do NOT use Tailwind or NativeWind.

Use:

- React Native `StyleSheet`
- Shared theme in `src/constants/theme.ts`

Reusable UI must live in:

`src/components/ui`

If you create UI that is likely to be reused, extract it into a shared
component instead of leaving it inside a screen.

Place reusable pieces in the most appropriate folder:

- `src/components/ui` for generic building blocks
- `src/components/cards` for card-style display components
- `src/components/forms` for form-specific inputs and controls
- `src/components/layout` for shared screen and section layout wrappers

Avoid large inline styles.

---

## UI Principles

- Simple, clear, fast
- Staff scan flow must be minimal:
  - Open app → scan → result

- Use clear states:
  - valid
  - denied
  - warning

---

## Backend Assumptions

Expected endpoints:

- POST /api/mobile/auth/login
- GET /api/mobile/me
- POST /api/mobile/staff/scan-card
- POST /api/mobile/cards/register
- POST /api/mobile/cards/replace
- POST /api/mobile/cards/revoke
- GET /api/mobile/student/permits
- GET /api/mobile/student/card

---

## Implementation Rules

- Keep files small
- Move logic to features/lib
- Screens should compose UI only
- Use hooks for business logic

---

## Do Not Do

- Do not use NativeWind
- Do not write to NFC cards yet
- Do not hardcode roles
- Do not mix role screens
- Do not store permit data on cards
