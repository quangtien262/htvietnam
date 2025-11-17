<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class DonViSanPham extends Model
{
    protected $table = 'spa_don_vi_san_pham';

    protected $fillable = [
        'name',
        'color',
        'sort_order',
        'note',
        'created_by',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'created_by' => 'integer',
    ];

    // Scope để sắp xếp theo thứ tự
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('name', 'asc');
    }

    // Relationship với người tạo
    public function creator()
    {
        return $this->belongsTo(\App\Models\AdminUser::class, 'created_by');
    }
}
