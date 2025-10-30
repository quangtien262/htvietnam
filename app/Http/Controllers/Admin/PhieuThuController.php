<?php

namespace App\Http\Controllers\Admin;

use App\Models\Admin\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\HoaDon;
use App\Models\Admin\PhieuThu;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;

use App\Services\Admin\TblService;
use App\Models\Admin\Table;
use App\Models\User;

class PhieuThuController extends Controller
{
    public function index(Request $request)
    {
        $tables = TblService::getAdminMenu(0);
        $table = Table::find(236);
        $users = PhieuThu::select(
                'phieu_thu.*','phieu_thu.id as key',
                'users.name as khach_hang',
                'admin_users.name as nguoi_thu',
                'chi_nhanh.name as chi_nhanh',
            )
            ->where('users.is_recycle_bin', 0)
            ->leftJoin('users', 'users.id', 'phieu_thu.khach_hang_id')
            ->leftJoin('admin_users', 'admin_users.id', 'phieu_thu.user_thu_id')
            ->leftJoin('chi_nhanh', 'phieu_thu.chi_nhanh_id', 'chi_nhanh.id')
            ->paginate(20);
        $typeProduct = config('constant.type_product');
        $customerGroup = DB::table('customer_group')->get();
        $gioiTinh = DB::table(table: 'gioi_tinh')->get();
        $viewData = [
            'tables' => $tables,
            'table' => $table,
            'users' => $users,
            'typeProduct' =>$typeProduct,
            'customerGroup' => $customerGroup,
            'gioiTinh' => $gioiTinh,
        ];
 
        return Inertia::render('Admin/PhieuThu/index', $viewData);
    }

    public function createOrUpdate(Request $request, $pid = 0)
    {
        $product = Product::getProduct($pid);

        $tables = TblService::getAdminMenu(0);
        $table = Table::find(236);
        $productGroup = DB::table('product_group')->get();
        $thuongHieu = DB::table(table: 'thuong_hieu')->get();
        $viTri = DB::table('product_vi_tri')->get();
        $thuocTinh = DB::table('product_thuoc_tinh')->get();
        $users = User::where('is_recycle_bin', 0)->paginate(20);
        $thuocTinhClass = [];
        
        
        
        $viewData = [
            'tables' => $tables,
            'table' => $table,
            'thuocTinh' => $thuocTinh,
            'thuocTinhClass' => $thuocTinhClass,
            'thuongHieu' => $thuongHieu,
            'productGroup' => $productGroup,
            'viTri' => $viTri,
            'users' => $users,
            'product' => $product,
            'pid' => $pid,
        ];
        return Inertia::render('Admin/Product/form', $viewData);
    }

    public function save(Request $rq)
    {
        
        $tables = TblService::getAdminMenu(0);
        $tbl = DB::table('tables')->where('name', 'products')->first();
        $table = Table::find($tbl->id);

        $product = Product::savePro($rq);

        
        return to_route('data.index', $tbl->id);
        
    }

    public function lichSuMuaHang($id) {
        $hoaDon = HoaDon::baseQuery()->where('hoa_don.users_id', $id)->get();

        $result = [];
        foreach($hoaDon as $key => $nl) {
            $stt = $key +1;
            $result[] = [
                'key' => $nl->id,
                'id' => $nl->id,
                'stt' => $stt,
                'tong_tien' => $nl->tong_tien,
                'tien_tru_the' => $nl->tien_tru_the,
                'thanh_toan' => $nl->thanh_toan,
                'created_at' => $nl->created_at,
            ];
        }
        
        return $this->sendSuccessResponse($result);
    }

    public function dichVuTrongGoi($pid) {
        $nguyenLieu = DB::table('product_dich_vu_trong_goi')
            ->select(
                'product_dich_vu_trong_goi.so_luong as so_luong',
                'product_dich_vu_trong_goi.id as id',
                'products.name as product_name',
                'products.code as product_code',
                'products.gia_von as gia_von',
                'products.gia_ban as gia_ban',
            )
            ->where('product_dich_vu_trong_goi.product_id', $pid)
            ->leftJoin('products', 'products.id', 'product_dich_vu_trong_goi.id_dich_vu_ap_dung')
            ->get();
        $result = [];
        foreach($nguyenLieu as $key => $nl) {
            $stt = $key +1;
            $result[] = [
                'key' => $nl->id,
                'id' => $nl->id,
                'stt' => $stt,
                'product_code' => $nl->product_code,
                'product_name' => $nl->product_name,
                'gia_von' => $nl->gia_von,
                'gia_ban' => $nl->gia_ban,
                'so_luong' => $nl->so_luong,
            ];
        }
        
        return $this->sendSuccessResponse($result);
    }

    public function apDung($pid) {
        $product = Product::find($pid);
        $productApply = [];
        if(!empty($product->hang_hoa_ap_dung)) {
            $productApply = Product::whereIn('id', $product->hang_hoa_ap_dung)->get();
        }
        
        return $this->sendSuccessResponse($productApply);
    }

    public function ngungKinhDoanh(Request $rq) {
        $product = Product::find($rq->pid);
        $product->ngung_kinh_doanh = 1;
        $product->save();
        return $this->sendSuccessResponse('OK');
    }

    public function deleteProduct(Request $rq) {
        $product = Product::find($rq->pid);
        $product->is_draft = 1;
        $product->save();
        return $this->sendSuccessResponse('OK');
    }

    public function search(Request $request)
    {
        $products = Product::searchProduct($request);

        return $this->sendSuccessResponse($products);
    }

    private function checkShowFormItem($type = 1, $product = null) {
        $classItem_tmp = [];
        switch ($type) {
            case 1:
                $classItem_tmp['title_col01'] ='Hàng hóa'; // dich vu
                // check ẩn hiện
                $classItem_tmp['thoi_luong'] ='_hidden'; // dich vu
                $classItem_tmp['ton_kho'] =''; // HH
                $classItem_tmp['product_group_id'] =''; // HH, dich vu, gói
                $classItem_tmp['product_group_ids_apply'] ='_hidden'; //  thẻ(chọn nhiều)
                $classItem_tmp['thuong_hieu_id'] =''; // HH, dich vu, gói, thẻ
                $classItem_tmp['vi_tri_id'] =''; // HH
                $classItem_tmp['gia_von'] =''; // HH
                $classItem_tmp['gia_ban'] =''; // HH, dich vu, gói, thẻ
                $classItem_tmp['menh_gia'] ='_hidden'; // thẻ
                $classItem_tmp['trong_luong'] =''; // HH
                $classItem_tmp['hoa_hong_nv'] =''; // HH, dich vu
                $classItem_tmp['ban_truc_tiep'] =''; // HH, dich vu
                $classItem_tmp['thuoc_tinh'] =''; // HH, dich vu
                $classItem_tmp['don_vi_tinh'] =''; // HH, dich vu
                // detail
                $classItem_tmp['dinh_muc_ton_it_nhat'] =''; // HH
                $classItem_tmp['dinh_muc_ton_nhieu_nhat'] =''; // HH (999999999)
                $classItem_tmp['mo_ta'] =''; // HH, dich vu, gói, thẻ
                $classItem_tmp['ghi_chu'] =''; // dich vu, gói,thẻ
                $classItem_tmp['nguyen_lieu_tieu_hao'] ='_hidden'; // dich vu

                $classItem_tmp['lich_trinh_sd'] ='_hidden'; // gói
                $classItem_tmp['lich_trinh_sd__khoang_cach_moi_buoi'] ='_hidden'; // gói

                $classItem_tmp['han_su_dung'] = '_hidden'; // gói, thẻ: Vô hạn, ngày cụ thể, khoảng tg
                $classItem_tmp['hsd_ngay_cu_the'] ='_hidden'; //
                $classItem_tmp['hsd_khoang_thoi_gian'] ='_hidden';


                $classItem_tmp['product_apply'] ='_hidden'; // gói
                $classItem_tmp['loai_hang_hoa'] ='_hidden'; // thẻ - chọn nhiều
                $classItem_tmp['hang_hoa_ap_dung'] ='_hidden'; // thẻ - chọn nhiều
                $classItem_tmp['other'] ='_hidden'; // other - thẻ, gói
        
                $classItem_tmp['dichVu_sp'] ='_hidden';
                $classItem_tmp['dichVu_sp_titleInput'] ='';
                $classItem_tmp['dichVu_sp_titlePrice'] ='';

                //
                $classItem_tmp['title_code'] = 'Mã sản phẩm';
                $classItem_tmp['title_name'] = 'Tên sản phẩm';
                break;
            case 2:
                $classItem_tmp['title_col01'] ='Dịch vụ'; // dich vu

                // check ẩn hiện
                $classItem_tmp['thoi_luong'] =''; // dich vu
                $classItem_tmp['ton_kho'] ='_hidden'; // HH
                $classItem_tmp['product_group_id'] =''; // HH, dich vu, gói
                $classItem_tmp['product_group_ids_apply'] ='_hidden'; //  thẻ(chọn nhiều)
                $classItem_tmp['thuong_hieu_id'] =''; // HH, dich vu, gói, thẻ
                $classItem_tmp['vi_tri_id'] ='_hidden'; // HH
                $classItem_tmp['gia_von'] =''; // HH
                $classItem_tmp['gia_ban'] =''; // HH, dich vu, gói, thẻ
                $classItem_tmp['menh_gia'] ='_hidden'; // thẻ
                $classItem_tmp['trong_luong'] ='_hidden'; // HH
                $classItem_tmp['hoa_hong_nv'] =''; // HH, dich vu
                $classItem_tmp['ban_truc_tiep'] =''; // HH, dich vu
                $classItem_tmp['thuoc_tinh'] =''; // HH, dich vu
                $classItem_tmp['don_vi_tinh'] =''; // HH, dich vu
                // detail
                $classItem_tmp['dinh_muc_ton_it_nhat'] ='_hidden'; // HH
                $classItem_tmp['dinh_muc_ton_nhieu_nhat'] ='_hidden'; // HH (999999999)
                $classItem_tmp['mo_ta'] =''; // HH, dich vu, gói, thẻ
                $classItem_tmp['ghi_chu'] =''; // dich vu, gói,thẻ
                $classItem_tmp['nguyen_lieu_tieu_hao'] =''; // dich vu

                //lich_trinh_sd
                $classItem_tmp['lich_trinh_sd'] ='_hidden'; // gói
                $classItem_tmp['lich_trinh_sd__khoang_cach_moi_buoi'] ='_hidden'; // gói
                // /han_su_dung
                $classItem_tmp['han_su_dung'] = '_hidden'; // gói, thẻ: Vô hạn, ngày cụ thể, khoảng tg
                $classItem_tmp['hsd_ngay_cu_the'] ='_hidden'; //
                $classItem_tmp['hsd_khoang_thoi_gian'] ='_hidden';

                $classItem_tmp['product_apply'] =''; // gói
                $classItem_tmp['loai_hang_hoa'] ='_hidden'; // thẻ - chọn nhiều
                $classItem_tmp['hang_hoa_ap_dung'] ='_hidden'; // thẻ - chọn nhiều
                $classItem_tmp['other'] ='_hidden'; // other - thẻ, gói

                $classItem_tmp['dichVu_sp'] ='Nguyên liệu tiêu hao';
                $classItem_tmp['dichVu_sp_titleInput'] ='Chọn nguyên liệu';
                $classItem_tmp['dichVu_sp_titlePrice'] ='Giá vốn';

                //
                $classItem_tmp['title_code'] = 'Mã dịch vụ';
                $classItem_tmp['title_name'] = 'Tên dịch vụ';
                break;
            case 3:

                $classItem_tmp['title_col01'] ='Gói dịch vụ, liệu trình'; // dich vu
                // check ẩn hiện
                $classItem_tmp['thoi_luong'] ='_hidden'; // dich vu
                $classItem_tmp['ton_kho'] ='_hidden'; // HH
                $classItem_tmp['product_group_id'] =''; // HH, dich vu, gói
                $classItem_tmp['product_group_ids_apply'] ='_hidden'; //  thẻ(chọn nhiều)
                $classItem_tmp['thuong_hieu_id'] =''; // HH, dich vu, gói, thẻ
                $classItem_tmp['vi_tri_id'] ='_hidden'; // HH
                $classItem_tmp['gia_von'] ='_hidden'; // HH
                $classItem_tmp['gia_ban'] =''; // HH, dich vu, gói, thẻ
                $classItem_tmp['menh_gia'] ='_hidden'; // thẻ
                $classItem_tmp['trong_luong'] ='_hidden'; // HH
                $classItem_tmp['hoa_hong_nv'] ='_hidden'; // HH, dich vu
                $classItem_tmp['ban_truc_tiep'] ='_hidden'; // HH, dich vu
                $classItem_tmp['thuoc_tinh'] ='_hidden'; // HH, dich vu
                $classItem_tmp['don_vi_tinh'] ='_hidden'; // HH, dich vu
                // detail
                $classItem_tmp['dinh_muc_ton_it_nhat'] ='_hidden'; // HH
                $classItem_tmp['dinh_muc_ton_nhieu_nhat'] ='_hidden'; // HH (999999999)
                $classItem_tmp['mo_ta'] =''; // HH, dich vu, gói, thẻ
                $classItem_tmp['ghi_chu'] =''; // dich vu, gói,thẻ
                $classItem_tmp['nguyen_lieu_tieu_hao'] ='_hidden'; // dich vu

                $classItem_tmp['lich_trinh_sd'] =''; // góig tg
                $classItem_tmp['lich_trinh_sd__khoang_cach_moi_buoi'] ='_hidden'; // gói
                if($product->lich_trinh_sd != 1) {
                    $classItem_tmp['lich_trinh_sd__khoang_cach_moi_buoi'] =''; // gói
                }

                $classItem_tmp['han_su_dung'] = ''; // gói, thẻ: Vô hạn, ngày cụ thể, khoản
                $classItem_tmp['hsd_ngay_cu_the'] ='_hidden'; //
                if($product->han_su_dung == 2) {
                    $classItem_tmp['hsd_ngay_cu_the'] =''; //
                }
                
                $classItem_tmp['hsd_khoang_thoi_gian'] ='_hidden';
                if($product->han_su_dung == 3) {
                    $classItem_tmp['hsd_khoang_thoi_gian'] =''; 
                }

                $classItem_tmp['product_apply'] =''; // gói
                $classItem_tmp['loai_hang_hoa'] ='_hidden'; // thẻ - chọn nhiều
                $classItem_tmp['hang_hoa_ap_dung'] ='_hidden'; // thẻ - chọn nhiều
                $classItem_tmp['other'] =''; // other - thẻ, gói
        
                $classItem_tmp['dichVu_sp'] ='Dịch vụ trong gói';
                $classItem_tmp['dichVu_sp_titleInput'] ='Chọn dịch vụ';
                $classItem_tmp['dichVu_sp_titlePrice'] ='Giá bán lẻ';

                //
                $classItem_tmp['title_code'] = 'Mã gói';
                $classItem_tmp['title_name'] = 'Tên gói';
                break;
            case 4:
                $classItem_tmp['title_col01'] ='Thẻ khách hàng'; // dich vu
                $classItem_tmp['thoi_luong'] ='_hidden'; // dich vu
                $classItem_tmp['ton_kho'] ='_hidden'; // HH
                $classItem_tmp['product_group_id'] ='_hidden'; // HH, dich vu, gói
                $classItem_tmp['product_group_ids_apply'] =''; //  thẻ(chọn nhiều)
                $classItem_tmp['thuong_hieu_id'] =''; // HH, dich vu, gói, thẻ
                $classItem_tmp['vi_tri_id'] ='_hidden'; // HH
                $classItem_tmp['gia_von'] =''; // HH
                $classItem_tmp['gia_ban'] =''; // HH, dich vu, gói, thẻ
                $classItem_tmp['menh_gia'] ='_hidden'; // thẻ
                $classItem_tmp['trong_luong'] =''; // HH
                $classItem_tmp['hoa_hong_nv'] ='_hidden'; // HH, dich vu
                $classItem_tmp['ban_truc_tiep'] ='_hidden'; // HH, dich vu
                $classItem_tmp['thuoc_tinh'] ='_hidden'; // HH, dich vu
                $classItem_tmp['don_vi_tinh'] =''; // HH, dich vu
                // detail
                $classItem_tmp['dinh_muc_ton_it_nhat'] ='_hidden'; // HH
                $classItem_tmp['dinh_muc_ton_nhieu_nhat'] ='_hidden'; // HH (999999999)
                $classItem_tmp['mo_ta'] =''; // HH, dich vu, gói, thẻ
                $classItem_tmp['ghi_chu'] =''; // dich vu, gói,thẻ
                $classItem_tmp['nguyen_lieu_tieu_hao'] ='_hidden'; // dich vu
                $classItem_tmp['lich_trinh_sd'] ='_hidden'; // gói
                $classItem_tmp['lich_trinh_sd__khoang_cach_moi_buoi'] ='_hidden'; // gói

                $classItem_tmp['han_su_dung'] = ''; // gói, thẻ: Vô hạn, ngày cụ thể, khoảng tg
                $classItem_tmp['hsd_ngay_cu_the'] ='_hidden'; //
                if($product->han_su_dung == 2) {
                    $classItem_tmp['hsd_ngay_cu_the'] =''; //
                }
                
                $classItem_tmp['hsd_khoang_thoi_gian'] ='_hidden';
                if($product->han_su_dung == 3) {
                    $classItem_tmp['hsd_khoang_thoi_gian'] =''; 
                }

                $classItem_tmp['hsd_ngay_cu_the'] ='_hidden'; //
                $classItem_tmp['hsd_khoang_thoi_gian'] ='_hidden';

                $classItem_tmp['product_apply'] ='_hidden'; // gói
                $classItem_tmp['loai_hang_hoa'] =''; // thẻ - chọn nhiều
                $classItem_tmp['hang_hoa_ap_dung'] ='_hidden'; // thẻ - chọn nhiều

                $classItem_tmp['other'] =''; // other - thẻ, gói
        
                $classItem_tmp['dichVu_sp'] ='';
                $classItem_tmp['dichVu_sp_titleInput'] ='';

                //
                $classItem_tmp['title_code'] = 'Mã thẻ';
                $classItem_tmp['title_name'] = 'Tên thẻ';
                break;
        }
        return $classItem_tmp;
    }
}

