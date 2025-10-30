<?php

namespace App\Models\Web;

use App\Casts\Json;
use App\Services\User\UserService;
use Illuminate\Database\Eloquent\Model;

class ProductInfo extends Model {

    //
    protected $table = 'product_info';

    static function query($langId = null) {
        if(empty($langId)) {
            $langId = UserService::getLang();
        }
        $query = self::select(
            'product_info.id as id',
            'product_info.image as image',
            'product_info.created_at as created_at',
            'product_info.updated_at as updated_at',

            'product_info_data.name_data as name',
            'product_info_data.description as description',
            'product_info_data.content as content',
            'product_info_data.id as data_lang_id',
            'product_info_data.languages_id as languages_id',
            // 'product_info_data.name_meta as name_meta',
        )
        ->leftJoin('product_info_data', 'product_info_data.data_id', '=', 'product_info.id')
        ->where('product_info_data.languages_id', $langId);
        return $query;
    }
}
