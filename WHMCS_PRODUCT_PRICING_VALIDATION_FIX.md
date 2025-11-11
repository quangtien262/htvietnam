# Fix: Product Form - pricings.*.cycle validation errors

## 🐛 Lỗi

```json
{
  "message": "pricings.0.cycle không được bỏ trống. (and 2 more errors)",
  "errors": {
    "pricings.0.cycle": [
      "pricings.0.cycle không được bỏ trống."
    ],
    "pricings.1.cycle": [
      "pricings.1.cycle không được bỏ trống."
    ],
    "pricings.2.cycle": [
      "pricings.2.cycle không được bỏ trống."
    ]
  }
}
```

## 🔍 Nguyên nhân

### 1. Column name mismatch
- **Frontend**: Gửi `pricings.*.billing_cycle`
- **Backend**: Expect `pricings.*.cycle`
- **Database**: Column name là `cycle`

### 2. Validation logic issue
```php
'pricings' => 'nullable|array',
'pricings.*.cycle' => 'required|...',  // ❌ Conflict!
```

- `pricings` nullable nhưng `pricings.*.cycle` required
- Khi user gửi empty pricing hoặc pricing với empty cycle → validation fail

### 3. Table name typo in validation
```php
'pricings.*.id' => 'nullable|exists:whmcs_product_pricings,id',
// ❌ Table name wrong!
```

Đúng: `whmcs_product_pricing` (singular)

---

## ✅ Giải pháp

### 1. Backend: ProductController.php

#### A. store() method - Fix validation

**Before:**
```php
$validated = $request->validate([
    'pricings' => 'nullable|array',
    'pricings.*.cycle' => 'required|string|in:monthly,quarterly,...',
    'pricings.*.price' => 'required|numeric|min:0',
    // ...
]);

// Processing
if (isset($validated['pricings'])) {
    foreach ($validated['pricings'] as $pricing) {
        ProductPricing::create([...]);
    }
}
```

**After:**
```php
$validated = $request->validate([
    'pricings' => 'nullable|array',
    'pricings.*.cycle' => 'required_with:pricings|string|in:monthly,quarterly,semiannually,annually,biennially,triennially,onetime',
    'pricings.*.price' => 'required_with:pricings|numeric|min:0',
    'pricings.*.setup_fee' => 'nullable|numeric|min:0',
]);

// Processing with safety checks
if (isset($validated['pricings']) && is_array($validated['pricings'])) {
    foreach ($validated['pricings'] as $pricing) {
        // Skip empty pricings
        if (empty($pricing['cycle']) || !isset($pricing['price'])) {
            continue;
        }
        
        ProductPricing::create([
            'product_id' => $product->id,
            'cycle' => $pricing['cycle'],
            'price' => $pricing['price'],
            'setup_fee' => $pricing['setup_fee'] ?? 0,
        ]);
    }
}
```

**Changes:**
- ✅ `required` → `required_with:pricings` (only required if pricings array exists)
- ✅ Added `is_array()` check
- ✅ Added `empty()` check to skip invalid pricings
- ✅ Fixed cycle values: `one_time` → `onetime`

#### B. updatePricing() method - Fix column names

**Before:**
```php
$validated = $request->validate([
    'pricings.*.id' => 'nullable|exists:whmcs_product_pricings,id',
    'pricings.*.billing_cycle' => 'required|string|in:...',
    // ...
]);

foreach ($validated['pricings'] as $pricingData) {
    if (isset($pricingData['id'])) {
        ProductPricing::where('id', $pricingData['id'])->update([
            'price' => $pricingData['price'],
            // Missing cycle update!
        ]);
    } else {
        ProductPricing::create([
            'billing_cycle' => $pricingData['billing_cycle'], // ❌ Wrong column
        ]);
    }
}
```

**After:**
```php
$validated = $request->validate([
    'pricings' => 'required|array|min:1',
    'pricings.*.id' => 'nullable|exists:whmcs_product_pricing,id', // ✅ Correct table name
    'pricings.*.cycle' => 'required|string|in:monthly,quarterly,semiannually,annually,biennially,triennially,onetime',
    'pricings.*.price' => 'required|numeric|min:0',
    'pricings.*.setup_fee' => 'nullable|numeric|min:0',
]);

foreach ($validated['pricings'] as $pricingData) {
    if (isset($pricingData['id'])) {
        ProductPricing::where('id', $pricingData['id'])
            ->where('product_id', $product->id) // ✅ Security check
            ->update([
                'cycle' => $pricingData['cycle'],  // ✅ Update cycle
                'price' => $pricingData['price'],
                'setup_fee' => $pricingData['setup_fee'] ?? 0,
            ]);
    } else {
        ProductPricing::create([
            'product_id' => $product->id,
            'cycle' => $pricingData['cycle'],  // ✅ Correct column
            'price' => $pricingData['price'],
            'setup_fee' => $pricingData['setup_fee'] ?? 0,
        ]);
    }
}
```

**Changes:**
- ✅ Fixed table name: `whmcs_product_pricings` → `whmcs_product_pricing`
- ✅ Fixed column: `billing_cycle` → `cycle`
- ✅ Added `cycle` to update query
- ✅ Added `where('product_id', $product->id)` security check
- ✅ Added `min:1` validation for pricings array

---

### 2. Frontend: ProductList.tsx

#### A. Interface update

**Before:**
```tsx
interface Product {
  // ...
  pricings?: Array<{ billing_cycle: string; price: number; setup_fee: number }>;
}
```

**After:**
```tsx
interface Product {
  // ...
  pricings?: Array<{ id?: number; cycle: string; price: number; setup_fee: number }>;
}
```

**Changes:**
- ✅ `billing_cycle` → `cycle` (match database)
- ✅ Added optional `id` for edit mode

#### B. Form field name

**Before:**
```tsx
<Form.Item
  {...restField}
  name={[name, 'billing_cycle']}  // ❌ Wrong
  rules={[{ required: true, message: 'Chọn chu kỳ' }]}
>
  <Select placeholder="Chu kỳ" style={{ width: 150 }}>
    {Object.entries(billingCycleLabels).map(([key, label]) => (
      <Option key={key} value={key}>{label}</Option>
    ))}
  </Select>
</Form.Item>
```

**After:**
```tsx
<Form.Item
  {...restField}
  name={[name, 'cycle']}  // ✅ Correct
  rules={[{ required: true, message: 'Chọn chu kỳ' }]}
>
  <Select placeholder="Chu kỳ" style={{ width: 150 }}>
    {Object.entries(billingCycleLabels).map(([key, label]) => (
      <Option key={key} value={key}>{label}</Option>
    ))}
  </Select>
</Form.Item>
```

**Changes:**
- ✅ Field name: `billing_cycle` → `cycle`

---

## 📊 Database Schema Reference

### whmcs_product_pricing table
```sql
CREATE TABLE whmcs_product_pricing (
    id BIGINT UNSIGNED PRIMARY KEY,
    product_id BIGINT UNSIGNED,
    cycle VARCHAR(255),           -- ✅ Column name
    currency VARCHAR(3),
    setup_fee DECIMAL(15,2),
    price DECIMAL(15,2),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES whmcs_products(id)
);
```

### Valid cycle values
```php
'monthly'      // Hàng tháng
'quarterly'    // Hàng quý (3 tháng)
'semiannually' // Nửa năm (6 tháng)
'annually'     // Hàng năm
'biennially'   // 2 năm
'triennially'  // 3 năm
'onetime'      // 1 lần (không tái tục)
```

---

## 🧪 Testing

### Test 1: Create product without pricings
```bash
POST /aio/api/whmcs/products
{
  "name": "Test Product",
  "type": "hosting",
  "pricings": []  # Empty array
}

Expected: ✅ Success (pricings is nullable)
```

### Test 2: Create product with pricings
```bash
POST /aio/api/whmcs/products
{
  "name": "Basic Hosting",
  "type": "hosting",
  "pricings": [
    { "cycle": "monthly", "price": 100000, "setup_fee": 50000 },
    { "cycle": "annually", "price": 1000000, "setup_fee": 0 }
  ]
}

Expected: ✅ Success
Result: 2 pricings created
```

### Test 3: Invalid cycle value
```bash
POST /aio/api/whmcs/products
{
  "name": "Test",
  "type": "hosting",
  "pricings": [
    { "cycle": "invalid_cycle", "price": 100000 }
  ]
}

Expected: ❌ Validation error
Message: "cycle must be one of: monthly, quarterly..."
```

### Test 4: Update pricing
```bash
PUT /aio/api/whmcs/products/{id}/pricing
{
  "pricings": [
    { "id": 1, "cycle": "monthly", "price": 150000 },  # Update existing
    { "cycle": "quarterly", "price": 400000 }          # Create new
  ]
}

Expected: ✅ Success
Result: Pricing #1 updated, new pricing created
```

### Test 5: Frontend form submission
```
1. Open "Thêm sản phẩm"
2. Fill: Name, Type
3. Tab "Bảng giá"
4. Click "Thêm bảng giá"
5. Select cycle: "monthly"
6. Enter price: 100000
7. Submit

Expected: ✅ Product created with pricing
```

---

## 🎯 Data Flow

### Create Product Flow
```
Frontend Form
  ↓
{
  name: "Product A",
  type: "hosting",
  pricings: [
    { cycle: "monthly", price: 100000, setup_fee: 0 }
  ]
}
  ↓
Backend Validation (required_with:pricings)
  ↓
Skip empty pricings
  ↓
Create Product
  ↓
Loop pricings → Create ProductPricing records
  ↓
Return product with pricings eager loaded
```

### Update Pricing Flow
```
Frontend Form
  ↓
{
  pricings: [
    { id: 1, cycle: "monthly", price: 150000 },    # Existing
    { cycle: "quarterly", price: 400000 }          # New
  ]
}
  ↓
Backend Validation
  ↓
Loop pricings:
  - If has id → Update existing
  - Else → Create new
  ↓
Return updated product
```

---

## 📝 Files Changed

| File | Changes | Status |
|------|---------|--------|
| `app/Http/Controllers/Admin/Whmcs/ProductController.php` | Fix validation rules + column names | ✅ |
| - store() | required → required_with, skip empty | ✅ |
| - updatePricing() | Fix table name, cycle column, security | ✅ |
| `resources/js/pages/whmcs/ProductList.tsx` | Fix interface + form field name | ✅ |
| - Interface | billing_cycle → cycle | ✅ |
| - Form.Item | name="billing_cycle" → name="cycle" | ✅ |

**Total:** 2 files, ~40 lines changed

---

## 💡 Best Practices Applied

### 1. Validation: required_with
```php
// Only require cycle if pricings array exists
'pricings.*.cycle' => 'required_with:pricings|...'
```

### 2. Safety checks before loop
```php
if (isset($data['pricings']) && is_array($data['pricings'])) {
    foreach ($data['pricings'] as $item) {
        if (empty($item['cycle']) || !isset($item['price'])) {
            continue; // Skip invalid
        }
        // Process valid item
    }
}
```

### 3. Security: Verify ownership
```php
ProductPricing::where('id', $id)
    ->where('product_id', $product->id)  // ✅ Ensure pricing belongs to product
    ->update([...]);
```

### 4. Frontend-Backend consistency
```
Database Column: cycle
Backend Expect: cycle  
Frontend Send: cycle
✅ All aligned!
```

---

## ✅ Completion Status

**Date:** 11/11/2025  
**Status:** ✅ **FIXED**  
**Branch:** whmcs  
**Issue:** Validation errors when creating products  
**Root Cause:** Column name mismatch + validation logic conflict  
**Impact:** High - Product creation was broken  

**Testing:**
- ✅ Create product without pricings
- ✅ Create product with pricings
- ✅ Update existing pricing
- ✅ Add new pricing to existing product
- ✅ Frontend form submits correctly

**Sign-off:** Ready for production 🚀
