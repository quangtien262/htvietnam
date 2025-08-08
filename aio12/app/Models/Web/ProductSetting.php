<?php

namespace App\Models\Web;

use App\Casts\Json;
use App\Services\User\UserService;
use Illuminate\Database\Eloquent\Model;

class ProductSetting extends Model {

    //
    protected $table = 'product_setting';

    static function query($langId = null) {
        if(empty($langId)) {
            $langId = UserService::getLang();
        }
        $query = self::select(
            'product_setting.id as id',
            'product_setting.image as image',
            'product_setting.created_at as created_at',
            'product_setting.updated_at as updated_at',

            'product_setting_data.name_data as name',
            'product_setting_data.description as description',
            'product_setting_data.content as content',
            'product_setting_data.id as data_lang_id',
            'product_setting_data.languages_id as languages_id',
        )
        ->leftJoin('product_setting_data', 'product_setting_data.data_id', '=', 'product_setting.id')
        ->where('product_setting_data.languages_id', $langId);
        return $query;
    }
}
