<?php

namespace App\Http\Controllers\Admin;

use App\Models\Admin\CongNo;
use App\Models\Admin\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\HoaDon;
use App\Models\Admin\HoaDonChiTiet;
use Illuminate\Support\Facades\DB;
use App\Services\Admin\TblService;
use App\Models\Admin\Table;
use App\Models\User;
use App\Models\Admin\Card;
use App\Models\Admin\NhanVienThucHien;
use App\Models\Admin\NhanVienTuVan;
use App\Models\Admin\PhieuThu;
use App\Models\AdminUser;
use App\Models\Admin\CardService;
use App\Models\Admin\KhachTraHang;
use App\Models\Admin\KhoHang;
use App\Models\Admin\NhapHang;
use App\Models\Admin\PhieuChi;
use App\Models\Admin\SoQuy;
use App\Models\Admin\TraHangNCC;
use App\Services\Admin\CardClass;
use App\Services\Admin\HimalayaService;
use App\Services\Admin\HoaDonService;
use App\Services\Admin\UserService;

class HoaDonController extends Controller
{
    public function index(Request $request)
    {
        $tables = TblService::getAdminMenu(0);
        $table = Table::find(236);
        
        $hoaDon = HoaDon::search($request);
                
        $typeProduct = config('constant.type_product');
        $customerGroup = DB::table('customer_group')->get();
        $gioiTinh = DB::table( 'gioi_tinh')->get();

        // check mốc thời gian để show ra view
        $mocThoiGian = 'today';
        if(!empty($request->mocThoiGian)) {
            $mocThoiGian = $request->mocThoiGian;
        }

        // check khoảng thời gian để show ra view
        $khoangThoiGian = [null,null];
        if(!empty($request->khoangThoiGian)) {
            $khoangThoiGian = $request->khoangThoiGian;
        }

        $searchData = $request->all();
        
        if(isset($searchData['khoangThoiGian'])) {
            unset($searchData['khoangThoiGian']);
        }
        if(isset($searchData['mocThoiGian'])) {
            unset($searchData['mocThoiGian']);
        }
        $viewData = [
            'tables' => $tables,
            'table' => $table,
            'hoaDon' => $hoaDon,
            'typeProduct' =>$typeProduct,
            'customerGroup' => $customerGroup,
            'gioiTinh' => $gioiTinh,
            'mocThoiGian' => $mocThoiGian,
            'khoangThoiGian' => $khoangThoiGian,
            'searchData' => $searchData,
        ];
 
        return Inertia::render('Admin/HoaDon/index', $viewData);
    }

    public function search(Request $request)
    {
        $hoaDon = HoaDon::search( $request);
 
        return $this->sendSuccessResponse($hoaDon);
    }

    /**
     * Summary of hoaDon_payment
     * @param \Illuminate\Http\Request $rq
     * hoa_don_id
     * tien_tru_the
     * 
     * @return void
     */
    public function hoaDon_payment(Request $rq) {
        $date = date('Y-m-d H:i:s');
        $admin = \Auth::guard('admin_users')->user();
        $nhanVienThuNgan = $rq->session()->get('nhan_vien_thu_ngan');
        $chiNhanh = $rq->session()->get('chi_nhanh');
        // Cập nhật tiền trừ thẻ
        $khachHang = User::find($rq->khach_hang_id);
        $khachHang->tien_con_lai = $khachHang->tien_con_lai - $rq->tien_tru_the;
        $khachHang->tien_da_su_dung = $khachHang->tien_da_su_dung + $rq->tien_tru_the;
        $khachHang->save();

        // save hoa_don
        $hoaDon = hoaDon::find($rq->hoa_don_id);
        $hoaDon->create_by = $admin->id;
        $hoaDon->users_id = $rq->khach_hang_id;
        $hoaDon->is_draft = 0;
        $hoaDon->nhan_vien_id = $nhanVienThuNgan->id;
        $hoaDon->chi_nhanh_id = $chiNhanh->id;
        $hoaDon->tien_tru_the = $rq->tien_tru_the;
        $hoaDon->tien_con_lai = $khachHang->tien_con_lai;
        $hoaDon->hinh_thuc_thanh_toan_id = $rq->hinh_thuc_thanh_toan_id;
        $hoaDon->giam_gia = $rq->giam_gia;
        $hoaDon->note = $admin->note;

        $thanhToan = $rq->thanh_toan - $rq->giam_gia;
        $hoaDon->thanh_toan = $thanhToan;

        $hoaDon->code = 'HD' . TblService::formatNumberByLength($hoaDon->id); 
        $hoaDon->create_by = \Auth::guard('admin_users')->user()->id;
        
        $hoaDon->tien_tip = $rq->tien_tip;

        if($thanhToan > $rq->da_thanh_toan) {
            // Lưu công nợ vào hóa đơn
            $hoaDon->da_thanh_toan = $rq->da_thanh_toan;
            $hoaDon->cong_no = $rq->cong_no;
            $hoaDon->ngay_tat_toan = $rq->ngay_tat_toan;
            $hoaDon->hoa_don_status_id = 2; // luu cong no

            // lưu công nọ vào khách hàng
            $khachHang->tong_cong_no += $rq->cong_no;
            $khachHang->cong_no_hien_tai = $rq->cong_no;
            $khachHang->save();

            // lưu công nợ vào bảng cong_no
            $congNo = new CongNo();
            $congNo->users_id = $khachHang->id;

            $congNo->loai_chung_tu = 'hoa_don'; // tên bảng
            $congNo->chung_tu_id = $hoaDon->id;
            $congNo->ma_chung_tu = $hoaDon->code;

            $congNo->product_id = $hoaDon->product_id;
            $congNo->product_code = $hoaDon->product_code;

            $congNo->tong_tien_hoa_don =  $thanhToan;
            $congNo->so_tien_no = $rq->cong_no;
            $congNo->so_tien_da_thanh_toan = $congNo->tong_tien_hoa_don - $congNo->so_tien_no;
            $congNo->ngay_hen_tat_toan = $rq->ngay_tat_toan;
            $congNo->cong_no_status_id = 2; // 2 -  chưa thanh toán
            $congNo->save();
            $congNo->code = 'CN' . TblService::formatNumberByLength($congNo->id, 5);
            $congNo->save();

        } else {
            $hoaDon->hoa_don_status_id = 2; // da thanh toan
        }
        
        if($rq->hinh_thuc_thanh_toan_id == 2) {
            $hoaDon->phi_ca_the = $rq->phi_ca_the;
        }
        
        $hoaDon->save();
        
        // lấy thông tin khách hàng

        $hoaDonChiTiet = HoaDonChiTiet::where('data_id', $hoaDon->id)->get();
        foreach($hoaDonChiTiet as $key => $detail) {
            // get product
            $product = Product::find($detail->product_id);

            // update khach hang
            $detail->khach_hang_id = $hoaDon->users_id;
            $detail->data_code = $hoaDon->code;
            // update số lượng
            if(!empty($product->ton_kho_detail) || !empty($product->ton_kho_detail)) {

            }

            $detail->save();

            

            // lưu lịch sử thẻ GT
            if($product->product_type_id == 4) {
                $this->saveCard_VIP($detail, $product, $khachHang);
            }

            // lưu lịch sử thẻ LT
            if($product->product_type_id == 3) {
                $this->saveCard_LT($detail, $product, $khachHang);
            }
        }

        

        

        // save phieu thu
        $phieuThu = new PhieuThu();
        $phieuThu->name = 'Đơn hàng của ' . $khachHang->name . ' (' . $khachHang->code . ')';

        $phieuThu->chung_tu_id = $hoaDon->id;
        $phieuThu->loai_chung_tu = 'hoa_don';
        $phieuThu->ma_chung_tu = $hoaDon->code;

        $phieuThu->chi_nhanh_id = $hoaDon->chi_nhanh_id;
        $phieuThu->so_tien = $rq->da_thanh_toan;
        $phieuThu->phi_the = 0;
        $phieuThu->thoi_gian = $date;
        $phieuThu->nhan_vien_id = $admin->id;
        $phieuThu->khach_hang_id = $rq->khach_hang_id;
        
        $phieuThu->users_id = $khachHang->id;
        $phieuThu->create_by = $admin->id;

        $phieuThu->save();
        
        $phieuThu->code = 'PD' . TblService::formatNumberByLength($phieuThu->id); 
        $phieuThu->save();

        //save sổ quỹ
        $now =date('d/m/Y H:i:s');
        $nowDB =date('Y-m-d H:i:s');
        $soQuy = new SoQuy();
        $soQuy->name = 'Hóa đơn bán lẻ ' . $now;

        $soQuy->loai_chung_tu = 'hoa_don';
        $soQuy->chung_tu_id = $hoaDon->id;
        $soQuy->ma_chung_tu = $hoaDon->code;
        
        $soQuy->chi_nhanh_id = $hoaDon->chi_nhanh_id;
        $soQuy->khach_hang_id = $rq->khach_hang_id;
        $soQuy->nhan_vien_id = !empty($rq->nhan_vien_id) ? intval($rq->nhan_vien_id) : 0;
        $soQuy->so_quy_type_id = config('constant.so_quy_type.khach_tt_hdon');
        $soQuy->nhom_nguoi_nhan_id = config('constant.nhom_nguoi_nhan.cty');
        $soQuy->thoi_gian = $nowDB;
        $soQuy->note = $rq->note;
        

        $soQuy->so_tien = $thanhToan;
        if($thanhToan > $rq->da_thanh_toan) {
            $soQuy->so_quy_status_id = config('constant.so_quy_status.da_thanh_toan');
            $soQuy->cong_no_phai_thu = $thanhToan - $rq->da_thanh_toan;
        } else {
            $soQuy->so_quy_status_id = config('constant.so_quy_status.cong_no');
        }

        

        $soQuy->save();
        $soQuy->code = 'SQ' . TblService::formatNumberByLength($soQuy->id, 5);
        $soQuy->save();

        return $this->sendSuccessResponse([]);
    }

    public function createHoaDon(Request $request) {
        $tables = TblService::getAdminMenu(0);
        $table = Table::find(235);

        $products = Product::baseQuery()->orderBy('id', 'desc')->get();

        $productInfo = [];
        foreach($products as $pro) {
            $productInfo[$pro->id]  = $pro;
        }
        $users = User::select(
                'users.name as name',
                'users.code as code',
                'users.phone as phone',
                'users.phone02 as phone02',
                'users.id as id',
                'users.tong_tien_da_nap as tong_tien_da_nap',
                'users.tien_con_lai as tien_con_lai',
                'users.tien_da_su_dung as tien_da_su_dung',

                'customer_group.id as customer_group_id',
                'customer_group.name as customer_group',
            )
            ->where('users.is_recycle_bin', 0)
            ->leftJoin('customer_group', 'customer_group.id', 'users.customer_group_id')
            ->get();
        
        $nhanVien = AdminUser::where('is_recycle_bin', 0)->orderBy('name', 'asc')->get();

        $khoHang = KhoHang::where('is_recycle_bin', 0)->orderBy('name', 'asc')->get();
        
        $chiNhanh = DB::table('chi_nhanh')->where('is_recycle_bin', 0)->orderBy('name', 'asc')->get();

        $productGroup_db = DB::table('product_group')->where('is_recycle_bin', 0)->orderBy('name', 'asc')->get();
        $productGroup = [];
        foreach($productGroup_db as $g) {
            $productGroup[] = [
                'text' => $g->name,
                'value' => $g->id
            ];
        }

        // get data default
        
        $hdonChoTT = $this->hoaDonChoThanhToan();
        // dd($hdonChoTT);
        $loaiHangHoa = config('constant.type_product');

        $checkThuNganConfig = true;
        $chiNhanhThuNgan = ['id' => null];
        $nhanVienThuNgan = ['id' => null];
        $khoHangThuNgan = ['id' => null];
        if($request->session()->has('chi_nhanh') && 
            $request->session()->has('nhan_vien_thu_ngan') && 
            $request->session()->has('kho_hang')) {
            $checkThuNganConfig = false;
            $chiNhanhThuNgan = $request->session()->get('chi_nhanh');
            $nhanVienThuNgan = $request->session()->get('nhan_vien_thu_ngan');
            $khoHangThuNgan = $request->session()->get('kho_hang');
        }
        // dd($chiNhanhThuNgan);
        $caInfo = HoaDonService::getCaInfo($nhanVienThuNgan);
        
        // data select dùng cho form khách hàng
        $userSource = DB::table('user_source')->where('is_recycle_bin', 0)->orderBy('sort_order', 'asc')->get();
        $customerGroup = DB::table('customer_group')->where('is_recycle_bin', 0)->orderBy('name', 'asc')->get();
        $viewData = [
            'tables' => $tables,
            'table' => $table,
            'products' => $products,
            'productInfo' => $productInfo,
            'users' => $users,
            'hoaDon' => $hdonChoTT['hoa_don'],
            'hoaDon_active' => $hdonChoTT['hoa_don'][$hdonChoTT['key_active']],
            'key_active' => $hdonChoTT['key_active'],
            'productGroup' => $productGroup,
            'loaiHangHoa' => $loaiHangHoa,
            'checkThuNganConfig' => $checkThuNganConfig,
            'chiNhanh' => $chiNhanh,
            'chiNhanhThuNgan' => $chiNhanhThuNgan,
            'nhanVien' => $nhanVien,
            'nhanVienThuNgan' => $nhanVienThuNgan,
            'khoHang' => $khoHang,
            'khoHangThuNgan' => $khoHangThuNgan,
            'caInfo' => $caInfo,

            'userSource' => $userSource,
            'customerGroup' => $customerGroup,
        ];
        return Inertia::render('Admin/HoaDon/form_hoa_don_ban_le_02', $viewData);
    }

    public function addHoaDon() {
        $newHdon = HoaDon::insertHoaDonChoThanhToan();
        $hd = $this->hoaDonChoThanhToan($newHdon->id);

        return $this->sendSuccessResponse([
            'hoaDons' => $hd['hoa_don'], 
            'key_active'  => $hd['key_active']
        ]);
    }

    private function hoaDonChoThanhToan($idActive = 0) {
        
        $hoaDon_db = HoaDon::getHoaDonChoThanhToan();
        if(!empty($hoaDon_db) && count($hoaDon_db) == 0) {
        // trường hợp ko có data thì insert sẵn 1 data mới
            HoaDon::insertHoaDonChoThanhToan();
            $hoaDon_db = HoaDon::getHoaDonChoThanhToan();
        }
        // dd($hoaDon_db[0]);
        $keyActive = 0;
        $hoaDon = [];
        foreach($hoaDon_db as $key => $hd) {
            $productIDs = [];
            $hoaDonChiTiet = $this->getHoaDonChiTiet($hd->id);

            $hoaDonChiTiet_ids = [];
            $goiDV = [];
            foreach($hoaDonChiTiet as $hdct) {
                $hoaDonChiTiet_ids[] = $hdct->id;
                if(empty($hdct->card_id)) {
                    $productIDs[] = $hdct->product_id;
                }
                $goiDV = CardClass::getGoiDV($hdct->product_id);
            }
            
            if($hd->id == $idActive) {
                $keyActive = $key;
            }
            
            $goiDichVu = [];
            $khachHangData = [];
            if(!empty($hd->users_id)) {
                $goiDichVu = CardClass::getGoiDV($hd->users_id);
                $khachHangData = UserService::khachHangInfo($hd->users_id);
            }

            $hoaDon[] = [
                'hoaDonId' => $hd->id,
                'hoa_don' => $hd,
                'hoaDonChiTiet' => $hoaDonChiTiet,
                'hoaDonChiTiet_ids' => $hoaDonChiTiet_ids,
                'productIDs' => $productIDs,
                'goiDV' => $goiDV,
                'goiDichVu' => $goiDichVu, 
                'khachHangData' => $khachHangData
            ];
        }

        if($keyActive == 0) {
            $keyActive = count($hoaDon) - 1;
        }
        // dd($hoaDon[$keyActive]);
        return [
            'hoa_don' => $hoaDon,
            'key_active' => $keyActive
        ];
    }

    public function addHoaDonChiTiet(Request $request) {
        
        $ids_active = $request->id_active;
        $hoaDonId = $request->hoaDonId;

        $hoaDon = HoaDon::find($hoaDonId);
        $hoaDon->users_id = !empty($request->khach_hang_id) ? $request->khach_hang_id : 0;
        // $hoaDon->code = '';

        $hoaDonChiTiet = $this->getHoaDonChiTiet($hoaDonId);
        $id_old = [];

        // xóa các data ko nằm trong danh sách chọn
        foreach($hoaDonChiTiet as $detail) {
            if(!empty($detail->card_id)) {
                continue;
            }
            if(!in_array($detail->product_id, $ids_active)) {
                // xoa nv thuc hien/tu van
                NhanVienThucHien::where('chung_tu_chi_tiet_id', $detail->id)->delete();
                NhanVienTuVan::where('chung_tu_chi_tiet_id', $detail->id)->delete();
                // xoa don hang
                $detail->delete();
                continue;
            }
            $id_old[] = $detail->product_id;
        }

        // insert data vào danh sách chọn nếu ko có
        $dvTrongGoi = [];
        foreach($ids_active as $index => $id) {
            if(!in_array($id, $id_old)) {
                $product = Product::find($id);

                $hDonChiTiet = new HoaDonChiTiet();
                $hDonChiTiet->data_id = $hoaDonId;
                $hDonChiTiet->data_code = $hoaDon->code;

                $hDonChiTiet->product_id = $id;
                $hDonChiTiet->product_code = $product->code;
                $hDonChiTiet->product_name = $product->name;

                
                $hDonChiTiet->so_luong = 1;
                $hDonChiTiet->don_gia = $product->gia_ban;
                $hDonChiTiet->thanh_tien = $product->gia_ban;
                $hDonChiTiet->chiet_khau_money = 0;
                $hDonChiTiet->chiet_khau_persen = 0;
                // set tam vat = 0
                $hDonChiTiet->vat_money = 0;
                $hDonChiTiet->save();

                if($product->product_type_id == 3) {
                    $dvTrongGoi[$product->id] = CardClass::getGoiDV($product->id);
                }

                continue;
            }
        }

        // cập nhật lại danh sách hđơn chi tiết
        $hoaDon = $this->updateHoaDonInfo($request->hoaDonId);

        // get lại danh sách và trả về kết quả
        $hoaDonChiTiet = $this->getHoaDonChiTiet($request->hoaDonId);

        // get lại danh sách và trả về kết quả

        $hoaDons = $this->hoaDonChoThanhToan($hoaDon->id);
        

        return $this->sendSuccessResponse([
            'hoaDon' => $hoaDon, 
            'hoaDons' => $hoaDons['hoa_don'], 
            'hoaDonChiTiet' => $hoaDonChiTiet,
            'dvTrongGoi' => $dvTrongGoi
        ]);
        

        // return $this->sendSuccessResponse(['hoaDon' => $hoaDon, 'hoaDonChiTiet' => $hoaDonChiTiet]);
    }

    
    public function addHoaDonChiTiet_truThe01(Request $request) {
        $hoaDonId = $request->hoa_don_id;
        $so_luong_service = $request->so_luong_service;
        if(empty($so_luong_service)) {
            return '';
        }
        $hoaDon = HoaDon::find($hoaDonId);
        foreach($so_luong_service as $sl) {
            $cardService = CardService::find($sl['card_service_id']);
            if($cardService->so_luong_con_lai < $sl['so_luong']) {
                return '';
            }
            $cardService->so_luong_da_su_dung += $sl['so_luong'];
            $cardService->save();
            // $card = Card::find($cardService->data_id);

            $product = Product::find($cardService->product_id);
            $count = HoaDonChiTiet::where('data_id', $hoaDonId)->count();

            for($i=1; $i<=$sl['so_luong']; $i++) {
                $count++;
                $hDonChiTiet = new HoaDonChiTiet();
                $hDonChiTiet->data_id = $hoaDonId;
                $hDonChiTiet->data_code = $hoaDon->code;
                $hDonChiTiet->product_id = $product->id;
                $hDonChiTiet->SoThuTu = $count;
                $hDonChiTiet->so_luong = 1;
                $hDonChiTiet->don_gia = 0;
                $hDonChiTiet->thanh_tien = 0;
                $hDonChiTiet->chiet_khau_money = 0;
                $hDonChiTiet->chiet_khau_persen = 0;

                $hDonChiTiet->card_id = $cardService->data_id;
                $hDonChiTiet->card_service_id = $cardService->id;

                // set tam vat = 0
                $hDonChiTiet->vat_money = 0;
                $hDonChiTiet->save();
            }
        }

        // cập nhật lại danh sách hđơn chi tiết
        $hoaDon = $this->updateHoaDonInfo($hoaDonId);
        $hoaDonChiTiet = $this->getHoaDonChiTiet($hoaDonId);
        $goiDichVu = CardClass::getGoiDV($hoaDon->users_id);
        
        $hoaDons = $this->hoaDonChoThanhToan($hoaDon->id);
        return $this->sendSuccessResponse([
            'hoaDon' => $hoaDon, 
            'hoaDons' => $hoaDons['hoa_don'], 
            'hoaDonChiTiet' => $hoaDonChiTiet,
            'goiDichVu' => $goiDichVu
        ]);
        

        // return $this->sendSuccessResponse(['hoaDon' => $hoaDon, 'hoaDonChiTiet' => $hoaDonChiTiet]);
    }

    public function addHoaDonChiTiet_truThe(Request $request) {
        // dd($request->all());
        
        if(empty($request->hoa_don_id)) {
            return $this->sendErrorResponse('Hóa đơn này đã bị xóa hoặc không tồn tại');
        }
        if(empty($request->card_data)) {
            return $this->sendErrorResponse('Không tìm thấy thông tin thẻ');
        }
        $hoaDon = HoaDon::find($request->hoa_don_id);
        // check validation service
        foreach($request->card_data as $data) {
            $soLuong = 0;
            foreach($data['cardService'] as $service) {
                if(!empty($service['so_luong_tmp'])) {
                    $soLuong += $service['so_luong_tmp'];
                }
            }

            // Nếu số lượng vượt quá cho phép thì return luôn
            if($soLuong > $data['card']['so_luong_con_lai']) {
                
                return $this->sendErrorResponse('Số lượng được chọn nhiều hơn số lượng đã mua');
            }
        }

        // update
        foreach($request->card_data as $data) {

            // update
            $soLuong = 0;
            
            foreach($data['cardService'] as $service) {
                if(empty($service['so_luong_tmp'])) {
                    continue;
                }

                // check so luong
                $soLuong += $service['so_luong_tmp'];
                
                // save hoa don chi tiet
                $hDonChiTiet = new HoaDonChiTiet();
                $hDonChiTiet->data_id = $request->hoa_don_id;
                $hDonChiTiet->data_code = $hoaDon->code;
                $hDonChiTiet->product_id = $service['product_id'];
                $hDonChiTiet->so_luong = $service['so_luong_tmp'];
                $hDonChiTiet->don_gia = 0;
                $hDonChiTiet->thanh_tien = 0;
                $hDonChiTiet->chiet_khau_money = 0;
                $hDonChiTiet->chiet_khau_persen = 0;

                $hDonChiTiet->card_id = $data['card']['card_id'];
                $hDonChiTiet->card_service_id = $service['card_service_id'];
                // set tạm vat = 0
                $hDonChiTiet->vat_money = 0;
                $hDonChiTiet->save();

                 // update card service
                $cardService = CardService::find($service['card_service_id']);
                $cardService->so_luong_da_su_dung += $service['so_luong'];
                $cardService->save();
            }

            // update card
            $card = Card::find($data['card']['card_id']);
            $card->so_luong_da_su_dung += $soLuong;
            $card->so_luong_con_lai = $card->so_luong - $card->so_luong_da_su_dung;
            $card->save();

           
        }

        // cập nhật lại danh sách hđơn chi tiết
        $hoaDon = $this->updateHoaDonInfo($request->hoa_don_id);
        $hoaDonChiTiet = $this->getHoaDonChiTiet($request->hoa_don_id);
        $goiDichVu = CardClass::getGoiDV($hoaDon->users_id);
        
        $hoaDons = $this->hoaDonChoThanhToan($hoaDon->id);
        return $this->sendSuccessResponse([
            'hoaDons' => $hoaDons['hoa_don'], 
            'hoaDonChiTiet' => $hoaDonChiTiet,
            'goiDichVu' => $goiDichVu
        ]);
        

        // return $this->sendSuccessResponse(['hoaDon' => $hoaDon, 'hoaDonChiTiet' => $hoaDonChiTiet]);
    }

    public function updateCustomer(Request $request) {

        if(empty($request->khach_hang) && empty($request->hoaDonId)) {
            return [];
        }

        // cập nhật lại hóa đơn
        $hoaDon = HoaDon::find($request->hoaDonId);
        $hoaDon->users_id = $request->khach_hang;
        $hoaDon->save();

        // XÓA gói dv
        $hoaDonChiTiet = HoaDonChiTiet::getByHoaDonId($hoaDon->id);
        foreach($hoaDonChiTiet as $hd) {
            if(empty($hd->card_id)) {
                continue;
            }

            // xoa nv thuc hien
            NhanVienThucHien::select('nhan_vien_thuc_hien.*', 'admin_users.name as ten_nv', 'admin_users.code as ma_nv')
                ->where('nhan_vien_thuc_hien.loai_chung_tu', 'hoa_don') // 8: hdon ban le
                ->where('nhan_vien_thuc_hien.chung_tu_chi_tiet_id', $hd->id)
                ->delete();

            // xoa nv tu van
            NhanVienTuVan::select('nhan_vien_tu_van.*', 'admin_users.name as ten_nv', 'admin_users.code as ma_nv')
                ->where('nhan_vien_tu_van.loai_chung_tu', 'hoa_don') // 8: hdon ban le
                ->where('nhan_vien_tu_van.chung_tu_chi_tiet_id', $hd->id)
                ->delete();
            
            // update lại số lượng card về như cũ
            $card = Card::find($hd->card_id);
            $card->so_luong_da_su_dung -= $hd->so_luong;
            $card->so_luong_con_lai = $card->so_luong - $card->so_luong_da_su_dung;
            $card->save();

            // update lại số lượng card detail về như cũ
            $cardService = CardService::find($hd->card_service_id);
            $cardService->so_luong_da_su_dung -= $hd['so_luong'];
            $cardService->save();

            // xoa gói trong hdon
            $hd->delete();

        }


        $hoaDonChiTiet = $this->getHoaDonChiTiet($hoaDon->id);
        $hoaDonChoThanhToan = $this->hoaDonChoThanhToan($hoaDon->id);
        return $this->sendSuccessResponse([
            'hoaDons' => $hoaDonChoThanhToan['hoa_don'], 
        ]);
    }

    private function saveCard_VIP($hdonChiTiet, $product, $user) {
        $date = date('Y-m-d');
        $card = new Card();
        $card->name = $product->name;
        $card->product_id = $product->id;
        $card->hoa_don_chi_tiet_id = $hdonChiTiet->id;
        $card->users_id = $user->id;
        $card->menh_gia_the = $product->gia_ban;
        $card->so_luong = $hdonChiTiet->so_luong;
        $card->thanh_tien = $product->gia_ban * $hdonChiTiet->so_luong;

        $card-> card_group_id= config('constant.card_group.the_gia_tri'); // the vip:1 ; thẻ dv: 2
        $card->ngay_mua = $date;
        $card->ngay_ap_dung = $date;
        if($product->han_su_dung == 2 && !empty($product->hsd_ngay_cu_the)) {
            $card->ngay_het_han = $product->hsd_ngay_cu_the;
        }
        // $product->hsd_khoang_thoi_gian
        if($product->han_su_dung == 3 && !empty($product->hsd_khoang_thoi_gian) && !empty($product->hsd_khoang_thoi_gian_don_vi)) {
            // Xử lý cộng số ngày tương ứng
            $donVi = $product->hsd_khoang_thoi_gian_don_vi;
            $donVi_arr= [
                'Ngày' => 'day',
                'Tuần' => 'week',
                'Tháng' => 'month',
                'Năm' => 'year',
            ];
            $newdate = strtotime ( '+'.$product->hsd_khoang_thoi_gian.' ' .$donVi_arr[$donVi] , strtotime ( $date ) ) ;
            $newdate = date ( 'Y-m-d' , $newdate );
            $card->ngay_het_han = $newdate;
        }
        $card->save();
        $card->code = 'GT-' . TblService::formatNumberByLength($card->id);
        $card->save();
        

        $user->tong_tien_da_nap += $card->menh_gia_the;
        $user->tien_con_lai = intval($user->tong_tien_da_nap) - intval($user->tien_da_su_dung);
        $user->save();
    }

    private function saveCard_LT($hdonChiTiet, $product, $user) {
        $date = date('Y-m-d');
        $card = new Card();
        $card->name = $product->name;
        $card->product_id = $product->id;
        $card->card_group_id = config('constant.card_group.the_lieu_trinh'); // the vip:1 ; thẻ dv: 2
        $card->ngay_mua = $date;
        $card->ngay_ap_dung = $date;
        $card->so_luong = $hdonChiTiet->so_luong;
        $card->so_luong_con_lai = $hdonChiTiet->so_luong;
        $card->users_id = $user->id;

        if($product->han_su_dung == 2 && !empty($product->hsd_ngay_cu_the)) {
            $card->ngay_het_han = $product->hsd_ngay_cu_the;
        }

        // $product->hsd_khoang_thoi_gian
        if($product->han_su_dung == 3 && !empty($product->hsd_khoang_thoi_gian) && !empty($product->hsd_khoang_thoi_gian_don_vi)) {
            // Xử lý cộng số ngày tương ứng
            $donVi = $product->hsd_khoang_thoi_gian_don_vi;
            $donVi_arr= [
                'Ngày' => 'day',
                'Tuần' => 'week',
                'Tháng' => 'month',
                'Năm' => 'year',
            ];
            $newdate = strtotime ( '+'.$product->hsd_khoang_thoi_gian.' ' .$donVi_arr[$donVi] , strtotime ( $date ) ) ;
            $newdate = date ( 'Y-m-d' , $newdate );
            $card->ngay_het_han = $newdate;
        }
        $card->save();
        $card->code = 'LT-' . TblService::formatNumberByLength($card->id);
        $card->save();

        $dvTrongGoi = DB::table('product_dich_vu_trong_goi')
            ->where('product_id', $product->id)
            ->get();

        if(!empty($dvTrongGoi)) {
            foreach($dvTrongGoi as $dv) {
                $soluong = $dv->so_luong * $hdonChiTiet->so_luong;
                $cardService = new CardService();
                $cardService->product_id = $dv->id_dich_vu_ap_dung;
                $cardService->so_luong = $soluong;
                $cardService->so_luong_con_lai = $soluong;
                $cardService->so_luong_da_su_dung = 0;
                $cardService->khach_hang_id = $hdonChiTiet->khach_hang_id;
                $cardService->don_gia = $product->gia_ban;
                $cardService->data_id = $card->id;
                $cardService->save();
            }
        }
    }

    public function update_SL_SP(Request $request) {
        if(empty($request->hdon_chitiet_id) && empty($request->hoaDonId)) {
            return [];
        }

        // update hdon chi tiet
        $hdonChiTiet = HoaDonChiTiet::find($request->hdon_chitiet_id);
        $hdonChiTiet->so_luong = $request->so_luong;
        $hdonChiTiet->thanh_tien = $request->so_luong * $hdonChiTiet->don_gia;
        // set tam vat = 0
        // $hdonChiTiet->vat_money = $hdonChiTiet->thanh_tien;
        $hdonChiTiet->save();

        $hoaDon = $this->updateHoaDonInfo($request->hoaDonId);

        // get lại danh sách và trả về kết quả
        $hoaDonChiTiet = $this->getHoaDonChiTiet($request->hoaDonId);

        return $this->sendSuccessResponse(['hoaDon' => $hoaDon, 'hoaDonChiTiet' => $hoaDonChiTiet]);
        
    }

    private function updateHoaDonInfo($hoaDonId) {
        $tongTienHang = 0;
        $tongChiPhi = 0;
        $ckNVTuVan = 0;
        $ckNVThucHien = 0;
        $hoaDonChiTiet = HoaDonChiTiet::getByHoaDonId($hoaDonId);
        foreach($hoaDonChiTiet as $detail) {
            // tính tổng và lưu vào hóa đơn
            $thanh_tien = $detail->so_luong * $detail->product_price;
            $tienThucTe = $detail->so_luong * $detail->product_price;// dùng để tính ck, do nếu là trừ thẻ thì tổng = 0
            if($detail->card_id > 0) {
                $thanh_tien = 0;
            }
            $detail->thanh_tien = $thanh_tien;
            $detail->save();

            // update lại tiền chiết khấu nv tu van
            $nvTuVan = NhanVienTuVan::where('loai_chung_tu', 'hoa_don')
                ->where('chung_tu_chi_tiet_id', $detail->id)
                ->get();
            foreach($nvTuVan as $nv) {
                if($nv->LaPhanTram == 1) {
                    $nv->TienChietKhau = $nv->phan_tram_chiet_khau  * $tienThucTe / 100;
                    $nv->save();
                    continue;
                }
                $phanTramCK = $nv->TienChietKhau * 100 / $tienThucTe;
                $nv->phan_tram_chiet_khau = round($phanTramCK, 2);;
                $nv->save();
            }
            
            // update ck nv thuc hien
            $nvThucHien = NhanVienThucHien::where('loai_chung_tu', 'hoa_don')->where('chung_tu_chi_tiet_id', $detail->id)->get();
            foreach($nvThucHien as $nv) {
                if($nv->LaPhanTram == 1) {
                    $nv->TienChietKhau = $nv->phan_tram_chiet_khau  * $tienThucTe / 100;
                    $nv->save();
                    continue;
                }
                $phanTramCK = $nv->TienChietKhau * 100 / $tienThucTe;
                $nv->phan_tram_chiet_khau = round($phanTramCK, 2);;
                $nv->save();

            }

            $tongTienHang += $thanh_tien;
            $tongChiPhi += $thanh_tien + $detail->vat_money;
            $ckNVThucHien += $detail->chiet_khau_nv_thuc_hien;
            $ckNVTuVan += $detail->chiet_khau_nv_tu_van;
        }
        // update hoa don
        $hoaDon = HoaDon::find($hoaDonId);
        $hoaDon->TongTienHang = $tongTienHang;
        // $hoaDon->don_gia = 0;
        $hoaDon->TongTienThue = 0;
        $hoaDon->TongChiPhi = $tongChiPhi;

        $hoaDon->thanh_toan = $tongChiPhi;

        $hoaDon->chiet_khau_nv_thuc_hien = $ckNVThucHien;
        $hoaDon->chiet_khau_nv_tu_van = $ckNVTuVan;
        $hoaDon->TongChietKhau = $ckNVThucHien + $ckNVTuVan;
        $hoaDon->save();
        return $hoaDon;
    }

    public function hoaDon_updateNVTuVan(Request $request) {
        $nvIds = $request->user_ids;
        $hdonChiTiet = HoaDonChiTiet::find($request->hoa_don_chi_tiet_id);
        $product = Product::find($hdonChiTiet->product_id);
        $nvTuVan = NhanVienTuVan::where('loai_chung_tu', 'hoa_don') // 8: hdon ban le
            ->where('chung_tu_chi_tiet_id', $hdonChiTiet->id)
            ->get();
        $ck_percen = 0;
        $ck_money = 0;
        if($product->is_ck_nv_tu_van_percen == 1) {
            $ck_percen = $product->ck_nv_tu_van;
            $ck_money = $ck_percen * $hdonChiTiet->thanh_tien / 100;
        }

        if($product->is_ck_nv_tu_van_percen != 1) {
            $ck_money = $product->ck_nv_tu_van * $hdonChiTiet->so_luong;
            $ck_percen = $ck_money * 100 / $hdonChiTiet->thanh_tien;
        }

        // thêm user nếu chưa có
        $NhanVienId_old = []; 
        foreach($nvTuVan as $nv) {

            // xử lý xóa nếu ko nằm trong danh sách nv mới nhất
            if(!in_array($nv->nhan_vien_id, $nvIds)) {
                $nv->delete();
                continue;
            }
            $NhanVienId_old[] = $nv->nhan_vien_id;
        }

        // check, nếu id chưa có trong danh sách id nv cũ thì thêm mới
        foreach($nvIds as $id) {
            if(!in_array($id, $NhanVienId_old)) {
                $nvth = new NhanVienTuVan();
                $nvth->name = 'Hóa đơn bán lẻ';
                $nvth->nhan_vien_id = $id;
                $nvth->loai_chung_tu = 'hoa_don';
                $nvth->chung_tu_id = $hdonChiTiet->data_id;
                $nvth->chung_tu_chi_tiet_id = $hdonChiTiet->id;
                $nvth->TienChietKhau = $ck_money;
                $nvth->phan_tram_chiet_khau = $ck_percen;
                $nvth->LaPhanTram = $product->is_ck_nv_tu_van_percen;
                $nvth->save();
            }
        }

        $hoaDon = HoaDon::find($hdonChiTiet->data_id);
        $hoaDonChiTiet = $this->getHoaDonChiTiet($hdonChiTiet->data_id);
        $hoaDonChoThanhToan = $this->hoaDonChoThanhToan($hoaDon->id);
        return $this->sendSuccessResponse([
            'hoaDon' => $hoaDon, 
            'hoaDons' => $hoaDonChoThanhToan['hoa_don'], 
            'hoaDonChiTiet' => $hoaDonChiTiet
        ]);
    }

    /** Request
        id:id, 
        value:value, 
        is_percen:vnd: 0; %: 1, 
        table:table update, 
     */
    public function hoaDon_updateCK(Request $rq) {
        if($rq->table == 'nhan_vien_tu_van') {
            $data = NhanVienTuVan::find($rq->id);
            $hdonChiTiet = HoaDonChiTiet::find($data->chung_tu_chi_tiet_id);
        } else {
            $data = NhanVienThucHien::find($rq->id);
            $hdonChiTiet = HoaDonChiTiet::find($data->chung_tu_chi_tiet_id);
        }
        $value = intval($rq->value);

        // ck %
        $data->LaPhanTram = $rq->is_percen;
        if($rq->is_percen == 1) {// %
            $data->phan_tram_chiet_khau = $value;
            $data->TienChietKhau = $value * $hdonChiTiet->thanh_tien / 100;
            
        } else { // vnd
            $data->TienChietKhau = $value;
            $data->phan_tram_chiet_khau = $value * 100 / $hdonChiTiet->thanh_tien;
        }
        $data->save();
        

        $hoaDon = HoaDon::find($hdonChiTiet->data_id);
        $hoaDonChiTiet = $this->getHoaDonChiTiet($hdonChiTiet->data_id);
        $hoaDonChoThanhToan = $this->hoaDonChoThanhToan($hoaDon->id);
        return $this->sendSuccessResponse([
            'hoaDon' => $hoaDon, 
            'hoaDons' => $hoaDonChoThanhToan['hoa_don'], 
            'hoaDonChiTiet' => $hoaDonChiTiet
        ]);
    }

    public function hoaDon_updateNVThucHien(Request $request) {
        $nvIds = $request->user_ids;
        $hdonChiTiet = HoaDonChiTiet::find($request->hoa_don_chi_tiet_id);
        $nvThucHien = NhanVienThucHien::where('loai_chung_tu', 'hoa_don') 
            ->where('chung_tu_chi_tiet_id', $hdonChiTiet->id)
            ->get();
        
        $product = Product::find($hdonChiTiet->product_id);

        // tính tiền ck
        $ck_percen = 0;
        $ck_money = 0;
        if($product->is_ck_nv_cham_soc_percen == 1) {
            $ck_percen = $product->ck_nv_cham_soc;
            $ck_money = $ck_percen * $hdonChiTiet->thanh_tien / 100;
        }

        if($product->is_ck_nv_cham_soc_percen != 1) {
            $ck_money = $product->ck_nv_cham_soc * $hdonChiTiet->so_luong;
            $ck_percen = $ck_money * 100 / $hdonChiTiet->thanh_tien;
        }

        // thêm user nếu chưa có
        $NhanVienId_old = []; 
        foreach($nvThucHien as $nv) {

            // xử lý xóa nếu ko nằm trong danh sách nv mới nhất
            if(!in_array($nv->nhan_vien_id, $nvIds)) {
                $nv->delete();
                continue;
            }
            $NhanVienId_old[] = $nv->nhan_vien_id;
        }

        // check, nếu id chưa có trong danh sách id nv cũ thì thêm mới
        foreach($nvIds as $id) {
            if(!in_array($id, $NhanVienId_old)) {
                $nvth = new NhanVienThucHien();
                $nvth->name = 'Hóa đơn bán lẻ';
                $nvth->nhan_vien_id = $id;
                $nvth->loai_chung_tu = 'hoa_don';
                $nvth->ma_chung_tu = $hdonChiTiet->data_id;
                $nvth->chung_tu_chi_tiet_id = $hdonChiTiet->id;
                $nvth->chung_tu_id = $hdonChiTiet->data_id;
                $nvth->TienChietKhau = $ck_money;
                $nvth->phan_tram_chiet_khau = $ck_percen;
                $nvth->LaPhanTram = $product->is_ck_nv_cham_soc_percen;
                $nvth->save();
            }
        }

        $hoaDon = HoaDon::find($hdonChiTiet->data_id);
        $hoaDonChiTiet = $this->getHoaDonChiTiet($hdonChiTiet->data_id);
        $hoaDonChoThanhToan = $this->hoaDonChoThanhToan($hoaDon->id);

        return $this->sendSuccessResponse([
            'hoaDon' => $hoaDon, 
            'hoaDons' => $hoaDonChoThanhToan['hoa_don'], 
            'hoaDonChiTiet' => $hoaDonChiTiet
        ]);
    }

    // Request: percen, hoa_don_chi_tiet_id, nv_thuc_hien_id
    public function hoaDon_update_percen_NVThucHien(Request $request) {
        // get hdon chi tiet
        $hdonChiTiet = HoaDonChiTiet::find($request->hoa_don_chi_tiet_id);

        // get and save nv thực hiện
        $nvThucHien = NhanVienThucHien::find($request->nv_id);
        $nvThucHien->LaPhanTram = 1;
        $nvThucHien->phan_tram_chiet_khau = $request->percen;
        $nvThucHien->TienChietKhau = $request->percen * $hdonChiTiet->thanh_tien / 100;
        $nvThucHien->save();

        // update chiết khấu ở phần hóa đơn chi tiết sẽ được lưu ở bước thanh toán cuối cùng.

        // get data
        $hoaDon = HoaDon::find($hdonChiTiet->data_id);
        $hoaDonChiTiet = $this->getHoaDonChiTiet($hdonChiTiet->data_id);

        return $this->sendSuccessResponse([
            'hoaDon' => $hoaDon, 
            'hoaDonChiTiet' => $hoaDonChiTiet
        ]);
    }

    // Request: money, hoa_don_chi_tiet_id, nv_thuc_hien_id
    public function hoaDon_update_money_NVThucHien(Request $request) {
        // get hdon chi tiet
        $hdonChiTiet = HoaDonChiTiet::find($request->hoa_don_chi_tiet_id);
        // get and save nv thực hiện
        $nvThucHien = NhanVienThucHien::find($request->nv_id);
        $nvThucHien->LaPhanTram = 0;
        $nvThucHien->TienChietKhau = $request->money;
        $phanTram = $request->money * 100 / $hdonChiTiet->thanh_tien;

        $nvThucHien->phan_tram_chiet_khau = round($phanTram, 2);
        $nvThucHien->save();

        // update chiết khấu ở phần hóa đơn chi tiết sẽ được lưu ở bước thanh toán cuối cùng.
        
        // get data
        $hoaDon = HoaDon::find($hdonChiTiet->data_id);
        $hoaDonChiTiet = $this->getHoaDonChiTiet($hdonChiTiet->data_id);

        return $this->sendSuccessResponse([
            'hoaDon' => $hoaDon, 
            'hoaDonChiTiet' => $hoaDonChiTiet
        ]);
    }

    public function hoaDon_update_money_NVTuVan(Request $request) {
        // get hdon chi tiet
        $hdonChiTiet = HoaDonChiTiet::find($request->hoa_don_chi_tiet_id);

        // get and save nv thực hiện
        $nv = NhanVienTuVan::find($request->nv_id);
        $nv->TienChietKhau = $request->money;
        $nv->LaPhanTram = 0;
        $phanTram = $request->money * 100 / $hdonChiTiet->thanh_tien;
        $nv->phan_tram_chiet_khau = round($phanTram, 2);
        $nv->save();

        // update chiết khấu ở phần hóa đơn chi tiết sẽ được lưu ở bước thanh toán cuối cùng.
        
        // get data
        $hoaDon = HoaDon::find($hdonChiTiet->data_id);
        $hoaDonChiTiet = $this->getHoaDonChiTiet($hdonChiTiet->data_id);

        return $this->sendSuccessResponse([
            'hoaDon' => $hoaDon, 
            'hoaDonChiTiet' => $hoaDonChiTiet
        ]);
    }

    public function hoaDon_update_percen_NVTuVan(Request $request) {
        // get hdon chi tiet
        $hdonChiTiet = HoaDonChiTiet::find($request->hoa_don_chi_tiet_id);

        // get and save nv thực hiện
        $nv = NhanVienTuVan::find($request->nv_id);
        $nv->phan_tram_chiet_khau = $request->percen;
        $nv->LaPhanTram = 1;
        $nv->TienChietKhau = $request->percen * $hdonChiTiet->thanh_tien / 100;
        $nv->save();

        // update chiết khấu ở phần hóa đơn chi tiết sẽ được lưu ở bước thanh toán cuối cùng.

        // get data
        $hoaDon = HoaDon::find($hdonChiTiet->data_id);
        $hoaDonChiTiet = $this->getHoaDonChiTiet($hdonChiTiet->data_id);

        return $this->sendSuccessResponse([
            'hoaDon' => $hoaDon, 
            'hoaDonChiTiet' => $hoaDonChiTiet
        ]);
    }

    public function hoaDon_update_chiNhanh(Request $rq) {
        $hoaDon = HoaDon::find($rq->hoa_don_id);
        $hoaDon->chi_nhanh_id = $rq->chi_nhanh;
        $hoaDon->save();
        return $this->sendSuccessResponse([]);
    }

    private function getHoaDonChiTiet($hoaDonId) {
        $hdonChiTiet = HoaDonChiTiet::getByHoaDonId($hoaDonId);
        
        $hdon = [];
        foreach($hdonChiTiet as $hd) {
            $item = $hd;

            // get nv thuc hiện
            $item['nv_thuc_hien'] = NhanVienThucHien::select('nhan_vien_thuc_hien.*', 'admin_users.name as ten_nv', 'admin_users.code as ma_nv')
                ->where('nhan_vien_thuc_hien.loai_chung_tu', 'hoa_don') // 8: hdon ban le
                ->where('nhan_vien_thuc_hien.chung_tu_chi_tiet_id', $hd->id)
                ->leftJoin('admin_users', 'admin_users.id', 'nhan_vien_thuc_hien.nhan_vien_id')
                ->get();

            // get nv thuc hiện ids
            $nvthuchien_ids = [];
            foreach($item['nv_thuc_hien'] as $nvth) {
                $nvthuchien_ids[] = $nvth->nhan_vien_id;
            }
            $item['nv_thuc_hien_ids'] = $nvthuchien_ids;

            // get nv tu van
            $item['nv_tu_van'] = NhanVienTuVan::select('nhan_vien_tu_van.*', 'admin_users.name as ten_nv', 'admin_users.code as ma_nv')
                ->where('nhan_vien_tu_van.loai_chung_tu', 'hoa_don') // 8: hdon ban le
                ->where('nhan_vien_tu_van.chung_tu_chi_tiet_id', $hd->id)
                ->leftJoin('admin_users', 'admin_users.id', 'nhan_vien_tu_van.nhan_vien_id')
                ->get();
            
            // get nv tu van ids
            $nvtuvan_ids = [];
            foreach($item['nv_tu_van'] as $nvtv) {
                $nvtuvan_ids[] = $nvtv->nhan_vien_id;
            }
            $item['nv_tu_van_ids'] = $nvtuvan_ids;

            $hdon[] = $item;
        }

        return $hdon;
    }

    public function hDonBanLe_choThanhToan(Request $request) {
        
        $tables = TblService::getAdminMenu(0);
        $table = Table::find(239);

        $columns = [
            [
                'title' => 'STT',
                'dataIndex' => 'id',
                'key' => 'id',
            ],
            [
                'title' => 'Hóa đơn',
                'dataIndex' => 'hoa_don',
                'key' => 'hoa_don',
            ],
            [
                'title' => 'Khách hàng',
                'dataIndex' => 'khach_hang',
                'key' => 'khach_hang',
            ],
            [
                'title' => 'Thẻ',
                'dataIndex' => 'card',
                'key' => 'card',
            ],
            [
                'title' => 'Thành tiền',
                'dataIndex' => 'thanh_tien',
                'key' => 'thanh_tien',
            ],
            [
                'title' => 'Chi tiết đơn hàng',
                'dataIndex' => 'chi_tiet_don_hang',
                'key' => 'chi_tiet_don_hang',
            ],
            [
                'title' => 'Ghi chú',
                'dataIndex' => 'note',
                'key' => 'note',
            ],
        ];

        $hoaDon = [];
        $datas = HoaDon::select(
                'hoa_don.*',
                'users.name as ten_khach_hang',
                'users.code as ma_khach_hang',
                'users.phone as phone',
                'users.phone02 as phone02',
                'users.customer_group_id as customer_group_id',
                'chi_nhanh.name as chi_nhanh',
                'admin_users.name as nguoi_tao',
            )
            ->where('hoa_don.is_draft',1) //2: lưu nháp
            ->leftJoin('users', 'users.id', 'hoa_don.users_id')
            ->leftJoin('admin_users', 'admin_users.id', 'hoa_don.create_by')
            ->leftJoin('chi_nhanh', 'chi_nhanh.id', 'hoa_don.chi_nhanh_id')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $hd = new HoaDon;
        $fillable = $hd->getFillable();
        foreach($datas as $key => $data) {
            $hoaDon_item = [];
            foreach($fillable as $f) {
                $hoaDon_item[$f] = $data->{$f};
            }
            $hoaDon_item['chi_nhanh'] = $data->chi_nhanh;
            $hoaDon_item['nguoi_tao'] = $data->nguoi_tao;

            $hoaDon_item['key'] = $data->id;
            $hoaDon_item['customer_group_id'] = $data->customer_group_id;
            $hoaDon_item['ten_khach_hang'] = $data->ten_khach_hang;
            
            // 'card_tl' =>  CastsCardTL::class,
            
            $hoaDon_item['card_tl_info'] = HimalayaService::cardLTInfo($data->card_tl);
            
            // // 'card_gt' => CastsCardGT::class,
            
            // $hoaDon_item['card_gt_info'] = HimalayaService::cardLTInfo($data->card_gt);

            // // 'id' => CastsHoaDonChiTiet::class,
            $hoaDon_item['hoa_don_chi_tiet'] = HimalayaService::hoaDonChiTiet($data->id);

            // 'users_id' =>  CastsUsers::class,
            $customerGroup = DB::table('customer_group')->where('id', $data->customer_group_id)->first();
            $hoaDon_item['customer_group'] = !empty($customerGroup) ? $customerGroup->name : '';
            
            $hoaDon[] = $hoaDon_item;
        }

        $pageConfig = [
            'currentPage' => $datas->currentPage(),
            'perPage' => $datas->perPage(),
            'total' => $datas->total(),
            'lastPage' => $datas->lastPage(),
            'count' => count($hoaDon),
        ];

        $viewData = [
            'tables' => $tables,
            'table' => $table,
            'columns' => $columns,
            'hoaDon' => $hoaDon,
            'request' => $_GET,
            'pageConfig' => $pageConfig,
        ];

        return Inertia::render('Admin/Himalaya/list_hoa_don_ban_le', $viewData);
    }

    public function deleteHoaDon(Request $rq)
    {
        if (empty($rq->hoa_don_id)) {
            return $this->sendErrorResponse('ID is empty', $errors = null, 400);
        }
        
        HimalayaService::deleteHoaDon($rq->hoa_don_id);

        $hoaDonChoThanhToan = $this->hoaDonChoThanhToan($rq->hoa_don_id_active);

        return $this->sendSuccessResponse([
            'hoaDons' => $hoaDonChoThanhToan['hoa_don'],
            'key_active' => $hoaDonChoThanhToan['key_active']
        ]);
    }

    public function deleteHoaDonDraft(Request $rq)
    {
        if (empty($rq->hoa_don_id)) {
            return $this->sendErrorResponse('ID is empty', $errors = null, 400);
        }
        
        HoaDonService::deleteHoaDon($rq->hoa_don_id);

        // nếu id cũ khác id đang active, thì get lại list hóa đơn, active vẫn là id cũ
        if($rq->hoa_don_id_active != $rq->hoa_don_id) {
            $hoaDonChoThanhToan = $this->hoaDonChoThanhToan($rq->hoa_don_id_active);
        } else {
            // nếu id cũ = id đang active, thì get lại list hóa đơn, chọn id ngẫu nhiên để active
            $hoaDonChoThanhToan = $this->hoaDonChoThanhToan();
        }

        return $this->sendSuccessResponse([
            'hoaDons' => $hoaDonChoThanhToan['hoa_don'],
            'key_active' => $hoaDonChoThanhToan['key_active']
        ]);
    }


    public function deletProduct(Request $request) {
        // get hdon chi tiet
        $hdonChiTiet = HoaDonChiTiet::find($request->hoa_don_chi_tiet_id);
        if(!empty($hdonChiTiet)) {
            // trả lại thông tin thẻ
            if(!empty($hdonChiTiet->card_id)) {
                $card = Card::find($hdonChiTiet->card_id);
                $card->so_luong_da_su_dung -= $hdonChiTiet->so_luong;
                $card->so_luong_con_lai = $card->so_luong - $card->so_luong_da_su_dung;
                $card->save(); 
            }   

            $hdonChiTiet->delete();
        }
        
        $hoaDon = HoaDon::find($request->hoaDonId);
        $hoaDonChiTiet = $this->getHoaDonChiTiet($hdonChiTiet->data_id);
        
        $goiDichVu = [];
        if(!empty($hoaDon->users_id)) {
            $goiDichVu = CardClass::getGoiDV($hoaDon->users_id);
        }

        return $this->sendSuccessResponse([
            'hoaDon' => $hoaDon, 
            'hoaDonChiTiet' => $hoaDonChiTiet,
            'goiDichVu' => $goiDichVu
        ]);
    }

    public function hoaDonChiTiet_byHoaDon(Request $rq) {
        if(empty($rq->id)) {
            return $this->sendErrorResponse('error');
        }

        $result = HoaDon::info($rq->id);
        
        return $this->sendSuccessResponse($result);
    }

    function print_hoaDon(Request $rq, $id) {
        $info  = DB::table('admin_config')->find(1);
        $data = HoaDon::baseQuery()->find($id);
        if(empty($data)) {
            return 'Hóa đơn đã bị xóa hoặc không tồn tại';
        }

        $nguoiTao = AdminUser::find(intval($data->create_by));

        $dataDetail = HoaDonChiTiet::getByHoaDonId($data->key);
        return view('admin.print.hoa_don', [
            'data' => $data,
            'dataDetail' => $dataDetail,
            'info' => $info,
            'nguoiTao' => $nguoiTao,
        ]);
    }

    public function huyHoaDon($id) {
        // update hdon
        $hoaDon = HoaDon::find($id);
        $hoaDon->is_recycle_bin = 1;
        $hoaDon->save();
        // update hdon chi tiet
        $hoaDonChiTiet = HoaDonChiTiet::where('data_id', $id)->get();
        foreach($hoaDonChiTiet as $detail) {
            // update SL san pham
            $product = Product::find($detail->product_id);
            $product->ton_kho += $detail->so_luong;
            $product->save();
        }
        $update = [
            'is_recycle_bin' => 1
        ];
        // update nhân viên thực hiên
        NhanVienThucHien::where('chung_tu_id', $hoaDon->id)->update($update);
        
        // update nv tư vấn
        NhanVienTuVan::where('chung_tu_id', $hoaDon->id)->update($update);

        // update sổ quỹ
        SoQuy::where('loai_chung_tu', 'hoa_don')->where('chung_tu_id', $hoaDon->id)->update($update);
        // update phiếu thu
        PhieuThu::where('loai_chung_tu', 'hoa_don')->where('chung_tu_id', $hoaDon->id)->update($update);
        
        return $this->sendSuccessResponse($id);
    }

    public function caInfo(Request $request) {
        $nhanVienThuNgan = $request->session()->get('nhan_vien_thu_ngan');
        $caInfo = HoaDonService::getCaInfo($nhanVienThuNgan);
        return $this->sendSuccessResponse($caInfo);
    }

    public function tatToanCongNo(Request $request) {
        $loaiChungTu = $request->loai_chung_tu;
        
        // update cong nợ
        $soTienNo = 0;
        $soTienDaThanhToan = 0;
        $thanhToan = $request->so_tien;
        $hinhThucTT = 0;
        if(!empty($request->hinh_thuc_thanh_toan_id)) {
            $hinhThucTT = $request->hinh_thuc_thanh_toan_id;
        }

        switch ($loaiChungTu) {
            case 'product_nhap_hang':
                // update phieu nhap hang
                $nhapHang = NhapHang::find($request->chung_tu_id);
                $soTienNo = $nhapHang->thanh_tien - $nhapHang->da_thanh_toan - $thanhToan;
                $soTienDaThanhToan = $nhapHang->da_thanh_toan + $thanhToan;
                $nhapHang->cong_no = $soTienNo;
                $nhapHang->da_thanh_toan += $thanhToan; 
                if($nhapHang->cong_no == 0) {
                    $nhapHang->cong_no_status_id = 1; // đã tất toán
                }

                if(!empty($hinhThucTT)) {
                    $nhapHang->hinh_thuc_thanh_toan_id = $hinhThucTT; // đã tất toán
                }
                $nhapHang->save();

                // update phieu chi
                $phieuChi = PhieuChi::savePhieuChi_NhapHang($request, $nhapHang);

                // update so quy
                $soQuy = SoQuy::saveSoQuy_NhapHang(-$thanhToan, $nhapHang);

                break;
            
            case 'product_khach_tra_hang':
                // update phieu nhap hang
                $khachTraHang = KhachTraHang::find($request->chung_tu_id);
                $soTienNo = $khachTraHang->thanh_tien - $khachTraHang->da_thanh_toan - $thanhToan;
                $soTienDaThanhToan = $khachTraHang->da_thanh_toan + $thanhToan;
                $khachTraHang->cong_no = $soTienNo;
                $khachTraHang->da_thanh_toan += $thanhToan; 
                if($khachTraHang->cong_no == 0) {
                    $khachTraHang->cong_no_status_id = 1; // đã tất toán                    
                }
                if(!empty($hinhThucTT)) {
                    $khachTraHang->hinh_thuc_thanh_toan_id = $hinhThucTT; // đã tất toán
                }
                $khachTraHang->save();

                // update phieu chi
                PhieuChi::savePhieuChi_KhachTraHang($thanhToan, $request, $khachTraHang);

                // update so quy
                SoQuy::saveSoQuy_KhachTraHang(-$thanhToan, $khachTraHang);

                break;

            case 'product_tra_hang_ncc':
                // update phieu tra hang
                $traHangNCC = TraHangNCC::find($request->chung_tu_id);
                $soTienNo = $traHangNCC->thanh_tien - $traHangNCC->da_thanh_toan - $thanhToan;
                $soTienDaThanhToan = $traHangNCC->da_thanh_toan + $thanhToan;
                $traHangNCC->cong_no = $soTienNo;
                $traHangNCC->da_thanh_toan += $thanhToan; 
                if($traHangNCC->cong_no == 0) {
                    $traHangNCC->cong_no_status_id = 1; // đã tất toán
                }
                if(!empty($hinhThucTT)) {
                    $traHangNCC->hinh_thuc_thanh_toan_id = $hinhThucTT; // đã tất toán
                }
                $traHangNCC->save();

                // update phieu chi
                
                PhieuChi::savePhieuChi_traHangNCC($thanhToan, $hinhThucTT, $traHangNCC);

                // update so quy
                SoQuy::saveSoQuy_TraHangNCC($thanhToan, $traHangNCC);

                break;
            
            case 'hoa_don':
                // update phieu tra hang
                $hoaDon = HoaDon::find($request->chung_tu_id);
                $soTienNo = $hoaDon->thanh_toan - $hoaDon->da_thanh_toan - $thanhToan;
                $soTienDaThanhToan = $hoaDon->da_thanh_toan + $thanhToan;
                $hoaDon->cong_no = $soTienNo;
                $hoaDon->da_thanh_toan = $soTienDaThanhToan; 
                if($hoaDon->cong_no == 0) {
                    $hoaDon->cong_no_status_id = 1; // đã tất toán
                }
                
                if(!empty($hinhThucTT)) {
                    $hoaDon->hinh_thuc_thanh_toan_id = $hinhThucTT; // đã tất toán
                }
                $hoaDon->save();

                // update phieu chi
                PhieuChi::savePhieuChi_hoaDon($thanhToan, $hinhThucTT, $hoaDon);

                // update so quy
                SoQuy::saveSoQuy_hoaDon($thanhToan, $hoaDon);

                break;

            default:
                # code...
                break;
        }
        
        // update công nợ
        $congNo = CongNo::where('loai_chung_tu', $request->loai_chung_tu)
            ->where('chung_tu_id', $request->chung_tu_id)
            ->first();
            
        $congNo->so_tien_no = $soTienNo;
        $congNo->so_tien_da_thanh_toan = $soTienDaThanhToan;
        
        if($soTienNo == 0) {
            $congNo->cong_no_status_id = 1; // đã tất toán
        }
        $congNo->save();
        

        return $this->sendSuccessResponse($congNo);
    }
}

