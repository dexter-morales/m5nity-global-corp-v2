# Encashment Feature Documentation

## Overview

The Encashment feature allows members to request withdrawal of their earned income. The feature includes a multi-stage approval workflow involving Admin, Accounting, and Cashier roles with complete audit trail tracking.

---

## Features Implemented

### 1. **Member Encashment Requests**

- Members can view their available balance
- Submit encashment requests with minimum amount validation
- Track request status in real-time
- View detailed history of all their encashments

### 2. **Admin Approval**

- Review pending encashment requests
- Approve or reject requests with notes
- View member information and balance details
- Complete rejection reason tracking

### 3. **Accounting Processing**

- Process approved encashments
- Generate unique voucher numbers
- Select payment type (Voucher, Cheque, Bank Transfer)
- Add processing notes for record-keeping

### 4. **Cashier Release**

- Release processed encashments
- Record who received the payment
- Add release notes
- Complete the encashment cycle

### 5. **Audit Trail & Logging**

- Track who approved (Admin)
- Track who processed (Accounting)
- Track who released (Cashier)
- Track who received (Member/Authorized Person)
- Timestamp all actions
- Store notes at each stage

### 6. **Print & Documentation**

- Print vouchers for payment
- Generate CEO approval forms
- Professional formatted documents
- All required information included

---

## Technical Implementation

### Backend (Laravel)

#### Database Migration

**File:** `database/migrations/2025_10_25_000000_create_encashments_table.php`

Creates the `encashments` table with:

- Member and account references
- Unique encashment and voucher numbers
- Status tracking (pending, approved, processed, released, rejected, cancelled)
- Notes fields for each role
- Approval trail tracking
- Timestamps for all actions
- Soft deletes for archival

#### Model

**File:** `app/Models/Encashment.php`

- Eloquent relationships to User and MemberInfo
- Helper methods for status validation
- Type casting for dates and amounts

#### Controller

**File:** `app/Http/Controllers/EncashmentController.php`

Endpoints:

- `index()` - List encashments (role-filtered)
- `store()` - Create new encashment request (Member)
- `approve()` - Approve request (Admin)
- `reject()` - Reject request (Admin)
- `process()` - Process and generate voucher (Accounting)
- `release()` - Release payment (Cashier)
- `show()` - View details

Auto-generates:

- Encashment numbers (ENC{YEAR}{MONTH}{SEQUENCE})
- Voucher numbers (VCH{YEAR}{MONTH}{SEQUENCE})

#### Routes

**File:** `routes/encashments.php`

Organized by role:

- `/encashments` - Member routes
- `/admin/encashments` - Admin routes
- `/accounting/encashments` - Accounting routes
- `/cashier/encashments` - Cashier routes

All routes protected by authentication and role middleware.

#### Updated Models

**File:** `app/Models/MemberInfo.php`

Added methods:

- `getTotalIncome()` - Calculate total earnings
- `getTotalEncashed()` - Calculate total encashed amount
- `getAvailableBalance()` - Calculate available balance for encashment

---

### Frontend (React + TypeScript)

#### Type Definitions

**File:** `resources/js/types/encashment.ts`

TypeScript interfaces for:

- Encashment entity
- Status types
- Payment types

#### Main Index Page

**File:** `resources/js/pages/Encashments/Index.tsx`

Features:

- Role-based view (Member, Admin, Accounting, Cashier)
- Balance cards for members (Available, Total Income, Total Encashed)
- Encashment request form with validation
- Searchable and filterable list
- Status badges with color coding
- Inline action buttons based on role and status
- Admin approval/reject dialogs
- Accounting processing dialog
- Cashier release dialog
- Pagination support
- Real-time status updates

#### Detail/Show Page

**File:** `resources/js/pages/Encashments/Show.tsx`

Features:

- Complete encashment details
- Member information display
- Approval trail timeline
- Notes from all roles
- Print voucher functionality
- Print CEO approval form functionality
- Professional document templates
- Back navigation

#### UI Components

**Toast Notifications**

- **File:** `resources/js/components/ui/sonner.tsx`
- **File:** `resources/js/lib/notifier.ts`
- Replaced old React Toastify with ShadCN Sonner
- Modern, minimal design
- Theme-aware (light/dark mode)
- Success, error, info, warning, loading support

**Textarea Component**

- **File:** `resources/js/components/ui/textarea.tsx`
- ShadCN-styled textarea for notes
- Consistent with design system

#### Navigation

**Updated File:** `resources/js/components/app-sidebar.tsx`

Added encashment links for:

- Members: Under "Transactions" dropdown
- Cashier: Main sidebar item
- Admin: Main sidebar item
- Accounting: Main sidebar item

---

## User Flows

### Member Flow

1. View available balance on dashboard
2. Click "New Request" button
3. Enter amount (minimum ₱100)
4. Add optional notes
5. Submit request
6. Track status through the system
7. View details and timeline

### Admin Flow

1. View all pending encashment requests
2. Review member details and amount
3. Approve with notes or Reject with reason
4. View approval trail

### Accounting Flow

1. View all approved encashments
2. Select payment type (Voucher/Cheque/Bank Transfer)
3. Add processing notes
4. Process to generate voucher number
5. Print voucher for CEO approval

### Cashier Flow

1. View all processed encashments
2. Verify voucher details
3. Record recipient user ID
4. Add release notes
5. Mark as released
6. Print final documents

---

## Status Workflow

```
PENDING → APPROVED → PROCESSED → RELEASED
    ↓         ↓
 CANCELLED  REJECTED
```

- **PENDING**: Initial state after member submits request
- **APPROVED**: Admin has approved the request
- **PROCESSED**: Accounting has generated voucher
- **RELEASED**: Cashier has released payment to member
- **REJECTED**: Admin has rejected the request
- **CANCELLED**: Request was cancelled (future use)

---

## Security & Validation

### Backend Validation

- Amount must be minimum ₱100
- Amount cannot exceed available balance
- Role-based authorization on all endpoints
- Transaction logging for audit trail

### Frontend Validation

- Real-time balance checking
- Minimum amount enforcement
- Required field validation
- Confirmation dialogs for critical actions

### Audit Logging

- All actions logged in `storage/logs/Encashments_logs.log`
- Includes user ID, action, timestamp, and details

---

## Printing Features

### Voucher Template

Professional layout including:

- Company header
- Voucher and encashment numbers
- Payment type indicator
- Payee information
- Amount prominently displayed
- Signature blocks (Prepared, Approved, Received)
- Notes section
- Footer with generation timestamp

### CEO Approval Form

Executive approval document including:

- Formal header
- Complete request details
- Member information
- Approval trail
- Checkbox for Approved/Denied
- CEO signature section
- Notes area
- Confidentiality notice

Both documents auto-trigger print dialog on open.

---

## Database Schema

### Encashments Table

| Field             | Type          | Description                      |
| ----------------- | ------------- | -------------------------------- |
| id                | bigint        | Primary key                      |
| member_id         | bigint        | FK to members_info               |
| member_account_id | bigint        | FK to members_account (nullable) |
| encashment_no     | string        | Unique encashment number         |
| amount            | decimal(15,2) | Encashment amount                |
| status            | enum          | Current status                   |
| member_notes      | text          | Notes from member                |
| admin_notes       | text          | Notes from admin                 |
| accounting_notes  | text          | Notes from accounting            |
| cashier_notes     | text          | Notes from cashier               |
| approved_by       | bigint        | FK to users (admin)              |
| approved_at       | timestamp     | Approval timestamp               |
| processed_by      | bigint        | FK to users (accounting)         |
| processed_at      | timestamp     | Processing timestamp             |
| voucher_no        | string        | Generated voucher number         |
| payment_type      | enum          | voucher/cheque/bank_transfer     |
| released_by       | bigint        | FK to users (cashier)            |
| released_at       | timestamp     | Release timestamp                |
| received_by       | bigint        | FK to users (recipient)          |
| received_at       | timestamp     | Receive timestamp                |
| rejected_by       | bigint        | FK to users                      |
| rejected_at       | timestamp     | Rejection timestamp              |
| rejection_reason  | text          | Reason for rejection             |
| created_at        | timestamp     | Creation timestamp               |
| updated_at        | timestamp     | Last update timestamp            |
| deleted_at        | timestamp     | Soft delete timestamp            |

**Indexes:**

- status
- member_id
- encashment_no
- voucher_no
- created_at

---

## API Endpoints

### Member Routes

```
GET  /encashments              - List member's encashments
POST /encashments              - Create new request
GET  /encashments/{id}         - View details
```

### Admin Routes

```
GET  /admin/encashments           - List all encashments
POST /admin/encashments/{id}/approve - Approve request
POST /admin/encashments/{id}/reject  - Reject request
GET  /admin/encashments/{id}     - View details
```

### Accounting Routes

```
GET  /accounting/encashments        - List approved encashments
POST /accounting/encashments/{id}/process - Process and generate voucher
GET  /accounting/encashments/{id}   - View details
```

### Cashier Routes

```
GET  /cashier/encashments          - List processed encashments
POST /cashier/encashments/{id}/release - Release payment
GET  /cashier/encashments/{id}     - View details
```

---

## Design Philosophy

### UI/UX Principles

- **Clean & Minimal**: No flashy animations, focus on usability
- **Professional**: Business-appropriate design
- **Responsive**: Works on all screen sizes
- **Accessible**: Proper labels, ARIA attributes, keyboard navigation
- **Consistent**: Follows ShadCN design system

### Animations

Subtle, purposeful animations:

- Fade-in for modals/dialogs
- Smooth transitions between states
- Hover effects on interactive elements
- No distracting or excessive motion

### Color Coding

Status badges use consistent colors:

- Pending: Yellow
- Approved: Blue
- Processed: Purple
- Released: Green
- Rejected: Red
- Cancelled: Gray

---

## Installation & Setup

1. **Run Migration**

    ```bash
    php artisan migrate
    ```

2. **Install Frontend Dependencies**

    ```bash
    npm install
    ```

3. **Build Assets**

    ```bash
    npm run build
    # or for development
    npm run dev
    ```

4. **Clear Caches**
    ```bash
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    ```

---

## Testing Checklist

### Member Testing

- [ ] View available balance
- [ ] Submit encashment request
- [ ] Validation: amount too low
- [ ] Validation: amount exceeds balance
- [ ] View request list
- [ ] View request details
- [ ] Track status changes

### Admin Testing

- [ ] View all pending requests
- [ ] Approve request with notes
- [ ] Reject request with reason
- [ ] Filter by status
- [ ] Search functionality

### Accounting Testing

- [ ] View approved requests
- [ ] Process request with voucher type
- [ ] Process request with cheque type
- [ ] Verify voucher number generation
- [ ] Print voucher
- [ ] Print CEO approval form

### Cashier Testing

- [ ] View processed requests
- [ ] Release payment
- [ ] Record recipient
- [ ] Add release notes
- [ ] Verify completion

### Cross-Role Testing

- [ ] Authorization checks (users can only access their role's routes)
- [ ] Audit trail completeness
- [ ] Toast notifications working
- [ ] Navigation links present
- [ ] Print functionality
- [ ] Responsive design

---

## Future Enhancements

### Potential Features

1. Email notifications at each status change
2. Bulk approval for admins
3. Export to Excel/CSV
4. Dashboard widgets with statistics
5. SMS notifications
6. Digital signature integration
7. Scheduled auto-processing
8. Member withdrawal limits/policies
9. Multi-currency support
10. Integration with payment gateways

### Performance Optimization

1. Caching for frequently accessed data
2. Background job for voucher generation
3. Database indexing optimization
4. Lazy loading for large lists
5. API rate limiting

---

## Support & Maintenance

### Log Files

- **Location**: `storage/logs/Encashments_logs.log`
- **Contains**: All encashment-related actions and errors
- **Rotation**: Configured in `config/logging.php`

### Common Issues

**Issue**: Member can't submit request

- **Check**: Available balance calculation
- **Check**: Minimum amount validation
- **Check**: Member profile exists

**Issue**: Voucher number not generating

- **Check**: Database sequence
- **Check**: Date/time configuration
- **Check**: Unique constraint errors

**Issue**: Print dialog not opening

- **Check**: Popup blocker settings
- **Check**: Browser permissions
- **Check**: Console for JavaScript errors

---

## Technologies Used

### Backend

- Laravel 12
- PHP 8.2+
- MySQL/SQLite
- Eloquent ORM

### Frontend

- React 19
- TypeScript
- Inertia.js
- ShadCN UI
- Tailwind CSS
- Sonner (Toast)
- Lucide React (Icons)

### Development Tools

- Vite
- ESLint
- Prettier
- TypeScript Compiler

---

## Credits

Developed following modern web development best practices with focus on:

- Clean code principles
- Type safety
- User experience
- Security
- Maintainability
- Scalability

---

**Version**: 1.0.0  
**Last Updated**: October 25, 2025  
**Status**: Production Ready
