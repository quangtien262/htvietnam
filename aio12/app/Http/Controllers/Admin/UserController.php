<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Services\Admin\TblService;
use App\Services\CommonService;
use App\Models\Admin\Table;
use App\Models\Admin\Column;
use App\Models\User;
use Illuminate\Support\Facades\DB;
class UserController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, $tableId)
    {
        $per = TblService::getPermission();
        $table = Table::find($tableId);

        $tableTab = [];
        $tableTabConfig = [];
        $conditions = [];
        $tab_col_name = 'name';

        if(!empty($table->tab_table_id)) {
            $tableTabConfig = Table::find($table->tab_table_id);
            $tableTab = DB::table($tableTabConfig->name)->get();
            if(!empty($tableTabConfig) && empty($request->{$table->tab_table_name}) && count($tableTab) > 0) {
                return to_route('data.index', [$table->id, $table->tab_table_name => 'all']);
                // return to_route('data.index', [$table->id, $table->tab_table_name => $tableTab[0]->{$tab_col_name}]);
            }
            if($request->{$table->tab_table_name} != 'all'){
                $conditions = [$table->tab_table_name  => $request->{$table->tab_table_name}];
            }
        }

        // 1 tbl master
        if($table->type_show == 5) {
            return Inertia::location(route('data.detail',[$tableId, 1]));
        }

        $tables = TblService::getAdminMenu($table->id);

        $columns = Column::where('table_id', $tableId)->orderBy('sort_order', 'asc')->get();
        $pageSize = !empty($request->pageSize) ? $request->pageSize:30;
        $datas = TblService::getDatas($table, $columns, $request->all(), $pageSize);
        $viewData = [
            'tableId' => $tableId,
            'tables' => $tables,
            'table' => $table,
            'columns' => $columns,
            'datas' => $datas,
            'per' => $per,
            'tableTab' => $tableTab,
            'tableTabConfig' => $tableTabConfig,
            'tab_col_name' => $tab_col_name,
            'request' => $request->all(),
            'get' => $_GET
        ];
        // drag and drop
        if($table->type_show == config('constant.type_edit.drag_drop')) {
            $dataSource = TblService::getDataDragDrop($tableId, 0, $conditions);
            $viewData['dataSource'] = $dataSource;
            return Inertia::render('Admin/Data/index_drag_drop', $viewData);
        }

        $selectsData = [];
        $selectData = [];
        foreach($columns as $col) {
            if (in_array($col->type_edit, ['select', 'select2']) && !empty($col->select_table_id)) {
                $dataTmp = TblService::getDataSelect($col);
                foreach($dataTmp as $d) {
                    $selectData[$col->name][$d['value']] = $d['label'];
                    if(!empty($d['color'])) {
                        $selectColor[$col->name][$d['value']] = $d['color'];
                    }
                }
            }
            if (in_array($col->type_edit, ['selects']) && !empty($col->select_table_id)) {
                $dataTmp = TblService::getDataSelect($col);
                foreach($dataTmp as $d) {
                    $selectsData[$col->name][$d['value']] = $d['label'];
                    if(!empty($d['color'])) {
                        $selectColor[$col->name][$d['value']] = $d['color'];
                    }
                }
            }
        }
        $fastEditClass = [];
        $dataSource = [];
        foreach($datas as $data) {
            $dataSourceTmp = [];
            $fastEditTmp = [];
            foreach($columns as $col) {
                if($col->show_in_list == 1) {
                    $dataSourceTmp[$col->name] = $data->{$col->name};
                    $fastEditTmp[$col->name] = 'hide';
                }
            }
            $dataSourceTmp['key'] = $data->id;
            $dataSourceTmp['action'] = $data->id;
            $dataSourceTmp['index'] = $data->id;
            $dataSource[] = $dataSourceTmp;
            $fastEditClass[] = $fastEditTmp;
        }

        $pageConfig = [
            'currentPage' => $datas->currentPage(),
            'perPage' => $datas->perPage(),
            'total' => $datas->total(),
            'lastPage' => $datas->lastPage(),
        ];

        $requestAll = $request->all();
        if(!empty($requestAll)) {
            foreach($requestAll as $key => $val) {
                if(isset($selectData[$key])) {
                    $requestAll[$key] = [
                        'label' => $selectData[$key][$val],
                        'key' => $key
                    ];
                }
            }
        }

        $viewData['pageConfig'] = $pageConfig;
        $viewData['dataSource'] = $dataSource;
        $viewData['selectData'] = $selectData;
        $viewData['selectsData'] = $selectsData;
        $viewData['fastEditClass'] = $fastEditClass;
        // dd($viewData);
        if($table->name == 'products') {
            return Inertia::render('Admin/Product/index', $viewData);
        }

        if($table->type_show == config('constant.type_edit.landingpage')) {
            return Inertia::render('Admin/Data/index_landingpage',$viewData);
        }

        return Inertia::render('Admin/Data/index', $viewData);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Blog  $blog
     * @return \Illuminate\Http\Response
     */
    public function detail(Request $request, $tableId, $dataId) {
        $viewData = TblService::getDataDetail($tableId, $dataId);
        return Inertia::render('Admin/Data/detail',$viewData );
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request, $tableId) {
        $table = Table::find($tableId);
        $tables = TblService::getAdminMenu($table->id);
        $columns = Column::where('table_id', $tableId)->orderBy('sort_order', 'asc')->get();
        $data = [];

        $countImage = 1;
        $selectData = [];
        $permissionList = [];
        $permissionList_all = [];
        $tablesPermission = [];
        foreach($columns as $col) {
            if (in_array($col->type_edit, ['select', 'select2', 'selects'])) {
                $selectData[$col->name] = TblService::getDataSelect($col);
            }
            $data[$col->name] = '';

            if (in_array($col->type_edit, ['images','images_crop'])) {
                $countImage = $col->conditions;
            }
            if ($col->type_edit == 'permission_list') {
                $per = TblService::getPermissionDefault();
                $permissionList = $data[$col->name] = $per['none'];
                $permissionList_all = $per['all'];
                $tablesPermission = TblService::getAdminMenu(0, true);
            }
        }

        $viewData = [
            'tables' => $tables,
            'table' => $table,
            'columns' => $columns,
            'data' => $data,
            'selectData' => $selectData,
            'dataId' => 0,
            'imagesData' => [],
            'countImage' => $countImage,
            'permissionList' => $permissionList,
            'permissionList_all' => $permissionList_all,
            'tablesPermission' => $tablesPermission
        ];

        if($table->name == 'products') {
            return Inertia::render('Admin/Product/form', $viewData);
        }

        // if($table->name == 'news') {
        //     return Inertia::render('Admin/News/form', $viewData);
        // }

        return Inertia::render('Admin/Data/form', $viewData);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, $tableId) {
        // dd($request->all());
        $dataId = 0;
        $table = Table::find($tableId);
        $columns = Column::where('table_id', $tableId)->orderBy('sort_order', 'asc')->get();
        $data = TblService::saveData($columns, $dataId, $table, $request->all());

        if($request->submit_edirect == 'detail') {
            return to_route('data.detail', [$tableId, $data->id]);
        }
        if($request->submit_edirect == 'list') {
            return to_route('data.index', [$tableId]);
        }
        return $this->sendSuccessResponse($data, 'Update successfully', 200);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Blog  $blog
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request, $tableId, $dataId)
    {
        $viewData = TblService::getDataEdit($tableId, $dataId);

        if($viewData['table']->name == 'products') {
            return Inertia::render('Admin/Product/form', $viewData);
        }

        return Inertia::render('Admin/Data/form', $viewData);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Blog  $blog
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $tableId, $dataId)
    {
        $table = Table::find($tableId);
        $columns = Column::where('table_id', $tableId)->orderBy('sort_order', 'asc')->get();
        $result = TblService::saveData($columns, $dataId, $table, $request->all());

        if($request->submit_edirect == 'detail') {
            return to_route('data.detail', [$tableId, $dataId]);
        }
        if($request->submit_edirect == 'list') {
            return to_route('data.index', [$tableId]);
        }

        return $this->sendSuccessResponse($result, 'Update successfully', 200);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Blog  $blog
     * @return \Illuminate\Http\Response
     */
    public function updateSortOrder(Request $request, $tableId)
    {
        if(empty($request->data)) {
            return false;
        }
        $dataSort = json_decode($request->data, true);
        $this->updateSortOrderData($tableId, $dataSort);
        return $this->sendSuccessResponse('success', 'Update successfully', 200);
    }

    public function uploadImage(Request $request) {
        $file = $request->file;
        $directoryUpload = 'tmp';
        $fileType = $file->getClientMimeType();
        $nameRandom = app('Helper')->generateRandomString(4);
        $fileName = $nameRandom . '_' . time() . '.' . str_replace('image/', '', $fileType);
        $pathUpload = $directoryUpload . '/' . $fileName;
        // $file->move($directoryUpload, $file->getClientOriginalName());
        $newFile = $file->storeAs($directoryUpload, $fileName, 'public');

        return $this->sendSuccessResponse(['filePath' => $newFile, 'fileName' => $fileName], 'Update successfully', 200);
    }

    public function tinyUploadImage(Request $request) {
        $image = $request->file;

        // phân quyền cho tiny
        if (!file_exists('files/tinyMCE')) {
            mkdir('files/tinyMCE', 0777, true);
        }

        //
        $directoryUpload = 'tmp';
        $fileType = mime_content_type($image);
        // dd($fileType);
        $directoryUpload = 'files/tmp';
        if (!file_exists($directoryUpload)) {
            mkdir($directoryUpload, 0777, true);
        }
        $time = time();
        $fileName = $time . '.' . str_replace('image/', '', $fileType);
        $output_file = $directoryUpload . '/' . $fileName;
        $file = fopen($output_file, 'wb');
        $data = explode(',', $image);
        fwrite($file, base64_decode($data[1]));
        fclose($file);

        return $this->sendSuccessResponse(['filePath' => '/' . $output_file, 'fileName' => $fileName], 'Update successfully', 200);
    }

    private function updateSortOrderData($tableId, $dataSort, $parentId = 0) {
        $table = Table::find($tableId);
        foreach($dataSort as $i => $data) {
            $dataUpdate = [
                'sort_order' => $i,
                'parent_id' => $parentId
            ];
            TblService::updateData($table->name, $data['key'], $dataUpdate);
            if(!empty($data['children'])) {
                $this->updateSortOrderData($tableId, $data['children'], $data['key']);
            }
        }
        return true;
    }

    /**
     * Update first item the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Blog  $blog
     * @return \Illuminate\Http\Response
     */
    public function fastEdit(Request $request, $tableId)
    {
        $table = Table::find($tableId);
        $data = $request->all();
        if(isset($data['id'])) {
            unset($data['id']);
        }
        if(isset($data['column_name'])) {
            unset($data['column_name']);
        }

        $column = Column::where('table_id', $tableId)->where('name', $request->column_name)->first();
        if($column->type_edit == 'selects') {
            $result = TblService::updateData($table->name, $request->id, [$column->name => json_encode($data[$column->name])]);
        }



        $result = TblService::updateData($table->name, $request->id, $data);
        return $this->sendSuccessResponse($result, 'Update successfully', 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Blog  $blog
     * @return \Illuminate\Http\Response
     */
    public function destroyData(Request $request, $tableId)
    {
        if(empty($request->ids)) {
            return $this->sendErrorResponse('ID is require', $errors = null, $code = 400);
        }
        $result = TblService::deleteDatas($tableId, $request->ids);
        $dataSource = [];
        if(isset($request->is_drag_drop)) {
            $dataSource = TblService::getDataDragDrop($tableId);
        }
        return $this->sendSuccessResponse($dataSource, 'Delete successfully', $code = 200);
    }


}
