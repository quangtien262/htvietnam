<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $table = 'pro___permissions';

    protected $fillable = [
        'name',
        'display_name',
        'group',
        'description',
    ];

    /**
     * Get roles that have this permission
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'pro___role_permission', 'permission_id', 'role_id')
            ->withTimestamps();
    }
}
