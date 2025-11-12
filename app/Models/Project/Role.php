<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'pro___roles';

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'priority',
    ];

    /**
     * Get permissions for this role
     */
    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'pro___role_permission', 'role_id', 'permission_id')
            ->withTimestamps();
    }

    /**
     * Check if role has a specific permission
     *
     * @param string $permissionName
     * @return bool
     */
    public function hasPermission($permissionName)
    {
        return $this->permissions()->where('name', $permissionName)->exists();
    }

    /**
     * Check if role has any of the given permissions
     *
     * @param array $permissions
     * @return bool
     */
    public function hasAnyPermission(array $permissions)
    {
        return $this->permissions()->whereIn('name', $permissions)->exists();
    }

    /**
     * Check if role has all of the given permissions
     *
     * @param array $permissions
     * @return bool
     */
    public function hasAllPermissions(array $permissions)
    {
        $rolePermissions = $this->permissions()->pluck('name')->toArray();
        return count(array_intersect($permissions, $rolePermissions)) === count($permissions);
    }

    /**
     * Get members with this role
     */
    public function members()
    {
        return $this->hasMany(ProjectMember::class, 'role_id');
    }
}
