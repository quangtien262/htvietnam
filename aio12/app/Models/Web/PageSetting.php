<?php

namespace App\Models\Web;

use App\Casts\Json;
use App\Services\User\UserService;
use Illuminate\Database\Eloquent\Model;

class PageSetting extends Model {

    //
    protected $table = 'page_setting';

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'table_data_ids' => Json::class,
        'images' => Json::class,
    ];

    static function query($checkActive = true, $langId = null) {
        if(empty($langId)) {
            $langId = UserService::getLang()->id;
        }
        $query = self::select(
            'page_setting.id as id',
            'page_setting.*',

            'page_setting_data.id as page_setting_data_id',
            'page_setting_data.*',
        )
        ->leftJoin('page_setting_data', 'page_setting_data.data_id', '=', 'page_setting.id')
        ->where('page_setting_data.languages_id', $langId);
        return $query;
    }
}

