<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeLog extends Model
{
    protected $table = 'pro___time_logs';

    protected $fillable = [
        'task_id',
        'admin_user_id',
        'thoi_gian_bat_dau',
        'thoi_gian_ket_thuc',
        'so_phut',
        'ghi_chu',
    ];

    protected $casts = [
        'thoi_gian_bat_dau' => 'datetime',
        'thoi_gian_ket_thuc' => 'datetime',
        'so_phut' => 'integer',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function adminUser(): BelongsTo
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'admin_user_id');
    }
}
