import { Head } from '@inertiajs/react';
import Heading from '@/components/shared/heading';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { RoleFormDialog } from '@/features/roles/components/role-form-dialog';
import { RoleList } from '@/features/roles/components/role-list';
import type { PermissionGroups, RoleRecord } from '@/features/roles/types';
import { index } from '@/routes/roles';

export default function RolesIndex({
    roles,
    permissionGroups,
    can,
}: {
    roles: RoleRecord[];
    permissionGroups: PermissionGroups;
    can: { manage: boolean };
}) {
    return (
        <>
            <Head title="Roles & Permissions" />

            <div className="app-page admin-page-reveal flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title="Roles & Permissions"
                        description="Manage role names and grouped permission access."
                    />

                    {can.manage && (
                        <RoleFormDialog permissionGroups={permissionGroups} />
                    )}
                </div>

                <Card className="app-panel gap-0 overflow-hidden py-0">
                    <CardHeader className="py-4">
                        <p className="app-kicker">Access control</p>
                        <CardTitle className="mt-1">Roles</CardTitle>
                        <CardDescription>
                            Protected starter roles cannot be deleted.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="border-t py-4">
                        <RoleList
                            roles={roles}
                            permissionGroups={permissionGroups}
                            canManage={can.manage}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

RolesIndex.layout = {
    breadcrumbs: [{ title: 'Roles & Permissions', href: index() }],
};
