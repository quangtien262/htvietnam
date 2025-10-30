<?php

namespace App\Models\Web;

use App\Casts\Json;
use App\Services\User\UserService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Library extends Model
{
    protected $table = 'library';
    protected $casts = [
        'images' => Json::class,
    ];
    static function query($langId = null)
    {
        if (empty($langId)) {
            $langId = UserService::getLang()->id;
        }

        $query = self::select(
            'library_data.*',
            'library.id as id',
            'library.*'
        )
            ->leftJoin('library_data', 'library_data.data_id', '=', 'library.id')
            ->where('library_data.languages_id', $langId);
        return $query;
    }
}
