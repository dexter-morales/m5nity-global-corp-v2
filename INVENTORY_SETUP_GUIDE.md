# 📦 Inventory System - Quick Setup Guide

## 🚀 Quick Start (5 minutes)

Follow these steps to get the Inventory System up and running:

### Step 1: Run Migrations

```bash
php artisan migrate
```

This creates:

- `products` table
- `packages` table
- `package_product` pivot table
- `inventory_transactions` table

### Step 2: Seed Sample Data (Optional but Recommended)

```bash
php artisan db:seed --class=InventorySeeder
php artisan db:seed --class=ReleasingPersonnelSeeder
```

This creates:

- 5 sample products with different attributes
- 2 packages including the default "Standard" package (₱4000)
- Product-package relationships
- Releasing Personnel user account (releasing@example.com / password)

### Step 3: Build Frontend Assets

For development:

```bash
npm run dev
```

For production:

```bash
npm run build
```

### Step 4: Access the System

Based on your user role:

**Admin / Super Admin:**

- Navigate to sidebar → "Inventory"
- Access: Products, Packages, Reports

**Releasing Personnel:**

- Navigate to sidebar → "Inventory"
- Access: Products (add/edit), Inventory Reports

**Cashier:**

- Navigate to sidebar → "Inventory"
- Access: Products and Packages (read-only)

## 📋 User Role Setup

After running the seeders, you'll have a releasing personnel account ready:

**Releasing Personnel Account:**

- Email: `releasing@example.com`
- Password: `password`

If you need to manually create or update other users:

```sql
-- Create a cashier user
UPDATE users SET utype = 'cashier' WHERE email = 'cashier@example.com';

-- Create an admin user
UPDATE users SET utype = 'admin' WHERE email = 'admin@example.com';

-- Create another releasing personnel
UPDATE users SET utype = 'releasing_personnel' WHERE email = 'user@example.com';
```

## ✅ Verify Installation

After setup, verify these features work:

1. **Products Page** (`/products`)
    - View product list
    - Search and filter products
    - Create new product (if permitted)

2. **Packages Page** (`/packages`)
    - View package list
    - Create new package (if permitted)

3. **Inventory Reports** (`/inventory-reports`)
    - View statistics dashboard
    - Check fast/slow moving products
    - Export reports (CSV, Excel, PDF)

## 🎯 First Actions to Try

### For Admins:

1. **Create Your First Product**
    - Go to Products → Add Product
    - Enter: Name, SKU (e.g., PROD-001), Price, Stock Quantity
    - Set reorder level (e.g., 10)
    - Add expiration date if applicable
    - Save

2. **Create a Package**
    - Go to Packages → Add Package
    - Enter: Name, Code (e.g., PKG-001), Price
    - Add products with quantities
    - Save

3. **Adjust Stock**
    - Open any product detail page
    - Click "Adjust Stock"
    - Try "Stock In" to add inventory
    - Check the transaction history

4. **View Reports**
    - Go to Inventory Reports
    - Set date range
    - Export a report to PDF/Excel

### For Releasing Personnel:

1. **Add Products**
    - Create products with stock quantities
    - Adjust stock levels as needed

2. **Monitor Inventory**
    - Check low stock alerts
    - Review expiration warnings

3. **Generate Reports**
    - Run inventory reports
    - Export for analysis

### For Cashiers:

1. **Browse Products**
    - View available products
    - Check stock levels

2. **View Packages**
    - See package contents
    - Check pricing

## 🔍 Testing Checklist

- [ ] Products can be created
- [ ] Products can be edited
- [ ] Stock adjustment works
- [ ] Transaction history is recorded
- [ ] Packages can be created
- [ ] Products can be added to packages
- [ ] Low stock warnings appear
- [ ] Expiration alerts show up
- [ ] Fast/slow moving products are calculated
- [ ] Reports can be exported (CSV, Excel, PDF)
- [ ] Role-based permissions work correctly
- [ ] Search and filtering functions properly

## 🐛 Troubleshooting

### Issue: Routes not found (404)

**Solution:**

```bash
php artisan route:clear
php artisan config:clear
php artisan cache:clear
```

### Issue: Frontend pages not loading

**Solution:**

```bash
npm run build
php artisan optimize:clear
```

### Issue: Policies not working

**Solution:**

```bash
php artisan config:clear
php artisan cache:clear
```

Check `app/Providers/AppServiceProvider.php` - policies should be registered in the `boot()` method.

### Issue: Missing dependencies

**Solution:**

```bash
composer install
npm install
```

### Issue: PDF export not working

**Solution:**
Ensure `barryvdh/laravel-dompdf` is installed:

```bash
composer require barryvdh/laravel-dompdf
```

### Issue: Excel export not working

**Solution:**
The system uses `maatwebsite/excel` which should already be installed. If not:

```bash
composer require maatwebsite/excel
```

## 📊 Sample Data Overview

After seeding, you'll have:

### Products:

1. Premium Wellness Supplement (PROD-001) - ₱500, Stock: 100
2. Energy Booster Pack (PROD-002) - ₱350, Stock: 150
3. Immune Support Tablets (PROD-003) - ₱450, Stock: 75
4. Detox Tea Blend (PROD-004) - ₱250, Stock: 200
5. Protein Shake Mix (PROD-005) - ₱800, Stock: 50

### Packages:

1. **Standard Package** (PKG-STANDARD) - ₱4000
    - 2x Premium Wellness Supplement
    - 3x Energy Booster Pack
    - 2x Immune Support Tablets

2. **Premium Package** (PKG-PREMIUM) - ₱7500
    - 3x Premium Wellness Supplement
    - 5x Energy Booster Pack
    - 3x Immune Support Tablets
    - 2x Protein Shake Mix

## 🎓 Next Steps

Once setup is complete:

1. **Customize Products**: Add your actual products
2. **Configure Packages**: Create packages that match your business
3. **Set Reorder Levels**: Adjust based on your inventory needs
4. **Train Users**: Show team members how to use the system
5. **Monitor Reports**: Use analytics to optimize inventory

## 📝 Important Notes

- **Currency**: All prices are in Philippine Pesos (₱)
- **Soft Deletes**: Deleted items aren't permanently removed
- **Audit Trail**: All stock changes are tracked
- **Permissions**: Strictly enforced by role
- **Real-time**: Stock levels update immediately

## 📚 Additional Resources

- Full documentation: `INVENTORY_SYSTEM_DOCUMENTATION.md`
- Main README: `README.md`
- Laravel docs: https://laravel.com/docs

## ✨ Features at a Glance

| Feature         | Cashier | Releasing | Admin |
| --------------- | ------- | --------- | ----- |
| View Products   | ✅      | ✅        | ✅    |
| Add Products    | ❌      | ✅        | ✅    |
| Edit Products   | ❌      | ✅        | ✅    |
| Delete Products | ❌      | ❌        | ✅    |
| Adjust Stock    | ❌      | ✅        | ✅    |
| View Packages   | ✅      | ✅        | ✅    |
| Manage Packages | ❌      | ❌        | ✅    |
| View Reports    | ❌      | ✅        | ✅    |
| Export Reports  | ❌      | ✅        | ✅    |

---

**Ready to start!** 🎉

Run the migrations, seed the data, and explore the Inventory System!
