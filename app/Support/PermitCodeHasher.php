<?php

namespace App\Support;

use RuntimeException;

class PermitCodeHasher
{
    public function hash(string $code): string
    {
        return hash_hmac('sha256', $code, $this->key());
    }

    public function lastFour(string $code): string
    {
        return mb_substr($code, -4);
    }

    private function key(): string
    {
        $key = config('permits.code_hash_key');

        if (! is_string($key) || trim($key) === '') {
            throw new RuntimeException('Permit code hash key is not configured.');
        }

        return $key;
    }
}
