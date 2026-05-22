<?php

namespace App\Http\Controllers\Payments;

use App\Actions\PermitRequests\FailPermitRequestAction;
use App\Actions\PermitRequests\VerifyPaystackPaymentAction;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\PermitRequest;
use App\Support\PaystackClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class PaystackWebhookController extends Controller
{
    public function __invoke(
        Request $request,
        PaystackClient $paystackClient,
        VerifyPaystackPaymentAction $verifyPaystackPayment,
        FailPermitRequestAction $failPermitRequest,
    ): JsonResponse {
        if (! $paystackClient->verifyWebhookSignature($request->getContent(), $request->header('x-paystack-signature'))) {
            abort(403);
        }

        $event = (string) $request->input('event');
        $reference = (string) Arr::get($request->input('data', []), 'reference');

        if ($reference === '') {
            return response()->json(['ok' => true]);
        }

        if ($event === 'charge.success') {
            $verifyPaystackPayment->handle($reference);

            return response()->json(['ok' => true]);
        }

        if ($event === 'charge.failed') {
            $payment = Payment::query()
                ->where('reference', $reference)
                ->orWhere('gateway_reference', $reference)
                ->first();

            if ($payment !== null) {
                $permitRequest = PermitRequest::query()
                    ->where('payment_id', $payment->id)
                    ->first();

                if ($permitRequest !== null) {
                    $failPermitRequest->handle($permitRequest, 'Paystack reported a failed charge.');
                }
            }
        }

        return response()->json(['ok' => true]);
    }
}
