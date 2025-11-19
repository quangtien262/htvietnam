# Bổ sung trường Người thu và Chi nhánh vào POS Bán hàng

## Tổng quan
Đã bổ sung 2 trường Select vào màn hình POS Bán hàng để chọn:
- **Chi nhánh**: Bắt buộc - Chi nhánh thực hiện bán hàng
- **Người thu**: Tùy chọn - Nhân viên thu tiền/bán hàng

## Chi tiết thay đổi

### 1. Database Migration

**File**: `database/migrations/2025_11_17_100002_add_nguoi_thu_id_to_spa_hoa_don_table.php`

**Thay đổi**:
```sql
ALTER TABLE spa_hoa_don 
ADD COLUMN nguoi_thu_id BIGINT UNSIGNED NULL AFTER nhan_vien_ban_id;

ALTER TABLE spa_hoa_don 
ADD FOREIGN KEY (nguoi_thu_id) REFERENCES users(id) ON DELETE SET NULL;
```

**Mục đích**: Lưu thông tin nhân viên thu tiền cho mỗi hóa đơn.

### 2. Model Update

**File**: `app/Models/Spa/HoaDon.php`

**Thay đổi**:
1. Thêm `nguoi_thu_id` và `ca_lam_viec_id` vào `$fillable`
2. Thêm relationships:
   ```php
   public function nguoiThu()
   {
       return $this->belongsTo(\App\Models\User::class, 'nguoi_thu_id');
   }

   public function caLamViec()
   {
       return $this->belongsTo(CaLamViec::class, 'ca_lam_viec_id');
   }
   ```

### 3. Controller Update

**File**: `app/Http/Controllers/Admin/Spa/POSController.php`

**Thay đổi**:
- Thêm `nguoi_thu_id` vào validation rules:
  ```php
  'nguoi_thu_id' => 'nullable|integer',
  ```

**Lưu ý**: Field này được truyền từ frontend và tự động lưu vào database.

### 4. Frontend UI

**File**: `resources/js/pages/spa/SpaPOSScreen.tsx`

#### States mới:
```typescript
const [staff, setStaff] = useState<any[]>([]);
const [branches, setBranches] = useState<any[]>([]);
const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
```

#### Functions fetch data:
```typescript
const fetchStaff = async () => {
    const response = await axios.post(API.userSelect);
    // Load danh sách nhân viên
};

const fetchBranches = async () => {
    const response = await axios.get(API.spaBranchList);
    // Load danh sách chi nhánh
    // Auto-select chi nhánh đầu tiên nếu có
};
```

#### UI Layout:
```tsx
<Row gutter={8}>
    <Col span={12}>
        <Select placeholder="Chi nhánh" value={selectedBranch} onChange={setSelectedBranch}>
            {branches.map(branch => (
                <Select.Option key={branch.id} value={branch.id}>
                    {branch.ten_chi_nhanh}
                </Select.Option>
            ))}
        </Select>
    </Col>
    <Col span={12}>
        <Select placeholder="Người thu" value={selectedStaff} onChange={setSelectedStaff}>
            {staff.map(user => (
                <Select.Option key={user.value} value={user.value}>
                    {user.label}
                </Select.Option>
            ))}
        </Select>
    </Col>
</Row>
```

#### Validation & Submit:
```typescript
const handleConfirmPayment = async () => {
    if (!selectedBranch) {
        message.error('Vui lòng chọn chi nhánh');
        return;
    }

    const invoiceData = {
        chi_nhanh_id: selectedBranch,
        nguoi_thu_id: selectedStaff,
        // ... other fields
    };

    await axios.post(API.spaPOSCreateInvoice, invoiceData);
};
```

## Business Logic

### Chi nhánh (Branch)
- **Bắt buộc chọn**: Không cho phép thanh toán nếu chưa chọn chi nhánh
- **Auto-select**: Tự động chọn chi nhánh đầu tiên khi load page
- **Data source**: API `/aio/api/spa/branches`
- **Mục đích**: 
  - Phân biệt doanh thu theo chi nhánh
  - Liên kết với ca làm việc (shift)
  - Quản lý tồn kho theo chi nhánh

### Người thu (Cashier)
- **Tùy chọn**: Có thể để trống
- **Data source**: API `/user/select-data` (danh sách tất cả users)
- **Searchable**: Có thể tìm kiếm theo tên
- **Mục đích**:
  - Theo dõi ai là người bán hàng/thu tiền
  - Báo cáo hiệu suất nhân viên
  - Audit trail

## UI/UX

### Vị trí:
- Nằm ngay đầu card "Hóa đơn" (trước "Chọn khách hàng")
- Layout 2 cột (50% - 50%)
- Spacing: gutter 8px

### Hiển thị:
```
┌─────────────────────────────────────────────┐
│ Hóa đơn                                     │
├─────────────────────────────────────────────┤
│ [ Chi nhánh ▼ ]    [ Người thu ▼ ]         │
│ [ Chọn khách hàng ▼ ]                       │
│ ┌──────────────────────────────────────┐    │
│ │ Danh sách sản phẩm/dịch vụ           │    │
│ └──────────────────────────────────────┘    │
│ ...                                         │
└─────────────────────────────────────────────┘
```

### Tương tác:
- Chi nhánh:
  - Required indicator (validation khi submit)
  - Searchable dropdown
  - Show tooltip nếu chưa chọn
- Người thu:
  - Optional
  - Searchable dropdown với filter theo tên
  - Clear button (allowClear)

## Integration với Shift (Ca làm việc)

Khi tạo hóa đơn, hệ thống tự động:
1. Lấy chi nhánh đã chọn (`selectedBranch`)
2. Tìm ca đang mở của chi nhánh đó
3. Gán hóa đơn vào ca (`ca_lam_viec_id`)

**Code** (trong `POSController.php`):
```php
$currentShift = CaLamViec::where('chi_nhanh_id', $validated['chi_nhanh_id'])
    ->where('trang_thai', 'dang_mo')
    ->first();

if ($currentShift) {
    $validated['ca_lam_viec_id'] = $currentShift->id;
}
```

## Testing Checklist

### Frontend
- [ ] Load danh sách chi nhánh khi vào trang
- [ ] Load danh sách nhân viên khi vào trang
- [ ] Auto-select chi nhánh đầu tiên
- [ ] Search chi nhánh theo tên
- [ ] Search người thu theo tên
- [ ] Clear người thu (allowClear)
- [ ] Validation: Không cho submit nếu chưa chọn chi nhánh
- [ ] Submit thành công với chi nhánh + người thu
- [ ] Submit thành công với chỉ chi nhánh (người thu null)

### Backend
- [ ] API `/aio/api/spa/branches` trả về danh sách chi nhánh
- [ ] API `/user/select-data` trả về danh sách users
- [ ] Validate `chi_nhanh_id` khi tạo hóa đơn
- [ ] Cho phép `nguoi_thu_id` null
- [ ] Lưu đúng `nguoi_thu_id` vào database
- [ ] Auto-assign `ca_lam_viec_id` dựa trên chi nhánh

### Database
- [ ] Cột `nguoi_thu_id` đã tạo thành công
- [ ] Foreign key constraint hoạt động đúng
- [ ] ON DELETE SET NULL khi xóa user

## Usage Guide

### Quy trình bán hàng:

1. **Mở POS**: Truy cập http://localhost:99/aio/spa/pos?p=spa

2. **Chọn chi nhánh**: 
   - Hệ thống tự động chọn chi nhánh đầu tiên
   - Có thể đổi sang chi nhánh khác nếu cần

3. **Chọn người thu** (Tùy chọn):
   - Chọn nhân viên đang thu tiền
   - Có thể để trống nếu không cần theo dõi

4. **Chọn khách hàng** (Tùy chọn):
   - Tìm và chọn khách hàng nếu có

5. **Thêm sản phẩm/dịch vụ**:
   - Click vào sản phẩm/dịch vụ để thêm vào giỏ

6. **Thanh toán**:
   - Click "Thanh toán"
   - Chọn phương thức thanh toán
   - Xác nhận

7. **Kết quả**:
   - Hóa đơn được tạo với:
     - `chi_nhanh_id` = Chi nhánh đã chọn
     - `nguoi_thu_id` = Người thu (nếu có)
     - `ca_lam_viec_id` = Ca đang mở (auto)

### Báo cáo:

Sau khi có dữ liệu, có thể:
- Lọc hóa đơn theo chi nhánh
- Lọc hóa đơn theo người thu
- Thống kê doanh thu theo nhân viên
- Xem chi tiết ca làm việc

## Known Issues & Future Enhancements

### Current Limitations:
1. Chưa lọc nhân viên theo chi nhánh (hiện show tất cả users)
2. Chưa có permission check (ai cũng có thể chọn chi nhánh bất kỳ)
3. Chưa save branch preference (phải chọn lại mỗi lần reload)

### Future Enhancements:
1. **Filter staff by branch**: Chỉ show nhân viên thuộc chi nhánh đã chọn
2. **Save preference**: Lưu chi nhánh đã chọn vào localStorage
3. **Auto-select cashier**: Tự động chọn user đang login
4. **Permission**: Chỉ cho phép user quản lý chọn chi nhánh khác
5. **Realtime sync**: Update khi đổi ca/đổi chi nhánh

## Files Modified/Created

### Database
- ✅ `database/migrations/2025_11_17_100002_add_nguoi_thu_id_to_spa_hoa_don_table.php` (NEW)

### Models
- ✅ `app/Models/Spa/HoaDon.php` (MODIFIED - Added nguoi_thu_id, relationships)

### Controllers
- ✅ `app/Http/Controllers/Admin/Spa/POSController.php` (MODIFIED - Added validation)

### Frontend
- ✅ `resources/js/pages/spa/SpaPOSScreen.tsx` (MODIFIED - Added UI, states, functions)

### Documentation
- ✅ `POS_NGUOI_THU_CHI_NHANH.md` (THIS FILE)

---

**Completed by**: GitHub Copilot
**Date**: 2025-11-17
**Status**: ✅ Complete - Ready for testing
