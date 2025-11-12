import React from 'react';
import { PermissionProvider } from '../../contexts/PermissionContext';
import { Can, Cannot, RoleCheck } from '../../components/permissions/Can';
import { PermissionButton, PermissionActionMenu } from '../../components/permissions/PermissionButton';

/**
 * EXAMPLE: Project Detail Page with RBAC Integration
 * 
 * This example shows how to use the Permission system in a real component.
 * Copy these patterns to your actual project pages.
 */

interface ProjectDetailExampleProps {
  project: {
    id: number;
    ten_du_an: string;
    mo_ta: string;
    trang_thai: string;
  };
  // These come from the backend via Inertia props or API response
  userPermissions: string[];
  userRole: {
    name: string;
    display_name: string;
    priority: number;
  };
}

export const ProjectDetailExample: React.FC<ProjectDetailExampleProps> = ({
  project,
  userPermissions,
  userRole,
}) => {
  const handleEditProject = () => {
    console.log('Edit project');
  };

  const handleDeleteProject = () => {
    console.log('Delete project');
  };

  const handleCreateTask = () => {
    console.log('Create task');
  };

  const handleManageMembers = () => {
    console.log('Manage members');
  };

  return (
    // Wrap your component with PermissionProvider
    <PermissionProvider permissions={userPermissions} role={userRole}>
      <div className="p-6">
        {/* Header with role badge */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{project.ten_du_an}</h1>
            <p className="text-gray-600">Role: {userRole.display_name}</p>
          </div>

          {/* Action menu - only shows actions user has permission for */}
          <PermissionActionMenu
            buttonLabel="Thao tác"
            actions={[
              {
                label: 'Chỉnh sửa dự án',
                permission: 'project.update',
                onClick: handleEditProject,
              },
              {
                label: 'Quản lý thành viên',
                permission: 'project.manage_members',
                onClick: handleManageMembers,
              },
              {
                label: 'Xóa dự án',
                permission: 'project.delete',
                onClick: handleDeleteProject,
                className: 'text-red-600',
              },
            ]}
          />
        </div>

        {/* Project info */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Thông tin dự án</h2>
          <p>{project.mo_ta}</p>
          <p className="mt-2">Trạng thái: {project.trang_thai}</p>
        </div>

        {/* Conditional rendering examples */}
        <div className="space-y-4">
          {/* Example 1: Simple Can component */}
          <Can permission="task.create">
            <button onClick={handleCreateTask} className="btn btn-primary">
              Tạo task mới
            </button>
          </Can>

          {/* Example 2: Can with fallback */}
          <Can 
            permission="project.update" 
            fallback={<p className="text-gray-500">Bạn không có quyền chỉnh sửa</p>}
          >
            <button onClick={handleEditProject} className="btn btn-secondary">
              Chỉnh sửa dự án
            </button>
          </Can>

          {/* Example 3: Multiple permissions (any) */}
          <Can anyPermission={['task.update', 'task.update_own']}>
            <div className="bg-blue-50 p-4 rounded">
              <p>Bạn có thể chỉnh sửa task</p>
            </div>
          </Can>

          {/* Example 4: Multiple permissions (all required) */}
          <Can allPermissions={['task.delete', 'project.update']}>
            <div className="bg-red-50 p-4 rounded">
              <p>Bạn có quyền xóa task và cập nhật dự án</p>
            </div>
          </Can>

          {/* Example 5: Cannot component - show warning */}
          <Cannot permission="project.delete">
            <div className="bg-yellow-50 p-4 rounded">
              <p>⚠️ Bạn không có quyền xóa dự án này</p>
            </div>
          </Cannot>

          {/* Example 6: Role-based rendering */}
          <RoleCheck roles="admin">
            <div className="bg-purple-50 p-4 rounded">
              <p>👑 Chức năng chỉ dành cho Admin</p>
            </div>
          </RoleCheck>

          <RoleCheck roles={['admin', 'manager']}>
            <div className="bg-green-50 p-4 rounded">
              <p>📊 Dashboard quản lý (Admin & Manager)</p>
            </div>
          </RoleCheck>

          {/* Example 7: PermissionButton component */}
          <div className="flex gap-2">
            <PermissionButton
              permission="task.create"
              onClick={handleCreateTask}
              className="btn btn-primary"
            >
              Tạo task
            </PermissionButton>

            <PermissionButton
              permission="project.update"
              onClick={handleEditProject}
              className="btn btn-secondary"
            >
              Sửa dự án
            </PermissionButton>

            <PermissionButton
              permission="project.delete"
              onClick={handleDeleteProject}
              className="btn btn-danger"
            >
              Xóa dự án
            </PermissionButton>
          </div>
        </div>

        {/* Example 8: Conditional form fields */}
        <div className="bg-white p-4 rounded-lg shadow mt-6">
          <h2 className="text-lg font-semibold mb-4">Chi tiết task</h2>
          
          <Can permission="task.view">
            <div className="mb-4">
              <label className="block mb-2">Tên task</label>
              <input type="text" className="form-control" />
            </div>
          </Can>

          <Can anyPermission={['task.update', 'task.update_own']}>
            <div className="mb-4">
              <label className="block mb-2">Mô tả</label>
              <textarea className="form-control" rows={3} />
            </div>
          </Can>

          <Can permission="task.assign">
            <div className="mb-4">
              <label className="block mb-2">Người thực hiện</label>
              <select className="form-control">
                <option>Chọn người thực hiện</option>
              </select>
            </div>
          </Can>

          <div className="flex gap-2">
            <PermissionButton
              permission="task.update"
              onClick={() => console.log('Save')}
              className="btn btn-primary"
            >
              Lưu thay đổi
            </PermissionButton>

            <PermissionButton
              permission="task.delete"
              onClick={() => console.log('Delete')}
              className="btn btn-danger"
            >
              Xóa task
            </PermissionButton>
          </div>
        </div>
      </div>
    </PermissionProvider>
  );
};

/**
 * EXAMPLE: How to get permissions from backend
 * 
 * In your Laravel controller:
 * ```php
 * use App\Services\Project\PermissionService;
 * 
 * public function show($projectId)
 * {
 *     $user = auth('admin')->user();
 *     $permissionService = app(PermissionService::class);
 *     
 *     $permissions = $permissionService->getUserPermissionsInProject(
 *         $user->id,
 *         $projectId
 *     );
 *     
 *     $role = $permissionService->getUserRoleInProject(
 *         $user->id,
 *         $projectId
 *     );
 *     
 *     return Inertia::render('Project/Show', [
 *         'project' => $project,
 *         'userPermissions' => $permissions,
 *         'userRole' => $role,
 *     ]);
 * }
 * ```
 * 
 * Or via API:
 * ```typescript
 * const response = await fetch(`/api/projects/${projectId}`);
 * const data = await response.json();
 * 
 * // data.user_permissions = ['project.view', 'task.create', ...]
 * // data.user_role = { name: 'member', display_name: 'Thành viên', priority: 50 }
 * ```
 */
