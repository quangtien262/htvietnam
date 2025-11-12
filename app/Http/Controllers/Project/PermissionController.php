<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Services\Project\PermissionService;
use App\Models\Project\ProjectMember;
use App\Models\Project\Role;
use App\Models\Project\Permission;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class PermissionController extends Controller
{
    use AuthorizesRequests;

    protected $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    /**
     * Get all members of a project with their roles
     */
    public function getProjectMembers($projectId)
    {
        try {
            $members = ProjectMember::where('project_id', $projectId)
                ->with(['adminUser', 'role'])
                ->get()
                ->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'admin_user_id' => $member->admin_user_id,
                        'admin_user_name' => $member->adminUser->name ?? 'Unknown',
                        'vai_tro' => $member->vai_tro,
                        'role_id' => $member->role_id,
                        'role_name' => $member->role->name ?? null,
                        'role_display_name' => $member->role->display_name ?? null,
                        'role_priority' => $member->role->priority ?? null,
                        'is_active' => $member->is_active,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $members,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all available roles
     */
    public function getRoles()
    {
        try {
            $roles = Role::orderBy('priority', 'desc')->get();

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
     * Get all permissions
     */
    public function getPermissions()
    {
        try {
            $permissions = Permission::orderBy('group')->orderBy('name')->get();

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

    /**
     * Assign role to a project member
     */
    public function assignRole(Request $request, $projectId, $memberId)
    {
        try {
            $validated = $request->validate([
                'role_id' => 'required|exists:pro___roles,id',
            ]);

            $member = ProjectMember::where('project_id', $projectId)
                ->where('id', $memberId)
                ->firstOrFail();

            $project = $member->project;
            $targetRole = Role::findOrFail($validated['role_id']);

            // Check if user has permission to manage members
            $user = auth('admin_users')->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            // Super admin (ID = 1) can assign any role
            if ($user->id !== 1) {
                // Get user's role in project
                $userRole = $this->permissionService->getUserRoleInProject($user->id, $projectId);

                // Check if user has higher priority than target role
                if (!$userRole || $userRole->priority <= $targetRole->priority) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Bạn chỉ có thể phân quyền role có priority thấp hơn role của bạn',
                    ], 403);
                }
            }

            // Assign role
            $this->permissionService->assignRoleToUser(
                $member->admin_user_id,
                $projectId,
                $validated['role_id']
            );

            return response()->json([
                'success' => true,
                'message' => 'Phân quyền thành công',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user's permissions in a project
     */
    public function getUserPermissions(Request $request, $projectId)
    {
        try {
            $user = auth('admin_users')->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 401);
            }

            $permissions = $this->permissionService->getUserPermissionsInProject(
                $user->id,
                $projectId
            );

            $role = $this->permissionService->getUserRoleInProject(
                $user->id,
                $projectId
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'permissions' => $permissions,
                    'role' => $role,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
