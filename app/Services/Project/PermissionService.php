<?php

namespace App\Services\Project;

use App\Models\Project\Permission;
use App\Models\Project\Role;
use App\Models\Project\ProjectMember;
use Illuminate\Support\Facades\Cache;

class PermissionService
{
    /**
     * Check if user has permission in a project
     *
     * @param int $userId
     * @param int $projectId
     * @param string $permissionName
     * @return bool
     */
    public function userHasPermissionInProject($userId, $projectId, $permissionName)
    {
        // Super admin (ID = 1) always has full permissions
        if ($userId === 1) {
            return true;
        }

        $cacheKey = "user_{$userId}_project_{$projectId}_permission_{$permissionName}";

        return Cache::remember($cacheKey, 3600, function () use ($userId, $projectId, $permissionName) {
            $member = ProjectMember::where('project_id', $projectId)
                ->where('admin_user_id', $userId)
                ->where('is_active', true)
                ->with('role.permissions')
                ->first();

            if (!$member) {
                return false;
            }

            return $member->hasPermission($permissionName);
        });
    }

    /**
     * Check if user has any of the given permissions in a project
     *
     * @param int $userId
     * @param int $projectId
     * @param array $permissions
     * @return bool
     */
    public function userHasAnyPermissionInProject($userId, $projectId, array $permissions)
    {
        foreach ($permissions as $permission) {
            if ($this->userHasPermissionInProject($userId, $projectId, $permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get all permissions for a user in a project
     *
     * @param int $userId
     * @param int $projectId
     * @return array
     */
    public function getUserPermissionsInProject($userId, $projectId)
    {
        // Super admin (ID = 1) always has all permissions
        if ($userId === 1) {
            return Permission::pluck('name')->toArray();
        }

        $cacheKey = "user_{$userId}_project_{$projectId}_permissions";

        return Cache::remember($cacheKey, 3600, function () use ($userId, $projectId) {
            $member = ProjectMember::where('project_id', $projectId)
                ->where('admin_user_id', $userId)
                ->where('is_active', true)
                ->with('role.permissions')
                ->first();

            if (!$member || !$member->role) {
                return [];
            }

            return $member->role->permissions->pluck('name')->toArray();
        });
    }

    /**
     * Get user's role in a project
     *
     * @param int $userId
     * @param int $projectId
     * @return Role|null
     */
    public function getUserRoleInProject($userId, $projectId)
    {
        $member = ProjectMember::where('project_id', $projectId)
            ->where('admin_user_id', $userId)
            ->where('is_active', true)
            ->with('role')
            ->first();

        return $member ? $member->role : null;
    }

    /**
     * Assign role to user in project
     *
     * @param int $userId
     * @param int $projectId
     * @param int $roleId
     * @return bool
     */
    public function assignRoleToUser($userId, $projectId, $roleId)
    {
        $member = ProjectMember::where('project_id', $projectId)
            ->where('admin_user_id', $userId)
            ->first();

        if (!$member) {
            return false;
        }

        $member->role_id = $roleId;
        $member->save();

        // Clear cache
        Cache::forget("user_{$userId}_project_{$projectId}_permissions");

        return true;
    }

    /**
     * Get all available permissions grouped by category
     *
     * @return array
     */
    public function getAllPermissionsGrouped()
    {
        return Permission::all()->groupBy('group')->toArray();
    }

    /**
     * Get all available roles
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAllRoles()
    {
        return Role::orderBy('priority', 'desc')->get();
    }

    /**
     * Clear permission cache for user in project
     *
     * @param int $userId
     * @param int $projectId
     */
    public function clearPermissionCache($userId, $projectId)
    {
        Cache::forget("user_{$userId}_project_{$projectId}_permissions");

        // Clear individual permission caches
        $permissions = Permission::pluck('name');
        foreach ($permissions as $permission) {
            Cache::forget("user_{$userId}_project_{$projectId}_permission_{$permission}");
        }
    }
}
