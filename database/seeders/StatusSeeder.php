<?php

namespace Database\Seeders;

use App\Models\Admin\Project;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StatusSeeder extends Seeder
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
        DB::table('route')->insert(
            [
                ['name' => 'product', 'display_name' => 'Trang sản phẩm', 'parent_id' => 0, 'sort_order' => $order++],
                ['name' => 'news', 'display_name' => 'Trang tin tức', 'parent_id' => 0, 'sort_order' => $order++],
                ['name' => 'video', 'display_name' => 'Video', 'parent_id' => 0, 'sort_order' => $order++],
                ['name' => 'libs', 'display_name' => 'Thư viện ảnh', 'parent_id' => 0, 'sort_order' => $order++],
                ['name' => 'single_page', 'display_name' => 'Bài viết đơn', 'parent_id' => 0, 'sort_order' => $order++],
                ['name' => 'about', 'display_name' => 'Trang giới thiệu', 'parent_id' => 0, 'sort_order' => $order++],
                ['name' => 'contact', 'display_name' => 'Trang liên hệ', 'parent_id' => 0, 'sort_order' => $order++],
                ['name' => 'landingpage', 'display_name' => 'Trang landingpage', 'parent_id' => 0, 'sort_order' => $order++]
            ]
        );

        // status nv
        DB::table('admin_user_status')->truncate();
        DB::table('admin_user_status')->insert([
            ['name' => 'Đang hoạt động', 'sort_order' => 1],
            ['name' => 'Tạm nghỉ', 'sort_order' => 2],
            ['name' => 'Đã nghỉ', 'sort_order' => 3],
        ]);

        // chức vụ
        $sortOrder = 1;
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


        DB::table('gioi_tinh')->truncate();
        DB::table('gioi_tinh')->insert([
            ['name' => 'Nam', 'color' => 'processing'],
            ['name' => 'Nữ', 'color' => 'error'],
            ['name' => 'Khác', 'color' => 'processing'],
        ]);

        DB::table('customer_group')->truncate();
        DB::table('customer_group')->insert([
            ['name' => 'Khách VIP'],
            ['name' => 'Khách thường'],
            ['name' => 'Khách lẻ'],
            ['name' => 'Khách thân thiết'],
            ['name' => 'Khách hàng tiềm năng'],
        ]);

        //
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
            ['name' => 'Tổng kho', 'color' => '#053185ff'],
        ]);

        DB::table('cong_no_status')->truncate();
        DB::table('cong_no_status')->insert([
            ['name' => 'Đã tất toán'],
            ['name' => 'Còn công nợ'],
            ['name' => 'Chưa thanh toán'],
        ]);

        DB::table('don_vi')->truncate();
        DB::table('don_vi')->insert([
            ['name' => 'Hộp'],
            ['name' => 'Can'],
            ['name' => 'Thùng'],
            ['name' => 'Lít'],
            ['name' => 'Gam'],
            ['name' => 'Kg'],
            ['name' => 'ML']
        ]);

        DB::table('chi_nhanh_status')->truncate();
        DB::table('chi_nhanh_status')->insert([
            ['name' => 'Đang hoạt động'],
            ['name' => 'Tạm dừng'],
            ['name' => 'Ngừng hoạt động']
        ]);

        DB::table('ly_do_xuat_huy')->truncate();
        DB::table('ly_do_xuat_huy')->insert([
            ['name' => 'Xuất bán hàng'],
            ['name' => 'Xuất sử dụng'],
            ['name' => 'Xuất tiêu hủy'],
            ['name' => 'Xuất thanh lý'],
            ['name' => 'Quá hạn sử dụng']
        ]);

        DB::table('tra_hang_ncc_status')->truncate();
        DB::table('tra_hang_ncc_status')->insert([
            ['name' => 'Lưu nháp'],
            ['name' => 'Đã trả hàng']
        ]);

        DB::table('xuat_huy_status')->truncate();
        DB::table('xuat_huy_status')->insert([
            ['name' => 'Lưu nháp'],
            ['name' => 'Đã xuất kho',]
        ]);

        DB::table('hinh_thuc_thanh_toan')->truncate();
        DB::table('hinh_thuc_thanh_toan')->insert([
            ['name' => 'Tiền mặt'],
            ['name' => 'Thẻ'],
            ['name' => 'Chuyển khoản']
        ]);

        DB::table('loai_thu')->truncate();
        DB::table('loai_thu')->insert([
            ['id' => 1, 'name' => 'Nạp tiền vào TK công ty'],
            ['id' => 2, 'name' => 'Hóa đơn bán lẻ'],
            ['id' => 3, 'name' => 'Trả hàng NCC'],
            ['id' => 4, 'name' => 'Khoản thu khác'],
        ]);

        DB::table('loai_chi')->truncate();
        DB::table('loai_chi')->insert([
            ['id' => 1, 'name' => 'Rút tiền'],
            ['id' => 2, 'name' => 'Nhập hàng từ NCC'],
            ['id' => 3, 'name' => 'Khách trả hàng'],
            ['id' => 4, 'name' => 'Trả lương'],
            ['id' => 5, 'name' => 'Khoản chi khác'],
        ]);

        DB::table('user_source')->truncate();
        DB::table('user_source')->insert([
            ['name' => 'Khách đến trực tiếp'],
            ['name' => 'Facebook'],
            ['name' => 'Google ads'],
            ['name' => 'Youtube'],
            ['name' => 'Zalo'],
            ['name' => 'Khách đặt qua điện thoại'],
            ['name' => 'Website'],
            ['name' => 'Khách giới thiệu'],
            ['name' => 'Nhân viên giới thiệu'],
            ['name' => 'Telesale'],
        ]);

        DB::table('status_kiem_kho')->truncate();
        DB::table('status_kiem_kho')->insert([
            ['name' => 'Phiếu tạm'],
            ['name' => 'Đã cân bằng kho'],
        ]);

        DB::table('so_quy_status')->insert([
            ['name' => 'Đã thanh toán', 'color' => ''],
            ['name' => 'Chưa thanh toán', 'color' => ''],
            ['name' => 'Còn công nợ', 'color' => ''],
            ['name' => 'Lưu nháp', 'color' => ''],
        ]);

        DB::table('so_quy_type')->truncate();
        DB::table('so_quy_type')->insert([
            ['name' => 'Phiếu thu', 'color' => ''],
            ['name' => 'Phiếu chi', 'color' => ''],
        ]);

        DB::table('nhom_nguoi_nhan')->truncate();
        DB::table('nhom_nguoi_nhan')->insert([
            ['name' => 'Khách hàng'],
            ['name' => 'Nhà cung cấp'],
            ['name' => 'Nhân viên'],
            ['name' => 'Khác'],
        ]);

        DB::table('loai_thu_chi')->truncate();
        DB::table('loai_thu_chi')->insert([
            ['name' => 'Khách trả hàng'],
            ['name' => 'Nhập hàng'],
            ['name' => 'Trả lương'],
            ['name' => 'Trả hàng NCC'],
            ['name' => 'Thu khác'],
            ['name' => 'Chi khác'],
        ]);


        $sortOrder = 1;
        DB::table('hoa_don_status')->truncate();
        DB::table('hoa_don_status')->insert([
            ['name' => 'Đã thanh toán', 'sort_order' => $sortOrder++],
            ['name' => 'Chưa thanh toán', 'sort_order' => $sortOrder++],
            ['name' => 'Còn công nợ', 'sort_order' => $sortOrder++],
            ['name' => 'Đã hủy', 'sort_order' => $sortOrder++],
        ]);

        DB::table('product_thuoc_tinh')->truncate();
        DB::table('product_thuoc_tinh')->insert([
            ['name' => 'Loại'],
            ['name' => 'Dung tích'],
            ['name' => 'Màu sắc'],
        ]);

        DB::table('product_group')->truncate();
        DB::table('product_group')->insert([
            ['name' => 'Hàng hóa bán ra'],
            ['name' => 'Nguyên vật liệu tiêu hao'],
            ['name' => 'Vật tư tiêu hao nội bộ'],
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

        DB::table('nhap_hang_status')->truncate();
        DB::table('nhap_hang_status')->insert([
            ['name' => 'Đã nhập hàng'],
            ['name' => 'Lưu nháp'],
        ]);

        DB::table('countries')->truncate();
        DB::table('countries')->insert([
            ['name' => 'Việt Nam'],
            ['name' => 'Hoa Kỳ'],
            ['name' => 'Trung Quốc'],
        ]);

        DB::table('product_status')->truncate();
        DB::table('product_status')->insert([
            ['name' => 'Hiển thị trên web'],
            ['name' => 'Tạm ẩn'],
        ]);

        DB::table('user_status')->truncate();
        DB::table('user_status')->insert([
            ['name' => 'Đang sử dụng dịch vụ'],
            ['name' => 'Đã dừng sử dụng dịch vụ'],
        ]);

        $statusOrder = 1;
        DB::table('contract_status')->truncate();
        DB::table('contract_status')->insert([
            ['name' => 'Đang hoạt động', 'color' => '#05c273', 'icon' => 'CheckCircleOutlined', 'sort_order' => $statusOrder++, 'is_default' => 1],
            ['name' => 'Chờ xác nhận', 'color' => '#c20588', 'icon' => 'SyncOutlined', 'sort_order' => $statusOrder++, 'is_default' => 1],
            ['name' => 'Đã hết hạn', 'color' => '#c2c205ff', 'icon' => 'StopOutlined', 'sort_order' => $statusOrder++, 'is_default' => 1],
            ['name' => 'Đã hủy', 'color' => '#a97a7a', 'icon' => 'CloseOutlined', 'sort_order' => $statusOrder++, 'is_default' => 0],
        ]);

        $statusOrder = 1;
        DB::table('room_status')->truncate();
        DB::table('room_status')->insert([
            ['name' => 'Đang hoạt động', 'color' => '#ffffff', 'background' => '#079c48ff', 'icon' => 'CheckCircleOutlined', 'sort_order' => $statusOrder++, 'is_default' => 1],
            ['name' => 'Tạm dừng', 'color' => '#ffffff', 'background' => '#0072ff', 'icon' => 'StopOutlined', 'sort_order' => $statusOrder++, 'is_default' => 0],
            ['name' => 'Đã trả nhà', 'color' => '#ffffff', 'background' => '#c2c205ff', 'icon' => 'CloseOutlined', 'sort_order' => $statusOrder++, 'is_default' => 0],
        ]);

        $statusOrder = 1;
        DB::table('aitilen_invoice_status')->truncate();
        DB::table('aitilen_invoice_status')->insert([
            ['name' => 'Đã thanh toán', 'color' => '#079c48ff', 'icon' => 'CheckCircleOutlined', 'sort_order' => $statusOrder++, 'is_default' => 1],
            ['name' => 'Chưa thanh toán', 'color' => '#ad0707', 'icon' => 'CloseOutlined', 'sort_order' => $statusOrder++, 'is_default' => 0],
            ['name' => 'Còn công nợ', 'color' => '#c2c205ff', 'icon' => 'StopOutlined', 'sort_order' => $statusOrder++, 'is_default' => 0],
        ]);

        DB::table('aitilen_service')->truncate();
        $idx = 1;
        DB::table('aitilen_service')->insert([
            ['name' => 'Điện', 'code' => 'DIEN', 'price_default' => 4000, 'is_invoice_default' => 0, 'is_contract_default' => 1, 'sort_order' => $idx++, 'per_default' => 'KWH', 'price_total'=>0],
            ['name' => 'Nước', 'code' => 'NUOC', 'price_default' => 100000, 'is_invoice_default' => 1, 'is_contract_default' => 1, 'sort_order' => $idx++, 'per_default' => 'Người', 'price_total'=>100000],
            ['name' => 'Mạng Internet', 'code' => 'INTERNET', 'price_default' => 100000, 'is_invoice_default' => 1, 'is_contract_default' => 1, 'sort_order' => $idx++, 'per_default' => 'Phòng', 'price_total'=>100000],
            ['name' => 'Vệ sinh chung', 'code' => 'VESINHCHUNG', 'price_default' => 30000, 'is_invoice_default' => 1, 'is_contract_default' => 1, 'sort_order' => $idx++, 'per_default' => 'Người', 'price_total'=>30000],
            ['name' => 'Điện chung', 'code' => 'DICHVUCHUNG', 'price_default' => 30000, 'is_invoice_default' => 1, 'is_contract_default' => 1, 'sort_order' => $idx++, 'per_default' => 'Người', 'price_total'=>30000],
            ['name' => 'Máy giặt', 'code' => 'MAGIAT', 'price_default' => 70000, 'is_invoice_default' => 0, 'is_contract_default' => 0, 'sort_order' => $idx++, 'per_default' => 'Người', 'price_total'=>70000],
            ['name' => 'Thang máy', 'code' => 'THANGMAY', 'price_default' => 50000, 'is_invoice_default' => 0, 'is_contract_default' => 0,   'sort_order' => $idx++, 'per_default' => 'Người', 'price_total'=>50000],
            ['name' => 'Tủ lạnh', 'code' => 'TULANH', 'price_default' => 150000, 'is_invoice_default' => 0, 'is_contract_default' => 0,   'sort_order' => $idx++, 'per_default' => 'Phòng', 'price_total'=>150000],
            ['name' => 'Xe đạp điện', 'code' => 'XEDAPDIEN', 'price_default' => 100000, 'is_invoice_default' => 0, 'is_contract_default' => 0,   'sort_order' => $idx++, 'per_default' => 'Xe', 'price_total'=>100000],
            ['name' => 'Gửi xe', 'code' => 'GUIXE', 'price_default' => 150000, 'is_invoice_default' => 0, 'is_contract_default' => 0,   'sort_order' => $idx++, 'per_default' => 'Xe', 'price_total'=>150000],
            ['name' => 'Quản lý chung', 'code' => 'QUANLYCHUNG', 'price_default' => 100000, 'is_invoice_default' => 0, 'is_contract_default' => 0,   'sort_order' => $idx++, 'per_default' => 'Phòng', 'price_total'=>100000],
            ['name' => 'Dịch vụ chung', 'code' => 'DICHVUCHUNG', 'price_default' => 150000, 'is_invoice_default' => 0, 'is_contract_default' => 0,'sort_order' => $idx++, 'per_default' => 'Phòng', 'price_total'=>150000],
            ['name' => 'Giảm giá', 'code' => 'GIAMGIA', 'price_default' => 0, 'is_invoice_default' => 0, 'is_contract_default' => 0,   'sort_order' => $idx++, 'per_default' => 'Phòng', 'price_total'=>0],
        ]);
    }
}
