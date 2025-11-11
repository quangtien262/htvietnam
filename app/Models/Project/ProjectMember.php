<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectMember extends Model
{
    protected $table = 'pro___project_members';

    protected $fillable = [
        'project_id',
        'admin_user_id',
        'vai_tro',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function adminUser(): BelongsTo
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'admin_user_id');
    }
}
