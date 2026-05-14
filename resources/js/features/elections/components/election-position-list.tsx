import type { Election, ElectionPermissions } from '../types';
import { CandidateCard } from './candidate-card';
import { ElectionVotePanel } from './election-vote-panel';

export function ElectionPositionList({
    election,
    can,
}: {
    election: Election;
    can: ElectionPermissions;
}) {
    return (
        <div className="space-y-4">
            {election.positions.map((position) => (
                <div key={position.id} className="rounded-lg border bg-card p-4">
                    <div className="mb-4">
                        <p className="font-medium">{position.title}</p>
                        <p className="text-sm text-muted-foreground">
                            {position.description ?? 'No description set.'}
                        </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        {position.candidates.map((candidate) => (
                            <CandidateCard
                                key={candidate.id}
                                candidate={candidate}
                            />
                        ))}
                    </div>
                    <div className="mt-4">
                        <ElectionVotePanel
                            election={election}
                            position={position}
                            canVote={can.vote ?? false}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
