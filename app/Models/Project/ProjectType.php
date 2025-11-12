<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;

class ProjectType extends Model
{
    protected $table = 'pro___project_types';

    protected $fillable = [
        'name',
        'note',
        'color',
        'icon',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
