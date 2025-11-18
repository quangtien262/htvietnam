# Hệ thống Gói Dịch Vụ (Service Package) - Hướng dẫn

## 📦 Tổng quan

Hệ thống gói dịch vụ cho phép khách hàng mua trước một gói dịch vụ với số lượt sử dụng nhất định. Mỗi lần sử dụng, khách có thể chọn bất kỳ dịch vụ nào trong danh sách dịch vụ của gói.

### Ví dụ thực tế:

**Gói "Chăm sóc da Premium"**
- Giá: 5,000,000đ
- Số lượt sử dụng: 5 lần
- Dịch vụ trong gói:
  - Massage mặt
  - Đắp mặt nạ
  - Chăm sóc da chuyên sâu

➡️ Khách mua gói này sẽ có **5 lượt** để sử dụng. Mỗi lần đến, khách có thể chọn 1 trong 3 dịch vụ trên mà **không tốn thêm tiền**.

---

## 🗄️ Cấu trúc Database

### Bảng: `spa_customer_packages`

Lưu thông tin gói dịch vụ mà khách hàng đã mua.

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | bigint | ID gói của khách |
| `khach_hang_id` | bigint | ID khách hàng |
| `goi_dich_vu_id` | bigint | ID gói dịch vụ gốc |
| `ten_goi` | varchar | Tên gói (snapshot) |
| `gia_mua` | decimal | Giá mua gói |
| `so_luong_tong` | int | Tổng số lượt (VD: 5) |
| `so_luong_da_dung` | int | Số lượt đã dùng |
| `dich_vu_ids` | json | Danh sách ID dịch vụ `[1,2,3]` |
| `ngay_mua` | date | Ngày mua gói |
| `ngay_het_han` | date | Ngày hết hạn (nullable) |
| `trang_thai` | enum | `dang_dung`, `da_het`, `het_han` |
| `hoa_don_id` | bigint | ID hóa đơn khi mua |
| `ghi_chu` | text | Ghi chú |

### Cột mới trong `spa_hoa_don_chi_tiet`:

- `su_dung_goi`: ID gói nếu dịch vụ được sử dụng từ gói

---

## 🔌 API Endpoints

### 1. Lấy danh sách gói còn lượt của khách

**POST** `/aio/api/admin/spa/customer-packages/list`

```json
{
  "khach_hang_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ten_goi": "Gói ABC",
      "so_luong_tong": 5,
      "so_luong_da_dung": 2,
      "so_luong_con_lai": 3,
      "ngay_het_han": "2026-01-01",
      "dich_vu_list": [
        {"id": 1, "ten_dich_vu": "Dịch vụ A", "gia_ban": 200000},
        {"id": 2, "ten_dich_vu": "Dịch vụ B", "gia_ban": 300000}
      ]
    }
  ]
}
```

### 2. Sử dụng gói (giảm lượt)

**POST** `/aio/api/admin/spa/customer-packages/use`

```json
{
  "customer_package_id": 1,
  "dich_vu_id": 2,
  "hoa_don_id": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sử dụng gói dịch vụ thành công",
  "data": {
    "package_id": 1,
    "so_luong_con_lai": 2
  }
}
```

### 3. Thêm gói khi khách mua

**POST** `/aio/api/admin/spa/customer-packages/purchase`

```json
{
  "khach_hang_id": 1,
  "goi_dich_vu_id": 5,
  "hoa_don_id": 123
}
```

### 4. Lịch sử sử dụng gói

**POST** `/aio/api/admin/spa/customer-packages/history`

```json
{
  "khach_hang_id": 1
}
```

---

## 💻 Tích hợp vào POS

### Bước 1: Khi chọn khách hàng

```typescript
// Gọi API lấy gói của khách
const packagesResponse = await axios.post('/aio/api/admin/spa/customer-packages/list', {
  khach_hang_id: selectedCustomer.id
});

const packages = packagesResponse.data.data;
// Hiển thị badge số gói còn lượt
```

### Bước 2: Khi thêm dịch vụ vào giỏ

```typescript
// Check xem dịch vụ có trong gói nào không
const availablePackage = packages.find(pkg => 
  pkg.dich_vu_list.some(dv => dv.id === dichVuId) &&
  pkg.so_luong_con_lai > 0
);

if (availablePackage) {
  // Cho phép chọn "Dùng từ gói"
  // Đánh dấu item.su_dung_goi = availablePackage.id
  // Giá = 0 (không tính tiền)
}
```

### Bước 3: Khi thanh toán

```typescript
// Với mỗi item có su_dung_goi
for (const item of cart) {
  if (item.su_dung_goi) {
    // Gọi API giảm lượt
    await axios.post('/aio/api/admin/spa/customer-packages/use', {
      customer_package_id: item.su_dung_goi,
      dich_vu_id: item.id,
      hoa_don_id: hoaDonId
    });
  }
}
```

### Bước 4: Khi mua gói mới

```typescript
// Khi khách mua service package
await axios.post('/aio/api/admin/spa/customer-packages/purchase', {
  khach_hang_id: selectedCustomer.id,
  goi_dich_vu_id: packageId,
  hoa_don_id: hoaDonId
});
```

---

## 🎯 Luồng xử lý

### Luồng 1: Khách mua gói

1. Khách chọn "Gói dịch vụ" trong POS
2. Thêm gói vào giỏ hàng (type: 'package')
3. Thanh toán → Tạo hóa đơn
4. **Gọi API `purchase`** → Tạo record trong `spa_customer_packages`
5. Khách nhận gói với `so_luong_tong` lượt sử dụng

### Luồng 2: Khách sử dụng gói

1. Chọn khách hàng trong POS
2. **Hiển thị danh sách gói còn lượt** (badge/tag)
3. Khi thêm dịch vụ:
   - Nếu dịch vụ có trong gói → Hiện option "Dùng từ gói"
   - Nếu chọn dùng gói → Giá = 0, đánh dấu `su_dung_goi`
4. Thanh toán → **Gọi API `use`** → Giảm lượt, cập nhật trạng thái

### Luồng 3: Quản lý gói

- **Xem lịch sử**: API `history`
- **Kiểm tra còn lượt**: Trường `so_luong_con_lai`
- **Trạng thái**:
  - `dang_dung`: Còn lượt, chưa hết hạn
  - `da_het`: Đã dùng hết lượt
  - `het_han`: Quá ngày hết hạn

---

## ✅ Validation Rules

### Khi sử dụng gói:

1. ✅ Gói phải tồn tại
2. ✅ `so_luong_da_dung < so_luong_tong`
3. ✅ Dịch vụ phải nằm trong `dich_vu_ids`
4. ✅ Chưa quá `ngay_het_han`
5. ✅ Trạng thái = `dang_dung`

### Khi mua gói:

1. ✅ Gói dịch vụ gốc phải tồn tại
2. ✅ Khách hàng phải tồn tại
3. ✅ Tự động tính `ngay_het_han` nếu có `thoi_han_su_dung`

---

## 📊 Báo cáo

### Thống kê cần có:

- **Tổng gói đã bán**: Đếm records trong `spa_customer_packages`
- **Doanh thu từ gói**: SUM(`gia_mua`)
- **Tỷ lệ sử dụng**: `so_luong_da_dung / so_luong_tong`
- **Gói sắp hết hạn**: WHERE `ngay_het_han` BETWEEN now AND +7days
- **Top gói phổ biến**: GROUP BY `goi_dich_vu_id`

---

## 🔧 Cài đặt

### Migration đã tạo:

```bash
php artisan migrate
```

Đã tạo:
- ✅ Bảng `spa_customer_packages`
- ✅ Cột `su_dung_goi` trong `spa_hoa_don_chi_tiet`

### Routes đã thêm:

- `/customer-packages/list` - Lấy gói của khách
- `/customer-packages/use` - Sử dụng gói
- `/customer-packages/purchase` - Mua gói mới
- `/customer-packages/history` - Lịch sử

---

## 🎨 UI/UX Suggestions

### Trong POS:

1. **Badge gói còn lượt**:
   ```
   👤 Nguyễn Văn A
   🎁 3 gói đang dùng
   ```

2. **Khi chọn dịch vụ**:
   ```
   Dịch vụ A - 200,000đ
   ✅ Dùng từ "Gói ABC" (còn 3 lượt)
   ```

3. **Trong giỏ hàng**:
   ```
   ✓ Dịch vụ A (Gói ABC)  |  0đ
   ```

4. **Modal chi tiết gói**:
   ```
   Gói: Chăm sóc da Premium
   Còn lại: 3/5 lượt
   Hạn sử dụng: 31/12/2025
   
   Dịch vụ trong gói:
   - Massage mặt
   - Đắp mặt nạ
   - Chăm sóc da chuyên sâu
   ```

---

## 🚀 Roadmap

### Phase 1 (Hoàn thành):
- ✅ Database structure
- ✅ API endpoints
- ✅ Backend validation

### Phase 2 (Cần làm):
- ⏳ Frontend POS integration
- ⏳ Package selection UI
- ⏳ Customer package list display

### Phase 3 (Nâng cao):
- ⏳ Package transfer (chuyển gói cho người khác)
- ⏳ Package expiry notifications
- ⏳ Package analytics dashboard

---

## 📞 Support

**Tạo bởi**: AI Assistant  
**Ngày**: 18/11/2025  
**Version**: 1.0
