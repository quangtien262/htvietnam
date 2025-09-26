<?php

namespace App\Http\Controllers\Admin;

use App\Models\Admin\NhapHangDetail;
use App\Models\Admin\Product;
use App\Models\Admin\TraHangNCC;
use App\Models\Admin\XuatHuy;
use App\Models\Admin\XuatHuyDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\ChiNhanh;
use App\Models\Admin\Column;
use App\Models\Admin\CongNo;
use App\Models\Admin\DonViQuyDoi;
use App\Models\Admin\HoaDon;
use App\Models\Admin\HoaDonChiTiet;
use App\Models\Admin\KhachTraHang;
use App\Models\Admin\KhachTraHangDetail;
use App\Models\Admin\KiemKho;
use App\Models\Admin\KiemKhoDetail;
use App\Models\Admin\NhapHang;
use App\Models\Admin\PhieuChi;
use App\Models\Admin\PhieuThu;
use App\Models\Admin\ProductType;
use App\Models\Admin\SoQuy;
use Illuminate\Support\Facades\Redirect;
use App\Services\Admin\TblService;
use App\Models\Admin\Table;
use App\Models\Admin\TraHangNCCDetail;
use App\Models\AdminUser;
use App\Models\User;
use App\Services\Admin\CardClass;
use App\Services\Admin\HimalayaService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{

    public function dashboard(Request $request)
    {
        // loại sp
        $tkeLoaiSPTheoTen = [];
        $loaiSP = ProductType::get();
        foreach ($loaiSP as $loai) {
            $soLuongTenSP = Product::where('product_type_id', $loai->id)->count();
            $tkeLoaiSPTheoTen[] = [
                'name' => $loai->name,
                'value' => $soLuongTenSP,
            ];
        }

        // nhóm sp
        $tkeLoaiSPTheoSoLuong = [];
        $loaiSP = ProductType::get();
        foreach ($loaiSP as $loai) {
            $soLuongSP = Product::where('product_type_id', $loai->id)->sum('ton_kho');
            $tkeLoaiSPTheoSoLuong[] = [
                'name' => $loai->name,
                'value' => intval($soLuongSP),
            ];
        }

        $latestProducts  = Product::latest()->take(10)->get();

        $viewData = [
            'tkeLoaiSPTheoTen' => $tkeLoaiSPTheoTen,
            'tkeLoaiSPTheoSoLuong' => $tkeLoaiSPTheoSoLuong,
            'latestProducts' => $latestProducts,
            'p' => $request->p ?? 0,
        ];
        return Inertia::render('Admin/Dashboard/kho_hang', $viewData);
    }

    public function list(Request $request)
    {
        $tables = TblService::getAdminMenu(0);
        $table = Table::find(236);
        $products = Product::searchProduct($request);
        $typeProduct = config('constant.type_product');
        $productGroup = DB::table('product_group')->get();
        $thuongHieu = DB::table(table: 'thuong_hieu')->get();
        $viTri = DB::table('product_vi_tri')->get();
        $thuocTinh = DB::table('product_thuoc_tinh')->get();

        $viewData = [
            'tables' => $tables,
            'table' => $table,
            'products' => $products,
            'typeProduct' => $typeProduct,
            'productGroup' => $productGroup,
            'thuongHieu' => $thuongHieu,
            'viTri' => $viTri,
            'thuocTinh' => $thuocTinh,
            'token' => csrf_token(),
            'p' => $request->p ?? 0,
        ];

        return Inertia::render('Admin/Product/list', $viewData);
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
        $products = DB::table('products')
            ->whereIn('product_type_id', [1, 2])
            ->where('is_parent', 0)
            ->where('is_recycle_bin', 0)
            ->where('is_draft', 0)
            ->orderBy('id', 'desc')
            ->get();

        $services = DB::table('products')
            ->where('product_type_id', 2)
            ->where('is_parent', 0)
            ->where('is_recycle_bin', 0)
            ->where('is_draft', 0)
            ->orderBy('id', 'desc')
            ->get();

        $nguyenLieuTieuHao = Product::whereIn('product_group_id', [2, 3])
            ->orderBy('id', 'desc')
            ->get();
        $dichVu = Product::where('product_type_id', 2)
            ->orderBy('id', 'desc')
            ->get();


        $thuocTinhClass = [];
        foreach ($thuocTinh as $t2) {
            $thuocTinhClass[$t2->id] = '_hidden';
        }

        $type = 1;
        $lichSuDung = [
            'value' => 2,
            'label' => 'Theo ngày',
            'donvi' => 'Ngày'
        ];
        $productApply = [];

        $productApplyData = [];

        if (!empty($product)) {
            $type = $product->product_type_id;

            // trường hợp là gói dịch vụ
            if ($type == 3 && !empty($product->lich_trinh_sd__khoang_cach_moi_buoi)) { // Gói
                $sd_name = config('constant.product__lich_trinh_sd');
                $sd_donvi = config('constant.product__lich_trinh_sd__donvi');
                $lichSuDung = [
                    'value' => $type,
                    'label' => $sd_name[$product->lich_trinh_sd],
                    'donvi' => $sd_name[$product->lich_trinh_sd],
                ];
            }
            // check form trường hợp là nguyên liệu tiêu hao
            if ($type == 2) {
                $productApplyData = $nguyenLieuTieuHao;
            }

            // check form trường hợp là dịch vụ
            if ($type == 3) {
                $productApplyData = $dichVu;
            }

            // trường hợp là dịch vụ hoặc gói dịch vụ, cần lấy ra danh sách nguyên liệu tiêu hao tương ứng
            if (!empty($product->product_apply) && in_array($type, [2, 3])) {
                $productApply = $product->product_apply;
            }

        }

        $classItem = $this->checkShowFormItem($type, $product);

        $chiNhanh = [];
        $chiNhanh_db = DB::table('don_vi')->where('is_recycle_bin', 0)->get();
        foreach ($chiNhanh_db as $cn) {
            $chiNhanh[$cn->id] = $cn->name;
        }

        $tonKhoDetail = $this->getTonKhoDetail($pid);

        $donVi = DB::table('don_vi')->where('is_recycle_bin', 0)->get();
        $donVi_key = [];
        foreach ($donVi as $pro) {
            $donVi_key[$pro->id] = $pro->name;
        }

        $donViQuyDoi = [
            [
                'don_vi_quy_doi_id' => null,
                'ty_le_quy_doi' =>  0
            ]
        ];
        $donViSelectedID = [];
        if (!empty($pid)) {
            $dvQuyDoi = DonViQuyDoi::where('product_id', $product->id)->count();
            if (!empty($dvQuyDoi)) {
                $donViQuyDoi = [];
                $dvQuyDoi = DonViQuyDoi::where('product_id', $product->id)->get();
                foreach ($dvQuyDoi as $d) {
                    $donViSelectedID[] = $d->don_vi_id;
                    $donViQuyDoi[] = [
                        'don_vi_quy_doi_id' => $d->don_vi_id,
                        'ty_le_quy_doi' =>  $d->ty_le_quy_doi_theoDVQuyDoi
                    ];
                }
            }
        }
        // dd($tonKhoDetail);

        $viewData = [
            'tables' => $tables,
            'table' => $table,
            'thuocTinh' => $thuocTinh,
            'thuocTinhClass' => $thuocTinhClass,
            'thuongHieu' => $thuongHieu,
            'productGroup' => $productGroup,
            'viTri' => $viTri,
            'type' => $type,
            'products' => $products,
            'product' => $product,
            'services' => $services,
            'pid' => $pid,
            'classItem' => $classItem,
            'lichSuDung' => $lichSuDung,
            'dvTrongGoi' => $productApply,
            'tonKhoDetail' => $tonKhoDetail,
            'chiNhanh' => $chiNhanh,
            'donVi' => $donVi,
            'donVi_key' => $donVi_key,
            'dichVu' => $dichVu,
            'nguyenLieuTieuHao' => $nguyenLieuTieuHao,
            'productApplyData' => $productApplyData,
            'donViQuyDoi' => $donViQuyDoi,
            'donViSelectedID' => $donViSelectedID,
            'token' => csrf_token(),
            'p' => $request->p ?? 0,
        ];
        return Inertia::render('Admin/Product/form', $viewData);
    }

    private function getTonKhoDetail($productId)
    {
        $khoHang = DB::table('kho_hang')->get();

        // trường hợp thêm mới, tạo sẵn SL = 0 cho mỗi kho
        if (empty($productId)) {
            foreach ($khoHang as $kho) {
                $tonKhoDetail[$kho->id] = [
                    'kho_hang_id' => $kho->id,
                    'kho_hang_name' => $kho->name,
                    'ton_kho' => 0,
                ];
            }
            return $tonKhoDetail;
        }

        // trường hợp edit
        $tonKhoDetail = [];
        
        foreach ($khoHang as $kho) {
            $khoData = DB::table('kho_hang_data')
            ->where('product_id', $productId)
            ->where('kho_hang_id', $kho->id)
            ->first();
            $tonKho = 0;
            if ($khoData) {
                $tonKho = $khoData->ton_kho;
            }
            $tonKhoDetail[$kho->id] = [
                'kho_hang_id' => $kho->id,
                'kho_hang_name' => $kho->name,
                'ton_kho' => $tonKho,
            ];
        }
        return $tonKhoDetail;
    }
    public function saveProduct(Request $rq)
    {
        Product::savePro($rq);

        return to_route('product.list', ['p' => $rq->p ?? 0]);
    }

    public function getProductInfo($pid)
    {
        $product = Product::find($pid);

        // kiểm kho
        $kiemKho = KiemKhoDetail::baseQuery()->where('product_id', $pid)->get();

        //lịch sử nhập hàng
        $nhapHang = NhapHangDetail::baseQuery()->where('product_id', $pid)->get();

        // lịch sử khách trả hàng
        $khachTraHang = KhachTraHangDetail::baseQuery()->where('product_id', $pid)->get();

        // lịch sử xuất hủy
        $xuatHuy = XuatHuyDetail::baseQuery()->where('product_id', $pid)->get();

        // lịch sử bán hàng
        $banHang = HoaDonChiTiet::baseQuery()->where('product_id', $pid)->get();

        // lịch sử trả hàng NCC
        $traHangNCC = TraHangNCCDetail::baseQuery()->where('product_id', $pid)->get();

        // nguyên liệu tiêu hao
        $nguyenLieu = $this->getnguyenLieu($pid);

        $dichVuTrongGoi = CardClass::getDVTrongGoi($pid);

        $productApply = [];
        if (!empty($product->hang_hoa_ap_dung)) {
            $productApply = Product::whereIn('id', $product->hang_hoa_ap_dung)->get()->toArray();
        }
        $loaiHangHoaApDung = [];
        if (!empty($product->loai_hang_hoa)) {
        $loaiHangHoaApDung = ProductType::whereIn('id', $product->loai_hang_hoa)->get()->toArray();
        }

        $data = [
            'info' => $product,
            'kiemKho' => $kiemKho,
            'nhapHang' => $nhapHang,
            'khachTraHang' => $khachTraHang,
            'xuatHuy' => $xuatHuy,
            'banHang' => $banHang,
            'traHangNCC' => $traHangNCC,
            'nguyenLieu' => $nguyenLieu,
            'dichVuTrongGoi' => $dichVuTrongGoi,
            'productApply' => $productApply,
            'loaiHangHoaApDung' => $loaiHangHoaApDung,
        ];
        return $this->sendSuccessResponse($data);
    }

    public function nguyenLieu($pid)
    {
        $nguyenLieu = $this->getnguyenLieu($pid);

        return $this->sendSuccessResponse($nguyenLieu);
    }

    private function getnguyenLieu($pid)
    {
        $nguyenLieu = DB::table('product_nguyen_lieu_tieu_hao')
            ->select(
                'product_nguyen_lieu_tieu_hao.so_luong as so_luong',
                'product_nguyen_lieu_tieu_hao.id as id',
                'products.name as product_name',
                'products.code as product_code',
                'products.gia_von as gia_von',
                'products.gia_ban as gia_ban',
            )
            ->where('product_nguyen_lieu_tieu_hao.product_id', $pid)
            ->leftJoin('products', 'products.id', 'product_nguyen_lieu_tieu_hao.nguyen_lieu_id')
            ->get();
        $result = [];
        foreach ($nguyenLieu as $key => $nl) {
            $stt = $key + 1;
            $result[] = [
                'key' => $nl->id,
                'id' => $nl->id,
                'stt' => $stt,
                'gia_von' => $nl->gia_von,
                'gia_ban' => $nl->gia_ban,
                'product_code' => $nl->product_code,
                'product_name' => $nl->product_name,
                'so_luong' => $nl->so_luong,
            ];
        }

        return $result;
    }

    public function dichVuTrongGoi($pid)
    {
        $result = CardClass::getDVTrongGoi($pid);
        return $this->sendSuccessResponse($result);
    }

    public function apDung($pid)
    {
        $product = Product::find($pid);
        $productApply = [];
        if (!empty($product->hang_hoa_ap_dung)) {
            $productApply = Product::whereIn('id', $product->hang_hoa_ap_dung)->get();
        }

        return $this->sendSuccessResponse($productApply);
    }

    public function ngungKinhDoanh(Request $rq)
    {
        $product = Product::find($rq->pid);
        $product->ngung_kinh_doanh = 1;
        $product->save();
        return $this->sendSuccessResponse('OK');
    }

    public function deleteProduct(Request $rq)
    {
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

    public function kiemKho(Request $request)
    {
        $viewData = TblService::getDataIndexDefault('product_kiem_kho', $request, true, true);

        return Inertia::render('Admin/Product/kiem_kho', $viewData);
    }

    public function saveKiemKho(Request $rq)
    {

        if (empty($rq->dataDetail)) {
            return $this->sendErrorResponse('Chưa nhập thông tin sản phẩm');
        }

        if (empty($rq->id)) {
            $kiemKho = new KiemKho();
        } else {
            $kiemKho = KiemKho::find($rq->id);
        }


        if (empty($rq->name)) {
            $kiemKho->name = date('d/m/Y');
        } else {
            $kiemKho->name = $rq->name;
        }
        $kiemKho->code = $rq->code;
        $kiemKho->note = $rq->note;
        $kiemKho->is_draft = $rq->is_draft;
        $kiemKho->nhan_vien_id = $rq->nhan_vien_id;

        $kiemKho->create_by = Auth::guard('admin_users')->user()->id;

        $kiemKho->save();

        if (empty($rq->code)) {
            $kiemKho->code = 'KK' . TblService::formatNumberByLength($kiemKho->id, 5);;
        }

        $tong_tien_chenh_lech = 0;
        $tong_sl_chenh_lech = 0;

        $so_luong_lech_tang = 0;
        $so_luong_lech_giam = 0;

        $tong_tien_lech_tang = 0;
        $tong_tien_lech_giam = 0;

        $tong_ton_kho = 0;

        $subDataId = [];
        $dataInfo = [];
        foreach ($rq->dataDetail as $detail) {
            // save product
            if (intval($rq->is_draft) == 2) {

                $product = Product::find($detail['product_id']);
                $product->ton_kho =  $detail['so_luong'];
                $product->save();
            }

            //save
            $kiemKhoDetail = new KiemKhoDetail();
            $kiemKhoDetail->data_id = $kiemKho->id;
            $kiemKhoDetail->product_id = $detail['product_id'];
            $kiemKhoDetail->product_code = $detail['product_code'];
            $kiemKhoDetail->product_name = $detail['product_name'];
            $kiemKhoDetail->thuc_te = $detail['so_luong'];
            $kiemKhoDetail->ton_kho = $detail['ton_kho'];
            $kiemKhoDetail->so_luong_lech = $detail['so_luong_lech'];
            $kiemKhoDetail->gia_tri_lech = $detail['gia_tri_lech'];
            $kiemKhoDetail->gia_von = $detail['gia_von'];

            $kiemKhoDetail->is_draft = $rq->is_draft;

            $kiemKhoDetail->save();


            $dataInfo[] = [
                'product_id' => $detail['product_id'],
                'product_name' => $detail['product_name'],
                'product_code' => $detail['product_code'],
                'thuc_te' => $detail['so_luong'],
                'ton_kho' => $detail['ton_kho'],
                'so_luong_lech' => $detail['so_luong_lech'],
                'gia_tri_lech' => $detail['gia_tri_lech'],
                'gia_von' => $detail['gia_von'],
                'detail_id' => $kiemKhoDetail->id,
            ];

            $subDataId[] = $kiemKhoDetail->id;

            // update total
            $tong_tien_chenh_lech += $detail['gia_tri_lech'];
            $tong_sl_chenh_lech += $detail['so_luong_lech'];

            $tong_ton_kho += $detail['ton_kho'];

            if ($detail['so_luong_lech'] > 0) {
                $so_luong_lech_tang += $detail['so_luong_lech'];
            } else {
                $so_luong_lech_giam += $detail['so_luong_lech'];
            }

            if ($detail['gia_tri_lech'] > 0) {
                $tong_tien_lech_tang += $detail['gia_tri_lech'];
            } else {
                $tong_tien_lech_giam += $detail['gia_tri_lech'];
            }
        }
        $kiemKho->info = $dataInfo;
        $kiemKho->sub_data_ids = $subDataId;

        $kiemKho->tong_tien_chenh_lech = $tong_tien_chenh_lech;
        $kiemKho->tong_sl_chenh_lech = $tong_sl_chenh_lech;

        $kiemKho->so_luong_lech_tang = $so_luong_lech_tang;
        $kiemKho->so_luong_lech_giam = $so_luong_lech_giam;

        $kiemKho->tong_tien_lech_tang = $tong_tien_lech_tang;
        $kiemKho->tong_tien_lech_giam = $tong_tien_lech_giam;
        $kiemKho->tong_ton_kho = $tong_ton_kho;

        $kiemKho->save();

        return $this->sendSuccessResponse($kiemKho, 'success');
    }

    public function khachTraHang(Request $request)
    {

        $viewData = TblService::getDataIndexDefault('product_khach_tra_hang', $request, true, true);

        return Inertia::render('Admin/Product/khach_tra_hang', $viewData);
    }

    public function saveKhachTraHang(Request $rq)
    {

        if (empty($rq->dataDetail)) {
            return $this->sendErrorResponse('Chưa nhập thông tin sản phẩm');
        }

        if (empty($rq->id)) {
            $data = new KhachTraHang();
        } else {
            $data = KhachTraHang::find($rq->id);
        }

        $now = date('d/m/Y H:i:s');
        $nowDB = date('Y-m-d H:i:s');
        if (empty($rq->name)) {
            $data->name = $now;
        } else {
            $data->name = $rq->name;
        }
        if (!empty($rq->name)) {
            $data->code = $rq->code;
        }

        $data->note = $rq->note;
        $data->chi_nhanh_id = $rq->chi_nhanh_id;
        $data->is_draft = $rq->is_draft;
        $data->hinh_thuc_thanh_toan_id = $rq->hinh_thuc_thanh_toan_id;
        $data->khach_hang_id = $rq->khach_hang_id;

        // save tien
        $data->giam_gia = $rq->tongGiamGia;
        $data->so_luong = $rq->tongSoLuong;
        $data->thanh_tien = $rq->tongTraKhach;

        // save cong no
        $data->da_thanh_toan = $rq->daThanhToan;
        $data->cong_no = $rq->tongCongNo;
        $data->ngay_tat_toan = $rq->ngayTatToan;

        if (!empty($rq->nhan_vien_id)) {
            $data->nhan_vien_id = $rq->nhan_vien_id;
        }
        $data->create_by = Auth::guard('admin_users')->user()->id;
        $data->save();

        // save code
        if (empty($rq->code)) {
            $data->code = 'KTH' . TblService::formatNumberByLength($data->id, 5);
            $data->save();
        }

        // save cong no 
        if ($rq->tongCongNo > 0) {
            $congNo = new CongNo();
            $congNo->name = 'Khách trả hàng đã mua';
            $congNo->users_id = $rq->khach_hang_id;
            $congNo->loai_chung_tu = 'product_khach_tra_hang';
            $congNo->chung_tu_id = $data->id;
            $congNo->ma_chung_tu = $data->code;

            $congNo->product_id = 0;
            $congNo->product_code = 0;

            $congNo->tong_tien_hoa_don = $rq->tongTraKhach;
            $congNo->so_tien_no = -$rq->tongCongNo;
            $congNo->so_tien_da_thanh_toan = $rq->daThanhToan;
            $congNo->cong_no_status_id = 2; // chưa tt
            $congNo->ngay_hen_tat_toan = $rq->ngayTatToan;
            $congNo->save();
            $congNo->code = 'CN' . TblService::formatNumberByLength($congNo->id, 5);
            $congNo->save();
        }


        $tongSL = 0;
        $tongGiamGia = 0;
        $tongTienTraKhach = 0;

        $subDataId = [];
        $dataInfo = [];

        foreach ($rq->dataDetail as $detail) {
            // Câp nhật lại SL sản phẩm
            if (intval($rq->is_draft) == 2) {
                $product = Product::find($detail['product_id']);
                $tongTonKho = 0;
                $tonKhoDetail = $product->ton_kho_detail;
                foreach ($product->ton_kho_detail as $chiNhanhId => $tonKhoChiNhanh) {
                    if ($chiNhanhId == $rq['chi_nhanh_id']) {
                        $tonKhoDetail[$chiNhanhId]['ton_kho'] = $tonKhoChiNhanh['ton_kho'] + $detail['so_luong'];
                        $tongTonKho += $tonKhoDetail[$chiNhanhId]['ton_kho'];
                        continue;
                    }
                    $tongTonKho += $tonKhoChiNhanh['ton_kho'];
                }
                $product->ton_kho_detail = $tonKhoDetail;
                $product->ton_kho =  $tongTonKho;
                $product->save();
            }

            //save
            $subData = new KhachTraHangDetail();
            $subData->data_id = $data->id;
            $subData->product_id = $detail['product_id'];
            $subData->product_code = $detail['product_code'];
            $subData->product_name = $detail['product_name'];

            $subData->so_luong = $detail['so_luong'];
            $subData->gia_ban = $detail['gia_ban'];
            $subData->giam_gia = $detail['giam_gia'];
            $subData->tien_tra_khach = $detail['tien_tra_khach'];
            $subData->is_percen = $detail['is_percen'];

            $subData->is_draft = $rq->is_draft;

            $subData->save();

            $subDataId[] = $subData->id;

            // data info
            $dataInfo[] = [
                'product_id' => $detail['product_id'],
                'product_name' => $detail['product_name'],
                'product_code' => $detail['product_code'],
                'so_luong' => $detail['so_luong'],
                'gia_ban' => $detail['gia_ban'],
                'giam_gia' => $detail['giam_gia'],
                'tien_tra_khach' => $detail['tien_tra_khach'],
                'is_percen' => $detail['is_percen'],
                'detail_id' => $subData->id,
                'don_vi_giam_gia' => $detail['don_vi_giam_gia'],
            ];


            // update total
            if ($detail['is_percen']) {
                $tongGiamGia += $detail['giam_gia'] * $detail['tien_tra_khach'] / 100;
            } else {
                $tongGiamGia += $detail['giam_gia'];
            }
            $tongSL += $detail['so_luong'];
            $tongTienTraKhach += $detail['tien_tra_khach'];
        }

        // save info
        $data->info = $dataInfo;
        $data->sub_data_ids = $subDataId;
        $data->save();

        // check xem save hay draft
        if (intval($rq->is_draft) == 2) {
            // lưu phiếu chi
            $phieuChi = new PhieuChi();
            $phieuChi->name = 'Khách trả hàng ' . $now;

            $phieuChi->loai_chung_tu = 'product_khach_tra_hang';
            $phieuChi->chung_tu_id = $data->id;
            $phieuChi->ma_chung_tu = $data->code;

            $phieuChi->gia_tri_phieu = $tongTienTraKhach;
            $phieuChi->chi_nhanh_id = $rq->chi_nhanh_id;

            // hinh thuc chi tien
            $phieuChi->hinh_thuc_chi_id = $rq->hinh_thuc_thanh_toan_id;

            $phieuChi->loai_chi_id = 1; // khach tra hàng
            if (!empty($rq->nhan_vien_id)) {
                $phieuChi->nhan_vien_id = $rq->nhan_vien_id;
            }
            $phieuChi->khach_hang_id = $rq->khach_hang_id;
            $phieuChi->thoi_gian = $nowDB;
            $phieuChi->ghi_chu = $data->note;
            $phieuChi->info = $dataInfo;
            $phieuChi->save();

            // save mã phiếu chi
            $phieuChi->code = 'PC' . TblService::formatNumberByLength($phieuChi->id, 5);
            $phieuChi->save();


            //save sổ quỹ
            $soQuy = new SoQuy();
            $soQuy->name = 'Chi tiền trả khách ' . $now;
            $soQuy->loai_chung_tu = 'product_khach_tra_hang';
            $soQuy->chung_tu_id = $data->id;
            $soQuy->ma_chung_tu = $data->code;
            $soQuy->chi_nhanh_id = $rq->chi_nhanh_id;
            $soQuy->khach_hang_id = $rq->khach_hang_id;
            $soQuy->nhan_vien_id = !empty($rq->nhan_vien_id) ? intval($rq->nhan_vien_id) : 0;
            $soQuy->so_tien = -$rq->daThanhToan;
            $soQuy->so_quy_status_id = 1;
            $soQuy->so_quy_type_id = config('constant.nhom_nguoi_nhan.khach_tra_hang');
            $soQuy->thoi_gian = $nowDB;
            $soQuy->note = $rq->note;

            $soQuy->nhom_nguoi_nhan_id = config('constant.nhom_nguoi_nhan.khach_hang'); // 1 là khách hàng
            // $soQuy->nguoi_nhan_name = '';
            // $soQuy->nguoi_nhan_phone = '';
            // $soQuy->nguoi_nhan_code = '';

            $soQuy->save();
            $soQuy->code = 'SQ' . TblService::formatNumberByLength($soQuy->id, 5);
            $soQuy->save();
        }

        return $this->sendSuccessResponse($data, 'success');
    }

    public function traHangNCC(Request $request)
    {
        $viewData = TblService::getDataIndexDefault('product_tra_hang_ncc', $request, true, true);
        $viewData['p'] = $request->p ?? 0;
        return Inertia::render('Admin/Product/tra_hang_ncc', $viewData);
    }

    public function saveTraHangNCC(Request $rq)
    {

        if (empty($rq->dataDetail)) {
            return $this->sendErrorResponse('Chưa nhập thông tin sản phẩm');
        }

        if (empty($rq->id)) {
            $data = new TraHangNCC();
        } else {
            $data = TraHangNCC::find($rq->id);
        }

        $now = date('d/m/Y H:i:s');
        $nowDB = date('Y-m-d H:i:s');
        if (empty($rq->name)) {
            $data->name = $now;
        } else {
            $data->name = $rq->name;
        }
        if (!empty($rq->code)) {
            $data->code = $rq->code;
        }

        $data->note = $rq->note;
        $data->chi_nhanh_id = $rq->chi_nhanh_id;
        $data->is_draft = $rq->is_draft;
        $data->hinh_thuc_thanh_toan_id = $rq->hinh_thuc_thanh_toan_id;
        $data->nha_cung_cap_id = $rq->nha_cung_cap_id;

        $data->giam_gia = $rq->giam_gia;
        $data->phi_tra_hang = $rq->phi_tra_hang;
        $data->tong_tien_hang = $rq->tong_tien_hang;
        $data->thanh_tien = $rq->thanh_tien;

        // save cong no
        $data->da_thanh_toan = $rq->daThanhToan;
        $data->cong_no = $rq->tongCongNo;
        $data->ngay_tat_toan = $rq->ngayTatToan;

        if (!empty($rq->nhan_vien_id)) {
            $data->nhan_vien_id = $rq->nhan_vien_id;
        }
        $data->create_by = Auth::guard('admin_users')->user()->id;
        $data->save();

        if (empty($rq->code)) {
            $data->code = 'KTH' . TblService::formatNumberByLength($data->id, 5);
            $data->save();
        }

        if ($rq->tongCongNo > 0) {
            $congNo = new CongNo();
            $congNo->name = 'Trả hàng nhà cung cấp';
            $congNo->users_id = $rq->khach_hang_id;
            $congNo->loai_chung_tu = 'product_tra_hang_ncc';
            $congNo->chung_tu_id = $data->id;
            $congNo->ma_chung_tu = $data->code;

            $congNo->nha_cung_cap_id = $rq->nha_cung_cap_id;

            $congNo->tong_tien_hoa_don = $rq->thanh_tien;
            $congNo->so_tien_no = $rq->tongCongNo;
            $congNo->so_tien_da_thanh_toan = $rq->daThanhToan;
            $congNo->cong_no_status_id = 2; // chưa tt
            $congNo->ngay_hen_tat_toan = $rq->ngayTatToan;
            $congNo->save();
            $congNo->code = 'CN' . TblService::formatNumberByLength($congNo->id, 5);
            $congNo->save();
        }


        $tongSL = 0;

        $subDataId = [];
        $dataInfo = [];

        foreach ($rq->dataDetail as $detail) {
            // Câp nhật lại SL sản phẩm
            if (intval($rq->is_draft) == 2) {
                $product = Product::find($detail['product_id']);

                $tongTonKho = 0;
                $tonKhoDetail = $product->ton_kho_detail;
                foreach ($product->ton_kho_detail as $chiNhanhId => $tonKhoChiNhanh) {
                    if ($chiNhanhId == $rq['chi_nhanh_id']) {
                        $tonKhoDetail[$chiNhanhId]['ton_kho'] = $tonKhoChiNhanh['ton_kho'] - $detail['so_luong'];
                        $tongTonKho += $tonKhoDetail[$chiNhanhId]['ton_kho'];
                        continue;
                    }
                    $tongTonKho += $tonKhoChiNhanh['ton_kho'];
                }
                $product->ton_kho_detail = $tonKhoDetail;
                $product->ton_kho =  $tongTonKho;

                $product->save();
            }

            //save
            $subData = new TraHangNCCDetail();
            $subData->data_id = $data->id;
            $subData->product_id = $detail['product_id'];
            $subData->product_code = $detail['product_code'];
            $subData->product_name = $detail['product_name'];

            $subData->so_luong = $detail['so_luong'];
            $subData->gia_nhap = $detail['gia_von'];
            $subData->gia_tra_lai = $detail['gia_tra_lai'];
            $subData->thanh_tien = $detail['thanh_tien'];

            $subData->is_draft = $rq->is_draft;

            $subData->save();

            $subDataId[] = $subData->id;

            // data info
            $dataInfo[] = [
                'product_id' => $detail['product_id'],
                'product_name' => $detail['product_name'],
                'product_code' => $detail['product_code'],
                'so_luong' => $detail['so_luong'],
                'gia_von' => $detail['gia_von'],
                'gia_tra_lai' => $detail['gia_tra_lai'],
                'thanh_tien' => $detail['thanh_tien'],
                'detail_id' => $subData->id,
            ];


            // update total
            $tongSL += $detail['so_luong'];
        }


        $data->so_luong = $tongSL;
        $data->info = $dataInfo;
        $data->sub_data_ids = $subDataId;
        $data->save();

        // check xem save hay draft
        if (intval($rq->is_draft) == 2) {
            // lưu phiếu thu
            $phieuThu = new PhieuThu();
            $phieuThu->name = 'Khách trả hàng ' . $now;

            $phieuThu->loai_chung_tu = 'product_tra_hang_ncc'; // tên bảng
            $phieuThu->chung_tu_id = $data->id;
            $phieuThu->ma_chung_tu = $data->code;

            $phieuThu->so_tien = $rq->thanh_toan;
            $phieuThu->chi_nhanh_id = $rq->chi_nhanh_id;

            // hinh thuc chi tien
            $phieuThu->hinh_thuc_thu_id = $rq->hinh_thuc_thanh_toan_id;

            $phieuThu->loai_thu_id = 4; // Trả hàng NCC
            if (!empty($rq->nhan_vien_id)) {
                $phieuThu->nhan_vien_id = $rq->nhan_vien_id;
            }
            $phieuThu->khach_hang_id = $rq->khach_hang_id;
            $phieuThu->thoi_gian = $nowDB;
            $phieuThu->note = $data->note;
            $phieuThu->info = $dataInfo;
            $phieuThu->sub_data_ids = $subDataId;
            $phieuThu->save();

            // save mã phiếu thu
            $phieuThu->code = 'PT' . TblService::formatNumberByLength($phieuThu->id, 5);
            $phieuThu->save();


            //save sổ quỹ
            $soQuy = new SoQuy();
            $soQuy->name = 'Chi tiền trả hàng nhà cung cấp' . $now;
            $soQuy->loai_chung_tu = 'product_tra_hang_ncc'; // tên bảng
            $soQuy->chung_tu_id = $data->id;
            $soQuy->ma_chung_tu = $data->code;
            $soQuy->chi_nhanh_id = $rq->chi_nhanh_id;
            $soQuy->nha_cung_cap_id = $rq->nha_cung_cap_id; // ncc
            $soQuy->nhan_vien_id = !empty($rq->nhan_vien_id) ? intval($rq->nhan_vien_id) : 0;
            $soQuy->so_tien = $rq->thanh_toan;
            $soQuy->so_quy_status_id = config('constant.so_quy_status.da_thanh_toan');
            $soQuy->so_quy_type_id = config('constant.nhom_nguoi_nhan.thu_tien_ncc'); // 4:  thu tiền trả lại hàng cho NCC
            $soQuy->thoi_gian = $nowDB;
            $soQuy->note = $rq->note;

            $soQuy->nhom_nguoi_nhan_id = config('constant.nhom_nguoi_nhan.ncc'); // 2 là ncc

            $soQuy->save();
            $soQuy->code = 'SQ' . TblService::formatNumberByLength($soQuy->id, 5);
            $soQuy->save();
        }

        return $this->sendSuccessResponse($data, 'success');
    }

    public function nhapHangReport(Request $request)
    {
        $table = DB::table('tables')->where('name', 'product_nhap_hang')->first();
        $columns = Column::where('table_id')->get();
        $datas = self::getDatas($table, $columns, $request->all(), $pageSize);
        return $this->sendSuccessResponse($datas);
    }
    public function nhapHang(Request $request)
    {
        $viewData = TblService::getDataIndexDefault('product_nhap_hang', $request, true, true);
        $viewData['p'] = $request->p ?? 0;
        return Inertia::render('Admin/Product/nhap_hang', $viewData);
    }

    public function saveNhapHang(Request $rq)
    {

        if (empty($rq->dataDetail)) {
            return $this->sendErrorResponse('Chưa nhập thông tin sản phẩm');
        }

        if (empty($rq->id)) {
            $data = new NhapHang();
        } else {
            $data = NhapHang::find($rq->id);
        }

        $now = date('d/m/Y H:i:s');
        $nowDB = date('Y-m-d H:i:s');
        if (empty($rq->name)) {
            $data->name = $now;
        } else {
            $data->name = $rq->name;
        }
        if (!empty($rq->code)) {
            $data->code = $rq->code;
        }

        $data->note = $rq->note;
        $data->chi_nhanh_id = !empty($rq->chi_nhanh_id) ? $rq->chi_nhanh_id : 0;
        $data->is_draft = $rq->is_draft;
        $data->hinh_thuc_thanh_toan_id = !empty($rq->hinh_thuc_thanh_toan_id) ? $rq->hinh_thuc_thanh_toan_id : 0;
        $data->nhan_vien_id = !empty($rq->nhan_vien_id) ? $rq->nhan_vien_id : 0;
        $data->nha_cung_cap_id = !empty($rq->nha_cung_cap_id) ? $rq->nha_cung_cap_id : 0;

        $data->giam_gia = $rq->giam_gia;
        $data->tong_tien_hang = $rq->tong_tien_hang;
        $data->thanh_tien = $rq->thanh_tien;
        $data->so_luong = $rq->so_luong;
        $data->tong_phi_van_chuyen = $rq->tong_phi_van_chuyen;

        // save cong no
        $data->da_thanh_toan = $rq->da_thanh_toan;
        $data->cong_no = $rq->cong_no;
        $data->ngay_tat_toan = $rq->ngay_tat_toan;

        $data->create_by = Auth::guard('admin_users')->user()->id;
        $data->save();

        if (empty($rq->code)) {
            $data->code = 'KTH' . TblService::formatNumberByLength($data->id, 5);
            $data->save();
        }

        // save cong no 
        if ($rq->cong_no > 0) {
            $congNo = new CongNo();
            $congNo->name = 'Nhập hàng từ nhà cung cấp';
            $congNo->nha_cung_cap_id = $rq->nha_cung_cap_id;
            $congNo->loai_chung_tu = 'product_nhap_hang';
            $congNo->chung_tu_id = $data->id;
            $congNo->ma_chung_tu = $data->code;

            $congNo->product_id = 0;
            $congNo->product_code = 0;

            $congNo->tong_tien_hoa_don = $rq->thanh_tien;
            $congNo->so_tien_da_thanh_toan = $rq->da_thanh_toan;
            $congNo->so_tien_no = -$rq->cong_no;
            $congNo->cong_no_status_id = 2; // chưa tt
            $congNo->ngay_hen_tat_toan = $rq->ngay_tat_toan;
            $congNo->save();
            $congNo->code = 'CN' . TblService::formatNumberByLength($congNo->id, 5);
            $congNo->save();
        }

        $subDataId = [];
        $dataInfo = [];

        foreach ($rq->dataDetail as $detail) {
            // Câp nhật lại SL sản phẩm
            if (intval($rq->is_draft) == 2) {
                $product = Product::find($detail['product_id']);

                $tongTonKho = 0;
                $tonKhoDetail = $product->ton_kho_detail;
                
                if(empty($tonKhoDetail) || !is_array($tonKhoDetail)) {
                    $tonKhoDetail = [];
                }

                foreach ($product->ton_kho_detail as $chiNhanhId => $tonKhoChiNhanh) {
                    if ($chiNhanhId == $rq['chi_nhanh_id']) {
                        $tonKhoDetail[$chiNhanhId]['ton_kho'] = $tonKhoChiNhanh['ton_kho'] + $detail['so_luong'];
                        $tongTonKho += $tonKhoDetail[$chiNhanhId]['ton_kho'];
                        continue;
                    }
                    $tongTonKho += $tonKhoChiNhanh['ton_kho'];
                }
                $product->ton_kho_detail = $tonKhoDetail;
                $product->ton_kho =  $tongTonKho;

                $product->gia_von = $detail['gia_von'];
                $product->save();
            }

            //save
            $subData = new NhapHangDetail();
            $subData->data_id = $data->id;
            $subData->product_id = $detail['product_id'];
            $subData->product_code = $detail['product_code'];
            $subData->product_name = $detail['product_name'];

            $subData->giam_gia = $detail['giam_gia'];
            $subData->so_luong = $detail['so_luong'];
            $subData->gia_nhap = $detail['gia_von'];
            $subData->thanh_tien = $detail['thanh_tien'];
            $subData->phi_van_chuyen = $detail['phi_van_chuyen'];

            $subData->is_draft = $rq->is_draft;

            $subData->save();

            $subDataId[] = $subData->id;

            // data info
            $dataInfo[] = [
                'product_id' => $detail['product_id'],
                'product_name' => $detail['product_name'],
                'product_code' => $detail['product_code'],
                'so_luong' => $detail['so_luong'],
                'giam_gia' => $detail['giam_gia'],
                'gia_von' => $detail['gia_von'],
                'thanh_tien' => $detail['thanh_tien'],
                'phi_van_chuyen' => $detail['phi_van_chuyen'],
                'detail_id' => $subData->id,
            ];
        }
        $data->info = $dataInfo;
        $data->sub_data_ids = $subDataId;
        $data->save();

        if (intval($rq->is_draft) == 2) {
            // lưu phiếu thu
            $phieuChi = new PhieuChi();
            $phieuChi->name = 'Chi tiền nhập hàng ' . $now;

            $phieuChi->loai_chung_tu = 'product_nhap_hang';
            $phieuChi->chung_tu_id = $data->id;
            $phieuChi->ma_chung_tu = $data->code;

            $phieuChi->gia_tri_phieu = $rq->thanh_tien;
            $phieuChi->chi_nhanh_id = $rq->chi_nhanh_id;

            // hinh thuc chi tien
            $phieuChi->hinh_thuc_chi_id = $rq->hinh_thuc_thanh_toan_id;

            $phieuChi->loai_chi_id = 1; // khach tra hàng
            if (!empty($rq->nhan_vien_id)) {
                $phieuChi->nhan_vien_id = $rq->nhan_vien_id;
            }
            $phieuChi->nha_cung_cap_id = $rq->nha_cung_cap_id;
            // $phieuChi->khach_hang_id = $rq->khach_hang_id;
            $phieuChi->thoi_gian = $nowDB;
            $phieuChi->ghi_chu = $data->note;
            $phieuChi->info = $dataInfo;
            $phieuChi->save();

            // save mã phiếu chi
            $phieuChi->code = 'PC' . TblService::formatNumberByLength($phieuChi->id, 5);
            $phieuChi->save();


            //save sổ quỹ
            $soQuy = new SoQuy();
            $soQuy->name = 'Chi tiền nhập hàng ' . $now;
            $soQuy->loai_chung_tu = 'product_nhap_hang';
            $soQuy->chung_tu_id = $data->id;
            $soQuy->ma_chung_tu = $data->code;
            $soQuy->chi_nhanh_id = $rq->chi_nhanh_id;
            // $soQuy->khach_hang_id = $rq->khach_hang_id;
            $soQuy->nha_cung_cap_id = $rq->nha_cung_cap_id;
            $soQuy->nhan_vien_id = !empty($rq->nhan_vien_id) ? intval($rq->nhan_vien_id) : 0;
            $soQuy->so_tien = $rq->thanh_tien;
            $soQuy->so_quy_status_id = 1;
            $soQuy->so_quy_type_id = config('constant.so_quy_type.chi_tien_ncc');
            $soQuy->thoi_gian = $nowDB;
            $soQuy->note = $rq->note;

            $soQuy->nhom_nguoi_nhan_id = config('constant.nhom_nguoi_nhan.ncc'); // 1 là khách hàng

            $soQuy->save();
            $soQuy->code = 'SQ' . TblService::formatNumberByLength($soQuy->id, 5);
            $soQuy->save();
        }

        return $this->sendSuccessResponse($data, 'success');
    }

    public function xuatHuy(Request $request)
    {
        $viewData = TblService::getDataIndexDefault('product_xuat_huy', $request, true, true);
        $viewData['p'] = $request->p ?? 0;
        return Inertia::render('Admin/Product/xuat_huy', $viewData);
    }

    public function saveXuatHuy(Request $rq)
    {

        if (empty($rq->dataDetail)) {
            return $this->sendErrorResponse('Chưa nhập thông tin sản phẩm');
        }

        if (empty($rq->id)) {
            $data = new XuatHuy();
        } else {
            $data = XuatHuy::find($rq->id);
        }

        $now = date('d/m/Y H:i:s');
        $nowDB = date('Y-m-d H:i:s');
        if (empty($rq->name)) {
            $data->name = $now;
        } else {
            $data->name = $rq->name;
        }
        if (!empty($rq->code)) {
            $data->code = $rq->code;
        }

        $data->note = $rq->note;
        $data->chi_nhanh_id = !empty($rq->chi_nhanh_id) ? $rq->chi_nhanh_id : 0;
        $data->nhan_vien_id = !empty($rq->nhan_vien_id) ? $rq->nhan_vien_id : 0;
        $data->ly_do_xuat_huy_id = !empty($rq->ly_do_xuat_huy_id) ? $rq->ly_do_xuat_huy_id : 0;
        $data->is_draft = $rq->is_draft;

        $data->gia_tri_huy = $rq->gia_tri_huy;
        $data->so_luong_huy = $rq->so_luong_huy;

        $data->create_by = Auth::guard('admin_users')->user()->id;

        $data->save();

        if (empty($rq->code)) {
            $data->code = 'KTH' . TblService::formatNumberByLength($data->id, 5);
            $data->save();
        }

        $subDataId = [];
        $dataInfo = [];

        foreach ($rq->dataDetail as $detail) {
            // Câp nhật lại SL sản phẩm
            $subData = new XuatHuyDetail();
            $product = Product::find($detail['product_id']);
            $tonKhoTrươcKhiHuy = 0;
            $tonKhoSauKhiHuy = 0;

            if (intval($rq->is_draft) == 2) {
                $product = Product::find($detail['product_id']);

                $tongTonKho = 0;
                $tonKhoDetail = $product->ton_kho_detail;
                foreach ($product->ton_kho_detail as $chiNhanhId => $tonKhoChiNhanh) {
                    if ($chiNhanhId == $rq['chi_nhanh_id']) {

                        $tonKhoTrươcKhiHuy = $tonKhoChiNhanh['ton_kho'];
                        $tonKhoSauKhiHuy = $tonKhoChiNhanh['ton_kho'] - $detail['so_luong'];

                        $tonKhoDetail[$chiNhanhId]['ton_kho'] = $tonKhoSauKhiHuy;
                        $tongTonKho += $tonKhoDetail[$chiNhanhId]['ton_kho'];
                        continue;
                    }
                    $tongTonKho += $tonKhoChiNhanh['ton_kho'];
                }
                $product->ton_kho_detail = $tonKhoDetail;
                $product->ton_kho =  $tongTonKho;

                // $product->ton_kho = $tonKhoSauKhiHuy;
                $product->save();
            }

            //save

            $subData->data_id = $data->id;
            $subData->product_id = $detail['product_id'];
            $subData->product_code = $detail['product_code'];
            $subData->product_name = $detail['product_name'];

            $subData->so_luong_huy = $detail['so_luong'];
            $subData->gia_von = $detail['gia_von'];
            $subData->gia_tri_huy = $detail['thanh_tien'];

            $subData->ton_kho_truoc_khi_huy = $tonKhoTrươcKhiHuy;
            $subData->ton_kho_sau_khi_huy = $tonKhoSauKhiHuy;

            $subData->is_draft = $rq->is_draft;

            $subData->save();

            $subDataId[] = $subData->id;

            // data info
            $dataInfo[] = [
                'product_id' => $detail['product_id'],
                'product_name' => $detail['product_name'],
                'product_code' => $detail['product_code'],

                'so_luong_huy' => $detail['so_luong'],
                'gia_von' => $detail['gia_von'],
                'gia_tri_huy' => $detail['thanh_tien'],

                'ton_kho_truoc_khi_huy' => $tonKhoTrươcKhiHuy,
                'ton_kho_sau_khi_huy' => $tonKhoSauKhiHuy,

                'detail_id' => $subData->id,
            ];
        }
        $data->info = $dataInfo;
        $data->sub_data_ids = $subDataId;
        $data->save();

        return $this->sendSuccessResponse($data, 'success');
    }
    private function checkShowFormItem($type = 1, $product = null)
    {
        $classItem_tmp = [];
        switch ($type) {
            case 1:
                $classItem_tmp['title_col01'] = 'Hàng hóa'; // dich vu
                // check ẩn hiện
                $classItem_tmp['thoi_luong'] = '_hidden'; // dich vu
                $classItem_tmp['ton_kho'] = ''; // HH
                $classItem_tmp['product_group_id'] = ''; // HH, dich vu, gói
                $classItem_tmp['product_group_ids_apply'] = '_hidden'; //  thẻ(chọn nhiều)
                $classItem_tmp['thuong_hieu_id'] = ''; // HH, dich vu, gói, thẻ
                $classItem_tmp['vi_tri_id'] = ''; // HH
                $classItem_tmp['gia_von'] = ''; // HH
                $classItem_tmp['gia_ban'] = ''; // HH, dich vu, gói, thẻ
                $classItem_tmp['so_luong'] = '_hidden';
                $classItem_tmp['menh_gia'] = '_hidden'; // thẻ
                $classItem_tmp['trong_luong'] = ''; // HH
                $classItem_tmp['hoa_hong_nv'] = ''; // HH, dich vu
                $classItem_tmp['ban_truc_tiep'] = ''; // HH, dich vu
                $classItem_tmp['thuoc_tinh'] = ''; // HH, dich vu
                $classItem_tmp['don_vi_tinh'] = ''; // HH, dich vu
                // detail
                $classItem_tmp['dinh_muc_ton_it_nhat'] = ''; // HH
                $classItem_tmp['dinh_muc_ton_nhieu_nhat'] = ''; // HH (999999999)
                $classItem_tmp['mo_ta'] = ''; // HH, dich vu, gói, thẻ
                $classItem_tmp['ghi_chu'] = ''; // dich vu, gói,thẻ
                $classItem_tmp['nguyen_lieu_tieu_hao'] = '_hidden'; // dich vu

                $classItem_tmp['lich_trinh_sd'] = '_hidden'; // gói
                $classItem_tmp['lich_trinh_sd__khoang_cach_moi_buoi'] = '_hidden'; // gói

                $classItem_tmp['han_su_dung'] = '_hidden'; // gói, thẻ: Vô hạn, ngày cụ thể, khoảng tg
                $classItem_tmp['hsd_ngay_cu_the'] = '_hidden'; //
                $classItem_tmp['hsd_khoang_thoi_gian'] = '_hidden';


                $classItem_tmp['product_apply'] = '_hidden'; // gói
                $classItem_tmp['loai_hang_hoa'] = '_hidden'; // thẻ - chọn nhiều
                $classItem_tmp['hang_hoa_ap_dung'] = '_hidden'; // thẻ - chọn nhiều
                $classItem_tmp['other'] = '_hidden'; // other - thẻ, gói

                $classItem_tmp['dichVu_sp'] = '_hidden';
                $classItem_tmp['dichVu_sp_titleInput'] = '';
                $classItem_tmp['dichVu_sp_titlePrice'] = '';

                //
                $classItem_tmp['title_code'] = 'Mã sản phẩm';
                $classItem_tmp['title_name'] = 'Tên sản phẩm';
                break;
            case 2:
                $classItem_tmp['title_col01'] = 'Dịch vụ'; // dich vu

                // check ẩn hiện
                $classItem_tmp['thoi_luong'] = ''; // dich vu
                $classItem_tmp['ton_kho'] = '_hidden'; // HH
                $classItem_tmp['product_group_id'] = ''; // HH, dich vu, gói
                $classItem_tmp['product_group_ids_apply'] = '_hidden'; //  thẻ(chọn nhiều)
                $classItem_tmp['thuong_hieu_id'] = ''; // HH, dich vu, gói, thẻ
                $classItem_tmp['vi_tri_id'] = '_hidden'; // HH
                $classItem_tmp['gia_von'] = ''; // HH
                $classItem_tmp['gia_ban'] = ''; // HH, dich vu, gói, thẻ
                $classItem_tmp['so_luong'] = '_hidden';
                $classItem_tmp['menh_gia'] = '_hidden'; // thẻ
                $classItem_tmp['trong_luong'] = '_hidden'; // HH
                $classItem_tmp['hoa_hong_nv'] = ''; // HH, dich vu
                $classItem_tmp['ban_truc_tiep'] = ''; // HH, dich vu
                $classItem_tmp['thuoc_tinh'] = ''; // HH, dich vu
                $classItem_tmp['don_vi_tinh'] = ''; // HH, dich vu
                // detail
                $classItem_tmp['dinh_muc_ton_it_nhat'] = '_hidden'; // HH
                $classItem_tmp['dinh_muc_ton_nhieu_nhat'] = '_hidden'; // HH (999999999)
                $classItem_tmp['mo_ta'] = ''; // HH, dich vu, gói, thẻ
                $classItem_tmp['ghi_chu'] = ''; // dich vu, gói,thẻ
                $classItem_tmp['nguyen_lieu_tieu_hao'] = ''; // dich vu

                //lich_trinh_sd
                $classItem_tmp['lich_trinh_sd'] = '_hidden'; // gói
                $classItem_tmp['lich_trinh_sd__khoang_cach_moi_buoi'] = '_hidden'; // gói
                // /han_su_dung
                $classItem_tmp['han_su_dung'] = '_hidden'; // gói, thẻ: Vô hạn, ngày cụ thể, khoảng tg
                $classItem_tmp['hsd_ngay_cu_the'] = '_hidden'; //
                $classItem_tmp['hsd_khoang_thoi_gian'] = '_hidden';

                $classItem_tmp['product_apply'] = ''; // gói
                $classItem_tmp['loai_hang_hoa'] = '_hidden'; // thẻ - chọn nhiều
                $classItem_tmp['hang_hoa_ap_dung'] = '_hidden'; // thẻ - chọn nhiều
                $classItem_tmp['other'] = '_hidden'; // other - thẻ, gói

                $classItem_tmp['dichVu_sp'] = 'Nguyên liệu tiêu hao';
                $classItem_tmp['dichVu_sp_titleInput'] = 'Chọn nguyên liệu';
                $classItem_tmp['dichVu_sp_titlePrice'] = 'Giá vốn';

                //
                $classItem_tmp['title_code'] = 'Mã dịch vụ';
                $classItem_tmp['title_name'] = 'Tên dịch vụ';
                break;
            case 3:

                $classItem_tmp['title_col01'] = 'Gói dịch vụ, liệu trình'; // dich vu
                // check ẩn hiện
                $classItem_tmp['thoi_luong'] = '_hidden'; // dich vu
                $classItem_tmp['ton_kho'] = '_hidden'; // HH
                $classItem_tmp['product_group_id'] = ''; // HH, dich vu, gói
                $classItem_tmp['product_group_ids_apply'] = '_hidden'; //  thẻ(chọn nhiều)
                $classItem_tmp['thuong_hieu_id'] = ''; // HH, dich vu, gói, thẻ
                $classItem_tmp['vi_tri_id'] = '_hidden'; // HH
                $classItem_tmp['gia_von'] = '_hidden'; // HH
                $classItem_tmp['gia_ban'] = ''; // HH, dich vu, gói, thẻ
                $classItem_tmp['so_luong'] = '';
                $classItem_tmp['menh_gia'] = '_hidden'; // thẻ
                $classItem_tmp['trong_luong'] = '_hidden'; // HH
                $classItem_tmp['hoa_hong_nv'] = '_hidden'; // HH, dich vu
                $classItem_tmp['ban_truc_tiep'] = '_hidden'; // HH, dich vu
                $classItem_tmp['thuoc_tinh'] = '_hidden'; // HH, dich vu
                $classItem_tmp['don_vi_tinh'] = '_hidden'; // HH, dich vu
                // detail
                $classItem_tmp['dinh_muc_ton_it_nhat'] = '_hidden'; // HH
                $classItem_tmp['dinh_muc_ton_nhieu_nhat'] = '_hidden'; // HH (999999999)
                $classItem_tmp['mo_ta'] = ''; // HH, dich vu, gói, thẻ
                $classItem_tmp['ghi_chu'] = ''; // dich vu, gói,thẻ
                $classItem_tmp['nguyen_lieu_tieu_hao'] = '_hidden'; // dich vu

                $classItem_tmp['lich_trinh_sd'] = ''; // góig tg
                $classItem_tmp['lich_trinh_sd__khoang_cach_moi_buoi'] = '_hidden'; // gói
                if ($product->lich_trinh_sd != 1) {
                    $classItem_tmp['lich_trinh_sd__khoang_cach_moi_buoi'] = ''; // gói
                }

                $classItem_tmp['han_su_dung'] = ''; // gói, thẻ: Vô hạn, ngày cụ thể, khoản
                $classItem_tmp['hsd_ngay_cu_the'] = '_hidden'; //
                if ($product->han_su_dung == 2) {
                    $classItem_tmp['hsd_ngay_cu_the'] = ''; //
                }

                $classItem_tmp['hsd_khoang_thoi_gian'] = '_hidden';
                if ($product->han_su_dung == 3) {
                    $classItem_tmp['hsd_khoang_thoi_gian'] = '';
                }

                $classItem_tmp['product_apply'] = ''; // gói
                $classItem_tmp['loai_hang_hoa'] = '_hidden'; // thẻ - chọn nhiều
                $classItem_tmp['hang_hoa_ap_dung'] = '_hidden'; // thẻ - chọn nhiều
                $classItem_tmp['other'] = ''; // other - thẻ, gói

                $classItem_tmp['dichVu_sp'] = 'Dịch vụ trong gói';
                $classItem_tmp['dichVu_sp_titleInput'] = 'Chọn dịch vụ';
                $classItem_tmp['dichVu_sp_titlePrice'] = 'Giá bán lẻ';

                //
                $classItem_tmp['title_code'] = 'Mã gói';
                $classItem_tmp['title_name'] = 'Tên gói';
                break;
            case 4:
                $classItem_tmp['title_col01'] = 'Thẻ khách hàng'; // dich vu
                $classItem_tmp['thoi_luong'] = '_hidden'; // dich vu
                $classItem_tmp['ton_kho'] = '_hidden'; // HH
                $classItem_tmp['product_group_id'] = '_hidden'; // HH, dich vu, gói
                $classItem_tmp['product_group_ids_apply'] = ''; //  thẻ(chọn nhiều)
                $classItem_tmp['thuong_hieu_id'] = ''; // HH, dich vu, gói, thẻ
                $classItem_tmp['vi_tri_id'] = '_hidden'; // HH
                $classItem_tmp['gia_von'] = ''; // HH
                $classItem_tmp['gia_ban'] = ''; // HH, dich vu, gói, thẻ
                $classItem_tmp['so_luong'] = '_hidden';
                $classItem_tmp['menh_gia'] = '_hidden'; // thẻ
                $classItem_tmp['trong_luong'] = ''; // HH
                $classItem_tmp['hoa_hong_nv'] = '_hidden'; // HH, dich vu
                $classItem_tmp['ban_truc_tiep'] = '_hidden'; // HH, dich vu
                $classItem_tmp['thuoc_tinh'] = '_hidden'; // HH, dich vu
                $classItem_tmp['don_vi_tinh'] = ''; // HH, dich vu
                // detail
                $classItem_tmp['dinh_muc_ton_it_nhat'] = '_hidden'; // HH
                $classItem_tmp['dinh_muc_ton_nhieu_nhat'] = '_hidden'; // HH (999999999)
                $classItem_tmp['mo_ta'] = ''; // HH, dich vu, gói, thẻ
                $classItem_tmp['ghi_chu'] = ''; // dich vu, gói,thẻ
                $classItem_tmp['nguyen_lieu_tieu_hao'] = '_hidden'; // dich vu
                $classItem_tmp['lich_trinh_sd'] = '_hidden'; // gói
                $classItem_tmp['lich_trinh_sd__khoang_cach_moi_buoi'] = '_hidden'; // gói

                $classItem_tmp['han_su_dung'] = ''; // gói, thẻ: Vô hạn, ngày cụ thể, khoảng tg
                $classItem_tmp['hsd_ngay_cu_the'] = '_hidden'; //
                if ($product->han_su_dung == 2) {
                    $classItem_tmp['hsd_ngay_cu_the'] = ''; //
                }

                $classItem_tmp['hsd_khoang_thoi_gian'] = '_hidden';
                if ($product->han_su_dung == 3) {
                    $classItem_tmp['hsd_khoang_thoi_gian'] = '';
                }

                $classItem_tmp['hsd_ngay_cu_the'] = '_hidden'; //
                $classItem_tmp['hsd_khoang_thoi_gian'] = '_hidden';

                $classItem_tmp['product_apply'] = '_hidden'; // gói
                $classItem_tmp['loai_hang_hoa'] = ''; // thẻ - chọn nhiều
                $classItem_tmp['hang_hoa_ap_dung'] = '_hidden'; // thẻ - chọn nhiều

                $classItem_tmp['other'] = ''; // other - thẻ, gói

                $classItem_tmp['dichVu_sp'] = '';
                $classItem_tmp['dichVu_sp_titleInput'] = '';

                //
                $classItem_tmp['title_code'] = 'Mã thẻ';
                $classItem_tmp['title_name'] = 'Tên thẻ';
                break;
        }
        return $classItem_tmp;
    }

    function print_kiemKho(Request $rq, $id)
    {
        $info  = DB::table('admin_config')->find(1);
        $data = KiemKho::find($id);
        if (empty($data)) {
            return 'Hóa đơn đã bị xóa hoặc không tồn tại';
        }
        $nguoiTao = AdminUser::find(intval($data->create_by));
        $nguoiKiem = AdminUser::find(intval($data->nhan_vien_id));
        $dataDetail = KiemKhoDetail::select(
            'product_kiem_kho_detail.code',
            'product_kiem_kho_detail.product_id',
            'product_kiem_kho_detail.thuc_te',
            'product_kiem_kho_detail.ton_kho',
            'product_kiem_kho_detail.so_luong_lech',
            'product_kiem_kho_detail.gia_tri_lech',
            'product_kiem_kho_detail.gia_von',
            'products.name as product_name',
            'products.code as product_code',
        )
            ->where('data_id', $data->id)
            ->leftJoin('products', 'products.id', 'product_kiem_kho_detail.product_id')
            ->get();
        return view('admin.print.kiem_kho', [
            'data' => $data,
            'dataDetail' => $dataDetail,
            'info' => $info,
            'nguoiTao' => $nguoiTao,
            'nguoiKiem' => $nguoiKiem,
            'p' => $request->p ?? 0,
        ]);
    }

    function print_khachTraHang(Request $rq, $id)
    {
        $info  = DB::table('admin_config')->find(1);
        $data = KhachTraHang::find($id);
        if (empty($data)) {
            return 'Hóa đơn đã bị xóa hoặc không tồn tại';
        }
        $nguoiTao = AdminUser::find(intval($data->create_by));
        $khachHang = User::find(intval($data->khach_hang_id));
        $nguoiBan = AdminUser::find(intval($data->nhan_vien_id));
        $dataDetail = KhachTraHangDetail::select(
            'product_khach_tra_hang_detail.code',
            'product_khach_tra_hang_detail.product_id',

            'product_khach_tra_hang_detail.name',
            'product_khach_tra_hang_detail.gia_ban',
            'product_khach_tra_hang_detail.so_luong',
            'product_khach_tra_hang_detail.giam_gia',
            'product_khach_tra_hang_detail.phi_tra_hang',
            'product_khach_tra_hang_detail.tien_tra_khach',
            'product_khach_tra_hang_detail.is_percen',
            'product_khach_tra_hang_detail.is_draft',

            'products.name as product_name',
            'products.code as product_code',
        )
            ->where('data_id', $data->id)
            ->leftJoin('products', 'products.id', 'product_khach_tra_hang_detail.product_id')
            ->get();
        return view('admin.print.khach_tra_hang', [
            'data' => $data,
            'dataDetail' => $dataDetail,
            'info' => $info,
            'khachHang' => $khachHang,
            'nguoiTao' => $nguoiTao,
            'nguoiBan' => $nguoiBan,
            'p' => $request->p ?? 0,
        ]);
    }

    function print_traHangNCC(Request $rq, $id)
    {
        $info  = DB::table('admin_config')->find(1);
        $data = TraHangNCC::select(
            'product_tra_hang_ncc.id',
            'product_tra_hang_ncc.name',
            'product_tra_hang_ncc.code',
            'product_tra_hang_ncc.tong_tien_hang',
            'product_tra_hang_ncc.giam_gia',
            'product_tra_hang_ncc.phi_tra_hang',
            'product_tra_hang_ncc.thanh_tien',
            'product_tra_hang_ncc.so_luong',
            'product_tra_hang_ncc.create_by',
            'product_tra_hang_ncc.is_draft',

            'nha_cung_cap.name as ten_ncc',
            'admin_users.name as nhan_vien_tra',
            'hinh_thuc_thanh_toan.name as hinh_thuc_thanh_toan',
            'chi_nhanh.name as chi_nhanh',
        )
            ->leftJoin('nha_cung_cap', 'nha_cung_cap.id', 'product_tra_hang_ncc.nha_cung_cap_id')
            ->leftJoin('hinh_thuc_thanh_toan', 'hinh_thuc_thanh_toan.id', 'product_tra_hang_ncc.hinh_thuc_thanh_toan_id')
            ->leftJoin('admin_users', 'admin_users.id', 'product_tra_hang_ncc.nhan_vien_id')
            ->leftJoin('chi_nhanh', 'chi_nhanh.id', 'product_tra_hang_ncc.chi_nhanh_id')
            ->find($id);
        if (empty($data)) {
            return 'Hóa đơn đã bị xóa hoặc không tồn tại';
        }
        $nguoiTao = AdminUser::find(intval($data->create_by));
        $dataDetail = TraHangNCCDetail::select(
            'product_tra_hang_ncc_detail.id',
            'product_tra_hang_ncc_detail.code',
            'product_tra_hang_ncc_detail.product_id',

            'product_tra_hang_ncc_detail.name',
            'product_tra_hang_ncc_detail.gia_nhap',
            'product_tra_hang_ncc_detail.gia_tra_lai',
            'product_tra_hang_ncc_detail.thanh_tien',
            'product_tra_hang_ncc_detail.so_luong',

            'products.name as product_name',
            'products.code as product_code',
        )
            ->where('product_tra_hang_ncc_detail.data_id', $data->id)
            ->leftJoin('products', 'products.id', 'product_tra_hang_ncc_detail.product_id')
            ->get();
        return view('admin.print.tra_hang_ncc', [
            'data' => $data,
            'dataDetail' => $dataDetail,
            'info' => $info,
            'nguoiTao' => $nguoiTao,
            'p' => $request->p ?? 0,
        ]);
    }

    function print_nhapHang(Request $rq, $id)
    {
        $info  = DB::table('admin_config')->find(1);
        $data = NhapHang::select(
            'product_nhap_hang.id',
            'product_nhap_hang.code',
            'product_nhap_hang.name',
            'product_nhap_hang.tong_tien_hang',
            'product_nhap_hang.giam_gia',
            'product_nhap_hang.thanh_tien',
            'product_nhap_hang.so_luong',

            'product_nhap_hang.create_by',

            'nha_cung_cap.name as ten_ncc',
            'admin_users.name as nhan_vien',
            'hinh_thuc_thanh_toan.name as hinh_thuc_thanh_toan',
            'chi_nhanh.name as chi_nhanh',
        )
            ->leftJoin('nha_cung_cap', 'nha_cung_cap.id', 'product_nhap_hang.nha_cung_cap_id')
            ->leftJoin('hinh_thuc_thanh_toan', 'hinh_thuc_thanh_toan.id', 'product_nhap_hang.hinh_thuc_thanh_toan_id')
            ->leftJoin('admin_users', 'admin_users.id', 'product_nhap_hang.nhan_vien_id')
            ->leftJoin('chi_nhanh', 'chi_nhanh.id', 'product_nhap_hang.chi_nhanh_id')
            ->find($id);
        if (empty($data)) {
            return 'Hóa đơn đã bị xóa hoặc không tồn tại';
        }
        $nguoiTao = AdminUser::find(intval($data->create_by));
        $dataDetail = NhapHangDetail::select(
            'product_nhap_hang_detail.product_id',

            'product_nhap_hang_detail.gia_nhap',
            'product_nhap_hang_detail.giam_gia',
            'product_nhap_hang_detail.so_luong',
            'product_nhap_hang_detail.thanh_tien',

            'products.name as product_name',
            'products.code as product_code',
        )
            ->where('product_nhap_hang_detail.data_id', $data->id)
            ->leftJoin('products', 'products.id', 'product_nhap_hang_detail.product_id')
            ->get();
        return view('admin.print.nhap_hang', [
            'data' => $data,
            'dataDetail' => $dataDetail,
            'info' => $info,
            'nguoiTao' => $nguoiTao,
            'p' => $request->p ?? 0,
        ]);
    }


    function print_xuatHuy(Request $rq, $id)
    {
        $info  = DB::table('admin_config')->find(1);
        $data = XuatHuy::select(
            'product_xuat_huy.id',
            'product_xuat_huy.code',
            'product_xuat_huy.name',

            'product_xuat_huy.gia_tri_huy',
            'product_xuat_huy.so_luong_huy',

            'product_xuat_huy.note',
            'product_xuat_huy.is_draft',

            'product_xuat_huy.create_by',

            'ly_do_xuat_huy.name as lydo',
            'admin_users.name as nhan_vien',
            'chi_nhanh.name as chi_nhanh',
        )
            ->leftJoin('ly_do_xuat_huy', 'ly_do_xuat_huy.id', 'product_xuat_huy.ly_do_xuat_huy_id')
            ->leftJoin('admin_users', 'admin_users.id', 'product_xuat_huy.nhan_vien_id')
            ->leftJoin('chi_nhanh', 'chi_nhanh.id', 'product_xuat_huy.chi_nhanh_id')
            ->find($id);
        if (empty($data)) {
            return 'Hóa đơn đã bị xóa hoặc không tồn tại';
        }
        $nguoiTao = AdminUser::find(intval($data->create_by));
        $dataDetail = XuatHuyDetail::select(
            'product_xuat_huy_detail.product_id',

            'product_xuat_huy_detail.so_luong_huy',
            'product_xuat_huy_detail.gia_von',
            'product_xuat_huy_detail.gia_tri_huy',
            'product_xuat_huy_detail.ton_kho_truoc_khi_huy',
            'product_xuat_huy_detail.ton_kho_sau_khi_huy',

            'products.name as product_name',
            'products.code as product_code',
        )
            ->where('product_xuat_huy_detail.data_id', $data->id)
            ->leftJoin('products', 'products.id', 'product_xuat_huy_detail.product_id')
            ->get();
        return view('admin.print.xuat_huy', [
            'data' => $data,
            'dataDetail' => $dataDetail,
            'info' => $info,
            'nguoiTao' => $nguoiTao,
            'p' => $request->p ?? 0,
        ]);
    }

    public function huyDon_KhachTraHang($id)
    {
        // update hdon
        $hoaDon = KhachTraHang::find($id);
        $hoaDon->is_recycle_bin = 1;
        $hoaDon->save();

        $update = [
            'is_recycle_bin' => 1
        ];

        // update detail
        $detail = KhachTraHangDetail::where('data_id', $hoaDon->id)->get();
        foreach ($detail as $d) {
            $d->is_recycle_bin = 1;
            $d->save();

            // update SL Product
            $product = Product::find($d->product_id);
            $product->ton_kho += $d->so_luong;
            $product->save();
        }

        // data update
        $update = ['is_recycle_bin' => 1];

        // update so_quy
        SoQuy::where('loai_chung_tu', 'product_khach_tra_hang')->where('chung_tu_id', $hoaDon->id)->update($update);

        // update phieu_chi
        PhieuChi::where('loai_chung_tu', 'product_khach_tra_hang')->where('chung_tu_id', $hoaDon->id)->update($update);

        // update công nợ
        CongNo::where('loai_chung_tu', 'product_khach_tra_hang')->where('chung_tu_id', $hoaDon->id)->update($update);

        return $this->sendSuccessResponse($id);
    }

    public function huyDon_NhapHang($id)
    {
        // update hdon
        $hoaDon = NhapHang::find($id);
        $hoaDon->is_recycle_bin = 1;
        $hoaDon->save();

        $update = [
            'is_recycle_bin' => 1
        ];

        // update detail
        $detail = NhapHangDetail::where('data_id', $hoaDon->id)->get();
        foreach ($detail as $d) {
            $d->is_recycle_bin = 1;
            $d->save();

            // update SL Product
            $product = Product::find($d->product_id);
            $product->ton_kho += $d->so_luong;
            $product->save();
        }

        $update = ['is_recycle_bin' => 1];

        // update so_quy
        SoQuy::where('loai_chung_tu', 'product_nhap_hang')->where('chung_tu_id', $hoaDon->id)->update($update);

        // update phieu_chi
        PhieuChi::where('loai_chung_tu', 'product_nhap_hang')->where('chung_tu_id', $hoaDon->id)->update($update);

        // update công nợ
        CongNo::where('loai_chung_tu', 'product_nhap_hang')->where('chung_tu_id', $hoaDon->id)->update($update);

        return $this->sendSuccessResponse($id);
    }

    public function huyDon_TraHangNCC($id)
    {
        // update hdon
        $hoaDon = TraHangNCC::find($id);
        $hoaDon->is_recycle_bin = 1;
        $hoaDon->save();

        // update detail
        $detail = TraHangNCCDetail::where('data_id', $hoaDon->id)->get();
        foreach ($detail as $d) {
            $d->is_recycle_bin = 1;
            $d->save();

            // update SL Product
            $product = Product::find($d->product_id);
            $product->ton_kho -= $d->so_luong;
            $product->save();
        }

        $update = ['is_recycle_bin' => 1];

        // update phieu_thu
        PhieuThu::where('loai_chung_tu', 'product_tra_hang_ncc')->where('chung_tu_id', $hoaDon->id)->update($update);

        // update so_quy
        SoQuy::where('loai_chung_tu', 'product_tra_hang_ncc')->where('chung_tu_id', $hoaDon->id)->update($update);

        // update công nợ
        CongNo::where('loai_chung_tu', 'product_tra_hang_ncc')->where('chung_tu_id', $hoaDon->id)->update($update);

        return $this->sendSuccessResponse($id);
    }

    public function huyDon_XuatHuy($id)
    {
        // update hdon
        $hoaDon = XuatHuy::find($id);
        $hoaDon->is_recycle_bin = 1;
        $hoaDon->save();

        // update xuat_huy_detail
        $detail = XuatHuyDetail::where('data_id', $hoaDon->id)->get();
        foreach ($detail as $d) {
            $d->is_recycle_bin = 1;
            $d->save();

            // update SL Product
            $product = Product::find($d->product_id);
            $product->ton_kho -= $d->so_luong_huy;
            $product->save();
        }

        return $this->sendSuccessResponse($id);
    }
}
