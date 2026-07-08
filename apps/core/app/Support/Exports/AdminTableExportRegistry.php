<?php

namespace App\Support\Exports;

use App\Models\Announcement;
use App\Models\AuditLog;
use App\Models\Document;
use App\Models\Election;
use App\Models\Event;
use App\Models\NfcCard;
use App\Models\Payment;
use App\Models\Permit;
use App\Models\PermitRequest;
use App\Models\Poll;
use App\Models\Student;
use App\Models\User;
use BackedEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;

class AdminTableExportRegistry
{
    /**
     * @return array<int, string>
     */
    public function resources(): array
    {
        return array_keys($this->definitions());
    }

    /**
     * @return array{title: string, filename: string, headings: array<int, string>, rows: Collection<int, array<int, mixed>>}
     */
    public function export(string $resource, Request $request): array
    {
        $definitions = $this->definitions();
        abort_unless(isset($definitions[$resource]), 404);

        $definition = $definitions[$resource];
        ($definition['authorize'])();

        return [
            'title' => $definition['title'],
            'filename' => $definition['filename'],
            'headings' => $definition['headings'],
            'rows' => $definition['rows']($request),
        ];
    }

    /**
     * @return array<string, array{title: string, filename: string, headings: array<int, string>, authorize: callable(): void, rows: callable(Request): Collection<int, array<int, mixed>>}>
     */
    private function definitions(): array
    {
        return [
            'students' => [
                'title' => 'Students',
                'filename' => 'students',
                'headings' => ['Student number', 'Name', 'Email', 'Phone', 'Course', 'Level', 'Account status', 'Created'],
                'authorize' => fn () => Gate::authorize('viewAny', Student::class),
                'rows' => fn (Request $request) => Student::query()
                    ->with('user:id,password')
                    ->when($this->search($request) !== '', fn (Builder $query) => $query->where(function (Builder $query) use ($request): void {
                        $search = $this->search($request);
                        $query->where('student_number', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('course', 'like', "%{$search}%");
                    }))
                    ->latest()
                    ->get()
                    ->map(fn (Student $student): array => [
                        $student->student_number,
                        $student->name,
                        $student->email,
                        $student->phone,
                        $student->course,
                        $student->level,
                        $student->user === null ? 'Not activated' : ($student->user->password === null ? 'Pending setup' : 'Activated'),
                        $this->date($student->created_at),
                    ]),
            ],
            'permits' => [
                'title' => 'Permits',
                'filename' => 'permits',
                'headings' => ['Code last 4', 'Student number', 'Student', 'Status', 'Amount paid', 'Currency', 'Starts', 'Expires', 'Card delivered', 'Created'],
                'authorize' => fn () => Gate::authorize('viewAny', Permit::class),
                'rows' => fn (Request $request) => Permit::query()
                    ->with('student:id,student_number,name,email')
                    ->when($this->search($request) !== '', function (Builder $query) use ($request): void {
                        $search = $this->search($request);
                        $query->where('code_last4', 'like', "%{$search}%")
                            ->orWhereHas('student', fn (Builder $query) => $query->where('student_number', 'like', "%{$search}%")
                                ->orWhere('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%"));
                    })
                    ->when($this->status($request) !== '', fn (Builder $query) => $query->where('status', $this->status($request)))
                    ->latest()
                    ->get()
                    ->map(fn (Permit $permit): array => [
                        $permit->code_last4,
                        $permit->student?->student_number,
                        $permit->student?->name,
                        $this->enum($permit->status),
                        $permit->amount_paid,
                        $permit->currency,
                        $this->date($permit->starts_at),
                        $this->date($permit->expires_at),
                        $this->date($permit->card_delivered_at),
                        $this->date($permit->created_at),
                    ]),
            ],
            'permit-requests' => [
                'title' => 'Permit Requests',
                'filename' => 'permit-requests',
                'headings' => ['Reference', 'Student number', 'Student', 'Status', 'Review status', 'Requires review', 'Amount', 'Payment', 'Created'],
                'authorize' => fn () => Gate::authorize('viewAny', PermitRequest::class),
                'rows' => fn (Request $request) => PermitRequest::query()
                    ->with(['student:id,student_number,name,email', 'payment:id,reference,status'])
                    ->when($this->status($request) !== '', fn (Builder $query) => $query->where('status', $this->status($request)))
                    ->when($request->string('review_status')->trim()->toString() !== '', fn (Builder $query) => $query->where('review_status', $request->string('review_status')->trim()->toString()))
                    ->when($request->string('requires_review')->trim()->toString() !== '', fn (Builder $query) => $query->where('requires_review', filter_var($request->string('requires_review')->trim()->toString(), FILTER_VALIDATE_BOOL)))
                    ->when($request->string('academic_period')->trim()->toString() !== '', fn (Builder $query) => $query->where('academic_period_id', $request->string('academic_period')->trim()->toString()))
                    ->when($request->date('date_from') !== null, fn (Builder $query) => $query->where('created_at', '>=', $request->date('date_from')?->startOfDay()))
                    ->when($request->date('date_to') !== null, fn (Builder $query) => $query->where('created_at', '<=', $request->date('date_to')?->endOfDay()))
                    ->when($this->search($request) !== '', function (Builder $query) use ($request): void {
                        $search = $this->search($request);
                        $query->where('request_reference', 'like', "%{$search}%")
                            ->orWhereHas('student', fn (Builder $query) => $query->where('student_number', 'like', "%{$search}%")
                                ->orWhere('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%"));
                    })
                    ->latest()
                    ->get()
                    ->map(fn (PermitRequest $permitRequest): array => [
                        $permitRequest->request_reference,
                        $permitRequest->student?->student_number,
                        $permitRequest->student?->name,
                        $this->enum($permitRequest->status),
                        $this->enum($permitRequest->review_status),
                        $permitRequest->requires_review ? 'Yes' : 'No',
                        $permitRequest->amount,
                        $permitRequest->payment?->reference,
                        $this->date($permitRequest->created_at),
                    ]),
            ],
            'payments' => [
                'title' => 'Payments',
                'filename' => 'payments',
                'headings' => ['Reference', 'Gateway reference', 'Student number', 'Student', 'Status', 'Amount', 'Currency', 'Paid', 'Verified', 'Created'],
                'authorize' => fn () => Gate::authorize('viewAny', Payment::class),
                'rows' => fn (Request $request) => Payment::query()
                    ->with('student:id,student_number,name,email')
                    ->when($this->search($request) !== '', function (Builder $query) use ($request): void {
                        $search = $this->search($request);
                        $query->where('reference', 'like', "%{$search}%")
                            ->orWhere('gateway_reference', 'like', "%{$search}%")
                            ->orWhereHas('student', fn (Builder $query) => $query->where('student_number', 'like', "%{$search}%")
                                ->orWhere('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%"));
                    })
                    ->when($this->status($request) !== '', fn (Builder $query) => $query->where('status', $this->status($request)))
                    ->latest()
                    ->get()
                    ->map(fn (Payment $payment): array => [
                        $payment->reference,
                        $payment->gateway_reference,
                        $payment->student?->student_number,
                        $payment->student?->name,
                        $this->enum($payment->status),
                        $payment->amount,
                        $payment->currency,
                        $this->date($payment->paid_at),
                        $this->date($payment->verified_at),
                        $this->date($payment->created_at),
                    ]),
            ],
            'nfc-cards' => [
                'title' => 'NFC Cards',
                'filename' => 'nfc-cards',
                'headings' => ['UID last 4', 'Student number', 'Student', 'Status', 'Issued', 'Activated', 'Replaced', 'Lost', 'Created'],
                'authorize' => fn () => Gate::authorize('viewAny', NfcCard::class),
                'rows' => fn (Request $request) => NfcCard::query()
                    ->with('student:id,student_number,name,email')
                    ->when($this->search($request) !== '', function (Builder $query) use ($request): void {
                        $search = $this->search($request);
                        $query->where('uid_last4', 'like', "%{$search}%")
                            ->orWhereHas('student', fn (Builder $query) => $query->where('student_number', 'like', "%{$search}%")
                                ->orWhere('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%"));
                    })
                    ->latest()
                    ->get()
                    ->map(fn (NfcCard $card): array => [
                        $card->uid_last4,
                        $card->student?->student_number,
                        $card->student?->name,
                        $this->enum($card->status),
                        $this->date($card->issued_at),
                        $this->date($card->activated_at),
                        $this->date($card->replaced_at),
                        $this->date($card->lost_at),
                        $this->date($card->created_at),
                    ]),
            ],
            'audit-logs' => [
                'title' => 'Audit Logs',
                'filename' => 'audit-logs',
                'headings' => ['Event', 'Description', 'Actor', 'Subject type', 'Subject id', 'Created'],
                'authorize' => fn () => Gate::authorize('viewAny', AuditLog::class),
                'rows' => fn (Request $request) => AuditLog::query()
                    ->with('actor:id,name,email')
                    ->when($request->string('event')->trim()->toString() !== '', fn (Builder $query) => $query->where('event', $request->string('event')->trim()->toString()))
                    ->when($request->string('actor')->trim()->toString() !== '', function (Builder $query) use ($request): void {
                        $actor = $request->string('actor')->trim()->toString();
                        $query->whereHas('actor', fn (Builder $query) => $query->where('name', 'like', "%{$actor}%")->orWhere('email', 'like', "%{$actor}%"));
                    })
                    ->when($request->date('date_from') !== null, fn (Builder $query) => $query->where('created_at', '>=', $request->date('date_from')?->startOfDay()))
                    ->when($request->date('date_to') !== null, fn (Builder $query) => $query->where('created_at', '<=', $request->date('date_to')?->endOfDay()))
                    ->when($request->string('subject_type')->trim()->toString() !== '', fn (Builder $query) => $query->where('subject_type', 'like', '%'.$request->string('subject_type')->trim()->toString().'%'))
                    ->latest('created_at')
                    ->get()
                    ->map(fn (AuditLog $log): array => [
                        $log->event,
                        $log->description,
                        $log->actor?->name,
                        $log->subject_type === null ? null : class_basename($log->subject_type),
                        $log->subject_id,
                        $this->date($log->created_at),
                    ]),
            ],
            'executives' => [
                'title' => 'Executives',
                'filename' => 'executives',
                'headings' => ['Name', 'Email', 'Active', 'Roles', 'Position', 'Category', 'Published', 'Created'],
                'authorize' => fn () => Gate::authorize('viewAny', User::class),
                'rows' => fn (Request $request) => User::query()
                    ->with(['roles:id,name', 'executiveProfile'])
                    ->whereDoesntHave('roles', fn (Builder $query) => $query->where('name', 'student'))
                    ->when($this->search($request) !== '', function (Builder $query) use ($request): void {
                        $search = $this->search($request);
                        $query->where(fn (Builder $query) => $query->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhereHas('executiveProfile', fn (Builder $query) => $query->where('position', 'like', "%{$search}%")->orWhere('category', 'like', "%{$search}%")));
                    })
                    ->latest()
                    ->get()
                    ->map(fn (User $executive): array => [
                        $executive->name,
                        $executive->email,
                        $executive->is_active ? 'Yes' : 'No',
                        $executive->roles->pluck('name')->implode(', '),
                        $executive->executiveProfile?->position,
                        $executive->executiveProfile?->category,
                        $executive->executiveProfile?->is_published ? 'Yes' : 'No',
                        $this->date($executive->created_at),
                    ]),
            ],
            'announcements' => $this->contentDefinition('Announcements', 'announcements', Announcement::class, 'author'),
            'events' => $this->contentDefinition('Events', 'events', Event::class, 'organizer', ['Starts' => 'starts_at']),
            'documents' => $this->contentDefinition('Documents', 'documents', Document::class, 'author'),
            'polls' => [
                'title' => 'Polls',
                'filename' => 'polls',
                'headings' => ['Title', 'Status', 'Type', 'Visibility', 'Votes', 'Creator', 'Starts', 'Ends', 'Created'],
                'authorize' => fn () => Gate::authorize('viewAny', Poll::class),
                'rows' => fn (Request $request) => Poll::query()
                    ->with('creator:id,name,email')
                    ->withCount('votes')
                    ->when($this->search($request) !== '', fn (Builder $query) => $query->where(fn (Builder $query) => $query->where('title', 'like', '%'.$this->search($request).'%')->orWhere('description', 'like', '%'.$this->search($request).'%')))
                    ->when($this->status($request) !== '', fn (Builder $query) => $query->where('status', $this->status($request)))
                    ->latest()
                    ->get()
                    ->map(fn (Poll $poll): array => [
                        $poll->title,
                        $this->enum($poll->status),
                        $this->enum($poll->type),
                        $this->enum($poll->visibility),
                        $poll->votes_count,
                        $poll->creator?->name,
                        $this->date($poll->starts_at),
                        $this->date($poll->ends_at),
                        $this->date($poll->created_at),
                    ]),
            ],
            'elections' => [
                'title' => 'Elections',
                'filename' => 'elections',
                'headings' => ['Title', 'Status', 'Academic period', 'Positions', 'Votes', 'Results visible', 'Starts', 'Ends', 'Created'],
                'authorize' => fn () => Gate::authorize('viewAny', Election::class),
                'rows' => fn (Request $request) => Election::query()
                    ->with('academicPeriod:id,name,academic_year')
                    ->withCount(['positions', 'votes'])
                    ->when($this->search($request) !== '', fn (Builder $query) => $query->where('title', 'like', '%'.$this->search($request).'%')->orWhere('description', 'like', '%'.$this->search($request).'%'))
                    ->when($this->status($request) !== '', fn (Builder $query) => $query->where('status', $this->status($request)))
                    ->latest()
                    ->get()
                    ->map(fn (Election $election): array => [
                        $election->title,
                        $this->enum($election->status),
                        $election->academicPeriod?->name,
                        $election->positions_count,
                        $election->votes_count,
                        $election->results_visible ? 'Yes' : 'No',
                        $this->date($election->starts_at),
                        $this->date($election->ends_at),
                        $this->date($election->created_at),
                    ]),
            ],
        ];
    }

    /**
     * @param  class-string  $model
     * @param  array<string, string>  $extraDates
     * @return array{title: string, filename: string, headings: array<int, string>, authorize: callable(): void, rows: callable(Request): Collection<int, array<int, mixed>>}
     */
    private function contentDefinition(string $title, string $filename, string $model, string $authorRelation, array $extraDates = []): array
    {
        return [
            'title' => $title,
            'filename' => $filename,
            'headings' => array_merge(['Title', 'Category', 'Status', 'Visibility', 'Featured', 'Owner', 'Published', 'Archived'], array_keys($extraDates), ['Created']),
            'authorize' => fn () => Gate::authorize('viewAny', $model),
            'rows' => fn (Request $request) => $model::query()
                ->with($authorRelation.':id,name,email')
                ->when($this->search($request) !== '', fn (Builder $query) => $query->where(fn (Builder $query) => $query->where('title', 'like', '%'.$this->search($request).'%')
                    ->orWhere('excerpt', 'like', '%'.$this->search($request).'%')
                    ->orWhere('category', 'like', '%'.$this->search($request).'%')))
                ->when($this->status($request) !== '', fn (Builder $query) => $query->where('status', $this->status($request)))
                ->latest()
                ->get()
                ->map(function ($item) use ($authorRelation, $extraDates): array {
                    $row = [
                        $item->title,
                        $item->category,
                        $this->enum($item->status),
                        $this->enum($item->visibility),
                        $item->is_featured ? 'Yes' : 'No',
                        $item->{$authorRelation}?->name,
                        $this->date($item->published_at),
                        $this->date($item->archived_at),
                    ];

                    foreach ($extraDates as $column) {
                        $row[] = $this->date($item->{$column});
                    }

                    $row[] = $this->date($item->created_at);

                    return $row;
                }),
        ];
    }

    private function search(Request $request): string
    {
        return $request->string('search')->trim()->toString();
    }

    private function status(Request $request): string
    {
        return $request->string('status')->trim()->toString();
    }

    private function enum(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        if ($value instanceof BackedEnum) {
            return str((string) $value->value)->replace('_', ' ')->title()->toString();
        }

        return str((string) $value)->replace('_', ' ')->title()->toString();
    }

    private function date(mixed $value): ?string
    {
        return $value?->format('Y-m-d H:i');
    }
}
