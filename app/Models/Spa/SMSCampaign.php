<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Casts\Json;

class SMSCampaign extends Model
{
    use SoftDeletes;

    protected $table = 'spa_sms_campaign';

    protected $fillable = [
        'ten_chien_dich',
        'noi_dung',
        'danh_sach_sdt',
        'ngay_gui',
        'so_luong_gui',
        'trang_thai',
    ];

    protected $casts = [
        'danh_sach_sdt' => Json::class,
        'ngay_gui' => 'datetime',
        'so_luong_gui' => 'integer',
    ];

    // Scopes
    public function scopeSent($query)
    {
        return $query->where('trang_thai', 'da_gui');
    }

    public function scopeDraft($query)
    {
        return $query->where('trang_thai', 'nhap');
    }

    public function scopeScheduled($query)
    {
        return $query->where('trang_thai', 'hen_gio');
    }
}
