import type { Election } from '../types';

export function ElectionResults({ election }: { election: Election }) {
    return (
        <div className="space-y-4">
            {election.positions.map((position) => (
                <div key={position.id} className="app-panel-muted p-4">
                    <p className="font-semibold text-app-ink">
                        {position.title}
                    </p>
                    <div className="mt-3 space-y-2">
                        {position.candidates.map((candidate) => (
                            <div
                                key={candidate.id}
                                className="flex justify-between rounded-[0.8rem] bg-app-surface px-3 py-2 text-sm"
                            >
                                <span className="font-medium text-app-ink">
                                    {candidate.student_name}
                                </span>
                                <span className="font-semibold text-app-muted">
                                    {candidate.votes_count ?? 0} votes
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
