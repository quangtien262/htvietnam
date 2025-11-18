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

        // DB::table('admin_menu')->truncate();

        $aitilen = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_aitilen',
                'note' => 'BĐS AITILEN',
                'icon' => 'ShopFilled',
                'color' => 1,
                'sort_order' => $order++
            ]
        );

        // web
        $web = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_website',
                'note' => 'QUẢN LÝ WEBSITE',
                'icon' => 'ShopFilled',
                'color' => 1,
                'sort_order' => $order++
            ]
        );

        // ban hang
        $banHang = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_ban_hang',
                'note' => 'QUẢN LÝ BÁN HÀNG',
                'icon' => 'ShopFilled',
                'color' => 1,
                'sort_order' => $order++
            ]
        );

        // QL kho
        $khoHang = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_kho_hang',
                'note' => 'QUẢN LÝ KHO HÀNG',
                'icon' => 'SlidersFilled',
                'color' => 1,
                'sort_order' => $order++
            ]
        );

        // QL công việc
        $congViec = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_cong_viec',
                'note' => 'QUẢN LÝ CÔNG VIỆC',
                'icon' => 'CalendarFilled',
                'color' => 1,
                'sort_order' => $order++
            ]
        );

        $taiSan = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_tai_san',
                'note' => 'QUẢN LÝ TÀI SẢN',
                'icon' => 'HddFilled',
                'color' => 1,
                'sort_order' => $order++
            ]
        );

        $nhanSu = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_nhan_su',
                'note' => 'QUẢN LÝ NHÂN SỰ',
                'icon' => 'IdcardFilled',
                'color' => 1,
                'sort_order' => $order++
            ]
        );

        $business = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_business',
                'note' => 'QUẢN LÝ KINH DOANH',
                'icon' => 'IdcardFilled',
                'color' => 1,
                'sort_order' => $order++
            ]
        );
        $telesale = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_telesale',
                'note' => 'QUẢN LÝ TELESALe',
                'icon' => 'IdcardFilled',
                'color' => 1,
                'sort_order' => $order++
            ]
        );

        $taiChinh = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_tai_chinh',
                'note' => 'QUẢN LÝ TÀI CHÍNH',
                'icon' => 'AccountBookOutlined',
                'color' => 1,
                'sort_order' => $order++
            ]
        );

        $thongKe = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_thong_ke',
                'note' => 'BÁO CÁO THỐNG KÊ',
                'icon' => 'PieChartFilled',
                'color' => 1,
                'sort_order' => $order++
            ]
        );


        $taiLieu = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_tai_lieu',
                'note' => 'QUẢN LÝ TÀI LIỆU',
                'icon' => 'CopyOutlined',
                'color' => 1,
                'sort_order' => $order++
            ]
        );




        $setting = DB::table('admin_menu')->insertGetId(
            [
                'name' => 'parent_setting',
                'note' => 'CÀI ĐẶT - PHÂN QUYỀN',
                'icon' => 'SettingFilled',
                'color' => 1,
                'sort_order' => $order++
            ]
        );
    }
}
