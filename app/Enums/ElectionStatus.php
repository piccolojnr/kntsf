<?php

namespace App\Enums;

enum ElectionStatus: string
{
    case Draft = 'draft';
    case Scheduled = 'scheduled';
    case Active = 'active';
    case Closed = 'closed';
    case Archived = 'archived';
}
