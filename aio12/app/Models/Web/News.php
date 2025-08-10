<?php

namespace App\Models\Web;

use App\Services\User\UserService;
use Illuminate\Database\Eloquent\Model;

class News extends Model {

    //
    protected $table = 'news';

    static function query($checkActive = true, $langId = null) {
        $lang = UserService::getLang();        
        $query = self::select(
            'news.id as id',
            'news.menu_id as menu_id',
            'news.image as image',
            'news.name as name',
            'news.views as views',
            'news.tags_id as tags_id',
            'news.is_translate as is_translate',
            'news.created_at as created_at',
            'news.updated_at as updated_at',

            'news_data.name_data as name',
            'news_data.description as description',
            'news.is_active as is_active',
            'news_data.content as content',
            'news_data.meta_title as meta_title',
            'news_data.meta_keyword as meta_keyword',
            'news_data.meta_description as meta_description',
            'news_data.id as data_lang_id',
            'news_data.languages_id as languages_id',
            // 'news_data.meta_title as meta_title',
        )
        ->leftJoin('news_data', 'news_data.data_id', '=', 'news.id')
        ->where('news_data.languages_id', app()->getLocale());
        if($checkActive == true) {
            $query = $query->where('news.is_active', 1);
        }
        return $query;
    }

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'tags_id' => Json::class,
    ];
}
