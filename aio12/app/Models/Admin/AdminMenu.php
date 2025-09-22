<?php
namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class AdminMenu extends Model
{
    protected $table = 'admin_menu';

    static function baseQuery() {
        return self::select('admin_menu.id as key', 'admin_menu.*');
    }
}
