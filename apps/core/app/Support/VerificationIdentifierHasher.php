<?php

namespace App\Support;

use RuntimeException;

class VerificationIdentifierHasher
{
    public function hash(string $identifier): string
    {
        return hash_hmac('sha256', $this->normalize($identifier), $this->key());
    }

    private function normalize(string $identifier): string
    {
        return mb_strtolower(trim($identifier));
    }

    private function key(): string
    {
        $key = config('permits.code_hash_key');

        if (! is_string($key) || trim($key) === '') {
            throw new RuntimeException('Verification hash key is not configured.');
        }

        return $key;
    }
}
