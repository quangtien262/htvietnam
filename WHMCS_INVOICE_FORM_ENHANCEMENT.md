# WHMCS Invoice Form Enhancement - Add Product Selection

## 📋 Tổng quan

Cải tiến form tạo hóa đơn với khả năng chọn sản phẩm/dịch vụ từ catalog và tự động điền giá theo billing cycle.

---

## ✨ Features mới

### 1. Chọn sản phẩm/dịch vụ từ catalog
- Dropdown hiển thị tất cả products với tên và loại (type)
- Khi chọn product → load billing cycles tương ứng

### 2. Chọn kỳ thanh toán (Billing Cycle)
- Hiển thị các gói giá theo product đã chọn
- Format: `monthly - 100,000 VNĐ`
- Các cycle phổ biến: monthly, quarterly, semi-annually, annually, one-time

### 3. Tự động điền giá
- Khi chọn billing cycle → tự động fill:
  - **Unit Price** (giá sản phẩm theo cycle)
  - **Setup Fee** (phí cài đặt nếu có)

### 4. Thêm phí cài đặt (Setup Fee)
- Field riêng cho setup fee
- Có thể edit manual
- Tổng tiền = (unit_price × qty) + setup_fee

### 5. Modal rộng hơn
- Width: 800px → **1000px**
- Đủ không gian cho grid layout 4 columns

---

## 🎨 UI/UX Improvements

### Layout mới (Grid-based):

```
┌─────────────────────────────────────────────────────────┐
│ Khách hàng: [Select...]                                │
├─────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────┐   │
│ │ Item #1                                           │   │
│ │ ┌──────────────────┬──────────────────┐          │   │
│ │ │ Sản phẩm/DV      │ Kỳ thanh toán    │          │   │
│ │ │ [Select...]      │ [Select...]      │          │   │
│ │ └──────────────────┴──────────────────┘          │   │
│ │ ┌─────────┬────────┬────────┬────────┐           │   │
│ │ │ Mô tả   │ Giá    │ Phí CT │ SL     │           │   │
│ │ │ [Input] │ [100K] │ [50K]  │ [1]    │           │   │
│ │ └─────────┴────────┴────────┴────────┘           │   │
│ │ [Xóa item này]                                    │   │
│ └───────────────────────────────────────────────────┘   │
│ [+ Thêm item]                                          │
├─────────────────────────────────────────────────────────┤
│ Hạn thanh toán: [DatePicker]                           │
│ Ghi chú: [TextArea]                                    │
└─────────────────────────────────────────────────────────┘
```

### Visual Enhancements:
- **Item Box**: Border + background color để phân biệt rõ các items
- **Grid Layout**: 
  - Row 1: 2 columns (Product + Billing Cycle)
  - Row 2: 4 columns (Description + Unit Price + Setup Fee + Qty)
- **Number Formatting**: Có dấu phẩy ngăn cách hàng nghìn

---

## 🔧 Technical Changes

### Frontend: `resources/js/pages/whmcs/InvoiceList.tsx`

#### 1. State mới
```tsx
const [products, setProducts] = useState<any[]>([]);
```

#### 2. Fetch products
```tsx
const fetchProducts = async () => {
  try {
    const response = await axios.get('/aio/api/whmcs/products');
    const productsData = response.data || [];
    setProducts(productsData);
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
};

useEffect(() => {
  fetchInvoices();
  fetchClients();
  fetchProducts(); // ✅ Thêm vào
}, [pagination.current, filters]);
```

#### 3. Form Fields mới

**Product Selection:**
```tsx
<Form.Item
  label="Sản phẩm/Dịch vụ"
  name={[name, 'product_id']}
  rules={[{ required: true, message: 'Chọn sản phẩm' }]}
>
  <Select
    placeholder="Chọn sản phẩm"
    onChange={(productId) => {
      // Clear billing cycle khi đổi product
      const items = form.getFieldValue('items');
      items[name].billing_cycle = undefined;
      items[name].unit_price = undefined;
      items[name].setup_fee = undefined;
      form.setFieldsValue({ items });
    }}
  >
    {products.map(product => (
      <Option key={product.id} value={product.id}>
        {product.name} ({product.type})
      </Option>
    ))}
  </Select>
</Form.Item>
```

**Billing Cycle Selection:**
```tsx
<Form.Item
  label="Kỳ thanh toán"
  name={[name, 'billing_cycle']}
  rules={[{ required: true, message: 'Chọn kỳ thanh toán' }]}
>
  <Select
    placeholder="Chọn kỳ thanh toán"
    onChange={(cycle) => {
      const items = form.getFieldValue('items');
      const productId = items[name].product_id;
      const product = products.find(p => p.id === productId);
      
      if (product && product.pricings) {
        const pricing = product.pricings.find(p => p.cycle === cycle);
        if (pricing) {
          items[name].unit_price = pricing.price;
          items[name].setup_fee = pricing.setup_fee || 0;
          form.setFieldsValue({ items });
        }
      }
    }}
  >
    {/* Dynamic options based on selected product */}
    {(() => {
      const items = form.getFieldValue('items') || [];
      const productId = items[name]?.product_id;
      const product = products.find(p => p.id === productId);
      
      if (!product || !product.pricings) return null;
      
      return product.pricings.map((pricing: any) => (
        <Option key={pricing.id} value={pricing.cycle}>
          {pricing.cycle} - {Number(pricing.price).toLocaleString()} VNĐ
        </Option>
      ));
    })()}
  </Select>
</Form.Item>
```

**Setup Fee Field:**
```tsx
<Form.Item
  label="Phí cài đặt"
  name={[name, 'setup_fee']}
  initialValue={0}
>
  <InputNumber 
    placeholder="Phí cài đặt" 
    style={{ width: '100%' }}
    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
  />
</Form.Item>
```

#### 4. Modal Width
```tsx
<Modal
  title="Tạo hóa đơn mới"
  open={isCreateModalOpen}
  // ...
  width={1000} // ✅ Tăng từ 800 → 1000
>
```

---

### Backend: `app/Http/Controllers/Admin/Whmcs/InvoiceController.php`

#### Updated Validation
```php
$validated = $request->validate([
    'client_id' => 'required|exists:users,id',
    'items' => 'required|array|min:1',
    'items.*.description' => 'required|string',
    'items.*.unit_price' => 'required|numeric|min:0',      // ✅ Đổi từ amount
    'items.*.setup_fee' => 'nullable|numeric|min:0',       // ✅ Thêm mới
    'items.*.qty' => 'nullable|integer|min:1',             // ✅ Đổi từ quantity
    'items.*.type' => 'nullable|string',
    'items.*.product_id' => 'nullable|exists:whmcs_products,id',
    'items.*.billing_cycle' => 'nullable|string',          // ✅ Thêm mới
    'due_date' => 'nullable|date',
    'notes' => 'nullable|string',
    'tax' => 'nullable|numeric|min:0',
]);
```

#### Transform Data (Calculate Total)
```php
// Transform items data để tính total
$items = collect($validated['items'])->map(function ($item) {
    $qty = $item['qty'] ?? 1;
    $unitPrice = $item['unit_price'] ?? 0;
    $setupFee = $item['setup_fee'] ?? 0;
    $total = ($unitPrice * $qty) + $setupFee; // ✅ Formula

    return [
        'description' => $item['description'],
        'type' => $item['type'] ?? 'product',
        'product_id' => $item['product_id'] ?? null,
        'qty' => $qty,
        'unit_price' => $unitPrice,
        'total' => $total,
    ];
})->toArray();
```

---

### Model: `app/Models/Whmcs/InvoiceItem.php`

#### Added product_id to fillable
```php
protected $fillable = [
    'invoice_id', 
    'type', 
    'product_id',  // ✅ Thêm
    'service_id', 
    'description', 
    'qty', 
    'unit_price', 
    'total'
];
```

#### Added product relationship
```php
public function product(): BelongsTo
{
    return $this->belongsTo(Product::class);
}
```

---

## 📊 Database Schema

### whmcs_invoice_items (existing)
```sql
- id
- invoice_id (FK → whmcs_invoices)
- type (product, domain, addon, setup)
- product_id (FK → whmcs_products) ✅ Already exists
- service_id (FK → whmcs_services)
- description
- qty (default 1)
- unit_price (decimal 15,2)
- total (decimal 15,2)
```

### whmcs_product_pricing (reference)
```sql
- id
- product_id (FK → whmcs_products)
- cycle (monthly, quarterly, semi-annually, annually, one-time)
- currency (VND, USD, EUR)
- setup_fee (decimal 15,2) ✅ Used for auto-fill
- price (decimal 15,2)     ✅ Used for auto-fill
```

---

## 🎯 Use Cases

### Scenario 1: Tạo invoice cho hosting package
1. Chọn khách hàng: "Nguyễn Văn A"
2. Click "Thêm item"
3. Chọn sản phẩm: "Hosting Basic (hosting)"
4. Chọn kỳ: "monthly - 100,000 VNĐ"
5. ✅ Auto-fill:
   - Unit Price: 100,000
   - Setup Fee: 50,000 (nếu có)
6. Mô tả: "Web hosting tháng 11/2025"
7. Số lượng: 1
8. **Tổng**: 150,000 VNĐ (100k + 50k setup)

### Scenario 2: Tạo invoice multiple items
1. Item #1: Domain .com - annually - 300,000 VNĐ
2. Item #2: SSL Certificate - annually - 500,000 VNĐ  
3. Item #3: Email hosting - monthly - 50,000 VNĐ
4. **Subtotal**: 850,000 VNĐ

### Scenario 3: Custom pricing
1. Chọn sản phẩm & cycle để auto-fill
2. Manual edit giá nếu cần (discount/promotion)
3. Edit setup fee nếu miễn phí cài đặt (set = 0)

---

## 🧪 Testing

### Test 1: Auto-fill giá khi chọn product + cycle
```
1. Open "Tạo hóa đơn mới"
2. Chọn product: "VPS Standard"
3. Chọn cycle: "monthly"
4. Expected: 
   - Unit Price auto-filled: 500,000
   - Setup Fee auto-filled: 100,000
```

### Test 2: Clear fields khi đổi product
```
1. Chọn product A → cycle monthly
2. Đổi sang product B
3. Expected:
   - Billing cycle cleared
   - Unit price cleared
   - Setup fee cleared
```

### Test 3: Calculate total correctly
```
Item với:
- Unit Price: 100,000
- Qty: 2
- Setup Fee: 50,000

Expected total: (100,000 × 2) + 50,000 = 250,000 VNĐ
```

### Test 4: Multiple items
```
1. Thêm 3 items khác nhau
2. Submit form
3. Expected: 
   - Backend tính tổng đúng
   - Invoice tạo thành công
   - Items lưu với product_id
```

### Test 5: Responsive layout với width 1000px
```
1. Open modal
2. Check: Modal width = 1000px
3. Check: Grid layout hiển thị đẹp
4. Check: Các field không bị overlap
```

---

## 💡 Best Practices Applied

### 1. Cascading Dropdowns
```tsx
// Product → Billing Cycle
// Chỉ show cycles của product đã chọn
```

### 2. Auto-fill with Manual Override
```tsx
// Auto-fill giá nhưng vẫn cho phép edit
// User có thể discount/custom pricing
```

### 3. Clear Dependent Fields
```tsx
// Khi đổi product → clear billing cycle + prices
// Tránh data inconsistency
```

### 4. Number Formatting
```tsx
// Hiển thị: 1,000,000
// Store: 1000000
formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
```

### 5. Visual Grouping
```tsx
// Mỗi item trong box riêng
// Border + background color
// Dễ phân biệt multiple items
```

---

## 📝 Files Changed

| File | Changes | Status |
|------|---------|--------|
| `resources/js/pages/whmcs/InvoiceList.tsx` | Form layout, product selection, auto-fill | ✅ |
| `app/Http/Controllers/Admin/Whmcs/InvoiceController.php` | Validation, calculate total | ✅ |
| `app/Models/Whmcs/InvoiceItem.php` | Add product_id fillable + relation | ✅ |

**Total:** 3 files modified

---

## 🚀 Future Enhancements

### 1. Service Selection
```tsx
// Option to select existing service instead of product
// Pre-fill với service info
```

### 2. Discount Field
```tsx
// Add discount % or fixed amount
// Total = (unit_price × qty) + setup_fee - discount
```

### 3. Tax Calculation
```tsx
// Auto-apply tax based on product tax rules
// Show subtotal, tax, grand total
```

### 4. Preview Total
```tsx
// Real-time preview của invoice total
// While adding items
```

### 5. Templates
```tsx
// Save common invoice templates
// Quick create từ template
```

---

## ✅ Completion Status

**Date:** 11/11/2025  
**Status:** ✅ **COMPLETED**  
**Branch:** whmcs  
**Feature:** Invoice form enhancement với product selection  
**Ready for:** Testing & Production use

---

**Next Steps:**
1. ✅ Test manually trên browser
2. ⏳ Test với real products data
3. ⏳ User training/documentation
4. ⏳ Consider adding discount field

**Sign-off:** Ready for testing 🎉
