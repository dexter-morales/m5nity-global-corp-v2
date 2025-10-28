# 📦 Inventory System Documentation

## Overview

The Inventory System is a comprehensive feature for managing products, packages, and inventory analytics in the Laravel 12 Starter Kit application. It provides full CRUD operations, role-based access control, advanced reporting, and export capabilities.

## Features

### ✨ Core Features

1. **Product Management**
    - Full CRUD operations (Create, Read, Update, Delete)
    - Product attributes: SKU, name, description, price, stock quantity, reorder level, expiration date
    - Stock adjustment tracking with transaction history
    - Low stock warnings
    - Expiration date tracking with alerts for expired and expiring soon products
    - Soft deletes for data integrity

2. **Package Management**
    - Dynamic package creation and management
    - Associate multiple products with quantities in each package
    - Package pricing and status management
    - Stock availability checking for packages

3. **Inventory Analytics**
    - **Fast-moving products**: Track products with high sales velocity
    - **Slow-moving products**: Identify products with low turnover
    - **Low stock alerts**: Real-time warnings for products below reorder level
    - **Expiration tracking**: Monitor expired and expiring soon products
    - **Stock movement analysis**: Track stock in, out, and adjustments

4. **Reporting & Export**
    - Comprehensive inventory reports with filtering
    - Export to CSV, Excel, and PDF formats
    - Customizable date ranges and product filters
    - Multiple report types:
        - Summary Report
        - Stock Levels Report
        - Low Stock Report
        - Expiration Report
        - Fast/Slow Moving Products Report
        - Transaction History Report

5. **Transaction Tracking**
    - Complete audit trail of all stock movements
    - Transaction types: Stock In, Stock Out, Adjustments
    - Reference tracking for related operations
    - User attribution (created_by, updated_by)

## 👥 Role-Based Permissions

### Releasing Personnel

- ✅ Add products and input stock quantities
- ✅ View and generate inventory reports
- ✅ Export reports (CSV, Excel, PDF)
- ❌ Cannot delete products
- ❌ Cannot manage packages

### Cashier

- ✅ View products (read-only)
- ✅ View packages (read-only)
- ❌ Cannot add, edit, or delete products
- ❌ Cannot adjust stock
- ❌ Cannot access reports

### Admin / Super Admin

- ✅ Full product management (add, edit, delete)
- ✅ Full package management (add, edit, delete)
- ✅ Adjust stock quantities
- ✅ View, generate, and export reports
- ✅ Access all inventory features

## 🗂️ Database Schema

### Tables

#### `products`

- `id`: Primary key
- `name`: Product name
- `sku`: Unique stock keeping unit
- `description`: Product description
- `price`: Product price (decimal)
- `stock_quantity`: Current stock level
- `reorder_level`: Low stock threshold
- `expiration_date`: Product expiration date (nullable)
- `status`: active, inactive, discontinued
- `created_by`, `updated_by`: User tracking
- `created_at`, `updated_at`, `deleted_at`: Timestamps

#### `packages`

- `id`: Primary key
- `name`: Package name
- `code`: Unique package code
- `description`: Package description
- `price`: Package price (decimal)
- `status`: active, inactive
- `created_by`, `updated_by`: User tracking
- `created_at`, `updated_at`, `deleted_at`: Timestamps

#### `package_product` (Pivot)

- `id`: Primary key
- `package_id`: Foreign key to packages
- `product_id`: Foreign key to products
- `quantity`: Quantity of product in package
- `created_at`, `updated_at`: Timestamps

#### `inventory_transactions`

- `id`: Primary key
- `product_id`: Foreign key to products
- `type`: in, out, adjustment
- `quantity`: Transaction quantity
- `previous_quantity`: Stock before transaction
- `new_quantity`: Stock after transaction
- `reference_type`, `reference_id`: For linking to related records
- `notes`: Transaction notes
- `created_by`: User who created transaction
- `created_at`, `updated_at`: Timestamps

## 🚀 Installation & Setup

### 1. Run Migrations

```bash
php artisan migrate
```

This will create all necessary tables for the inventory system.

### 2. Seed Sample Data (Optional)

```bash
php artisan db:seed --class=InventorySeeder
```

This creates:

- 5 sample products
- 2 sample packages (including the default "Standard" package at ₱4000)
- Product-package relationships

### 3. Install Frontend Dependencies

The frontend is already integrated with the existing Laravel Inertia + React setup. If you need to rebuild assets:

```bash
npm install
npm run build
```

Or for development:

```bash
npm run dev
```

## 📍 Routes

### Product Routes

- `GET /products` - List all products
- `GET /products/create` - Create product form
- `POST /products` - Store new product
- `GET /products/{id}` - View product details
- `GET /products/{id}/edit` - Edit product form
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product
- `POST /products/{id}/adjust-stock` - Adjust stock quantity

### Package Routes

- `GET /packages` - List all packages
- `GET /packages/create` - Create package form
- `POST /packages` - Store new package
- `GET /packages/{id}` - View package details
- `GET /packages/{id}/edit` - Edit package form
- `PUT /packages/{id}` - Update package
- `DELETE /packages/{id}` - Delete package

### Report Routes

- `GET /inventory-reports` - Inventory reports dashboard
- `GET /inventory-reports/export-csv` - Export to CSV
- `GET /inventory-reports/export-excel` - Export to Excel
- `GET /inventory-reports/export-pdf` - Export to PDF

## 🎨 Frontend Components

### Pages

- `Inventory/Products/Index.tsx` - Product listing with filters
- `Inventory/Products/Create.tsx` - Create product form
- `Inventory/Products/Edit.tsx` - Edit product form
- `Inventory/Products/Show.tsx` - Product details with stock adjustment
- `Inventory/Packages/Index.tsx` - Package listing
- `Inventory/Packages/Create.tsx` - Create package form
- `Inventory/Packages/Edit.tsx` - Edit package form
- `Inventory/Packages/Show.tsx` - Package details
- `Inventory/Reports/Index.tsx` - Comprehensive reports dashboard

### TypeScript Types

Location: `resources/js/types/inventory.ts`

- `Product`
- `Package`
- `InventoryTransaction`
- `InventoryStatistics`
- `PaginatedData<T>`

## 🔧 Backend Components

### Models

- `App\Models\Product` - Product model with relationships and scopes
- `App\Models\Package` - Package model with product relationships
- `App\Models\InventoryTransaction` - Transaction tracking model

### Controllers

- `App\Http\Controllers\ProductController` - Product CRUD operations
- `App\Http\Controllers\PackageController` - Package CRUD operations
- `App\Http\Controllers\InventoryReportController` - Reports and exports

### Services

- `App\Services\InventoryService` - Business logic for inventory operations
    - Stock transaction recording
    - Fast/slow moving product analysis
    - Stock level monitoring
    - Inventory statistics calculation

### Policies

- `App\Policies\ProductPolicy` - Product authorization
- `App\Policies\PackagePolicy` - Package authorization

### Export Classes

- `App\Exports\InventoryReportExport` - Excel/CSV export
- Multiple sheet classes for different report types

## 📊 Key Features Explained

### Fast & Slow Moving Products

The system tracks product movement over a configurable period (default 30 days):

- **Fast Moving**: Products with high outgoing transaction volume
- **Slow Moving**: Products with low or no outgoing transactions

This helps with:

- Inventory optimization
- Purchasing decisions
- Promotional planning

### Expiration Tracking

Products can have expiration dates with automatic alerts:

- **Expired**: Products past their expiration date
- **Expiring Soon**: Products expiring within 30 days

Alerts appear:

- In product listings (badges)
- On product detail pages
- In inventory reports
- In the reports dashboard

### Stock Adjustment System

Stock can be adjusted through:

1. **Stock In**: Adding inventory
2. **Stock Out**: Removing inventory
3. **Adjustment**: Setting exact quantity

All adjustments are:

- Tracked in `inventory_transactions` table
- Audited with user information
- Displayed in product history

### Low Stock Warnings

The system compares `stock_quantity` with `reorder_level`:

- Visual warnings in listings
- Dedicated low stock report
- Dashboard statistics
- Export capabilities for reorder planning

## 🔐 Security

- All routes protected by `auth` and `verified` middleware
- Policy-based authorization on all operations
- Role-based access control
- Soft deletes prevent accidental data loss
- User tracking on all create/update operations

## 🎯 Usage Examples

### Creating a Product (Admin)

1. Navigate to "Inventory" → "Products" in sidebar
2. Click "Add Product"
3. Fill in product details:
    - Name, SKU, Description
    - Price and initial stock quantity
    - Reorder level (low stock threshold)
    - Expiration date (optional)
4. Click "Create Product"

### Adjusting Stock (Releasing Personnel/Admin)

1. Open product details page
2. Click "Adjust Stock"
3. Select transaction type:
    - Stock In: Adding inventory
    - Stock Out: Removing inventory
    - Adjustment: Set exact quantity
4. Enter quantity and notes
5. Submit adjustment

### Creating a Package (Admin)

1. Navigate to "Inventory" → "Packages"
2. Click "Add Package"
3. Enter package details
4. Add products:
    - Select product from dropdown
    - Specify quantity per package
5. Set package price
6. Save package

### Generating Reports (Admin/Releasing Personnel)

1. Navigate to "Inventory Reports"
2. Set filters:
    - Date range
    - Product (optional)
    - Days period for movement analysis
3. View statistics and tables
4. Export as needed:
    - CSV for data analysis
    - Excel for spreadsheets
    - PDF for printing/sharing

## 📝 Notes

- The default "Standard" package is priced at ₱4000 as specified
- All monetary values are displayed in Philippine Pesos (₱)
- The system uses soft deletes - deleted items can be restored if needed
- Transaction history is immutable for audit purposes
- Stock adjustments are atomic and transactional

## 🔄 Future Enhancements

Possible future additions:

- Barcode scanning for products
- Batch/lot tracking
- Serial number tracking
- Multi-location inventory
- Automated reorder suggestions
- Supplier management
- Purchase order integration
- More advanced analytics and forecasting

## 📞 Support

For issues or questions about the Inventory System, please refer to the main application documentation or contact the development team.

---

**Version**: 1.0  
**Last Updated**: October 25, 2025  
**Laravel Version**: 12.x  
**Compatible with**: Inertia.js + React + TypeScript
