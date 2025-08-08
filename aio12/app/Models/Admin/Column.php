<?php
namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Casts\Json;

class Column extends Model
{
    use HasFactory;
    protected $table = 'table_column';

    protected $casts = [
        'class' =>  Json::class,
    ];

    protected $fillable = [
        'table_id',
        'display_name',
        'name',
        'type',
        'edit',
        'hide',
        'value_default',
        // 'is_null',
        'max_length',
        'type_show',
        'add2search',
        'search_type',
        'type_edit',
        'show_in_list',
        'show_in_detail',
        'require',
        'sort_order',
        'parent_id',
        'created_at',
        'updated_at',
        'select_table_id',
        'conditions',
        'data_select',
        'fast_edit',
        // 'table_link',
        // 'column_table_link',
        // 'sub_list',
        // 'sub_column_name',
        // 'config_add_sub_table',
        'bg_in_list',
        'add_column_in_list',
        'is_show_total',
        'is_show_btn_auto_get_total',
        'is_view_detail',
        'is_show_id',
        'show_length',
        'links',
        'block_type',
        'ratio_crop',
        'fast_edit',
        'add_express',
        'col',
        'auto_generate_code',
        'class',
        'hide_add',
        'hide_edit',
        'show_default',
        'config',
        'check_all_selects',
        'placeholder'
    ];

}
