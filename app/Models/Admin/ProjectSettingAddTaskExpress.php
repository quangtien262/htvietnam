<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class ProjectSettingAddTaskExpress extends Model
{
    protected $table = 'project_setting_add_task_express';

    protected $fillable = [
        'name',
        'tasks',
        'sort_order',
        'is_active',
        'create_by',
        'update_by',
    ];

    protected $casts = [
        'tasks' => 'array',
        'is_active' => 'integer',
        'sort_order' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', 1);
    }
}
