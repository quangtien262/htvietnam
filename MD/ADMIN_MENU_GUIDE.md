# Quản lý Menu Admin - Hướng dẫn sử dụng

## Tổng quan
Module quản lý menu admin với đầy đủ tính năng CRUD và khả năng kéo thả để sắp xếp thứ tự menu.

## Tính năng

### 1. Danh sách Menu
- Hiển thị tất cả menu với các thông tin:
  - STT (Thứ tự sắp xếp)
  - Tên hiển thị
  - Tên bảng (table name)
  - Icon
  - Link
  - Trạng thái (Hoạt động/Tạm dừng)
- Tìm kiếm theo tên, link
- Lọc theo trạng thái
- Phân trang

### 2. Thêm Menu Mới
Các trường thông tin:
- **Tên hiển thị** (*): Tên menu hiển thị trên giao diện
- **Tên bảng**: Tên bảng database (nếu có)
- **Icon**: Icon/emoji hiển thị
- **Link**: Đường dẫn menu
- **Thứ tự sắp xếp**: Số thứ tự (để trống sẽ tự động thêm vào cuối)
- **Trạng thái**: Hoạt động/Tạm dừng

### 3. Chỉnh sửa Menu
- Click nút "Sửa" ở cột thao tác
- Cập nhật thông tin menu
- Lưu thay đổi

### 4. Xóa Menu
- Click nút "Xóa" ở cột thao tác
- Xác nhận xóa
- Menu sẽ được đưa vào thùng rác (soft delete)

### 5. Kéo thả sắp xếp thứ tự ⭐
- Di chuột vào icon ⋮⋮ ở cột đầu tiên
- Click và giữ chuột, kéo hàng lên/xuống vị trí mong muốn
- Thả chuột để hoàn tất
- Hệ thống tự động lưu thứ tự mới

## API Endpoints

### Backend Routes
```php
POST /aio/api/admin-menu/list              // Lấy danh sách menu
GET  /aio/api/admin-menu/{id}              // Lấy chi tiết menu
POST /aio/api/admin-menu/create            // Tạo menu mới
POST /aio/api/admin-menu/update/{id}       // Cập nhật menu
POST /aio/api/admin-menu/delete            // Xóa menu
POST /aio/api/admin-menu/update-sort-order // Cập nhật thứ tự
```

### Frontend API (api.tsx)
```typescript
API.adminMenuList                    // Danh sách
API.adminMenuDetail(id)              // Chi tiết
API.adminMenuCreate                  // Tạo mới
API.adminMenuUpdate(id)              // Cập nhật
API.adminMenuDelete                  // Xóa
API.adminMenuUpdateSortOrder         // Cập nhật thứ tự
```

## Cấu trúc Database

### Bảng: admin_menu
| Column | Type | Nullable | Mô tả |
|--------|------|----------|-------|
| id | bigint | NO | Primary key |
| name | varchar(255) | YES | Tên bảng database |
| display_name | varchar(255) | YES | Tên hiển thị |
| icon | varchar(255) | YES | Icon menu |
| link | varchar(255) | YES | Đường dẫn |
| is_active | varchar(255) | YES | Trạng thái (1: Hoạt động, 0: Tạm dừng) |
| sort_order | int | YES | Thứ tự sắp xếp |
| create_by | int | YES | ID người tạo |
| is_recycle_bin | int | YES | Thùng rác (0: Bình thường, 1: Đã xóa) |
| created_at | timestamp | YES | Ngày tạo |
| updated_at | timestamp | YES | Ngày cập nhật |

## Files đã tạo/cập nhật

### Backend
1. **app/Models/Admin/AdminMenu.php** - Model (đã tồn tại)
2. **app/Http/Controllers/Admin/AdminController.php** - Đã thêm 6 methods:
   - getAdminMenuList()
   - getAdminMenuDetail()
   - createAdminMenu()
   - updateAdminMenu()
   - deleteAdminMenus()
   - updateAdminMenuSortOrder()
3. **routes/admin_route.php** - Đã thêm 6 routes

### Frontend
1. **resources/js/pages/spa/AdminMenuList.tsx** - Component mới
2. **resources/js/common/api.tsx** - Đã thêm 6 API endpoints
3. **resources/js/common/route.tsx** - Đã thêm route spa_admin_menu
4. **resources/js/app.tsx** - Đã thêm import và route

### Dependencies
- @dnd-kit/core - Thư viện drag & drop
- @dnd-kit/sortable - Sortable list
- @dnd-kit/utilities - Utilities

## URL truy cập
```
http://localhost:99/aio/spa/admin-menu?p=spa
```

## Lưu ý kỹ thuật

### Drag & Drop
- Sử dụng thư viện @dnd-kit (modern, performant)
- Tự động cập nhật sort_order khi kéo thả
- Có loading state và error handling
- Rollback nếu update thất bại

### Validation
- Tên hiển thị: Bắt buộc, max 255 ký tự
- Các trường khác: Optional, max 255 ký tự
- Sort order: Tự động tăng nếu không nhập

### Soft Delete
- Menu không bị xóa vĩnh viễn
- Chỉ set is_recycle_bin = 1
- Có thể khôi phục sau này

## Best Practices

1. **Đặt tên menu rõ ràng**: Dễ tìm kiếm và quản lý
2. **Sử dụng icon phù hợp**: Giúp nhận diện nhanh
3. **Sắp xếp logic**: Nhóm các menu liên quan gần nhau
4. **Kiểm tra link**: Đảm bảo đường dẫn chính xác
5. **Tạm dừng thay vì xóa**: Nếu menu tạm thời không dùng

## Troubleshooting

### Lỗi kéo thả không hoạt động
- Kiểm tra đã cài đặt @dnd-kit packages
- Rebuild frontend: `npm run build`
- Clear cache trình duyệt

### Lỗi API
- Kiểm tra routes đã đăng ký đúng
- Verify middleware auth:admin_users
- Check database connection

### Lỗi hiển thị
- Kiểm tra component đã import đúng
- Verify route trong app.tsx
- Check API endpoints trong api.tsx

---
**Ngày tạo**: 19/11/2025  
**Version**: 1.0
