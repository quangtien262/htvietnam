<?php

namespace Database\Seeders;

use App\Models\Admin\Project;
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

        $taiChinh = DB::table('admin_menu')->insertGetId(
            values: [
                'name' => 'parent_tai_chinh',
                'display_name' => 'QUẢN LÝ TÀI CHÍNH',
                'icon' => 'AccountBookOutlined',
                'route' => 'taiChinh.dashboard',
                'link' => '',
                'parent_id' => 0,
                'sort_order' => $order++
            ]
        );

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
