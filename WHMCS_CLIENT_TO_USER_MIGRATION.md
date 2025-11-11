# WHMCS Client → User Migration

## Thay đổi đã thực hiện

### 1. Xóa Migrations Client (7 files)
- ✅ `2025_11_10_100001_create_whmcs_client_sessions_table.php`
- ✅ `2025_11_10_100010_create_whmcs_client_notes_table.php`
- ✅ `2025_11_11_025424_fix_whmcs_services_client_foreign_key.php`
- ✅ `2025_11_11_032624_fix_whmcs_invoices_client_foreign_key.php`
- ✅ `2025_11_11_040629_fix_whmcs_transactions_client_foreign_key.php`
- ✅ `2025_11_11_073909_fix_whmcs_tickets_client_foreign_key.php`
- ✅ `2025_11_11_075011_fix_whmcs_api_keys_client_foreign_key.php`

### 2. Xóa Models (3 files)
- ✅ `app/Models/Whmcs/Client.php`
- ✅ `app/Models/Whmcs/ClientNote.php`
- ✅ `app/Models/Whmcs/ClientSession.php`

### 3. Xóa/Đổi tên Controllers
- ✅ Xóa: `app/Http/Controllers/Admin/Whmcs/ClientController.php`
- ✅ Xóa: `app/Http/Controllers/Client/Whmcs/ClientPortalController.php`
- ✅ Đổi tên: `ClientTicketController` → `UserTicketController`

### 4. Update Migrations (client_id → user_id)
- ✅ `2025_11_10_100004_create_whmcs_services_table.php`
- ✅ `2025_11_10_100005_create_whmcs_invoices_table.php`
- ✅ `2025_11_10_100006_create_whmcs_transactions_table.php`
- ✅ `2025_11_10_100007_create_whmcs_domains_table.php`
- ✅ `2025_11_10_100008_create_whmcs_tickets_table.php`
- ✅ `2025_11_10_100011_create_whmcs_email_logs_table.php`
- ✅ `2025_11_10_110001_create_whmcs_api_keys_table.php`
- ✅ `2025_11_10_130001_create_whmcs_currencies_table.php`
- ✅ `2025_11_10_150001_create_whmcs_affiliates_system.php`

### 5. Update Models (Tất cả models WHMCS)
- ✅ Đổi `client_id` → `user_id` trong fillable
- ✅ Đổi `client()` → `user()` trong relationships
- ✅ Update foreign key references

### 6. Update Routes
**Xóa:**
```php
Route::prefix('whmcs/clients')->group(...) // Xóa toàn bộ
```

**Thay đổi:**
```php
// Từ:
Route::prefix('whmcs/client/tickets')->group(...)
// Thành:
Route::prefix('whmcs/user/tickets')->group(...)
```

**Routes mới:**
- GET  `/aio/api/whmcs/user/tickets` - Danh sách tickets của user
- POST `/aio/api/whmcs/user/tickets` - Tạo ticket mới
- GET  `/aio/api/whmcs/user/tickets/{id}` - Chi tiết ticket
- POST `/aio/api/whmcs/user/tickets/{id}/reply` - Trả lời ticket
- POST `/aio/api/whmcs/user/tickets/{id}/close` - Đóng ticket

### 7. Update Frontend
**File:** `resources/js/pages/whmcs/client/ClientTickets.tsx`
- ✅ Đổi `/whmcs/client/tickets` → `/whmcs/user/tickets`
- ⚠️ **TODO:** Cần update form để gửi `user_id` thay vì `client_id`

### 8. Update Seeder
- ✅ `database/seeders/WhmcsCompleteTestDataSeeder.php`
  - Đổi tất cả `'client_id'` → `'user_id'`

### 9. Disable Client Routes
**File:** `routes/client_route.php`
- ✅ Comment toàn bộ client portal routes
- ✅ Chuyển sang dùng user-based routes

## Cấu trúc Database Mới

### Tables đã xóa:
- `whmcs_client_sessions` ❌
- `whmcs_client_notes` ❌

### Tables còn lại (sử dụng `user_id`):
- `whmcs_services` → `user_id` references `users.id`
- `whmcs_invoices` → `user_id` references `users.id`
- `whmcs_transactions` → `user_id` references `users.id`
- `whmcs_domains` → `user_id` references `users.id`
- `whmcs_tickets` → `user_id` references `users.id`
- `whmcs_email_logs` → `user_id` references `users.id`
- `whmcs_api_keys` → `user_id` references `users.id`

## Migration Status

```bash
php artisan migrate:fresh --seed
```

✅ **SUCCESS** - Tất cả migrations chạy thành công
✅ **SEEDED** - Test data với 5 users, 8 products, 7 services, 5 tickets

## API Changes

### Before:
```json
{
  "client_id": 1,
  "department": "technical",
  "subject": "Issue"
}
```

### After:
```json
{
  "user_id": 1,
  "department": "technical", 
  "subject": "Issue"
}
```

## Model Relationship Changes

### Before:
```php
public function client(): BelongsTo
{
    return $this->belongsTo(User::class, 'client_id');
}
```

### After:
```php
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'user_id');
}
```

## TODO: Frontend Updates Needed

1. ✅ Update API endpoints (`/client/` → `/user/`)
2. ⚠️ Update form fields (`client_id` → `user_id`)
3. ⚠️ Update relationship loading (`.with('client')` → `.with('user')`)
4. ⚠️ Update display fields (`ticket.client` → `ticket.user`)

## Kiểm tra

```bash
# Check routes
php artisan route:list --path=whmcs/user

# Check database
php artisan tinker
>>> \App\Models\Whmcs\Ticket::with('user')->first()
>>> \App\Models\Whmcs\Service::with('user')->first()
```

## Kết quả

- ✅ Đã xóa hoàn toàn khái niệm "client" riêng biệt
- ✅ Tất cả WHMCS entities giờ liên kết trực tiếp với bảng `users`
- ✅ Database structure đơn giản hơn, dễ maintain
- ✅ Không còn duplicate user data
- ✅ Migration chạy thành công với test data

---
**Date:** 11 November 2025  
**Status:** ✅ COMPLETED

---

## UPDATE 2: Frontend Migration (11 Nov 2025)

### Controllers đã update:
- ✅ `InvoiceController.php` - `.with(['user'])`, `user_id` validation
- ✅ `ServiceController.php` - `.with(['user'])`, `user_id` validation  
- ✅ `TicketController.php` - `.with(['user'])`, `user_id` validation
- ✅ `UserTicketController.php` - đã được tạo với `user_id` từ đầu

### Frontend files đã update (client → user):

**Interface definitions:**
- ✅ `InvoiceList.tsx` - `user_id`, `user?: {...}`
- ✅ `ServiceList.tsx` - `user_id`, `user?: {...}`
- ✅ `TicketList.tsx` - relationships updated
- ✅ `ApiKeyList.tsx` - `user_id` field

**Form fields:**
- ✅ All `name="client_id"` → `name="user_id"`
- ✅ All validation messages updated

**Table columns:**
- ✅ `dataIndex: ['user', 'name']` instead of `['client', 'name']`
- ✅ `record.user?.name` instead of `record.client?.name`

**Display labels:**
- ✅ Fixed ApiKeyList tag display
- ✅ Fixed TicketList customer label

### Validation error fixed:
**Before:** 
```json
{
  "message": "user id không được bỏ trống.",
  "errors": { "user_id": ["user id không được bỏ trống."] }
}
```

**Root cause:** Frontend sending `client_id` but backend expecting `user_id`

**Solution:** Update all frontend forms to use `user_id` field name

### Files mass-updated:
```bash
# Updated all .tsx files in resources/js/pages/whmcs/
- client_id → user_id
- record.client → record.user
- ['client', 'name'] → ['user', 'name']
```

### Result:
- ✅ Invoice creation works with user_id
- ✅ Service creation works with user_id
- ✅ Ticket creation works with user_id
- ✅ All tables display user names correctly
- ✅ No more "client_id required" errors

---
**Updated:** 11 November 2025 15:30  
**Status:** ✅ FULLY COMPLETED - Backend + Frontend
