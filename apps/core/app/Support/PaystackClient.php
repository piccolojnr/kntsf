<?php

namespace App\Support;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class PaystackClient
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function initializeTransaction(array $payload): array
    {
        return $this->post('/transaction/initialize', $payload);
    }

    /**
     * @return array<string, mixed>
     */
    public function verifyTransaction(string $reference): array
    {
        return $this->get('/transaction/verify/'.rawurlencode($reference));
    }

    public function verifyWebhookSignature(string $payload, ?string $signature): bool
    {
        $secret = (string) (config('services.paystack.webhook_secret') ?: $this->secretKey());

        if ($signature === null || $secret === '') {
            return false;
        }

        return hash_equals(hash_hmac('sha512', $payload, $secret), $signature);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function post(string $path, array $payload): array
    {
        return $this->decode(
            Http::withToken($this->secretKey())
                ->acceptJson()
                ->timeout(15)
                ->connectTimeout(5)
                ->post($this->baseUrl().$path, $payload)
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function get(string $path): array
    {
        return $this->decode(
            Http::withToken($this->secretKey())
                ->acceptJson()
                ->timeout(15)
                ->connectTimeout(5)
                ->get($this->baseUrl().$path)
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function decode(Response $response): array
    {
        if ($response->failed()) {
            throw new RuntimeException('Paystack request failed.');
        }

        $payload = $response->json();

        if (! is_array($payload)) {
            throw new RuntimeException('Paystack returned an invalid response.');
        }

        return $payload;
    }

    private function baseUrl(): string
    {
        return rtrim((string) config('services.paystack.payment_url', 'https://api.paystack.co'), '/');
    }

    private function secretKey(): string
    {
        return (string) config('services.paystack.secret_key');
    }
}
