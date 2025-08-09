<?php

namespace Database\Seeders;

use App\Models\Admin\DataTelesales;
use App\Models\Admin\Product;
use App\Models\Admin\Table;
use App\Models\AdminUser;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Web\Menu;
use App\Models\Web\WebConfig;
use Illuminate\Support\Facades\DB;
use App\Services\Admin\CrawlService;
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


        // nhap_hang_status
        DB::table('nhap_hang_status')->insert([
            [
                'name' => 'Đã nhập hàng',
            ],
            [
                'name' => 'Lưu nháp',
            ]
        ]);
        // QL Tài Sản

        $system = new Table();
        $system->name = 'label_QL_tai_san';
        $system->display_name = 'QL Tài Sản';
        $system->sort_order = $sortOrder++;;
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

        DB::table('day_of_week')->truncate();
        DB::table('day_of_week')->insert([
            ['name' => 'Chủ nhật', 'sort_order' => 1],
            ['name' => 'Thứ 2', 'sort_order' => 2],
            ['name' => 'Thứ 3', 'sort_order' => 3],
            ['name' => 'Thứ 4', 'sort_order' => 4],
            ['name' => 'Thứ 5', 'sort_order' => 5],
            ['name' => 'Thứ 6', 'sort_order' => 6],
            ['name' => 'Thứ 7', 'sort_order' => 7]
        ]);


        // DB::table('kieu_tour')->truncate();
        // DB::table('kieu_tour')->insert([
        //     ['name' => 'Chính sách tiền tour', 'sort_order' => 1],
        //     ['name' => 'Chính sách hoa hồng', 'sort_order' => 2],
        //     ['name' => 'Chính sách giá dịch vụ', 'sort_order' => 3],
        //     ['name' => 'Chính sách giá thẻ VIP', 'sort_order' => 4],
        //     ['name' => 'Chính sách giá hàng hóa/ dịch vụ kèm', 'sort_order' => 5],
        // ]);

        // DB::table('menh_gia')->truncate();
        // DB::table('menh_gia')->insert([
        //     ['name' => '10.000 ', 'sort_order' => 1],
        //     ['name' => '20.000', 'sort_order' => 2],
        //     ['name' => '50.000', 'sort_order' => 3],
        //     ['name' => '100.000', 'sort_order' => 4],
        //     ['name' => '200.000', 'sort_order' => 5],
        //     ['name' => '500.000', 'sort_order' => 6],

        // ]);

        DB::table('chi_nhanh')->truncate();
        DB::table('chi_nhanh')->insert([
            ['name' => 'Vinhomes', 'code' => 'CN00001', 'sort_order' => 1],
            ['name' => 'Phổ Quang', 'code' => 'CN00002', 'sort_order' => 2],
        ]);

        $phongban_stt = 1;
        DB::table('phong_ban')->truncate();
        DB::table('phong_ban')->insert([
            ['name' => 'Hành chính', 'sort_order' => $phongban_stt++],
            ['name' => 'Nhân sự', 'sort_order' => $phongban_stt++],
            ['name' => 'Truyền thông', 'sort_order' => $phongban_stt++],
            ['name' => 'Kinh doanh', 'sort_order' => $phongban_stt++],
            ['name' => 'Kế toán', 'sort_order' => $phongban_stt++],
            ['name' => 'Kỹ thuật', 'sort_order' => $phongban_stt++],
        ]);

        DB::table('users')->truncate();
        DB::table('users')->insert([
            ['code' => 'KH001', 'name' => 'Nguyễn Thị Huyền', 'phone' => '0911111111', 'phone02' => '0922222220', 'sort_order' => 1, 'chi_nhanh_id' => 1],
            ['code' => 'KH002', 'name' => 'Nguyễn Thị Bình An', 'phone' => '0911111112', 'phone02' => '0922222222', 'sort_order' => 1, 'chi_nhanh_id' => 1]
        ]);

        DB::table('ngan_hang')->truncate();
        DB::table('ngan_hang')->insert([
            ['name' => 'Đầu tư và Phát triển Việt Nam - BIDV', 'sort_order' => 1],
            ['name' => 'Công Thương Việt Nam - VietinBank', 'sort_order' => 2],
            ['name' => 'Ngoại thương Việt Nam - Vietcombank', 'sort_order' => 3],
            ['name' => 'Quân đội - MB', 'sort_order' => 4],
            ['name' => 'Kỹ Thương Việt Nam - Techcombank', 'sort_order' => 5],
            ['name' => 'Ngân hàng Á Châu - ACB', 'sort_order' => 6],
            ['name' => 'Sài Gòn-Hà Nội - SHB', 'sort_order' => 7],
            ['name' => 'NH TMCP Phát triển Nhà Tp HCM - HDBank', 'sort_order' => 8],
            ['name' => 'Ngân hàng TMCP Sài Gòn - SCB', 'sort_order' => 9],
            ['name' => 'Sài Gòn Thương Tín - Sacombank', 'sort_order' => 10],
            ['name' => 'Ngân hàng Tiên Phong - TPBank', 'sort_order' => 11],
            ['name' => 'NH TMCP Quốc tế Việt Nam - VIB', 'sort_order' => 12],

            ['name' => 'Hàng Hải Việt Nam - MSB', 'sort_order' => 13],
            ['name' => 'Ngân hàng Đông Nam Á - SeABank', 'sort_order' => 14],
            ['name' => 'Phương Đông - OCB', 'sort_order' => 15],
            ['name' => 'Ngân hàng xuất nhập khẩu Việt Nam - Eximbank', 'sort_order' => 16],
            ['name' => 'Bưu điện Liên Việt - LienVietPostBank', 'sort_order' => 17],
            ['name' => 'Đại chúng Việt Nam - PVcombank', 'sort_order' => 18],
            ['name' => 'Ngân hàng TMCP Bắc Á - Bac A Bank', 'sort_order' => 19],
            ['name' => 'Ngân hàng An Bình - ABBANK', 'sort_order' => 20],
            ['name' => 'Ngân hàng TMCP Đông Á - Đông Á Bank', 'sort_order' => 21],
            ['name' => 'Bảo Việt - BaoViet Bank', 'sort_order' => 22],
            ['name' => 'Ngân hàng TMCP Nam Á - Nam A Bank', 'sort_order' => 23],
            ['name' => 'Việt Nam Thương Tín - VietBank', 'sort_order' => 24],
            ['name' => 'Ngân hàng TMCP Việt Á - Viet A Bank', 'sort_order' => 25],
            ['name' => 'Kiên Long - Kienlongbank', 'sort_order' => 26],
            ['name' => 'Sài Gòn Công Thương - Saigonbank', 'sort_order' => 27],
            ['name' => 'Xăng dầu Petrolimex - PG Bank', 'sort_order' => 28],

        ]);

        // DB::table('type_cong_viec')->truncate();
        // DB::table('type_cong_viec')->insert([
        //     ['name' => 'Công việc hàng ngày', 'sort_order' => 1],
        //     ['name' => 'Công việc lặp lại', 'sort_order' => 2],
        // ]);


        // status nv
        DB::table('admin_user_status')->truncate();
        DB::table('admin_user_status')->insert([
            ['name' => 'Đang hoạt động', 'sort_order' => 1],
            ['name' => 'Tạm nghỉ', 'sort_order' => 2],
            ['name' => 'Đã nghỉ', 'sort_order' => 3],
        ]);

        // chức vụ
        DB::table('chuc_vu')->truncate();
        DB::table('chuc_vu')->insert([
            ['name' => 'Giám đốc điều hành', 'sort_order' => 1],
            ['name' => 'Kế toán trưởng', 'sort_order' => 2],
            ['name' => 'Nhân viên kế toán', 'sort_order' => 3],
            ['name' => 'Trưởng phòng kinh doanh', 'sort_order' => 4],
            ['name' => 'Nhân viên kinh doanh', 'sort_order' => 5],
        ]);


        $sortOrder = 1;
        DB::table('tinh_trang_hon_nhan')->truncate();
        DB::table('tinh_trang_hon_nhan')->insert([
            ['name' => 'Độc thân', 'sort_order' => $sortOrder++],
            ['name' => 'Đã kết hôn', 'sort_order' => $sortOrder++],
            ['name' => 'Goá', 'sort_order' => $sortOrder++],
            ['name' => 'Đã ly hôn', 'sort_order' => $sortOrder++]
        ]);


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

        DB::table('trang_thai_hoa_don')->truncate();
        DB::table('trang_thai_hoa_don')->insert([
            ['name' => 'Đã thanh toán', 'sort_order' => $sortOrder++],
            ['name' => 'Chưa thanh toán', 'sort_order' => $sortOrder++],
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

        DB::table('product_thuoc_tinh')->truncate();
        DB::table('product_thuoc_tinh')->insert([
            [
                'name' => 'Loại',
            ],
            [
                'name' => 'Dung tích',
            ],
            [
                'name' => 'Màu sắc',
            ]
        ]);

        DB::table('product_group')->truncate();
        DB::table('product_group')->insert([
            [
                'name' => 'Hàng hóa bán ra',
            ],
            [
                'name' => 'Nguyên vật liệu tiêu hao',
            ],
            [
                'name' => 'Vật tư tiêu hao nội bộ',
            ],
            [
                'name' => 'Công cụ dụng cụ',
            ],
            [
                'name' => 'Tài sản cố định',
            ],
            [
                'name' => 'Hàng khuyến mãi/ tặng kèm',
            ],
            [
                'name' => 'Hàng dùng thử/ demo',
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

        DB::table('user_source')->truncate();
        DB::table('user_source')->insert([
            [
                'name' => 'Khách đến trực tiếp',
            ],
            [
                'name' => 'Facebook',
            ],
            [
                'name' => 'Google ads',
            ],
            [
                'name' => 'Youtube',
            ],
            [
                'name' => 'Zalo',
            ],
            [
                'name' => 'Khách đặt qua điện thoại',
            ],
            [
                'name' => 'Website',
            ],
            [
                'name' => 'Khách giới thiệu',
            ],
            [
                'name' => 'Nhân viên giới thiệu',
            ],
            [
                'name' => 'Telesale',
            ]
        ]);

        DB::table('status_kiem_kho')->truncate();
        DB::table('status_kiem_kho')->insert([
            [
                'name' => 'Phiếu tạm',
            ],
            [
                'name' => 'Đã cân bằng kho',
            ]
        ]);

        DB::table('so_quy_status')->insert([
            [
                'name' => 'Đã thanh toán',
                'color' => '',
            ],
            [
                'name' => 'Chưa thanh toán',
                'color' => '',
            ],
            [
                'name' => 'Còn công nợ',
                'color' => '',
            ],
            [
                'name' => 'Lưu nháp',
                'color' => '',
            ],
        ]);

        DB::table('so_quy_type')->truncate();
        DB::table('so_quy_type')->insert([
            [
                'name' => 'Khách thanh toán hóa đơn',
                'color' => '',
            ],
            [
                'name' => 'Khách trả hàng',
                'color' => '',
            ],
            [
                'name' => 'Chi tiền mua hàng cho NCC',
                'color' => '',
            ],

            [
                'name' => 'thu tiền trả lại hàng cho NCC',
                'color' => '',
            ],
            [
                'name' => 'Thu chuyển/rút',
                'color' => '',
            ],
            [
                'name' => 'Chi chuyển/rút',
                'color' => '',
            ]
        ]);

        // nhom ng nhan
        DB::table('nhom_nguoi_nhan')->truncate();
        DB::table('nhom_nguoi_nhan')->insert([
            [
                'name' => 'Khách hàng'
            ],
            [
                'name' => 'Nhà cung cấp'
            ],
            [
                'name' => 'Nhân viên'
            ],
            [
                'name' => 'Khác'
            ]
        ]);

        // loai chi
        DB::table('loai_thu_chi')->truncate();
        DB::table('loai_thu_chi')->insert([
            [
                'name' => 'Khách trả hàng'
            ],
            [
                'name' => 'Nhập hàng'
            ],
            [
                'name' => 'Trả lương'
            ],
            [
                'name' => 'Trả hàng NCC'
            ],
            [
                'name' => 'Thu khác'
            ],
            [
                'name' => 'Chi khác'
            ]
        ]);

        DB::table('loai_chi')->truncate();
        DB::table('loai_chi')->insert([
            [
                'id' => 1,
                'name' => 'Rút tiền',
            ],
            [
                'id' => 2,
                'name' => 'Nhập hàng từ NCC',
            ],
            [
                'id' => 3,
                'name' => 'Khách trả hàng',
            ],
            [
                'id' => 4,
                'name' => 'Trả lương',
            ],
            [
                'id' => 5,
                'name' => 'Khoản chi khác',
            ],
        ]);

        DB::table('loai_thu')->truncate();
        DB::table('loai_thu')->insert([
            [
                'id' => 1,
                'name' => 'Nạp tiền vào TK công ty',
            ],
            [
                'id' => 2,
                'name' => 'Hóa đơn bán lẻ',
            ],
            [
                'id' => 3,
                'name' => 'Trả hàng NCC',
            ],
            [
                'id' => 4,
                'name' => 'Khoản thu khác',
            ],
        ]);

        DB::table('hinh_thuc_thanh_toan')->truncate();
        DB::table('hinh_thuc_thanh_toan')->insert([
            [
                'name' => 'Tiền mặt'
            ],
            [
                'name' => 'Thẻ'
            ],
            [
                'name' => 'Chuyển khoản'
            ]
        ]);

        // product
        DB::table('products')->truncate();
        for ($i = 0; $i < 20; $i++) {
            $product = new Product();
            $product->name = 'Sản phẩm ' . $i;
            $product->code = 'SP0000' . $i;
            $product->gia_ban = '1000000';
            $product->gia_von = '900000';

            if($i<8) {
                $product->product_type_id = 1;
                $product->product_group_id = 2;
            } else if ($i>= 8 && $i <=15) { 
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
                    'ton_kho' => 40 + $i*100
                ],
                2 => [
                    'kho_hang_id' => 2,
                    'kho_hang_name' => 'Phổ Quang',
                    'ton_kho' => 70 + $i*100
                ]
                ];
            $product->ton_kho_detail = $detail;
            
            $product->ton_kho = $detail[1]['ton_kho'] + $detail[2]['ton_kho'];
            $product->save();
        }

        DB::table('tra_hang_ncc_status')->truncate();
        DB::table('tra_hang_ncc_status')->insert([
            [
                'name' => 'Lưu nháp',
            ],
            [
                'name' => 'Đã trả hàng',
            ]
        ]);

        DB::table('xuat_huy_status')->truncate();
        DB::table('xuat_huy_status')->insert([
            [
                'name' => 'Lưu nháp',
            ],
            [
                'name' => 'Đã xuất kho',
            ]
        ]);

        DB::table('ly_do_xuat_huy')->truncate();
        DB::table('ly_do_xuat_huy')->insert([
            [
                'name' => 'Xuất bán hàng',
            ],
            [
                'name' => 'Xuất sử dụng',
            ],
            [
                'name' => 'Xuất tiêu hủy',
            ],
            [
                'name' => 'Xuất thanh lý',
            ],
            [
                'name' => 'Quá hạn sử dụng',
            ]
        ]);

        DB::table('chi_nhanh_status')->truncate();
        DB::table('chi_nhanh_status')->insert([
            [
                'name' => 'Đang hoạt động',
            ],
            [
                'name' => 'Tạm dừng',
            ],
            [
                'name' => 'Ngừng hoạt động',
            ]
        ]);

        DB::table('admin_config')->truncate();
        DB::table('admin_config')->insert([
            [
                'name' => 'HIMALAYA SPA',
                'phone01' => '097 717 2222'
            ]
        ]);

        DB::table('don_vi')->truncate();
        DB::table('don_vi')->insert([
            [
                'name' => 'Hộp',
            ],
            [
                'name' => 'Can',
            ],
            [
                'name' => 'Thùng',
            ],
            [
                'name' => 'Lít',
            ],
            [
                'name' => 'Gam',
            ],
            [
                'name' => 'Kg',
            ],
            [
                'name' => 'ML',
            ]
        ]);

        DB::table('cong_no_status')->truncate();
        DB::table('cong_no_status')->insert([
            [
                'name' => 'Đã tất toán',
            ],
            [
                'name' => 'Còn công nợ',
            ],
            [
                'name' => 'Chưa thanh toán',
            ]
        ]);

        DB::table('gioi_tinh')->truncate();
        DB::table('gioi_tinh')->insert([
            ['name' => 'Nam', 'color' => 'processing'],
            ['name' => 'Nữ', 'color' => 'error'],
            ['name' => 'Khác', 'color' => 'processing'],
        ]);

        DB::table('customer_group')->truncate();
        DB::table('customer_group')->insert([
            ['name' => 'Khách VIP'],
            ['name' => 'Nữ'],
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

        $statusOrder = 1;
        DB::table('task_status')->truncate();
        DB::table('task_status')->insert([
            ['name' => 'Chưa xử lý', 'color' => '#ffffff', 'background' => '#64748b', 'icon' => 'ExclamationCircleFilled', 'sort_order' => $statusOrder++],
            ['name' => 'Đang xử lý', 'color' => '#ffffff', 'background' => '#053396ff', 'icon' => 'BulbFilled', 'sort_order' => $statusOrder++],
            ['name' => 'Chờ review', 'color' => '#ffffff', 'background' => '#044e3cff', 'icon' => 'EyeFilled', 'sort_order' => $statusOrder++],
            ['name' => 'Fix comment', 'color' => '#ffffff', 'background' => '#596803ff', 'icon' => 'FileExclamationFilled', 'sort_order' => $statusOrder++],
            ['name' => 'Đã hoàn thành', 'color' => '#ffffff', 'background' => '#057734ff', 'icon' => 'CheckCircleFilled', 'sort_order' => $statusOrder++],
        ]);

        DB::table('task_prority')->truncate();
        DB::table('task_prority')->insert([
            ['name' => 'Urgent', 'color' => '#d30000ff'],
            ['name' => 'High', 'color' => '#d3c500ff'],
            ['name' => 'Medium', 'color' => '#0557c2ff'],
            ['name' => 'Low', 'color' => '#07a2adff'],
            ['name' => 'Lowest', 'color' => '#065270ff'],
        ]);

        DB::table('task_type')->truncate();
        DB::table('task_type')->insert([
            ['name' => 'Hàng ngày', 'color' => '#079106'],
            ['name' => 'Dự án', 'color' => '#920303ff'],
            ['name' => 'Sale', 'color' => '#680586ff'],
            ['name' => 'CSKH', 'color' => '#041f96ff'],
        ]);

        DB::table('tai_san_status')->truncate();
        DB::table('tai_san_status')->insert([
            ['name' => 'Vẫn dùng tốt', 'color' => '#079106'],
            ['name' => 'Đã hỏng', 'color' => '#920303ff'],
            ['name' => 'Đã thanh lý', 'color' => '#680586ff'],
            ['name' => 'Đang sửa chữa', 'color' => 'rgba(176, 179, 3, 1)'],
            ['name' => 'Đã cấp hoàn toàn cho nhân viên', 'color' => '#041f96ff'],
        ]);

        DB::table('tai_san_type')->truncate();
        DB::table('tai_san_type')->insert([
            ['name' => 'Tài sản sử dụng', 'color' => '#053185ff', 'description' => 'Máy tính, laptop ....'],
            ['name' => 'Tài sản tiêu hao', 'color' => '#b8ac07ff', 'description' => 'Tài sản cấp cho nhân viên nhưng không bao giờ thu hồi như đồng phục, bút...'],
        ]);


        DB::table('tai_san_status_used')->truncate();
        DB::table('tai_san_status_used')->insert([
            ['name' => 'Đang trong kho', 'color' => '#053185ff'],
            ['name' => 'Đang sử dụng', 'color' => '#079106'],
        ]);

        DB::table('kho_tai_san')->truncate();
        DB::table('kho_tai_san')->insert([
            ['name' => 'Vinhomes', 'color' => '#053185ff'],
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