<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskChecklist extends Model
{
    protected $table = 'pro___task_checklists';

    protected $fillable = [
        'task_id',
        'noi_dung',
        'is_completed',
        'thu_tu',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'thu_tu' => 'integer',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'task_id');
    }
}
