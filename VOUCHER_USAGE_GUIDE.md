# Hướng Dẫn Sử Dụng Voucher

## 1. Tổng Quan

Voucher là mã giảm giá được tạo và quản lý tại **Quản lý Voucher** (`/aio/spa/vouchers/?p=spa`), có thể áp dụng cho hóa đơn tại màn hình POS.

### Đặc điểm Voucher:
- ✅ Tự động tạo mã nếu bỏ trống (format: `VOUCHER0001`, `VOUCHER0002`...)
- ✅ Hỗ trợ 2 loại giảm giá: **Phần trăm** hoặc **Số tiền cố định**
- ✅ Giới hạn số lượng sử dụng
- ✅ Đặt điều kiện đơn hàng tối thiểu
- ✅ Giới hạn giảm tối đa (cho voucher phần trăm)
- ✅ Ngày bắt đầu và kết thúc
- ✅ Trạng thái: Hoạt động / Tạm dừng

---

## 2. Quản Lý Voucher

### 2.1. Tạo Voucher Mới

**Truy cập:** http://localhost:99/aio/spa/vouchers/?p=spa

**Các trường thông tin:**

| Trường | Bắt buộc | Mô tả |
|--------|----------|-------|
| **Mã Voucher** | Không | Bỏ trống để tự động tạo theo format `VOUCHER0001` |
| **Tên Voucher** | Có | Tên hiển thị của voucher |
| **Loại giảm giá** | Có | `Phần trăm (%)` hoặc `Số tiền (VNĐ)` |
| **Giá trị giảm** | Có | % hoặc số tiền giảm |
| **Giảm tối đa** | Không | Áp dụng cho voucher phần trăm |
| **Đơn tối thiểu** | Không | Giá trị đơn hàng tối thiểu để áp dụng |
| **Số lượng** | Có | Số lượt voucher có thể sử dụng |
| **Ngày bắt đầu** | Có | Ngày bắt đầu hiệu lực |
| **Ngày kết thúc** | Có | Ngày hết hạn |
| **Áp dụng cho** | Không | Tất cả / Dịch vụ / Sản phẩm / Liệu trình |

**Ví dụ:**
- **Voucher GIAMGIA20**: Giảm 20%, tối đa 100,000đ, đơn tối thiểu 500,000đ
- **Voucher KHUYENMAI50K**: Giảm 50,000đ, đơn tối thiểu 200,000đ

### 2.2. Chỉnh Sửa Voucher
- Click nút **Sửa** (icon bút) trên voucher cần chỉnh sửa
- Cập nhật thông tin
- Click **Cập nhật**

### 2.3. Xóa Voucher
- Click nút **Xóa** (icon thùng rác)
- Xác nhận xóa
- **Lưu ý:** Không thể xóa voucher đã được sử dụng

### 2.4. Bật/Tắt Voucher
- Sử dụng switch **Trạng thái**
- `Hoạt động`: Voucher có thể sử dụng
- `Tạm dừng`: Voucher không thể sử dụng

---

## 3. Sử Dụng Voucher Tại POS

### 3.1. API Endpoints

#### **Kiểm tra voucher hợp lệ**
```
POST /aio/api/admin/spa/vouchers/verify
```

**Request Body:**
```json
{
  "ma_voucher": "VOUCHER0001",
  "gia_tri_don_hang": 500000
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Voucher hợp lệ",
  "data": {
    "id": 1,
    "ma_voucher": "VOUCHER0001",
    "ten_voucher": "Giảm giá 20%",
    "loai_giam_gia": "phan_tram",
    "gia_tri_giam": 20,
    "giam_toi_da": 100000,
    "don_toi_thieu": 200000,
    "so_tien_giam": 100000,
    "so_luong_con_lai": 5
  }
}
```

**Response Error:**
```json
{
  "success": false,
  "message": "Voucher đã hết hạn"
}
```

**Các lỗi có thể gặp:**
- `Mã voucher không tồn tại`
- `Voucher đã được sử dụng`
- `Voucher đã hết hạn`
- `Voucher đã hết lượt sử dụng`
- `Giá trị đơn hàng tối thiểu: XXX đ`

---

#### **Áp dụng voucher vào hóa đơn**
```
POST /aio/api/admin/spa/vouchers/apply
```

**Request Body:**
```json
{
  "ma_voucher": "VOUCHER0001",
  "khach_hang_id": 123,
  "hoa_don_id": 456,
  "so_tien_giam": 100000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Áp dụng voucher thành công",
  "data": {
    "voucher_id": 1,
    "so_tien_giam": 100000
  }
}
```

---

## 4. Cách Tích Hợp Vào POS (Frontend)

### 4.1. Thêm State cho Voucher

```typescript
const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
```

### 4.2. Hàm Verify Voucher

```typescript
const handleVerifyVoucher = async (maVoucher: string) => {
    try {
        const totalAmount = calculateTotal(); // Tổng tiền đơn hàng
        
        const response = await axios.post('/aio/api/admin/spa/vouchers/verify', {
            ma_voucher: maVoucher.toUpperCase(),
            gia_tri_don_hang: totalAmount
        });

        if (response.data.success) {
            const voucher = response.data.data;
            setAppliedVoucher(voucher);
            setVoucherDiscount(voucher.so_tien_giam);
            message.success(`Áp dụng voucher thành công! Giảm ${formatCurrency(voucher.so_tien_giam)}`);
        }
    } catch (error: any) {
        message.error(error.response?.data?.message || 'Voucher không hợp lệ');
        setAppliedVoucher(null);
        setVoucherDiscount(0);
    }
};
```

### 4.3. Tính Tổng Tiền Sau Voucher

```typescript
const calculateFinalTotal = () => {
    const subtotal = calculateTotal();
    const afterVoucher = subtotal - voucherDiscount;
    return Math.max(0, afterVoucher);
};
```

### 4.4. Áp Dụng Voucher Khi Thanh Toán

```typescript
const handlePayment = async () => {
    // ... create invoice code ...

    // Nếu có voucher, apply vào hóa đơn
    if (appliedVoucher && invoiceId) {
        await axios.post('/aio/api/admin/spa/vouchers/apply', {
            ma_voucher: appliedVoucher.ma_voucher,
            khach_hang_id: selectedCustomer.value,
            hoa_don_id: invoiceId,
            so_tien_giam: voucherDiscount
        });
    }

    // ... rest of payment logic ...
};
```

### 4.5. Hiển Thị Voucher trong UI

```tsx
{appliedVoucher && (
    <div style={{ padding: '12px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4, marginBottom: 16 }}>
        <Row justify="space-between">
            <Col>
                <Tag color="green">{appliedVoucher.ma_voucher}</Tag>
                <span style={{ color: '#52c41a' }}>{appliedVoucher.ten_voucher}</span>
            </Col>
            <Col>
                <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                    - {formatCurrency(voucherDiscount)}
                </span>
                <Button 
                    type="text" 
                    size="small" 
                    icon={<CloseOutlined />}
                    onClick={() => {
                        setAppliedVoucher(null);
                        setVoucherDiscount(0);
                    }}
                />
            </Col>
        </Row>
    </div>
)}
```

---

## 5. Database Schema

### Bảng `spa_voucher`

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `ma_voucher` | varchar(50) | Mã voucher (unique) |
| `la_phan_tram` | tinyint(1) | 1: phần trăm, 0: số tiền |
| `gia_tri_giam` | decimal(15,2) | Giá trị giảm |
| `giam_toi_da` | decimal(15,2) | Giảm tối đa (cho %) |
| `dieu_kien_su_dung` | json | Điều kiện: ten_voucher, don_toi_thieu, so_luong, so_luong_da_dung, ... |
| `ngay_het_han` | datetime | Ngày hết hạn |
| `trang_thai` | enum | `chua_su_dung`, `da_su_dung`, `het_han` |
| `khach_hang_id` | bigint | ID khách hàng sử dụng (nullable) |
| `ngay_su_dung` | datetime | Ngày sử dụng (nullable) |
| `created_at` | timestamp | Ngày tạo |
| `updated_at` | timestamp | Ngày cập nhật |

### Ví dụ `dieu_kien_su_dung` JSON:

```json
{
  "ten_voucher": "Giảm giá mùa hè",
  "don_toi_thieu": 500000,
  "ap_dung_cho": "tat_ca",
  "danh_sach_ap_dung": [],
  "mo_ta": "Voucher giảm 20% cho đơn hàng từ 500k",
  "ngay_bat_dau": "2025-11-01",
  "so_luong": 100,
  "so_luong_da_dung": 15
}
```

---

## 6. Quy Trình Sử Dụng Voucher

### Bước 1: Tạo Voucher
1. Vào **Quản lý Voucher**
2. Click **Tạo Voucher**
3. Nhập thông tin
4. Click **Tạo mới**

### Bước 2: Khách Hàng Nhận Mã
- Gửi mã qua Email/SMS/Zalo
- Hiển thị tại website
- In trên hóa đơn

### Bước 3: Sử Dụng Tại POS
1. Nhân viên nhập mã voucher
2. Hệ thống kiểm tra hợp lệ
3. Hiển thị số tiền giảm
4. Áp dụng vào hóa đơn
5. Thanh toán

### Bước 4: Voucher Được Đánh Dấu Đã Sử Dụng
- `trang_thai` → `da_su_dung`
- `khach_hang_id` được cập nhật
- `ngay_su_dung` được ghi nhận
- `so_luong_da_dung` tăng lên

---

## 7. Best Practices

### 7.1. Tạo Voucher
- ✅ Đặt tên rõ ràng, dễ hiểu
- ✅ Set đơn tối thiểu hợp lý
- ✅ Giới hạn số lượng để tránh lạm dụng
- ✅ Set ngày hết hạn rõ ràng

### 7.2. Quản Lý
- ✅ Kiểm tra voucher hết hạn định kỳ
- ✅ Vô hiệu hóa voucher không dùng
- ✅ Theo dõi số lượt sử dụng

### 7.3. Marketing
- ✅ Tạo voucher cho chương trình khuyến mãi
- ✅ Voucher sinh nhật khách hàng
- ✅ Voucher tri ân khách hàng thân thiết
- ✅ Voucher giới thiệu bạn bè

---

## 8. Ví Dụ Thực Tế

### Ví dụ 1: Voucher Giảm Phần Trăm
```
Mã: GIAM20
Loại: Phần trăm
Giá trị: 20%
Giảm tối đa: 200,000đ
Đơn tối thiểu: 500,000đ
Số lượng: 50

→ Đơn hàng 1,000,000đ: Giảm 200,000đ (20% = 200k, đã đạt max)
→ Đơn hàng 600,000đ: Giảm 120,000đ (20% = 120k)
→ Đơn hàng 300,000đ: Không đủ điều kiện
```

### Ví dụ 2: Voucher Giảm Số Tiền
```
Mã: FREESHIP50K
Loại: Số tiền
Giá trị: 50,000đ
Đơn tối thiểu: 200,000đ
Số lượng: 100

→ Mọi đơn từ 200k đều giảm 50,000đ
```

---

## 9. Troubleshooting

### Lỗi: "Mã voucher không tồn tại"
- Kiểm tra mã voucher đã được tạo chưa
- Kiểm tra chính tả (uppercase/lowercase)

### Lỗi: "Voucher đã hết hạn"
- Kiểm tra `ngay_ket_thuc` trong database
- Tạo voucher mới hoặc gia hạn

### Lỗi: "Voucher đã hết lượt sử dụng"
- Kiểm tra `so_luong` vs `so_luong_da_dung`
- Tăng số lượng hoặc tạo voucher mới

### Lỗi: "Giá trị đơn hàng tối thiểu: XXX đ"
- Thêm sản phẩm/dịch vụ để đủ điều kiện
- Sử dụng voucher khác

---

## 10. Tóm Tắt

**Voucher được sử dụng như sau:**

1. **Tạo voucher** tại `/aio/spa/vouchers/`
2. **Kiểm tra** voucher hợp lệ qua API `POST /vouchers/verify`
3. **Tính toán** số tiền giảm dựa trên loại voucher
4. **Áp dụng** vào hóa đơn khi thanh toán qua API `POST /vouchers/apply`
5. **Voucher** được đánh dấu đã sử dụng

**Luồng hoạt động:**
```
Tạo Voucher → Chia sẻ mã → Khách nhập mã tại POS → 
Verify hợp lệ → Tính giảm giá → Thanh toán → Apply voucher → 
Cập nhật trạng thái đã dùng
```

---

_Cập nhật: 18/11/2025_
