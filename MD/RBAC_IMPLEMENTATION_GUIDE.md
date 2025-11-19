# RBAC Implementation Guide - Hướng dẫn Áp Dụng Phân Quyền

## 📋 Tổng Quan

Hệ thống RBAC (Role-Based Access Control) đã được xây dựng đầy đủ nhưng **chưa được áp dụng** vào các controller. Tài liệu này hướng dẫn cách áp dụng để phân quyền có hiệu lực.

## 🔧 Các Thành Phần Đã Có

### 1. Database & Models
- ✅ `pro___roles` - 4 roles với priority
- ✅ `pro___permissions` - 22 permissions
- ✅ `pro___role_permissions` - Mapping
- ✅ `pro___project_members` - Có cột `role_id`
- ✅ Models: Role, Permission, RolePermission

### 2. Services & Policies
- ✅ `PermissionService` - Logic kiểm tra quyền
- ✅ `ProjectPolicy` - Policy cho Project
- ✅ `TaskPolicy` - Policy cho Task  
- ✅ `CheckProjectPermission` - Middleware

### 3. Frontend
- ✅ Permission management UI
- ✅ Role assignment interface
- ⚠️ Chưa ẩn/hiện button theo quyền

## ❌ Vấn Đề Hiện Tại

**Ai cũng có thể truy cập mọi chức năng vì:**

1. **Controllers chưa kiểm tra quyền** - Không gọi `authorize()` hoặc `can()`
2. **Routes không dùng middleware** - Không có `project.permission` middleware
3. **Frontend không ẩn button** - Người không có quyền vẫn thấy nút

## ✅ Giải Pháp

### A. Sửa Guard (ĐÃ LÀM)

```php
// ✅ Đã sửa trong CheckProjectPermission.php và PermissionController.php
$user = $request->user('admin_users'); // Không còn là 'admin'
```

### B. Áp Dụng Authorization Vào Controllers

#### Cách 1: Dùng Policy trong Controller (Khuyến nghị)

```php
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Models\Project\Project;

class ProjectController extends Controller
{
    use AuthorizesRequests;

    public function show($id)
    {
        try {
            $project = Project::findOrFail($id);
            
            // Kiểm tra quyền xem
            $this->authorize('view', $project);
            
            return response()->json([
                'success' => true,
                'data' => $project,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền xem dự án này',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $project = Project::findOrFail($id);
            
            // Kiểm tra quyền sửa
            $this->authorize('update', $project);
            
            $validated = $request->validate([...]);
            $project->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Cập nhật thành công',
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền sửa dự án này',
            ], 403);
        }
    }

    public function delete($id)
    {
        try {
            $project = Project::findOrFail($id);
            
            // Kiểm tra quyền xóa
            $this->authorize('delete', $project);
            
            $project->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Xóa thành công',
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền xóa dự án này',
            ], 403);
        }
    }

    public function addMember(Request $request, $id)
    {
        try {
            $project = Project::findOrFail($id);
            
            // Kiểm tra quyền quản lý thành viên
            $this->authorize('manageMembers', $project);
            
            // ... logic thêm member
            
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền quản lý thành viên',
            ], 403);
        }
    }
}
```

#### Cách 2: Dùng PermissionService trực tiếp

```php
use App\Services\Project\PermissionService;

class TaskController extends Controller
{
    protected $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    public function store(Request $request)
    {
        $user = auth('admin_users')->user();
        $projectId = $request->project_id;

        // Kiểm tra quyền tạo task
        if (!$this->permissionService->userHasPermissionInProject($user->id, $projectId, 'task.create')) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền tạo task trong dự án này',
            ], 403);
        }

        // ... logic tạo task
    }

    public function delete($id)
    {
        $user = auth('admin_users')->user();
        $task = Task::findOrFail($id);

        // Kiểm tra quyền xóa task
        if (!$this->permissionService->userHasPermissionInProject($user->id, $task->project_id, 'task.delete')) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền xóa task này',
            ], 403);
        }

        $task->delete();
    }
}
```

### C. Danh Sách Methods Cần Thêm Authorization

#### ProjectController.php
```php
// ✅ Đã thêm vào show()
- show($id) → authorize('view', $project)
- update($id) → authorize('update', $project)
- delete($id) → authorize('delete', $project)
- addMember($id) → authorize('manageMembers', $project)
- removeMember($id, $memberId) → authorize('manageMembers', $project)
- uploadAttachment($id) → Check 'attachment.create'
- updateAttachment($id) → Check 'attachment.update'
- deleteAttachment($id) → Check 'attachment.delete'
```

#### TaskController.php
```php
- store() → Check 'task.create'
- update($id) → Check 'task.update'
- delete($id) → Check 'task.delete'
- addComment($id) → Check 'comment.create'
- uploadAttachment($id) → Check 'attachment.create'
- startTimer($id) → Check 'time.log'
- addManualTimeLog($id) → Check 'time.log'
```

### D. Đăng Ký Policy (ĐÃ LÀM)

Policy đã được đăng ký trong `AppServiceProvider`:

```php
// app/Providers/AppServiceProvider.php
use App\Models\Project\Project;
use App\Policies\Project\ProjectPolicy;

Gate::policy(Project::class, ProjectPolicy::class);
```

### E. Frontend - Ẩn/Hiện Button Theo Quyền

Sử dụng Permission Context đã có:

```tsx
import { usePermission } from '@/contexts/PermissionContext';
import { Can, Cannot } from '@/components/rbac';

function ProjectActions({ projectId }) {
    const { hasPermission, loading } = usePermission(projectId);

    return (
        <div>
            {/* Nút Sửa - chỉ hiện khi có quyền */}
            <Can permission="project.update" projectId={projectId}>
                <Button onClick={handleEdit}>Sửa Dự Án</Button>
            </Can>

            {/* Nút Xóa - chỉ hiện khi có quyền */}
            <Can permission="project.delete" projectId={projectId}>
                <Button danger onClick={handleDelete}>Xóa</Button>
            </Can>

            {/* Hiện message nếu không có quyền */}
            <Cannot permission="project.update" projectId={projectId}>
                <Alert message="Bạn chỉ có quyền xem" type="info" />
            </Cannot>
        </div>
    );
}
```

## 📝 TODO List

### Backend (Ưu tiên cao)
- [x] Sửa guard từ `admin` → `admin_users`
- [x] Thêm `use AuthorizesRequests` vào ProjectController
- [ ] Thêm `authorize()` vào tất cả methods trong ProjectController
- [ ] Thêm `authorize()` vào tất cả methods trong TaskController
- [ ] Test các endpoints với user có/không có quyền

### Frontend (Ưu tiên trung bình)
- [ ] Wrap các nút "Sửa", "Xóa" trong `<Can>` component
- [ ] Ẩn menu items không có quyền truy cập
- [ ] Hiện thông báo rõ ràng khi bị từ chối quyền

### Testing
- [ ] Test user Viewer - chỉ xem, không sửa/xóa
- [ ] Test user Member - xem, sửa task của mình
- [ ] Test user Manager - toàn quyền trừ xóa project
- [ ] Test user Admin - toàn quyền

## 🎯 Ví Dụ Cụ Thể

### Scenario 1: User Viewer cố sửa project

**Backend (ProjectController@update):**
```php
public function update(Request $request, $id)
{
    try {
        $project = Project::findOrFail($id);
        $this->authorize('update', $project); // ← SẼ FAIL
        
        // Won't reach here
        
    } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Bạn không có quyền sửa dự án này',
        ], 403); // ← TRẢ VỀ 403
    }
}
```

**Frontend:**
```tsx
// Nút sửa sẽ KHÔNG HIỂN THỊ với user Viewer
<Can permission="project.update" projectId={1}>
    <Button onClick={handleEdit}>Sửa</Button> {/* Hidden */}
</Can>
```

### Scenario 2: User Member tạo task

**Backend (TaskController@store):**
```php
public function store(Request $request)
{
    $user = auth('admin_users')->user();
    $projectId = $request->project_id;

    // Member có permission 'task.create' → PASS
    if (!$this->permissionService->userHasPermissionInProject(
        $user->id, $projectId, 'task.create'
    )) {
        return response()->json(['success' => false], 403);
    }

    // Create task - SUCCESS
}
```

## 🔍 Debug Commands

```bash
# Kiểm tra user có permission không
php artisan tinker
>>> $user = \App\Models\AdminUser::find(1);
>>> $service = app(\App\Services\Project\PermissionService::class);
>>> $service->userHasPermissionInProject(1, 1, 'project.update');
# Should return true/false

# Kiểm tra role của user
>>> $service->getUserRoleInProject(1, 1);
# Should return Role object

# Kiểm tra tất cả permissions
>>> $service->getUserPermissionsInProject(1, 1);
# Should return Collection of permissions
```

## 📚 Tham Khảo

- **Policies**: `app/Policies/Project/`
- **Middleware**: `app/Http/Middleware/CheckProjectPermission.php`
- **Service**: `app/Services/Project/PermissionService.php`
- **Frontend**: `resources/js/contexts/PermissionContext.tsx`
- **Components**: `resources/js/components/rbac/`

## 🚀 Next Steps

1. **Ngay lập tức**: Thêm authorization vào 5-10 endpoints quan trọng nhất
2. **Tuần này**: Complete tất cả ProjectController và TaskController
3. **Tuần sau**: Cập nhật frontend để ẩn/hiện buttons
4. **Testing**: Tạo test cases cho từng role

---

**Cập nhật lần cuối**: 2025-11-12
**Trạng thái**: RBAC infrastructure done, waiting for implementation in controllers
