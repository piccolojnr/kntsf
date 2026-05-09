<?php

namespace App\Http\Requests\NfcCards;

use App\Models\NfcCard;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNfcCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', NfcCard::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'student_id' => ['required', Rule::exists('students', 'id')],
            'uid' => ['required', 'string', 'max:100'],
        ];
    }
}
