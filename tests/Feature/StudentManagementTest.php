<?php

use App\Models\Student;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
});

function userWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('authorized user can view students index', function () {
    $student = Student::factory()->create([
        'student_number' => 'STU-10001',
        'name' => 'Ada Lovelace',
    ]);

    $this->actingAs(userWithRole('admin'))
        ->get(route('students.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('students/index')
            ->where('students.data.0.id', $student->id)
            ->where('students.data.0.student_number', 'STU-10001')
            ->where('can.create', true));
});

test('unauthorized user cannot view students index', function () {
    $this->actingAs(userWithRole('student'))
        ->get(route('students.index'))
        ->assertForbidden();
});

test('authorized user can create student', function () {
    $user = userWithRole('admin');

    $this->actingAs($user)
        ->post(route('students.store'), [
            'student_number' => 'STU-10002',
            'name' => 'Grace Hopper',
            'email' => 'grace@example.com',
            'phone' => '555-0102',
            'course' => 'Computer Science',
            'level' => '300',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('students', [
        'student_number' => 'STU-10002',
        'name' => 'Grace Hopper',
        'created_by_id' => $user->id,
        'updated_by_id' => $user->id,
    ]);
});

test('duplicate student number is rejected', function () {
    Student::factory()->create([
        'student_number' => 'STU-10003',
    ]);

    $this->actingAs(userWithRole('admin'))
        ->from(route('students.create'))
        ->post(route('students.store'), [
            'student_number' => 'STU-10003',
            'name' => 'Duplicate Student',
        ])
        ->assertRedirect(route('students.create'))
        ->assertSessionHasErrors('student_number');
});

test('authorized user can update student', function () {
    $user = userWithRole('admin');
    $student = Student::factory()->create([
        'student_number' => 'STU-10004',
        'name' => 'Old Name',
    ]);

    $this->actingAs($user)
        ->put(route('students.update', $student), [
            'student_number' => 'STU-10004',
            'name' => 'New Name',
            'email' => 'new@example.com',
            'phone' => '555-0104',
            'course' => 'Information Technology',
            'level' => '400',
        ])
        ->assertRedirect(route('students.show', $student));

    $this->assertDatabaseHas('students', [
        'id' => $student->id,
        'name' => 'New Name',
        'updated_by_id' => $user->id,
    ]);
});

test('authorized user can soft delete student', function () {
    $student = Student::factory()->create();

    $this->actingAs(userWithRole('admin'))
        ->delete(route('students.destroy', $student))
        ->assertRedirect(route('students.index'));

    $this->assertSoftDeleted('students', [
        'id' => $student->id,
    ]);
});

test('deleted student is not visible in normal index', function () {
    $deletedStudent = Student::factory()->create([
        'student_number' => 'STU-DELETED',
    ]);
    $visibleStudent = Student::factory()->create([
        'student_number' => 'STU-VISIBLE',
    ]);

    $deletedStudent->delete();

    $this->actingAs(userWithRole('admin'))
        ->get(route('students.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('students.data', fn ($students) => collect($students)
                ->pluck('student_number')
                ->all() === [$visibleStudent->student_number]));
});
