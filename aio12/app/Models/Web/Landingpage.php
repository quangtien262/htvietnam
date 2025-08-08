<?php

namespace App\Models\Web;

use Illuminate\Database\Eloquent\Model;
use App\Casts\Json;
use App\Services\User\UserService;

class Landingpage extends Model {

    //
    protected $table = 'landingpage';

    /**
     * Base query
     *
     * @var string[]
     */
    static function query() {
        $langId = UserService::getLang();
        $query = self::where('language_id', $langId)->where('active', 1);
        return $query;
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var string[]
     */
    protected $fillable = [
        'language_id',
        'name',
        'menu_id',
        'type',
        'active',
        'sub_title',
        'sub_title01',
        'sub_title02',
        'sub_title03',
        'sub_title04',
        'sub_title05',
        'description01',
        'description02',
        'description03',
        'description04',
        'description05',
        'description_json01',
        'description_json02',
        'description_json03',
        'description_json04',
        'description_json05',
        'images',
        'image01',
        'image02',
        'image03',
        'image04',
        'image05',
        'icon01',
        'icon02',
        'icon03',
        'icon04',
        'icon05',
        'link_1',
        'link_2',
        'link_3',
        'link_4',
        'link_5',
        'is_show_btn_register',
        'is_show_hotline',
        'create_by',
        'sort_order'
    ];

    /**
    * The attributes that should be cast.
    *
    * @var array
    */
   protected $casts = [
       'images' => Json::class,
       'description_json01' => Json::class,
       'description_json02' => Json::class,
       'description_json03' => Json::class,
       'description_json04' => Json::class,
   ];

}
