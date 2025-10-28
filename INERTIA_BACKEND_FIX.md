# Inertia Backend Response Fix ✅

## The Problem

When using Inertia's `router.post()` on the frontend, the backend was returning **JSON responses** instead of **redirect responses**, causing this error:

```
All Inertia requests must receive a valid Inertia response,
however a plain JSON response was received.
```

## Why This Happens

Inertia.js is a **hybrid approach** between traditional server-rendered apps and SPAs:

- Frontend: Makes XHR requests with `X-Inertia` header
- Backend: Must respond with either:
    - ✅ **Redirect** (`redirect()->back()`)
    - ✅ **Inertia page** (`Inertia::render()`)
    - ❌ **NOT plain JSON** (`response()->json()`)

## The Fix

### Before (Wrong - JSON Response) ❌

```php
public function markAsPaid(Request $request, $id)
{
    try {
        $order = Purchase::findOrFail($id);
        $order->update(['status' => 'for_release']);

        return response()->json([
            'message' => 'Order marked as paid',
            'order' => $order
        ]); // ❌ Wrong for Inertia!

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed'
        ], 500); // ❌ Wrong for Inertia!
    }
}
```

### After (Correct - Redirect Response) ✅

```php
public function markAsPaid(Request $request, $id)
{
    try {
        $order = Purchase::findOrFail($id);
        $order->update(['status' => 'for_release']);

        return redirect()->back(); // ✅ Correct for Inertia!

    } catch (\Exception $e) {
        return redirect()->back()->withErrors([
            'message' => 'Failed'
        ]); // ✅ Correct for Inertia!
    }
}
```

## What Changed in OrdersController.php

### Methods Fixed

1. ✅ `moveToPayment()` - Returns `redirect()->back()`
2. ✅ `markAsPaid()` - Returns `redirect()->back()`
3. ✅ `markAsReleased()` - Returns `redirect()->back()`
4. ✅ `cancel()` - Returns `redirect()->back()`

### Response Patterns

#### Success Response

```php
// Before
return response()->json(['message' => 'Success', 'order' => $order]);

// After
return redirect()->back();
```

#### Error Response (Authorization/Validation)

```php
// Before
return response()->json(['message' => 'Unauthorized'], 403);

// After
return redirect()->back()->withErrors(['message' => 'Unauthorized']);
```

#### Exception Handling

```php
// Before
catch (\Exception $e) {
    return response()->json(['message' => 'Failed'], 500);
}

// After
catch (\Exception $e) {
    return redirect()->back()->withErrors(['message' => 'Failed']);
}
```

## How Inertia Handles Redirects

When you return `redirect()->back()`:

1. **Backend** sends HTTP 302 redirect
2. **Inertia** intercepts the redirect
3. **Inertia** makes a new GET request to the redirect URL
4. **Backend** returns fresh Inertia page data
5. **Frontend** updates reactively with new data

This is why we don't need to manually pass success messages - the frontend automatically reloads with updated data!

## Error Handling in Frontend

Errors passed via `withErrors()` are available in the frontend:

```typescript
router.post('/endpoint', data, {
    onSuccess: () => {
        // Triggered on successful redirect
        notifySuccess('Success!');
    },
    onError: (errors) => {
        // errors contains data from withErrors()
        notifyError(errors.message || 'Error');
    },
});
```

## When to Use JSON vs Redirect vs Inertia

### Use `redirect()->back()` When:

✅ Inertia POST/PUT/PATCH/DELETE requests  
✅ Form submissions  
✅ State-changing operations  
✅ Need to refresh page data after action

### Use `response()->json()` When:

✅ API endpoints (not Inertia pages)  
✅ AJAX requests using axios directly  
✅ Third-party integrations  
✅ Webhooks

### Use `Inertia::render()` When:

✅ GET requests to pages  
✅ Initial page load  
✅ Navigation between pages

## The `show()` Method Exception

The `show()` method in OrdersController **still uses JSON** and that's correct:

```php
public function show($id)
{
    $order = Purchase::with(['buyerAccount.memberInfo', 'items.product'])
        ->findOrFail($id);

    return response()->json($order); // ✅ Correct - used by axios
}
```

**Why?** Because it's called from `fetchOrderForPrint()` which uses axios to fetch data for the print modal - not for navigation.

## Testing Checklist

After this fix, verify:

- ✅ Move to payment works
- ✅ Mark as paid works
- ✅ Mark as released works
- ✅ Cancel order works
- ✅ Error messages display properly
- ✅ Success notifications appear
- ✅ No "plain JSON response" errors

## Documentation

- [Inertia.js Redirects](https://inertiajs.com/redirects)
- [Inertia.js Responses](https://inertiajs.com/responses)
- [Inertia.js Validation](https://inertiajs.com/validation)

---

**Status**: ✅ All order management endpoints now return proper Inertia responses!

The system now correctly uses `redirect()->back()` instead of JSON responses for all Inertia requests.
