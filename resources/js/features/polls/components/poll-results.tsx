import type { Poll } from '../types';
import { ProgressBar } from './progress-bar';

export function PollResults({ poll }: { poll: Poll }) {
    if (!poll.show_results) {
        return (
            <div className="rounded-md border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                Results are hidden for this poll.
            </div>
        );
    }

    const totalVotes = Math.max(poll.votes_count, 0);

    return (
        <div className="space-y-3">
            {poll.options.map((option) => {
                const votes = option.votes_count ?? 0;
                const percent = totalVotes === 0 ? 0 : (votes / totalVotes) * 100;

                return (
                    <div key={option.id} className="rounded-md border p-3">
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium">{option.text}</span>
                            <span className="text-muted-foreground">
                                {votes} votes
                            </span>
                        </div>
                        <ProgressBar value={percent} />
                    </div>
                );
            })}
        </div>
    );
}
