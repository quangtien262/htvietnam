<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Services\Admin\TblService;
use App\Services\CommonService;
use App\Models\Admin\Table;
use App\Models\Admin\Column;
use App\Models\Admin\ExportExcel;
use App\Models\Admin\Log;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\ImportUser;
use App\Models\Admin\FileManager;
use App\Models\Admin\Language;
use App\Models\AdminUser;
use Hamcrest\Core\IsNull;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

use Illuminate\Support\Facades\Storage;
use App\Services\Admin\TblModel;

class DataController extends Controller
{
    const CHECK_REDIRECT_TABLE = [
        // 'products' => 'product.list',
        'users' => 'customer.index',
        'admin_users' => 'nhanVien.index',
        'hoa_don' => 'hoaDon.index',
        'phieu_thu' => 'phieuThu.index',

        'product_kiem_kho' => 'kiemKho',
        'product_khach_tra_hang' => 'khachTraHang',
        'product_nhap_hang' => 'nhapHang',
        'product_tra_hang_ncc' => 'traHangNCC',
        'product_xuat_huy' => 'xuatHuy',

        'so_quy' => 'soQuy',
        'cong_no' => 'congNo',

        'nha_cung_cap' => 'ncc.index',
        'tasks' => 'task.list'
    ];

    public function getDataCalendar(Request $request)
    {
        $table = Table::find($request->table_id);
        $calendars = TblService::getCalendars($request->date, $table);
        return $this->sendSuccessResponse($calendars);
    }

    public function tblName(Request $request, $tbl)
    {
        $table = Table::where('name', $tbl)->first();
        $tableId = $table->id;
        $per = TblService::getPermission();
        if (!in_array($table->id, $per['table_view']) && \Auth::guard('admin_users')->user()->id != 1) {
            return to_route('admin.permission_denied');
        }

        if (!empty($table->is_label)) {
            return to_route('dashboard');
        }

        foreach (self::CHECK_REDIRECT_TABLE as $tblName => $routeName) {
            if ($table->name == $tblName) {
                return to_route($routeName);
            }
        }

        // htvietnam - save log repor
        if ($table->name == 'report') {
            TblService::logView($table->id, $tableId, 'index');
        }

        $tableTab = [];
        $tableTabConfig = [];
        $conditions = [];
        $tab_col_name = 'name';

        if (!empty($table->tab_table_id)) {
            $tableTabConfig = Table::find($table->tab_table_id);
            $tableTab = DB::table($tableTabConfig->name)->get();
            if (!empty($tableTabConfig) && empty($request->{$table->tab_table_name}) && count($tableTab) > 0) {
                return to_route('data.index', [$table->id, $table->tab_table_name => 'all']);
            }
            if ($request->{$table->tab_table_name} != 'all') {
                $conditions = [$table->tab_table_name  => $request->{$table->tab_table_name}];
            }
        }

        // 1 tbl master
        if ($table->type_show == 5) {
            return Inertia::location(route('data.detail', [$tableId, 1]));
        }

        $tables = TblService::getAdminMenu($table->id);

        // file manager
        if ($table->type_show == 7) {
            $user = Auth::guard('admin_users')->user();
            $datas = FileManager::select('file_manager.*', 'admin_users.name as full_name', 'admin_users.code as admin_user_code')
                ->leftJoin('admin_users', 'file_manager.create_by', 'admin_users.id')
                ->where('file_manager.create_by', $user->id)
                ->where('file_manager.is_recycle_bin', 0)
                ->where('file_manager.parent_id', 0)
                ->where('file_manager.create_by', $user->id)
                ->get();

            $ids = [];
            foreach ($datas as $data) {
                $ids[$data->id] = false;
            }

            $adminUser = AdminUser::all();
            $admUser = [];
            foreach ($adminUser as $u) {
                $admUser[] = [
                    'value' => $u->id,
                    'label' => $u->code . ' - ' . $u->name,
                ];;
            }

            $props = [
                    'tables' => $tables,
                    'table' => $table,
                    'datas' => $datas,
                    'token' => csrf_token(),
                    'ids' => $ids,
                    'parent' => [],
                    'adminUser' => $admUser
            ];

            return Inertia::render(
                'Admin/File/index',
                $props
            );
        }

        $columns = Column::where('table_id', $tableId)->orderBy('sort_order', 'asc')->get();

        // calendar
        if ($table->type_show == 6) {
            $date = date('Y-m-01');
            $calendars = TblService::getCalendars($date, $table);
            return Inertia::render('Admin/Data/calendars', [
                'tables' => $tables,
                'table' => $table,
                'calendars' => $calendars,
                'userPermission' => $per,
                'columns' => $columns,
                'month' => date('m'),
                'year' => date('Y'),
            ]);
        }

        $pageSize = !empty($request->limit) ? $request->limit : $table->count_item_of_page;
        $datas = TblService::getDatas($table, $columns, $request->all(), $pageSize);

        $props = [
            'tableId' => $tableId,
            'tables' => $tables,
            'table' => $table,
            'columns' => $columns,
            'datas' => $datas['data'],
            'userPermission' => $per,
            'tableTab' => $tableTab,
            'tableTabConfig' => $tableTabConfig,
            'tab_col_name' => $tab_col_name,
            'request' => $_GET,
            'searchData' => $datas['searchData']
        ];
        // drag and drop
        if ($table->type_show == config('constant.type_edit.drag_drop')) {
            $dataSource = TblService::getDataDragDrop($tableId, 0, $conditions);
            $props['dataSource'] = $dataSource;
            return Inertia::render('Admin/Data/index_drag_drop', $props);
        }

        $select = TblService::getSelectData($columns);

        $dataSource = TblService::getDataSource($datas['data'], $columns);
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

        // thống kê theo select
        $statistical = [];
        if (!empty($table->statistical_select)) {
            $colStatis = Column::where('name', $table->statistical_select)->where('table_id', $table->id)->first();
            $tblStatis = Table::find($colStatis->select_table_id);
            $dataSelectStatis = DB::table($tblStatis->name)->orderBy('id', 'desc')->get();
            foreach ($dataSelectStatis as $statis) {
                $statistical[] = [
                    'name' => $statis->name,
                    'id' => $statis->id,
                    'count' => DB::table($table->name)->where($table->statistical_select, $statis->id)->count()
                ];
            }
        }
        $props['statistical'] = $statistical;
        $props['pageConfig'] = $pageConfig;
        $props['dataSource'] = $dataSource['dataSource'];
        $props['typeEdit'] = $dataSource['typeEdit'];
        $props['selectData'] = $select['selectData'];
        $props['selectsData'] = $select['selectsData'];
        $props['fastEditClass'] = $dataSource['fastEditClass'];
        $props['columnData'] = TblService::getColumnSetting($tableId);
        $props['tableSetting'] = TblService::formatTableDDItem($table->display_name, $table);

        return Inertia::render('Admin/Data/index', $props);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, $tableId)
    {
        $per = TblService::getPermission();
        $table = Table::find($tableId);
        if (!in_array($table->id, $per['table_view']) && \Auth::guard('admin_users')->user()->id != 1) {
            return to_route('admin.permission_denied');
        }

        if (!empty($table->is_label)) {
            return to_route('dashboard');
        }

        foreach (self::CHECK_REDIRECT_TABLE as $tblName => $routeName) {
            if ($table->name == $tblName) {
                return to_route($routeName);
            }
        }

        // htvietnam - save log repor
        if ($table->name == 'report') {
            TblService::logView($table->id, $tableId, 'index');
        }

        $tableTab = [];
        $tableTabConfig = [];
        $conditions = [];
        $tab_col_name = 'name';

        if (!empty($table->tab_table_id)) {
            $tableTabConfig = Table::find($table->tab_table_id);
            $tableTab = DB::table($tableTabConfig->name)->get();
            if (!empty($tableTabConfig) && empty($request->{$table->tab_table_name}) && count($tableTab) > 0) {
                return to_route('data.index', [$table->id, $table->tab_table_name => 'all']);
            }
            if ($request->{$table->tab_table_name} != 'all') {
                $conditions = [$table->tab_table_name  => $request->{$table->tab_table_name}];
            }
        }

        // 1 tbl master
        if ($table->type_show == 5) {
            return Inertia::location(route('data.detail', [$tableId, 1]));
        }

        $tables = TblService::getAdminMenu($table->id);

        // file manager
        if ($table->type_show == 7) {
            $user = Auth::guard('admin_users')->user();
            $datas = FileManager::select('file_manager.*', 'admin_users.name as full_name', 'admin_users.code as admin_user_code')
                ->leftJoin('admin_users', 'file_manager.create_by', 'admin_users.id')
                ->where('file_manager.create_by', $user->id)
                ->where('file_manager.is_recycle_bin', 0)
                ->where('file_manager.parent_id', 0)
                ->where('file_manager.create_by', $user->id)
                ->get();

            $ids = [];
            foreach ($datas as $data) {
                $ids[$data->id] = false;
            }

            $adminUser = AdminUser::all();
            $admUser = [];
            foreach ($adminUser as $u) {
                $admUser[] = [
                    'value' => $u->id,
                    'label' => $u->code . ' - ' . $u->name,
                ];;
            }

            $props = [
                    'tables' => $tables,
                    'table' => $table,
                    'datas' => $datas,
                    'token' => csrf_token(),
                    'ids' => $ids,
                    'parent' => [],
                    'adminUser' => $admUser
            ];

            return Inertia::render(
                'Admin/File/index',
                $props
            );
        }

        $columns = Column::where('table_id', $tableId)->orderBy('sort_order', 'asc')->get();

        // calendar
        if ($table->type_show == 6) {
            $date = date('Y-m-01');
            $calendars = TblService::getCalendars($date, $table);
            return Inertia::render('Admin/Data/calendars', [
                'tables' => $tables,
                'table' => $table,
                'calendars' => $calendars,
                'userPermission' => $per,
                'columns' => $columns,
                'month' => date('m'),
                'year' => date('Y'),
            ]);
        }

        $pageSize = !empty($request->limit) ? $request->limit : $table->count_item_of_page;
        $datas = TblService::getDatas($table, $columns, $request->all(), $pageSize);

        $props = [
            'tableId' => $tableId,
            'tables' => $tables,
            'table' => $table,
            'columns' => $columns,
            'datas' => $datas['data'],
            'userPermission' => $per,
            'tableTab' => $tableTab,
            'tableTabConfig' => $tableTabConfig,
            'tab_col_name' => $tab_col_name,
            'request' => $_GET,
            'searchData' => $datas['searchData']
        ];
        // drag and drop
        if ($table->type_show == config('constant.type_edit.drag_drop')) {
            $dataSource = TblService::getDataDragDrop($tableId, 0, $conditions);
            $props['dataSource'] = $dataSource;
            return Inertia::render('Admin/Data/index_drag_drop', $props);
        }

        $select = TblService::getSelectData($columns);

        $dataSource = TblService::getDataSource($datas['data'], $columns);
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

        // thống kê theo select
        $statistical = [];
        if (!empty($table->statistical_select)) {
            $colStatis = Column::where('name', $table->statistical_select)->where('table_id', $table->id)->first();
            $tblStatis = Table::find($colStatis->select_table_id);
            $dataSelectStatis = DB::table($tblStatis->name)->orderBy('id', 'desc')->get();
            foreach ($dataSelectStatis as $statis) {
                $statistical[] = [
                    'name' => $statis->name,
                    'id' => $statis->id,
                    'count' => DB::table($table->name)->where($table->statistical_select, $statis->id)->count()
                ];
            }
        }
        $props['statistical'] = $statistical;
        $props['pageConfig'] = $pageConfig;
        $props['dataSource'] = $dataSource['dataSource'];
        $props['typeEdit'] = $dataSource['typeEdit'];
        $props['selectData'] = $select['selectData'];
        $props['selectsData'] = $select['selectsData'];
        $props['fastEditClass'] = $dataSource['fastEditClass'];
        $props['columnData'] = TblService::getColumnSetting($tableId);
        $props['tableSetting'] = TblService::formatTableDDItem($table->display_name, $table);

        return Inertia::render('Admin/Data/index', $props);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Blog  $blog
     * @return \Illuminate\Http\Response
     */
    public function detail(Request $request, $tableId, $dataId)
    {
        // log
        $table = Table::find($tableId);

        // save log report
        if ($table->name == 'report') {
            TblService::logView($table->id, $dataId, 'detail');
        }

        $checkData = DB::table($table->name)->where('id', $dataId)->count();
        if ($checkData == 0) {
            return to_route('data.index', [$table->id]);
        }

        // view
        $viewData = TblService::getDataEdit($tableId, $dataId, 'data.detail');
        return Inertia::render('Admin/Data/detail', $viewData);
    }

    public function detailLang(Request $request, $tableId, $dataId)
    {
        $table = Table::find($tableId);
        $tableDataName = $table->name . '_data';
        $tableLang = Table::where('name', $tableDataName)->first();
        $dataLangs = TblModel::model($tableDataName)->where('data_id', $dataId)->get();
        $viewData = [];
        foreach ($dataLangs as $dataLang) {
            $viewData[$dataLang->languages_id] = TblService::getDataEdit($tableLang->id, $dataLang->id, 'data.detail');
        }
        $result = [
            'dataLang' => $viewData,
            'languages' => Language::orderBy('sort_order', 'asc')->get()
        ];
        return $this->sendSuccessResponse($result, 'successfully');
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request, $tableId)
    {
        // check permission
        $per = TblService::getPermission();
        $table = Table::find($tableId);

        // if ($table->name == 'products') {
        //     return to_route('product.add');
        // }

        if (!in_array($table->id, $per['table_add']) && \Auth::guard('admin_users')->user()->id != 1) {
            return to_route('admin.permission_denied');
        }
        $adUser = \Auth::guard('admin_users')->user();
        $table = Table::find($tableId);
        // tự động lưu nháp ngay sau khi ấn nút thêm mới
        if ($table->auto_add_draft == 1) {
            $dataInsert = [
                'is_draft' => 1,
                'create_by' => $adUser->id,
                'name' => $table->display_name . ' - ' . date('Y-m-d H:i:s')
            ];
            if ($table->name == 'hoa_don') {
                $dataInsert['ngay_ban'] = date('Y-m-d H:i:s');
                $dataInsert['type_hoa_don_id'] = $_GET['type'];
            }
            $dataId = DB::table($table->name)->insertGetId($dataInsert);
            return to_route('data.edit', [$table->id, $dataId]);
        }

        if ($table->is_multiple_language == 1) {
            $viewData = TblService::getDataLanguageEdit($tableId, 0);
            $viewData['request'] = $request->all();
            return Inertia::render('Admin/Data/form', $viewData);
        }

        if (!empty($table->config_show_data) && empty($request->type)) {
            return Inertia::location(route('data.index', [$tableId]));
        }

        $viewData = TblService::getDataEdit($tableId, 0, '', $request->all());
        $viewData['request'] = $request->all();

        $viewData['tables'] = TblService::getAdminMenu($table->id);

        // himalaya View
        if (!empty(in_array($table->name, ['hoa_don', 'voucher']))) {
            return Inertia::render('Admin/Himalaya/form_himalaya', $viewData);
        }

        return Inertia::render('Admin/Data/form', $viewData);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, $tableId)
    {
        // check permission
        $per = TblService::getPermission();
        $table = Table::find($tableId);

        if (!in_array($table->id, $per['table_add']) && \Auth::guard('admin_users')->user()->id != 1) {
            return to_route('admin.permission_denied');
        }

        $dataId = 0;
        $columns = Column::where('table_id', $tableId)->orderBy('sort_order', 'asc')->get();

        try {
            DB::beginTransaction();
            $data = TblService::saveData($columns, $dataId, $table, $request->all());
            DB::commit();
            if ($request->submit_edirect == 'detail') {
                return to_route('data.detail', [$tableId, $data->id]);
            }
            if ($request->submit_edirect == 'list') {
                return to_route('data.index', [$tableId]);
            }
            if ($request->submit_edirect == 'thanh_toan') {
                return to_route('data.index', [$tableId]);
            }
            if ($request->submit_edirect == 'huy_hoa_don') {
                return to_route('data.index', [$tableId]);
            }

            return $this->sendSuccessResponse($data, 'Update successfully', 200);
        } catch (\Throwable $th) {
            DB::rollback();
            throw $th;
            return $this->sendErrorResponse([], $th->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Blog  $blog
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request, $tableId, $dataId)
    {
        $per = TblService::getPermission();
        $table = Table::find($tableId);

        $checkData = DB::table($table->name)->where('id', $dataId)->count();
        if ($checkData == 0) {
            return to_route('data.index', [$tableId]);
        }

        // check permission
        if (!in_array($table->id, $per['table_edit']) && \Auth::guard('admin_users')->user()->id != 1) {
            return to_route('admin.permission_denied');
        }
        // lang
        if ($table->is_multiple_language == 1) {
            $viewData = TblService::getDataLanguageEdit($tableId, $dataId);
            $viewData['request'] = $request->all();
            return Inertia::render('Admin/Data/form', $viewData);
        }

        $viewData = TblService::getDataEdit($tableId, $dataId);
        if ($viewData == false) {
            return to_route('data.index');
        }

        $viewData['request'] = $request->all();

        // cài đặt data hiển thị theo select
        if (!empty($table->config_show_data)) {
            $viewData['request']['type'] = !empty($request->type) ? $request->type : $viewData['data'][$table->config_show_data['column']];
        }
        $viewData['tables'] = TblService::getAdminMenu($table->id);
        // himalaya View
        if (!empty(in_array($table->name, ['hoa_don', 'voucher']))) {
            $nhanVien = DB::table('admin_users')->get();
            $uSelect = [];
            foreach ($nhanVien as $nv) {
                $uSelect[] = [
                    'value' => $nv->id,
                    'label' => $nv->code . ' - ' . $nv->name
                ];
            }
            $viewData['admin_users'] = $uSelect;
            return Inertia::render('Admin/Himalaya/form_himalaya', $viewData);
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
        // dd($request->all());
        try {
            DB::beginTransaction();
            $table = Table::find($tableId);
            $columns = Column::where('table_id', $tableId)->orderBy('sort_order', 'asc')->get();
            $result = TblService::saveData($columns, $dataId, $table, $request->all());
            DB::commit();

            if ($request->submit_edirect == 'detail') {
                return to_route('data.detail', [$tableId, $dataId]);
            }

            if ($request->submit_edirect == 'list') {
                return to_route('data.index', [$tableId]);
            }

            if ($request->submit_edirect == 'thanh_toan') {
                return to_route('data.index', [$tableId]);
            }

            if ($request->submit_edirect == 'huy_hoa_don') {
                // chuyển hóa đơn vào thùng rác
                TblService::deleteDatas($table->id, [$dataId]);

                // redirect về trang index
                return to_route('data.index', [$tableId]);
            }

            return $this->sendSuccessResponse($result, 'Update successfully', 200);
        } catch (\Throwable $th) {
            DB::rollback();
            return $th->getMessage();
        }
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
        if (empty($request->data)) {
            return false;
        }
        $dataSort = json_decode($request->data, true);
        $this->updateSortOrderData($tableId, $dataSort);
        return $this->sendSuccessResponse('success', 'Update successfully', 200);
    }

    public function uploadImage(Request $request)
    {
        $file = $request->file;
        $directoryUpload = 'tmp';
        $fileType = $file->getClientMimeType();
        $nameRandom = app('Helper')->generateRandomString(4);
        $fileName = $nameRandom . '_' . time() . '.' . str_replace('image/', '', $fileType);
        $newFile = $file->storeAs($directoryUpload, $fileName, 'public');

        return $this->sendSuccessResponse(['filePath' => $newFile, 'fileName' => $fileName], 'Update successfully', 200);
    }

    public function uploadImage2s3(Request $request)
    {
        $file = $request->file;
        $directoryUpload = 'tmp';
        $fileType = $file->getClientMimeType();
        $nameRandom = app('Helper')->generateRandomString(4);
        $fileName = $nameRandom . '_' . time() . '.' . str_replace('image/', '', $fileType);
        $newFile = $file->storeAs($directoryUpload, $fileName, 'public');
        // dd($file);
        // $e = Storage::disk('s3')->exists('102.jpg');
        // $path = Storage::disk('s3')->put('', $file);
        // $path = Storage::disk('s3')->url($path);

        return $this->sendSuccessResponse(['filePath' => $newFile, 'fileName' => $fileName], 'Update successfully', 200);
    }

    public function tinyUploadImage2S3(Request $request)
    {
        $image = $request->file;

        $fileType = mime_content_type($image);
        $time = time();
        $fileName = $time . '.' . str_replace('image/', '', $fileType);

        //read file
        $data = explode(',', $image);

        Storage::disk('s3')->put('content/' . $fileName, base64_decode($data[1]));
        $filePath = env('AWS_URL') . 'content/' . $fileName;
        return $this->sendSuccessResponse(['filePath' => $filePath, 'fileName' => $fileName], 'Update successfully', 200);
    }

    public function tinyUploadImage(Request $request)
    {
        $image = $request->file;

        // phân quyền cho tiny
        if (!file_exists('files/tinyMCE')) {
            mkdir('files/tinyMCE', 0777, true);
        }

        //
        $directoryUpload = 'tmp';
        $fileType = mime_content_type($image);
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

    private function updateSortOrderData($tableId, $dataSort, $parentId = 0)
    {
        $table = Table::find($tableId);
        foreach ($dataSort as $i => $data) {
            $dataUpdate = [
                'sort_order' => $i,
                'parent_id' => $parentId
            ];
            TblService::updateData($table->name, $data['key'], $dataUpdate);
            if (!empty($data['children'])) {
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
        $columns = Column::where('table_id', $table->id)->get();

        // save
        $data = TblModel::find($table->name, $request->id);
        $data->{$request->column_name} = $request->{$request->column_name};
        $data->save();

        $pageSize = !empty($request->limit) ? $request->limit : $table->count_item_of_page;
        $datas = TblService::getDatas($table, $columns,  $request->search, $pageSize);
        $dataSource = TblService::getDataSource($datas['data'], $columns);
        return $this->sendSuccessResponse($dataSource['dataSource'], 'Update successfully', 200);
    }

    /**
     * Update first item the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Blog  $blog
     * @return \Illuminate\Http\Response
     */
    public function fastEditByTableName(Request $request)
    {
        $data = TblModel::find($request->tbl_name, $request->id);
        $data->{$request->column_name} = $request->value;
        $data->save();
        return $this->sendSuccessResponse($data, 'Update successfully', 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Blog  $blog
     * @return \Illuminate\Http\Response
     */
    public function destroyData(Request $request, $tableId)
    {
        if (empty($request->ids)) {
            return $this->sendErrorResponse('ID is require', $errors = null, $code = 400);
        }
        $result = TblService::deleteDatas($tableId, $request->ids);
        $dataSource = [];
        if (isset($request->is_drag_drop)) {
            $dataSource = TblService::getDataDragDrop($tableId);
        }
        return $this->sendSuccessResponse($dataSource, 'Delete successfully', $code = 200);
    }

    public function exportExcel(Request $request,  $tableId)
    {
        $table = Table::find($tableId);
        $file_name = $table->display_name . date('Y_m_d_H_i_s') . '.xlsx';
        return Excel::download(new ExportDB($tableId, $request->ids), $file_name);
    }

    public function importExcel(Request $request, $tableId)
    {
        Excel::import(
            new ImportDB($tableId),
            $request->file('files')[0]->store('files')
        );
        return $this->sendSuccessResponse('successfully');
    }

    /**
     * Active
     *
     * @param  \App\Models\Blog  $blog
     * @return \Illuminate\Http\Response
     */
    public function active(Request $request, $tableName)
    {
        if (empty($request->ids)) {
            return $this->sendErrorResponse('ID is require', $errors = null, $code = 400);
        }
        TblService::updateData($tableName, $request->ids, ['is_active' => 1]);
        $dataSource = [];
        return $this->sendSuccessResponse($dataSource, 'active successfully', $code = 200);
    }
    /**
     * unactive
     *
     * @param  \App\Models\Blog  $blog
     * @return \Illuminate\Http\Response
     */
    public function unactive(Request $request, $tableName)
    {
        if (empty($request->ids)) {
            return $this->sendErrorResponse('ID is require', $errors = null, $code = 400);
        }
        TblService::updateData($tableName, $request->ids, ['is_active' => 2]);
        $dataSource = [];
        return $this->sendSuccessResponse($dataSource, 'unactive successfully', $code = 200);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function dataCreate(Request $request)
    {
        $table = Table::find($request->table_id);
        // dd($request->table_id);
        if (!empty($table->is_multiple_language) && $table->is_multiple_language == 1) {
            $viewData = TblService::getDataLanguageEdit($table->id, 0);
            $viewData['request'] = $request->all();
            return $viewData;
        }
        $viewData = TblService::getDataEdit($table->id, 0);
        return $this->sendSuccessResponse($viewData, 'Get data successfully');
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function tblSelect(Request $request)
    {
        $colSelect = Column::where('name', $request->name)->where('table_id', $request->table_id)->first();
        $table = Table::find($colSelect->select_table_id);
        if (!empty($table->is_multiple_language) && $table->is_multiple_language == 1) {
            $viewData = TblService::getDataLanguageEdit($table->id, 0);
            $viewData['request'] = $request->all();
            return $viewData;
        }
        $viewData = TblService::getDataEdit($table->id, 0);
        return $this->sendSuccessResponse($viewData, 'Get data successfully');
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function insertTblSelect(Request $request)
    {
        $table = Table::find($request->table_id);
        $columns = Column::where('table_id', $table->id)->orderBy('sort_order', 'asc')->get();
        TblService::saveData($columns, 0, $table, $request->all());

        $result = [];
        $datas = DB::table($table->name)->get();
        foreach ($datas as $data) {
            $result[] = [
                'value' => $data->id,
                'label' => $data->name
            ];
        }
        return $this->sendSuccessResponse($result, 'Update successfully', 200);
    }

    public function showLog($tableId, $dataId)
    {
        // 69: thu chi
        $logs = Log::where('table_id', $tableId)->where('data_id', $dataId)->orderBy('id', 'desc')->get();

        return $this->sendSuccessResponse($logs);
    }

    public function logLatest(Request $request)
    {
        $result = [];
        $logs = Log::orderBy('id', 'desc')->where('table_id', '!=', 16)->skip(0)->take(20)->get();
        foreach ($logs as $log) {
            $result[] = [
                'label' => $log->name,
                'key' => $log->id,
            ];
        }
        return $this->sendSuccessResponse($logs);
    }



    /**
     * deleteSelectTable
     *
     * @param request: select_table_id, col_name, table_id, id
     */
    public function deleteSelectTable(Request $request)
    {
        $table = Table::find($request->table_id);
        $column = Column::where('name', $request->col_name)->where('table_id', $table->id)->first();

        // unset id select table
        $data02 = DB::table($table->name)->where('id', $request->id)->first();
        $dataUpdate = json_decode($data02->{$request->col_name}, true);
        foreach ($dataUpdate as $key => $up) {
            if ($up == $request->select_table_id) {
                unset($dataUpdate[$key]);
                break;
            }
        }

        // update data
        $data = TblModel::find($table->name, $request->id);
        $data->{$request->col_name} = json_encode($dataUpdate);
        $data->save();

        //
        $data = TblModel::model($table->name)->where('id', $request->select_table_id)->delete();

        $result = TblService::getDataEdit($table->id, $request->id, 'data.detail');

        return $this->sendSuccessResponse($result, 'Delete successfully', $code = 200);
    }

    public function thongKe(Request $request, $tableId)
    {
        $table = Table::find($tableId);

        if (empty($table) || (!empty($table) && empty($table->thong_ke))) {
            return to_route('admin.page_not_found');
        }

        $thongKe = json_decode($table->thong_ke, true);
        if ($thongKe['type'] == 'month') {
            for ($year = $thongKe['year']; $year <= date('Y'); $year++) {
                $startMonth = 1;
                $endMonth = 12;
                if ($year == $thongKe['year']) {
                    $startMonth = $thongKe['month'];
                }
                if ($year == date('Y')) {
                    $endMonth = intval(date('m'));
                }

                for ($month = $startMonth; $month <= $endMonth; $month++) {
                    $data = TblModel::model($table->name)->where('month', $month)->where('year', $year)->first();
                    if (empty($data)) {
                        $data = TblModel::model($table->name);
                    }
                    $total = 0;
                    $month_str = CommonService::formatNumber02($month);
                    foreach ($thongKe['config'] as $config) {
                        $dateStart = $year . '-' . $month_str . '-01';
                        $dateEnd = $year . '-' . $month_str . '-30';
                        $datas = DB::table($config['table'])->select($config['column_get'])->whereBetween($config['column_search'], [$dateStart, $dateEnd]);
                        foreach ($config['conditions'] as $key => $val) {
                            if ($val['search_type'] == 'equal') {
                                $datas = $datas->where($key, $val['value']);
                            }
                        }
                        $datas = $datas->get();
                        foreach ($datas as $item) {
                            $total += $item->{$config['column_get']};
                        }
                        $data->month = $month;
                        $data->year = $year;
                        $data->{$config['column_save']} = $total;
                    }
                    $data->name = 'Tháng ' . $month_str . '/' . $year;
                    $data->save();
                }
            }
        }

        return to_route('data.index', [$table->id]);
    }

    public function showTotal(Request $request, $tableId)
    {
        $table = Table::find($tableId);
        $columns = Column::where('table_id', $table->id)->get();
        $item = [];
        foreach ($columns as $col) {
            if ($col->is_show_total == 1) {
                $item[] = $col;
            }
        }
        if (empty($item)) {
            return '';
        }
        $datas = DB::table();
    }

    public function updateCurrentColumn(Request $rq)
    {
        $data = TblModel::find($rq->table, $rq->id);
        $data->{$rq->column_name} = $rq->value;
        $data->save();
        return $this->sendSuccessResponse($data);
    }

    /**
     * get sub data
     * @param \Illuminate\Http\Request $rq: table_base table_map, column_map, id, have_code
     * @return void
     */
    public function getSubData(Request $rq)
    {
        $tbl = Table::where('name', $rq->table_base)->first();
        $tbl_map = Table::where('name', $rq->table_map)->first();

        $datas = DB::table($rq->table_map);
        if (isset($rq->have_code)) {
            $datas = $datas->select(
                $rq->table_map . '.id',
                $rq->table_map . '.name',
                $rq->table_map . '.code',
                $rq->table_map . '.*',
                $rq->table_base . '.*'
            );
        } else {
            $datas = $datas->select(
                $rq->table_map . '.id',
                $rq->table_map . '.name',
                $rq->table_map . '.*',
                $rq->table_base . '.*'
            );
        }
        $datas = $datas->leftJoin($rq->table_base, $rq->table_base . '.id', $rq->table_map . '.' . $rq->column_map)
            ->orderBy($rq->table_map . '.updated_at', 'desc')
            ->get();

        return $this->sendSuccessResponse($datas);
    }
}
