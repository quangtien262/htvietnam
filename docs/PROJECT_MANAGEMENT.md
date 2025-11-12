# Project Management Module

## Tổng quan

Module quản lý dự án toàn diện với các tính năng:
- ✅ Quản lý dự án (CRUD)
- ✅ Quản lý nhiệm vụ (Tasks) với Kanban board
- ✅ Phân công và theo dõi tiến độ
- ✅ Time tracking cho từng task
- ✅ Dashboard thống kê với charts
- ✅ File attachments
- ✅ Comments & Activity logs
- ✅ Gantt chart timeline

## Cấu trúc Database

### Bảng chính

#### `pro___projects` - Dự án
```sql
- id, ma_du_an (unique)
- ten_du_an, mo_ta
- loai_du_an_id, trang_thai_id, uu_tien_id
- quan_ly_du_an_id (admin_user_id)
- ngay_bat_dau, ngay_ket_thuc_du_kien, ngay_ket_thuc_thuc_te
- ngan_sach, chi_phi_thuc_te
- tien_do (0-100)
- ten_khach_hang, tags (JSON)
```

#### `pro___tasks` - Nhiệm vụ
```sql
- id, project_id, ma_nhiem_vu (unique)
- tieu_de, mo_ta
- parent_id (nhiệm vụ cha)
- trang_thai_id, uu_tien_id
- nguoi_thuc_hien_id, nguoi_giao_viec_id
- ngay_bat_dau, ngay_ket_thuc_du_kien
- tien_do (0-100)
- kanban_order (thứ tự trong Kanban)
```

#### `pro___task_time_logs` - Log thời gian
```sql
- id, task_id, admin_user_id
- started_at, ended_at
- duration (seconds)
- is_running (boolean)
- mo_ta
```

#### `pro___task_statuses` - Trạng thái task
```sql
- id, ten_trang_thai
- ma_mau (color hex)
- is_done (boolean - đánh dấu hoàn thành)
- thu_tu
```

#### `pro___priorities` - Độ ưu tiên
```sql
- id, ten_uu_tien
- ma_mau (color hex)
- muc_uu_tien (1-5)
```

### Bảng phụ
- `pro___project_members` - Thành viên dự án
- `pro___task_checklists` - Checklist items
- `pro___task_comments` - Bình luận
- `pro___task_attachments` - File đính kèm
- `pro___activity_logs` - Nhật ký hoạt động

## API Endpoints

### Projects

#### `GET /project/api/projects`
Lấy danh sách dự án (có phân trang & filter)

**Query params:**
```
search: string (tìm theo mã/tên)
trang_thai_id: number
loai_du_an_id: number
uu_tien_id: number
quan_ly_du_an_id: number
tu_ngay: date (YYYY-MM-DD)
den_ngay: date (YYYY-MM-DD)
sort_by: string (default: 'created_at')
sort_order: 'asc' | 'desc'
per_page: number (default: 20)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "current_page": 1,
    "total": 50,
    "per_page": 20
  }
}
```

#### `GET /project/api/projects/{id}`
Lấy chi tiết dự án

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ma_du_an": "PRJ001",
    "ten_du_an": "Dự án ABC",
    "trang_thai": { "id": 1, "ten_trang_thai": "Đang thực hiện" },
    "tasks": [...],
    "members": [...],
    "attachments": [...]
  }
}
```

#### `POST /project/api/projects`
Tạo dự án mới

**Request body:**
```json
{
  "ten_du_an": "string (required)",
  "mo_ta": "string",
  "loai_du_an_id": "number",
  "trang_thai_id": "number (required)",
  "uu_tien_id": "number (required)",
  "quan_ly_du_an_id": "number",
  "ngay_bat_dau": "date",
  "ngay_ket_thuc_du_kien": "date",
  "ngan_sach": "number",
  "ten_khach_hang": "string",
  "tags": ["tag1", "tag2"]
}
```

#### `PUT /project/api/projects/{id}`
Cập nhật dự án

#### `DELETE /project/api/projects/{id}`
Xóa dự án (soft delete)

#### `GET /project/api/projects/{id}/dashboard-stats`
Lấy thống kê dashboard cho dự án

**Query params:**
```
tu_ngay: date (filter date range)
den_ngay: date
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_tasks": 7,
      "completed_tasks": 2,
      "in_progress_tasks": 3,
      "not_started_tasks": 2,
      "completion_rate": 28.57,
      "total_hours_logged": 24.5,
      "team_size": 4
    },
    "tasks_by_status": [
      { "status": "Hoàn thành", "count": 2, "color": "#52c41a" }
    ],
    "tasks_by_priority": [...],
    "time_by_member": [
      { "member": "Admin", "total_hours": 24.5 }
    ]
  }
}
```

### Tasks

#### `GET /project/api/tasks`
Lấy danh sách tasks (có filter)

**Query params:**
```
project_id: number
search: string
trang_thai_id: number
uu_tien_id: number
nguoi_thuc_hien_id: number
tu_ngay: date
den_ngay: date
```

#### `GET /project/api/tasks/{id}`
Lấy chi tiết task

**Response includes:**
- Task info
- Checklists
- Comments (with replies)
- Attachments
- Time logs

#### `POST /project/api/tasks`
Tạo task mới

**Request body:**
```json
{
  "project_id": "number (required)",
  "tieu_de": "string (required)",
  "mo_ta": "string",
  "parent_id": "number",
  "trang_thai_id": "number (required)",
  "uu_tien_id": "number (required)",
  "nguoi_thuc_hien_id": "number",
  "ngay_bat_dau": "date",
  "ngay_ket_thuc_du_kien": "date"
}
```

#### `PUT /project/api/tasks/{id}`
Cập nhật task

#### `DELETE /project/api/tasks/{id}`
Xóa task

#### `GET /project/api/projects/{projectId}/kanban`
Lấy data cho Kanban board

**Response:**
```json
{
  "success": true,
  "data": {
    "1": [task1, task2],  // Tasks in status 1
    "2": [task3],          // Tasks in status 2
    ...
  }
}
```

#### `POST /project/api/tasks/{id}/update-kanban`
Cập nhật vị trí task trong Kanban

**Request body:**
```json
{
  "trang_thai_id": 2,
  "kanban_order": 1
}
```

### Time Tracking

#### `POST /project/api/tasks/{id}/time/start`
Bắt đầu đếm thời gian

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "task_id": 5,
    "started_at": "2025-11-12 10:00:00",
    "is_running": true
  }
}
```

#### `POST /project/api/time/{timeLogId}/stop`
Dừng đếm thời gian

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ended_at": "2025-11-12 12:30:00",
    "duration": 9000,  // seconds
    "is_running": false
  }
}
```

#### `POST /project/api/tasks/{id}/time/manual`
Thêm log thời gian thủ công

**Request body:**
```json
{
  "started_at": "2025-11-12T09:00:00",
  "ended_at": "2025-11-12T11:00:00",
  "mo_ta": "Làm feature X"
}
```

#### `GET /project/api/tasks/{id}/time-logs`
Lấy danh sách time logs của task

#### `DELETE /project/api/time/{timeLogId}`
Xóa time log

#### `GET /project/api/time/running`
Lấy timer đang chạy của user hiện tại

### Checklists

#### `POST /project/api/tasks/{id}/checklists`
Thêm checklist item

**Request body:**
```json
{
  "noi_dung": "Hoàn thành UI"
}
```

#### `PUT /project/api/checklists/{id}`
Cập nhật checklist (toggle completed)

#### `DELETE /project/api/checklists/{id}`
Xóa checklist item

### Comments

#### `POST /project/api/tasks/{id}/comments`
Thêm comment

**Request body:**
```json
{
  "noi_dung": "Comment content",
  "parent_id": 1  // Optional, for reply
}
```

#### `DELETE /project/api/comments/{id}`
Xóa comment

### Attachments

#### `POST /project/api/tasks/{id}/attachments`
Upload file đính kèm

**Request (multipart/form-data):**
```
file: File
mo_ta: string (optional)
```

#### `GET /project/api/attachments/{id}/download`
Download file

#### `PUT /project/api/attachments/{id}`
Cập nhật mô tả file

#### `DELETE /project/api/attachments/{id}`
Xóa file

## Frontend Components

### ProjectList
- Danh sách dự án với filter & search
- Tạo/Sửa/Xóa dự án
- File: `resources/js/pages/project/ProjectList.tsx`

### ProjectDetail
- Chi tiết dự án với tabs:
  - **Nhiệm vụ**: Table view & Kanban board
  - **Thông tin**: Project details
  - **Dashboard**: Charts & statistics
  - **Lịch sử**: Activity logs
  - **Thành viên**: Team members
  - **Files**: Project attachments
- File: `resources/js/pages/project/ProjectDetail.tsx`

### TaskDetail
- Drawer hiển thị chi tiết task
- Tabs: Info, Checklist, Comments, Files, Time Tracking
- File: `resources/js/pages/project/TaskDetail.tsx`

### ProjectDetailDashboard
- Biểu đồ thống kê:
  - Pie chart: Tasks by status
  - Column chart: Tasks by priority
  - Column chart: Time by member
- Overview cards
- Date range filter
- File: `resources/js/pages/project/ProjectDetailDashboard.tsx`

## Sử dụng

### 1. Tạo dự án mới
```typescript
const createProject = async () => {
  const response = await projectApi.create({
    ten_du_an: 'Dự án mới',
    trang_thai_id: 1,
    uu_tien_id: 2,
    ngay_bat_dau: '2025-11-01',
    ngay_ket_thuc_du_kien: '2025-12-31'
  });
};
```

### 2. Tạo task
```typescript
const createTask = async () => {
  const response = await taskApi.create({
    project_id: 1,
    tieu_de: 'Implement login feature',
    trang_thai_id: 1,
    uu_tien_id: 3,
    nguoi_thuc_hien_id: 2
  });
};
```

### 3. Bắt đầu time tracking
```typescript
const startTimer = async (taskId: number) => {
  const response = await taskApi.startTimer(taskId);
  // Auto creates time log with is_running = true
};

const stopTimer = async (timeLogId: number) => {
  const response = await taskApi.stopTimer(timeLogId);
  // Calculates duration and saves
};
```

### 4. Kanban drag & drop
```typescript
const handleDragEnd = async (result: DropResult) => {
  const { draggableId, destination } = result;
  
  await taskApi.updateKanban(taskId, {
    trang_thai_id: newStatusId,
    kanban_order: newOrder
  });
};
```

## Tính năng nâng cao

### Auto-generate mã dự án/task
Backend tự động tạo mã unique:
- Dự án: `PRJ001`, `PRJ002`...
- Task: `TASK001`, `TASK002`...

### Hierarchy tasks (Parent-child)
Tasks có thể có task cha (`parent_id`)

### Activity logging
Tất cả thao tác được log tự động vào `pro___activity_logs`

### Soft delete
Dữ liệu xóa được giữ lại với `deleted_at`

### Validation
- Unique constraints cho mã
- Required fields
- Date validation (end >= start)
- Timer validation (chỉ 1 timer running/user)

## Migration & Seeding

### Chạy migration
```bash
php artisan migrate
```

### Seed data mẫu
```bash
php artisan db:seed --class=ProjectSeeder
php artisan db:seed --class=TaskStatusSeeder
php artisan db:seed --class=PrioritySeeder
```

## Performance

### Eager loading
```php
Project::with([
    'trangThai', 'loaiDuAn', 'uuTien',
    'tasks.trangThai', 'tasks.uuTien',
    'members', 'attachments'
])->get();
```

### Indexes
- Foreign keys có index
- Unique index cho `ma_du_an`, `ma_nhiem_vu`
- Composite index cho queries thường dùng

## Security

### Authorization
- Middleware `auth:sanctum`
- Check project membership
- Owner/admin permissions

### Validation
- Form requests cho create/update
- File upload validation (size, type)
- XSS protection

## Troubleshooting

### Timer không hiển thị
- Check `is_running = 1` trong database
- Verify `task_id` khớp
- Clear frontend state khi đóng drawer

### Kanban không drag được
- Verify `@hello-pangea/dnd` installed
- Check `kanban_order` field exists
- Console log DragDropContext events

### Charts không hiển thị
- Verify data format: `{ status, count, color }`
- Check `@ant-design/charts` version
- Inspect API response structure

## Changelog

### v1.0.0 (2025-11-12)
- ✅ Project CRUD
- ✅ Task management với Kanban
- ✅ Time tracking
- ✅ Dashboard charts
- ✅ File attachments
- ✅ Comments & checklists

---

**Developed by**: Your Team
**Last updated**: November 12, 2025
