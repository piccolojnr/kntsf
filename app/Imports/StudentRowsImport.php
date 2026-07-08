<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StudentRowsImport implements ToCollection, WithHeadingRow
{
    private Collection $rows;

    public function __construct()
    {
        $this->rows = collect();
    }

    public function collection(Collection $rows): void
    {
        $this->rows = $rows;
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function rows(): Collection
    {
        return $this->rows;
    }
}
