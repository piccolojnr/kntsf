import { Badge } from '@/components/ui/badge';
import type { ElectionCandidate } from '../types';

export function CandidateCard({ candidate }: { candidate: ElectionCandidate }) {
    return (
        <div className="app-panel-muted p-4">
            <div className="flex items-start gap-3">
                {candidate.poster_url ? (
                    <img
                        src={candidate.poster_url}
                        alt=""
                        className="size-14 rounded-[0.9rem] object-cover"
                    />
                ) : (
                    <div className="theme-primary-active flex size-14 shrink-0 items-center justify-center rounded-[0.9rem] text-sm font-semibold">
                        {candidate.student_name.slice(0, 1)}
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-app-ink">
                        {candidate.student_name}
                    </p>
                    <p className="text-xs text-app-muted">
                        {candidate.student_number}
                    </p>
                </div>
                <Badge variant="secondary">{candidate.status}</Badge>
            </div>
            {candidate.slogan && (
                <p className="mt-3 text-sm leading-6 text-app-muted">
                    {candidate.slogan}
                </p>
            )}
            {candidate.votes_count !== null && (
                <p className="mt-3 text-sm font-semibold text-app-ink">
                    {candidate.votes_count} votes
                </p>
            )}
        </div>
    );
}
