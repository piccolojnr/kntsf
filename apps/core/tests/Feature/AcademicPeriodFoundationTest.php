<?php

use App\Models\AcademicPeriod;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
});

function academicPeriodUserWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('academic periods require permission', function () {
    $this->actingAs(academicPeriodUserWithRole('student'))
        ->get(route('academic-periods.index'))
        ->assertForbidden();
});

test('authorized user can create period', function () {
    $this->actingAs(academicPeriodUserWithRole('admin'))
        ->post(route('academic-periods.store'), [
            'name' => '2026/2027 First Semester',
            'academic_year' => '2026/2027',
            'semester' => 'First Semester',
            'starts_at' => '2026-09-01',
            'ends_at' => '2026-12-20',
        ])
        ->assertRedirect(route('academic-periods.index'));

    $this->assertDatabaseHas('academic_periods', [
        'name' => '2026/2027 First Semester',
        'academic_year' => '2026/2027',
        'semester' => 'First Semester',
    ]);
});

test('authorized user can update period', function () {
    $period = AcademicPeriod::factory()->create([
        'name' => 'Old Period',
    ]);

    $this->actingAs(academicPeriodUserWithRole('admin'))
        ->from(route('academic-periods.index'))
        ->patch(route('academic-periods.update', $period), [
            'name' => 'Updated Period',
            'academic_year' => '2026/2027',
            'semester' => 'Second Semester',
            'starts_at' => '2027-01-10',
            'ends_at' => '2027-05-01',
        ])
        ->assertRedirect(route('academic-periods.index'));

    $this->assertDatabaseHas('academic_periods', [
        'id' => $period->id,
        'name' => 'Updated Period',
    ]);
});

test('setting active period deactivates previous active period', function () {
    $previous = AcademicPeriod::factory()->active()->create();
    $next = AcademicPeriod::factory()->create();

    $this->actingAs(academicPeriodUserWithRole('admin'))
        ->from(route('academic-periods.index'))
        ->post(route('academic-periods.set-active', $next))
        ->assertRedirect(route('academic-periods.index'));

    expect($previous->refresh()->is_active)->toBeFalse()
        ->and($next->refresh()->is_active)->toBeTrue()
        ->and(AcademicPeriod::query()->where('is_active', true)->count())->toBe(1);
});

test('unauthorized user cannot manage period', function () {
    $period = AcademicPeriod::factory()->create();

    $this->actingAs(academicPeriodUserWithRole('staff'))
        ->from(route('academic-periods.index'))
        ->patch(route('academic-periods.update', $period), [
            'name' => 'Blocked Update',
            'academic_year' => '2026/2027',
        ])
        ->assertForbidden();
});

test('authorized user can view periods index', function () {
    $period = AcademicPeriod::factory()->create([
        'name' => 'Visible Period',
    ]);

    $this->actingAs(academicPeriodUserWithRole('staff'))
        ->get(route('academic-periods.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('academic-periods/index')
            ->where('periods.0.id', $period->id)
            ->where('can.manage', false));
});
