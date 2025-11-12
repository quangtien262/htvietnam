<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Services\Project\ProjectService;
use App\Services\Project\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

/**
 * EXAMPLE CONTROLLER: Demonstrates RBAC usage
 *
 * This controller shows how to integrate permission checks in your Project controllers.
 * You can copy these patterns to your actual controllers.
 */
class ExampleProjectControllerWithRBAC extends Controller
{
    use AuthorizesRequests;

    protected $projectService;
    protected $permissionService;

    public function __construct(
        ProjectService $projectService,
        PermissionService $permissionService
    ) {
        $this->projectService = $projectService;
        $this->permissionService = $permissionService;
    }

    /**
     * Example 1: Using Policy with $this->authorize()
     *
     * This is the recommended approach - Laravel will automatically
     * call the appropriate policy method
     */
    public function show($id)
    {
        try {
            $project = $this->projectService->getById($id);

            // Automatically calls ProjectPolicy::view()
            // Throws AuthorizationException if permission denied
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

    /**
     * Example 2: Using Policy for update action
     */
    public function update(Request $request, $id)
    {
        try {
            $project = $this->projectService->getById($id);

            // Check permission via policy
            $this->authorize('update', $project);

            $validated = $request->validate([
                'ten_du_an' => 'sometimes|required|string|max:255',
                'mo_ta' => 'nullable|string',
                'trang_thai_id' => 'sometimes|required|exists:pro___project_statuses,id',
                'uu_tien_id' => 'sometimes|required|exists:pro___priorities,id',
                'tien_do' => 'nullable|integer|min:0|max:100',
            ]);

            $project = $this->projectService->update($id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật dự án thành công',
                'data' => $project,
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền cập nhật dự án này',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Example 3: Using PermissionService directly
     *
     * Useful when you need more control or want to check
     * permissions without throwing exceptions
     */
    public function getWithPermissions($id)
    {
        try {
            $user = auth('admin')->user();
            $project = $this->projectService->getById($id);

            // Check permission manually
            if (!$this->permissionService->userHasPermissionInProject(
                $user->id,
                $project->id,
                'project.view'
            )) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền xem dự án này',
                ], 403);
            }

            // Get all user permissions in this project
            $permissions = $this->permissionService->getUserPermissionsInProject(
                $user->id,
                $project->id
            );

            // Get user role
            $role = $this->permissionService->getUserRoleInProject(
                $user->id,
                $project->id
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'project' => $project,
                    'user_permissions' => $permissions,
                    'user_role' => $role,
                    'can_edit' => in_array('project.update', $permissions),
                    'can_delete' => in_array('project.delete', $permissions),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Example 4: Managing members with role assignment
     */
    public function assignRole(Request $request, $projectId, $memberId)
    {
        try {
            $project = $this->projectService->getById($projectId);

            // Check if user can manage members
            $this->authorize('manageMembers', $project);

            $validated = $request->validate([
                'role_id' => 'required|exists:pro___roles,id',
            ]);

            $role = \App\Models\Project\Role::findOrFail($validated['role_id']);

            // Check if user has permission to assign this role
            // (user must have higher priority role)
            $this->authorize('assignRole', [$project, $role->priority]);

            // Assign role
            $this->permissionService->assignRoleToUser(
                $memberId,
                $projectId,
                $validated['role_id']
            );

            return response()->json([
                'success' => true,
                'message' => 'Phân quyền thành công',
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền phân quyền cho thành viên này',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Example 5: Checking multiple permissions
     */
    public function performComplexAction(Request $request, $id)
    {
        try {
            $user = auth('admin')->user();
            $project = $this->projectService->getById($id);

            // Check if user has ANY of these permissions
            $canProceed = $this->permissionService->userHasAnyPermissionInProject(
                $user->id,
                $project->id,
                ['project.update', 'project.manage_members']
            );

            if (!$canProceed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn cần có quyền cập nhật hoặc quản lý thành viên',
                ], 403);
            }

            // Perform the action...

            return response()->json([
                'success' => true,
                'message' => 'Thực hiện thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Example 6: Get available roles for dropdown
     */
    public function getAvailableRoles()
    {
        try {
            $roles = $this->permissionService->getAllRoles();

            return response()->json([
                'success' => true,
                'data' => $roles,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Example 7: Get all permissions grouped by category
     */
    public function getPermissions()
    {
        try {
            $permissions = $this->permissionService->getAllPermissionsGrouped();

            return response()->json([
                'success' => true,
                'data' => $permissions,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
