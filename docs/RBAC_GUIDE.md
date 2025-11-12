# RBAC Usage Guide

## Overview
The RBAC (Role-Based Access Control) system provides fine-grained permission management for the Project Management module.

## Database Structure

### Tables
- `pro___permissions`: Stores 22 available permissions across 6 groups
- `pro___roles`: Stores 4 roles (Admin, Manager, Member, Viewer) with priority levels
- `pro___role_permission`: Many-to-many relationship between roles and permissions
- `pro___project_members`: Extended with `role_id` to assign roles to project members

### Roles & Permissions Matrix

| Role | Priority | Permissions Count | Key Abilities |
|------|----------|-------------------|---------------|
| Admin | 100 | 22 (ALL) | Full control over projects |
| Manager | 80 | 20 | Manage tasks, members; cannot create/delete projects |
| Member | 50 | 9 | Create/update own tasks, comment, upload files, log time |
| Viewer | 10 | 4 | Read-only access to projects and tasks |

### Permission Groups

**Project Permissions (5)**
- `project.view` - View project details
- `project.create` - Create new projects
- `project.update` - Update project information
- `project.delete` - Delete projects
- `project.manage_members` - Add/remove/edit project members

**Task Permissions (6)**
- `task.view` - View tasks
- `task.create` - Create new tasks
- `task.update` - Update any task
- `task.update_own` - Update only assigned tasks
- `task.delete` - Delete tasks
- `task.assign` - Assign tasks to members

**Comment Permissions (3)**
- `comment.create` - Add comments
- `comment.delete` - Delete any comment
- `comment.delete_own` - Delete own comments

**Attachment Permissions (3)**
- `attachment.upload` - Upload files
- `attachment.download` - Download files
- `attachment.delete` - Delete attachments

**Time Tracking Permissions (3)**
- `time.log` - Log work time
- `time.view_all` - View all time logs
- `time.delete` - Delete time logs

**Dashboard Permissions (2)**
- `dashboard.view` - View dashboard charts
- `dashboard.export` - Export dashboard data

## Backend Usage

### 1. Using Policies in Controllers

```php
use App\Models\Project\Project;
use App\Models\Project\Task;

class ProjectController extends Controller
{
    public function show($id)
    {
        $project = Project::findOrFail($id);
        
        // Check permission using policy
        $this->authorize('view', $project);
        
        // ... rest of the code
    }

    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);
        
        // Check permission
        $this->authorize('update', $project);
        
        // Update project
        $project->update($request->validated());
        
        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        
        // Check permission
        $this->authorize('delete', $project);
        
        $project->delete();
        
        return response()->json(['success' => true]);
    }
}
```

### 2. Using Middleware in Routes

```php
// In routes/admin_web_route.php or routes/api.php

// Protect single route
Route::put('/projects/{project}', [ProjectController::class, 'update'])
    ->middleware('project.permission:project.update');

// Protect route group
Route::middleware(['auth:admin', 'project.permission:task.create,task'])->group(function () {
    Route::post('/projects/{task}/tasks', [TaskController::class, 'store']);
});

// Custom project parameter name
Route::delete('/api/projects/{projectId}/tasks/{task}', [TaskController::class, 'destroy'])
    ->middleware('project.permission:task.delete,projectId');
```

### 3. Using PermissionService Directly

```php
use App\Services\Project\PermissionService;

class TaskController extends Controller
{
    protected $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    public function index(Request $request, $projectId)
    {
        $user = $request->user('admin');
        
        // Check permission manually
        if (!$this->permissionService->userHasPermissionInProject(
            $user->id,
            $projectId,
            'task.view'
        )) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        // Get all user permissions in project
        $permissions = $this->permissionService->getUserPermissionsInProject(
            $user->id,
            $projectId
        );

        // Check multiple permissions
        $canEdit = $this->permissionService->userHasAnyPermissionInProject(
            $user->id,
            $projectId,
            ['task.update', 'task.update_own']
        );

        // ... rest of the code
    }
}
```

### 4. Checking Permissions in Blade/Inertia

```php
// In controller - pass permissions to frontend
public function show($projectId)
{
    $user = auth('admin')->user();
    
    $permissions = $this->permissionService->getUserPermissionsInProject(
        $user->id,
        $projectId
    );

    $role = $this->permissionService->getUserRoleInProject(
        $user->id,
        $projectId
    );

    return Inertia::render('Project/Show', [
        'project' => $project,
        'permissions' => $permissions,
        'role' => $role,
    ]);
}
```

### 5. Task-Specific Permission Logic

The `TaskPolicy` includes special logic for `task.update_own`:

```php
// In TaskPolicy::update()
public function update(AdminUser $user, Task $task)
{
    // Can update if user has general task.update permission
    if ($this->permissionService->userHasPermissionInProject(
        $user->id,
        $task->project_id,
        'task.update'
    )) {
        return true;
    }

    // OR if user has task.update_own and is the assignee
    if ($this->permissionService->userHasPermissionInProject(
        $user->id,
        $task->project_id,
        'task.update_own'
    ) && $task->nguoi_thuc_hien_id === $user->id) {
        return true;
    }

    return false;
}
```

## Assigning Roles to Members

### Via Controller

```php
use App\Services\Project\PermissionService;

class ProjectMemberController extends Controller
{
    public function assignRole(Request $request, $projectId, $memberId)
    {
        $project = Project::findOrFail($projectId);
        
        // Check if user can manage members
        $this->authorize('manageMembers', $project);
        
        $roleId = $request->input('role_id');
        $targetRole = Role::findOrFail($roleId);
        
        // Check if user can assign this role (must have higher priority)
        $this->authorize('assignRole', [$project, $targetRole->priority]);
        
        // Assign role
        $permissionService = app(PermissionService::class);
        $permissionService->assignRoleToUser(
            $memberId,
            $projectId,
            $roleId
        );
        
        return response()->json(['success' => true]);
    }
}
```

## Cache Management

The `PermissionService` caches permissions for 1 hour. To clear cache after role changes:

```php
use App\Services\Project\PermissionService;

$permissionService = app(PermissionService::class);

// Clear specific user's permissions in a project
$permissionService->clearPermissionCache($userId, $projectId);
```

Cache is automatically cleared when:
- A user's role is changed via `assignRoleToUser()`
- After any role-permission mapping changes

## Testing Permissions

```php
use App\Services\Project\PermissionService;
use App\Models\Project\Project;
use App\Models\AdminUser;

// In tests or tinker
$permissionService = app(PermissionService::class);

// Check permission
$hasPermission = $permissionService->userHasPermissionInProject(
    $userId = 1,
    $projectId = 5,
    'task.update'
);

// Get user's role
$role = $permissionService->getUserRoleInProject(1, 5);
echo $role->name; // 'admin', 'manager', 'member', or 'viewer'

// Get all permissions
$permissions = $permissionService->getUserPermissionsInProject(1, 5);
print_r($permissions); // ['project.view', 'task.view', 'task.create', ...]
```

## Migration & Seeding

To set up RBAC on a fresh database:

```bash
# Run migrations
php artisan migrate

# Seed permissions and roles
php artisan db:seed --class=ProjectPermissionSeeder
```

## Frontend Integration (Coming in Task 3)

The frontend will receive permissions via Inertia props and use them for:
- Conditional rendering of buttons/links
- Disabling form fields
- Showing/hiding menu items

Example frontend usage (to be implemented):

```tsx
// React component
const { hasPermission } = usePermission();

return (
    <div>
        {hasPermission('task.create') && (
            <button onClick={createTask}>Tạo task mới</button>
        )}
        
        {hasPermission(['task.update', 'task.update_own']) && (
            <button onClick={editTask}>Chỉnh sửa</button>
        )}
    </div>
);
```

## Best Practices

1. **Always use policies** instead of manual permission checks when possible
2. **Cache efficiently** - Use `PermissionService` which caches results
3. **Check role priority** before allowing role assignments
4. **Clear cache** after role/permission changes
5. **Pass permissions to frontend** to avoid unnecessary API calls
6. **Use meaningful permission names** following the `group.action` pattern
7. **Document custom permissions** if you add new ones

## Adding New Permissions

1. Add to seeder:
```php
// In ProjectPermissionSeeder.php
$permissions = [
    // ... existing permissions
    ['name' => 'report.generate', 'display_name' => 'Tạo báo cáo', 'group' => 'report'],
];
```

2. Assign to roles:
```php
$rolePermissions = [
    'admin' => [..., 'report.generate'],
    'manager' => [..., 'report.generate'],
    // ...
];
```

3. Use in policies:
```php
public function generateReport(AdminUser $user, Project $project)
{
    return $this->permissionService->userHasPermissionInProject(
        $user->id,
        $project->id,
        'report.generate'
    );
}
```

4. Re-run seeder:
```bash
php artisan db:seed --class=ProjectPermissionSeeder
```
