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
import { Textarea } from '@/components/ui/textarea';
import { store, update } from '@/routes/executives';
import type { Executive, ExecutiveOptions } from '../types';

export function ExecutiveFormDialog({
    executive,
    options,
    trigger,
}: {
    executive?: Executive;
    options: ExecutiveOptions;
    trigger?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const selectedRoles = executive?.roles.map((role) => role.name) ?? [
        'staff',
    ];
    const action = executive ? update.form(executive.id) : store.form();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button
                        className="h-[39.5px] w-[39.5px] bg-app-ink px-0 text-app-surface hover:bg-app-red sm:w-auto sm:px-3"
                    >
                        <Plus />
                        Create Executive
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        {executive ? 'Edit Executive' : 'Create Executive'}
                    </DialogTitle>
                    <DialogDescription>
                        Manage account access and SRC profile details.
                    </DialogDescription>
                </DialogHeader>

                <Form
                    {...action}
                    options={{ preserveScroll: true }}
                    onSuccess={() => setOpen(false)}
                    className="grid gap-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Name" error={errors.name}>
                                    <Input
                                        name="name"
                                        defaultValue={executive?.name ?? ''}
                                        required
                                    />
                                </Field>
                                <Field label="Email" error={errors.email}>
                                    <Input
                                        type="email"
                                        name="email"
                                        defaultValue={executive?.email ?? ''}
                                        required
                                    />
                                </Field>
                                <Field label="Position" error={errors.position}>
                                    <Input
                                        name="position"
                                        defaultValue={
                                            executive?.profile?.position ?? ''
                                        }
                                    />
                                </Field>
                                <Field label="Category" error={errors.category}>
                                    <Input
                                        name="category"
                                        defaultValue={
                                            executive?.profile?.category ?? ''
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Sort order"
                                    error={errors.sort_order}
                                >
                                    <Input
                                        type="number"
                                        min="0"
                                        name="sort_order"
                                        defaultValue={
                                            executive?.profile?.sort_order ?? 0
                                        }
                                    />
                                </Field>
                                <div className="grid gap-3">
                                    <Label>Flags</Label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            value="1"
                                            defaultChecked={
                                                executive?.is_active ?? true
                                            }
                                        />
                                        Active account
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            name="is_published"
                                            value="1"
                                            defaultChecked={
                                                executive?.profile
                                                    ?.is_published ?? true
                                            }
                                        />
                                        Publish profile
                                    </label>
                                    {!executive && (
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                name="send_setup_link"
                                                value="1"
                                            />
                                            Send setup-password link
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <Label>Roles</Label>
                                <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-3">
                                    {options.roles.map((role) => (
                                        <label
                                            key={role.name}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                name="roles[]"
                                                value={role.name}
                                                defaultChecked={selectedRoles.includes(
                                                    role.name,
                                                )}
                                            />
                                            {role.label}
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors.roles} />
                            </div>

                            <Field
                                label="Position description"
                                error={errors.position_description}
                            >
                                <Textarea
                                    name="position_description"
                                    defaultValue={
                                        executive?.profile
                                            ?.position_description ?? ''
                                    }
                                />
                            </Field>
                            <Field label="Biography" error={errors.biography}>
                                <Textarea
                                    name="biography"
                                    defaultValue={
                                        executive?.profile?.biography ?? ''
                                    }
                                />
                            </Field>

                            <div className="flex justify-end">
                                <Button disabled={processing}
                                    className="h-[39.5px] w-[39.5px] bg-app-ink px-0 text-app-surface hover:bg-app-red sm:w-auto sm:px-3"
                                >
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

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}
