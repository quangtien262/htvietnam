<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Services\Admin\TblService;
use Illuminate\Support\Facades\DB;

class LuckyController extends Controller
{

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $voucher = DB::connection('sqlsrv')->table('DM_GiaBan')->get();

        // foreach ($voucher as $vc) {
        //     $count = DB::table('voucher')->where('lucky_id', $vc->ID)->count();
        //     if ($count > 0) {
        //         continue;
        //     }
        //     DB::table('voucher')->insert([
        //         'lucky_id' => $vc->ID,
        //         'code' => $vc->MaGiaBan,
        //         'name' => $vc->TenGiaBan,
        //         'ap_dung_chi_nhanh_id' => $vc->ApDung,
        //         'day_end' => $vc->DenNgay,
        //         'day_start' => $vc->TuNgay,
        //         'time_start' => $vc->TuGio,
        //         'time_end' => $vc->DenGio,
        //         'description' => $vc->GhiChu,
        //         'create_by' => 1,
        //         'created_at' => $vc->NgayLap,

        //     ]);
        // }
        // $chiNhanh = DB::connection('sqlsrv')->table('DM_DonVi')->get();
        // foreach ($chiNhanh as $vc) {
        //     $count = DB::table('chi_nhanh')->where('lucky_id', $vc->ID)->count();
        //     if ($count > 0) {
        //         continue;
        //     }
        //     DB::table('chi_nhanh')->insert([
        //         'lucky_id' => $vc->ID,
        //         'code' => $vc->MaDonVi,
        //         'name' => $vc->TenDonVi,
        //         'address' => $vc->DiaChi,
        //         'phone' => $vc->SoDienThoai,
        //         'create_by' => 1,
        //         'created_at' => $vc->NgayTao,

        //     ]);
        // }

        // $donVi = DB::connection('sqlsrv')->table('DM_DonViTinh')->get();
        // foreach ($donVi as $vc) {
        //     $count = DB::table('product_unit')->where('lucky_id', $vc->ID)->count();
        //     if ($count > 0) {
        //         continue;
        //     }
        //     DB::table('product_unit')->insert([
        //         'lucky_id' => $vc->ID,
        //         'name' => $vc->TenDonViTinh,
        //         'description' => $vc->GhiChu,
        //         'create_by' => 1,
        //         'created_at' => $vc->NgayTao,

        //     ]);
        // }

        // $groupHh = DB::connection('sqlsrv')->table('DM_NhomHangHoa')->get();
        // foreach ($groupHh as $vc) {
        //     $count = DB::table('product_group')->where('lucky_id', $vc->ID)->count();
        //     if ($count > 0) {
        //         continue;
        //     }
        //     DB::table('product_group')->insert([
        //         'lucky_id' => $vc->ID,
        //         'code' => $vc->MaNhom,
        //         'name' => $vc->TenNhom,
        //         'description' => $vc->GhiChu,
        //         'create_by' => 1,
        //         'created_at' => $vc->NgayTao

        //     ]);
        // }
        // $product = DB::connection('sqlsrv')->table('DM_HangHoa')->get();

        // foreach ($product as $vc) {
        //     $dv = DB::table('product_unit')->where('lucky_id', $vc->ID_DonViTinh)->first();
        //     $hh = DB::table('product_group')->where('lucky_id', $vc->ID_NhomHang)->first();
        //     $count = DB::table('product')->where('lucky_id', $vc->ID)->count();
        //     if ($count > 0) {
        //         continue;
        //     }
        //     DB::table('product')->insert([
        //         'lucky_id' => $vc->ID,
        //         'code' => $vc->MaHangHoa,
        //         'name' => $vc->TenHangHoa,
        //         'don_vi_id' => $dv->id,
        //         'product_group_id' => $hh->id,
        //         'price' => $vc->GiaBanLe,
        //         'description' => $vc->GhiChu,
        //         'create_by' => 1,
        //         'created_at' => $vc->NgayTao,

        //     ]);
        // }

        // $kho = DB::connection('sqlsrv')->table('DM_Kho')->get();
        // foreach ($kho as $vc) {
        //     $count = DB::table('warehouse')->where('lucky_id', $vc->ID)->count();
        //     if ($count > 0) {
        //         continue;
        //     }
        //     DB::table('warehouse')->insert([
        //         'lucky_id' => $vc->ID,
        //         'code' => $vc->MaKho,
        //         'name' => $vc->TenKho,
        //         'address' => $vc->DiaDiem,
        //         'description' => $vc->GhiChu,
        //         'create_by' => 1,
        //         'created_at' => $vc->NgayTao,

        //     ]);
        // }

        // $KhuVuc = DB::connection('sqlsrv')->table('DM_KhuVuc')->get();

        // foreach ($KhuVuc as $vc) {
        //     $count = DB::table('khu_vuc_phong_giuong')->where('lucky_id', $vc->ID)->count();
        //     if ($count > 0) {
        //         continue;
        //     }
        //     DB::table('khu_vuc_phong_giuong')->insert([
        //         'lucky_id' => $vc->ID,
        //         'name' => $vc->TenKhuVuc,
        //         'description' => $vc->GhiChu,
        //         'create_by' => 1,
        //         'created_at' => $vc->NgayTao,

        //     ]);
        // }

        // $km = DB::connection('sqlsrv')->table('DM_KhuyenMai')->get();

        // foreach ($km as $vc) {
        //     $count = DB::table('promotion')->where('lucky_id', $vc->ID)->count();
        //     if ($count > 0) {
        //         continue;
        //     }
        //     DB::table('promotion')->insert([
        //         'lucky_id' => $vc->ID,
        //         'name' => $vc->TenKhuyenMai,
        //         'code' => $vc->MaKhuyenMai,
        //         'description' => $vc->GhiChu,
        //         'day_of_week_id' => $vc->NgayTrongTuan,
        //         'day_start' => $vc->TuNgay,
        //         'day_end' => $vc->DenNgay,
        //         'create_by' => 1,
        //         'ngay_tao' => $vc->NgayTao,

        //     ]);
        // }

        // $nh = DB::connection('sqlsrv')->table('DM_NganHang')->get();

        // foreach ($nh as $vc) {
        //     $count = DB::table('ngan_hang_cart')->where('lucky_id', $vc->ID)->count();
        //     if ($count > 0) {
        //         continue;
        //     }
        //     DB::table('ngan_hang_cart')->insert([
        //         'lucky_id' => $vc->ID,
        //         'name' => $vc->TenNganHang,
        //         'code' => $vc->MaNganHang,
        //         'description' => $vc->GhiChu,
        //         'create_by' => 1,
        //         'created_at' => $vc->NgayTao,

        //     ]);
        // }

        // $nv = DB::connection('sqlsrv')->table('DM_NhanVien')->get();

        // foreach ($nv as $vc) {
        //     $count = DB::table('admin_users')->where('lucky_id', $vc->ID)->count();
        //     if ($count > 0) {
        //         continue;
        //     }
        //     DB::table('admin_users')->insert([
        //         'lucky_id' => $vc->ID,
        //         'name' => $vc->TenNhanVien,
        //         'code' => $vc->MaNhanVien,
        //         'birthday' => $vc->NgaySinh,
        //         'code' => $vc->MaNhanVien,
        //         'noi_cap' => $vc->NguyenQuan,
        //         'phone' => $vc->DienThoaiDiDong,
        //         'cmnd' => $vc->SoCMND,
        //         'address' => $vc->DiaChiCoQuan,
        //         'email' => $vc->Email,
        //         //'gioi_tinh_id' chưa có bnagr nên chưa làm
        //         'description' => $vc->GhiChu,
        //         'create_by' => 1,
        //         'created_at' => $vc->NgayTao,

        //     ]);
        // }

        // //Nhóm đối tượng
        // $nhomDt = DB::connection('sqlsrv')->table('DM_NhomDoiTuong')->get();

        // foreach ($nhomDt as $vc) {
        //     $count = DB::table('customer_group')->where('lucky_id', $vc->ID)->count();
        //     if ($count > 0) {
        //         continue;
        //     }
        //     DB::table('customer_group')->insert([
        //         'lucky_id' => $vc->ID,
        //         'name' => $vc->TenNhom,
        //         'code' => $vc->MaNhom,
        //         'description' => $vc->GhiChu,
        //         'create_by' => 1,
        //         'created_at' => $vc->NgayTao,

        //     ]);
        // }
        // //Nhóm thẻ
        // $nhomThe = DB::connection('sqlsrv')->table('DM_NhomThe')->get();

        // foreach ($nhomThe as $vc) {
        //     $count = DB::table('card_group')->where('lucky_id', $vc->ID)->count();
        //     if ($count > 0) {
        //         continue;
        //     }
        //     DB::table('card_group')->insert([
        //         'lucky_id' => $vc->ID,
        //         'name' => $vc->TenNhomThe,
        //         'code' => $vc->MaNhomThe,
        //         'description' => $vc->GhiChu,
        //         'create_by' => 1,
        //         'created_at' => $vc->NgayTao,

        //     ]);
        // }

        // $dvQuiDoi = DB::connection('sqlsrv')->table('DonViQuiDoi')->get();

        // foreach ($dvQuiDoi as $vc) {
        //     $dv = DB::table('product_unit')->where('lucky_id', $vc->ID_DonViTinh)->first();
        //     $count = DB::table('product')->where('lucky_id', $vc->ID)->count();
        //     if ($count > 0) {
        //         continue;
        //     }
        //     DB::table('product')->insert([
        //         'lucky_id' => $vc->ID,
        //         'don_vi_id' => $dv->id,
        //         'price' => $vc->GiaBan,
        //         'capital_price' => $vc->GiaNhap,
        //         'description' => $vc->GhiChu,
        //         'create_by' => 1,
        //         'created_at' => $vc->NgayTao,

        //     ]);
        // }

        // $kh = DB::connection('sqlsrv')->table('DM_DoiTuong')->get();

        // foreach ($kh as $vc) {
        //     $dt = DB::table('customer_group')->where('lucky_id', $vc->ID_NhomDoiTuong)->first();
        //     $count = DB::table('users')->where('lucky_id', $vc->ID)->count();
        //     if ($count > 0) {
        //         continue;
        //     }
        //     DB::table('users')->insert([
        //         'lucky_id' => $vc->ID,
        //         'code' => $vc->MaDoiTuong,
        //         'name' => $vc->TenDoiTuong,
        //         'customer_group_id' => $dt->id,
        //         'phone' => $vc->DienThoai,
        //         'email' => $vc->Email,
        //         'tax_code' => $vc->MaSoThue,
        //         'note' => $vc->GhiChu,
        //         'create_by' => 1,
        //         'created_at' => $vc->NgayNhap,

        //     ]);
        // }
        // die;

        // $banLe = DB::connection('sqlsrv')->table('HoaDonBanLe')->get();

        // foreach ($banLe as $vc) {
        //     $dt = DB::table('users')->where('lucky_id', $vc->ID_DoiTuong)->first();

        //     $count = DB::table('hoa_don')->where('lucky_id', $vc->ID)->count();
        //     if ($count > 0) {
        //         continue;
        //     }
        //     DB::table('hoa_don')->insert([
        //         'lucky_id' => $vc->ID,
        //         'code' => $vc->MaHoaDon,
        //         'ngay_gio' => $vc->NgayLapHoaDon,
        //         'time_start' => $vc->GioVao,
        //         'time_end' => $vc->GioRa,
        //         'user_id' => $dt->id,
        //         'tong_tien' => $vc->TongTienHang,
        //         'thanh_toan' => $vc->PhaiThanhToan,
        //         'giam_gia' => $vc->TongGiamGia,
        //         'create_by' => 1,
        //         'created_at' => $vc->NgayVaoSo,
        //     ]);
        // }





        // return 'ok';
    }
}
