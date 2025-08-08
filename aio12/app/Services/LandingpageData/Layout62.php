<?php

namespace App\Services\LandingpageData;

use Illuminate\Support\Facades\DB;
use App\Services\Service;
use App\Models\Web\Landingpage;
use App\Models\Web\Menu;

use function PHPSTORM_META\type;

/**
 * Class CompanyService
 * @package App\Services\Users
 */
class Layout62 extends Service
{
    const CONFIG = [
        'banner' => [
            'col' => [
                'name' => Land::NAME_DEFAULT,
                'sub_title' => Land::SUB_TITLE_DEFAULT,
                'is_show_btn_register' => Land::CHECKBOX_SHOW_REGIS,
                'is_show_hotline' => Land::CHECKBOX_SHOW_HOTLINE,
            ],
            'description_json01' => Land::JSON_DEFAULT,
            'image01' => 'Ảnh tỷ lệ 3:1',
        ],
        'block06' => [
            'col' => [
                'name' => Land::NAME_DEFAULT,
                'sub_title' => Land::SUB_TITLE_DEFAULT,
                'is_show_btn_register' => Land::CHECKBOX_SHOW_REGIS,
            ],
            'images' => 'Ảnh tỷ lệ chuẩn 1:3',
        ],
        'block01' => [
            'col' => [
                'name' => Land::NAME_DEFAULT,
            ],
            'description_json01' => Land::JSON_DEFAULT,
            'image01' => 'Ảnh tỷ lệ chuẩn 1:3',

        ],
        'block02' => [
            'col' => [
                'name' => Land::NAME_DEFAULT,
                'is_show_btn_register' => Land::CHECKBOX_SHOW_REGIS,

            ],
            'description_json01' => Land::JSON_DEFAULT1,
            'description_json02' => Land::JSON_DEFAULT1,
            'image01' => 'Ảnh tỷ lệ 16:9'

        ],
        'block04' => [
            'col' => [
                'name' => Land::NAME_DEFAULT,
                'sub_title' => Land::NAME_DEFAULT,
                'sub_title01' => Land::NAME_DEFAULT,
                'sub_title02' => Land::NAME_DEFAULT,
                'sub_title03' => Land::NAME_DEFAULT,
            ],
            'description_json01' => Land::JSON_DEFAULT1,
            'description_json02' => Land::JSON_DEFAULT1,
            'description_json03' => Land::JSON_DEFAULT1,
            'image01' => 'Ảnh tỷ lệ 2:1',
            'image02' => 'Ảnh tỷ lệ 2:1',
            'image03' => 'Ảnh tỷ lệ 2:1',


        ],
        'block09' => [
            'col' => [
                'name' => Land::NAME_DEFAULT,
                'sub_title' => Land::SUB_TITLE_DEFAULT,
                'sub_title01' => Land::NAME_DEFAULT,
                'sub_title02' => Land::NAME_DEFAULT,
                'sub_title03' => Land::NAME_DEFAULT,
                'sub_title04' => Land::NAME_DEFAULT,
                'description01' => Land::DES_EDITOR,
                'description02' => Land::DES_EDITOR,
                'description03' => Land::DES_EDITOR,
                'description04' => Land::DES_EDITOR,
            ]
        ],
        'block03' => [
            'col' => [
                'name' => Land::NAME_DEFAULT,
                'sub_title' => Land::SUB_TITLE_DEFAULT,
                'sub_title01' => Land::NAME_DEFAULT,
                'sub_title02' => Land::NAME_DEFAULT,
                'description01' => Land::DES_EDITOR,
                'description02' => Land::DES_EDITOR,
                'description03' => Land::DES_EDITOR,
            ],
            'description_json01' => Land::JSON_02,
        ],
        'block05' => [
            'col' => [
                'name' => Land::NAME_DEFAULT,
                'sub_title' => Land::DE_NAME_DEFAULT,
                'sub_title01' => Land::DIEU_HUONG,
                'sub_title02' => Land::DIEU_HUONG,
                'sub_title03' => Land::NAME_DEFAULT,
                'sub_title04' => Land::NAME_DEFAULT,
                'link_1' => Land::NAVIGATION,
                'link_2' => Land::NAVIGATION,
                'link_3' => Land::NAVIGATION,
                'link_4' => Land::NAVIGATION,
                'description01' => Land::DES_DEFAULT,
                'description02' => Land::DES_DEFAULT,
                'description03' => Land::DES_DEFAULT,
                'description04' => Land::DES_DEFAULT,
                'is_show_btn_register' => Land::CHECKBOX_SHOW_REGIS,

            ],
            'description_json01' => Land::JSON_DEFAULT1,
            'description_json02' => Land::JSON_DEFAULT1,
            'description_json03' => Land::JSON_DEFAULT1,
            'description_json04' => Land::JSON_DEFAULT1,
        ],
        'block08' => [

            'col' => [
                'name' => Land::NAME_DEFAULT,
                'sub_title01' => Land::NAME_DEFAULT,
                'sub_title' => Land::NAME_DEFAULT,

            ],
            'description_json01' => Land::JSON_DEFAULT,
            'image03' => 'Ảnh tỷ lệ 2:1',
            'image02' => 'Ảnh tỷ lệ 2:1',
        ],
        'block07' => [
            'col' => [
                'name' => Land::NAME_DEFAULT,
                'sub_title' => Land::SUB_TITLE_DEFAULT,
            ],
            'image01' => 'Ảnh tỷ lệ 1:1',
        ],
        'block10' => [
            'col' => [
                'name' => Land::NAME_DEFAULT,
                'sub_title01' => Land::NAME_DEFAULT,
                'is_show_btn_register' => Land::CHECKBOX_SHOW_REGIS,
                'sub_title' => Land::DE_NAME_DEFAULT,
                'sub_title02' => Land::LINK_Youtube,
            ],
            'description_json01' => Land::JSON_DEFAULT1,
        ],
        'block11' => [
            'col' => [
                'name' => Land::NAME_DEFAULT,
                'sub_title' => Land::DE_NAME_DEFAULT,
                'sub_title01' => Land::NAME_DEFAULT,
                'sub_title02' => Land::NAME_DEFAULT,
                'sub_title03' => Land::LINK_Youtube,
                'description01' => Land::DES_EDITOR,
            ],
            'image01' => 'Ảnh tỷ lệ  5:4',
        ],
        'block12' => [
            'col' => [
                'name' => Land::NAME_DEFAULT,
                'sub_title' => Land::DE_NAME_DEFAULT,
                'sub_title01' => Land::LINK_Youtube,
            ],
            'description_json01' => Land::JSON_D,
        ],
        'block13' => [
            'col' => [
                'name' => Land::NAME_DEFAULT,
                'sub_title' => Land::DE_NAME_DEFAULT,
                'sub_title01' => Land::LINK_Youtube,
                'sub_title02' => Land::COMMENT,
                'sub_title03' => Land::COMMENT,
                'sub_title04' => Land::COMMENT,
                'sub_title05' => Land::COMMENT,
                'description01' => Land::DES_EDITOR_COMMENT,
                'description02' => Land::DES_EDITOR_COMMENT,
                'description03' => Land::DES_EDITOR_COMMENT,
                'description04' => Land::DES_EDITOR_COMMENT,
            ],

            'image01' => 'Ảnh comments1(168 x 168pixel)',
            'image02' => 'Ảnh comments2(168 x 168pixel)',
            'image03' => 'Ảnh comments3(168 x 168pixel)',
            'image04' => 'Ảnh comments4(168 x 168pixel)',
        ],
    ];

    static function block06($sortOrder = 0, $menuId = 0)
    {
        Landingpage::create([
            'sort_order' => $sortOrder,
            'menu_id' => $menuId,
            'type' => 'block06',
            'name' => 'CÁC WEBSITE NỔI BẬT',
            'sub_title' => 'WEB EXPRESS',
            'is_show_btn_register' => 1,
            'images' => [
                'https://htvietnam.vn/storage/web/5.png',
                'https://htvietnam.vn/storage/web/09.png',
                'https://htvietnam.vn/storage/web/06.png',
                'https://htvietnam.vn/storage/web/03.png',
                'https://htvietnam.vn/storage/web/07.png',
                'https://htvietnam.vn/storage/web/13.png'
            ],
        ]);
    }


    static function banner($sortOrder = 0, $menuId = 0)
    {
        Landingpage::create([
            'sort_order' => $sortOrder,
            'menu_id' => $menuId,
            'type' => 'banner',
            'name' => 'HT VIỆT NAM',
            'is_show_btn_register' => 1,
            'is_show_hotline' => 1,
            'image01' => 'https://img.htvietnam.vn/layouts/62/banner.jpg',
            'sub_title' => 'Dịch vụ thiết kế web tại HT được đúc kết từ nhiều năm kinh nghiệm, với hơn 1300+ Khách hàng, sẽ giúp bạn tiết kiệm thời gian và kinh doanh hiệu quả',
        ]);
    }
    static function block01($sortOrder = 0, $menuId = 0)
    {
        Landingpage::create([
            'sort_order' => $sortOrder,
            'menu_id' => $menuId,
            'type' => 'block01',
            'name' => 'Thống kê',
            'description_json01' => [
                ['key' => '1300', 'value' => 'Khách hàng'],
                ['key' => '1300', 'value' => 'Domain đăng ký tại HT Việt Nam'],
                ['key' => '2000', 'value' => 'Đại lý / Đối tác chiến lược']
            ],
            'image01' => 'https://img.htvietnam.vn/layouts/62/BG-1.png',
        ]);
    }
    static function block02($sortOrder = 0, $menuId = 0)
    {
        Landingpage::create([
            'sort_order' => $sortOrder,
            'menu_id' => $menuId,
            'type' => 'block02',
            'name' => 'Kho giao diện phong phú, phù hợp với nhiều bussiness',
            'is_show_btn_register' => 1,
            'description_json01' => [
                ['value' => 'Thương mại điện tử'],
                ['value' => 'Thời trang'],
                ['value' => 'Mĩ phẩm'],
                ['value' => 'Nội thất'],
                ['value' => 'GYM, Thể thao'],
                ['value' => 'GYM, Thể thao1'],

            ],
            'description_json02' => [
                ['value' => 'Thương mại điện tử'],
                ['value' => 'Thời trang'],
                ['value' => 'Mĩ phẩm'],
                ['value' => 'Nội thất'],
                ['value' => 'GYM, Thể thao'],
                ['value' => 'GYM, Thể thao1'],

            ],
            'image01' => 'https://img.htvietnam.vn/layouts/62/he.png',

        ]);
    }

    static function block07($sortOrder = 0, $menuId = 0)
    {
        Landingpage::create([
            'sort_order' => $sortOrder,
            'menu_id' => $menuId,
            'type' => 'block07',
            'name' => 'Nhận tư vấn trực tiếp từ chuyên gia!',
            'sub_title' => 'Chúng tôi cam kết bảo mật thông tin cá nhân của bạn.',
            'image01' => 'https://img.htvietnam.vn/layouts/62/tu-van.jpg ',

        ]);
    }

    static function block09($sortOrder = 0, $menuId = 0)
    {
        Landingpage::create([
            'sort_order' => $sortOrder,
            'menu_id' => $menuId,
            'type' => 'block09',
            'name' => 'WEB EXPRESS LÀ GÌ?',
            'sub_title' => 'HT VIỆT NAM',
            'sub_title01' => 'WEB EXPRESS',
            'sub_title02' => 'TÍNH LINH HOẠT',
            'sub_title03' => 'TÍNH ỔN ĐỊNH',

            'description01' => '<p class="elementor-icon-box-description"> Là hệ thống <b>kho giao diện website độc quyền</b> đã được thiết kế sẵn bởi <b>HT Việt Nam</b> tương ứng với nhiều ngành nghề khác nhau. </p>
                                <p class="elementor-icon-box-description"> Không chỉ là web, Web Express được tích hợp <b>hệ thống quản lý toàn diện</b> cho doanh nghiệp như <b>QL sản phẩm, QL kho, QL công việc, Lịch hẹn, chấm công</b>....</p>',
            'description02' => '<p>Bạn tự làm chủ được website của mình mà không cần biết về kỹ thuật. Có thể <b><em>tùy chỉnh nội dung của toàn bộ website</em></b>,</p>
                                <p>hơn thế nữa là bạn có thể <b><em>chuyển đổi qua lại giao diện</em></b> giữa các mẫu webiste thoải mái và <b>hoàn toàn miễn phí</b> cho mỗi lần thay đổi</p>',
            'description03' => 'Được bảo hành và hỗ trợ liên tục 24/7 bởi <a href="https://htvietnam.vn">HT Việt Nam</a> bạn có bất kỳ thắc mắc nào, hoặc web gặp bất kỳ sự cố nào, chỉ cần gửi yêu cầu',
        ]);
    }
    static function block03($sortOrder = 0, $menuId = 0)
    {
        Landingpage::create([
            'sort_order' => $sortOrder,
            'menu_id' => $menuId,
            'type' => 'block03',
            'name' => 'LÝ DO CHỌN WEBSITE TẠI HT VIỆT NAM',
            'sub_title' => 'HOSTING TÍCH HỢP SẴN TỐC ĐỘ CAO',
            'sub_title01' => 'TỐI ƯU SEO',
            'sub_title02' => 'QUẢN LÝ VÀ NHIỀU LĨNH VỰC TÍCH HỢP',
            'image01' => 'https://img.htvietnam.vn/layouts/62/noi-bat.jpg',
            'image02' => 'https://img.htvietnam.vn/layouts/62/seo.jpg',
            'image03' => 'https://img.htvietnam.vn/layouts/62/quan-tri.jpg',
            'description01' => '(Xử dụng ổ SSD tốc độ cao, cho tốc độ tải web nhanh)',
            'description02' => '(Đảm bảo tất cả website đều tối ưu chuẩn SEO, tốt với Google)',
            'description03' => '(Với gói bussiness cao cấp, được tích hợp sẵn nhiều chức năng cao cấp trong admin như QL kho, sản phẩm, công việc, chấm công....)',
            'description_json01' => [
                [
                    'image' => 'https://img.htvietnam.vn/common/icon/cai-dat.svg',
                    'title' => 'HOSTING TÍCH HỢP SẴN TỐC ĐỘ CAO',
                    'value' => '(Xử dụng ổ SSD tốc độ cao, cho tốc độ tải web nhanh)',
                ],
                [
                    'image' => 'https://img.htvietnam.vn/common/icon/cong-dong.svg',
                    'title' => 'TỐI ƯU SEO',
                    'value' => '(Đảm bảo tất cả website đều tối ưu chuẩn SEO, tốt với Google)',
                ],
                [
                    'image' => 'https://img.htvietnam.vn/common/icon/ql.svg',
                    'title' => 'QUẢN LÝ VÀ NHIỀU LĨNH VỰC TÍCH HỢP',
                    'value' => '(Với gói bussiness cao cấp, được tích hợp sẵn nhiều chức năng cao cấp trong admin như QL kho, sản phẩm, công việc, chấm công....)',
                ],
            ],
        ]
    );
    }
    static function block04($sortOrder = 0, $menuId = 0)
    {
        Landingpage::create([
            'sort_order' => $sortOrder,
            'menu_id' => $menuId,
            'type' => 'block04',
            'name' => 'Đặc trưng của website tại HT Việt Nam',
            'sub_title01' => 'Tính năng thiết kế nổi bật',
            'sub_title02' => 'Cấu trúc website chuẩn SEO Google',
            'sub_title03' => 'Quản trị đơn giản dễ sử dụng',
            'image01' => 'https://img.htvietnam.vn/layouts/62/noi-bat.jpg',
            'image02' => 'https://img.htvietnam.vn/layouts/62/seo.jpg',
            'image03' => 'https://img.htvietnam.vn/layouts/62/quan-tri.jpg',
            'description_json01' => [
                ['value' => 'Nhiều Mẫu website đẹp, tương ứng với từng ngành nghề, dịch vụ (Update thêm nhiều mẫu mới)'],
                ['value' => 'Thay đổi giao diện web bất cứ lúc nào mà không bị mất dữ liệu'],
                ['value' => 'Thời gian cài đặt nhanh chóng, chỉ 1 ngày làm việc'],
                ['value' => 'Được hỗ trợ nâng cấp, chỉnh sửa theo yêu cầu, tuy nhiên sẽ mất thêm phí tùy thuộc vào yêu cầu chỉnh sửa của khách'],
                ['value' => 'Tất cả các giao diện chuẩn SEO'],
                ['value' => 'Hệ thống admin độc quyền của HT Việt Nam, với độ tùy biến cao'],
                ['value' => 'Server đã được tích hợp sẵn trong website, nên bạn chỉ cần chọn giao diện ứng ý, mà không cần quan tâm đến cấu hình của hosting, máy chủ....'],
                ['value' => 'Chuyên viên tư vấn 24/7'],

            ],
            'description_json02' => [
                ['value' => 'Tuỳ biến tiêu đề cho website và cả các trang bài đăng, sản phẩm.'],
                ['value' => 'Tuỳ biến mô tả mạnh mẽ đến từng bài viết.'],
                ['value' => 'Nhắm mục mục tiêu tuỳ biến từ khoá cho từng bài đăng.'],
                ['value' => 'Tích hợp Google Analytics, Webmaster Tools'],
                ['value' => 'Tích hợp Pixel Facebook, Google, Tiktok.'],
                ['value' => 'Tuỳ biến cho SEO hình ảnh trên Google.'],
                ['value' => 'Quản lý thành viên quản trị website'],
                ['value' => 'Mã nguồn riêng biệt bảo mật, chống hacker, mã độc.'],
                ['value' => 'Tích hợp bảo mật https – SSL cho từng website.'],
            ],
            'description_json03' => [
                ['value' => 'Giao diện cập nhật, quản trị nội dung hiện đại nhất.'],
                ['value' => 'Dễ dàng sử dụng, dễ dàng hướng dẫn cho nhân viên.'],
                ['value' => 'Dễ dàng thay đổi các thành phần, hình ảnh trên web.'],
                ['value' => 'Quản trị bài viết, sản phẩm, chuyên mục'],
                ['value' => 'Quản trị đơn hàng'],
                ['value' => 'Quản trị thư viện ảnh.'],
                ['value' => 'Quản trị mã giảm giá'],
            ],

        ]);
    }

    static function block05($sortOrder = 0, $menuId = 0)
    {
        Landingpage::create([
            'sort_order' => $sortOrder,
            'menu_id' => $menuId,
            'type' => 'block05',
            'name' => 'BẢNG GIÁ DỊCH VỤ',
            'sub_title' => 'HT VIỆT NAM',
            'sub_title01' => 'Kho giao diện Web Express',
            'sub_title02' => 'Thiết kế web theo yêu cầu',
            'sub_title03' => 'GÓI CƠ BẢN',
            'sub_title04' => 'GÓI NÂNG CAO',
            'link_1' => 'https://htvietnam.vn/',
            'link_2' => 'https://htvietnam.vn/',
            'link_3' => 'https://htvietnam.vn/',
            'link_4' => 'https://htvietnam.vn/',
            'description01' => '199,000/ 1 tháng',
            'description02' => '399,000/ 1 tháng',
            'description03' => '4,000,000/ 1 tháng',
            'description04' => '7,000,000/ 1 tháng',
            'is_show_btn_register' => 1,
            // 'LINK_Youtube' => 'https://htvietnam.vn/bang-gia-web-express/p57.html',
            'description_json01' => [
                ['value' => 'Tùy chọn thay đổi tối đa 3 mẫu website'],
                ['value' => 'Hosting dung lượng 2G'],
                ['value' => 'Quản lý giao diện website, banner'],
                ['value' => 'Quản lý dữ liệu sản phẩm, dịch vụ, tin tức, BĐS, tour/phòng'],
                ['value' => 'Quản lý đơn hàng và tồn kho cơ bản'],
                ['value' => 'Quản lý thanh toán cơ bản'],
                ['value' => 'Quản lý thành viên quản trị website'],
                ['value' => 'Phân quyền quản lý'],
                ['value' => 'Quản lý khách hàng'],
            ],
            'description_json02' => [
                ['value' => 'TBao gồm tất cả các dịch vụ của gói cơ bản'],
                ['value' => 'Hosting dung lượng 4G'],
                ['value' => 'Thay đổi miễn phí tất cả các giao diện website'],
                ['value' => 'Bán hàng đa kênh: Tiki, Lazada'],
                ['value' => 'Quản lý đơn hàng và tồn kho nâng cao'],
                ['value' => 'Quản lý thanh toán nâng cao: thanh toán trực tuyến, ví điện tử'],
                ['value' => 'Quản lý thành viên quản trị website'],
                ['value' => 'Đóng dấu bản quyền hình ảnh trên website'],
                ['value' => 'Tích hợp gửi email thông báo khi có đơn hàng hoặc đăng ký mới'],
            ],
            'description_json03' => [
                ['value' => 'Tặng kèm hosting dung lượng 1Gb'],
                ['value' => 'Giao diện: Phát triển thêm từ kho giao diện có sẵn'],
                ['value' => 'Chức năng tin tức: Có'],
                ['value' => 'Danh mục sản phẩm: Có'],
                ['value' => 'Chức năng giỏ hàng: Có'],
                ['value' => 'Chức năng liên hệ: Có'],
                ['value' => 'Hỗ trợ quản trị web: 1 tháng đầu'],
                ['value' => 'Thời gian bàn giao: 3 đến 7 ngày'],
            ],
            'description_json04' => [
                ['value' => 'Tặng kèm hosting dung lượng 3Gb'],
                ['value' => 'Giao diện: Thiết kế mới theo yêu cầu'],
                ['value' => 'Chức năng tin tức: Có'],
                ['value' => 'Danh mục sản phẩm: Có'],
                ['value' => 'Chức năng giỏ hàng: Có'],
                ['value' => 'Chức năng liên hệ: Có'],
                ['value' => 'Hỗ trợ quản trị web: 2 tháng đầu'],
                ['value' => 'PThời gian bàn giao: 7 đến 14 ngày'],
            ],


        ]);
    }

    static function block08($sortOrder = 0, $menuId = 0)
    {
        Landingpage::create([
            'sort_order' => $sortOrder,
            'menu_id' => $menuId,
            'type' => 'block08',
            'name' => 'Hướng dẫn thanh toán',
            'sub_title' => 'Đặt cọc ngay để nhận ưu đãi free tháng đầu tiên',
            'description_json01' => [
                ['key' => 'Chủ tài khoản', 'value' => 'Công ty cổ phần Công Nghệ và Truyền Thông HT Việt Nam'],
                ['key' => 'Ngân hàng', 'value' => 'TECHCOMBANK'],
                ['key' => 'Cú pháp đăng kí', 'value' => '[Tên] [SĐT] [Mã giao diện]'],
                ['key' => 'Số tài khoản', 'value' => '98686888']

            ],
            'image03' => 'https://img.htvietnam.vn/layouts/62/huong-dan-02.jpg ',
            'image02' => 'https://img.htvietnam.vn/layouts/62/tech.jpg',
        ]);
    }
    static function block10($sortOrder = 0, $menuId = 0)
    {
        Landingpage::create([
            'sort_order' => $sortOrder,
            'menu_id' => $menuId,
            'type' => 'block10',
            'name' => 'Mục tiêu hướng tới',
            'sub_title' => 'Những chuyên môn',
            'is_show_btn_register' => 1,
            'sub_title01' => 'Mục tiêu chương trình',
            'sub_title02' => 'https://www.youtube.com/embed/AEFi1XjOjvs',
            'description_json01' => [
                ['value' => 'Về chuyên môn: Được cung cấp công cụ để đánh giá được hiệu quả và giá trị đóng góp cho doanh nghiệp của từng nhân viên.'],
                ['value' => 'Về văn hoá: Xây dựng được văn hoá đoàn kết, chủ động trong công việc và hướng đến cùng một mục tiêu – vì sự phát triển của doanh nghiệp.'],
                ['value' => 'Về văn hoá: Xây dựng được văn hoá đoàn kết, chủ động trong công việc và hướng đến cùng một mục tiêu – vì sự phát triển của doanh nghiệp.'],
                ['value' => 'Được hỗ trợ nâng cấp, chỉnh sửa theo yêu cầu, tuy nhiên sẽ mất thêm phí tùy thuộc vào yêu cầu chỉnh sửa của khách'],
                ['value' => 'Về phương thức kiểm soát: Học viên có tư duy sử dụng nhân sự để từng bước chuyển hoá doanh nghiệp từ phương thức quản trị kiểm soát hành vi sang phương thức quản trị kiểm soát mục tiêu bằng cơ chế khoán toàn diện.'],
                ['value' => 'Hệ thống admin độc quyền của HT Việt Nam, với độ tùy biến cao'],
                ['value' => 'Xây dựng chiến lược nhân sự thông qua đào tạo và có tính kế thừa của hệ thống.'],


            ],


        ]);
    }
    static function block11($sortOrder = 0, $menuId = 0)
    {
        Landingpage::create([
            'sort_order' => $sortOrder,
            'menu_id' => $menuId,
            'type' => 'block11',
            'sub_title' => 'HT Việt Nam',
            'name' => 'Nơi cung cấp các tên miền',
            'sub_title01' => 'DỊCH VỤ
            CHÚNG TÔI CUNG CẤP',
            // 'sub_title02' => 'ÔNG NGÔ MINH TUẤN',
            'sub_title03' => 'https://www.youtube.com/embed/AEFi1XjOjvs',
            'description01' => 'Thiết Kê website(đến với HT, bạn có thể thiết kế website theo đúng yêu cầu của mình, Với kho giao diện web mẫu phong phú)
            Hosting tốc độ cao (Hosting của HT Việt Nam xử dụng ổ SSD tốc độ cao, cho tốc độ tải web siêu nhanh)
            Chủ tịch Tập đoàn CEO Việt Nam Global Building Store (CVG | Building Group)
            Máy chủ - VPS (Đăng ký hệ thống máy chủ cấu hình cao tại HT Việt Nam để được tận hưởng những trải nghiệm tốt nhất, với đội ngũ kỹ thuật support 24/24h)
            Phần mềm quản lý cho doanh nghiệp (Với đội ngũ chuyên gia nhiều kinh nghiệm, đã làm nhiều dự án lớn trong nước và dự án cho thị trường Nhật Bản)',

            'image01' => 'https://img.htvietnam.vn/layouts/62/a.jpg',


        ]);
    }
    static function block12($sortOrder = 0, $menuId = 0)
    {
        Landingpage::create([
            'sort_order' => $sortOrder,
            'menu_id' => $menuId,
            'type' => 'block12',
            'name' => 'Quyền lợi khách hàng',
            'sub_title' => 'HT Việt Nam',
            'sub_title01' => 'https://www.youtube.com/embed/HAsQ4-ndWic',
            'description_json01' => [
                ['title' => 'Nhanh chóng định vị thương hiệu', 'value' => 'Trong thời đại bùng nổ công nghệ thông tin như hiện nay, website được coi là “đại sứ thương hiệu” của doanh nghiệp trên Internet, giúp đơn vị quảng bá thương hiệu, tạo dựng uy tín, tạo lợi thế cạnh tranh và khẳng định vị thế trên thương trường.'],
                ['title' => 'Giảm tối đa chi phí quản lý khi tạo website', 'value' => ' Việc mở thêm cửa hàng online/ văn phòng ảo trực tuyến bên cạnh cửa hàng offline truyền thống giúp doanh nghiệp mở rộng thị trường, tiết kiệm tối đa thời gian quản lý hàng hóa, tiết kiệm chi phí quảng cáo, thuê mặt bằng, thuê nhân viên.'],
                ['title' => 'Cập nhật thông tin nhanh chóng', 'value' => ' Với hệ thống quản trị website bán hàng thông minh, đơn giản, người dùng có thể chủ động thay đổi/ chỉnh sửa/ update tất cả các thông tin mình mong muốn lên trang web chỉ bằng một vài thao tác, ở bất cứ đâu, trong bất kỳ thời điểm nào.'],
                ['title' => 'Tiếp cận khách hàng dễ dàng, tương tác ngay tức thời', 'value' => ' Thiết kế website chuyên nghiệp giúp doanh nghiệp có thể mở cửa bán hàng 24/24, từ đó gia tăng cơ hội tiếp cận khách hàng tiềm năng ở khắp mọi nơi và dễ dàng tương tác, giải đáp thắc mắc hay tư vấn cho khách hàng ngay lập tức.']

            ],

        ]);
    }
    static function block13($sortOrder = 0, $menuId = 0)
    {
        Landingpage::create([
            'sort_order' => $sortOrder,
            'menu_id' => $menuId,
            'type' => 'block13',
            'name' => 'Đánh giá khách hàng',
            'sub_title' => 'Những đánh giá của khách hàng',
            'sub_title02' => 'Comments 1',
            'sub_title03' => 'Comments 2',
            'sub_title04' => 'Comments 3',
            'sub_title05' => 'Comments 4',
            'sub_title01' => 'https://www.youtube.com/embed/SZFrd0AXdec',
            'image01' => 'https://img.htvietnam.vn/layouts/62/BG-1.png',
            'image02' => 'https://img.htvietnam.vn/layouts/62/BG-1.png',
            'image03' => 'https://img.htvietnam.vn/layouts/62/BG-1.png',
            'image04' => 'https://img.htvietnam.vn/layouts/62/BG-1.png',
            'description01' => '"Thiết kế website trọn gói là bên công ty thiết kế website HT Việt Nam sẽ hoàn
            thiện đầy đủ các tính năng của một website như: Thiết kế giao diện website, tên miền,
            hosting, bảo mật SSL, chuẩn SEO, chuẩn UI/UX, cấu hình quản trị website,
            tư vấn – hỗ trợ định hướng phát triển nội dung trên web."',
            'description02' => '"Thiết kế website trọn gói là bên công ty thiết kế website HT Việt Nam sẽ hoàn
            thiện đầy đủ các tính năng của một website như: Thiết kế giao diện website, tên miền,
            hosting, bảo mật SSL, chuẩn SEO, chuẩn UI/UX, cấu hình quản trị website,
            tư vấn – hỗ trợ định hướng phát triển nội dung trên web."',
            'description03' => '"Thiết kế website trọn gói là bên công ty thiết kế website HT Việt Nam sẽ hoàn
            thiện đầy đủ các tính năng của một website như: Thiết kế giao diện website, tên miền,
            hosting, bảo mật SSL, chuẩn SEO, chuẩn UI/UX, cấu hình quản trị website,
            tư vấn – hỗ trợ định hướng phát triển nội dung trên web."',
            'description04' => '"Thiết kế website trọn gói là bên công ty thiết kế website HT Việt Nam sẽ hoàn
            thiện đầy đủ các tính năng của một website như: Thiết kế giao diện website, tên miền,
            hosting, bảo mật SSL, chuẩn SEO, chuẩn UI/UX, cấu hình quản trị website,
            tư vấn – hỗ trợ định hướng phát triển nội dung trên web."',
        ]);
    }
}
