# POS Service Package Integration - Complete

**Completion Date**: 2025-01-18  
**Status**: ✅ Production Ready

## Overview

Đã tích hợp hoàn chỉnh hệ thống gói dịch vụ vào màn hình POS. Khách hàng có thể mua gói dịch vụ trước và sử dụng dịch vụ từ gói mà không cần thanh toán thêm.

## Features Implemented

### 1. Package Display in Customer Info (✅ Complete)

**Location**: Customer info card in POS screen

**Features**:
- Hiển thị số lượng gói dịch vụ đang active
- Hiển thị chi tiết từng gói:
  - Tên gói
  - Số lần còn lại / tổng số lần (e.g., 3/5 lần)
  - Ngày hết hạn (nếu có)
- Loading state khi đang tải dữ liệu
- Icon `GiftOutlined` để dễ nhận biết

**Visual**:
```
┌─────────────────────────────────────┐
│ 💰 Số dư ví: 500,000đ               │
│ Tổng nạp: 1,000,000đ                │
│ Đã tiêu: 500,000đ                   │
│ ─────────────────────────────────── │
│ 🎁 Gói dịch vụ (2)                  │
│ ┌─────────────────────────────────┐ │
│ │ Gói Spa Cao Cấp 5 Lần           │ │
│ │ Còn lại: 3/5 lần                │ │
│ │ HSD: 31/12/2025                 │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Gói Massage 10 Lần              │ │
│ │ Còn lại: 8/10 lần               │ │
│ │ HSD: 28/02/2026                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 2. Add to Cart with Package Selection (✅ Complete)

**Location**: `addToCart` function

**Logic Flow**:
1. Khi thêm dịch vụ vào giỏ hàng:
   - Kiểm tra xem khách hàng có gói nào chứa dịch vụ này không
   - Kiểm tra gói còn lượt sử dụng (`so_luong_con_lai > 0`)
2. Nếu có gói khả dụng:
   - Hiển thị Modal xác nhận "Sử dụng từ gói dịch vụ?"
   - Liệt kê các gói khả dụng với số lần còn lại
   - 2 options:
     - **"Sử dụng từ gói"**: Set `su_dung_goi`, `price = 0`, thêm vào giỏ
     - **"Thanh toán thường"**: Thêm vào giỏ với giá bình thường
3. Nếu không có gói:
   - Thêm vào giỏ bình thường

**Modal Example**:
```
┌──────────────────────────────────────────┐
│ 🎁 Sử dụng từ gói dịch vụ?               │
├──────────────────────────────────────────┤
│ Khách hàng có gói dịch vụ khả dụng       │
│ cho dịch vụ này:                         │
│                                          │
│ ┌────────────────────────────────────┐   │
│ │ Gói Spa Cao Cấp 5 Lần              │   │
│ │ Còn lại: 3/5 lần                   │   │
│ └────────────────────────────────────┘   │
│                                          │
│ Bạn có muốn sử dụng từ gói dịch vụ      │
│ không?                                   │
│                                          │
│      [Thanh toán thường]  [Sử dụng từ gói]│
└──────────────────────────────────────────┘
```

### 3. Cart Display with Package Indicators (✅ Complete)

**Location**: Cart table columns

**Features**:
- **Name column**: Hiển thị tên gói bên dưới tên dịch vụ
  ```
  Massage Toàn Thân
  🎁 Gói Spa Cao Cấp 5 Lần
  ```
- **Price column**: Hiển thị "Miễn phí" màu xanh cho items từ gói
- **Quantity column**: Disable cho items từ gói (luôn = 1)
- **Total column**: Hiển thị "Miễn phí" màu xanh

**Example**:
```
┌──────────────────────┬────────────┬────┬─────────────┬────┐
│ Tên                  │ Giá        │ SL │ Thành tiền  │    │
├──────────────────────┼────────────┼────┼─────────────┼────┤
│ Massage Toàn Thân    │ Miễn phí   │ 1  │ Miễn phí    │ 🗑️ │
│ 🎁 Gói Spa 5 Lần     │ (green)    │    │ (green)     │    │
├──────────────────────┼────────────┼────┼─────────────┼────┤
│ Gội Đầu Dưỡng Sinh   │ 150,000đ   │ 2  │ 300,000đ    │ 🗑️ │
└──────────────────────┴────────────┴────┴─────────────┴────┘
```

### 4. Payment Integration (✅ Complete)

**Location**: `handleConfirmPayment` function

**Logic**:
1. Tạo hóa đơn như bình thường (invoice creation)
2. Sau khi tạo hóa đơn thành công:
   - Lọc các items có `su_dung_goi`
   - Với mỗi item từ gói, gọi API `/admin/spa/customer-packages/use`:
     ```typescript
     {
       customer_package_id: item.su_dung_goi,
       dich_vu_id: item.id,
       hoa_don_id: hoaDonId
     }
     ```
   - API sẽ:
     - Tăng `so_luong_da_dung`
     - Cập nhật `trang_thai` nếu đã hết lượt
     - Ghi log trong `spa_hoa_don_chi_tiet.su_dung_goi`
3. Refresh danh sách gói sau khi thanh toán
4. Error handling: Không block payment nếu package API fails

**Code**:
```typescript
// Process package usage for items that used packages
const packageItems = regularItems.filter(item => item.su_dung_goi);
for (const packageItem of packageItems) {
    try {
        await axios.post('/aio/api/admin/spa/customer-packages/use', {
            customer_package_id: packageItem.su_dung_goi,
            dich_vu_id: packageItem.id,
            hoa_don_id: hoaDonId,
        });
    } catch (packageError) {
        console.error('Error using package:', packageError);
        message.warning(`Không thể sử dụng gói cho dịch vụ "${packageItem.name}"`);
    }
}

// Refresh customer packages after payment
if (selectedCustomer && packageItems.length > 0) {
    fetchCustomerPackages(selectedCustomer.value);
}
```

### 5. Invoice Detail Update (✅ Complete)

**Database**: `spa_hoa_don_chi_tiet` table

**Field Added**: `su_dung_goi` (INT, nullable)

**Purpose**: Track which customer package was used for each invoice item

**Mapping in `chi_tiets`**:
```typescript
chi_tiets: regularItems.map(item => ({
    dich_vu_id: item.type === 'service' ? item.id : null,
    san_pham_id: item.type === 'product' ? item.id : null,
    ktv_id: item.ktv_id,
    so_luong: item.quantity,
    don_gia: item.price,
    su_dung_goi: item.su_dung_goi || null, // Package ID
}))
```

## Technical Implementation

### Files Modified

1. **resources/js/pages/spa/SpaPOSScreen.tsx** (5 major changes):
   - Added `GiftOutlined` import
   - Updated customer info card to display packages
   - Modified `addToCart` with package selection modal
   - Updated cart columns to show package indicators
   - Updated payment flow to call package API

### State Management

**New States**:
```typescript
const [customerPackages, setCustomerPackages] = useState<any[]>([]);
const [loadingPackages, setLoadingPackages] = useState(false);
```

**Auto-fetch on Customer Change**:
```typescript
useEffect(() => {
    if (selectedCustomer?.id) {
        fetchCustomerWallet(selectedCustomer.id);
        fetchCustomerPackages(selectedCustomer.id); // ← Auto fetch packages
    } else {
        setCustomerWallet(null);
        setCustomerPackages([]); // ← Clear when no customer
    }
}, [selectedCustomer]);
```

### API Integration

**Endpoint Used**: 
- `POST /aio/api/admin/spa/customer-packages/list` - Get active packages
- `POST /aio/api/admin/spa/customer-packages/use` - Use package during payment

**Package Data Structure**:
```typescript
{
    id: number,
    khach_hang_id: number,
    goi_dich_vu_id: number,
    ten_goi: string,
    gia_mua: number,
    so_luong_tong: number, // Total uses (e.g., 5)
    so_luong_da_dung: number, // Used count
    so_luong_con_lai: number, // Remaining (calculated)
    dich_vu_ids: number[], // [1, 2, 3]
    dich_vu_list: [
        { id: 1, ten_dich_vu: "Massage", gia_ban: 200000 },
        ...
    ],
    ngay_mua: string,
    ngay_het_han: string | null,
    trang_thai: 'dang_dung' | 'da_het' | 'het_han'
}
```

## User Flow Example

### Complete Workflow

1. **Khách hàng mua gói trước** (qua màn hình khác):
   - Gói "Spa Cao Cấp 5 Lần" - 2,000,000đ
   - Chứa 3 dịch vụ: Massage (A), Facial (B), Gội Đầu (C)
   - Mỗi lần có thể chọn 1 dịch vụ, tổng 5 lần

2. **Nhân viên mở POS**:
   - Chọn khách hàng
   - Màn hình hiển thị: "🎁 Gói dịch vụ (1)" với chi tiết gói

3. **Thêm dịch vụ Massage vào giỏ**:
   - Modal hiện lên: "Sử dụng từ gói dịch vụ?"
   - Nhân viên chọn "Sử dụng từ gói"
   - Item thêm vào giỏ với giá = "Miễn phí"
   - Hiển thị: "🎁 Gói Spa Cao Cấp 5 Lần" bên dưới tên dịch vụ

4. **Thêm dịch vụ khác (không có trong gói)**:
   - Thêm vào giỏ bình thường với giá đầy đủ

5. **Thanh toán**:
   - Tổng tiền chỉ tính các item không dùng gói
   - Sau khi thanh toán thành công:
     - Gói cập nhật: 3/5 → 4/5 lần đã dùng
     - Màn hình refresh hiển thị "Còn lại: 4/5 lần"

## Validation & Business Rules

### Package Availability Check

**Conditions for showing "use from package" option**:
1. ✅ Item type = 'service' (not product/gift card)
2. ✅ Customer selected
3. ✅ Customer has at least 1 package
4. ✅ Package contains this service (`dich_vu_id` in `dich_vu_ids`)
5. ✅ Package has remaining uses (`so_luong_con_lai > 0`)
6. ✅ Package not expired (checked by backend)

### Backend Validation (CustomerPackageController)

**When calling `usePackage` API**:
- ✅ Package exists
- ✅ Package belongs to customer
- ✅ Package status = 'dang_dung'
- ✅ Service exists in package's `dich_vu_ids`
- ✅ Package has remaining uses
- ✅ Package not expired (`ngay_het_han >= today`)

**Atomicity**:
- Uses database transaction
- Increments `so_luong_da_dung`
- Updates `trang_thai` to 'da_het' if fully used
- Logs in `spa_hoa_don_chi_tiet.su_dung_goi`

## UI/UX Highlights

### Color Coding
- **Green (#52c41a)**: Package-related info (icon, "Miễn phí", remaining uses)
- **Blue (#1890ff)**: Customer info background, package name
- **White background**: Package cards with light green border

### Icons
- `GiftOutlined`: Package indicator
- `DollarOutlined`: Wallet balance

### Responsive Design
- Package cards scrollable if many packages
- Compact display for small screens
- Mobile-friendly touch targets

## Testing Checklist

### Frontend

- [x] Package display shows correctly when customer selected
- [x] Loading state works during fetch
- [x] Package list clears when customer deselected
- [x] Modal appears when adding service with available package
- [x] Modal shows all available packages for the service
- [x] "Use from package" adds item with price = 0
- [x] "Normal payment" adds item with regular price
- [x] Cart shows package name and "Miễn phí"
- [x] Quantity disabled for package items
- [x] Remove from cart works for package items

### Backend Integration

- [x] `fetchCustomerPackages` API call works
- [x] Package data structure matches interface
- [x] `usePackage` API called during payment
- [x] Package usage count incremented correctly
- [x] Package status updated when fully used
- [x] `su_dung_goi` saved in invoice details
- [x] Package list refreshes after payment

### Business Logic

- [x] Only services (not products) can use packages
- [x] Only packages with remaining uses shown
- [x] Service must be in package's `dich_vu_ids`
- [x] Cannot use expired packages
- [x] Payment doesn't block if package API fails
- [x] Multiple package items in one invoice works

## Database Queries Example

### Get Active Packages (Frontend Calls)
```sql
SELECT cp.*, goi.ten_goi, goi.dich_vu_ids
FROM spa_customer_packages cp
JOIN spa_goi_dich_vu goi ON cp.goi_dich_vu_id = goi.id
WHERE cp.khach_hang_id = ?
  AND cp.trang_thai = 'dang_dung'
  AND (cp.ngay_het_han IS NULL OR cp.ngay_het_han >= CURDATE())
  AND cp.so_luong_da_dung < cp.so_luong_tong
```

### Use Package (Payment Flow)
```sql
-- Transaction start
UPDATE spa_customer_packages 
SET so_luong_da_dung = so_luong_da_dung + 1,
    trang_thai = CASE 
        WHEN so_luong_da_dung + 1 >= so_luong_tong THEN 'da_het'
        ELSE trang_thai
    END
WHERE id = ?;

UPDATE spa_hoa_don_chi_tiet
SET su_dung_goi = ?
WHERE hoa_don_id = ? AND dich_vu_id = ?;
-- Commit
```

## Performance Considerations

### Optimizations
- Package list fetched once per customer change (not per service add)
- Uses React state for instant UI updates
- Error handling doesn't block payment flow
- Async API calls for better UX

### Potential Improvements
- [ ] Cache package data in localStorage
- [ ] Debounce package refresh
- [ ] Add package expiry warning (7 days before expiry)
- [ ] Show package history modal

## Deployment Notes

### Required
1. ✅ Database migrations run (`spa_customer_packages`, `su_dung_goi` column)
2. ✅ Backend routes accessible
3. ✅ Frontend build completed
4. ✅ No TypeScript/ESLint errors

### Configuration
No additional config needed. Uses existing:
- `/aio/api/admin/spa/customer-packages/*` routes
- Current authentication
- Existing error handling

## Documentation Links

- **Backend API**: See `SPA_PACKAGE_SYSTEM_GUIDE.md`
- **Database Schema**: Migration files in `database/migrations/2025_11_18_*`
- **Frontend Component**: `resources/js/pages/spa/SpaPOSScreen.tsx`

## Support

### Common Issues

**Q: Modal doesn't show when adding service**
- Check: Customer selected? Package has remaining uses? Service in package?

**Q: "Miễn phí" shows but package not decremented**
- Check: Payment successful? `usePackage` API called? Check browser console

**Q: Package list empty but customer has packages**
- Check: Package status = 'dang_dung'? Not expired? Has remaining uses?

### Debug Commands

```bash
# Check package data
SELECT * FROM spa_customer_packages WHERE khach_hang_id = X;

# Check invoice details
SELECT * FROM spa_hoa_don_chi_tiet WHERE su_dung_goi IS NOT NULL;

# Check frontend console
# Open browser DevTools → Console → Look for "Error using package"
```

## Conclusion

Hệ thống gói dịch vụ đã được tích hợp đầy đủ vào POS với:
- ✅ UI/UX trực quan, dễ sử dụng
- ✅ Validation đầy đủ (frontend + backend)
- ✅ Error handling robust
- ✅ Database tracking hoàn chỉnh
- ✅ Production-ready

Nhân viên có thể dễ dàng:
1. Xem gói dịch vụ của khách hàng
2. Chọn sử dụng từ gói hoặc thanh toán thường
3. Theo dõi số lần còn lại
4. Hoàn tất thanh toán tự động giảm số lượt

---
**Version**: 1.0.0  
**Last Updated**: 2025-01-18  
**Status**: ✅ Production Ready
