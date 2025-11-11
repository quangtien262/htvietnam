<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;

class TaskStatus extends Model
{
    protected $table = 'pro___task_statuses';

    protected $fillable = [
        'ten_trang_thai',
        'ma_mau',
        'thu_tu',
        'is_done',
        'is_active',
    ];

    protected $casts = [
        'is_done' => 'boolean',
        'is_active' => 'boolean',
        'thu_tu' => 'integer',
    ];
}
