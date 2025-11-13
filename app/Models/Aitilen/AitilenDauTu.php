<?php

namespace App\Models\Aitilen;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AitilenDauTu extends Model
{
    use HasFactory;

    protected $table = 'aitilen_dau_tu';

    protected $fillable = [
        'name',
        'content',
        'supplier_id',
        'loai_chi_id',
        'apartment_id',
        'room_id',
        'is_save2soquy',
        'is_save_purchase_orders',
        'price',
        'sort_order',
    ];

    protected $casts = [
        'supplier_id' => 'integer',
        'loai_chi_id' => 'integer',
        'apartment_id' => 'integer',
        'room_id' => 'integer',
        'is_save2soquy' => 'boolean',
        'is_save_purchase_orders' => 'boolean',
        'price' => 'decimal:2',
        'sort_order' => 'integer',
    ];

    // Relationships
    public function supplier()
    {
        return $this->belongsTo(\App\Models\Supplier::class, 'supplier_id');
    }

    public function loaiChi()
    {
        return $this->belongsTo(\App\Models\Admin\LoaiChi::class, 'loai_chi_id');
    }

    public function apartment()
    {
        return $this->belongsTo(\App\Models\Admin\Apartment::class, 'apartment_id');
    }

    public function room()
    {
        return $this->belongsTo(\App\Models\Admin\Room::class, 'room_id');
    }
}
