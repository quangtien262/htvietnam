# WHMCS Invoice - Create & Pay Feature

**Date**: 12 November 2025  
**Feature**: Thêm nút "Tạo & Thanh toán" vào form tạo hóa đơn

## Summary

Bổ sung tính năng thanh toán ngay khi tạo hóa đơn bằng cách thêm:
- 3 trường input: Tiền đã thu, Phương thức thanh toán, Mã giao dịch
- Nút "Tạo & Thanh toán" để xử lý cả 2 thao tác cùng lúc
- Auto-fill số tiền thanh toán = tổng tiền hóa đơn

## UI Changes

### Before
```
Footer: [Hủy] [Tạo hóa đơn]
```

### After
```
Right Column:
├─ Thông tin đơn hàng
│  ├─ Khách hàng *
│  ├─ Hạn thanh toán
│  └─ Ghi chú
├─ 💰 Thông tin thanh toán (tùy chọn)  ← NEW!
│  ├─ Tiền đã thu của khách
│  ├─ Phương thức thanh toán
│  └─ Mã giao dịch
├─ Giỏ hàng
└─ Tổng cộng

Footer: [Hủy] [Tạo hóa đơn] [Tạo & Thanh toán] ← NEW!
```

## Code Changes

### 1. New State Variables

**File**: `resources/js/pages/whmcs/InvoiceList.tsx` (Lines 58-60)

```tsx
const [paymentAmount, setPaymentAmount] = useState<number>(0);
const [paymentMethod, setPaymentMethod] = useState<string>('');
const [transactionId, setTransactionId] = useState<string>('');
```

**Purpose**: Lưu thông tin thanh toán tùy chọn

### 2. Auto-Update Payment Amount

**File**: `resources/js/pages/whmcs/InvoiceList.tsx` (Lines 301-305)

```tsx
// Auto-update payment amount when cart changes
useEffect(() => {
  const total = calculateTotal();
  setPaymentAmount(total);
}, [cart]);
```

**Behavior**: 
- Khi thêm/xóa sản phẩm trong giỏ → Tự động cập nhật "Tiền đã thu"
- Giống logic payment modal: amount mặc định = invoice total

### 3. Reset Payment Fields

**File**: `resources/js/pages/whmcs/InvoiceList.tsx` (Lines 218-226)

```tsx
const resetCreateForm = () => {
  setCart([]);
  setSelectedUserId(null);
  setDueDate(null);
  setNotes('');
  setProductSearchText('');
  setPaymentAmount(0);          // ← Reset payment
  setPaymentMethod('');         // ← Reset payment
  setTransactionId('');         // ← Reset payment
};
```

### 4. Create & Pay Function

**File**: `resources/js/pages/whmcs/InvoiceList.tsx` (Lines 167-217)

```tsx
const handleCreateAndPayInvoice = async () => {
  try {
    // Validate payment fields
    if (!paymentAmount || paymentAmount <= 0) {
      message.error('Vui lòng nhập số tiền thanh toán');
      return;
    }
    if (!paymentMethod) {
      message.error('Vui lòng chọn phương thức thanh toán');
      return;
    }

    // Step 1: Create invoice
    const items = cart.map(item => ({
      product_id: item.product_id,
      description: item.description,
      type: 'product',
      billing_cycle: item.billing_cycle,
      qty: item.qty,
      unit_price: item.unit_price,
      setup_fee: item.setup_fee || 0,
    }));

    const invoicePayload = {
      user_id: selectedUserId,
      items: items,
      due_date: dueDate ? dayjs(dueDate).format('YYYY-MM-DD') : null,
      notes: notes || null,
    };

    const invoiceResponse = await axios.post('/aio/api/whmcs/invoices', invoicePayload);
    const createdInvoice = invoiceResponse.data.data || invoiceResponse.data;

    // Step 2: Record payment immediately
    const paymentPayload = {
      amount: paymentAmount,
      payment_method: paymentMethod,
      transaction_id: transactionId || null,
    };

    await axios.post(`/aio/api/whmcs/invoices/${createdInvoice.id}/payment`, paymentPayload);

    message.success('Tạo hóa đơn và ghi nhận thanh toán thành công');
    setIsCreateModalOpen(false);
    resetCreateForm();
    fetchInvoices();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Không thể tạo hóa đơn và thanh toán');
  }
};
```

**Flow**:
1. Validate payment amount > 0
2. Validate payment method exists
3. Create invoice (POST /aio/api/whmcs/invoices)
4. Get invoice ID from response
5. Record payment (POST /aio/api/whmcs/invoices/{id}/payment)
6. Show success message
7. Close drawer & reset form
8. Refresh invoice list

### 5. Payment Information Card

**File**: `resources/js/pages/whmcs/InvoiceList.tsx` (Lines 742-795)

```tsx
{/* Payment Information (Optional) */}
<Card 
  title={
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <DollarOutlined />
      <span>Thông tin thanh toán (tùy chọn)</span>
    </div>
  }
  size="small"
  style={{ marginBottom: 16 }}
>
  {/* Tiền đã thu */}
  <div style={{ marginBottom: 12 }}>
    <Text strong>Tiền đã thu của khách</Text>
    <InputNumber
      value={paymentAmount}
      onChange={(value) => setPaymentAmount(value || 0)}
      style={{ width: '100%', marginTop: 8 }}
      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
      addonAfter="VNĐ"
      placeholder="Số tiền đã thu"
    />
  </div>

  {/* Phương thức */}
  <div style={{ marginBottom: 12 }}>
    <Text strong>Phương thức thanh toán</Text>
    <Select
      value={paymentMethod}
      onChange={setPaymentMethod}
      placeholder="Chọn phương thức"
      style={{ width: '100%', marginTop: 8 }}
      allowClear
    >
      <Option value="bank_transfer">Chuyển khoản ngân hàng</Option>
      <Option value="vnpay">VNPay</Option>
      <Option value="momo">MoMo</Option>
      <Option value="cash">Tiền mặt</Option>
      <Option value="credit">Credit Balance</Option>
    </Select>
  </div>

  {/* Mã giao dịch */}
  <div>
    <Text strong>Mã giao dịch</Text>
    <Input
      value={transactionId}
      onChange={(e) => setTransactionId(e.target.value)}
      placeholder="Mã giao dịch (nếu có)"
      style={{ marginTop: 8 }}
      allowClear
    />
  </div>
</Card>
```

**Features**:
- 💰 Icon DollarOutlined
- Auto-fill payment amount = total
- Formatted number input with comma separator
- Payment method dropdown (5 options)
- Optional transaction ID field
- All fields clearable

### 6. Updated Footer Buttons

**File**: `resources/js/pages/whmcs/InvoiceList.tsx` (Lines 573-594)

```tsx
footer={
  <div style={{ textAlign: 'right' }}>
    <Space>
      {/* Cancel */}
      <Button onClick={() => {
        setIsCreateModalOpen(false);
        resetCreateForm();
      }}>
        Hủy
      </Button>

      {/* Create Invoice Only */}
      <Button 
        type="default" 
        onClick={handleCreateInvoice}
        disabled={cart.length === 0 || !selectedUserId}
      >
        Tạo hóa đơn
      </Button>

      {/* Create & Pay */}
      <Button 
        type="primary" 
        icon={<DollarOutlined />}
        onClick={handleCreateAndPayInvoice}
        disabled={cart.length === 0 || !selectedUserId}
      >
        Tạo & Thanh toán
      </Button>
    </Space>
  </div>
}
```

**Button States**:
- **Hủy**: Always enabled
- **Tạo hóa đơn**: Disabled if cart empty or no customer
- **Tạo & Thanh toán**: Disabled if cart empty or no customer
  - Additional validation on click: payment amount & method

## Validation Rules

### Create Invoice Button (No validation needed)
- ✅ Cart not empty
- ✅ Customer selected
- ⚠️ Payment fields ignored

### Create & Pay Button
**Pre-validation** (button disabled):
- ✅ Cart not empty
- ✅ Customer selected

**On-click validation** (shows error message):
- ✅ Payment amount > 0
- ✅ Payment method selected
- ⚠️ Transaction ID optional

## User Scenarios

### Scenario 1: Create Invoice Only (No Payment)
```
1. Add products to cart
2. Select customer
3. Click "Tạo hóa đơn"
→ Invoice created with status "unpaid"
→ Payment fields ignored
```

### Scenario 2: Create & Pay Immediately
```
1. Add products to cart (total: 1,500,000 VNĐ)
2. Select customer
3. Payment amount auto-filled: 1,500,000 VNĐ
4. Select payment method: "Tiền mặt"
5. Enter transaction ID (optional): "TX123456"
6. Click "Tạo & Thanh toán"
→ Invoice created
→ Payment recorded
→ Invoice status changed to "paid"
```

### Scenario 3: Partial Payment
```
1. Add products to cart (total: 2,000,000 VNĐ)
2. Select customer
3. Change payment amount to: 1,000,000 VNĐ
4. Select payment method: "Chuyển khoản"
5. Click "Tạo & Thanh toán"
→ Invoice created (total: 2,000,000)
→ Payment recorded (amount: 1,000,000)
→ Invoice status: still "unpaid" (remaining: 1,000,000)
```

### Scenario 4: Validation Errors
```
1. Add products, select customer
2. Clear payment amount (set to 0)
3. Click "Tạo & Thanh toán"
→ ❌ "Vui lòng nhập số tiền thanh toán"

OR

1. Add products, select customer
2. Don't select payment method
3. Click "Tạo & Thanh toán"
→ ❌ "Vui lòng chọn phương thức thanh toán"
```

## API Calls

### Create Invoice
```
POST /aio/api/whmcs/invoices
Body:
{
  "user_id": 123,
  "items": [
    {
      "product_id": 5,
      "description": "VPS Cloud - Monthly",
      "type": "product",
      "billing_cycle": "monthly",
      "qty": 2,
      "unit_price": 500000,
      "setup_fee": 100000
    }
  ],
  "due_date": "2025-12-01",
  "notes": "Ghi chú..."
}

Response:
{
  "data": {
    "id": 456,
    "number": "INV-2025-001",
    "total": 1100000,
    "status": "unpaid"
  }
}
```

### Record Payment
```
POST /aio/api/whmcs/invoices/456/payment
Body:
{
  "amount": 1100000,
  "payment_method": "cash",
  "transaction_id": "TX123456"
}

Response:
{
  "message": "Payment recorded successfully"
}
```

## Payment Methods

| Value | Display |
|-------|---------|
| `bank_transfer` | Chuyển khoản ngân hàng |
| `vnpay` | VNPay |
| `momo` | MoMo |
| `cash` | Tiền mặt |
| `credit` | Credit Balance |

## Benefits

### For Users
✅ **Faster workflow**: Create + pay in one action  
✅ **Auto-fill amount**: Don't need to type total again  
✅ **Flexible**: Can still create invoice without payment  
✅ **Clear separation**: Payment fields in separate card  

### For Business
✅ **Immediate payment recording**: Reduce unpaid invoices  
✅ **Better cash flow**: Encourage instant payment  
✅ **Transaction tracking**: Link payment to transaction ID  
✅ **Audit trail**: One operation, two API calls logged  

## Testing Checklist

- [x] Payment amount auto-fills when adding products
- [x] Payment amount updates when cart changes
- [x] Can clear payment fields (allowClear)
- [x] "Tạo hóa đơn" button creates invoice without payment
- [x] "Tạo & Thanh toán" validates amount > 0
- [x] "Tạo & Thanh toán" validates method selected
- [x] Both buttons disabled when cart empty
- [x] Both buttons disabled when no customer
- [x] Transaction ID is optional
- [x] Success message shows after create & pay
- [x] Form resets after successful operation
- [x] Invoice list refreshes
- [x] Payment fields reset on cancel
- [x] Number formatting works (comma separator)
- [x] Partial payment scenario works

## Future Enhancements

1. **Payment validation on server**: Ensure amount doesn't exceed invoice total
2. **Multiple payments**: Support splitting payment across methods
3. **Change calculator**: Show change when amount > total
4. **Receipt generation**: Auto-generate receipt PDF after payment
5. **Payment history**: Show all payments for an invoice
6. **Refund support**: Handle payment reversals
7. **Currency support**: Multi-currency payments

## Related Files

- `WHMCS_INVOICE_DRAWER_COMPLETE.md` - Drawer implementation
- `WHMCS_INVOICE_PRICE_FORMAT_FIX.md` - Price formatting
- `WHMCS_INVOICE_MOBILE_OPTIMIZATION.md` - Mobile responsive

---

## Summary

✅ **Added**: Payment info card with 3 fields  
✅ **Added**: "Tạo & Thanh toán" button  
✅ **Feature**: Auto-fill payment amount = invoice total  
✅ **Feature**: Create invoice + record payment in one click  
✅ **Validation**: Amount & method required for payment  
✅ **Flexible**: Can still create invoice without payment  

**Impact**: Faster invoice creation workflow with optional immediate payment recording.
