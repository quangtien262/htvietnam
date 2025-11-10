<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WhmcsKnowledgeBaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create categories
        $categories = [
            [
                'id' => 1,
                'name' => 'Hướng dẫn chung',
                'slug' => 'huong-dan-chung',
                'description' => 'Các hướng dẫn cơ bản về sử dụng dịch vụ',
                'parent_id' => null,
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Thanh toán',
                'slug' => 'thanh-toan',
                'description' => 'Hướng dẫn về các phương thức thanh toán',
                'parent_id' => null,
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'Hosting',
                'slug' => 'hosting',
                'description' => 'Hướng dẫn quản lý hosting',
                'parent_id' => null,
                'sort_order' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'name' => 'Domain',
                'slug' => 'domain',
                'description' => 'Hướng dẫn quản lý tên miền',
                'parent_id' => null,
                'sort_order' => 4,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'name' => 'Bảo mật',
                'slug' => 'bao-mat',
                'description' => 'Hướng dẫn về bảo mật tài khoản',
                'parent_id' => null,
                'sort_order' => 5,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('whmcs_kb_categories')->insert($categories);

        // Create sample articles
        $articles = [
            [
                'category_id' => 1,
                'title' => 'Cách đăng ký tài khoản',
                'slug' => 'cach-dang-ky-tai-khoan',
                'content' => '<h2>Hướng dẫn đăng ký tài khoản</h2>
                    <p>Để đăng ký tài khoản, bạn thực hiện các bước sau:</p>
                    <ol>
                        <li>Truy cập trang đăng ký</li>
                        <li>Điền đầy đủ thông tin cá nhân</li>
                        <li>Xác nhận email</li>
                        <li>Đăng nhập vào hệ thống</li>
                    </ol>
                    <p>Nếu gặp vấn đề, vui lòng liên hệ bộ phận hỗ trợ.</p>',
                'excerpt' => 'Hướng dẫn chi tiết cách đăng ký tài khoản trên hệ thống',
                'tags' => json_encode(['đăng ký', 'tài khoản', 'hướng dẫn']),
                'status' => 'published',
                'view_count' => 150,
                'helpful_count' => 45,
                'not_helpful_count' => 3,
                'created_at' => now()->subDays(30),
                'updated_at' => now()->subDays(30),
            ],
            [
                'category_id' => 2,
                'title' => 'Các phương thức thanh toán',
                'slug' => 'cac-phuong-thuc-thanh-toan',
                'content' => '<h2>Phương thức thanh toán được hỗ trợ</h2>
                    <p>Chúng tôi hỗ trợ các phương thức thanh toán sau:</p>
                    <ul>
                        <li><strong>Chuyển khoản ngân hàng:</strong> Miễn phí, xử lý trong 1-2 giờ</li>
                        <li><strong>VNPay:</strong> Phí 1.5%, xử lý ngay lập tức</li>
                        <li><strong>MoMo:</strong> Phí 2%, xử lý ngay lập tức</li>
                        <li><strong>Credit Account:</strong> Sử dụng số dư tài khoản</li>
                    </ul>
                    <p>Vui lòng chọn phương thức phù hợp với bạn.</p>',
                'excerpt' => 'Danh sách các phương thức thanh toán được hỗ trợ',
                'tags' => json_encode(['thanh toán', 'vnpay', 'momo', 'chuyển khoản']),
                'status' => 'published',
                'view_count' => 320,
                'helpful_count' => 89,
                'not_helpful_count' => 5,
                'created_at' => now()->subDays(25),
                'updated_at' => now()->subDays(25),
            ],
            [
                'category_id' => 3,
                'title' => 'Cài đặt WordPress trên hosting',
                'slug' => 'cai-dat-wordpress-tren-hosting',
                'content' => '<h2>Hướng dẫn cài đặt WordPress</h2>
                    <p>WordPress có thể được cài đặt tự động thông qua cPanel:</p>
                    <ol>
                        <li>Đăng nhập vào cPanel</li>
                        <li>Tìm và click vào "Softaculous App Installer"</li>
                        <li>Chọn WordPress từ danh sách</li>
                        <li>Click "Install Now"</li>
                        <li>Điền thông tin cài đặt (domain, username, password)</li>
                        <li>Click "Install" và chờ hoàn tất</li>
                    </ol>
                    <p><strong>Lưu ý:</strong> Quá trình cài đặt mất khoảng 2-3 phút.</p>',
                'excerpt' => 'Hướng dẫn cài đặt WordPress tự động qua Softaculous',
                'tags' => json_encode(['wordpress', 'hosting', 'cài đặt', 'cpanel']),
                'status' => 'published',
                'view_count' => 580,
                'helpful_count' => 142,
                'not_helpful_count' => 12,
                'created_at' => now()->subDays(20),
                'updated_at' => now()->subDays(5),
            ],
            [
                'category_id' => 4,
                'title' => 'Cách trỏ domain về hosting',
                'slug' => 'cach-tro-domain-ve-hosting',
                'content' => '<h2>Hướng dẫn trỏ domain</h2>
                    <p>Có 2 cách để trỏ domain về hosting:</p>
                    <h3>Cách 1: Đổi Nameserver</h3>
                    <p>Nameserver của chúng tôi:</p>
                    <ul>
                        <li>ns1.example.com</li>
                        <li>ns2.example.com</li>
                    </ul>
                    <h3>Cách 2: Tạo A Record</h3>
                    <p>IP của server: <code>123.456.789.0</code></p>
                    <p>Tạo A record:</p>
                    <pre>@ → 123.456.789.0\nwww → 123.456.789.0</pre>
                    <p><strong>Thời gian nhận:</strong> 24-48 giờ</p>',
                'excerpt' => 'Hướng dẫn trỏ tên miền về hosting bằng Nameserver hoặc A Record',
                'tags' => json_encode(['domain', 'nameserver', 'dns', 'hosting']),
                'status' => 'published',
                'view_count' => 450,
                'helpful_count' => 112,
                'not_helpful_count' => 8,
                'created_at' => now()->subDays(18),
                'updated_at' => now()->subDays(3),
            ],
            [
                'category_id' => 5,
                'title' => 'Bảo mật tài khoản với 2FA',
                'slug' => 'bao-mat-tai-khoan-voi-2fa',
                'content' => '<h2>Kích hoạt xác thực 2 yếu tố (2FA)</h2>
                    <p>2FA giúp bảo vệ tài khoản của bạn khỏi truy cập trái phép.</p>
                    <h3>Các bước kích hoạt:</h3>
                    <ol>
                        <li>Đăng nhập vào tài khoản</li>
                        <li>Vào "Cài đặt bảo mật"</li>
                        <li>Chọn "Kích hoạt 2FA"</li>
                        <li>Quét mã QR bằng Google Authenticator</li>
                        <li>Nhập mã xác thực để hoàn tất</li>
                    </ol>
                    <p><strong>Ứng dụng khuyên dùng:</strong></p>
                    <ul>
                        <li>Google Authenticator</li>
                        <li>Microsoft Authenticator</li>
                        <li>Authy</li>
                    </ul>',
                'excerpt' => 'Hướng dẫn kích hoạt xác thực 2 yếu tố để bảo vệ tài khoản',
                'tags' => json_encode(['bảo mật', '2fa', 'xác thực', 'google authenticator']),
                'status' => 'published',
                'view_count' => 280,
                'helpful_count' => 76,
                'not_helpful_count' => 4,
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(2),
            ],
        ];

        DB::table('whmcs_kb_articles')->insert($articles);
    }
}
