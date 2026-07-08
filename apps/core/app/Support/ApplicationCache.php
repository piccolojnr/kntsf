<?php

namespace App\Support;

use Closure;
use Illuminate\Support\Facades\Cache;

class ApplicationCache
{
    public const DashboardCounts = 'dashboard:counts';

    public const DashboardWarnings = 'dashboard:warnings';

    public const DashboardContentReadiness = 'dashboard:content-readiness';

    public const DashboardReports = 'dashboard:reports';

    public const PublicHome = 'public:home';

    public const PublicAnnouncements = 'public:announcements';

    public const PublicEvents = 'public:events';

    public const PublicDocuments = 'public:documents';

    public const PublicExecutives = 'public:executives';

    public const ActiveAcademicPeriod = 'academic-periods:active';

    public const PermitSettings = 'settings:permits';

    public const ContentSettings = 'settings:content';

    public const PlatformSettings = 'settings:platform';

    public function remember(string $scope, string $key, int $seconds, Closure $callback): mixed
    {
        return Cache::remember($this->key($scope, $key), $seconds, $callback);
    }

    public function forget(string $scope, string $key = 'default'): void
    {
        Cache::forget($this->key($scope, $key));
    }

    public function bump(string $scope): void
    {
        $key = $this->versionKey($scope);

        Cache::add($key, 1);
        Cache::increment($key);
    }

    public function flushDashboard(): void
    {
        foreach ([self::DashboardCounts, self::DashboardWarnings, self::DashboardContentReadiness, self::DashboardReports] as $scope) {
            $this->forget($scope);
            $this->bump($scope);
        }
    }

    public function flushSettings(): void
    {
        $this->forget(self::PermitSettings);
        $this->forget(self::ContentSettings);
        $this->forget(self::PlatformSettings);
        $this->flushDashboard();
        $this->bump(self::PublicHome);
    }

    public function flushAcademicPeriods(): void
    {
        $this->forget(self::ActiveAcademicPeriod);
        $this->forget(self::ActiveAcademicPeriod, 'id');
        $this->flushDashboard();
    }

    public function flushPublicContent(): void
    {
        foreach ([self::PublicHome, self::PublicAnnouncements, self::PublicEvents, self::PublicDocuments, self::PublicExecutives] as $scope) {
            $this->bump($scope);
        }

        $this->flushDashboard();
    }

    private function key(string $scope, string $key): string
    {
        return $scope.':v'.$this->version($scope).':'.$key;
    }

    private function version(string $scope): int
    {
        return (int) Cache::get($this->versionKey($scope), 1);
    }

    private function versionKey(string $scope): string
    {
        return $scope.':version';
    }
}
