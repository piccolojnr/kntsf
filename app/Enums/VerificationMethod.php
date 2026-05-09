<?php

namespace App\Enums;

enum VerificationMethod: string
{
    case StudentNumber = 'student_number';
    case PermitCode = 'permit_code';
}
