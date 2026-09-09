<?php

namespace App\Enums;

enum PollType: string
{
    case FixedOptions = 'fixed_options';

    case DynamicOptions = 'dynamic_options';
}
