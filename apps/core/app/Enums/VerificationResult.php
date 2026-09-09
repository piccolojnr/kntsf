<?php

namespace App\Enums;

enum VerificationResult: string
{
    case Valid = 'valid';
    case Invalid = 'invalid';
    case Expired = 'expired';
    case Revoked = 'revoked';
    case NotFound = 'not_found';
    case Error = 'error';
    case CardInactive = 'card_inactive';
    case Mismatch = 'mismatch';
}
