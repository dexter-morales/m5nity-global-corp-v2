<?php

namespace App\Events;

use App\Models\MemberPin;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RegistrationReleased implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public MemberPin $memberPin;

    /**
     * Create a new event instance.
     */
    public function __construct(MemberPin $memberPin)
    {
        $this->memberPin = $memberPin;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): Channel
    {
        return new Channel('registrations');
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'registration.released';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'pin_id' => $this->memberPin->id,
            'trans_no' => $this->memberPin->trans_no,
            'status' => $this->memberPin->status,
            'member_id' => $this->memberPin->member_id,
            'updated_at' => $this->memberPin->updated_at->toISOString(),
        ];
    }
}
