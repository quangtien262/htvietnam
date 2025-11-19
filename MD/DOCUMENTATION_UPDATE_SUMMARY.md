# Cập nhật Tài liệu Hướng dẫn Sử dụng Spa

**Ngày cập nhật:** 30/01/2025  
**File:** `resources/js/pages/spa/Documentation.tsx`  
**Trạng thái:** ✅ Hoàn thành và đã build

## Tổng quan

Đã cập nhật tài liệu hướng dẫn sử dụng phần Spa với 2 module mới:

1. **Quản lý Kho** (Inventory Management)
2. **Quản lý Nhân sự** (Admin/HR Management)

## 1. Module Quản lý Kho (Inventory)

### Tính năng đã bổ sung vào tài liệu:

#### 📦 Nhập kho hàng loạt (Bulk Import)
- **Mô tả:** Nhập nhiều sản phẩm cùng lúc qua file Excel
- **Quy trình:** 4 bước từ download template → điền thông tin → upload → nhập kho
- **Thông tin nhập:** Mã SP, tên SP, số lượng, đơn giá, nhà cung cấp
- **Tính năng nổi bật:** 
  - Tự động tạo phiếu nhập kho
  - Cập nhật tồn kho tất cả chi nhánh
  - Tạo chi tiết phiếu với đầy đủ giá và thành tiền

#### 🔄 Chuyển kho giữa chi nhánh
- **Mô tả:** Chuyển sản phẩm từ chi nhánh này sang chi nhánh khác
- **Quy trình:** 6 bước từ chọn chi nhánh xuất/nhận → chọn SP → nhập SL → ghi chú → xác nhận
- **Kiểm soát:** Không cho phép chuyển vượt quá tồn kho hiện có
- **Tự động:** Trừ kho chi nhánh xuất, cộng kho chi nhánh nhận

#### 📊 Kiểm kê kho
- **Các loại kiểm kê:**
  - Định kỳ (hàng tháng/quý)
  - Đột xuất (khi phát hiện sai lệch)
  - Cuối kỳ (cuối năm tài chính)
- **Quy trình:** 6 bước từ tạo phiếu → chọn SP → nhập SL thực tế → tính chênh lệch → ghi chú → xác nhận
- **Cảnh báo:** Sau xác nhận, tồn kho được điều chỉnh theo số thực tế

#### ↩️ Trả hàng nhập
- **Tính năng mới:**
  - Tự động lấy chi nhánh từ phiếu nhập gốc
  - Hiển thị đầy đủ thông tin giá (đơn giá, thành tiền)
  - Tự động tính tổng tiền trả hàng
- **Quy trình:** 6 bước từ chọn NCC → chọn phiếu nhập → chọn SP → nhập SL trả → lý do → xác nhận
- **Kiểm soát:** Số lượng trả không vượt quá đã nhập, giá lấy từ đơn giá nhập ban đầu

#### 📋 Lịch sử nhập/xuất sản phẩm
- **Các loại giao dịch:**
  - Nhập kho (từ NCC, chuyển kho đến)
  - Xuất kho (bán hàng, chuyển kho đi, trả hàng)
  - Kiểm kê (điều chỉnh tồn)
  - Hủy/Hỏng (sản phẩm hư, hết hạn)
- **Thông tin hiển thị:**
  - Mã phiếu (click xem chi tiết)
  - Loại giao dịch
  - Chi nhánh, nhà cung cấp, người thực hiện
  - Ngày thực hiện
  - Số lượng, đơn giá, thành tiền
- **Lợi ích:** Truy xuất nguồn gốc, kiểm tra giá nhập, phân tích xu hướng tiêu thụ

#### 📈 Tồn kho tổng hợp
- **Xem theo:**
  - Chi nhánh (chi tiết từng CN)
  - Tổng hợp (tất cả CN)
  - Giá trị tồn kho (SL × Giá vốn)
  - Cảnh báo (dưới mức tối thiểu)
- **Tự động:** Tính toán tồn kho từ tất cả chi nhánh

#### 🗑️ Hủy/Hỏng hàng
- **Quy trình:** 7 bước từ chọn CN → chọn SP → nhập SL hủy → chọn lý do → ghi chú → xác nhận
- **Lý do:** Hết hạn, Hư hỏng, Mất mát, Khác
- **Báo cáo:** Theo dõi tỷ lệ hủy hàng để đánh giá hiệu quả quản lý

#### 🎥 Video hướng dẫn
- Nhập kho hàng loạt bằng Excel (5:20)
- Cách chuyển kho giữa chi nhánh (4:15)
- Hướng dẫn kiểm kê kho định kỳ (8:30)
- Quy trình trả hàng nhập cho nhà cung cấp (6:45)

---

## 2. Module Quản lý Nhân sự (Admin Management)

### Tính năng đã bổ sung vào tài liệu:

#### 👤 Hồ sơ nhân viên
- **Thông tin cá nhân:**
  - Mã NV (tự động/tùy chỉnh)
  - Họ tên, username, password
  - Ngày sinh, giới tính
  - SĐT, Email
  - CMND/CCCD (số, ngày cấp, nơi cấp)
  
- **Thông tin công việc:**
  - Chi nhánh làm việc
  - Chức vụ (NV, Trưởng phòng, Giám đốc...)
  - Ngày vào làm
  - Trạng thái (Đang làm, Tạm nghỉ, Đã nghỉ)

#### 💰 Cấu hình lương & hoa hồng
- **Lương cơ bản:**
  - Mức lương (VNĐ/tháng)
  - Loại lương: Theo giờ/ngày/tháng

- **Lương làm thêm giờ:**
  - Thứ 2-6: Hệ số (VD: 1.5x)
  - Thứ 7: Hệ số (VD: 2.0x)
  - Chủ nhật: Hệ số (VD: 3.0x)

- **Hoa hồng dịch vụ:**
  - % hoặc số tiền cố định theo dịch vụ
  - Thiết lập theo nhóm DV hoặc từng DV
  - Hoa hồng bậc thang theo doanh thu
  - **Ví dụ:** Massage 100k → HH 15% = 15k, hoặc cố định 20k/lần

#### 🎁 Thưởng & Phụ cấp
- **Thưởng (thuong_setting):**
  - Thưởng KPI
  - Thưởng lễ tết
  - Thưởng hoàn thành dự án đặc biệt
  - Lưu dạng JSON để linh hoạt

- **Phụ cấp (phu_cap_setting):**
  - Xăng xe
  - Điện thoại
  - Ăn trưa
  - Trách nhiệm

- **Giảm trừ (giam_tru_setting):**
  - BHXH (10.5%)
  - BHYT (4.5%)
  - Thuế TNCN (theo bậc)
  - Khấu trừ khác (đi muộn, vắng mặt...)

#### 📊 Báo cáo lương & công
- **Bảng chấm công:**
  - Công theo tháng từng NV
  - Số ngày làm việc, nghỉ phép, nghỉ không lương
  - Giờ làm thêm (Thứ 7, CN)
  - Xuất Excel tính lương

- **Bảng lương chi tiết:**
  - Lương cơ bản
  - Hoa hồng dịch vụ
  - Thưởng & Phụ cấp
  - Giảm trừ (BHXH, BHYT, Thuế)
  - **Thực lãnh** = Tổng cộng - Giảm trừ
  - Gửi Email hoặc in hàng loạt

#### 🔍 Tìm kiếm & Lọc nhân viên
- **Tìm kiếm nhanh:**
  - Theo tên, email, username
  - Theo mã NV
  - Theo SĐT

- **Lọc nâng cao:**
  - Theo chi nhánh
  - Theo chức vụ
  - Theo trạng thái
  - Theo ngày vào làm (từ... đến...)
  
- **API mới:** Hỗ trợ tìm kiếm đa điều kiện, phân trang, sắp xếp linh hoạt

#### 🎥 Video hướng dẫn
- Thêm hồ sơ nhân viên mới (6:30)
- Cấu hình lương & hoa hồng (9:15)
- Chấm công và tính lương hàng tháng (12:20)

---

## 3. FAQ - Câu hỏi thường gặp (Mới)

Đã thêm 6 câu hỏi mới liên quan đến module Kho:

### ❓ Nhập kho hàng loạt bị lỗi, làm sao khắc phục?
- **Kiểm tra:**
  - File sai định dạng (.xlsx/.xls, không phải .csv)
  - Mã sản phẩm không tồn tại
  - Số lượng/giá sai (phải số dương, không trống)
  - Nhà cung cấp không hợp lệ
- **Mẹo:** Download file mẫu từ hệ thống

### ❓ Tại sao không thể chuyển kho cho sản phẩm?
- **Nguyên nhân:**
  - CN xuất không đủ tồn kho
  - SL chuyển vượt quá SL hiện có
  - SP bị khóa/ngừng kinh doanh
  - Chưa chọn CN nhận hoặc trùng CN xuất

### ❓ Lịch sử giao dịch không hiển thị đầy đủ thông tin?
- **Kiểm tra:**
  - Refresh trang
  - Phiếu nhập có đủ thông tin NCC, người nhập
  - Phiếu cũ chưa có giá cần cập nhật
- **Hiển thị:** Nhập kho, Xuất bán, Chuyển kho, Kiểm kê, Trả hàng, Hủy hàng

### ❓ Trả hàng nhập bị lỗi validation?
- **Trường bắt buộc:**
  - Chi nhánh: Tự động từ phiếu gốc
  - Lý do trả hàng: Bắt buộc
  - Chi tiết SP: Ít nhất 1 SP với SL > 0
  - Giá: Tự động từ phiếu gốc
- **Cảnh báo:** SL trả không vượt quá SL đã nhập

### ❓ Kiểm kê kho: Khi nào nên điều chỉnh tồn kho?
- **Chỉ điều chỉnh khi:**
  - Có chênh lệch thực tế vs hệ thống
  - Đã kiểm tra kỹ và xác nhận đúng
  - Có giải trình rõ nguyên nhân
- **Cảnh báo:** Sau xác nhận, tồn kho thay đổi ngay. Không hoàn tác!

---

## 4. Thay đổi kỹ thuật

### File đã sửa đổi:
- `resources/js/pages/spa/Documentation.tsx`

### Các section mới:
1. **inventory** - Quản lý Kho (icon: ShoppingCartOutlined)
2. **admin-management** - Quản lý Nhân sự (icon: TeamOutlined)

### Cấu trúc mỗi section:
- Alert giới thiệu module
- Collapse panels cho từng tính năng
- Steps/Timeline cho quy trình
- Alert boxes cho lưu ý/mẹo/cảnh báo
- Card chứa danh sách video hướng dẫn

### Vị trí trong menu:
- **Quản lý Kho:** Sau "Marketing", trước "Báo cáo & Phân tích"
- **Quản lý Nhân sự:** Thay thế section "Nhân viên" cũ (mở rộng nội dung)

---

## 5. Truy cập tài liệu

**URL:** `http://localhost:99/aio/spa/documentation/?p=spa`

**Route:** `ROUTE.spa_documentation` → `/aio/spa/documentation/`

**Menu:** `Spa → Hướng dẫn sử dụng`

---

## 6. Build Status

✅ **Build thành công**
- Vite v7.1.1
- Build time: 24.15s
- No errors
- Cảnh báo: Chunk size lớn (app-BNe0GriU.js: 3.8MB) - cân nhắc code-splitting trong tương lai

---

## 7. Các tính năng được document hóa

### Tính năng Kho (7 tính năng):
1. ✅ Nhập kho hàng loạt (Bulk Import)
2. ✅ Chuyển kho giữa chi nhánh
3. ✅ Kiểm kê kho (3 loại)
4. ✅ Trả hàng nhập
5. ✅ Lịch sử nhập/xuất sản phẩm
6. ✅ Tồn kho tổng hợp
7. ✅ Hủy/Hỏng hàng

### Tính năng Nhân sự (5 tính năng):
1. ✅ Hồ sơ nhân viên (thông tin cá nhân + công việc)
2. ✅ Cấu hình lương & hoa hồng (cơ bản + làm thêm + hoa hồng)
3. ✅ Thưởng & Phụ cấp (3 loại settings)
4. ✅ Báo cáo lương & công (chấm công + bảng lương)
5. ✅ Tìm kiếm & Lọc nhân viên (API mới)

---

## 8. Next Steps (Khuyến nghị)

### Ngắn hạn:
- [ ] Thêm screenshots minh họa cho từng tính năng
- [ ] Tạo video demo thực tế (hiện đang placeholder)
- [ ] Thêm ví dụ cụ thể với số liệu thật

### Dài hạn:
- [ ] Tối ưu chunk size (code-splitting)
- [ ] Thêm search functionality trong documentation
- [ ] Tạo printable PDF version
- [ ] Multi-language support (EN/VI)

---

**Hoàn thành bởi:** GitHub Copilot  
**Ngày:** 30/01/2025  
**Status:** ✅ Ready for production
