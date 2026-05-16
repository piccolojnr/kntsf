<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Actions\NfcCards\RegisterNfcCardAction;
use App\Actions\NfcCards\ReplaceNfcCardAction;
use App\Actions\NfcCards\RevokeNfcCardAction;
use App\Actions\Permits\IssuePermitAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Mobile\IssuePermitRequest;
use App\Http\Requests\Mobile\RegisterNfcCardRequest;
use App\Http\Requests\Mobile\ReplaceNfcCardRequest;
use App\Http\Resources\Mobile\NfcCardResource;
use App\Http\Resources\Mobile\PermitResource;
use App\Http\Resources\Mobile\StudentResource;
use App\Models\NfcCard;
use App\Models\Student;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use RuntimeException;

class OperationsController extends Controller
{
    public function searchStudents(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Student::class);

        $search = $request->string('search')->trim()->toString();

        $students = Student::query()
            ->with(['user', 'activeNfcCard'])
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where('student_number', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy('student_number')
            ->limit(min(max($request->integer('limit', 20), 1), 50))
            ->get();

        return response()->json([
            'data' => StudentResource::collection($students),
        ]);
    }

    public function showStudent(Student $student): StudentResource
    {
        Gate::authorize('view', $student);

        return new StudentResource($student->load(['user', 'activeNfcCard', 'permits.academicPeriod']));
    }

    public function issuePermit(IssuePermitRequest $request, IssuePermitAction $issuePermit): JsonResponse
    {
        try {
            $issuedPermit = $issuePermit->handle(
                Student::query()->findOrFail($request->integer('student_id')),
                $request->user(),
                $request->validated(),
            );
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'data' => new PermitResource($issuedPermit->permit->loadMissing(['student', 'academicPeriod', 'issuedBy'])),
            'plain_code' => $issuedPermit->code,
            'message' => 'Permit issued. The permit code is shown once.',
        ], 201);
    }

    public function registerNfcCard(RegisterNfcCardRequest $request, RegisterNfcCardAction $registerNfcCard): JsonResponse
    {
        try {
            $card = $registerNfcCard->handle(
                Student::query()->findOrFail($request->integer('student_id')),
                $request->validated('uid'),
                $request->user(),
            );
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'data' => new NfcCardResource($card->load(['student', 'createdBy'])),
        ], 201);
    }

    public function replaceNfcCard(ReplaceNfcCardRequest $request, NfcCard $nfcCard, ReplaceNfcCardAction $replaceNfcCard): JsonResponse
    {
        try {
            $card = $replaceNfcCard->handle($nfcCard, $request->validated('uid'), $request->user());
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'data' => new NfcCardResource($card->load(['student', 'createdBy'])),
        ]);
    }

    public function revokeNfcCard(Request $request, NfcCard $nfcCard, RevokeNfcCardAction $revokeNfcCard): JsonResponse
    {
        Gate::authorize('revoke', $nfcCard);

        try {
            $card = $revokeNfcCard->handle($nfcCard, $request->user());
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'data' => new NfcCardResource($card->load(['student', 'createdBy'])),
        ]);
    }
}
