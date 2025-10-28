# Quick Fix Testing Guide

## ✅ What Was Fixed

1. **Real-time updates for Releasing Orders page** - Orders now automatically appear when cashiers mark them as paid
2. **Real-time updates for Releasing Dashboard** - Live counter updates and order lists
3. **Better debugging** - Console logs show exactly what's happening with the WebSocket connection

## 🚀 Quick Test (2 Minutes)

### Step 1: Start Services

```bash
# Terminal 1 - Start Reverb
php artisan reverb:start

# Terminal 2 - Start dev server (if not already running)
npm run dev
```

### Step 2: Open Two Browser Windows

1. **Window 1:** Login as Cashier → Go to POS page
2. **Window 2:** Login as Cashier/Releasing → Go to Releasing → Orders page

### Step 3: Test Real-Time Updates

1. **In Window 2:**
    - Open browser console (F12)
    - Look for: `[useRealtimeOrders] Successfully subscribed to orders channel`
    - ✅ If you see this, the connection is working!

2. **In Window 1 (Cashier POS):**
    - Find an order in "For Payment" tab
    - Click "Mark as Paid"

3. **In Window 2 (Releasing Orders):**
    - **Watch the magic happen!** 🎉
    - Console will show: `[useRealtimeOrders] Order status changed`
    - The order will automatically appear in "For Release" tab
    - No page refresh needed!

## 🎯 Expected Console Output

When working correctly, you should see:

```
[useRealtimeOrders] Subscribing to orders channel...
[useRealtimeOrders] Successfully subscribed to orders channel
[useRealtimeOrders] Order status changed: {order_id: 123, ...}
[useRealtimeOrders] Reloading page with options: {...}
```

## ❌ Troubleshooting

### "Subscribing..." but no "Successfully subscribed"

**Fix:** Make sure Reverb is running (`php artisan reverb:start`)

### Events show in console but page doesn't update

**Fix:** Hard refresh the page (Ctrl+Shift+R)

### No console logs at all

**Fix:**

1. Check `.env` has:
    ```
    BROADCAST_CONNECTION=reverb
    ```
2. Restart `npm run dev`

## 📊 Test the Dashboard Too

1. Go to **Releasing Dashboard** page
2. Keep it open
3. In another window, mark an order as paid
4. Watch the "Pending Release" counter update automatically!

## 🧪 Test Event Page (Optional)

1. Go to `/superadmin/reverb-test`
2. Check connection status is "connected"
3. Click "Trigger Test Event"
4. Event should appear in the list instantly

## 📝 What Changed

- **Updated:** `resources/js/hooks/useRealtimeOrders.ts` - Now accepts page-specific prop names
- **Updated:** `resources/js/pages/Releasing/Orders.tsx` - Reloads correct props
- **Updated:** `resources/js/pages/Releasing/Dashboard.tsx` - Added real-time updates
- **Updated:** `resources/js/pages/Cashier/POS.tsx` - Reloads correct props

## ✨ That's It!

Your real-time updates should now work perfectly. Orders will automatically appear in the Releasing pages when cashiers mark them as paid, with no page refresh required.

For detailed debugging and advanced testing, see `REALTIME_UPDATES_FIX.md`.
