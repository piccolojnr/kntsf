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

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Role
                        </p>
                        <h1 className="text-2xl font-semibold">
                            {role.label}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {role.permissions.length} permissions,{' '}
                            {role.users_count} users
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {can.manage && (
                            <RoleFormDialog
                                role={role}
                                permissionGroups={permissionGroups}
                                trigger={<Button variant="outline">Edit</Button>}
                            />
                        )}
                        {can.delete && (
                            <ConfirmActionDialog
                                form={destroy.form(role.id)}
                                title="Delete role?"
                                description={`This will delete the ${role.label} role. Protected starter roles cannot be deleted.`}
                                confirmLabel="Delete role"
                                trigger={
                                    <Button
                                        variant="destructive"
                                    >
                                        <Trash2 />
                                        Delete
                                    </Button>
                                }
                            />
                        )}
                    </div>
                </div>

                <Card>
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
                                className="rounded-md border bg-muted/20 p-2 text-sm"
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
