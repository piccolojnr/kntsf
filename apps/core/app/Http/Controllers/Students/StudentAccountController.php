<?php

namespace App\Http\Controllers\Students;

use App\Actions\Students\ActivateStudentAccountAction;
use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class StudentAccountController extends Controller
{
    public function activate(
        Request $request,
        Student $student,
        ActivateStudentAccountAction $activateStudentAccount,
    ): RedirectResponse {
        Gate::authorize('activateAccount', $student);

        $activateStudentAccount->handle($student, $request->user());

        return back()->with('status', 'Student account activation email sent.');
    }
}
