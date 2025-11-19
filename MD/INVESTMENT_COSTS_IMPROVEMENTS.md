# Cải tiến tính năng Chi phí Đầu tư - 13/11/2025

## Vấn đề đã sửa

### 1. ❌ Form thêm chi phí không hiện danh sách tòa nhà

**Nguyên nhân:**
- Method `selectData()` trong Controller trả về data sai format
- Frontend expect: `{ suppliers: [], loai_chi: [], apartments: [] }`
- Backend trả về: Chỉ có data của `aitilen_dau_tu` table

**Giải pháp:**
✅ Sửa `AitilenDauTuController::selectData()` để query đúng các bảng:
```php
$suppliers = DB::table('suppliers')->select('id', 'name')->get();
$loaiChi = DB::table('loai_chi')->select('id', 'name')->get();
$apartments = DB::table('apartment')->select('id', 'name')->get();

return response()->json([
    'status_code' => 200,
    'data' => [
        'suppliers' => $suppliers,
        'loai_chi' => $loaiChi,
        'apartments' => $apartments,
    ],
]);
```

### 2. 🔧 Chuẩn hóa Response Structure

**Vấn đề:**
- Response structure không nhất quán giữa các methods
- Frontend expect `status_code` nhưng một số method trả về `success`

**Giải pháp:**
✅ Chuẩn hóa tất cả response thành format:
```json
{
  "status_code": 200,
  "message": "Success message",
  "data": {...}
}
```

**Các method đã cập nhật:**
- ✅ `list()` - Thêm pagination support với `searchData` wrapper
- ✅ `add()` - Cập nhật response structure
- ✅ `update()` - Cập nhật response structure
- ✅ `delete()` - Support batch delete với `ids` array
- ✅ `updateSortOrder()` - Cập nhật response structure
- ✅ `selectData()` - Hoàn toàn mới, query từ các bảng master data

## Tính năng mới: Thêm nhanh nhiều chi phí

### 3. ✨ Bulk Add Feature

**Yêu cầu:**
- Thêm nhiều chi phí cùng lúc trong 1 form
- Modal rộng 1000px
- Thiết kế dạng bảng
- Các trường: name*, price*, apartment_id, loai_chi_id

**Triển khai:**

#### Backend
✅ **Method mới:** `AitilenDauTuController::addBulk()`
```php
public function addBulk(Request $request)
{
    // Validate array of items
    $validated = $request->validate([
        'items' => 'required|array|min:1',
        'items.*.name' => 'required|string',
        'items.*.price' => 'required|numeric',
        'items.*.apartment_id' => 'nullable|integer',
        'items.*.loai_chi_id' => 'nullable|integer',
    ]);
    
    // Transaction-based bulk insert
    DB::beginTransaction();
    foreach ($items as $item) {
        AitilenDauTu::create([...]);
    }
    DB::commit();
}
```

✅ **Route mới:**
```php
Route::post('dau-tu/add-bulk', [AitilenDauTuController::class, 'addBulk'])
```

✅ **API constant:**
```typescript
dauTuAddBulk: `${BASE_API_URL}aitilen/dau-tu/add-bulk`
```

#### Frontend
✅ **UI Component:**
- Modal 1000px width
- Table-based layout với Form.List
- Các cột:
  - `#` - STT
  - `* Tên chi phí` - Input (required)
  - `* Giá trị` - InputNumber (required, formatted)
  - `Tòa nhà` - Select dropdown
  - `Loại chi` - Select dropdown
  - `Xóa` - Button với Popconfirm

✅ **Features:**
- ➕ Button "Thêm dòng" - Thêm row mới vào table
- ➖ Button "Xóa" trên mỗi row (disabled nếu chỉ có 1 row)
- 💾 Button "Lưu tất cả" - Submit toàn bộ items
- ✅ Validation inline cho từng field
- 🔄 Transaction-based save (all or nothing)

✅ **Button trigger:**
```tsx
<Button type="default" icon={<AppstoreAddOutlined />} onClick={handleBulkAdd}>
    Thêm nhanh
</Button>
```

## Chi tiết thay đổi

### Files đã sửa

#### 1. Backend Controller
**File:** `app/Http/Controllers/Aitilen/AitilenDauTuController.php`

**Methods đã cập nhật:**
- `list()` - Thêm searchData wrapper, pagination
- `add()` - Response structure, thêm sort_order và is_active validation
- `update()` - Response structure, thêm sort_order và is_active validation
- `delete()` - Batch delete support
- `updateSortOrder()` - Response structure
- `selectData()` - Hoàn toàn mới

**Method mới:**
- `addBulk()` - Bulk insert với transaction

**Improvements:**
- Sử dụng `DB::table()` cho master data queries (lighter)
- Transaction support cho bulk operations
- Error handling với rollback
- Validation messages rõ ràng

#### 2. Routes
**File:** `routes/aio_route.php`

**Route mới:**
```php
Route::post('dau-tu/add-bulk', [AitilenDauTuController::class, 'addBulk'])
    ->name('aitilen.dauTu.addBulk');
```

#### 3. API Constants
**File:** `resources/js/common/api.tsx`

**Constant mới:**
```typescript
dauTuAddBulk: `${BASE_API_URL}aitilen/dau-tu/add-bulk`
```

#### 4. Frontend Component
**File:** `resources/js/pages/aitilen/AitilenDauTu.tsx`

**Imports mới:**
- `Popconfirm` - Confirm dialog cho delete row
- Icons: `PlusCircleOutlined`, `MinusCircleOutlined`, `AppstoreAddOutlined`

**State mới:**
- `isBulkModalVisible` - Control bulk modal visibility
- `bulkForm` - Form instance cho bulk add

**Methods mới:**
- `handleBulkAdd()` - Mở bulk modal
- `handleBulkSubmit()` - Submit bulk data

**UI Updates:**
- Extra buttons trong Card header (Thêm nhanh + Thêm chi phí)
- Bulk Add Modal với Table layout
- Form.List để quản lý dynamic rows

## API Endpoints

### Endpoint mới: Bulk Add
**URL:** `POST /aio/api/aitilen/dau-tu/add-bulk`

**Request:**
```json
{
  "items": [
    {
      "name": "Chi phí sơn tường tầng 1",
      "price": 5000000,
      "apartment_id": 1,
      "loai_chi_id": 3
    },
    {
      "name": "Chi phí điện nước tháng 11",
      "price": 3000000,
      "apartment_id": 1,
      "loai_chi_id": 2
    }
  ]
}
```

**Response Success:**
```json
{
  "status_code": 200,
  "message": "Thêm nhanh 2 chi phí thành công",
  "data": {
    "created": [...],
    "total": 2
  }
}
```

**Response Error:**
```json
{
  "status_code": 400,
  "message": "Có lỗi xảy ra",
  "errors": [
    "Dòng 1: Validation error message",
    "Dòng 3: Another error"
  ]
}
```

### Endpoint đã cập nhật: Select Data
**URL:** `POST /aio/api/aitilen/dau-tu/select-data`

**Response:**
```json
{
  "status_code": 200,
  "message": "Success",
  "data": {
    "suppliers": [
      {"id": 1, "name": "Nhà cung cấp A"},
      {"id": 2, "name": "Nhà cung cấp B"}
    ],
    "loai_chi": [
      {"id": 1, "name": "Điện nước"},
      {"id": 2, "name": "Sửa chữa"}
    ],
    "apartments": [
      {"id": 1, "name": "Tòa A"},
      {"id": 2, "name": "Tòa B"}
    ]
  }
}
```

## Testing Checklist

### Unit Tests
- [ ] Test `addBulk()` với valid data
- [ ] Test `addBulk()` với invalid data (missing required fields)
- [ ] Test `addBulk()` transaction rollback on error
- [ ] Test `selectData()` returns correct master data

### Integration Tests
- [x] Test form load với danh sách tòa nhà
- [ ] Test bulk add với 1 item
- [ ] Test bulk add với nhiều items (5-10)
- [ ] Test bulk add với dữ liệu không hợp lệ
- [ ] Test delete row trong bulk modal
- [ ] Test add row trong bulk modal
- [ ] Test validation inline

### Manual Tests
- [x] Mở form thêm chi phí → Kiểm tra dropdown tòa nhà có data
- [ ] Click "Thêm nhanh" → Modal mở rộng 1000px
- [ ] Thêm nhiều dòng trong bulk modal
- [ ] Xóa dòng trong bulk modal
- [ ] Submit bulk form với data hợp lệ
- [ ] Submit bulk form với data thiếu (kiểm tra validation)
- [ ] Kiểm tra data đã lưu trong database

## Notes

### Database Tables
Các bảng được query trong `selectData()`:
- `suppliers` - Nhà cung cấp
- `loai_chi` - Loại chi phí
- `apartment` - Tòa nhà

**Lưu ý:** Nếu table `suppliers` chưa tồn tại, có thể bỏ qua hoặc tạo migration.

### Error Handling
- Backend sử dụng Transaction để ensure data consistency
- Nếu 1 item lỗi → Rollback tất cả
- Frontend hiển thị error message chi tiết từ backend

### Future Improvements
1. **Drag & Drop Sort** - Sắp xếp rows bằng kéo thả
2. **Import Excel** - Upload file Excel để bulk add
3. **Template** - Lưu template cho bulk add thường dùng
4. **Duplicate Detection** - Cảnh báo nếu tên chi phí đã tồn tại
5. **Auto-fill** - Copy dữ liệu từ row trước khi thêm row mới

## Migration Note

Nếu cần migrate data cũ hoặc seed test data:
```php
// Seed sample data
DB::table('aitilen_dau_tu')->insert([
    ['name' => 'Chi phí 1', 'price' => 1000000, 'apartment_id' => 1],
    ['name' => 'Chi phí 2', 'price' => 2000000, 'loai_chi_id' => 2],
]);
```

---

**Ngày hoàn thành:** 13/11/2025  
**Developer:** GitHub Copilot  
**Status:** ✅ Hoàn thành - Ready for testing
