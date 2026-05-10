import type { AuditLog, Paginated } from '../types';
import { AuditEventBadge } from './audit-event-badge';

export function AuditLogList({ logs }: { logs: Paginated<AuditLog> }) {
    if (logs.data.length === 0) {
        return (
            <div className="rounded-lg border border-dashed bg-muted/20 p-10 text-center">
                <p className="text-sm font-medium">No audit logs found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Adjust the filters or perform an auditable operation.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border bg-card">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[980px] text-sm">
                    <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">
                                Event
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Actor
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Subject
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Description
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Time
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {logs.data.map((log) => (
                            <tr key={log.id} className="bg-card hover:bg-muted/30">
                                <td className="px-4 py-3">
                                    <AuditEventBadge
                                        event={log.event}
                                        label={log.event_label}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    {log.actor ? (
                                        <>
                                            <p className="font-medium">
                                                {log.actor.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {log.actor.email}
                                            </p>
                                        </>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            System
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {log.subject?.label ?? 'None'}
                                </td>
                                <td className="px-4 py-3">
                                    <p>{log.description ?? 'No description'}</p>
                                    {log.metadata && (
                                        <p className="mt-1 max-w-md truncate text-xs text-muted-foreground">
                                            {metadataSummary(log.metadata)}
                                        </p>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                    {formatDateTime(log.created_at)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function metadataSummary(metadata: Record<string, unknown>) {
    return Object.entries(metadata)
        .filter(([, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => `${key}: ${String(value)}`)
        .join(' | ');
}

function formatDateTime(value: string | null) {
    return value === null ? 'Not set' : new Date(value).toLocaleString();
}
