<?php

namespace App\Http\Controllers\NfcCards;

use App\Actions\NfcCards\MarkNfcCardLostAction;
use App\Actions\NfcCards\RegisterNfcCardAction;
use App\Actions\NfcCards\ReplaceNfcCardAction;
use App\Actions\NfcCards\RevokeNfcCardAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\NfcCards\ReplaceNfcCardRequest;
use App\Http\Requests\NfcCards\StoreNfcCardRequest;
use App\Models\NfcCard;
use App\Models\Student;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class NfcCardController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', NfcCard::class);

        $search = $request->string('search')->trim()->toString();

        $cards = NfcCard::query()
            ->with(['student:id,student_number,name,email,course,level', 'createdBy:id,name,email'])
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where('uid_last4', 'like', "%{$search}%")
                    ->orWhereHas('student', function (Builder $query) use ($search) {
                        $query->where('student_number', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (NfcCard $card): array => $this->cardPayload($card));

        return Inertia::render('nfc-cards/index', [
            'cards' => $cards,
            'filters' => [
                'search' => $search,
            ],
            'overview' => [
                'total' => NfcCard::query()->count(),
                'active' => NfcCard::query()->where('status', 'active')->count(),
                'inactive' => NfcCard::query()->whereNot('status', 'active')->count(),
            ],
            'options' => [
                'students' => Student::query()
                    ->orderBy('student_number')
                    ->get(['id', 'student_number', 'name', 'email'])
                    ->map(fn (Student $student): array => [
                        'id' => $student->id,
                        'student_number' => $student->student_number,
                        'name' => $student->name,
                        'email' => $student->email,
                        'label' => trim($student->student_number.' - '.($student->name ?? 'Unnamed student')),
                    ])
                    ->values()
                    ->all(),
            ],
            'can' => [
                'manage' => $request->user()?->can('nfc_cards.manage') ?? false,
            ],
        ]);
    }

    public function store(StoreNfcCardRequest $request, RegisterNfcCardAction $registerNfcCard): RedirectResponse
    {
        try {
            $card = $registerNfcCard->handle(
                Student::query()->findOrFail($request->integer('student_id')),
                $request->validated('uid'),
                $request->user(),
            );
        } catch (RuntimeException $exception) {
            return back()->withErrors(['uid' => $exception->getMessage()]);
        }

        return to_route('nfc-cards.show', $card);
    }

    public function show(Request $request, NfcCard $nfcCard): Response
    {
        Gate::authorize('view', $nfcCard);

        return Inertia::render('nfc-cards/show', [
            'card' => $this->cardPayload($nfcCard->load([
                'student:id,student_number,name,email,course,level',
                'createdBy:id,name,email',
            ])),
            'can' => [
                'manage' => $request->user()?->can('nfc_cards.manage') ?? false,
            ],
        ]);
    }

    public function replace(
        ReplaceNfcCardRequest $request,
        NfcCard $nfcCard,
        ReplaceNfcCardAction $replaceNfcCard,
    ): RedirectResponse {
        try {
            $newCard = $replaceNfcCard->handle($nfcCard, $request->validated('uid'), $request->user());
        } catch (RuntimeException $exception) {
            return back()->withErrors(['uid' => $exception->getMessage()]);
        }

        return to_route('nfc-cards.show', $newCard);
    }

    public function markLost(NfcCard $nfcCard, MarkNfcCardLostAction $markNfcCardLost): RedirectResponse
    {
        Gate::authorize('markLost', $nfcCard);

        try {
            $markNfcCardLost->handle($nfcCard);
        } catch (RuntimeException $exception) {
            return back()->withErrors(['card' => $exception->getMessage()]);
        }

        return back();
    }

    public function revoke(NfcCard $nfcCard, RevokeNfcCardAction $revokeNfcCard): RedirectResponse
    {
        Gate::authorize('revoke', $nfcCard);

        try {
            $revokeNfcCard->handle($nfcCard);
        } catch (RuntimeException $exception) {
            return back()->withErrors(['card' => $exception->getMessage()]);
        }

        return back();
    }

    public function destroy(NfcCard $nfcCard): RedirectResponse
    {
        Gate::authorize('delete', $nfcCard);

        $nfcCard->delete();

        return to_route('nfc-cards.index');
    }

    private function cardPayload(NfcCard $card): array
    {
        return [
            'id' => $card->id,
            'uid_last4' => $card->uid_last4,
            'status' => $card->status->value,
            'status_label' => str($card->status->value)->replace('_', ' ')->title()->toString(),
            'issued_at' => $card->issued_at?->toISOString(),
            'activated_at' => $card->activated_at?->toISOString(),
            'deactivated_at' => $card->deactivated_at?->toISOString(),
            'replaced_at' => $card->replaced_at?->toISOString(),
            'lost_at' => $card->lost_at?->toISOString(),
            'student' => [
                'id' => $card->student->id,
                'student_number' => $card->student->student_number,
                'name' => $card->student->name,
                'email' => $card->student->email,
                'course' => $card->student->course,
                'level' => $card->student->level,
            ],
            'created_by' => $card->createdBy ? [
                'id' => $card->createdBy->id,
                'name' => $card->createdBy->name,
                'email' => $card->createdBy->email,
            ] : null,
        ];
    }
}
