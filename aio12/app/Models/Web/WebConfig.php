<?php

namespace App\Models\Web;

use App\Services\User\UserService;
use Illuminate\Database\Eloquent\Model;

class WebConfig extends Model {

    //
    protected $table = 'web_config';
    
    static function query($langId = 0) {
        if(empty($langId)) {
            $langId = UserService::getLang();
        }
        return self::select(
            'web_config.id as id',
            'web_config.logo as logo',
            'web_config.code as code',
            'web_config.gg_map as gg_map',
            'web_config.email as email',
            'web_config.gg_analytic as gg_analytic',
            'web_config.phone as phone',
            'web_config.zalo as zalo',
            'web_config.facebook_id as facebook_id',
            'web_config.pinterest as pinterest',
            'web_config.youtube as youtube',
            'web_config.dribbble as dribbble',
            'web_config.whats_app as whats_app',
            'web_config.telegram as telegram',
            'web_config.google as google',
            'web_config.twitter as twitter',
            'web_config.instagram as instagram',
            'web_config.reddit as reddit',
            'web_config.linkedin as linkedin',
            'web_config.layout as layout',
            'web_config.other_config as other_config',

            'web_config_data.id as data_lang_id',
            'web_config_data.title as title',
            'web_config_data.slogan as slogan',
            'web_config_data.meta_title as meta_title',
            'web_config_data.meta_description as meta_description',
            'web_config_data.meta_keyword as meta_keyword',
            'web_config_data.address as address',
        )
        ->leftJoin('web_config_data', 'web_config.id', '=', 'web_config_data.data_id')
        ->where('web_config_data.languages_id', $langId);
    }
}
