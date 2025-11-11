<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;

class ProjectType extends Model
{
    protected $table = 'pro___project_types';

    protected $fillable = [
        'ten_loai',
        'mo_ta',
        'icon',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
