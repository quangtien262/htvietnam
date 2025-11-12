# Project Management Module - README

## 📋 Tổng Quan

Module Quản Lý Dự Án là một hệ thống toàn diện để quản lý dự án, nhiệm vụ, team và thời gian làm việc. Module được xây dựng với Laravel backend và React + TypeScript frontend.

### 🎯 Tính Năng Chính

1. **Quản Lý Dự Án**
   - CRUD dự án với thông tin chi tiết
   - Phân loại theo trạng thái, loại dự án, độ ưu tiên
   - Quản lý team members với vai trò rõ ràng
   - Upload file đính kèm

2. **Quản Lý Nhiệm Vụ**
   - Kanban Board với drag & drop
   - Table View với filter, search, sort
   - Gantt Chart timeline
   - Checklists trong từng task
   - Comments với nested replies
   - File attachments

3. **Time Tracking**
   - Timer tự động (start/stop)
   - Nhập thời gian thủ công
   - Theo dõi thời gian theo task và member
   - Báo cáo tổng hợp

4. **Dashboard & Báo Cáo**
   - Thống kê tổng quan (all projects)
   - Dashboard chi tiết từng dự án
   - Biểu đồ phân bổ task (status, priority)
   - Biểu đồ thời gian làm việc
   - Lọc theo khoảng thời gian

5. **Quản Lý Team**
   - Thêm/xóa thành viên
   - 3 vai trò: Quản lý, Thành viên, Xem
   - Phân quyền rõ ràng

## 📁 Cấu Trúc Thư Mục

```
project-management/
├── Backend (Laravel)
│   ├── app/
│   │   ├── Http/Controllers/Project/
│   │   │   ├── ProjectController.php
│   │   │   └── TaskController.php
│   │   ├── Models/Project/
│   │   │   ├── Project.php
│   │   │   ├── Task.php
│   │   │   ├── TaskTimeLog.php
│   │   │   ├── ProjectMember.php
│   │   │   └── ... (10+ models)
│   │   └── Services/Project/
│   │       ├── ProjectService.php
│   │       └── TaskService.php
│   ├── database/migrations/
│   │   ├── 2025_11_11_150000_create_project_management_tables.php
│   │   ├── 2025_11_12_013833_create_task_time_logs_table.php
│   │   └── 2025_11_12_100000_add_indexes_for_project_management.php
│   └── routes/
│       └── (API routes in project namespace)
│
├── Frontend (React + TypeScript)
│   ├── resources/js/
│   │   ├── pages/project/
│   │   │   ├── ProjectDashboard.tsx
│   │   │   ├── ProjectList.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   ├── TaskKanban.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskDetail.tsx
│   │   │   ├── GanttChart.tsx
│   │   │   ├── ProjectDetailDashboard.tsx
│   │   │   └── UserGuide.tsx
│   │   ├── common/api/
│   │   │   └── projectApi.tsx (40+ API methods)
│   │   └── types/
│   │       └── project.ts (All TypeScript interfaces)
│   └── resources/css/
│       └── (Styling files)
│
└── Documentation
    ├── docs/PROJECT_MANAGEMENT.md (API docs)
    ├── docs/TESTING_CHECKLIST.md (Testing guide)
    └── README.md (This file)
```

## 🚀 Cài Đặt

### 1. Prerequisites

- PHP >= 8.1
- Composer
- Node.js >= 18
- MySQL >= 8.0
- Laravel 10+

### 2. Backend Setup

```bash
# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Run migrations
php artisan migrate

# Seed reference data (statuses, priorities, types)
php artisan db:seed --class=AdminMenuSeeder
# Or create your own seeder for project reference tables
```

### 3. Frontend Setup

```bash
# Install Node dependencies
npm install

# Build for development
npm run dev

# Build for production
npm run build
```

### 4. Run Application

```bash
# Start Laravel server
php artisan serve

# Or use Vite dev server for hot reload
npm run dev
```

## 📚 Documentation

### For Developers

- **API Documentation**: `docs/PROJECT_MANAGEMENT.md`
  - 40+ API endpoints with request/response examples
  - Database schema
  - Code usage examples

- **Testing Checklist**: `docs/TESTING_CHECKLIST.md`
  - Manual testing procedures
  - Performance optimization notes
  - Known issues

- **Code Comments**: All major functions documented with JSDoc/TSDoc

### For Users

- **User Guide**: Access via application
  - Navigate to `/aio/project/guide/`
  - Or click "Hướng Dẫn" button in Project List/Dashboard
  - Interactive guide with step-by-step tutorials

## 🔧 Configuration

### Reference Data

You need to seed these tables before using:

1. **pro___project_statuses**: Planning, In Progress, On Hold, Completed, Cancelled
2. **pro___project_types**: Web Development, Mobile App, Design, etc.
3. **pro___priorities**: Low, Medium, High, Urgent
4. **pro___task_statuses**: Not Started, In Progress, In Review, Completed, Blocked

Example SQL:

```sql
-- Project Statuses
INSERT INTO pro___project_statuses (ten_trang_thai, ma_mau, thu_tu, is_active) VALUES
('Planning', '#8c8c8c', 1, 1),
('In Progress', '#1890ff', 2, 1),
('On Hold', '#faad14', 3, 1),
('Completed', '#52c41a', 4, 1),
('Cancelled', '#f5222d', 5, 1);

-- Priorities
INSERT INTO pro___priorities (ten_uu_tien, muc_uu_tien, cap_do, ma_mau) VALUES
('Low', 1, 1, '#52c41a'),
('Medium', 2, 2, '#faad14'),
('High', 3, 3, '#ff7a45'),
('Urgent', 4, 4, '#f5222d');

-- Task Statuses
INSERT INTO pro___task_statuses (ten_trang_thai, ma_mau, thu_tu, is_done, is_active) VALUES
('Chưa bắt đầu', '#8c8c8c', 1, 0, 1),
('Đang làm', '#1890ff', 2, 0, 1),
('Đang review', '#722ed1', 3, 0, 1),
('Hoàn thành', '#52c41a', 4, 1, 1),
('Bị block', '#f5222d', 5, 0, 1);
```

### Routes

Add to your route file (web or API):

```php
use App\Http\Controllers\Project\ProjectController;
use App\Http\Controllers\Project\TaskController;

Route::prefix('project/api')->middleware(['auth:admin'])->group(function () {
    // Projects
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/{id}', [ProjectController::class, 'show']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);
    
    // ... (see PROJECT_MANAGEMENT.md for full routes)
});
```

## 🎨 UI Components

Built with **Ant Design 5**:
- Cards, Tables, Modals, Drawers
- Form components (Input, Select, DatePicker, Upload)
- Charts (@ant-design/charts v2.x)
- Drag & Drop (@hello-pangea/dnd)

## 🔒 Security

### Authentication
- All routes protected by `auth:admin` middleware
- User ID retrieved from `Auth::guard('admin_users')->id()`

### Validation
- All POST/PUT requests validated
- File upload restrictions (size, types)
- SQL injection protection (Eloquent ORM)
- XSS protection (auto-escaped)

### Authorization (TODO)
- Implement role-based access control
- Check project membership
- Validate ownership for edit/delete

## ⚡ Performance

### Database Optimization
- **27 indexes** added for frequently queried columns
- Composite indexes for complex queries
- Foreign keys for referential integrity

### Query Optimization
- Eager loading with `with()` to prevent N+1
- Pagination for large datasets (20 items/page)
- Soft deletes for data recovery

### Frontend Optimization
- Code splitting (Vite)
- Lazy loading components (React.lazy)
- Debounced search inputs
- Optimistic UI updates

## 🧪 Testing

### Manual Testing
See `docs/TESTING_CHECKLIST.md` for comprehensive checklist covering:
- CRUD operations (Projects, Tasks)
- Kanban drag & drop
- Time tracking (timer, manual entry)
- Dashboard & charts
- Team management
- File uploads
- Comments

### Automated Testing (TODO)
- PHPUnit tests for services
- Pest tests for API endpoints
- React Testing Library for components
- E2E tests with Cypress

## 🐛 Troubleshooting

### Common Issues

**1. Migration Error: Table already exists**
```bash
# Drop all project tables and re-run
php artisan migrate:rollback --step=3
php artisan migrate
```

**2. Build Error: react-beautiful-dnd not found**
```bash
# Uninstall old library
npm uninstall react-beautiful-dnd

# Install new library
npm install @hello-pangea/dnd

# Update imports in code
# FROM: import { DragDropContext } from 'react-beautiful-dnd'
# TO: import { DragDropContext } from '@hello-pangea/dnd'
```

**3. Dashboard shows "Không có dữ liệu"**
- Check if reference tables are seeded
- Verify database table names (pro___ prefix)
- Check API response in Network tab

**4. Timer not working**
- Check user has permission
- Verify only 1 running timer per user
- Check API endpoint: `/project/api/tasks/{id}/time/start`

## 📈 Roadmap

### Phase 1 (Completed) ✅
- [x] Basic CRUD for Projects & Tasks
- [x] Kanban Board with drag & drop
- [x] File upload & attachments
- [x] Time Tracking
- [x] Dashboard with charts
- [x] User Guide
- [x] Documentation

### Phase 2 (Future)
- [ ] Role-based permissions
- [ ] Email notifications
- [ ] Real-time updates (WebSocket)
- [ ] Bulk operations
- [ ] Export reports (Excel, PDF)
- [ ] Mobile responsive design
- [ ] Dark mode
- [ ] Multi-language support

### Phase 3 (Future)
- [ ] Budget tracking
- [ ] Resource allocation
- [ ] Calendar view
- [ ] Workload visualization
- [ ] API rate limiting
- [ ] Audit logs
- [ ] Advanced analytics

## 👥 Team

**Developer**: AI Coding Agent  
**Tech Stack**: Laravel 10, React 18, TypeScript, Ant Design 5  
**Start Date**: November 11, 2025  
**Current Version**: 1.0.0

## 📄 License

Proprietary - Internal use only

## 🆘 Support

For issues or questions:
- Check `docs/PROJECT_MANAGEMENT.md` for API documentation
- Check `docs/TESTING_CHECKLIST.md` for testing guide
- Access User Guide: `/aio/project/guide/`
- Contact: support@example.com

---

**Last Updated**: November 12, 2025  
**Status**: Production Ready (pending final testing)
