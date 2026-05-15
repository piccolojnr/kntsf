import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Election } from '../types';
import { ElectionVotePanel } from './election-vote-panel';

export function ElectionVotingWorkspace({
    election,
    canVote,
}: {
    election: Election;
    canVote: boolean;
}) {
    const votablePositions = useMemo(
        () =>
            election.positions.filter((position) =>
                position.candidates.some(
                    (candidate) => candidate.status === 'approved',
                ),
            ),
        [election.positions],
    );
    const [activeIndex, setActiveIndex] = useState(0);
    const activePosition = votablePositions[activeIndex];

    if (!canVote || !election.is_open) {
        return (
            <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                Voting is unavailable for this election.
            </div>
        );
    }

    if (!activePosition) {
        return (
            <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                No approved candidates are available yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium">
                        Step {activeIndex + 1} of {votablePositions.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Vote for one position, then move to the next position.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {votablePositions.map((position, index) => (
                        <Button
                            key={position.id}
                            type="button"
                            size="sm"
                            variant={index === activeIndex ? 'default' : 'outline'}
                            onClick={() => setActiveIndex(index)}
                        >
                            {index + 1}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
                <div className="mb-4">
                    <p className="font-medium">{activePosition.title}</p>
                    <p className="text-sm text-muted-foreground">
                        {activePosition.description ?? 'Choose one candidate.'}
                    </p>
                </div>
                <ElectionVotePanel
                    election={election}
                    position={activePosition}
                    canVote={canVote}
                />
            </div>

            <div className="flex justify-between gap-3">
                <Button
                    type="button"
                    variant="outline"
                    disabled={activeIndex === 0}
                    onClick={() => setActiveIndex((index) => index - 1)}
                >
                    <ChevronLeft />
                    Previous
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    disabled={activeIndex >= votablePositions.length - 1}
                    onClick={() => setActiveIndex((index) => index + 1)}
                >
                    Next
                    <ChevronRight />
                </Button>
            </div>
        </div>
    );
}
