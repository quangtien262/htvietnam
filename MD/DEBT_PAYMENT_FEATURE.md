# Debt Payment Feature - Tính Năng Thanh Toán Công Nợ

## Tổng Quan
Tính năng cho phép nhân viên thu công nợ từ khách hàng trực tiếp từ danh sách hóa đơn. Hỗ trợ thanh toán một phần hoặc toàn bộ công nợ.

## Các File Đã Thay Đổi

### 1. Frontend - InvoiceList.tsx
**Đường dẫn:** `resources/js/pages/spa/InvoiceList.tsx`

**Thay đổi:**
- ✅ Thêm icon `CreditCardOutlined` từ Ant Design
- ✅ Thêm interface `DebtInfo` với các trường:
  ```typescript
  interface DebtInfo {
      so_tien_no: number;
      so_tien_da_thanh_toan: number;
      tong_tien_hoa_don: number;
  }
  ```
- ✅ Mở rộng `InvoiceDetail` interface để bao gồm `cong_no?: DebtInfo`
- ✅ Thêm states mới:
  - `payDebtModalVisible`: Hiển thị modal thanh toán
  - `debtInvoice`: Hóa đơn công nợ hiện tại
  - `paymentAmount`: Số tiền thanh toán
  - `paymentLoading`: Trạng thái loading khi xử lý

**Chức năng mới:**

**1. handleOpenPayDebt(invoice)**
```typescript
// Lấy chi tiết hóa đơn với thông tin công nợ
// Mặc định số tiền = tổng nợ còn lại
// Mở modal thanh toán
```

**2. handlePayDebt()**
```typescript
// Validate số tiền > 0
// POST đến /api/spa/invoices/{id}/pay-debt
// Body: { so_tien_thanh_toan: number }
// Refresh danh sách sau khi thành công
```

**UI Changes:**
- ✅ Thêm nút "Trả nợ" (màu đỏ) ở cột actions
  - Chỉ hiển thị khi `trang_thai === 'con_cong_no'`
  - Icon: `CreditCardOutlined`
- ✅ Modal thanh toán bao gồm:
  - Card thông tin hóa đơn (nền cam)
  - InputNumber để nhập số tiền (có format số, đơn vị ₫)
  - Card trạng thái (nền xanh) hiển thị "Thanh toán đủ" hoặc "Thanh toán một phần"

### 2. Backend - HoaDonController.php
**Đường dẫn:** `app/Http/Controllers/Admin/Spa/HoaDonController.php`

**Thay đổi:**
- ✅ Import thêm: `CongNo` model, `Log` facade, `Carbon`
- ✅ Cập nhật method `show()`:
  - Thêm eager load `'congNo'` để lấy thông tin công nợ
- ✅ Thêm method `payDebt(Request $request, $id)`

**Endpoint mới: POST /api/spa/invoices/{id}/pay-debt**

**Request Body:**
```json
{
  "so_tien_thanh_toan": 1000000
}
```

**Validation:**
- `so_tien_thanh_toan`: required, numeric, min 0.01

**Business Logic:**
1. Tìm hóa đơn kèm bản ghi công nợ
2. Kiểm tra hóa đơn có trạng thái `con_cong_no` không
3. Validate số tiền thanh toán không lớn hơn số tiền nợ
4. Cập nhật bản ghi công nợ:
   - `so_tien_da_thanh_toan += so_tien_thanh_toan`
   - `so_tien_no -= so_tien_thanh_toan`
5. Nếu thanh toán đủ (`so_tien_no <= 0`):
   - Đặt `cong_no_status_id = 1` (Đã thanh toán)
   - Đặt `ngay_tat_toan = hôm nay`
   - Cập nhật hóa đơn `trang_thai = 'da_thanh_toan'`
6. Log chi tiết thanh toán
7. Sử dụng transaction để đảm bảo tính nhất quán

**Response Success:**
```json
{
  "success": true,
  "message": "Thanh toán công nợ thành công",
  "data": {
    "invoice": { ... },
    "congNo": { ... },
    "message": "Đã thanh toán đủ công nợ" // hoặc "Đã thanh toán một phần công nợ"
  }
}
```

**Error Handling:**
- 400: Hóa đơn không có công nợ
- 404: Không tìm thấy bản ghi công nợ
- 400: Số tiền thanh toán lớn hơn số tiền nợ
- 422: Validation errors
- 500: Server errors

### 3. Routes - aio_route.php
**Đường dẫn:** `routes/aio_route.php`

**Thay đổi:**
- ✅ Thêm route mới:
```php
Route::post('invoices/{id}/pay-debt', 
    [\App\Http\Controllers\Admin\Spa\HoaDonController::class, 'payDebt']
)->name('api.spa.invoices.pay-debt');
```

## Luồng Hoạt Động

### Thanh Toán Một Phần
```
1. User click "Trả nợ" trên hóa đơn có công nợ
2. Modal hiển thị thông tin hóa đơn
3. Nhập số tiền < tổng nợ (ví dụ: nợ 2,000,000₫, thanh toán 1,000,000₫)
4. Click "Thanh toán"
5. Backend:
   - so_tien_da_thanh_toan: 0 -> 1,000,000
   - so_tien_no: 2,000,000 -> 1,000,000
   - cong_no_status_id: giữ nguyên (3 - Chưa thanh toán)
   - trang_thai hóa đơn: giữ nguyên 'con_cong_no'
6. Modal đóng, danh sách refresh
7. Message: "Đã thanh toán một phần công nợ"
```

### Thanh Toán Đủ
```
1. User click "Trả nợ" trên hóa đơn có công nợ
2. Modal hiển thị thông tin hóa đơn
3. Giữ nguyên số tiền mặc định = tổng nợ (ví dụ: 2,000,000₫)
4. Click "Thanh toán"
5. Backend:
   - so_tien_da_thanh_toan: 0 -> 2,000,000
   - so_tien_no: 2,000,000 -> 0
   - cong_no_status_id: 3 -> 1 (Đã thanh toán)
   - ngay_tat_toan: null -> ngày hiện tại
   - trang_thai hóa đơn: 'con_cong_no' -> 'da_thanh_toan'
6. Modal đóng, danh sách refresh
7. Hóa đơn không còn hiển thị nút "Trả nợ"
8. Message: "Đã thanh toán đủ công nợ"
```

## Database Schema

### Bảng cong_no
**Các cột liên quan:**
- `chung_tu_id`: ID hóa đơn
- `loai_chung_tu`: 'spa_hoa_don'
- `tong_tien_hoa_don`: Tổng tiền hóa đơn gốc
- `so_tien_da_thanh_toan`: Số tiền đã thanh toán tích lũy
- `so_tien_no`: Số tiền nợ còn lại
- `cong_no_status_id`: 1 = Đã thanh toán, 3 = Chưa thanh toán
- `ngay_hen_tat_toan`: Ngày hẹn thanh toán
- `ngay_tat_toan`: Ngày thanh toán thực tế (null cho đến khi thanh toán đủ)

### Bảng hoa_don_spa
**Trạng thái liên quan:**
- `cho_thanh_toan`: Chờ thanh toán
- `con_cong_no`: Còn công nợ
- `da_thanh_toan`: Đã thanh toán
- `da_huy`: Đã hủy

## Testing Checklist

### Test Cases
- [ ] **TC1**: Thanh toán một phần công nợ
  - Tạo hóa đơn 2,000,000₫, thanh toán trước 500,000₫
  - Click "Trả nợ", nhập 500,000₫
  - Verify: so_tien_no = 1,000,000₫, trạng thái vẫn 'con_cong_no'

- [ ] **TC2**: Thanh toán đủ công nợ
  - Tạo hóa đơn 2,000,000₫, thanh toán trước 500,000₫
  - Click "Trả nợ", nhập 1,500,000₫
  - Verify: so_tien_no = 0, trạng thái = 'da_thanh_toan', ngay_tat_toan có giá trị

- [ ] **TC3**: Thanh toán nhiều lần
  - Tạo hóa đơn 3,000,000₫, không thanh toán
  - Thanh toán lần 1: 1,000,000₫
  - Thanh toán lần 2: 1,000,000₫
  - Thanh toán lần 3: 1,000,000₫
  - Verify: Tổng 3 lần = 3,000,000₫, trạng thái = 'da_thanh_toan'

- [ ] **TC4**: Validation - Số tiền âm
  - Nhập -100,000₫
  - Verify: Hiển thị lỗi validation

- [ ] **TC5**: Validation - Số tiền lớn hơn nợ
  - Nợ còn 500,000₫, nhập 600,000₫
  - Verify: Backend trả về lỗi 400

- [ ] **TC6**: UI - Nút "Trả nợ" chỉ hiển thị cho hóa đơn công nợ
  - Verify: Hóa đơn 'da_thanh_toan' không có nút
  - Verify: Hóa đơn 'con_cong_no' có nút màu đỏ

- [ ] **TC7**: Transaction rollback
  - Giả lập lỗi database khi cập nhật
  - Verify: Không có thay đổi nào được lưu

- [ ] **TC8**: Số tiền format đúng
  - Nhập 1000000
  - Verify: Hiển thị "1,000,000₫"

## Logs

### Log Locations
- **Controller**: `storage/logs/laravel.log`
- **Service**: `storage/logs/laravel.log`

### Log Messages
```php
// Thanh toán đủ
Log::info('Debt fully paid', [
    'invoice_id' => 123,
    'ma_hoa_don' => 'HD-20240530-001',
    'payment_amount' => 2000000,
]);

// Thanh toán một phần
Log::info('Partial debt payment', [
    'invoice_id' => 123,
    'ma_hoa_don' => 'HD-20240530-001',
    'payment_amount' => 1000000,
    'remaining_debt' => 1000000,
]);

// Lỗi
Log::error('Pay debt error', [
    'invoice_id' => 123,
    'error' => 'Error message',
    'trace' => '...',
]);
```

## API Documentation

### POST /api/spa/invoices/{id}/pay-debt
Thanh toán công nợ cho hóa đơn.

**Authentication:** Required (Bearer token)

**Request:**
```json
POST /api/spa/invoices/123/pay-debt
Content-Type: application/json
Authorization: Bearer {token}

{
  "so_tien_thanh_toan": 1000000
}
```

**Response 200 - Thanh toán một phần:**
```json
{
  "success": true,
  "message": "Thanh toán công nợ thành công",
  "data": {
    "invoice": {
      "id": 123,
      "ma_hoa_don": "HD-20240530-001",
      "trang_thai": "con_cong_no",
      "tong_thanh_toan": 2000000,
      "cong_no": {
        "so_tien_no": 1000000,
        "so_tien_da_thanh_toan": 1000000,
        "tong_tien_hoa_don": 2000000,
        "cong_no_status_id": 3
      }
    },
    "message": "Đã thanh toán một phần công nợ"
  }
}
```

**Response 200 - Thanh toán đủ:**
```json
{
  "success": true,
  "message": "Thanh toán công nợ thành công",
  "data": {
    "invoice": {
      "id": 123,
      "ma_hoa_don": "HD-20240530-001",
      "trang_thai": "da_thanh_toan",
      "tong_thanh_toan": 2000000,
      "cong_no": {
        "so_tien_no": 0,
        "so_tien_da_thanh_toan": 2000000,
        "tong_tien_hoa_don": 2000000,
        "cong_no_status_id": 1,
        "ngay_tat_toan": "2024-05-30"
      }
    },
    "message": "Đã thanh toán đủ công nợ"
  }
}
```

**Response 400 - Hóa đơn không có công nợ:**
```json
{
  "success": false,
  "message": "Hóa đơn này không có công nợ"
}
```

**Response 400 - Số tiền quá lớn:**
```json
{
  "success": false,
  "message": "Số tiền thanh toán không được lớn hơn số tiền nợ"
}
```

**Response 404 - Không tìm thấy:**
```json
{
  "success": false,
  "message": "Không tìm thấy bản ghi công nợ"
}
```

**Response 422 - Validation Error:**
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": {
    "so_tien_thanh_toan": [
      "The so tien thanh toan field is required.",
      "The so tien thanh toan must be at least 0.01."
    ]
  }
}
```

## Deployment Notes

### Pre-deployment
1. Kiểm tra tất cả test cases
2. Verify logs ghi đúng
3. Test với dữ liệu thật trong môi trường staging

### Deployment Steps
1. Pull code mới nhất
2. Run `npm run build` để build frontend
3. Clear cache: `php artisan cache:clear`
4. Clear route cache: `php artisan route:clear`
5. Verify route có trong route list: `php artisan route:list | grep pay-debt`

### Post-deployment
1. Test tính năng trên production
2. Monitor logs để phát hiện lỗi
3. Thông báo cho team về tính năng mới

## Future Enhancements

1. **Lịch sử thanh toán**: Thêm bảng `lich_su_thanh_toan_cong_no` để lưu từng lần thanh toán
2. **Phương thức thanh toán**: Cho phép chọn thanh toán bằng tiền mặt, chuyển khoản, thẻ
3. **Thông báo**: Gửi SMS/email cho khách hàng sau khi thanh toán
4. **Báo cáo**: Thêm báo cáo tổng hợp công nợ theo khách hàng, chi nhánh
5. **In biên lai**: Tạo biên lai thanh toán công nợ để in
6. **Nhắc nợ tự động**: Gửi thông báo nhắc nợ cho khách hàng trước ngày hẹn

---
**Ngày tạo:** 2024-05-30  
**Tác giả:** GitHub Copilot  
**Version:** 1.0
