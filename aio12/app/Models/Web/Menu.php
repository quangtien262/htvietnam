<?php

namespace App\Models\Web;

use App\Services\User\UserService;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model {

    //
    protected $table = 'menus';
    
    static function query($langId = 0) {
        if(empty($langId)) {
            $langId = UserService::getLang();
        }
        return self::select(
            'menus.id as id',
            'menus.parent_id as parent_id',
            'menus.display_type as display_type',
            'menus.is_front as is_front',
            'menus.icon as icon',
            'menus.sort_order as sort_order',
            'menus.current_link as current_link',
            'menus.images as images',
            'menus.position as position',
            'menus.type_sub_menu as type_sub_menu',

            'menus_data.name_data as name',
            'menus_data.meta_title as meta_title',
            'menus_data.languages_id as languages_id',
            'menus_data.id as data_lang_id',
            'menus_data.description as description',
            'menus_data.content as content',
            'menus_data.meta_title as meta_title',
            'menus_data.meta_description as meta_description',
            'menus_data.meta_keyword as meta_keyword',

        )
        ->leftJoin('menus_data', 'menus.id', '=', 'menus_data.data_id')
        ->where('menus.is_active', 1)
        ->where('menus_data.languages_id', $langId);
    }
}
