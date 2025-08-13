<?php

namespace App\Http\Controllers\Admin;

use App\Models\Admin\ChiNhanh;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\Column;
use App\Models\Admin\Product;
use App\Models\Admin\Table;
use App\Models\AdminUser;
use App\Services\Admin\TblService;
use App\Services\AnalyticService;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{

    public function dashboard()
    {
        $tables = TblService::getAdminMenu(0);
        $tablesSelects = TblService::getTableSelects();

        $products = Product::orderBy('id', 'desc')->paginate(10);
        $banchay = [];
        foreach ($products as $pro) {
            $banchay[] = [
                'title' => $pro->name,
                'gia_ban' => $pro->gia_ban
            ];
        }

        $param = [
            'tables' => $tables,
            'tablesSelects' => $tablesSelects,
            'banChay' => $banchay
        ];
        return Inertia::render('Admin/Pages/index', $param);
    }

    public function dashboardWeb()
    {
        // Lấy dữ liệu lượt view theo ngày
        $viewStats = AnalyticService::getAll();
        // Lấy dữ liệu lượt view theo IP
        // $viewStatsIp = AnalyticService::getAllByIp();

        // $today = date('Y-m-d');
        $contacts = DB::table('contact')
            // ->whereDate('created_at', $today)
            ->orderByDesc('created_at')
            ->limit(10)
            ->select('id', 'name', 'email', 'phone', 'created_at')
            ->get();

        $orders = DB::table('orders')
            // ->whereDate('created_at', $today)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        $param = [
            'viewStats' => $viewStats,
            // 'viewStatsIp' => $viewStatsIp,
            'contacts' => $contacts,
            'orders' => $orders
        ];
        // dd($param);
        return Inertia::render('Admin/Dashboard/web', $param);
    }


    public function dashboardSetting()
    {
        $viewData = [];
        return Inertia::render('Admin/Dashboard/setting', $viewData);
    }


    public function dashboardTaiChinh()
    {
        $viewData = [];
        return Inertia::render('Admin/Dashboard/tai_chinh', $viewData);
    }

    public function dashboardReport()
    {
        $viewData = [];
        return Inertia::render('Admin/Dashboard/report', $viewData);
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $tables = TblService::getAdminMenu(0);
        $tablesSelects = TblService::getTableSelects();

        $products = Product::orderBy('id', 'desc')->paginate(10);
        $banchay = [];
        foreach ($products as $pro) {
            $banchay[] = [
                'title' => $pro->name,
                'gia_ban' => $pro->gia_ban
            ];
        }

        return Inertia::render(
            'Admin/Dashboard/index',
            [
                'tables' => $tables,
                'tablesSelects' => $tablesSelects,
                'banChay' => $banchay
            ]
        );
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function permissionDenied()
    {
        $tables = TblService::getAdminMenu(0);
        return Inertia::render('Admin/Pages/permission_denied', ['tables' => $tables]);
    }

    public function pageNotFound()
    {
        $tables = TblService::getAdminMenu(0);
        return Inertia::render('Admin/Pages/page_not_found', ['tables' => $tables]);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function settingMenu()
    {
        $tables = TblService::getAdminMenu(0);
        $dataSource = TblService::getTableDataDragDrop(0, ['is_edit' => 1]);
        $expandedKeys = [];
        foreach ($tables as $tbl) {
            $expandedKeys[] = $tbl['parent']->id;
        }
        return Inertia::render('Admin/Pages/setting_menu', [
            'tables' => $tables,
            'dataSource' => $dataSource,
            'expandedKeys' => $expandedKeys
        ]);
    }

    public function settingColumn(Request $request, $tableId)
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

        if (!empty($table->config_show_data)) {
            $table->config_show_data = json_encode($table->config_show_data, true);
        }

        $columnData = TblService::getColumnSetting($tableId);
        return Inertia::render(
            'Admin/Pages/setting_column',
            [
                'tableId' => $tableId,
                'tables' => $tables,
                'tableSelect' => $tableSelect,
                'table' => $table,
                'columnData' => $columnData,
            ]
        );
    }

    public function checkSessionThuNgan(Request $request)
    {
        if ($request->session()->has('chi_nhanh') && $request->session()->has('nhan_vien_thu_ngan')) {
            return $this->sendSuccessResponse(true);
        }

        $chiNhanh = ChiNhanh::where('da_ngung_hoat_dong', '!=', 1)->get();
        $nhanVien = AdminUser::where('is_recycle_bin', '!=', 1)->where('da_nghi_lam', '!=', 1)->get();
        $data = [
            'chiNhanh' => $chiNhanh,
            'nhanVien' => $nhanVien
        ];

        return $this->sendSuccessResponse($data, 'Chưa chọn nhân viên hoặc chi nhánh cho thu ngân');
    }

    public function setSessionThuNgan(Request $request)
    {

        if (empty($request->chi_nhanh_id) || empty($request->nhan_vien_id) || empty($request->kho_hang_id)) {
            return $this->sendSuccessResponse([], false);
        }

        // get nhân viên, chi nhánh info
        $chiNhanh = ChiNhanh::find($request->chi_nhanh_id);
        $nhanVien = AdminUser::find($request->nhan_vien_id);
        $khoHang = AdminUser::find($request->kho_hang_id);

        // save 2 session
        $request->session()->put('chi_nhanh',  $chiNhanh);
        $request->session()->put('nhan_vien_thu_ngan', $nhanVien);
        $request->session()->put('kho_hang', $nhanVien);

        return $this->sendSuccessResponse([
            'chiNhanh' => $chiNhanh,
            'nhanVien' => $nhanVien,
            'khoHang' => $khoHang,
        ], 'success');
    }

    public function setSessionDoiCa(Request $request)
    {
        if (empty($request->nhan_vien_id)) {
            return $this->sendSuccessResponse([], false);
        }
        // get nhân viên info
        $nhanVien = AdminUser::find($request->nhan_vien_id);
        // save 2 session
        $request->session()->put('nhan_vien_thu_ngan', $nhanVien);

        return $this->sendSuccessResponse([
            'nhanVien' => $nhanVien
        ], 'success');
    }
}
