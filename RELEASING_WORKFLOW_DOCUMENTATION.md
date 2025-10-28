# Releasing Personnel Workflow Documentation

## Overview

The releasing personnel role is designed specifically for staff who handle the **physical distribution of products** to members. They have **read-only access** to orders and registrations, with the ability to mark items as "released" once products are physically handed over to members.

## Key Principles

### What Releasing Personnel CAN Do:

✅ View list of orders ready for release  
✅ View list of registrations ready for release  
✅ Mark orders as "released" (product delivered)  
✅ Mark registrations as "released" (package delivered)  
✅ Check inventory stock levels  
✅ View inventory reports

### What Releasing Personnel CANNOT Do:

❌ Create new orders  
❌ Create new member registrations  
❌ Process payments  
❌ Cancel orders  
❌ Modify order details  
❌ Access cashier POS system  
❌ Access cashier registration system

## Workflow

### Complete Order Lifecycle

1. **Cashier** creates order in POS → Status: `pending`
2. **Cashier** moves order to payment → Status: `for_payment`
3. **Cashier** marks as paid → Status: `for_release`
4. **Releasing Personnel** sees order in "For Release" list
5. **Releasing Personnel** marks as released → Status: `completed`

### Complete Registration Lifecycle

1. **Cashier** registers new member → Status: `pending`
2. **Cashier** processes payment → Status: `for_release`
3. **Releasing Personnel** sees registration in "For Release" list
4. **Releasing Personnel** marks as released → Status: `completed`

## Navigation Structure

### Releasing Dashboard (`/releasing`)

- Quick statistics:
    - Pending release count
    - Released today count
    - Out of stock count
- Low stock alerts
- Quick actions to orders and registrations

### Orders Page (`/releasing/orders`)

Two tabs:

- **For Release**: Orders paid and ready for product release
- **Completed**: Orders already released (for reference)

Features:

- View order details (member name, items, total)
- One-click "Release" button for orders
- Cannot create, modify, or cancel orders

### Registrations Page (`/releasing/registrations`)

Two tabs:

- **For Release**: Registrations paid and ready for package release
- **Completed**: Registrations already released (for reference)

Features:

- View registration details (member name, package, payment method)
- One-click "Release" button for registrations
- Cannot create or modify registrations

## Technical Implementation

### Routes (`routes/releasing.php`)

```php
Route::middleware(['auth', 'role:releasing_personnel'])
    ->prefix('releasing')
    ->name('releasing.')
    ->group(function () {
        // Dashboard
        Route::get('/', [ReleasingDashboardController::class, 'index'])
            ->name('dashboard');

        // Read-only Orders with release capability
        Route::get('/orders', [ReleasingOrdersController::class, 'index'])
            ->name('orders.index');

        // Read-only Registrations with release capability
        Route::get('/registrations', [ReleasingRegistrationsController::class, 'index'])
            ->name('registrations.index');

        Route::post('/registrations/{id}/release', [ReleasingRegistrationsController::class, 'markAsReleased'])
            ->name('registrations.release');
    });
```

### Controllers

#### `ReleasingOrdersController`

- Fetches orders with status `for_release`
- Fetches completed orders for reference
- Orders release is handled by `OrdersController::markAsReleased`

#### `ReleasingRegistrationsController`

- Fetches registrations with status `for_release`
- Handles marking registrations as released
- Updates transaction status to `completed`
- Logs activity using `ActivityLogService`

### Frontend Pages

#### `resources/js/pages/Releasing/Dashboard.tsx`

- Shows summary statistics
- Quick action buttons to orders/registrations
- Low stock alerts

#### `resources/js/pages/Releasing/Orders.tsx`

- Tabbed interface (For Release / Completed)
- Table display with order details
- Release button for each order
- Calls `/cashier/orders/{id}/mark-as-released` endpoint

#### `resources/js/pages/Releasing/Registrations.tsx`

- Tabbed interface (For Release / Completed)
- Table display with registration details
- Release button for each registration
- Calls `/releasing/registrations/{id}/release` endpoint

## Permissions and Security

### Middleware Protection

All releasing routes are protected by:

```php
->middleware(['auth', 'role:releasing_personnel'])
```

### Database-Level Permissions

Staff profiles table includes permission flags:

- `can_release_orders` - Allow releasing orders
- `can_mark_paid` - (Not available to releasing personnel)
- `can_cancel_orders` - (Not available to releasing personnel)

### Separated from Cashier Routes

Cashier routes (`/cashier/*`) are restricted to `cashier` role only:

```php
Route::middleware(['auth', 'role:cashier'])
```

Releasing personnel **cannot access** cashier routes.

## User Experience

### For Releasing Personnel

1. **Login** → Redirected to `/releasing` dashboard
2. **Dashboard** shows:
    - Number of orders/registrations waiting
    - Items released today
    - Inventory warnings
3. **Click "View Orders"** → See list of paid orders ready for release
4. **Click "Release"** on an order → Product is marked as delivered
5. **Activity is logged** for audit purposes

### Clear Separation of Duties

- **Cashiers handle**: Money, payments, order creation
- **Releasing handles**: Physical products, delivery confirmation

This separation provides:

- Better accountability
- Clearer audit trails
- Reduced fraud risk
- Efficient workflow

## Activity Logging

All release actions are logged in the `activity_logs` table:

```php
$activityLog->logRelease(
    Auth::id(),           // User ID
    'order',              // Type: 'order' or 'registration'
    $orderId,             // Record ID
    $transactionNumber,   // Transaction number
    $receivedBy           // Optional: Who received it
);
```

Log entries include:

- User who performed the release
- Timestamp
- Type of release (order/registration)
- Transaction details
- Receiver information (if applicable)

## Database Schema

### Orders (`purchases` table)

- `status` field values:
    - `pending` - Just created
    - `for_payment` - Moved to payment queue
    - `for_release` - **Visible to releasing personnel**
    - `completed` - Released to member
    - `cancelled` - Order cancelled

### Registrations (`transaction_histories` table)

- `status` field values:
    - `pending` - Just registered
    - `for_release` - **Visible to releasing personnel**
    - `completed` - Package released to member

## Setup Instructions

### 1. Create Releasing Personnel User

```php
// In database seeder or manually
User::create([
    'name' => 'Releasing Staff',
    'email' => 'releasing@example.com',
    'password' => Hash::make('password'),
    'utype' => 'releasing_personnel',
]);
```

### 2. Set Permissions in Staff Profile

```php
StaffProfile::create([
    'user_id' => $user->id,
    'role' => 'releasing',
    'can_release_orders' => true,
    'can_mark_paid' => false,
    'can_cancel_orders' => false,
]);
```

### 3. Test the Workflow

1. Login as **cashier**, create an order, mark as paid
2. Logout, login as **releasing personnel**
3. Navigate to Orders, verify order appears in "For Release"
4. Click "Release" button
5. Verify order moves to "Completed" tab

## Troubleshooting

### Issue: Releasing personnel can't access orders

**Solution**: Check route middleware allows `releasing_personnel` role

### Issue: Orders don't appear in "For Release" list

**Solution**: Verify orders have `status = 'for_release'` in database

### Issue: Release button doesn't work

**Solution**: Check that:

- Order status is `for_release`
- User has `can_release_orders` permission
- Route `/cashier/orders/{id}/mark-as-released` is accessible

## Future Enhancements

Potential improvements:

- [ ] Barcode scanning for faster release
- [ ] Signature capture for proof of delivery
- [ ] Photo upload of released items
- [ ] SMS notification to member when released
- [ ] Batch release (multiple orders at once)
- [ ] Print packing slips
- [ ] Track partial releases

## Summary

The releasing personnel workflow is designed to:

- Separate financial responsibilities (cashier) from physical distribution (releasing)
- Provide clear, simple interface for product delivery
- Maintain audit trail of all releases
- Prevent unauthorized access to order creation/payment
- Streamline the member product delivery process

This system ensures that each role has appropriate access and capabilities for their specific responsibilities.
