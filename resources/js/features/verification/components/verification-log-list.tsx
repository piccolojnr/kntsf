import type { Paginated, VerificationLog } from '../types';
import { VerificationResultBadge } from './verification-result-badge';

export function VerificationLogList({
    logs,
}: {
    logs: Paginated<VerificationLog>;
}) {
    if (logs.data.length === 0) {
        return (
            <div className="rounded-md border border-dashed bg-muted/20 p-10 text-center">
                <p className="text-sm font-medium">No verification logs yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Attempts will appear here after manual verification starts.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-md border bg-card">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[920px] text-sm">
                    <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">
                                Method
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Result
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Student
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Permit
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Verifier
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                Time
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {logs.data.map((log) => (
                            <tr key={log.id} className="bg-card hover:bg-muted/30">
                                <td className="px-4 py-3">{log.method_label}</td>
                                <td className="px-4 py-3">
                                    <VerificationResultBadge
                                        result={log.result}
                                        label={log.result_label}
                                    />
                                    {log.reason && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {log.reason}
                                        </p>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {log.student ? (
                                        <>
                                            <p className="font-medium">
                                                {log.student.name ??
                                                    'Unnamed student'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {log.student.student_number}
                                            </p>
                                        </>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            Not resolved
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {log.permit ? (
                                        `Last 4: ${log.permit.code_last4 ?? '----'}`
                                    ) : (
                                        <span className="text-muted-foreground">
                                            Not resolved
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {log.verifier?.name ?? 'System'}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
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
