<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskComment extends Model
{
    use SoftDeletes;

    protected $table = 'pro___task_comments';

    protected $fillable = [
        'task_id',
        'admin_user_id',
        'noi_dung',
        'parent_id',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function adminUser(): BelongsTo
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'admin_user_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(TaskComment::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(TaskComment::class, 'parent_id');
    }
}
