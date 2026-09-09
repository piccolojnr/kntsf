<?php

namespace App\Enums;

enum StudentVerificationStatus: string
{
    case Verified = 'verified';
    case PendingReview = 'pending_review';
    case Rejected = 'rejected';
}
