# Appendix G — Selected Code Snippets

This appendix contains selected implementation excerpts from the NFC-Based Student Permit Verification and Governance Management System for Knutsford University. The snippets are included to support the implementation discussion in Chapter Four. They are intentionally short and focus on security, verification, payment handling, voting integrity, API design, caching, queue processing, and scheduled maintenance.

The snippets are not full source files. Each excerpt is included because it demonstrates an important implementation decision.

## G.1 Mobile Authentication and Sanctum Token Creation

Source file: `app/Http/Controllers/Api/Mobile/AuthController.php`

This excerpt shows how the mobile API authenticates a user, checks account status, validates the password, and issues a Sanctum token scoped for mobile access.

```php
public function login(LoginRequest $request): JsonResponse
{
    $user = User::query()
        ->with(['student', 'executiveProfile'])
        ->where('email', mb_strtolower((string) $request->validated('email')))
        ->first();

    if (! $user instanceof User || ! $user->is_active || $user->password === null || ! Hash::check((string) $request->validated('password'), $user->password)) {
        throw ValidationException::withMessages([
            'email' => 'The provided credentials are invalid.',
        ]);
    }

    $token = $user->createToken(
        $request->validated('device_name') ?: 'expo-mobile',
        ['mobile'],
    );

    return response()->json([
        'token' => $token->plainTextToken,
        'token_type' => 'Bearer',
        'user' => new UserResource($user),
    ]);
}
```

The important implementation point is that the mobile application does not receive access unless the user exists, is active, has a password, and passes password verification. The returned token is then used by the mobile application for protected API requests.

## G.2 Permission-Based Mobile Verification Request

Source file: `app/Http/Requests/Mobile/VerifyNfcUidRequest.php`

This request class shows how authorization is enforced before an NFC verification request is processed.

```php
class VerifyNfcUidRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('verification.perform') ?? false;
    }

    public function rules(): array
    {
        return [
            'uid' => ['required', 'string', 'max:100'],
        ];
    }
}
```

The request combines role-based permission checking with validation. This prevents ordinary authenticated users from performing operational verification unless they have the required permission.

## G.3 NFC UID Hashing

Source file: `app/Support/NfcUidHasher.php`

This excerpt shows how NFC UIDs are normalized and hashed before storage or lookup.

```php
class NfcUidHasher
{
    public function hash(string $uid): string
    {
        return hash_hmac('sha256', $this->normalize($uid), $this->key());
    }

    public function lastFour(string $uid): string
    {
        return str($this->normalize($uid))
            ->substr(-4)
            ->toString();
    }

    public function normalize(string $uid): string
    {
        return str($uid)
            ->trim()
            ->upper()
            ->replaceMatches('/[^A-Z0-9]/', '')
            ->pipe(fn (Stringable $value): string => $value->toString());
    }

    private function key(): string
    {
        $key = config('nfc.uid_hash_key');

        if (! is_string($key) || trim($key) === '') {
            throw new RuntimeException('NFC UID hash key is not configured.');
        }

        return $key;
    }
}
```

The system avoids depending on raw NFC UID storage. Normalization makes scanning behavior more consistent, while keyed hashing reduces exposure if the stored NFC identifier is accessed outside the intended verification workflow.

## G.4 NFC Permit Verification Logic

Source file: `app/Actions/Verification/VerifyNfcUidAction.php`

This excerpt shows how the system evaluates permit validity after an NFC card has been resolved to a student record.

```php
private function evaluatePermit(Permit $permit, string $identifierHash, int $nfcCardId): VerificationAttempt
{
    if ($permit->status === PermitStatus::Revoked) {
        return $this->attempt($permit, VerificationResult::Revoked, $identifierHash, $nfcCardId, 'Student permit has been revoked.');
    }

    if ($permit->status === PermitStatus::Expired || $permit->expires_at->isPast()) {
        if ($permit->status !== PermitStatus::Expired) {
            $permit->forceFill(['status' => PermitStatus::Expired])->save();
        }

        return $this->attempt($permit->refresh(), VerificationResult::Expired, $identifierHash, $nfcCardId, 'Student permit has expired.');
    }

    if ($permit->starts_at->isFuture()) {
        return $this->attempt($permit, VerificationResult::Invalid, $identifierHash, $nfcCardId, 'Student permit is not active yet.');
    }

    return $this->attempt($permit, VerificationResult::Valid, $identifierHash, $nfcCardId, 'NFC card and student permit are valid.');
}
```

The verification result is based on permit status and validity dates, not only on whether an NFC card exists. This supports the dissertation's claim that NFC scanning acts as an entry point to backend verification rather than as proof of authorization by itself.

## G.5 Paystack Verification and Idempotent Payment Handling

Source file: `app/Actions/PermitRequests/VerifyPaystackPaymentAction.php`

This excerpt shows how Paystack verification updates payment records inside a database transaction and avoids duplicate success handling.

```php
DB::transaction(function () use ($payment, $permitRequest, $data): void {
    $payment = Payment::query()->lockForUpdate()->findOrFail($payment->id);
    $permitRequest = PermitRequest::query()->lockForUpdate()->findOrFail($permitRequest->id);

    if ($payment->status !== PaymentStatus::Success) {
        $payment->forceFill([
            'gateway_reference' => $data['reference'] ?? $payment->gateway_reference,
            'status' => PaymentStatus::Success,
            'paid_at' => isset($data['paid_at']) ? Carbon::parse($data['paid_at']) : now(),
            'verified_at' => now(),
            'failure_reason' => null,
            'metadata' => array_replace($payment->metadata ?? [], [
                'paystack_status' => $data['status'] ?? null,
                'paystack_channel' => $data['channel'] ?? null,
                'paystack_amount' => $data['amount'] ?? null,
                'verified_source' => 'paystack',
            ]),
        ])->save();

        $permitRequest->forceFill([
            'status' => PermitRequestStatus::Paid,
        ])->save();

        $this->createAuditLog->handle(
            actor: null,
            event: AuditEvents::PermitRequestPaymentVerified,
            auditable: $permitRequest,
            subject: $permitRequest->student,
            description: 'Self-service Paystack payment verified.',
        );
    }
});
```

The transaction locks both the payment and permit request records before updating them. The status check prevents repeated callback or verification attempts from processing the same payment as a new success event.

## G.6 Election Vote Integrity Control

Source file: `app/Actions/Elections/CastElectionVoteAction.php`

This excerpt shows the main controls used before an election vote is recorded.

```php
return DB::transaction(function () use ($election, $position, $candidate, $actor): ElectionVote {
    $election = Election::query()->lockForUpdate()->findOrFail($election->id);
    $position = ElectionPosition::query()->lockForUpdate()->findOrFail($position->id);
    $candidate = ElectionCandidate::query()->lockForUpdate()->findOrFail($candidate->id);
    $student = $actor->student()->lockForUpdate()->first();

    if (! $student instanceof Student) {
        throw ValidationException::withMessages(['student' => 'Only linked student accounts can vote.']);
    }

    if (! $election->isOpenForVoting()) {
        throw ValidationException::withMessages(['election' => 'This election is not currently active.']);
    }

    if ($position->election_id !== $election->id || $candidate->election_position_id !== $position->id) {
        throw ValidationException::withMessages(['election_candidate_id' => 'Choose a valid candidate for this position.']);
    }

    if ($candidate->status !== CandidateStatus::Approved) {
        throw ValidationException::withMessages(['election_candidate_id' => 'Only approved candidates can receive votes.']);
    }

    if ($position->votes()->where('student_id', $student->id)->exists()) {
        throw ValidationException::withMessages(['election_candidate_id' => 'You have already voted for this position.']);
    }

    if (! $this->hasActivePermit($student, $election)) {
        throw ValidationException::withMessages(['student' => 'An active permit for this academic period is required to vote.']);
    }
```

This implementation uses row locking, eligibility checks, candidate validation, duplicate-vote prevention, and permit status verification before a vote can be recorded.

## G.7 Permit Issuance and Duplicate Prevention

Source file: `app/Actions/Permits/IssuePermitAction.php`

This excerpt shows how the system prevents a student from receiving more than one active permit for the same academic period.

```php
return DB::transaction(function () use ($student, $issuedBy, $attributes): IssuedPermit {
    $academicPeriod = $this->academicPeriod($attributes['academic_period_id'] ?? null);

    $duplicateExists = Permit::query()
        ->where('student_id', $student->id)
        ->where('academic_period_id', $academicPeriod->id)
        ->where('status', PermitStatus::Active)
        ->lockForUpdate()
        ->exists();

    if ($duplicateExists) {
        throw new RuntimeException('This student already has an active permit for the selected academic period.');
    }

    $settings = $this->permitSettings->all();
    $startsAt = $this->date($attributes['starts_at'] ?? null) ?? $this->defaultStartsAt($academicPeriod);
    $expiresAt = $this->date($attributes['expires_at'] ?? null)
        ?? $this->defaultExpiresAt($academicPeriod, $startsAt, $settings['default_validity_days']);
    $code = $this->generatePermitCode->handle();
```

The use of a transaction and row-level locking protects permit issuance from duplicate active permits when concurrent requests occur.

## G.8 Mobile Permit Request API Resource

Source file: `app/Http/Resources/Mobile/PermitRequestResource.php`

This excerpt shows how permit request information is shaped before being returned to the mobile application.

```php
return [
    'request_reference' => $this->request_reference,
    'status' => $this->status->value,
    'amount' => (string) $this->amount,
    'currency' => $this->currency,
    'contact_email' => $this->contact_email,
    'contact_phone' => $this->contact_phone,
    'review_status' => $this->review_status?->value,
    'requires_review' => $this->requires_review,
    'expires_at' => $this->expires_at?->toISOString(),
    'created_at' => $this->created_at?->toISOString(),
    'student' => $this->whenLoaded('student', fn (): ?array => $this->student ? [
        'id' => $this->student->id,
        'student_number' => $this->student->student_number,
        'name' => $this->student->name,
        'email' => $this->student->email,
        'phone' => $this->student->phone,
        'course' => $this->student->course,
        'level' => $this->student->level,
    ] : null),
    'payment' => new PaymentResource($this->whenLoaded('payment')),
];
```

The resource keeps the mobile response predictable and separates API output formatting from controller logic. This supports the mobile API design discussed in Chapters Three and Four.

## G.9 Application Cache Versioning

Source file: `app/Support/ApplicationCache.php`

This excerpt shows the cache versioning approach used for dashboard summaries, public content, settings, and academic period lookups.

```php
public function remember(string $scope, string $key, int $seconds, Closure $callback): mixed
{
    return Cache::remember($this->key($scope, $key), $seconds, $callback);
}

public function forget(string $scope, string $key = 'default'): void
{
    Cache::forget($this->key($scope, $key));
}

public function bump(string $scope): void
{
    $key = $this->versionKey($scope);

    Cache::add($key, 1);
    Cache::increment($key);
}

public function flushPublicContent(): void
{
    foreach ([self::PublicHome, self::PublicAnnouncements, self::PublicEvents, self::PublicDocuments, self::PublicExecutives] as $scope) {
        $this->bump($scope);
    }

    $this->flushDashboard();
}
```

Versioned cache keys allow public content to be invalidated without requiring a full cache clear. This supports the performance and content freshness discussion in the implementation chapter.

## G.10 Queued Notification Example

Source file: `app/Notifications/PermitRequestPaymentVerifiedNotification.php`

This notification implements `ShouldQueue`, allowing payment verification emails to be processed by queue workers rather than blocking the user-facing request.

```php
class PermitRequestPaymentVerifiedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly PermitRequest $permitRequest) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return NotificationMail::make(
            subject: 'Permit payment verified',
            eyebrow: 'Payment verified',
            title: 'Your permit payment has been verified',
            intro: $this->permitRequest->requires_review
                ? 'Your payment was successful. Your student record will be reviewed before permit issuance.'
                : 'Your payment was successful. Your permit request is being completed.',
        );
    }
}
```

This snippet supports the queue architecture explanation by showing a concrete queued notification used after payment verification.

## G.11 Scheduled Maintenance Tasks

Source file: `routes/console.php`

This excerpt shows recurring maintenance commands for token pruning, queue cleanup, permit expiry, and permit request expiry.

```php
Schedule::command('sanctum:prune-expired --hours=24')
    ->daily()
    ->withoutOverlapping();

Schedule::command('queue:prune-failed --hours=168')
    ->daily()
    ->withoutOverlapping();

Schedule::command('queue:prune-batches --hours=168 --unfinished=336 --cancelled=336')
    ->daily()
    ->withoutOverlapping();

Schedule::command('permits:expire')
    ->hourly()
    ->withoutOverlapping();

Schedule::command('permit-requests:expire')
    ->hourly()
    ->withoutOverlapping();
```

The scheduler keeps operational records current and reduces manual maintenance. This is important for permit expiry, stale permit requests, and queue housekeeping.

## G.12 Mobile API Route Organization

Source file: `routes/api.php`

This excerpt shows how protected mobile routes are grouped under Sanctum authentication and module-specific prefixes.

```php
Route::prefix('mobile')->name('mobile.')->group(function () {
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('login', [AuthController::class, 'login'])
            ->middleware('throttle:mobile-login')
            ->name('login');
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me'])->name('me');

        Route::prefix('elections')->name('elections.')->group(function () {
            Route::get('/', [ElectionController::class, 'index'])->name('index');
            Route::get('{election}', [ElectionController::class, 'show'])->name('show');
            Route::get('{election}/results', [ElectionController::class, 'results'])->name('results');
            Route::post('{election}/positions/{position}/vote', [ElectionController::class, 'vote'])
                ->middleware('throttle:mobile-sensitive-actions')
                ->name('vote');
        });

        Route::prefix('verification')->name('verification.')->middleware('throttle:mobile-verification')->group(function () {
            Route::post('student-number', [VerificationController::class, 'studentNumber'])->name('student-number');
            Route::post('permit-code', [VerificationController::class, 'permitCode'])->name('permit-code');
            Route::post('nfc', [VerificationController::class, 'nfc'])->name('nfc');
        });
    });
});
```

The route organization makes the API easier to document and test. It also shows that sensitive mobile actions use authentication and throttling.

## Appendix G Summary

These snippets provide selected evidence for the implementation claims made in Chapter Four. Together, they show that the system uses authenticated mobile access, role-based authorization, protected NFC identifiers, backend verification logic, payment idempotency, voting controls, structured API resources, cache invalidation, queued notifications, scheduled maintenance, and organized mobile API routes.
