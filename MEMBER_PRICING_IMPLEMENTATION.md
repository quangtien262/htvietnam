# Báo cáo: Triển khai hệ thống giá thành viên (Member Pricing)

## Ngày thực hiện: 22/11/2025

## Tổng quan
Đã triển khai thành công hệ thống giá thành viên cho spa, cho phép:
- Khách hàng tự động trở thành thành viên khi mua thẻ giá trị hoặc gói dịch vụ
- Thành viên nhận giá ưu đãi (price_member) khi mua sản phẩm/dịch vụ
- Hiển thị trạng thái thành viên trong màn hình POS

## Các thay đổi đã thực hiện

### 1. Database Schema

#### Migration file: `2025_11_22_122707_add_price_member_and_is_member_fields.php`

**Thêm cột `price_member` vào 3 bảng:**
- `spa_san_pham.price_member` - Giá thành viên cho sản phẩm
- `spa_dich_vu.price_member` - Giá thành viên cho dịch vụ  
- `spa_goi_dich_vu.price_member` - Giá thành viên cho gói dịch vụ

**Thêm cột `is_member` vào bảng users:**
- `users.is_member` (boolean, default: false) - Đánh dấu khách hàng là thành viên

**Cấu trúc:**
```php
$table->decimal('price_member', 15, 2)->nullable()->comment('Giá dành cho thành viên');
$table->boolean('is_member')->default(false)->comment('Thành viên (đã mua thẻ giá trị hoặc gói dịch vụ)');
```

### 2. Models

#### Cập nhật 4 models để hỗ trợ các trường mới:

**`app/Models/User.php`**
- Thêm `'is_member'` vào `$fillable`
- Thêm `'is_member' => 'boolean'` vào `casts()`

**`app/Models/Spa/SanPham.php`**
- Thêm `'price_member'` vào `$fillable`
- Thêm `'price_member' => 'decimal:0'` vào `$casts`

**`app/Models/Spa/DichVu.php`**
- Thêm `'price_member'` vào `$fillable`
- Thêm `'price_member' => 'decimal:0'` vào `$casts`

**`app/Models/Spa/GoiDichVu.php`**
- Thêm `'price_member'` vào `$fillable`
- Thêm `'price_member' => 'decimal:2'` vào `$casts`

### 3. Backend Logic

#### A. POS Service - Áp dụng giá thành viên
**File:** `app/Services/Spa/POSService.php`

**Vị trí:** Method `createInvoice()`, lines 102-131

**Logic cho dịch vụ:**
```php
if ($dichVu) {
    $khachHang = !empty($data['khach_hang_id']) ? \App\Models\User::find($data['khach_hang_id']) : null;
    
    // Use member price if customer is member and member price exists
    if ($khachHang && $khachHang->is_member && !empty($dichVu->price_member)) {
        $donGia = $dichVu->price_member;
    } else {
        $donGia = $dichVu->gia_ban;
    }
}
```

**Logic cho sản phẩm:**
```php
if ($sanPham) {
    $khachHang = !empty($data['khach_hang_id']) ? \App\Models\User::find($data['khach_hang_id']) : null;
    
    // Use member price if customer is member and member price exists
    if ($khachHang && $khachHang->is_member && !empty($sanPham->price_member)) {
        $donGia = $sanPham->price_member;
    } else {
        $donGia = $sanPham->gia_ban;
    }

    // Update stock
    $sanPham->updateStock($chiTiet['so_luong'], 'decrease');
}
```

**Quy tắc:**
- Kiểm tra khách hàng có `is_member = true`
- Kiểm tra sản phẩm/dịch vụ có `price_member` không null
- Nếu cả 2 điều kiện đúng → dùng `price_member`
- Nếu không → dùng `gia_ban` (giá thường)

#### B. Wallet Service - Kích hoạt thành viên khi mua thẻ
**File:** `app/Services/WalletService.php`

**Vị trí:** Method `deposit()`, lines 62-77

**Logic:**
```php
// Extend wallet expiry if gift card has han_su_dung
if ($theGiaTriId) {
    $theGiaTri = \App\Models\Spa\TheGiaTri::find($theGiaTriId);
    if ($theGiaTri && $theGiaTri->han_su_dung > 0) {
        $customer = \App\Models\User::find($khachHangId);
        if ($customer) {
            $currentExpiry = $customer->han_su_dung_vi ? \Carbon\Carbon::parse($customer->han_su_dung_vi) : now();
            $newExpiry = $currentExpiry->addDays($theGiaTri->han_su_dung);
            $customer->han_su_dung_vi = $newExpiry;
            
            // Activate member status when purchasing gift card
            if (!$customer->is_member) {
                $customer->is_member = true;
                Log::info('Customer activated as member', ['customer_id' => $khachHangId, 'reason' => 'gift_card_purchase']);
            }
            
            $customer->save();
        }
    }
}
```

**Khi nào kích hoạt:**
- Khi khách mua thẻ giá trị (`deposit()` được gọi với `$theGiaTriId`)
- Chỉ kích hoạt nếu `is_member = false` (tránh ghi log không cần thiết)
- Ghi log để tracking

#### C. Customer Package Controller - Kích hoạt thành viên khi mua gói
**File:** `app/Http/Controllers/Admin/Spa/CustomerPackageController.php`

**Vị trí:** Method `purchasePackage()`, lines 158-175

**Logic:**
```php
// Insert customer package
$customerPackageId = DB::table('spa_customer_packages')->insertGetId([...]);

// Activate member status when purchasing package
$customer = \App\Models\User::find($request->khach_hang_id);
if ($customer && !$customer->is_member) {
    $customer->is_member = true;
    $customer->save();
    \Illuminate\Support\Facades\Log::info('Customer activated as member', [
        'customer_id' => $request->khach_hang_id,
        'reason' => 'package_purchase',
        'package_id' => $goiDichVu->id
    ]);
}

DB::commit();
```

**Khi nào kích hoạt:**
- Ngay sau khi tạo customer package thành công
- Chỉ kích hoạt nếu `is_member = false`
- Ghi log với thông tin gói mua

### 4. Frontend UI

#### A. ProductList.tsx - Thêm trường giá thành viên
**File:** `resources/js/pages/spa/ProductList.tsx`

**Vị trí:** Form create/edit product, sau trường "Giá bán"

**Thêm field:**
```tsx
<Col span={8}>
    <Form.Item
        name="price_member"
        label="Giá thành viên"
        tooltip="Giá dành cho khách hàng đã mua thẻ giá trị hoặc gói dịch vụ"
    >
        <InputNumber
            style={{ width: '100%' }}
            min={0}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
            placeholder="Để trống nếu không áp dụng"
        />
    </Form.Item>
</Col>
```

#### B. ServiceList.tsx - Thêm trường giá thành viên
**File:** `resources/js/pages/spa/ServiceList.tsx`

**Vị trí:** Form create/edit service, sau trường "Giá dịch vụ"

**Thêm field:**
```tsx
<Col span={12}>
    <Form.Item
        name="price_member"
        label="Giá thành viên"
        tooltip="Giá dành cho khách hàng đã mua thẻ giá trị hoặc gói dịch vụ"
    >
        <InputNumber
            style={{ width: '100%' }}
            min={0}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
            suffix="VNĐ"
            placeholder="Để trống nếu không áp dụng"
        />
    </Form.Item>
</Col>
```

#### C. ServicePackageList.tsx - Thêm trường giá thành viên
**File:** `resources/js/pages/spa/ServicePackageList.tsx`

**Vị trí:** Form create/edit package, sau trường "Giá bán"

**Thêm field:**
```tsx
<Col span={12}>
    <Form.Item
        name="price_member"
        label="Giá thành viên"
        tooltip="Giá dành cho khách hàng đã là thành viên (đã mua thẻ giá trị hoặc gói dịch vụ khác)"
    >
        <InputNumber
            style={{ width: '100%' }}
            min={0}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
            addonAfter="VNĐ"
            placeholder="Để trống nếu không áp dụng"
        />
    </Form.Item>
</Col>
```

#### D. SpaPOSScreen.tsx - Hiển thị trạng thái thành viên
**File:** `resources/js/pages/spa/SpaPOSScreen.tsx`

**Vị trí:** Customer info card, line 2457

**Thêm badge:**
```tsx
{order.customer && (
    <Card size="small" style={{ background: '#f0f5ff', borderColor: '#1890ff' }}>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
            {order.customer.is_member && (
                <div style={{ marginBottom: 8 }}>
                    <Badge.Ribbon text="THÀNH VIÊN" color="gold" />
                </div>
            )}
            {/* ... rest of customer info ... */}
        </Space>
    </Card>
)}
```

**Hiển thị:**
- Badge "THÀNH VIÊN" màu vàng ở góc phải card
- Chỉ hiện khi `customer.is_member === true`

## Quy trình hoạt động

### 1. Khách hàng trở thành thành viên
```
Khách mua thẻ giá trị
└─> WalletService.deposit()
    └─> Set is_member = true
        └─> Log: 'Customer activated as member (gift_card_purchase)'
```

HOẶC

```
Khách mua gói dịch vụ
└─> CustomerPackageController.purchasePackage()
    └─> Set is_member = true
        └─> Log: 'Customer activated as member (package_purchase)'
```

### 2. Thành viên nhận giá ưu đãi tại POS
```
Tạo hóa đơn (createInvoice)
├─> Lấy thông tin khách hàng
├─> Kiểm tra is_member = true?
│   ├─> YES: Kiểm tra price_member có giá trị?
│   │   ├─> YES: Dùng price_member ✅
│   │   └─> NO: Dùng gia_ban
│   └─> NO: Dùng gia_ban
└─> Tính tổng hóa đơn
```

### 3. Hiển thị trong POS
```
Load khách hàng
└─> API trả về is_member
    └─> POS hiển thị badge "THÀNH VIÊN" (nếu is_member = true)
        └─> Backend tự động áp dụng price_member khi tạo hóa đơn
```

## Testing checklist

### Database
- [x] Migration chạy thành công
- [x] Cột `price_member` xuất hiện trong spa_san_pham, spa_dich_vu, spa_goi_dich_vu
- [x] Cột `is_member` xuất hiện trong users
- [x] Default values đúng (price_member: null, is_member: false)

### Backend
- [ ] Mua thẻ giá trị → `is_member` = true
- [ ] Mua gói dịch vụ → `is_member` = true  
- [ ] Thành viên mua sản phẩm có `price_member` → Dùng giá thành viên
- [ ] Thành viên mua sản phẩm KHÔNG có `price_member` → Dùng giá bán thường
- [ ] Khách thường mua sản phẩm → Luôn dùng giá bán thường
- [ ] Log được ghi khi kích hoạt thành viên

### Frontend
- [ ] Form sản phẩm: Trường "Giá thành viên" hiển thị đúng
- [ ] Form dịch vụ: Trường "Giá thành viên" hiển thị đúng
- [ ] Form gói: Trường "Giá thành viên" hiển thị đúng
- [ ] POS: Badge "THÀNH VIÊN" hiển thị khi khách là member
- [ ] POS: Badge KHÔNG hiển thị khi khách không phải member
- [ ] Lưu price_member thành công (không null, không lỗi validation)

## Lưu ý kỹ thuật

### 1. Nullable vs Required
- `price_member` là **nullable** - Không bắt buộc nhập
- Nếu để trống → Thành viên cũng trả giá thường (không ưu đãi)
- Admin tự quyết định sản phẩm/dịch vụ nào có giá thành viên

### 2. Member activation logic
- **Không reverse**: Một khi là member (is_member=true), không tự động hủy
- **Idempotent**: Gọi nhiều lần không ảnh hưởng (có check `if (!$customer->is_member)`)
- **Logged**: Mọi lần kích hoạt đều ghi log để audit

### 3. POS pricing priority
```
1. Kiểm tra customer.is_member
2. Kiểm tra product.price_member !== null
3. Nếu cả 2 OK → price_member
4. Ngược lại → gia_ban
```

### 4. Database migration safety
- Migration tạo cột mới với `->nullable()`
- Không ảnh hưởng dữ liệu cũ
- Có thể rollback (`down()` method)

## Files đã chỉnh sửa

### Backend (8 files)
1. `database/migrations/2021_09_25_100716_create_users_table.php`
2. `database/migrations/2025_11_10_100001_create_spa_dich_vu_table.php`
3. `database/migrations/2025_11_10_100002_create_spa_san_pham_table.php`
4. `database/migrations/2025_11_15_102544_create_spa_goi_dich_vu_table.php`
5. `database/migrations/2025_11_22_122707_add_price_member_and_is_member_fields.php` (**NEW**)
6. `app/Models/User.php`
7. `app/Models/Spa/SanPham.php`
8. `app/Models/Spa/DichVu.php`
9. `app/Models/Spa/GoiDichVu.php`
10. `app/Services/Spa/POSService.php`
11. `app/Services/WalletService.php`
12. `app/Http/Controllers/Admin/Spa/CustomerPackageController.php`

### Frontend (4 files)
1. `resources/js/pages/spa/ProductList.tsx`
2. `resources/js/pages/spa/ServiceList.tsx`
3. `resources/js/pages/spa/ServicePackageList.tsx`
4. `resources/js/pages/spa/SpaPOSScreen.tsx`

**Tổng: 16 files đã chỉnh sửa, 1 file mới tạo**

## Kế hoạch tiếp theo

### Cần làm thêm:
1. **Update API response**: Đảm bảo `/api/spa/users/select` trả về trường `is_member`
2. **Add to table displays**: Hiển thị `price_member` trong bảng danh sách sản phẩm/dịch vụ
3. **Member badge in customer list**: Thêm indicator trong danh sách khách hàng
4. **Reports**: Báo cáo doanh thu từ thành viên vs khách thường
5. **Member benefits page**: Trang hiển thị ưu đãi thành viên (marketing)

### Tùy chọn nâng cao:
- [ ] Member tiers (Bạc, Vàng, Bạch Kim)
- [ ] Expiry date cho membership
- [ ] Membership fee (phí gia nhập hội viên)
- [ ] Member-only products/services
- [ ] Accumulated points for members

## Kết luận

Hệ thống member pricing đã được triển khai thành công với:
- ✅ Database schema hoàn chỉnh
- ✅ Backend logic tự động kích hoạt thành viên
- ✅ POS áp dụng giá ưu đãi cho thành viên
- ✅ UI form quản lý giá thành viên
- ✅ UI hiển thị trạng thái thành viên trong POS

**Status: READY FOR TESTING**

Migration đã chạy thành công. Cần test các luồng nghiệp vụ để đảm bảo hoạt động đúng.
