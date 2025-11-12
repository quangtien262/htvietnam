<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;
use App\Models\AdminUser;

class TaskTimeLog extends Model
{
    protected $table = 'pro___task_time_logs';

    protected $fillable = [
        'task_id',
        'admin_user_id',
        'started_at',
        'ended_at',
        'duration',
        'mo_ta',
        'is_running',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'is_running' => 'boolean',
    ];

    // Relationships
    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function user()
    {
        return $this->belongsTo(AdminUser::class, 'admin_user_id');
    }

    // Helper: Get formatted duration
    public function getFormattedDurationAttribute()
    {
        if (!$this->duration) {
            return '-';
        }

        $hours = floor($this->duration / 3600);
        $minutes = floor(($this->duration % 3600) / 60);
        $seconds = $this->duration % 60;

        if ($hours > 0) {
            return sprintf('%dh %dm', $hours, $minutes);
        } elseif ($minutes > 0) {
            return sprintf('%dm %ds', $minutes, $seconds);
        } else {
            return sprintf('%ds', $seconds);
        }
    }

    // Helper: Calculate duration if running
    public function getCurrentDurationAttribute()
    {
        if ($this->is_running && $this->started_at) {
            return now()->diffInSeconds($this->started_at);
        }
        return $this->duration ?? 0;
    }
}
