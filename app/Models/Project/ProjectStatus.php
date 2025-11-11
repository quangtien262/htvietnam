<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;

class ProjectStatus extends Model
{
    protected $table = 'pro___project_statuses';

    protected $fillable = [
        'ten_trang_thai',
        'ma_mau',
        'thu_tu',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'thu_tu' => 'integer',
    ];
}
