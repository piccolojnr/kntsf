import { Form, Link } from '@inertiajs/react';
import { Eye, KeyRound, Power, PowerOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    activate,
    deactivate,
    destroy,
    sendSetupLink,
    show,
} from '@/routes/executives';
import type { Executive, ExecutiveOptions, Paginated } from '../types';
import { ExecutiveFormDialog } from './executive-form-dialog';
import { ExecutiveStatusBadge } from './executive-status-badge';

export function ExecutiveList({
    executives,
    options,
    can,
}: {
    executives: Paginated<Executive>;
    options: ExecutiveOptions;
    can: { update: boolean; delete: boolean; activate: boolean };
}) {
    if (executives.data.length === 0) {
        return (
            <div className="rounded-lg border border-dashed bg-muted/20 p-10 text-center">
                <p className="text-sm font-medium">No executives found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Create an executive account or adjust the search.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border bg-card">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[920px] text-sm">
                    <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">
                                Executive
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Role
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Position
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Status
                            </th>
                            <th className="px-4 py-3 text-right font-medium">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {executives.data.map((executive) => (
                            <tr
                                key={executive.id}
                                className="bg-card hover:bg-muted/30"
                            >
                                <td className="px-4 py-3">
                                    <p className="font-medium">
                                        {executive.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {executive.email}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    {executive.roles
                                        .map((role) => role.label)
                                        .join(', ')}
                                </td>
                                <td className="px-4 py-3">
                                    {executive.profile?.position ?? 'Not set'}
                                </td>
                                <td className="px-4 py-3">
                                    <ExecutiveStatusBadge
                                        executive={executive}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button asChild size="sm" variant="ghost">
                                            <Link href={show(executive.id)}>
                                                <Eye />
                                                View
                                            </Link>
                                        </Button>
                                        {can.update && (
                                            <>
                                                <ExecutiveFormDialog
                                                    executive={executive}
                                                    options={options}
                                                    trigger={
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            Edit
                                                        </Button>
                                                    }
                                                />
                                                <Form
                                                    {...sendSetupLink.form(
                                                        executive.id,
                                                    )}
                                                    options={{
                                                        preserveScroll: true,
                                                    }}
                                                >
                                                    {({ processing }) => (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={processing}
                                                        >
                                                            <KeyRound />
                                                            Setup
                                                        </Button>
                                                    )}
                                                </Form>
                                            </>
                                        )}
                                        {can.activate &&
                                            (executive.is_active ? (
                                                <Form
                                                    {...deactivate.form(
                                                        executive.id,
                                                    )}
                                                    options={{
                                                        preserveScroll: true,
                                                    }}
                                                >
                                                    {({ processing }) => (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={processing}
                                                        >
                                                            <PowerOff />
                                                            Deactivate
                                                        </Button>
                                                    )}
                                                </Form>
                                            ) : (
                                                <Form
                                                    {...activate.form(
                                                        executive.id,
                                                    )}
                                                    options={{
                                                        preserveScroll: true,
                                                    }}
                                                >
                                                    {({ processing }) => (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={processing}
                                                        >
                                                            <Power />
                                                            Activate
                                                        </Button>
                                                    )}
                                                </Form>
                                            ))}
                                        {can.delete && (
                                            <Form
                                                {...destroy.form(executive.id)}
                                                options={{ preserveScroll: true }}
                                            >
                                                {({ processing }) => (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        disabled={processing}
                                                    >
                                                        <Trash2 />
                                                        Delete
                                                    </Button>
                                                )}
                                            </Form>
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
