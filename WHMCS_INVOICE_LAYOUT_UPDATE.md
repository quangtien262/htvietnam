# WHMCS Invoice - Khách hàng và Hạn thanh toán cùng hàng

## Thay đổi
Đặt "Khách hàng" và "Hạn thanh toán" trên cùng một hàng trong form tạo hóa đơn.

## Layout

### Before
```
Khách hàng
[Select full width..................]

[Items...]

Hạn thanh toán
[DatePicker] ← 70% wasted space

Ghi chú
[TextArea...........................]
```

### After
```
Khách hàng                  Hạn thanh toán
[Select 66%.........]       [DatePicker 33%]

[Items...]

Ghi chú
[TextArea...........................]
```

## Code

```tsx
<div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
  <Form.Item label="Khách hàng" name="user_id" {...} />
  <Form.Item label="Hạn thanh toán" name="due_date" {...} />
</div>
```

## Responsive

- **Desktop**: 2 columns (2:1 ratio)
- **Mobile**: 1 column (stacked)

```tsx
gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr'
```

## Files Changed
- `resources/js/pages/whmcs/InvoiceList.tsx`

---
**Date**: 12/11/2025  
**Benefit**: Save ~60px vertical space, better UX
