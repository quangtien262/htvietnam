<?php
namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class AdminMenu extends Model
{
    protected $table = 'admin_menu';

    protected $fillable = [
        'name',
        'display_name',
        'icon',
        'link',
        'is_active',
        'sort_order',
        'create_by',
        'is_recycle_bin',
    ];

    protected $casts = [
        'is_active' => 'integer',
        'sort_order' => 'integer',
        'create_by' => 'integer',
        'is_recycle_bin' => 'integer',
    ];

    static function baseQuery() {
        return self::select('admin_menu.id as key', 'admin_menu.*');
    }
}
