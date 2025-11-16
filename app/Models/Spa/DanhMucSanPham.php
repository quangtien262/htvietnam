<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class DanhMucSanPham extends Model
{
    protected $table = 'spa_danh_muc_san_pham';

    protected $fillable = [
        'ma_danh_muc',
        'ten_danh_muc',
        'parent_id',
        'icon',
        'thu_tu',
        'trang_thai',
    ];

    protected $casts = [
        'parent_id' => 'integer',
        'thu_tu' => 'integer',
    ];

    // Relationships
    public function sanPhams()
    {
        return $this->hasMany(SanPham::class, 'danh_muc_id');
    }

    public function parent()
    {
        return $this->belongsTo(DanhMucSanPham::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(DanhMucSanPham::class, 'parent_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('trang_thai', 'active');
    }

    public function scopeRootCategories($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('thu_tu', 'asc');
    }
}
