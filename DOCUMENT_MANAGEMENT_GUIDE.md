# Hướng Dẫn Sử Dụng Module Quản Lý Tài Liệu

## Tổng Quan

Module Quản Lý Tài Liệu (Document Management System) cho phép tổ chức, lưu trữ, chia sẻ và quản lý các file tài liệu trong công ty một cách hiệu quả.

---

## 1. Cấu Trúc Database

### Bảng Dữ Liệu

#### 1.1. `tai_lieu_thu_muc` - Quản lý thư mục
- **id**: ID tự động tăng
- **ma_thu_muc**: Mã thư mục (TM0001, TM0002...) - tự động sinh
- **parent_id**: ID thư mục cha (null nếu là thư mục gốc)
- **ten_thu_muc**: Tên thư mục (bắt buộc)
- **mo_ta**: Mô tả thư mục
- **nguoi_tao_id**: ID người tạo (foreign key → admin_users)
- **phong_ban_id**: ID phòng ban (nếu có)
- **is_public**: Public cho toàn công ty (true/false)
- **loai**: Loại thư mục
  - `ca_nhan`: Cá nhân
  - `phong_ban`: Phòng ban
  - `cong_ty`: Công ty
  - `du_an`: Dự án
- **lien_ket_id**: ID liên kết với module khác
- **loai_lien_ket**: Loại liên kết (hop_dong_nhan_vien, don_hang, bao_gia...)
- **thu_tu_sap_xep**: Thứ tự sắp xếp (default: 0)
- **mau_sac**: Màu sắc thư mục (hex color #FF5733)
- **icon**: Tên icon từ Ant Design
- **timestamps**: created_at, updated_at
- **soft_deletes**: deleted_at (xóa mềm)

#### 1.2. `tai_lieu_file` - Quản lý file
- **id**: ID tự động tăng
- **ma_tai_lieu**: Mã tài liệu (TL0001, TL0002...) - tự động sinh
- **thu_muc_id**: ID thư mục chứa file
- **ten_file**: Tên file gốc
- **ten_luu_tru**: Tên file khi lưu trữ (unique)
- **duong_dan**: Đường dẫn file trong storage
- **kich_thuoc**: Kích thước file (bytes)
- **mime_type**: Loại file (application/pdf, image/jpeg...)
- **hash_file**: Hash MD5 của file (kiểm tra trùng lặp)
- **phien_ban**: Số phiên bản hiện tại
- **is_starred**: Đánh dấu sao (true/false)
- **nguoi_tai_len_id**: ID người upload
- **ngay_truy_cap_cuoi**: Thời gian truy cập gần nhất
- **luot_xem**: Số lượt xem
- **luot_tai_xuong**: Số lượt tải xuống
- **mo_ta**: Mô tả file
- **tu_khoa**: Từ khóa tìm kiếm (JSON array)
- **timestamps**: created_at, updated_at
- **soft_deletes**: deleted_at

#### 1.3. `tai_lieu_phien_ban` - Quản lý phiên bản file
- **id**: ID tự động tăng
- **file_id**: ID file gốc
- **so_phien_ban**: Số phiên bản (1, 2, 3...)
- **duong_dan**: Đường dẫn file phiên bản
- **kich_thuoc**: Kích thước
- **nguoi_cap_nhat_id**: ID người cập nhật
- **ghi_chu**: Ghi chú thay đổi
- **timestamps**: created_at

#### 1.4. `tai_lieu_phan_quyen` - Phân quyền truy cập
- **id**: ID tự động tăng
- **loai_doi_tuong**: Loại đối tượng (`file`, `thu_muc`)
- **doi_tuong_id**: ID file hoặc thư mục
- **loai_nguoi_dung**: Loại người dùng (`user`, `phong_ban`, `nhom`)
- **nguoi_dung_id**: ID user/phòng ban/nhóm
- **quyen_truy_cap**: Quyền truy cập
  - `viewer`: Chỉ xem
  - `editor`: Chỉnh sửa
  - `manager`: Quản lý (full quyền)
- **nguoi_chia_se_id**: ID người chia sẻ
- **ngay_het_han**: Ngày hết hạn quyền
- **timestamps**: created_at, updated_at

#### 1.5. `tai_lieu_chia_se_link` - Link chia sẻ công khai
- **id**: ID tự động tăng
- **file_id**: ID file được chia sẻ
- **hash_link**: Hash unique cho link (32 ký tự)
- **mat_khau**: Mật khẩu bảo vệ (nullable, encrypted)
- **ngay_het_han**: Ngày hết hạn link
- **luot_truy_cap**: Số lượt truy cập
- **gioi_han_luot_xem**: Giới hạn số lượt xem
- **cho_phep_tai_xuong**: Cho phép download (true/false)
- **nguoi_tao_id**: ID người tạo link
- **is_active**: Link còn hoạt động (true/false)
- **timestamps**: created_at, updated_at

#### 1.6. `tai_lieu_binh_luan` - Bình luận/Nhận xét
- **id**: ID tự động tăng
- **file_id**: ID file
- **thu_muc_id**: ID thư mục (nullable)
- **user_id**: ID người bình luận
- **parent_id**: ID bình luận cha (reply)
- **noi_dung**: Nội dung bình luận
- **timestamps**: created_at, updated_at
- **soft_deletes**: deleted_at

#### 1.7. `tai_lieu_hoat_dong` - Lịch sử hoạt động
- **id**: ID tự động tăng
- **file_id**: ID file
- **thu_muc_id**: ID thư mục
- **loai_doi_tuong**: Loại đối tượng (`file`, `thu_muc`)
- **user_id**: ID người thực hiện
- **hanh_dong**: Hành động
  - `upload`: Tải lên
  - `download`: Tải xuống
  - `view`: Xem
  - `edit`: Chỉnh sửa
  - `delete`: Xóa (soft delete)
  - `restore`: Khôi phục
  - `permanent_delete`: Xóa vĩnh viễn
  - `share`: Chia sẻ
  - `rename`: Đổi tên
  - `move`: Di chuyển
  - `copy`: Sao chép
- **chi_tiet**: Chi tiết JSON (tên file cũ, mới...)
- **ip_address**: Địa chỉ IP
- **user_agent**: Thông tin trình duyệt
- **created_at**: Thời gian

#### 1.8. `tai_lieu_quota` - Quản lý dung lượng
- **id**: ID tự động tăng
- **loai**: Loại quota (`user`, `phong_ban`, `cong_ty`)
- **doi_tuong_id**: ID user/phòng ban
- **dung_luong_toi_da**: Dung lượng tối đa (bytes)
- **dung_luong_da_dung**: Dung lượng đã sử dụng (bytes)
- **timestamps**: created_at, updated_at

---

## 2. Backend - Laravel Controllers & Services

### 2.1. Controllers

#### **ThuMucController** - Quản lý thư mục
**Namespace**: `App\Http\Controllers\Document\ThuMucController`

**Routes**:
```php
GET    /aio/api/documents/folders                   // Lấy danh sách thư mục tree
POST   /aio/api/documents/folders/store             // Tạo thư mục mới
POST   /aio/api/documents/folders/update/{id}       // Cập nhật thư mục
POST   /aio/api/documents/folders/delete/{id}       // Xóa thư mục (soft delete)
POST   /aio/api/documents/folders/restore/{id}      // Khôi phục từ trash
POST   /aio/api/documents/folders/force-delete/{id} // Xóa vĩnh viễn thư mục
```

**Methods**:
- `index()`: Lấy cấu trúc cây thư mục (root folders + children)
- `store()`: Tạo thư mục mới
  - Validate: ten_thu_muc (required), parent_id, loai, mau_sac, icon
  - Auto-generate: ma_thu_muc, nguoi_tao_id
  - Log activity
- `update()`: Cập nhật thông tin thư mục
- `destroy()`: Soft delete thư mục
- `restore()`: Khôi phục từ trash
- `forceDelete()`: Xóa vĩnh viễn thư mục (hard delete)
  - Xóa đệ quy tất cả file trong thư mục
  - Xóa đệ quy tất cả thư mục con
  - Xóa file vật lý từ storage
  - Xóa record khỏi database (không thể khôi phục)
  - Log activity với thống kê số file/folder đã xóa

#### **FileController** - Quản lý file
**Namespace**: `App\Http\Controllers\Document\FileController`

**Routes**:
```php
GET    /aio/api/documents/files                     // Lấy danh sách file
POST   /aio/api/documents/files/upload              // Upload file
GET    /aio/api/documents/files/download/{id}       // Download file
GET    /aio/api/documents/files/preview/{id}        // Xem trước file
POST   /aio/api/documents/files/star/{id}           // Đánh dấu sao
POST   /aio/api/documents/files/move/{id}           // Di chuyển file
POST   /aio/api/documents/files/copy/{id}           // Sao chép file
POST   /aio/api/documents/files/delete/{id}         // Xóa file (soft delete)
POST   /aio/api/documents/files/restore/{id}        // Khôi phục file
POST   /aio/api/documents/files/force-delete/{id}   // Xóa vĩnh viễn file
GET    /aio/api/documents/files/starred             // Danh sách file đã gắn sao
GET    /aio/api/documents/files/recent              // File truy cập gần đây
GET    /aio/api/documents/files/trash               // Thùng rác
```

**Methods**:
- `index()`: Lấy danh sách file (có thể filter theo thu_muc_id)
- `upload()`: Upload file
  - Validate: file, thu_muc_id
  - Generate: ma_tai_lieu, hash_file, ten_luu_tru
  - Store vào: `storage/app/documents/`
  - Log activity
- `download()`: Tải file xuống
- `preview()`: Xem trước (PDF, images...)
- `toggleStar()`: Bật/tắt đánh dấu sao
- `move()`: Di chuyển file sang thư mục khác
- `copy()`: Tạo bản sao file
- `destroy()`: Soft delete
- `restore()`: Khôi phục
- `forceDelete()`: Xóa vĩnh viễn (hard delete)
  - Xóa file vật lý từ storage
  - Xóa record khỏi database (không thể khôi phục)
  - Log activity trước khi xóa
- `starred()`: Danh sách file đã gắn sao
- `recent()`: File truy cập gần đây (order by ngay_truy_cap_cuoi)
- `trash()`: File đã xóa (soft deleted)

#### **PhanQuyenController** - Quản lý phân quyền
**Namespace**: `App\Http\Controllers\Document\PhanQuyenController`

**Routes**:
```php
GET    /aio/api/documents/permissions                 // Lấy danh sách phân quyền
POST   /aio/api/documents/permissions/share           // Chia sẻ file/folder
POST   /aio/api/documents/permissions/update/{id}     // Cập nhật quyền
POST   /aio/api/documents/permissions/revoke/{id}     // Thu hồi quyền
```

#### **ShareLinkController** - Link chia sẻ công khai
**Namespace**: `App\Http\Controllers\Document\ShareLinkController`

**Routes**:
```php
POST   /aio/api/documents/share-link/create           // Tạo link chia sẻ
GET    /aio/api/documents/share-link                  // Danh sách link
GET    /share/{hash}                                  // Truy cập link public
POST   /aio/api/documents/share-link/revoke/{id}     // Vô hiệu hóa link
```

**Methods**:
- `create()`: Tạo link chia sẻ
  - Generate hash unique 32 ký tự
  - Có thể set: mat_khau, ngay_het_han, gioi_han_luot_xem
- `index()`: Danh sách link đã tạo
- `access()`: Truy cập file qua link public
  - Validate: hash, mat_khau (nếu có)
  - Check: ngay_het_han, gioi_han_luot_xem
  - Tăng luot_truy_cap
- `revoke()`: Vô hiệu hóa link (set is_active = false)

### 2.2. Models

#### **ThuMuc Model**
**Path**: `App\Models\Document\ThuMuc`

**Fillable**:
```php
'ma_thu_muc', 'parent_id', 'ten_thu_muc', 'mo_ta',
'nguoi_tao_id', 'phong_ban_id', 'is_public', 'loai',
'lien_ket_id', 'loai_lien_ket', 'thu_tu_sap_xep',
'mau_sac', 'icon'
```

**Relationships**:
- `parent()`: belongsTo ThuMuc (thư mục cha)
- `children()`: hasMany ThuMuc (thư mục con)
- `files()`: hasMany File
- `nguoiTao()`: belongsTo AdminUser
- `phanQuyens()`: hasMany PhanQuyen
- `binhLuans()`: hasMany BinhLuan
- `hoatDongs()`: hasMany HoatDong

**Scopes**:
- `root()`: whereNull('parent_id')
- `public()`: where('is_public', true)
- `caNhan()`: where('loai', 'ca_nhan')
- `phongBan()`: where('loai', 'phong_ban')

**Accessors**:
- `full_path`: Lấy đường dẫn đầy đủ (Folder A / Folder B / Folder C)

**Boot Events**:
- Auto-generate `ma_thu_muc` khi creating (TM0001, TM0002...)

#### **File Model**
**Path**: `App\Models\Document\File`

**Fillable**: Tương tự như bảng `tai_lieu_file`

**Relationships**:
- `thuMuc()`: belongsTo ThuMuc
- `nguoiTaiLen()`: belongsTo AdminUser
- `phienBans()`: hasMany PhienBan
- `phanQuyens()`: hasMany PhanQuyen
- `shareLin()`: hasMany ShareLink
- `binhLuans()`: hasMany BinhLuan
- `hoatDongs()`: hasMany HoatDong

**Boot Events**:
- Auto-generate `ma_tai_lieu` (TL0001, TL0002...)
- Generate `hash_file` (MD5)

---

## 3. Frontend - React/TypeScript

### 3.1. Pages

#### **DocumentExplorerPage** - Trình duyệt tài liệu chính
**Path**: `resources/js/pages/document/DocumentExplorerPage.tsx`

**Features**:
- Tree view thư mục (bên trái)
- Danh sách file (bên phải)
- Upload file
- Tạo thư mục mới
- Đánh dấu sao file
- Download file
- Chia sẻ file
- Xóa file (chuyển vào trash)

**Components**:
- **DirectoryTree**: Hiển thị cấu trúc cây thư mục
- **Table**: Hiển thị danh sách file với columns:
  - Tên file (có icon, link preview, star)
  - Kích thước
  - Người tải lên
  - Ngày tạo
  - Thao tác (Download, Share, Delete)
- **Modal Upload**: Form upload file
- **Modal Create Folder**: Form tạo thư mục
- **Modal Share**: Form chia sẻ file

#### **StarredPage** - File đã gắn sao
**Path**: `resources/js/pages/document/StarredPage.tsx`

**Features**:
- Hiển thị danh sách file đã đánh dấu sao
- Quick actions: Xem, Download

#### **RecentPage** - File gần đây
**Path**: `resources/js/pages/document/RecentPage.tsx`

**Features**:
- Hiển thị file truy cập gần đây
- Sắp xếp theo thời gian
- Hiển thị số lượt xem

#### **TrashPage** - Thùng rác
**Path**: `resources/js/pages/document/TrashPage.tsx`

**Features**:
- Hiển thị file/folder đã xóa
- Khôi phục file
- Xóa vĩnh viễn (permanent delete)
  - Xóa hoàn toàn file khỏi hệ thống
  - Xóa file vật lý từ storage
  - Không thể khôi phục sau khi xóa vĩnh viễn
  - Có modal xác nhận cảnh báo trước khi xóa

#### **SettingsPage** - Cài đặt & Quota
**Path**: `resources/js/pages/document/SettingsPage.tsx`

**Features**:
- Hiển thị dung lượng đã sử dụng / tối đa
- Biểu đồ dung lượng
- Cài đặt thông báo
- Quản lý phân quyền mặc định

#### **ShareLinkPage** - Truy cập link chia sẻ
**Path**: `resources/js/pages/document/ShareLinkPage.tsx`

**Features**:
- Nhập mật khẩu (nếu có)
- Preview file
- Download file (nếu được phép)
- Hiển thị thông tin file (tên, kích thước, người chia sẻ)

### 3.2. Routes Configuration

**File**: `resources/js/common/route.tsx`

```typescript
// Document Management - Quản lý tài liệu
documentsExplorer: '/documents/explorer/',
documentsStarred: '/documents/starred/',
documentsRecent: '/documents/recent/',
documentsTrash: '/documents/trash/',
documentsSettings: '/documents/settings/',
documentsShare: '/share/',
```

**File**: `resources/js/app.tsx`

```tsx
<Route path={ROUTE.documentsExplorer} element={<DocumentExplorerPage />} />
<Route path={ROUTE.documentsStarred} element={<StarredPage />} />
<Route path={ROUTE.documentsRecent} element={<RecentPage />} />
<Route path={ROUTE.documentsTrash} element={<TrashPage />} />
<Route path={ROUTE.documentsSettings} element={<SettingsPage />} />
<Route path="/share/:hash" element={<ShareLinkPage />} />
```

### 3.3. API Constants

**File**: `resources/js/common/api.tsx`

```typescript
// Thư mục (6 endpoints)
documentFolders: '/aio/api/documents/folders',
documentFolderStore: '/aio/api/documents/folders/store',
documentFolderUpdate: (id: number) => `/aio/api/documents/folders/update/${id}`,
documentFolderDelete: (id: number) => `/aio/api/documents/folders/delete/${id}`,
documentFolderRestore: (id: number) => `/aio/api/documents/folders/restore/${id}`,
documentFolderForceDelete: (id: number) => `/aio/api/documents/folders/force-delete/${id}`,

// File (13 endpoints)
documentFiles: '/aio/api/documents/files',
documentFileUpload: '/aio/api/documents/files/upload',
documentFileDownload: (id: number) => `/aio/api/documents/files/download/${id}`,
documentFilePreview: (id: number) => `/aio/api/documents/files/preview/${id}`,
documentFileStar: (id: number) => `/aio/api/documents/files/star/${id}`,
documentFileMove: (id: number) => `/aio/api/documents/files/move/${id}`,
documentFileCopy: (id: number) => `/aio/api/documents/files/copy/${id}`,
documentFileDelete: (id: number) => `/aio/api/documents/files/delete/${id}`,
documentFileRestore: (id: number) => `/aio/api/documents/files/restore/${id}`,
documentFileForceDelete: (id: number) => `/aio/api/documents/files/force-delete/${id}`,
documentFilesStarred: '/aio/api/documents/files/starred',
documentFilesRecent: '/aio/api/documents/files/recent',
documentFilesTrash: '/aio/api/documents/files/trash',

// Phân quyền (4 endpoints)
documentPermissions: '/aio/api/documents/permissions',
documentPermissionShare: '/aio/api/documents/permissions/share',
documentPermissionUpdate: (id: number) => `/aio/api/documents/permissions/update/${id}`,
documentPermissionRevoke: (id: number) => `/aio/api/documents/permissions/revoke/${id}`,

// Share Link (3 endpoints)
documentShareLinkCreate: '/aio/api/documents/share-link/create',
documentShareLinks: '/aio/api/documents/share-link',
documentShareLinkRevoke: (id: number) => `/aio/api/documents/share-link/revoke/${id}`,
```

### 3.4. Menu Configuration

**File**: `resources/js/common/menu.jsx`

```jsx
docs: [{
    label: '📁 Quản lý Tài liệu',
    icon: <FolderOutlined />,
    children: [
        { 
            label: <Link to={ROUTE.documentsExplorer + '?p=docs'}>📂 Trình duyệt File</Link>,
            icon: <FolderOutlined />
        },
        { 
            label: <Link to={ROUTE.documentsStarred + '?p=docs'}>⭐ File đã gắn sao</Link>,
            icon: <StarOutlined />
        },
        { 
            label: <Link to={ROUTE.documentsRecent + '?p=docs'}>🕒 File gần đây</Link>,
            icon: <ClockCircleOutlined />
        },
        { 
            label: <Link to={ROUTE.documentsTrash + '?p=docs'}>🗑️ Thùng rác</Link>,
            icon: <DeleteOutlined />
        },
        { 
            label: <Link to={ROUTE.documentsSettings + '?p=docs'}>⚙️ Cài đặt & Quota</Link>,
            icon: <SettingOutlined />
        }
    ]
}]
```

---

## 4. Hướng Dẫn Sử Dụng

### 4.1. Quản Lý Thư Mục

#### Tạo Thư Mục Mới
1. Vào **Quản lý Tài liệu → Trình duyệt File**
2. Click nút **"+ Thư mục mới"**
3. Nhập thông tin:
   - **Tên thư mục** (bắt buộc)
   - **Loại**: Cá nhân, Phòng ban, Công ty, Dự án
   - **Màu sắc**: Chọn màu để dễ phân biệt
   - **Mô tả** (tùy chọn)
4. Click **OK** để tạo

#### Tổ Chức Thư Mục
- **Thư mục con**: Click vào thư mục cha trước khi tạo thư mục mới
- **Sắp xếp**: Kéo thả để thay đổi thứ tự
- **Màu sắc**: Dùng màu để phân loại (Đỏ: Quan trọng, Xanh: Hoàn thành...)

### 4.2. Quản Lý File

#### Upload File
1. Chọn thư mục đích (hoặc để trống cho thư mục gốc)
2. Click **"Tải file lên"**
3. Chọn file từ máy tính
4. File sẽ được upload và hiển thị trong danh sách

**Lưu ý**:
- Kiểm tra dung lượng còn lại trước khi upload
- File lớn có thể mất thời gian upload
- Hệ thống tự động tạo mã tài liệu (TL0001, TL0002...)

#### Xem File
- **Preview**: Click vào tên file để xem trước (PDF, images...)
- **Download**: Click icon Download hoặc menu → Tải xuống

#### Đánh Dấu Sao
- Click icon ⭐ bên cạnh tên file
- File sẽ xuất hiện trong **"File đã gắn sao"**

#### Di Chuyển / Sao Chép File
1. Click menu **"..."** bên file
2. Chọn **Di chuyển** hoặc **Sao chép**
3. Chọn thư mục đích
4. Xác nhận

#### Xóa File
1. Click menu **"..."** → **Xóa**
2. File sẽ chuyển vào **Thùng rác**
3. Có thể khôi phục trong vòng 30 ngày

### 4.3. Chia Sẻ File

#### Chia Sẻ Nội Bộ (Với Người Dùng)
1. Click icon **Chia sẻ** bên file
2. Chọn **Loại người dùng**:
   - User cụ thể
   - Phòng ban
   - Nhóm người dùng
3. Chọn **Quyền truy cập**:
   - **Viewer**: Chỉ xem
   - **Editor**: Chỉnh sửa
   - **Manager**: Quản lý full quyền
4. Tùy chọn: Đặt ngày hết hạn
5. Click **Chia sẻ**

#### Tạo Link Chia Sẻ Công Khai
1. Click icon **Chia sẻ** → Tab **Link công khai**
2. Cấu hình:
   - **Mật khẩu** (tùy chọn): Bảo vệ link
   - **Ngày hết hạn**: Link tự vô hiệu sau ngày này
   - **Giới hạn lượt xem**: Tối đa bao nhiêu lượt
   - **Cho phép tải xuống**: Bật/tắt
3. Click **Tạo link**
4. Copy link và gửi cho người nhận

**Link chia sẻ có dạng**:
```
http://domain.com/share/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 4.4. File Đã Gắn Sao
- Xem nhanh các file quan trọng
- Không bị ảnh hưởng khi di chuyển file
- Bỏ sao: Click icon ⭐ lần nữa

### 4.5. File Gần Đây
- Hiển thị file đã truy cập gần đây
- Sắp xếp theo thời gian
- Hiển thị số lượt xem

### 4.6. Thùng Rác

#### Xem File/Folder Đã Xóa
- Vào **Quản lý Tài liệu → Thùng rác**
- Hiển thị danh sách file/folder đã xóa (soft deleted)
- File trong thùng rác được giữ trong 30 ngày

#### Khôi Phục File
1. Tìm file cần khôi phục trong thùng rác
2. Click nút **"Khôi phục"**
3. File sẽ được đưa về vị trí ban đầu

#### Xóa Vĩnh Viễn
**⚠️ CẢNH BÁO**: Thao tác này không thể hoàn tác!

1. Tìm file cần xóa vĩnh viễn
2. Click nút **"Xóa vĩnh viễn"** (màu đỏ)
3. Đọc cảnh báo: *"File sẽ bị xóa hoàn toàn và không thể khôi phục!"*
4. Click **"Xóa vĩnh viễn"** để xác nhận

**Lưu ý**:
- File sẽ bị xóa hoàn toàn khỏi hệ thống
- File vật lý trong storage cũng bị xóa
- Dung lượng sẽ được giải phóng ngay lập tức
- Không có cách nào khôi phục sau khi xóa vĩnh viễn
- Hành động được ghi log với loại `permanent_delete`

**Khi nào nên xóa vĩnh viễn**:
- Cần giải phóng dung lượng ngay lập tức
- File chứa thông tin nhạy cảm cần xóa hoàn toàn
- Chắc chắn 100% không cần file nữa

### 4.7. Cài Đặt & Quota
- **Dung lượng**: Xem dung lượng đã dùng / tối đa
- **Biểu đồ**: Phân tích dung lượng theo loại file
- **Thông báo**: Cài đặt nhận thông báo khi có người chia sẻ

---

## 5. Quy Trình Làm Việc (Workflow)

### 5.1. Quy Trình Upload & Chia Sẻ Tài Liệu

```
1. Upload file
   ↓
2. Tự động tạo mã TL0001
   ↓
3. Tính hash MD5 (kiểm tra trùng)
   ↓
4. Lưu vào storage/app/documents/
   ↓
5. Log hoạt động "upload"
   ↓
6. Chia sẻ với người khác (nếu cần)
   ↓
7. Hoặc tạo link công khai
```

### 5.2. Quy Trình Phân Quyền

```
1. Owner tạo file → Full quyền
   ↓
2. Chia sẻ với User A → Viewer (chỉ xem)
   ↓
3. Chia sẻ với User B → Editor (chỉnh sửa)
   ↓
4. User B chỉnh sửa → Tạo phiên bản mới
   ↓
5. Log hoạt động "edit"
```

### 5.3. Quy Trình Quản Lý Phiên Bản

```
1. File gốc: v1.0
   ↓
2. User chỉnh sửa → Upload file mới
   ↓
3. Hệ thống tạo phiên bản v2.0
   ↓
4. Lưu file cũ vào tai_lieu_phien_ban
   ↓
5. File chính là phiên bản mới nhất
```

---

## 6. API Reference

### 6.1. Folder APIs

#### GET /aio/api/documents/folders
**Mô tả**: Lấy cấu trúc cây thư mục

**Query Parameters**:
- `loai` (optional): ca_nhan | phong_ban | cong_ty | du_an
- `is_public` (optional): true | false

**Response**:
```json
[
  {
    "id": 1,
    "ma_thu_muc": "TM0001",
    "ten_thu_muc": "Hợp đồng",
    "parent_id": null,
    "loai": "cong_ty",
    "mau_sac": "#FF5733",
    "children": [
      {
        "id": 2,
        "ma_thu_muc": "TM0002",
        "ten_thu_muc": "Hợp đồng 2024",
        "parent_id": 1,
        "children": []
      }
    ]
  }
]
```

#### POST /aio/api/documents/folders/store
**Mô tả**: Tạo thư mục mới

**Request Body**:
```json
{
  "ten_thu_muc": "Tài liệu kỹ thuật",
  "parent_id": 5,
  "loai": "phong_ban",
  "mau_sac": "#1890ff",
  "mo_ta": "Lưu trữ tài liệu kỹ thuật dự án"
}
```

**Response**:
```json
{
  "id": 10,
  "ma_thu_muc": "TM0010",
  "ten_thu_muc": "Tài liệu kỹ thuật",
  "created_at": "2025-11-10T06:30:00.000000Z"
}
```

### 6.2. File APIs

#### POST /aio/api/documents/files/upload
**Mô tả**: Upload file

**Request** (multipart/form-data):
```
file: [File]
thu_muc_id: 5
mo_ta: "Báo cáo tháng 11"
```

**Response**:
```json
{
  "id": 100,
  "ma_tai_lieu": "TL0100",
  "ten_file": "bao-cao-thang-11.pdf",
  "kich_thuoc": 2048576,
  "mime_type": "application/pdf",
  "created_at": "2025-11-10T07:00:00.000000Z"
}
```

#### GET /aio/api/documents/files/download/{id}
**Mô tả**: Download file

**Response**: Binary file stream

#### POST /aio/api/documents/files/star/{id}
**Mô tả**: Bật/tắt đánh dấu sao

**Response**:
```json
{
  "is_starred": true
}
```

### 6.3. Share Link APIs

#### POST /aio/api/documents/share-link/create
**Mô tả**: Tạo link chia sẻ công khai

**Request Body**:
```json
{
  "file_id": 100,
  "mat_khau": "abc123",
  "ngay_het_han": "2025-12-31",
  "gioi_han_luot_xem": 50,
  "cho_phep_tai_xuong": true
}
```

**Response**:
```json
{
  "id": 20,
  "hash_link": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "url": "http://domain.com/share/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "created_at": "2025-11-10T08:00:00.000000Z"
}
```

---

## 7. Troubleshooting

### 7.1. Không Upload Được File

**Nguyên nhân**:
- Vượt quá dung lượng quota
- File quá lớn (max upload size)
- Thiếu quyền write folder storage

**Giải pháp**:
1. Check quota: `php artisan tinker` → `User::find(1)->quota`
2. Tăng `upload_max_filesize` trong php.ini
3. Set permission: `chmod -R 775 storage/app/documents`

### 7.2. Tree Không Hiển Thị

**Nguyên nhân**:
- API không trả về data
- Lỗi serialize khi load relationship

**Giải pháp**:
1. Check API response trong Console (F12)
2. Xem log: `tail -f storage/logs/laravel.log`
3. Clear cache: `php artisan cache:clear`

### 7.3. Link Chia Sẻ Không Hoạt Động

**Nguyên nhân**:
- Link đã hết hạn
- Vượt quá giới hạn lượt xem
- Link đã bị vô hiệu hóa

**Giải pháp**:
1. Check trong database: `SELECT * FROM tai_lieu_chia_se_link WHERE hash_link = '...'`
2. Xem `ngay_het_han`, `gioi_han_luot_xem`, `is_active`
3. Tạo link mới nếu cần

---

## 8. Best Practices

### 8.1. Tổ Chức Thư Mục
- Dùng cấu trúc rõ ràng: Công ty → Phòng ban → Dự án → Loại tài liệu
- Đặt tên thư mục ngắn gọn, dễ hiểu
- Dùng màu sắc để phân loại (Đỏ: Khẩn cấp, Xanh: Hoàn thành...)

### 8.2. Đặt Tên File
- Dùng tên mô tả: `bao-cao-tai-chinh-thang-11-2024.pdf`
- Tránh ký tự đặc biệt: `! @ # $ % ^ & *`
- Dùng số phiên bản: `tai-lieu-v1.0.docx`, `tai-lieu-v2.0.docx`

### 8.3. Phân Quyền
- Chỉ cấp quyền cần thiết (Principle of Least Privilege)
- Đặt ngày hết hạn cho quyền tạm thời
- Review định kỳ danh sách phân quyền

### 8.4. Bảo Mật
- Dùng mật khẩu cho link chia sẻ quan trọng
- Giới hạn lượt xem link công khai
- Không chia sẻ tài liệu nhạy cảm qua link công khai

### 8.5. Quản Lý Dung Lượng
- Định kỳ xóa file không cần thiết
- Nén file trước khi upload
- Dùng tính năng phiên bản để tiết kiệm dung lượng

---

## 9. Changelog

### Version 1.0.0 (2025-11-10)
- ✅ Tạo cấu trúc database (8 tables)
- ✅ Tạo models với relationships
- ✅ Tạo controllers (ThuMuc, File, PhanQuyen, ShareLink)
- ✅ Tạo 6 trang frontend (Explorer, Starred, Recent, Trash, Settings, ShareLink)
- ✅ Đăng ký 30 API endpoints (thêm 2 endpoints force-delete)
- ✅ Tích hợp menu và routes
- ✅ Fix lỗi route prefix (double /api)
- ✅ Fix lỗi foreign key constraint
- ✅ Fix lỗi serialize JSON response
- ✅ Tính năng xóa vĩnh viễn (permanent delete)
  - Backend: FileController::forceDelete(), ThuMucController::forceDelete()
  - Frontend: TrashPage UI với modal xác nhận
  - Database: Thêm 'permanent_delete' vào enum hanh_dong
  - Xóa file vật lý từ storage
  - Xóa đệ quy thư mục con và file
- ⏳ Chưa hoàn thiện: Quản lý phiên bản file (API chưa implement)

---

## 10. Liên Hệ & Hỗ Trợ

**Developer**: AI Coding Assistant  
**Project**: Web AIO - Document Management Module  
**Version**: 1.0.0  
**Last Updated**: 10/11/2025  

**Technical Stack**:
- Backend: Laravel 11
- Frontend: React 18 + TypeScript + Vite
- UI Framework: Ant Design 5
- Database: MySQL 8

---

_Tài liệu này sẽ được cập nhật liên tục khi có thêm tính năng mới._
