import { Form } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { preview, store } from '@/routes/public/permit-request';
import type {
    PermitRequestPreview,
    PermitRequestSettings,
    PublicPermitStudentOptions,
} from '../types';
import { SelfServiceStudentForm } from './self-service-student-form';

type PreviewState =
    | { status: 'idle'; student: null; exists: boolean | null; error: null }
    | { status: 'loading'; student: null; exists: null; error: null }
    | { status: 'found'; student: PermitRequestPreview; exists: true; error: null }
    | { status: 'missing'; student: null; exists: false; error: null }
    | { status: 'error'; student: null; exists: null; error: string };

export function StudentLookupForm({
    settings,
    studentOptions,
}: {
    settings: PermitRequestSettings;
    studentOptions: PublicPermitStudentOptions;
}) {
    const [studentNumber, setStudentNumber] = useState('');
    const [previewState, setPreviewState] = useState<PreviewState>({
        status: 'idle',
        student: null,
        exists: null,
        error: null,
    });

    async function lookup() {
        if (!studentNumber.trim()) {
            return;
        }

        setPreviewState({ status: 'loading', student: null, exists: null, error: null });

        const response = await fetch(
            preview.url({
                query: {
                    student_number: studentNumber,
                },
            }),
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            },
        );

        if (!response.ok) {
            setPreviewState({
                status: 'error',
                student: null,
                exists: null,
                error: 'Could not check this student number.',
            });

            return;
        }

        const payload = (await response.json()) as {
            exists: boolean;
            student: PermitRequestPreview | null;
        };

        setPreviewState(
            payload.exists && payload.student
                ? { status: 'found', student: payload.student, exists: true, error: null }
                : { status: 'missing', student: null, exists: false, error: null },
        );
    }

    return (
        <Form {...store.form()} className="public-panel p-6">
            {({ processing, errors }) => (
                <div className="grid gap-5">
                    <div>
                        <p className="public-kicker">Self-service</p>
                        <h1 className="mt-2 text-3xl font-black tracking-tight">
                            Request an SRC permit
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-app-muted">
                            Enter your student number. If your record exists,
                            we only show a masked preview before payment.
                        </p>
                    </div>

                    {!settings.permit_requests_enabled && (
                        <div className="rounded-md border border-app-red/30 bg-app-red/10 px-4 py-3 text-sm text-app-red">
                            Self-service permit requests are currently disabled.
                        </div>
                    )}

                    <input
                        type="hidden"
                        name="student_exists"
                        value={previewState.exists === true ? '1' : '0'}
                    />

                    <div className="grid gap-2">
                        <Label htmlFor="student_number">Student number</Label>
                        <div className="flex gap-2">
                            <Input
                                id="student_number"
                                name="student_number"
                                value={studentNumber}
                                onChange={(event) => setStudentNumber(event.target.value)}
                                placeholder="26102859"
                                className="h-10 bg-app-surface"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                className="h-10"
                                onClick={lookup}
                                disabled={previewState.status === 'loading'}
                            >
                                <Search className="size-4" />
                                Check
                            </Button>
                        </div>
                        <InputError message={errors.student_number} />
                        {previewState.error && (
                            <p className="text-sm text-app-red">{previewState.error}</p>
                        )}
                    </div>

                    {previewState.status === 'found' && previewState.student && (
                        <div className="rounded-md border border-app-green/40 bg-app-green/10 p-4">
                            <p className="text-sm font-semibold text-app-green">
                                Student record found
                            </p>
                            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                                <span>{previewState.student.name}</span>
                                <span>{previewState.student.student_number}</span>
                                <span>{previewState.student.course}</span>
                                <span>Level {previewState.student.level}</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                <span className="rounded-full border border-app-border bg-app-surface px-2.5 py-1 text-app-muted">
                                    Email{' '}
                                    {previewState.student.has_email
                                        ? 'already on file'
                                        : 'needed'}
                                </span>
                                <span className="rounded-full border border-app-border bg-app-surface px-2.5 py-1 text-app-muted">
                                    Phone{' '}
                                    {previewState.student.has_phone
                                        ? 'already on file'
                                        : 'needed'}
                                </span>
                            </div>
                            {!previewState.student.can_request &&
                                previewState.student.block_reason && (
                                    <div className="mt-4 rounded-md border border-app-red/30 bg-app-red/10 px-4 py-3 text-sm text-app-red">
                                        {previewState.student.block_reason}
                                    </div>
                                )}
                        </div>
                    )}

                    {previewState.status === 'missing' && (
                        <SelfServiceStudentForm options={studentOptions} />
                    )}

                    {previewState.status === 'found' &&
                        previewState.student &&
                        previewState.student.can_request &&
                        (!previewState.student.has_email ||
                            !previewState.student.has_phone) && (
                        <div className="grid gap-4 rounded-md border border-app-border bg-app-surface-muted p-4 sm:grid-cols-2">
                            {!previewState.student.has_email && (
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Contact email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        className="h-10 bg-app-surface"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                            )}
                            {!previewState.student.has_phone && (
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Contact phone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        className="h-10 bg-app-surface"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                            )}
                            <p className="text-xs leading-5 text-app-muted sm:col-span-2">
                                Existing contact details are kept private. To
                                change an email or phone number already on file,
                                contact SRC administration.
                            </p>
                        </div>
                    )}

                    <InputError message={errors.permit_request} />

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-app-border pt-5">
                        <div className="text-sm text-app-muted">
                            Amount:{' '}
                            <span className="font-black text-app-ink">
                                {settings.currency} {settings.default_amount.toFixed(2)}
                            </span>
                        </div>
                        <Button
                            type="submit"
                            className="h-10"
                            disabled={
                                processing ||
                                !settings.permit_requests_enabled ||
                                !['found', 'missing'].includes(previewState.status) ||
                                (previewState.status === 'found' &&
                                    !previewState.student.can_request)
                            }
                        >
                            Create request
                        </Button>
                    </div>
                </div>
            )}
        </Form>
    );
}
