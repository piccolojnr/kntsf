<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePlatformSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('settings.update') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $paystack = is_array($this->input('paystack')) ? $this->input('paystack') : [];
        $mail = is_array($this->input('mail')) ? $this->input('mail') : [];

        $this->merge([
            'paystack' => array_replace($paystack, [
                'payment_url' => trim((string) $this->input('paystack.payment_url', '')),
            ]),
            'mail' => array_replace($mail, [
                'mailer' => 'smtp',
                'scheme' => blank($this->input('mail.scheme')) ? null : $this->input('mail.scheme'),
                'host' => trim((string) $this->input('mail.host', '')),
                'username' => blank($this->input('mail.username')) ? null : trim((string) $this->input('mail.username')),
                'from_address' => mb_strtolower(trim((string) $this->input('mail.from_address', ''))),
                'from_name' => trim((string) $this->input('mail.from_name', '')),
            ]),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'paystack' => ['required', 'array'],
            'paystack.public_key' => ['nullable', 'string', 'max:255'],
            'paystack.secret_key' => ['nullable', 'string', 'max:255'],
            'paystack.webhook_secret' => ['nullable', 'string', 'max:255'],
            'paystack.payment_url' => ['required', 'url', 'max:255'],
            'mail' => ['required', 'array'],
            'mail.mailer' => ['required', 'in:smtp'],
            'mail.host' => ['required', 'string', 'max:255'],
            'mail.port' => ['required', 'integer', 'min:1', 'max:65535'],
            'mail.scheme' => ['nullable', 'in:tls,ssl'],
            'mail.username' => ['nullable', 'string', 'max:255'],
            'mail.password' => ['nullable', 'string', 'max:255'],
            'mail.from_address' => ['required', 'email', 'max:255'],
            'mail.from_name' => ['required', 'string', 'max:255'],
        ];
    }
}
