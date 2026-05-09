<?php

namespace App\Enums;

enum PermitStatus: string
{
    case Active = 'active';
    case Expired = 'expired';
    case Revoked = 'revoked';
}
