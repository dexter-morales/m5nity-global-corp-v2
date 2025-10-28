# Cashier & Releasing System - Installation & Setup Guide

## Quick Start

This guide will help you install and configure all the new enhancements to the Cashier and Releasing system.

---

## Prerequisites

- PHP 8.1+
- Laravel 10+
- Node.js 18+
- MySQL/PostgreSQL
- Composer
- NPM or PNPM

---

## Installation Steps

### Step 1: Pull Latest Code

```bash
# Ensure you have the latest code
git pull origin main
```

### Step 2: Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install
# or if using pnpm
pnpm install
```

### Step 3: Run Database Migrations

```bash
# Run new migrations
php artisan migrate

# If you encounter issues, run with --step flag
php artisan migrate --step
```

**New Migrations Added:**

- `2025_10_26_000001_create_activity_logs_table.php`
- `2025_10_26_000002_add_role_and_permissions_to_staff_profiles.php`

### Step 4: Seed Default Permissions (Optional)

Create a seeder or run this in `php artisan tinker`:

```php
// Give all existing cashiers default permissions
DB::table('staff_profiles')->update([
    'can_mark_paid' => true,
    'can_cancel_orders' => true,
    'can_release_orders' => false, // Only for releasing personnel
    'can_view_reports' => false,    // Only for supervisors
    'is_active' => true,
]);

// Or for specific users
$staffProfile = \App\Models\StaffProfile::where('user_id', 1)->first();
$staffProfile->update([
    'can_release_orders' => true,
    'can_view_reports' => true,
]);
```

### Step 5: Clear All Caches

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Step 6: Build Frontend Assets

```bash
# For production
npm run build

# For development
npm run dev
```

### Step 7: Verify Installation

```bash
# Check routes are registered
php artisan route:list | grep cashier

# You should see new routes:
# POST cashier/orders/bulk/mark-as-paid
# POST cashier/orders/bulk/mark-as-released
# POST cashier/orders/bulk/cancel
# GET  cashier/dashboard
# GET  cashier/reports
```

---

## Configuration

### 1. Environment Variables

No new environment variables are required, but verify these exist:

```env
APP_ENV=production
APP_DEBUG=false
CACHE_DRIVER=redis  # Recommended for production
SESSION_DRIVER=redis
```

### 2. Permission Configuration

#### Grant Releasing Permissions

```php
// In tinker or seeder
$user = \App\Models\User::where('email', 'releasing@example.com')->first();
$user->staffProfile->update(['can_release_orders' => true]);
```

#### Grant Reports Access

```php
$user = \App\Models\User::where('email', 'supervisor@example.com')->first();
$user->staffProfile->update(['can_view_reports' => true]);
```

### 3. Barcode Scanner Setup

**For USB Barcode Scanners:**

1. Connect scanner to computer
2. Verify it's in "keyboard emulation" mode
3. Test in notepad - should type characters
4. No software installation needed
5. Works automatically in the system

**Scanner Settings:**

- Mode: Keyboard Emulation (HID)
- Suffix: Enter key (CR/LF)
- Prefix: None (optional)

### 4. Cache Configuration

For optimal performance, use Redis:

```bash
# Install Redis (if not already installed)
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Start Redis
redis-server
```

Update `.env`:

```env
CACHE_DRIVER=redis
SESSION_DRIVER=redis
REDIS_CLIENT=phpredis  # or predis
```

---

## Testing the Installation

### 1. Test Basic Functionality

#### Login as Cashier

```
URL: /login
Email: cashier@example.com
Password: [your-password]
```

#### Create Test Order

1. Navigate to POS
2. Add products to cart
3. Select member
4. Create order
5. Verify order appears in "Pending" tab

### 2. Test Bulk Operations

1. Create 3-5 test orders
2. Move them to "For Payment"
3. Select multiple orders (Shift + Click)
4. Click "Mark as Paid" in bulk action bar
5. Verify all moved to "For Release"

### 3. Test Activity Logging

```php
// In tinker
\App\Models\ActivityLog::latest()->take(10)->get();

// Should see recent activities
```

### 4. Test Permissions

#### Test as Regular Cashier

- Should be able to mark paid ✓
- Should NOT be able to access reports ✗

#### Test as Releasing Personnel

- Should be able to release orders ✓
- May not be able to cancel orders ✗ (depending on config)

### 5. Test Keyboard Shortcuts

1. Open POS page
2. Press `Ctrl + B` - Should open cart
3. Press `Ctrl + K` - Should focus search
4. Press `1-6` - Should switch tabs

### 6. Test Barcode Scanner (if available)

1. Navigate to Ordering tab
2. Scan product barcode
3. Product should auto-add to cart

### 7. Test Low Stock Warnings

```php
// Set a product to low stock (in tinker)
$product = \App\Models\InventoryProduct::first();
$product->update(['stock_quantity' => 5, 'low_stock_threshold' => 10]);
```

Refresh POS - should see warning banner.

### 8. Test Reports

1. Login as user with `can_view_reports` = true
2. Navigate to Reports
3. Should see statistics and charts
4. Test date filtering

---

## Post-Installation Tasks

### 1. Train Staff

Provide staff with:

- **CASHIER_SYSTEM_COMPREHENSIVE_GUIDE.md**
- Hands-on training session (2-3 hours)
- Quick reference cards
- Contact for technical support

### 2. Configure Staff Permissions

Review and set permissions for each staff member:

```php
// Example permission setup
$cashiers = \App\Models\User::where('utype', 'cashier')->get();
foreach ($cashiers as $cashier) {
    $cashier->staffProfile->update([
        'can_mark_paid' => true,
        'can_cancel_orders' => true,
        'can_release_orders' => false,
        'can_view_reports' => false,
    ]);
}

$releasingPersonnel = \App\Models\User::where('utype', 'releasing_personnel')->get();
foreach ($releasingPersonnel as $personnel) {
    $personnel->staffProfile->update([
        'can_mark_paid' => false,
        'can_cancel_orders' => false,
        'can_release_orders' => true,
        'can_view_reports' => false,
    ]);
}
```

### 3. Monitor Activity Logs

Set up regular monitoring:

```bash
# View recent activities
php artisan tinker

>>> \App\Models\ActivityLog::recent(7)->count();
>>> \App\Models\ActivityLog::ofType('bulk_operation')->recent(1)->get();
```

### 4. Set Up Backups

Ensure regular backups of:

- Database (including new `activity_logs` table)
- `.env` file
- Uploaded files

### 5. Performance Monitoring

Monitor these metrics:

- Average order processing time
- Bulk operation success rate
- System response times
- Cache hit rates

---

## Troubleshooting

### Issue: Migrations Fail

**Solution:**

```bash
# Check migration status
php artisan migrate:status

# Rollback if needed
php artisan migrate:rollback --step=1

# Re-run migrations
php artisan migrate
```

### Issue: Permissions Not Working

**Solution:**

```bash
# Clear permission cache
php artisan cache:forget user_permissions_*

# Or clear all cache
php artisan cache:clear
```

### Issue: Frontend Components Not Loading

**Solution:**

```bash
# Rebuild assets
npm run build

# Check for errors
npm run dev
```

### Issue: Routes Not Found

**Solution:**

```bash
# Clear route cache
php artisan route:clear

# Rebuild route cache
php artisan route:cache
```

### Issue: Activity Logs Not Creating

**Solution:**

```php
// Check in tinker
\App\Models\ActivityLog::create([
    'user_id' => 1,
    'log_type' => 'test',
    'action' => 'test',
    'description' => 'Test log',
    'ip_address' => '127.0.0.1',
]);

// If it works, check controller integration
```

### Issue: Bulk Operations Timeout

**Solution:**

```php
// Increase PHP timeout in php.ini
max_execution_time = 300

// Or in controller
set_time_limit(300);

// Reduce batch size
// Max 50 orders per operation
```

### Issue: Barcode Scanner Not Working

**Check:**

1. Scanner connected via USB
2. Scanner in keyboard mode (not storage mode)
3. Test in notepad - should type
4. Check browser doesn't block keypress events
5. Ensure no input fields are focused

---

## Performance Optimization

### 1. Enable OPcache

Edit `php.ini`:

```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.revalidate_freq=60
```

### 2. Use Redis for Cache

Already configured in steps above.

### 3. Queue Long-Running Tasks

For future enhancements, consider queuing:

- Bulk operations (50+ orders)
- Report generation
- Email notifications

### 4. Database Indexing

Indexes are already added in migrations, but verify:

```sql
-- Check indexes on activity_logs
SHOW INDEXES FROM activity_logs;

-- Should see indexes on:
-- - user_id, log_type, created_at (composite)
-- - created_at
```

### 5. Asset Optimization

```bash
# Minify and compress assets
npm run build

# Verify output
ls -lh public/build/assets/
```

---

## Security Considerations

### 1. HTTPS Only

Ensure site runs on HTTPS in production:

```env
APP_URL=https://yourdomain.com
FORCE_HTTPS=true
```

### 2. Rate Limiting

Add rate limiting to bulk operations:

```php
// In routes/cashier.php
Route::post('/orders/bulk/mark-as-paid', [OrdersController::class, 'bulkMarkAsPaid'])
    ->middleware('throttle:10,1') // 10 requests per minute
    ->name('orders.bulk-mark-as-paid');
```

### 3. Activity Log Retention

Set up log rotation:

```bash
# In a scheduled task
php artisan tinker

>>> \App\Models\ActivityLog::where('created_at', '<', now()->subMonths(6))->delete();
```

### 4. Permission Auditing

Regular audit of user permissions:

```php
// List all users with release permissions
\App\Models\StaffProfile::where('can_release_orders', true)->with('user')->get();

// List superadmins
\App\Models\User::where('utype', 'superadmin')->get();
```

---

## Rollback Plan

If you need to rollback:

### 1. Rollback Migrations

```bash
# Rollback the 2 new migrations
php artisan migrate:rollback --step=2
```

### 2. Restore Previous Code

```bash
git checkout [previous-commit-hash]
composer install
npm install
npm run build
```

### 3. Clear Caches

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

---

## Maintenance

### Daily Tasks

- Monitor activity logs for errors
- Check low stock alerts
- Verify bulk operations completing

### Weekly Tasks

- Review permission changes
- Check performance metrics
- Test backup restoration

### Monthly Tasks

- Update documentation
- Review and optimize database
- Security audit
- Staff training refreshers

---

## Support Resources

### Documentation

- **CASHIER_SYSTEM_COMPREHENSIVE_GUIDE.md** - User guide
- **CASHIER_SYSTEM_ENHANCEMENTS_SUMMARY.md** - Technical overview
- **INVENTORY_SYSTEM_DOCUMENTATION.md** - Inventory integration

### Logs

- **Laravel Logs**: `storage/logs/laravel.log`
- **Activity Logs**: Database table `activity_logs`
- **Browser Console**: F12 in browser
- **Network Tab**: Check API responses

### Getting Help

1. Check documentation first
2. Review activity logs
3. Check Laravel logs
4. Contact system administrator
5. Report bugs with:
    - Error message
    - Steps to reproduce
    - Screenshots
    - Browser console logs

---

## Upgrade Notes

### From Previous Version

All enhancements are **non-breaking additions**:

- ✅ Existing orders work normally
- ✅ Previous staff accounts continue working
- ✅ All previous features intact
- ✅ Database backwards compatible
- ➕ New features added on top

No data migration required.

---

## Success Checklist

- [ ] Migrations ran successfully
- [ ] Permissions configured for all staff
- [ ] Frontend assets compiled
- [ ] Test orders created successfully
- [ ] Bulk operations tested
- [ ] Activity logs working
- [ ] Keyboard shortcuts functional
- [ ] Barcode scanner tested (if applicable)
- [ ] Low stock warnings appear
- [ ] Reports accessible (for authorized users)
- [ ] All caches cleared
- [ ] Staff training scheduled
- [ ] Documentation distributed
- [ ] Backup verified
- [ ] Monitoring configured

---

## Next Steps

1. ✅ Complete installation
2. 📚 Train staff
3. 🔍 Monitor for issues
4. 📊 Review reports weekly
5. 🔄 Gather feedback
6. 🚀 Optimize based on usage
7. 📈 Plan Phase 2 enhancements

---

## Contact

**Technical Support**: [Your IT Department]
**System Administrator**: [Admin Contact]
**Documentation Issues**: [Contact]

---

**Installation Guide Version**: 1.0
**Last Updated**: October 2025

---

_Congratulations! Your Cashier & Releasing system is now enterprise-ready!_ 🎉
