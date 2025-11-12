# WHMCS Invoice - Price Formatting & Calculation Fix

**Date**: 12 November 2025  
**Issue**: Giá tiền không format đẹp, tính tổng bị nhầm sang cộng chuỗi

## Problems Fixed

### 1. Cộng tổng bị nhầm sang cộng chuỗi

**Nguyên nhân**: 
- Giá tiền từ API có thể là string: `"500000"` thay vì number `500000`
- Khi cộng string: `"500000" + "300000"` = `"500000300000"` (nối chuỗi)
- Khi nhân string: `"500000" * 2` tự động convert thành `1000000` (đúng)
- Nhưng khi cộng: `"500000" + "100000"` = `"500000100000"` (SAI!)

**Ví dụ lỗi**:
```javascript
// SAI - Cộng chuỗi
const price = "500000";  // từ API
const setupFee = "100000";
const total = price + setupFee;  // "500000100000" ❌

// ĐÚNG - Cộng số
const total = Number(price) + Number(setupFee);  // 600000 ✅
```

### 2. Giá tiền không format nhất quán

**Trước**: Một số chỗ dùng `.toLocaleString()`, một số chỗ không
**Sau**: Tất cả đều convert `Number()` trước khi format

## Changes Made

### 1. Fix `addToCart` Function

**File**: `resources/js/pages/whmcs/InvoiceList.tsx` (Line 172-201)

```tsx
// BEFORE
unit_price: pricing.price,          // Có thể là string "500000"
setup_fee: pricing.setup_fee || 0,  // Có thể là string "100000"

// AFTER
unit_price: Number(pricing.price) || 0,      // Luôn là number 500000
setup_fee: Number(pricing.setup_fee) || 0,   // Luôn là number 100000
```

**Lý do**: Đảm bảo giá trị lưu vào cart luôn là `number`, tránh lỗi cộng chuỗi

### 2. Fix `calculateSubtotal` Function

**File**: `resources/js/pages/whmcs/InvoiceList.tsx` (Line 211-216)

```tsx
// BEFORE
const calculateSubtotal = () => {
  return cart.reduce((sum, item) => 
    sum + (item.unit_price * item.qty) + item.setup_fee, 0
  );
};

// AFTER
const calculateSubtotal = () => {
  return cart.reduce((sum, item) => {
    const itemTotal = (Number(item.unit_price) * Number(item.qty)) + Number(item.setup_fee);
    return sum + itemTotal;
  }, 0);
};
```

**Giải thích**:
- Dù đã convert khi add, vẫn an toàn hơn khi convert lại khi tính
- `Number()` với số → trả về chính số đó (không ảnh hưởng performance)
- `Number()` với string → convert thành số
- `Number()` với null/undefined → trả về 0

**Tại sao cần wrap lại?**
```typescript
// Case 1: Nếu item.unit_price đã là number
Number(500000) → 500000 (không đổi)

// Case 2: Nếu vẫn là string (edge case)
Number("500000") → 500000 (convert)

// Case 3: Nếu null/undefined
Number(null) → 0
Number(undefined) → 0
```

### 3. Fix Product List Display

**File**: `resources/js/pages/whmcs/InvoiceList.tsx` (Line 604-612)

```tsx
// BEFORE
{pricing.price.toLocaleString('vi-VN')} VNĐ
+ Phí setup: {pricing.setup_fee.toLocaleString('vi-VN')} VNĐ

// AFTER
{Number(pricing.price).toLocaleString('vi-VN')} VNĐ
+ Phí setup: {Number(pricing.setup_fee).toLocaleString('vi-VN')} VNĐ
```

**Tại sao**: 
- Nếu `pricing.price` là string "500000", gọi `.toLocaleString()` sẽ lỗi hoặc hiển thị sai
- Convert `Number()` trước đảm bảo luôn format đúng

### 4. Fix Shopping Cart Display

**File**: `resources/js/pages/whmcs/InvoiceList.tsx` (Line 728-751)

```tsx
// BEFORE
Đơn giá: {item.unit_price.toLocaleString('vi-VN')} VNĐ
Phí setup: {item.setup_fee.toLocaleString('vi-VN')} VNĐ
Thành tiền: {((item.unit_price * item.qty) + item.setup_fee).toLocaleString('vi-VN')} VNĐ

// AFTER
Đơn giá: {Number(item.unit_price).toLocaleString('vi-VN')} VNĐ
Phí setup: {Number(item.setup_fee).toLocaleString('vi-VN')} VNĐ
Thành tiền: {((Number(item.unit_price) * Number(item.qty)) + Number(item.setup_fee)).toLocaleString('vi-VN')} VNĐ
```

**Công thức tính "Thành tiền"**:
```typescript
// Trước: có thể bị lỗi nếu là string
((item.unit_price * item.qty) + item.setup_fee)

// Sau: luôn đúng
((Number(item.unit_price) * Number(item.qty)) + Number(item.setup_fee))

// Ví dụ:
// item.unit_price = 500000
// item.qty = 2
// item.setup_fee = 100000
// Kết quả: (500000 * 2) + 100000 = 1,100,000 VNĐ
```

### 5. Add Helper Function (Optional)

**File**: `resources/js/pages/whmcs/InvoiceList.tsx` (Line 223-226)

```tsx
// Format currency helper - có thể dùng sau này
const formatCurrency = (value: number | string): string => {
  const numValue = Number(value) || 0;
  return numValue.toLocaleString('vi-VN');
};
```

Hiện tại chưa dùng (warning), nhưng giữ lại để sau này refactor code cho clean hơn.

## Testing

### Test Case 1: Add Product to Cart
```
1. Mở Drawer tạo hóa đơn
2. Chọn sản phẩm: VPS Cloud - Monthly (500,000 VNĐ)
3. Click "Monthly" button
✅ Hiển thị trong giỏ: "500,000 VNĐ"
✅ Tổng tiền: "500,000 VNĐ"
```

### Test Case 2: Multiple Items with Setup Fee
```
1. Thêm VPS Cloud - Monthly (500,000 VNĐ + setup 100,000 VNĐ)
2. Thêm SSL Certificate - Yearly (1,200,000 VNĐ)
3. Kiểm tra tổng tiền:
   - Item 1: 500,000 + 100,000 = 600,000
   - Item 2: 1,200,000
   - Tổng: 1,800,000 VNĐ ✅
```

### Test Case 3: Quantity Change
```
1. Thêm sản phẩm 500,000 VNĐ
2. Tăng số lượng lên 3
3. Kiểm tra:
   - Thành tiền: 500,000 × 3 = 1,500,000 VNĐ ✅
   - Tổng cộng: 1,500,000 VNĐ ✅
```

### Test Case 4: With Setup Fee & Quantity
```
1. Thêm VPS (500,000 VNĐ + setup 100,000 VNĐ)
2. Số lượng = 2
3. Tính toán:
   - Đơn giá: 500,000 VNĐ
   - Số lượng: 2
   - Phí setup: 100,000 VNĐ (chỉ tính 1 lần)
   - Thành tiền: (500,000 × 2) + 100,000 = 1,100,000 VNĐ ✅
```

## Before vs After

### Before (Lỗi)
```typescript
// API trả về
pricing.price = "500000"  // string
pricing.setup_fee = "100000"  // string

// Add to cart
cart = [{
  unit_price: "500000",     // string
  setup_fee: "100000"       // string
}]

// Tính tổng
total = "500000" + "100000"  // "500000100000" ❌ SAI!
// Hiển thị: 500,000,100,000 VNĐ (hoặc NaN)
```

### After (Đúng)
```typescript
// API trả về (giống)
pricing.price = "500000"  // string
pricing.setup_fee = "100000"  // string

// Add to cart - Convert ngay
cart = [{
  unit_price: 500000,      // number
  setup_fee: 100000        // number
}]

// Tính tổng
total = 500000 + 100000  // 600000 ✅ ĐÚNG!
// Hiển thị: 600,000 VNĐ
```

## Format Display Examples

### Product List
```
┌────────────────────────────┐
│ VPS Cloud Hosting          │
│ ├─ Monthly: 500,000 VNĐ    │ ← Format đúng
│ ├─ Yearly: 5,000,000 VNĐ   │ ← Format đúng
│ └─ + Setup: 100,000 VNĐ    │ ← Format đúng
└────────────────────────────┘
```

### Shopping Cart
```
┌────────────────────────────────────┐
│ 🛒 Giỏ hàng (2)                    │
├────────────────────────────────────┤
│ • VPS Cloud - Monthly              │
│   Đơn giá: 500,000 VNĐ            │ ← Format đúng
│   Phí setup: 100,000 VNĐ          │ ← Format đúng
│   Số lượng: [2]                    │
│   Thành tiền: 1,100,000 VNĐ       │ ← Tính đúng!
│                                    │
│ • SSL Certificate - Yearly         │
│   Đơn giá: 1,200,000 VNĐ          │
│   Số lượng: [1]                    │
│   Thành tiền: 1,200,000 VNĐ       │
├────────────────────────────────────┤
│ Tạm tính: 2,300,000 VNĐ           │ ← Tính đúng!
│ ══════════════════════════════════ │
│ Tổng cộng: 2,300,000 VNĐ          │ ← Tính đúng!
└────────────────────────────────────┘
```

## Technical Details

### Number Conversion Safety

```typescript
// Safe conversion với Number()
Number("500000")    → 500000
Number(500000)      → 500000
Number("abc")       → NaN
Number(null)        → 0
Number(undefined)   → 0
Number("")          → 0

// Với fallback
Number(value) || 0  // Nếu NaN → trả về 0
```

### Locale String Format

```typescript
// Vietnamese number format
(500000).toLocaleString('vi-VN')     → "500.000"
(1500000).toLocaleString('vi-VN')    → "1.500.000"
(12500000).toLocaleString('vi-VN')   → "12.500.000"
```

### Calculation Formula

```typescript
// Cart item total
itemTotal = (unit_price × quantity) + setup_fee

// Example 1: No setup fee
(500000 × 2) + 0 = 1,000,000

// Example 2: With setup fee
(500000 × 2) + 100000 = 1,100,000

// Example 3: Multiple items
Item 1: (500000 × 2) + 100000 = 1,100,000
Item 2: (1200000 × 1) + 0 = 1,200,000
Total: 1,100,000 + 1,200,000 = 2,300,000
```

## Files Modified

1. **resources/js/pages/whmcs/InvoiceList.tsx**
   - Line 172-201: `addToCart` - Convert pricing to number
   - Line 211-216: `calculateSubtotal` - Safe number calculation
   - Line 223-226: `formatCurrency` helper (unused, for future)
   - Line 604-612: Product pricing display - Number conversion
   - Line 728-751: Cart item display - Number conversion

## Deployment Checklist

- [x] Convert pricing to number in `addToCart`
- [x] Fix `calculateSubtotal` calculation
- [x] Add `Number()` to all price displays
- [x] Test with string prices from API
- [x] Test with multiple items
- [x] Test quantity changes
- [x] Test setup fee calculation
- [x] Verify total displays correctly
- [x] No TypeScript errors (only warnings)

## Known Issues

**TypeScript Warnings** (non-blocking):
- `formatCurrency` defined but not used (keep for future refactor)
- Various `any` types (can be typed properly later)

**Future Improvements**:
- Replace all `.toLocaleString('vi-VN')` with `formatCurrency()`
- Add proper TypeScript interfaces for Product and Pricing
- Add unit tests for calculation functions

---

## Summary

✅ **Fixed**: Cộng tổng không còn bị nhầm sang cộng chuỗi  
✅ **Fixed**: Tất cả giá tiền đều format đẹp với separator  
✅ **Improved**: Code an toàn hơn với Number() conversion  
✅ **Tested**: Tính toán chính xác với nhiều test cases  

**Impact**: 
- Tính tổng tiền chính xác 100%
- Hiển thị giá đẹp, dễ đọc
- Không còn lỗi NaN hay "500000100000"
