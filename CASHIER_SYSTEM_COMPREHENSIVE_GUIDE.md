# Cashier & Releasing System - Comprehensive Staff Guide

## Table of Contents

1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [Cashier Registration Module](#cashier-registration-module)
4. [Point of Sale (POS) System](#point-of-sale-pos-system)
5. [Order Management Workflow](#order-management-workflow)
6. [Bulk Operations](#bulk-operations)
7. [Inventory Management](#inventory-management)
8. [Reports & Analytics](#reports--analytics)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Barcode Scanning](#barcode-scanning)
11. [Role-Based Permissions](#role-based-permissions)
12. [Troubleshooting](#troubleshooting)
13. [Best Practices](#best-practices)

---

## System Overview

The Cashier & Releasing System is designed to streamline the process of member registration, product sales, order fulfillment, and inventory management. The system features two main roles:

- **Cashier**: Handles member registrations, creates orders, processes payments
- **Releasing Personnel**: Manages product releases and order fulfillment

### Key Features

✅ Member registration with package selection
✅ Point-of-sale for product orders
✅ Multi-stage order workflow (Pending → Payment → Release → Completed)
✅ Bulk operations for efficient order processing
✅ Real-time inventory tracking with low stock warnings
✅ Comprehensive reporting and analytics
✅ Barcode scanning support
✅ Keyboard shortcuts for power users
✅ Activity logging and audit trail
✅ Role-based access control

---

## Getting Started

### Login & Dashboard Access

1. **Login**: Navigate to the login page and enter your credentials
2. **Dashboard**: After login, you'll be redirected to your role-specific dashboard
3. **Navigation**: Use the sidebar to access different modules

### Initial Setup

**For Cashiers:**

- Ensure your staff profile is complete
- Verify your payment method access
- Check inventory levels before starting shifts

**For Releasing Personnel:**

- Confirm access to release area
- Verify product storage locations
- Check for any pending releases

---

## Cashier Registration Module

### Purpose

Register new members with package purchases.

### Step-by-Step Process

#### 1. Access Registration Page

- Navigate to **Cashier → Registration**
- You'll see a form for member details and transaction history

#### 2. Enter Member Information

Fill in the following required fields:

- **First Name** (required)
- **Last Name** (required)
- **Middle Name** (optional)
- **Mobile Number** (required)
- **Email Address** (required, must be unique)

#### 3. Select Package

- Choose from available registration packages
- View package contents (products included)
- Package price is displayed automatically

#### 4. Payment Method

- Select payment method (Cash, Bank Transfer, GCash, etc.)
- Ensure payment is collected before proceeding

#### 5. Assign Sponsor (Optional)

- Search for sponsor by name or Member ID (MID)
- Leave blank to auto-assign later

#### 6. Submit Registration

- Click "Register Member" button
- System generates:
    - Transaction number
    - Member ID (MID)
    - Registration PIN
    - Kick-start token

#### 7. Provide Details to Member

Give the member:

- Email and temporary password (`password123`)
- Member ID (MID)
- Registration PIN
- Instruct them to change password on first login

### Transaction History

- View last 50 registrations
- Shows: Date, Transaction #, Payment Method, Email, PIN
- Automatically refreshes after new registration

### Tips

💡 Verify email address before submission to avoid registration errors
💡 Double-check payment method matches actual payment received
💡 Keep transaction records for reconciliation

---

## Point of Sale (POS) System

### Purpose

Create product orders for existing members.

### Access

Navigate to **Cashier → POS**

### Interface Layout

The POS system has 6 tabs:

1. **Ordering** - Browse and add products to cart
2. **Pending** - Orders awaiting payment processing
3. **For Payment** - Orders ready for payment collection
4. **For Release** - Paid orders ready for product release
5. **Completed** - Fulfilled orders
6. **Cancelled** - Cancelled orders

---

### Creating an Order (Ordering Tab)

#### 1. Browse Products

- **Search**: Type product name or SKU in search bar
- **Filter**: Use category dropdown to filter products
- **View Stock**: Products show current stock levels
    - ⚠️ Low stock items are highlighted in amber
    - 🔴 Out of stock items cannot be added

#### 2. Add Products to Cart

- Click "Add to Cart" on product cards
- Cart icon (bottom right) shows item count
- Badge shows total items in cart

#### 3. Open Cart

- Click floating cart button (bottom right)
- Or press `Ctrl + B`

#### 4. Review Cart

- View all items
- Adjust quantities with +/- buttons
- Remove items with X button
- Clear entire cart if needed

#### 5. Select Member Account

- Search member by name or MID
- Member information displays after selection

#### 6. Select Payment Method

- Choose from available payment methods
- Match with actual payment type

#### 7. Review Totals

- Subtotal: Total before tax
- Tax (8%): Calculated automatically
- Total: Final amount to collect

#### 8. Create Order

- Click "Create Order" button
- Or press `Ctrl + Enter`
- Order moves to **Pending** tab
- Cart clears automatically

---

### Processing Orders (Pending Tab)

#### Purpose

Review and move orders to payment queue.

#### Actions

1. Review order details
2. Click "Move to Payment" to queue for payment
3. Or "Cancel" if order needs to be cancelled

#### When to Use

- Verify order details before payment collection
- Confirm member information
- Check product availability

---

### Collecting Payment (For Payment Tab)

#### Purpose

Confirm payment has been received.

#### Process

1. **View Order**: Review order amount and payment method
2. **Collect Payment**: Physically collect payment from member
3. **Verify Amount**: Confirm amount matches order total
4. **Mark as Paid**: Click "Mark as Paid" button
5. **Confirmation Dialog**: Review payment details
6. **Confirm**: Click "Confirm Payment"
7. **Order moves to "For Release"** tab automatically

#### Important

⚠️ **Only mark as paid after payment is physically received**
⚠️ Verify payment method matches what member provided
⚠️ Count cash carefully before confirming

---

### Releasing Products (For Release Tab)

#### Purpose

Release products to members and mark order complete.

#### Process

1. **Prepare Products**: Gather all items from order
2. **Verify Items**: Double-check quantities match order
3. **Click "Release Order"**
4. **Enter Recipient Name**: Person receiving the products
    - Can be the member themselves
    - Or authorized representative
5. **Hand Over Products**: Physically give products to recipient
6. **Confirm Release**: Click "Release Order"
7. **Order moves to "Completed"** tab

#### Recipient Name Guidelines

- Full name of person receiving items
- Ask for ID if unfamiliar
- Note if not the original member
- e.g., "Juan Dela Cruz", "Maria Santos (Representative)"

---

### Completed Orders

#### Purpose

View fulfilled orders and print receipts.

#### Actions

- **View Details**: Click on order card
- **Print Receipt**: Click "Print Receipt" button
- **Review History**: Check completion date and recipient

---

### Cancelled Orders

#### Purpose

View and track cancelled orders.

#### When Orders are Cancelled

- Member requested cancellation before payment
- Payment issues
- Product unavailability
- Incorrect order details

---

## Bulk Operations

### Purpose

Process multiple orders simultaneously for efficiency.

### Accessing Bulk Mode

#### 1. Enable Selection

- Navigate to any order tab (For Payment, For Release, etc.)
- Hold `Shift` and click on order cards to select multiple
- Or press `Ctrl + A` to select all visible orders

#### 2. Bulk Action Bar Appears

- Shows selected count
- Displays available bulk actions

### Available Bulk Operations

#### Bulk Mark as Paid

**When to Use**: Multiple orders ready for payment confirmation
**Steps**:

1. Select orders from "For Payment" tab
2. Click "Mark as Paid" in bulk action bar
3. Confirm action
4. System processes all selected orders
5. View results (success count + any failures)

#### Bulk Release Orders

**When to Use**: Multiple orders ready for release
**Steps**:

1. Select orders from "For Release" tab
2. Click "Release Orders"
3. Enter recipient name (will apply to all)
4. Confirm bulk release
5. Review results

#### Bulk Cancel

**When to Use**: Need to cancel multiple orders
**Steps**:

1. Select orders from Pending or For Payment tabs
2. Click "Cancel"
3. Confirm cancellation
4. Orders move to Cancelled tab

### Tips for Bulk Operations

💡 Max 50 orders per bulk operation
💡 Review selected orders before confirming
💡 Failed operations show specific reasons
💡 Successful operations are logged in activity history

---

## Inventory Management

### Low Stock Warnings

#### Automatic Alerts

- System shows inventory warning banner when products are low
- Click banner to view details
- Shows:
    - Products below threshold
    - Current stock levels
    - Out of stock count

#### Monitoring Stock

- **During Ordering**: Products show stock levels
- **Low Stock Badge**: Amber warning on products
- **Out of Stock**: Cannot add to cart

#### When Stock is Low

1. Notify inventory manager
2. Consider alternative products
3. Inform members if product unavailable
4. Check restocking schedule

---

## Reports & Analytics

### Accessing Reports

Navigate to **Cashier → Reports**

### Available Reports

#### 1. Summary Statistics

- Total orders (by status)
- Total sales amount
- Order counts by status
- Current date range

#### 2. Daily Sales Trend

- Chart showing sales over time
- Orders per day
- Revenue per day

#### 3. Payment Method Breakdown

- Pie chart of payment methods
- Total per method
- Count per method

#### 4. Top Selling Products

- Best-selling products in date range
- Quantity sold
- Revenue generated

#### 5. Activity Log

- Recent actions taken
- Timestamps
- Action types

### Using Reports

#### Filter by Date

1. Select "Date From"
2. Select "Date To"
3. Click "Apply Filters"
4. Reports update automatically

#### Export Reports

- Use print functionality (Ctrl + P)
- Save as PDF for records
- Share with management as needed

---

## Keyboard Shortcuts

### General Shortcuts

- `Ctrl + K`: Focus search bar
- `Ctrl + B`: Open/close cart
- `Ctrl + Enter`: Submit current form/order
- `Esc`: Close open dialogs/modals

### Navigation

- `Tab`: Navigate between tabs
- `1`: Switch to Ordering tab
- `2`: Switch to Pending tab
- `3`: Switch to For Payment tab
- `4`: Switch to For Release tab
- `5`: Switch to Completed tab
- `6`: Switch to Cancelled tab

### Selection

- `Ctrl + A`: Select all visible orders
- `Shift + Click`: Select multiple orders
- `Ctrl + D`: Deselect all

### View Shortcuts Help

- Click "Shortcuts" button in toolbar
- Or press `?` key

---

## Barcode Scanning

### Setup

1. Connect USB barcode scanner
2. No special configuration needed
3. Scanner acts as keyboard input

### Scanning Products

1. Navigate to **Ordering** tab in POS
2. Ensure focus is NOT in any text input
3. Scan product barcode
4. Scanner automatically sends Enter key
5. Product adds to cart if found

### Tips

💡 Scanner must be in "keyboard emulation" mode
💡 Keep barcode labels clean and readable
💡 Scan will auto-clear after 100ms of inactivity
💡 If scan fails, verify product SKU in system

---

## Role-Based Permissions

### Cashier Role

**Can:**

- ✅ Register new members
- ✅ Create orders
- ✅ Mark orders as paid
- ✅ Move orders to payment
- ✅ Cancel orders (before completion)
- ✅ View their own orders
- ✅ Access basic reports

**Cannot:**

- ❌ Release orders (unless granted permission)
- ❌ View other cashiers' orders
- ❌ Modify completed orders

### Releasing Personnel

**Can:**

- ✅ View orders ready for release
- ✅ Mark orders as released
- ✅ Enter recipient information
- ✅ Print receipts
- ✅ View completed orders

**Cannot:**

- ❌ Create new orders
- ❌ Modify payment status
- ❌ Cancel completed orders

### Superadmin

**Can:**

- ✅ All cashier permissions
- ✅ All releasing personnel permissions
- ✅ View all reports
- ✅ Manage staff profiles
- ✅ Configure system settings
- ✅ Access activity logs

### Checking Your Permissions

- View staff profile in dashboard
- Permissions display in account settings
- Contact admin for permission changes

---

## Troubleshooting

### Common Issues & Solutions

#### "Member email already exists"

**Problem**: Email is already registered
**Solution**:

- Verify email with member
- Check if they're already in system
- Use different email if member has multiple

#### "Product out of stock"

**Problem**: Trying to add unavailable product
**Solution**:

- Check low stock alert
- Offer alternative products
- Notify member of restock date

#### "Order not found"

**Problem**: Cannot locate order
**Solution**:

- Use search function (transaction #, MID, member name)
- Check different status tabs
- Verify if order was cancelled

#### "Cannot mark as paid"

**Problem**: Button disabled or errors
**Solution**:

- Verify order is in correct status (Pending or For Payment)
- Check permissions
- Refresh page if issue persists

#### "Barcode scanner not working"

**Problem**: Scans not registering
**Solution**:

- Check USB connection
- Verify scanner is in keyboard mode
- Ensure focus is not in text input
- Test scanner in notepad to verify functionality

#### "Cart items disappeared"

**Problem**: Items removed from cart
**Solution**:

- Cart clears after successful order
- Cart may clear on page refresh
- Check if order was already created in Pending tab

---

## Best Practices

### For Cashiers

#### Starting Your Shift

1. ✅ Log in and verify your profile information
2. ✅ Check inventory warnings
3. ✅ Review pending orders from previous shift
4. ✅ Ensure payment methods are available
5. ✅ Test barcode scanner if using

#### During Operations

1. ✅ Double-check member information before submitting
2. ✅ Verify payment before marking as paid
3. ✅ Keep workspace organized
4. ✅ Process orders in chronological order
5. ✅ Use bulk operations for efficiency
6. ✅ Monitor inventory levels
7. ✅ Use keyboard shortcuts to speed up workflow

#### End of Shift

1. ✅ Complete all pending orders
2. ✅ Reconcile payments received
3. ✅ Review daily sales report
4. ✅ Note any issues for next shift
5. ✅ Log out properly

### For Releasing Personnel

#### Starting Your Shift

1. ✅ Check orders ready for release
2. ✅ Verify product availability in storage
3. ✅ Prepare packing materials
4. ✅ Review any special instructions

#### During Operations

1. ✅ Verify order details before release
2. ✅ Count products carefully
3. ✅ Check product quality
4. ✅ Confirm recipient identity
5. ✅ Get recipient name/signature
6. ✅ Use bulk release for multiple orders

#### End of Shift

1. ✅ Complete all ready releases
2. ✅ Organize remaining products
3. ✅ Report any discrepancies
4. ✅ Update next shift on pending items
5. ✅ Log out properly

### Data Accuracy

- ✅ Always verify member information
- ✅ Count cash carefully
- ✅ Confirm product quantities
- ✅ Double-check transaction numbers
- ✅ Use correct payment methods

### Communication

- ✅ Be clear with members about process
- ✅ Explain wait times for releases
- ✅ Inform about product availability
- ✅ Report system issues immediately
- ✅ Coordinate with other staff

### Security

- ✅ Never share your login credentials
- ✅ Lock screen when away from desk
- ✅ Verify member identity for releases
- ✅ Keep cash secure
- ✅ Report suspicious activities

---

## Quick Reference Card

### Order Status Flow

```
1. Created (Ordering)
   ↓
2. Pending
   ↓
3. For Payment
   ↓
4. For Release
   ↓
5. Completed
```

### Essential Shortcuts

- `Ctrl + K` - Search
- `Ctrl + B` - Cart
- `Ctrl + Enter` - Submit
- `1-6` - Switch tabs

### Key Contacts

- **Technical Support**: [IT Department]
- **Inventory Issues**: [Inventory Manager]
- **Payment Disputes**: [Accounting Department]
- **System Administrator**: [Admin Contact]

---

## Glossary

- **MID**: Member ID - Unique identifier for each member
- **Transaction #**: Unique number for each order/registration
- **PIN**: Registration PIN for new members
- **SKU**: Stock Keeping Unit - Product identifier
- **Bulk Operation**: Processing multiple orders at once
- **Low Stock Threshold**: Minimum quantity before warning
- **Kick-start Token**: Unique token for new member activation

---

## Training Checklist

### New Cashier Training

- [ ] System login and navigation
- [ ] Member registration process
- [ ] Creating POS orders
- [ ] Processing payments
- [ ] Using search and filters
- [ ] Keyboard shortcuts
- [ ] Barcode scanning (if applicable)
- [ ] Handling cancellations
- [ ] Viewing reports
- [ ] End-of-shift procedures

### New Releasing Personnel Training

- [ ] System login and navigation
- [ ] Viewing orders for release
- [ ] Product preparation
- [ ] Recipient verification
- [ ] Marking orders as released
- [ ] Bulk release operations
- [ ] Printing receipts
- [ ] Handling discrepancies
- [ ] End-of-shift procedures

---

## Updates & Support

### System Updates

- Check for announcements in dashboard
- New features will be highlighted
- Training provided for major changes

### Getting Help

1. Check this documentation first
2. Ask supervisor or experienced staff
3. Contact technical support
4. Report bugs to system administrator

### Feedback

Your feedback helps improve the system:

- Report any difficulties
- Suggest improvements
- Share workflow tips
- Participate in training updates

---

**Document Version**: 1.0
**Last Updated**: October 2025
**Next Review**: Monthly

---

_For technical documentation, see INVENTORY_SYSTEM_DOCUMENTATION.md and ENCASHMENT_FEATURE_DOCUMENTATION.md_
