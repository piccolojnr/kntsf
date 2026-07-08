@php
    $title = 'KNTSF Executive Report';
    $headline = [
        'Students' => $summary['total_students'] ?? 0,
        'Active permits' => $summary['active_permits'] ?? 0,
        'Successful payments' => $summary['successful_payments'] ?? 0,
        'Verification attempts' => $summary['verification_attempts'] ?? 0,
        'Election votes' => $summary['election_votes'] ?? 0,
    ];
@endphp
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            color: #17211b;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        th, td {
            border: 1px solid #d7d0bf;
            padding: 8px 10px;
            vertical-align: middle;
        }

        .hero {
            background: #17211b;
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
        }

        .subhero {
            background: #17211b;
            color: #d8bd7a;
            font-size: 12px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .meta {
            background: #f5f1e8;
            color: #655d51;
            font-size: 12px;
        }

        .section {
            background: #332f28;
            color: #ffffff;
            font-size: 15px;
            font-weight: 700;
        }

        .kpi-label {
            background: #efe8d8;
            color: #655d51;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .kpi-value {
            background: #ffffff;
            color: #17211b;
            font-size: 22px;
            font-weight: 700;
        }

        .header {
            background: #d8bd7a;
            color: #17211b;
            font-weight: 700;
        }

        .number {
            text-align: right;
            font-weight: 700;
        }

        .muted {
            color: #655d51;
        }

        .risk {
            background: #fff7ed;
            color: #9a3412;
            font-weight: 700;
        }

        .positive {
            background: #ecfdf5;
            color: #166534;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <table>
        <tr>
            <td class="subhero" colspan="6">Knutsford SRC</td>
        </tr>
        <tr>
            <td class="hero" colspan="6">{{ $title }}</td>
        </tr>
        <tr>
            <td class="meta" colspan="3">Period: {{ $period->label }}</td>
            <td class="meta" colspan="3">Generated: {{ $generatedAt }}</td>
        </tr>
        <tr><td colspan="6"></td></tr>

        <tr>
            <td class="section" colspan="6">Executive Summary</td>
        </tr>
        <tr>
            @foreach ($headline as $label => $value)
                <td class="kpi-label">{{ $label }}</td>
            @endforeach
            <td class="kpi-label">Report groups</td>
        </tr>
        <tr>
            @foreach ($headline as $value)
                <td class="kpi-value">{{ number_format($value) }}</td>
            @endforeach
            <td class="kpi-value">{{ count($reports) }}</td>
        </tr>
        <tr><td colspan="6"></td></tr>

        <tr>
            <td class="section" colspan="6">Module Performance</td>
        </tr>
        <tr class="header">
            <td>Group</td>
            <td>Total</td>
            <td>Share of largest group</td>
            <td>Primary indicator</td>
            <td>Watch item</td>
            <td>Executive note</td>
        </tr>
        @foreach ($reports as $group => $values)
            @php
                $total = array_sum($values);
                $share = $largestGroupTotal > 0 ? round(($total / $largestGroupTotal) * 100) : 0;
                arsort($values);
                $primaryLabel = array_key_first($values);
                $primaryValue = $values[$primaryLabel] ?? 0;
                asort($values);
                $watchLabel = array_key_first($values);
                $watchValue = $values[$watchLabel] ?? 0;
            @endphp
            <tr>
                <td>{{ str($group)->replace('_', ' ')->title() }}</td>
                <td class="number">{{ number_format($total) }}</td>
                <td class="number">{{ $share }}%</td>
                <td class="positive">{{ str($primaryLabel)->replace('_', ' ')->title() }}: {{ number_format($primaryValue) }}</td>
                <td class="risk">{{ str($watchLabel)->replace('_', ' ')->title() }}: {{ number_format($watchValue) }}</td>
                <td class="muted">Review movement against the selected reporting period and follow up on exception counts.</td>
            </tr>
        @endforeach
        <tr><td colspan="6"></td></tr>

        <tr>
            <td class="section" colspan="6">Detailed Metrics</td>
        </tr>
        <tr class="header">
            <td>Group</td>
            <td>Metric</td>
            <td>Value</td>
            <td>Group share</td>
            <td colspan="2">Interpretation</td>
        </tr>
        @foreach ($reports as $group => $values)
            @php($groupTotal = max(1, array_sum($values)))
            @foreach ($values as $label => $value)
                <tr>
                    <td>{{ str($group)->replace('_', ' ')->title() }}</td>
                    <td>{{ str($label)->replace('_', ' ')->title() }}</td>
                    <td class="number">{{ number_format($value) }}</td>
                    <td class="number">{{ round(($value / $groupTotal) * 100) }}%</td>
                    <td colspan="2" class="muted">{{ $value > 0 ? 'Activity recorded for the selected period.' : 'No records for the selected period.' }}</td>
                </tr>
            @endforeach
        @endforeach
    </table>
</body>
</html>
