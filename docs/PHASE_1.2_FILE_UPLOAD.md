# Phase 1.2: File Upload & Management

## 🎯 Tổng quan
Chức năng upload, quản lý và tải xuống file đính kèm cho tasks trong hệ thống quản lý dự án.

---

## ✅ Đã hoàn thành

### 1. Backend API

#### Database
- ✅ Table `pro___task_attachments` đã tồn tại với đầy đủ fields
- ✅ Relationships thiết lập giữa Task và TaskAttachment

#### Model (TaskAttachment.php)
```php
// Helper methods
getFormattedSizeAttribute()  // Hiển thị "2.5 MB", "120 KB"
getExtensionAttribute()       // Trả về "pdf", "jpg", etc.

// Relationships
task()      // BelongsTo Task
uploader()  // BelongsTo AdminUser
```

#### Service (TaskService.php)
```php
uploadAttachment($taskId, UploadedFile $file)
// - Store file vào storage/app/project_attachments
// - Tạo TaskAttachment record
// - Log activity
// - Return attachment with uploader

deleteAttachment($attachmentId)
// - Delete file từ storage
// - Delete DB record
// - Log activity
```

#### Controller (TaskController.php)
```php
POST   /tasks/{id}/attachments       -> uploadAttachment()
GET    /attachments/{id}/download    -> downloadAttachment()
DELETE /attachments/{id}              -> deleteAttachment()
```

**Validation:**
- Max file size: 10MB
- Multipart form data required

---

### 2. Frontend UI

#### API Client (projectApi.tsx)
```typescript
uploadAttachment(taskId, formData)    // Upload file
downloadAttachment(attachmentId)      // Download với blob response
deleteAttachment(attachmentId)         // Xóa file
```

#### TaskDetail Component
**Thêm Tab "Files"** sau tab Comments:
- Upload button với file picker
- File list với icon theo loại file
- Download và delete actions
- Hiển thị thông tin: size, uploader, time

**File Icons:**
- 📄 PDF → FilePdfOutlined (red)
- 🖼️ Images → FileImageOutlined (green)  
- 📝 Word → FileWordOutlined (blue)
- 📊 Excel → FileExcelOutlined (green)
- 📁 Default → FileOutlined (gray)

#### TypeScript Types
```typescript
interface TaskAttachment {
    id: number;
    task_id: number;
    ten_file: string;
    duong_dan: string;
    loai_file?: string;
    kich_thuoc?: number;
    uploaded_by?: number;
    uploader?: AdminUser;
    formatted_size?: string;  // "2.5 MB"
    extension?: string;        // "pdf"
    created_at?: string;
    updated_at?: string;
}
```

---

## 🔧 Cách sử dụng

### Upload File
1. Mở Task Detail drawer
2. Click tab "Files"
3. Click button "Tải file lên"
4. Chọn file từ máy tính (max 10MB)
5. File tự động upload và hiển thị trong danh sách

### Download File
1. Trong danh sách files, click icon Download
2. File sẽ tự động tải xuống với tên gốc

### Delete File
1. Click icon Delete (thùng rác đỏ)
2. Xác nhận trong popup
3. File xóa khỏi storage và database

---

## 📋 API Endpoints

### Upload Attachment
```
POST /api/admin/project/tasks/{taskId}/attachments
Content-Type: multipart/form-data

Body:
- file: File (required, max 10MB)

Response:
{
    "success": true,
    "message": "Tải file thành công",
    "data": {
        "id": 1,
        "task_id": 5,
        "ten_file": "document.pdf",
        "duong_dan": "project_attachments/1678901234_document.pdf",
        "loai_file": "application/pdf",
        "kich_thuoc": 2621440,
        "uploaded_by": 1,
        "formatted_size": "2.5 MB",
        "extension": "pdf",
        "uploader": {
            "id": 1,
            "name": "Admin User"
        },
        "created_at": "2025-01-15T10:30:00Z"
    }
}
```

### Download Attachment
```
GET /api/admin/project/attachments/{id}/download

Response:
Binary file stream with headers:
Content-Disposition: attachment; filename="original_filename.pdf"
```

### Delete Attachment
```
DELETE /api/admin/project/attachments/{id}

Response:
{
    "success": true,
    "message": "Xóa file thành công"
}
```

---

## 🎨 UI/UX Features

### File List Display
- Avatar với icon theo loại file
- Tên file đầy đủ
- Metadata: Size + Uploader + Time
- Actions: Download & Delete

### Upload Experience
- Loading state khi đang upload
- Success/error messages
- Tự động reload danh sách sau upload
- Native file picker

### Responsive
- Tab counter hiển thị số lượng files
- Empty state khi chưa có file

---

## 🔐 Security & Validation

### Backend
- ✅ File size limit: 10MB
- ✅ Auth required (admin_users guard)
- ✅ Transaction wrapping
- ✅ File existence check trước khi delete
- ✅ Activity logging

### Storage
- Folder: `storage/app/project_attachments/`
- Filename format: `{timestamp}_{original_name}`
- Laravel Storage facade (support multiple disks)

---

## 📊 Database Schema

```sql
CREATE TABLE pro___task_attachments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_id BIGINT NOT NULL,
    ten_file VARCHAR(255) NOT NULL,
    duong_dan VARCHAR(500) NOT NULL,
    loai_file VARCHAR(100),
    kich_thuoc BIGINT,
    uploaded_by BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (task_id) REFERENCES pro___tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES admin_users(id) ON DELETE SET NULL
);
```

---

## 🧪 Testing Checklist

- [ ] Upload file PDF
- [ ] Upload file ảnh (JPG, PNG)
- [ ] Upload file Word/Excel
- [ ] Upload file lớn (>10MB) → Expect validation error
- [ ] Download file đã upload
- [ ] Delete file → File biến mất khỏi storage
- [ ] Kiểm tra icon hiển thị đúng theo loại file
- [ ] Kiểm tra formatted size hiển thị chính xác
- [ ] Upload nhiều files liên tiếp
- [ ] Refresh page → Files vẫn hiển thị

---

## 🐛 Known Issues & Limitations

1. **Chưa có**: Preview file (ảnh, PDF) trực tiếp trong UI
2. **Chưa có**: Drag & drop upload
3. **Chưa có**: Multiple file upload cùng lúc
4. **Chưa có**: File type validation (accept specific extensions)
5. **Chưa có**: Progress bar cho file lớn

Các tính năng trên có thể bổ sung trong các phase sau nếu cần.

---

## 📁 Files Changed

### Backend
- `app/Models/Project/TaskAttachment.php` - Added helper methods
- `app/Services/Project/TaskService.php` - Added upload/delete methods
- `app/Http/Controllers/Project/TaskController.php` - Added endpoints
- `routes/project_route.php` - Added 3 routes

### Frontend
- `resources/js/pages/project/TaskDetail.tsx` - Added Attachments tab
- `resources/js/common/api/projectApi.tsx` - Added API methods
- `resources/js/types/project.ts` - Updated TaskAttachment type

---

**Status:** ✅ **COMPLETED**  
**Date:** January 15, 2025  
**Next Phase:** Phase 1.3 - Time Tracking UI
