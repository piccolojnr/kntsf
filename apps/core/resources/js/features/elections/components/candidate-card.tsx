import { Badge } from '@/components/ui/badge';
import type { ElectionCandidate } from '../types';

export function CandidateCard({ candidate }: { candidate: ElectionCandidate }) {
    return (
        <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
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
