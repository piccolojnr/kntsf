<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function database(): JsonResponse
    {
        try {
            DB::select('select 1');
        } catch (\Throwable) {
            return response()->json([
                'status' => 'unhealthy',
                'service' => 'database',
            ], 503);
        }

        return response()->json([
            'status' => 'ok',
            'service' => 'database',
        ]);
    }

    public function queue(): JsonResponse
    {
        $connection = config('queue.default');
        $configured = is_string($connection) && $connection !== '';

        return response()->json([
            'status' => $configured ? 'ok' : 'unhealthy',
            'service' => 'queue',
            'connection' => $configured ? $connection : null,
        ], $configured ? 200 : 503);
    }
}
