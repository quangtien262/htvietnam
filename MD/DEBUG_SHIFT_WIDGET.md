# Debug: Widget Bàn giao ca không hiển thị

## Vấn đề
- Không nhìn thấy Widget "Chưa mở ca" hoặc Widget "CA ĐANG MỞ" trên POS Bán hàng

## Đã thêm Debug Logs

### Console Logs để kiểm tra:

**Mở POS**: http://localhost:99/aio/spa/pos?p=spa

**Mở Console** (F12) và tìm các log sau:

#### 1. POS Screen Logs:
```
POS: Loading current shift...
POS: Shift response: { success: true/false, data: {...} }
POS: Current shift set: {...}  // hoặc "No current shift"
POS: Auto-selected branch: 1
```

#### 2. ShiftWidget Logs:
```
ShiftWidget rendered, chiNhanhId: 1, currentShift: null
Loading shift with params: { chi_nhanh_id: 1 }
Shift response: { success: true, data: {...} }
```

## Các trường hợp có thể xảy ra:

### Case 1: Không thấy log nào
**Nguyên nhân**: Component không được mount
**Giải pháp**:
1. Kiểm tra route có đúng không: `/aio/spa/pos?p=spa`
2. Hard reload: Ctrl + Shift + R
3. Xóa cache: Ctrl + Shift + Delete

### Case 2: Thấy log nhưng widget không hiển thị
**Nguyên nhân**: CSS bị ẩn hoặc z-index
**Giải pháp**:
1. Inspect element (F12) tìm `ShiftWidget`
2. Kiểm tra CSS: `display`, `visibility`, `opacity`
3. Thử thêm inline style force:
   ```tsx
   <div style={{ display: 'block !important', minHeight: '100px', border: '1px solid red' }}>
       <ShiftWidget ... />
   </div>
   ```

### Case 3: Error trong console
**Nguyên nhân**: API error hoặc import error
**Giải pháp**:
1. Kiểm tra API `/spa/shifts/current` có chạy không
2. Test API bằng Postman/curl:
   ```bash
   GET http://localhost:99/aio/api/spa/shifts/current
   ```
3. Kiểm tra import ShiftWidget đúng path

### Case 4: Loading mãi không dừng
**Nguyên nhân**: API không trả response
**Giải pháp**:
1. Kiểm tra Network tab (F12)
2. Xem request `/spa/shifts/current` status
3. Kiểm tra backend log

## Test Cases

### Test 1: Component Render
**Kỳ vọng**: Thấy text "Đang tải thông tin ca..." trong vài giây
**Cách test**: 
1. Reload page
2. Quan sát ngay lập tức
3. Nếu không thấy → Component không mount

### Test 2: API Call
**Kỳ vọng**: Network tab có request tới `/spa/shifts/current`
**Cách test**:
1. F12 → Network tab
2. Reload page
3. Filter: "shifts"
4. Nếu không thấy → API không được gọi

### Test 3: State Update
**Kỳ vọng**: Console log "ShiftWidget rendered" xuất hiện 2+ lần
**Cách test**:
1. Console tab
2. Reload page
3. Count số lần log
4. Lần 1: Mount, Lần 2+: State update

### Test 4: Render Output
**Kỳ vọng**: Thấy Card với text "Chưa mở ca" hoặc "CA ĐANG MỞ"
**Cách test**:
1. Elements tab (F12)
2. Ctrl + F → Search: "Chưa mở ca"
3. Nếu tìm thấy nhưng không hiển thị → CSS issue
4. Nếu không tìm thấy → Logic issue

## Debugging Steps

### Bước 1: Verify Component Import
```typescript
// SpaPOSScreen.tsx line 6
import ShiftWidget from '../../components/spa/ShiftWidget';
```
- File path đúng không?
- Component export default?

### Bước 2: Verify Component Render
```tsx
// SpaPOSScreen.tsx line ~865
<Col span={12}>
    <ShiftWidget
        chiNhanhId={selectedBranch || undefined}
        onShiftChange={() => {...}}
    />
    <Card title="Hóa đơn">...</Card>
</Col>
```
- ShiftWidget trước Card "Hóa đơn"?
- Props truyền đúng?

### Bước 3: Verify API
**Test backend**:
```bash
php artisan route:list | grep shift
```
Kỳ vọng:
```
GET|HEAD  spa/shifts/current ... CaLamViecController@getCurrentShift
POST      spa/shifts/open ... CaLamViecController@openShift
```

**Test API response**:
```bash
curl http://localhost:99/aio/api/spa/shifts/current
```
Kỳ vọng:
```json
{
    "success": true,
    "data": null,  // hoặc { id: 1, ma_ca: "CA_001", ... }
    "message": "Chưa có ca nào đang mở"
}
```

### Bước 4: Verify State
**React DevTools**:
1. Install React Developer Tools extension
2. F12 → Components tab
3. Tìm `ShiftWidget`
4. Xem state: `currentShift`, `isLoadingShift`

## Quick Fixes

### Fix 1: Force Render Widget
Thêm vào SpaPOSScreen.tsx:
```tsx
<Col span={12}>
    <div style={{ backgroundColor: '#f0f0f0', padding: '10px', marginBottom: '16px' }}>
        <h4>DEBUG: Shift Widget Container</h4>
        <ShiftWidget ... />
    </div>
    <Card>...</Card>
</Col>
```

### Fix 2: Hardcode chiNhanhId
```tsx
<ShiftWidget
    chiNhanhId={1}  // Hardcode instead of selectedBranch
    onShiftChange={...}
/>
```

### Fix 3: Remove Conditional Render
Trong ShiftWidget.tsx, comment loading state:
```tsx
// if (isLoadingShift) { return <Card>Loading...</Card>; }
```

### Fix 4: Add Error Boundary
```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<div>Widget Error</div>}>
    <ShiftWidget ... />
</ErrorBoundary>
```

## Expected Console Output (Success)

```
POS: Loading current shift...
ShiftWidget rendered, chiNhanhId: undefined, currentShift: null
Loading shift with params: {}
Shift response: {success: true, data: null, message: "Chưa có ca nào đang mở"}
POS: Shift response: {success: true, data: null, message: "Chưa có ca nào đang mở"}
POS: No current shift
ShiftWidget rendered, chiNhanhId: undefined, currentShift: null
```

→ Widget hiển thị: Card "Chưa mở ca" + Button "Mở ca mới"

## Expected Console Output (With Shift)

```
POS: Loading current shift...
ShiftWidget rendered, chiNhanhId: 1, currentShift: null
Loading shift with params: {chi_nhanh_id: 1}
Shift response: {success: true, data: {id: 1, ma_ca: "CA_001", ...}}
POS: Shift response: {success: true, data: {id: 1, ...}}
POS: Current shift set: {id: 1, ma_ca: "CA_001", ...}
POS: Auto-selected branch: 1
ShiftWidget rendered, chiNhanhId: 1, currentShift: {id: 1, ...}
```

→ Widget hiển thị: Card "CA ĐANG MỞ - CA_001" + Thông tin ca

## Common Errors

### Error 1: "API.spaShiftCurrent is undefined"
**Nguyên nhân**: Missing API constant
**Fix**: Check `resources/js/common/api.tsx`:
```typescript
spaShiftCurrent: '/spa/shifts/current',
```

### Error 2: "Cannot read property 'chi_nhanh_id' of null"
**Nguyên nhân**: Accessing property of null shift
**Fix**: Add null check:
```typescript
if (response.data.data?.chi_nhanh_id) { ... }
```

### Error 3: Network error / 404
**Nguyên nhân**: Route not registered
**Fix**: Check `routes/spa_route.php`:
```php
Route::get('/shifts/current', [CaLamViecController::class, 'getCurrentShift']);
```

### Error 4: CORS error
**Nguyên nhân**: API prefix mismatch
**Fix**: Check API constant có `/aio/api` prefix đúng không

## Next Steps

1. **Mở Console** (F12)
2. **Reload page** (Ctrl + R)
3. **Copy tất cả logs** liên quan đến "shift" hoặc "ShiftWidget"
4. **Paste logs** vào chat để tôi phân tích

## Files to Check

1. `resources/js/pages/spa/SpaPOSScreen.tsx` - Line 865 (ShiftWidget usage)
2. `resources/js/components/spa/ShiftWidget.tsx` - Component implementation
3. `resources/js/common/api.tsx` - API constants
4. `routes/spa_route.php` - Route definition
5. `app/Http/Controllers/Admin/Spa/CaLamViecController.php` - getCurrentShift method

---

**Created**: 2025-11-17
**Status**: Debug logs added, waiting for console output
