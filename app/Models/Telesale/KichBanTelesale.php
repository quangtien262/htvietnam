<?php

namespace App\Models\Telesale;

use Illuminate\Database\Eloquent\Model;

class KichBanTelesale extends Model
{
    protected $table = 'kich_ban_telesale';
    protected $fillable = ['ten_kich_ban', 'mo_ta', 'loai_san_pham', 'loai_khach_hang', 'noi_dung_kich_ban', 'cau_hoi_mo_dau', 'xu_ly_tu_choi', 'closing_techniques', 'trang_thai'];
    protected $casts = ['cau_hoi_mo_dau' => 'array', 'xu_ly_tu_choi' => 'array', 'closing_techniques' => 'array'];

    public function scopeActive($query) { return $query->where('trang_thai', 'active'); }
}
