import { Form } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    CreditCard,
    FileWarning,
    Search,
    ShieldCheck,
} from 'lucide-react';
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
    | {
          status: 'found';
          student: PermitRequestPreview;
          exists: true;
          error: null;
      }
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

    function updateStudentNumber(value: string) {
        setStudentNumber(value);

        setPreviewState((state) => {
            if (state.status === 'idle' || state.status === 'loading') {
                return state;
            }

            return {
                status: 'idle',
                student: null,
                exists: null,
                error: null,
            };
        });
    }

    async function lookup() {
        const normalizedStudentNumber = studentNumber.trim();

        if (!normalizedStudentNumber || !settings.permit_requests_enabled) {
            return;
        }

        setStudentNumber(normalizedStudentNumber);
        setPreviewState({
            status: 'loading',
            student: null,
            exists: null,
            error: null,
        });

        try {
            const response = await fetch(
                preview.url({
                    query: {
                        student_number: normalizedStudentNumber,
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
                    error:
                        response.status === 422
                            ? 'Enter a valid student number before continuing.'
                            : 'Could not check this student number.',
                });

                return;
            }

            const payload = (await response.json()) as {
                exists: boolean;
                student: PermitRequestPreview | null;
            };

            setPreviewState(
                payload.exists && payload.student
                    ? {
                          status: 'found',
                          student: payload.student,
                          exists: true,
                          error: null,
                      }
                    : {
                          status: 'missing',
                          student: null,
                          exists: false,
                          error: null,
                      },
            );
        } catch {
            setPreviewState({
                status: 'error',
                student: null,
                exists: null,
                error: 'Network problem while checking this student number.',
            });
        }
    }

    return (
        <Form
            {...store.form()}
            className="public-sketch-card public-scroll-rise theme-surface rounded-[1.35rem] border border-app-border p-6 shadow-[0_18px_55px_rgba(28,24,38,0.055)]"
        >
            {({ processing, errors }) => {
                const hasSelfServiceErrors = [
                    errors.name,
                    errors.email,
                    errors.phone,
                    errors.course,
                    errors.level,
                ].some(Boolean);
                const showSelfServiceForm =
                    previewState.status === 'missing' || hasSelfServiceErrors;
                const foundStudent =
                    previewState.status === 'found'
                        ? previewState.student
                        : null;
                const needsContact =
                    foundStudent?.can_request &&
                    (!foundStudent.has_email || !foundStudent.has_phone);
                const canCreate =
                    settings.permit_requests_enabled &&
                    (showSelfServiceForm || previewState.status === 'found') &&
                    (!foundStudent || foundStudent.can_request);

                return (
                    <div className="grid gap-5">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.22em] text-app-red uppercase">
                                Self-service
                            </p>
                            <h1 className="mt-2 text-3xl leading-tight font-semibold tracking-[-0.03em] text-app-ink md:text-4xl">
                                Start with your student number
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-app-muted">
                                Check the public record first. If it exists, you
                                confirm a masked preview. If not, the form opens
                                the self-service details needed for SRC review.
                            </p>
                        </div>

                        {!settings.permit_requests_enabled && (
                            <div className="flex gap-3 rounded-[1rem] border border-app-red/30 bg-app-red/10 px-4 py-3 text-sm leading-6 text-app-red">
                                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                Self-service permit requests are currently
                                disabled.
                            </div>
                        )}

                        <input
                            type="hidden"
                            name="student_exists"
                            value={previewState.exists === true ? '1' : '0'}
                        />

                        <div className="theme-surface-muted rounded-[1.15rem] border border-app-border p-4">
                            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                                <div className="grid gap-2">
                                    <Label htmlFor="student_number">
                                        Student number
                                    </Label>
                                    <Input
                                        id="student_number"
                                        name="student_number"
                                        value={studentNumber}
                                        onChange={(event) =>
                                            updateStudentNumber(
                                                event.target.value,
                                            )
                                        }
                                        placeholder={
                                            studentOptions.student_number_prefix
                                                ? `${studentOptions.student_number_prefix}...`
                                                : '26102859'
                                        }
                                        className="theme-surface-strong h-12 rounded-xl border-app-border px-4"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="h-12 rounded-full border border-app-border bg-white px-5 text-app-ink hover:bg-[#1c1826] hover:text-white md:min-w-34 dark:bg-app-surface dark:hover:bg-app-brass dark:hover:text-[#1c1826]"
                                    onClick={lookup}
                                    disabled={
                                        previewState.status === 'loading' ||
                                        !studentNumber.trim() ||
                                        !settings.permit_requests_enabled
                                    }
                                >
                                    {previewState.status === 'loading' ? (
                                        <Clock className="size-4 animate-pulse" />
                                    ) : (
                                        <Search className="size-4" />
                                    )}
                                    {previewState.status === 'loading'
                                        ? 'Checking'
                                        : 'Check'}
                                </Button>
                            </div>
                            <div className="mt-3 grid gap-2">
                                <InputError message={errors.student_number} />
                                {studentOptions.student_number_prefix && (
                                    <p className="text-xs leading-5 text-app-muted">
                                        Use your official student number. It
                                        usually starts with{' '}
                                        <span className="font-semibold text-app-ink">
                                            {
                                                studentOptions.student_number_prefix
                                            }
                                        </span>
                                        .
                                    </p>
                                )}
                                {previewState.status === 'idle' &&
                                    !errors.permit_request && (
                                        <p className="flex gap-2 text-xs leading-5 text-app-muted">
                                            <FileWarning className="mt-0.5 size-4 shrink-0 text-app-red" />
                                            The next fields appear only after
                                            this check, so students do not fill
                                            the wrong form.
                                        </p>
                                    )}
                                {previewState.error && (
                                    <p className="flex gap-2 text-sm text-app-red">
                                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                        {previewState.error}
                                    </p>
                                )}
                            </div>
                        </div>

                        {foundStudent && (
                            <div className="public-sketch-card border-app-green/35 bg-app-green/10 rounded-[1.15rem] border p-5">
                                <div className="flex items-start gap-3">
                                    <span className="text-app-green theme-surface grid size-10 shrink-0 place-items-center rounded-full">
                                        <CheckCircle2 className="size-5" />
                                    </span>
                                    <div>
                                        <p className="text-app-green text-sm font-semibold">
                                            Student record found
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-app-muted">
                                            This masked preview is enough to
                                            continue without exposing full
                                            student records.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                                    <PreviewDetail
                                        label="Student"
                                        value={foundStudent.name ?? 'Hidden'}
                                    />
                                    <PreviewDetail
                                        label="Student number"
                                        value={foundStudent.student_number}
                                    />
                                    <PreviewDetail
                                        label="Course"
                                        value={foundStudent.course ?? 'Pending'}
                                    />
                                    <PreviewDetail
                                        label="Level"
                                        value={
                                            foundStudent.level
                                                ? `Level ${foundStudent.level}`
                                                : 'Pending'
                                        }
                                    />
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                    <span className="theme-surface rounded-full border border-app-border px-3 py-1.5 text-app-muted">
                                        Email{' '}
                                        {foundStudent.has_email
                                            ? 'already on file'
                                            : 'needed'}
                                    </span>
                                    <span className="theme-surface rounded-full border border-app-border px-3 py-1.5 text-app-muted">
                                        Phone{' '}
                                        {foundStudent.has_phone
                                            ? 'already on file'
                                            : 'needed'}
                                    </span>
                                </div>
                                {!foundStudent.can_request &&
                                    foundStudent.block_reason && (
                                        <div className="mt-4 flex gap-3 rounded-[1rem] border border-app-red/30 bg-app-red/10 px-4 py-3 text-sm leading-6 text-app-red">
                                            <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                            {foundStudent.block_reason}
                                        </div>
                                    )}
                            </div>
                        )}

                        {showSelfServiceForm && (
                            <SelfServiceStudentForm
                                options={studentOptions}
                                errors={errors}
                            />
                        )}

                        {foundStudent && needsContact && (
                            <div className="public-sketch-card theme-surface grid gap-4 rounded-[1.15rem] border border-app-border p-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <p className="text-sm font-semibold text-app-ink">
                                        Add missing contact details
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-app-muted">
                                        Existing details stay hidden. Only
                                        missing contact information can be added
                                        here.
                                    </p>
                                </div>
                                {!foundStudent.has_email && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">
                                            Contact email
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            className="theme-surface h-11 rounded-xl border-app-border"
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                )}
                                {!foundStudent.has_phone && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">
                                            Contact phone
                                        </Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            className="theme-surface h-11 rounded-xl border-app-border"
                                        />
                                        <InputError message={errors.phone} />
                                    </div>
                                )}
                                <p className="text-xs leading-5 text-app-muted sm:col-span-2">
                                    Existing contact details are kept private.
                                    To change an email or phone number already
                                    on file, contact SRC administration.
                                </p>
                            </div>
                        )}

                        {errors.permit_request && (
                            <div className="flex gap-3 rounded-[1rem] border border-app-red/30 bg-app-red/10 px-4 py-3 text-sm leading-6 text-app-red">
                                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                {errors.permit_request}
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-app-border pt-5">
                            <div className="flex items-center gap-3 text-sm text-app-muted">
                                <span className="theme-ink-soft grid size-10 place-items-center rounded-full text-app-red">
                                    <CreditCard className="size-5" />
                                </span>
                                <span>
                                    Amount:{' '}
                                    <span className="font-semibold text-app-ink">
                                        {settings.currency}{' '}
                                        {settings.default_amount.toFixed(2)}
                                    </span>
                                </span>
                            </div>
                            <Button
                                type="submit"
                                className="theme-primary-action h-12 rounded-full px-6"
                                disabled={processing || !canCreate}
                            >
                                <ShieldCheck className="size-4" />
                                {processing
                                    ? 'Creating request'
                                    : 'Create request'}
                            </Button>
                        </div>
                    </div>
                );
            }}
        </Form>
    );
}

function PreviewDetail({ label, value }: { label: string; value: string }) {
    return (
        <div className="theme-surface rounded-[0.9rem] border border-app-border p-3">
            <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-app-muted uppercase">
                {label}
            </p>
            <p className="mt-1 font-semibold break-words text-app-ink">
                {value}
            </p>
        </div>
    );
}
