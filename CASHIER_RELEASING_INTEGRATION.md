# Cashier and Releasing Integration

## Issues Fixed

### 1. Database Column Missing

**Error**: `Column not found: 1054 Unknown column 'inventory_products.low_stock_threshold'`

**Solution**: Created migration `2025_10_26_000003_add_low_stock_threshold_to_inventory_products.php` to add the missing column with a default value of 10.

### 2. Missing Navigation for Releasing Personnel

**Issue**: Releasing personnel couldn't see Registration and POS navigation items.

**Solution**:

- Updated `app-sidebar.tsx` to include Registrations and POS menu items for releasing personnel
- Modified cashier routes to allow both `cashier` and `releasing_personnel` roles
- Created releasing dashboard and controller

## How Cashier & Releasing Work Together

### Workflow

1. **Cashier** handles:
    - Member registrations
    - Creating orders in POS
    - Processing payments (moving orders to "for payment" and "paid" status)

2. **Releasing Personnel** handles:
    - Viewing all orders in POS
    - Marking orders as "released" (delivered to members)
    - Managing inventory stock levels
    - Monitoring low stock alerts

### Shared Access

Both cashier and releasing personnel can now access:

- **Registrations** (`/cashier/registrations`)
- **POS** (`/cashier/pos`)
- **Inventory** (`/inventory/products` and `/inventory/packages`)

### Role-Specific Dashboards

- **Cashier**: `/cashier` or `/cashier/dashboard`
- **Releasing**: `/releasing` (dedicated dashboard showing pending releases)

## Files Modified

### Backend

1. `routes/cashier.php` - Updated middleware to allow both roles
2. `app/Http/Middleware/EnsureRole.php` - Added releasing personnel redirect
3. `bootstrap/app.php` - Registered releasing routes

### Frontend

1. `resources/js/components/app-sidebar.tsx` - Added navigation items for releasing personnel
2. `resources/js/pages/Releasing/Dashboard.tsx` - New dashboard page

### New Files Created

1. `routes/releasing.php` - Releasing-specific routes
2. `app/Http/Controllers/Releasing/ReleasingDashboardController.php` - Dashboard controller
3. `database/migrations/2025_10_26_000003_add_low_stock_threshold_to_inventory_products.php` - Database fix

## Navigation Structure

### Cashier User Type (`utype='cashier'`)

- Dashboard
- Registrations
- POS
- Inventory (Products, Packages)
- Encashments
- Reports

### Releasing Personnel User Type (`utype='releasing_personnel'`)

- Dashboard (Releasing-specific)
- Registrations (shared with cashier)
- POS (shared with cashier)
- Inventory (Products, Packages)
- Inventory Reports

### Superadmin User Type (`utype='superadmin'`)

- Full access to all features including:
    - Members
    - Sales (Registrations, POS, Reports)
    - Inventory
    - Encashments
    - Settings

## Permission System

The system uses role-based access control through:

1. **Middleware**: `role:cashier,releasing_personnel` in routes
2. **EnsureRole Middleware**: Checks user's `utype` field
3. **Staff Profiles**: Additional permissions stored in `staff_profiles` table:
    - `can_mark_paid`
    - `can_release_orders`
    - `can_cancel_orders`
    - `can_view_reports`

## Testing the Integration

1. **As Cashier**:
    - Login with cashier account
    - Create orders in POS
    - Process payments
    - View inventory status

2. **As Releasing Personnel**:
    - Login with releasing account
    - Check releasing dashboard for pending orders
    - Access POS to see orders ready for release
    - Mark orders as released
    - Monitor inventory levels

## Next Steps

1. **Test the application** by logging in as both cashier and releasing personnel
2. **Verify navigation** appears correctly for each role
3. **Test order flow**: Create → Pay → Release
4. **Check permissions** work as expected

## Database Changes

Run these commands to apply all changes:

```bash
php artisan migrate
php artisan optimize:clear
```

## Development Notes

- Both roles share the same POS and Registration interfaces
- Permission checks happen at the controller level for actions
- Inventory warnings appear on both dashboards
- Activity logs track all actions by both roles
