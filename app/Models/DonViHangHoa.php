<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DonViHangHoa extends Model
{
    use HasFactory;

    protected $table = 'don_vi_hang_hoa';

    protected $fillable = [
        'name',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    // Relationship với HangHoa
    public function hangHoas()
    {
        return $this->hasMany(HangHoa::class, 'don_vi_hang_hoa_id');
    }
}
