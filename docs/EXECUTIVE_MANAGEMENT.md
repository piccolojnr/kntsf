# Executive Management

Executives are normal Laravel `users` records. The UI calls them “Executives”, but auth and storage continue to use the existing `users` table.

SRC profile details live in `executive_profiles` and belong to a user. The profile supports a future Spatie Media Library `avatar` collection, but image upload is not built yet.

Creation behavior:

- create a user with a nullable password
- assign selected non-student role(s)
- create or update the executive profile
- optionally send the existing setup-password link

Safety rules:

- no separate executive auth table
- no student role assignment from the executive form
- only super admins can manage super admin users
- users cannot deactivate or delete themselves
- staff and students cannot access executive management

Routes:

```txt
GET /executives
POST /executives
GET /executives/{user}
PATCH /executives/{user}
DELETE /executives/{user}
POST /executives/{user}/activate
POST /executives/{user}/deactivate
POST /executives/{user}/send-setup-link
```
