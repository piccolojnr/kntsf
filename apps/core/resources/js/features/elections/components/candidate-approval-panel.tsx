import { Form } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { approve, reject, withdraw } from '@/routes/candidates';
import type { ElectionCandidate } from '../types';

export function CandidateApprovalPanel({
    candidate,
}: {
    candidate: ElectionCandidate;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            <Form {...approve.form(candidate.id)} options={{ preserveScroll: true }}>
                {({ processing }) => (
                    <Button disabled={processing} size="sm" variant="outline">
                        <Check />
                        Approve
                    </Button>
                )}
            </Form>
            <Form {...reject.form(candidate.id)} options={{ preserveScroll: true }}>
                {({ processing }) => (
                    <Button disabled={processing} size="sm" variant="outline">
                        <X />
                        Reject
                    </Button>
                )}
            </Form>
            <Form {...withdraw.form(candidate.id)} options={{ preserveScroll: true }}>
                {({ processing }) => (
                    <Button disabled={processing} size="sm" variant="outline">
                        Withdraw
                    </Button>
                )}
            </Form>
        </div>
    );
}
