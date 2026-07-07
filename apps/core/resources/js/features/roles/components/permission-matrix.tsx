import type { PermissionGroups } from '../types';

export function PermissionMatrix({
    permissionGroups,
    selectedPermissions,
}: {
    permissionGroups: PermissionGroups;
    selectedPermissions: string[];
}) {
    return (
        <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(permissionGroups).map(([group, permissions]) => (
                <div key={group} className="app-panel-muted p-3">
                    <p className="mb-3 text-sm font-semibold text-app-ink">
                        {titleCase(group)}
                    </p>
                    <div className="grid gap-2">
                        {permissions.map((permission) => (
                            <label
                                key={permission}
                                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-app-muted transition hover:bg-app-surface hover:text-app-ink"
                            >
                                <input
                                    type="checkbox"
                                    name="permissions[]"
                                    value={permission}
                                    defaultChecked={selectedPermissions.includes(
                                        permission,
                                    )}
                                />
                                {permission}
                            </label>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function titleCase(value: string) {
    return value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}
