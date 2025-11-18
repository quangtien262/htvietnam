<?php

namespace App\Http\Controllers\Admin;

use App\Models\Admin\ChiNhanh;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\AdminMenu;
use App\Models\Admin\Column;
use App\Models\Admin\Log;
use App\Models\Admin\Product;
use App\Models\Admin\Table;
use App\Models\AdminUser;
use App\Models\User;
use App\Services\Admin\TblService;
use App\Services\AnalyticService;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{

    function getMenusDashboard(Request $request)
    {
        $menus = AdminMenu::where('color', 1)
            ->orderBy('sort_order', 'asc')
            ->get();
        return $this->sendSuccessResponse($menus);
    }

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

        // get 20 log mới nhất
        $logs = Log::orderBy('id', 'desc')->limit(20)->get();

        $param = [
            'tables' => $tables,
            'tablesSelects' => $tablesSelects,
            'banChay' => $banchay,
            'logs' => $logs
        ];
        return Inertia::render('Admin/Pages/index', $param);
    }

    public function dashboardWeb(Request $request)
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

        // get 20 log mới nhất
        $logs = Log::orderBy('id', 'desc')->limit(20)->get();

        $param = [
            'viewStats' => $viewStats,
            // 'viewStatsIp' => $viewStatsIp,
            'contacts' => $contacts,
            'orders' => $orders,
            'logs' => $logs,
            'menus' => TblService::getMenus($request->p),
            'p' => $request->p
        ];
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

        $datas = AdminMenu::orderBy('sort_order', 'asc')->where('parent_id', 0)->get();
        // dd($datas);
        $props = [
            'tables' => $tables,
            'datas' => $datas
        ];
        return Inertia::render('Admin/Dashboard/index', $props);
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

    public function getMenus(Request $request)
    {
        $menus = TblService::getMenus($request->p);
        return $this->sendSuccessResponse($menus);
    }

    /**
     * Get admin users list with pagination and filters
     */
    public function getAdminUsersList(Request $request)
    {
        try {
            $searchData = $request->input('searchData', []);
            $page = $searchData['page'] ?? 1;
            $perPage = $searchData['per_page'] ?? 20;

            $query = AdminUser::query();

            // Search by multiple fields
            if (!empty($searchData['search'])) {
                $search = $searchData['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('username', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            }

            // Filter by chi_nhanh_id
            if (!empty($searchData['chi_nhanh_id'])) {
                $query->where('chi_nhanh_id', $searchData['chi_nhanh_id']);
            }

            // Filter by admin_user_status_id
            if (!empty($searchData['admin_user_status_id'])) {
                $query->where('admin_user_status_id', $searchData['admin_user_status_id']);
            }

            // Filter by chuc_vu_id
            if (!empty($searchData['chuc_vu_id'])) {
                $query->where('chuc_vu_id', $searchData['chuc_vu_id']);
            }

            // Filter by ngay_vao_lam range
            if (!empty($searchData['ngay_vao_lam_from'])) {
                $query->where('ngay_vao_lam', '>=', $searchData['ngay_vao_lam_from']);
            }
            if (!empty($searchData['ngay_vao_lam_to'])) {
                $query->where('ngay_vao_lam', '<=', $searchData['ngay_vao_lam_to']);
            }

            // Exclude recycle bin and da_nghi_lam
            $query->where('admin_users.is_recycle_bin', '!=', 1);
            $query->where('admin_users.da_nghi_lam', '!=', 1);

            // Join với bảng liên quan để lấy tên
            $query->leftJoin('chi_nhanh', 'admin_users.chi_nhanh_id', '=', 'chi_nhanh.id')
                  ->leftJoin('chuc_vu', 'admin_users.chuc_vu_id', '=', 'chuc_vu.id')
                  ->leftJoin('admin_user_status', 'admin_users.admin_user_status_id', '=', 'admin_user_status.id')
                  ->select('admin_users.*',
                           'chi_nhanh.name as chi_nhanh_name',
                           'chuc_vu.name as chuc_vu_name',
                           'admin_user_status.name as admin_user_status_name');

            // Order by
            $query->orderBy('admin_users.id', 'desc');

            // Pagination
            $users = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'status_code' => 200,
                'data' => [
                    'datas' => $users->items(),
                    'total' => $users->total(),
                    'current_page' => $users->currentPage(),
                    'per_page' => $users->perPage(),
                    'last_page' => $users->lastPage(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Lỗi khi lấy danh sách nhân viên: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get admin user detail by ID
     */
    public function getAdminUserDetail(Request $request, $id)
    {
        try {
            $user = AdminUser::with(['chiNhanh', 'chucVu', 'adminUserStatus', 'permissionGroup'])
                ->find($id);

            if (!$user) {
                return response()->json([
                    'status_code' => 404,
                    'message' => 'Không tìm thấy nhân viên'
                ], 404);
            }

            return response()->json([
                'status_code' => 200,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Lỗi khi lấy thông tin nhân viên: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new admin user
     */
    public function createAdminUser(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'phone' => 'required|string|max:20',
                'email' => 'nullable|email|max:255|unique:admin_users,email',
                'username' => 'nullable|string|max:255|unique:admin_users,username',
                'password' => 'nullable|string|min:6',
                'cmnd' => 'required|string|max:50',
                'ngay_cap' => 'required|date',
                'chi_nhanh_id' => 'required|integer',
                'admin_user_status_id' => 'required|integer',
                'ngay_vao_lam' => 'required|date',
                'chuc_vu_id' => 'required|integer',
            ]);

            // Generate employee code if not provided
            if (empty($request->code)) {
                $lastUser = AdminUser::orderBy('id', 'desc')->first();
                $nextId = $lastUser ? $lastUser->id + 1 : 1;
                $validated['code'] = 'NV' . str_pad($nextId, 5, '0', STR_PAD_LEFT);
            } else {
                $validated['code'] = $request->code;
            }

            // Hash password if provided
            if (!empty($validated['password'])) {
                $validated['password'] = bcrypt($validated['password']);
            }

            // Set defaults
            $validated['is_recycle_bin'] = 0;
            $validated['da_nghi_lam'] = 0;

            // Add optional fields
            $optionalFields = ['birthday', 'gioi_tinh_id', 'noi_cap', 'address', 'description', 'image', 'permission_group_id', 'tinh_trang_hon_nhan_id', 'nguoi_phu_thuoc', 'ngan_hang', 'chi_nhanh_ngan_hang', 'so_tai_khoan'];
            foreach ($optionalFields as $field) {
                if ($request->has($field)) {
                    $validated[$field] = $request->$field;
                }
            }

            $user = AdminUser::create($validated);

            return response()->json([
                'status_code' => 200,
                'message' => 'Thêm nhân viên thành công',
                'data' => $user
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status_code' => 422,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Lỗi khi thêm nhân viên: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update admin user
     */
    public function updateAdminUser(Request $request, $id)
    {
        try {
            $user = AdminUser::find($id);

            if (!$user) {
                return response()->json([
                    'status_code' => 404,
                    'message' => 'Không tìm thấy nhân viên'
                ], 404);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'phone' => 'required|string|max:20',
                'email' => 'nullable|email|max:255|unique:admin_users,email,' . $id,
                'username' => 'nullable|string|max:255|unique:admin_users,username,' . $id,
                'password' => 'nullable|string|min:6',
                'cmnd' => 'required|string|max:50',
                'ngay_cap' => 'required|date',
                'chi_nhanh_id' => 'required|integer',
                'admin_user_status_id' => 'required|integer',
                'ngay_vao_lam' => 'required|date',
                'chuc_vu_id' => 'required|integer',
            ]);

            // Only update password if provided
            if (!empty($validated['password'])) {
                $validated['password'] = bcrypt($validated['password']);
            } else {
                unset($validated['password']);
            }

            // Add optional fields
            $optionalFields = ['code', 'birthday', 'gioi_tinh_id', 'noi_cap', 'address', 'description', 'image', 'permission_group_id', 'tinh_trang_hon_nhan_id', 'nguoi_phu_thuoc', 'ngan_hang', 'chi_nhanh_ngan_hang', 'so_tai_khoan'];
            foreach ($optionalFields as $field) {
                if ($request->has($field)) {
                    $validated[$field] = $request->$field;
                }
            }

            $user->update($validated);

            return response()->json([
                'status_code' => 200,
                'message' => 'Cập nhật nhân viên thành công',
                'data' => $user
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status_code' => 422,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Lỗi khi cập nhật nhân viên: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete admin users (soft delete - move to recycle bin)
     */
    public function deleteAdminUsers(Request $request)
    {
        try {
            $ids = $request->input('ids', []);

            if (empty($ids)) {
                return response()->json([
                    'status_code' => 422,
                    'message' => 'Không có nhân viên nào được chọn'
                ], 422);
            }

            AdminUser::whereIn('id', $ids)->update(['is_recycle_bin' => 1]);

            return response()->json([
                'status_code' => 200,
                'message' => 'Xóa nhân viên thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Lỗi khi xóa nhân viên: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get select options for admin users form
     */
    public function getAdminUsersSelectOptions(Request $request)
    {
        try {
            $type = $request->input('type'); // chi_nhanh, chuc_vu, admin_user_status, gioi_tinh, permission_group

            $data = [];

            switch ($type) {
                case 'chi_nhanh':
                    $data = DB::table('chi_nhanh')
                        ->select('id', 'name')
                        ->orderBy('name')
                        ->get();
                    break;

                case 'chuc_vu':
                    $data = DB::table('chuc_vu')
                        ->select('id', 'name')
                        ->orderBy('name')
                        ->get();
                    break;

                case 'admin_user_status':
                    $data = DB::table('admin_user_status')
                        ->select('id', 'name')
                        ->orderBy('id')
                        ->get();
                    break;

                case 'gioi_tinh':
                    $data = DB::table('gioi_tinh')
                        ->select('id', 'name')
                        ->orderBy('id')
                        ->get();
                    break;

                case 'permission_group':
                    $data = DB::table('permission_group')
                        ->select('id', 'name')
                        ->orderBy('name')
                        ->get();
                    break;

                default:
                    return response()->json([
                        'status_code' => 400,
                        'message' => 'Loại dữ liệu không hợp lệ'
                    ], 400);
            }

            return response()->json([
                'status_code' => 200,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Lỗi khi lấy dữ liệu: ' . $e->getMessage()
            ], 500);
        }
    }
}
