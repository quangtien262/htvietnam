<?php

namespace App\Models\Web;

use App\Casts\Json;
use App\Services\User\UserService;
use Illuminate\Database\Eloquent\Model;

class Block extends Model {

    //
    protected $table = 'block';

    static function query($langId = null) {
        if(empty($langId)) {
            $langId = UserService::getLang();
        }
        $query = self::select(
            'block.id as id',
            'block.image as image',
            'block.created_at as created_at',
            'block.updated_at as updated_at',

            'block_data.name_data as name',
            'block_data.description as description',
            'block_data.content as content',
            'block_data.id as data_lang_id',
            'block_data.languages_id as languages_id',
        )
        ->leftJoin('block_data', 'block_data.data_id', '=', 'block.id')
        ->where('block_data.languages_id', $langId);
        return $query;
    }
}
