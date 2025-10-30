<?php
namespace App\Services\Admin;

use App\Models\Admin\Table;
use App\Models\Admin\Column;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ClassTable
{
    public function saveTable($id, $request)
    {
        //check add new or edit
        if ($id > 0) {
            $tables = Table::find($id);
        } else {
            $tables = new Table();
        }

        //import
        $import = 0;
        if (isset($request['import'])) {
            $import = intval($request['import']);
        }

        //export
        $export = 0;
        if (isset($request['export'])) {
            $export = intval($request['export']);
        }
        $tables->export = $export;
        $tables->import = $import;
        $tables->count_item_of_page = $request['count_item_of_page'];
        $tables->search_params_default = $request['search_params_default'];
        $tables->display_name = $request['display_name'];
        $tables->model_name = $request['model_name'];
        $tables->type_show = $request['table_type_show'];
        $tables->is_edit = isset($request['is_edit']) ? $request['is_edit'] : 0;
        $tables->name = $request['table_name'];
        $tables->form_data_type = $request['form_data_type'];
        $tables->have_delete = isset($request['have_delete']) ? $request['have_delete'] : 0;
        $tables->have_add_new = isset($request['have_add_new']) ? $request['have_add_new'] : 0;
        $tables->table_tab = !empty($request['table_tab']) ? $request['table_tab'] : 0;
        $tables->table_tab_map_column = $request['table_tab_map_column'];
        $tables->is_show_btn_edit = isset($request['is_show_btn_edit']) ? $request['is_show_btn_edit'] : 0;
        $tables->is_show_btn_detail = isset($request['is_show_btn_detail']) ? $request['is_show_btn_detail'] : 0;
        $tables->is_add_express = isset($request['is_add_express']) ? $request['is_add_express'] : 0;
        $tables->is_edit_express = isset($request['is_edit_express']) ? $request['is_edit_express'] : 0;
        $tables->have_insert_all = isset($request['have_insert_all']) ? $request['have_insert_all'] : 0;
        $tables->is_show_clone_btn = isset($request['is_show_clone_btn']) ? $request['is_show_clone_btn'] : 0;
        $tables->is_multiple_language = isset($request['is_multiple_language']) ? $request['is_multiple_language'] : 0;
        $tables->custom_link = $request['custom_link'];
        $tables->order_by = $request['order_by'];
        $tables->config = $request['config'];
        $tables->table_data = $request['table_data'];
        $tables->check_seo = $request['check_seo'];
        $tables->html = $request['html'];
        $tables->show_table_lien_quan = $request['show_table_lien_quan'];
        $tables->link = $request['link'];
        $tables->script_form_edit = $request['script_form_edit'];
        $tables->note = $request['note'];

        $tables->save();

        return $tables;
    }

    public function cloneTable($tableCloneId)
    {
        //check add new or edit
        $tableClone = $this->getTables($tableCloneId);
        $tblClone = json_decode($tableClone, true);

        $tblData=[];
        foreach($tblClone[0] as $key => $value) {
            if($key == 'id' || $key == 'created_at' || $key == 'updated_at' ) {
                continue;
            }
            if($key == 'name' || $key == 'display_name') {
                $tblData[$key] = $value . '_clone';
                continue;
            }
            $tblData[$key] = $value;
        }
        $tblData['created_at'] = date('Y-m-d h:i:s');
        $tblData['updated_at'] = $tblData['created_at'];

        //check exist tbl
        $tbl = $this->getTableByName($tblData['name']);
        if(empty($tbl)) {

            Schema::create($tblData['name'], function (Blueprint $table) {
                $table->increments('id');
                $table->timestamps();
                $table->charset = 'utf8';
                $table->collation = 'utf8_unicode_ci';
                $table->engine = 'InnoDB';
            });

            \DB::table(TBL_TABLES)->insert($tblData);
            $tbl = $this->getTableByName($tblData['name']);
        }

        // get column by table clone
        $columnsTblClone = $this->getColumnByTableId($tableCloneId);

        $columnsTblClone_arr = json_decode($columnsTblClone, true);

        foreach($columnsTblClone_arr as $colData) {
            if($colData['name'] == 'id' || $colData['name'] == 'created_at' || $colData['name'] == 'updated_at') {
                continue;
            }
            $colRequest = [];
            foreach($colData as $key => $val) {
                if($key == 'name') {
                    $colRequest['column_name'] = $val;
                    continue;
                }
                if($key == 'table_id') {
                    $colRequest['table_id'] = $tbl->id;
                    continue;
                }
                if($key == 'type') {
                    $colRequest['column_type'] = $tbl->type;
                    continue;
                }
                $colRequest[$key] = $val;
            }
            Schema::table($tblData['name'], function ($table) use ($colData) {
                $table = $this->setTypeForField($table,
                                                $colData['name'],
                                                $colData['type'],
                                                $colData['max_length'],
                                                $colData['value_default'],
                                                $colData['is_null']);
            });
            $this->saveColumn($colRequest);
        }
        return true;
    }

    public function saveColumn($request)
    {
        if (!empty($request['column_id'])) {
            $block = Column::find($request['column_id']);
        } else {
            $block = new Column();
        }

        $block->name = $request['column_name'];
        $block->display_name = $request['display_name'];
        $block->type = $request['column_type'];
        $block->type_edit = $request['type_edit'];
        $block->max_length = $request['max_length'];
        $block->fast_edit = isset($request['fast_edit']) ? $request['fast_edit'] : 0;
        $block->require = isset($request['require']) ? $request['require'] : 0;
        $block->edit = isset($request['edit']) ? $request['edit'] : 0;
        $block->show_in_list = isset($request['show_in_list']) ? $request['show_in_list'] : 0;
        $block->add2search = isset($request['add2search']) ? $request['add2search'] : 0;
        $block->table_id = intval($request['table_id']);
        $block->select_table_id = intval($request['select_table_id']);
        $block->value_default = $request['value_default'];
        $block->conditions = $request['conditions'];
        $block->table_link = $request['table_link'];
        $block->class = $request['class'];
        $block->sub_column_name = $request['sub_column_name'];
        $block->sub_list = isset($request['sub_list']) ? $request['sub_list'] : 0;
        $block->config_add_sub_table = $request['config_add_sub_table'];
        $block->bg_in_list = isset($request['bg_in_list']) ? $request['bg_in_list'] : 0;
        $block->add_column_in_list = $request['add_column_in_list'];
        $block->column_name_map_to_comment = $request['column_name_map_to_comment'];
        $block->is_show_total = isset($request['is_show_total']) ? $request['is_show_total'] : 0;
        $block->is_view_detail = isset($request['is_view_detail']) ? $request['is_view_detail'] : 0;
        $block->is_show_id = isset($request['is_show_id']) ? $request['is_show_id'] : 0;
        $block->search_type = isset($request['search_type']) ? $request['search_type'] : 1;
        $block->show_length = isset($request['show_length']) ? $request['show_length'] : 0;



        $block->save();

        return $block;
    }

    public function saveRow($request, $tableId, $dataId, $subColumnName = '', $subColumnVal = 0)
    {
        $table = app('ClassTables')->getTable($tableId);
        $columns = app('ClassTables')->getColumnByTableId($tableId);
        $data = [];
        $imageNoDbName = '';
        foreach ($columns as $column) {
            if ($subColumnName != '') {
                $data[$subColumnName] = $subColumnVal;
            }
            if ($column->edit != 1) {
                continue;
            }
            if ($column->name == 'id') {
                continue;
            }
            if ($column->type_edit == 'images_no_db') {
                if (!empty($request->file($column->name))) {
                    $imageNoDbName = $column->name;
                }
            }

            if ($column->type_edit == 'encryption') {
                if ($dataId > 0 && $request->input($column->name) == '') {
                    continue;
                }
                $data[$column->name] = bcrypt($request->input($column->name));
                continue;
            }
            if ($column->type == 'INT') {
                $data[$column->name] = intval($request->input($column->name));
            } else {
                $data[$column->name] = $request->input($column->name);
            }
            //upload images if exist
            if ($column->type_edit == 'images') {
                $images = [];
                $avatar = '';
                // create directory if not exist
                if (!empty($request->input('_images'))) {
                    $directoryUpload = 'imgs/'.$tableId;
                    if (!file_exists($directoryUpload)) {
                        mkdir($directoryUpload, 0777, true);
                    }
                    //loop images
                    foreach ($request->input('_images') as $idx => $img) {
                        $pathUpload = $img;
                        if ($request->input('_images_type')[$idx] == 'base64') {
                            //case image is base64
                            $fileType = mime_content_type($img);
                            if (substr($fileType, 0, 5) == 'image') {
                                $fileName = $idx.'-'.time().'.'.str_replace('image/', '', $fileType);
                                $pathUpload = $directoryUpload.'/'.$fileName;
                                app('UtilsCommon')->base64ToImage($img, $pathUpload);
                                $images[] = '/'.$pathUpload;
                            }
                        }
                        if ($request->input('_avatar')[$idx] == '1') {
                            $avatar = $pathUpload;
                        }
                        $images[] = $pathUpload;
                    }
                    if ($avatar == '' && !empty($images)) {
                        $avatar = $images[0];
                    }
                }
                $imageArr = [
                    'avatar' => $avatar,
                    'images' => $images,
                ];
                $data[$column->name] = json_encode($imageArr);
            }
        }

        if ($dataId > 0) {
            $data = TblService::updateData($table->name, $dataId, $data);
        } else {
            $id = TblService::insertData($table->name, $data);
            if ($imageNoDbName != '' && !empty($request->file($imageNoDbName))) {
                foreach ($request->file($imageNoDbName) as $file) {
                    $path = "imgs/{$tableId}/{$id}/image/";
                    app('UtilsCommon')->uploadFiles($path, $file);
                }
            }
        }

        //save subData & comment if exist
        foreach ($columns as $column) {
            // sub data
            if ($column->table_link != 0 && !empty($column->name)) {
                self::saveRow($request, $column->table_link, 0, $column->sub_column_name, $id);
            }
            // comment
            if ($column->type_edit == 'comment' && !empty($column->name) && !empty($column->select_table_id)) {
                self::saveRow($request, $column->select_table_id, 0, $column->column_name_map_to_comment, $id);
            }
        }
    }

    public function createDefaultColumn($tableId, $request)
    {
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
        ];
        //create table
        Schema::create($request->table_name, function (Blueprint $table) use ($request) {
            $table->increments('id');
            $table->string('name')->nullable();
            $table->integer('parent_id')->nullable()->default(0);
            $table->integer('sort_order')->nullable()->default(0);
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

    public function deleteTable($tableId)
    {
        return Table::find($tableId)->delete();
    }

    public function deleteColumn($columnId)
    {
        return Column::find($columnId)->delete();
    }

    public function getRowsByConditions($table, $columns, $request, $limit = 30)
    {
        //select table
        $data = DB::table($table->name);

        if(!empty($request->id)) {
            $data = $data->where('id', $request->id);
        }

        //table tab?
        if (!empty($table->table_tab) && !empty($table->table_tab_map_column)) {
            $tabTbl = self::getTable($table->table_tab);
            if (isset($request->tab)) {
                $tabId = $request->tab;
            } else {
                $rowData = TblService::findDataLatestByCondition($tabTbl->name);
                $tabId = $rowData->id;
            }
            $data = $data->where($table->table_tab_map_column, $tabId);
        }

        //where condition if exist conditions
        foreach ($columns as $col) {
            if ($col['add2search'] == 1 && !empty($request[$col->name])) {
                switch ($col->search_type) {
                    case '2':
                        $data = $data->where($col->name, '=', $request[$col->name]);
                        break;
                    case '3':
                        $data = $data->where($col->name, '!=', $request[$col->name]);
                        break;
                    case '4':
                        $data = $data->where($col->name, 'like', '%'.$request[$col->name]);
                        break;
                    case '5':
                        $data = $data->where($col->name, 'like', $request[$col->name].'%');
                        break;
                    case '6':
                        $data = $data->whereBetween($col->name, [$request[$col->name.'01'], $request[$col->name.'02']]);
                        break;
                    default:
                        //case = 1 or other
                        $data = $data->where($col->name, 'like', '%'.$request[$col->name].'%');
                        break;
                }
            }
        }
        //The count of data
        if(empty($table->order_by)) {
            $data = $data->orderBy('id', 'desc');
        } else {
            $order = json_decode($table->order_by, true);

            foreach($order as $o) {
                $data = $data->orderBy($o['column'], $o['order']);
            }
        }


        if ($limit > 0) {
            $data = $data->paginate($limit);
        } else {
            $data = $data->get();
        }

        return $data;
    }

    public function getHtmlMenuAdmin($parentId = 0, $sub = false)
    {
        $html = '';
        $conditions = [
            'is_edit' => 1,
            'parent_id' => $parentId,
        ];
        $order = ['sort_order', 'asc'];
        $tables = app('EntityCommon')->getRowsByConditions('tables', $conditions, 0, $order);
        if (is_array($tables) && count($tables) > 0) {
            if ($sub) {
                $html .= '<ul>';
            }
            foreach ($tables as $table) {
                $subdata = self::getHtmlMenuAdmin($table->id, true);
                $html .= '<li>
                        <a class="ripple" href="'.route('listDataTbl', [$table->id]).'">
                            <span>'.$table->display_name.'</span>
                        </a>';

                $html .= $subdata;

                $html .= '</li>';
            }
            if ($sub) {
                $html .= '</ul>';
            }
        }

        return $html;
    }

    public function getHtmlMenuAdminLeft($parentId = 0)
    {
        $permissionList = json_decode(\Auth::user()->permission_list);
        $html = '';
        $conditions = [
            'is_edit' => 1,
            'parent_id' => $parentId,
        ];
        $order = ['sort_order', 'asc'];
        $tables = app('EntityCommon')->getRowsByConditions('tables', $conditions, 0, $order);
        if (count($tables) > 0) {
            $html .= '<ul>';
            foreach ($tables as $table) {
                if(\Auth::user('admin_users')->user_permission_id == 2 && !in_array($table->id, $permissionList)) {
                    continue;
                }
                $countData = app('EntityCommon')->getCountData($table->name);
                $subdata = $this->getHtmlMenuAdminLeft($table->id);
                if ($subdata != '') {
                    $icon = '<span class="nav-icon"><em class="ion-android-arrow-dropdown" style="font-size: 18px;line-height: 25px;"></em></span>';
                } else {
                    $icon = '<span class="nav-icon"><em class="ion-arrow-right-b" style="font-size: 12px;line-height: 25px;"></em></span>';
                }
                $link = $table->link;
                if(empty($link)) {
                    $link = route('listDataTbl', [$table->id]).$table->search_params_default;
                }
                $html .= '<li>
                        <a class="ripple" href="'.$link.'">
                            <span class="pull-right nav-label">
                                <span class="badge bg-success">'.$countData.'</span>
                            </span>
                            '.$icon.'
                            <span>'.$table->display_name.'</span>
                        </a>';

                $html .= $subdata;

                $html .= '</li>';
            }
            $html .= '</ul>';
        }
        return $html;
    }

    public function getHtmlSelectForTable($name, $tblRowId, $selectedId = 0, $multiple = false, $conditionsJson = '', $typeSelect = 'select')
    {
        if ($multiple) {
            $html = '<select multiple class="form-control" name="'.$name.'">';
        } else {
            $html = '<select class="form-control" name="'.$name.'">';
        }
        $conditions = [];
        if (!empty($conditionsJson)) {
            $conditions = json_decode($conditionsJson);
        }

        $table = self::getTable($tblRowId);
        if (!empty($table)) {
            $html .= '<option value="0">Chọn '.$table->display_name.'</option>';
            $tableData = json_decode(json_encode(app('EntityCommon')->getRowsByConditions($table->name, $conditions, 0, $order = ['sort_order', 'asc'])), true);
            foreach ($tableData as $data) {
                $selected = '';
                $value = $data['id'];
                if($typeSelect == 'select_col_name') {
                    $value = $data[$name];
                }
                if ($value == $selectedId) {
                    $selected = 'selected="selected"';
                }
                $html .= '<option '.$selected.' value="'. $value.'">'.$data['name'].'</option>';
            }
        }
        $html .= '</select>';

        return $html;
    }

    public function getHtmlSelect2MultipleForTable($name, $tblRowId, $selectedId = 0, $multiple = false, $conditionsJson = '')
    {
        if ($multiple) {
            $html = '<select class="select2-3 form-control" multiple name="'.$name.'">';
        } else {
            $html = '<select class="select2-2 form-control" name="'.$name.'">';
        }
        $conditions = [];
        if (!empty($conditionsJson)) {
            $conditions = json_decode($conditionsJson);
        }
        $table = self::getTable($tblRowId);
        if (!empty($table)) {
            $html .= '<option value="0">Chọn '.$table->display_name.'</option>';
            $tableData = app('EntityCommon')->getRowsByConditions($table->name, $conditions, 0, $order = ['sort_order', 'asc']);
            foreach ($tableData as $data) {
                $selected = '';
                if ($data->id == $selectedId) {
                    $selected = 'selected="selected"';
                }
                $html .= '<option '.$selected.' value="'.$data->id.'">'.$data->name.'</option>';
            }
        }
        $html .= '</select>';

        return $html;
    }

    public function getHtmlSelectTableFastEdit($name, $tblRowId, $selectedId = 0, $dataId = 0, $tableId = 0)
    {
        $html = '<select class="_hidden input-fast-edit"
                    element-update="#'.$name.$dataId.' "
                    onchange="updateInput(this)"
                    class="form-control"
                    type="select"
                    name="'.$name.'"
                    table-id="'.$tableId.'"
                    data-id="'.$dataId.'">';
        $conditions = [];
        $table = $this->getTable($tblRowId);
        if (!empty($table)) {
            $html .= '<option value="0">Chọn '.$table->display_name.'</option>';
            $tableData = app('EntityCommon')->getRowsByConditions($table->name, $conditions, 0, $order = ['sort_order', 'asc']);

            foreach ($tableData as $data) {
                $selected = '';
                if ($data->id == $selectedId) {
                    $selected = 'selected="selected"';
                }
                $html .= '<option '.$selected.' value="'.$data->id.'">'.$data->name.'</option>';
            }
        }
        $html .= '</select>';

        return $html;
    }

    public function getObjectJavascriptFromTable($tblRowId, $conditionsJson = '')
    {
        $result = '[';
        $conditions = [];
        if (!empty($conditionsJson)) {
            $conditions = json_decode($conditionsJson);
        }

        $table = self::getTable($tblRowId);
        if (!empty($table)) {
            $tableData = app('EntityCommon')->getRowsByConditions($table->name, $conditions, 0, $order = ['sort_order', 'asc']);
            foreach ($tableData as $data) {
                $name = $data->name;
                if (empty($data->name) && !empty($data->username)) {
                    $name = $data->username;
                }
                $result .= "{value: {$data->id}, text: '{$name}'},";
            }
        }
        $result .= ']';

        return $result;
    }

    ////apply for all table have config in table tables
    public function getHtmlListDragDrop($table, $parentId = 0, $conditions = [], $type = 'default')
    {
        $html = '';
        $conditions['parent_id'] = $parentId;
        $order = ['sort_order', 'asc'];
        $tableData = app('EntityCommon')->getRowsByConditions($table->name, $conditions, $limit = 0, $order);

        if (!empty($tableData)) {
            $html = '<ol class="dd-list">';
            foreach ($tableData as $td) {
                $img = '';
                if (!empty($td->image)) {
                    $img = '<div class="mda-list-item-icon"><img style="height:40px" src="'.$td->image.'"/></div>';
                }
                switch ($type) {
                    case 'landingPage':
                        $edit = '<a onclick="loadDataPopup(\''.route('adminEditBlock', [$td->landing_page_id, $td->block_id, $td->id]).'\')" data-toggle="modal" data-target=".bs-modal-lg"><i class="ion-edit"></i></a>';
                        break;
                    default:
                        $edit = '<a onclick="loadDataPopup(\''.route('formRow', [$table->id, $td->id]).'\')" data-toggle="modal" data-target=".bs-modal-lg"><i class="ion-edit"></i></a>';
                        if ($table->form_data_type == 1) {
                            $edit = '<a href="'.route('formRow', [$table->id, $td->id]).'"><i class="ion-edit"></i></a>';
                        }
                        break;
                }

                $html .= '<li class="dd-item" data-id="'.$td->id.'">
                            <div class="card b0 dd-handle">
                                <div class="mda-list">
                                    <div class="mda-list-item">
                                        <div class="mda-list-item-icon item-grab" style="padding-top: 9px;">
                                            <em class="ion-drag icon-lg"></em>
                                        </div>
                                        '.$img.'
                                        <div class="mda-list-item-text mda-2-line">
                                            <h3>'.$td->name.'</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="option-dd">
                                &nbsp;
                                '.$edit.'
                                &nbsp;
                                <a onclick="return checkConfirm(\'Xác nhận Xóa\')" href="'.route('deleteRow', [$table->id, $td->id]).'">
                                    <i class="ion-trash-a"></i>
                                </a>
                            </div>';
                // check sub data
                $subData = DB::table($table->name)->where('parent_id', $td->id)->count();
                if ($subData > 0) {
                    $html .= self::getHtmlListDragDrop($table, $td->id);
                }
                $html .= '</li>';
            }
            $html .= '</ol>';
        }

        return $html;
    }

    //apply for table tables
    public function getHtmlListTable($parentId = 0)
    {
        $html = '';
        $conditions = ['parent_id' => $parentId];
        $order = ['sort_order', 'asc'];
        $tableData = app('EntityCommon')->getRowsByConditions('tables', $conditions, 0, $order);

        if (!empty($tableData)) {
            $html = '<ol class="dd-list">';
            foreach ($tableData as $td) {
                $img = '';
                if (!empty($td->image)) {
                    $img = '<div class="mda-list-item-icon"><img style="height:40px" src="'.$td->image.'"/></div>';
                }
                $html .= '<li class="dd-item" data-id="'.$td->id.'">
                            <div class="card b0 dd-handle">
                                <div class="mda-list">
                                    <div class="mda-list-item">
                                        <div class="mda-list-item-icon item-grab" style="padding-top: 9px;">
                                            <em class="ion-drag icon-lg"></em>
                                        </div>
                                        '.$img.'
                                        <div class="mda-list-item-text mda-2-line">
                                            <h3>'.$td->name.' - '.$td->display_name.'</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="option-dd">
                                &nbsp;
                                <a href="'.route('configTbl_clone', [$td->id]).'"><i class="ion-clipboard"></i></a>
                                &nbsp;
                                <a href="'.route('configTbl_edit', [$td->id]).'"><i class="ion-edit"></i></a>
                                &nbsp;
                                <a onclick="return checkConfirm(\'Xác nhận Xóa\')" href="'.route('deleteTable', ['table' => $td->id]).'"><i class="ion-trash-a"></i></a>
                            </div>';
                // check sub data
                $subData = DB::table('tables')->where('parent_id', $td->id)->count();
                if ($subData > 0) {
                    $html .= self::getHtmlListTable($td->id);
                }
                $html .= '</li>';
            }
            $html .= '</ol>';
        }

        return $html;
    }

    //apply for table table_column
    public function getHtmlListColumn($tableId, $parentId = 0)
    {
        $html = '';
        $conditions = ['parent_id' => $parentId, 'table_id' => $tableId];
        $order = ['sort_order', 'asc'];
        $tableData = app('EntityCommon')->getRowsByConditions('table_column', $conditions, 0, $order);

        if (!empty($tableData)) {
            $html = '<ol class="dd-list">';
            foreach ($tableData as $td) {
                $img = '';
                if (!empty($td->image)) {
                    $img = '<div class="mda-list-item-icon"><img style="height:40px" src="'.$td->image.'"/></div>';
                }
                $html .= '<li class="dd-item" data-id="'.$td->id.'">
                            <div class="card b0 dd-handle">
                                <div class="mda-list">
                                    <div class="mda-list-item">
                                        <div class="mda-list-item-icon item-grab" style="padding-top: 9px;">
                                            <em class="ion-drag icon-lg"></em>
                                        </div>
                                        '.$img.'
                                        <div class="mda-list-item-text mda-2-line">
                                            <h3>'.$td->name.' - '.$td->display_name.'</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="option-dd">
                                &nbsp;
                                <a href="'.route('configTbl_edit', [$tableId, 'column' => $td->id]).'"><i class="ion-edit"></i></a>
                                &nbsp;
                                <a onclick="return checkConfirm(\'Xác nhận Xóa\')" href="'.route('deleteColumn', ['table' => $tableId, 'column' => $td->id]).'"><i class="ion-trash-a"></i></a>
                            </div>';
                // check sub data
                $subData = DB::table('table_column')
                    ->where('parent_id', $td->id)
                    ->where('table_id', $tableId)
                    ->count();
                if ($subData > 0) {
                    $html .= self::getHtmlListTable($tableId, $td->id);
                }
                $html .= '</li>';
            }
            $html .= '</ol>';
        }

        return $html;
    }

    public function getTotal($data, $colName)
    {
        $result = 0;
        foreach ($data as $d) {
            $result += intval($d[$colName]);
        }

        return number_format($result);
    }

    public function changeTypeForColumn($table, $fieldName, $type, $maxlength, $default, $isNull = 1)
    {
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

    public function setTypeForField($table, $fieldName, $type, $maxlength, $default, $isNull = 1)
    {
        switch ($type) {
            case 'INT':
                $table->integer($fieldName)->nullable()->default($default);
                break;
            case 'VARCHAR':
                $table->string($fieldName)->nullable()->default($default);
                break;
            case 'TEXT':
                $table->text($fieldName)->nullable()->default($default);
                break;
            case 'LONGTEXT':
                $table->longText($fieldName)->nullable();
                break;
            case 'DATE':
                $table->date($fieldName)->nullable()->default($default);
                break;
            case 'DATETIME':
                $table->dateTime($fieldName)->nullable();
                break;
        }

        return $table;
    }
}
