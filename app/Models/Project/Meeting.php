<?php

namespace App\Models\Project;

use App\Models\AdminUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Meeting extends Model
{
    use SoftDeletes;

    protected $table = 'pro___meeting';

    protected $fillable = [
        'name',
        'meeting_status_id',
        'content',
        'meeting_type',
        'scheduled_at',
        'started_at',
        'ended_at',
        'created_by',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    // Relationships
    public function status()
    {
        return $this->belongsTo(MeetingStatus::class, 'meeting_status_id');
    }

    public function creator()
    {
        return $this->belongsTo(AdminUser::class, 'created_by');
    }

    public function tasks()
    {
        return $this->belongsToMany(
            Task::class,
            'pro___meeting_tasks',
            'meeting_id',
            'task_id'
        )
        ->withPivot('note', 'sort_order')
        ->withTimestamps()
        ->orderBy('pro___meeting_tasks.sort_order');
    }

    public function projects()
    {
        return $this->belongsToMany(
            Project::class,
            'pro___meeting_projects',
            'meeting_id',
            'project_id'
        )
        ->withPivot('note', 'sort_order')
        ->withTimestamps()
        ->orderBy('pro___meeting_projects.sort_order');
    }
}
