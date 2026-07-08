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

    private function escape(string $value): string
    {
        return str_replace(['\\', '(', ')'], ['\\\\', '\(', '\)'], $value);
    }
}
