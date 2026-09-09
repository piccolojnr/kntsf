<?php

namespace App\Enums;

enum PermitRequestReviewStatus: string
{
    case PendingReview = 'pending_review';
    case Approved = 'approved';
    case Rejected = 'rejected';
}
