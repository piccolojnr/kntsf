<?php

namespace App\Http\Controllers\Elections;

use App\Http\Controllers\Controller;
use App\Models\Election;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class ElectionExportController extends Controller
{
    public function pdf(Request $request, Election $election): Response
    {
        Gate::authorize('view', $election);

        $election->load([
            'academicPeriod:id,name,academic_year,semester',
            'creator:id,name,email',
            'positions.candidates.student:id,student_number,name,email,course,level',
            'positions.candidates.votes',
        ]);

        $canViewResults = $request->user()?->can('viewResults', $election) ?? false;

        return Pdf::loadView('exports.elections.election-report-pdf', [
            'election' => $election,
            'canViewResults' => $canViewResults,
            'generatedAt' => now()->toDayDateTimeString(),
        ])
            ->setPaper('a4')
            ->download('election-report-'.$election->slug.'.pdf');
    }
}
