<?php

namespace App\Events;

use App\Models\Purchase;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Purchase $order;

    public string $oldStatus;

    public string $newStatus;

    /**
     * Create a new event instance.
     */
    public function __construct(Purchase $order, string $oldStatus, string $newStatus)
    {
        $this->order = $order;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): Channel
    {
        return new Channel('orders');
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'order.status.changed';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'trans_no' => $this->order->trans_no,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'buyer_account_id' => $this->order->buyer_account_id,
            'total_amount' => $this->order->total_amount,
            'payment_method' => $this->order->payment_method,
            'cashier_id' => $this->order->cashier_id,
            'updated_at' => $this->order->updated_at->toISOString(),
        ];
    }
}
