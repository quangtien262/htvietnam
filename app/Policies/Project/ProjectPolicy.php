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
        return $this->permissionService->userHasPermissionInProject(
            $user->id,
            $project->id,
            'project.view'
        );
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
