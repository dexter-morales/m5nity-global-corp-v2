# Real-Time Updates Fix Documentation

## Issues Fixed

### Issue 1: Releasing Orders Page Not Updating in Real-Time

**Problem:** When a cashier moved an order from "For Payment" to "Releasing", the releasing page did not automatically update to show the new order.

**Root Cause:** The `useRealtimeOrders` hook was trying to reload page props with the key `orders`, but the Releasing Orders page uses different prop names: `for_release_orders` and `completed_orders`. This mismatch prevented Inertia from reloading the correct data.

**Solution:**

- Updated `useRealtimeOrders` hook to accept an optional parameter for specifying which props to reload
- Added proper prop names to each page that uses the hook
- Added comprehensive logging for debugging

### Issue 2: Test Events Not Triggering Notifications

**Problem:** The test event button in the Reverb Test page didn't show automatic trigger notifications.

**Root Cause:** The event listeners were set up correctly, but needed better logging and verification.

**Solution:**

- Enhanced the `useRealtimeOrders` hook with better console logging
- Added subscription and error handlers for better debugging

## Changes Made

### 1. Updated `useRealtimeOrders` Hook

**File:** `resources/js/hooks/useRealtimeOrders.ts`

- Added optional `propsToReload` parameter
- Added comprehensive console logging for debugging
- Added subscription success/error handlers
- Now supports page-specific prop reloading

```typescript
export function useRealtimeOrders(propsToReload?: string[]);
```

### 2. Updated Releasing Orders Page

**File:** `resources/js/pages/Releasing/Orders.tsx`

- Now specifies exact props to reload: `['for_release_orders', 'completed_orders']`

### 3. Updated Releasing Dashboard Page

**File:** `resources/js/pages/Releasing/Dashboard.tsx`

- Added `useRealtimeOrders` hook
- Specifies props to reload: `['orders_for_release', 'pending_release_count', 'released_today']`
- Fixed TypeScript interface issue

### 4. Updated Cashier POS Page

**File:** `resources/js/pages/Cashier/POS.tsx`

- Now specifies exact props to reload: `['orders']`

## Testing the Fix

### Prerequisites

1. Make sure Laravel Reverb is running:

    ```bash
    php artisan reverb:start
    ```

2. Make sure the development server is running:

    ```bash
    npm run dev
    ```

3. Open the browser console (F12) to see the debug logs

### Test 1: Real-Time Order Updates (Primary Issue)

1. **Open Two Browser Windows:**
    - Window 1: Cashier POS page (logged in as a cashier)
    - Window 2: Releasing Orders page (same or different cashier account)

2. **In Window 2 (Releasing Orders):**
    - Keep the browser console open (F12 → Console tab)
    - You should see: `[useRealtimeOrders] Subscribing to orders channel...`
    - You should see: `[useRealtimeOrders] Successfully subscribed to orders channel`

3. **In Window 1 (Cashier POS):**
    - Create a new order or find an existing order in "For Payment" status
    - Click "Mark as Paid" on the order
    - This moves the order to "For Release" status

4. **Expected Results in Window 2:**
    - Console should show: `[useRealtimeOrders] Order status changed: {...}`
    - Console should show: `[useRealtimeOrders] Reloading page with options: {...}`
    - The "For Release" tab count should increase by 1
    - The new order should appear in the "For Release" list
    - **No page refresh required** - updates happen automatically

### Test 2: Releasing Dashboard Real-Time Updates

1. **Open Two Browser Windows:**
    - Window 1: Cashier POS page
    - Window 2: Releasing Dashboard page

2. **In Window 2 (Releasing Dashboard):**
    - Note the "Pending Release" count
    - Keep the browser console open

3. **In Window 1 (Cashier POS):**
    - Mark an order as paid (moves to "For Release")

4. **Expected Results in Window 2:**
    - "Pending Release" count should increase
    - New order should appear in the "Orders Ready for Release" list
    - Updates happen automatically without page refresh

### Test 3: Reverse Flow - Releasing Orders

1. **Open Two Browser Windows:**
    - Window 1: Releasing Orders page
    - Window 2: Cashier POS page (viewing "For Release" tab)

2. **In Window 1 (Releasing Orders):**
    - Click "Release Order" on any order
    - Confirm the release

3. **Expected Results in Window 2:**
    - "For Release" tab count should decrease
    - Order should move to "Completed" tab
    - Updates happen automatically

### Test 4: Test Event Broadcasting

1. **Navigate to Reverb Test Page:**
    - URL: `/superadmin/reverb-test` (requires superadmin access)

2. **Check Connection Status:**
    - Status should show "connected"
    - Socket ID should be displayed
    - Host should show `http://localhost:8080` or your configured Reverb host

3. **Trigger Test Event:**
    - Click "Trigger Test Event" button
    - Should see success message
    - Event should appear in "Recent Test Events (1)" section
    - Console should show the received event

4. **Trigger Order Event:**
    - Click one of the recent orders in the "Recent Orders" list
    - Event should appear in "Received Order Events (1)" section
    - Console should show the received event

## Debug Console Logs

When everything is working correctly, you should see these logs in the browser console:

### On Page Load (Releasing Orders/Dashboard):

```
[useRealtimeOrders] Subscribing to orders channel...
[useRealtimeOrders] Successfully subscribed to orders channel
```

### When Order Status Changes:

```
[useRealtimeOrders] Order status changed: {
  order_id: 123,
  trans_no: "T-25PH00000012-xxxxx",
  old_status: "for_payment",
  new_status: "for_release",
  ...
}
[useRealtimeOrders] Reloading page with options: {
  preserveScroll: true,
  preserveState: true,
  only: ["for_release_orders", "completed_orders"]
}
```

### On Page Unmount:

```
[useRealtimeOrders] Unsubscribing from orders channel
```

## Troubleshooting

### Issue: Console shows "Subscribing" but not "Successfully subscribed"

**Solution:**

1. Check if Reverb server is running: `php artisan reverb:start`
2. Verify `.env` has correct configuration:
    ```env
    BROADCAST_CONNECTION=reverb
    VITE_REVERB_APP_KEY=your-app-key
    VITE_REVERB_HOST=127.0.0.1
    VITE_REVERB_PORT=8080
    VITE_REVERB_SCHEME=http
    ```
3. Restart `npm run dev` after changing `.env`

### Issue: Events are received but page doesn't update

**Solution:**

1. Check console for the "Reloading page with options" log
2. Verify the controller is returning the correct prop names
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: Multiple subscriptions or duplicate events

**Solution:**

1. This is normal if you navigate back to the page multiple times
2. The cleanup function will unsubscribe when the component unmounts
3. Refresh the page to reset

### Issue: Connection shows as "connected" but no events received

**Solution:**

1. Check Reverb server logs: `tail -f storage/logs/reverb.log`
2. Verify the event is actually being broadcast from the backend
3. Check if the event name matches: `.order.status.changed`
4. Verify the channel name matches: `orders`

## Backend Event Broadcasting

The backend broadcasts the `OrderStatusChanged` event in these scenarios:

1. **Order marked as paid** (`/cashier/orders/{id}/mark-as-paid`)
    - Old status: `for_payment` → New status: `for_release`

2. **Order released** (`/cashier/orders/{id}/mark-as-released`)
    - Old status: `for_release` → New status: `completed`

3. **Order cancelled** (`/cashier/orders/{id}/cancel`)
    - Old status: any → New status: `cancelled`

The event is broadcast on channel `orders` with event name `order.status.changed`.

## Performance Considerations

- The hook uses `preserveScroll: true` and `preserveState: true` to maintain user position and state
- Only the specified props are reloaded (using Inertia's `only` parameter), not the entire page
- The cleanup function ensures no memory leaks when components unmount
- Multiple pages can listen to the same channel simultaneously

## Next Steps

If you need to add real-time updates to other pages:

1. Import the hook: `import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';`
2. Call it in your component with the correct prop names:
    ```typescript
    useRealtimeOrders(['prop1', 'prop2']);
    ```
3. Make sure your controller returns those exact prop names in the Inertia response

## Summary

✅ **Fixed:** Releasing Orders page now updates in real-time when orders are marked as paid  
✅ **Fixed:** Releasing Dashboard shows live updates of pending releases  
✅ **Enhanced:** Better debugging with comprehensive console logging  
✅ **Improved:** Flexible hook that works with different page prop structures

The real-time broadcasting system is now fully functional and properly integrated across all relevant pages.
