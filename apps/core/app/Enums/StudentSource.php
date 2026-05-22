<?php

namespace App\Enums;

enum StudentSource: string
{
    case AdminCreated = 'admin_created';
    case AdminImport = 'admin_import';
    case SelfService = 'self_service';
}
