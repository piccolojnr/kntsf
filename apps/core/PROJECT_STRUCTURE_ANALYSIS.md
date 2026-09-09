# Project Structure Analysis

Generated from the current Laravel React starter project in `C:\Users\USER\Herd\kntsf-core`.

## Executive Summary

This is a modern Laravel 13 starter using Inertia v3, React 19, TypeScript, Tailwind CSS v4, shadcn-style UI components, Fortify authentication, and Wayfinder route generation. The project is still close to the default starter state: backend code is small and authentication-focused, while the frontend already contains a usable application shell, sidebar, settings pages, auth pages, theme handling, generated route helpers, and reusable UI primitives.

The current structure is a good base. The most important early decisions are:

| Area | Recommendation |
| --- | --- |
| Backend domains | Keep Laravel conventions. Add feature folders under `app/Http/Controllers`, `app/Http/Requests`, `app/Models`, `app/Policies`, and use `app/Actions` for focused business operations. |
| Frontend domains | Keep shared primitives in `resources/js/components/ui`; add feature folders under `resources/js/features/*` or domain page folders under `resources/js/pages/*`. |
| Routing | Keep `routes/web.php` thin and split feature routes into files such as `routes/students.php`, `routes/permits.php`, etc. |
| Auth | Keep one `users` table. Add Spatie roles/permissions, role-aware policies, and a separate `student_profiles` table for student-specific data. |
| Navigation | Refactor nav definitions out of `app-sidebar.tsx` and `app-header.tsx` before adding many modules. |
| Media | Start with local storage plus clear upload rules. Add Spatie Media Library when media conversions, multiple collections, thumbnails, and polymorphic attachments become real requirements. |
| Queues | Database queues are already configured. Queue email, notifications, image/media processing, imports, exports, and payment webhooks. |

## Installed Stack

| Package | Current version | Role |
| --- | ---: | --- |
| PHP | 8.4 | Runtime |
| Laravel | 13.8.0 | Backend framework |
| Inertia Laravel | 3.1.0 | Server-side Inertia adapter |
| Fortify | 1.37.0 | Authentication backend |
| Wayfinder | 0.1.18 | Typed backend route/action generation |
| Pest | 4.7.0 | PHP tests |
| React | 19.2.6 | Frontend UI |
| `@inertiajs/react` | 3.1.1 | React Inertia client |
| Tailwind CSS | 4.3.0 | Styling |
| Vite | 8.x | Bundler |
| shadcn/Radix style components | Local components | UI primitives |

The database is SQLite. Current tables are starter/auth infrastructure only: `users`, `password_reset_tokens`, `sessions`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, and `migrations`.

## Root Project Structure

| Path | Purpose | Notes |
| --- | --- | --- |
| `app/` | Application PHP code | Currently contains Fortify actions, settings controllers/requests, middleware, providers, and `User`. |
| `bootstrap/` | Laravel bootstrapping | `app.php` configures routing, middleware, exceptions; `providers.php` registers providers. |
| `config/` | Laravel configuration | Auth, Fortify, Inertia, queue, mail, filesystem, session, logging, database, cache. |
| `database/` | Migrations, factories, seeders | Starter auth/session/cache/job migrations and `UserFactory`. |
| `public/` | Web root | `index.php`, favicons, robots file, storage link target when created. |
| `resources/` | Frontend assets and root Blade view | React app in `resources/js`, Tailwind CSS in `resources/css/app.css`, root Inertia template in `resources/views/app.blade.php`. |
| `routes/` | Route definitions | `web.php`, `settings.php`, `console.php`. Fortify registers auth routes through provider/config. |
| `storage/` | Logs, cache, sessions, generated files | Empty tracked placeholders only. |
| `tests/` | Pest tests | Feature tests for auth, dashboard, settings, and a unit example. |
| `vite.config.ts` | Frontend build setup | Laravel, Inertia, React compiler, Tailwind v4, Wayfinder, Bunny font plugin. |
| `package.json` | JS dependencies/scripts | Build, dev, lint, format, type checking. |
| `composer.json` | PHP dependencies/scripts | Setup, dev, lint, test, CI scripts. |
| `tsconfig.json` | TypeScript config | Strict mode, `@/*` alias to `resources/js/*`, React JSX. |
| `eslint.config.js` | ESLint flat config | React, hooks, TypeScript, import ordering, stylistic rules; ignores generated routes/actions and UI primitives. |
| `.prettierrc` | Prettier config | 4-space tabs, single quotes, Tailwind class sorting from `resources/css/app.css`. |
| `components.json` | shadcn config | New York style, neutral base color, aliases to `@/components`, `@/components/ui`, `@/hooks`, `@/lib`. |

## Backend Structure

Current backend files:

```text
app/
  Actions/Fortify/
    CreateNewUser.php
    ResetUserPassword.php
  Concerns/
    PasswordValidationRules.php
    ProfileValidationRules.php
  Http/
    Controllers/
      Controller.php
      Settings/
        ProfileController.php
        SecurityController.php
    Middleware/
      HandleAppearance.php
      HandleInertiaRequests.php
    Requests/
      Settings/
        PasswordUpdateRequest.php
        ProfileDeleteRequest.php
        ProfileUpdateRequest.php
        TwoFactorAuthenticationRequest.php
  Models/
    User.php
  Providers/
    AppServiceProvider.php
    FortifyServiceProvider.php
```

### Request Lifecycle

1. `public/index.php` boots Laravel.
2. `bootstrap/app.php` configures routes, middleware, and exceptions.
3. Web requests use Laravel's web middleware stack plus appended project middleware:
   - `HandleAppearance`
   - `HandleInertiaRequests`
   - `AddLinkHeadersForPreloadedAssets`
4. Routes are matched from `routes/web.php`, `routes/settings.php`, framework routes, and Fortify routes.
5. Inertia responses resolve React page components from `resources/js/pages`.
6. `resources/views/app.blade.php` loads the root Inertia app, CSS, JS, font tags, and current page component module.

### `bootstrap/app.php`

Important behavior:

```php
$middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

$middleware->web(append: [
    HandleAppearance::class,
    HandleInertiaRequests::class,
    AddLinkHeadersForPreloadedAssets::class,
]);
```

The `appearance` and `sidebar_state` cookies are intentionally readable by frontend/root view code. `HandleAppearance` sets a shared Blade variable so the initial HTML can render dark mode correctly before React loads. `HandleInertiaRequests` shares app-wide props with React.

### Providers

| Provider | Role |
| --- | --- |
| `AppServiceProvider` | Sets immutable dates, blocks destructive DB commands in production, and configures stronger production password defaults. |
| `FortifyServiceProvider` | Registers Fortify create/reset actions, maps Fortify views to Inertia pages, and configures login/2FA rate limiters. |

### User Model

`App\Models\User` uses:

- `HasFactory`
- `Notifiable`
- `TwoFactorAuthenticatable`
- PHP attributes for fillable and hidden fields
- hashed password cast
- datetime casts for email verification and 2FA confirmation

Current fillable columns are `name`, `email`, and `password`. Hidden fields include password, 2FA secrets/recovery codes, and remember token.

### Validation

Validation is split into:

| Location | Current use |
| --- | --- |
| Fortify action classes | Registration and password reset use `Validator::make`. |
| Form requests | Settings profile, password, delete account, and 2FA state validation. |
| Concerns | Shared password/profile validation rules. |

For future features, prefer Form Request classes for controller actions. Use shared rule helpers only when multiple request/action classes truly share the same validation.

### Middleware

| Middleware | Purpose |
| --- | --- |
| `HandleAppearance` | Shares the `appearance` cookie with the root Blade view. |
| `HandleInertiaRequests` | Sets root Inertia view and shares app name, authenticated user, and sidebar open state. |

Shared Inertia props:

```php
[
    'name' => config('app.name'),
    'auth' => [
        'user' => $request->user(),
    ],
    'sidebarOpen' => ! $request->hasCookie('sidebar_state')
        || $request->cookie('sidebar_state') === 'true',
]
```

This is how React receives the authenticated user and initial sidebar state.

### Exceptions

`bootstrap/app.php` currently has no custom exception rendering. Inertia production error pages are not customized yet. Add custom Inertia error pages later when the app has branded error UX.

### Policies

There is no `app/Policies` directory yet. Policies should be introduced before role-sensitive modules such as permits, payments, elections, reports, and student records.

## Routing Analysis

Current route files:

```text
routes/
  web.php
  settings.php
  console.php
```

### `routes/web.php`

Routes:

| Route | Name | Middleware | Renders |
| --- | --- | --- | --- |
| `/` | `home` | web | `welcome` |
| `/dashboard` | `dashboard` | `auth`, `verified` | `dashboard` |

`/` passes `canRegister` based on Fortify features.

### `routes/settings.php`

Routes:

| Route | Name | Middleware | Handler |
| --- | --- | --- | --- |
| `settings` | none | `auth` | Redirect to `/settings/profile` |
| `settings/profile` GET | `profile.edit` | `auth` | `ProfileController@edit` |
| `settings/profile` PATCH | `profile.update` | `auth` | `ProfileController@update` |
| `settings/profile` DELETE | `profile.destroy` | `auth`, `verified` | `ProfileController@destroy` |
| `settings/security` GET | `security.edit` | `auth`, `verified` | `SecurityController@edit` |
| `settings/password` PUT | `user-password.update` | `auth`, `verified`, `throttle:6,1` | `SecurityController@update` |
| `settings/appearance` GET | `appearance.edit` | `auth`, `verified` | Inertia page |

### Fortify Routes

Fortify registers the auth routes:

- `login`, `login.store`
- `logout`
- `register`, `register.store`
- `password.request`, `password.email`, `password.reset`, `password.update`
- `verification.notice`, `verification.send`, `verification.verify`
- `password.confirm`, `password.confirm.store`
- `two-factor.login`, `two-factor.login.store`
- `two-factor.enable`, `two-factor.disable`, `two-factor.confirm`
- `two-factor.qr-code`, `two-factor.secret-key`, `two-factor.recovery-codes`, `two-factor.regenerate-recovery-codes`

### Route Helper Pattern

Wayfinder generates typed route/action helpers into:

```text
resources/js/actions/
resources/js/routes/
resources/js/wayfinder/
```

Frontend code imports from these generated files rather than hardcoding URLs:

```tsx
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { dashboard } from '@/routes';
import { store } from '@/routes/login';
```

This pattern should be kept. After route changes, regenerate helpers if the Vite plugin has not already handled it.

### Future Route Organization

Keep `web.php` as the high-level entry point and split domains:

```php
require __DIR__.'/settings.php';
require __DIR__.'/students.php';
require __DIR__.'/permits.php';
require __DIR__.'/payments.php';
require __DIR__.'/elections.php';
require __DIR__.'/polls.php';
require __DIR__.'/news.php';
require __DIR__.'/events.php';
require __DIR__.'/reports.php';
```

Use route groups by middleware and prefix:

```php
Route::middleware(['auth', 'verified'])
    ->prefix('students')
    ->name('students.')
    ->group(function () {
        // index, show, create, store, edit, update, destroy
    });
```

## Inertia Setup

### Server Side

`config/inertia.php`:

- SSR is enabled.
- SSR URL is `http://127.0.0.1:13714`.
- Pages are discovered from `resources/js/pages`.
- Tests enforce that referenced pages exist.

`HandleInertiaRequests` sets `resources/views/app.blade.php` as the root template.

### Client Side

`resources/js/app.tsx` creates the Inertia app:

- Global title format: `{page title} - {app name}`.
- Global wrappers: `TooltipProvider` and `Toaster`.
- Progress color: `#4B5563`.
- Theme initialized after app creation.
- Layouts are assigned by page name:

| Page name | Layout |
| --- | --- |
| `welcome` | No layout |
| `auth/*` | `AuthLayout` |
| `settings/*` | `[AppLayout, SettingsLayout]` |
| everything else | `AppLayout` |

Individual pages can pass layout props by assigning `Page.layout`, for example breadcrumbs or auth layout title/description.

## Frontend Structure

```text
resources/js/
  actions/        Generated Wayfinder controller action helpers
  components/     App components plus shadcn/Radix primitives
  hooks/          Shared React hooks
  layouts/        App, auth, settings layout wrappers
  lib/            Utility helpers
  pages/          Inertia pages
  routes/         Generated Wayfinder named route helpers
  types/          Shared TypeScript types and Inertia module augmentation
  wayfinder/      Generated Wayfinder internals
  app.tsx         Inertia app bootstrap
```

### Pages

Current pages:

```text
pages/
  welcome.tsx
  dashboard.tsx
  auth/
    confirm-password.tsx
    forgot-password.tsx
    login.tsx
    register.tsx
    reset-password.tsx
    two-factor-challenge.tsx
    verify-email.tsx
  settings/
    appearance.tsx
    profile.tsx
    security.tsx
```

### Layout Hierarchy

| Layout | Purpose |
| --- | --- |
| `layouts/app-layout.tsx` | Main app layout alias; currently uses sidebar layout. |
| `layouts/app/app-sidebar-layout.tsx` | Sidebar shell with `AppSidebar`, sidebar header, breadcrumbs, and content. |
| `layouts/app/app-header-layout.tsx` | Alternate top-header shell, currently available but not selected by `app-layout.tsx`. |
| `layouts/auth-layout.tsx` | Auth layout alias; currently uses simple layout. |
| `layouts/auth/auth-simple-layout.tsx` | Simple centered auth screen. |
| `layouts/auth/auth-card-layout.tsx` | Card-style auth variant. |
| `layouts/auth/auth-split-layout.tsx` | Split-screen auth variant. |
| `layouts/settings/layout.tsx` | Nested settings section layout with local settings nav. |

### Components

Shared app components include:

- `app-sidebar.tsx`
- `app-header.tsx`
- `app-shell.tsx`
- `app-content.tsx`
- `app-sidebar-header.tsx`
- `app-logo.tsx`
- `breadcrumbs.tsx`
- `nav-main.tsx`
- `nav-footer.tsx`
- `nav-user.tsx`
- `user-menu-content.tsx`
- `user-info.tsx`
- `heading.tsx`
- `input-error.tsx`
- `password-input.tsx`
- `text-link.tsx`
- `appearance-tabs.tsx`
- `delete-user.tsx`
- 2FA components

UI primitives live in `resources/js/components/ui`. These are shadcn-style wrappers around Radix/headless components plus local styling. Current primitives include buttons, inputs, labels, dialogs, dropdown menus, sidebar, tooltip, sheet, select, card, alert, badge, avatar, breadcrumb, checkbox, skeleton, spinner, sonner, toggle, and navigation menu.

### Hooks

| Hook | Purpose |
| --- | --- |
| `use-appearance` | Stores light/dark/system appearance in localStorage and cookie; applies `.dark`. |
| `use-current-url` | Compares current Inertia URL to route helper hrefs. |
| `use-flash-toast` | Listens for Inertia `flash` events and renders Sonner toasts. |
| `use-mobile` | Mobile media query helper. |
| `use-mobile-navigation` | Cleans up mobile sidebar/navigation state. |
| `use-initials` | Generates user initials. |
| `use-clipboard` | Clipboard helper. |
| `use-two-factor-auth` | Fetches QR code, secret key, recovery codes, and tracks 2FA setup errors. |

### Types

| File | Purpose |
| --- | --- |
| `types/auth.ts` | `User`, `Auth`, 2FA setup types. |
| `types/navigation.ts` | Breadcrumb and nav item types. |
| `types/ui.ts` | Layout props, layout variant, flash toast, auth layout props. |
| `types/global.d.ts` | Augments Inertia shared page props. |
| `types/vite-env.d.ts` | Vite environment types. |
| `types/index.ts` | Barrel exports. |

### Form Patterns

The starter uses Inertia v3 `<Form>` heavily. Patterns include:

- `Form` receives Wayfinder-generated `.form()` attributes.
- Server validation errors are read from the render-prop `errors`.
- Processing state disables buttons and shows `Spinner`.
- `resetOnSuccess`, `resetOnError`, `disableWhileProcessing`, and `preserveScroll` are used where appropriate.
- Forms post/put/patch/delete through named route helpers or generated controller action helpers.

Example:

```tsx
<Form
    {...ProfileController.update.form()}
    options={{ preserveScroll: true }}
>
    {({ processing, errors }) => (
        // form fields
    )}
</Form>
```

### Tables, Modals, Toasts, Loading States

| Pattern | Current state |
| --- | --- |
| Tables | No data table abstraction exists yet. Add one only when the first real list page needs sorting/filtering/pagination. |
| Modals/dialogs | Uses `components/ui/dialog` via Radix. Delete account and 2FA setup are current examples. |
| Toasts | Uses Sonner through `components/ui/sonner`, `Toaster`, and `useFlashToast`. Backend flashes via `Inertia::flash('toast', ...)`. |
| Loading states | Buttons use `Spinner`; 2FA QR/manual key areas show `Spinner`; `skeleton.tsx` exists for future loading placeholders. |

## Auth Flow

### Fortify Configuration

`config/fortify.php`:

- Guard: `web`
- Password broker: `users`
- Username/email field: `email`
- Lowercases usernames
- Home path: `/dashboard`
- Views enabled
- Login limiter: `login`
- 2FA limiter: `two-factor`
- Features enabled:
  - Registration
  - Password reset
  - Email verification
  - Two-factor authentication with confirmation and password confirmation

### Views

Fortify views are mapped to Inertia pages in `FortifyServiceProvider`:

| Fortify view | Inertia page |
| --- | --- |
| Login | `auth/login` |
| Register | `auth/register` |
| Forgot password | `auth/forgot-password` |
| Reset password | `auth/reset-password` |
| Verify email | `auth/verify-email` |
| 2FA challenge | `auth/two-factor-challenge` |
| Confirm password | `auth/confirm-password` |

### Registration

`CreateNewUser` validates name, email, password, and password confirmation, then creates a `User`. Password hashing is handled by the model cast.

### Login

The login page submits to `login.store` using generated Wayfinder helpers. Fortify handles authentication, rate limiting, remember-me, redirect to `/dashboard`, and 2FA challenge redirection.

### Password Reset

Fortify renders request/reset pages through Inertia. `ResetUserPassword` validates the new password and confirmation, then force-fills the password.

### Email Verification

Fortify routes are registered, and dashboard is protected by `verified`. The `User` model currently does not implement `MustVerifyEmail`; therefore `mustVerifyEmail` is false until that interface is added.

### Two-Factor Authentication

2FA is enabled in config and supported in the UI:

- `users` table has Fortify 2FA columns.
- `User` uses `TwoFactorAuthenticatable`.
- Security page can require password confirmation before managing 2FA.
- QR code, secret key, confirmation code, recovery codes, enable, disable, and regenerate flows are wired through Fortify routes.

### Session Handling

Sessions are database-backed based on the existing `sessions` table and default Laravel config. Logout invalidates auth state through Fortify. Profile deletion explicitly logs out, invalidates the session, and regenerates the CSRF token.

## Sidebar and Navigation

### Current Implementation

Main sidebar:

- `resources/js/components/app-sidebar.tsx`
- Uses `Sidebar` primitives from `components/ui/sidebar`.
- Defines `mainNavItems` locally.
- Defines `footerNavItems` locally.
- Renders:
  - Logo/header
  - `NavMain`
  - footer docs/repository links
  - user menu

Header layout:

- `resources/js/components/app-header.tsx`
- Also defines its own `mainNavItems` and right nav items.
- Includes mobile sheet navigation.

Settings navigation:

- `resources/js/layouts/settings/layout.tsx`
- Defines `sidebarNavItems` locally for Profile, Security, Appearance.

### Active Route Handling

Active checks use `useCurrentUrl`:

- `isCurrentUrl(item.href)` for exact matches.
- `isCurrentOrParentUrl(item.href)` for settings section matching.
- `whenCurrentUrl` for conditional classes.

This works well with Wayfinder route objects because `toUrl()` normalizes strings and route objects.

### Icons

Icons are from `lucide-react`. The `NavItem` type accepts an optional `LucideIcon`. This should be kept.

### Nested Navigation

There is no true nested navigation yet. The shadcn sidebar primitives support groups and collapsibles, but `NavItem` currently has no `children` field. Future nested modules need either:

- a richer nav type with groups/children, or
- separate section groups rendered by module.

### Scalability Warning

Navigation definitions are duplicated between sidebar and header layouts. This is fine for the starter but will become fragile once modules are added. Move navigation configuration into a shared file before adding many app modules.

Recommended future file:

```text
resources/js/navigation/
  app-nav.ts
  settings-nav.ts
```

Suggested type:

```ts
type AppNavItem = {
    title: string;
    href?: RouteHref;
    icon?: LucideIcon;
    children?: AppNavItem[];
    permission?: string;
    roles?: string[];
};
```

### Future Module Navigation

Suggested top-level groups:

| Module | Suggested route prefix | Suggested icon concept | Notes |
| --- | --- | --- | --- |
| Students | `/students` | Users/GraduationCap | Core records and student profiles. |
| Permits | `/permits` | BadgeCheck/FileCheck | Application/review/status workflows. |
| NFC | `/nfc` | ScanLine/Rss | Cards, scans, device logs. |
| Payments | `/payments` | CreditCard/Receipt | Transactions, invoices, payment statuses. |
| Elections | `/elections` | Vote | Election setup, candidates, results. |
| Polls | `/polls` | BarChart | Surveys and quick votes. |
| News | `/news` | Newspaper | Content management. |
| Events | `/events` | CalendarDays | Event listings and registrations. |
| Reports | `/reports` | ChartNoAxesColumn | Cross-domain reporting. |
| Settings | `/settings` | Settings | Account/system settings. |

Visibility should eventually be permission-driven. Do not hide authorization only in the frontend; mirror every permission check in Laravel policies/middleware.

## Tailwind and shadcn Setup

### Tailwind CSS v4

There is no `tailwind.config.js`. Tailwind v4 is configured from CSS and Vite:

- `@tailwindcss/vite` plugin in `vite.config.ts`
- `@import 'tailwindcss';`
- `@theme` token mapping in `resources/css/app.css`
- `@custom-variant dark (&:is(.dark *));`
- `@source` entries for views and Laravel pagination views

### Design Tokens

`resources/css/app.css` defines CSS variables for:

- background/foreground
- card/popover
- primary/secondary
- muted/accent
- destructive
- border/input/ring
- chart colors
- sidebar-specific colors
- radius scale

Light variables live under `:root`; dark variables live under `.dark`.

### Dark Mode

Dark mode is class-based:

1. Root Blade template applies `class="dark"` when the `appearance` cookie is `dark`.
2. An inline script applies dark mode immediately when appearance is `system` and the OS prefers dark.
3. `useAppearance` stores preference in localStorage and cookie.
4. `initializeTheme()` applies the client-side class and listens for system changes.

This is a strong starter pattern and should be kept.

### shadcn Setup

`components.json` config:

- Style: `new-york`
- TSX: enabled
- Tailwind CSS file: `resources/css/app.css`
- CSS variables: enabled
- Base color: neutral
- Icon library: lucide
- Aliases:
  - `@/components`
  - `@/components/ui`
  - `@/lib`
  - `@/hooks`

### Component Strategy

Keep this split:

```text
resources/js/components/ui/        Third-party-style primitives
resources/js/components/           Shared app-level components
resources/js/features/{domain}/    Domain-specific reusable UI
resources/js/pages/{domain}/       Inertia page entry points
```

Do not put domain-specific components into `components/ui`. Reserve `components/ui` for low-level primitives.

### Dashboard UI Strategy

Before building real dashboards, add shared dashboard components only when repeated:

```text
resources/js/components/dashboard/
  stat-card.tsx
  metric-grid.tsx
  activity-list.tsx
  empty-state.tsx
```

Avoid a large generic table/form framework too early. Extract after two or three real screens prove the pattern.

## Vite, TypeScript, ESLint, Prettier

### Vite

Plugins:

- `laravel-vite-plugin`
- `@inertiajs/vite`
- `@vitejs/plugin-react` with React compiler
- `@tailwindcss/vite`
- `@laravel/vite-plugin-wayfinder`
- Bunny font helper for Instrument Sans

Inputs:

```ts
['resources/css/app.css', 'resources/js/app.tsx']
```

Wayfinder is configured with `formVariants: true`, which is why `.form()` helpers are available.

### TypeScript

Important config:

- `strict: true`
- `noImplicitAny: true`
- `isolatedModules: true`
- `moduleResolution: bundler`
- `jsx: react-jsx`
- `baseUrl: "."`
- alias: `@/*` to `resources/js/*`
- includes only `resources/js/**/*.ts`, `.tsx`, and `.d.ts`

### ESLint

The project uses ESLint flat config with:

- JS recommended
- React recommended
- React hooks latest recommended
- TypeScript recommended
- import ordering
- consistent type imports
- stylistic brace/padding rules
- Prettier compatibility

Generated folders and UI primitives are ignored:

```text
resources/js/actions/**
resources/js/components/ui/*
resources/js/routes/**
resources/js/wayfinder/**
```

### Prettier

Prettier uses:

- semicolons
- single quotes
- print width 80
- tab width 4
- Tailwind class sorting
- `resources/css/app.css` as Tailwind stylesheet

## Existing Starter Patterns To Reuse

| Pattern | Reuse? | Notes |
| --- | --- | --- |
| Inertia page rendering from controllers/routes | Yes | Keep page names matching `resources/js/pages`. |
| Wayfinder route/action imports | Yes | Avoid hardcoded URLs in frontend. |
| Form Request validation | Yes | Use for all feature forms. |
| Inertia `<Form>` + generated `.form()` helpers | Yes | Consistent and type-friendly. |
| `Head` per page | Yes | Set page titles consistently. |
| Page-level `Page.layout` props | Yes | Good for breadcrumbs and auth layout titles. |
| App shell/sidebar | Yes, then refactor nav config | Structure is usable; nav config needs centralization. |
| Settings nested layout | Yes | Good model for module sub-navigation. |
| Toast flash pattern | Yes, but ensure `useFlashToast` is mounted where needed | Backend uses `Inertia::flash`; frontend has hook and Sonner. |
| Theme cookie/localStorage | Yes | Strong dark mode implementation. |
| 2FA modal/component split | Yes | Good pattern for a focused interactive workflow. |
| Welcome page | Remove or replace | It is starter marketing content, not product UX. |
| Dashboard placeholders | Replace | Use real operational dashboard once first domains exist. |
| External starter docs footer links | Remove before production | Replace with app support/help links or omit. |

## Auth Evolution Recommendation

Target users:

- Admin
- Staff
- Student

Recommended model:

```text
users
  id
  name
  email
  password
  email_verified_at
  two_factor_*
  timestamps

student_profiles
  id
  user_id
  student_number
  course/program fields
  year/section fields
  status
  profile-specific metadata
  timestamps
```

Use one `users` table for authentication and add Spatie permissions for role/ability checks. Do not create separate auth tables for admins/staff/students unless there is a hard requirement for separate credential stores.

Recommended additions after initial planning:

- `spatie/laravel-permission`
- `HasRoles` on `User`
- roles: `admin`, `staff`, `student`
- permissions by capability, not only by role:
  - `students.view`
  - `students.manage`
  - `permits.review`
  - `payments.view`
  - `elections.manage`
  - `reports.view`

Use policies for domain records:

```text
app/Policies/
  StudentProfilePolicy.php
  PermitPolicy.php
  PaymentPolicy.php
  ElectionPolicy.php
  PollPolicy.php
  NewsPostPolicy.php
  EventPolicy.php
```

Auth sharing should eventually expose a small safe authorization payload to React, not the full permission matrix by default:

```php
'auth' => [
    'user' => $request->user(),
    'roles' => fn () => $request->user()?->getRoleNames(),
    'permissions' => fn () => [
        'canViewStudents' => $request->user()?->can('viewAny', StudentProfile::class),
    ],
]
```

Keep server-side authorization as the source of truth.

## Environment Setup Recommendations

### Current Environment

- Laravel Herd serves the app at the Herd site URL.
- Do not run `php artisan serve` for normal local access in this project.
- SQLite is current and fine for starter exploration.
- Database queues are configured and queue tables exist.
- Mail defaults to log transport.
- Filesystem defaults to local private storage with public disk available.

### Packages

| Package | Install now? | Why |
| --- | --- | --- |
| `spatie/laravel-permission` | Yes, before role-heavy work | Core requirement for admin/staff/student capability control. Add before building protected modules. |
| `spatie/laravel-medialibrary` | Soon, not necessarily first commit | Best once media collections/conversions are confirmed. Avoid if only one simple avatar field is needed initially. |
| `laravel/sanctum` | Not now | Current app is session-based Inertia with Fortify. Add only for mobile/API token auth or external SPA/API needs. |
| `laravel/horizon` | Later | Useful when Redis queues and operational queue monitoring become necessary. Database queue is enough now. |
| `pestphp/pest` | Already installed | Continue using it. |
| `laravel/pulse` | Optional later | Add when runtime performance/usage monitoring is valuable. Not needed before features. |
| `laravel/reverb` | Later | Add only if realtime updates are required for elections, payments, notifications, dashboards, or NFC events. |
| `intervention/image` | Maybe later | Useful for custom image processing if not using Media Library conversions or if manual transformations are needed. |

## Media and Image Strategy

### Requirements By Media Type

| Media type | Likely requirements |
| --- | --- |
| Profile images | One avatar per user/student, thumbnail, replacement, public display. |
| Permit assets | Possibly private documents/images, review visibility, audit trail. |
| News images | Public featured images, thumbnails, optimized responsive display. |
| Event images | Public posters/banners, thumbnails. |
| Document uploads | Private by default, access controlled, file type/size validation. |

### Recommended Stage 1

Start with local storage:

- Use `public` disk for public images such as news/event images.
- Use `local` private disk for documents and permit assets.
- Validate MIME type, extension, and max size in Form Requests.
- Store paths in domain tables only when each model has one simple file.

### Recommended Stage 2

Adopt Spatie Media Library when one or more are true:

- Models need multiple files.
- Files need named collections.
- You need thumbnails/conversions.
- You need responsive images.
- You need consistent deletion/replacement behavior.
- Media can attach to multiple model types.

### Cloud Storage

Use local first. Move to S3-compatible storage when deployment requires shared storage, backups, CDN, or multiple app servers. Laravel's `s3` disk is already configured but not credentialed.

### Tradeoffs

| Option | Pros | Cons |
| --- | --- | --- |
| Plain storage | Simple, no dependency, quick | You own conversions, cleanup, collection rules, and metadata. |
| Spatie Media Library | Strong model integration, conversions, collections | Extra dependency and conventions; should be introduced deliberately. |
| Cloud storage | Production-scalable and shareable | Requires credentials, bucket policy, local/dev strategy. |

## Queue and Notification Setup

### Current Queue State

`config/queue.php` defaults to `database`. The jobs, job batches, and failed jobs tables exist. This is a good local/default setup.

### What Should Stay Synchronous

- Simple database CRUD.
- Authorization checks.
- Validation.
- Small status changes.
- UI redirects and flash messages.

### What Should Be Queued

- Verification/reminder emails.
- Permit approval/rejection emails.
- Payment receipts and payment status notifications.
- News/event broadcast notifications.
- Image conversions and thumbnail generation.
- Imports/exports and report generation.
- NFC scan reconciliation if processing grows.
- Webhook post-processing after the initial acknowledgement.

### Notifications vs Mailables

Use notifications when the message belongs to a notifiable user and may later support multiple channels:

- account verification
- permit status
- payment status
- election/poll reminders
- event reminders

Use mailables when the email is a standalone, email-specific document:

- formal receipts
- generated reports
- administrative exports

### Recommended Folder Structure

```text
app/
  Jobs/
    Media/
    Payments/
    Reports/
  Mail/
    Payments/
    Reports/
  Notifications/
    Auth/
    Permits/
    Payments/
    Events/
  Actions/
    Permits/
    Payments/
    Students/
```

For queued mail/notifications, implement `ShouldQueue`. For jobs tied to database writes inside transactions, dispatch after commit.

## Proposed Final Architecture

Avoid full DDD. Keep Laravel's default structure and add light domain organization.

### Backend

```text
app/
  Actions/
    Students/
    Permits/
    Payments/
    Elections/
    Polls/
    News/
    Events/
    Reports/
  Http/
    Controllers/
      Students/
      Permits/
      Payments/
      Elections/
      Polls/
      News/
      Events/
      Reports/
      Settings/
    Requests/
      Students/
      Permits/
      Payments/
      Elections/
      Polls/
      News/
      Events/
      Reports/
      Settings/
  Models/
    User.php
    StudentProfile.php
    Permit.php
    Payment.php
    Election.php
    Poll.php
    NewsPost.php
    Event.php
  Policies/
  Notifications/
  Jobs/
  Mail/
```

### Routes

```text
routes/
  web.php
  settings.php
  students.php
  permits.php
  payments.php
  elections.php
  polls.php
  news.php
  events.php
  reports.php
  console.php
```

### Frontend

```text
resources/js/
  components/
    ui/
    dashboard/
    data-table/
    empty-state.tsx
    page-header.tsx
  features/
    students/
      components/
      types.ts
    permits/
      components/
      types.ts
    payments/
      components/
      types.ts
  layouts/
  navigation/
    app-nav.ts
    settings-nav.ts
  pages/
    students/
    permits/
    payments/
    elections/
    polls/
    news/
    events/
    reports/
    settings/
  routes/
  actions/
  types/
```

Use `pages` as Inertia entry points and `features` for reusable domain components. Keep route helper imports from `@/routes` and `@/actions`.

### Feature Placement Rules

| Code | Place it here |
| --- | --- |
| HTTP endpoint | `app/Http/Controllers/{Domain}` |
| Request validation | `app/Http/Requests/{Domain}` |
| Reusable business operation | `app/Actions/{Domain}` |
| Database entity | `app/Models` |
| Authorization | `app/Policies` |
| User-facing Inertia page | `resources/js/pages/{domain}` |
| Domain-only React component | `resources/js/features/{domain}/components` |
| Shared UI primitive | `resources/js/components/ui` |
| Shared app component | `resources/js/components` |
| Navigation config | `resources/js/navigation` |

## Keep, Refactor, Remove

### Keep

- Fortify-backed auth.
- Inertia v3 layout assignment in `app.tsx`.
- Wayfinder-generated route/action helpers.
- shadcn/Radix UI primitives.
- Tailwind v4 CSS variable token setup.
- Dark mode cookie/localStorage strategy.
- Settings layout pattern.
- Form Request validation pattern.
- Pest feature tests.

### Refactor Before Feature Growth

- Move main navigation items out of `app-sidebar.tsx` and `app-header.tsx`.
- Add a permission-aware nav item shape.
- Add policies as soon as role-specific modules begin.
- Replace dashboard placeholders with real sections once first domains exist.
- Decide whether `AppHeaderLayout` is needed or remove it later if sidebar is the only app layout.

### Remove Or Replace Before Production

- Starter welcome page content.
- Starter external footer links to Laravel starter repository/docs.
- Placeholder dashboard cards.
- Any unused auth layout variants if the project settles on one auth layout.

## Warnings

- `User` does not currently implement `MustVerifyEmail`, even though verification routes/features exist. Dashboard uses `verified`, so decide explicitly whether email verification is required for this product.
- Navigation is currently hardcoded in multiple components. Add central nav config before adding many modules.
- No custom error pages exist yet. Inertia production error handling should be added before launch.
- No policies exist yet. Do not rely on frontend visibility for access control.
- No media abstraction exists yet. Do not scatter upload path logic across controllers.
- No table/list abstraction exists yet. Build first real list screens directly, then extract common table behavior.

## Practical Next Steps

1. Replace starter welcome/dashboard content with product-specific pages.
2. Add central navigation config and permission-aware nav metadata.
3. Install and configure Spatie Permission before implementing admin/staff/student workflows.
4. Add `StudentProfile` and its policy once student data requirements are clear.
5. Add feature route files and domain controller/request folders as each module begins.
6. Decide early whether media starts as plain storage or Media Library based on the first upload-heavy feature.
7. Keep writing focused Pest feature tests for every backend route and important auth/authorization branch.
