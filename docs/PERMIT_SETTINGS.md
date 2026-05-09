# Permit Settings

Permit settings prepare default values for future permit issuance without building the permits module yet.

## Storage

Settings are stored in `app_settings` through:

```txt
app/Support/PermitSettings.php
```

Setting key:

```txt
permits.settings
```

## Current Settings

| Setting | Default | Purpose |
| --- | ---: | --- |
| `default_amount` | `0` | Default permit fee amount. |
| `currency` | `GHS` | Three-letter currency code. |
| `default_validity_days` | `120` | Default number of valid days for future permits. |
| `permit_requests_enabled` | `false` | Switch prepared for future permit request flows. |

## Seeder

Run:

```bash
php artisan db:seed --class=PermitSettingsSeeder
```

## UI

Permit settings are available at:

```txt
/settings/permit-settings
```

## Permissions

```txt
permit_settings.view
permit_settings.update
```

Admins and super admins can view and update permit settings.

## Not Built Yet

- No permit issuance.
- No permit request workflow.
- No payment integration.
- No permit validity calculation attached to a permit record.
