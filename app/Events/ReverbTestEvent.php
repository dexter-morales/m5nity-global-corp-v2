<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ReverbTestEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $message;

    public array $testData;

    public string $timestamp;

    public function __construct(string $message = 'Reverb Test Event')
    {
        $this->message = $message;
        $this->timestamp = now()->toIso8601String();
        $this->testData = [
            'test_id' => uniqid('test_'),
            'random_number' => rand(1000, 9999),
            'server_time' => now()->format('Y-m-d H:i:s'),
        ];

        Log::channel('reverb')->info('ReverbTestEvent dispatched', [
            'message' => $this->message,
            'timestamp' => $this->timestamp,
            'test_data' => $this->testData,
        ]);
    }

    public function broadcastOn(): Channel
    {
        return new Channel('reverb-test');
    }

    public function broadcastWith(): array
    {
        return [
            'message' => $this->message,
            'test_data' => $this->testData,
            'timestamp' => $this->timestamp,
        ];
    }

    public function broadcastAs(): string
    {
        return 'reverb.test';
    }
}
