<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Casts\Json;

class Table extends Model
{
    use HasFactory;
    protected $table = 'tables';

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'config_show_data' => Json::class,
        'data_related' => Json::class,
        'cascader' => Json::class,
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'display_name',
        'name',
        'is_edit',
        'type_show',
        'count_item_of_page',
        'model_name',
        'parent_id',
        'form_data_type',
        'created_at',
        'updated_at',
        'import',
        'export',
        'have_delete',
        'sort_order',
        'have_add_new',
        // 'table_tab',
        'table_tab_map_column',
        'is_show_btn_edit',
        'is_show_btn_detail',
        'is_edit_express',
        'is_add_express',
        'current_button',
        'search_params_default',
        'have_insert_all',
        'order_by',
        'is_show_clone_btn',
        'custom_link',
        'config',
        'table_data',
        'is_multiple_language',
        'check_seo',
        'html',
        'show_table_lien_quan',
        'link',
        'script_form_edit',
        'note',
        'tab_table_id',
        'tab_table_name',
        'is_label',
        'multiple_block',
        'add_btn_from_route',
        'show_in_menu',
        'smart_search',
        'config_show_data',
        'data_related', // data liên quan
        'statistical_select', // Thống kê theo select, hiển thị ở trang index
        'cascader',
        'auto_add_draft',
        'search_position',
        'expanded'
    ];
}
