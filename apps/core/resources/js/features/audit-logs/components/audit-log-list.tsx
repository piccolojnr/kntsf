import type { AuditLog, Paginated } from '../types';
import { AuditEventBadge } from './audit-event-badge';

export function AuditLogList({ logs }: { logs: Paginated<AuditLog> }) {
    if (logs.data.length === 0) {
        return (
            <div className="rounded-[1rem] border border-dashed border-app-border bg-app-surface-muted p-10 text-center">
                <p className="text-sm font-semibold text-app-ink">
                    No audit logs found
                </p>
                <p className="mt-1 text-sm text-app-muted">
                    Adjust the filters or perform an auditable operation.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-[1rem] border border-app-border bg-app-surface">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[980px] text-sm">
                    <thead className="border-b border-app-border bg-app-surface-muted text-xs text-app-muted">
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
                    <tbody className="divide-y divide-app-border">
                        {logs.data.map((log) => (
                            <tr
                                key={log.id}
                                className="bg-app-surface transition duration-200 hover:bg-app-surface-muted"
                            >
                                <td className="px-4 py-3">
                                    <AuditEventBadge
                                        event={log.event}
                                        label={log.event_label}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    {log.actor ? (
                                        <>
                                            <p className="font-semibold text-app-ink">
                                                {log.actor.name}
                                            </p>
                                            <p className="text-xs text-app-muted">
                                                {log.actor.email}
                                            </p>
                                        </>
                                    ) : (
                                        <span className="text-app-muted">
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
                                        <p className="mt-1 max-w-md truncate text-xs text-app-muted">
                                            {metadataSummary(log.metadata)}
                                        </p>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-app-muted">
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
        .filter(
            ([, value]) =>
                value !== null && value !== undefined && value !== '',
        )
        .map(([key, value]) => `${key}: ${String(value)}`)
        .join(' | ');
}

function formatDateTime(value: string | null) {
    return value === null ? 'Not set' : new Date(value).toLocaleString();
}
