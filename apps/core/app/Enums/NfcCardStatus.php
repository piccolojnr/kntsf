<?php

namespace App\Enums;

enum NfcCardStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case Revoked = 'revoked';
    case Lost = 'lost';
    case Stolen = 'stolen';
    case Replaced = 'replaced';
    case Damaged = 'damaged';
}
