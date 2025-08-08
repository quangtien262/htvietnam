<?php

namespace App\Models\Web;

use App\Services\User\UserService;
use Illuminate\Database\Eloquent\Model;

class About extends Model {

    //
    protected $table = 'about';

    static function query($checkActive = true, $langId = null) {
        if(empty($langId)) {
            $langId = UserService::getLang();
        }
        
        $query = self::select(
            'about.id as id',
            'about.menu_id as menu_id',
            'about.image as image',
            'about.created_at as created_at',
            'about.updated_at as updated_at',

            'about_data.name_data as name',
            'about_data.description as description',
            'about_data.content as content',
            'about_data.meta_title as meta_title',
            'about_data.meta_keyword as meta_keyword',
            'about_data.meta_description as meta_description',
            'about_data.id as data_lang_id',
            'about_data.languages_id as languages_id',
        )
        ->leftJoin('about_data', 'about_data.data_id', '=', 'about.id')
        ->where('about_data.languages_id', $langId);
        return $query;
    }

}
