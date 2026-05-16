import { Badge } from '@/components/ui/badge';
import type { ElectionCandidate } from '../types';

export function CandidateCard({ candidate }: { candidate: ElectionCandidate }) {
    return (
        <div className="rounded-md border bg-card p-4">
            <div className="flex items-start gap-3">
                {candidate.poster_url ? (
                    <img
                        src={candidate.poster_url}
                        alt=""
                        className="size-14 rounded-md object-cover"
                    />
                ) : (
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-semibold text-muted-foreground">
                        {candidate.student_name.slice(0, 1)}
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <p className="font-medium">{candidate.student_name}</p>
                    <p className="text-xs text-muted-foreground">
                        {candidate.student_number}
                    </p>
                </div>
                <Badge variant="secondary">{candidate.status}</Badge>
            </div>
            {candidate.slogan && (
                <p className="mt-3 text-sm text-muted-foreground">
                    {candidate.slogan}
                </p>
            )}
            {candidate.votes_count !== null && (
                <p className="mt-3 text-sm font-medium">
                    {candidate.votes_count} votes
                </p>
            )}
        </div>
    );
}
