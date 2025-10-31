<?php

namespace App\Services\Admin;

use App\Models\Admin\AdminMenu;
use Illuminate\Support\Facades\DB;
use App\Services\Service;
use App\Models\Admin\Table;
use App\Models\Admin\Column;
use App\Models\Admin\Language;
use App\Models\Admin\Log;
use App\Models\Admin\PermissionGroup;
use App\Models\Admin\Product;
use App\Models\AdminUser;
use App\Models\User;
use App\Services\CommonService;
use Carbon\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Milon\Barcode\DNS1D;

/**
 * Class CompanyService
 * @package App\Services\Users
 */
class TblService extends Service
{
    protected $staticFunctions = [
        'getAdminMenu',
        'getPermission',
        'getDatas',
        'deleteDatas',
        'getDataSelect', 'getDataSelect02',
        'getTableDataDragDrop_setting',
        'getColumnSetting',
        'getDataById',
        'saveData',
        'updateData',
        'updateDatas',
        'getTableData',
        'getColumnData',
        'getSelectData',
        'getTableSelects',
        'getDataDragDrop',
        'getPermissionDefault',
        'getDataDetail',
        'getDataEdit',
        'getDataLanguageEdit',
        'getDataSource',
        'getCalendars',
        'formatTableDDItem',
        'saveLog',
        'logView',
        'formatColumn' . 'getDataIndexDefault',
        'formatData',
        'searchByCreatedAt',
        'getQuery',
        'formatDataByID',
        'checkGenerateCode',
        'saveDataBasic',
        'getMenus',
        'getChecklistPercent'
    ];

    protected function getPermissionDefault()
    {
        $tables = Table::get();
        $columns = Column::get();
        $none = [];
        $all = [];

        //none
        foreach (config('constant.per_table') as $val) {
            $none[$val] = [];
        }
        foreach (config('constant.per_col') as $val) {
            $none[$val] = [];
        }

        // all
        foreach ($tables as $tbl) {
            foreach (config('constant.per_table') as $val) {
                if (in_array($val, ['table_share', 'table_create_by'])) {
                    $all[$val] = [];
                } else {
                    $all[$val][] = $tbl->id;
                }
            }
        }

        foreach ($columns as $col) {
            foreach (config('constant.per_col') as $val) {
                if (in_array($val, ['col_create_by', 'col_share'])) {
                    $all[$val] = [];
                } else {
                    $all[$val][] = $col->id;
                }
            }
        }
        return [
            'none' => $none,
            'all' => $all
        ];
    }

    protected function getPermission()
    {
        $per = PermissionGroup::find(\Auth::guard('admin_users')->user()->permission_group_id);
        if (!empty($per->permission)) {
            return $per->permission;
        }

        //none
        $none = [];
        foreach (config('constant.per_table') as $val) {
            $none[$val] = [];
        }
        foreach (config('constant.per_col') as $val) {
            $none[$val] = [];
        }
        return $none;
    }

    protected function getAdminMenu($tableIdSelected = 0, $checkPer = false)
    {
        $user = \Auth::guard('admin_users')->user();
        $permission = PermissionGroup::find($user->permission_group_id);
        $per = [];
        if (!empty($permission->permission)) {
            $per = $permission->permission;
        }
        $result = [];
        // $tables = Table::where('parent_id', 0)->where('show_in_menu', 1)->orderBy('sort_order', 'asc')->get();
        $currentTblNamePermission = [
            'permission_group',
            'categories',
            'admin_users',
            'news',
            'users',
            'orders',
            'contact',
            'file_manager',
            'doi_tac',
            'products',
            'menus',
            'web_config',
            'video',
            'page_setting',
            'library',
            'countries'
        ];
        $tables = Table::whereIn('name', $currentTblNamePermission)->orderBy('sort_order', 'asc')->get();
        foreach ($tables as $table) {
            // check ẩn cài đặt
            if ($table->is_edit == 0) {
                continue;
            }
            $subs = Table::where('parent_id', $table->id)->get();
            $subData = [];
            $parentClass = '';

            // loop check quyền xem danh mục con
            foreach ($subs as $s) {
                // dd($s);
                if ($s->is_edit == 0) {
                    continue;
                }
                if (!$this->permissionShowMenu($s->id, $per) && !$checkPer) {
                    continue;
                }
                $subClass = '';
                if ($s->id == $tableIdSelected) {
                    $subClass = 'ant-menu-item-selected';
                    $parentClass = 'ant-menu-submenu-open-auto-active';
                }
                $subData[] = [
                    'class' => $subClass,
                    'id' => $s->id,
                    'name' => $s->name,
                    'link' => $s->link,
                    'display_name' => $s->display_name,
                ];
            }

            // nếu ko có quyền, hoặc ko có danh mục con nào được quyền xem thì bỏ qua
            if (!$this->permissionShowMenu($table->id, $per) && count($subData) == 0 && !$checkPer) {
                continue;
            }

            // add class if active
            if ($table->id == $tableIdSelected) {
                $parentClass = 'ant-menu-item-selected';
            }

            // add 2 list menu
            $result[] = [
                'parent' => $table,
                'sub' => $subData,
                'class' => $parentClass
            ];
        }
        // dd($result);
        return $result;
    }

    protected function getTableSelects($tableIdSelected = 0, $checkPer = false)
    {
        $user = \Auth::guard('admin_users')->user();
        $permission = PermissionGroup::find($user->permission_group_id);
        $per = [];
        if (!empty($permission->permission)) {
            $per = $permission->permission;
        }
        $selects = [];
        $tables = Table::where('parent_id', 0)->where('show_in_menu', 1)->orderBy('sort_order', 'asc')->get();
        foreach ($tables as $table) {
            if ($table->is_edit == 0) {
                continue;
            }
            if (!$this->permissionShowMenu($table->id, $per) && !$checkPer) {
                continue;
            }
            $subs = Table::where('parent_id', $table->id)->get();
            if (count($subs) == 0) {
                $selects[] = [
                    'value' => $table->id,
                    'label' => $table->display_name
                ];
            }
            foreach ($subs as $s) {
                if ($s->is_edit == 0) {
                    continue;
                }
                if (!$this->permissionShowMenu($s->id, $per) && !$checkPer) {
                    continue;
                }
                $selects[] = [
                    'value' => $s->id,
                    'label' => $s->display_name
                ];
            }
        }
        return $selects;
    }

    protected function getData($table, $id)
    {
        return TblModel::model($table->name)->where('id', $id)->first();
    }

    protected function getDatas($table, $columns, $request = [], $limit = 30, $conditions = [], $isRecycleBin = 0, $isSearchTime = false)
    {
        $per = self::getPermission();
        //select table
        // $data = DB::table($table->name);
        $data = TblModel::model($table->name);
        $data = $data->where('is_recycle_bin', $isRecycleBin);

        if (!empty($request['id'])) {
            $data = $data->where('id', $request['id']);
        }

        if (in_array($table->id, $per['table_create_by'])) {
            $data = $data->where('create_by', \Auth::guard('admin_users')->user()->id);
        }

        //table tab?
        if (!empty($table->table_tab) && !empty($table->table_tab_map_column)) {
            $tabTbl = self::getTable($table->table_tab);
            if (isset($request['tab'])) {
                $tabId = $request['tab'];
            } else {
                $rowData = app('EntityCommon')->findDataLatestByCondition($tabTbl->name);
                $tabId = $rowData->id;
            }
            $data = $data->where($table->table_tab_map_column, $tabId);
        }


        $searchData = [];

        // smart search
        if (!empty($request['sm_keyword'])) {
            $searchData['sm_keyword'] = $request['sm_keyword'];
            $data = $data->where(function ($query) use ($request, $columns) {
                $query->where('name', $request['sm_keyword']);
                $searchSM = ['text', 'textarea'];
                foreach ($columns as $col) {
                    if (!empty($col->type_edit) && in_array($col->type_edit, $searchSM)) {
                        $query->orWhere($col->name, 'like', '%' . $request['sm_keyword'] . '%');
                    }
                }
            });
        }

        if ($isSearchTime) {
            // khoang thoi gian
            if (!empty($request['khoangThoiGian'])) {
                // dd($request['khoangThoiGian']);
                $data = $data->whereBetween('created_at', [$request['khoangThoiGian'][0] . ' 00:00:00', $request['khoangThoiGian'][1] . ' 23:59:59',]);
            } else {
                $mocThoiGian = 'today';
                if (!empty($request['mocThoiGian'])) {
                    $mocThoiGian = $request['mocThoiGian'];
                }
                $data = self::searchByDate($data, $mocThoiGian, 'created_at');
            }
        }

        if (!empty($request['hinh_thuc_thanh_toan_id'])) {
            $data = $data->whereIn('hinh_thuc_thanh_toan_id', $request['hinh_thuc_thanh_toan_id']);
            $searchData['hinh_thuc_thanh_toan_id'] = $request['hinh_thuc_thanh_toan_id'];
        }

        //where condition if exist conditions
        foreach ($columns as $col) {
            if ($col['add2search'] != 1) {
                continue;
            }

            $searchData[$col->name] = '';

            if (empty($request[$col->name])) {
                continue;
            }

            $searchData[$col->name] = $request[$col->name];

            if (in_array($col->type_edit, ['select'])) {
                $searchData[$col->name] = $request[$col->name];
                $data = $data->where($col->name, $request[$col->name]);
                continue;
            }
            if (in_array($col->type_edit, ['selects', 'tags'])) {
                $searchData[$col->name] = $request[$col->name];
                $data = $data->whereJsonContains($col->name, intval($request[$col->name]));
                continue;
            }
            switch ($col->search_type) {
                case '2':
                    $data = $data->where($col->name, '=', $request[$col->name]);
                    break;
                case '3':
                    $data = $data->where($col->name, '!=', $request[$col->name]);
                    break;
                case '4':
                    $data = $data->where($col->name, 'like', '%' . $request[$col->name]);
                    break;
                case '5':
                    $data = $data->where($col->name, 'like', $request[$col->name] . '%');
                    break;
                case '6':
                    $data = $data->whereBetween($col->name, [$request[$col->name][0], $request[$col->name][1]]);
                    break;
                default:
                    //case = 1 or other  if($col->type_edit)
                    $data = $data->where($col->name, 'like', '%' . $request[$col->name] . '%');
                    break;
            }
        }


        //The count of data
        if (empty($table->order_by)) {
            $data = $data->orderBy('id', 'desc');
        } else {
            $order = json_decode($table->order_by, true);

            foreach ($order as $o) {
                $data = $data->orderBy($o['column'], $o['order']);
            }
        }

        if ($limit > 0) {
            $data = $data->paginate($limit);
        } else {
            $data = $data->get();
        }

        if (isset($searchData['khoangThoiGian'])) {
            unset($searchData['khoangThoiGian']);
        }
        if (isset($searchData['mocThoiGian'])) {
            unset($searchData['mocThoiGian']);
        }

        return [
            'searchData' => $searchData,
            'data' => $data
        ];
    }

    protected function getQuery($tableName, $request, $conditions = [], $isRecycleBin = 0, $isSearchTime = false)
    {
        $table = Table::where('name', $tableName)->first();
        $columns = Column::where('table_id', $table->id)->orderBy('sort_order', 'asc')->get();
        $per = self::getPermission();
        //select table
        // $data = DB::table($table->name);
        $data = TblModel::model($table->name);
        $data = $data->where('is_recycle_bin', $isRecycleBin);

        if (!empty($request['id'])) {
            $data = $data->where('id', $request['id']);
        }

        if (in_array($table->id, $per['table_create_by'])) {
            $data = $data->where('create_by', \Auth::guard('admin_users')->user()->id);
        }

        //table tab?
        if (!empty($table->table_tab) && !empty($table->table_tab_map_column)) {
            $tabTbl = self::getTable($table->table_tab);
            if (isset($request['tab'])) {
                $tabId = $request['tab'];
            } else {
                $rowData = app('EntityCommon')->findDataLatestByCondition($tabTbl->name);
                $tabId = $rowData->id;
            }
            $data = $data->where($table->table_tab_map_column, $tabId);
        }


        $searchData = [];

        // smart search
        if (!empty($request['sm_keyword'])) {
            $searchData['sm_keyword'] = $request['sm_keyword'];
            $data = $data->where(function ($query) use ($request, $columns) {
                $query->where('name', $request['sm_keyword']);
                $searchSM = ['text', 'textarea'];
                foreach ($columns as $col) {
                    if (!empty($col->type_edit) && in_array($col->type_edit, $searchSM)) {
                        $query->orWhere($col->name, 'like', '%' . $request['sm_keyword'] . '%');
                    }
                }
            });
        }

        if ($isSearchTime) {
            // khoang thoi gian
            if (!empty($request['khoangThoiGian'])) {
                // dd($request['khoangThoiGian']);
                $data = $data->whereBetween('created_at', [$request['khoangThoiGian'][0] . ' 00:00:00', $request['khoangThoiGian'][1] . ' 23:59:59',]);
            } else {
                $mocThoiGian = 'today';
                if (!empty($request['mocThoiGian'])) {
                    $mocThoiGian = $request['mocThoiGian'];
                }
                $data = self::searchByDate($data, $mocThoiGian, 'created_at');
            }
        }

        if (!empty($request['hinh_thuc_thanh_toan_id'])) {
            $data = $data->whereIn('hinh_thuc_thanh_toan_id', $request['hinh_thuc_thanh_toan_id']);
            $searchData['hinh_thuc_thanh_toan_id'] = $request['hinh_thuc_thanh_toan_id'];
        }

        //where condition if exist conditions
        foreach ($columns as $col) {
            if ($col['add2search'] != 1) {
                continue;
            }

            $searchData[$col->name] = '';

            if (empty($request[$col->name])) {
                continue;
            }

            $searchData[$col->name] = $request[$col->name];

            if (in_array($col->type_edit, ['select'])) {
                $searchData[$col->name] = intval($request[$col->name]);
                $data = $data->where($col->name, $request[$col->name]);
                continue;
            }
            if (in_array($col->type_edit, ['selects', 'tags'])) {
                $searchData[$col->name] = intval($request[$col->name]);
                $data = $data->whereJsonContains($col->name, intval($request[$col->name]));
                continue;
            }
            switch ($col->search_type) {
                case '2':
                    $data = $data->where($col->name, '=', $request[$col->name]);
                    break;
                case '3':
                    $data = $data->where($col->name, '!=', $request[$col->name]);
                    break;
                case '4':
                    $data = $data->where($col->name, 'like', '%' . $request[$col->name]);
                    break;
                case '5':
                    $data = $data->where($col->name, 'like', $request[$col->name] . '%');
                    break;
                case '6':
                    $data = $data->whereBetween($col->name, [$request[$col->name][0], $request[$col->name][1]]);
                    break;
                default:
                    //case = 1 or other  if($col->type_edit)
                    $data = $data->where($col->name, 'like', '%' . $request[$col->name] . '%');
                    break;
            }
        }

        //The count of data
        if (empty($table->order_by)) {
            $data = $data->orderBy('id', 'desc');
        } else {
            $order = json_decode($table->order_by, true);

            foreach ($order as $o) {
                $data = $data->orderBy($o['column'], $o['order']);
            }
        }

        return $data;
    }

    protected function deleteDatas($tableId, $ids)
    {
        $table = Table::find($tableId);

        // xóa data
        // $result = DB::table($table->name)->whereIn('id', $ids)->delete();

        // chuyển vào thùng rác
        $data = ['is_recycle_bin' => 1];
        $result = DB::table($table->name)->whereIn('id', $ids)->update($data);
        // if (is_array($dataId)) {
        //     return DB::table($tblName)->whereIn('id', $dataId)->update($data);
        // }

        return $result;
    }

    protected function getDataById($tableId, $id, $route = '')
    {
        if (empty($route)) {
            $route = \Request::route()->getName();
        }
        $table = Table::find($tableId);
        if (in_array($route, ['data.create', 'data.edit'])) {
            $result = DB::table($table->name)->where('id', $id)->first();
        } else {
            $result = TblModel::find($table->name, $id);
        }
        return $result;
    }

    protected function getDataSelect($col, $data = [])
    {
        $conditionJson = $col->conditions;
        $table = Table::find($col->select_table_id);
        $table_parent = Table::find($col->table_id);
        if (empty($table)) {
            return [];
        }
        $datas = DB::table($table->name);
        $datas = $datas->where('is_recycle_bin', 0);
        // đối với bảng hóa đơn, lấy danh sách thẻ theo khách hàng
        if (!empty($data) && $table_parent->name == 'hoa_don' && $table->name == 'card') {
            // dd($data);
            $datas = $datas->where('users_id', intval($data['users_id']));
        }

        if (!empty($conditionJson)) {
            $condition = json_decode($conditionJson, true);
            foreach ($condition as $key => $val) {
                if (is_array($val)) {
                    $datas = $datas->whereIn($key, $val);
                    continue;
                }
                $datas = $datas->where($key, $val);
            }
        }
        $datas = $datas->orderBy('sort_order', 'asc')->get();

        $dataSelect = [
            'value' => 'id',
            'name' => ['name']
        ];
        if (!empty($col->data_select)) {
            $dataSelect = json_decode($col->data_select, true);
        }
        $select = [];
        foreach ($datas as $data) {
            $label = '';
            // dd($dataSelect);
            foreach ($dataSelect['name'] as $colname) {
                $label .= $data->{$colname} . ' - ';
            }

            $label = rtrim($label, ' - ');
            $select[] = [
                'value' => $data->{$dataSelect['value']},
                'label' => $label,
                'color' => isset($data->color) ? $data->color : ''
            ];
        }
        return $select;
    }

    protected function saveData($columns, $dataId, $table, $post, $tableSltId = 0)
    {
        if ($dataId > 0) {
            $dataOld = DB::table($table->name)->where('id', $dataId)->first();
            $data = TblModel::find($table->name, $dataId);
        } else {
            $dataOld = [];
            $data = TblModel::model($table->name);
        }
        if (empty($dataId)) {
            $data->create_by = \Auth::guard('admin_users')->user()->id;
        }

        $isGetLink = false;
        $colLink = '';
        foreach ($columns as $column) {
            // save if is select table
            if ($column->name == 'data_id' && !empty($tableSltId)) {
                $data->{$column->name} = $tableSltId;
                continue;
            }
            if ($dataId == 0) {
                $dataOld[$column->name] = '';
            }

            if (!empty($column->block_type)) {
                continue;
            }

            if (in_array($column->name, ['id', 'created_at', 'updated_at'])) {
                continue;
            }

            if ($column->type_edit == 'route_link' && !empty($post['name'])) {
                $isGetLink = true;
                $colLink = $column->name;
                continue;
            }

            if (empty($column->edit)) {
                continue;
            }

            if (empty($post[$column->name])) {

                if ($column->type == 'INT' && in_array($column->type_edit, ['number'])) {
                    $data->{$column->name} = 0;
                    continue;
                }

                if (in_array($column->type_edit, ['date', 'datetime'])) {
                    $data->{$column->name} = null;
                    continue;
                }

                if (!empty($column->value_default)) {
                    $data->{$column->name} = $column->value_default;
                    continue;
                }

                $data->{$column->name} = null;
                continue;
            }

            // cham cong
            if (in_array($column->type_edit, ['calendar_cham_cong', 'calendar_lich_hen'])) {
                $data->{$column->name} = json_encode($post[$column->name]);
                continue;
            }

            // permission
            if ($column->type_edit == 'permission_list') {
                $data->{$column->name} = json_encode($post[$column->name]);
                continue;
            }

            //encryption
            if ($column->type_edit == 'encryption' && !empty($post[$column->name])) {
                $data->{$column->name} = bcrypt($post[$column->name]);
                continue;
            }

            //cascader
            if ($column->type_edit == 'cascader' && !empty($post[$column->name])) {
                $key = str_replace('"', '', $post[$column->name][0]);
                $data->{$column->name} = $key;
                $data->{$key} = $post[$column->name][1];
                continue;
            }

            // default
            if (!isset($post[$column->name])) {
                if (!empty($column->value_default)) {
                    $data->{$column->name} = $column->value_default;
                }
                if ($column->type == 'INT' || in_array($column->type_edit, ['number', 'select'])) {
                    $data->{$column->name} = 0;
                    continue;
                }
                $data->{$column->name} = null;
                continue;
            }

            if ($column->type_edit == 'service') {
                $serviceJson = json_encode($post[$column->name]);
                $data->{$column->name} = $serviceJson;
                continue;
            }

            // permission_list
            if ($column->type_edit == 'permission_list') {
                if (!empty($post[$column->name])) {
                    $data->{$column->name} = json_encode($post[$column->name]);
                }
                continue;
            }

            //number
            if ($column->type_edit == 'number') {
                $value = str_replace(',', '', $post[$column->name]);
                $data->{$column->name} = intval($value);
                continue;
            }

            //DATE
            if ($column->type_edit == 'DATE') {
                $data[$column->name] = null;
                if (!empty($post[$column->name])) {
                    $date = date('Y-m-d', strtotime($post[$column->name]));
                    $data->{$column->name} = $date;
                }
                continue;
            }

            // DATETIME
            if ($column->type_edit == 'DATETIME') {
                $data[$column->name] = null;
                if (!empty($post[$column->name])) {
                    $date = date('Y-m-d H:i:s', strtotime($post[$column->name]));
                    $data->{$column->name} = $date;
                }
                continue;
            }

            //images
            if (in_array($column->type_edit, ['image_crop', 'image'])) {
                $data->{$column->name} = '';
                if (!empty($post[$column->name])) {
                    $is_uploadImage = true;
                    $colImage = $column;
                }
                continue;
            }

            if (in_array($column->type_edit, ['images_crop', 'images'])) {
                $data->{$column->name} = '';
                if (!empty($post[$column->name])) {
                    $is_uploadImages = true;
                    $colImages = $column;
                }
                continue;
            }

            if (in_array($column->type_edit, ['file'])) {
                $data->{$column->name} = '';
                if (!empty($post[$column->name])) {
                    $is_uploadFile = true;
                    $colFile = $column;
                }
                continue;
            }

            if (in_array($column->type_edit, ['files'])) {
                $data->{$column->name} = '';
                if (!empty($post[$column->name])) {
                    $is_uploadFiles = true;
                    $colFiles = $column;
                }
                continue;
            }

            if ($column->type_edit == 'selects_table') {

                if (!isset($post['is_change_selects_table'])) {
                    continue;
                }
                if (empty($post[$column->name])) {
                    $data->{$column->name} = null;
                    continue;
                }
                $ids_selected = [];
                $table_slt = Table::find($column->select_table_id);
                $column_slt = Column::where('table_id', $column->select_table_id)->get();

                if (!empty($data->id) && !empty($data->{$column->name})) {
                    $this->deleteDatas($table_slt->id, json_decode($data->{$column->name}, true));
                }
                $data->save();
                foreach ($post[$column->name] as $itemSlt) {
                    unset($itemSlt['key']);
                    unset($itemSlt['action']);
                    unset($itemSlt['index']);
                    unset($itemSlt['col_name']);
                    $data_slt = self::saveData($column_slt, 0, $table_slt, $itemSlt, $data->id);
                    $ids_selected[] = $data_slt->id;
                }
                $data->{$column->name} = json_encode($ids_selected);
                continue;
            }

            // selects
            if (in_array($column->type_edit, ['selects'])) {
                $data->{$column->name} = '';
                if (!empty($post[$column->name])) {
                    if (isset($post[$column->name]['ids'])) {
                        $data->{$column->name} = $post[$column->name]['ids'];
                        continue;
                    }
                    $data->{$column->name} = $post[$column->name];
                }
                continue;
            }

            if (in_array($column->type_edit, ['select'])) {
                if (!empty($post[$column->name])) {
                    if (isset($post[$column->name]['info'])) {
                        unset($post[$column->name]['info']);
                    }
                    if (isset($post[$column->name]['id'])) {
                        $data->{$column->name} = $post[$column->name]['id'];
                        continue;
                    }
                    $data->{$column->name} = $post[$column->name];
                }
                continue;
            }

            if (in_array($column->type_edit, ['tags'])) {
                if (!empty($post[$column->name])) {
                    $tableTag = Table::find($column->select_table_id);
                    $tabTmp = [];
                    foreach ($post[$column->name] as $t) {
                        $checkTagId = DB::table($tableTag->name)->where('id', $t)->count();
                        $tagId = $t;
                        if ($checkTagId == 0) {
                            $checkTagName = DB::table($tableTag->name)->where('name', $t)->first();
                            if (empty($checkTagName)) {
                                $tagId = $this->insertData($tableTag->name, ['name' => $t]);
                            } else {
                                $tagId = $checkTagName->id;
                            }
                        }
                        $tabTmp[] = intval($tagId);
                    }
                    $data->{$column->name} = json_encode($tabTmp);
                    continue;
                }
            }

            // editor
            if (in_array($column->type_edit, ['tiny', 'ckeditor', 'sumernote'])) {
                $content = $post[$column->name];
                if (!empty($post['tiny_images'])) {
                    foreach ($post['tiny_images'] as $imageName) {
                        $img_tmp = 'files/tmp/' . $imageName;
                        $newFile = 'files/tinyMCE/' . $imageName;
                        if (file_exists($img_tmp)) {
                            if (!file_exists('files/tinyMCE/')) {
                                mkdir('files/tinyMCE/', 0777, true);
                            }
                            rename($img_tmp, $newFile);
                        }
                        $content = str_replace($img_tmp, $newFile, $content);
                    }
                }
                // $content = str_replace('../../../../', '/', $content);
                // $content = str_replace('../../../', '/', $content);
                // $content = str_replace('../', '/', $content);
                // $content = str_replace('//', '/', $content);
                $data->{$column->name} = $content;
                continue;
            }

            // default
            $data->{$column->name} = $post[$column->name];
        }

        if (empty($data->create_by)) {
            $data->create_by = \Auth::guard('admin_users')->user()->id;
        }

        // save
        $data->save();
        $dataId = $data->id;

        // generate code
        self::checkGenerateCode($data, $table, $columns);

        // save log
        self::saveLog($table->id, $dataId, $dataOld);

        // upload image
        foreach ($columns as $column) {
            //images
            if (!empty($post[$column->name]) && in_array($column->type_edit, ['image_crop', 'image', 'images_crop', 'images'])) {
                //$this->uploadImages2S3($post, $colImage, $dataId, $table);
                $this->uploadImages($post, $column, $dataId, $table);
                continue;
            }
        }

        // update thêm tùy theo đặc tính của mỗi tính năng
        $data = $this->updateByBusiness($table, $data, $post);


        $dataUpdate = [];

        if ($isGetLink) {
            $dataUpdate['name'] = $post['name'];
        }


        // insert lang
        if ($table->is_multiple_language == 1) {
            $languageFirst = Language::where('is_key', 1)->first();
            if (empty($languageFirst)) {
                $languageFirst = Language::first();
            }
            $langName = 'lang_' . $languageFirst->id . '_name_data';

            if (isset($post[$langName])) {
                $dataUpdate['name'] = $post[$langName];
            }

            if ($isGetLink && isset($post['lang_' . $languageFirst->id . '_' . $colLink])) {
                $dataUpdate['name'] = $post['lang_' . $languageFirst->id . '_' . $colLink];
            }
            // save language
            $this->saveDataLanguage($table, $post, $dataId);
        }

        if (!empty($dataUpdate)) {
            $this->updateData($table->name, $dataId, $dataUpdate);
        }

        return $data;
    }

    /**
     * Hàm này để  update thêm tùy theo đặc tính của mỗi tính năng
     * @param mixed $table
     * @param mixed $data
     * @param mixed $post
     * @return void
     */
    protected function updateByBusiness($table, $data, $post)
    {
        // xử lý đối với table product_kiem_kho
        if ($table->name == 'product_kiem_kho') {
            $product = Product::find($post['product_id']);
            $data->ton_kho = intval($product->ton_kho);
            $data->so_luong_lech = intval($post['thuc_te']) - intval($product->ton_kho);
            $data->gia_tri_lech = $data->so_luong_lech * $product->gia_von;

            $product->ton_kho = $post['thuc_te'];
            $product->save();
            $data->save();
        }

        if ($table->name == 'product_nhap_hang') {
            $product = Product::find($post['product_id']);
            $tonKho = $post['so_luong'] + intval($product->ton_kho);
            $giamGia = !empty($post['giam_gia']) ? intval($post['giam_gia']) : 0;
            $data->ton_kho = $tonKho;
            $data->thanh_tien = intval($post['gia_nhap']) * intval($post['so_luong']) - $giamGia;
            $data->save();

            $product->ton_kho = $tonKho;
            $product->save();
        }

        if ($table->name == 'product_khach_tra_hang') {
            $product = Product::find($post['product_id']);
            $tonKho = intval($product->ton_kho) + $post['so_luong'];
            $giamGia = !empty($post['giam_gia']) ? intval($post['giam_gia']) : 0;
            $giaBan = !empty($post['gia_ban']) ? intval($post['gia_ban']) : $product->gia_ban;
            $thanhTien = $giaBan * intval($post['so_luong']) - $giamGia;

            $data->ton_kho = $tonKho;
            $data->gia_ban = $giaBan;
            $data->thanh_tien = $thanhTien;
            $data->save();

            $product->ton_kho = $tonKho;
            $product->save();
        }

        if ($table->name == 'product_tra_hang_ncc') {
            $product = Product::find($post['product_id']);
            $tonKho = intval($product->ton_kho) - $post['so_luong'];
            $giamGia = !empty($post['giam_gia']) ? intval($post['giam_gia']) : 0;
            $giaNhap = !empty($post['gia_nhap']) ? intval($post['gia_nhap']) : $product->gia_von;
            $thanhTien = $giaNhap * intval($post['so_luong']) - $giamGia;

            $data->ton_kho = $tonKho;
            $data->gia_nhap = $giaNhap;
            $data->thanh_tien = $thanhTien;
            $data->save();

            $product->ton_kho = $tonKho;
            $product->save();
        }


        return $data;
    }

    /**
     * Summary of saveLogColumn
     * @param mixed $tableName là bảng thay đỏi
     * @param mixed $info = [
        'valOld' => $valOld,
        'valNew' => $valNew,
        'titleLog' => $titleLog,
      ]
     * @param mixed $tblLog
     * @return string
     */
    protected function saveLogColumn($tableName, $dataId, $columnName = '', $info = [], $isAddnew = 0, $tblLog = 'log')
    {

        $table = Table::where('name', $tableName)->first();
        $user = \Auth::guard('admin_users')->user();
        $log = TblModel::model($tblLog);
        $date = date('d/m/Y H:i:s');

        $dataNew = TblModel::find($tableName, $dataId);

        if (empty($info['titleLog'])) {
            $checkLog = Log::where('table_name', $tableName)->where('data_id', $dataId)->count();
            if ($checkLog == 0) {
                $log->name = "Đã thêm mới '{$table->display_name}'";
            } else {
                // $log->name = "[{$date}] '{$user->name}' Đã sửa '{$table->display_name}': '{$info['valOld']}' ==> '{$info['valNew']}'";
                $log->name = "Đã sửa '{$table->display_name}'";
            }
        } else {
            $log->name = $info['titleLog'];
        }

        $log->table_id = $table->id;

        $log->data_id = $dataId;
        $log->table_id = $table->id;
        $log->column_name = $columnName;
        $log->table_name = $tableName;
        $log->create_by = $user->id;

        $log->column_name = $columnName;
        $log->col_value_old = isset($info['valOld']) ? $info['valOld'] : '';
        $log->col_value_new = isset($info['valNew']) ? $info['valNew'] : '';
        $log->link = route('data.detail', [$table->id, $dataId]);
        $log->save();
        return '';
    }

    protected function saveLog($tableId, $dataId, $dataOld = null, $condition = [], $tblLog = 'log')
    {
        $table = Table::find($tableId);
        $user = \Auth::guard('admin_users')->user();
        $dataNew = DB::table($table->name)->where('id', $dataId)->first();
        $log = TblModel::model($tblLog);
        $date = date('d/m/Y H:i:s');

        $checkLog = Log::where('table_id', $table->id)->where('data_id', $dataId)->count();
        if ($checkLog == 0) {
            $log->name = "[{$date}] '{$user->name}' Đã thêm mới '{$table->display_name}': '{$dataNew->name}'";
        } else {
            $log->name = "[{$date}] '{$user->name}' Đã cập nhật '{$table->display_name}': '{$dataNew->name}'";
        }

        foreach ($condition as $key => $val) {
            $log->{$key} = $val;
            $log->{$key} = $val;
        }

        // $log->data_old = json_decode(json_encode($dataOld), true);
        // $log->data_new = json_decode(json_encode($dataNew), true);

        $log->data_id = $dataId;
        $log->table_id = $table->id;
        $log->create_by = $user->id;
        $log->link = route('data.detail', [$table->id, $dataId]);
        $log->save();
        return '';
    }

    /**
     * $tableId
     * $dataId
     * $type
     */
    protected function logView($tableId, $dataId, $type)
    {
        $table = Table::find($tableId);

        $user = \Auth::guard('admin_users')->user();
        $log = new Log();
        $date = date('d/m/Y H:i:s');

        $log->table_id = $table->id;
        $log->admin_users_id = $user->id;

        if ($type == 'index') {
            $log->data_id = 0;
            $log->name = "[{$date}] '{$user->name}' Đã truy cập \"'{$table->display_name}'\"";
            return $log->save();
        }

        if ($type == 'detail') {
            $data = DB::table($table->name)->find($dataId);
            $name = "[{$date}] '{$user->name}' Đã vào xem {$table->display_name} - \"'{$data->name}'\"";
            if ($table->name == 'report' && !empty($data->create_by)) {
                $userAdm = AdminUser::find($data->create_by);
                if (!empty($userAdm)) {
                    $name = "[{$date}] '{$user->name}' Đã vào xem {$table->display_name} - \"'{$data->name}'\" ({$userAdm->name})";
                }
            }
            $log->name = $name;
            $log->data_id = $dataId;
            $log->link = empty($dataId) ? '' : route('data.detail', [$table->id, $dataId]);
            return $log->save();
        }

        return '';
    }

    protected function checkGenerateCode($data, $table, $columns, $isSaveBarcode = false)
    {
        $dataId = $data->id;
        foreach ($columns as $column) {
            if (empty($column->auto_generate_code) || (!empty($column->auto_generate_code) && !empty($data->{$column->name}))) {
                continue;
            }
            $auto = json_decode($column->auto_generate_code, true);
            // check id length
            if (!empty($auto['length'])) {
                $dataId = self::formatNumberByLength($dataId, $auto['length']);
            }

            if ($table->name == 'users') {
                $chiNhanh = DB::table('chi_nhanh')->find(intval(value: \Auth::guard('admin_users')->user()->chi_nhanh_id));
                if (!empty($chiNhanh)) {
                    $auto['prefix'] = $chiNhanh->code;
                }
            }

            // set data insert
            // $data = [];
            $data->{$column->name} = $auto['prefix'] . $dataId;

            if ($isSaveBarcode) {
                $d = new DNS1D();
                $data->barcode = $d->getBarcodeHTML($data->{$column->name}, 'C128');
            }
            $data->save();
            // $this->updateData($table->name, $dataId, $data);
            return $data;
        }
    }

    static function formatNumberByLength($number, $length = 5)
    {
        $result = $number;
        $strlen = strlen($number);
        if ($strlen < $length) {
            $count = $length - $strlen;
            $text = '0';
            for ($i = 1; $i < $count; $i++) {
                $text .= '0';
            }
            $result = $text . $result;
        }
        return $result;
    }

    private function saveDataLanguage($table, $post, $dataId)
    {
        $language = Language::orderBy('sort_order', 'asc')->get();
        $tableLanguage = Table::where('name', $table->name . '_data')->first();
        $columnsLanguage = Column::where('table_id', $tableLanguage->id)->get();
        foreach ($language as $lang) {
            $dataLang = [
                'languages_id' => $lang->id,
                'data_id' => $dataId
            ];
            foreach ($columnsLanguage as $column) {
                if (!empty($column->block_type)) {
                    continue;
                }
                if (in_array($column->name, ['id', 'created_at', 'updated_at'])) {
                    continue;
                }
                if (empty($column->edit)) {
                    continue;
                }

                $key = 'lang_' . $lang->id . '_' . $column->name;

                // default
                if (!isset($post[$key])) {
                    if (!empty($column->value_default)) {
                        $dataLang[$column->name] = $column->value_default;
                    }
                    if ($column->type == 'INT' || in_array($column->type_edit, ['number', 'select'])) {
                        $dataLang[$column->name] = 0;
                        continue;
                    }
                    $dataLang[$column->name] = null;
                    continue;
                }

                //number
                if ($column->type_edit == 'number') {
                    $value = str_replace(',', '', $post[$key]);
                    $dataLang[$column->name] = intval($value);
                    continue;
                }

                // editor
                if (in_array($column->type_edit, ['tiny', 'ckeditor', 'sumernote'])) {
                    $content = $post[$key];
                    if (!empty($post['tiny_images'])) {
                        foreach ($post['tiny_images'] as $imageName) {
                            $img_tmp = 'files/tmp/' . $imageName;
                            $newFile = 'files/tinyMCE/' . $imageName;
                            if (file_exists($img_tmp)) {
                                if (!file_exists('files/tinyMCE/')) {
                                    mkdir('files/tinyMCE/', 0777, true);
                                }
                                rename($img_tmp, $newFile);
                            }
                            $content = str_replace($img_tmp, $newFile, $content);
                        }
                    }
                    $content = str_replace('../../../../', '/', $content);
                    $content = str_replace('../../../', '/', $content);
                    $content = str_replace('../', '/', $content);
                    // $content = str_replace('//', '/', $content);
                    // $content = str_replace('//', '/', $content);
                    $dataLang[$column->name] = $content;
                    continue;
                }
                $dataLang[$column->name] = $post[$key];
            }
            $dataLanguage = DB::table($tableLanguage->name)
                ->where('data_id', $dataId)
                ->where('languages_id', $lang->id)
                ->first();

            if (empty($dataLanguage)) {
                //insert
                $this->insertData($tableLanguage->name, $dataLang);
                continue;
            }

            $this->updateData($tableLanguage->name, $dataLanguage->id, $dataLang);
        }
    }

    protected function uploadImages2S3($post, $column, $dataId, $table)
    {
        $images = [];
        $avatar = '';
        $url = '';
        if (!isset($post['image'][0])) {
            return false;
        }
        $img = $post['image'][0];
        $url = $img['url'];
        if ($img['status'] == 'done') {
            $file = File::get('files/' . $img['url']);
            Storage::disk('s3')->put($img['url'], $file);
            $url = env('AWS_URL') . $img['url'];
            // Storage::move($img['url'], 'datas/' . $table->id .'/' . $img['name']);
            // $url = '/files/datas/' . $table->id .'/' . $img['name'];
        }
        $this->updateData($table->name, $dataId, [$column->name => $url]);
        return true;
    }

    protected function uploadImages($post, $column, $dataId, $table)
    {
        $images = [];
        $avatar = '';
        if (!file_exists('files/datas')) {
            mkdir('files/datas', 0777, true);
        }
        if (!file_exists('files/datas/' . $table->id)) {
            mkdir('files/datas/' . $table->id, 0777, true);
        }
        // dd($post[$column->name]);
        // multiple img
        foreach ($post[$column->name] as $idx => $img) {
            // dd( $img);
            // $url = $img['url'];
            if ($img['status'] == 'OK') {
                $url = $img['url'];
            }

            if ($img['status'] == 'done') {
                Storage::move($img['response']['data']['filePath'], 'datas/' . $table->id . '/' . $img['name']);
                $url = '/files/datas/' . $table->id . '/' . $img['name'];
            }
            if ($idx == 0) {
                $avatar = $url;
            }
            $images[] = $url;
        }

        $dataInsert = '';
        if (!empty($images)) {
            $dataInsert = [
                $column->name => json_encode(['avatar' => $avatar, 'images' => $images])
            ];
        }
        $this->updateData($table->name, $dataId, $dataInsert);
    }

    /*
     * insert
     * $tblName: table name
     * $data: data insert, ex: ['column_name' => 'value insert',]
     */
    protected function updateData($tblName, $dataId, $data)
    {
        $data['updated_at'] = date('Y-m-d h:i:s');
        if (is_array($dataId)) {
            return DB::table($tblName)->whereIn('id', $dataId)->update($data);
        }
        return DB::table($tblName)->where('id', $dataId)->update($data);
    }

    /*
     * insert
     * $tblName: table name
     * $data: data insert, ex: ['column_name' => 'value insert',]
     */
    protected function insertData($tblName, $data, $multipleData = false)
    {
        $now = date('Y-m-d h:i:s');
        if ($multipleData) {
            DB::table($tblName)->insert($data);
            return DB::getPdo()->lastInsertId();
        }


        if (empty($data['created_at'])) {
            $data['created_at'] = $now;
        }
        if (empty($data['updated_at'])) {
            $data['updated_at'] = $now;
        }
        return DB::table($tblName)->insertGetId($data);
    }

    protected function getTableDataDragDrop($parentId = 0, $conditions = [], $isShowTblName = 0)
    {
        $result = [];
        $tables = Table::where('parent_id', $parentId);
        if (!empty($conditions)) {
            foreach ($conditions as $key => $val) {
                $tables = $tables->where($key, $val);
            }
        }
        $tables = $tables->orderBy('sort_order', 'asc')->get();

        foreach ($tables as $idx => $table) {
            $title = $table->display_name;
            if ($isShowTblName == 1) {
                $title = $table->name . ' - ' . $table->display_name;
            }
            $result[] = self::formatTableDDItem($title, $table);
        }
        return $result;
    }

    protected function formatTableDDItem($title, $table)
    {
        return [
            'key' => $table->id,
            'title' => $title,
            'children' => $this->getTableDataDragDrop($table->id),
            'is_label' => $table->is_label,
            'is_edit' => $table->is_edit,
            'setting_shotcut' => $table->setting_shotcut,
            'import' => $table->import,
            'export' => $table->export,
            'is_show_btn_edit' => $table->is_show_btn_edit,
            'is_show_btn_detail' => $table->is_show_btn_detail,
            'have_delete' => $table->have_delete,
            'have_add_new' => $table->have_add_new,
            'have_delete' => $table->have_delete,
            'smart_search' => $table->smart_search,
            'show_in_menu' => $table->show_in_menu,
        ];
    }

    protected function getDataDragDrop($tableId, $parentId = 0, $conditions = [])
    {
        $result = [];
        $table = Table::find($tableId);
        $datas = DB::table($table->name)
            ->where('parent_id', $parentId)
            ->where('is_recycle_bin', '!=', 1)
            ->orderBy('sort_order', 'asc');
        if (!empty($conditions)) {
            foreach ($conditions as $key => $val) {
                $datas = $datas->where($key, $val);
            }
        }
        $datas = $datas->get();
        foreach ($datas as $data) {
            $note = '';
            if ($table->name == 'menus' && $data->is_active != 1) {
                $note .= ' (Tạm ẩn)';
            }
            $result[] = [
                'key' => $data->id,
                'title' => $data->name . $note,
                'children' => $this->getDataDragDrop($tableId, $data->id, $conditions),
            ];
        }

        return $result;
    }

    protected function getColumnData($tableId, $parentId = 0, $isShowColName = 0)
    {
        $result = [];
        $column = Column::where('table_id', $tableId)->where('parent_id', $parentId)->orderBy('sort_order', 'asc')->get();
        foreach ($column as $col) {
            $result[] = [
                'key' => $col->id,
                'title' => $col->id . ' - ' . $col->name . ' - ' . $col->display_name . ' - ' . $col->type . ' - ' . $col->type_edit,
                'children' => $this->getColumnData($tableId, $col->id),
                // checkbox
                'edit' => $col->edit,
                'type_edit' => $col->type_edit,
                'show_in_list' => $col->show_in_list,
                'require' => $col->require,
                'add2search' => $col->add2search,
                'add_express' => $col->add_express,
                'is_label' => $col->is_label,
                'setting_shotcut' => $col->setting_shotcut
            ];
        }
        return $result;
    }

    protected function getColumnSetting($tableId, $parentId = 0)
    {
        $result = [];
        $column = Column::where('table_id', $tableId)->where('parent_id', $parentId)->orderBy('sort_order', 'asc')->get();
        foreach ($column as $col) {
            if (in_array($col->name, ['id', 'sort_order', 'parent_id'])) {
                continue;
            }
            if ($col->edit != 1) {
                continue;
            }
            $result[] = [
                'key' => $col->id,
                'title' => $col->display_name,
                'children' => $this->getColumnSetting($tableId, $col->id),

                // checkbox
                'edit' => $col->edit,
                'type_edit' => $col->type_edit,
                'show_in_list' => $col->show_in_list,
                'require' => $col->require,
                'add2search' => $col->add2search,
                'add_express' => $col->add_express,
                'block_type' => $col->block_type,
                'placeholder' => $col->placeholder,
                'is_label' => $col->is_label,
                'setting_shotcut' => $col->setting_shotcut
            ];
        }
        return $result;
    }

    protected function getDataDetail($tableId, $dataId)
    {
        $table = Table::find($tableId);
        $tables = self::getAdminMenu($table->id);
        $columns = Column::where('table_id', $tableId)->orderBy('sort_order', 'asc')->get();
        $data = self::getDataById($tableId, $dataId);
        $selectData = [];
        $isImage = false;
        $isImages = false;
        $tablesPermission = [];
        $userPermission = [];
        foreach ($columns as $col) {

            if (in_array($col->type_edit, ['select', 'select2'])) {
                $dataTmp = self::getDataSelect($col);
                foreach ($dataTmp as $d) {
                    $selectData[$col->name][$d['value']] = $d['label'];
                    if (!empty($d['color']))
                        $selectColor[$col->name][$d['value']] = $d['color'];
                }
            }

            if (in_array($col->type_edit, ['image', 'image_crop'])) {
                $isImage = true;
            }

            if (in_array($col->type_edit, ['images', 'images_crop'])) {
                $isImages = true;
            }

            // Remove un needed data
            if (in_array($col->type_edit, ['encryption'])) {
                $data->{$col->name} = '';
            }

            if ($col->type_edit == 'permission_list') {
                $userPermission = json_decode($data->permission, true);
                $tablesPermission = self::getAdminMenu(0, true);
            }
        }
        return [
            'tables' => $tables,
            'table' => $table,
            'columns' => $columns,
            'data' => $data,
            'selectData' => $selectData,
            'isImages' => $isImages,
            'isImage' => $isImage,
            'userPermission' => $userPermission,
            'tablesPermission' => $tablesPermission
        ];
    }


    protected function getDataLanguageEdit($tableId, $dataId, $route = '')
    {
        $datasView = self::getDataEdit($tableId, $dataId, $route);

        $table = Table::find($tableId);

        //data
        $tableLanguage = Table::where('name', $table->name . '_data')->first();

        $data = json_decode(json_encode($datasView['data']), true);
        $datasView['columnsLanguage'] = Column::where('table_id', $tableLanguage->id)->get();
        $datasView['language'] = Language::orderBy('sort_order', 'asc')->get();

        $dataLang = [];
        foreach ($datasView['language'] as $colLang) {
            if ($dataId == 0) {
                $dataLang[$colLang->id] = [];
                foreach ($datasView['columnsLanguage'] as $cl) {
                    $name = 'lang_' . $colLang->id . '_' . $cl->name;
                    if ($cl->edit == 1) {
                        $data[$name] = '';
                    }
                }
                continue;
            }
            $dataLang[$colLang->id] = DB::table($table->table_data)
                ->where('languages_id', $colLang->id)
                ->where('data_id', $dataId)
                ->first();
            if (!empty($dataLang[$colLang->id])) {
                foreach ($datasView['columnsLanguage'] as $cl) {
                    $name = 'lang_' . $colLang->id . '_' . $cl->name;
                    if ($cl->edit == 1) {
                        if (!empty($dataLang[$colLang->id]->{$cl->name})) {
                            $data[$name] = $dataLang[$colLang->id]->{$cl->name};
                        }
                    }
                }
                continue;
            }
        }
        $datasView['dataLanguage'] = $dataLang;
        $datasView['data'] = $data;
        return $datasView;
    }

    protected function getDataEdit($tableId, $dataId = 0, $route = '')
    {
        $table = Table::find($tableId);
        $tables = self::getAdminMenu($tableId, true);
        $columns = Column::where('table_id', $tableId)->orderBy('sort_order', 'asc')->get();
        $data = [];
        if (!empty($dataId)) {
            $data = self::getDataById($tableId, $dataId, $route);
            $data = json_decode(json_encode($data), true);
        }
        $tablesPermission = [];
        $permissionList_all = [];
        $userPermission = $this->getPermissionListDefault();
        $selectData = [];
        $selectsData = [];
        $ckeditorData = [];
        $imagesData = [];
        $filesData = [];
        $avatar = [];
        $tabs = [];
        $blocks = [];
        $countImage = 1;
        $isImage = false;
        $isImages = false;
        $selectTbl = [];
        $dataSelectTbl = [];
        $code = [];
        $isShowModalSelectTable = [];
        $columnSelectTable = [];
        $cascader = [];
        foreach ($columns as $col) {
            if (empty($dataId)) {
                $data[$col->name] = '';
            }

            if ($col->block_type == 'tab') {
                $tabs[] = $col;
                continue;
            }
            if (!empty($col->block_type)) {
                $blocks[] = $col;
                continue;
            }
            if (!empty($col->auto_generate_code)) {
                $code = json_decode($col->auto_generate_code, true);
            }
            if ($col->type_edit == 'cascader') {
                $cascader[$col->name] = empty($col->data_select) ? [] : json_decode($col->data_select, true);
                if (!empty($data[$col->name]) && !empty($data[$data[$col->name]])) {
                    $data[$col->name] = [$data[$col->name], $data[$data[$col->name]]];
                }
            }
            // check type == select
            if (in_array($col->type_edit, ['select', 'selects', 'selects_normal', 'tags'])) {
                if (empty($dataId) && in_array($col->type_edit, ['selects', 'tags'])) {
                    $data[$col->name] = [];
                }
                if ($route == 'data.detail') {
                    $dataTmp = self::getDataSelect($col);
                    foreach ($dataTmp as $d) {
                        $selectData[$col->name][$d['value']] = $d['label'];
                        if (!empty($d['color']))
                            $selectColor[$col->name][$d['value']] = $d['color'];
                    }
                } else {
                    $selectData[$col->name] = self::getDataSelect($col, $data);
                }
                $datasView['selectData'] = $selectData;
            }

            // check type == selects
            if (in_array($col->type_edit, ['selects', 'tags', 'selects_normal']) && !empty($col->select_table_id)) {
                $dataTmp = self::getDataSelect($col);
                foreach ($dataTmp as $d) {
                    $selectsData[$col->name][$d['value']] = $d['label'];
                    if (!empty($d['color'])) {
                        $selectColor[$col->name][$d['value']] = $d['color'];
                    }
                }
            }

            if ($col->type_edit == 'permission_list') {
                if (!empty($data['permission'])) {
                    $userPermission = json_decode($data['permission'], true);
                }
                $per = TblService::getPermissionDefault();
                $permissionList_all = $per['all'];
                $tablesPermission = TblService::getAdminMenu(0, true);
            }


            if ($col->type_edit == 'selects_table') {
                $columnSelectTable[$col->name] = $this->getColumn($col->select_table_id);
                $getDataSelectTbl = $this->getDataSelectTbl($col, $data);

                $selectTbl[$col->name] = $getDataSelectTbl;
                $dataSelectTbl[$col->name] = $getDataSelectTbl['datas']['dataSource'];
                $isShowModalSelectTable[$col->name] = false;
            }
            if (in_array($col->type_edit, ['image', 'image_crop', 'images', 'images_crop'])) {
                $imagesData[$col->name] = [];
            }

            if ($dataId > 0) {
                // check type == ckeditor
                if (in_array($col->type_edit, ['ckeditor', 'summernote', 'summoner', 'tiny'])) {
                    $ckeditorData[$col->name] = $data[$col->name];
                }

                if (in_array($col->type_edit, ['encryption'])) {
                    $data[$col->name] = '';
                }

                // check type == images
                if (in_array($col->type_edit, ['image', 'image_crop', 'images', 'images_crop'])) {
                    $imagesData[$col->name] = [];

                    if (empty($data[$col->name])) {
                        continue;
                    }
                    if (is_array($data[$col->name])) {
                        $jsonImage = $data[$col->name];
                    } else {
                        $jsonImage = CommonService::isJson($data[$col->name]);
                    }

                    if ($jsonImage && isset($jsonImage['images'])) {

                        foreach ($jsonImage['images'] as $k => $img) {
                            $imagesData[$col->name][] = [
                                'name' => 'image-' . $k,
                                'status' => 'OK',
                                'url' => $img
                            ];
                            if ($k == 0) {
                                $avatar[$col->name] = $img;
                            }
                        }
                    } else {
                        $imagesData[$col->name][] = [
                            'name' => 'image-0',
                            'status' => 'OK',
                            'url' => $data[$col->name]
                        ];
                        $avatar[$col->name] = $data[$col->name];
                    }

                    $avatar[$col->name] = $data[$col->name];
                }

                //
                if (in_array($col->type_edit, ['encryption'])) {
                    $data[$col->name] = '';
                }
            }
        }

        $cascaderData = [];
        foreach ($cascader as $key => $cas) {
            $item = [];
            foreach ($cas as $ca) {
                $colInfo = Column::where('name', $ca)->where('table_id', $tableId)->first();
                $item[] = [
                    'value' => $colInfo->name,
                    'label' => $colInfo->display_name,
                    'children' => $selectData[$ca]
                ];
            }
            $cascaderData[$key] = $item;
        }
        $dataRelated = $this->getDataRelated($table, $data);
        $p = $_GET['p'] ?? 0;
        return [
            'time' => time(),
            'dataId' => $dataId,
            'tables' => $tables,
            'table' => $table,
            'columns' => $columns,
            'tabs' => $tabs,
            'blocks' => $blocks,
            'data' => $data,
            'selectData' => $selectData,
            'selectsData' => $selectsData,
            'ckeditorData' => $ckeditorData,
            'imagesData' => $imagesData,
            'avatar' => $avatar,
            'userPermission' => $userPermission,
            'permissionList_all' => $permissionList_all,
            'tablesPermission' => $tablesPermission,
            'isImages' => $isImages,
            'isImage' => $isImage,
            'selectTbl' => $selectTbl,
            'dataSelectTbl' => $dataSelectTbl,
            'code' => $code,
            'isShowModalSelectTable' => $isShowModalSelectTable,
            'dataRelated' => $dataRelated,
            'columnSelectTable' => $columnSelectTable,
            'cascaderData' => $cascaderData,
            'token' => csrf_token(),
            'p' => $p,
            'menus' => TblService::getMenus($p)
        ];
    }

    private function getDataRelated($table, $data)
    {
        if (empty($table->data_related) || empty($data->id)) {
            return [];
        }
        $dataRelated = [];
        foreach ($table->data_related as $related) {
            $table = Table::where('name', $related['table'])->first();
            $columns = Column::where('table_id', $table->id)->get();
            $datas = DB::table($related['table'])->where($related['column'], $data->id)->get();
            $dataSource = TblService::getDataSource($datas, $columns);
            $dataSelect = TblService::getDataEdit($table->id, 0);
            $select = TblService::getSelectData($columns);

            $dataRelated[] = [
                'datas' => $dataSource,
                'dataSelect' => $dataSelect,
                'select' => $select,
                'columns' => $columns,
                'table' => $table,
            ];
        }
        return $dataRelated;
    }

    private function getColumn($tableId)
    {
        $result = [];
        $column = Column::where('table_id', $tableId)->get();
        foreach ($column as $col) {
            $result[$col->name] = $col;
        }
        return $result;
    }

    private function getDataSelectTbl($col, $data)
    {
        $tableSelect = Table::find($col->select_table_id);
        $colSelect = Column::where('table_id', $col->select_table_id)->get();

        $datas = [];
        if (!empty($data) && !empty($data[$col->name])) {
            $ids = json_decode($data[$col->name], true);

            if (!empty($ids)) {
                // $datas = DB::table($tableSelect->name)->whereIn('id', $ids)->get();
                $datas = TblModel::model($tableSelect->name)->whereIn('id', $ids)->get();
            }
        }
        $dataSource = self::getDataSource($datas, $colSelect);

        if (empty($tableSelect)) {
            die($col->name . 'chưa được config tbl select');
        }
        $dataSelectTbl = self::getDataEdit($tableSelect->id, 0);

        $select = TblService::getSelectData($colSelect);
        return [
            'datas' => $dataSource,
            'dataSelectTbl' => $dataSelectTbl,
            'select' => $select
        ];
    }

    private function selectData($selectData, $col, $route)
    {
        if ($route == 'data.detail') {
            $dataTmp = self::getDataSelect($col);
            foreach ($dataTmp as $d) {
                $selectData[$col->name][$d['value']] = $d['label'];
                if (!empty($d['color']))
                    $selectColor[$col->name][$d['value']] = $d['color'];
            }
        } else {
            $selectData[$col->name] = self::getDataSelect($col);
        }
        return $selectData;
    }

    protected function getDataSource($datas, $columns, $isShowAll = false)
    {
        $fastEditClass = [];
        $dataSource = [];
        $typeEdit = [];
        $cascader = [];
        // check cascader
        foreach ($columns as $col) {
            if ($col->type_edit == 'cascader' && !empty($col->data_select)) {
                $casConfig = json_decode($col->data_select, true);
                $cascader = array_merge($cascader, $casConfig);
            }
        }

        // check data config
        foreach ($datas as $data) {
            // dd($data);
            $dataSourceTmp = [];
            $fastEditTmp = [];
            if (!$isShowAll) {
                foreach ($columns as $col) {
                    $typeEdit[$col->name] = $col->type_edit;
                    if (!empty($col->block_type)) {
                        continue;
                    }
                    if ($col->edit == 1 || $col->show_in_list == 1 || (in_array($col->name, $cascader))) {
                        $dataSourceTmp[$col->name] = $data->{$col->name};
                        $fastEditTmp[$col->name] = 'hide';
                    }
                }
            } else {
                $data_tmp = json_decode(json_encode($data), true);
                foreach ($data_tmp as $key => $val) {
                    $dataSourceTmp[$key] = $val;
                }
            }

            $dataSourceTmp['type_edit'] = $typeEdit;
            $dataSourceTmp['key'] = $data->id;
            $dataSourceTmp['action'] = $data->id;
            $dataSourceTmp['index'] = $data->id;
            $dataSourceTmp['id'] = $data->id;
            $dataSource[] = $dataSourceTmp;
            $fastEditClass[] = $fastEditTmp;
        }
        return [
            'dataSource' => $dataSource,
            'fastEditClass' => $fastEditClass,
            'typeEdit' => $typeEdit,
        ];
    }

    protected function getSelectData($columns)
    {
        $selectsData = [];
        $selectData = [];
        foreach ($columns as $col) {
            if (in_array($col->type_edit, ['select']) && !empty($col->select_table_id)) {
                $dataTmp = TblService::getDataSelect($col);
                foreach ($dataTmp as $d) {
                    $selectData[$col->name][$d['value']] = $d['label'];
                    if (!empty($d['color'])) {
                        $selectColor[$col->name][$d['value']] = $d['color'];
                    }
                }
            }
            if (in_array($col->type_edit, ['selects', 'tags']) && !empty($col->select_table_id)) {
                $dataTmp = TblService::getDataSelect($col);
                foreach ($dataTmp as $d) {
                    $selectsData[$col->name][$d['value']] = $d['label'];
                    if (!empty($d['color'])) {
                        $selectColor[$col->name][$d['value']] = $d['color'];
                    }
                }
            }
        }
        return [
            'selectsData' => $selectsData,
            'selectData' => $selectData
        ];
    }

    protected function getCalendars($date, $table)
    {
        $calendars = [];

        while (strtotime($date) <= strtotime(date('Y-m') . '-' . date('t', strtotime($date)))) {
            $currentDate = date('Y', strtotime($date)) .
                intval(date('m', strtotime($date))) .
                intval(date('d', strtotime($date)));
            $search = date('Y-m-d', strtotime($date));
            $datas = DB::table($table->name)->where('calendar', 'like', '%' . $search . '%')->get();

            if (count($datas) == 0) {
                $calendars[$currentDate] = [];
                $date = date("Y-m-d", strtotime("+1 day", strtotime($date))); //Adds 1 day onto current date
                continue;
            }

            $calendars[$currentDate] = $datas;

            // next
            $date = date("Y-m-d", strtotime("+1 day", strtotime($date))); //Adds 1 day onto current date

        }
        return $calendars;
    }

    private function getPermissionListDefault()
    {
        return [
            'table_add' => [],
            'table_edit' => [],
            'table_delete' => [],
            'table_view' => [],
            'table_create_by' => [],
            'table_share' => []
        ];
    }
    /**
     * permissionShowMenu function
     *
     * @param [type] $tableId
     * @param [type] $per
     * @param string $type: table_add, table_edit, table_view, table_create_by, table_share
     * @return void
     */
    private function permissionShowMenu($tableId, $per, $type = 'table_view')
    {
        if (in_array(\Auth::guard('admin_users')->user()->id, [1])) {
            return true;
        }
        return (in_array($tableId, $per[$type]));
    }

    protected function formatColumn($table, $datas)
    {
        $colCheck = [];
        $columns = Column::where('table_id', $table->id)->orderBy('sort_order', 'asc')->get();
        $result = [];
        foreach ($datas as $col) {
            $result[] = $col;
        }
        return $result;
    }

    protected function getDataIndexDefault($tableName, $request, $isSearchTime = false, $isGetProduct = false)
    {
        $table = DB::table('tables')->where('name', $tableName)->first();
        $tableId = $table->id;

        $per = TblService::getPermission();

        // htvietnam - save log repor
        if ($table->name == 'report') {
            self::logView($table->id, $tableId, 'index');
        }

        $tables = TblService::getAdminMenu($table->id);
        $columns = Column::where('table_id', $tableId)->orderBy('sort_order', 'asc')->get();

        $pageSize = !empty($request->limit) ? $request->limit : $table->count_item_of_page;
        $datas = self::getDatas($table, $columns, $request->all(), $pageSize);


        $viewData = [
            'tableId' => $tableId,
            'tables' => $tables,
            'table' => $table,
            'columns' => $columns,
            'datas' => $datas['data'],
            'userPermission' => $per,
            'request' => $_GET,
            'searchData' => $datas['searchData']
        ];


        $select = TblService::getSelectData($columns);

        $dataSource = TblService::getDataSource($datas['data'], $columns, true);

        $pageConfig = [
            'currentPage' => $datas['data']->currentPage(),
            'perPage' => $datas['data']->perPage(),
            'total' => $datas['data']->total(),
            'lastPage' => $datas['data']->lastPage(),
            'count' => count($datas['data']),
        ];

        // get data search
        $requestAll = $request->all();
        if (!empty($requestAll)) {
            foreach ($requestAll as $key => $val) {
                if (isset($selectData[$key]) && isset($selectData[$key][$val])) {
                    $requestAll[$key] = [
                        'label' => $selectData[$key][$val],
                        'key' => $key
                    ];
                }
            }
        }

        if ($isGetProduct) {
            // chỉ lấy sản phẩm: PRODUCT_TYPE_ID = 1
            $products = Product::select(
                'id',
                'name',
                'code',
                'gia_von',
                'gia_ban',
                'ton_kho',
                'ton_kho_detail',
            )->where('is_draft', 0)->where('is_recycle_bin', 0)->where('is_active', 1)->where('product_type_id', 1)->get();

            $viewData['products'] = $products;
        }

        if ($isSearchTime) {
            // check mốc thời gian để show ra view
            $mocThoiGian = 'today';
            if (!empty($request->mocThoiGian)) {
                $mocThoiGian = $request->mocThoiGian;
            }

            // check khoảng thời gian để show ra view
            $khoangThoiGian = [null, null];
            if (!empty($request->khoangThoiGian)) {
                $khoangThoiGian = $request->khoangThoiGian;
                $mocThoiGian = '';
            }
            $viewData['khoangThoiGian'] = $khoangThoiGian;
            $viewData['mocThoiGian'] = $mocThoiGian;
        }


        $viewData['pageConfig'] = $pageConfig;
        $viewData['dataSource'] = $dataSource['dataSource'];
        $viewData['typeEdit'] = $dataSource['typeEdit'];
        $viewData['selectData'] = $select['selectData'];
        $viewData['selectsData'] = $select['selectsData'];
        $viewData['fastEditClass'] = $dataSource['fastEditClass'];
        $viewData['columnData'] = TblService::getColumnSetting($tableId);
        $viewData['tableSetting'] = TblService::formatTableDDItem($table->display_name, $table);
        $viewData['token'] = csrf_token();
        $viewData['p'] = $request->p ?? 0;
        return $viewData;
    }

    protected function formatData($tableName, $conditions = [])
    {

        $datas = DB::table($tableName)->where('is_recycle_bin', 0);
        if (!empty($conditions)) {
            foreach ($conditions as $key => $val) {
                $datas = $datas->where($key, $val);
            }
        }
        $datas = $datas->get();
        $result = [];
        foreach ($datas as $data) {
            $result[(string)$data->id] = $data;
        }
        return $result;
    }

    protected function searchByDate($data, $mocThoiGian, $column)
    {
        switch ($mocThoiGian) {
            case 'today':
                $data = $data->whereBetween($column, [Carbon::today()->startOfDay()->format('Y-m-d H:i:s'), Carbon::today()->endOfDay()->format('Y-m-d H:i:s')]);
                break;
            case 'yesterday':
                $data = $data->whereDate($column, Carbon::yesterday());
                break;
            case '7day':
                $data = $data->where($column, '>=', Carbon::now()->subDays(7));
                break;
            case '30day':
                $data = $data->where($column, '>=', Carbon::now()->subDays(30));
                break;

            case 'month':
                $data = $data->whereMonth($column, Carbon::now()->month)->whereYear($column, Carbon::now()->year);
                break;
            case 'year':
                $data = $data->whereYear($column, Carbon::now()->year);
                break;
            case 'lastMonth':
                $lastMonth = Carbon::now()->subMonth();
                $data = $data->whereMonth($column, $lastMonth->month)->whereYear($column, $lastMonth->year);
                break;
            case 'lastYear':
                $lastYear = Carbon::now()->subYear()->year;
                $data = $data->whereYear($column, $lastYear);
                break;
            case 'thisWeek':
                $startOfWeek = Carbon::now()->startOfWeek(); // Mặc định: Thứ 2
                $endOfWeek = Carbon::now()->endOfWeek();   // Chủ nhật
                $data = $data->whereBetween($column, [$startOfWeek, $endOfWeek]);
                break;
            case 'lastWeek':
                $startOfLastWeek = Carbon::now()->subWeek()->startOfWeek(); // Thứ 2 tuần trước
                $endOfLastWeek = Carbon::now()->subWeek()->endOfWeek();     // Chủ nhật tuần trước
                $data = $data->whereBetween($column, [$startOfLastWeek, $endOfLastWeek]);
                break;
            case 'thisQuarter':
                $currentMonth = Carbon::now()->month; //lấy tháng hiện tại.
                $currentQuarter = ceil($currentMonth / 3); // chia tháng cho 3 và làm tròn lên → ra quý hiện tại.
                $currentYear = Carbon::now()->year;
                $data = $data->whereRaw('QUARTER(' . $column . ') = ?', [$currentQuarter])
                    ->whereYear($column, $currentYear);
                break;
            case 'lastQuarter':
                $currentQuarter = ceil(Carbon::now()->month / 3);
                $currentYear = Carbon::now()->year;

                // Tính quý trước
                if ($currentQuarter == 1) {
                    $previousQuarter = 4;
                    $previousYear = $currentYear - 1;
                } else {
                    $previousQuarter = $currentQuarter - 1;
                    $previousYear = $currentYear;
                }
                $data = $data->whereRaw('QUARTER(' . $column . ') = ?', [$previousQuarter])
                    ->whereYear($column, $previousYear);
                break;

            default:
                // mặc định là all
                break;
        }
        return $data;
    }

    protected function saveDataBasic($tableName, $rq)
    {
        //  lấy thông tin bảng, và các config của bảng
        $table = Table::where('name', $tableName)->first();

        //  lấy thông tin col, và các config của col
        $columns = Column::where('table_id', $table->id)->get();

        // check xem là insert hay update
        if (!empty($rq->id)) {
            $data = TblModel::find($tableName, $rq->id);
        } else {
            $data = TblModel::model($tableName);
        }

        // add đã được config vào data cần insert
        $haveCode = false;
        foreach ($columns as $column) {
            // check xem có cột mã không
            if ($column->name == 'code') {
                $haveCode = true;
            }

            // nếu trường hợp ko cần edit thì bỏ qua
            if ($column->edit != 1) {
                continue;
            }

            // add to data
            // $defaultValue = $column->value_default();
            if (!empty($rq->{$column->name})) {
                $data->{$column->name} = $rq->{$column->name};
            }
        }

        // save
        $data->save();

        // generate code theo config
        if ($haveCode) {
            $data = self::checkGenerateCode($data, $table, $columns, false);
        }

        return $data;
    }

    protected function getMenus($parentID)
    {
        $menus = [];
        $adminMenu = AdminMenu::baseQuery()->where('parent_id', $parentID)->get()->toArray();
        foreach ($adminMenu as $menu) {
            $subs = AdminMenu::baseQuery()->where('parent_id', $menu['key'])->get()->toArray();
            $menus[] = [
                'parent' => $menu,
                'children' => $subs
            ];
        }
        return $menus;
    }

    protected function getChecklistPercent($checklist)
    {
        $percent = 100;
        if (!empty($checklist)) {
            $total = count($checklist);
            $done = 0;
            foreach ($checklist as $cl) {
                if ($cl['is_checked']) {
                    $done++;
                }
            }
            $percent = round(($done / $total) * 100, 2);
        }
        return $percent;
    }



    protected function getDataSelect02($tableName, $conditions = [])
    {
        $data = DB::table($tableName)->where('is_recycle_bin', 0);
        if (!empty($conditions)) {
            foreach ($conditions as $key => $val) {
                $data = $data->where($key, $val);
            }
        }
        $data = $data->orderBy('sort_order', 'asc')->get();
        $result = [];
        $i = [];
        foreach ($data as $item) {
            $i[] = [
                'value' => (string)$item->id,
                'label' => $item->name,
                'color' => isset($item->color) ? $item->color : '',
                'background' => isset($item->background) ? $item->background : '',
                'icon' => isset($item->icon) ? $item->icon : '',
            ];
        }
        return $i;
    }
}
