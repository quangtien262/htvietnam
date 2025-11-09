<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HangHoa extends Model
{
    use HasFactory;

    protected $table = 'hang_hoa';

    protected $fillable = [
        'loai_hang_hoa_id',
        'don_vi_hang_hoa_id',
        'name',
        'code',
        'price_default',
        'so_luong_default',
        'vat',
        'unit',
        'description',
        'status'
    ];

    protected $casts = [
        'price_default' => 'decimal:2',
        'vat' => 'decimal:2',
        'so_luong_default' => 'integer',
        'status' => 'integer'
    ];

    /**
     * Generate mã hàng hóa tự động
     */
    public static function generateCode()
    {
        $lastHangHoa = self::orderBy('id', 'desc')->first();
        
        if (!$lastHangHoa) {
            return 'HH00001';
        }
        
        $lastNumber = (int) substr($lastHangHoa->code, 2);
        $newNumber = $lastNumber + 1;
        
        return 'HH' . str_pad($newNumber, 5, '0', STR_PAD_LEFT);
    }

    public function loaiHangHoa()
    {
        return $this->belongsTo(LoaiHangHoa::class, 'loai_hang_hoa_id');
    }

    public function donViHangHoa()
    {
        return $this->belongsTo(DonViHangHoa::class, 'don_vi_hang_hoa_id');
    }
}
