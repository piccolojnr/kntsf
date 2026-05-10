<?php

namespace App\Http\Requests\Payments;

use App\Models\Payment;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePaymentStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $payment = $this->route('payment');

        return $payment instanceof Payment
            && ($this->user()?->can($this->ability(), $payment) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        $rules = [
            'notes' => ['nullable', 'string', 'max:1000'],
            'issue_permit' => ['boolean'],
            'academic_period_id' => ['nullable', 'exists:academic_periods,id'],
        ];

        if ($this->routeIs('payments.mark-failed')) {
            $rules['failure_reason'] = ['required', 'string', 'max:1000'];
        }

        return $rules;
    }

    private function ability(): string
    {
        return match (true) {
            $this->routeIs('payments.mark-successful') => 'markSuccessful',
            $this->routeIs('payments.mark-failed') => 'markFailed',
            $this->routeIs('payments.cancel') => 'cancel',
            default => 'update',
        };
    }
}
