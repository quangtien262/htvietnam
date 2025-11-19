# Hướng dẫn sử dụng Project Management System

## ✅ Hoàn thành (Implemented)

### Backend Infrastructure
- ✅ Database: 13 tables với prefix `pro___`
- ✅ Models: 9 Eloquent models với relationships đầy đủ
- ✅ Services: ProjectService, TaskService với business logic
- ✅ Controllers: REST API với validation
- ✅ Routes: Đã register tại `routes/project_route.php` với prefix `/project/api`

### Frontend Foundation
- ✅ TypeScript Types: Comprehensive interfaces (200+ lines)
- ✅ API Client: projectApi, taskApi, referenceApi
- ✅ Routes: Đã đăng ký trong ROUTE constant

### Pages Completed
1. **ProjectDashboard** - Trang tổng quan
   - 4 thẻ thống kê (Tổng, Đang thực hiện, Hoàn thành, Trễ deadline)
   - Bảng dự án gần đây
   
2. **ProjectList** - Quản lý dự án
   - CRUD đầy đủ (Create, Read, Update, Delete)
   - Filters: Trạng thái, Loại, Ưu tiên, Search
   - ColorPicker cho màu dự án
   - Pagination
   
3. **TaskKanban** - Kanban Board
   - Drag & Drop với react-beautiful-dnd
   - Tạo nhanh nhiệm vụ
   - Cập nhật real-time
   
4. **TaskList** - Danh sách nhiệm vụ
   - CRUD nhiệm vụ
   - Filters đa dạng
   - Drawer form
   
5. **ProjectDetail** - Chi tiết dự án
   - 4 tabs: Thông tin, Thành viên, Thống kê, Lịch sử
   - Hiển thị members, tasks, activity logs

## 🔗 Truy cập hệ thống

### URL chính
```
/aio/project/dashboard/?p=project_management       # Dashboard
/aio/project/list/?p=project_management            # Danh sách dự án
/aio/project/:id/?p=project_management             # Chi tiết dự án
/aio/project/:id/kanban/?p=project_management      # Kanban board
/aio/project/:id/tasks/?p=project_management       # Danh sách task
```

### API Endpoints
```
# Projects
GET    /project/api/projects                    # List
POST   /project/api/projects                    # Create
GET    /project/api/projects/dashboard          # Stats
GET    /project/api/projects/{id}               # Detail
PUT    /project/api/projects/{id}               # Update
DELETE /project/api/projects/{id}               # Delete

# Tasks
GET    /project/api/tasks                       # List
POST   /project/api/tasks                       # Create
GET    /project/api/tasks/kanban/{projectId}    # Kanban data
GET    /project/api/tasks/gantt/{projectId}     # Gantt data
PUT    /project/api/tasks/{id}                  # Update
PUT    /project/api/tasks/{id}/status           # Update status (Kanban drag)
DELETE /project/api/tasks/{id}                  # Delete
POST   /project/api/tasks/{id}/comments         # Add comment

# Reference Data
GET /project/api/project-statuses
GET /project/api/project-types
GET /project/api/task-statuses
GET /project/api/priorities
```

## 📊 Database Schema

### Tables Created
1. `pro___project_statuses` - 5 trạng thái (Lên kế hoạch, Đang thực hiện, Tạm dừng, Hoàn thành, Đã hủy)
2. `pro___project_types` - 5 loại (Website, Mobile App, ERP, Marketing, Khác)
3. `pro___priorities` - 4 mức (Thấp, Trung bình, Cao, Khẩn cấp)
4. `pro___projects` - Dự án chính
5. `pro___project_members` - Thành viên dự án
6. `pro___task_statuses` - 5 trạng thái task
7. `pro___tasks` - Nhiệm vụ
8. `pro___task_dependencies` - Phụ thuộc (cho Gantt)
9. `pro___task_checklists` - Checklist items
10. `pro___task_comments` - Comments
11. `pro___task_attachments` - File đính kèm
12. `pro___activity_logs` - Lịch sử hoạt động
13. `pro___time_logs` - Tracking thời gian

### Sample Data (Seeded)
- 2 dự án mẫu: PRJ-001 (Website), PRJ-002 (Mobile App)
- Đầy đủ reference data (statuses, types, priorities)

## 🧪 Testing Guide

### 1. Kiểm tra Database
```bash
php artisan tinker

# Check tables
DB::table('pro___projects')->count();
DB::table('pro___project_statuses')->get();

# View sample project
App\Models\Project\Project::with(['trang_thai', 'loai_du_an', 'uu_tien'])->first();
```

### 2. Test API (Postman/Insomnia)
```bash
# Get dashboard stats
GET http://your-domain/project/api/projects/dashboard
Authorization: Bearer {token}

# Get projects list
GET http://your-domain/project/api/projects?page=1&per_page=20

# Create project
POST http://your-domain/project/api/projects
{
  "ten_du_an": "Test Project",
  "trang_thai_id": 2,
  "uu_tien_id": 2,
  "quan_ly_du_an_id": 1,
  "ngay_bat_dau": "2025-11-15 09:00:00",
  "mau_sac": "#1890ff"
}
```

### 3. Test Frontend

#### Bước 1: Login vào admin
```
http://your-domain/aio/login
```

#### Bước 2: Truy cập menu
Click vào menu "Project Management" → "Dashboard"

#### Bước 3: Test các tính năng

**Dashboard:**
- Xem 4 thống kê
- Click "Xem chi tiết" để vào ProjectList

**Project List:**
- Click "Thêm dự án" → Điền form → Lưu
- Filter theo trạng thái, loại
- Search theo tên/mã
- Edit một dự án
- Delete (có confirm)
- Click vào tên dự án → Vào detail

**Project Detail:**
- Tab "Thông tin": Xem thông tin dự án
- Tab "Thành viên": Danh sách members
- Tab "Thống kê": Số liệu task
- Tab "Lịch sử": Activity logs

**Task Kanban** (nếu có dự án):
```
/aio/project/1/kanban/?p=project_management
```
- Xem tasks theo cột trạng thái
- Drag & drop task giữa các cột
- Click "+" để thêm task nhanh

**Task List:**
```
/aio/project/1/tasks/?p=project_management
```
- Xem danh sách task
- Filter, search
- CRUD tasks

## 📁 File Structure

```
Backend:
├── database/
│   ├── migrations/2025_11_11_150000_create_project_management_tables.php
│   └── seeders/ProjectManagementSeeder.php
├── app/
│   ├── Models/Project/
│   │   ├── Project.php
│   │   ├── ProjectStatus.php
│   │   ├── ProjectType.php
│   │   ├── Priority.php
│   │   ├── ProjectMember.php
│   │   ├── Task.php
│   │   ├── TaskStatus.php
│   │   ├── TaskChecklist.php
│   │   ├── TaskComment.php
│   │   ├── TaskAttachment.php
│   │   ├── TaskDependency.php
│   │   ├── TimeLog.php
│   │   └── ActivityLog.php
│   ├── Services/Project/
│   │   ├── ProjectService.php
│   │   └── TaskService.php
│   └── Http/Controllers/Project/
│       ├── ProjectController.php
│       └── TaskController.php
└── routes/
    └── project_route.php (registered in web.php)

Frontend:
├── resources/js/
│   ├── types/
│   │   └── project.ts (200+ lines of interfaces)
│   ├── common/
│   │   ├── api/projectApi.tsx
│   │   ├── route.tsx (updated)
│   │   └── menu.jsx (updated)
│   └── pages/project/
│       ├── ProjectDashboard.tsx
│       ├── ProjectList.tsx
│       ├── ProjectDetail.tsx
│       ├── TaskKanban.tsx
│       └── TaskList.tsx
└── resources/js/app.tsx (routes registered)
```

## 🎯 Key Features Implemented

### Project Management
- ✅ Auto-generate project codes (PRJ-001, PRJ-002...)
- ✅ Color picker cho dự án
- ✅ Tags support (JSON array)
- ✅ Progress auto-calculation từ tasks
- ✅ Member management với roles (Quản lý, Thành viên, Xem)
- ✅ Activity logging (track all changes)

### Task Management
- ✅ Auto-generate task codes (TASK-001...)
- ✅ Parent-child tasks (subtasks)
- ✅ Kanban order tracking
- ✅ Progress tracking
- ✅ Deadline alerts (màu đỏ khi quá hạn)
- ✅ Checklist items
- ✅ Threaded comments
- ✅ File attachments support
- ✅ Task dependencies (cho Gantt - backend ready)

### Business Logic
- ✅ ProjectService:
  - getList() với filters, search, pagination
  - getDashboardStats()
  - updateProgress() auto từ tasks
  - generateProjectCode()
  - logActivity()
  
- ✅ TaskService:
  - getKanbanData() group by status
  - getGanttData() với dependencies
  - updateStatus() cho drag & drop
  - addComment() threaded
  - Auto-update project progress on task changes

### UI/UX
- ✅ Ant Design components
- ✅ Responsive layout
- ✅ Loading states
- ✅ Error handling
- ✅ Confirmation dialogs
- ✅ Toast notifications
- ✅ Tag colors cho status/priority
- ✅ Progress bars
- ✅ Date formatting (DD/MM/YYYY)

## 🚧 Pending Features (Not Yet Implemented)

### High Priority
- ⏳ Gantt Chart component (backend ready, need frontend chart library)
- ⏳ File upload for attachments
- ⏳ Rich text editor for descriptions
- ⏳ Bulk actions (multi-select delete, status change)
- ⏳ Export to Excel/PDF
- ⏳ Email notifications

### Medium Priority
- ⏳ Status customization page (CRUD pro___project_statuses)
- ⏳ Advanced search builder
- ⏳ Project templates
- ⏳ Task templates
- ⏳ Time tracking UI (backend ready)
- ⏳ Charts in dashboard (line, pie, bar)

### Low Priority
- ⏳ Keyboard shortcuts
- ⏳ Dark mode
- ⏳ Mobile app
- ⏳ Webhooks integration
- ⏳ API documentation (Swagger)

## 🐛 Known Issues

1. **TypeScript warnings (non-blocking):**
   - Model files chưa được IDE index đầy đủ
   - Không ảnh hưởng runtime

2. **Performance:**
   - Frontend bundle lớn (3MB) - cần code splitting
   - Suggest: Dynamic imports cho các pages

3. **Security:**
   - Chưa có permission/authorization middleware
   - Suggest: Thêm policy check trong controller

## 🔧 Configuration

### Environment Variables
Không cần thêm biến mới. Hệ thống sử dụng:
- `DB_*` - Database config
- `APP_URL` - Base URL

### Permissions
Guard sử dụng: `admin_users` (nhân viên)

Suggest thêm permissions:
- `project.view`
- `project.create`
- `project.edit`
- `project.delete`
- `task.*` tương tự

## 📞 Support

### Logs
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Check errors
php artisan log:clear
```

### Debug
```php
// Enable debug in .env
APP_DEBUG=true

// Query log
DB::enableQueryLog();
// ... your code ...
dd(DB::getQueryLog());
```

### Common Issues

**Issue: API 404**
```bash
# Clear route cache
php artisan route:clear
php artisan route:cache
```

**Issue: Frontend blank page**
```bash
# Rebuild
npm run build

# Check browser console for errors
```

**Issue: Database errors**
```bash
# Re-migrate
php artisan migrate:fresh --seed
php artisan db:seed --class=ProjectManagementSeeder
```

## 🎓 Next Steps

1. **Test toàn bộ flow:**
   - Login → Dashboard → Create Project → Create Tasks → Kanban

2. **Add permissions:**
   - Install Spatie Permission package
   - Create permissions/roles
   - Add middleware to routes

3. **Implement Gantt Chart:**
   - Install: `npm install frappe-gantt`
   - Create GanttChart.tsx component
   - Use TaskService::getGanttData()

4. **Add file upload:**
   - Frontend: `<Upload>` component
   - Backend: Store in storage/app/project_attachments
   - Update TaskAttachment records

5. **Optimize performance:**
   - Code splitting (lazy loading routes)
   - Reduce bundle size
   - Add caching to API

---

**Version:** 1.0.0  
**Date:** 2025-11-11  
**Status:** ✅ Beta - Ready for testing
