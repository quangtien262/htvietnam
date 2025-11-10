# Các Tính Năng Mới - Document Management System

**Ngày cập nhật:** 10/11/2025  
**Phiên bản:** 2.1  

---

## 📋 TỔNG QUAN

Đã bổ sung các tính năng nâng cao cho module Quản lý Tài liệu, tập trung vào trải nghiệm người dùng và hiệu suất làm việc.

---

## ✨ CÁC TÍNH NĂNG MỚI

### **1. Context Menu cho File (7 Options)** ✅

**Cách sử dụng:** Click chuột phải vào file trong danh sách

**Các tùy chọn:**

1. 👁️ **Xem trước** - Mở modal xem trước file (image/PDF)
2. ⬇️ **Tải xuống** - Download file về máy
3. ⭐ **Gắn sao / Bỏ gắn sao** - Đánh dấu file quan trọng
4. 📝 **Đổi tên** - Đổi tên file (modal)
5. 📋 **Sao chép (Copy)** - Copy file vào clipboard
6. ✂️ **Cắt (Cut)** - Cut file vào clipboard (di chuyển)
7. 🔗 **Chia sẻ** - Chia sẻ file với người khác
8. 🗑️ **Xóa** - Chuyển file vào thùng rác

**Dropdown Menu:**  
Cũng có sẵn trong cột "Thao tác" với icon 3 chấm dọc.

---

### **2. Context Menu cho Folder** ✅

**Cách sử dụng:** Click chuột phải vào thư mục trong cây thư mục (sidebar)

**Các tùy chọn:**

1. 📝 **Đổi tên thư mục** - Mở modal đổi tên với validation
2. 📋 **Dán (X file)** - Hiện khi có file trong clipboard
   - Hiển thị số lượng file và action (Copy/Cut)
3. 🗑️ **Xóa thư mục** - Xóa thư mục và toàn bộ nội dung

**Lưu ý:**
- Option "Dán" chỉ xuất hiện khi đã copy/cut file trước đó
- Hiển thị động số lượng file trong clipboard

---

### **3. Clipboard System (Copy/Cut + Paste)** ✅

**Workflow:**

```
1. COPY/CUT FILE:
   - Click chuột phải vào file
   - Chọn "Sao chép (Copy)" hoặc "Cắt (Cut)"
   - File được lưu vào clipboard
   - Hiển thị badge trong header: "📋 Copied" hoặc "✂️ Cut"

2. PASTE FILE:
   - Click chuột phải vào thư mục đích
   - Chọn "Dán (X file) - Copy/Cut"
   - File được copy/move tới thư mục đích
   
3. CANCEL:
   - Copy: Clipboard không tự xóa
   - Cut: Clipboard tự xóa sau khi paste
```

**UI Feedback:**

```tsx
// Badge hiển thị trong header
{clipboard && (
    <Badge count={3} showZero>
        <Tag color="blue">📋 Copied</Tag>
    </Badge>
)}
```

**Logic xử lý:**

- **Copy:** Tạo bản sao file mới, giữ nguyên file gốc
- **Cut:** Di chuyển file, xóa khỏi vị trí cũ
- Hỗ trợ nhiều file (array of files)

---

### **4. Drag & Drop File vào Folder** ✅

**Cách sử dụng:**

1. Kéo file từ bảng danh sách
2. Thả vào thư mục trong sidebar
3. File tự động di chuyển

**Visual Feedback:**

```css
/* File đang kéo */
opacity: 0.5
cursor: grab

/* Folder đang hover */
background: #e6f7ff
border: 2px dashed #1890ff
```

**Drop Zones:**

- **Thư mục gốc:** Box đặc biệt ở đầu sidebar
- **Các thư mục con:** Mỗi item trong tree

**Implementation:**

```tsx
// File row
onRow={(record) => ({
    draggable: true,
    onDragStart: (e) => handleDragStart(e, record)
})}

// Folder node
onDragOver={(e) => handleDragOver(e, folder.id)}
onDrop={(e) => handleDrop(e, folder.id)}
```

---

### **5. Kiểm Tra Tên Thư Mục Trùng Lặp** ✅

**Khi tạo thư mục mới:**

```tsx
const isDuplicate = folders.some(
    f => f.ten_thu_muc === values.ten_thu_muc && 
         f.parent_id === selectedFolder
);

if (isDuplicate) {
    message.error('Tên thư mục đã tồn tại');
    return;
}
```

**Khi đổi tên thư mục:**

```tsx
// Form validation
rules={[
    { required: true },
    {
        validator: async (_, value) => {
            const isDuplicate = folders.some(
                f => f.ten_thu_muc === value && 
                     f.id !== selectedFolderForAction?.id
            );
            if (isDuplicate) throw new Error('Tên thư mục đã tồn tại');
        }
    }
]}
```

**Scope kiểm tra:**
- Cùng cấp thư mục (parent_id)
- Không kiểm tra tên trùng ở các cấp khác nhau

---

### **6. Modal Đổi Tên Thư Mục** ✅

**UI:**

```tsx
<Modal title="Đổi tên thư mục">
    <Form.Item 
        name="ten_thu_muc"
        rules={[
            { required: true },
            { validator: checkDuplicate }
        ]}
    >
        <Input 
            prefix={<FolderOutlined />}
            placeholder="Nhập tên thư mục..."
        />
    </Form.Item>
</Modal>
```

**Features:**
- Auto-fill tên hiện tại
- Real-time validation
- Icon prefix
- Error message rõ ràng

---

## 🎨 UI/UX IMPROVEMENTS

### **Header Badge (Clipboard Info)**

```tsx
<Space size={12}>
    <Text>128 file</Text>
    {clipboard && (
        <Badge count={clipboard.files.length}>
            <Tag color={clipboard.action === 'copy' ? 'blue' : 'orange'}>
                {clipboard.action === 'copy' ? '📋 Copied' : '✂️ Cut'}
            </Tag>
        </Badge>
    )}
</Space>
```

**Màu sắc:**
- Copy: Blue (`#1890ff`)
- Cut: Orange (`#fa8c16`)

### **Drag & Drop Visual States**

| State | Background | Border | Opacity |
|-------|-----------|--------|---------|
| Normal | transparent | transparent | 1.0 |
| Dragging (file) | - | - | 0.5 |
| Drop target | #e6f7ff | 2px dashed #1890ff | 1.0 |

### **Context Menu Styling**

```css
.context-menu {
    min-width: 180px;
    box-shadow: 0 3px 6px rgba(0,0,0,0.12);
    border-radius: 4px;
}

.context-menu-item:hover {
    background: #f5f5f5;
    transition: background 0.2s;
}

.context-menu-item-danger:hover {
    background: #fff1f0;
    color: #ff4d4f;
}
```

---

## 🔧 TECHNICAL DETAILS

### **New State Variables**

```tsx
// Clipboard
const [clipboard, setClipboard] = useState<{
    files: FileItem[];
    action: 'copy' | 'cut';
} | null>(null);

// Folder context menu
const [folderContextMenu, setFolderContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    folder: FolderItem | null;
}>({ ... });

// Drag & drop
const [draggedFile, setDraggedFile] = useState<FileItem | null>(null);
const [dropTargetFolder, setDropTargetFolder] = useState<number | null>(null);

// Rename folder
const [renameFolderModalVisible, setRenameFolderModalVisible] = useState(false);
const [selectedFolderForAction, setSelectedFolderForAction] = useState<FolderItem | null>(null);
```

### **New Handlers**

```tsx
// Clipboard operations
handleCopyToClipboard(files: FileItem[])
handleCutToClipboard(files: FileItem[])
handlePasteToFolder(folderId: number | null)

// Folder operations
handleRenameFolder(values: any)
handleDeleteFolder(folderId: number)

// Drag & drop
handleDragStart(e: DragEvent, file: FileItem)
handleDragOver(e: DragEvent, folderId: number | null)
handleDragLeave()
handleDrop(e: DragEvent, folderId: number | null)
```

### **API Endpoints Used**

```tsx
// Existing
API.documentFolderUpdate(id)  // POST /documents/folders/update/{id}
API.documentFolderDelete(id)  // DELETE /documents/folders/delete/{id}
API.documentFileMove(id)       // POST /documents/files/move/{id}
API.documentFileCopy(id)       // POST /documents/files/copy/{id}

// All endpoints already exist in backend
```

---

## 📊 FEATURE COMPARISON

### **Before vs After**

| Feature | Before | After |
|---------|--------|-------|
| File context menu | 5 options | **8 options** |
| Folder context menu | ❌ None | ✅ **3 options** |
| Copy/Paste system | ❌ None | ✅ **Full clipboard** |
| Drag & drop | ❌ None | ✅ **Full support** |
| Duplicate check | ❌ None | ✅ **Real-time validation** |
| Rename folder | ❌ None | ✅ **Modal + validation** |

---

## 🎯 USER WORKFLOWS

### **Workflow 1: Copy Multiple Files**

```
1. Right-click file A → "Sao chép (Copy)"
2. Right-click file B → "Sao chép (Copy)"
   ❌ WRONG: Clipboard chỉ lưu 1 file

✅ CORRECT:
1. Implement multi-select (future feature)
2. Select files A, B, C
3. Right-click → "Sao chép (Copy)"
4. Right-click folder → "Dán (3 file) - Copy"
```

**Note:** Hiện tại chỉ hỗ trợ copy/cut từng file một.

### **Workflow 2: Organize Files with Drag & Drop**

```
1. View all files in root folder
2. Drag "Report_2024.pdf" to "Documents" folder
3. File tự động di chuyển
4. No need to click "Di chuyển" option
```

**Advantages:**
- Nhanh hơn dropdown menu
- Trực quan hơn
- Ít click hơn

### **Workflow 3: Rename Folder**

```
1. Right-click folder "Dự án A"
2. Select "Đổi tên thư mục"
3. Enter "Dự án Alpha"
4. Click "Đổi tên"
5. ❌ Nếu tên trùng → Error message
6. ✅ Nếu tên hợp lệ → Success + reload tree
```

---

## 🐛 KNOWN LIMITATIONS

### **1. Multi-Select**
- ❌ Chưa hỗ trợ chọn nhiều file cùng lúc
- 💡 Workaround: Copy/cut từng file một

### **2. Clipboard Persistence**
- ❌ Clipboard mất khi refresh page
- 💡 Future: Lưu vào localStorage

### **3. Drag Multiple Files**
- ❌ Chỉ kéo được 1 file tại một thời điểm
- 💡 Future: Drag multi-selected files

### **4. Undo/Redo**
- ❌ Không có tính năng undo sau khi move/delete
- 💡 Future: Implement action history

---

## 🚀 FUTURE ENHANCEMENTS

### **Priority 1 (High):**
1. ✅ Multi-select files (Checkbox column)
2. ✅ Batch operations (Copy/Move/Delete nhiều file)
3. ✅ Keyboard shortcuts (Ctrl+C/V/X)
4. ✅ Breadcrumb navigation

### **Priority 2 (Medium):**
1. Sort folders (drag to reorder, sort by name/date)
2. Folder color picker (custom colors)
3. Clipboard persistence (localStorage)
4. Undo/Redo stack

### **Priority 3 (Low):**
1. Drag files between windows
2. Preview on hover
3. Quick actions toolbar
4. Recent folders list

---

## 📝 TESTING CHECKLIST

### **Context Menu - File**
- [ ] Right-click file → All 8 options visible
- [ ] "Xem trước" → Modal opens
- [ ] "Tải xuống" → File downloads
- [ ] "Gắn sao" → Star toggles
- [ ] "Đổi tên" → Modal opens with current name
- [ ] "Sao chép" → Clipboard badge appears (blue)
- [ ] "Cắt" → Clipboard badge appears (orange)
- [ ] "Chia sẻ" → Share modal opens
- [ ] "Xóa" → Confirmation dialog

### **Context Menu - Folder**
- [ ] Right-click folder → Menu appears
- [ ] "Đổi tên thư mục" → Modal opens
- [ ] Enter duplicate name → Error shows
- [ ] Enter valid name → Success message
- [ ] "Dán" option only shows when clipboard has files
- [ ] "Dán" shows correct count and action
- [ ] "Xóa thư mục" → Confirmation dialog

### **Clipboard System**
- [ ] Copy file → Badge shows "📋 Copied (1)"
- [ ] Cut file → Badge shows "✂️ Cut (1)"
- [ ] Right-click folder → "Dán" option visible
- [ ] Paste after Copy → File duplicated
- [ ] Paste after Cut → File moved + clipboard cleared

### **Drag & Drop**
- [ ] Drag file → Opacity changes to 0.5
- [ ] Hover over folder → Blue dashed border
- [ ] Drop on folder → File moves
- [ ] Drop on root → File moves to root
- [ ] Drag leave → Border disappears

### **Validation**
- [ ] Create folder with existing name → Error
- [ ] Rename folder to existing name → Error
- [ ] Create folder with unique name → Success
- [ ] Rename folder to unique name → Success

---

## 💻 CODE SNIPPETS

### **Add Custom Option to File Context Menu**

```tsx
// In context menu div
<div
    style={{ padding: '8px 16px', cursor: 'pointer' }}
    onClick={() => {
        // Your custom logic here
        console.log('Custom action', contextMenu.record);
        setContextMenu({ visible: false, x: 0, y: 0, record: null });
    }}
>
    <YourIcon style={{ marginRight: 8 }} />
    Your Custom Action
</div>
```

### **Add Custom Folder Action**

```tsx
// In folder context menu
<div
    style={{ padding: '8px 16px', cursor: 'pointer' }}
    onClick={() => {
        // Custom folder action
        console.log('Folder action', folderContextMenu.folder);
        setFolderContextMenu({ visible: false, x: 0, y: 0, folder: null });
    }}
>
    <YourIcon style={{ marginRight: 8 }} />
    Custom Folder Action
</div>
```

---

## 📞 SUPPORT

**Nếu gặp lỗi:**
1. Check console log
2. Verify API endpoint exists
3. Check permissions
4. Review error message

**Common Issues:**

| Issue | Solution |
|-------|----------|
| Context menu không hiện | Check `onContextMenu` event |
| Paste không hoạt động | Verify clipboard state |
| Drag không work | Check `draggable={true}` |
| Validation fails | Check duplicate logic |

---

**Cập nhật lần cuối:** 10/11/2025  
**Tác giả:** AI Assistant  
**Status:** ✅ Ready for Testing
