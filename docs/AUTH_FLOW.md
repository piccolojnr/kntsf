# Auth Flow

## Unified Users Table

The project uses one `users` table for admins, staff, and students. Roles and permissions come from Spatie Permission.

Student records live in `students` and may optionally link to a user through `students.user_id`.

## Student Account Activation

Activation starts from an existing student profile:

1. Admin/staff activates a student profile.
2. The student must have an email address.
3. A user is created or safely linked by email.
4. The user receives the `student` role.
5. The user password remains `null` until setup is completed.
6. A setup-password token is created in `account_activation_tokens`.
7. The student receives a setup-password notification.
8. The token is marked used after the initial password is set.

## Token Rules

Tokens are stored hashed in the database.

```text
token_hash = sha256(raw_token)
purpose = setup_password
expires_at = now + 24 hours
used_at = null until consumed
```

Old unused setup-password tokens are invalidated when a new activation email is sent.

## Login

Pending student users cannot log in because their password is null. After setting the initial password, Fortify handles normal login through the existing `/login` endpoint.

## Not Built Yet

- Mobile/API auth.
- Student account self-registration.
- Student profile claiming.
- Permit, NFC, or payment auth flows.
