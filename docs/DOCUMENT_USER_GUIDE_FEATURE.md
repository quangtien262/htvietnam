# Tính Năng Hướng Dẫn Sử Dụng - Document Management

## 📚 Tổng Quan

Đã bổ sung tính năng **Hướng Dẫn Sử Dụng** tích hợp trực tiếp trên giao diện frontend của module Quản lý Tài liệu.

## ✨ Tính Năng Mới

### 1. **Trang User Guide (`UserGuidePage.tsx`)**
   - Giao diện đẹp, thân thiện với người dùng
   - 6 tab chi tiết:
     - 📋 **Tổng Quan**: Giới thiệu module và tính năng
     - 📁 **Quản Lý Thư Mục**: Hướng dẫn tạo, sắp xếp thư mục
     - 📄 **Quản Lý File**: Upload, xem, tải, di chuyển file
     - 🔗 **Chia Sẻ Tài Liệu**: Chia sẻ nội bộ và tạo link công khai
     - ⭐ **Tính Năng Khác**: File sao, gần đây, thùng rác...
     - ❓ **FAQ**: 10+ câu hỏi thường gặp

### 2. **Nút Help Nổi (`DocumentHelpButton.tsx`)**
   - FloatButton góc phải dưới màn hình
   - Click vào chuyển đến trang hướng dẫn
   - Đã tích hợp vào `DocumentExplorerPage`

### 3. **Menu Navigation**
   - Thêm mục "📖 Hướng dẫn sử dụng" vào menu chính
   - Nằm trong nhóm "📁 Quản lý Tài liệu"

## 🗂️ Cấu Trúc File

```
resources/js/
├── pages/document/
│   ├── DocumentExplorerPage.tsx    (Đã thêm DocumentHelpButton)
│   ├── UserGuidePage.tsx           (MỚI - Trang hướng dẫn)
│   ├── StarredPage.tsx
│   ├── RecentPage.tsx
│   ├── TrashPage.tsx
│   ├── SettingsPage.tsx
│   └── ShareLinkPage.tsx
├── components/document/
│   └── DocumentHelpButton.tsx      (MỚI - Nút Help nổi)
├── common/
│   ├── route.tsx                   (Đã thêm documentsUserGuide)
│   ├── menu.jsx                    (Đã thêm menu item)
│   └── api.tsx
└── app.tsx                         (Đã thêm route)
```

## 📍 Routes

**Route Mới**:
```typescript
documentsUserGuide: '/documents/user-guide/'
```

**Đường dẫn đầy đủ**:
```
http://localhost:100/aio/documents/user-guide/
```

## 🎨 UI Components

### UserGuidePage
- **Layout**: Card + Tabs
- **Components**:
  - `Typography`: Title, Paragraph, Text
  - `Steps`: Hướng dẫn từng bước
  - `Alert`: Lưu ý, mẹo
  - `Collapse`: Câu hỏi mở rộng
  - `Tag`: Phân loại quyền, loại thư mục
  - `Divider`: Ngăn cách sections

### DocumentHelpButton
- **Component**: `FloatButton` (Ant Design)
- **Icon**: `QuestionCircleOutlined`
- **Position**: Bottom-right (24px margin)
- **Tooltip**: "Hướng dẫn sử dụng"

## 📖 Nội Dung Hướng Dẫn

### Tab 1: Tổng Quan
- Giới thiệu module
- 5 tính năng chính (Collapse)
- 5 trang chính (Tags)

### Tab 2: Quản Lý Thư Mục
- Tạo thư mục mới (3 bước)
- Loại thư mục: Cá nhân, Phòng ban, Công ty, Dự án
- Cấu trúc cây thư mục (Tree structure)
- Tổ chức và sắp xếp

### Tab 3: Quản Lý File
- Upload file (4 bước)
- Xem trước (Preview)
- Tải xuống (Download)
- Đánh dấu sao (Star)
- Di chuyển & Sao chép
- Xóa & Khôi phục

### Tab 4: Chia Sẻ
- Chia sẻ nội bộ (5 bước)
- Phân quyền: Viewer, Editor, Manager
- Tạo link công khai (4 bước)
- Bảo mật link (mật khẩu, hết hạn, giới hạn)
- Quản lý link đã tạo

### Tab 5: Tính Năng Khác
- File đã gắn sao
- File gần đây
- Thùng rác
  - Khôi phục file trong vòng 30 ngày
  - Xóa vĩnh viễn (permanent delete) - không thể hoàn tác
  - Cảnh báo chi tiết về hành động xóa vĩnh viễn
  - Hướng dẫn khi nào nên xóa vĩnh viễn
- Cài đặt & Quota

### Tab 6: FAQ
10+ câu hỏi thường gặp:
1. Upload nhiều file cùng lúc
2. Dung lượng tối đa
3. Thời gian lưu trữ thùng rác (30 ngày)
4. Khôi phục vs Xóa vĩnh viễn (permanent delete)
5. Phân biệt quyền Viewer/Editor/Manager
6. Xử lý file trùng lặp (hash MD5)
7. Tìm kiếm nhanh
8. Tải xuống thư mục
9. Nhận thông báo
10. Liên hệ hỗ trợ

## 🚀 Cách Sử Dụng

### Truy Cập Trang Hướng Dẫn

**Cách 1**: Qua Menu
```
Sidebar → 📁 Quản lý Tài liệu → 📖 Hướng dẫn sử dụng
```

**Cách 2**: Qua Nút Help Nổi
```
Vào bất kỳ trang Document nào → Click nút Help (?) góc phải dưới
```

**Cách 3**: Trực Tiếp
```
http://localhost:100/aio/documents/user-guide/
```

## 🔧 Tùy Chỉnh

### Thêm Nội Dung Mới

**Thêm Panel vào Collapse**:
```tsx
<Panel header="❓ Câu hỏi mới?" key="11">
    <Paragraph>Nội dung trả lời...</Paragraph>
</Panel>
```

**Thêm Alert**:
```tsx
<Alert
    message="Tiêu đề"
    description="Mô tả chi tiết..."
    type="info|success|warning|error"
    showIcon
/>
```

### Thêm Help Button Vào Pages Khác

**StarredPage.tsx**:
```tsx
import DocumentHelpButton from '../../components/document/DocumentHelpButton';

// Trong return:
<Layout>
    {/* ... content ... */}
    <DocumentHelpButton />
</Layout>
```

## 📊 Thống Kê

- **Tổng số tab**: 6
- **Tổng số bước hướng dẫn**: 20+
- **Tổng số FAQ**: 10
- **Tổng số icons**: 15+
- **File TypeScript**: 2 mới
- **File cập nhật**: 3 (route.tsx, menu.jsx, app.tsx)

## 🎯 Lợi Ích

1. **Giảm thời gian đào tạo**: User tự học qua giao diện
2. **Tăng trải nghiệm**: Hướng dẫn ngay trong ứng dụng
3. **Giảm support**: FAQ trả lời câu hỏi thường gặp
4. **Chuyên nghiệp**: Giao diện đẹp, dễ hiểu

## 📝 Ghi Chú

- Tất cả icons sử dụng Ant Design Icons
- Responsive design, hiển thị tốt trên mobile
- Hỗ trợ dark mode (nếu theme có)
- Có thể xuất PDF từ trang hướng dẫn (future feature)

## 🐛 Known Issues

- Chưa có ảnh minh họa (screenshot) - sẽ bổ sung sau
- Chưa có video hướng dẫn - có thể embed YouTube
- Chưa hỗ trợ đa ngôn ngữ (tiếng Anh, tiếng Việt)

## 🔮 Future Enhancements

- [ ] Thêm ảnh screenshot minh họa
- [ ] Video hướng dẫn tích hợp
- [ ] Export PDF
- [ ] Search trong hướng dẫn
- [ ] Đa ngôn ngữ (i18n)
- [ ] Interactive tutorial (step-by-step guide)
- [ ] Tooltips contextual trên từng component

## 📝 Recent Updates

### Version 1.1.0 (2025-11-10)
- ✅ **Cập nhật chi tiết về Xóa Vĩnh Viễn (Permanent Delete)**
  - Tab "Quản Lý File": Thêm hướng dẫn khôi phục và xóa vĩnh viễn chi tiết
  - Tab "Tính Năng Khác": Mở rộng phần Thùng Rác với Steps và Alert cảnh báo
  - FAQ: Cập nhật câu 3 về thời gian khôi phục và xóa vĩnh viễn
  - Thêm thông tin: File vật lý bị xóa, dung lượng giải phóng ngay lập tức
  - Thêm hướng dẫn khi nào nên sử dụng xóa vĩnh viễn

### Version 1.0.0 (2025-11-10)
- ✅ Release phiên bản đầu tiên
- 6 tab hướng dẫn đầy đủ
- 20+ bước hướng dẫn chi tiết
- 10+ câu hỏi FAQ
- Tích hợp DocumentHelpButton

---

**Version**: 1.1.0  
**Last Updated**: 10/11/2025  
**Author**: AI Coding Assistant

````
