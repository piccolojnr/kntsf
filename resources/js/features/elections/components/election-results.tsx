import type { Election } from '../types';

export function ElectionResults({ election }: { election: Election }) {
    return (
        <div className="space-y-4">
            {election.positions.map((position) => (
                <div key={position.id} className="rounded-lg border p-4">
                    <p className="font-medium">{position.title}</p>
                    <div className="mt-3 space-y-2">
                        {position.candidates.map((candidate) => (
                            <div
                                key={candidate.id}
                                className="flex justify-between rounded-md bg-muted/30 px-3 py-2 text-sm"
                            >
                                <span>{candidate.student_name}</span>
                                <span>{candidate.votes_count ?? 0} votes</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
