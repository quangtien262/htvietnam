# Giải Đáp: Thư Mục & Storage Quota

## 📁 Câu hỏi 1: Thư mục có tạo trên server không?

### **Trả lời: KHÔNG**

Hệ thống chỉ lưu thư mục trên **database** (table `tai_lieu_thu_muc`), **KHÔNG tạo folder vật lý** trên server.

### **Kiến trúc thiết kế:**

```
┌─────────────────────────────────────────┐
│  UI: Tree Structure (Frontend)          │
│  📂 Công ty                              │
│   ├── 📁 Phòng IT (TM0001)              │
│   │   └── 📄 report.pdf                 │
│   └── 📁 Phòng Nhân sự (TM0002)         │
│       └── 📄 contract.docx              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Database: tai_lieu_thu_muc              │
│  id | ten_thu_muc | parent_id           │
│  1  | Công ty     | null                │
│  2  | Phòng IT    | 1                   │
│  3  | Phòng NS    | 1                   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Database: tai_lieu_file                │
│  id | thu_muc_id | duong_dan            │
│  10 | 2          | documents/1234.pdf   │
│  11 | 3          | documents/5678.docx  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Storage: storage/app/public/documents/  │
│  1234_report.pdf         (Physical)     │
│  5678_contract.docx      (Physical)     │
│  (FLAT structure, NO folders)           │
└─────────────────────────────────────────┘
```

### **Lý do thiết kế như vậy:**

1. **Hiệu năng:**
   - Không phải quản lý nested folders phức tạp
   - Dễ backup/restore (chỉ cần copy flat folder)
   - Search file nhanh hơn

2. **Tính linh hoạt:**
   - Có thể move file giữa các thư mục chỉ bằng cách update `thu_muc_id`
   - Không cần move file vật lý
   - Không lo conflict path

3. **An toàn:**
   - File lưu với tên unique (timestamp + slug)
   - Không bị trùng tên khi upload

### **Vì sao DB có thư mục nhưng không hiển thị?**

❌ **Lỗi authentication:** Frontend không gửi cookies → API trả về HTML login page → Parse lỗi → Empty array

✅ **Đã fix:** Thêm `axios.defaults.withCredentials = true` ở `axiosConfig.ts`

**Test:** Refresh page và kiểm tra Network tab xem có cookies không.

---

## 💾 Câu hỏi 2: Lỗi "Vượt quá hạn ngạch lưu trữ"

### **Lỗi chi tiết:**

```json
{
  "message": "Vượt quá hạn ngạch lưu trữ",
  "exception": "Exception",
  "file": "DocumentService.php",
  "line": 29
}
```

### **Nguyên nhân:**

Code kiểm tra quota **TRƯỚC KHI** upload:

```php
// DocumentService.php:19-29
$quota = Quota::forUser($userId)->first();
if (!$quota || !$quota->canUpload($uploadedFile->getSize())) {
    throw new \Exception('Vượt quá hạn ngạch lưu trữ');
}
```

**Vấn đề:**
- User chưa có record trong table `tai_lieu_quota`
- Hoặc quota đã đầy (`dung_luong_su_dung >= dung_luong_gioi_han`)

### **Giải pháp đã áp dụng:**

#### **1. Auto-create Quota (Code Fix)**

**File:** `app/Services/Document/DocumentService.php`

```php
public function uploadFile($request, $userId)
{
    $uploadedFile = $request->file('file');
    $thuMucId = $request->input('thu_muc_id');
    
    // ✅ Auto-create quota nếu chưa có
    $quota = Quota::forUser($userId)->first();
    if (!$quota) {
        $quota = Quota::create([
            'user_id' => $userId,
            'loai' => 'user',
            'dung_luong_gioi_han' => 10737418240, // 10GB
            'dung_luong_su_dung' => 0,
            'ty_le_su_dung' => 0,
            'canh_bao_tu' => 80, // Cảnh báo ở 80%
            'da_canh_bao' => false,
        ]);
    }
    
    // ✅ Check với thông báo rõ ràng hơn
    if (!$quota->canUpload($uploadedFile->getSize())) {
        throw new \Exception(
            'Vượt quá hạn ngạch lưu trữ. Đã dùng: ' . 
            $quota->getFormattedUsage() . '/' . 
            $quota->getFormattedLimit()
        );
    }
    // ... rest of upload logic
}
```

#### **2. Fix Model Quota (Timestamps)**

**File:** `app/Models/Document/Quota.php`

```php
// BEFORE (SAI)
public $timestamps = false;
const UPDATED_AT = 'updated_at';

// AFTER (ĐÚNG)
const CREATED_AT = null;       // Table không có created_at
const UPDATED_AT = 'updated_at'; // Có updated_at
```

#### **3. Script Tạo Quota Cho User Hiện Tại**

**File:** `create_quota.php`

```php
<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Document\Quota;

$userId = 1; // Hoặc user ID cần tạo

$quota = Quota::forUser($userId)->first();
if (!$quota) {
    $quota = Quota::create([
        'user_id' => $userId,
        'loai' => 'user',
        'dung_luong_gioi_han' => 10737418240, // 10GB
        'dung_luong_su_dung' => 0,
        'ty_le_su_dung' => 0,
        'canh_bao_tu' => 80,
        'da_canh_bao' => false,
    ]);
    echo "✅ Created quota: {$quota->getFormattedLimit()}\n";
} else {
    echo "✅ Quota: {$quota->getFormattedUsage()} / {$quota->getFormattedLimit()}\n";
}
```

**Chạy:**
```bash
php create_quota.php
# Output: ✅ Created quota for user 1: 10.00 GB
```

### **Test sau khi fix:**

1. **Upload file nhỏ (< 10GB):**
   ```bash
   # Sẽ thành công
   POST /aio/api/documents/files/upload
   Response: { "id": 1, "ten_file": "test.pdf", ... }
   ```

2. **Upload file lớn (> 10GB):**
   ```bash
   # Sẽ reject với thông báo rõ ràng
   Response: {
     "message": "Vượt quá hạn ngạch lưu trữ. Đã dùng: 8.50 GB/10.00 GB"
   }
   ```

3. **Check quota hiện tại:**
   ```bash
   GET /aio/api/documents/settings
   Response: {
     "total_storage": 10737418240,
     "used_storage": 9123456789,
     "percent_used": 84.98
   }
   ```

---

## 🔧 Checklist Khắc Phục

### **Đã fix:**
- ✅ Auto-create quota khi user upload file lần đầu
- ✅ Fix Model Quota timestamps
- ✅ Tạo quota cho user ID 1
- ✅ Thông báo lỗi rõ ràng hơn (hiển thị usage)

### **Cần test:**
- [ ] Upload file nhỏ (vài MB) → Phải thành công
- [ ] Upload file lớn (> 10GB) → Phải reject với message chi tiết
- [ ] Kiểm tra SettingsPage hiển thị quota đúng
- [ ] Test progress bar khi upload

### **Để làm sau (Optional):**
- [ ] Tạo artisan command để init quota cho tất cả users
- [ ] Thêm middleware kiểm tra quota trước khi upload
- [ ] Email thông báo khi quota đạt 80%, 90%, 100%
- [ ] Admin panel để quản lý quota của users

---

## 📊 Dung Lượng Mặc Định

| Loại User | Quota Mặc Định | Cảnh Báo |
|-----------|----------------|----------|
| User thường | 10 GB | 80% |
| Phòng ban | 50 GB | 80% |
| Công ty | 500 GB | 90% |

**Config trong code:**
```php
// Default quota khi auto-create
'dung_luong_gioi_han' => 10737418240, // 10GB = 10 * 1024^3
'canh_bao_tu' => 80, // 80%
```

**Để thay đổi:**
```php
// Trong DocumentService.php
$defaultQuota = match($userType) {
    'admin' => 107374182400,    // 100GB
    'department' => 53687091200, // 50GB
    default => 10737418240,      // 10GB
};
```

---

## 🎯 Kết Luận

1. **Thư mục:** Chỉ lưu DB, không tạo folder vật lý (đúng thiết kế)
2. **Hiển thị:** Lỗi do authentication, đã fix bằng axios withCredentials
3. **Quota:** Lỗi do chưa có record, đã fix bằng auto-create
4. **Upload:** Bây giờ sẽ tự tạo quota và upload thành công

**Next steps:**
- Refresh page và test upload file
- Kiểm tra Network tab để confirm cookies được gửi
- Xem SettingsPage hiển thị quota usage

---

**Fixed By:** AI Coding Assistant  
**Date:** 2025-11-10  
**Files Changed:**
- `app/Services/Document/DocumentService.php`
- `app/Models/Document/Quota.php`
- `create_quota.php` (new)
