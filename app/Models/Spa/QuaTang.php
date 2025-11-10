<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class QuaTang extends Model
{
    use SoftDeletes;

    protected $table = 'spa_qua_tang';

    protected $fillable = [
        'ma_qua',
        'ten_qua',
        'mo_ta',
        'hinh_anh',
        'diem_can_doi',
        'so_luong_ton',
        'trang_thai',
    ];

    protected $casts = [
        'diem_can_doi' => 'integer',
        'so_luong_ton' => 'integer',
    ];

    // Relationships
    public function doiQuas()
    {
        return $this->hasMany(DoiQua::class, 'qua_id');
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('trang_thai', 'available')
            ->where('so_luong_ton', '>', 0);
    }

    public function scopeOutOfStock($query)
    {
        return $query->where('so_luong_ton', '<=', 0);
    }

    // Accessors
    public function getIsAvailableAttribute()
    {
        return $this->trang_thai === 'available' && $this->so_luong_ton > 0;
    }
}
