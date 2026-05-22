<?php

namespace App\Providers;

use App\Models\AcademicPeriod;
use App\Models\Announcement;
use App\Models\AppSetting;
use App\Models\AuditLog;
use App\Models\Document;
use App\Models\Election;
use App\Models\ElectionCandidate;
use App\Models\ElectionVote;
use App\Models\Event;
use App\Models\ExecutiveProfile;
use App\Models\NfcCard;
use App\Models\Payment;
use App\Models\Permit;
use App\Models\PermitRequest;
use App\Models\Student;
use App\Models\VerificationLog;
use App\Support\ApplicationCache;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRateLimiting();
        $this->configureCacheInvalidation();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Configure application-level rate limiters outside of Fortify.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('setup-password', function (Request $request) {
            return Limit::perMinute(6)->by($request->ip().'|'.$request->route('token'));
        });

        RateLimiter::for('verification', function (Request $request) {
            return Limit::perMinute(30)->by(($request->user()?->id ?? 'guest').'|'.$request->ip());
        });

        RateLimiter::for('sensitive-actions', function (Request $request) {
            return Limit::perMinute(20)->by(($request->user()?->id ?? 'guest').'|'.$request->ip());
        });

        RateLimiter::for('public-content', function (Request $request) {
            return Limit::perMinute(120)->by($request->ip());
        });

        RateLimiter::for('mobile-login', function (Request $request) {
            return Limit::perMinute(5)->by(mb_strtolower((string) $request->input('email')).'|'.$request->ip());
        });

        RateLimiter::for('mobile-verification', function (Request $request) {
            return Limit::perMinute(30)->by(($request->user()?->id ?? 'guest').'|'.$request->ip());
        });

        RateLimiter::for('mobile-sensitive-actions', function (Request $request) {
            return Limit::perMinute(20)->by(($request->user()?->id ?? 'guest').'|'.$request->ip());
        });

        RateLimiter::for('mobile-permit-requests', function (Request $request) {
            return Limit::perMinute(12)->by(($request->user()?->id ?? 'guest').'|'.$request->ip());
        });
    }

    /**
     * Keep short-lived operational caches coherent after writes.
     */
    protected function configureCacheInvalidation(): void
    {
        $flushDashboard = fn (): mixed => app(ApplicationCache::class)->flushDashboard();
        $flushPublicContent = fn (): mixed => app(ApplicationCache::class)->flushPublicContent();

        foreach ([Student::class, Permit::class, PermitRequest::class, NfcCard::class, Payment::class, VerificationLog::class, AuditLog::class, ElectionCandidate::class, ElectionVote::class] as $model) {
            $model::saved($flushDashboard);
            $model::deleted($flushDashboard);
        }

        AcademicPeriod::saved(fn () => app(ApplicationCache::class)->flushAcademicPeriods());
        AcademicPeriod::deleted(fn () => app(ApplicationCache::class)->flushAcademicPeriods());

        AppSetting::saved(fn () => app(ApplicationCache::class)->flushSettings());
        AppSetting::deleted(fn () => app(ApplicationCache::class)->flushSettings());

        foreach ([Announcement::class, Event::class, Document::class, ExecutiveProfile::class, Election::class] as $model) {
            $model::saved($flushPublicContent);
            $model::deleted($flushPublicContent);
        }
    }
}
