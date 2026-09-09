<?php

namespace App\Http\Requests\Api\Mobile;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class InitializeMobilePermitPaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'callback_url' => [
                'nullable',
                'string',
                'max:2048',
                $this->mobileReturnUrlRule(),
            ],
            'redirect_url' => [
                'nullable',
                'string',
                'max:2048',
                $this->mobileReturnUrlRule(),
            ],
        ];
    }

    private function mobileReturnUrlRule(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            if (! is_string($value)) {
                $fail("The {$attribute} field must be a valid URL.");

                return;
            }

            $url = trim($value);

            $isWebUrl = filter_var($url, FILTER_VALIDATE_URL) !== false
                && (Str::startsWith($url, 'https://') || Str::startsWith($url, 'http://'));

            $isAppUrl = Str::startsWith($url, 'kntsfapp://')
                && preg_match('/\s/', $url) !== 1;

            if (! $isWebUrl && ! $isAppUrl) {
                $fail("The {$attribute} field must be a valid URL.");
            }
        };
    }
}
