<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use Psr\Log\LoggerInterface;

abstract class Controller
{
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
     */
    protected function writeControllerLog(string $logFile, string $level, string $message, array $context = []): void
    {
        $this->controllerLogger($logFile)->log($level, $message, $context);
    }
}
