<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Psr\Log\LoggerInterface;

abstract class Controller
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Build (or reuse) a logger instance that writes to a controller-specific log file.
     */
    protected function controllerLogger(string $logFile): LoggerInterface
    {
        return Log::build([
            'driver' => 'single',
            'path' => storage_path('logs/'.$logFile),
        ]);
    }

    /**
     * Convenience helper to write a message to the controller-specific log.
     * Automatically filters sensitive data from context.
     */
    protected function writeControllerLog(string $logFile, string $level, string $message, array $context = []): void
    {
        // Filter sensitive data from logs
        $filtered = Arr::except($context, [
            'password',
            'password_confirmation',
            'token',
            'two_factor_secret',
            'two_factor_recovery_codes',
            'remember_token',
        ]);

        $this->controllerLogger($logFile)->log($level, $message, $filtered);
    }
}
