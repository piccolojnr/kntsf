<?php

use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;

test('dashboard route names resolve under the dashboard prefix', function () {
    expect(route('dashboard', absolute: false))->toBe('/dashboard')
        ->and(route('students.index', absolute: false))->toBe('/dashboard/students')
        ->and(route('events.index', absolute: false))->toBe('/dashboard/events')
        ->and(route('documents.index', absolute: false))->toBe('/dashboard/documents')
        ->and(route('reports.index', absolute: false))->toBe('/dashboard/reports')
        ->and(route('profile.edit', absolute: false))->toBe('/dashboard/settings/profile');
});

test('old dashboard page urls redirect to the dashboard prefix', function () {
    $this->get('/students')->assertRedirect('/dashboard/students');
    $this->get('/events/create')->assertRedirect('/dashboard/events/create');
    $this->get('/documents/annual-src-budget')->assertRedirect('/dashboard/documents/annual-src-budget');
    $this->get('/settings/profile')->assertRedirect('/dashboard/settings/profile');
});

test('public not found pages use the public error surface', function () {
    $this->get('/missing-public-page')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/not-found')
            ->where('status', 404));
});

test('dashboard not found pages use the dashboard error surface', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get('/dashboard/missing-dashboard-page')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page
            ->component('errors/dashboard-not-found')
            ->where('status', 404)
            ->where('auth.user.id', $user->id)
            ->where('sidebarOpen', true));
});

test('guests are redirected before the dashboard not found page is rendered', function () {
    $this->get('/dashboard/missing-dashboard-page')->assertRedirect(route('login'));
});

test('server errors on public routes use the public error surface', function () {
    Route::middleware('web')->get('/test-public-server-error', fn () => abort(500));

    $this->get('/test-public-server-error')
        ->assertStatus(500)
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/error')
            ->where('status', 500));
});

test('server errors on dashboard routes use the dashboard error surface', function () {
    Route::middleware(['web', 'auth'])->get('/dashboard/test-server-error', fn () => abort(500));

    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/dashboard/test-server-error')
        ->assertStatus(500)
        ->assertInertia(fn (Assert $page) => $page
            ->component('errors/dashboard-error')
            ->where('status', 500));
});
