<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectChecklist extends Model
{
    protected $table = 'pro___project_checklists';

    protected $fillable = [
        'project_id',
        'noi_dung',
        'is_completed',
        'assigned_to',
        'mo_ta',
        'sort_order',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'sort_order' => 'integer',
        'assigned_to' => 'integer',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'assigned_to');
    }
}
