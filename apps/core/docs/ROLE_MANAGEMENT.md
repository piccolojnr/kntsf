# Role Management

Role management provides dashboard screens for Spatie roles and grouped permissions.

Routes:

```txt
GET /roles
POST /roles
GET /roles/{role}
PATCH /roles/{role}
DELETE /roles/{role}
```

Permissions:

```txt
roles.view
roles.manage
```

Protected roles cannot be deleted:

```txt
super_admin
admin
staff
student
```

Grouped permissions are sourced from `config/app-permissions.php` and rendered as a permission matrix.
