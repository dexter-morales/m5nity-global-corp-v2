# Superadmin Setup Documentation

## Overview

The Superadmin role has been configured with full system access, including the ability to:

- Access all features and dashboards (members, cashier, inventory, encashments, etc.)
- Manage staff members (create, edit, delete employees)
- Configure company settings used in receipts and printables
- View comprehensive navigation with all system features

## Implementation Summary

### 1. Database Changes

#### Company Settings Table

Created `company_settings` table with the following fields:

- `company_name` - Company name (required)
- `address`, `city`, `state`, `zip_code`, `country` - Address information
- `phone`, `email`, `website` - Contact information
- `tax_id` - Tax identification number
- `logo_path` - Company logo file path
- `receipt_header`, `receipt_footer` - Custom receipt text

**Migration**: `2025_10_25_221322_create_company_settings_table.php`
**Seeder**: `CompanySettingSeeder.php` - Creates initial company settings

### 2. Backend Changes

#### Models

- **CompanySetting** (`app/Models/CompanySetting.php`)
    - Singleton pattern with `get()` method
    - Auto-creates default settings if none exist

#### Controllers

- **StaffManagementController** (`app/Http/Controllers/Superadmin/StaffManagementController.php`)
    - `index()` - List all staff with search and filtering
    - `create()` - Show create form
    - `store()` - Create new staff member
    - `edit()` - Show edit form
    - `update()` - Update existing staff
    - `destroy()` - Delete staff member

- **CompanySettingsController** (`app/Http/Controllers/Superadmin/CompanySettingsController.php`)
    - `edit()` - Show company settings form
    - `update()` - Update company settings
    - `removeLogo()` - Remove company logo

#### Routes

- **superadmin.php** - Dedicated superadmin routes file
    - `/superadmin/staff` - Staff management (full CRUD)
    - `/superadmin/settings/company` - Company settings management

#### Middleware Updates

All middleware now allow superadmin full access:

- **EnsureCashier** - Superadmin can access cashier routes
- **EnsureMember** - Superadmin can access member routes
- **EnsureRole** - Superadmin bypasses all role checks

#### Policy Updates

Updated to include `superadmin` alongside `admin` and `super_admin`:

- **PackagePolicy** - Full CRUD access
- **ProductPolicy** - Full CRUD access
- All controller permission checks

#### Helper Functions

- **company_settings()** (`app/helpers.php`) - Global helper to retrieve company settings
- Automatically registered in `composer.json` autoload

### 3. Frontend Changes

#### Navigation (`resources/js/components/app-sidebar.tsx`)

Superadmin now sees comprehensive navigation:

- **Dashboard** - Superadmin dashboard
- **Staff Management** - Manage employees
- **Members** - Overview, Binary, Unilevel
- **Sales** - Registrations, POS, Reports
- **Inventory** - Products, Packages, Reports
- **Encashments** - Admin, Accounting, Cashier views
- **Settings** - Company Settings

#### Pages Created

**Staff Management:**

- `resources/js/pages/Superadmin/Staff/Index.tsx` - Staff list with search/filter
- `resources/js/pages/Superadmin/Staff/Create.tsx` - Create new staff
- `resources/js/pages/Superadmin/Staff/Edit.tsx` - Edit existing staff

**Company Settings:**

- `resources/js/pages/Superadmin/Settings/CompanySettings.tsx` - Company settings form
    - Basic information (name, address)
    - Contact information (phone, email, website)
    - Logo upload (max 2MB)
    - Receipt customization (header/footer)

### 4. Shared Data

Company settings are now available to all Inertia pages via:

```typescript
const { companySettings } = usePage().props;
```

## Usage

### Accessing as Superadmin

1. Login with superadmin credentials:
    - Email: `superadmin@infinity.test`
    - Password: `password123`
2. You'll be redirected to `/superadmin` dashboard
3. Full navigation access to all features

### Managing Staff

1. Navigate to **Staff Management**
2. Click "Add Staff Member"
3. Fill in the form with role selection:
    - Super Admin
    - Admin
    - Cashier
    - Accounting
    - Releasing Personnel
4. Staff members can be edited or deleted

### Company Settings

1. Navigate to **Settings > Company Settings**
2. Update company information
3. Upload company logo (used in receipts)
4. Customize receipt header/footer text
5. Click "Save Settings"

## Security Features

1. **Role-based Access**: Only users with `utype = 'superadmin'` can access superadmin routes
2. **Self-deletion Prevention**: Superadmin cannot delete their own account
3. **Middleware Protection**: All routes protected by authentication and role middleware
4. **Policy Authorization**: Fine-grained access control via policies

## Future Enhancements

Potential additions:

- System logs and audit trails
- User activity monitoring
- Email template management
- System backup/restore functionality
- Advanced analytics dashboard
- Multi-language support configuration

## Testing

To test the implementation:

1. **Run migrations**:

    ```bash
    php artisan migrate
    ```

2. **Seed company settings**:

    ```bash
    php artisan db:seed --class=CompanySettingSeeder
    ```

3. **Clear caches**:

    ```bash
    php artisan route:clear
    php artisan config:clear
    php artisan cache:clear
    ```

4. **Login as superadmin** and verify:
    - All navigation items are visible
    - Can access all dashboards
    - Can create/edit/delete staff
    - Can update company settings

## Files Modified/Created

### New Files:

- `database/migrations/2025_10_25_221322_create_company_settings_table.php`
- `database/seeders/CompanySettingSeeder.php`
- `app/Models/CompanySetting.php`
- `app/Http/Controllers/Superadmin/StaffManagementController.php`
- `app/Http/Controllers/Superadmin/CompanySettingsController.php`
- `app/helpers.php`
- `routes/superadmin.php`
- `resources/js/pages/Superadmin/Staff/Index.tsx`
- `resources/js/pages/Superadmin/Staff/Create.tsx`
- `resources/js/pages/Superadmin/Staff/Edit.tsx`
- `resources/js/pages/Superadmin/Settings/CompanySettings.tsx`
- `SUPERADMIN_SETUP_DOCUMENTATION.md`

### Modified Files:

- `routes/web.php` - Added superadmin routes
- `routes/encashments.php` - Added superadmin to role checks
- `composer.json` - Added helpers.php to autoload
- `app/Http/Middleware/EnsureCashier.php` - Allow superadmin access
- `app/Http/Middleware/EnsureMember.php` - Allow superadmin access
- `app/Http/Middleware/EnsureRole.php` - Bypass all checks for superadmin
- `app/Http/Middleware/HandleInertiaRequests.php` - Share company settings
- `app/Policies/PackagePolicy.php` - Include superadmin
- `app/Policies/ProductPolicy.php` - Include superadmin
- `app/Http/Controllers/PackageController.php` - Include superadmin
- `app/Http/Controllers/ProductController.php` - Include superadmin
- `app/Http/Controllers/InventoryReportController.php` - Include superadmin
- `app/Http/Controllers/EncashmentController.php` - Include superadmin
- `app/Http/Responses/LoginResponse.php` - Unified admin redirects
- `app/Http/Responses/TwoFactorLoginResponse.php` - Unified admin redirects
- `resources/js/components/app-sidebar.tsx` - Comprehensive superadmin navigation

## Support

For issues or questions, please refer to:

- Laravel Documentation: https://laravel.com/docs
- Inertia.js Documentation: https://inertiajs.com
- Project README: README.md
