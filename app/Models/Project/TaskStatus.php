<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;

class TaskStatus extends Model
{
    protected $table = 'pro___task_statuses';

    protected $fillable = [
        'name',
        'color',
        'icon',
        'sort_order',
        'note',
        'is_done',
        'is_active',
    ];

    protected $casts = [
        'is_done' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
