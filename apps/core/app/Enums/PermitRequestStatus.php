<?php

namespace App\Enums;

enum PermitRequestStatus: string
{
    case Pending = 'pending';
    case AwaitingPayment = 'awaiting_payment';
    case Paid = 'paid';
    case Issued = 'issued';
    case Failed = 'failed';
    case Cancelled = 'cancelled';
    case Expired = 'expired';
}
