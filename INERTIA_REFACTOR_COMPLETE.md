# Inertia.js Refactoring - Complete ✅

## Problem

The POS system was using **axios** for POST requests instead of **Inertia.js** router methods, which bypassed Inertia's built-in features and benefits.

## Why This Was Wrong

Using axios directly in an Inertia.js application causes several issues:

1. **No automatic CSRF token handling** - Have to manage manually
2. **Breaks SPA behavior** - Doesn't update Inertia's page state properly
3. **No loading states** - Inertia provides automatic loading indicators
4. **Manual error handling** - Have to write try-catch blocks everywhere
5. **No state preservation** - Scroll position, form state lost
6. **History management issues** - Back/forward buttons behave incorrectly
7. **More verbose code** - More boilerplate for error handling

## What Was Changed

### POS.tsx Refactoring

#### Before (Using axios) ❌

```typescript
const moveToPayment = async (orderId: number) => {
    try {
        await axios.post(`/cashier/orders/${orderId}/move-to-payment`);
        notifySuccess('Order moved to payment queue');
        router.reload({ only: ['orders'] });
    } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        notifyError(error.response?.data?.message || 'Failed to move order');
    }
};
```

#### After (Using Inertia router) ✅

```typescript
const moveToPayment = (orderId: number) => {
    router.post(
        `/cashier/orders/${orderId}/move-to-payment`,
        {},
        {
            preserveScroll: true,
            onSuccess: () => {
                notifySuccess('Order moved to payment queue');
            },
            onError: (errors) => {
                notifyError(errors.message || 'Failed to move order');
            },
        },
    );
};
```

### Benefits of Inertia Approach

| Feature             | Axios Approach        | Inertia Router Approach              |
| ------------------- | --------------------- | ------------------------------------ |
| **CSRF Token**      | ❌ Manual handling    | ✅ Automatic                         |
| **Code Length**     | ❌ 9-12 lines         | ✅ 4-6 lines                         |
| **Error Handling**  | ❌ Try-catch required | ✅ Built-in `onError`                |
| **Loading State**   | ❌ Manual             | ✅ Automatic via `router.processing` |
| **Scroll Position** | ❌ Lost               | ✅ Preserved with `preserveScroll`   |
| **State Updates**   | ❌ Manual reload      | ✅ Automatic partial reloads         |
| **Type Safety**     | ❌ Generic Response   | ✅ Better TypeScript support         |

### Functions Refactored

1. ✅ `moveToPayment()` - Move order to payment queue
2. ✅ `markAsPaid()` - Mark order as paid
3. ✅ `markAsReleased()` - Release order to member
4. ✅ `cancelOrder()` - Cancel an order

### Functions That Still Use axios (And Why)

These are **legitimate uses** of axios because they're fetching data for client-side manipulation, not navigating:

1. **`fetchOrderForPrint()`** - Fetches order JSON for print dialog
    - Reason: Not a navigation, just fetching data to display in modal
2. **`loadMoreOrders()`** - Infinite scroll pagination
    - Reason: Loading additional data without page navigation
    - Updates local state, doesn't need full Inertia page response

## Inertia Router Methods

### Common Methods

```typescript
// POST request
router.post(url, data, options)

// GET request (with query params)
router.get(url, data, options)

// PUT/PATCH request
router.put(url, data, options)
router.patch(url, data, options)

// DELETE request
router.delete(url, options)

// Visit (any method)
router.visit(url, {
    method: 'post',
    data: { ... },
    ...options
})

// Reload current page
router.reload({ only: ['prop1', 'prop2'] })
```

### Common Options

```typescript
{
    // Preserve scroll position
    preserveScroll: true,

    // Keep current page state
    preserveState: true,

    // Only reload specific props
    only: ['orders', 'stats'],

    // Callbacks
    onSuccess: () => { ... },
    onError: (errors) => { ... },
    onFinish: () => { ... },
    onStart: () => { ... },

    // Replace history instead of push
    replace: true,
}
```

## Error Handling with Inertia

### Before (axios)

```typescript
try {
    await axios.post('/endpoint', data);
    // handle success
} catch (err) {
    const error = err as { response?: { data?: { message?: string } } };
    notifyError(error.response?.data?.message || 'Error');
}
```

### After (Inertia)

```typescript
router.post('/endpoint', data, {
    onSuccess: () => {
        notifySuccess('Success!');
    },
    onError: (errors) => {
        // errors is already properly typed
        notifyError(errors.message || 'Error');
    },
});
```

## When to Use Axios vs Inertia

### Use Inertia Router When:

✅ Making form submissions  
✅ Creating/updating/deleting resources  
✅ Any action that changes server state  
✅ Navigation between pages  
✅ Want automatic CSRF, loading states, error handling

### Use axios When:

✅ Fetching data for client-side use (dropdowns, autocomplete)  
✅ Infinite scroll / load more  
✅ Real-time updates (polling)  
✅ File downloads  
✅ External API calls  
✅ Non-navigation data fetching

## Testing

After refactoring, all operations work correctly:

- ✅ Move to payment
- ✅ Mark as paid
- ✅ Mark as released
- ✅ Cancel order
- ✅ Scroll position preserved
- ✅ Proper error messages
- ✅ Success notifications

## Documentation References

- [Inertia.js Manual Visits](https://inertiajs.com/manual-visits)
- [Inertia.js Forms](https://inertiajs.com/forms)
- [Inertia.js Error Handling](https://inertiajs.com/error-handling)

---

**Status**: ✅ Refactoring complete! The system now properly uses Inertia.js for all state-changing operations.

The 405 error (GET instead of POST) is now resolved because Inertia properly handles the request method.
