import { Form } from '@inertiajs/react';
import { Plus, Save } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store, update } from '@/routes/roles';
import type { PermissionGroups, RoleRecord } from '../types';
import { PermissionMatrix } from './permission-matrix';

export function RoleFormDialog({
    role,
    permissionGroups,
    trigger,
}: {
    role?: RoleRecord;
    permissionGroups: PermissionGroups;
    trigger?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const action = role ? update.form(role.id) : store.form();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button>
                        <Plus />
                        Create Role
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{role ? 'Edit Role' : 'Create Role'}</DialogTitle>
                    <DialogDescription>
                        Assign permissions by grouped checklist.
                    </DialogDescription>
                </DialogHeader>

                <Form
                    {...action}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setOpen(false)}
                    className="grid gap-4"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label>Role name</Label>
                                <Input
                                    name="name"
                                    defaultValue={role?.name ?? ''}
                                    disabled={role?.is_protected}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <PermissionMatrix
                                permissionGroups={permissionGroups}
                                selectedPermissions={role?.permissions ?? []}
                            />
                            <InputError message={errors.permissions} />

                            <div className="flex justify-end">
                                <Button disabled={processing}>
                                    <Save />
                                    Save
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
