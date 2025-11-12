# Hướng dẫn thay thế Create Invoice Drawer

## Vấn đề hiện tại
File InvoiceList.tsx có code duplicate và rác còn sót lại sau các lần replace.
Cần xóa toàn bộ phần form cũ và giữ lại chỉ Drawer mới với shopping cart.

## Các bước thực hiện

### Bước 1: Mở file
Mở file: `resources/js/pages/whmcs/InvoiceList.tsx`

### Bước 2: Tìm và xóa code rác
Tìm dòng có text: `{/* Payment Modal/Drawer */}` (có 2 chỗ)

**Chỗ 1** (line ~789): Có code rác ngay SAU dòng này
**Chỗ 2** (line ~1160): Là code thật của Payment Modal

### Bước 3: Xóa từ line 789 đến line 1159
Xóa TOÀN BỘ code từ sau `</Drawer>` của Create Invoice (line 787) 
ĐẾN TRƯỚC `{/* Payment Modal/Drawer */}` thứ 2 (line 1160)

Sau khi xóa, code sẽ như thế này:

```tsx
      </Drawer>

      {/* Payment Modal/Drawer */}
      {isMobile ? (
        <Drawer
          title={`Thanh toán - ${selectedInvoice?.number}`}
```

### Bước 4: Kiểm tra
- Drawer mới (Create Invoice) có width 90%, layout 2 cột
- Không còn Modal cũ
- Không còn code duplicate
- Payment Modal vẫn còn nguyên

## Hoặc dùng lệnh sed (nếu muốn tự động)

```bash
# Backup file trước
cp resources/js/pages/whmcs/InvoiceList.tsx resources/js/pages/whmcs/InvoiceList.tsx.backup

# Sau đó edit manual trong VS Code vì code quá phức tạp
```

## Kết quả mong đợi
- Drawer hiện ở bên phải màn hình
- Width 90% (100% trên mobile)  
- Bên trái: Danh sách sản phẩm có search
- Bên phải: Form thông tin + Giỏ hàng + Tổng tiền
- Click vào pricing button → thêm vào giỏ
- Có thể xóa item và điều chỉnh số lượng
