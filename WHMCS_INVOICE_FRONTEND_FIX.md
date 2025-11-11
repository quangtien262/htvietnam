# Fix: WHMCS Invoice Frontend Column Errors

## 🐛 Lỗi

```
Cannot read properties of undefined (reading 'toLocaleString')
    at render (InvoiceList.tsx:174:45)
```

## 🔍 Nguyên nhân

Frontend `InvoiceList.tsx` đang dùng sai tên cột và thiếu null checks:

### 1. Column names sai:
- ❌ `invoice_number` → ✅ `number`
- ❌ `date` → ✅ `created_at`
- ❌ `amount_paid` → ✅ (không tồn tại trong DB)
- ❌ `client.company_name` → ✅ `client.name`
- ❌ `tax` → ✅ `tax_total`

### 2. Thiếu null/undefined checks:
- `total.toLocaleString()` - total có thể undefined
- `amount.toLocaleString()` - amount có thể undefined
- `dayjs(date)` - date có thể null

## ✅ Giải pháp

### File: `resources/js/pages/whmcs/InvoiceList.tsx`

#### 1. Fix Interface (lines 11-24)

**Before:**
```tsx
interface Invoice {
  id: number;
  invoice_number: string;
  client_id: number;
  client?: { id: number; company_name: string; email: string };
  status: 'unpaid' | 'paid' | 'cancelled' | 'refunded';
  subtotal: number;
  tax: number;
  total: number;
  amount_paid: number;
  date: string;
  due_date: string;
  notes?: string;
}
```

**After:**
```tsx
interface Invoice {
  id: number;
  number: string;                    // ✅ invoice_number → number
  client_id: number;
  client?: { id: number; name: string; email: string }; // ✅ company_name → name
  status: 'unpaid' | 'paid' | 'cancelled' | 'refunded';
  subtotal: number;
  tax_total: number;                 // ✅ tax → tax_total
  total: number;
  credit_applied: number;            // ✅ thêm credit_applied
  created_at: string;                // ✅ date → created_at
  due_date: string | null;           // ✅ nullable
  paid_at: string | null;            // ✅ thêm paid_at
  notes?: string;
}
```

#### 2. Fix Table Columns (lines 145-176)

**Before:**
```tsx
const columns = [
  {
    title: 'Số hóa đơn',
    dataIndex: 'invoice_number',     // ❌
    key: 'invoice_number',
    render: (text: string) => <strong>{text}</strong>,
  },
  {
    title: 'Khách hàng',
    dataIndex: ['client', 'company_name'], // ❌
    key: 'client',
  },
  {
    title: 'Tổng tiền',
    dataIndex: 'total',
    key: 'total',
    render: (total: number) => `${total.toLocaleString()} VNĐ`, // ❌ no null check
  },
  {
    title: 'Đã thanh toán',
    dataIndex: 'amount_paid',        // ❌ không tồn tại
    key: 'amount_paid',
    render: (amount: number) => `${amount.toLocaleString()} VNĐ`,
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'date',               // ❌
    key: 'date',
    render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
  },
  // ...
];
```

**After:**
```tsx
const columns = [
  {
    title: 'Số hóa đơn',
    dataIndex: 'number',             // ✅
    key: 'number',
    render: (text: string) => <strong>{text}</strong>,
  },
  {
    title: 'Khách hàng',
    dataIndex: ['client', 'name'],   // ✅
    key: 'client',
    render: (_: any, record: any) => record.client?.name || '-', // ✅ null check
  },
  {
    title: 'Tổng tiền',
    dataIndex: 'total',
    key: 'total',
    render: (total: number) => total ? `${Number(total).toLocaleString()} VNĐ` : '0 VNĐ', // ✅
  },
  // ✅ Removed amount_paid column (doesn't exist in DB)
  {
    title: 'Ngày tạo',
    dataIndex: 'created_at',         // ✅
    key: 'created_at',
    render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-', // ✅
  },
  // ...
];
```

#### 3. Fix Due Date Column (lines 177-189)

**Before:**
```tsx
{
  title: 'Hạn thanh toán',
  dataIndex: 'due_date',
  key: 'due_date',
  render: (date: string, record: Invoice) => {
    const isOverdue = dayjs(date).isBefore(dayjs()) && record.status === 'unpaid'; // ❌ date có thể null
    return (
      <span style={{ color: isOverdue ? 'red' : 'inherit' }}>
        {dayjs(date).format('DD/MM/YYYY')}
      </span>
    );
  },
}
```

**After:**
```tsx
{
  title: 'Hạn thanh toán',
  dataIndex: 'due_date',
  key: 'due_date',
  render: (date: string, record: Invoice) => {
    if (!date) return '-';           // ✅ null check
    const isOverdue = dayjs(date).isBefore(dayjs()) && record.status === 'unpaid';
    return (
      <span style={{ color: isOverdue ? 'red' : 'inherit' }}>
        {dayjs(date).format('DD/MM/YYYY')}
      </span>
    );
  },
}
```

#### 4. Fix Modal Titles (lines 102, 347)

**Before:**
```tsx
// Cancel modal
content: `Bạn có chắc muốn hủy hóa đơn ${invoice.invoice_number}?`, // ❌

// Payment modal  
title={`Ghi nhận thanh toán - ${selectedInvoice?.invoice_number}`} // ❌
```

**After:**
```tsx
// Cancel modal
content: `Bạn có chắc muốn hủy hóa đơn ${invoice.number}?`, // ✅

// Payment modal
title={`Ghi nhận thanh toán - ${selectedInvoice?.number}`} // ✅
```

## 📊 Schema Mapping

| Frontend (Old) | Frontend (New) | Database Column | Notes |
|---------------|----------------|-----------------|-------|
| `invoice_number` | `number` | `number` | ✅ Mã hóa đơn |
| `date` | `created_at` | `created_at` | ✅ Ngày tạo |
| `amount_paid` | ❌ Removed | - | Column không tồn tại |
| `client.company_name` | `client.name` | `users.name` | ✅ Tên khách hàng |
| `tax` | `tax_total` | `tax_total` | ✅ Tổng thuế |
| - | `credit_applied` | `credit_applied` | ✅ Credit đã dùng |
| - | `paid_at` | `paid_at` | ✅ Ngày thanh toán |
| `due_date: string` | `due_date: string \| null` | `due_date` (nullable) | ✅ Nullable |

## 🎯 Null Safety Improvements

### Before (Unsafe):
```tsx
render: (total: number) => `${total.toLocaleString()} VNĐ`
// ❌ Crash if total is undefined/null
```

### After (Safe):
```tsx
render: (total: number) => total ? `${Number(total).toLocaleString()} VNĐ` : '0 VNĐ'
// ✅ Handle undefined/null gracefully
```

## 🧪 Testing

### Test 1: Load invoice list
```
1. Navigate to /aio/whmcs/invoices
2. Expected: No console errors
3. Expected: Table displays with correct columns
```

### Test 2: Display invoice with null due_date
```
1. Create invoice without due_date
2. Expected: Shows "-" in due date column
3. Expected: No "Cannot read properties of undefined" error
```

### Test 3: Display invoice total
```
1. View invoice with total = 1000000
2. Expected: Shows "1,000,000 VNĐ"
3. Expected: No toLocaleString error
```

### Test 4: Cancel invoice
```
1. Click cancel on invoice
2. Expected: Modal shows "Bạn có chắc muốn hủy hóa đơn INV-2025-001?"
3. Expected: Uses correct invoice.number
```

## 📝 Changes Summary

| File | Lines | Changes | Status |
|------|-------|---------|--------|
| `InvoiceList.tsx` | 11-24 | Fix Invoice interface | ✅ |
| `InvoiceList.tsx` | 145-176 | Fix table columns | ✅ |
| `InvoiceList.tsx` | 177-189 | Add null check for due_date | ✅ |
| `InvoiceList.tsx` | 102 | Fix cancel modal | ✅ |
| `InvoiceList.tsx` | 347 | Fix payment modal | ✅ |

## ⚠️ Breaking Changes

### Removed Column: amount_paid

**Reason:** Column không tồn tại trong database schema.

**Alternative:** Nếu cần hiển thị số tiền đã thanh toán:
```tsx
// Option 1: Calculate from transactions
{
  title: 'Đã thanh toán',
  key: 'amount_paid',
  render: (_: any, record: Invoice) => {
    const paid = record.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
    return `${paid.toLocaleString()} VNĐ`;
  },
}

// Option 2: Add virtual attribute in backend
// Controller: return invoices with ->appends(['amount_paid'])
// Model: add getAmountPaidAttribute()
```

## ✅ Result

- ✅ No more "Cannot read properties of undefined" errors
- ✅ All column names match database schema
- ✅ Proper null/undefined handling
- ✅ Interface updated to match backend response
- ✅ Invoice list page fully working

## 💡 Best Practices Applied

1. **Null Safety**: Always check for null/undefined before calling methods
   ```tsx
   // Good
   date ? dayjs(date).format(...) : '-'
   
   // Bad
   dayjs(date).format(...)
   ```

2. **Type Safety**: Update TypeScript interfaces to match backend
   ```tsx
   due_date: string | null  // ✅ Matches nullable in DB
   ```

3. **Defensive Rendering**: Provide fallback values
   ```tsx
   total ? `${Number(total).toLocaleString()} VNĐ` : '0 VNĐ'
   ```

4. **Optional Chaining**: Use ?. for nested properties
   ```tsx
   record.client?.name || '-'
   ```

---

**Date:** 11/11/2025  
**Fixed by:** AI Assistant  
**Status:** ✅ FIXED  
**Branch:** whmcs  
**Related:** WHMCS_INVOICE_COLUMN_FIX.md (backend fixes)
