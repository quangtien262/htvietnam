# Fix: WHMCS Invoice Column Name Error

## 🐛 Lỗi

```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'date' in 'order clause'
SQL: select * from `whmcs_invoices` where `whmcs_invoices`.`deleted_at` is null 
     order by `date` desc limit 20 offset 0
```

## 🔍 Nguyên nhân

Controller `InvoiceController.php` đang sử dụng sai tên cột:
- ❌ Dùng `date` - cột không tồn tại
- ❌ Dùng `invoice_number` - cột không tồn tại

Trong khi migration định nghĩa:
- ✅ Cột `created_at` - timestamp tạo invoice
- ✅ Cột `number` - mã số hóa đơn
- ✅ Cột `due_date` - hạn thanh toán
- ✅ Cột `paid_at` - ngày thanh toán

## ✅ Giải pháp

### File: `app/Http/Controllers/Admin/Whmcs/InvoiceController.php`

#### 1. Fix filter theo date range (lines 36, 39)

**Before:**
```php
// Filter by date range
if ($request->has('date_from')) {
    $query->where('date', '>=', $request->date_from);
}
if ($request->has('date_to')) {
    $query->where('date', '<=', $request->date_to);
}
```

**After:**
```php
// Filter by date range
if ($request->has('date_from')) {
    $query->where('created_at', '>=', $request->date_from);
}
if ($request->has('date_to')) {
    $query->where('created_at', '<=', $request->date_to);
}
```

**Lý do:** 
- Filter theo ngày tạo invoice (`created_at`)
- Nếu muốn filter theo due date thì dùng `due_date`
- Nếu muốn filter theo ngày thanh toán thì dùng `paid_at`

#### 2. Fix search theo invoice number (line 44)

**Before:**
```php
// Search by invoice number
if ($request->has('search')) {
    $query->where('invoice_number', 'like', "%{$request->search}%");
}
```

**After:**
```php
// Search by invoice number
if ($request->has('search')) {
    $query->where('number', 'like', "%{$request->search}%");
}
```

**Lý do:** Cột đúng là `number` không phải `invoice_number`

#### 3. Fix orderBy (line 47)

**Before:**
```php
$invoices = $query->orderBy('date', 'desc')
    ->paginate($request->per_page ?? 20);
```

**After:**
```php
$invoices = $query->orderBy('created_at', 'desc')
    ->paginate($request->per_page ?? 20);
```

**Lý do:** Sort theo ngày tạo mới nhất

## 📊 Schema Reference

### Table: whmcs_invoices

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `number` | string (unique) | Mã số hóa đơn (VD: INV-2025-001) |
| `client_id` | bigint (nullable) | FK → users.id |
| `status` | string | unpaid, paid, cancelled, refunded |
| `currency` | string(3) | VND, USD, EUR |
| `subtotal` | decimal(15,2) | Tổng tiền trước thuế |
| `tax_total` | decimal(15,2) | Tổng thuế |
| `credit_applied` | decimal(15,2) | Số tiền credit đã dùng |
| `total` | decimal(15,2) | Tổng tiền cuối cùng |
| `due_date` | date (nullable) | **Hạn thanh toán** |
| `paid_at` | timestamp (nullable) | **Ngày đã thanh toán** |
| `notes` | text (nullable) | Ghi chú |
| `created_at` | timestamp | **Ngày tạo invoice** |
| `updated_at` | timestamp | Ngày cập nhật |
| `deleted_at` | timestamp (nullable) | Soft delete |

## 🎯 Các cột date trong whmcs_invoices

| Cột | Dùng cho gì | Example |
|-----|-------------|---------|
| `created_at` | Ngày tạo invoice | 2025-11-10 14:30:00 |
| `due_date` | Hạn thanh toán | 2025-11-20 |
| `paid_at` | Ngày khách đã thanh toán | 2025-11-18 09:15:00 |
| `updated_at` | Lần cuối sửa invoice | 2025-11-19 16:45:00 |

## 🧪 Testing

### Test 1: List invoices (sort by created_at)
```bash
curl -X GET "http://localhost:8000/aio/api/whmcs/invoices" \
  -H "Accept: application/json"
```

**Expected:** ✅ Invoices sorted by created_at DESC

### Test 2: Filter by date range
```bash
curl -X GET "http://localhost:8000/aio/api/whmcs/invoices?date_from=2025-11-01&date_to=2025-11-30" \
  -H "Accept: application/json"
```

**Expected:** ✅ Invoices created between Nov 1-30, 2025

### Test 3: Search by invoice number
```bash
curl -X GET "http://localhost:8000/aio/api/whmcs/invoices?search=INV-2025" \
  -H "Accept: application/json"
```

**Expected:** ✅ Invoices with number containing "INV-2025"

## 💡 Recommendations

### Option 1: Keep current (filter by created_at) ✅ CURRENT

Ưu điểm:
- Đơn giản, trực quan
- Filter theo "invoices created in date range"
- Phù hợp với UI "Danh sách hóa đơn theo ngày tạo"

### Option 2: Add multiple date filter options

Cho phép user chọn filter theo:
```php
// Controller
$dateField = $request->date_field ?? 'created_at'; // created_at, due_date, paid_at

if ($request->has('date_from')) {
    $query->where($dateField, '>=', $request->date_from);
}
if ($request->has('date_to')) {
    $query->where($dateField, '<=', $request->date_to);
}
```

Frontend thêm select:
```tsx
<Select defaultValue="created_at">
  <Option value="created_at">Ngày tạo</Option>
  <Option value="due_date">Hạn thanh toán</Option>
  <Option value="paid_at">Ngày thanh toán</Option>
</Select>
```

Ưu điểm:
- Linh hoạt hơn
- User có nhiều cách filter
- Phù hợp với báo cáo phức tạp

Nhược điểm:
- Phức tạp hơn
- UI cần thêm control

## 📝 Changes Summary

| File | Changes | Status |
|------|---------|--------|
| `app/Http/Controllers/Admin/Whmcs/InvoiceController.php` | Fixed 3 column name errors | ✅ |
| - Line 36, 39 | `date` → `created_at` | ✅ |
| - Line 44 | `invoice_number` → `number` | ✅ |
| - Line 47 | `orderBy('date')` → `orderBy('created_at')` | ✅ |

## ✅ Result

- ✅ No more "Unknown column 'date'" error
- ✅ Invoices list page working
- ✅ Filter by date range working
- ✅ Search by invoice number working
- ✅ Sort by created_at DESC working

---

**Date:** 11/11/2025  
**Fixed by:** AI Assistant  
**Status:** ✅ FIXED  
**Branch:** whmcs
