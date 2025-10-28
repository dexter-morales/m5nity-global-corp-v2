# Laravel Reverb Testing System

## 📋 Overview

A comprehensive testing dashboard to verify that Laravel Reverb real-time broadcasting is working correctly with detailed logging for troubleshooting.

## 🎯 Features

### ✅ Real-time Connection Monitoring

- Live connection status display
- Socket ID tracking
- Host/port configuration display
- Connection state monitoring

### ✅ Event Testing

- **Test Events**: Trigger custom broadcast events with unique identifiers
- **Order Events**: Test real order status change broadcasts
- **Event History**: View all received events in real-time

### ✅ Comprehensive Logging

- **Backend Logs**: Separate `storage/logs/reverb.log` file
- **Frontend Logs**: Console and UI-based event logging
- **Log Types**:
    - Connection events
    - Subscription events
    - Broadcast events
    - Error events

### ✅ Visual Indicators

- Color-coded connection status
- Real-time event counters
- Timestamp tracking
- JSON data preview

---

## 🚀 Setup

### 1. Ensure `.env` Configuration

```env
# Broadcasting
BROADCAST_CONNECTION=reverb

# Reverb Server
REVERB_APP_ID=178797
REVERB_APP_KEY=7z7sr5kvpwgeypmtnc2u
REVERB_APP_SECRET=vnjesrvbhi2seet19nam
REVERB_HOST="127.0.0.1"
REVERB_PORT=8080
REVERB_SCHEME=http

# Frontend (Vite)
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

### 2. Start Reverb Server

```bash
php artisan reverb:start
```

Expected output:

```
INFO  Reverb server started at ws://0.0.0.0:8080
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Access Test Dashboard

Navigate to: **http://127.0.0.1:8000/reverb-test**

(Available in sidebar under "Reverb Test" for authenticated users)

---

## 🧪 Testing Procedures

### Test 1: Connection Verification

**Expected Results:**

- ✅ Connection status shows "Connected"
- ✅ Socket ID is displayed
- ✅ Host shows `http://127.0.0.1:8080`
- ✅ Broadcaster shows "reverb"
- ✅ Logs show "Connected to Reverb successfully!"

**If Failed:**

- Check if Reverb server is running (`php artisan reverb:start`)
- Verify `.env` has correct VITE*REVERB*\* variables
- Restart `npm run dev` after `.env` changes
- Check browser console for WebSocket errors

---

### Test 2: Test Event Broadcasting

1. Click **"Trigger Test Event"** button
2. Wait 1-2 seconds

**Expected Results:**

- ✅ "Test event triggered successfully" message appears
- ✅ New event appears in "Recent Test Events" section
- ✅ Event contains:
    - Message text
    - Unique test_id
    - Random number
    - Server timestamp
- ✅ Event log shows "Received reverb.test event"
- ✅ Backend log records event in `storage/logs/reverb.log`

**Sample Event:**

```json
{
    "message": "Test Event at 10:30:45",
    "test_data": {
        "test_id": "test_673c4a5d...",
        "random_number": 7453,
        "server_time": "2025-10-26 10:30:45"
    },
    "timestamp": "2025-10-26T10:30:45+08:00"
}
```

---

### Test 3: Order Event Broadcasting

1. Select an order from "Recent Orders" list
2. Click the order button
3. Wait 1-2 seconds

**Expected Results:**

- ✅ "Order event broadcasted successfully" message appears
- ✅ New event appears in "Received Order Events"
- ✅ Event contains:
    - Order ID
    - Transaction number
    - Status transition
- ✅ Event log shows "Received order.status.changed event"

---

### Test 4: Real-world Order Updates

1. Open **two browser windows**:
    - Window 1: Reverb Test page
    - Window 2: Cashier POS page

2. In Window 2, perform an order action:
    - Move order to payment
    - Mark order as paid
    - etc.

3. Check Window 1

**Expected Results:**

- ✅ Event appears in Reverb Test dashboard immediately
- ✅ No page refresh needed
- ✅ Event data matches the order action

---

## 📊 Log Files

### Backend Log: `storage/logs/reverb.log`

**Location:** `E:\larave-starter-kit\my-app\storage\logs\reverb.log`

**Content Example:**

```log
[2025-10-26 10:30:45] local.INFO: Reverb Test Page Accessed {"user_id":1,"timestamp":"2025-10-26T10:30:45+08:00"}

[2025-10-26 10:31:12] local.INFO: ReverbTestEvent dispatched {"message":"Test Event at 10:31:12","timestamp":"2025-10-26T10:31:12+08:00","test_data":{"test_id":"test_673c4a60...","random_number":8921,"server_time":"2025-10-26 10:31:12"}}

[2025-10-26 10:32:05] local.INFO: Manual order event triggered {"order_id":8,"old_status":"for_release","new_status":"for_release","user_id":1}
```

**View Last 50 Lines:**

```bash
tail -50 storage/logs/reverb.log
```

**Watch in Real-time:**

```bash
tail -f storage/logs/reverb.log
```

---

### Frontend Logs: Browser Console

**Open Browser Console:**

- Chrome/Edge: `F12` → Console tab
- Firefox: `Ctrl+Shift+K`

**Expected Console Output:**

```
[Reverb CONNECTION] Attempting to connect to Reverb... {host: '127.0.0.1', port: 8080, ...}
[Reverb CONNECTION] Connected to Reverb successfully! {socket_id: '123.456'}
[Reverb SUBSCRIPTION] Subscribed to reverb-test channel
[Reverb SUBSCRIPTION] Subscribed to orders channel
[Reverb EVENT] Received reverb.test event {message: '...', test_data: {...}}
[Reverb EVENT] Received order.status.changed event {order_id: 8, ...}
```

---

## 🐛 Troubleshooting

### Issue: "Disconnected" Status

**Possible Causes:**

1. Reverb server not running
2. Wrong port/host in .env
3. Firewall blocking WebSocket

**Solutions:**

```bash
# 1. Check if Reverb is running
php artisan reverb:start

# 2. Clear config cache
php artisan config:clear

# 3. Restart dev server
npm run dev

# 4. Check WebSocket in Network tab (Chrome DevTools)
# Should show: ws://127.0.0.1:8080
```

---

### Issue: Events Not Received

**Possible Causes:**

1. `BROADCAST_CONNECTION` not set to `reverb`
2. Event not implementing `ShouldBroadcast`
3. Channel subscription failed

**Solutions:**

**Check .env:**

```env
BROADCAST_CONNECTION=reverb  # Must be 'reverb', not 'null'
```

**Check Event Class:**

```php
class YourEvent implements ShouldBroadcast // ✅ Must implement this
{
    public function broadcastOn(): Channel
    {
        return new Channel('your-channel'); // ✅ Correct channel
    }
}
```

**Check Logs:**

```bash
tail -f storage/logs/reverb.log
```

---

### Issue: VITE Variables Not Loading

**Symptom:** Frontend shows `undefined` for host/port

**Solution:**

1. **Add VITE\_ prefix** to all frontend variables:

```env
VITE_REVERB_APP_KEY="..."
VITE_REVERB_HOST="127.0.0.1"
VITE_REVERB_PORT=8080
```

2. **Restart dev server** (required for .env changes):

```bash
# Stop npm (Ctrl+C)
npm run dev
```

---

### Issue: "Failed to Subscribe" Errors

**Possible Causes:**

1. Channel doesn't exist
2. Incorrect channel name
3. Private channel without authentication

**Check Channel Names:**

```typescript
// Frontend
Echo.channel('orders')  // ✅ Public channel
Echo.private('user.1')  // ❌ Requires auth

// Backend Event
public function broadcastOn(): Channel
{
    return new Channel('orders'); // ✅ Must match frontend
}
```

---

## 📈 Performance Metrics

### What to Monitor:

1. **Connection Time**: Should be < 1 second
2. **Event Latency**: Should be < 100ms
3. **Memory Usage**: Check `php artisan reverb:start` output
4. **Concurrent Connections**: Monitor for production

### Stress Testing:

```bash
# Open multiple browser tabs with Reverb Test page
# All should maintain connection and receive events
```

---

## ✅ Success Criteria

Your Reverb setup is **100% working** if:

- ✅ Connection status is "Connected"
- ✅ Socket ID is displayed
- ✅ Test events are received within 1 second
- ✅ Order events are received in real-time
- ✅ Backend logs show all events
- ✅ No errors in browser console
- ✅ Multiple tabs can connect simultaneously
- ✅ Real POS updates appear in Releasing page immediately

---

## 🎓 Understanding the Code

### Backend Event Broadcasting

```php
// app/Events/OrderStatusChanged.php
broadcast(new OrderStatusChanged($order, $oldStatus, $newStatus));
// ↓
// Reverb server receives event
// ↓
// Broadcasts to all connected clients on 'orders' channel
```

### Frontend Event Listening

```typescript
// resources/js/hooks/useRealtimeOrders.ts
Echo.channel('orders').listen('.order.status.changed', (event) => {
    // Event received!
    router.reload({ only: ['orders'] }); // Update UI
});
```

### Log Flow

```
User Action (Click button)
    ↓
Controller logs to reverb.log
    ↓
broadcast(new Event()) called
    ↓
Reverb server receives event
    ↓
Frontend Echo receives event
    ↓
Frontend logs to console + UI
    ↓
UI updates (via Inertia reload)
```

---

## 🚀 Next Steps

Once Reverb is confirmed working:

1. **Remove Test Page** (optional, for production):
    - Comment out routes in `routes/superadmin.php`
    - Remove "Reverb Test" link from sidebar

2. **Add More Events**:
    - Registration events
    - Inventory updates
    - Notifications

3. **Monitor Production**:
    - Set up log rotation for `reverb.log`
    - Monitor WebSocket connections
    - Consider using `supervisor` to keep Reverb running

4. **Optimize**:
    - Use Redis for scaling
    - Configure SSL for production
    - Set up monitoring alerts

---

## 📞 Support

If you're still experiencing issues:

1. Check `storage/logs/laravel.log` for errors
2. Verify `.env` matches this guide exactly
3. Test with browser's private/incognito mode
4. Clear browser cache and localStorage
5. Check firewall/antivirus settings

---

## 🎉 Congratulations!

You now have a fully functional real-time broadcasting system with comprehensive testing and logging capabilities!

**Test Page URL:** http://127.0.0.1:8000/reverb-test
**Backend Logs:** `storage/logs/reverb.log`
**Frontend Logs:** Browser DevTools → Console
