<?php

namespace App\Models\Project;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $table = 'pro___activity_logs';

    protected $fillable = [
        'loai_doi_tuong',
        'doi_tuong_id',
        'hanh_dong',
        'mo_ta',
        'du_lieu_cu',
        'du_lieu_moi',
        'admin_user_id',
    ];

    protected $casts = [
        'du_lieu_cu' => 'array',
        'du_lieu_moi' => 'array',
    ];

    public function adminUser(): BelongsTo
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'admin_user_id');
    }
}
