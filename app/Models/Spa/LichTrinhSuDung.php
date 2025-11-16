<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class LichTrinhSuDung extends Model
{
    protected $table = 'spa_lich_trinh_su_dung';

    protected $fillable = [
        'name',
        'color',
        'sort_order',
        'note',
        'created_by'
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];
}
