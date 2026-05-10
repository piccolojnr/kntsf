import { Form, Head } from '@inertiajs/react';
import { KeyRound, Power, PowerOff, Trash2 } from 'lucide-react';
import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ExecutiveFormDialog } from '@/features/executives/components/executive-form-dialog';
import { ExecutiveProfileCard } from '@/features/executives/components/executive-profile-card';
import { ExecutiveStatusBadge } from '@/features/executives/components/executive-status-badge';
import type { Executive, ExecutiveOptions } from '@/features/executives/types';
import {
    activate,
    deactivate,
    destroy,
    index,
    sendSetupLink,
    show,
} from '@/routes/executives';

export default function ExecutivesShow({
    executive,
    options,
    can,
}: {
    executive: Executive;
    options: ExecutiveOptions;
    can: {
        update: boolean;
        delete: boolean;
        activate: boolean;
        deactivate: boolean;
        sendSetupLink: boolean;
    };
}) {
    return (
        <>
            <Head title={executive.name} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Executive
                        </p>
                        <h1 className="text-2xl font-semibold">
                            {executive.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {executive.email}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {can.update && (
                            <ExecutiveFormDialog
                                executive={executive}
                                options={options}
                                trigger={<Button variant="outline">Edit</Button>}
                            />
                        )}
                        {can.sendSetupLink && (
                            <Form
                                {...sendSetupLink.form(executive.id)}
                                options={{ preserveScroll: true }}
                            >
                                {({ processing }) => (
                                    <Button variant="outline" disabled={processing}>
                                        <KeyRound />
                                        Send Setup Link
                                    </Button>
                                )}
                            </Form>
                        )}
                        {can.deactivate && executive.is_active && (
                            <ConfirmActionDialog
                                form={deactivate.form(executive.id)}
                                title="Deactivate executive?"
                                description={`This will prevent ${executive.name} from using the dashboard until reactivated.`}
                                confirmLabel="Deactivate"
                                variant="outline"
                                trigger={
                                    <Button variant="outline">
                                        <PowerOff />
                                        Deactivate
                                    </Button>
                                }
                            />
                        )}
                        {can.activate && !executive.is_active && (
                            <Form
                                {...activate.form(executive.id)}
                                options={{ preserveScroll: true }}
                            >
                                {({ processing }) => (
                                    <Button variant="outline" disabled={processing}>
                                        <Power />
                                        Activate
                                    </Button>
                                )}
                            </Form>
                        )}
                        {can.delete && (
                            <ConfirmActionDialog
                                form={destroy.form(executive.id)}
                                title="Delete executive?"
                                description={`This will delete ${executive.name}'s executive account. This is a destructive action.`}
                                confirmLabel="Delete executive"
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

                <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
                    <ExecutiveProfileCard executive={executive} />

                    <Card>
                        <CardHeader>
                            <CardTitle>Account details</CardTitle>
                            <CardDescription>
                                Internal user account and assigned roles.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <Detail label="Status">
                                <ExecutiveStatusBadge executive={executive} />
                            </Detail>
                            <Detail label="Roles">
                                {executive.roles
                                    .map((role) => role.label)
                                    .join(', ')}
                            </Detail>
                            <Detail label="Category">
                                {executive.profile?.category ?? 'Not set'}
                            </Detail>
                            <Detail label="Published">
                                {executive.profile?.is_published
                                    ? 'Published'
                                    : 'Hidden'}
                            </Detail>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function Detail({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="mt-1 text-sm font-medium">{children}</div>
        </div>
    );
}

ExecutivesShow.layout = {
    breadcrumbs: [
        { title: 'Executives', href: index() },
        { title: 'Executive details', href: show(0) },
    ],
};
