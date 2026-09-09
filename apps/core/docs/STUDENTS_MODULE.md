# Students Module

## Scope

Phase 1 creates the backend foundation and minimal Inertia screens for student records. It does not build account activation, permits, NFC cards, payments, imports, or student-facing auth flows.

## Table Design

Table: `students`

| Column | Purpose |
| --- | --- |
| `id` | Primary key. |
| `user_id` | Nullable unique link to `users.id`; set to null if the user is deleted. Used by account activation. |
| `student_number` | Required unique institutional identifier. |
| `name` | Optional display name for records that do not have a linked user yet. |
| `email` | Optional indexed contact email. |
| `phone` | Optional phone number. |
| `course` | Optional indexed course/program label. |
| `level` | Optional indexed level/year label. |
| `metadata` | Nullable JSON for later low-risk extension data. |
| `created_by_id` | Nullable user who created the student record. |
| `updated_by_id` | Nullable user who last updated the student record. |
| `deleted_at` | Soft delete marker. |
| `created_at`, `updated_at` | Timestamps. |

Indexes:

```text
student_number unique
user_id unique
email
course
level
course + level
```

## Model Relationships

`App\Models\Student`:

- `user()` belongs to `User`
- `createdBy()` belongs to `User`
- `updatedBy()` belongs to `User`

`App\Models\User`:

- `student()` has one `Student`

## Permissions

The module uses the existing Spatie Permission names from `config/app-permissions.php`:

| Permission | Current use |
| --- | --- |
| `students.view` | View index and individual records. |
| `students.create` | Create student records. |
| `students.update` | Edit student records. |
| `students.delete` | Soft delete, restore, and force delete policy checks. |
| `students.import` | Reserved for future import flow. |
| `students.activate_account` | Activate or resend setup-password links for student accounts. |

Authorization is enforced through `App\Policies\StudentPolicy` and Form Request authorization. Frontend button visibility is not authorization.

`students.activate_account` now allows an admin/staff user to issue or resend a setup-password link for a student profile.

## Routes

Routes are registered in `routes/students.php` and loaded from `routes/web.php`.

All student routes require:

```text
auth
verified
```

Resource routes:

| Method | Route | Name | Purpose |
| --- | --- | --- | --- |
| `GET` | `/students` | `students.index` | List records with basic search. |
| `POST` | `/students` | `students.store` | Store record. |
| `GET` | `/students/{student}` | `students.show` | View record. |
| `PUT/PATCH` | `/students/{student}` | `students.update` | Update record. |
| `DELETE` | `/students/{student}` | `students.destroy` | Soft delete record. |
| `POST` | `/students/{student}/activate-account` | `students.activate-account` | Create/link a student user and send setup-password email. |

Account setup routes:

| Method | Route | Name | Purpose |
| --- | --- | --- | --- |
| `GET` | `/account/setup-password/{token}` | `account.setup-password.show` | Display setup-password form for a valid token. |
| `POST` | `/account/setup-password/{token}` | `account.setup-password.store` | Set the initial student password. |

## Inertia Pages

Pages live under:

```text
resources/js/pages/students
```

Current pages:

- `index.tsx`
- `show.tsx`

Create, edit, delete, and account activation are handled with dialogs on the index and show screens. The pages use existing layout conventions, breadcrumbs, shadcn-style UI primitives, and Wayfinder route helpers.

Reusable student UI lives under:

```text
resources/js/features/students
```

Current feature files:

- `components/student-form-dialog.tsx`
- `components/student-delete-dialog.tsx`
- `components/student-activate-account-dialog.tsx`
- `components/student-list.tsx`
- `types.ts`

## Account Activation

Student account activation uses the unified `users` table. There is no separate student auth table.

Flow:

1. A student profile must have an email address.
2. An authorized admin/staff user clicks **Activate account**.
3. The system creates a `users` record if the student is not linked yet.
4. If a user already exists with the same email, it is linked only when it is not already linked to another student and does not carry non-student roles.
5. The linked user receives the `student` role.
6. Old unused setup-password tokens are marked used.
7. A new hashed token is stored in `account_activation_tokens`.
8. A queued setup-password notification is sent.
9. The student sets their initial password through `/account/setup-password/{token}`.

Account states exposed to the frontend:

| State | Meaning |
| --- | --- |
| `not_activated` | No linked user. |
| `pending_setup` | Linked user exists but `password` is null. |
| `activated` | Linked user exists and has a password. |

Setup tokens are stored as SHA-256 hashes. Raw tokens are only sent in the email link.

## Navigation

The sidebar navigation includes a Students item from:

```text
resources/js/navigation/app-nav.ts
```

The item includes `permission: 'students.view'`, but frontend permission filtering is still a future enhancement.

## Not Built Yet

- Import UI or import jobs.
- Student avatars or media collections.
- Advanced filters, bulk actions, exports, or saved views.
- Permits, NFC cards, payments, elections, polls, news, events, and reports.
