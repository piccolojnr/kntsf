<?php

namespace App\Support;

use RuntimeException;
use Stringable;

class NfcUidHasher
{
    public function hash(string $uid): string
    {
        return hash_hmac('sha256', $this->normalize($uid), $this->key());
    }

    public function lastFour(string $uid): string
    {
        return str($this->normalize($uid))
            ->substr(-4)
            ->toString();
    }

    public function normalize(string $uid): string
    {
        return str($uid)
            ->trim()
            ->upper()
            ->replaceMatches('/[^A-Z0-9]/', '')
            ->pipe(fn (Stringable $value): string => $value->toString());
    }

    private function key(): string
    {
        $key = config('nfc.uid_hash_key');

        if (! is_string($key) || trim($key) === '') {
            throw new RuntimeException('NFC UID hash key is not configured.');
        }

        return $key;
    }
}
