@php
    $formatStatus = fn($value): string => str((string) ($value?->value ?? $value))->replace('_', ' ')->title()->toString();
    $positions = $election->positions;
    $candidateCount = $positions->sum(fn($position) => $position->candidates->count());
    $approvedCount = $positions->sum(fn($position) => $position->candidates->where('status', \App\Enums\CandidateStatus::Approved)->count());
@endphp

<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>{{ $election->title }} Election Report</title>

    <style>
        @page {
            margin: 42px 44px 58px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            color: #111111;
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            line-height: 1.45;
            margin: 0;
        }

        h1,
        h2,
        h3,
        p {
            margin: 0;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        .footer {
            border-top: 1px solid #999999;
            bottom: -36px;
            color: #555555;
            font-size: 8.5px;
            left: 0;
            padding-top: 7px;
            position: fixed;
            right: 0;
            text-align: center;
        }

        .page-number::after {
            content: counter(page);
        }

        .document-header {
            border-bottom: 2px solid #111111;
            padding-bottom: 14px;
        }

        .eyebrow {
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 1.4px;
            margin-bottom: 7px;
            text-transform: uppercase;
        }

        .title {
            font-size: 23px;
            font-weight: bold;
            line-height: 1.15;
        }

        .subtitle {
            color: #444444;
            font-size: 10.5px;
            margin-top: 7px;
            max-width: 620px;
        }

        .meta-table {
            margin-top: 14px;
        }

        .meta-table td {
            border: 1px solid #999999;
            padding: 8px 10px;
            width: 33.333%;
        }

        .meta-label {
            color: #555555;
            display: block;
            font-size: 8px;
            font-weight: bold;
            letter-spacing: 1px;
            margin-bottom: 2px;
            text-transform: uppercase;
        }

        .meta-value {
            font-size: 11px;
            font-weight: bold;
        }

        .section {
            margin-top: 22px;
        }

        .section-title {
            border-bottom: 1px solid #111111;
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 8px;
            padding-bottom: 5px;
            text-transform: uppercase;
        }

        .data th {
            background: #eeeeee;
            border: 1px solid #999999;
            font-size: 8.5px;
            font-weight: bold;
            letter-spacing: .5px;
            padding: 7px 8px;
            text-align: left;
            text-transform: uppercase;
        }

        .data td {
            border: 1px solid #bbbbbb;
            padding: 7px 8px;
            vertical-align: top;
        }

        .number {
            font-weight: bold;
            text-align: right;
            white-space: nowrap;
        }

        .position-block {
            margin-top: 14px;
            page-break-inside: avoid;
        }

        .position-title {
            background: #eeeeee;
            border: 1px solid #999999;
            border-bottom: 0;
            font-size: 11px;
            font-weight: bold;
            padding: 7px 8px;
        }

        .muted {
            color: #555555;
        }

        .notice {
            border: 1px solid #999999;
            color: #444444;
            padding: 10px;
        }
    </style>
</head>

<body>
    <div class="footer">
        KNTSF Election Report · Internal Use Only · Page <span class="page-number"></span>
    </div>

    <header class="document-header">
        <p class="eyebrow">Election Report</p>
        <h1 class="title">{{ $election->title }}</h1>
        <p class="subtitle">
            Formal election summary for positions, candidates, voting setup, and permitted results.
        </p>

        <table class="meta-table">
            <tr>
                <td>
                    <span class="meta-label">Academic Period</span>
                    <span class="meta-value">{{ $election->academicPeriod->name }}</span>
                </td>
                <td>
                    <span class="meta-label">Status</span>
                    <span class="meta-value">{{ $formatStatus($election->status) }}</span>
                </td>
                <td>
                    <span class="meta-label">Generated</span>
                    <span class="meta-value">{{ $generatedAt }}</span>
                </td>
            </tr>
        </table>
    </header>

    <section class="section">
        <h2 class="section-title">1. Election Summary</h2>
        <table class="data">
            <tbody>
                <tr>
                    <td>Positions</td>
                    <td class="number">{{ number_format($positions->count()) }}</td>
                    <td>Candidates</td>
                    <td class="number">{{ number_format($candidateCount) }}</td>
                </tr>
                <tr>
                    <td>Approved candidates</td>
                    <td class="number">{{ number_format($approvedCount) }}</td>
                    <td>Votes cast</td>
                    <td class="number">{{ $canViewResults ? number_format($election->votes_count ?? $election->votes()->count()) : 'Restricted' }}</td>
                </tr>
                <tr>
                    <td>Starts</td>
                    <td>{{ $election->starts_at?->format('M j, Y H:i') ?? 'Not set' }}</td>
                    <td>Ends</td>
                    <td>{{ $election->ends_at?->format('M j, Y H:i') ?? 'Not set' }}</td>
                </tr>
            </tbody>
        </table>
    </section>

    @if($election->description)
        <section class="section">
            <h2 class="section-title">2. Overview</h2>
            <div class="notice">{!! nl2br(e(strip_tags($election->description))) !!}</div>
        </section>
    @endif

    <section class="section">
        <h2 class="section-title">{{ $election->description ? '3' : '2' }}. Positions and Candidates</h2>

        @forelse($positions as $position)
            <div class="position-block">
                <h3 class="position-title">
                    {{ $position->title }}
                    <span class="muted"> · {{ $formatStatus($position->status) }} · {{ $position->max_winners }} winner(s)</span>
                </h3>

                <table class="data">
                    <thead>
                        <tr>
                            <th>Candidate</th>
                            <th style="width: 130px;">Student Number</th>
                            <th style="width: 100px;">Status</th>
                            <th style="width: 90px; text-align: right;">Votes</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($position->candidates as $candidate)
                            <tr>
                                <td>
                                    <strong>{{ $candidate->student->name ?? 'Unnamed student' }}</strong>
                                    @if($candidate->slogan)
                                        <br><span class="muted">{{ $candidate->slogan }}</span>
                                    @endif
                                </td>
                                <td>{{ $candidate->student->student_number }}</td>
                                <td>{{ $formatStatus($candidate->status) }}</td>
                                <td class="number">{{ $canViewResults ? number_format($candidate->votes->count()) : 'Restricted' }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4" class="muted">No candidates have been added for this position.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        @empty
            <div class="notice">No positions have been added to this election.</div>
        @endforelse
    </section>

    @unless($canViewResults)
        <section class="section">
            <h2 class="section-title">Results Visibility</h2>
            <div class="notice">
                Vote totals are restricted for the current user or election state. This export includes setup and candidate information only.
            </div>
        </section>
    @endunless
</body>

</html>
