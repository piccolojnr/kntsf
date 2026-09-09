import { Head } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { RoleFormDialog } from '@/features/roles/components/role-form-dialog';
import type { PermissionGroups, RoleRecord } from '@/features/roles/types';
import { destroy, index, show } from '@/routes/roles';

export default function RolesShow({
    role,
    permissionGroups,
    can,
}: {
    role: RoleRecord;
    permissionGroups: PermissionGroups;
    can: { manage: boolean; delete: boolean };
}) {
    return (
        <>
            <Head title={role.label} />

            <div className="app-page admin-page-reveal flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <div className="app-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="app-kicker">Role</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-app-ink">
                            {role.label}
                        </h1>
                        <p className="mt-1 text-sm text-app-muted">
                            {role.permissions.length} permissions,{' '}
                            {role.users_count} users
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {can.manage && (
                            <RoleFormDialog
                                role={role}
                                permissionGroups={permissionGroups}
                                trigger={
                                    <Button variant="outline">Edit</Button>
                                }
                            />
                        )}
                        {can.delete && (
                            <ConfirmActionDialog
                                form={destroy.form(role.id)}
                                title="Delete role?"
                                description={`This will delete the ${role.label} role. Protected starter roles cannot be deleted.`}
                                confirmLabel="Delete role"
                                trigger={
                                    <Button variant="destructive">
                                        <Trash2 />
                                        Delete
                                    </Button>
                                }
                            />
                        )}
                    </div>
                </div>

                <Card className="app-panel">
                    <CardHeader>
                        <CardTitle>Permissions</CardTitle>
                        <CardDescription>
                            Permissions assigned to this role.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {role.permissions.map((permission) => (
                            <div
                                key={permission}
                                className="app-panel-muted p-3 text-sm font-medium text-app-ink"
                            >
                                {permission}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

RolesShow.layout = {
    breadcrumbs: [
        { title: 'Roles & Permissions', href: index() },
        { title: 'Role details', href: show(0) },
    ],
};
