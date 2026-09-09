<?php

namespace App\Enums;

enum PollOptionStatus: string
{
    case Active = 'active';

    case Merged = 'merged';

    case Archived = 'archived';
}
