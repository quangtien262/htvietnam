<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class SanPhamDonViQuiDoi extends Model
{
    protected $table = 'spa_san_pham_don_vi_quy_doi';

    protected $fillable = [
        'san_pham_id',
        'don_vi',
        'ty_le',
        'ghi_chu',
        'is_active',
    ];

    protected $casts = [
        'san_pham_id' => 'integer',
        'ty_le' => 'integer',
        'is_active' => 'integer',
    ];

    // Relationship
    public function sanPham()
    {
        return $this->belongsTo(SanPham::class, 'san_pham_id');
    }

    // Scope
    public function scopeActive($query)
    {
        return $query->where('is_active', 1);
    }

    // Helper
    public function getConversionText()
    {
        return "1 {$this->sanPham->don_vi_tinh} = {$this->ty_le} {$this->don_vi}";
    }
}
