import type { Paginated, VerificationLog } from '../types';
import { VerificationResultBadge } from './verification-result-badge';

export function VerificationLogList({
    logs,
}: {
    logs: Paginated<VerificationLog>;
}) {
    if (logs.data.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-app-border bg-app-surface-muted p-10 text-center">
                <p className="text-sm font-semibold text-app-ink">
                    No verification logs yet
                </p>
                <p className="mt-1 text-sm text-app-muted">
                    Attempts will appear here after manual verification starts.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-[0_18px_48px_rgba(17,24,19,0.06)] dark:shadow-none">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[920px] text-sm">
                    <thead className="border-b border-app-border bg-app-surface-muted text-xs text-app-muted">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Method
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Result
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Student
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Permit
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
                                Verifier
                            </th>
                            <th className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase">
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
                                    {log.method_label}
                                </td>
                                <td className="px-4 py-3">
                                    <VerificationResultBadge
                                        result={log.result}
                                        label={log.result_label}
                                    />
                                    {log.reason && (
                                        <p className="mt-1 text-xs text-app-muted">
                                            {log.reason}
                                        </p>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {log.student ? (
                                        <>
                                            <p className="font-semibold text-app-ink">
                                                {log.student.name ??
                                                    'Unnamed student'}
                                            </p>
                                            <p className="text-xs text-app-muted">
                                                {log.student.student_number}
                                            </p>
                                        </>
                                    ) : (
                                        <span className="text-app-muted">
                                            Not resolved
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {log.permit ? (
                                        `Last 4: ${log.permit.code_last4 ?? '----'}`
                                    ) : (
                                        <span className="text-app-muted">
                                            Not resolved
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {log.verifier?.name ?? 'System'}
                                </td>
                                <td className="px-4 py-3 text-app-muted">
                                    {formatDate(log.created_at)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function formatDate(value: string | null) {
    return value === null ? 'Not set' : new Date(value).toLocaleString();
}
