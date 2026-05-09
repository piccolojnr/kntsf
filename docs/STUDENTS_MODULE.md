# Students Module

## Scope

Phase 1 creates the backend foundation and minimal Inertia screens for student records. It does not build account activation, permits, NFC cards, payments, imports, or student-facing auth flows.

## Table Design

Table: `students`

| Column | Purpose |
| --- | --- |
| `id` | Primary key. |
| `user_id` | Nullable unique link to `users.id`; set to null if the user is deleted. Reserved for future student account activation. |
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
| `students.activate_account` | Reserved for future student account activation. |

Authorization is enforced through `App\Policies\StudentPolicy` and Form Request authorization. Frontend button visibility is not authorization.

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
| `GET` | `/students/create` | `students.create` | Create form. |
| `POST` | `/students` | `students.store` | Store record. |
| `GET` | `/students/{student}` | `students.show` | View record. |
| `GET` | `/students/{student}/edit` | `students.edit` | Edit form. |
| `PUT/PATCH` | `/students/{student}` | `students.update` | Update record. |
| `DELETE` | `/students/{student}` | `students.destroy` | Soft delete record. |

## Inertia Pages

Pages live under:

```text
resources/js/pages/students
```

Current pages:

- `index.tsx`
- `create.tsx`
- `edit.tsx`
- `show.tsx`

The pages use existing layout conventions, breadcrumbs, shadcn-style UI primitives, and Wayfinder route helpers.

## Navigation

The sidebar navigation includes a Students item from:

```text
resources/js/navigation/app-nav.ts
```

The item includes `permission: 'students.view'`, but frontend permission filtering is still a future enhancement.

## Not Built Yet

- Student account activation and user linking workflows.
- Import UI or import jobs.
- Student avatars or media collections.
- Advanced filters, bulk actions, exports, or saved views.
- Permits, NFC cards, payments, elections, polls, news, events, and reports.
