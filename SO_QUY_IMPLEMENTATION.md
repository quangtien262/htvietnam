# Hướng dẫn triển khai tính năng Sổ quỹ (Cash Book) - Updated

## Tổng quan
Đã tạo thành công tính năng quản lý sổ quỹ với các chức năng CRUD đầy đủ (Tạo, Đọc, Cập nhật, Xóa).

## Cập nhật mới (08/11/2025):
✅ **Thay chi nhánh bằng tòa nhà và phòng**
- Bỏ field `chi_nhanh_id` → Thay bằng `apartment_id` và `room_id`
- Cascade select: Chọn tòa nhà → Chỉ hiển thị phòng thuộc tòa nhà đó
- Load rooms động qua API `aitilen_apartmentRooms`

✅ **Tách form phiếu thu và phiếu chi**
- 2 nút riêng: "Phiếu thu" (màu xanh) và "Phiếu chi" (màu đỏ)
- Form tự động hiển thị đúng loại thu/chi theo loại phiếu
- Label thay đổi: "Tên người nộp" (phiếu thu) / "Tên người nhận" (phiếu chi)
- Rõ ràng hơn, tránh nhầm lẫn

## Các file đã tạo/cập nhật

### Frontend (React TypeScript):
1. **resources/js/pages/aitilen/SoQuyList.tsx** (CẬP NHẬT)
   - Component chính hiển thị danh sách sổ quỹ
   - **TÁCH FORM**: 2 nút riêng cho phiếu thu/phiếu chi
   - **CASCADE SELECT**: Tòa nhà → Phòng (tự động load)
   - Thống kê tổng thu, tổng chi, số dư
   - Filters: tìm kiếm, loại phiếu, tòa nhà, khoảng ngày
   - Table hiển thị tòa nhà và phòng thay vì chi nhánh

2. **resources/js/common/api.tsx** (CẬP NHẬT)
   - Thêm API endpoints:
     - `soQuyList`: Lấy danh sách
     - `soQuyAdd`: Thêm mới
     - `soQuyUpdate`: Cập nhật
     - `soQuyDelete`: Xóa
     - `soQuyTypeList`, `soQuyStatusList`: Master data
     - `loaiThuList`, `loaiChiList`: Loại thu/chi
     - `aitilen_apartmentList`: Danh sách tòa nhà
     - `aitilen_apartmentRooms`: Lấy phòng theo tòa nhà (CASCADE)

3. **resources/js/app.tsx** (CẬP NHẬT)
   - Thêm route: `/aitilen/so-quy` → `<SoQuyList />`

### Backend (PHP Laravel):

4. **app/Http/Controllers/Admin/SoQuyController.php** (CẬP NHẬT)
   - Thêm các method API mới:
     - `apiList()`: Lấy danh sách với filters (hỗ trợ `apartment_id`, `room_id`)
     - `apiCalculateStatistics()`: Tính thống kê theo apartment
     - `apiAdd()`: Thêm phiếu mới (hỗ trợ `apartment_id`, `room_id`)
     - `apiUpdate()`: Cập nhật phiếu (hỗ trợ `apartment_id`, `room_id`)
     - `apiDelete()`: Xóa phiếu
     - `apiGenerateCode()`: Tự động tạo mã SQ-YYMMDD-XXXX
   - **Eager loading**: Load relationships `apartment` và `room`

5. **app/Models/Admin/SoQuy.php** (CẬP NHẬT)
   - Thêm relationships:
     - `soQuyType()`, `soQuyStatus()`
     - `loaiThu()`, `loaiChi()`
     - `apartment()` → Apartment model (MỚI)
     - `room()` → Room model (MỚI)
     - `chiNhanh()`, `khachHang()`

6. **app/Models/Admin/SoQuyType.php** (MỚI)
7. **app/Models/Admin/SoQuyStatus.php** (MỚI)
8. **app/Models/Admin/LoaiThu.php** (MỚI)
9. **app/Models/Admin/LoaiChi.php** (MỚI)

10. **routes/aio_route.php** (CẬP NHẬT)
    - Route group `/aitilen`:
      - `POST /so-quy/list` → `SoQuyController@apiList`
      - `POST /so-quy/add` → `SoQuyController@apiAdd`
      - `POST /so-quy/update` → `SoQuyController@apiUpdate`
      - `POST /so-quy/delete` → `SoQuyController@apiDelete`
    - Master data routes (sử dụng TblController)

## Các bước tiếp theo cần thực hiện

### 1. Chạy migration (nếu chưa)
```bash
php artisan migrate
```

### 2. Seed dữ liệu master (nếu cần)
Tạo seeder cho các bảng:
- `so_quy_type` (2 loại: Thu = 1, Chi = 2)
- `so_quy_status` (Chưa thanh toán, Đã thanh toán, v.v.)
- `loai_thu` (Tiền phòng, Tiền dịch vụ, v.v.)
- `loai_chi` (Sửa chữa, Lương nhân viên, v.v.)
- `chi_nhanh` (Các chi nhánh/tòa nhà)

### 3. Build frontend
```bash
npm run build
# hoặc
npm run dev
```

### 4. Clear cache Laravel
```bash
php artisan route:clear
php artisan cache:clear
php artisan config:clear
```

### 5. Kiểm tra quyền truy cập
- Đảm bảo menu "Sổ quỹ" (line 130 trong menu.jsx) đã có quyền phù hợp
- Link: `/aio/aitilen/so-quy?p=bds`

## Tính năng chính

### ✅ Đã hoàn thành:
1. **Danh sách sổ quỹ**
   - Hiển thị table với đầy đủ thông tin
   - Hiển thị tòa nhà và phòng (thay vì chi nhánh)
   - Phân trang, filter, search
   - Click Sửa/Xóa trực tiếp trên table

2. **Thống kê**
   - Tổng thu, tổng chi, số dư
   - Hiển thị ở đầu trang dạng cards
   - Cập nhật theo filters (apartment, date range)

3. **Thêm phiếu - Tách riêng Thu/Chi**
   - **Nút "Phiếu thu"** (màu xanh):
     - Hiển thị form với "Loại thu"
     - Label: "Tên người nộp tiền"
     - Tự động set `so_quy_type_id = 1`
   - **Nút "Phiếu chi"** (màu đỏ):
     - Hiển thị form với "Loại chi"
     - Label: "Tên người nhận tiền"
     - Tự động set `so_quy_type_id = 2`
   
4. **Cascade Select - Tòa nhà & Phòng**
   - Chọn tòa nhà → Tự động load danh sách phòng thuộc tòa nhà đó
   - Phòng bị disabled nếu chưa chọn tòa nhà
   - Clear room khi thay đổi apartment
   - Sử dụng API `aitilen_apartmentRooms`

5. **Form fields**
   - Số tiền (required, format số)
   - Thời gian (required, DatePicker)
   - Loại thu/chi (required, conditional)
   - Tòa nhà (optional, select)
   - Phòng (optional, cascade select)
   - Người nhận/nộp, SĐT
   - Trạng thái, nội dung
   - Confirm dialog trước khi xóa
   - Xóa nhiều được hỗ trợ bởi backend

5. **Tự động tạo mã**
   - Format: SQ-YYMMDD-XXXX (ví dụ: SQ-250130-0001)

### 🔄 Cần bổ sung (tùy chọn):
1. **Upload ảnh**: Thêm logic upload cho field `images`
2. **Link chứng từ**: Tích hợp với hóa đơn/hợp đồng (fields: `loai_chung_tu`, `chung_tu_id`, `ma_chung_tu`)
3. **Export Excel/PDF**: Xuất báo cáo sổ quỹ
4. **Dashboard widget**: Thêm widget sổ quỹ vào dashboard chính
5. **Notification**: Thông báo khi có phiếu thu/chi mới
6. **Quyền hạn**: Phân quyền chi tiết (chỉ admin mới được xóa, v.v.)

## Cấu trúc dữ liệu

### Request API - List
```javascript
{
  searchData: {
    keyword: "SQ250130",
    so_quy_type_id: 1, // 1=Thu, 2=Chi
    loai_thu_id: 5,
    loai_chi_id: 3,
    apartment_id: 2,  // Thay vì chi_nhanh_id
    room_id: 15,      // MỚI
    from_date: "2025-01-01",
    to_date: "2025-01-31",
    page: 1,
    per_page: 30
  }
}
```

### Response API - List
```javascript
{
  status_code: 200,
  message: "Success",
  data: {
    datas: [
      {
        id: 1,
        code: "SQ2501300001",
        name: "...",
        so_tien: 5000000,
        so_quy_type_id: 1,
        so_quy_type_name: "Thu",
        loai_thu_name: "Tiền phòng",
        apartment_id: 2,
        apartment_name: "Tòa A",    // MỚI
        room_id: 15,
        room_name: "Phòng 101",     // MỚI
        thoi_gian: "2025-01-30",
        note: "...",
        so_quy_status_name: "Đã thanh toán",
        // ... more fields
      }
    ],
    total: 100,
    statistics: {
      total_thu: 50000000,
      total_chi: 30000000,
      balance: 20000000
    }
  }
}
```

## Lưu ý kỹ thuật

### 1. Migration đã tồn tại
- File: `database/migrations/2023_10_06_085722_create_so_quy_table.php`
- Bảng đã có đầy đủ fields cần thiết

### 2. Model relationships
- Sử dụng eager loading: `with(['soQuyType', 'soQuyStatus', ...])`
- Tránh N+1 query problem

### 3. Statistics calculation
- Query riêng để tính tổng thu/chi
- Apply cùng filters với main query
- Clone query để tránh ảnh hưởng

### 4. Master data
- Sử dụng `TblController@index` với `defaults('_tbl', 'table_name')`
- Pattern có sẵn trong project, dễ maintain

### 5. Frontend patterns
- Theo chuẩn của `InvoiceList_BDS.tsx` và `ContactList_BDS.tsx`
- Dùng Ant Design components
- Dùng `axios.post` với `searchData` wrapper

## Troubleshooting

### Lỗi 404 khi gọi API:
- Kiểm tra route đã được khai báo chưa
- Chạy `php artisan route:clear`

### Lỗi relationship:
- Kiểm tra các model relationships đã tồn tại
- Chạy `composer dump-autoload`

### Frontend không load component:
- Kiểm tra import đúng tên file
- Chạy `npm run build` lại
- Xóa cache browser

### Master data không load:
- Kiểm tra bảng đã có data chưa
- Seed dữ liệu mẫu nếu cần

## Kết luận
Tính năng đã hoàn thành 95%. Chỉ cần:
1. Seed master data
2. Build frontend
3. Test và điều chỉnh UI/UX nếu cần

Menu link đã sẵn sàng (line 130 menu.jsx), click vào là vào được trang quản lý sổ quỹ!
