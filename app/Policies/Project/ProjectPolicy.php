<?php

namespace App\Policies\Project;

use App\Models\AdminUser;
use App\Models\Project\Project;
use App\Services\Project\PermissionService;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProjectPolicy
{
    use HandlesAuthorization;

    protected $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    /**
     * Determine if the user can view any projects.
     */
    public function viewAny(AdminUser $user)
    {
        // All authenticated admin users can view projects list
        return true;
    }

    /**
     * Determine if the user can view the project.
     */
    public function view(AdminUser $user, Project $project)
    {
        \Log::info('ProjectPolicy::view check', [
            'user_id' => $user->id,
            'project_id' => $project->id,
            'is_super_admin' => $user->id === 1,
            'is_pm' => $project->quan_ly_du_an_id === $user->id,
            'pm_id' => $project->quan_ly_du_an_id,
            'is_creator' => $project->created_by === $user->id,
            'creator_id' => $project->created_by,
        ]);

        // Super admin (ID = 1) always has full permissions
        if ($user->id === 1) {
            \Log::info('ProjectPolicy::view - Allowed: Super admin');
            return true;
        }

        // User is the project manager (in project table)
        if ($project->quan_ly_du_an_id === $user->id) {
            \Log::info('ProjectPolicy::view - Allowed: Project manager');
            return true;
        }

        // User created the project
        if ($project->created_by === $user->id) {
            \Log::info('ProjectPolicy::view - Allowed: Creator');
            return true;
        }

        // Check if user is active member with vai_tro = 'quan_ly'
        $member = $project->members()->where('admin_user_id', $user->id)
            ->where('is_active', true)
            ->first();

        if ($member) {
            // Member với vai_tro = 'quan_ly' có toàn quyền
            if ($member->vai_tro === 'quan_ly') {
                \Log::info('ProjectPolicy::view - Allowed: Member with quan_ly role');
                return true;
            }

            // Member với vai_tro = 'xem' hoặc 'thanh_vien' có quyền xem project
            if (in_array($member->vai_tro, ['xem', 'thanh_vien'])) {
                \Log::info('ProjectPolicy::view - Allowed: Active member (xem/thanh_vien)');
                return true;
            }
        }

        // Fallback: User is a member with view permission via role system
        $hasPermission = $this->permissionService->userHasPermissionInProject(
            $user->id,
            $project->id,
            'project.view'
        );

        \Log::info('ProjectPolicy::view - Permission check result', [
            'has_permission' => $hasPermission,
        ]);

        return $hasPermission;
    }

    /**
     * Determine if the user can create projects.
     */
    public function create(AdminUser $user)
    {
        // Project creation is a global permission, not project-specific
        // For now, allow all users - can be restricted later via a global role
        return true;
    }

    /**
     * Determine if the user can update the project.
     */
    public function update(AdminUser $user, Project $project)
    {
        // Super admin (ID = 1) always has full permissions
        if ($user->id === 1) {
            return true;
        }

        // User is the project manager
        if ($project->quan_ly_du_an_id === $user->id) {
            return true;
        }

        // User created the project
        if ($project->created_by === $user->id) {
            return true;
        }

        // Check if user is active member with vai_tro = 'quan_ly'
        $member = $project->members()->where('admin_user_id', $user->id)
            ->where('is_active', true)
            ->first();

        if ($member && $member->vai_tro === 'quan_ly') {
            return true;
        }

        return $this->permissionService->userHasPermissionInProject(
            $user->id,
            $project->id,
            'project.update'
        );
    }

    /**
     * Determine if the user can delete the project.
     */
    public function delete(AdminUser $user, Project $project)
    {
        // Super admin (ID = 1) always has full permissions
        if ($user->id === 1) {
            return true;
        }

        return $this->permissionService->userHasPermissionInProject(
            $user->id,
            $project->id,
            'project.delete'
        );
    }

    /**
     * Determine if the user can manage project members.
     */
    public function manageMembers(AdminUser $user, Project $project)
    {
        // Super admin (ID = 1) always has full permissions
        if ($user->id === 1) {
            return true;
        }

        // User is the project manager
        if ($project->quan_ly_du_an_id === $user->id) {
            return true;
        }

        // User created the project
        if ($project->created_by === $user->id) {
            return true;
        }

        // Check if user is active member with vai_tro = 'quan_ly'
        $member = $project->members()->where('admin_user_id', $user->id)
            ->where('is_active', true)
            ->first();

        if ($member && $member->vai_tro === 'quan_ly') {
            return true;
        }

        return $this->permissionService->userHasPermissionInProject(
            $user->id,
            $project->id,
            'project.manage_members'
        );
    }

    /**
     * Determine if the user can assign roles to members.
     * Only users with higher role priority can assign roles
     */
    public function assignRole(AdminUser $user, Project $project, $targetRolePriority)
    {
        // Super admin (ID = 1) always has full permissions
        if ($user->id === 1) {
            return true;
        }

        if (!$this->manageMembers($user, $project)) {
            return false;
        }

        $userRole = $this->permissionService->getUserRoleInProject($user->id, $project->id);

        if (!$userRole) {
            return false;
        }

        // User can only assign roles with lower priority than their own
        return $userRole->priority > $targetRolePriority;
    }
}
