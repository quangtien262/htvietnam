<?php

namespace App\Models\Web;

use App\Services\User\UserService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LinkFooter extends Model
{
    use HasFactory;
    protected $table = 'link_footer';
    static function query($checkActive = true) {
        $langId = UserService::getLang();
        $query = self::select(
            'link_footer.id as id',
            'link_footer.link as link',
            
            'link_footer_data.name_data as name',
            'link_footer_data.description as description',
            'link_footer_data.content as content',
        )
        ->leftJoin('link_footer_data', 'link_footer_data.data_id', '=', 'link_footer.id')
        ->where('link_footer_data.languages_id', $langId);
        return $query;
    }
}
