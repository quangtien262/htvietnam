# Sửa lỗi "Nhập kho hàng loạt" không cập nhật danh sách

## Vấn đề
- URL: http://localhost:99/aio/spa/inventory?p=kho
- Hiện tượng: Sau khi nhập kho hàng loạt, hệ thống báo "Nhập hàng thành công" nhưng danh sách kho không thay đổi
- Nguyên nhân: Backend cập nhật sai bảng

## Nguyên nhân chi tiết

### Cơ chế hoạt động hiện tại:
1. **Frontend** (InventoryList.tsx):
   - Gọi API `POST /spa/inventory/bulk-import` để nhập kho
   - Gọi API `GET /spa/inventory-stock/list` để hiển thị danh sách kho

2. **Backend trước khi sửa**:
   - `bulkImport()` cập nhật bảng `spa_san_pham.ton_kho` (sai!)
   - `stockList()` đọc từ bảng `spa_ton_kho_chi_nhanh` (đúng!)
   
3. **Vấn đề**: 2 bảng khác nhau → dữ liệu không đồng bộ!

## Giải pháp

### File: `app/Http/Controllers/Admin/Spa/NhapKhoController.php`

#### 1. Sửa method `bulkImport()` (line 210-248)

**Trước:**
```php
DB::transaction(function () use ($request, &$successCount) {
    foreach ($request->items as $item) {
        // Cập nhật trực tiếp bảng spa_san_pham - SAI!
        DB::table('spa_san_pham')
            ->where('id', $item['san_pham_id'])
            ->increment('ton_kho', $item['so_luong']);

        DB::table('spa_san_pham')
            ->where('id', $item['san_pham_id'])
            ->update(['gia_nhap' => $item['gia_nhap']]);

        $successCount++;
    }
});
```

**Sau:**
```php
$chiNhanhId = $request->chi_nhanh_id ?? 1; // Thêm chi nhánh

DB::transaction(function () use ($request, $chiNhanhId, &$successCount) {
    foreach ($request->items as $item) {
        // Dùng model method để cập nhật đúng cả 2 bảng
        TonKhoChiNhanh::updateStock(
            $chiNhanhId,
            $item['san_pham_id'],
            $item['so_luong'],
            'increase',
            $item['gia_nhap']
        );

        // Đồng bộ tổng tồn kho vào spa_san_pham
        TonKhoChiNhanh::syncWithProductTable($item['san_pham_id']);

        $successCount++;
    }
});
```

**Thay đổi:**
- ✅ Dùng `TonKhoChiNhanh::updateStock()` thay vì cập nhật trực tiếp
- ✅ Cập nhật bảng `spa_ton_kho_chi_nhanh` (tồn kho theo chi nhánh)
- ✅ Tự động tính giá vốn bình quân (AVCO)
- ✅ Đồng bộ tổng tồn kho về bảng `spa_san_pham`
- ✅ Thêm tham số `chi_nhanh_id` (mặc định = 1)

#### 2. Sửa method `importCsv()` (line 250-320)

**Giống như `bulkImport()`, thay thế:**
```php
DB::table('spa_san_pham')
    ->where('id', $item['san_pham_id'])
    ->increment('ton_kho', $item['so_luong']);
```

**Bằng:**
```php
TonKhoChiNhanh::updateStock(
    $chiNhanhId,
    $item['san_pham_id'],
    $item['so_luong'],
    'increase',
    $item['gia_nhap']
);

TonKhoChiNhanh::syncWithProductTable($item['san_pham_id']);
```

#### 3. Thêm validation cho `chi_nhanh_id`

```php
$request->validate([
    'items' => 'required|array|min:1',
    'items.*.san_pham_id' => 'required|exists:spa_san_pham,id',
    'items.*.so_luong' => 'required|integer|min:1',
    'items.*.gia_nhap' => 'required|numeric|min:0',
    'items.*.nha_cung_cap_id' => 'nullable|exists:spa_nha_cung_cap,id',
    'chi_nhanh_id' => 'nullable|exists:spa_chi_nhanh,id', // Thêm dòng này
    // ...
]);
```

### File: `resources/js/pages/spa/InventoryList.tsx`

#### Cập nhật `handleFileUpload()` (line 329)

**Thêm chi_nhanh_id vào FormData:**
```typescript
const formData = new FormData();
formData.append('file', file as any);
formData.append('chi_nhanh_id', values.chi_nhanh_id || '1'); // Thêm dòng này
formData.append('nha_cung_cap', values.nha_cung_cap || '');
// ...
```

## Kết quả sau khi sửa

### Test thực nghiệm:
```bash
$ php test_bulk_import.php

=== Testing Bulk Import Fix ===

Records in spa_ton_kho_chi_nhanh BEFORE: 4
Test product: Kem dưỡng da cao cấp (ID: 1)
Stock BEFORE: 100 units

Simulating bulk import: +50 units at 100,000 VND...
✓ Import successful!

Stock AFTER: 150 units
Records in spa_ton_kho_chi_nhanh AFTER: 4

=== VERIFICATION ===
Expected increase: 50 units
Actual increase: 50 units
✓ TEST PASSED! Stock was updated correctly in spa_ton_kho_chi_nhanh.
```

### Luồng hoạt động sau khi sửa:
1. User nhấn "Nhập kho hàng loạt"
2. Điền form và submit
3. Backend nhận request:
   - Cập nhật `spa_ton_kho_chi_nhanh` (tồn kho chi nhánh) ✅
   - Tự động tính giá vốn bình quân AVCO ✅
   - Đồng bộ `spa_san_pham.ton_kho` (tổng tồn) ✅
4. Frontend tự động gọi `fetchInventory()`
5. Backend trả về dữ liệu từ `spa_ton_kho_chi_nhanh` ✅
6. Danh sách kho hiển thị dữ liệu mới ngay lập tức ✅

## Các thay đổi

### Backend (3 files)
1. ✅ `app/Http/Controllers/Admin/Spa/NhapKhoController.php`
   - Method `bulkImport()`: Dùng `TonKhoChiNhanh::updateStock()`
   - Method `importCsv()`: Dùng `TonKhoChiNhanh::updateStock()`
   - Validation: Thêm `chi_nhanh_id`

### Frontend (1 file)
1. ✅ `resources/js/pages/spa/InventoryList.tsx`
   - Method `handleFileUpload()`: Thêm `chi_nhanh_id` vào FormData

## Lưu ý kỹ thuật

### Model `TonKhoChiNhanh` cung cấp 2 methods quan trọng:

1. **`updateStock()`**: Cập nhật tồn kho chi nhánh
   - Tự động tính giá vốn bình quân (AVCO)
   - Hỗ trợ 2 action: `increase` (nhập) / `decrease` (xuất)
   - Tạo record mới nếu chưa tồn tại

2. **`syncWithProductTable()`**: Đồng bộ tổng tồn kho
   - Tính tổng `so_luong_ton` từ tất cả chi nhánh
   - Cập nhật vào `spa_san_pham.ton_kho`

### Quy trình đúng cho mọi thao tác kho:
```php
// 1. Cập nhật tồn kho chi nhánh
TonKhoChiNhanh::updateStock($chiNhanhId, $sanPhamId, $soLuong, $action, $giaNhap);

// 2. Đồng bộ tổng tồn kho
TonKhoChiNhanh::syncWithProductTable($sanPhamId);
```

## Testing

### Kiểm tra thủ công:
1. Truy cập: http://localhost:99/aio/spa/inventory?p=kho
2. Nhấn "Nhập kho hàng loạt"
3. Chọn sản phẩm và số lượng
4. Submit form
5. **KẾT QUẢ**: Danh sách kho cập nhật ngay lập tức ✅

### Kiểm tra database:
```sql
-- Xem tồn kho chi nhánh (đây là nguồn dữ liệu hiển thị)
SELECT * FROM spa_ton_kho_chi_nhanh WHERE chi_nhanh_id = 1;

-- Xem tổng tồn kho sản phẩm (tự động đồng bộ)
SELECT id, ma_san_pham, ten_san_pham, ton_kho FROM spa_san_pham;
```

## Tóm tắt
- ❌ **LỖI CŨ**: Cập nhật `spa_san_pham.ton_kho` nhưng đọc từ `spa_ton_kho_chi_nhanh`
- ✅ **ĐÃ SỬA**: Cập nhật `spa_ton_kho_chi_nhanh` + tự động sync `spa_san_pham.ton_kho`
- ✅ **KẾT QUẢ**: Danh sách kho hiển thị dữ liệu mới ngay sau khi nhập hàng loạt

---
**Ngày sửa**: 18/11/2025  
**Tester**: test_bulk_import.php ✅ PASSED
