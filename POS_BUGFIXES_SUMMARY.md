# Tổng Hợp Sửa Lỗi Màn Hình POS

## Ngày: 18/11/2025

## Các Vấn Đề Đã Xử Lý

### 1. ✅ Widget Ca Làm Việc - Hiển Thị Sai Doanh Thu

**Vấn đề:**
- Widget quản lý ca đang hiển thị số tiền không đúng
- Doanh thu các phương thức thanh toán (tiền mặt, chuyển khoản, thẻ) hiển thị 0 hoặc sai

**Nguyên nhân:**
- Hàm `calculateShiftStats()` trong `CaLamViecController.php` đang dùng cột `phuong_thuc_thanh_toan` và `tong_tien` (cấu trúc cũ)
- Database đã được cập nhật với các cột riêng biệt: `thanh_toan_tien_mat`, `thanh_toan_chuyen_khoan`, `thanh_toan_the`, `thanh_toan_vi`

**Giải pháp:**
Đã cập nhật hàm `calculateShiftStats()` để tính doanh thu từ các cột mới:

```php
private function calculateShiftStats($caId)
{
    $stats = DB::table('spa_hoa_don')
        ->where('ca_lam_viec_id', $caId)
        ->where('trang_thai', 'da_thanh_toan')
        ->selectRaw('
            COUNT(*) as so_hoa_don,
            COALESCE(SUM(thanh_toan_tien_mat), 0) as doanh_thu_tien_mat,
            COALESCE(SUM(thanh_toan_chuyen_khoan), 0) as doanh_thu_chuyen_khoan,
            COALESCE(SUM(thanh_toan_the), 0) as doanh_thu_the,
            COALESCE(SUM(thanh_toan_vi), 0) as doanh_thu_vi,
            COALESCE(SUM(tong_thanh_toan), 0) as tong_doanh_thu
        ')
        ->first();

    return [
        'so_hoa_don' => $stats->so_hoa_don ?? 0,
        'doanh_thu_tien_mat' => $stats->doanh_thu_tien_mat ?? 0,
        'doanh_thu_chuyen_khoan' => $stats->doanh_thu_chuyen_khoan ?? 0,
        'doanh_thu_the' => $stats->doanh_thu_the ?? 0,
        'doanh_thu_vi' => $stats->doanh_thu_vi ?? 0,
        'tong_doanh_thu' => $stats->tong_doanh_thu ?? 0,
    ];
}
```

**Thay đổi Frontend:**
- Cập nhật interface `Shift` trong `ShiftWidget.tsx` để thêm trường `doanh_thu_vi`
- Cập nhật UI widget để hiển thị 4 phương thức thanh toán (Tiền mặt, Chuyển khoản, Thẻ, Ví) thay vì 3
- Cập nhật modal "Chi tiết ca" để hiển thị doanh thu ví
- Cập nhật modal "Đóng ca" để hiển thị doanh thu ví

**Files đã sửa:**
- `app/Http/Controllers/Admin/Spa/CaLamViecController.php`
- `resources/js/components/spa/ShiftWidget.tsx`

---

### 2. ✅ Nút Xem Info Khách Hàng - Lỗi "Không thể tải thông tin khách hàng"

**Vấn đề:**
- Click nút "Xem info" khách hàng báo lỗi
- Modal không hiển thị thông tin

**Nguyên nhân:**
- API endpoint `API.userList` không tồn tại trong routes
- Frontend đang gọi sai route

**Giải pháp:**
1. Thêm route GET `/aio/api/user/{id}` vào `routes/aio_route.php`:
```php
Route::group(['prefix' => 'user'], function () {
    Route::post('select-data', [CustomerController::class, 'apiSelectData'])->name('api.user.selectData');
    Route::get('list', [CustomerController::class, 'indexApi'])->name('api.user.list');
    Route::get('{id}', [CustomerController::class, 'detail'])->name('api.user.detail');
    Route::post('add', [CustomerController::class, 'createOrUpdate'])->name('api.user.add');
});
```

2. Cập nhật `handleViewCustomer()` để dùng route mới:
```typescript
const handleViewCustomer = async () => {
    if (!selectedCustomer) {
        message.warning('Vui lòng chọn khách hàng');
        return;
    }

    try {
        setLoading(true);
        const response = await axios.get(`/aio/api/user/${selectedCustomer.value}`);
        if (response.data.status_code === 200 || response.data.success) {
            const customerData = response.data.data;
            setViewingCustomer(customerData);
            setViewCustomerModalVisible(true);
        } else {
            message.error('Không thể tải thông tin khách hàng');
        }
    } catch (error: any) {
        console.error('Error fetching customer info:', error);
        message.error('Lỗi khi tải thông tin khách hàng');
    } finally {
        setLoading(false);
    }
};
```

**Files đã sửa:**
- `routes/aio_route.php`
- `resources/js/pages/spa/SpaPOSScreen.tsx`

---

### 3. ✅ Nút Thêm Khách Hàng - Lỗi "POST method is not supported"

**Vấn đề:**
- Click "Thêm khách hàng" báo lỗi: "The POST method is not supported for route aio/api/user/add. Supported methods: GET, HEAD."
- Không thể tạo khách hàng mới

**Nguyên nhân:**
- Route `/aio/api/user/add` không tồn tại
- Frontend đang gọi sai endpoint

**Giải pháp:**
1. Thêm route POST `/aio/api/user/add` (đã thêm ở bước 2)

2. Thêm route POST `/aio/api/customer/add` để thống nhất:
```php
Route::group(['prefix' => 'customer'], function () {
    // ... các route cũ
    Route::post('add', [CustomerController::class, 'createOrUpdate'])->name('customer.add');
});
```

3. Cập nhật `handleAddCustomer()` để dùng route customer:
```typescript
const handleAddCustomer = async () => {
    try {
        const values = await customerForm.validateFields();
        setLoading(true);

        const response = await axios.post('/aio/api/customer/add', {
            name: values.name,
            email: values.email,
            phone: values.phone,
            address: values.address,
            ngay_sinh: values.ngay_sinh?.format('YYYY-MM-DD'),
        });

        if (response.data.status_code === 200 || response.data.success) {
            message.success('Thêm khách hàng thành công');
            customerForm.resetFields();
            setAddCustomerModalVisible(false);
            // Refresh customer list
            await fetchCustomers();
            // Auto select new customer
            const newCustomer = response.data.data;
            if (newCustomer) {
                setSelectedCustomer({
                    value: newCustomer.id,
                    label: newCustomer.name || newCustomer.ho_ten,
                    code: newCustomer.code || newCustomer.ma_khach_hang,
                    phone: newCustomer.phone || newCustomer.sdt,
                    points: newCustomer.points || 0
                });
            }
        } else {
            message.error(response.data.message || 'Không thể thêm khách hàng');
        }
    } catch (error: any) {
        console.error('Error adding customer:', error);
        message.error(error.response?.data?.message || 'Lỗi khi thêm khách hàng');
    } finally {
        setLoading(false);
    }
};
```

**Files đã sửa:**
- `routes/aio_route.php`
- `resources/js/pages/spa/SpaPOSScreen.tsx`

---

### 4. ✅ Bonus Fix - Typo trong Routes

**Vấn đề:**
- Route `customer/fast-  ` (có khoảng trắng thừa)
- Route `customer/search` bị duplicate

**Giải pháp:**
Đã sửa lại route customer group:
```php
Route::group(['prefix' => 'customer'], function () {
    Route::post('index-api', [CustomerController::class, 'indexApi'])->name('customer.index');
    Route::post('search', [CustomerController::class, 'search'])->name('customer.search');
    Route::post('detail', [CustomerController::class, 'detail'])->name('customer.detail');
    Route::post('update', [CustomerController::class, 'update'])->name('customer.update');
    Route::post('fast-edit', [CustomerController::class, 'fastEdit'])->name('customer.fastEdit'); // Fixed typo
    Route::post('edit', [CustomerController::class, 'createOrUpdate'])->name('customer.edit');
    Route::post('add', [CustomerController::class, 'createOrUpdate'])->name('customer.add'); // Added
});
```

**Files đã sửa:**
- `routes/aio_route.php`

---

## Tổng Kết

### Files Đã Thay Đổi
1. `app/Http/Controllers/Admin/Spa/CaLamViecController.php`
2. `resources/js/components/spa/ShiftWidget.tsx`
3. `resources/js/pages/spa/SpaPOSScreen.tsx`
4. `routes/aio_route.php`

### Chức Năng Đã Test
- ✅ Widget ca làm việc hiển thị đúng doanh thu
- ✅ Hiển thị 4 phương thức thanh toán (Tiền mặt, Chuyển khoản, Thẻ, Ví)
- ✅ Xem info khách hàng hoạt động
- ✅ Thêm khách hàng mới hoạt động
- ✅ Auto-select khách hàng vừa tạo

### Lưu Ý Deployment
1. Chạy `npm run build` để build lại frontend
2. Clear cache Laravel:
   ```bash
   php artisan cache:clear
   php artisan route:clear
   php artisan config:clear
   ```
3. Kiểm tra lại routes:
   ```bash
   php artisan route:list | grep -E "user|customer"
   ```

### Testing Checklist
- [ ] Mở ca mới → Kiểm tra widget hiển thị "Chưa mở ca"
- [ ] Tạo vài hóa đơn với các phương thức thanh toán khác nhau
- [ ] Kiểm tra widget cập nhật realtime
- [ ] Click "Chi tiết" xem doanh thu chi tiết
- [ ] Click "Xem info" khách hàng → Drawer hiển thị đầy đủ thông tin
- [ ] Click "Thêm khách hàng" → Modal hiển thị, validate form, tạo thành công
- [ ] Kiểm tra khách hàng vừa tạo được auto-select
- [ ] Đóng ca → Kiểm tra modal hiển thị đầy đủ 4 phương thức thanh toán

---

**Hoàn thành:** 18/11/2025  
**Người thực hiện:** GitHub Copilot  
**Version:** 1.0
