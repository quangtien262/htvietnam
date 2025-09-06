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
            $langId = UserService::getLang()->id;
        }
        $query = self::select(
            'products.id as id',
            'products.menu_id as menu_id',
            'products.images as images',
            'products.gia_ban as gia_ban',
            'products.gia_khuyen_mai as gia_khuyen_mai',
            'products.is_active as is_active',
            'products.created_at as created_at',
            'products.updated_at as updated_at',
            'products.file as file',

            'products_data.name_data as name_data',
            'products_data.description as description',
            'products_data.content as content',
            'products_data.content02 as content02',
            'products_data.content03 as content03',
            'products_data.meta_title as meta_title',
            'products_data.meta_keyword as meta_keyword',
            'products_data.meta_description as meta_description',
            'products_data.content_promo as content_promo',
            'products_data.id as data_lang_id',
            'products_data.languages_id as languages_id',
            // 'products_data.name_meta as name_meta',
        )
        ->leftJoin('products_data', 'products_data.data_id', '=', 'products.id')
        ->where('products_data.languages_id', $langId)
        ->where('products.product_status_id', 1); // ẩn/hiện
        
        return $query;
    }

    static function getProduct($menu, $request) {
        $query = self::query()->whereIn('products.menu_id', $menu['subMenuId']);
        if ($request->has('search')) {
            $query->where('products_data.name_data', 'like', '%' . $request->input('search') . '%');
        }
        if ($request->has('sort')) {
            $sort = $request->input('sort');
            if ($sort == 'price_asc') {
                $query->orderBy('products.price', 'asc');
            } elseif ($sort == 'price_desc') {
                $query->orderBy('products.price', 'desc');
            } else {
                $query->orderBy('products.created_at', 'desc');
            }
        } else {
            $query->orderBy('products.updated_at', 'desc');
        }
        return $query->paginate(30);
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
