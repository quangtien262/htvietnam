<?php

namespace App\Models\Web;

use App\Casts\Json;
use App\Services\User\UserService;
use Illuminate\Database\Eloquent\Model;

class Services extends Model {

    //
    protected $table = 'services';

    static function query($langId = null) {
        if(empty($langId)) {
            $langId = UserService::getLang();
        }
        $query = self::select(
            'services.id as id',
            'services.image as image',
            'services.created_at as created_at',
            'services.updated_at as updated_at',

            'services_data.name_data as name',
            'services_data.description as description',
            'services_data.content as content',
            'services_data.meta_title as meta_title',
            'services_data.meta_keyword as meta_keyword',
            'services_data.meta_description as meta_description',
            'services_data.id as data_lang_id',
            'services_data.languages_id as languages_id',
        )
        ->leftJoin('services_data', 'services_data.data_id', '=', 'services.id')
        ->where('services_data.languages_id', $langId);
        return $query;
    }
}
