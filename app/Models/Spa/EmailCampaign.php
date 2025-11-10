<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Casts\Json;

class EmailCampaign extends Model
{
    use SoftDeletes;

    protected $table = 'spa_email_campaign';

    protected $fillable = [
        'ten_chien_dich',
        'chu_de',
        'noi_dung',
        'danh_sach_email',
        'ngay_gui',
        'so_luong_gui',
        'so_luong_mo',
        'ty_le_mo',
        'trang_thai',
    ];

    protected $casts = [
        'danh_sach_email' => Json::class,
        'ngay_gui' => 'datetime',
        'so_luong_gui' => 'integer',
        'so_luong_mo' => 'integer',
        'ty_le_mo' => 'decimal:2',
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

    // Business Logic
    public function updateOpenRate()
    {
        if ($this->so_luong_gui > 0) {
            $this->ty_le_mo = ($this->so_luong_mo / $this->so_luong_gui) * 100;
            $this->save();
        }
    }

    public function recordOpen()
    {
        $this->so_luong_mo += 1;
        $this->updateOpenRate();
    }
}
