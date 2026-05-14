import { Form } from '@inertiajs/react';
import { Vote } from 'lucide-react';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { vote } from '@/routes/elections';
import type { Election, ElectionPosition } from '../types';

export function ElectionVotePanel({
    election,
    position,
    canVote,
}: {
    election: Election;
    position: ElectionPosition;
    canVote: boolean;
}) {
    if (!canVote || !election.is_open) {
        return (
            <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                Voting is unavailable for this position.
            </div>
        );
    }

    return (
        <Form
            {...vote.form({ election: election.id, position: position.id })}
            options={{ preserveScroll: true }}
        >
            {({ processing, errors }) => (
                <div className="space-y-3">
                    {position.candidates
                        .filter((candidate) => candidate.status === 'approved')
                        .map((candidate) => (
                            <div
                                key={candidate.id}
                                className="flex items-center gap-2 rounded-md border p-3"
                            >
                                <input
                                    id={`candidate-${candidate.id}`}
                                    type="radio"
                                    name="election_candidate_id"
                                    value={candidate.id}
                                    className="size-4"
                                />
                                <Label htmlFor={`candidate-${candidate.id}`}>
                                    {candidate.student_name}
                                </Label>
                            </div>
                        ))}
                    <InputError message={errors.election_candidate_id} />
                    <InputError message={errors.election} />
                    <InputError message={errors.student} />
                    <Button disabled={processing}>
                        <Vote />
                        Cast vote
                    </Button>
                </div>
            )}
        </Form>
    );
}
