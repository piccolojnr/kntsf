<?php

namespace App\Support;

use App\Models\Student;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Notification as NotificationFacade;

class StudentNotifier
{
    public function notify(Student $student, Notification $notification): void
    {
        $student->loadMissing('user');

        if ($student->user !== null) {
            $student->user->notify($notification);

            return;
        }

        if (filled($student->email)) {
            NotificationFacade::route('mail', [$student->email => $student->name ?? $student->student_number])
                ->notify($notification);
        }
    }
}
