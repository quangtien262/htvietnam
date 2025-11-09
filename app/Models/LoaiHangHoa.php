<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoaiHangHoa extends Model
{
    use HasFactory;

    protected $table = 'loai_hang_hoa';

    protected $fillable = [
        'name',
        'color',
        'sort_order'
    ];

    protected $casts = [
        'sort_order' => 'integer'
    ];

    public function hangHoa()
    {
        return $this->hasMany(HangHoa::class, 'loai_hang_hoa_id');
    }
}
