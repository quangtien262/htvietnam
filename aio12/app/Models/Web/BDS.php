<?php

namespace App\Models\Web;
use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;

class BDS extends Model {
    protected $table = 'bds';

    /**
     * The attributes that are mass assignable.
     *
     * @var string[]
     */
    protected $fillable = [
        'name',
        'menu_id',
        'price',
        'promo_price',
        'images',
        'dien_tich',
        'bds_type_id',
        'province_id',
        'district_id',
        'ward_id',
        'address',
        'hop_dong_toi_thieu',
        'tien_ich',
        'description',
        'content',
        'meta_keyword',
        'meta_description',
        'is_front',
        'con_hang',
        'khong_gian',
        'vi_tri',
        'cho_de_xe',
        'vat_nuoi',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'images' => Json::class,
    ];
}
