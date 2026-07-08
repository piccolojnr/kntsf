@php
    $formatLabel = fn(string $value): string => str($value)->replace('_', ' ')->title()->toString();

    $statusFor = function (int $value): string {
        if ($value <= 0) {
            return 'Clear';
        }

        if ($value <= 5) {
            return 'Monitor';
        }

        return 'Attention';
    };

    $summaryRows = collect($summary)
        ->map(fn($value, $label) => [
            'label' => $formatLabel($label),
            'value' => $value,
        ])
        ->values();

    $moduleOverview = collect($reports)
        ->map(function (array $values, string $group) use ($formatLabel) {
            $total = array_sum($values);

            $ordered = $values;
            arsort($ordered);

            $primaryLabel = array_key_first($ordered);
            $primaryValue = $primaryLabel !== null ? $ordered[$primaryLabel] : 0;

            return [
                'module' => $formatLabel($group),
                'total' => $total,
                'primary_label' => $primaryLabel ? $formatLabel($primaryLabel) : 'N/A',
                'primary_value' => $primaryValue,
            ];
        })
        ->values();
@endphp

<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>KNTSF Executive Report</title>

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
            font-size: 24px;
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
            width: 50%;
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

        .section-note {
            color: #555555;
            font-size: 9.5px;
            margin-bottom: 8px;
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

        .data .number {
            font-weight: bold;
            text-align: right;
            white-space: nowrap;
        }

        .watch-table td,
        .watch-table th {
            padding: 7px 8px;
        }

        .status {
            font-weight: bold;
            text-transform: uppercase;
            white-space: nowrap;
        }

        .status-clear {
            color: #333333;
            font-weight: normal;
        }

        .status-monitor {
            color: #111111;
        }

        .status-attention {
            color: #111111;
            text-decoration: underline;
        }

        .module-block {
            margin-top: 14px;
            page-break-inside: avoid;
        }

        .module-title {
            background: #eeeeee;
            border: 1px solid #999999;
            border-bottom: 0;
            font-size: 11px;
            font-weight: bold;
            padding: 7px 8px;
        }

        .two-column-table td {
            width: 50%;
        }

        .muted {
            color: #555555;
        }

        .empty {
            border: 1px solid #bbbbbb;
            color: #555555;
            padding: 10px;
        }
    </style>
</head>

<body>
    <div class="footer">
        KNTSF Executive Report · Internal Use Only · Page <span class="page-number"></span>
    </div>

    <header class="document-header">
        <p class="eyebrow">Operational Reporting</p>
        <h1 class="title">KNTSF Executive Report</h1>
        <p class="subtitle">
            Formal executive summary of student records, permits, NFC cards, payments, permit requests,
            verification activity, and election operations for the selected reporting period.
        </p>

        <table class="meta-table">
            <tr>
                <td>
                    <span class="meta-label">Report Period</span>
                    <span class="meta-value">{{ $period->label }}</span>
                </td>
                <td>
                    <span class="meta-label">Generated</span>
                    <span class="meta-value">{{ $generatedAt }}</span>
                </td>
            </tr>
        </table>
    </header>

    <section class="section">
        <h2 class="section-title">1. Executive Summary</h2>

        @if($summaryRows->isNotEmpty())
            <table class="data">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th style="width: 140px; text-align: right;">Value</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($summaryRows as $row)
                        <tr>
                            <td>{{ $row['label'] }}</td>
                            <td class="number">{{ number_format($row['value']) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <div class="empty">No executive summary data is available for this reporting period.</div>
        @endif
    </section>

    <section class="section">
        <h2 class="section-title">2. Executive Watch List</h2>
        <p class="section-note">
            Items below represent operational areas that may require follow-up. Status is based on the current count.
        </p>

        @if(!empty($watchItems))
            <table class="data watch-table">
                <thead>
                    <tr>
                        <th>Area</th>
                        <th>Item</th>
                        <th style="width: 100px; text-align: right;">Count</th>
                        <th style="width: 100px;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($watchItems as $item)
                        @php
                            $value = (int) $item['value'];
                            $status = $statusFor($value);
                            $statusClass = 'status-' . str($status)->lower()->toString();
                        @endphp

                        <tr>
                            <td>{{ $item['group'] }}</td>
                            <td>{{ $item['label'] }}</td>
                            <td class="number">{{ number_format($value) }}</td>
                            <td class="status {{ $statusClass }}">{{ $status }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <div class="empty">No watch list items are available for this reporting period.</div>
        @endif
    </section>

    <section class="section">
        <h2 class="section-title">3. Module Overview</h2>

        @if($moduleOverview->isNotEmpty())
            <table class="data">
                <thead>
                    <tr>
                        <th>Module</th>
                        <th style="width: 120px; text-align: right;">Total Activity</th>
                        <th>Primary Indicator</th>
                        <th style="width: 120px; text-align: right;">Indicator Value</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($moduleOverview as $module)
                        <tr>
                            <td>{{ $module['module'] }}</td>
                            <td class="number">{{ number_format($module['total']) }}</td>
                            <td>{{ $module['primary_label'] }}</td>
                            <td class="number">{{ number_format($module['primary_value']) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <div class="empty">No module activity is available for this reporting period.</div>
        @endif
    </section>

    <section class="section">
        <h2 class="section-title">4. Detailed Metrics</h2>

        @forelse($reports as $group => $values)
        <div class="module-block">
            <h3 class="module-title">{{ $formatLabel($group) }}</h3>

            <table class="data">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th style="width: 120px; text-align: right;">Value</th>
                        <th style="width: 150px; text-align: right;">Share Within Module</th>
                    </tr>
                </thead>
                <tbody>
                    @php($groupTotal = max(1, array_sum($values)))

                    @foreach($values as $label => $value)
                        <tr>
                            <td>{{ $formatLabel($label) }}</td>
                            <td class="number">{{ number_format($value) }}</td>
                            <td class="number">{{ round(($value / $groupTotal) * 100) }}%</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @empty
        <div class="empty">No detailed report metrics are available for this reporting period.</div>
        @endforelse
    </section>
</body>

</html>