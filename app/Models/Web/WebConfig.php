<?php

namespace App\Models\Web;

use App\Services\User\UserService;
use Illuminate\Database\Eloquent\Model;

class WebConfig extends Model {

    //
    protected $table = 'web_config';

    static function query($langId = 0) {
        if(empty($langId)) {
            $langId = UserService::getLang()->id;
        }
        return self::select(
            'web_config.id as id',
            'web_config.*',

            'web_config_data.id as data_lang_id',
            'web_config_data.*',
        )
        ->leftJoin('web_config_data', 'web_config.id', '=', 'web_config_data.data_id')
        ->where('web_config_data.languages_id', $langId);
    }
}
