<?php

namespace Database\Seeders;

use App\Models\Admin\Product;
use App\Models\Admin\Table;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Services\MigrateService;

class HimalayaSeeder extends Seeder
{

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $sortOrder = 1;

        // set tất cả table đều là sub menu của label_setting
        $this->command->warn('Set sub menu: Thiết lập hệ thống');
        $setting = new Table();
        $setting->name = 'label_setting';
        $setting->display_name = 'Thiết lập hệ thống';
        $setting->sort_order = 100;
        $setting->is_label = 1;
        $setting->parent_id = 0;
        $setting->is_edit = 0;
        $setting->show_in_menu = 0;
        $setting->save();
        DB::table('tables')->update(['parent_id' => $setting->id]);

        ////////////// tổng quan
        $this->command->warn('Tổng quan');
        $tongQuan = new Table();
        $tongQuan->name = 'label_tong_quan';
        $tongQuan->display_name = 'Tổng quan';
        $tongQuan->sort_order = 0;
        $tongQuan->is_label = 1;
        $tongQuan->link = '/adm';
        $tongQuan->parent_id = 0;
        $tongQuan->is_edit = 1;
        $tongQuan->save();

        /////////////// hàng hóa
        $this->command->warn('Hàng hóa');
        $label_hang_hoa = new Table();
        $label_hang_hoa->name = 'label_hang_hoa';
        $label_hang_hoa->display_name = 'Hàng hóa';
        $label_hang_hoa->sort_order = $sortOrder++;
        $label_hang_hoa->is_label = 1;
        $label_hang_hoa->link = '';
        $label_hang_hoa->parent_id = 0;
        $label_hang_hoa->is_edit = 1;
        $label_hang_hoa->save();

        // product
        MigrateService::setParent($label_hang_hoa->id, 'products', $sortOrder++);
        MigrateService::setParent($label_hang_hoa->id, 'product_kiem_kho', $sortOrder++);

        ////////////////// Đối tác
        $this->command->warn('Đối tác');
        $doiTac = new Table();
        $doiTac->name = 'label_doi_tac';
        $doiTac->display_name = 'Đối tác';
        $doiTac->sort_order = $sortOrder++;
        $doiTac->is_label = 1;
        $doiTac->link = '';
        $doiTac->parent_id = 0;
        $doiTac->is_edit = 1;
        $doiTac->save();
        //users
        MigrateService::setParent($doiTac->id, 'users', $sortOrder++);
        MigrateService::setParent($doiTac->id, 'nha_cung_cap', $sortOrder++);
        MigrateService::setParent($doiTac->id, 'thuong_hieu', $sortOrder++);

        // giao dịch
        $this->command->warn('Giao dịch');
        $giaoDich = new Table();
        $giaoDich->name = 'label_giao_dich';
        $giaoDich->display_name = 'Giao dịch';
        $giaoDich->sort_order = $sortOrder++;
        $giaoDich->is_label = 1;
        $giaoDich->link = '';
        $giaoDich->parent_id = 0;
        $giaoDich->is_edit = 1;
        $giaoDich->save();
        MigrateService::setParent($giaoDich->id, 'hoa_don', $sortOrder++);
        MigrateService::setParent($giaoDich->id, 'product_nhap_hang', $sortOrder++);
        MigrateService::setParent($giaoDich->id, 'product_tra_hang_ncc', $sortOrder++);
        MigrateService::setParent($giaoDich->id, 'product_khach_tra_hang', $sortOrder++);
        MigrateService::setParent($giaoDich->id, 'product_xuat_huy', $sortOrder++);

        $this->command->warn('Tài chính');
        $taiChinh = new Table();
        $taiChinh->name = 'label_tai_chinh';
        $taiChinh->display_name = 'Tài chính';
        $taiChinh->sort_order = $sortOrder++;
        $taiChinh->is_label = 1;
        $taiChinh->link = '';
        $taiChinh->parent_id = 0;
        $taiChinh->is_edit = 1;
        $taiChinh->save();
        DB::table('tables')
            ->whereIn('name', ['so_quy', 'cong_no'])
            ->update(['parent_id' => $taiChinh->id]);

        // Dữ liệu hệ thống
        $this->command->warn('Báo cáo');
        $baoCao = new Table();
        $baoCao->name = 'label_bao_cao';
        $baoCao->display_name = 'Báo cáo';
        $baoCao->sort_order = $sortOrder++;
        $baoCao->is_label = 0;
        $baoCao->link = '';
        $baoCao->parent_id = 0;
        $baoCao->is_edit = 0;
        $baoCao->save();

        $phieuChi = new Table();
        $phieuChi->name = 'label_report_ban_hang';
        $phieuChi->display_name = 'Bán hàng';
        $phieuChi->sort_order = $sortOrder++;
        $phieuChi->is_label = 0;
        $phieuChi->link = '/adm/bao-cao/ban-hang';
        $phieuChi->parent_id = $baoCao->id;
        $phieuChi->is_edit = 1;
        $phieuChi->save();

        $phieuChi = new Table();
        $phieuChi->name = 'label_report_the_dv';
        $phieuChi->display_name = 'Thẻ dịch vụ';
        $phieuChi->sort_order = $sortOrder++;
        $phieuChi->is_label = 0;
        $phieuChi->link = '/adm/bao-cao/the-dich-vu';
        $phieuChi->parent_id = $baoCao->id;
        $phieuChi->is_edit = 1;
        $phieuChi->save();

        $phieuChi = new Table();
        $phieuChi->name = 'label_report_khach_hang';
        $phieuChi->display_name = 'Khách hàng';
        $phieuChi->sort_order = $sortOrder++;
        $phieuChi->is_label = 0;
        $phieuChi->link = '/adm/bao-cao/khach-hang';
        $phieuChi->parent_id = $baoCao->id;
        $phieuChi->is_edit = 1;
        $phieuChi->save();

        $phieuChi = new Table();
        $phieuChi->name = 'label_hang_hoa';
        $phieuChi->display_name = 'Hàng hóa';
        $phieuChi->sort_order = $sortOrder++;
        $phieuChi->is_label = 0;
        $phieuChi->link = '/adm/bao-cao/hang-hoa';
        $phieuChi->parent_id = $baoCao->id;
        $phieuChi->is_edit = 1;
        $phieuChi->save();


        // Dữ liệu hệ thống
        $this->command->warn('Set sub menu: Dữ liệu hệ thống');
        $system = new Table();
        $system->name = 'label_data_system';
        $system->display_name = 'Dữ liệu hệ thống';
        $system->sort_order = $sortOrder++;
        $system->is_label = 1;
        $system->parent_id = 0;
        $system->is_edit = 0;
        $system->save();
        $tableName = ['service', 'promotion', 'voucher', 'card', 'tour'];
        $result = MigrateService::setParentId2Tbl($tableName, $system->id);

        $this->command->{$result['status']}($result['msg']);

        // QL Tài Sản

        $system = new Table();
        $system->name = 'label_QL_tai_san';
        $system->display_name = 'QL Tài Sản';
        $system->sort_order = $sortOrder++;
        ;
        $system->is_label = 1;
        $system->parent_id = 0;
        $system->is_edit = 1;
        $system->save();

        $tableName = ['tai_san', 'cap_phat', 'thu_hoi', 'kiem_ke_tai_san'];
        MigrateService::setParentId2Tbl($tableName, $system->id);

        $system = new Table();
        $system->name = 'label_cskh';
        $system->display_name = 'Chăm sóc KH';
        $system->sort_order = $sortOrder++;
        $system->is_label = 1;
        $system->parent_id = 0;
        $system->is_edit = 1;
        $system->save();

        $tableName = ['tu_van', 'data_cham_soc_khach_hang', 'data_telesales'];
        MigrateService::setParentId2Tbl($tableName, $system->id);

        $system = new Table();
        $system->name = 'label_dat_lich';
        $system->display_name = 'Đặt lịch';
        $system->sort_order = $sortOrder++;
        $system->is_label = 1;
        $system->parent_id = 0;
        $system->is_edit = 1;
        $system->save();

        $tableName = ['dat_lich', 'dat_lich_online'];
        MigrateService::setParentId2Tbl($tableName, $system->id);

        $system = new Table();
        $system->name = 'label_xu_li_yeu_cau';
        $system->display_name = 'Xử lí yêu cầu';
        $system->sort_order = $sortOrder++;
        $system->is_label = 1;
        $system->parent_id = 0;
        $system->is_edit = 1;
        $system->save();

        $tableName = ['yeu_cau_kh', 'yeu_cau_noi_bo'];
        MigrateService::setParentId2Tbl($tableName, $system->id);

        $system = new Table();
        $system->name = 'day';
        $system->display_name = 'Ngày trong tuần';
        $system->sort_order = $sortOrder++;
        $system->is_label = 1;
        $system->parent_id = 0;
        $system->is_edit = 0;
        $system->save();

        DB::table('chi_nhanh')->truncate();
        DB::table('chi_nhanh')->insert([
            ['name' => 'Vinhomes', 'code' => 'CN00001', 'sort_order' => 1],
            ['name' => 'Phổ Quang', 'code' => 'CN00002', 'sort_order' => 2],
        ]);

        DB::table('users')->truncate();
        DB::table('users')->insert([
            ['code' => 'KH001', 'name' => 'Nguyễn Thị Huyền', 'phone' => '0911111111', 'phone02' => '0922222220', 'sort_order' => 1, 'chi_nhanh_id' => 1],
            ['code' => 'KH002', 'name' => 'Nguyễn Thị Bình An', 'phone' => '0911111112', 'phone02' => '0922222222', 'sort_order' => 1, 'chi_nhanh_id' => 1]
        ]);

        // DB::table('type_cong_viec')->truncate();
        // DB::table('type_cong_viec')->insert([
        //     ['name' => 'Công việc hàng ngày', 'sort_order' => 1],
        //     ['name' => 'Công việc lặp lại', 'sort_order' => 2],
        // ]);


        $sortOrder = 1;
        DB::table('product_unit')->truncate();
        DB::table('product_unit')->insert([
            ['name' => 'Chai', 'sort_order' => $sortOrder++],
            ['name' => 'Can', 'sort_order' => $sortOrder++],
            ['name' => 'cây', 'sort_order' => $sortOrder++],
            ['name' => 'lần [1]', 'sort_order' => $sortOrder++],
            ['name' => 'Gam', 'sort_order' => $sortOrder++],
            ['name' => 'Bịch', 'sort_order' => $sortOrder++],
            ['name' => 'Lọ', 'sort_order' => $sortOrder++],
            ['name' => 'Lon', 'sort_order' => $sortOrder++],
            ['name' => 'Bình', 'sort_order' => $sortOrder++],
            ['name' => 'Hũ', 'sort_order' => $sortOrder++],
            ['name' => 'Đôi', 'sort_order' => $sortOrder++],
            ['name' => 'Cái', 'sort_order' => $sortOrder++],
        ]);

        DB::table('service_group')->truncate();
        DB::table('service_group')->insert([
            ['name' => 'Basic (TN)', 'sort_order' => $sortOrder++],
            ['name' => 'Hàng hoá', 'sort_order' => $sortOrder++],
            ['name' => 'Thư giãn', 'sort_order' => $sortOrder++]
        ]);

        // DB::table('hinh_thuc_chiet_khau')->truncate();
        // DB::table('hinh_thuc_chiet_khau')->insert([
        //     ['name' => 'Tour nhân viên', 'sort_order' => $sortOrder++],
        //     ['name' => 'Chiết khấu KTV', 'sort_order' => $sortOrder++],
        //     ['name' => 'Chiết khấu bán thẻ', 'sort_order' => $sortOrder++],
        //     ['name' => 'Chiết khấu hàng hóa', 'sort_order' => $sortOrder++]
        // ]);


        DB::table('product_type')->truncate();
        DB::table('product_type')->insert([
            [
                'name' => 'Hàng hóa',
            ],
            [
                'name' => 'Dịch vụ',
            ],
            [
                'name' => 'Gói dịch vụ, liệu trình',
            ],
            [
                'name' => 'Thẻ tài khoản',
            ]
        ]);

        DB::table('thuong_hieu')->truncate();
        DB::table('thuong_hieu')->insert([
            [
                'name' => 'NIVEA',
            ],
            [
                'name' => 'ROMANO',
            ],
            [
                'name' => 'COCOON',
            ],
        ]);



        // sắp xếp LABEL cha
        // $parents = ['label_data_system', 'label_QL_tai_san', 'label_Ke_toan','label_thu_ngan', 'label_cskh', 'label_dat_lich', 'label_xu_li_yeu_cau', 'label_kpi', 'file_manager','label_setting'];
        // MigrateService::sortOrder($parents);

        // DB::table('loai_hinh_chiet_khau')->truncate();
        // DB::table('loai_hinh_chiet_khau')->insert([
        //     [
        //         'name'=>'Thực hiện dịch vụ', 
        //     ],[
        //         'name'=>'Tư vấn bán hàng', 
        //     ]
        // ]);



        // product
        DB::table('products')->truncate();
        for ($i = 0; $i < 20; $i++) {
            $product = new Product();
            $product->name = 'Sản phẩm ' . $i;
            $product->code = 'SP0000' . $i;
            $product->gia_ban = '1000000';
            $product->gia_von = '900000';

            if ($i < 8) {
                $product->product_type_id = 1;
                $product->product_group_id = 2;
            } else if ($i >= 8 && $i <= 15) {
                $product->product_type_id = 1;
                $product->product_group_id = 1;
            } else {
                $product->product_group_id = 3;
                $product->product_type_id = 2;
            }

            $product->don_vi_id = 2;

            $detail = [
                1 => [
                    'kho_hang_id' => 1,
                    'kho_hang_name' => 'Vinhomes',
                    'ton_kho' => 40 + $i * 100
                ],
                2 => [
                    'kho_hang_id' => 2,
                    'kho_hang_name' => 'Phổ Quang',
                    'ton_kho' => 70 + $i * 100
                ]
            ];
            $product->ton_kho_detail = $detail;

            $product->ton_kho = $detail[1]['ton_kho'] + $detail[2]['ton_kho'];
            $product->save();
        }

        DB::table('admin_config')->truncate();
        DB::table('admin_config')->insert([
            [
                'name' => 'HIMALAYA SPA',
                'phone01' => '097 717 2222'
            ]
        ]);



        DB::table('kho_hang')->truncate();
        DB::table('kho_hang')->insert([
            ['name' => 'Kho Vinhomes', 'code' => 'KHO00001'],
            ['name' => 'Kho Phổ Quang', 'code' => 'KHO00002'],
            ['name' => 'Kho trung tâm', 'code' => 'KHO00003'],
        ]);
        // DB::table('trang_thai_telesales')->truncate();
        // DB::table('trang_thai_telesales')->insert([
        //     ['name' => 'Đã chốt đơn'],
        //     ['name' => 'Chưa tư vấn'],
        //     ['name' => 'Đang tư vấn'],
        //     ['name' => 'Đang chờ khách phản hồi'],
        //     ['name' => 'Khách không phản hồi'],
        // ]);

        // nhom thẻ
        DB::table('card_group')->truncate();
        DB::table('card_group')->insert([
            ['name' => 'Thẻ giá trị'],
            ['name' => 'Gói dịch vụ, liệu trình'],
        ]);





        DB::table('tai_san')->truncate();
        DB::table('tai_san')->insert([
            ['name' => 'Laptop Lenovo', 'code' => 'TS00001', 'kho_tai_san_id' => 1, 'so_luong' => 1, 'gia_mua' => 10000000, 'gia_tri_hien_tai' => 5000000, 'tai_san_status_used_id' => 1, 'tai_san_status_id' => 1, 'tai_san_type_id' => 1],
            ['name' => 'Macbook air 2025', 'code' => 'TS00002', 'kho_tai_san_id' => 1, 'so_luong' => 1, 'gia_mua' => 20000000, 'gia_tri_hien_tai' => 5000000, 'tai_san_status_used_id' => 1, 'tai_san_status_id' => 1, 'tai_san_type_id' => 1],
            ['name' => 'Bàn phím Asus', 'code' => 'TS00003', 'kho_tai_san_id' => 1, 'so_luong' => 1, 'gia_mua' => 10000000, 'gia_tri_hien_tai' => 5000000, 'tai_san_status_used_id' => 1, 'tai_san_status_id' => 1, 'tai_san_type_id' => 1],
        ]);

        DB::table('tai_san')->truncate();
        DB::table('tai_san')->insert([
            ['name' => 'Laptop Lenovo', 'code' => 'TS00001', 'kho_tai_san_id' => 1, 'so_luong' => 1, 'gia_mua' => 10000000, 'gia_tri_hien_tai' => 5000000, 'tai_san_status_used_id' => 1, 'tai_san_status_id' => 1, 'tai_san_type_id' => 1],
            ['name' => 'Macbook air 2025', 'code' => 'TS00002', 'kho_tai_san_id' => 1, 'so_luong' => 1, 'gia_mua' => 20000000, 'gia_tri_hien_tai' => 5000000, 'tai_san_status_used_id' => 1, 'tai_san_status_id' => 1, 'tai_san_type_id' => 1],
            ['name' => 'Bàn phím Asus', 'code' => 'TS00003', 'kho_tai_san_id' => 1, 'so_luong' => 1, 'gia_mua' => 10000000, 'gia_tri_hien_tai' => 5000000, 'tai_san_status_used_id' => 1, 'tai_san_status_id' => 1, 'tai_san_type_id' => 1],
        ]);

        DB::table('nha_cung_cap')->truncate();
        DB::table('nha_cung_cap')->insert([
            ['name' => 'Samsung', 'code' => 'NCC00001'],
            ['name' => 'Sony', 'code' => 'NCC00002'],
            ['name' => 'Apple', 'code' => 'NCC00003'],
        ]);

        // nhân viên
        $nv = MigrateService::createLabel('label_nhan_vien', 'Nhân sự', $sortOrder = $sortOrder++);
        MigrateService::setParent($nv->id, 'admin_users', $sortOrder++);
        MigrateService::setParent($nv->id, 'chi_nhanh', $sortOrder++);
        MigrateService::setParent($nv->id, 'permission_group', $sortOrder++);

        $nv = MigrateService::createLabel('label_task', 'Công việc', $sortOrder = $sortOrder++);
        MigrateService::setParent($nv->id, 'tasks', $sortOrder++);

        // nhom sp
        DB::table('product_group')->truncate();
        DB::table('product_group')->insert([
            ['name' => 'Hàng hóa bán ra'],
            ['name' => 'Nguyên vật liệu tiêu hao'],
            ['name' => 'Vật tư tiêu hao nội bộ'],
            ['name' => 'Công cụ dụng cụ'],
            ['name' => 'Tài sản cố định'],
            ['name' => 'Hàng khuyến mãi/ tặng kèm'],
            ['name' => 'Hàng dùng thử/ demo'],
        ]);
    }
}




// telesale
// DB::table('data_telesales')->truncate();
// $khachHang = [
//     1=>'Lưu Hương Giang',
//     2=>'Trần Đại Nghĩa',
//     3=>'Nguyễn Thưởng',
//     4=>'Nguyễn Minh Quang',
//     5=>'Trần Anh Quân',
//     6=>'Nguyễn Thúy Hằng',
//     7=>'Nguyễn Thị Khuyên',
//     8=>'Nguyễn Văn Quyết',
//     9=>'Nguyễn Thị Nga',
//     10=>'Nguyễn Hưởng',
// ];
// $nvid = 2;
// for($i=1; $i<10; $i++){
//     $tele = new DataTelesales();
//     $tele->name = $khachHang[$i];
//     $tele->code = 'TELE0000' . $i;
//     $tele->phone = '0977115426';
//     $tele->nhan_vien_id = $nvid++;
//     $tele->product_id = $i;
//     $tele->status_id = 2;
//     $tele->ngay = '2025-07-01';
//     $tele->created_at = '2025-07-01';
//     $tele->save();
//     if($nvid === 4) {
//         $nvid = 2;
//     }
// }