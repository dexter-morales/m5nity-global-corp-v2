# Duplicate Route Fix

## Issue

Frontend build error: `Identifier 'dashboard' has already been declared`

## Root Cause

The `cashier.dashboard` route was defined **twice** in the backend:

1. **routes/web.php** (line 42-44):

    ```php
    Route::middleware(['auth', 'cashier'])
        ->get('/cashier', [CashierDashboardController::class, 'index'])
        ->name('cashier.dashboard');
    ```

2. **routes/cashier.php** (line 55-56):
    ```php
    Route::get('/dashboard', [CashierDashboardController::class, 'index'])
        ->name('dashboard');  // becomes 'cashier.dashboard' due to prefix
    ```

This caused the Wayfinder route generator to create two `export const dashboard` declarations in `resources/js/routes/cashier/index.ts`, resulting in a JavaScript compilation error.

## Solution

### 1. Removed Duplicate Routes from `routes/web.php`

- Removed the duplicate `cashier.dashboard` route (line 41-44)
- Removed the duplicate `releasing.dashboard` route (line 50)
- Removed unused imports: `CashierDashboardController` and `ReleasingPersonnelDashboardController`

### 2. Deleted Generated Route File

- Deleted `resources/js/routes/cashier/index.ts` to force Wayfinder to regenerate it cleanly

### 3. Cleared Route Cache

- Ran `php artisan route:clear` to ensure Laravel picks up the correct routes

## Current Route Structure

### Cashier Routes (from `routes/cashier.php`)

- `/cashier/dashboard` → `cashier.dashboard` ✓ (only one now)
- `/cashier/registrations` → `cashier.registrations.index`
- `/cashier/pos` → `cashier.pos.index`
- etc.

### Releasing Routes (from `routes/releasing.php`)

- `/releasing` → `releasing.dashboard` ✓

## Next Steps

1. **Start/Restart the dev server**: `npm run dev`
    - Wayfinder will automatically regenerate `resources/js/routes/cashier/index.ts` without duplicates

2. **Verify the fix**:
    ```bash
    npm run dev
    ```
    The compilation error should be gone!

## Files Modified

### Backend

- `routes/web.php` - Removed duplicate route definitions and unused imports

### Frontend

- `resources/js/routes/cashier/index.ts` - Deleted (will auto-regenerate)

## Prevention

To avoid this in the future:

1. **Never define the same route name in multiple route files**
2. **Check existing routes before adding new ones**: `php artisan route:list --path=cashier`
3. **Keep dashboard routes in their respective route files**:
    - Cashier routes → `routes/cashier.php`
    - Releasing routes → `routes/releasing.php`
    - etc.

## Verification Commands

```bash
# Check cashier routes
php artisan route:list --path=cashier

# Check releasing routes
php artisan route:list --path=releasing

# Should only show one route for each
```
