<?php

namespace App\Models\Web;

use App\Services\User\UserService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    protected $table = 'video';
    static function query($checkActive = true, $langId = null)
    {
        if (empty($langId)) {
            $langId = UserService::getLang();
        }

        $query = self::select(
            'video.id as id',
            'video.menu_id as menu_id',
            'video.image as image',
            'video.link as link',
            'video.views as views',
            'video.tags_id as tags_id',
            'video.created_at as created_at',
            'video.is_translate as is_translate',
            'video.create_date as create_date',
            'video.updated_at as updated_at',
    
            'video_data.name_data as name',
            'video_data.description as description',
            'video.is_active as is_active',
            'video_data.content as content',
            'video_data.meta_keyword as meta_keyword',
            'video_data.meta_description as meta_description',
            'video_data.id as data_lang_id',
            'video_data.languages_id as languages_id',
            'video_data.meta_title as meta_title',
        )
            ->leftJoin('video_data', 'video_data.data_id', '=', 'video.id')
            ->where('video_data.languages_id', $langId);
        if ($checkActive == true) {
            $query = $query->where('video.is_active', 1);
        }
        return $query;
    }
}
