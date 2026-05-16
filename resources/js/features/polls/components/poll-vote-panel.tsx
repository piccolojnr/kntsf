import { Form } from '@inertiajs/react';
import { Vote } from 'lucide-react';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { vote } from '@/routes/polls';
import type { Poll } from '../types';

export function PollVotePanel({ poll, canVote }: { poll: Poll; canVote: boolean }) {
    if (!canVote) {
        return (
            <div className="rounded-md border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                Voting is available only to linked student accounts.
            </div>
        );
    }

    if (!poll.is_open) {
        return (
            <div className="rounded-md border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                This poll is not currently open for voting.
            </div>
        );
    }

    return (
        <Form {...vote.form(poll.id)} options={{ preserveScroll: true }}>
            {({ processing, errors }) => (
                <div className="space-y-4">
                    <div className="space-y-2">
                        {poll.options
                            .filter((option) => option.status === 'active')
                            .map((option) => (
                                <div
                                    key={option.id}
                                    className="flex items-center gap-2 rounded-md border p-3"
                                >
                                    <input
                                        type="radio"
                                        name="poll_option_id"
                                        id={`option-${option.id}`}
                                        value={option.id.toString()}
                                        defaultChecked={
                                            poll.user_vote?.poll_option_id ===
                                            option.id
                                        }
                                        className="size-4"
                                    />
                                    <Label htmlFor={`option-${option.id}`}>
                                        {option.text}
                                    </Label>
                                </div>
                            ))}
                    </div>
                    <InputError message={errors.poll_option_id} />

                    {poll.type === 'dynamic_options' && (
                        <div className="grid gap-2">
                            <Label htmlFor="option_text">
                                Or add your own option
                            </Label>
                            <Input
                                id="option_text"
                                name="option_text"
                                placeholder="Enter an option"
                            />
                            <InputError message={errors.option_text} />
                        </div>
                    )}

                    <Button disabled={processing}>
                        <Vote />
                        {poll.user_vote && poll.allow_vote_change
                            ? 'Update vote'
                            : 'Cast vote'}
                    </Button>
                </div>
            )}
        </Form>
    );
}
