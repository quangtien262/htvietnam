<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AdminMenuSeeder extends Seeder
{

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        //route
        $order = 1;

        DB::table('admin_menu')->truncate();

        $aitilen = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_aitilen',
                'display_name' => 'BĐS AITILEN',
                'icon' => 'ShopFilled',
                'route' => 'aitilen.dashboard',
                'link' => '',
                'parent_id' => 0,
                'is_active' => 1,
                'sort_order' => $order++
            ]
        );
        DB::table('admin_menu')->insert([
            ['parent_id' => $aitilen, 'name' => 'aitilen_dashboard', 'display_name' => 'Căn hộ', 'table_name' => 'apm', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $aitilen, 'name' => 'apm', 'display_name' => 'Căn hộ', 'table_name' => 'apm', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $aitilen, 'name' => 'room', 'display_name' => 'Phòng', 'table_name' => 'room', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $aitilen, 'name' => 'aitilen_hop_dong', 'display_name' => 'Hợp đồng', 'table_name' => 'aitilen_hop_dong', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $aitilen, 'name' => 'hoa_don', 'display_name' => 'Hóa đơn', 'table_name' => 'hoa_don', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $aitilen, 'name' => 'aitilen_note', 'display_name' => 'Ghi chú', 'table_name' => 'aitilen_note', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $aitilen, 'name' => 'so_quy', 'display_name' => 'Sổ qũy  ', 'table_name' => 'so_quy', 'route' => 'soQuy', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
        ]);


        // web
        $web = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_website',
                'display_name' => 'QUẢN LÝ WEBSITE',
                'icon' => 'ShopFilled',
                'route' => 'web.dashboard',
                'link' => '',
                'parent_id' => 0,
                'is_active' => 1,
                'sort_order' => $order++
            ]
        );

        DB::table('admin_menu')->insert([
            ['parent_id' => $web, 'name' => 'label_web_dashboard', 'display_name' => 'Tổng quan', 'table_name' => '', 'route' => 'web.dashboard', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $web, 'name' => 'menus', 'display_name' => 'Menu', 'table_name' => 'menus', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $web, 'name' => 'news', 'display_name' => 'Tin tức', 'table_name' => 'news', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $web, 'name' => 'products', 'display_name' => 'Sản phẩm', 'table_name' => 'products', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $web, 'name' => 'video', 'display_name' => 'Video', 'table_name' => 'video', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $web, 'name' => 'library', 'display_name' => 'Thư viện ảnh', 'table_name' => 'library', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $web, 'name' => 'page_setting', 'display_name' => 'Landingpage', 'table_name' => 'page_setting', 'route' => 'adm.landingpage.index', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $web, 'name' => 'contact', 'display_name' => 'Liên hệ', 'table_name' => 'contact', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
        ]);
        $webSetting = DB::table('admin_menu')->insertGetId(
            ['parent_id' => $web, 'name' => 'label_web_setting', 'display_name' => 'Cài đặt', 'table_name' => '', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
        );
        DB::table('admin_menu')->insert([
            ['parent_id' => $webSetting, 'name' => 'web_config', 'display_name' => 'Cấu hình web', 'table_name' => 'web_config', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $webSetting, 'name' => 'emails', 'display_name' => 'Email', 'table_name' => 'emails', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $webSetting, 'name' => 'countries', 'display_name' => 'Quốc gia', 'table_name' => 'countries', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
        ]);

        // ban hang
        $banHang = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_ban_hang',
                'display_name' => 'QUẢN LÝ BÁN HÀNG',
                'icon' => 'ShopFilled',
                'route' => 'sale.dashboard',
                'link' => '',
                'parent_id' => 0,
                'sort_order' => $order++
            ]
        );
        DB::table('admin_menu')->insert([
            ['parent_id' => $banHang, 'name' => 'sale.dashboard', 'display_name' => 'Dashboard', 'table_name' => '', 'route' => 'sale.dashboard', 'parameter' => '', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++, 'link' => ''],
            ['parent_id' => $banHang, 'name' => 'hoa_don__create', 'display_name' => 'Thu ngân', 'table_name' => 'hoa_don', 'route' => 'hoaDon.create', 'parameter' => '', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++, 'link' => ''],
            ['parent_id' => $banHang, 'name' => 'hoa_don', 'display_name' => 'Hóa đơn', 'table_name' => 'hoa_don', 'route' => 'hoaDon.index', 'parameter' => '', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++, 'link' => ''],
            ['parent_id' => $banHang, 'name' => 'users', 'display_name' => 'Khách hàng', 'table_name' => 'users', 'route' => 'customer.index', 'parameter' => '', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++, 'link' => ''],
            ['parent_id' => $banHang, 'name' => 'tasks', 'display_name' => 'Sales', 'table_name' => 'tasks', 'route' => 'task.list', 'parameter' => 'sales', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++, 'link' => '/adm/cv/sales/list?pid=1&p=' . $banHang],
            ['parent_id' => $banHang, 'name' => 'users', 'display_name' => 'Công nợ', 'table_name' => 'cong_no', 'route' => 'congNo', 'parameter' => '', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++, 'link' => ''],
            ['parent_id' => $banHang, 'name' => 'calendar', 'display_name' => 'Lịch hẹn', 'table_name' => 'calendar', 'route' => 'data.tblName', 'parameter' => '', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++, 'link' => ''],
        ]);

        // QL kho
        $khoHang = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_kho_hang',
                'display_name' => 'QUẢN LÝ KHO HÀNG',
                'icon' => 'SlidersFilled',
                'route' => 'khoHang.dashboard',
                'link' => '',
                'parent_id' => 0,
                'sort_order' => $order++
            ]
        );
        DB::table('admin_menu')->insert([
            ['parent_id' => $khoHang, 'name' => '', 'display_name' => 'Dashboard', 'table_name' => '', 'route' => 'khoHang.dashboard', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $khoHang, 'name' => 'products', 'display_name' => 'Hàng hóa', 'table_name' => 'products', 'route' => 'product.list', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $khoHang, 'name' => 'nha_cung_cap', 'display_name' => 'Nhà cung cấp', 'table_name' => 'nha_cung_cap', 'route' => 'ncc.index', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
        ]);
        $qlKho = DB::table('admin_menu')->insertGetId(
            ['parent_id' => $khoHang, 'name' => 'label_ql_kho', 'display_name' => 'Quản lý kho', 'table_name' => '', 'route' => '', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
        );
        DB::table('admin_menu')->insert([
            ['parent_id' => $qlKho, 'name' => 'kho_hang_data', 'display_name' => 'Sản phẩm', 'table_name' => 'kho_hang_data', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $qlKho, 'name' => 'product_kiem_kho', 'display_name' => 'Kiểm kho', 'table_name' => 'product_kiem_kho', 'route' => 'kiemKho', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $qlKho, 'name' => 'product_nhap_hang', 'display_name' => 'Nhập hàng', 'table_name' => 'product_nhap_hang', 'route' => 'nhapHang', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $qlKho, 'name' => 'product_tra_hang_ncc', 'display_name' => 'Trả hàng nhập', 'table_name' => 'product_tra_hang_ncc', 'route' => 'traHangNCC', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $qlKho, 'name' => 'product_xuat_huy', 'display_name' => 'Xuất hủy', 'table_name' => 'product_xuat_huy', 'route' => 'xuatHuy', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
        ]);

        $settingKho = DB::table('admin_menu')->insertGetId(
            ['parent_id' => $khoHang, 'name' => 'label_setting_kho', 'display_name' => 'Cài đặt kho', 'table_name' => '', 'route' => '', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
        );
        DB::table('admin_menu')->insert([
            ['parent_id' => $settingKho, 'name' => 'kho_hang', 'display_name' => 'Kho hàng', 'table_name' => 'kho_hang', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $settingKho, 'name' => 'nha_cung_cap_status', 'display_name' => 'Trạng thái NCC', 'table_name' => 'nha_cung_cap_status', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
        ]);

        // QL công việc
        $congViec = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_cong_viec',
                'display_name' => 'QUẢN LÝ CÔNG VIỆC',
                'icon' => 'CalendarFilled',
                'route' => 'task.dashboard',
                'link' => '',
                'parent_id' => 0,
                'sort_order' => $order++
            ]
        );
        DB::table('admin_menu')->insert([
            ['parent_id' => $congViec, 'name' => 'task.dashboard', 'display_name' => 'Dashboard', 'table_name' => '', 'route' => 'task.dashboard', 'parameter' => '', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++, 'link' => ''],
            ['parent_id' => $congViec, 'name' => 'projects', 'display_name' => 'Dự án', 'table_name' => 'projects', 'route' => 'project.list', 'parameter' => 'projects', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++, 'link' => ''],
            ['parent_id' => $congViec, 'name' => 'tasks', 'display_name' => 'Công việc', 'table_name' => 'tasks', 'route' => 'task.list', 'parameter' => 'tasks', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++, 'link' => '/adm/cv/all/list?pid=1&p=' . $congViec],
            ['parent_id' => $congViec, 'name' => 'meeting', 'display_name' => 'Meeting', 'table_name' => 'meeting', 'route' => 'meeting.index', 'parameter' => '', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++, 'link' => ''],
        ]);

        $taiSan = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_tai_san',
                'display_name' => 'QUẢN LÝ TÀI SẢN',
                'icon' => 'HddFilled',
                'route' => 'taiSan.dashboard',
                'link' => '',
                'parent_id' => 0,
                'sort_order' => $order++
            ]
        );
        DB::table('admin_menu')->insert([
            ['parent_id' => $taiSan, 'name' => 'taisan_dashboard', 'display_name' => 'Dashboard', 'table_name' => '', 'route' => 'taiSan.dashboard', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            // ['parent_id' => $taiSan, 'name' => '', 'display_name' => 'Tài sản', 'table_name' => 'tai_san', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $taiSan, 'name' => 'tai_san', 'display_name' => 'Tài sản', 'table_name' => 'tai_san', 'route' => 'taiSan.index', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $taiSan, 'name' => 'tai_san_kiem_ke', 'display_name' => 'Kiểm kê', 'table_name' => 'tai_san_kiem_ke', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $taiSan, 'name' => 'tai_san_bao_tri', 'display_name' => 'Bảo trì', 'table_name' => 'tai_san_bao_tri', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $taiSan, 'name' => 'tai_san_thanh_ly', 'display_name' => 'Thanh lý', 'table_name' => 'tai_san_thanh_ly', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $taiSan, 'name' => 'tai_san_cap_phat', 'display_name' => 'Cấp phát', 'table_name' => 'tai_san_cap_phat', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
        ]);


        $nhanSu = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_nhan_su',
                'display_name' => 'QUẢN LÝ NHÂN SỰ',
                'icon' => 'IdcardFilled',
                'route' => 'nhanSu.dashboard',
                'link' => '',
                'parent_id' => 0,
                'sort_order' => $order++
            ]
        );
        DB::table('admin_menu')->insert([
            ['parent_id' => $nhanSu, 'name' => 'nhansu_dashboard', 'display_name' => 'Dashboard', 'table_name' => '', 'route' => 'nhanSu.dashboard', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $nhanSu, 'name' => 'admin_users', 'display_name' => 'Nhân viên', 'table_name' => 'admin_users', 'route' => 'nhanVien.index', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $nhanSu, 'name' => 'permission_group', 'display_name' => 'Nhóm quyền', 'table_name' => 'permission_group', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $nhanSu, 'name' => 'chi_nhanh', 'display_name' => 'Chi nhánh', 'table_name' => 'chi_nhanh', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $nhanSu, 'name' => 'khoa_hoc', 'display_name' => 'Khóa học', 'table_name' => 'khoa_hoc', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $nhanSu, 'name' => 'salary', 'display_name' => 'Bảng lương', 'table_name' => 'salary', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
        ]);

        $taiChinh = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_tai_chinh',
                'display_name' => 'QUẢN LÝ TÀI CHÍNH',
                'icon' => 'AccountBookOutlined',
                'route' => 'taiChinh.dashboard',
                'link' => '',
                'parent_id' => 0,
                'sort_order' => $order++
            ]
        );
        DB::table('admin_menu')->insert([
            ['parent_id' => $taiChinh, 'name' => 'taichinh_dashboard', 'display_name' => 'Dashboard', 'table_name' => '', 'route' => 'taiChinh.dashboard', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $taiChinh, 'name' => 'so_quy', 'display_name' => 'Sổ quỹ', 'table_name' => 'so_quy', 'route' => 'soQuy', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            ['parent_id' => $taiChinh, 'name' => 'cong_no', 'display_name' => 'Công nợ', 'table_name' => 'cong_no', 'route' => 'congNo', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            // ['parent_id' => $web, 'name' => '', 'display_name' => '', 'table_name' => '', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
        ]);

        $thongKe = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_thong_ke',
                'display_name' => 'BÁO CÁO THỐNG KÊ',
                'icon' => 'PieChartFilled',
                'route' => 'report.dashboard',
                'link' => '',
                'parent_id' => 0,
                'sort_order' => $order++
            ]
        );
        DB::table('admin_menu')->insert([
            ['parent_id' => $thongKe, 'name' => 'report_dashboard', 'display_name' => 'Dashboard', 'table_name' => '', 'route' => 'report.dashboard', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
            // ['parent_id' => $web, 'name' => '', 'display_name' => '', 'table_name' => '', 'route' => 'data.tblName', 'icon' => '', 'is_active' => 1, 'sort_order' => $order++],
        ]);


        $taiLieu = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_tai_lieu',
                'display_name' => 'QUẢN LÝ TÀI LIỆU',
                'icon' => 'CopyOutlined',
                'route' => 'file.index',
                'link' => '',
                'parent_id' => 0,
                'sort_order' => $order++
            ]
        );
    }
}
