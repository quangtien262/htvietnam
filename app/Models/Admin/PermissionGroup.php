<?php

namespace App\Models\Admin;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PermissionGroup extends Model
{
    use HasFactory;
    protected $table = 'permission_group';

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'permission' => Json::class
    ];

}
