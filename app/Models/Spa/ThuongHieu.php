<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class ThuongHieu extends Model
{
    protected $table = 'spa_thuong_hieu';

    protected $fillable = [
        'ma_thuong_hieu',
        'ten_thuong_hieu',
        'logo',
        'mo_ta',
        'website',
        'quoc_gia',
        'trang_thai',
    ];

    // Relationships
    public function sanPhams()
    {
        return $this->hasMany(SanPham::class, 'thuong_hieu_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('trang_thai', 'active');
    }

    public function scopeByCountry($query, $country)
    {
        return $query->where('quoc_gia', $country);
    }
}
