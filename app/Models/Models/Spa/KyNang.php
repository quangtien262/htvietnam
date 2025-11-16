<?php

namespace App\Models\Spa;

use Illuminate\Database\Eloquent\Model;

class KyNang extends Model
{
    protected $table = 'spa_ky_nang';

    protected $fillable = [
        'name',
        'color',
        'sort_order',
        'note',
        'created_by',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('name', 'asc');
    }
}
