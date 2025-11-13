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

    protected $appends = [
        'supplier_name',
        'loai_chi_name',
        'apartment_name',
        'room_name',
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

    // Accessors
    public function getSupplierNameAttribute()
    {
        return $this->supplier ? $this->supplier->name : null;
    }

    public function getLoaiChiNameAttribute()
    {
        return $this->loaiChi ? $this->loaiChi->name : null;
    }

    public function getApartmentNameAttribute()
    {
        return $this->apartment ? $this->apartment->name : null;
    }

    public function getRoomNameAttribute()
    {
        return $this->room ? $this->room->name : null;
    }
}
