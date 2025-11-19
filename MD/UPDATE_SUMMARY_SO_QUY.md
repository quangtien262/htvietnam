# Update Summary: Sổ Quỹ Management - Apartment & Room Integration

## Changes Made:

### 1. Frontend (SoQuyList.tsx)
✅ **Replaced chi_nhanh (branch) with apartment & room**
   - Updated interfaces: `apartment_id`, `apartment_name`, `room_id`, `room_name`
   - Removed `chi_nhanh_id` and `chi_nhanh_name`

✅ **Implemented Cascade Select**
   - Added `handleApartmentChange()` to load rooms when apartment is selected
   - Added `loadRoomsByApartment()` to fetch rooms via API
   - Room select is disabled until apartment is chosen
   - Auto-clear room when apartment changes

✅ **Separated Forms for Phiếu Thu & Phiếu Chi**
   - Created `handleAddPhieuThu()` - Green button for income
   - Created `handleAddPhieuChi()` - Red button for expense
   - Different labels: "Người nộp" vs "Người nhận"
   - Auto-set `so_quy_type_id` based on form type
   - Clearer UX, prevents confusion

✅ **Updated Table Columns**
   - Added "Tòa nhà" column
   - Added "Phòng" column
   - Removed "Chi nhánh" column

✅ **Updated Search Filters**
   - Changed filter from `chi_nhanh_id` to `apartment_id`
   - Uses `apartmentList` instead of `chiNhanhList`

### 2. Backend (SoQuyController.php)
✅ **Updated API Responses**
   - Added `apartment` and `room` relationships to eager loading
   - Replaced `chi_nhanh_id` with `apartment_id` in filters
   - Added `room_id` filter support
   - Return `apartment_name` and `room_name` in response

✅ **Updated Statistics Calculation**
   - Filter by `apartment_id` instead of `chi_nhanh_id`
   - Support `room_id` filtering

✅ **Updated CRUD Operations**
   - `apiAdd()`: Save `apartment_id` and `room_id`
   - `apiUpdate()`: Update `apartment_id` and `room_id`

### 3. Models (SoQuy.php)
✅ **Added New Relationships**
   - `apartment()` → belongsTo Apartment model
   - `room()` → belongsTo Room model
   - Kept existing `chiNhanh()` for backward compatibility

### 4. Documentation (SO_QUY_IMPLEMENTATION.md)
✅ **Updated README**
   - Added "Cập nhật mới" section
   - Updated API request/response examples
   - Updated feature descriptions
   - Added cascade select documentation

## Migration Note:
⚠️ **Database changes required:**
```sql
ALTER TABLE so_quy 
  ADD COLUMN apartment_id INT NULL,
  ADD COLUMN room_id INT NULL;
```

## Testing Checklist:
- [ ] Phiếu thu form opens correctly with green button
- [ ] Phiếu chi form opens correctly with red button
- [ ] Selecting apartment loads correct rooms
- [ ] Clearing apartment clears room selection
- [ ] Room dropdown is disabled when no apartment selected
- [ ] Table displays apartment and room names
- [ ] Filters work with apartment_id
- [ ] Statistics calculate correctly by apartment

## API Dependencies:
- `aitilen_apartmentList` - Load apartments
- `aitilen_apartmentRooms` - Load rooms by apartment (cascade)

## Files Modified:
1. resources/js/pages/aitilen/SoQuyList.tsx
2. app/Http/Controllers/Admin/SoQuyController.php
3. app/Models/Admin/SoQuy.php
4. SO_QUY_IMPLEMENTATION.md
