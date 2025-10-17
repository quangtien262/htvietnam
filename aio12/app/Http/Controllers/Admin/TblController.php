<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\Column;
use App\Models\Admin\Table;
use Illuminate\Support\Facades\Schema;
use App\Services\Admin\TblService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use App\Services\Admin\AutoGenService;

class TblController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $tables = TblService::getAdminMenu(0);
        $dataSource = TblService::getTableDataDragDrop(0, [], 1);
        $expandedKeys = [];
        foreach ($tables as $tbl) {
            $expandedKeys[] = $tbl['parent']->id;
        }
        return Inertia::render(
            'Admin/Tbl/index',
            [
                'tables' => $tables,
                'dataSource' => $dataSource,
                'expandedKeys' => $expandedKeys
            ]
        );
    }

    public function deletes(Request $request)
    {
        if (empty($request->ids)) {
            return $this->sendErrorResponse('ID is require', $errors = null, $code = 400);
        }
        foreach ($request->ids as $id) {
            // Find table
            $table = Table::find($id);
            //delete record in table_column
            DB::table('table_column')->where('table_id', $id)->delete();
            //Delete table
            Schema::dropIfExists($table->name);
            //Deleted record in tables
            $table->delete();
        }
        //rollback when finish deleted
        return Inertia::location(route('table.index'));
    }

    public function formName(Request $request, $tableName, $columnId = 0)
    {
        $table = Table::where('name',$tableName)->first();
        return to_route('table.form', [$table->id, 0]);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function form(Request $request, $tableId, $columnId = 0)
    {
        $tables = TblService::getAdminMenu(0);
        $tbls = Table::orderBy('name', 'asc')->get();
        $tableSelect = [];
        foreach ($tbls as $t) {
            $tableSelect[] = [
                'value' => $t->id,
                'label' => $t->name . ' - ' . $t->id
            ];
        }

        $table = Table::find($tableId);

        $column = Column::find($columnId);

        if (!empty($table->config_show_data)) {
            $table->config_show_data = json_encode($table->config_show_data, true);
        }
        // dd($table);

        if (!empty($table->data_related)) {
            $table->data_related = json_encode($table->data_related, true);
        }

        $columnData = TblService::getColumnData($tableId);
        return Inertia::render(
            'Admin/Tbl/form',
            [
                'tableId' => $tableId,
                'columnId' => $columnId,
                'tables' => $tables,
                'tableSelect' => $tableSelect,
                'table' => $table,
                'columnData' => $columnData,
                'column' => $column
            ]
        );
    }

    public function submitFormTable(Request $request, $tableId)
    {   
        $table = $this->saveTable($tableId, $request->all());
        if ($tableId == 0) {
            if (empty($request->is_label)) {
                $this->createDefaultColumn($table->id, $request);
            }
        }
        AutoGenService::genModel(base_path() . '/app/Models/Auto/');
        return to_route('table.form', [$table->id]);
    }

    public function submitFormColumn(Request $request, $tableId, $columnId)
    {
        $post = $request->all();
        $post['table_id'] = $tableId;

        //get Column
        $column = Column::find($columnId);
        $table = Table::find($tableId);
        // save to db
        $this->saveColumn($columnId, $post);
        // nếu là block thì return luôn
        if (!empty($request->block_type)) {
            if (empty($columnId)) {
                return to_route('table.form', [$table->id]);
            }
            return $this->sendSuccessResponse([], 'success');
        }

        // update database
        if (empty($columnId)) {
            // create column
            Schema::table($table->name, function ($table) use ($request) {
                $isNull = 1;
                $this->setTypeForField($table, $request);
            });
            
            AutoGenService::genModel();
            return to_route('table.form', [$table->id]);
        }

        // rename column
        if ($column->name != $request->name) {
            Schema::table($table->name, function ($table) use ($column, $request) {
                $table->renameColumn($column->name, $request->name);
            });
        }
        // update column type
        Schema::table($table->name, function ($table) use ($request) {
            $this->changeTypeForColumn($table, $request);
        });
        
        AutoGenService::genModel(base_path() . '/app/Models/Auto/');

        return $this->sendSuccessResponse([], 'success');
    }

    public function updateSortOrderColumn(Request $request)
    {
        if (empty($request->data)) {
            return $this->sendSuccessResponse('warning', 'Data is empty', 200);
        }
        $data = json_decode($request->data, true);
        $this->updateSortOrderCol($data);
        return $this->sendSuccessResponse('success', 'Update successfully', 200);
    }

    private function updateSortOrderCol($data, $parentId = 0)
    {
        foreach ($data as $i => $d) {
            $col = Column::find($d['key']);
            $col->sort_order = $i;
            $col->parent_id = $parentId;
            $col->save();
            if (!empty($d['children'])) {
                $this->updateSortOrderCol($d['children'], $d['key']);
            }
        }
        return $this->sendSuccessResponse('success', 'Update successfully', 200);
    }

    public function updateSortOrderTable(Request $request)
    {
        if (empty($request->data)) {
            return false;
        }
        $data = json_decode($request->data, true);
        $this->updateSortOrderTbl($data);
        return true;
    }

    /**
     * Remove table
     *
     * @param  \App\Models\Blog  $blog
     * @return \Illuminate\Http\Response
     */
    public function destroyTable(Request $request, $tableId)
    {
        $result = Table::find($tableId)->delete();
        AutoGenService::genModel(base_path() . '/app/Models/Auto/');
        return $result;
    }

    /**
     * Remove column
     *
     * @param  \App\Models\Column  $Column
     * @return \Illuminate\Http\Response
     */
    public function destroyColumn(Request $request, $columnId)
    {
        AutoGenService::genModel(base_path() . '/app/Models/Auto/');
        $result = Column::find($columnId)->delete();
        return $result;
    }

    public function artisan(Request $request)
    {
        if (empty($request->type)) {
            return $this->sendErrorResponse('Type is empty');
        }

        if ($request->type == 'all') {
            Artisan::call('migrate:refresh');
            Artisan::call('db:seed');
            return $this->sendSuccessResponse([], 'Successfully');
        }

        if ($request->type == 'cache') {
            Artisan::call('config:cache');
            Artisan::call('optimize:clear');
            return $this->sendSuccessResponse([], 'Successfully');
        }

        Artisan::call($request->type);

        return 'Migration ran successfully';
    }

    public function updateTable(Request $request, $id)
    {
        if (empty($request->all())) {
            return $this->sendErrorResponse('param is empty');
        }
        $table = Table::find($id);
        $condition_str = "id = {$id}";
        $set_str = '';
        foreach ($request->all() as $key => $val) {
            $table->{$key} = $val;
            $set_str = "`{$key}` = " . intval($val);
        }
        $table->save();
        $newQuery = "UPDATE tables SET {$set_str} WHERE {$condition_str}";
        $this->setQueryConfig($newQuery);
        return $this->sendSuccessResponse('success');
    }

    public function updateColumn(Request $request, $id)
    {
        if (empty($request->all())) {
            return $this->sendErrorResponse('param is empty');
        }
        $column = Column::find($id);
        $condition_str = "id = {$id}";
        foreach ($request->all() as $key => $val) {
            $column->{$key} = $val;
            $set_str = "`{$key}` = " . intval($val);
        }
        $column->save();
        $newQuery = "UPDATE table_column SET {$set_str} WHERE {$condition_str}";
        $this->setQueryConfig($newQuery);
        AutoGenService::genModel(base_path() . '/app/Models/Auto/');
        return $this->sendSuccessResponse('success');
    }

    private function setQueryConfig($newQuery)
    {
        $querys = file_get_contents(config('constant.config_file'));

        if (empty($querys)) {
            $querys = [];
        } else {
            $querys = json_decode($querys, true);
            if (($key = array_search($newQuery, $querys)) !== false) {
                unset($querys[$key]);
            }
        }
        $querys[] = $newQuery;
        file_put_contents(config('constant.config_file'), json_encode($querys));
        return json_encode($querys);
    }

    private function updateSortOrderTbl($data, $parentId = 0)
    {
        foreach ($data as $i => $d) {
            $table = Table::find($d['key']);
            $table->sort_order = $i;
            $table->parent_id = $parentId;
            $table->save();
            if (!empty($d['children'])) {
                $this->updateSortOrderTbl($d['children'], $d['key']);
            }
        }
        return true;
    }

    private function saveTable($id, $rq)
    {
        if ($id > 0) {
            $table = Table::find($id);
            if ($table->name != $rq['name']) {
                Schema::rename($table->name, $rq['name']);
            }
        } else {
            $table = new Table();
        }
        $fillable = [
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
            'route_name',
            'add_btn_from_route',
            'smart_search',
            'config_show_data',
            'data_related',
            'statistical_select',
            'thong_ke',
            'search_position',
            'expandable'
        ];
        foreach ($rq as $key => $value) {
            if (in_array($key, ['config_show_data', 'data_related']) && $value != '') {
                $table->{$key} = json_decode($value); 
                continue;
            }
            
            if (in_array($key, $fillable)) {
                $table->{$key} = $value;
            }
        }
        $table->save();
        AutoGenService::genModel(base_path() . '/app/Models/Auto/');
        return $table;
    }

    private function saveColumn($id, $request)
    {
        if ($id > 0) {
            $column = Column::find($id);
        } else {
            $column = new Column();
        }
        $colName = [
            'display_name',
            'table_id',
            'name',
            'type',
            'edit',
            'hide', // ['add'=>['column_01'], 'edit'=>['column_02']]
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
            'fast_edit',
            // 'table_link',
            // 'column_table_link',
            // 'sub_list',
            // 'sub_column_name',
            // 'config_add_sub_table',
            'bg_in_list',
            'add_column_in_list',
            // 'column_name_map_to_comment',
            'is_show_total',
            'is_show_btn_auto_get_total',
            'is_view_detail',
            'is_show_id',
            'show_length',
            'links',
            'ratio_crop',
            'data_select',
            'block_type',
            'col',
            'add_express',
            'auto_generate_code',
            'smart_search',
            'config_show_data',
            'hide_add',
            'hide_edit',
            'show_default',
            'config',
            'check_all_selects'
        ];
        foreach ($request as $key => $value) {
            if (in_array($key, $colName)) {
                $column->{$key} = $value;
            }
        }
        if($id == 0) {
            $column->parent_id = 0;
        }
        // dd($column);
        $column->save();
        AutoGenService::genModel(base_path() . '/app/Models/Auto/');
        return $column;
    }

    private function createDefaultColumn($tableId, $request)
    {
        $tblUser = Table::where('name', 'admin_users')->first();
        $userId = !empty($tblUser) ? '':'';

        $datas = [
            [
                'name' => 'id',
                'table_id' => $tableId,
                'display_name' => 'ID',
                'type_edit' => 'text',
                'edit' => 0,
                'type' => 'INT',
                'value_default' => '',
                'show_in_list' => 0,
                'require' => 0,
                'is_null' => 1,
                'add2search' => 0,
                'search_type' => 1,
                'parent_id' => 0,
                'created_at' => date('Y-m-d h:i:s'),
                'updated_at' => date('Y-m-d h:i:s'),
                'select_table_id' => 0,
            ],
            [
                'name' => 'name',
                'table_id' => $tableId,
                'display_name' => 'Tiêu đề',
                'type_edit' => 'text',
                'edit' => 1,
                'type' => 'VARCHAR',
                'value_default' => '',
                'max_length' => 255,
                'show_in_list' => 1,
                'require' => 0,
                'is_null' => 1,
                'add2search' => 0,
                'search_type' => 1,
                'parent_id' => 0,
                'created_at' => date('Y-m-d h:i:s'),
                'updated_at' => date('Y-m-d h:i:s'),
                'select_table_id' => 0,
            ],
            [
                'name' => 'parent_id',
                'table_id' => $tableId,
                'display_name' => 'Danh mục cha',
                'type_edit' => 'text',
                'edit' => 0,
                'type' => 'INT',
                'value_default' => 0,
                'show_in_list' => 0,
                'require' => 0,
                'is_null' => 1,
                'add2search' => 0,
                'search_type' => 1,
                'parent_id' => 0,
                'created_at' => date('Y-m-d h:i:s'),
                'updated_at' => date('Y-m-d h:i:s'),
                'select_table_id' => 0,
            ],
            [
                'name' => 'sort_order',
                'table_id' => $tableId,
                'display_name' => 'Thứ tự sắp sếp',
                'type_edit' => 'text',
                'edit' => 0,
                'type' => 'INT',
                'value_default' => 0,
                'show_in_list' => 0,
                'require' => 0,
                'is_null' => 1,
                'add2search' => 0,
                'search_type' => 1,
                'parent_id' => 0,
                'select_table_id' => 0,
            ],
            [
                'name' => 'create_by',
                'table_id' => $tableId,
                'display_name' => 'create_by',
                'type_edit' => 'number',
                'edit' => 0,
                'type' => 'INT',
                'value_default' => 0,
                'show_in_list' => 0,
                'require' => 0,
                'is_null' => 1,
                'add2search' => 0,
                'search_type' => 1,
                'parent_id' => 0,
                'select_table_id' => 0,
            ],
        ];
        //create table
        Schema::create($request->name, function (Blueprint $table) use ($request) {
            $table->increments('id');
            $table->string('name')->nullable();
            $table->integer('parent_id')->nullable()->default(0);
            $table->integer('sort_order')->nullable()->default(0);
            $table->integer('create_by')->nullable()->default(1);
            $table->timestamps();
            $table->charset = 'utf8';
            $table->collation = 'utf8_unicode_ci';
            $table->engine = 'InnoDB';
        });

        //insert to table_column
        foreach ($datas as $data) {
            $result = TblService::insertData('table_column', $data);
        }

        return $result;
    }


    private function setTypeForField($table, $request)
    {
        $fieldName = $request->name;
        $type = $request->type;
        switch ($type) {
            case 'INT':
                $table->integer($fieldName)->nullable()->default(intval($request->value_default));
                break;
            case 'VARCHAR':
                $table->string($fieldName)->nullable()->default($request->value_default);
                break;
            case 'TEXT':
                $table->text($fieldName)->nullable();
                break;
            case 'LONGTEXT':
                $table->longText($fieldName)->nullable();
                break;
            case 'DATE':
                $table->date($fieldName)->nullable();
                break;
            case 'DATETIME':
                $table->dateTime($fieldName)->nullable();
                break;
        }

        return $table;
    }

    private function changeTypeForColumn($table, $request)
    {
        $fieldName = $request->name;
        $default = $request->value_default;
        $type = $request->type;
        switch ($type) {
            case 'INT':
                $table->integer($fieldName)->nullable()->default($default)->change();
                break;
            case 'VARCHAR':
                $table->string($fieldName)->nullable()->default($default)->change();
                break;
            case 'TEXT':
                $table->text($fieldName)->nullable()->default($default)->change();
                break;
            case 'LONGTEXT':
                $table->longText($fieldName)->nullable()->default($default)->change();
                break;
            case 'DATE':
                $table->date($fieldName)->nullable()->change();
                break;
            case 'DATETIME':
                $table->dateTime($fieldName)->nullable()->change();
                break;
        }
        return $table;
    }
}
