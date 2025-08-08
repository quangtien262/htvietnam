<?php

namespace App\Http\Controllers\Admin;

use App\Models\Admin\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\HoaDon;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;

use App\Services\Admin\TblService;
use App\Models\Admin\Table;
use App\Models\AdminUser;
use App\Models\User;

class NhanVienController extends Controller
{
    public function index(Request $request)
    {
        $tables = TblService::getAdminMenu(0);
        $table = Table::find(236);
        $users = AdminUser::select(
                'admin_users.*','admin_users.id as key',
                'gioi_tinh.name as gioi_tinh_name',
                'chi_nhanh.name as chi_nhanh_name',
                'permission_group.name as permission_group_name',
            )
            ->where('admin_users.is_recycle_bin', 0)
            ->leftJoin('gioi_tinh', 'gioi_tinh.id', 'admin_users.gioi_tinh_id')
            ->leftJoin('chi_nhanh', 'chi_nhanh.id', 'admin_users.chi_nhanh_id')
            ->leftJoin('permission_group', 'permission_group.id', 'admin_users.permission_group_id')
            ->orderBy('admin_users.id', 'desc')
            ->paginate(20);
        $gioiTinh = DB::table( 'gioi_tinh')->get();
        $chiNhanh = DB::table( 'chi_nhanh')->get();
        $status = DB::table( 'admin_user_status')->get();
        $honNhan = DB::table( 'tinh_trang_hon_nhan')->get();
        $chucVu = DB::table( 'chuc_vu')->get();
        $permissionGroup = DB::table( 'permission_group')->get();
        $viewData = [
            'tables' => $tables,
            'table' => $table,
            'users' => $users,
            'gioiTinh' => $gioiTinh,
            'chiNhanh'=> $chiNhanh,
            'status'=> $status,
            'honNhan' => $honNhan,
            'chucVu' => $chucVu,
            'permissionGroup' => $permissionGroup,
        ];
 
        return Inertia::render('Admin/NhanVien/index', $viewData);
    }


    public function search(Request $request)
    {
        $nv = AdminUser::getNhanVien($request);

        return $this->sendSuccessResponse($nv);
    }

    public function saveNhanVien(Request $rq)
    {
         
        if(empty($rq->id)) {
            $nhanVien = new AdminUser();
        } else {
            $nhanVien = AdminUser::find($rq->id);
        }

        $nhanVien->name = $rq->name;
        $nhanVien->username = !empty($rq->username) ? $rq->username : '';
        $nhanVien->phone = !empty($rq->phone) ? $rq->phone : '';
        $nhanVien->gioi_tinh_id = !empty($rq->gioi_tinh_id) ? $rq->gioi_tinh_id : 0;
        $nhanVien->email = !empty($rq->email) ? $rq->email : '';
        $nhanVien->tinh_trang_hon_nhan_id = !empty($rq->tinh_trang_hon_nhan_id) ? intval($rq->tinh_trang_hon_nhan_id) : 0;
        $nhanVien->address = !empty($rq->address) ? $rq->address : '';
        $nhanVien->cmnd = !empty($rq->cmnd) ? $rq->cmnd : '';
        $nhanVien->chi_nhanh_id = !empty($rq->chi_nhanh_id) ? intval($rq->chi_nhanh_id) : 0;
        $nhanVien->permission_group_id = !empty($rq->permission_group_id) ? intval($rq->permission_group_id) : 0;
        $nhanVien->admin_user_status_id = !empty($rq->admin_user_status_id) ? intval($rq->admin_user_status_id) : 0;
        $nhanVien->chuc_vu_id = !empty($rq->chuc_vu_id) ? intval($rq->chuc_vu_id) : 0;
        $nhanVien->permission_group_id = !empty($rq->permission_group_id) ? intval($rq->permission_group_id) : 0;
        
        $nhanVien->ngay_vao_lam = !empty($rq->ngay_vao_lam) ? $rq->ngay_vao_lam : null;
        $nhanVien->noi_cap = !empty($rq->noi_cap) ? $rq->noi_cap : null;
        $nhanVien->ngay_cap = !empty($rq->ngay_cap) ? $rq->ngay_cap : null;
        $nhanVien->birthday = !empty($rq->birthday) ? $rq->birthday : null;

        // luong nang cao
        $nhanVien->salary = $rq->salary;  
        $nhanVien->loai_luong = $rq->loai_luong;  
        
        $nhanVien->is_setting_salary_nang_cao = 0;
        if($rq->is_setting_salary_nang_cao) {
            $nhanVien->is_setting_salary_nang_cao = 1; 

            $nhanVien->luong_chinh_thu7 = $rq->luong_chinh_thu7;            
            $nhanVien->luong_chinh_cn = $rq->luong_chinh_cn;            
            $nhanVien->luong_chinh_ngay_nghi = $rq->luong_chinh_ngay_nghi;            
            $nhanVien->luong_chinh_nghi_le = $rq->luong_chinh_nghi_le;

            $nhanVien->is_luong_chinh_nghi_le_persen = $rq->is_luong_chinh_nghi_le_persen;
            $nhanVien->is_luong_chinh_ngay_nghi_persen = $rq->is_luong_chinh_ngay_nghi_persen;
            $nhanVien->is_luong_chinh_thu7_persen = $rq->is_luong_chinh_thu7_persen;
            $nhanVien->is_luong_chinh_cn_persen = $rq->is_luong_chinh_cn_persen;
        }

        // lam them gio
        $nhanVien->is_setting_salary_lam_them_gio = 0; 
        if($rq->is_setting_salary_lam_them_gio) {
            $nhanVien->is_setting_salary_lam_them_gio = 1; 
            
            $nhanVien->them_gio_ngay_thuong = $rq->them_gio_ngay_thuong;            
            $nhanVien->is_them_gio_ngay_thuong_persen = $rq->is_them_gio_ngay_thuong_persen;      

            $nhanVien->them_gio_thu7 = $rq->them_gio_thu7;            
            $nhanVien->is_them_gio_thu7_persen = $rq->is_them_gio_thu7_persen;

            $nhanVien->them_gio_chu_nhat = $rq->them_gio_chu_nhat;
            $nhanVien->is_them_gio_chu_nhat_persen = $rq->is_them_gio_chu_nhat_persen;

            $nhanVien->them_gio_ngay_nghi = $rq->them_gio_ngay_nghi;
            $nhanVien->is_them_gio_ngay_nghi_persen = $rq->is_them_gio_ngay_nghi_persen;

            $nhanVien->them_gio_nghi_le_tet = $rq->them_gio_nghi_le_tet;
            $nhanVien->is_them_gio_nghi_le_tet_persen = $rq->is_them_gio_nghi_le_tet_persen;
        }
        

        // check thuong
        if($rq->is_setting_thuong) {
            $nhanVien->is_setting_thuong = 1;
            $nhanVien->loai_thuong = $rq->loai_thuong;
            $nhanVien->hinh_thuc_thuong = $rq->hinh_thuc_thuong;
            $nhanVien->thuong_setting = $rq->thuong_setting;
        }

        // check hoa hong
        $nhanVien->is_setting_hoa_hong = $rq->is_setting_hoa_hong;
        if($rq->is_setting_hoa_hong) {
            $nhanVien->hoa_hong_setting = $rq->hoa_hong_setting;
        }

        // check phu cap
        $nhanVien->is_setting_phu_cap = $rq->is_setting_phu_cap;
        if($rq->is_setting_phu_cap) {
            $nhanVien->phu_cap_setting = $rq->phu_cap_setting;
        }

        // check giam tru
        $nhanVien->is_setting_giam_tru = $rq->is_setting_giam_tru;
        if($rq->is_setting_giam_tru) {
            $nhanVien->giam_tru_setting = $rq->giam_tru_setting;
        }
        
        $nhanVien->save();

        // generate code
        if(empty($nhanVien->code)) {
            $nhanVien->code = 'NV' . TblService::formatNumberByLength($nhanVien->id);
            $nhanVien->save();
        }
        
        return $this->sendSuccessResponse($nhanVien);

        return $this->sendSuccessResponse($nhanVien);
    }

    public function changePW(Request $rq) {
        if(empty($rq->id) && empty($rq->password)) {
            return $this->sendErrorResponse('input is empty');
        }
        
        $user = AdminUser::find($rq->id);
        
        if(empty($user)) {
            return $this->sendErrorResponse('Tài khoản đã bị khóa hoặc không tồn tại');
        }

        $user->password = bcrypt($rq->password);
        $user->save();

        return $this->sendSuccessResponse('Change password successfully');
    }

}

