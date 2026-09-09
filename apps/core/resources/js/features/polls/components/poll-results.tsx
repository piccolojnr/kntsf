import type { Poll } from '../types';
import { ProgressBar } from './progress-bar';

export function PollResults({ poll }: { poll: Poll }) {
    if (!poll.show_results) {
        return (
            <div className="rounded-[1rem] border border-dashed border-app-border bg-app-surface-muted p-6 text-sm text-app-muted">
                Results are hidden for this poll.
            </div>
        );
    }

    const totalVotes = Math.max(poll.votes_count, 0);

    return (
        <div className="space-y-3">
            {poll.options.map((option) => {
                const votes = option.votes_count ?? 0;
                const percent =
                    totalVotes === 0 ? 0 : (votes / totalVotes) * 100;

                return (
                    <div
                        key={option.id}
                        className="rounded-[1rem] border border-app-border bg-app-surface-muted p-4"
                    >
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="font-semibold text-app-ink">
                                {option.text}
                            </span>
                            <span className="text-app-muted">
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
