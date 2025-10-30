<?php

namespace App\Services\Admin;

use App\Models\Web\News;
use App\Models\Web\NewsData;
use App\Services\Service;
use Goutte\Client;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\DomCrawler\Crawler;
use App\Models\Web\Menu;
use Illuminate\Support\Facades\DB;

/**skip(0)
 * Class CompanyService
 * @package App\Services\Users
 */
class CrawlService
{
    protected $staticFunctions = [];

    const LIMIT = 500000;

    static function getAllData($table) {
        $data = DB::table($table)->get();
        $result = [];
        foreach($data as $u) { 
             $result[$u->lucky_id] = $u->id;
        }
        return $result;
    }

    static function getAdminUserID($luckyID)
    {
        // check theo ID xem đã có trên db chưa
        $adminUser = DB::table('admin_users')->where('lucky_id', $luckyID)->first();
        if (!empty($adminUser)) {
            return $adminUser->id;
        }
        // // check theo name xem đã có trên db chưa
        $adminUser = DB::table('admin_users')->where('name', $luckyID)->first();
        if (!empty($adminUser)) {
            return $adminUser->id;
        }

        try {
            // tìm theo ID trên lucky
            $nv = DB::connection('sqlsrv')->table('DM_NhanVien')->where('ID', $luckyID)->first();
        } catch (\Throwable $th) {
            //throw $th;
        }

        if (empty($nv)) {
            // tìm theo name trên lucky
            $nv = DB::connection('sqlsrv')->table('DM_NhanVien')->where('TenNhanVien', $luckyID)->first();
            if (empty($nv)) {
                return 0;
            }
        }

        return DB::table('admin_users')->insertGetId([
            'lucky_id' => $nv->ID,
            'name' => $nv->TenNhanVien,
            'code' => $nv->MaNhanVien,
            'birthday' => $nv->NgaySinh,
            'code' => $nv->MaNhanVien,
            'noi_cap' => $nv->NguyenQuan,
            'phone' => $nv->DienThoaiDiDong,
            'cmnd' => $nv->SoCMND,
            'address' => $nv->DiaChiCoQuan,
            'email' => $nv->Email,
            'description' => $nv->GhiChu,
            'create_by' =>  1,
            'created_at' => $nv->NgayTao,
            'gioi_tinh_id' => $nv->GioiTinh == 1 ? 1 : 2,
        ]);
    }
    static function getUserID($luckyId)

    {
        // check tren db
        $user = DB::table('users')->where('lucky_id', $luckyId)->first();
        if (!empty($user)) {
            return $user->id;
        }

        // check trên lucky
        $kh = DB::connection('sqlsrv')->table('DM_DoiTuong')->where('ID', $luckyId)->first();
        if (empty($kh)) {
            dd($luckyId);
            return 0;
        }

        $dt = DB::table('customer_group')->where('lucky_id', $kh->ID_NhomDoiTuong)->first();

        return DB::table('users')->insertGetId([
            'lucky_id' => $kh->ID,
            'code' => $kh->MaDoiTuong,
            'name' => $kh->TenDoiTuong,
            'customer_group_id' => !empty($dt) ? $dt->id : 0,
            'phone' => $kh->DienThoai,
            'email' => $kh->Email,
            'tax_code' => $kh->MaSoThue,
            'note' => $kh->GhiChu,
            'create_by' =>  1,
            'created_at' => $kh->NgayNhap,
            'ngay_sinh' => $kh->NgaySinh_NgayTLap,
            'updated_at' => $kh->NgayGiaoDichGanNhat,

        ]);
    }

    static function nhomDoiTuong_CustomerGroup()
    {
        // //Nhóm đối tượng
        $nhomDt = DB::connection('sqlsrv')->table('DM_NhomDoiTuong')->get();
        $data = [];
        $idx = 0;
        foreach ($nhomDt as $vc) {
            $idx++;
            $count = DB::table('customer_group')->where('lucky_id', $vc->ID)->count();
            if ($count > 0) {
                continue;
            }

            // $nv = self::getAdminUserID($vc->UserTao);

            $data[] = [
                'lucky_id' => $vc->ID,
                'name' => $vc->TenNhom,
                'code' => $vc->MaNhom,
                'description' => $vc->GhiChu,
                'create_by' => self::getAdminUserID($vc->UserTao),
                'created_at' => $vc->NgayTao,
            ];

            if ($idx == 100) {
                DB::table('customer_group')->insert($data);
                $data = [];
                $idx = 0;
            }
        }
        if (!empty($data)) {
            DB::table('customer_group')->insert($data);
        }
    }


    static function giaBan_voucher()
    {
        $voucher = DB::connection('sqlsrv')->table('DM_GiaBan')->get();
        $data = [];
        $idx = 0;
        foreach ($voucher as $vc) {
            $idx++;
            $count = DB::table('voucher')->where('lucky_id', $vc->ID)->count();
            if ($count > 0) {
                continue;
            }
            $data[] = [
                'lucky_id' => $vc->ID,
                'code' => $vc->MaGiaBan,
                'name' => $vc->TenGiaBan,
                'ap_dung_chi_nhanh_id' => $vc->ApDung,
                'day_end' => $vc->DenNgay,
                'day_start' => $vc->TuNgay,
                'time_start' => $vc->TuGio,
                'time_end' => $vc->DenGio,
                'description' => $vc->GhiChu,
                'create_by' =>  1,
                'created_at' => $vc->NgayLap,
                'day_of_week_id' => $vc->NgayTrongTuan,
                // 'users_id' => 0
            ];
            if ($idx == 100) {
                DB::table('voucher')->insert($data);
                $data = [];
                $idx = 0;
            }
        }
        if (!empty($data)) {
            DB::table('voucher')->insert($data);
        }
    }
    static function donVi_chiNhanhPhongBan($com)
    {
        $chiNhanh = DB::connection('sqlsrv')->table('DM_DonVi')->get();
   
        $data = [];
        $idx = 0;
        foreach ($chiNhanh as $vc) {
            $count = DB::table('chi_nhanh')->where('lucky_id', $vc->ID)->count();
            if ($count > 0) {
                continue;
            }
            $data[] = [
                'lucky_id' => $vc->ID,
                'code' => $vc->MaDonVi,
                'name' => $vc->TenDonVi,
                'address' => $vc->DiaChi,
                'phone' => $vc->SoDienThoai,
                'create_by' =>  1,
                'created_at' => $vc->NgaySuaCuoi ,

            ];
        }
        DB::table('chi_nhanh')->insert($data);
    }
    static function donViTinh_ProductUnit()
    {
        $donVi = DB::connection('sqlsrv')->table('DM_DonViTinh')->get();
        $data = [];
        $idx = 0;
        foreach ($donVi as $vc) {
            $idx++;
            $count = DB::table('product_unit')->where('lucky_id', $vc->ID)->count();
            // $adminUser = DB::table('admin_users')->where('lucky_id', $vc->UserTao)->first();
            // $adminUserId = self::getAdminUserID($vc->UserTao);
            if ($count > 0) {
                continue;
            }
            $data[]  = [
                'lucky_id' => $vc->ID,
                'name' => $vc->TenDonViTinh,
                'description' => $vc->GhiChu,
                'create_by' =>  1,
                'created_at' => $vc->NgayTao,
            ];
            if ($idx == 100) {
                DB::table('product_unit')->insert($data);
                $data = [];
                $idx = 0;
            }
        }
        if (!empty($data)) {
            DB::table('product_unit')->insert($data);
        }
    }
    static function donVi()
    {
        $groupHh = DB::connection('sqlsrv')->table('DM_DonVi')->get();
        $data = [];
        $idx = 0;
        foreach ($groupHh as $vc) {
            $idx++;
            $count = DB::table('don_vi')->where('lucky_id', $vc->ID)->count();
            // $adminUser = DB::table('admin_users')->where('lucky_id', $vc->UserSuaCuoi)->first();
            // $adminUserId = self::getAdminUserID($vc->UserSuaCuoi);
            if ($count > 0) {
                continue;
            }
            $data[] = [
                'lucky_id' => $vc->ID,
                'code' => $vc->MaDonVi,
                'name' => $vc->TenDonVi,
                'create_by' =>  1,
                'created_at' => $vc->NgaySuaCuoi
            ];
            if ($idx == 100) {
                DB::table('don_vi')->insert($data);
                $data = [];
                $idx = 0;
            }
        }
        if (!empty($data)) {
            DB::table('don_vi')->insert($data);
        }
    }
    static function nhomHangHoa_ProductGroup()
    {
        $groupHh = DB::connection('sqlsrv')->table('DM_NhomHangHoa')->get();
        $data = [];
        $idx = 0;
        foreach ($groupHh as $vc) {
            $idx++;
            $count = DB::table('product_group')->where('lucky_id', $vc->ID)->count();
            $adminUser = DB::table('admin_users')->where('lucky_id', $vc->UserTao)->first();

            if ($count > 0) {
                continue;
            }
            $hh = DB::table('don_vi')->where('lucky_id', $vc->ID_DonVis)->first();
            $dt = 0;
            if (!empty($hh->id)) {
                $dt = $hh->id;
            }
            $data[] = [
                'lucky_id' => $vc->ID,
                'code' => $vc->MaNhom,
                'name' => $vc->TenNhom,
                'description' => $vc->GhiChu,
                'create_by' =>  $adminUser ? $adminUser->id : 1,
                'created_at' => $vc->NgayTao,
                // 'don_vi_id' => $dt
            ];
            if ($idx == 100) {
                DB::table('product_group')->insert($data);
                $data = [];
                $idx = 0;
            }
        }
        if (!empty($data)) {
            DB::table('product_group')->insert($data);
        }
    }
    static function HangHoa_Product()
    {
        $product = DB::connection('sqlsrv')

            ->table('DM_HangHoa')
            ->select(
                'DM_HangHoa.ID as ID',
                'DM_HangHoa.MaHangHoa as MaHangHoa',
                'DM_HangHoa.TenHangHoa as TenHangHoa',
                'DM_HangHoa.GiaNhap as GiaNhap',
                'DM_HangHoa.GiaBanLe as GiaBanLe',
                'DM_HangHoa.ID_DonViTinh as ID_DonViTinh',
                'DM_HangHoa.UserTao as UserTao',
                'DM_HangHoa.ID_NhomHang as ID_NhomHang',
                'DM_HangHoa.GhiChu as GhiChu',
                'DM_HangHoa.NgayTao as NgayTao',
                'DonViQuiDoi.LaDonViChuan as LaDonViChuan',
                'DonViQuiDoi.TyLeChuyenDoi as TyLeChuyenDoi'


            )
            ->leftJoin('DonViQuiDoi', 'DonViQuiDoi.ID_HangHoa', 'DM_HangHoa.ID')
            ->orderBy('DM_HangHoa.NgayTao', 'asc') // Specify the table alias for NgayTao
            ->skip(0)
            ->take(5000)
            ->get();

        $data = [];
        $idx = 0;
        foreach ($product as $idx => $vc) {
            $idx++;
            $dv = DB::table('product_unit')->where('lucky_id', $vc->ID_DonViTinh)->first();
            $adminUser = DB::table('admin_users')->where('lucky_id', $vc->UserTao)->first();

            // dd($vc->ID_DonViTinh);
            $hh = DB::table('product_group')->where('lucky_id', $vc->ID_NhomHang)->first();

            $count = DB::table('products')->where('lucky_id', $vc->ID)->count();
            if ($count > 0) {
                continue;
            }
            $donViTinh = 0;
            if (!empty($dv->id)) {
                $donViTinh = $dv->id;
            }

            $nhomHangHoa = 0;
            if (!empty($hh->id)) {
                $nhomHangHoa = $hh->id;
            }
            $data[] = [
                'lucky_id' => $vc->ID,
                'code' => $vc->MaHangHoa,
                'name' => $vc->TenHangHoa,
                'don_vi_id' => $donViTinh,
                'product_group_id' => $nhomHangHoa,
                'gia_ban' => $vc->GiaBanLe,
                'description' => $vc->GhiChu,
                'create_by' =>  $adminUser ? $adminUser->id : 1,
                'created_at' => $vc->NgayTao,
                // 'ty_le_chuyen_doi' => $vc->TyLeChuyenDoi,
                // 'don_vi_chuan' => $vc->LaDonViChuan,
                // 'gia_nhap' => $vc->GiaNhap,
                // 'gia_ban' => $vc->GiaBanLe,
            ];
            if ($idx == 100) {
                DB::table('products')->insert($data);
                $data = [];
                $idx = 0;
            }
        }
        if (!empty($data)) {
            DB::table('products')->insert($data);
        }
    }
    static function kho()
    {
        $kho = DB::connection('sqlsrv')->table('DM_Kho')->get();
        foreach ($kho as $vc) {
            $count = DB::table('warehouse')->where('lucky_id', $vc->ID)->count();
            $adminUser = DB::table('admin_users')->where('lucky_id', $vc->UserTao)->first();

            if ($count > 0) {
                continue;
            }
            $hh = DB::table('don_vi')->where('lucky_id', $vc->ID_DonVis)->first();
            $dt = 0;
            if (!empty($hh->id)) {
                $dt = $hh->id;
            }
            DB::table('warehouse')->insert([
                'lucky_id' => $vc->ID,
                'code' => $vc->MaKho,
                'name' => $vc->TenKho,
                'address' => $vc->DiaDiem,
                'description' => $vc->GhiChu,
                'create_by' =>  $adminUser ? $adminUser->id : 1,
                'created_at' => $vc->NgayTao,
                'don_vi_id' => $dt
            ]);
        }
    }
    static function khuVuc()
    {
        $KhuVuc = DB::connection('sqlsrv')->table('DM_KhuVuc')->get();
        $data = [];
        $idx = 0;
        foreach ($KhuVuc as $vc) {
            $idx++;
            $count = DB::table('khu_vuc_phong_giuong')->where('lucky_id', $vc->ID)->count();
            $adminUser = DB::table('admin_users')->where('lucky_id', $vc->UserTao)->first();

            if ($count > 0) {
                continue;
            }
            $data[] = [
                'lucky_id' => $vc->ID,
                'name' => $vc->TenKhuVuc,
                'code' => $vc->MaKhuVuc,
                'description' => $vc->GhiChu,
                'create_by' =>  $adminUser ? $adminUser->id : 1,
                'created_at' => $vc->NgayTao,

            ];
            if ($idx == 100) {
                DB::table('khu_vuc_phong_giuong')->insert($data);
                $data = [];
                $idx = 0;
            }
        }
        if (!empty($data)) {
            DB::table('khu_vuc_phong_giuong')->insert($data);
        }
    }
    static function khuyenMai_Promotion()
    {
        $km = DB::connection('sqlsrv')->table('DM_KhuyenMai')->get();
        // dd($km);
        foreach ($km as $vc) {
            $count = DB::table('promotion')->where('lucky_id', $vc->ID)->count();
            $adminUser = DB::table('admin_users')->where('lucky_id', $vc->UserTao)->first();

            if ($count > 0) {
                continue;
            }
            $hh = DB::table('customer_group')->where('lucky_id', $vc->ID_NhomDoiTuongs)->first();

            DB::table('promotion')->insert([
                'lucky_id' => $vc->ID,
                'name' => $vc->TenKhuyenMai,
                'code' => $vc->MaKhuyenMai,
                'description' => $vc->GhiChu,
                'day_of_week_id' => $vc->NgayTrongTuan,
                'day_start' => $vc->TuNgay,
                'day_end' => $vc->DenNgay,
                'create_by' =>  $adminUser ? $adminUser->id : 1,
                'ngay_tao' => $vc->NgayTao,
                'customer_group_id' => !empty($hh) ? $hh->id : 0,
            ]);
        }
    }
    static function nganHang_NganHangCart()
    {
        $nh = DB::connection('sqlsrv')->table('DM_NganHang')->get();

        foreach ($nh as $vc) {
            $count = DB::table('ngan_hang_cart')->where('lucky_id', $vc->ID)->count();
            $adminUser = DB::table('admin_users')->where('lucky_id', $vc->UserTao)->first();

            if ($count > 0) {
                continue;
            }
            DB::table('ngan_hang_cart')->insert([
                'lucky_id' => $vc->ID,
                'name' => $vc->TenNganHang,
                'code' => $vc->MaNganHang,
                'description' => $vc->GhiChu,
                'create_by' =>  $adminUser ? $adminUser->id : 1,
                'created_at' => $vc->NgayTao,

            ]);
        }
    }
    static function nhanVien_AdminUsers()
    {
        $nv = DB::connection('sqlsrv')->table('DM_NhanVien')->get();
        $data = [];
        $idx = 0;
        foreach ($nv as $vc) {
            $idx++;
            $count = DB::table('admin_users')->where('lucky_id', $vc->ID)->count();
            $adminUser = DB::table('admin_users')->where('lucky_id', $vc->UserTao)->first();

            if ($count > 0) {
                continue;
            }
            $data[] = [
                'lucky_id' => $vc->ID,
                'name' => $vc->TenNhanVien,
                // 'code' => $vc->MaNhanVien,
                'birthday' => $vc->NgaySinh,
                'code' => $vc->MaNhanVien,
                'noi_cap' => $vc->NguyenQuan,
                'phone' => $vc->DienThoaiDiDong,
                'cmnd' => $vc->SoCMND,
                'address' => $vc->DiaChiCoQuan,
                'email' => $vc->Email,
                'description' => $vc->GhiChu,
                'create_by' =>  $adminUser ? $adminUser->id : 1,
                'created_at' => $vc->NgayTao,
                'gioi_tinh_id' => $vc->GioiTinh == 1 ? 1 : 2,

            ];
            if($idx == 100) {
                DB::table('admin_users')->insert($data);
                $data = [];
                $idx = 0;
            }
            
        }
        if(empty($data)) {
            DB::table('admin_users')->insert($data);
        }
    }

    static function nhomThe_CardGroup()
    {
        // //Nhóm thẻ
        $nhomThe = DB::connection('sqlsrv')->table('DM_NhomThe')->get();

        foreach ($nhomThe as $vc) {
            $count = DB::table('card_group')->where('lucky_id', $vc->ID)->count();
            $adminUser = DB::table('admin_users')->where('lucky_id', $vc->UserTao)->first();

            if ($count > 0) {
                continue;
            }
            DB::table('card_group')->insert([
                'lucky_id' => $vc->ID,
                'name' => $vc->TenNhomThe,
                'code' => $vc->MaNhomThe,
                'description' => $vc->GhiChu,
                'create_by' =>  $adminUser ? $adminUser->id : 1,
                'created_at' => $vc->NgayTao,

            ]);
        }
    }

    static function doiTuong_Users()
    {
        $kh = DB::connection('sqlsrv')->table('DM_DoiTuong')->get();
        $data = [];
        $idx = 0;
        foreach ($kh as $vc) {
            $idx++;
            $dt = DB::table('customer_group')->where('lucky_id', $vc->ID_NhomDoiTuong)->first();
            $count = DB::table('users')->where('lucky_id', $vc->ID)->count();
            $adminUser = DB::table('admin_users')->where('lucky_id', $vc->UserTao)->first();

            if ($count > 0) {
                continue;
            }
            $data[] = [
                'lucky_id' => $vc->ID,
                'code' => $vc->MaDoiTuong,
                'name' => $vc->TenDoiTuong,
                'customer_group_id' => !empty($dt) ? $dt->id : 0,
                'phone' => $vc->DienThoai,
                'email' => $vc->Email,
                'tax_code' => $vc->MaSoThue,
                'note' => $vc->GhiChu,
                'create_by' =>  $adminUser ? $adminUser->id : 1,
                'created_at' => $vc->NgayNhap,
                'ngay_sinh' => $vc->NgaySinh_NgayTLap,
                'updated_at' => $vc->NgayGiaoDichGanNhat,

            ];

            if ($idx == 100) {
                DB::table('users')->insert($data);
                $data = [];
                $idx = 0;
            }
        }
        if (!empty($data)) {
            DB::table('users')->insert($data);
        }
    }

    static function doiTuong_Users_byID($lucky_ids)
    {
        $kh = DB::connection('sqlsrv')->table('DM_DoiTuong')->whereIn('lucky_id', $lucky_ids)->get();
        $data = [];
        $idx = 0;
        foreach ($kh as $vc) {
            $idx++;
            $dt = DB::table('customer_group')->where('lucky_id', $vc->ID_NhomDoiTuong)->first();
            $count = DB::table('users')->where('lucky_id', $vc->ID)->count();
            $adminUser = DB::table('admin_users')->where('lucky_id', $vc->UserTao)->first();

            if ($count > 0) {
                continue;
            }
            $data[] = [
                'lucky_id' => $vc->ID,
                'code' => $vc->MaDoiTuong,
                'name' => $vc->TenDoiTuong,
                'customer_group_id' => $dt->id,
                'phone' => $vc->DienThoai,
                'email' => $vc->Email,
                'tax_code' => $vc->MaSoThue,
                'note' => $vc->GhiChu,
                'create_by' =>  $adminUser ? $adminUser->id : 1,
                'created_at' => $vc->NgayNhap,
                'ngay_sinh' => $vc->NgaySinh_NgayTLap,
                'updated_at' => $vc->NgayGiaoDichGanNhat,

            ];

            if ($idx == 100) {
                DB::table('users')->insert($data);
                $data = [];
                $idx = 0;
            }
        }
        if (!empty($data)) {
            DB::table('users')->insert($data);
        }
    }

    static function hoaDonBanLe($com)
    {

        // hóa đơn bán 
        /*
            select * from PhieuThu WHERE MaPhieuThu = 'CN3.PT2024_03344'
            select * from PhieuThuChiTiet WHERE ID_PhieuThu = '1617b9f7-5eaa-47c0-8b5f-5b67c95bc379'
            select * from HoaDonBanLe WHERE ID='42bebdf9-5de6-4d4e-925f-e578d2239adf'
            select * from HoaDonBanLeChiTiet WHERE ID_HoaDon = '42bebdf9-5de6-4d4e-925f-e578d2239adf'
            select * from NhanVienThucHien WHERE MaChungTu = '42bebdf9-5de6-4d4e-925f-e578d2239adf'
            select * from NhanVienTuVan WHERE ID_ChungTu = '42bebdf9-5de6-4d4e-925f-e578d2239adf'
        */

        $start = $idx_total = 99000;
        $idx = 99000;
        $banLe = DB::connection('sqlsrv')->table('HoaDonBanLe')
        ->skip(99000) // start
        ->take(200000) // limit
        ->orderBy('NgayVaoSo', 'asc')
        ->get();

        $nhanvien = self::getAllData('admin_users');
        $chiNhanh = self::getAllData('chi_nhanh');

        $card = DB::table('card')->get();
        $cardData = [];
        foreach ($card as $c) {
            $cardData[$c->code] = $c->id;
        }

        $data = [];
        $idx_check = 0;
        foreach ($banLe as $vc) {
            $idx_check++;
            $idx_total++;
            if($idx_check == 500) {
                $idx_check = 0;
                $com->info('Checked' . $idx_total);
            }

            // check exist
            $count = DB::table('hoa_don')->where('lucky_id', $vc->ID)->count();
            if ($count > 0) {
                continue;
            }
            // add
            $idx++;
            $data[] = [
                'lucky_id' => $vc->ID,
                'name' => $vc->MaHoaDon,
                'code' => $vc->MaHoaDon,

                'NgayLapHoaDon' => $vc->NgayLapHoaDon,
                'GioVao' => $vc->GioVao,
                'GioRa' => $vc->GioRa,
                'NgayVaoSo' => $vc->NgayVaoSo,
                'users_id' =>  self::getUserID($vc->ID_DoiTuong),
                
                'create_by' =>  !empty($nhanvien[$vc->nhan_vien_id]) ? $nhanvien[$vc->nhan_vien_id] : 0,

                'LoaiHoaDon' => $vc->LoaiHoaDon, 
                'ChoThanhToan' => $vc->ChoThanhToan, // TODO: 1 là đã thanh toán, 0 là chưa thanh toán

                'tong_tien' => $vc->TongTienHang,
                'chiet_khau' => $vc->TongChietKhau,
                'thanh_toan' => $vc->PhaiThanhToan,
                'vat_money' => $vc->TongTienThue,
                // 'giam_gia' => $vc->TongGiamGia,
                'card_gt' => isset($cardData[$vc->MaTheGiaTri]) ? $cardData[$vc->MaTheGiaTri] : 0,
                'card_tl' => isset($cardData[$vc->MaTheLan]) ? $cardData[$vc->MaTheLan] : 0,
                

                // lucky
                // 'TongTienHang' => $vc->TongTienHang,
                // 'TongChietKhau' => $vc->TongChietKhau,
                // 'PhaiThanhToan' => $vc->PhaiThanhToan,
                // 'TongTienThue' => $vc->TongTienThue,

                // 'ID_ViTri' => $vc->ID_ViTri,
                // 'ID_CheckIn' => $vc->ID_CheckIn,
                'DiaChi_KhachHang' => $vc->DiaChi_KhachHang,
                'DienThoai_KhachHang' => $vc->DienThoai_KhachHang,
                // 'Fax_KhachHang' => $vc->Fax_KhachHang,
                'ID_NgoaiTe' => 1,
                'TyGia' => $vc->TyGia,
                'nhan_vien_id' => !empty($nhanvien[$vc->nhan_vien_id]) ? $nhanvien[$vc->nhan_vien_id] : 0,
                'TongChiPhi' => $vc->TongChiPhi,
                'DienGiai' => $vc->DienGiai,
                'SoLanIn' => $vc->SoLanIn,
                'UserLap' => $vc->UserLap,
                'NgaySuaCuoi' => $vc->NgaySuaCuoi,
                'UserSuaCuoi' => $vc->UserSuaCuoi,
                // 'YeuCau' => $vc->YeuCau,
                // 'ID_DacDiemKhachHang' => $vc->ID_DacDiemKhachHang,
                // 'LoaiChungTu' => $vc->LoaiChungTu,
                // 'MaNhanVienThucHien' => $vc->MaNhanVienThucHien,
                // 'MaNhanVienTuVan' => $vc->MaNhanVienTuVan,
                'TenNhanVienThucHien' => $vc->TenNhanVienThucHien,
                'TenNhanVienTuVan' => $vc->TenNhanVienTuVan,
                            
                'don_vi_id' => 1,
                'chi_nhanh_id' => empty($chiNhanh[$vc->ID_DonVi]) ? 0 : $chiNhanh[$vc->ID_DonVi],

                'note' => empty($vc->TenNhanVienThucHien) ? '' : 'NV Thực hiện: ' . $vc->TenNhanVienThucHien,

                'created_at' => $vc->NgayLapHoaDon,
                // 'created_at' => $vc->NgayLapHoaDon,
            ];


            if($idx == 100) {
                DB::table('hoa_don')->insert($data);
                $data = [];
                $idx = 0;
            }        }
        if(empty($data)) {
            $com->info('OK - ' . $idx_total);
            DB::table('hoa_don')->insert($data);
        }
    }

    static function hoaDonBanLeChiTiet($com)
    {
        
        $start = $idx_total = 174302;
        $idx = 0;
        $idx_check = 0;

        $product_unit = self::getAllData('product_unit');
        $product = self::getAllData('products');

        $count_new = DB::table('hoa_don_chi_tiet')->count();
        $count_lucky = DB::connection('sqlsrv')->table('HoaDonBanLechiTiet')->count();
        if($count_new == $count_lucky) {
            return true;
        }

        $banLeChiTiet = DB::connection('sqlsrv')->table('HoaDonBanLechiTiet')->orderBy('ThoiGian', 'asc')
        ->skip($start) // start
        ->take(120000) // limit
        ->get();

        // $banLeChiTiet = DB::connection('sqlsrv')->table('HoaDonBanLechiTiet')->get();

            $HangHoaBanLeIDs = [];
            foreach ($banLeChiTiet as $ct) {
                
                $idx_check++;
                $idx_total++;

                if($idx_check == 500) {
                    $idx_check = 0;
                    $com->info('Checked' . $idx_total);
                }

                $count = DB::table('hoa_don_chi_tiet')->where('lucky_id', $ct->ID)->count();
                if ($count > 0) {
                    // $com->info($ct->ID . ' đã tồn tại');
                    continue;
                }
                $idx++;

                $hoaDon = DB::table('hoa_don')->where('lucky_id', $ct->ID_HoaDon)->first();

                if(empty($hoaDon)) {
                    self::insert_hoaDon_By_LuckyIDS($com, [$ct->ID_HoaDon]);
                }
                
                $hoaDon = DB::table('hoa_don')->where('lucky_id', $ct->ID_HoaDon)->first();
                if(empty($hoaDon)) {
                    $com->info($ct->ID . ' ko tìm thấy hóa đơn tương ứng');
                    continue;
                }

                $data[] = [
                    'lucky_id' => $ct->ID,
                    'data_id' =>$hoaDon->id,
                    'product_id' => !empty($product[$ct->ID_HangHoa]) ? $product[$ct->ID_HangHoa] : '',
                    'don_vi_id' => !empty($product_unit[$ct->ID_DonViTinh]) ? $product_unit[$ct->ID_DonViTinh] : 0,
                    'so_luong' => $ct->SoLuong,
                    'don_gia' => $ct->DonGia,
                    'thanh_tien' => $ct->ThanhTien,
                    'thanh_toan' => $ct->ThanhToan,
                    'ghi_chu' => $ct->GhiChu,
                    'created_at' => $ct->ThoiGian,
                    // 'create_by' => !empty($nhanvien[$ct->nhan_vien_id]) ? $nhanvien[$ct->nhan_vien_id] : 0,
                    // 'nv_thuc_hien_id' => '',

                    // lucky
                    'SoThuTu' => $ct->SoThuTu,
                    'ThoiGian' => $ct->ThoiGian,
                    'ThoiGianBaoHanh' => $ct->ThoiGianBaoHanh,
                    'LoaiThoiGianBH' => $ct->LoaiThoiGianBH,
                    // 'ID_KhoHang' => $ct->ID_KhoHang,
                    'ID_KhoHang_lucky' => $ct->ID_KhoHang,
                    // 'ID_DonViTinh' => $ct->ID_DonViTinh,
                    'PTChiPhi' => $ct->PTChiPhi,
                    'TienChiPhi' => $ct->TienChiPhi,
                    'GiaVon' => $ct->GiaVon,
                    'UserNhap' => $ct->UserNhap,
                    'SoLanDaIn' => $ct->SoLanDaIn,
                    'ThoiGianThucHien' => $ct->ThoiGianThucHien,
                    'SoLuong_TL' => $ct->SoLuong_TL,
                    'SoLuong_YC' => $ct->SoLuong_YC,
                    'Chieu' => $ct->Chieu,
                    'Sang' => $ct->Sang,
                    'TenNhanVienThucHien' => $ct->TenNhanVienThucHien,
                    'TenNhanVienTuVan' => $ct->TenNhanVienTuVan,
                ];

                if($idx == 100) {
                    $com->info('OK - ' . $idx_total);
                    DB::table('hoa_don_chi_tiet')->insert($data);
                    $data = [];
                    $idx = 0;
                }
            }

            if(empty($data)) {
                $com->info('OK - ' . $idx_total);
                DB::table('hoa_don_chi_tiet')->insert($data);
            }
    }

    static function xuatKho()
    {
        // select * from KH_XuatKho
        // select * from KH_XuatKho_ChiTiet
        $kk = DB::connection('sqlsrv')->table('KH_XuatKho')->get();

        foreach ($kk as $vc) {
            $count = DB::table('hang_hoa_phieu_xuat_kho')->where('lucky_id', $vc->ID)->count();
            $dv = DB::table('don_vi')->where('lucky_id', $vc->ID_DonVi)->first();
            $dt = DB::table('users')->where('lucky_id', $vc->ID_DoiTuong)->first();
            $nv = DB::table('admin_users')->where('lucky_id', $vc->nhan_vien_id)->first();
            $adminUser = DB::table('admin_users')->where('lucky_id', $vc->UserLap)->first();

            if ($count > 0) {
                continue;
            }

            // Use null coalescing operator to handle null objects
            DB::table('hang_hoa_phieu_xuat_kho')->insert([
                'lucky_id' => $vc->ID,
                'tax_code' => $vc->SoChungTu,
                'ngay_vao_so' => $vc->NgayVaoSo,
                'ngay_chung_tu' => $vc->NgayChungTu,
                'dien_giai' => $vc->DienGiai,
                'create_by' =>  $adminUser ? $adminUser->id : 1,
                'don_vi_id' => $dv ? $dv->id : null,
                'created_at' => $vc->NgaySuaCuoi,
                'users_id' =>  self::getUserID($vc->ID_DoiTuong),
                'admin_users_id' => $nv ? $nv->id : null
            ]);
        }
    }
    static function nguonKhachHang()
    {
        $kk = DB::connection('sqlsrv')->table('NguonKhachHang')->get();

        foreach ($kk as $vc) {

            $count = DB::table('user_source')->where('lucky_id', $vc->ID)->count();
            if ($count > 0) {
                continue;
            }
            DB::table('user_source')->insert([
                'lucky_id' => $vc->ID,
                'name' => $vc->TenNguonKhach,
            ]);
        }
    }


    static function phieuChi($com)
    {
        $kk = DB::connection('sqlsrv')->table('PhieuChi')->get();
        $data = [];
        $idx = 0;
        foreach ($kk as $vc) {
            $idx++;
            $count = DB::table('phieu_chi')->where('lucky_id', $vc->ID)->count();
            if ($count > 0) {
                $com->info('exist ' . $vc->ID);
                continue;
            }

            // nhan vien
            $idNV = 0;
            if(!empty($vc->nhan_vien_id)) {
                $nv = DB::table('admin_users')->where('lucky_id', $vc->nhan_vien_id)->first();
                if(!empty($nv)) {
                    $idNV = $nv->id;
                }
            }
            
            $chiNhanh = DB::table('chi_nhanh')->where('lucky_id', $vc->ID_DonVi)->first();

            $data[] = [
                'lucky_id' => $vc->ID,
                'code' => $vc->MaPhieuChi,
                'NgayLapPhieu' =>  $vc->NgayLapPhieu,
                'NgayVaoSo' => $vc->NgayVaoSo,
                'nhan_vien_id' => $idNV,
                'ID_NgoaiTe' => 1,
                'TyGia' => 1,
                'NguoiNhan' => $vc->NguoiNhan,
                'NoiDungChi' => $vc->NoiDungChi . '; Người nhận: ' . $vc->NguoiNhan,
                'TongTienChi' => $vc->TongTienChi,
                'ChiChoNhieuDoiTuong' => $vc->ChiChoNhieuDoiTuong,
                'chi_nhanh_id' => empty($chiNhanh) ? 0 : $chiNhanh->id,
                'UserLap' => $vc->UserLap,
                'NgaySuaCuoi' => $vc->NgaySuaCuoi,
                'UserSuaCuoi' => $vc->UserSuaCuoi,
            ];
            if ($idx == 100) {
                DB::table('phieu_chi')->insert($data);
                $data = [];
                $idx = 0;
            }
        }
        if (!empty($data)) {
            DB::table('phieu_chi')->insert($data);
        }
    }

    static function PhieuChiChiTiet($com)
    {
        $kk = DB::connection('sqlsrv')->table('PhieuChiChiTiet')->get();
        $data = [];
        $idx = 0;
        foreach ($kk as $vc) {
            $idx++;
            $count = DB::table('phieu_chi_chi_tiet')->where('lucky_id', $vc->ID)->count();
            if ($count > 0) {
                continue;
            }

            $phieuChi = DB::table('phieu_chi')->where('lucky_id', $vc->ID_PhieuChi)->first();
            if(empty($phieuChi)) {
                $com->info('ko tìm thấy phiếu chi ' . $vc->ID);
                continue;
            }

            $KhoanThuChi = DB::table('khoan_thu_chi')->where('lucky_id', $vc->ID_KhoanThuChi)->first();

            $chungTuId = 0;
            if(!empty($vc->LoaiCT)) {
                $chungtu = DB::table('hoa_don')->where('lucky_id', $vc->ID_ChungTu)->first();
                if(!empty($chungtu)) { 
                    $chungTuId = $chungtu->id;
                }
            }
            
            $data[] = [
                'lucky_id' => $vc->ID,
                'ID_PhieuChi' => $phieuChi->id,
                'ID_KhoanThuChi' =>  !empty($KhoanThuChi) ? $KhoanThuChi->id : 0,
                // 'user_id' => $vc->ID_DoiTuong,
                'GhiChu' => $vc->GhiChu,
                'TienChi' => $vc->TienChi,
                'LoaiCT' => $vc->LoaiCT,
                'ID_ChungTu' => $chungTuId,
                'TienGui' => $vc->TienGui,
                'TienMat' =>$vc->TienMat,
                // 'DiaChi_DoiTuong' =>$vc->DiaChi_DoiTuong,
                // 'ChiPhiNganHang' =>$vc->ChiPhiNganHang,
                // 'LaPTChiPhiNganHang' =>$vc->LaPTChiPhiNganHang,
                // 'ID_NganHang' =>$vc->ID_NganHang
            ];
            if ($idx == 100) {
                DB::table('phieu_chi_chi_tiet')->insert($data);
                $data = [];
                $idx = 0;
            }
        }
        if (!empty($data)) {
            DB::table('phieu_chi_chi_tiet')->insert($data);
        }
    }


    static function phieuThanhToan()
    {
    //     select * from PhieuThanhToan
    //   select * from DM_LoaiPhieuThanhToan
    //    select * from NhatKySuDung_PhieuThanhToan

        $kk = DB::connection('sqlsrv')->table('PhieuThanhToan')->get();

        foreach ($kk as $vc) {
            $count = DB::table('thanh_toan')->where('lucky_id', $vc->ID)->count();

            if ($count > 0) {
                continue;
            }

            DB::table('thanh_toan')->insert([
                'lucky_id' => $vc->ID,
                'code_id' => $vc->MaThe,
                'name' => $vc->TenThe,
                'menh_gia_id' => $vc->MenhGia,
                'ngay_het_han' => $vc->NgayHetHan,
                'gio_ngay' => $vc->NgaySuDung,
                'description' => $vc->GhiChu,
                'so_lan_su_dung' => $vc->SoLanSuDung
            ]);
        }
    }
    static function khoanThuChi()
    {
        $kk = DB::connection('sqlsrv')->table('KhoanThuChi')->get();

        foreach ($kk as $vc) {
            $count = DB::table('loai_thu')->where('lucky_id', $vc->ID)->count();
            $adminUser = DB::table('admin_users')->where('lucky_id', $vc->UserTao)->first();

            if ($count > 0) {
                continue;
            }

            DB::table('loai_thu')->insert([
                'lucky_id' => $vc->ID,
                'name' => $vc->NoiDungThuChi,
                'code' => $vc->MaKhoanThuChi,
                'ghi_chu' => $vc->GhiChu,
                'description' => $vc->NoiDungThuChi,
                'create_by' =>  $adminUser ? $adminUser->id : 1,
                'created_at' => $vc->NgayTao,
            ]);
        }
    }
    static function phieuThu($com)
    {

        $phieuThu = DB::connection('sqlsrv')->table('PhieuThu')
            ->orderBy('PhieuThu.NgayLapPhieu', 'asc')
            // ->skip(1) // start
            // ->take(1000) // limit
            // ->take(self::LIMIT)
            ->get();
        //     echo count($phieuThu);die;
        // dd($phieuThu);
        self::insertPhieuThu($phieuThu, $com);
    }
    static function insertPhieuThu($phieuThu, $com)
    {
        $data = [];
        $idx = $checked = 0;
        $idx_total = 0;
        
        foreach ($phieuThu as $vc) {
            $checked++;
            $idx_total++;
            if($checked == 1000) {
                $checked = 0;
                $com->info('checked' . $idx_total . '--- idx' . $idx);
            }
            $count = DB::table('phieu_thu')->where('lucky_id', $vc->ID)->count();
            if ($count > 0) {
                continue;
            }

            $idx++;

            $adminUserId = self::getAdminUserID($vc->nhan_vien_id);

            // bỏ ínert chi nhánh vì data null
            $chiNhanh = DB::table('chi_nhanh')->where('lucky_id',$vc->ID_DonVi)->first();

            $data[] = [
                'lucky_id' => $vc->ID,
                // 'loai_thu_id' => $loai_thu_id,
                // 'users_id' => $userId,
                'code' => $vc->MaPhieuThu,
                'thoi_gian' => $vc->NgayLapPhieu,
                'created_at' => $vc->NgayVaoSo,
                // 'user_thu_id' => empty($nv) ? 0 : $nv->id, //nhan_vien_id
                // 'ID_NgoaiTe' => 1,
                // 'TyGia' => $vc->TyGia,
                'NguoiNopTien' => $vc->NguoiNopTien,
                // 'ThuCuaNhieuDoiTuong' => $vc->ThuCuaNhieuDoiTuong,
                'UserLap' => $vc->UserLap,
                'NgaySuaCuoi' => $vc->NgaySuaCuoi,
                'UserSuaCuoi' => $vc->UserSuaCuoi,



                'so_tien' => $vc->TongTienThu,
                'user_thu_id' => $adminUserId, // nhan_vien_id
                'chi_nhanh_id' => $chiNhanh->id, // ID_DonVi
                'description' => $vc->NoiDungThu . '; Tên KH :' . $vc->NguoiNopTien,
                'create_by' =>  $adminUserId,
                
            ];

            if ($idx == 200) {
                $com->info($idx_total );
                DB::table('phieu_thu')->insert($data);
                $data = [];
                $idx = 0;
            }
        }

        if (!empty($data)) {
            $com->info($idx_total . '----DONE!');
            DB::table('phieu_thu')->insert($data);
        }

        $com->info($idx_total . '----DONE!');
    }

    static function phieuThuChiTiet($com)
    {
        $PhieuThuChiTiet = DB::connection('sqlsrv')->table('PhieuThuChiTiet')
            // ->take(self::LIMIT)
            ->get();

            $data = [];
            $idx =$checked = 0;
            $idx_total = 0;
            if($checked == 1000) {
                $checked = 0;
                $com->info('checked' . $idx_total . '--- idx' . $idx);
            }

            foreach ($PhieuThuChiTiet as $vc) {
                $checked++;
                $idx_total++;

                if($checked == 1000) {
                    $checked = 0;
                    $com->info('checked' . $idx_total);
                }
                $count = DB::table('phieu_thu_chi_tiet')->where('lucky_id', $vc->ID)->count();
                if ($count > 0) {
                    continue;
                }
                
                $idx++;

                // $adminUserId = self::getAdminUserID($vc->nhan_vien_id);
    
                $userId = self::getUserID($vc->ID_KhachHang);
    
                $phieuThu = DB::table('phieu_thu')->where('lucky_id', $vc->ID_PhieuThu)->first();
                if(empty($phieuThu)) {
                    $com->info($vc->ID . ' -- phieuthuID '.$vc->ID_PhieuThu.' empty, check in lucky and update 2 phieu_thu....');

                    $phieuThu_Lucky = DB::connection('sqlsrv')->table('PhieuThu')->where('PhieuThu.ID', $vc->ID_PhieuThu)->get();
                    self::insertPhieuThu($phieuThu_Lucky, $com);
                    $phieuThu = DB::table('phieu_thu')->where('lucky_id', $vc->ID_PhieuThu)->first();
                    if(empty($phieuThu)) {
                        $com->info('phieu thu empty, bỏ qua ID này');
                        continue;
                    }
                }
                // loai chung tu, chỉ có 8,11,12. cần fai save các loại data này trước
                // 8 => 'hoa_don',
                // 11 => 'card',
                // 12 => 'tang_gia_tri_the',
                $loaichungTu = config('constant.loai_chung_tu');
                $chungTuData = null;
                if(!empty($vc->LoaiCT)) {
                    $chungTuData = DB::table($loaichungTu[$vc->LoaiCT])->where('lucky_id', $vc->ID_ChungTu)->first();

                    if(empty($chungTuData)) {
                        // $com->info($vc->ID_ChungTu . ' ----- ko tìm thấy '. $loaichungTu[$vc->ID_ChungTu] .' tương ứng - ' . $vc->LoaiCT);
                        if($vc->LoaiCT == 8) {
                            self::insert_hoaDon_By_LuckyIDS($com, [$vc->ID_ChungTu]);
                            $chungTuData = DB::table($loaichungTu[$vc->LoaiCT])->where('lucky_id', $vc->ID_ChungTu)->first();
                        }
                        
                        // card
                        if($vc->LoaiCT == 11) {
                            self::InsertCard($com, $vc->ID_ChungTu);
                            $chungTuData = DB::table($loaichungTu[$vc->LoaiCT])->where('lucky_id', $vc->ID_ChungTu)->first();
                            // if(empty($chungTuData)) {
                            //     $com->info($vc->ID_ChungTu . ' ko tìm thấy '.$loaichungTu[$vc->ID_ChungTu].' tương ứng - ' . $vc->LoaiCT);
                            //     continue;
                            // }
                        }

                        if($vc->LoaiCT == 12) {
                            self::insert_tangGiaTriThe_by_ID($com, [$vc->ID_ChungTu]);
                            $chungTuData = DB::table($loaichungTu[$vc->LoaiCT])->where('lucky_id', $vc->ID_ChungTu)->first();
                            // if(empty($chungTuData)) {
                            //     $com->info($vc->ID_ChungTu. ' ko tìm thấy '.$loaichungTu[$vc->ID_ChungTu].' tương ứng - ' . $vc->LoaiCT);
                            //     continue;
                            // }
                        }
                    }
                }

                $loaiThu = DB::table('loai_thu')->where('lucky_id', $vc->ID_KhoanThu)->first();
                $bank = DB::table('ngan_hang_cart')->where('lucky_id', $vc->ID_NganHang)->first();
                // bỏ ínert chi nhánh vì data null
                // $chiNhanh = DB::table('chi_nhanh')->where('lucky_id','')->first();
                
                $data[] = [
                    'lucky_id' => $vc->ID,
                    'phieu_thu_id' => $phieuThu->id,
                    'data_id' => $phieuThu->id,
                    'ID_KhoanThu' => empty($loaiThu) ? 0 : $loaiThu->id,
                    'ID_KhachHang' => $userId,
                    // 'ID_TheThoanhToan' => $vc->ID_TheThoanhToan,
                    'ThuTuThe' => $vc->ThuTuThe,
                    'TienMat' => $vc->TienMat, // nhan_vien_id
                    'TienGui' =>$vc->TienGui, // ID_DonVi
                    'TienThu' => $vc->TienThu,
                    'GhiChu' => $vc->GhiChu,
                    'ID_ChungTu' => empty($chungTuData) ? 0 : $chungTuData->id, // luu id chung tu tuong ung
                    'LoaiCT' => $vc->LoaiCT,
                    'ChiPhiNganHang' =>  $vc->ChiPhiNganHang,
    
                    'LaPTChiPhiNganHang' => $vc->LaPTChiPhiNganHang,
                    // 'DiaChi_KhachHang' => $vc->DiaChi_KhachHang,
                    'ThuPhiTienGui' => $vc->ThuPhiTienGui,
                    // 'nhan_vien_id' => 0,
                    
                ];
    
                if ($idx == 200) {
                    $com->info($idx_total);
                    DB::table('phieu_thu_chi_tiet')->insert($data);
                    $data = [];
                    $idx = 0;
                }
            }

            if (!empty($data)) {
                $com->info($idx_total . '----DONE!');
                DB::table('phieu_thu_chi_tiet')->insert($data);
            }
            $com->info($idx_total . '----DONE!');
    }

    static function sys_Company()
    {
        $kk = DB::connection('sqlsrv')->table('sys_Company')->get();


        foreach ($kk as $vc) {
            $count = DB::table('info')->where('lucky_id', $vc->ID)->count();

            if ($count > 0) {
                continue;
            }

            DB::table('info')->insert([
                'lucky_id' => $vc->ID,
                'name' => 'CÔNG TY TNHH HIMALAYA HEALTH SPA',
                'address' => 'SH03, L1, VINHOMES CENTRAL PARK, 720A DIEN BIEN PHU, PHUONG 22, QUAN BINH THANH, HCM',
                'phone' => '02877770256',
                'email' => $vc->Mail,
                'website' => 'http://www.htvietnam.vn',
                // 'logo' => '$vc->Logo', //kí tự dài quá nên bị lỗi ạ
                'description' => $vc->GhiChu,

            ]);
        }
    }
    static function sys_Quyen()
    {
        // $kk = DB::connection('sqlsrv')->table('sys_Quyen')->get();

        // foreach ($kk as $vc) {
        //     DB::table('permission_group')->insert([
        //         'code' => $vc->MaQuyen,
        //         'name' => $vc->TenQuyen,
        //         'description' => $vc->MoTa,

        //     ]);
        // }
    }
    
    static function theKhachHang($com)
    {

        $nhanvien = self::getAllData('admin_users');


        $chiNhanh = self::getAllData('chi_nhanh');
        $user = self::getAllData('users');
        $card_group = self::getAllData('card_group');
        $product = self::getAllData('products');

        $TheKhachHang = DB::connection('sqlsrv')->table('TheKhachHang')->get();
        $data = [];
        $idx = 0;
        $idx_total = 0;
        foreach ($TheKhachHang as $vc) {
            $idx++;
            $idx_total++;
            $adminUser = DB::table('admin_users')->where('lucky_id', $vc->UserTao)->first();
            $count = DB::table('card')->where('lucky_id', $vc->ID)->count();
            if ($count > 0) {
                continue;
            }

            $TheKhachHangChiTiet = DB::connection('sqlsrv')->table('TheKhachHangChiTiet')
                ->where('ID_TheKhachHang', $vc->ID)->get();

            $service_id = [];
            foreach($TheKhachHangChiTiet as $detail) {
                $serviceData =  [
                    // 'data_id' => $detail->ID_TheKhachHang, // lưu ở bảng thẻ kh
                    'product_id' => !empty($product[$detail->ID_HangHoa]) ? $product[$detail->ID_HangHoa] : 0,
                    // 'name' => $detail->SoLuong ,
                    'so_luong' => $detail->SoLuong ,
                    'don_gia' => $detail->DonGia,
                    'phan_tram_chiet_khau' => $detail->PTChietKhau,
                    'tien_chiet_khau' => $detail->TienChietKhau,
                    'thanh_toan' => $detail->ThanhToan,
                    // 'phai_thanh_toan' => $detail->ID_LopHoc, // bỏ
                    'note' => $detail->GhiChu,
                    'so_luong_tang' => $detail->SoLuongTang,

                    // 'create_by' =>  $detail->NgayTraLai,
                    // 'card_group_id' => $detail->SoLuongTraLai,
                    // 'users_id' => $detail->TienDaSuDung,
    
                    // 'ap_dung_tat_ca_sp' => $detail->TraLaiHHDV, bỏ
                    // 'duoc_cho_muon' => $detail->ID_SanPhamChinh,
                    'tang_kem' => $detail->LaTangKem,
                    // 'duoc_cho_muon' => $detail->SoLuongDaSuDung,
                    'lucky_id' => $detail->ID,
                ];
                
                $service_id[] = DB::table('card_service')->insertGetId($serviceData);
            }

            $usersId = self::getUserID($vc->ID_KhachHang);
            $kh = DB::table('users')->where('id', $usersId)->first();
            if(empty($kh)) {
                self::doiTuong_Users_byID([$vc->ID]);
                $kh = DB::table('users')->where('id', $usersId)->first();
                if(empty($kh)) {
                    continue;
                }
            }

            

            $data[] =  [
                'lucky_id' => $vc->ID,
                'code' => $vc->MaThe,
                'name' => $vc->MaThe . ' ' .  $kh->name,
                'ngay_mua' => $vc->NgayMua,
                'ngay_ap_dung' => $vc->NgayApDung,
                'ngay_het_han' => $vc->NgayHetHan,
                'menh_gia_the' => $vc->MenhGiaThe,
                'phai_thanh_toan' => $vc->PhaiThanhToan,
                'created_at' => $vc->NgayVaoSo,
                'create_by' =>  $adminUser ? $adminUser->id : 1,
                'card_group_id' => !empty($card_group[$vc->ID_NhomThe]) ? $card_group[$vc->ID_NhomThe] : 0,
                'users_id' => $kh->id,

                'ApDungTatCaSanPham' => $vc->ApDungTatCaSanPham,
                'DuocChoMuon' => $vc->DuocChoMuon,
                'description' => $vc->GhiChu . '; NV Tư vấn: ' . $vc->TenNhanVienTuVan,
                'chi_nhanh_id' => !empty($chiNhanh[$vc->ID_DonVi]) ? $chiNhanh[$vc->ID_DonVi] : 0,
                'card_service_ids' => !empty($service_id) ? json_encode($service_id) : 0
            ];
            if ($idx == 200) {
                $idx = 0;
                DB::table('card')->insert($data);
                $data = [];
                $com->info($idx_total );
            }
        }
        if (!empty($data)) {
            DB::table('card')->insert($data);
        }
    }

    static function theKhachHang_byLuckyID($com, $ids)
    {

        $nhanvien = self::getAllData('admin_users');


        $chiNhanh = self::getAllData('chi_nhanh');
        $user = self::getAllData('users');
        $card_group = self::getAllData('card_group');
        $product = self::getAllData('products');

        $TheKhachHang = DB::connection('sqlsrv')->table('TheKhachHang')->whereIn('ID', $ids)->get();
        $data = [];
        $idx = 0;
        $idx_total = 0;
        foreach ($TheKhachHang as $vc) {
            $idx++;
            $idx_total++;
            $adminUser = DB::table('admin_users')->where('lucky_id', $vc->UserTao)->first();
            $count = DB::table('card')->where('lucky_id', $vc->ID)->count();
            if ($count > 0) {
                continue;
            }

            $TheKhachHangChiTiet = DB::connection('sqlsrv')->table('TheKhachHangChiTiet')
                ->where('ID_TheKhachHang', $vc->ID)->get();

            $service_id = [];
            foreach($TheKhachHangChiTiet as $detail) {
                $serviceData =  [
                    // 'data_id' => $detail->ID_TheKhachHang, // lưu ở bảng thẻ kh
                    'product_id' => !empty($product[$detail->ID_HangHoa]) ? $product[$detail->ID_HangHoa] : 0,
                    // 'name' => $detail->SoLuong ,
                    'so_luong' => $detail->SoLuong ,
                    'don_gia' => $detail->DonGia,
                    'phan_tram_chiet_khau' => $detail->PTChietKhau,
                    'tien_chiet_khau' => $detail->TienChietKhau,
                    'thanh_toan' => $detail->ThanhToan,
                    // 'phai_thanh_toan' => $detail->ID_LopHoc, // bỏ
                    'note' => $detail->GhiChu,
                    'so_luong_tang' => $detail->SoLuongTang,

                    // 'create_by' =>  $detail->NgayTraLai,
                    // 'card_group_id' => $detail->SoLuongTraLai,
                    // 'users_id' => $detail->TienDaSuDung,
    
                    // 'ap_dung_tat_ca_sp' => $detail->TraLaiHHDV, bỏ
                    // 'duoc_cho_muon' => $detail->ID_SanPhamChinh,
                    'tang_kem' => $detail->LaTangKem,
                    // 'duoc_cho_muon' => $detail->SoLuongDaSuDung,
                    'lucky_id' => $detail->ID,
                ];
                
                $service_id[] = DB::table('card_service')->insertGetId($serviceData);
            }

            $usersId = self::getUserID($vc->ID_KhachHang);
            $kh = DB::table('users')->where('id', $usersId)->first();
            if(empty($kh)) {
                self::doiTuong_Users_byID([$vc->ID]);
                $kh = DB::table('users')->where('id', $usersId)->first();
                if(empty($kh)) {
                    continue;
                }
            }

            

            $data[] =  [
                'lucky_id' => $vc->ID,
                'code' => $vc->MaThe,
                'name' => $vc->MaThe . ' ' .  $kh->name,
                'ngay_mua' => $vc->NgayMua,
                'ngay_ap_dung' => $vc->NgayApDung,
                'ngay_het_han' => $vc->NgayHetHan,
                'menh_gia_the' => $vc->MenhGiaThe,
                'phai_thanh_toan' => $vc->PhaiThanhToan,
                'created_at' => $vc->NgayVaoSo,
                'create_by' =>  $adminUser ? $adminUser->id : 1,
                'card_group_id' => !empty($card_group[$vc->ID_NhomThe]) ? $card_group[$vc->ID_NhomThe] : 0,
                'users_id' => $kh->id,

                'ApDungTatCaSanPham' => $vc->ApDungTatCaSanPham,
                'DuocChoMuon' => $vc->DuocChoMuon,
                'description' => $vc->GhiChu . '; NV Tư vấn: ' . $vc->TenNhanVienTuVan,
                'chi_nhanh_id' => !empty($chiNhanh[$vc->ID_DonVi]) ? $chiNhanh[$vc->ID_DonVi] : 0,
                'card_service_ids' => !empty($service_id) ? json_encode($service_id) : 0
            ];
            if ($idx == 200) {
                $idx = 0;
                DB::table('card')->insert($data);
                $data = [];
                $com->info($idx_total );
            }
        }
        if (!empty($data)) {
            DB::table('card')->insert($data);
        }
    }

    static function InsertCard($com, $ID) {
        $chiNhanh = self::getAllData('chi_nhanh');
        $user = self::getAllData('users');
        $card_group = self::getAllData('card_group');
        $product = self::getAllData('products');
        $vc = DB::connection('sqlsrv')->table('TheKhachHang')->where('ID',$ID)->first();

        if(empty($vc)) {
            return false;
        }

        $data = [];
        // $adminUser = DB::table('admin_users')->where('lucky_id', $vc->UserTao)->first();
        $count = DB::table('card')->where('lucky_id', $vc->ID)->count();
        if ($count > 0) {
            return true;
        }

        $TheKhachHangChiTiet = DB::connection('sqlsrv')->table('TheKhachHangChiTiet')
            ->where('ID_TheKhachHang', $vc->ID)->get();

        $service_id = [];
        foreach($TheKhachHangChiTiet as $detail) {
            $serviceData =  [
                // 'data_id' => $detail->ID_TheKhachHang, // lưu ở bảng thẻ kh
                'product_id' => !empty($product[$detail->ID_HangHoa]) ? $product[$detail->ID_HangHoa] : 0,
                // 'name' => $detail->SoLuong ,
                'so_luong' => $detail->SoLuong ,
                'don_gia' => $detail->DonGia,
                'phan_tram_chiet_khau' => $detail->PTChietKhau,
                'tien_chiet_khau' => $detail->TienChietKhau,
                'thanh_toan' => $detail->ThanhToan,
                'note' => $detail->GhiChu,
                'so_luong_tang' => $detail->SoLuongTang,
                'tang_kem' => $detail->LaTangKem,
                'lucky_id' => $detail->ID,
            ];
            
            $service_id[] = DB::table('card_service')->insertGetId($serviceData);
        }

        $usersId = self::getUserID($vc->ID_KhachHang);
        $kh = DB::table('users')->where('id', $usersId)->first();

        $data[] =  [
            'lucky_id' => $vc->ID,
            'code' => $vc->MaThe,
            'name' => $vc->MaThe . ' ' .  $kh->name,
            'ngay_mua' => $vc->NgayMua,
            'ngay_ap_dung' => $vc->NgayApDung,
            'ngay_het_han' => $vc->NgayHetHan,
            'menh_gia_the' => $vc->MenhGiaThe,
            'phai_thanh_toan' => $vc->PhaiThanhToan,
            'created_at' => $vc->NgayVaoSo,
            // 'create_by' =>  $adminUser ? $adminUser->id : 1,
            'card_group_id' => !empty($card_group[$vc->ID_NhomThe]) ? $card_group[$vc->ID_NhomThe] : 0,
            'users_id' => isset($user[$vc->ID_KhachHang]) ? $user[$vc->ID_KhachHang] : 0,
            'UserTao' => $vc->UserTao,
            'ApDungTatCaSanPham' => $vc->ApDungTatCaSanPham,
            'DuocChoMuon' => $vc->DuocChoMuon,
            'description' => $vc->GhiChu . '; NV Tư vấn: ' . $vc->TenNhanVienTuVan,
            'chi_nhanh_id' => !empty($chiNhanh[$vc->ID_DonVi]) ? $chiNhanh[$vc->ID_DonVi] : 0,
            'card_service_ids' => !empty($service_id) ? json_encode($service_id) : 0
        ];
        DB::table('card')->insert($data);
        
        // update lai data_id trong card service
        $card =  DB::table('card')->where('lucky_id', $vc->ID)->first();
        $cardServiceIds = json_decode($card->card_service_ids, true);
        if(empty($card->card_service_ids)){
            $com->info('ko tìm thấy card_service tương ứng - cardID =' . $card->id);
            return true;
        }
        foreach($cardServiceIds as $id) {
            DB::table('card_service')->where('id', $id)->update(['data_id' => $card->id]);
        }
    }

    static function updateCardService_dataID() {
        $cards =  DB::table('card')->get();
        foreach($cards as $card) {
            if(!empty($card->card_service_ids)) {
                $cardServiceIds = json_decode($card->card_service_ids, true);
                foreach($cardServiceIds as $id) {
                    DB::table('card_service')->where('id', $id)->update(['data_id' => $card->id]);
                }
            }
        }
    }

    static function tangGiaTriThe($com)
    {
        $kk = DB::connection('sqlsrv')->table('TangGiaTriThe')->get();
        $idx = 0;
        $data = [];
        foreach ($kk as $vc) {
            $idx++;
            // $UserSua = DB::table('admin_users')->where('lucky_id', $vc->UserSua)->first();
            // $UserTao = DB::table('admin_users')->where('lucky_id', $vc->UserTao)->first();

            $count = DB::table('tang_gia_tri_the')->where('lucky_id', $vc->ID)->count();
            if ($count > 0) {
                continue;
            }
            $dv = DB::table('don_vi')->where('lucky_id', $vc->ID_DonVi)->first();
            $dt = DB::table('admin_users')->where('lucky_id', $vc->ID_NVLap)->first();
            $kh = DB::table('users')->where('lucky_id', $vc->ID_KhachHang)->first();
            $nvLap = DB::table(table: 'admin_users')->where('lucky_id', $vc->ID_NVLap)->first();

            $the = DB::table('card')->where('lucky_id', $vc->ID_TheKH)->first();
            if(empty($the)) {
                self::theKhachHang_byLuckyID($com,[$vc->ID]);
                $the = DB::table('card')->where('lucky_id', $vc->ID_TheKH)->first();
            }

            $data[] = [
                'lucky_id' => $vc->ID,
                'code' => $vc->MaTangGT,
                'card_id' => !empty($the) ? $the->id : 0,
                'NgayTangGT' => $vc->NgayTangGT,
                'ID_DonVi' => !empty($dv) ? $dv->id : 0,
                'ID_KhachHang' => !empty($kh) ? $kh->id : 0,
                'ID_NVLap' => !empty($nvLap) ? $nvLap->id : 0,
                'DonGia' => $vc->DonGia,
                'PTTangThem' => $vc->PTTangThem,
                'TienTangThem' => $vc->TienTangThem,
                'LaPT' => $vc->LaPT,
                'ChietKhau' => $vc->ChietKhau,
                'PhaiThanhToan' => $vc->PhaiThanhToan,
                'ID_TienTe' => 1,
                'TyGia' => $vc->TyGia,
                'GhiChu' => $vc->GhiChu,
                'UserSua' => $vc->UserSua,
                'NgaySua' => $vc->NgaySua,
                'UserTao' => $vc->UserTao,
                'ngayTao' => $vc->NgayTao,   
                'created_at' => $vc->NgayTao,   // ngay tao
            ];
            if ($idx == 100) {
                DB::table('tang_gia_tri_the')->insert($data);
                $data = [];
                $idx = 0;
            }
        }
        if (!empty($data)) {
            DB::table('tang_gia_tri_the')->insert($data);
        }
    }

    static function insert_tangGiaTriThe_by_ID($com, $ids)
    {
        $kk = DB::connection('sqlsrv')->table('TangGiaTriThe')->whereIn('ID', $ids)->get();
        $idx = 0;
        $data = [];
        foreach ($kk as $vc) {
            $idx++;
            // $UserSua = DB::table('admin_users')->where('lucky_id', $vc->UserSua)->first();
            // $UserTao = DB::table('admin_users')->where('lucky_id', $vc->UserTao)->first();

            $count = DB::table('tang_gia_tri_the')->where('lucky_id', $vc->ID)->count();
            if ($count > 0) {
                continue;
            }
            $dv = DB::table('don_vi')->where('lucky_id', $vc->ID_DonVi)->first();
            $dt = DB::table('admin_users')->where('lucky_id', $vc->ID_NVLap)->first();
            $kh = DB::table('users')->where('lucky_id', $vc->ID_KhachHang)->first();
            $the = DB::table('card')->where('lucky_id', $vc->ID_TheKH)->first();
            $nvLap = DB::table('admin_users')->where('lucky_id', $vc->ID_NVLap)->first();

            $data[] = [
                'lucky_id' => $vc->ID,
                'code' => $vc->MaTangGT,
                'card_id' => !empty($the) ? $the->id : 0,
                'NgayTangGT' => $vc->NgayTangGT,
                'ID_DonVi' => !empty($dv) ? $dv->id : 0,
                'ID_KhachHang' => !empty($kh) ? $kh->id : 0,
                'ID_NVLap' => !empty($nvLap) ? $nvLap->id : 0,
                'DonGia' => $vc->DonGia,
                'PTTangThem' => $vc->PTTangThem,
                'TienTangThem' => $vc->TienTangThem,
                'LaPT' => $vc->LaPT,
                'ChietKhau' => $vc->ChietKhau,
                'PhaiThanhToan' => $vc->PhaiThanhToan,
                'ID_TienTe' => 1,
                'TyGia' => $vc->TyGia,
                'GhiChu' => $vc->GhiChu,
                'UserSua' => $vc->UserSua,
                'NgaySua' => $vc->NgaySua,
                'UserTao' => $vc->UserTao,
                'ngayTao' => $vc->NgayTao,   
                'created_at' => $vc->NgayTao,   // ngay tao
            ];
            if ($idx == 100) {
                DB::table('tang_gia_tri_the')->insert($data);
                $data = [];
                $idx = 0;
            }
        }
        if (!empty($data)) {
            DB::table('tang_gia_tri_the')->insert($data);
        }
    }

    static function tonKhoKhoiTao()
    {
        $kk = DB::connection('sqlsrv')->table('TonKhoKhoiTao')->get();
        $data = [];
        $idx = 0;
        foreach ($kk as $vc) {
            $idx++;
            $adminUser = DB::table('admin_users')->where('lucky_id', $vc->UserTao)->first();

            $count = DB::table('kiem_kho_san_pham')->where('lucky_id', $vc->ID)->count();
            if ($count > 0) {
                continue;
            }


            $hh = DB::table('products')->where('lucky_id', $vc->ID_HangHoa)->first();
            $dvt = DB::table('product_unit')->where('lucky_id', $vc->ID_DonViTinh)->first();

            $data[] = [
                'lucky_id' => $vc->ID,
                'ngay' => $vc->NgayChungTu,
                'year' => $vc->NamHachToan,
                'created_at' => $vc->NgayVaoSo,
                'so_luong' => $vc->SoLuong,
                'so_luong_lech' => $vc->SoLuongChuan,
                'create_by' =>  $adminUser ? $adminUser->id : 1,
                'product_id' =>  $hh ? $hh->id : null,
                'don_vi_id' => $dvt ? $dvt->id : null,

            ];

            if($idx == 100) {
                DB::table('kiem_kho_san_pham')->insert($data);
                $data = [];
                $idx = 0;
            }
        }
        if(!empty($data)) {
            DB::table('kiem_kho_san_pham')->insert($data);
        }
    }

    static function nhanVienThucHien($com)
    {
        //126200
        $start = $idx_total = 0;
        $nhaVienThucHien = DB::connection('sqlsrv')->table('NhanVienThucHien')
        // ->offset($start)
        ->get();

        $data = [];
        $idx = 0;
        // $idx_total = 0;
        $idx_check = 0;
        foreach ($nhaVienThucHien as $nv) {
            $idx_check++;
            $idx_total++;
            if($idx_check == 500) {
                $idx_check = 0;
                $com->info('Checked' . $idx_total);
            }

            // check exist
            $count = DB::table('nhan_vien_thuc_hien')->where('lucky_id', $nv->ID)->count();
            if ($count > 0) {
                continue;
            }
            // add\
            $loaichungTu = config('constant.loai_chung_tu');
            // dd($loaichungTu);
            $loaichungTu_detail = config('constant.loai_chung_tu_chi_tiet');
            $idx++;

            // chứng từ
            
            // $com->info('xxxx');
            // $com->info($nv->LoaiChungTu);
            // $com->info($loaichungTu[$nv->LoaiChungTu]);
            // $com->info($loaichungTu_detail[$nv->LoaiChungTu]);
            // die;
            // chứng từ
            $chungTuData = DB::table($loaichungTu[$nv->LoaiChungTu])->where('lucky_id', $nv->MaChungTu)->first();

            // chung tu là hoa don
            if(empty($chungTuData) && $nv->LoaiChungTu == 8) {
                self::insert_hoaDon_By_LuckyIDS($com, [$nv->MaChungTu]);
                $chungTuData = DB::table($loaichungTu[$nv->LoaiChungTu])->where('lucky_id', $nv->MaChungTu)->first();
                if(empty($chungTuData)) {
                    $com->info($nv->MaChungTu . ' ko tìm thấy hóa đơn tương ứng');
                    continue;
                }
            }

            // chứng từ là card
            if(empty($chungTuData) && $nv->LoaiChungTu == 11) {
                self::InsertCard($com, $nv->MaChungTu);
                // dd($xx);
                $chungTuData = DB::table($loaichungTu[$nv->LoaiChungTu])->where('lucky_id', $nv->MaChungTu)->first();
                if(empty($chungTuData)) {
                    $com->info($nv->MaChungTu . ' ko tìm thấy hóa đơn tương ứng');
                    continue;
                }
            }

            // chứng từ là tang gia tri the
            if(empty($chungTuData) && $nv->LoaiChungTu == 12) {
                self::insert_tangGiaTriThe_by_ID($com, [$nv->MaChungTu]);
                $chungTuData = DB::table($loaichungTu[$nv->LoaiChungTu])->where('lucky_id', $nv->MaChungTu)->first();
                if(empty($chungTuData)) {
                    $com->info($nv->MaChungTu . ' ko tìm thấy hóa đơn tương ứng');
                    continue;
                }
            }

            // check exst chung tu chi tiet
            if(empty($chungTuData)) {
                $com->info($nv->ID_ChiTietChungTu . ' ko tìm thấy '. $loaichungTu[$nv->LoaiChungTu] .' tương ứng');
                continue;
            }


            // chunsg tu chi tiet
            $loaichungTu_detail_data = DB::table($loaichungTu_detail[$nv->LoaiChungTu])->where('lucky_id', $nv->ID_ChiTietChungTu)->first();
            if(empty($loaichungTu_detail_data) && $nv->LoaiChungTu == 8) {
                // save db
                self::insert_hoaDonChiTiet_By_LuckyIDS($com, [$nv->ID_ChiTietChungTu]);
                $loaichungTu_detail_data = DB::table($loaichungTu_detail[$nv->LoaiChungTu])->where('lucky_id', $nv->ID_ChiTietChungTu)->first();
                if(empty($loaichungTu_detail_data)) {
                    $com->info($nv->ID_ChiTietChungTu . ' ko tìm thấy hóa đơn chi tiết tương ứng');
                    continue;
                }
            }
            // check exst chung tu chi tiet
            // if(empty($loaichungTu_detail_data)) {
                // $com->info($nv->ID_ChiTietChungTu . ' ko tìm thấy --- '.$loaichungTu_detail[$nv->LoaiChungTu].' tương ứng');
                // continue;
            // }

            

            // dd($chungTuData);
            $data[] = [
                'lucky_id' => $nv->ID,
                'name' => isset($loaichungTu[$nv->LoaiChungTu]) ? $loaichungTu[$nv->LoaiChungTu] : '',
                'LoaiChungTu' => $nv->LoaiChungTu,
                'MaChungTu' => $chungTuData->id, // convert
                'NhanVien' => self::getAdminUserID($nv->NhanVien), // convert
                'ID_ChiTietChungTu' => !empty($loaichungTu_detail_data) ? $loaichungTu_detail_data->id : 0, // convert
                // 'ID_CongViec' => $nv->ID_CongViec,
                'TienChietKhau' => $nv->TienChietKhau,
                'LaPhanTram' => $nv->LaPhanTram,
                'LaNhanVienChinh' => $nv->LaNhanVienChinh,
                'DienGiai' => $nv->DienGiai,
                // 'nhan_vien_idChinh' => $nv->nhan_vien_idChinh,
                'PTDoanhThuDuocHuong' => $nv->PTDoanhThuDuocHuong,
                'DuocYeuCau' => $nv->DuocYeuCau,
                'ChiPhiThucHien' => $nv->ChiPhiThucHien,
                'LaPTChiPhiThucHien' => $nv->LaPTChiPhiThucHien,
                // 'users_id' =>  self::getUserID($nv->ID_DoiTuong),
            ];

            if($idx == 100) {
                $com->info($idx_total);
                DB::table('nhan_vien_thuc_hien')->insert($data);
                $data = [];
                $idx = 0;
            }
        }
        if(empty($data)) {
            $com->info('OK - ' . $idx_total);
            DB::table('nhan_vien_thuc_hien')->insert($data);
        }
    }

    static function insert_hoaDon_By_LuckyIDS($com, $hoaDonIds, $updateDetail = false){
        $banLe = DB::connection('sqlsrv')->table('HoaDonBanLe')
        ->whereIn('ID', $hoaDonIds) // start
        ->get();
        $nhanvien = self::getAllData('admin_users');
        $chiNhanh = self::getAllData('chi_nhanh');

        $card = DB::table('card')->get();
        $cardData = [];
        foreach ($card as $c) {
            $cardData[$c->code] = $c->id;
        }

        $data = [];
        $idx_check = 0;
        foreach ($banLe as $vc) {
            $count = DB::table('hoa_don')->where('lucky_id', $vc->ID)->count();
            if ($count > 0) {
                continue;
            }
            $id = DB::table('hoa_don')->insertGetId([
                'lucky_id' => $vc->ID,
                'name' => $vc->MaHoaDon,
                'code' => $vc->MaHoaDon,
                'NgayLapHoaDon' => $vc->NgayLapHoaDon,
                'GioVao' => $vc->GioVao,
                'GioRa' => $vc->GioRa,
                'NgayVaoSo' => $vc->NgayVaoSo,
                'users_id' =>  self::getUserID($vc->ID_DoiTuong),
                'create_by' =>  !empty($nhanvien[$vc->nhan_vien_id]) ? $nhanvien[$vc->nhan_vien_id] : 0,
                'LoaiHoaDon' => $vc->LoaiHoaDon, 
                'ChoThanhToan' => $vc->ChoThanhToan, 

                'tong_tien' => $vc->TongTienHang,
                'chiet_khau' => $vc->TongChietKhau,
                'thanh_toan' => $vc->PhaiThanhToan,
                'vat_money' => $vc->TongTienThue,
                'card_gt' => isset($cardData[$vc->MaTheGiaTri]) ? $cardData[$vc->MaTheGiaTri] : 0,
                'card_tl' => isset($cardData[$vc->MaTheLan]) ? $cardData[$vc->MaTheLan] : 0,
                'DiaChi_KhachHang' => $vc->DiaChi_KhachHang,
                'DienThoai_KhachHang' => $vc->DienThoai_KhachHang,
                'ID_NgoaiTe' => 1,
                'TyGia' => $vc->TyGia,
                'nhan_vien_id' => !empty($nhanvien[$vc->nhan_vien_id]) ? $nhanvien[$vc->nhan_vien_id] : 0,
                'TongChiPhi' => $vc->TongChiPhi,
                'DienGiai' => $vc->DienGiai,
                'SoLanIn' => $vc->SoLanIn,
                'UserLap' => $vc->UserLap,
                'NgaySuaCuoi' => $vc->NgaySuaCuoi,
                'UserSuaCuoi' => $vc->UserSuaCuoi,
                'TenNhanVienThucHien' => $vc->TenNhanVienThucHien,
                'TenNhanVienTuVan' => $vc->TenNhanVienTuVan,
                            
                'don_vi_id' => 1,
                'chi_nhanh_id' => empty($chiNhanh[$vc->ID_DonVi]) ? 0 : $chiNhanh[$vc->ID_DonVi],

                'note' => empty($vc->TenNhanVienThucHien) ? '' : 'NV Thực hiện: ' . $vc->TenNhanVienThucHien,

                'created_at' => $vc->NgayLapHoaDon,
            ]);

            if($updateDetail) {
                $lucky_hoaDonChiTietID = [];
                $details =  DB::connection('sqlsrv')
                    ->table('HoaDonBanLechiTiet')
                    ->where('ID_HoaDon', $vc->ID)
                    ->get();
                foreach($details as $d) {
                    $lucky_hoaDonChiTietID[] = $d->ID;
                }
                self::insert_hoaDonChiTiet_By_LuckyIDS($com, $lucky_hoaDonChiTietID);
            }
        }
        
        return true;  
    }

    static function insert_hoaDonChiTiet_By_LuckyIDS($com, $hoaDonChiTietIds){
        $product_unit = self::getAllData('product_unit');
        $product = self::getAllData('products');

        $count_new = DB::table('hoa_don_chi_tiet')->count();
        $count_lucky = DB::connection('sqlsrv')->table('HoaDonBanLechiTiet')->count();
        if($count_new == $count_lucky) {
            return true;
        }
        $data = [];
        $banLeChiTiet = DB::connection('sqlsrv')->table('HoaDonBanLechiTiet')->orderBy('ThoiGian', 'asc')
            ->whereIn('ID', $hoaDonChiTietIds) // start
            ->get();
        foreach ($banLeChiTiet as $ct) {

            $count = DB::table('hoa_don_chi_tiet')->where('lucky_id', $ct->ID)->count();
            if ($count > 0) {
                $com->info($ct->ID . ' đã tồn tại');
                continue;
            }

            $hoaDon = DB::table('hoa_don')->where('lucky_id', $ct->ID_HoaDon)->first();

            if(empty($hoaDon)) {
                self::insert_hoaDon_By_LuckyIDS($com, [$ct->ID_HoaDon]);
                $hoaDon = DB::table('hoa_don')->where('lucky_id', $ct->ID_HoaDon)->first();
            }

            
            if(empty($hoaDon)) {
                $com->info($ct->ID_HoaDon . ' hóa đơn này ko tồn tại');
            }

            $data = [
                'lucky_id' => $ct->ID,
                'data_id' =>$hoaDon->id,
                'product_id' => !empty($product[$ct->ID_HangHoa]) ? $product[$ct->ID_HangHoa] : '',
                'don_vi_id' => !empty($product_unit[$ct->ID_DonViTinh]) ? $product_unit[$ct->ID_DonViTinh] : 0,
                'so_luong' => $ct->SoLuong,
                'don_gia' => $ct->DonGia,
                'thanh_tien' => $ct->ThanhTien,
                'thanh_toan' => $ct->ThanhToan,
                'ghi_chu' => $ct->GhiChu,
                'created_at' => $ct->ThoiGian,
                // 'create_by' => !empty($nhanvien[$ct->nhan_vien_id]) ? $nhanvien[$ct->nhan_vien_id] : 0,
                // 'nv_thuc_hien_id' => '',

                // lucky
                'SoThuTu' => $ct->SoThuTu,
                'ThoiGian' => $ct->ThoiGian,
                'ThoiGianBaoHanh' => $ct->ThoiGianBaoHanh,
                'LoaiThoiGianBH' => $ct->LoaiThoiGianBH,
                // 'ID_KhoHang' => $ct->ID_KhoHang,
                'ID_KhoHang_lucky' => $ct->ID_KhoHang,
                // 'ID_DonViTinh' => $ct->ID_DonViTinh,
                'PTChiPhi' => $ct->PTChiPhi,
                'TienChiPhi' => $ct->TienChiPhi,
                'GiaVon' => $ct->GiaVon,
                'UserNhap' => $ct->UserNhap,
                'SoLanDaIn' => $ct->SoLanDaIn,
                'ThoiGianThucHien' => $ct->ThoiGianThucHien,
                'SoLuong_TL' => $ct->SoLuong_TL,
                'SoLuong_YC' => $ct->SoLuong_YC,
                'Chieu' => $ct->Chieu,
                'Sang' => $ct->Sang,
                'TenNhanVienThucHien' => $ct->TenNhanVienThucHien,
                'TenNhanVienTuVan' => $ct->TenNhanVienTuVan,
            ];
        }
            
        DB::table('hoa_don_chi_tiet')->insert($data);
        return true;
    }

    static function nhanVienTuVan($com)
    {
        $start = $idx_total = 0;
        $nhaVienThucHien = DB::connection('sqlsrv')->table('NhanVienTuVan')
        // ->offset($start)
        ->get();

        $data = [];
        $idx = 0;
        // $idx_total = 0;
        $idx_check = 0;
        foreach ($nhaVienThucHien as $nv) {
            $idx_check++;
            $idx_total++;
            if($idx_check == 500) {
                $idx_check = 0;
                $com->info('Checked' . $idx_total);
            }

            // check exist
            $count = DB::table('nhan_vien_tu_van')->where('lucky_id', $nv->ID)->count();
            if ($count > 0) {
                continue;
            }
            // add\
            $loaichungTu = config('constant.loai_chung_tu');
            $loaichungTu_detail = config('constant.loai_chung_tu_chi_tiet');
            $idx++;

            // chứng từ
            // dd($loaichungTu);
            // echo  $nv->MaChungTu;die;

            $chungTuData = DB::table($loaichungTu[$nv->LoaiChungTu])->where('lucky_id', $nv->ID_ChungTu)->first();
            if(empty($chungTuData)) {
                // echo $nv->LoaiChungTu;die;
                self::insert_hoaDon_By_LuckyIDS($com, [$nv->ID_ChungTu]);
                $chungTuData = DB::table($loaichungTu[$nv->LoaiChungTu])->where('lucky_id', $nv->ID_ChungTu)->first();
                if(empty($chungTuData)) {
                    $com->info($nv->ID_ChungTu . ' ko tìm thấy hóa đơn chi tiết tương ứng');
                    continue;
                }
            }

            $loaichungTu_detail_data = DB::table($loaichungTu_detail[$nv->LoaiChungTu])->where('lucky_id', $nv->ID_ChungTuChiTiet)->first();
            if(empty($loaichungTu_detail_data) && $nv->LoaiChungTu == 8) {
                // save db
                self::insert_hoaDonChiTiet_By_LuckyIDS($com, [$nv->ID_ChungTuChiTiet]);
                $loaichungTu_detail_data = DB::table($loaichungTu_detail[$nv->LoaiChungTu])->where('lucky_id', $nv->ID_ChungTuChiTiet)->first();
                if(empty($loaichungTu_detail_data)) {
                    $com->info($nv->ID_ChungTuChiTiet . ' ko tìm thấy hóa đơn chi tiết tương ứng');
                    continue;
                }
            }
            
            $data[] = [
                'lucky_id' => $nv->ID,
                'name' => isset($loaichungTu[$nv->LoaiChungTu]) ? $loaichungTu[$nv->LoaiChungTu] : '',
                'nhan_vien_id' => self::getAdminUserID($nv->nhan_vien_id),
                'LoaiChungTu' => $nv->LoaiChungTu, // convert
                'ID_ChungTu' => $chungTuData->id, // convert
                'ID_ChungTuChiTiet' => $loaichungTu_detail_data->id, // convert
                'TienChietKhau' => $nv->TienChietKhau,
                'LaPhanTram' => $nv->LaPhanTram,
                'PTDoanhThuDuocHuong' => $nv->PTDoanhThuDuocHuong,
                'DienGiai' => $nv->DienGiai,
            ];

            if($idx == 100) {
                $com->info($idx_total);
                DB::table('nhan_vien_tu_van')->insert($data);
                $data = [];
                $idx = 0;
            }
        }
        if(empty($data)) {
            $com->info('OK - ' . $idx_total);
            DB::table('nhan_vien_tu_van')->insert($data);
        }
    }

    static function nhatKySuDungThe($com)
    {
        $history = DB::connection('sqlsrv')->table('NhatKySuDungThe')
        ->skip(0) // start
        ->take(30000) // limit
        ->orderBy('ngay', 'asc')
        ->get();
        $data = [];
        $idx = 0;
        $idx_total = 0;
        $product = self::getAllData('products');
        $nhanvien = self::getAllData('admin_users');
        $idx_check = 0;
        foreach ($history as $vc) {
            $idx_check++;
            $idx++;
            $idx_total++;
            if($idx_check == 500) {
                $idx_check = 0;
                $com->info('Checked' . $idx_total);
            }
            // $adminUser = DB::table('admin_users')->where('lucky_id', $vc->nhan_vien_id)->first();

            $count = DB::table('card_history')->where('lucky_id', $vc->ID)->count();
            if ($count > 0) {
                continue;
            }

            $the = DB::table('card')->where('lucky_id', $vc->ID_TheKhachHang)->first();
            if(empty($the)) {
                self::theKhachHang_byLuckyID($com,[$vc->ID]);
                $the = DB::table('card')->where('lucky_id', $vc->ID_TheKH)->first();
            }

            $hoaDon = DB::table('hoa_don')->where('lucky_id', $vc->ID_ChungTu)->first();
            if(empty($hoaDon)) {
                self::insert_hoaDon_By_LuckyIDS($com, [$vc->ID_ChungTu]);
                $hoaDon = DB::table('hoa_don')->where('lucky_id', $vc->ID_ChungTu)->first();
            }
            
            $hoaDonChiTiet = DB::table('hoa_don_chi_tiet')->where('lucky_id', $vc->ID_ChiTietChungTu)->first();
            if(empty($hoaDonChiTiet)) {
                self::insert_hoaDonChiTiet_By_LuckyIDS($com, [$vc->ID_ChiTietChungTu]);
                $hoaDonChiTiet = DB::table('hoa_don_chi_tiet')->where('lucky_id', $vc->ID_ChiTietChungTu)->first();
            }

            $data[] =  [
                'lucky_id' => $vc->ID,
                'card_id' => $the->id, //ID_TheKhachHang
                // 'name' => $vc->ID_TheKhachHang ,
                // 'ngay_mua' => $vc->LoaiChungTu, // 8 - hoá đơn bán lẻ
                'hoa_don_id' => $hoaDon->id,
                'hoa_don_chi_tiet_id' => !empty($hoaDonChiTiet) ? $hoaDonChiTiet->id : 0,
                'so_luong' => $vc->SoLuong,
                'price' => $vc->SoTien,
                'admin_users_id' => !empty($nhanvien[$vc->nhan_vien_id]) ? $nhanvien[$vc->nhan_vien_id] : '',
                'created_at' => $vc->Ngay,
                'note' => $vc->UserName,
                'so_luong_duoc_tang' => $vc->LaSoLuongDuocTang,
                'product_id' => !empty($product[$vc->ID_HangHoaDichVu]) ? $product[$vc->ID_HangHoaDichVu] : '',
                'ton_luy_ke' => $vc->TonLuyKe,
            ];
            if ($idx == 100) {
                $idx = 0;
                DB::table('card_history')->insert($data);
                $data = [];
                $com->info($idx_total );
            }
        }

        if (!empty($data)) {
            DB::table('card_history')->insert($data);
            $com->info('OK - ' . $idx_total);
        }
    }
}
