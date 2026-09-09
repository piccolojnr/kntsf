<?php

namespace App\Enums;

enum AccountActivationPurpose: string
{
    case SetupPassword = 'setup_password';
    case ResetPassword = 'reset_password';
}
