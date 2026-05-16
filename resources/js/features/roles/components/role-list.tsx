import { Link } from '@inertiajs/react';
import { Eye, Trash2 } from 'lucide-react';
import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog';
import { Button } from '@/components/ui/button';
import { destroy, show } from '@/routes/roles';
import type { PermissionGroups, RoleRecord } from '../types';
import { RoleFormDialog } from './role-form-dialog';

export function RoleList({
    roles,
    permissionGroups,
    canManage,
}: {
    roles: RoleRecord[];
    permissionGroups: PermissionGroups;
    canManage: boolean;
}) {
    return (
        <div className="overflow-hidden rounded-md border bg-card">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                    <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">
                                Role
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Users
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Permissions
                            </th>
                            <th className="px-4 py-3 text-right font-medium">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {roles.map((role) => (
                            <tr key={role.id} className="bg-card hover:bg-muted/30">
                                <td className="px-4 py-3">
                                    <p className="font-medium">{role.label}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {role.name}
                                    </p>
                                </td>
                                <td className="px-4 py-3">{role.users_count}</td>
                                <td className="px-4 py-3">
                                    {role.permissions.length}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button asChild size="sm" variant="ghost">
                                            <Link href={show(role.id)}>
                                                <Eye />
                                                View
                                            </Link>
                                        </Button>
                                        {canManage && (
                                            <RoleFormDialog
                                                role={role}
                                                permissionGroups={permissionGroups}
                                                trigger={
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        Edit
                                                    </Button>
                                                }
                                            />
                                        )}
                                        {canManage && !role.is_protected && (
                                            <ConfirmActionDialog
                                                form={destroy.form(role.id)}
                                                title="Delete role?"
                                                description={`This will delete the ${role.label} role. Protected starter roles cannot be deleted.`}
                                                confirmLabel="Delete role"
                                                trigger={
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                    >
                                                        <Trash2 />
                                                        Delete
                                                    </Button>
                                                }
                                            />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
