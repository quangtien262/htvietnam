# Frontend Permission Integration Guide

## Overview

This guide shows how to use the RBAC system in your React/TypeScript frontend components.

## Core Components

### 1. PermissionProvider

Wrap your project components with this provider to enable permission checks.

**Location:** `resources/js/contexts/PermissionContext.tsx`

**Usage:**
```tsx
import { PermissionProvider } from '@/contexts/PermissionContext';

<PermissionProvider permissions={userPermissions} role={userRole}>
  <YourProjectPage />
</PermissionProvider>
```

**Props:**
- `permissions: string[]` - Array of permission names user has in this project
- `role: { name, display_name, priority }` - User's role in this project

### 2. usePermission Hook

Access permission checking functions anywhere in your component tree.

**Location:** `resources/js/contexts/PermissionContext.tsx`

**Usage:**
```tsx
import { usePermission } from '@/contexts/PermissionContext';

function MyComponent() {
  const { hasPermission, hasAnyPermission, role } = usePermission();

  if (hasPermission('task.create')) {
    // Show create button
  }

  return (
    <div>
      <p>Your role: {role?.display_name}</p>
      {hasAnyPermission(['task.update', 'task.update_own']) && (
        <button>Edit Task</button>
      )}
    </div>
  );
}
```

**Available Functions:**
- `hasPermission(permission: string): boolean` - Check single permission
- `hasAnyPermission(permissions: string[]): boolean` - Check if user has at least one
- `hasAllPermissions(permissions: string[]): boolean` - Check if user has all
- `role: { name, display_name, priority } | null` - Current user's role
- `permissions: string[]` - All permissions user has

### 3. Can Component

Conditionally render content based on permissions.

**Location:** `resources/js/components/permissions/Can.tsx`

**Examples:**

```tsx
import { Can, Cannot, RoleCheck } from '@/components/permissions/Can';

// Single permission
<Can permission="task.create">
  <button>Tạo task mới</button>
</Can>

// Any of multiple permissions
<Can anyPermission={['task.update', 'task.update_own']}>
  <button>Chỉnh sửa</button>
</Can>

// All permissions required
<Can allPermissions={['task.delete', 'project.update']}>
  <button>Xóa task</button>
</Can>

// With fallback
<Can 
  permission="project.update" 
  fallback={<span>Bạn không có quyền</span>}
>
  <button>Cập nhật</button>
</Can>
```

### 4. Cannot Component

Inverse of `Can` - renders content when user does NOT have permission.

```tsx
<Cannot permission="project.delete">
  <p className="text-gray-500">Bạn không thể xóa dự án này</p>
</Cannot>
```

### 5. RoleCheck Component

Conditional rendering based on user role.

```tsx
<RoleCheck roles="admin">
  <button>Xóa dự án</button>
</RoleCheck>

<RoleCheck roles={['admin', 'manager']}>
  <AdminPanel />
</RoleCheck>
```

### 6. PermissionButton Component

Button that only renders if user has permission.

**Location:** `resources/js/components/permissions/PermissionButton.tsx`

```tsx
import { PermissionButton } from '@/components/permissions/PermissionButton';

<PermissionButton
  permission="task.create"
  onClick={handleCreate}
  className="btn btn-primary"
>
  Tạo task mới
</PermissionButton>
```

### 7. PermissionActionMenu Component

Dropdown menu that filters actions based on permissions.

```tsx
import { PermissionActionMenu } from '@/components/permissions/PermissionButton';

<PermissionActionMenu
  buttonLabel="Thao tác"
  actions={[
    {
      label: 'Chỉnh sửa',
      permission: 'task.update',
      onClick: handleEdit,
    },
    {
      label: 'Xóa',
      permission: 'task.delete',
      onClick: handleDelete,
      className: 'text-red-600',
    },
  ]}
/>
```

## Getting Permissions from Backend

### Method 1: Via Inertia Props (Recommended)

**In Laravel Controller:**
```php
use App\Services\Project\PermissionService;

public function show($projectId)
{
    $user = auth('admin')->user();
    $permissionService = app(PermissionService::class);
    
    $permissions = $permissionService->getUserPermissionsInProject(
        $user->id,
        $projectId
    );
    
    $role = $permissionService->getUserRoleInProject(
        $user->id,
        $projectId
    );
    
    return Inertia::render('Project/Show', [
        'project' => $project,
        'userPermissions' => $permissions,
        'userRole' => $role,
    ]);
}
```

**In React Component:**
```tsx
interface Props {
  project: Project;
  userPermissions: string[];
  userRole: {
    name: string;
    display_name: string;
    priority: number;
  };
}

const ProjectShow: React.FC<Props> = ({ project, userPermissions, userRole }) => {
  return (
    <PermissionProvider permissions={userPermissions} role={userRole}>
      <ProjectDetail project={project} />
    </PermissionProvider>
  );
};
```

### Method 2: Via API Call

```typescript
interface ProjectResponse {
  project: Project;
  user_permissions: string[];
  user_role: {
    name: string;
    display_name: string;
    priority: number;
  };
}

const fetchProjectWithPermissions = async (projectId: number) => {
  const response = await fetch(`/api/projects/${projectId}`);
  const data: ProjectResponse = await response.json();
  
  return data;
};

// In component
const [permissions, setPermissions] = useState<string[]>([]);
const [role, setRole] = useState<Role | null>(null);

useEffect(() => {
  fetchProjectWithPermissions(projectId).then(data => {
    setPermissions(data.user_permissions);
    setRole(data.user_role);
  });
}, [projectId]);
```

## Complete Integration Example

See `resources/js/pages/project/ExampleWithRBAC.tsx` for a full working example.

**Basic Structure:**

```tsx
import { PermissionProvider } from '@/contexts/PermissionContext';
import { Can } from '@/components/permissions/Can';
import { PermissionButton } from '@/components/permissions/PermissionButton';

interface ProjectPageProps {
  project: Project;
  userPermissions: string[];
  userRole: Role;
}

const ProjectPage: React.FC<ProjectPageProps> = ({ 
  project, 
  userPermissions, 
  userRole 
}) => {
  return (
    <PermissionProvider permissions={userPermissions} role={userRole}>
      <div className="container">
        {/* Header with actions */}
        <div className="header">
          <h1>{project.ten_du_an}</h1>
          
          <div className="actions">
            <PermissionButton
              permission="task.create"
              onClick={handleCreateTask}
              className="btn btn-primary"
            >
              Tạo task
            </PermissionButton>

            <Can permission="project.update">
              <button onClick={handleEdit}>Chỉnh sửa</button>
            </Can>

            <Can permission="project.delete">
              <button onClick={handleDelete} className="btn-danger">
                Xóa dự án
              </button>
            </Can>
          </div>
        </div>

        {/* Content */}
        <ProjectContent project={project} />
      </div>
    </PermissionProvider>
  );
};
```

## Common Patterns

### 1. Conditional Form Fields

```tsx
<Can permission="task.view">
  <div>
    <label>Tên task</label>
    <input type="text" value={taskName} readOnly />
  </div>
</Can>

<Can permission="task.update">
  <div>
    <label>Mô tả</label>
    <textarea value={description} onChange={handleChange} />
  </div>
</Can>
```

### 2. Disabled vs Hidden

```tsx
// Option 1: Hide if no permission
<Can permission="task.delete">
  <button onClick={handleDelete}>Xóa</button>
</Can>

// Option 2: Show but disable
const { hasPermission } = usePermission();

<button 
  onClick={handleDelete}
  disabled={!hasPermission('task.delete')}
  title={!hasPermission('task.delete') ? 'Bạn không có quyền' : ''}
>
  Xóa
</button>
```

### 3. Permission-based Tabs

```tsx
const tabs = [
  { 
    label: 'Tổng quan', 
    permission: 'project.view',
    component: <Overview />
  },
  { 
    label: 'Tasks', 
    permission: 'task.view',
    component: <TaskList />
  },
  { 
    label: 'Thành viên', 
    permission: 'project.manage_members',
    component: <MemberList />
  },
];

const { hasPermission } = usePermission();

const visibleTabs = tabs.filter(tab => hasPermission(tab.permission));

<Tabs>
  {visibleTabs.map(tab => (
    <Tab key={tab.label} label={tab.label}>
      {tab.component}
    </Tab>
  ))}
</Tabs>
```

### 4. Permission-based Menu Items

```tsx
const menuItems = [
  { label: 'Xem', icon: Eye, permission: 'project.view', action: handleView },
  { label: 'Sửa', icon: Edit, permission: 'project.update', action: handleEdit },
  { label: 'Xóa', icon: Trash, permission: 'project.delete', action: handleDelete },
];

const { hasPermission } = usePermission();

<Menu>
  {menuItems
    .filter(item => hasPermission(item.permission))
    .map(item => (
      <MenuItem key={item.label} onClick={item.action}>
        <item.icon /> {item.label}
      </MenuItem>
    ))
  }
</Menu>
```

### 5. Own vs Any Logic

For permissions like `task.update` vs `task.update_own`:

```tsx
const { hasPermission } = usePermission();
const currentUserId = auth.user.id;

const canEdit = 
  hasPermission('task.update') || 
  (hasPermission('task.update_own') && task.nguoi_thuc_hien_id === currentUserId);

<button disabled={!canEdit}>Chỉnh sửa</button>
```

Or use the helper:

```tsx
<Can anyPermission={['task.update', 'task.update_own']}>
  {/* But you still need to check ownership in backend! */}
  <button onClick={handleEdit}>Chỉnh sửa</button>
</Can>
```

## Permission List Reference

**Project Permissions:**
- `project.view` - View project details
- `project.create` - Create new projects
- `project.update` - Update project
- `project.delete` - Delete project
- `project.manage_members` - Manage members

**Task Permissions:**
- `task.view` - View tasks
- `task.create` - Create tasks
- `task.update` - Update any task
- `task.update_own` - Update only assigned tasks
- `task.delete` - Delete tasks
- `task.assign` - Assign tasks

**Comment Permissions:**
- `comment.create` - Add comments
- `comment.delete` - Delete any comment
- `comment.delete_own` - Delete own comments

**Attachment Permissions:**
- `attachment.upload` - Upload files
- `attachment.download` - Download files
- `attachment.delete` - Delete attachments

**Time Tracking Permissions:**
- `time.log` - Log work time
- `time.view_all` - View all time logs
- `time.delete` - Delete time logs

**Dashboard Permissions:**
- `dashboard.view` - View dashboard
- `dashboard.export` - Export data

## Best Practices

1. **Always use PermissionProvider** at the top of your project pages
2. **Get permissions once** from backend, don't fetch repeatedly
3. **Hide vs Disable**: Hide sensitive actions, disable less critical ones
4. **Backend validation**: Frontend checks are for UX only - always validate on backend
5. **Use semantic permission names** that match backend permissions exactly
6. **Cache permissions** if navigating within same project
7. **Show helpful messages** when actions are disabled due to permissions
8. **Test with different roles** to ensure UI adapts correctly

## Troubleshooting

**Error: "usePermission must be used within a PermissionProvider"**
- Ensure your component is wrapped with `<PermissionProvider>`

**Permissions not updating:**
- Check if you're passing fresh permissions from backend
- Clear component state/cache if needed

**All buttons hidden:**
- Verify permissions array is not empty
- Check permission names match exactly (case-sensitive)
- Ensure backend is returning permissions correctly

**TypeScript errors:**
- Ensure you've imported types correctly
- Check `userRole` has all required fields: `name`, `display_name`, `priority`
