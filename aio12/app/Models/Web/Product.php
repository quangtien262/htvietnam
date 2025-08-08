<?php

namespace App\Models\Web;

use App\Casts\Json;
use App\Services\User\UserService;
use Illuminate\Database\Eloquent\Model;

class Product extends Model {

    //
    protected $table = 'products';

    static function query($checkActive = true, $langId = null) {
        if(empty($langId)) {
            $langId = UserService::getLang();
        }
        $query = self::select(
            'products.id as id',
            'products.menu_id as menu_id',
            'products.image as image',
            'products.images as images',
            'products.price as price',
            'products.promo_price as promo_price',
            'products.is_active as is_active',
            'products.created_at as created_at',
            'products.updated_at as updated_at',

            'products_data.name_data as name',
            'products_data.description as description',
            'products_data.content as content',
            'products_data.meta_title as meta_title',
            'products_data.meta_keyword as meta_keyword',
            'products_data.meta_description as meta_description',
            'products_data.content_promo as content_promo',
            'products_data.id as data_lang_id',
            'products_data.languages_id as languages_id',
            // 'products_data.name_meta as name_meta',
        )
        ->leftJoin('products_data', 'products_data.data_id', '=', 'products.id')
        ->where('products_data.languages_id', $langId);
        return $query;
    }

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'images' => Json::class,
    ];
}
