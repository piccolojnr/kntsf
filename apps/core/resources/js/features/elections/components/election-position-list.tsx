import { Pencil, Plus, Trash2 } from 'lucide-react';
import { ConfirmActionDialog } from '@/components/shared/confirm-action-dialog';
import { Button } from '@/components/ui/button';
import { destroy as destroyPosition } from '@/routes/election-positions';
import type {
    Election,
    ElectionFormOptions,
    ElectionPermissions,
} from '../types';
import { CandidateApprovalPanel } from './candidate-approval-panel';
import { CandidateCard } from './candidate-card';
import { ElectionCandidateFormDialog } from './election-candidate-form-dialog';
import { ElectionPositionFormDialog } from './election-position-form-dialog';

export function ElectionPositionList({
    election,
    options,
    can,
}: {
    election: Election;
    options: ElectionFormOptions;
    can: ElectionPermissions;
}) {
    if (election.positions.length === 0) {
        return (
            <div className="rounded-[1rem] border border-dashed border-app-border bg-app-surface-muted p-8 text-center">
                <p className="text-sm font-semibold text-app-ink">
                    No positions yet
                </p>
                <p className="mt-1 text-sm text-app-muted">
                    Add the first position before adding candidates or
                    publishing the election.
                </p>
                {can.update && (
                    <ElectionPositionFormDialog
                        election={election}
                        trigger={
                            <Button className="theme-primary-action mt-4">
                                <Plus />
                                Add position
                            </Button>
                        }
                    />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {election.positions.map((position) => (
                <div key={position.id} className="app-panel p-4">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="font-semibold text-app-ink">
                                {position.title}
                            </p>
                            <p className="mt-1 text-sm text-app-muted">
                                {position.description ?? 'No description set.'}
                            </p>
                            <p className="mt-2 text-xs font-semibold tracking-[0.12em] text-app-muted uppercase">
                                {position.candidates.length} candidates ·{' '}
                                {position.max_winners} winner
                                {position.max_winners === 1 ? '' : 's'}
                            </p>
                        </div>
                        {can.update && (
                            <div className="flex flex-wrap gap-2">
                                <ElectionCandidateFormDialog
                                    election={election}
                                    position={position}
                                    options={options}
                                    trigger={
                                        <Button
                                            size="sm"
                                            className="theme-primary-action"
                                        >
                                            <Plus />
                                            Candidate
                                        </Button>
                                    }
                                />
                                <ElectionPositionFormDialog
                                    election={election}
                                    position={position}
                                    trigger={
                                        <Button size="sm" variant="outline">
                                            <Pencil />
                                            Edit
                                        </Button>
                                    }
                                />
                                <ConfirmActionDialog
                                    form={destroyPosition.form(position.id)}
                                    title="Delete position?"
                                    description={`This removes "${position.title}" and its candidates if no votes have been cast.`}
                                    confirmLabel="Delete position"
                                    trigger={
                                        <Button size="sm" variant="destructive">
                                            <Trash2 />
                                            Delete
                                        </Button>
                                    }
                                />
                            </div>
                        )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        {position.candidates.map((candidate) => (
                            <div key={candidate.id} className="space-y-2">
                                <CandidateCard candidate={candidate} />
                                {can.manage_candidates && (
                                    <div className="flex flex-wrap gap-2">
                                        <ElectionCandidateFormDialog
                                            election={election}
                                            position={position}
                                            candidate={candidate}
                                            options={options}
                                            trigger={
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Pencil />
                                                    Edit candidate
                                                </Button>
                                            }
                                        />
                                        <CandidateApprovalPanel
                                            candidate={candidate}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {position.candidates.length === 0 && (
                        <div className="rounded-[1rem] border border-dashed border-app-border bg-app-surface-muted p-6 text-sm text-app-muted">
                            No candidates added to this position yet.
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
