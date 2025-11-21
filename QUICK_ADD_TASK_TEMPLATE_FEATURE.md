# Hướng dẫn tính năng "Mẫu có sẵn" cho Thêm nhanh nhiệm vụ

## Tổng quan
Đã thêm tính năng "Mẫu có sẵn" vào modal "Thêm nhanh nhiệm vụ" tại trang chi tiết dự án.

## Các thành phần đã tạo

### 1. Database Migration
**File**: `database/migrations/2025_11_21_000001_create_project_setting_add_task_express_table.php`

Tạo bảng `project_setting_add_task_express` để lưu các mẫu tùy chỉnh:
- `id`: Primary key
- `name`: Tên nhóm task
- `tasks`: JSON array chứa các task con [{name: '', description: ''}]
- `sort_order`: Thứ tự sắp xếp
- `is_active`: Trạng thái (1: hoạt động, 0: không hoạt động)

### 2. Model
**File**: `app/Models/Admin/ProjectSettingAddTaskExpress.php`

Model Laravel với:
- `$casts` để tự động parse JSON
- `scopeActive()` để query chỉ các mẫu đang hoạt động

### 3. API Routes
**File**: `routes/project_route.php`

Thêm 3 route API mới:
```php
Route::get('/apartments', [TaskController::class, 'getApartments'])
Route::get('/rooms/{apartmentId}', [TaskController::class, 'getRooms'])
Route::get('/custom-templates', [TaskController::class, 'getCustomTemplates'])
```

### 4. Controller Methods
**File**: `app/Http/Controllers/Project/TaskController.php`

Thêm 3 phương thức:
- `getApartments()`: Lấy danh sách tất cả tòa nhà đang hoạt động
- `getRooms($apartmentId)`: Lấy danh sách phòng theo tòa nhà
- `getCustomTemplates()`: Lấy danh sách mẫu tùy chỉnh

### 5. Frontend Component
**File**: `resources/js/pages/project/ProjectDetail.tsx`

#### State mới:
- `templateModalVisible`: Hiển thị modal chọn mẫu
- `templateType`: Loại mẫu ('apartment' | 'room' | 'custom')
- `apartments`: Danh sách tòa nhà
- `rooms`: Danh sách phòng
- `customTemplates`: Danh sách mẫu tùy chỉnh
- `selectedApartment`: Tòa nhà đã chọn (cho trường hợp "Phòng trong nhà")
- `selectedTemplate`: Mẫu tùy chỉnh đã chọn

#### Hàm mới:
- `openTemplateModal()`: Mở modal chọn mẫu
- `closeTemplateModal()`: Đóng modal và reset state
- `handleTemplateTypeSelect()`: Xử lý khi chọn loại mẫu
- `handleApartmentSelect()`: Xử lý khi chọn tòa nhà (load danh sách phòng)
- `applyTemplate()`: Áp dụng mẫu đã chọn vào form

#### UI Component:
- Nút "Mẫu có sẵn" bên cạnh nút "Thêm dòng mới"
- Modal config với 3 tùy chọn:
  1. Tất cả tòa nhà
  2. Phòng trong nhà (chọn tòa nhà trước)
  3. Mẫu tự chọn

## Hướng dẫn sử dụng

### Bước 1: Chạy Migration
```bash
php artisan migrate
```

### Bước 2: Tạo mẫu tùy chỉnh
1. Truy cập trang quản lý mẫu (sẽ cần thêm vào menu)
2. Tạo mẫu mới với:
   - Tên nhóm task
   - Danh sách task dạng JSON:
   ```json
   [
     {"name":"Task 1","description":"Mô tả 1"},
     {"name":"Task 2","description":"Mô tả 2"}
   ]
   ```

### Bước 3: Sử dụng tính năng

#### A. Tại trang dự án:
1. Click "Thêm nhiệm vụ nhanh"
2. Click nút "Mẫu có sẵn"
3. Chọn loại mẫu:

**Tất cả tòa nhà**:
- Tự động tạo nhiệm vụ với tên là tên các tòa nhà
- Áp dụng ngay khi chọn

**Phòng trong nhà**:
- Bước 1: Chọn tòa nhà từ dropdown
- Bước 2: System tự load danh sách phòng
- Click "Áp dụng" để tạo nhiệm vụ với tên là tên các phòng

**Mẫu tự chọn**:
- Chọn mẫu từ dropdown
- Click "Áp dụng" để tạo nhiệm vụ theo mẫu

4. Kiểm tra và chỉnh sửa các nhiệm vụ đã tạo
5. Click "Tạo tất cả" để lưu

## Format JSON cho Mẫu tùy chỉnh

```json
[
  {
    "name": "Thiết kế giao diện",
    "description": "Thiết kế UI/UX cho module quản lý"
  },
  {
    "name": "Code backend",
    "description": "Xây dựng API và xử lý logic"
  },
  {
    "name": "Code frontend",
    "description": "Tích hợp giao diện với API"
  },
  {
    "name": "Testing",
    "description": "Kiểm thử tính năng"
  }
]
```

## Các tính năng đã implement

✅ Modal "Mẫu có sẵn" với 3 loại:
- Tất cả tòa nhà
- Phòng trong nhà
- Mẫu tự chọn

✅ API để lấy:
- Danh sách tòa nhà
- Danh sách phòng theo tòa nhà
- Danh sách mẫu tùy chỉnh

✅ Tự động fill dữ liệu vào form "Thêm nhanh nhiệm vụ"

✅ Kế thừa trạng thái, người thực hiện, ưu tiên từ dòng đầu tiên (nếu có checkbox "Áp dụng tất cả")

## Lưu ý

1. **Bảng apartment**: Cần có cột `is_delete` = 0 để lọc các tòa nhà đang hoạt động
2. **Bảng room**: Cần có cột `apartment_id` và `is_delete` = 0
3. **JSON format**: Mẫu tùy chỉnh cần đúng format JSON array of objects
4. **Trạng thái áp dụng tất cả**: Tính năng kế thừa từ checkbox "Áp dụng tất cả" đã có sẵn

## Các bước tiếp theo (nếu cần)

1. Thêm menu quản lý "Mẫu thêm nhanh nhiệm vụ" vào sidebar
2. Tạo giao diện quản lý mẫu thân thiện hơn (editor JSON)
3. Thêm tính năng import/export mẫu
4. Thêm preview trước khi áp dụng
5. Cho phép chỉnh sửa inline trong modal config

## Test checklist

- [ ] Migration chạy thành công
- [ ] API `/project/api/task-templates/apartments` trả về danh sách tòa nhà
- [ ] API `/project/api/task-templates/rooms/{id}` trả về danh sách phòng
- [ ] API `/project/api/task-templates/custom-templates` trả về danh sách mẫu
- [ ] Modal "Mẫu có sẵn" hiển thị đúng
- [ ] Chọn "Tất cả tòa nhà" tạo đúng số lượng nhiệm vụ
- [ ] Chọn "Phòng trong nhà" → chọn tòa nhà → tạo đúng số lượng nhiệm vụ
- [ ] Chọn "Mẫu tự chọn" → chọn mẫu → tạo đúng nhiệm vụ theo mẫu
- [ ] Áp dụng trạng thái/người thực hiện/ưu tiên từ checkbox "Áp dụng tất cả"

## Ngày tạo
21/11/2025
