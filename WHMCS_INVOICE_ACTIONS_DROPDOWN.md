# WHMCS Invoice Actions Dropdown Improvement

## Tóm tắt
Tối ưu UI của bảng danh sách hóa đơn WHMCS bằng cách gộp tất cả các nút thao tác vào một dropdown menu duy nhất.

## Vấn đề trước đây
- Mỗi invoice có 4-5 nút riêng biệt (Sửa, Thanh toán, Nhắc nhở, Hủy)
- Chiếm nhiều không gian trong table
- UI trông rối mắt và khó quản lý
- Không nhất quán với các module khác

## Giải pháp
Sử dụng Ant Design Dropdown component để tạo menu thao tác gọn gàng hơn.

## Chi tiết thay đổi

**File**: `resources/js/pages/whmcs/InvoiceList.tsx`

### 1. Thêm imports

```tsx
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
```

### 2. Thay đổi Actions Column

**BEFORE** (4-5 buttons riêng lẻ):
```tsx
{
  title: 'Thao tác',
  key: 'actions',
  render: (_: any, record: Invoice) => (
    <Space>
      <Button size="small" icon={<EditOutlined />}>Sửa</Button>
      {record.status === 'unpaid' && (
        <>
          <Button type="primary" size="small">Thanh toán</Button>
          <Button size="small">Nhắc nhở</Button>
          <Button danger size="small">Hủy</Button>
        </>
      )}
    </Space>
  ),
}
```

**AFTER** (1 dropdown button):
```tsx
{
  title: 'Thao tác',
  key: 'actions',
  width: 120,
  render: (_: any, record: Invoice) => {
    const menuItems: MenuProps['items'] = [
      {
        key: 'edit',
        label: 'Sửa',
        icon: <EditOutlined />,
        onClick: () => {
          setSelectedInvoice(record);
          editForm.setFieldsValue({
            user_id: record.user_id,
            status: record.status,
            due_date: record.due_date ? dayjs(record.due_date) : null,
            notes: record.notes,
          });
          setIsEditModalOpen(true);
        },
      },
    ];

    // Chỉ thêm các action này nếu invoice chưa thanh toán
    if (record.status === 'unpaid') {
      menuItems.push(
        {
          key: 'payment',
          label: 'Thanh toán',
          icon: <DollarOutlined />,
          onClick: () => {
            setSelectedInvoice(record);
            setIsPaymentModalOpen(true);
          },
        },
        {
          key: 'reminder',
          label: 'Nhắc nhở',
          icon: <SendOutlined />,
          onClick: () => handleSendReminder(record),
        },
        {
          type: 'divider',
        },
        {
          key: 'cancel',
          label: 'Hủy hóa đơn',
          icon: <CloseCircleOutlined />,
          danger: true,
          onClick: () => handleCancelInvoice(record),
        }
      );
    }

    return (
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <Button size="small" icon={<MoreOutlined />}>
          Thao tác
        </Button>
      </Dropdown>
    );
  },
}
```

## Cấu trúc Menu

### Tất cả invoices
- ✏️ **Sửa** - Mở modal chỉnh sửa thông tin hóa đơn

### Thêm cho invoices có status = "unpaid"
- 💰 **Thanh toán** - Mở modal ghi nhận thanh toán
- 📧 **Nhắc nhở** - Gửi email nhắc nhở khách hàng
- ➖ *Divider* - Phân cách action nguy hiểm
- ❌ **Hủy hóa đơn** (danger style) - Hủy hóa đơn

## Ưu điểm

### 1. **Tiết kiệm không gian**
- Giảm từ 4-5 buttons → 1 dropdown button
- Column width cố định: 120px
- Table gọn gàng hơn, dễ đọc hơn

### 2. **UX tốt hơn**
- Tất cả actions ở một chỗ
- Icons rõ ràng cho mỗi action
- Divider phân tách action nguy hiểm (Hủy)
- Danger style cho action phá hủy

### 3. **Dynamic Menu**
- Menu tự động thay đổi theo status
- Invoice đã thanh toán: chỉ hiện "Sửa"
- Invoice chưa thanh toán: hiện đầy đủ options

### 4. **Maintainable**
- Code dễ mở rộng thêm actions mới
- TypeScript type-safe với MenuProps
- Consistent với Ant Design patterns

## UI Preview

```
┌─────────────────────────────────────────────────┐
│ Số hóa đơn │ Khách hàng │ Tổng tiền │ Thao tác  │
├─────────────────────────────────────────────────┤
│ INV-001    │ Nguyễn A   │ 1,000,000 │ [Thao tác▼]│
│                                      ↓            │
│                              ┌─────────────────┐ │
│                              │ ✏️  Sửa         │ │
│                              ├─────────────────┤ │
│                              │ 💰 Thanh toán   │ │
│                              │ 📧 Nhắc nhở     │ │
│                              ├─────────────────┤ │
│                              │ ❌ Hủy hóa đơn  │ │
│                              └─────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Testing Checklist

- [x] Dropdown hiển thị đúng menu items
- [x] Click "Sửa" → mở edit modal
- [x] Click "Thanh toán" → mở payment modal
- [x] Click "Nhắc nhở" → gửi reminder
- [x] Click "Hủy hóa đơn" → hiện confirmation dialog
- [x] Invoice đã paid → chỉ hiện menu "Sửa"
- [x] Invoice unpaid → hiện đầy đủ menu
- [x] Icons và danger style hiển thị đúng

## Recommended for Other Modules

Pattern này nên áp dụng cho các module WHMCS khác:

1. **ServiceList.tsx** - Gộp Activate, Suspend, Terminate, Edit
2. **TicketList.tsx** - Gộp Reply, Close, Assign, Edit
3. **DomainList.tsx** - Gộp Renew, Transfer, Update NS, Edit
4. **TransactionList.tsx** - Gộp Refund, View Details, Export

## Migration Guide

Để convert bất kỳ table actions nào sang dropdown pattern:

```tsx
// 1. Add imports
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

// 2. Create menu builder function
const buildMenuItems = (record: YourType): MenuProps['items'] => {
  const items: MenuProps['items'] = [
    {
      key: 'action1',
      label: 'Action 1',
      icon: <Icon1 />,
      onClick: () => handleAction1(record),
    },
  ];
  
  // Conditional items
  if (record.condition) {
    items.push({
      key: 'action2',
      label: 'Action 2',
      onClick: () => handleAction2(record),
    });
  }
  
  return items;
};

// 3. Replace column render
{
  title: 'Thao tác',
  key: 'actions',
  width: 120,
  render: (_: any, record: YourType) => (
    <Dropdown menu={{ items: buildMenuItems(record) }} trigger={['click']}>
      <Button size="small" icon={<MoreOutlined />}>
        Thao tác
      </Button>
    </Dropdown>
  ),
}
```

## Files Changed

1. `resources/js/pages/whmcs/InvoiceList.tsx` - Actions column refactored

## Related

- WHMCS_INVOICE_EDIT_FEATURE.md - Edit feature documentation
- WHMCS_CLIENT_TO_USER_MIGRATION.md - Client to User migration

---
**Updated**: 11/11/2025  
**Status**: ✅ Complete  
**Impact**: UI Improvement - Better UX & cleaner code
