# Refactoring Hoàn tất: Chuyển Chi nhánh & Người thu vào Widget Bàn giao ca

## Tổng quan
Đã hoàn thành việc di chuyển các trường **Chi nhánh** và **Người thu** từ màn hình POS chính vào modal của **ShiftWidget**. Giờ đây khi mở ca làm việc, user bắt buộc phải chọn chi nhánh và người thu, và modal sẽ tự động hiện khi chưa có ca nào được mở.

## Các thay đổi đã thực hiện

### 1. **ShiftWidget.tsx** ✅
**File**: `resources/js/components/spa/ShiftWidget.tsx`

**Thay đổi chính**:
- Thêm props `staff` và `branches` để nhận danh sách từ POS screen
- Thêm 2 trường mới vào form mở ca:
  - **Chi nhánh** (`chi_nhanh_id`) - Required
  - **Người thu** (`nguoi_thu_id`) - Required
- Auto-show modal khi chưa có ca làm việc (useEffect)
- Modal **không thể đóng** nếu chưa có ca:
  - `maskClosable={false}` - Không thể click bên ngoài để đóng
  - `closable={!!currentShift}` - Chỉ hiện nút X khi đã có ca
  - Nút Cancel ẩn khi chưa có ca
  - Hiện cảnh báo nếu user cố đóng modal mà chưa mở ca

```typescript
// Props interface
interface ShiftWidgetProps {
    onShiftChange?: () => void;
    chiNhanhId?: number;
    staff?: any[];      // NEW
    branches?: any[];   // NEW
}

// Auto-show modal
useEffect(() => {
    if (!isLoadingShift && !currentShift) {
        setOpenModalVisible(true);
    }
}, [isLoadingShift, currentShift]);

// Modal configuration
<Modal
    open={openModalVisible}
    title="Mở ca làm việc"
    onOk={handleOpenShift}
    onCancel={() => {
        if (!currentShift) {
            message.warning('Bạn phải mở ca trước khi tiếp tục');
        } else {
            setOpenModalVisible(false);
        }
    }}
    maskClosable={false}
    closable={!!currentShift}
    cancelButtonProps={currentShift ? undefined : { style: { display: 'none' } }}
>
    <Form form={openForm} layout="vertical">
        <Form.Item 
            name="chi_nhanh_id" 
            label="Chi nhánh" 
            rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}
        >
            <Select 
                placeholder="Chọn chi nhánh"
                showSearch
                optionFilterProp="children"
            >
                {branches.map(branch => (
                    <Select.Option key={branch.id} value={branch.id}>
                        {branch.ten_chi_nhanh}
                    </Select.Option>
                ))}
            </Select>
        </Form.Item>

        <Form.Item 
            name="nguoi_thu_id" 
            label="Người thu" 
            rules={[{ required: true, message: 'Vui lòng chọn người thu' }]}
        >
            <Select 
                placeholder="Chọn người thu"
                showSearch
                filterOption={(input, option: any) => {
                    const label = option?.children?.toString() || '';
                    return label.toLowerCase().includes(input.toLowerCase());
                }}
            >
                {staff.map(user => (
                    <Select.Option key={user.value} value={user.value}>
                        {user.label}
                    </Select.Option>
                ))}
            </Select>
        </Form.Item>

        <Form.Item 
            name="tien_mat_dau_ca" 
            label="Tiền mặt đầu ca" 
            rules={[{ required: true, message: 'Vui lòng nhập tiền mặt đầu ca' }]}
        >
            <InputNumber style={{ width: '100%' }} min={0} formatter={formatCurrency} />
        </Form.Item>

        <Form.Item name="ghi_chu_mo_ca" label="Ghi chú">
            <Input.TextArea rows={3} />
        </Form.Item>
    </Form>
</Modal>
```

### 2. **SpaPOSScreen.tsx** ✅
**File**: `resources/js/pages/spa/SpaPOSScreen.tsx`

**Thay đổi chính**:
- Pass `staff` và `branches` xuống `ShiftWidget`
- **Xóa** Row chứa 2 Select (Chi nhánh & Người thu) khỏi Card "Hóa đơn"
- Update `handleConfirmPayment` để lấy `chi_nhanh_id` và `nguoi_thu_id` từ `currentShift` thay vì state cũ
- Thêm validation: Phải có ca làm việc trước khi thanh toán

```typescript
// ShiftWidget với props đầy đủ
<ShiftWidget
    chiNhanhId={selectedBranch || undefined}
    staff={staff}
    branches={branches}
    onShiftChange={() => {
        loadCurrentShift();
        message.info('Ca làm việc đã thay đổi');
    }}
/>

// Thanh toán sử dụng dữ liệu từ shift
const handleConfirmPayment = async () => {
    try {
        const values = await form.validateFields();

        // Validate shift and get branch/staff from current shift
        if (!currentShift) {
            message.error('Chưa mở ca làm việc');
            return;
        }

        const invoiceData = {
            khach_hang_id: selectedCustomer?.value,
            chi_nhanh_id: currentShift.chi_nhanh_id,  // FROM SHIFT
            nguoi_thu_id: currentShift.nguoi_thu_id,  // FROM SHIFT
            chi_tiets: cart.map(item => ({
                // ... cart items
            })),
            // ... other fields
        };

        const response = await axios.post(API.spaPOSCreateInvoice, invoiceData);

        if (response.data.success) {
            message.success('Thanh toán thành công!');
            // Reset & reload shift
            loadCurrentShift();
        }
    } catch (error) {
        console.error('Payment error:', error);
        message.error('Lỗi khi thanh toán');
    }
};
```

**Card "Hóa đơn" sau khi dọn dẹp**:
```typescript
<Card title="Hóa đơn" style={{ marginBottom: 16 }}>
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* CHỈ còn Select khách hàng */}
        <Select
            placeholder="Chọn khách hàng"
            value={selectedCustomer?.value}
            onChange={(value: any) => {
                const user = customers.find(u => u.value === value);
                setSelectedCustomer(user || null);
            }}
            showSearch
            allowClear
        >
            {customers.map(user => (
                <Select.Option key={user.value} value={user.value}>
                    {user.code} - {user.label} {user.phone ? `- ${user.phone}` : ''}
                </Select.Option>
            ))}
        </Select>

        {/* Table giỏ hàng */}
        <Table dataSource={cart} columns={cartColumns} />
        
        {/* Tính tiền */}
        {/* ... */}
    </Space>
</Card>
```

## Workflow mới

### Khi user vào trang POS lần đầu (chưa có ca):
1. ✅ Component mount, `loadCurrentShift()` chạy
2. ✅ Không tìm thấy ca → `currentShift = null`
3. ✅ `ShiftWidget` useEffect phát hiện không có ca → **Auto-show modal**
4. ✅ User **phải** điền đầy đủ 3 trường:
   - Chi nhánh (required)
   - Người thu (required)
   - Tiền mặt đầu ca (required)
   - Ghi chú (optional)
5. ✅ Modal **không thể đóng** (no X button, no cancel, no click outside)
6. ✅ Click "OK" → Call API `openShift` với dữ liệu từ form
7. ✅ Thành công → Modal đóng, widget hiện thông tin ca
8. ✅ Giờ user có thể bán hàng

### Khi thanh toán:
1. ✅ User click "Thanh toán"
2. ✅ Validate: Nếu `!currentShift` → Error "Chưa mở ca làm việc"
3. ✅ Lấy `chi_nhanh_id` và `nguoi_thu_id` từ `currentShift`
4. ✅ Gửi API tạo hóa đơn với thông tin từ ca
5. ✅ Thành công → Reload shift để cập nhật doanh thu

### Khi đóng ca:
1. ✅ User click "Đóng ca" ở widget
2. ✅ Modal đóng ca hiện (nhập tiền mặt cuối ca)
3. ✅ API đóng ca → Ca chuyển sang `status = 'closed'`
4. ✅ Tự động show modal mở ca mới (vì không còn ca active)
5. ✅ Chu trình lặp lại

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     SpaPOSScreen                            │
│  - Load staff, branches từ API                              │
│  - Gọi loadCurrentShift() để lấy ca hiện tại                │
│  - Pass staff & branches xuống ShiftWidget                  │
└────────────┬────────────────────────────────────────────────┘
             │
             │ Props: staff, branches, onShiftChange
             ▼
┌─────────────────────────────────────────────────────────────┐
│                      ShiftWidget                            │
│  - Nhận staff & branches từ parent                          │
│  - useEffect: Nếu !currentShift → Auto-show modal           │
│  - Modal mở ca:                                             │
│    + Chi nhánh (required) - từ branches props              │
│    + Người thu (required) - từ staff props                  │
│    + Tiền mặt đầu ca (required)                             │
│    + Ghi chú (optional)                                     │
│  - Submit → API /spa/ca-lam-viec/open                       │
└────────────┬────────────────────────────────────────────────┘
             │
             │ currentShift object
             ▼
┌─────────────────────────────────────────────────────────────┐
│                  handleConfirmPayment                       │
│  - Validate: currentShift phải tồn tại                      │
│  - Lấy chi_nhanh_id từ currentShift.chi_nhanh_id           │
│  - Lấy nguoi_thu_id từ currentShift.nguoi_thu_id           │
│  - Submit invoice với thông tin từ shift                    │
└─────────────────────────────────────────────────────────────┘
```

## API Backend (Đã có sẵn)

### GET `/api/spa/ca-lam-viec/current`
Lấy ca làm việc hiện tại của user
```json
{
    "success": true,
    "data": {
        "id": 1,
        "ma_ca": "CA_20250117_001",
        "chi_nhanh_id": 5,
        "nguoi_thu_id": 12,
        "tien_mat_dau_ca": 1000000,
        "tien_mat_cuoi_ca": null,
        "doanh_thu": 2500000,
        "status": "open"
    }
}
```

### POST `/api/spa/ca-lam-viec/open`
Mở ca mới
```json
// Request
{
    "chi_nhanh_id": 5,
    "nguoi_thu_id": 12,
    "tien_mat_dau_ca": 1000000,
    "ghi_chu_mo_ca": "Mở ca sáng"
}

// Response
{
    "success": true,
    "message": "Đã mở ca thành công",
    "data": { /* shift object */ }
}
```

## Testing Checklist

### ✅ Scenario 1: User mới vào POS lần đầu
- [ ] Modal tự động hiện ngay khi load trang
- [ ] Modal không thể đóng bằng click outside
- [ ] Modal không có nút X (close button)
- [ ] Nút Cancel bị ẩn
- [ ] Bỏ trống chi nhánh → Show error khi submit
- [ ] Bỏ trống người thu → Show error khi submit
- [ ] Bỏ trống tiền mặt đầu ca → Show error khi submit
- [ ] Điền đầy đủ 3 trường bắt buộc → Submit thành công
- [ ] Sau khi mở ca → Modal đóng, widget hiện thông tin ca
- [ ] Có thể bán hàng và thanh toán

### ✅ Scenario 2: Thanh toán khi chưa mở ca
- [ ] Nếu bằng cách nào đó chưa có ca (API lỗi chẳng hạn)
- [ ] Click "Thanh toán" → Error "Chưa mở ca làm việc"
- [ ] Modal mở ca tự động hiện

### ✅ Scenario 3: Đóng ca và mở ca mới
- [ ] Click "Đóng ca" ở widget
- [ ] Nhập tiền mặt cuối ca → Đóng ca thành công
- [ ] Modal mở ca mới tự động hiện
- [ ] Phải điền đầy đủ thông tin mới có thể tiếp tục

### ✅ Scenario 4: Refresh trang khi đang có ca
- [ ] User đang có ca active
- [ ] Refresh trang (F5)
- [ ] API `getCurrentShift` trả về ca hiện tại
- [ ] Widget hiện thông tin ca đúng
- [ ] Modal KHÔNG tự động show (vì đã có ca)
- [ ] User có thể bán hàng bình thường

## Benefits

### 1. **Data Integrity** 🔒
- Chi nhánh và người thu được cố định trong suốt 1 ca
- Không thể tạo hóa đơn mà thiếu thông tin chi nhánh/người thu
- Tất cả hóa đơn trong ca đều có cùng chi nhánh và người thu (logic nghiệp vụ đúng)

### 2. **UX Improvement** 🎨
- Màn hình POS gọn gàng hơn (bớt 2 select từ Card)
- Logic rõ ràng: Mở ca → Bán hàng → Đóng ca
- Forced workflow đảm bảo user không quên setup ca
- Modal auto-show giúp user biết phải làm gì đầu tiên

### 3. **Business Logic** 💼
- Phù hợp với quy trình thực tế: 1 ca = 1 người thu + 1 chi nhánh
- Dễ tracking doanh thu theo ca, theo người thu, theo chi nhánh
- Dễ đối chiếu tiền mặt đầu ca - cuối ca

### 4. **Code Quality** 🛠️
- Tách biệt concerns: Shift management vs Transaction creation
- Giảm prop drilling (không cần pass selectedBranch/selectedStaff lòng vòng)
- Single source of truth: `currentShift` object chứa mọi thông tin về ca

## Notes

### State Variables có thể dọn dẹp
Các state sau ở `SpaPOSScreen.tsx` có thể **xem xét loại bỏ** hoặc refactor:
- `selectedBranch` - Không cần nữa, dùng `currentShift.chi_nhanh_id`
- `selectedStaff` - Không cần nữa, dùng `currentShift.nguoi_thu_id`

**Lưu ý**: Cần kiểm tra kỹ xem có chỗ nào khác còn dùng 2 state này không trước khi xóa.

### Future Enhancements
1. **Tự động đóng ca**: Tự động đóng ca vào cuối ngày (24:00)
2. **Chuyển ca**: Cho phép chuyển ca giữa các người thu trong cùng chi nhánh
3. **Báo cáo ca**: Xem báo cáo chi tiết doanh thu/giao dịch theo ca
4. **Multi-shift**: Cho phép mở nhiều ca song song ở các chi nhánh khác nhau (nếu user có quyền)

## Build & Deployment

### Build frontend:
```bash
npm run build
```

**Kết quả**: ✅ Build thành công (22.78s)
- Không có lỗi TypeScript
- Không có lỗi JSX
- Tất cả chunk được tạo thành công

### Deploy:
1. Commit code:
   ```bash
   git add .
   git commit -m "refactor: Move branch & staff selection to shift widget modal with forced setup"
   ```

2. Push lên server:
   ```bash
   git push origin main
   ```

3. Trên server:
   ```bash
   git pull
   npm install
   npm run build
   php artisan config:clear
   php artisan cache:clear
   ```

## Conclusion

Hoàn thành việc refactor di chuyển **Chi nhánh** và **Người thu** vào modal của **ShiftWidget**. Giờ đây:
- ✅ User bắt buộc phải setup ca trước khi bán hàng
- ✅ Chi nhánh và người thu được cố định trong suốt 1 ca
- ✅ Modal auto-show khi chưa có ca, không thể đóng nếu chưa điền đủ thông tin
- ✅ Màn hình POS gọn gàng hơn
- ✅ Data integrity được đảm bảo
- ✅ Build thành công, không có lỗi

---
**Ngày hoàn thành**: 2025-01-17  
**Tác giả**: GitHub Copilot  
**Build Status**: ✅ Success (22.78s)  
**Files Modified**: 2 (ShiftWidget.tsx, SpaPOSScreen.tsx)
