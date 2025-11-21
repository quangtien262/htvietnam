# Tính năng Tất toán Công nợ - Hoàn thành

## Tổng quan
Tính năng thanh toán công nợ cho hóa đơn SPA đã được triển khai hoàn chỉnh, bao gồm cả backend và frontend.

## Backend Implementation

### 1. API Endpoint
- **Route**: `POST /aio/api/spa/invoices/{id}/pay-debt`
- **Controller**: `HoaDonController@payDebt`
- **Location**: `app/Http/Controllers/Admin/Spa/HoaDonController.php`

### 2. Validation
```php
$request->validate([
    'so_tien_thanh_toan' => [
        'required',
        'numeric',
        'min:0.01',
        'max:' . $congNo->so_tien_no
    ]
]);
```

### 3. Database Updates (Atomic Transaction)
Khi khách hàng thanh toán nợ, hệ thống cập nhật 3 bảng:

#### a. Bảng `cong_no`
```php
$congNo->so_tien_da_thanh_toan += $soTienThanhToan;
$congNo->so_tien_no -= $soTienThanhToan;

if ($congNo->so_tien_no <= 0.01) {
    $congNo->cong_no_status_id = 1; // Đã thanh toán
}
```

#### b. Bảng `spa_hoa_don`
```php
$invoice->thanh_toan_tien_mat += $soTienThanhToan;

if ($congNo->so_tien_no <= 0.01) {
    $invoice->trang_thai = 'da_thanh_toan'; // Đã thanh toán đủ
}
```

#### c. Bảng `so_quy` (Sổ quỹ)
```php
SoQuy::saveSoQuy_hoaDonSPA($soTienThanhToan, $invoice);
```

**Lưu ý quan trọng**: Hàm `saveSoQuy_hoaDonSPA` đã được cập nhật để **cộng dồn** số tiền khi khách trả nợ nhiều lần:
```php
if ($checkExisting) {
    $soQuy->so_tien += $soTien; // Cộng dồn, không ghi đè
}
```

### 4. Logic Flow
1. Validate số tiền thanh toán (phải > 0 và <= số tiền nợ)
2. Bắt đầu transaction
3. Cập nhật bảng `cong_no`: Tăng số tiền đã trả, giảm số tiền nợ
4. Cập nhật bảng `spa_hoa_don`: Tăng số tiền đã thanh toán, đổi trạng thái nếu trả đủ
5. Lưu vào `so_quy`: Ghi nhận số tiền thu về (cộng dồn nếu đã có)
6. Commit transaction
7. Trả về thông báo thành công

## Frontend Implementation

### 1. UI Components
**Location**: `resources/js/pages/spa/InvoiceList.tsx`

#### a. Nút "Trả nợ" trong bảng danh sách
- **Vị trí**: Cột "Thao tác" (line 741)
- **Điều kiện hiển thị**: `trang_thai === 'con_cong_no'`
- **Icon**: `<CreditCardOutlined />`
- **Màu**: Đỏ (`#ff4d4f`)

```tsx
{record.trang_thai === 'con_cong_no' && (
    <Button
        type="link"
        size="small"
        icon={<CreditCardOutlined />}
        onClick={() => handleOpenPayDebt(record)}
        style={{ color: '#ff4d4f' }}
    >
        Trả nợ
    </Button>
)}
```

#### b. Modal thanh toán công nợ
Modal hiển thị đầy đủ thông tin:

**Card 1: Thông tin hóa đơn** (màu vàng cam)
- Mã hóa đơn
- Khách hàng

**Card 2: Chi tiết công nợ** (màu xanh dương)
- Tổng hóa đơn
- Đã thanh toán (màu xanh)
- **Còn nợ** (màu đỏ, in đậm)

**Input số tiền thanh toán**
- Mặc định = Số tiền còn nợ
- Min: 0
- Max: Số tiền còn nợ
- Format: Có dấu phẩy ngăn cách nghìn
- Suffix: ₫

**Card 3: Trạng thái thanh toán** (động)
- Nếu thanh toán đủ: Màu xanh lá, thông báo "Thanh toán đủ - Hóa đơn sẽ chuyển sang trạng thái 'Đã thanh toán'"
- Nếu thanh toán một phần: Màu vàng, hiển thị "Thanh toán một phần - Còn lại: XXX ₫"

### 2. State Management
```typescript
const [debtInvoice, setDebtInvoice] = useState<InvoiceDetail | null>(null);
const [paymentAmount, setPaymentAmount] = useState(0);
const [payDebtModalVisible, setPayDebtModalVisible] = useState(false);
const [paymentLoading, setPaymentLoading] = useState(false);
```

### 3. Handlers

#### a. handleOpenPayDebt (line 534)
- Fetch chi tiết hóa đơn từ API (để lấy thông tin `cong_no`)
- Set `debtInvoice` = dữ liệu đầy đủ (bao gồm `cong_no`)
- Set `paymentAmount` = `cong_no.so_tien_no` (số tiền còn nợ)
- Mở modal

#### b. handlePayDebt (line 555)
- Validate số tiền > 0
- Validate số tiền <= số tiền nợ
- Gọi API `/pay-debt` với `so_tien_thanh_toan`
- Hiển thị thông báo kết quả
- Reload danh sách hóa đơn
- Đóng modal

## Data Flow

### Khi tạo hóa đơn có công nợ (POSService)
1. Khách thanh toán một phần
2. Tạo record trong `cong_no`:
   - `tong_tien_hoa_don` = Tổng hóa đơn
   - `so_tien_da_thanh_toan` = Số tiền đã trả
   - `so_tien_no` = Số tiền còn nợ
3. Lưu vào `so_quy` số tiền đã trả (nếu > 0)
4. Set `trang_thai` = 'con_cong_no'

### Khi khách trả nợ (HoaDonController.payDebt)
1. Cập nhật `cong_no`: Tăng đã trả, giảm còn nợ
2. Cập nhật `spa_hoa_don`: Tăng thanh toán tiền mặt, đổi trạng thái
3. Lưu vào `so_quy` số tiền vừa trả (cộng dồn vào entry cũ)

### Ví dụ thực tế
**Tạo hóa đơn 1,000,000đ**
- Khách trả: 300,000đ
- `cong_no`: so_tien_da_thanh_toan = 300,000, so_tien_no = 700,000
- `so_quy`: so_tien = 300,000

**Lần trả nợ 1**
- Khách trả: 200,000đ
- `cong_no`: so_tien_da_thanh_toan = 500,000, so_tien_no = 500,000
- `spa_hoa_don`: thanh_toan_tien_mat = 500,000, trang_thai = 'con_cong_no'
- `so_quy`: so_tien = 300,000 + 200,000 = **500,000** (cộng dồn)

**Lần trả nợ 2** (tất toán)
- Khách trả: 500,000đ
- `cong_no`: so_tien_da_thanh_toan = 1,000,000, so_tien_no = 0, cong_no_status_id = 1
- `spa_hoa_don`: thanh_toan_tien_mat = 1,000,000, trang_thai = 'da_thanh_toan'
- `so_quy`: so_tien = 500,000 + 500,000 = **1,000,000** (cộng dồn)

## Key Features

### 1. Thanh toán linh hoạt
- ✅ Hỗ trợ thanh toán một phần
- ✅ Hỗ trợ thanh toán đủ (tất toán)
- ✅ Khách có thể trả nợ nhiều lần

### 2. Tự động cập nhật trạng thái
- ✅ Tự động chuyển trạng thái hóa đơn khi trả đủ
- ✅ Tự động cập nhật trạng thái công nợ
- ✅ Tự động cộng dồn số tiền vào sổ quỹ

### 3. Validation chặt chẽ
- ✅ Backend: Validate min/max, kiểm tra tồn tại công nợ
- ✅ Frontend: Validate min/max, hiển thị thông báo rõ ràng

### 4. Atomic Transaction
- ✅ Sử dụng DB transaction
- ✅ Đảm bảo 3 bảng (cong_no, spa_hoa_don, so_quy) luôn đồng bộ
- ✅ Rollback nếu có lỗi

### 5. User Experience
- ✅ UI trực quan với màu sắc phân biệt rõ ràng
- ✅ Hiển thị đầy đủ thông tin công nợ
- ✅ Mặc định số tiền = số tiền còn nợ (tiết kiệm thao tác)
- ✅ Hiển thị preview trạng thái sau khi thanh toán
- ✅ Thông báo success/error rõ ràng

## Testing Checklist

### Backend
- [x] API endpoint hoạt động
- [x] Validation hoạt động (min, max, required)
- [x] Transaction rollback khi có lỗi
- [x] Cập nhật đúng 3 bảng
- [x] Sổ quỹ cộng dồn đúng
- [x] Trạng thái chuyển đổi đúng

### Frontend
- [x] Nút "Trả nợ" chỉ hiện với hóa đơn có công nợ
- [x] Modal hiển thị đúng thông tin
- [x] Default amount = số tiền còn nợ
- [x] Validation client-side hoạt động
- [x] Hiển thị preview trạng thái động
- [x] Reload danh sách sau khi thanh toán
- [x] Thông báo success/error

## Files Modified

### Backend
1. `app/Http/Controllers/Admin/Spa/HoaDonController.php`
   - Added: `payDebt()` method
   - Added: `use App\Models\Admin\SoQuy;`

2. `app/Services/Spa/POSService.php`
   - Updated: `createInvoice()` to save to so_quy
   - Added: `use App\Models\Admin\SoQuy;`

3. `app/Models/Admin/SoQuy.php`
   - Updated: `saveSoQuy_hoaDonSPA()` to accumulate amount (+=)

### Frontend
1. `resources/js/pages/spa/InvoiceList.tsx`
   - Updated: `debtInvoice` type from `Invoice` to `InvoiceDetail`
   - Updated: `handlePayDebt()` validation to check max amount
   - Enhanced: Modal UI to show debt breakdown
   - Added: Dynamic payment status preview
   - Added: Input max validation

## API Reference

### Endpoint: Pay Debt
**URL**: `POST /aio/api/spa/invoices/{id}/pay-debt`

**Request Body**:
```json
{
  "so_tien_thanh_toan": 500000
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Thanh toán công nợ thành công"
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Hóa đơn không có công nợ"
}
```

**Error Response** (422):
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "so_tien_thanh_toan": [
      "Số tiền thanh toán không được vượt quá số tiền nợ."
    ]
  }
}
```

## Notes
- Tính năng này hoàn chỉnh chu trình quản lý công nợ
- Tích hợp chặt chẽ với Sổ quỹ để đảm bảo kế toán chính xác
- Hỗ trợ thanh toán linh hoạt theo nhu cầu khách hàng
- Code được tối ưu với TypeScript và validation 2 lớp (frontend + backend)

---
**Hoàn thành**: 30/10/2025  
**Developer**: GitHub Copilot (Claude Sonnet 4.5)
