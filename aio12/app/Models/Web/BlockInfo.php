<?php

namespace App\Models\Web;

use App\Casts\Json;
use App\Services\User\UserService;
use Illuminate\Database\Eloquent\Model;

class BlockInfo extends Model {

    //
    protected $table = 'block_info';

    static function query($langId = null) {
        if(empty($langId)) {
            $langId = UserService::getLang();
        }
        $query = self::select(
            'block_info.id as id',
            'block_info.image as image',
            'block_info.created_at as created_at',
            'block_info.updated_at as updated_at',

            'block_info_data.name_data as name',
            'block_info_data.description as description',
            'block_info_data.content as content',
            'block_info_data.id as data_lang_id',
            'block_info_data.languages_id as languages_id',
        )
        ->leftJoin('block_info_data', 'block_info_data.data_id', '=', 'block_info.id')
        ->where('block_info_data.languages_id', $langId);
        return $query;
    }
}
