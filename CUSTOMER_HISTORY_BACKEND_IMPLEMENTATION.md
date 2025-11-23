# Customer Detail History Feature - Backend Implementation

## Overview
Implemented 4 new API endpoints to support comprehensive customer history tracking in the SPA management system.

## Date: 2025-11-30

## Files Modified/Created

### 1. Routes (`routes/spa_route.php`)
Added 4 new routes to the customer route group:

```php
Route::get('/{id}/purchase-history', [KhachHangController::class, 'purchaseHistory']);
Route::get('/{id}/gift-cards', [KhachHangController::class, 'giftCardHistory']);
Route::get('/{id}/package-usage', [KhachHangController::class, 'packageUsageHistory']);
Route::get('/{id}/debts', [KhachHangController::class, 'debtHistory']);
```

### 2. Controller (`app/Http/Controllers/Admin/Spa/KhachHangController.php`)
Added 4 new methods:

#### `purchaseHistory($id)`
- **Endpoint**: GET `/aio/api/spa/customers/{id}/purchase-history`
- **Purpose**: Get customer's invoice history
- **Data Source**: `spa_hoa_don` table
- **Relations**: Includes invoice details with services and products
- **Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ma_hoa_don": "HD001",
      "ngay_ban": "2025-11-20 14:30:00",
      "tong_tien": 500000,
      "trang_thai": "da_thanh_toan",
      "chi_tiet": [
        {
          "id": 1,
          "ten": "Massage body",
          "so_luong": 1,
          "don_gia": 500000,
          "thanh_tien": 500000,
          "loai": "dich_vu"
        }
      ]
    }
  ]
}
```

#### `giftCardHistory($id)`
- **Endpoint**: GET `/aio/api/spa/customers/{id}/gift-cards`
- **Purpose**: Get customer's gift card purchase history
- **Data Source**: `spa_giao_dich_vi` table (transactions with `loai_giao_dich` = 'nap' or 'code' and `the_gia_tri_id` is not null)
- **Relations**: Includes gift card details
- **Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ma_the": "GC001",
      "ten_the": "Thẻ Spa 500k",
      "menh_gia": 500000,
      "so_du": 300000,
      "ngay_mua": "2025-11-01 10:00:00",
      "ngay_het_han": "2026-11-01",
      "trang_thai": "active"
    }
  ]
}
```

#### `packageUsageHistory($id)`
- **Endpoint**: GET `/aio/api/spa/customers/{id}/package-usage`
- **Purpose**: Get customer's service package usage history
- **Data Source**: `spa_hoa_don_chi_tiet` table where `su_dung_goi` is not null
- **Relations**: Includes package details, service details, invoice, and staff (KTV)
- **Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ten_goi": "Gói Spa 10 lần",
      "ten_dich_vu": "Massage body",
      "ngay_su_dung": "2025-11-20 10:00:00",
      "nhan_vien": "Nguyễn Văn A",
      "ghi_chu": "Khách hài lòng"
    }
  ]
}
```

#### `debtHistory($id)`
- **Endpoint**: GET `/aio/api/spa/customers/{id}/debts`
- **Purpose**: Get customer's debt records
- **Data Source**: `cong_no` table (where `loai_cong_no` = 1 for receivables from customers)
- **Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ma_cong_no": "CN001",
      "so_tien": 1000000,
      "so_tien_da_tra": 500000,
      "so_tien_con_lai": 500000,
      "ngay_tao": "2025-11-15 08:00:00",
      "han_thanh_toan": "2025-12-15",
      "trang_thai": "thanh_toan_mot_phan"
    }
  ]
}
```

### 3. Model Created (`app/Models/Spa/CustomerPackage.php`)
Created new model for `spa_customer_packages` table to support package usage queries.

**Features**:
- Maps to `spa_customer_packages` table
- Includes relationships: `khachHang`, `goiDichVu`, `hoaDon`
- Scopes: `active()`, `expired()`, `usedUp()`
- Accessor: `so_luong_con_lai` (remaining uses)

## Database Tables Used

| Table | Purpose |
|-------|---------|
| `spa_hoa_don` | Purchase invoices |
| `spa_hoa_don_chi_tiet` | Invoice line items (for package usage tracking) |
| `spa_giao_dich_vi` | Wallet transactions (for gift card purchases) |
| `spa_the_gia_tri` | Gift card master data |
| `spa_customer_packages` | Customer package purchases |
| `cong_no` | Debt/receivables tracking |

## Implementation Details

### Error Handling
All methods include try-catch blocks:
- Success: Returns JSON with `success: true` and data
- Error: Returns JSON with `success: false` and error message with appropriate HTTP status code (500)

### Query Optimization
- Used eager loading (`with()`) to prevent N+1 queries
- Ordered results by date descending (most recent first)
- Filtered data at database level for efficiency

### Data Mapping
- All responses use `map()` to transform database models into frontend-compatible format
- Matches TypeScript interfaces defined in `SpaCustomerList.tsx`
- Handles null values gracefully

## Frontend Integration

These endpoints are already integrated in `resources/js/pages/spa/SpaCustomerList.tsx`:
- Data fetching functions: `fetchPurchaseHistory()`, `fetchGiftCardHistory()`, `fetchPackageUsageHistory()`, `fetchDebtHistory()`
- UI: 5 tabs showing customer info and 4 history categories
- Auto-loads all data when customer detail drawer opens

## Testing Checklist

- [ ] Test purchase history endpoint with customer who has invoices
- [ ] Test purchase history endpoint with customer who has no invoices (should return empty array)
- [ ] Test gift card history endpoint with customer who bought gift cards
- [ ] Test gift card history endpoint with customer who has no gift cards
- [ ] Test package usage endpoint with customer who used package services
- [ ] Test package usage endpoint with customer who has no package usage
- [ ] Test debt history endpoint with customer who has debts
- [ ] Test debt history endpoint with customer who has no debts
- [ ] Test with invalid customer ID (should return 500 with error message)
- [ ] Verify response format matches frontend TypeScript interfaces
- [ ] Check data sorting (newest first)
- [ ] Verify relationships load correctly (eager loading working)

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/aio/api/spa/customers/{id}/purchase-history` | Get invoice history |
| GET | `/aio/api/spa/customers/{id}/gift-cards` | Get gift card purchases |
| GET | `/aio/api/spa/customers/{id}/package-usage` | Get package usage records |
| GET | `/aio/api/spa/customers/{id}/debts` | Get debt records |

## Status: ✅ COMPLETE

All 4 backend API endpoints have been successfully implemented and are ready for testing.
