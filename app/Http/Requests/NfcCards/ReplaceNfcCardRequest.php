<?php

namespace App\Http\Requests\NfcCards;

use App\Models\NfcCard;
use Illuminate\Foundation\Http\FormRequest;

class ReplaceNfcCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        $card = $this->route('nfc_card');

        return $card instanceof NfcCard
            && ($this->user()?->can('replace', $card) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'uid' => ['required', 'string', 'max:100'],
        ];
    }
}
