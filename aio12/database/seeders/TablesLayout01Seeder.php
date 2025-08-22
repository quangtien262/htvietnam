<?php

namespace Database\Seeders;

use App\Services\LandingpageData\Layout01;
use Illuminate\Database\Seeder;
use App\Services\MigrateService;
use Illuminate\Support\Facades\DB;

class TablesLayout01Seeder extends Seeder
{

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // truncate all
        DB::table('products')->truncate();
        DB::table('menus')->truncate();
        DB::table('images')->truncate();
        DB::table('news')->truncate();
        DB::table('web_config')->truncate();
        DB::table('doi_tac')->truncate();
        DB::table('about')->truncate();
        DB::table('languages')->truncate();

        // create languages
        MigrateService::createLanguage('Tiếng Việt', 'vi', 1, '/images/languages/vi.png');
        MigrateService::createLanguage('English', 'en', 0, '/images/languages/en.png');
        MigrateService::createLanguage('Chinese', 'ch', 0, '/images/languages/ch.png');

        // config admin menu
        MigrateService::showInAdminMenu(['menus', 'products', 'news', 'images', 'languages', 'email_maketting', 'users', 'admin_users', 'web_config', 'permission_group', 'block', 'block_info']);

        MigrateService::webconfig(
            '01',
            [
                'logo' => '/layouts/01/images/logo.png',
                'phone' => '(84) 24 665 72208',
                'email' => 'contact@gccgroup.vn',
                'email02' => 'sales@gccgroup.vn',
                'website' => 'www.gccgroup.vn',
                'mst' => '5200886602',
                'code_gg_map_factory' => '<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7454.60715070508!2d106.1241353!3d20.9001027!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135a344312efcd9%3A0x2addc6e2ee7a6b83!2zQ8O0bmcgdHkgY-G7lSBwaOG6p24gR0NDIFBMQVNUSUM!5e0!3m2!1svi!2s!4v1755735897811!5m2!1svi!2s" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
                'code_gg_map_office' => '<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d232.75097609136785!2d105.7463238!3d21.0320611!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313455df256e0ec5%3A0x183863e6b7216ec7!2zQ8O0bmcgdHkgY-G7lSBwaOG6p24ga2hvw6FuZyBz4bqjbiBHQ0M!5e0!3m2!1svi!2s!4v1755735862704!5m2!1svi!2s"  style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
            ],
            [
                'office' => [
                    'LK14, Hateco Green City, Foresa 4, phường Xuân Phương, TP. Hà Nội, Việt Nam',
                    'LK14, Hateco Green City, Foresa 4, Xuan Phuong ward, Hanoi city, Vietnam',
                    'LK14, Hateco Green City, Foresa 4, Xuan Phuong ward, Hanoi city, Vietnam'
                ],
                'address' => [
                    'LK14, KĐT Hateco Green City',
                    'LK14, KĐT Hateco Green City',
                    'LK14, KĐT Hateco Green City'
                ],
                'address_description' => [
                    'Foresa 4, Xuân Phương, Hà Nội, Việt Nam',
                    'Foresa 4, Xuan Phuong ward, Hanoi city, Vietnam',
                    'Foresa 4, Xuân Phương, Hà Nội, Việt Nam'
                ],
                'factory' => [
                    'Thôn Nho Lâm, phường Đường Hào, tỉnh Hưng Yên, Việt Nam',
                    'Nho Lam hamlet, Duong Hao ward, Hung Yen province, Vietnam',
                    'Nho Lam hamlet, Duong Hao ward, Hung Yen province, Vietnam'
                ],
                'phone_language' => [
                    '(84) 24 665 72208 ',
                    '(84) 24 665 72208 ',
                    '(84) 24 665 72208 '
                ],
                'title' => [
                    'CÔNG TY CỔ PHẦN GCC PLASTIC',
                    'GCC PLASTIC JOINT STOCK COMPANY',
                    'GCC PLASTIC JOINT STOCK COMPANY'
                ],
                'name_data' => [
                    'CÔNG TY CỔ PHẦN GCC PLASTIC',
                    'GCC PLASTIC JOINT STOCK COMPANY',
                    'GCC PLASTIC JOINT STOCK COMPANY'
                ],
                'company_name' => [
                    'CÔNG TY CỔ PHẦN GCC PLASTIC',
                    'GCC PLASTIC JOINT STOCK COMPANY',
                    'GCC PLASTIC JOINT STOCK COMPANY'
                ],
                'footer' => [
                    'Tự hào là một trong những doanh nghiệp hàng đầu trong khai thác, chế biến đá vôi trắng, sản xuất bột đá siêu mịn, filler masterbatch và nguyên liệu nhựa chất lượng cao, chúng tôi luôn nỗ lực không để đáp ứng kịp thời nhu cầu của khách hàng trong nước và quốc tế.',
                    'We are proud to be one of the leading companies in exploiting, processing white limestone, producing super fine stone powder, filler masterbatch and high quality plastic materials, we always strive to meet the needs of domestic and international customers in a timely manner.',
                    '我们自豪地成为越南风电领域的领先企业之一，我们有信心以最合理的价格为客户提供优质的产品和服务。'
                ]
            ]
        );

        //menu
        $this->createDataMenu();

        // product
        $this->createDataProduct();

        //news
        $this->createNews();

        // list block landing page
        Layout01::createBlocks();

        // menu lien he
        Layout01::contact(1, 6);
        // block about
        $sort_order = 1;
        $aboutId = 2;
        // giới thiệu
        // Layout01::block07($sort_order++, $aboutId);

        // tầm nhìn
        Layout01::block08($sort_order++, $aboutId);
        // sứ mệnh
        Layout01::block09($sort_order++, $aboutId);
        // giá trị cốt lõi
        Layout01::block08_02($sort_order++, $aboutId);


        // block home
        $this->settingHome();
    }

    private function createDataProduct()
    {
        $this->command->info('migrate Product');
        $imgs = [
            '/layouts/01/product-test/1.png',
            '/layouts/01/product-test/2.png',
            '/layouts/01/product-test/3.png',
        ];

        MigrateService::createProduct(
            ['HẠT NHỰA MÀU', 'Color Masterbatch', '塑料粒颗颜色'],
            12000,
            ['avatar' => '/layouts/01/product-test/1.png', 'images' => $imgs],
            ['content 01'],
            ['menu_id' => 3],
            ['name_data' => ['Hạt nhựa màu', 'Color Masterbatch', '塑料粒颗颜色']]
        );
        MigrateService::createProduct(
            ['HẠT CHỐNG ẨM', 'Color Masterbatch', '塑料粒颗颜色'],
            13000,
            ['avatar' => '/layouts/01/product-test/2.png', 'images' => $imgs],
            [],
            ['menu_id' => 3]
        );
        MigrateService::createProduct(
            ['CHẤT ĐỘN FILLER MASTERBATCH', 'Color Masterbatch', '塑料粒颗颜色'],
            13000,
            ['avatar' => '/layouts/01/product-test/3.png', 'images' => $imgs],
            [],
            ['menu_id' => 3]
        );
        MigrateService::createProduct(
            ['CHẤT ĐỘN FILLER MASTERBATCH 02', 'Color Masterbatch', '塑料粒颗颜色'],
            13000,
            ['avatar' => '/layouts/01/product-test/1.png', 'images' => $imgs],
            [],
            ['menu_id' => 3]
        );
    }



    private function createDataMenu()
    {
        $this->command->info('Migrate Menu');
        //parent
        $sortOrder = 1;
        $contentAbout = '<div class="content-abouts">
                <div class="content-cu"><div><strong>1. Giới thiệu về Công ty :</strong></div><div><div>Lời đầu tiên,&nbsp;Sontuong.vn<span data-mce-style="color: #333333;" style="color: #333333;"></span>&nbsp;Xin gửi lời tri ân và cảm ơn đến toàn thể quý khách hàng đã tin tưởng và sử dụng sản phẩm cũng như dịch của chúng tôi trong suốt thời gian qua.<br><strong><em>Kính thưa quý khách hàng!</em></strong></div><div>Sontuong.vn&nbsp; ngay từ ngày đầu thành lập&nbsp;đã hướng đến mục tiêu trở thành nhà phân phối sơn chính hãng, chất lượng phủ rộng khắp miền bắc và chất lượng dịch vụ thi công sơn bả hoàn thiện, ... luôn luôn và phải là đơn vị uy tín nhất.</div><div>Chúng tôi sẽ: Trở thành thương hiệu nhà phân phối sơn uy tín và ngày càng vững&nbsp;mạnh trong lĩnh vực thương mại, kiến trúc&nbsp;xây dựng, công nghiệp và dân dụng</div><div>Chúng tôi luôn:<br><strong><em>1.&nbsp;</em><em>Vì&nbsp; lợi ích của Quý khách hàng</em><br><em>2.&nbsp;</em><em>Vì lợi ích bền vững và định hướng phát triển lâu dài của công ty</em><br><em>3. Vì lợi ích của xã hội</em></strong></div><div>&nbsp;</div></div><div><strong>2. Sản phẩm và dịch vụ:</strong></div><div>Mục tiêu của&nbsp;<strong>Sontuong.vn</strong>&nbsp;là đem đến cho Quý khách những sản phẩm và dịch vụ chất lượng tốt&nbsp;với mức chi phí hợp lý. Chúng tôi sẵn sàng tư vấn cho Quý khách cũng như hợp tác với các đối tác có tiềm năng. Hiện chúng tôi cung cấp các sản phẩm và dịch vụ sau:</div><div><strong>a. Sản phẩm:</strong></div><div>Công ty phân phối nhiều dòng sản phẩm của các hãng sơn nổi tiếng trên thế giới tại thị trường Việt Nam như</div><div><strong>(ICI)DULUX - MAXILITE; NIPPON; KOVA; JOTUN; JOTON; MYKOLOR; KCC</strong></div><div>Các sản phẩm Công ty cung cấp bao gồm :</div><div><strong>Sơn dân dụng</strong>&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>Bột trét, sơn nước, sơn chống rỉ, sơn dầu, chống thấm.</strong></div><div><strong>Sơn cho gỗ&nbsp;</strong>:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>Sơn PU, NC, Cứng, 2K, Sơn mài.</strong>.vv.</div><div><strong>Sơn công nghiệp</strong>&nbsp;:&nbsp;<strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Sơn epoxy, sơn chịu nhiệt, sơn tàu biển</strong></div><div><strong>b. Dịch vụ:</strong></div><div><div>-&nbsp;<em>Cung cấp s</em><em>ơn, bột bả của hãng DULUX, NIPPON, KOVA; JOTUN; JOTON; SPEC GO GREEN</em></div><div>-&nbsp;<em>Tư vấn màu sắc, phối màu miễn phí.</em></div><div>-<em>&nbsp;Thi công trọn gói các công trình.</em></div><div>-&nbsp;<em>Các loại sơn gai, sơn gấm, sơn giả đá.</em></div><div>-&nbsp;<em>Hợp tác cung cấp sơn đến các đại lý, nhà thầu xây dựng, nhà thầu sơn ở các tỉnh.</em></div><div>&nbsp;</div></div><div><strong>&nbsp;</strong><strong>3. Định hướng phát triển:</strong></div><div><strong>-&nbsp;</strong>Trở thành Công ty phân phối sơn trang trí, sơn công nghiệp, sơn hàng hải&nbsp;và hóa chất tẩy rửa hàng đầu trên thị trường Việt Nam. Trực tiếp tham gia nhận thầu sơn bả hoàn thiện các công trình dự án, nhà ở dân dụng.</div><div><strong>-</strong>&nbsp;Hiện nay Công ty đã tạo việc làm cho hơn 80 tổ đội sơn bả chuyên nghiệp. Thời gian tới mong muốn sẽ tạo việc làm cho hàng trăm tổ đội thi công sơn bả tại HN và các tỉnh phía bắc.</div><div>&nbsp;</div><div><strong>4. Phương châm kinh doanh:</strong></div><div><div>- Chúng tôi cung cấp các sản phẩm và dịch vụ tới khách hàng với chất lượng tốt nhất với mức giá hợp lý.<br>- Áp dụng mức giá ưu đãi đối với các khách hàng thường xuyên, và mua số lượng lớn.<br>- Hàng hóa được giao tận nơi nhanh chóng và chính xác theo yêu cầu của Quý khách.<br>- Luôn tiếp thu ý kiến của khách hàng, không ngừng đổi mới sáng tạo phương thức kinh doanh để phát triển.</div><div>Xin trân trọng kính mời các đơn vị quan tâm hợp tác làm ĐẠI LÝ phân phối sản phẩm sơn trên địa bàn Hà Nội và các tỉnh phía Bắc với ưu đãi sau:</div><div><strong>• Chất l</strong><strong>ượng chính h</strong><strong>ãng&nbsp;</strong><em>(luôn kèm chứng chỉ xuất x</em><em>ưởng cho các đơn hàng)</em></div><div><strong>• Chiết khấu tốt nhất</strong></div><div><strong>• Giao hàng nhanh nhất</strong></div><div><br></div><div><strong>5. Giá trị cốt lõi:</strong></div><div></div><div><strong>- Cam kết:&nbsp;</strong>Nỗ lực hết mình trên đường đến thành công. Gắn bó với tầm nhìn, sứ mệnh, văn hóa công ty và với lợi ích của khách hàng.</div><div>-&nbsp;<strong>Tích cực:&nbsp;</strong>Luôn tự tin, tích cực, tràn đầy năng lượng khi gặp gỡ khách hàng. Chủ động tìm giải pháp thay vì tìm lý do. Thách thức chính là cơ hội để bứt phá giới hạn và phát triển rực rỡ</div><div>-&nbsp;<strong>Hiệu quả:&nbsp;</strong>Cam kết mang đến kết quả kinh doanh tốt nhất cho chính bản thân, cam kết mang đến kết quả, giải pháp tốt nhất cho khách hàng và cho công ty khi thực thi công việc, kết nối bán hàng.</div><div>-&nbsp;<strong>Chính trực:&nbsp;</strong>Nói sự thật, luôn thực hiện lời hứa và không ngừng sáng tạo làm việc để mang lại giá trị và lợi ích tốt nhất đến khách hàng. Chỉ cam kết những điều bản thân sẵn sàng và có ý định thực hiện. Phản hồi và đưa ra giải pháp nhanh chóng kịp thời.</div><div>-&nbsp;<strong>Xuất sắc:&nbsp;</strong>Chúng tôi là nhà phân phối và cung cấp sản phẩm chất lượng từ những nhà sản xuất hàng đầu thế giới. Tăng giá trị cho đối tác, khách hàng để cùng hướng tới phát triển lâu dài và bền vững. Tìm cách để đạt kết quả cao hơn với mức đầu ít hơn.</div><div>-&nbsp;<strong>Gắn kết:&nbsp;</strong>Tập trung gắn kết và hướng đến mục tiêu chung của tập thể. Hợp tác và tìm cách giải quyết, không thỏa hiệp. Linh động trong công việc và linh hoạt thay đổi cho kết quả tối ưu.</div><div>-&nbsp;<strong>Làm chủ:&nbsp;</strong>Chúng tôi là người chủ động, hoàn toàn chịu trách nhiệm về mọi hành động, kết quả và làm chủ mọi việc đang diễn ra trong công việc cũng như trong cuộc đời của mình.</div><div>-&nbsp;<strong>Đào tạo:&nbsp;</strong>Chúng tôi học hỏi từ những sai lầm của bản thân. Chúng tôi quyết tâm học hỏi, gia tăng hiểu biết để không ngừng phát triển. Chúng tôi kết nối và xây dựng đội ngũ kế thừa.</div><div><strong>- Đam mê:&nbsp;</strong>Làm việc với niềm hăng say và tập trung cao độ; luôn rực cháy ngọn lửa đam mê trong mọi hoàn cảnh &amp; không ngừng thử thách để mang lại giá trị bền vững, dịch vụ chuyên nghiệp và hiệu quả</div></div></div>
                <div class="fb-comments" data-width="100%" data-numposts="5"></div>
            </div>';

        $desAbout = '<p class="big" style="text-align: center;">HT có nhiều kinh nghiệm và giải pháp tối ưu trong lĩnh vực keo dán gạch,<br/>keo chà ron, phụ gia và hóa chất xây dựng</p>';
        $imgs = [
            'avatar' => '/layouts/01/images/bg/img3.jpg',
            'images' => ['/layouts/01/images/bg/img3.jpg']
        ];
        $images = json_encode($imgs);
        MigrateService::createMenu(
            ['Trang chủ', 'Home', '首页'],
            'home',
            ['parent_id' => 0, 'sort_order' => $sortOrder++],
            [
                'content' => ['', '', '']
            ]
        );
        MigrateService::createMenu(
            ['Giới thiệu', 'About', '关于'],
            'landingpage',
            ['parent_id' => 0, 'sort_order' => $sortOrder++, 'images' => $images],
            ['content' => [$contentAbout, $contentAbout, $contentAbout], 'description' => [$desAbout,$desAbout,$desAbout]]
        );
        $product = MigrateService::createMenu(['Sản Phẩm', 'Products', '产品'], 'product', ['parent_id' => 0, 'sort_order' => $sortOrder++, 'images' => $images]);
        MigrateService::createMenu(['Media', 'Media', '媒体'], 'news', ['parent_id' => 0, 'sort_order' => $sortOrder++, 'images' => $images]);
        MigrateService::createMenu(['Tin Tức', 'News', '新闻'], 'news', ['parent_id' => 0, 'sort_order' => $sortOrder++, 'images' => $images]);
        MigrateService::createMenu(
            ['Liên Hệ', 'Contact', '联系'],
            'landingpage',
            [
                'parent_id' => 0,
                'sort_order' => $sortOrder++,
                'images' => $images
            ],
            [
                'name_data_description' => ['Hãy kết nối với chúng tôi', 'Let\'s connect with us'],
                'description' => ['Vui lòng điền thông tin bên dưới để chúng tôi có thể liên hệ với bạn.', 'Please fill in the information below so we can contact you.']
            ]
        );
        
    }

    private function createNews()
    {
        $this->command->info('migrate News');
        $content = '<div class="entry-content single-page">
                    <p><strong>Chà ron</strong>&nbsp;gạch lát nền là công đoạn cuối cùng khá quan trọng trong lát nền hay ốp lát tường. Do đó để mang đến tính thẩm mỹ của công trình, bạn cần nên tìm hiểu rõ quy trình chà ron trước khi thực hiện</p>
                <p>Để hiểu rõ hơn về công đoạn này hãy cùng chúng tôi khám phá&nbsp;<strong>cách chà ron gạch lát nền và ốp tường nhà</strong>&nbsp;hiệu quả sau đây.</p>
                <h2>Làm sao chà ron gạch lát nền và ốp tường?</h2>
                <p><strong>Keo chà ron</strong>&nbsp;hay còn keo chít mạch là một trong những sản phẩm không thể thiếu trong các công trình có tính thẩm mỹ cao. Đối với chà ron gạch lát nền và ốp tường được thực hiện theo quy trình sau:</p>
                <h3>Chuẩn bị trước khi sử dụng keo chà ron</h3>
                <p>Trước khi sử dụng keo chà ron, bạn nên làm sạch những bụi bẩn ở đường chà ron nhằm giúp cho keo chà ron được bám dính tốt và đồng đều.</p>
                <p>Các dụng cụ cần chuẩn bị trước khi thực hiện bao gồm:</p>
                <ul>
                <li>Các dụng cụ cần thiết: Xô, máy khuấy tay, giẻ sạch, găng tay cao su, bay cao su….</li>
                <li>Gạch khô sạch và không bị bụi</li>
                <li>Bột hay vữa chà ron</li>
                <li>Cùng các nguyên vật liệu cần thiết khác</li>
                </ul>
                <h3>Các bước thực hiện chà ron gạch</h3>
                <h4><em><strong>Lựa chọn keo chà ron phù hợp</strong></em></h4>
                <p>Trước hết, cần chọn vật liệu chà ron nền nhà phù hợp với mục đích thi công, trong bài viết hôm nay chúng tôi sẽ giới thiệu cho bạn một loại vật liệu chà ron được khá nhiều ưa chuộng hiện nay, đó chính là Keo Chà Ron Crocodile Silver Premium Plus.</p>
                <p><a ><img class="aligncenter size-full wp-image-3096 lazy-load-active" src="https://jorakay.vn/wp-content/uploads/2019/04/giai-phap-bao-ve-gach-op-lat-ngoai-troi-2.jpg" sizes="(max-width: 600px) 100vw, 600px" srcset="https://jorakay.vn/wp-content/uploads/2019/04/giai-phap-bao-ve-gach-op-lat-ngoai-troi-2.jpg 600w, https://jorakay.vn/wp-content/uploads/2019/04/giai-phap-bao-ve-gach-op-lat-ngoai-troi-2-150x150.jpg 150w, https://jorakay.vn/wp-content/uploads/2019/04/giai-phap-bao-ve-gach-op-lat-ngoai-troi-2-300x300.jpg 300w, https://jorakay.vn/wp-content/uploads/2019/04/giai-phap-bao-ve-gach-op-lat-ngoai-troi-2-24x24.jpg 24w, https://jorakay.vn/wp-content/uploads/2019/04/giai-phap-bao-ve-gach-op-lat-ngoai-troi-2-36x36.jpg 36w, https://jorakay.vn/wp-content/uploads/2019/04/giai-phap-bao-ve-gach-op-lat-ngoai-troi-2-48x48.jpg 48w, https://jorakay.vn/wp-content/uploads/2019/04/giai-phap-bao-ve-gach-op-lat-ngoai-troi-2-100x100.jpg 100w" alt=" cách chà ron gạch lát nền và ốp tường nhà hiệu quả" width="600" height="600" data-src="https://jorakay.vn/wp-content/uploads/2019/04/giai-phap-bao-ve-gach-op-lat-ngoai-troi-2.jpg" data-srcset="https://jorakay.vn/wp-content/uploads/2019/04/giai-phap-bao-ve-gach-op-lat-ngoai-troi-2.jpg 600w, https://jorakay.vn/wp-content/uploads/2019/04/giai-phap-bao-ve-gach-op-lat-ngoai-troi-2-150x150.jpg 150w, https://jorakay.vn/wp-content/uploads/2019/04/giai-phap-bao-ve-gach-op-lat-ngoai-troi-2-300x300.jpg 300w, https://jorakay.vn/wp-content/uploads/2019/04/giai-phap-bao-ve-gach-op-lat-ngoai-troi-2-24x24.jpg 24w, https://jorakay.vn/wp-content/uploads/2019/04/giai-phap-bao-ve-gach-op-lat-ngoai-troi-2-36x36.jpg 36w, https://jorakay.vn/wp-content/uploads/2019/04/giai-phap-bao-ve-gach-op-lat-ngoai-troi-2-48x48.jpg 48w, https://jorakay.vn/wp-content/uploads/2019/04/giai-phap-bao-ve-gach-op-lat-ngoai-troi-2-100x100.jpg 100w"></a></p>
                <p>Với thành phần gồm xi măng Portland và các phụ gia đặc biệt giúp cho độ bền và độ bám dính cao, không bong tróc đồng thời có khả năng chống nấm mốc đen, không thấm nước giúp dễ dàng vệ sinh ở mọi lúc mọi nơi</p>
                <p>Bên cạnh đó sản phẩm này hiện nay rất đa dạng với nhiều màu sắc giúp khách hàng có thể lựa chọn cho mình vật liệu phù hợp nhất</p>
                <h4><em><strong>Thực hiện khâu trét vữa</strong></em></h4>
                <p>Sau khi đã lựa chọn và có được hỗn hợp keo chà ron, bạn tiến hành dùng bay nhựa trét vữa vào các khe gạch. Để đạt được hiệu quả cao bạn nên dùng bay trét vữa để nghiêng một góc khoảng 45 độ so với bề mặt gạch.</p>
                <p><a ><img class="aligncenter size-full wp-image-3114 lazy-load-active" src="https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-3.jpg" sizes="(max-width: 650px) 100vw, 650px" srcset="https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-3.jpg 650w, https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-3-300x180.jpg 300w, https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-3-24x14.jpg 24w, https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-3-36x22.jpg 36w, https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-3-48x29.jpg 48w" alt="" width="650" height="391" data-src="https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-3.jpg" data-srcset="https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-3.jpg 650w, https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-3-300x180.jpg 300w, https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-3-24x14.jpg 24w, https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-3-36x22.jpg 36w, https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-3-48x29.jpg 48w"></a></p>
                <p>Lưu ý: Vữa thường khô rất nhanh, do đó bạn cần phải thao tác thật nhanh trước khi chúng khô đi</p>
                <h4><strong><em>Bôi chất chống thấm ron gạch</em></strong></h4>
                <p>Sau khi thực hiện được bước trét vữa và vệ sinh đường ron, bạn tiến hành bôi chất chống thấm cho gạch lát nền và ốp tường.</p>
                <p>Nếu bạn sử dụng loại keo chà ron chống thấm nước và chống nấm mốc đen thì bạn không cần phải thực hiện bước này.</p>
                <h4><em><strong>Hoàn thiện công trình cần thi công</strong></em></h4>
                <p>Sau khi đã hoàn thiện công đoạn bôi chất chống thấm ron gạch lát nền và ốp tường, bạn chờ đợi một thời gian để chúng khô lại. Sau đó dùng giẻ sạch lau lại để giúp công trình có tính thẩm mỹ cao</p>
                <p><a ><img class="aligncenter size-full wp-image-3116 lazy-load-active" src="https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-4.jpg" sizes="(max-width: 650px) 100vw, 650px" srcset="https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-4.jpg 650w, https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-4-300x200.jpg 300w, https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-4-24x16.jpg 24w, https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-4-36x24.jpg 36w, https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-4-48x32.jpg 48w" alt="" width="650" height="433" data-src="https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-4.jpg" data-srcset="https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-4.jpg 650w, https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-4-300x200.jpg 300w, https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-4-24x16.jpg 24w, https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-4-36x24.jpg 36w, https://jorakay.vn/wp-content/uploads/2019/04/cach-cha-ron-gach-lat-nen-va-op-tuong-nha-4-48x32.jpg 48w"></a></p>
                <p>&nbsp;</p>
                <p>Từ những công đoạn trên chúng ta thấy rằng việc tạo nên một công đoạn chà ron gạch đẹp và chất lượng cần có sự kiên nhẫn, tính thẩm mỹ và đặc biệt là lựa chọn được sản phẩm keo chà ron chất lượng</p>
                <p>Vậy tại Tphcm, địa chỉ bán keo chà ron uy tín ở đâu?</p>
                <h2>Mua keo chà ron đạt tiêu chuẩn tại Tphcm</h2>
                <p>Hiện nay có một số loại keo chà ron đang rất nổi bật trên thị trường và được hàng triệu khách hàng tin chọn, đó chính là Keo Chà Ron Crocodile Silver Premium Plus.</p>
                <p>Với tính năng vượt bậc, sản phẩm này hiện nay đang được bán khá chạy trên thị trường đồng thời được cung cấp từ nhiều cửa hàng với chất lượng và giá thành khác nhau</p>
                <p>Tại Tphcm, được biết đến là thương hiệu nổi tiếng về các sản phẩm keo chà ron-&nbsp;<strong>Jorakay</strong>– tự hào là người bạn đồng hành đã và đang mới đến cho khách hàng các sản phẩm keo chà ron chất lượng với giá tốt nhất hiện nay</p>
                <p>Bên cạnh các sản phẩm keo chà ron, Jorakay cũng đồng thời cải tiến và phát triển các sản phẩm keo dán gạch, phụ gia, hóa chất xây dựng khác như: Chất chống thấm Flex Shield, chất chống trơn trượt Antislip, xi măng màu Crocodile và các dòng vật liệu sửa chữa cấu trúc.</p>
                ';
        MigrateService::createNews(
            ['Cách chà ron gạch lát nền và ốp tường nhà hiệu quả'],
            '/layouts/01/images/new-1.jpg',
            [$content, $content],
            ['menu_id' => 4],
            ['description' => ['Chà ron gạch lát nền là công đoạn cuối cùng khá quan trọng trong lát nền', 'description en']]
        );

        MigrateService::createNews(
            ['Vì sao nên sử dụng keo chà ron khi lát gạc', 'description en'],
            '/layouts/01/images/new-1.jpg',
            [$content, $content],
            ['menu_id' => 4],
            ['description' => ['Keo chà ron hiện nay được xem là sản phẩm được khá nhiều người ưa', 'description en']]
        );

        MigrateService::createNews(
            ['Keo chà ron cho nhà tắm, hồ bơi', 'description en'],
            '/layouts/01/images/new-1.jpg',
            [$content, $content],
            ['menu_id' => 4],
            ['description' => ['Chà ron hay còn gọi là chít mạch đối với mỗi công trình là quy', 'description en']]
        );

        MigrateService::createNews(
            ['bí quyết chống thấm hoàn hảo', 'description en'],
            '/layouts/01/images/new-1.jpg',
            [$content, $content],
            ['menu_id' => 4],
            ['description' => ['Chà ron hay còn gọi là chít mạch đối với mỗi công trình là quy', 'description en']]
        );
    }

    private function settingHome()
    {
        $sort_order = 1;
        // slide
        Layout01::images($sort_order++);

        // product
        Layout01::products($sort_order++);
        
        // Why Choose Us
        Layout01::block03($sort_order++);

        // ứng dụng thực tế
        Layout01::block04($sort_order++);

        // thông kê
        Layout01::block05($sort_order++);

        // dự án đã làm
        Layout01::block06($sort_order++);

        // news
        Layout01::news($sort_order++);

        // contact
        Layout01::contact($sort_order++);

        Layout01::doiTac($sort_order++);
    }
}
