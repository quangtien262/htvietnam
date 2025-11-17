# Hoàn thành Phase 1 - Tính năng Bàn giao ca POS

## Tổng quan
Đã hoàn thành Phase 1 của tính năng bàn giao ca làm việc cho POS Bán hàng SPA, bao gồm:
- ✅ Database schema và migration
- ✅ Model với relationships và business logic
- ✅ Controller với 6 endpoints API
- ✅ Frontend UI widget cho POS
- ✅ Tự động gán hóa đơn vào ca

## Chi tiết triển khai

### 1. Database (Migration executed ✅)

**File**: `database/migrations/2025_11_17_100001_create_spa_ca_lam_viec_table.php`

**Table `spa_ca_lam_viec`:**
```sql
- id: Primary key
- ma_ca: Mã ca (CA_001, CA_002...) - Auto increment
- chi_nhanh_id: Foreign key → dm_chi_nhanh
- nhan_vien_mo_ca_id: Foreign key → users (Thu ngân mở ca)
- nhan_vien_dong_ca_id: Foreign key → users (Người đóng ca, nullable)
- thoi_gian_bat_dau: Timestamp mở ca
- thoi_gian_ket_thuc: Timestamp đóng ca (nullable)

-- Tiền mặt
- tien_mat_dau_ca: Tiền lẻ đầu ca
- tien_mat_cuoi_ca_ly_thuyet: Tính toán = Đầu ca + Thu trong ca
- tien_mat_cuoi_ca_thuc_te: Đếm thực tế khi đóng ca
- chenh_lech: Chênh lệch = Thực tế - Lý thuyết

-- Doanh thu
- doanh_thu_tien_mat: Tổng thu tiền mặt trong ca
- doanh_thu_chuyen_khoan: Tổng chuyển khoản
- doanh_thu_the: Tổng quẹt thẻ
- tong_doanh_thu: Tổng tất cả (tính toán)
- so_hoa_don: Số lượng đơn đã bán

-- Ghi chú
- ghi_chu_mo_ca: Ghi chú khi mở ca (nullable)
- ghi_chu_dong_ca: Ghi chú khi đóng ca (nullable)
- giai_trinh_chenh_lech: BẮT BUỘC nếu có chênh lệch

-- Trạng thái
- trang_thai: enum('dang_mo', 'da_dong', 'da_ban_giao')
```

**Update `spa_hoa_don`:**
```sql
ALTER TABLE spa_hoa_don 
ADD COLUMN ca_lam_viec_id BIGINT UNSIGNED NULL,
ADD FOREIGN KEY (ca_lam_viec_id) REFERENCES spa_ca_lam_viec(id);
```

### 2. Model

**File**: `app/Models/Spa/CaLamViec.php`

**Relationships:**
```php
- chiNhanh() → belongsTo DmChiNhanh
- nhanVienMoCa() → belongsTo User
- nhanVienDongCa() → belongsTo User (nullable)
- hoaDons() → hasMany HoaDon
```

**Scopes:**
```php
- dangMo() → Lọc ca đang mở
- daDong() → Lọc ca đã đóng
- byChiNhanh($chiNhanhId) → Lọc theo chi nhánh
```

**Helper Methods:**
```php
- isDangMo() → bool
- hasChenhlech() → bool (Có chênh lệch tiền?)
- getThoiGianLamViec() → float (Số giờ làm việc)
```

### 3. Controller & API

**File**: `app/Http/Controllers/Admin/Spa/CaLamViecController.php`

**Endpoints:**

#### GET `/spa/shifts/current`
- Lấy ca đang mở của chi nhánh
- Response: Ca + doanh thu realtime
- Dùng cho: Widget POS hiển thị thông tin ca

#### POST `/spa/shifts/open`
- Mở ca mới
- Validation:
  - `tien_mat_dau_ca`: required, numeric, min:0
  - `ghi_chu_mo_ca`: nullable
  - `chi_nhanh_id`: nullable (default 1)
- Business rules:
  - Kiểm tra không có ca nào đang mở
  - Auto-generate mã ca (CA_001++)
  - Gán `nhan_vien_mo_ca_id` = Auth user
  - Trạng thái = 'dang_mo'

#### POST `/spa/shifts/{id}/close`
- Đóng ca
- Validation:
  - `tien_mat_cuoi_ca_thuc_te`: required, numeric
  - `giai_trinh_chenh_lech`: required nếu có chênh lệch BẤT KỲ
  - `ghi_chu_dong_ca`: nullable
- Business logic:
  - Query tất cả hóa đơn trong ca → Tính doanh thu theo phương thức thanh toán
  - Tính tiền mặt lý thuyết = Đầu ca + Thu trong ca
  - Tính chênh lệch = Thực tế - Lý thuyết
  - YÊU CẦU giải trình nếu abs(chênh lệch) > 0
  - Update ca với tất cả giá trị tính toán
  - Trạng thái = 'da_dong'

#### GET `/spa/shifts`
- Danh sách ca (phân trang)
- Filters:
  - `tu_ngay`, `den_ngay`: Lọc theo khoảng thời gian
  - `chi_nhanh_id`: Lọc chi nhánh
  - `trang_thai`: Lọc trạng thái
  - `nhan_vien_id`: Lọc theo thu ngân

#### GET `/spa/shifts/{id}`
- Chi tiết ca
- Include: hoaDons, nhanVienMoCa, nhanVienDongCa

#### GET `/spa/shifts/{id}/print`
- In biên bản bàn giao (PDF)
- Note: Chưa implement template (Phase 3)

**Private Methods:**
```php
calculateShiftStats($caId)
- Query spa_hoa_don WHERE ca_lam_viec_id = $caId AND trang_thai != 'Đã hủy'
- SUM doanh thu theo từng phương thức thanh toán
- COUNT số hóa đơn
- Return array: [
    'so_hoa_don' => int,
    'doanh_thu_tien_mat' => float,
    'doanh_thu_chuyen_khoan' => float,
    'doanh_thu_the' => float,
    'tong_doanh_thu' => float
  ]
```

### 4. Frontend UI

**File**: `resources/js/components/spa/ShiftWidget.tsx`

**Component**: `ShiftWidget`

**Props:**
```typescript
interface ShiftWidgetProps {
    onShiftChange?: () => void; // Callback khi mở/đóng ca
}
```

**Features:**

#### Khi CHƯA có ca mở:
- Hiển thị warning: "Chưa mở ca"
- Nút "Mở ca mới" → Mở modal nhập tiền đầu ca

**Modal "Mở ca mới":**
- Input: Tiền mặt đầu ca (VNĐ) - Required
- Input: Ghi chú - Optional
- Nút: "Xác nhận mở ca"
- API: POST /spa/shifts/open

#### Khi ĐÃ có ca mở:
- Header: Tag "CA ĐANG MỞ" + Mã ca
- Info:
  - Thu ngân: Tên nhân viên
  - Mở ca: HH:mm - DD/MM/YYYY
  - Doanh thu ca: Format số tiền (realtime)
  - Số đơn: Badge xanh
- Nút: "Chi tiết" → Modal chi tiết ca
- Nút: "Đóng ca" (Đỏ) → Modal đóng ca

**Modal "Chi tiết ca":**
- Descriptions layout:
  - Thu ngân
  - Mở ca
  - Tiền đầu ca
  - Tiền mặt thu trong ca
  - Chuyển khoản
  - Thẻ
  - **Tổng doanh thu** (Xanh, size lớn)
  - Số hóa đơn
- Ghi chú mở ca (nếu có)

**Modal "Đóng ca":**
- Alert warning: "Vui lòng kiểm tra kỹ số tiền mặt thực tế"
- Summary table:
  - Mã ca
  - Tiền mặt đầu ca
  - Thu trong ca (+XXX đ)
  - **Lý thuyết cuối ca** (Xanh, size lớn)
  - Chuyển khoản
  - Thẻ
  - Tổng doanh thu (Xanh)
  - Số đơn
- Form:
  - **Tiền mặt thực tế** (Required, InputNumber format VNĐ)
  - **Alert chênh lệch** (Auto-calculate, màu theo +/-/0):
    - Xanh: Khớp (0đ)
    - Vàng: Chênh lệch (+ thừa / - thiếu)
  - **Giải trình chênh lệch** (Required nếu abs(chênh lệch) > 0)
  - Ghi chú đóng ca (Optional)
- Nút: "Xác nhận đóng ca"
- API: POST /spa/shifts/{id}/close

**Auto-refresh:**
- Load current shift mỗi 30 giây
- Update doanh thu realtime

**Currency format:**
- `new Intl.NumberFormat('vi-VN').format(Math.round(value))`
- Không có dấu "đ" prefix, chỉ có suffix

### 5. Integration

**File**: `resources/js/pages/spa/SpaPOSScreen.tsx`

**Changes:**
```tsx
// Import component
import ShiftWidget from '../../components/spa/ShiftWidget';

// Add widget before "Hóa đơn" card
<Col span={12}>
    <ShiftWidget onShiftChange={() => {
        message.info('Ca làm việc đã thay đổi');
    }} />
    
    <Card title="Hóa đơn">
        {/* Cart content */}
    </Card>
</Col>
```

**Auto-assign invoice to shift:**
`app/Http/Controllers/Admin/Spa/POSController.php` → `createInvoice()`

```php
// Lấy ca đang mở
$currentShift = CaLamViec::where('chi_nhanh_id', $validated['chi_nhanh_id'])
    ->where('trang_thai', 'dang_mo')
    ->first();

// Gán hóa đơn vào ca
if ($currentShift) {
    $validated['ca_lam_viec_id'] = $currentShift->id;
}
```

### 6. API Constants

**File**: `resources/js/common/api.tsx`

```typescript
// Shift management
spaShiftCurrent: '/spa/shifts/current',
spaShiftOpen: '/spa/shifts/open',
spaShiftClose: (id: number) => `/spa/shifts/${id}/close`,
spaShiftList: '/spa/shifts',
spaShiftDetail: (id: number) => `/spa/shifts/${id}`,
spaShiftPrint: (id: number) => `/spa/shifts/${id}/print`,
```

## Business Rules Implementation

### 1. Quản lý có thể đóng bất kỳ ca nào ✅
- Controller không giới hạn quyền đóng ca
- Frontend cho phép đóng ca bất kỳ
- `nhan_vien_dong_ca_id` ghi lại người đóng (có thể khác người mở)

### 2. Yêu cầu giải trình cho BẤT KỲ chênh lệch nào ✅
```php
// Backend validation
if (abs($chenhLech) > 0 && empty($request->giai_trinh_chenh_lech)) {
    throw new \Exception('Vui lòng giải trình chênh lệch tiền mặt');
}

// Frontend validation
{Math.abs(calculateChenhLech()) > 0 && (
    <Form.Item
        name="giai_trinh_chenh_lech"
        label="Giải trình chênh lệch (Bắt buộc)"
        rules={[{ required: true, message: 'Vui lòng giải trình chênh lệch' }]}
    >
        <TextArea rows={3} placeholder="Ví dụ: Khách lẻ 20k..." />
    </Form.Item>
)}
```

### 3. Linh hoạt thời gian ca ✅
- Không có giờ cố định
- Thu ngân tự quyết định mở/đóng
- `thoi_gian_bat_dau` và `thoi_gian_ket_thuc` tự động ghi timestamp

### 4. Có biên bản bàn giao ✅
- Endpoint `/spa/shifts/{id}/print` đã chuẩn bị
- Implementation PDF ở Phase 3

### 5. Triển khai tuần tự ✅
- **Phase 1 (HOÀN THÀNH)**: Mở/đóng ca cơ bản + POS widget
- **Phase 2 (Tiếp theo)**: Màn hình quản lý ca + Báo cáo
- **Phase 3 (Tùy chọn)**: PDF template + Tính năng nâng cao

## Testing Checklist

### Backend API
- [ ] GET /spa/shifts/current → Return ca đang mở hoặc null
- [ ] POST /spa/shifts/open → Tạo ca mới, báo lỗi nếu đã có ca mở
- [ ] POST /spa/shifts/{id}/close → Đóng ca, tính toán chính xác
- [ ] GET /spa/shifts → Phân trang, filters hoạt động
- [ ] GET /spa/shifts/{id} → Chi tiết ca

### Frontend Widget
- [ ] Hiển thị đúng khi chưa có ca (nút Mở ca)
- [ ] Modal mở ca: Validation, call API, refresh widget
- [ ] Hiển thị đúng khi có ca: Mã, tên, thời gian, doanh thu
- [ ] Modal chi tiết: Hiển thị đầy đủ thông tin
- [ ] Modal đóng ca:
  - [ ] Tính chênh lệch chính xác
  - [ ] Alert màu theo +/-/0
  - [ ] Require giải trình khi có chênh lệch
  - [ ] Call API, refresh widget
- [ ] Auto-refresh 30s

### Integration
- [ ] Hóa đơn tự động gán `ca_lam_viec_id`
- [ ] Doanh thu realtime cập nhật đúng
- [ ] Đóng ca → Tính tổng chính xác

## Usage Guide (Cho user)

### Mở ca làm việc

1. Thu ngân vào màn POS Bán hàng
2. Nếu chưa có ca mở → Click "Mở ca mới"
3. Nhập:
   - Tiền mặt đầu ca (Tiền lẻ để thối khách, ví dụ: 2,000,000đ)
   - Ghi chú (Tùy chọn, ví dụ: "Ca sáng 8h-14h")
4. Click "Xác nhận mở ca"
5. Widget hiển thị thông tin ca đang mở

### Bán hàng trong ca

- Widget tự động cập nhật doanh thu realtime mỗi 30 giây
- Tất cả hóa đơn tạo trong thời gian này tự động thuộc ca hiện tại
- Xem chi tiết: Click nút "Chi tiết"

### Đóng ca

1. Click nút "Đóng ca" (màu đỏ)
2. Xem bảng tổng kết:
   - Tiền mặt đầu ca
   - Thu trong ca
   - **Lý thuyết cuối ca** (= Đầu ca + Thu)
3. Đếm tiền mặt thực tế trong két
4. Nhập "Tiền mặt thực tế"
5. Hệ thống tự động tính chênh lệch:
   - **Xanh (Khớp)**: Thực tế = Lý thuyết → Không cần giải trình
   - **Vàng (Thừa/Thiếu)**: Có chênh lệch → **BẮT BUỘC** giải trình
6. Nếu có chênh lệch:
   - Nhập "Giải trình chênh lệch" (Ví dụ: "Khách lẻ 20k", "Làm tròn số")
7. Nhập "Ghi chú đóng ca" (Tùy chọn)
8. Click "Xác nhận đóng ca"

### Xử lý chênh lệch

**Trường hợp thừa tiền (+)**:
- Khách để lại tip nhưng không ghi chú
- Làm tròn số thối khách (10k → 20k)
- Lỗi nhập hóa đơn (Nhập ít hơn thực tế)

**Trường hợp thiếu tiền (-)**:
- Thối sai cho khách
- Mất tiền lẻ
- Lỗi nhập hóa đơn (Nhập nhiều hơn thực tế)

**Lưu ý**: HỆ THỐNG KHÔNG CHO PHÉP đóng ca nếu có chênh lệch mà không giải trình!

## Known Limitations

1. **PDF Handover**: Chưa implement template (Phase 3)
2. **Validation**: Frontend chưa validate min tiền đầu ca (đang để min:0, nên đổi thành min:1000?)
3. **Branch Selection**: Widget chưa cho chọn chi nhánh, mặc định lấy chi nhánh của user
4. **Permission**: Chưa phân quyền ai được mở/đóng ca (hiện tất cả user đều có thể)

## Next Steps - Phase 2

### 1. Màn hình quản lý ca (`/spa/shifts`)

**Route**: `resources/js/pages/spa/ShiftManagement.tsx`

**Features**:
- Table danh sách ca với columns:
  - Mã ca
  - Chi nhánh
  - Thu ngân (Mở/Đóng)
  - Thời gian (Mở/Đóng/Tổng giờ)
  - Doanh thu (Tiền mặt/CK/Thẻ/Tổng)
  - Chênh lệch (Alert nếu có)
  - Trạng thái (Tag: Đang mở/Đã đóng/Đã bàn giao)
  - Actions (Xem/In/Xác nhận bàn giao)
- Filters:
  - Khoảng thời gian (DateRangePicker)
  - Chi nhánh (Select)
  - Trạng thái (Select)
  - Thu ngân (Select)
- Export Excel báo cáo ca
- Statistics:
  - Tổng số ca
  - Tổng doanh thu
  - Tổng chênh lệch
  - Số ca có vấn đề

### 2. Chi tiết ca modal

- Thông tin ca đầy đủ
- Danh sách hóa đơn trong ca (Table)
- Breakdown doanh thu theo:
  - Phương thức thanh toán
  - KTV (Nếu có)
  - Dịch vụ/Sản phẩm
- Biểu đồ (Chart)
- Nút xác nhận bàn giao (Manager only)

### 3. Xác nhận bàn giao

**Business flow**:
- Thu ngân đóng ca → Trạng thái = 'da_dong'
- Quản lý kiểm tra → Click "Xác nhận bàn giao"
- Nhập ghi chú xác nhận (Tùy chọn)
- Trạng thái = 'da_ban_giao'
- **Lock ca**: Không thể sửa sau khi bàn giao

**Endpoint**: POST `/spa/shifts/{id}/confirm-handover`

## Phase 3 Planning (Optional)

1. **PDF Template** (`resources/views/spa/shift-handover.blade.php`)
   - Header: Logo, tên chi nhánh, mã ca
   - Thông tin ca: Thu ngân, thời gian
   - Bảng doanh thu
   - Chữ ký: Thu ngân / Người nhận
   - Footer: Ngày in, ghi chú

2. **Photo Upload**
   - Chụp ảnh tiền mặt khi đóng ca
   - Lưu vào `spa_ca_lam_viec_anh` table
   - Hiển thị trong modal chi tiết

3. **Telegram Alert**
   - Gửi thông báo nếu chênh lệch > threshold (ví dụ: 100,000đ)
   - Gửi báo cáo cuối ngày

4. **Cash Deposit Tracking**
   - Ghi nhận nộp tiền vào két/ngân hàng
   - `spa_ca_lam_viec_nop_tien` table
   - Link với ca làm việc

## Files Modified/Created

### Database
- ✅ `database/migrations/2025_11_17_100001_create_spa_ca_lam_viec_table.php` (NEW)

### Models
- ✅ `app/Models/Spa/CaLamViec.php` (NEW)

### Controllers
- ✅ `app/Http/Controllers/Admin/Spa/CaLamViecController.php` (NEW)
- ✅ `app/Http/Controllers/Admin/Spa/POSController.php` (MODIFIED - Auto-assign shift)

### Routes
- ✅ `routes/spa_route.php` (MODIFIED - Added shift routes)

### Frontend
- ✅ `resources/js/components/spa/ShiftWidget.tsx` (NEW)
- ✅ `resources/js/pages/spa/SpaPOSScreen.tsx` (MODIFIED - Added widget)
- ✅ `resources/js/common/api.tsx` (MODIFIED - Added shift API constants)

### Documentation
- ✅ `SHIFT_HANDOVER_PHASE1_COMPLETE.md` (THIS FILE)

---

**Completed by**: GitHub Copilot
**Date**: 2025-11-17
**Status**: ✅ Phase 1 Complete - Ready for testing
**Next**: Phase 2 - Shift Management Screen
