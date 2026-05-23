<?php

$configPath = dirname(__DIR__, 2) . '/config/app-permissions.php';
$config = require $configPath;

$permissionsByModule = $config['permissions'];
$roles = $config['roles'];

$allPermissions = [];

foreach ($permissionsByModule as $module => $permissions) {
    foreach ($permissions as $permission) {
        $allPermissions[] = ['module' => $module, 'permission' => $permission];
    }
}

$rolePermissionSets = [];

foreach ($roles as $roleName => $rolePermissions) {
    if ($rolePermissions === ['*']) {
        $rolePermissionSets[$roleName] = array_column($allPermissions, 'permission');
        continue;
    }

    $rolePermissionSets[$roleName] = $rolePermissions;
}

echo "# Appendix K — Permission Matrix\n\n";
echo "This appendix summarizes the role and permission configuration defined in `config/app-permissions.php` and seeded through Spatie Laravel Permission. The backend enforces these permissions through middleware and policies; the dashboard and mobile interfaces only expose actions that the authenticated user is permitted to perform.\n\n";
echo "## K.1 System Roles\n\n";
echo "| Role | Description |\n";
echo "| --- | --- |\n";
echo "| super_admin | Full system access through wildcard permission assignment. |\n";
echo "| admin | Full governance administration except implicit super-admin-only bootstrap controls. |\n";
echo "| staff | Operational access for students, permits, verification, NFC cards, payments, and limited content review. |\n";
echo "| student | Personal dashboard, permit viewing, payments, polls, elections, and profile settings. |\n\n";

echo "## K.2 Permission Inventory by Module\n\n";
echo "| Module | Permission |\n";
echo "| --- | --- |\n";

foreach ($allPermissions as $entry) {
    echo "| {$entry['module']} | `{$entry['permission']}` |\n";
}

echo "\n## K.3 Role and Permission Matrix\n\n";
echo "| Permission | super_admin | admin | staff | student |\n";
echo "| --- | --- | --- | --- | --- |\n";

foreach ($allPermissions as $entry) {
    $permission = $entry['permission'];
    $cells = [];

    foreach (['super_admin', 'admin', 'staff', 'student'] as $roleName) {
        $allowed = in_array($permission, $rolePermissionSets[$roleName] ?? [], true);
        $cells[] = $allowed ? 'Yes' : '—';
    }

    echo "| `{$permission}` | {$cells[0]} | {$cells[1]} | {$cells[2]} | {$cells[3]} |\n";
}

echo "\n## K.4 Module Access Summary\n\n";
echo "| Module | super_admin | admin | staff | student |\n";
echo "| --- | --- | --- | --- | --- |\n";

foreach ($permissionsByModule as $module => $permissions) {
    $cells = [];

    foreach (['super_admin', 'admin', 'staff', 'student'] as $roleName) {
        $allowedCount = count(array_intersect($permissions, $rolePermissionSets[$roleName] ?? []));
        $total = count($permissions);

        if ($allowedCount === 0) {
            $cells[] = '—';
        } elseif ($allowedCount === $total) {
            $cells[] = 'Full';
        } else {
            $cells[] = "Partial ({$allowedCount}/{$total})";
        }
    }

    echo "| {$module} | {$cells[0]} | {$cells[1]} | {$cells[2]} | {$cells[3]} |\n";
}

echo "\n## K.5 Notes\n\n";
echo "- Executive users receive permissions through assigned roles; executive profile management is controlled by `executives.*` permissions granted to admin users.\n";
echo "- Mobile staff operations require both an appropriate role and server-side permission checks on each API endpoint.\n";
echo "- Students can vote in polls and elections only when the corresponding `polls.vote` and `elections.vote` permissions are present and backend eligibility rules pass.\n";
