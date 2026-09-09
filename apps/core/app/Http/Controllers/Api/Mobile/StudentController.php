<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Actions\NfcCards\MarkNfcCardLostAction;
use App\Http\Controllers\Controller;
use App\Http\Resources\Mobile\NfcCardResource;
use App\Http\Resources\Mobile\PermitResource;
use App\Http\Resources\Mobile\StudentResource;
use App\Models\NfcCard;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class StudentController extends Controller
{
    public function profile(Request $request): StudentResource
    {
        return new StudentResource($this->student($request)->loadMissing(['user', 'activeNfcCard']));
    }

    public function permits(Request $request): JsonResponse
    {
        $permits = $this->student($request)
            ->permits()
            ->with(['academicPeriod', 'issuedBy'])
            ->latest()
            ->get();

        return response()->json([
            'data' => PermitResource::collection($permits),
        ]);
    }

    public function nfcCard(Request $request): JsonResponse
    {
        $card = $this->student($request)
            ->activeNfcCard()
            ->with(['student'])
            ->first();

        return response()->json([
            'data' => $card ? new NfcCardResource($card) : null,
        ]);
    }

    public function reportNfcCardLost(Request $request, MarkNfcCardLostAction $markNfcCardLost): JsonResponse
    {
        $card = $this->student($request)->activeNfcCard()->first();

        if (! $card instanceof NfcCard) {
            return response()->json([
                'message' => 'No active NFC card was found for this student.',
            ], 404);
        }

        try {
            $card = $markNfcCardLost->handle($card, $request->user());
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'data' => new NfcCardResource($card->load('student')),
        ]);
    }

    private function student(Request $request): Student
    {
        $student = $request->user()?->student;

        abort_unless($student instanceof Student, 403, 'This endpoint is only available to linked student accounts.');

        return $student;
    }
}
