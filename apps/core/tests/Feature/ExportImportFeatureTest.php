<?php

use App\Exports\AdminTableExport;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\PermitSettingsSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia as Assert;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(PermitSettingsSeeder::class);
});

function exportImportUserWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('student table csv export respects search filters', function () {
    now()->setTestNow('2026-07-08 12:00:00');

    Student::factory()->create([
        'student_number' => '26100001',
        'name' => 'Ama Serwaa Mensah',
        'email' => 'ama.mensah@example.edu',
    ]);
    Student::factory()->create([
        'student_number' => '26100002',
        'name' => 'Kojo Appiah',
        'email' => 'kojo.appiah@example.edu',
    ]);

    Excel::fake();

    $this->actingAs(exportImportUserWithRole('admin'))
        ->get(route('admin-exports.show', [
            'resource' => 'students',
            'format' => 'csv',
            'search' => 'Ama',
        ]))
        ->assertOk();

    Excel::assertDownloaded('students-20260708-120000.csv', function (AdminTableExport $export): bool {
        $rows = $export->collection();

        return $rows->count() === 1
            && $rows->first()[1] === 'Ama Serwaa Mensah';
    });
});

test('restricted users cannot export admin tables', function () {
    $this->actingAs(exportImportUserWithRole('student'))
        ->get(route('admin-exports.show', ['resource' => 'students', 'format' => 'csv']))
        ->assertForbidden();
});

test('student import template downloads', function () {
    Excel::fake();

    $this->actingAs(exportImportUserWithRole('admin'))
        ->get(route('students.import.template'))
        ->assertOk();

    Excel::assertDownloaded('student-import-template.xlsx');
});

test('student import preview validates bad rows with row numbers', function () {
    $file = UploadedFile::fake()->createWithContent(
        'students.csv',
        "student_number,name,email,phone,course,level\n,No Number,not-an-email,+233,Computer Science,100\n",
    );

    $this->actingAs(exportImportUserWithRole('admin'))
        ->post(route('students.import.preview'), ['file' => $file])
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('students/import')
            ->where('preview.summary.failed', 1)
            ->where('preview.errors.0.row', 2));
});

test('student import commit creates and updates students', function () {
    $existing = Student::factory()->create([
        'student_number' => '26100010',
        'name' => 'Old Name',
        'email' => 'old@example.edu',
    ]);

    Cache::put('student-import:token-123', [
        [
            'student' => [
                'student_number' => '26100010',
                'name' => 'Akua Boateng',
                'email' => 'akua.boateng@example.edu',
                'phone' => '+233 20 000 0010',
                'course' => 'Computer Science',
                'level' => '300',
                'department' => 'Computing',
                'programme' => null,
                'gender' => 'Female',
                'campus' => null,
                'entry_year' => 2024,
                'status' => 'active',
            ],
        ],
        [
            'student' => [
                'student_number' => '26100011',
                'name' => 'Kwame Owusu',
                'email' => 'kwame.owusu@example.edu',
                'phone' => '+233 20 000 0011',
                'course' => 'Accounting',
                'level' => '200',
                'department' => null,
                'programme' => null,
                'gender' => null,
                'campus' => null,
                'entry_year' => null,
                'status' => null,
            ],
        ],
    ]);

    $this->actingAs(exportImportUserWithRole('admin'))
        ->post(route('students.import.store'), ['token' => 'token-123'])
        ->assertRedirect(route('students.import.show'));

    expect($existing->fresh()->name)->toBe('Akua Boateng');

    $this->assertDatabaseHas('students', [
        'student_number' => '26100011',
        'name' => 'Kwame Owusu',
        'email' => 'kwame.owusu@example.edu',
    ]);
});

test('restricted users cannot import students', function () {
    $this->actingAs(exportImportUserWithRole('student'))
        ->get(route('students.import.show'))
        ->assertForbidden();
});
