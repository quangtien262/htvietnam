<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DanhMucDichVu extends Model
{
    use SoftDeletes;

    protected $table = 'spa_danh_muc_dich_vu';

    protected $fillable = [
        'ma_danh_muc',
        'ten_danh_muc',
        'parent_id',
        'mo_ta',
        'icon',
        'thu_tu',
        'trang_thai',
    ];

    protected $casts = [
        'parent_id' => 'integer',
        'thu_tu' => 'integer',
    ];

    // Relationships
    public function dichVus()
    {
        return $this->hasMany(DichVu::class, 'danh_muc_id');
    }

    public function parent()
    {
        return $this->belongsTo(DanhMucDichVu::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(DanhMucDichVu::class, 'parent_id');
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
