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

            <div className="app-page admin-page-reveal flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <div className="app-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="app-kicker">Executive</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-app-ink">
                            {executive.name}
                        </h1>
                        <p className="mt-1 text-sm text-app-muted">
                            {executive.email}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {can.update && (
                            <ExecutiveFormDialog
                                executive={executive}
                                options={options}
                                trigger={
                                    <Button variant="outline">Edit</Button>
                                }
                            />
                        )}
                        {can.sendSetupLink && (
                            <Form
                                {...sendSetupLink.form(executive.id)}
                                options={{ preserveScroll: true }}
                            >
                                {({ processing }) => (
                                    <Button
                                        variant="outline"
                                        disabled={processing}
                                    >
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
                                    <Button
                                        variant="outline"
                                        disabled={processing}
                                    >
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
                                    <Button variant="destructive">
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

                    <Card className="app-panel">
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
        <div className="app-panel-muted p-3">
            <p className="text-xs font-semibold tracking-[0.14em] text-app-muted uppercase">
                {label}
            </p>
            <div className="mt-2 text-sm font-semibold text-app-ink">
                {children}
            </div>
        </div>
    );
}

ExecutivesShow.layout = {
    breadcrumbs: [
        { title: 'Executives', href: index() },
        { title: 'Executive details', href: show(0) },
    ],
};
