<?php

namespace App\Support;

final class SimplePdfWriter
{
    /**
     * @param  array<int, string>  $lines
     */
    public function render(array $lines): string
    {
        $content = $this->contentStream($lines);

        $objects = [
            '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
            '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
            '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >> endobj',
            '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
            '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj',
            '6 0 obj << /Length '.strlen($content)." >> stream\n{$content}\nendstream endobj",
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [0];

        foreach ($objects as $object) {
            $offsets[] = strlen($pdf);
            $pdf .= $object."\n";
        }

        $xrefPosition = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n";
        $pdf .= "0000000000 65535 f \n";

        foreach (array_slice($offsets, 1) as $offset) {
            $pdf .= str_pad((string) $offset, 10, '0', STR_PAD_LEFT)." 00000 n \n";
        }

        return $pdf.'trailer << /Size '.(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n{$xrefPosition}\n%%EOF";
    }

    /**
     * @param  array<string, int>  $summary
     * @param  array<string, array<string, int>>  $reports
     */
    public function renderExecutiveReport(string $periodLabel, array $summary, array $reports, string $generatedAt): string
    {
        $pages = [[]];
        $page = 0;
        $cursorY = 790;

        $add = function (string $command) use (&$pages, &$page): void {
            $pages[$page][] = $command;
        };

        $newPage = function () use (&$pages, &$page, &$cursorY, $add): void {
            $page++;
            $pages[$page] = [];
            $cursorY = 790;
            $this->reportPageHeader($add, 'KNTSF Executive Report', 'Continued');
            $cursorY = 710;
        };

        $this->reportPageHeader($add, 'KNTSF Executive Report', $periodLabel);
        $this->text($add, 44, 710, 'Generated '.$generatedAt, 9, false, 'muted');
        $this->text($add, 44, 690, 'Executive summary', 16, true, 'ink');
        $this->text($add, 44, 674, 'A concise operational view of students, permits, payments, verification, elections, and permit request recovery.', 9, false, 'muted');

        $headline = [
            ['Students', $summary['total_students'] ?? 0],
            ['Active permits', $summary['active_permits'] ?? 0],
            ['Payments', $summary['successful_payments'] ?? 0],
            ['Verifications', $summary['verification_attempts'] ?? 0],
            ['Votes', $summary['election_votes'] ?? 0],
        ];

        foreach ($headline as $index => [$label, $value]) {
            $x = 44 + ($index * 101);
            $this->rect($add, $x, 610, 88, 48, 'card');
            $this->text($add, $x + 10, 640, $label, 8, true, 'muted');
            $this->text($add, $x + 10, 620, number_format((int) $value), 17, true, 'ink');
        }

        $cursorY = 570;
        $this->text($add, 44, $cursorY, 'Operational indicators', 14, true, 'ink');
        $cursorY -= 22;

        foreach ($reports as $group => $values) {
            if ($cursorY < 170) {
                $newPage();
            }

            $total = array_sum($values);
            $this->rect($add, 44, $cursorY - 14, 507, 24, 'band');
            $this->text($add, 56, $cursorY - 2, $this->title($group), 11, true, 'white');
            $this->text($add, 468, $cursorY - 2, 'Total '.number_format($total), 10, true, 'white');
            $cursorY -= 32;

            foreach ($values as $label => $value) {
                if ($cursorY < 90) {
                    $newPage();
                }

                $percentage = $total > 0 ? min(1, $value / $total) : 0;
                $this->text($add, 58, $cursorY, $this->title($label), 9, false, 'ink');
                $this->text($add, 460, $cursorY, number_format($value), 9, true, 'ink');
                $this->rect($add, 58, $cursorY - 10, 320, 4, 'track');
                $this->rect($add, 58, $cursorY - 10, max(2, 320 * $percentage), 4, 'accent');
                $cursorY -= 20;
            }

            $cursorY -= 10;
        }

        foreach ($pages as $index => &$commands) {
            $this->textTo($commands, 44, 32, 'KNTSF Core | Executive reporting', 8, false, 'muted');
            $this->textTo($commands, 510, 32, 'Page '.($index + 1), 8, true, 'muted');
        }

        return $this->document($pages);
    }

    /**
     * @param  array<int, string>  $lines
     */
    private function contentStream(array $lines): string
    {
        $commands = [
            'BT',
            '/F2 18 Tf',
            '50 790 Td',
            '22 TL',
        ];

        foreach ($lines as $index => $line) {
            if ($index === 1) {
                $commands[] = '/F1 10 Tf';
                $commands[] = '14 TL';
            }

            if ($index > 0) {
                $commands[] = 'T*';
            }

            $commands[] = '('.$this->escape($line).') Tj';
        }

        $commands[] = 'ET';

        return implode("\n", $commands);
    }

    /**
     * @param  array<int, array<int, string>>  $pages
     */
    private function document(array $pages): string
    {
        $objects = [
            1 => '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
            2 => '2 0 obj << /Type /Pages /Kids ['.implode(' ', array_map(fn (int $index): string => (5 + ($index * 2)).' 0 R', array_keys($pages))).'] /Count '.count($pages).' >> endobj',
            3 => '3 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
            4 => '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj',
        ];

        foreach ($pages as $index => $commands) {
            $pageObject = 5 + ($index * 2);
            $contentObject = 6 + ($index * 2);
            $content = implode("\n", $commands);

            $objects[$pageObject] = "{$pageObject} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {$contentObject} 0 R >> endobj";
            $objects[$contentObject] = "{$contentObject} 0 obj << /Length ".strlen($content)." >> stream\n{$content}\nendstream endobj";
        }

        ksort($objects);

        $pdf = "%PDF-1.4\n";
        $offsets = [0];

        foreach ($objects as $object) {
            $offsets[] = strlen($pdf);
            $pdf .= $object."\n";
        }

        $xrefPosition = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n";
        $pdf .= "0000000000 65535 f \n";

        foreach (array_slice($offsets, 1) as $offset) {
            $pdf .= str_pad((string) $offset, 10, '0', STR_PAD_LEFT)." 00000 n \n";
        }

        return $pdf.'trailer << /Size '.(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n{$xrefPosition}\n%%EOF";
    }

    /**
     * @param  callable(string): void  $add
     */
    private function reportPageHeader(callable $add, string $title, string $periodLabel): void
    {
        $this->rect($add, 0, 742, 595, 100, 'hero');
        $this->text($add, 44, 806, 'KNUTSFORD SRC', 9, true, 'gold');
        $this->text($add, 44, 778, $title, 24, true, 'white');
        $this->text($add, 44, 758, $periodLabel, 11, false, 'softWhite');
    }

    /**
     * @param  callable(string): void  $add
     */
    private function rect(callable $add, float $x, float $y, float $width, float $height, string $color): void
    {
        [$red, $green, $blue] = $this->rgb($color);
        $add('q');
        $add(sprintf('%.3F %.3F %.3F rg', $red, $green, $blue));
        $add(sprintf('%.2F %.2F %.2F %.2F re f', $x, $y, $width, $height));
        $add('Q');
    }

    /**
     * @param  callable(string): void  $add
     */
    private function text(callable $add, float $x, float $y, string $value, int $size = 10, bool $bold = false, string $color = 'ink'): void
    {
        $command = [];
        $this->textTo($command, $x, $y, $value, $size, $bold, $color);

        foreach ($command as $line) {
            $add($line);
        }
    }

    /**
     * @param  array<int, string>  $commands
     */
    private function textTo(array &$commands, float $x, float $y, string $value, int $size = 10, bool $bold = false, string $color = 'ink'): void
    {
        [$red, $green, $blue] = $this->rgb($color);
        $commands[] = 'BT';
        $commands[] = sprintf('%.3F %.3F %.3F rg', $red, $green, $blue);
        $commands[] = '/'.($bold ? 'F2' : 'F1').' '.$size.' Tf';
        $commands[] = sprintf('%.2F %.2F Td', $x, $y);
        $commands[] = '('.$this->escape($this->pdfText($value)).') Tj';
        $commands[] = 'ET';
    }

    /**
     * @return array{0: float, 1: float, 2: float}
     */
    private function rgb(string $color): array
    {
        return match ($color) {
            'hero', 'band' => [0.094, 0.129, 0.106],
            'card' => [0.953, 0.945, 0.918],
            'track' => [0.824, 0.804, 0.753],
            'accent', 'gold' => [0.792, 0.596, 0.282],
            'white' => [1, 1, 1],
            'softWhite' => [0.86, 0.86, 0.82],
            'muted' => [0.392, 0.365, 0.318],
            default => [0.09, 0.13, 0.11],
        };
    }

    private function title(string $value): string
    {
        return str($value)->replace('_', ' ')->title()->toString();
    }

    private function pdfText(string $value): string
    {
        return iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value;
    }

    private function escape(string $value): string
    {
        return str_replace(['\\', '(', ')'], ['\\\\', '\(', '\)'], $value);
    }
}
