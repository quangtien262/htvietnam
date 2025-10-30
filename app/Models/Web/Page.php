<?php

namespace App\Models\Web;

use App\Services\User\UserService;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{

    //
    protected $table = 'pages';
    
    static function query() {
        $langId = UserService::getLang();
        return self::select(
            'pages.id as id',
            'pages.image as image',
            'pages.current_link as current_link',
            'pages.current_link as current_link',

            'pages_data.name_data as name',
            'pages_data.languages_id as languages_id',
            'pages_data.id as data_lang_id',
            'pages_data.content as content',
            'pages_data.description as description',
            'pages_data.meta_title as meta_title',
            'pages_data.meta_keyword as meta_keyword',
            'pages_data.meta_description as meta_description',
            'pages_data.created_at as created_at',
            'pages_data.updated_at as updated_at',
        )
        ->leftJoin('pages_data', 'pages_data.data_id', '=', 'pages.id')
        ->where('pages_data.languages_id', $langId);
    }
}
