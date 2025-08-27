<?php

namespace App\Services\LandingpageData;

use App\Services\MigrateService;
use DB;
use Exception;

class Layout01 extends Land
{
    const CONFIG_BLOCK_89 = [
        // all
        'name' => false,
        'images' => false,
        'image' => true,
        'link' => false,
        'active' => true,
        'menu_id' => false,
        'note' => false,
        'icon' => false,
        // lang
        'name_data' => true,
        'title_description' => false,
        'images_data' => false,
        'description' => false,
        'content' => true,
    ];
    const BLOCKS_CONFIG = [
        'images' => [
            'page' => self::PAGE_NONE,
            'block' => self::BLOCK_IMAGE_DATA,
        ],
        'news' => [
            'page' => self::PAGE_DEFAULT,
            'block' => self::BLOCK_NONE,
        ],
        'products' => [
            'page' => self::PAGE_DEFAULT,
            'block' => self::BLOCK_NONE,
        ],
        'doi_tac' => [
            'page' => self::PAGE_NONE,
            'block' => self::BLOCK_IMAGES,
        ],
        'contact' => [
            'page' => self::PAGE_DEFAULT,
            'block' => self::BLOCK_NONE,
        ],
        'block03' => [
            'page' => self::PAGE_IMAGES_DATA,
            'block' => self::BLOCK_DEFAULT,
        ],
        'block04' => [
            'page' => self::PAGE_DEFAULT,
            'block' => [
                // all
                'name' => false,
                'images' => false,
                'image' => true,
                'link' => true,
                'active' => false,
                'menu_id' => false,
                'note' => false,
                'icon' => false,
                // lang
                'name_data' => true,
                'title_description' => false,
                'images_data' => false,
                'description' => true,
                'content' => false,
            ],
        ],
        'block05' => [
            'page' => self::PAGE_NONE,
            'block' => [
                // all
                'name' => false,
                'images' => false,
                'image' => false,
                'link' => false,
                'active' => true,
                'menu_id' => false,
                'note' => false,
                'icon' => false,
                // lang
                'name_data' => true,
                'title_description' => false,
                'images_data' => false,
                'description' => true,
                'content' => false,
            ],
        ],
        'block06' => [
            'page' => self::PAGE_DEFAULT,
            'block' => [
                'name' => false,
                'images' => false,
                'image' => false,
                'link' => true,
                'active' => true,
                'menu_id' => false,
                'note' => false,
                'icon' => true,
                // lang
                'name_data' => true,
                'title_description' => false,
                'images_data' => false,
                'description' => false,
                'content' => false,
            ],
        ],

        'block08' => [
            'page' => self::CONFIG_BLOCK_89,
            'block' => self::BLOCK_NONE,
        ],

        'block09' => [
            'page' => self::CONFIG_BLOCK_89,
            'block' => self::BLOCK_NONE,
        ],

        'block_contact01' => [
            'page' => self::PAGE_NONE,
            'block' => [
                'name' => false,
                'images' => false,
                'image' => false,
                'link' => false,
                'active' => true,
                'menu_id' => false,
                'note' => false,
                'icon' => true,
                // lang
                'name_data' => true,
                'title_description' => false,
                'images_data' => false,
                'description' => false,
                'content' => true,
            ],
        ],

        'block_contact02' => [
            'page' => self::PAGE_NONE,
            'block' => [
                'name' => false,
                'images' => false,
                'image' => false,
                'link' => false,
                'active' => true,
                'menu_id' => false,
                'note' => false,
                'icon' => false,
                // lang
                'name_data' => true,
                'title_description' => false,
                'images_data' => false,
                'description' => true,
                'content' => false,
            ],
        ],
    ];

    static function getConfig($block)
    {
        return self::BLOCKS_CONFIG[$block] ?? null;
    }

    static function createBlocks($menuId = 0)
    {
        $sort_order = 0;
        MigrateService::createData(
            'list_landingpage',
            [
                'name' => 'images',
                'display_name' => 'Hình ảnh',
                'image' => '/layouts/01/images/block/banner.png',
                'sort_order' => $sort_order
            ]
        );
        MigrateService::createData(
            'list_landingpage',
            [
                'name' => 'news',
                'display_name' => 'news',
                'image' => '/layouts/01/images/block/news.png',
                'sort_order' => $sort_order++
            ]
        );
        MigrateService::createData(
            'list_landingpage',
            [
                'name' => 'products',
                'display_name' => 'Product',
                'image' => '/layouts/01/images/block/product.png',
                'sort_order' => $sort_order++
            ]
        );
        MigrateService::createData(
            'list_landingpage',
            [
                'name' => 'doiTac',
                'display_name' => 'Đối tác',
                'image' => '/layouts/01/images/block/doi-tac.png',
                'sort_order' => $sort_order++
            ]
        );

        // create blocks
        for ($i = 1; $i <= 6; $i++) {
            if (in_array($i, [1, 2])) {
                continue; // skip block 2
            }
            $name = 'block0' . $i;
            MigrateService::createData(
                'list_landingpage',
                [
                    'name' => $name,
                    'display_name' => $name,
                    'image' => '/layouts/01/images/block/' . $i . '.png',
                    'sort_order' => $sort_order++
                ]
            );
        }
    }

    /**
     * @throws Exception
     */
    static function images($sortOrder = 0, $menuId = 0)
    {
        $page = MigrateService::createData(
            'page_setting',
            [
                'name' => 'images',
                'display_name' => 'Slider hình ảnh banner',
                'block_type' => 'images',
                'sort_order' => $sortOrder,
                'table_data' => 'images',
                'table_edit' => 'images',
                'menu_id' => $menuId
            ],
            [
                'name_data' => ['Banner', 'Banner', 'Banner'],
            ]
        );
        for ($i = 1; $i < 5; $i++) {
            MigrateService::createImages(
                ['slide', 'slide'],
                '/layouts/01/images/slide0' . $i . '.jpg',
                1,
                [
                    'menu_id' => $menuId,
                    'page_setting_id' => $page->id
                ],
                [
                    'name_data' => ['Slide 0' . $i, 'Slide 0' . $i, 'Slide 0' . $i],
                    'description' => ['description 0' . $i, 'description 0' . $i, 'description 0' . $i],
                    'content' => ['content 0' . $i, 'content 0' . $i, 'content 0' . $i],
                ]
            );
        }
    }

    static function news($sortOrder = 0, $menuId = 0)
    {
        $contentNews_vi = 'Block tin tức của công ty là nơi cập nhật nhanh chóng các thông tin, sự kiện, hoạt động nổi bật và những bài viết hữu ích liên quan đến lĩnh vực hoạt động của doanh nghiệp. Tại đây, khách hàng và đối tác có thể dễ dàng theo dõi những xu hướng mới, các dự án tiêu biểu cũng như các thông báo quan trọng từ công ty.';
        $contentNews_en = 'The company news block is where to quickly update information, events, outstanding activities and useful articles related to the company\'s field of activity. Here, customers and partners can easily follow new trends, typical projects as well as important announcements from the company.';
        $contentNews_ch = '公司的新闻区块是快速更新信息、事件、突出活动和与公司业务领域相关的有用文章的地方。在这里，客户和合作伙伴可以轻松跟踪新趋势、典型项目以及公司重要公告。';
        MigrateService::createData(
            'page_setting',
            [
                'name' => 'news',
                'display_name' => 'Tin tức',
                'block_type' => 'news',
                'table_data' => 'news',
                'sort_order' => $sortOrder,
                'menu_id' => $menuId
            ],
            [
                'name_data' => ['TIN TỨC – BÀI VIẾT', 'LATEST ARTICLES', '最新文章'],
                'description' => ['BÀI VIẾT MỚI NHẤT DÀNH CHO BẠN', 'LATEST ARTICLES FOR YOU', '为您提供最新文章'],
                'content' => [$contentNews_vi, $contentNews_en, $contentNews_ch]
            ]
        );
    }

    static function products($sortOrder = 0, $menuId = 0)
    {
        MigrateService::createData(
            'page_setting',
            [
                'name' => 'products',
                'display_name' => 'Sản phẩm nổi bật',
                'block_type' => 'products',
                'sort_order' => $sortOrder,
                'table_data' => 'products',
                'table_edit' => 'products',
                'table_data_ids' => json_encode([1, 2, 3, 4]),
                'menu_id' => $menuId
            ],
            [
                'name_data' => ['Sản phẩm nổi bật', 'Featured Products', '特色产品'],
                'description' => ['Danh sách sản phẩm bán chạy nhất', 'List of hottest products', '最热门产品列表'],
                'content' => [
                    'Chúng tôi xin giới thiệu danh sách những mặt hàng được khách hàng tin tưởng lựa chọn nhiều nhất, thể hiện chất lượng và uy tín của công ty trên thị trường.',
                    'We would like to introduce a list of the most trusted and chosen products by customers, reflecting the company\'s quality and reputation in the market.',
                    '我们为您介绍客户最信赖和选择最多的产品，体现了公司在市场上的品质与信誉。'
                ],
            ]
        );
    }

    static function block03($sortOrder = 0, $menuId = 0)
    {
        $imgs = [
            '/layouts/01/images/block3/11.jpg',
            '/layouts/01/images/block3/12.jpg',
            '/layouts/01/images/block3/13.jpg',
        ];
        $images = [
            'avatar' => $imgs[0],
            'images' => $imgs
        ];
        $content03_vi = 'Chúng tôi tự hào là đối tác tin cậy của nhiều khách hàng và doanh nghiệp nhờ vào đội ngũ chuyên gia giàu kinh nghiệm, quy trình làm việc chuyên nghiệp và cam kết mang lại giá trị bền vững. Với các giải pháp tối ưu, sản phẩm chất lượng cao cùng dịch vụ hậu mãi tận tâm, chúng tôi luôn nỗ lực đáp ứng mọi nhu cầu và vượt qua sự mong đợi của khách hàng. Lựa chọn chúng tôi, bạn sẽ nhận được sự đồng hành uy tín trên hành trình phát triển và thành công.';
        $content03_en = 'We are proud to be a trusted partner of many customers and businesses thanks to our team of experienced experts, professional working processes, and commitment to delivering sustainable value. With optimal solutions, high-quality products, and dedicated after-sales service, we always strive to meet all customer needs and exceed their expectations. Choosing us, you will receive reliable companionship on the journey of development and success.';
        $content03_ch = '我们自豪地成为许多客户和企业的可信赖合作伙伴，这得益于我们经验丰富的专家团队、专业的工作流程以及对提供可持续价值的承诺。凭借优化的解决方案、高质量的产品和贴心的售后服务，我们始终努力满足客户的所有需求并超越他们的期望。选择我们，您将获得在发展和成功之旅中的可靠伴侣。';
        $page = MigrateService::createData(
            'page_setting',
            [
                'menu_id' => $menuId,
                'name' => 'block03',
                'display_name' => 'block03',
                'block_type' => 'block03',
                'sort_order' => $sortOrder,
                'table_data' => 'block_info',
                'table_edit' => 'block_info',
                'menu_id' => $menuId,
                'images' => json_encode($images),
            ],
            [
                'name_data' => ['Tại sao nên chọn chúng tôi', 'Why Choose Us', '为什么选择我们'],
                'description' => ['Chúng tôi luôn đặt uy tín và chất lượng lên hàng đầu', 'We always place reputation and quality first', '我们始终将声誉和质量放在首位'],
                'content' => [$content03_vi, $content03_en, $content03_ch]
            ]
        );
    }

    static function contact($sortOrder = 0, $menuId = 0)
    {
        $contentContact_vi = 'Hãy gửi những thắc mắc của bạn cho chúng tôi. Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn';
        $contentContact_en = 'Please send your inquiries to us. We are always ready to listen and assist you';
        $contentContact_ch = '请将您的询问发送给我们。我们始终准备倾听和协助您';
        $page = MigrateService::createData(
            'page_setting',
            [
                'menu_id' => $menuId,
                'name' => 'contact',
                'display_name' => 'Liên hệ',
                'sort_order' => $sortOrder,
                'block_type' => 'contact',
                'table_data' => 'contact',
            ],
            [
                'name_data' => ['Liên hệ', 'Contact', '联系'],
                'description' => ['KẾT NỐI VỚI GCC', 'CONNECT WITH GCC', '与GCC联系'],
                'content' => [$contentContact_vi, $contentContact_en, $contentContact_ch]
            ]
        );

        MigrateService::createData(
            'block_contact01',
            ['icon' => '<i class="far fa-map"></i>', 'page_setting_id' => $page->id],
            [
                'name_data' => ['VĂN PHÒNG CÔNG TY', 'COMPANY OFFICE', '公司办公室'],
                'content' => ['LK14, Hateco Green City, Foresa 4, phường Xuân Phương, TP. Hà Nội, Việt Nam', 'LK14, Hateco Green City, Foresa 4, Xuan Phuong Ward, Hanoi, Vietnam', 'LK14, Hateco Green City, Foresa 4, 轩芳区, 河内, 越南']
            ]
        );
        MigrateService::createData(
            'block_contact01',
            ['icon' => '<i class="fas fa-phone-volume"></i>', 'page_setting_id' => $page->id],
            [
                'name_data' => ['GỌI NGAY 24/7', 'CALL NOW 24/7', '全天候24/7呼叫'],
                'content' => ['Hotline: <a href="tel:+8402432008888">+84 024 3200 8888</a>', 'Hotline: <a href="tel:+8402432008888">+84 024 3200 8888</a>', '热线：<a href="tel:+8402432008888">+84 024 3200 8888</a>']
            ]
        );
        MigrateService::createData(
            'block_contact01',
            ['icon' => '<i class="fas fa-envelope"></i>', 'page_setting_id' => $page->id],
            [
                'name_data' => ['GỬI EMAIL', 'SEND EMAIL', '发送电子邮件'],
                'content' => ['Email: <a href="mailto:contact@gccgroup.vn">contact@gccgroup.vn</a>', 'Email: <a href="mailto:contact@gccgroup.vn">contact@gccgroup.vn</a>', '电子邮件：<a href="mailto:contact@gccgroup.vn">contact@gccgroup.vn</a>']
            ]
        );

        // block 02
        MigrateService::createData(
            'block_contact02',
            ['icon' => '<i class="fas fa-text-width"></i>', 'page_setting_id' => $page->id],
            [
                'name_data' => ['CONTACT FORM', 'CONTACT FORM', '联系表单'],
                'description' => ['BIỂU MẪU LIÊN HỆ', 'BIỂU MẪU LIÊN HỆ', '联系表单']
            ]
        );
    }

    static function doiTac($sortOrder = 0, $menuId = 0)
    {
        $page = MigrateService::createData(
            'page_setting',
            [
                'menu_id' => $menuId,
                'name' => 'doi_tac',
                'sort_order' => $sortOrder,
                'block_type' => 'doi_tac',
                'table_data' => 'doi_tac'
            ],
            [
                'name_data' => ['Đối tác', 'Partner', '合作伙伴']
            ]
        );

        // content data
        for ($i = 1; $i <= 6; $i++) {
            $img = '/layouts/01/images/brand/' . $i . '.png';
            MigrateService::createData(
                'doi_tac',
                [
                    'menu_id' => $menuId,
                    'page_setting_id' => $page->id,
                    'name' => 'Đối tác ' . $i,
                    'images' => json_encode(['avatar' => $img, 'images' => [$img]]),
                    'sort_order' => $i,
                    'parent_id' => '0',
                ],
                [
                    'name_data' => ['Đối tác ', 'Partner', '合作伙伴'],
                ]
            );

        }
    }

    static function block04($sortOrder = 0, $menuId = 0)
    {
        $content04_vi = 'Sản phẩm của chúng tôi đã và đang được ứng dụng hiệu quả trong nhiều lĩnh vực thực tế, góp phần nâng cao chất lượng cuộc sống và đáp ứng đa dạng nhu cầu của khách hàng.';
        $content04_en = 'Our products are effectively applied in many practical fields, contributing to improving the quality of life and meeting diverse customer needs.';
        $content04_ch = '我们的产品在多个实际领域得到有效应用，为提高生活质量和满足客户多样化需求做出贡献。';
        $page = MigrateService::createData(
            'page_setting',
            [
                'menu_id' => $menuId,
                'name' => 'block04',
                'name' => 'Ứng dụng thực tế',
                'block_type' => 'block04',
                'sort_order' => $sortOrder,
                'table_data' => 'block04',
                'table_edit' => 'block04'
            ],
            [
                'name_data' => ['Ứng dụng thực tế', 'Practical Application', '实际应用'],
                'description' => ['Sản phẩm được ứng dụng đa dạng trong thực tế', 'Products are widely applied in practice', '产品在实践中得到广泛应用'],
                'content' => [$content04_vi, $content04_en, $content04_ch]
            ]
        );

        MigrateService::createData(
            'block04',
            ['image' => '/layouts/01/gcc/icon1.png', 'page_setting_id' => $page->id],
            [
                'name_data' => ['THỔI PHIM', 'Blown Film', '吹膜'],
                'description' => [
                    'Ứng dụng trong sản xuất túi nilon, màng phủ nông nghiệp, màng đóng gói thực phẩm, bao bì công nghiệp, túi siêu thị, túi rác, góp phần giảm giá thành và cải thiện tính chất sản phẩm.',
                    'Application in the production of nylon bags, agricultural covers, food packaging films, industrial packaging, supermarket bags, garbage bags, contributing to cost reduction and improving product properties.',
                    '在生产尼龙袋、农业覆盖物、食品包装薄膜、工业包装、超市袋、垃圾袋等方面的应用，有助于降低成本，提高产品性能。'
                ]
            ]
        );
        MigrateService::createData(
            'block04',
            ['image' => '/layouts/01/gcc/icon2.png', 'page_setting_id' => $page->id],
            [
                'name_data' => ['DỆT PP', 'PP Woven Fabric', 'PP编织布'],
                'description' => [
                    'Ứng dụng trong sản xuất bao dệt PP, bao bì nông sản, bao xi măng, bao phân bón, bao thức ăn chăn nuôi, thảm nhựa, sợi PP… giúp giảm chi phí và nâng cao độ bền sản phẩm.',
                    'Application in the production of PP woven bags, agricultural packaging, cement bags, fertilizer bags, animal feed bags, plastic carpets, PP fibers… helps reduce costs and improve product durability.',
                    '在生产PP编织袋、农用包装、水泥袋、肥料袋、饲料袋、塑料地毯、PP纤维等方面的应用，有助于降低成本，提高产品耐用性。'
                ]
            ]
        );
        MigrateService::createData(
            'block04',
            ['image' => '/layouts/01/gcc/icon3.png', 'page_setting_id' => $page->id],
            [
                'name_data' => ['SẢN XUẤT SẢN PHẨM BẰNG NHỰA', 'PLASTIC PRODUCT MANUFACTURING', '塑料产品制造'],
                'description' => [
                    'Ứng dụng trong sản xuất sản phẩm nhựa ép đùn, ép phun như hộp nhựa, chai lọ, nắp đậy, ống nhựa, đồ gia dụng, linh kiện kỹ thuật… giúp tối ưu chi phí và cải thiện tính năng sản phẩm.',
                    'Application in the production of extruded and injection molded plastic products such as plastic boxes, bottles, caps, pipes, household items, and technical components… helps optimize costs and improve product features.',
                    '在生产挤出和注塑塑料产品方面的应用，如塑料盒、瓶子、盖子、管道、家居用品和技术组件……有助于优化成本并改善产品特性。'
                ]
            ]
        );

        MigrateService::createData(
            'block04',
            ['image' => '/layouts/01/gcc/icon4.png', 'page_setting_id' => $page->id],
            [
                'name_data' => ['SẢN XUẤT VẢI KHÔNG DỆT', 'NON-WOVEN FABRIC MANUFACTURING', '无纺布生产'],
                'description' => [
                    'Ứng dụng trong sản xuất vải không dệt như túi thân thiện môi trường, khăn ướt, khẩu trang y tế, đồ bảo hộ, thảm trải, vật liệu lọc… giúp giảm giá thành và nâng cao tính năng sử dụng.',
                    'Application in the production of non-woven fabrics such as eco-friendly bags, wet wipes, medical masks, protective clothing, mats, filter materials… helps reduce costs and enhance usability.',
                    '在生产无纺布方面的应用，如环保袋、湿巾、医用口罩、防护服、垫子、过滤材料……有助于降低成本并提高可用性。'
                ]
            ]
        );
    }

    static function block04_icon($sortOrder = 0, $menuId = 0)
    {
        $content04_vi = 'Sản phẩm của chúng tôi đã và đang được ứng dụng hiệu quả trong nhiều lĩnh vực thực tế, góp phần nâng cao chất lượng cuộc sống và đáp ứng đa dạng nhu cầu của khách hàng.';
        $content04_en = 'Our products are effectively applied in many practical fields, contributing to improving the quality of life and meeting diverse customer needs.';
        $content04_ch = '我们的产品在多个实际领域得到有效应用，为提高生活质量和满足客户多样化需求做出贡献。';
        $page = MigrateService::createData(
            'page_setting',
            [
                'menu_id' => $menuId,
                'name' => 'block04',
                'name' => 'Ứng dụng thực tế',
                'block_type' => 'block04',
                'sort_order' => $sortOrder,
                'table_data' => 'block04',
                'table_edit' => 'block04'
            ],
            [
                'name_data' => ['Ứng dụng thực tế', 'Practical Application', '实际应用'],
                'description' => ['Sản phẩm được ứng dụng đa dạng trong thực tế', 'Products are widely applied in practice', '产品在实践中得到广泛应用'],
                'content' => [$content04_vi, $content04_en, $content04_ch]
            ]
        );

        MigrateService::createData(
            'block04',
            ['icon' => '<i class="fas fa-text-width"></i>', 'page_setting_id' => $page->id],
            [
                'name_data' => ['THỔI PHIM', 'Blown Film', '吹膜'],
                'description' => [
                    'Ứng dụng trong sản xuất túi nilon, màng phủ nông nghiệp, màng đóng gói thực phẩm, bao bì công nghiệp, túi siêu thị, túi rác, góp phần giảm giá thành và cải thiện tính chất sản phẩm.',
                    'Application in the production of nylon bags, agricultural covers, food packaging films, industrial packaging, supermarket bags, garbage bags, contributing to cost reduction and improving product properties.',
                    '在生产尼龙袋、农业覆盖物、食品包装薄膜、工业包装、超市袋、垃圾袋等方面的应用，有助于降低成本，提高产品性能。'
                ]
            ]
        );
        MigrateService::createData(
            'block04',
            ['icon' => '<i class="fas fa-suitcase-rolling"></i>', 'page_setting_id' => $page->id],
            [
                'name_data' => ['DỆT PP', 'PP Woven Fabric', 'PP编织布'],
                'description' => [
                    'Ứng dụng trong sản xuất bao dệt PP, bao bì nông sản, bao xi măng, bao phân bón, bao thức ăn chăn nuôi, thảm nhựa, sợi PP… giúp giảm chi phí và nâng cao độ bền sản phẩm.',
                    'Application in the production of PP woven bags, agricultural packaging, cement bags, fertilizer bags, animal feed bags, plastic carpets, PP fibers… helps reduce costs and improve product durability.',
                    '在生产PP编织袋、农用包装、水泥袋、肥料袋、饲料袋、塑料地毯、PP纤维等方面的应用，有助于降低成本，提高产品耐用性。'
                ]
            ]
        );
        MigrateService::createData(
            'block04',
            ['icon' => '<i class="fas fa-syringe"></i>', 'page_setting_id' => $page->id],
            [
                'name_data' => ['SẢN XUẤT SẢN PHẨM BẰNG NHỰA', 'PLASTIC PRODUCT MANUFACTURING', '塑料产品制造'],
                'description' => [
                    'Ứng dụng trong sản xuất sản phẩm nhựa ép đùn, ép phun như hộp nhựa, chai lọ, nắp đậy, ống nhựa, đồ gia dụng, linh kiện kỹ thuật… giúp tối ưu chi phí và cải thiện tính năng sản phẩm.',
                    'Application in the production of extruded and injection molded plastic products such as plastic boxes, bottles, caps, pipes, household items, and technical components… helps optimize costs and improve product features.',
                    '在生产挤出和注塑塑料产品方面的应用，如塑料盒、瓶子、盖子、管道、家居用品和技术组件……有助于优化成本并改善产品特性。'
                ]
            ]
        );

        MigrateService::createData(
            'block04',
            ['icon' => '<i class="fas fa-tag"></i>', 'page_setting_id' => $page->id],
            [
                'name_data' => ['SẢN XUẤT VẢI KHÔNG DỆT', 'NON-WOVEN FABRIC MANUFACTURING', '无纺布生产'],
                'description' => [
                    'Ứng dụng trong sản xuất vải không dệt như túi thân thiện môi trường, khăn ướt, khẩu trang y tế, đồ bảo hộ, thảm trải, vật liệu lọc… giúp giảm giá thành và nâng cao tính năng sử dụng.',
                    'Application in the production of non-woven fabrics such as eco-friendly bags, wet wipes, medical masks, protective clothing, mats, filter materials… helps reduce costs and enhance usability.',
                    '在生产无纺布方面的应用，如环保袋、湿巾、医用口罩、防护服、垫子、过滤材料……有助于降低成本并提高可用性。'
                ]
            ]
        );
    }

    static function block05($sortOrder = 0, $menuId = 0)
    {
        $page = MigrateService::createData(
            'page_setting',
            [
                'menu_id' => $menuId,
                'name' => 'block05',
                'display_name' => 'Thống kê',
                'block_type' => 'block05',
                'table_data' => 'block05',
                'table_edit' => 'block05',
                'sort_order' => $sortOrder,
            ],
            [
                'name_data' => ['Thống kê', 'Statistics', '统计'],
            ]
        );

        MigrateService::createData(
            'block05',
            ['page_setting_id' => $page->id],
            [
                'name_data' => ['Sản lượng xuất khẩu', 'Export Output', '出口产量'],
                'description' => ['10.000 tấn/năm', '10,000 tons/year', '10,000吨/年']
            ],
        );
        MigrateService::createData(
            'block05',
            [ 'page_setting_id' => $page->id],
            [
                'name_data' => ['Số lượng khách hàng', 'Number of Customers', '客户数量'],
                'description' => ['368 Khách hàng', '368 Customers', '368客户']
            ]
        );
        MigrateService::createData(
            'block05',
            [ 'page_setting_id' => $page->id],
            [
                'name_data' => ['Số Quốc gia đã xuất khẩu', 'Number of Exporting Countries', '出口国家数量'],
                'description' => ['59 Quốc gia', '59 Countries', '59个国家']
            ]
        );
        // MigrateService::createData(
        //     'block05',
        //     ['note' => 200, 'page_setting_id' => $page->id],
        //     ['name_data' => ['Nhân sự', 'Human Resources', '人力资源']]
        // );
        // MigrateService::createData(
        //     'block05',
        //     ['note' => 1888, 'page_setting_id' => $page->id],
        //     ['name_data' => ['Mẫu sản phẩm', 'Product Template', '产品模板']],
        // );
    }

    static function block06($sortOrder = 0, $menuId = 0)
    {
        $content04 = '"Quy trình thực hiện" chặt chẽ giúp khách hàng hiểu rõ các bước làm việc chuyên nghiệp, minh bạch và hiệu quả của công ty. Tại đây, mọi giai đoạn từ tư vấn, triển khai đến bàn giao đều được trình bày rõ ràng, giúp khách hàng yên tâm khi hợp tác cùng doanh nghiệp.';
        $content04_en = '"Implementation Process" helps customers understand the professional, transparent and effective working steps of the company. Here, every stage from consulting, implementation to handover is clearly presented, helping customers feel secure when cooperating with the enterprise.';
        $content04_ch = '"实施过程"帮助客户清楚了解公司的专业、透明和高效的工作步骤。在这里，从咨询、实施到交付的每个阶段都得到了清晰的展示，帮助客户在与企业合作时感到安心。';
        $page = MigrateService::createData(
            'page_setting',
            [
                'menu_id' => $menuId,
                'name' => 'block06',
                'display_name' => 'Quy trình thực hiện',
                'sort_order' => $sortOrder,
                'block_type' => 'block06',
                'table_data' => 'block06',
                'images' => json_encode([
                    'avatar' => '/layouts/01/images/bg/services.jpg',
                    'images' => ['/layouts/01/images/bg/services.jpg']
                ])
            ],
            [
                'name_data' => ['Quy trình thực hiện', 'Implementation Process', '实施过程'],
                'description' => ['Quy trình làm việc của chúng tôi', 'Our working process', '我们的工作流程'],
                'content' => [$content04, $content04_en, $content04_ch]
            ]
        );
        MigrateService::createData(
            'block06',
            [
                'icon' => '<i class="fas fa-disease"></i>',
                'page_setting_id' => $page->id
            ],
            ['name_data' => ['Phân tích nhu cầu khách hàng', 'Customer Needs Analysis', '客户需求分析']],
        );
        MigrateService::createData(
            'block06',
            [
                'icon' => '<i class="fas fa-coins"></i>',
                'page_setting_id' => $page->id
            ],
            ['name_data' => ['Tư vấn sản phẩm phù hợp', 'Product Consultation', '产品咨询']],
        );
        MigrateService::createData(
            'block06',
            [
                'icon' => '<i class="fas fa-server"></i>',
                'page_setting_id' => $page->id
            ],
            ['name_data' => ['Báo giá sản phẩm', 'Product Pricing', '产品定价']],
        );
    }

    static function block08($sortOrder = 0, $menuId = 0)
    {
        $content04 = 'Trở thành Tập đoàn khai thác đá uy tín trong nước và quốc tế. Trở thành công ty khai thác đá  quốc tế chuyên nghiệp nằm trong nhóm dẫn đầu khu vực, với năng lực hoạt động toàn cầu. Hoạt động chuyên nghiệp, phân công chuyên môn hóa tất cả các chức năng nhiệm vụ, mọi hệ thống, tài chính minh bạch, quy trình nhất quán.';
        $content04_en = 'To become a reputable stone mining corporation domestically and internationally. To become a professional international stone mining company in the leading group of the region, with global operational capacity. Professional operations, specialization of all functional tasks, transparent finance, and consistent processes.';
        $content04_ch = '成为国内外知名的石材开采集团。成为区域领先、具备全球运营能力的专业国际石材开采公司。实现专业化运营，所有职能任务分工明确，系统完善，财务透明，流程一致。';

        MigrateService::createData(
            'page_setting',
            [
                'menu_id' => $menuId,
                'name' => 'block08',
                'display_name' => 'block08',
                'sort_order' => $sortOrder,
                'block_type' => 'block08',
                'table_data' => 'block08',
                'image' => '/layouts/01/images/about/3.jpg'
            ],
            [
                'name_data' => ['Tầm nhìn', 'Vision', '愿景'],
                'content' => [$content04, $content04_en, $content04_ch]
            ]
        );
    }

    static function block08_02($sortOrder = 0, $menuId = 0)
    {
        $content04 = 'Đối với thị trường, khách hàng: Cung cấp các sản phẩm – dịch vụ với chất lượng cao, đảm bảo đúng tiến độ. Bên cạnh giá trị chất lượng vượt trội, trong mỗi sản phẩm – dịch vụ đều mang tính thẩm mỹ cao nhằm thỏa mãn tối đa nhu cầu chính đáng của khách hàng.
Đối với cổ đông và đối tác: Đề cao tinh thần hợp tác cùng phát triển để trở thành “Người đồng hành số 1” của các đối tác và cổ đông; gia tăng các giá trị đầu tư mới hấp dẫn và bền vững.
Đối với nhân viên: Xây dựng môi trường làm việc chuyên nghiệp, năng động, sáng tạo và nhân văn; thực hiện các chế độ đãi ngộ hợp lý về vật chất và tinh thần .
Đối với xã hội: Hài hòa lợi ích doanh nghiệp với lợi ích xã hội; đóng góp tích cực vào các hoạt động hướng về cộng đồng, thể hiện tinh thần trách nhiệm công dân và niềm tự hào dân tộc.';
        $content04_en = 'For the market and customers: Provide high-quality products and services, ensuring timely delivery. In addition to outstanding quality, each product and service also possesses high aesthetics to fully satisfy the legitimate needs of customers.
For shareholders and partners: Promote the spirit of cooperation and joint development to become the "No. 1 companion" of partners and shareholders; increase attractive and sustainable new investment values.
For employees: Build a professional, dynamic, creative, and humane working environment; implement reasonable material and spiritual welfare policies.
For society: Harmonize business interests with social interests; actively contribute to community-oriented activities, demonstrating civic responsibility and national pride.';
        $content04_ch = '对于市场和客户：提供高质量的产品和服务，确保按时交付。除了卓越的质量外，每一项产品和服务都具有很高的美学价值，以最大程度满足客户的正当需求。
对于股东和合作伙伴：倡导合作共赢的发展精神，成为合作伙伴和股东的“第一同行者”；不断提升具有吸引力和可持续性的投资价值。
对于员工：营造专业、充满活力、创新和人文关怀的工作环境；在物质和精神方面实行合理的福利政策。
对于社会：实现企业利益与社会利益的和谐统一；积极参与社区公益活动，展现公民责任感和民族自豪感。';

        MigrateService::createData(
            'page_setting',
            [
                'menu_id' => $menuId,
                'name' => 'block08',
                'display_name' => 'block08',
                'sort_order' => $sortOrder,
                'block_type' => 'block08',
                'table_data' => 'block08',
                'image' => '/layouts/01/images/about/2.jpg'
            ],
            [
                'name_data' => ['Giá trị cốt lõi', 'Core values', '核心价值观'],
                'content' => [$content04, $content04_en, $content04_ch],
                'description' => ['', '', '']
            ]
        );
    }

    static function block09($sortOrder = 0, $menuId = 0)
    {
        $content04 = 'Là doanh nghiệp tiên phong, GCC mang sứ mệnh cung cấp  sản phẩm của mình  100% thuần Việt được khai thác từ mỏ đá Mông Sơn, Lục yên – Yên bái  làm nguyên liệu cho việc sản xuất cho các ngành công nghiệp . Đồng thời, việc vận dụng các công nghệ tiên tiến, hiện đại nhất từ Đức  dưới bàn tay, khối óc của người Việt giúp GCC tạo nên lợi thế cạnh tranh về giá trị từ đó mang đến nguồn nguyên liệu, chế phẩm hoàn hảo cho các nhà đầu tư trong và ngoài nước. Bên cạnh sứ mệnh là doanh nghiệp tiên phong trong lĩnh vực sản xuất và thương mại , GCC còn có những đóng góp giá trị cho sự nghiệp tự cung tự cấp của nền công nghiệp nói riêng và nền kinh tế Việt Nam nói chung.';
        $content04_en = 'As a pioneering enterprise, GCC is committed to providing 100% Vietnamese products sourced from the Mong Son quarry in Luc Yen – Yen Bai as raw materials for various industries. At the same time, by applying the most advanced German technologies through the skills and intellect of Vietnamese people, GCC creates a competitive advantage in value, thereby offering perfect materials and products for both domestic and international investors. In addition to its mission as a pioneer in manufacturing and trading, GCC also makes valuable contributions to the self-sufficiency of the industry in particular and the Vietnamese economy in general.';
        $content04_ch = '作为行业先锋企业，GCC肩负着提供100%源自越南芒山（Mông Sơn）、陆安（Lục Yên）——安沛（Yên Bái）矿山的原材料，用于各类工业生产的使命。同时，GCC将德国最先进的技术与越南人的智慧和技能相结合，创造出独特的价值竞争优势，为国内外投资者带来优质的原材料和制品。除了作为生产和贸易领域的先驱使命外，GCC还为工业自给自足事业以及越南经济的发展做出了宝贵贡献。';

        MigrateService::createData(
            'page_setting',
            [
                'menu_id' => $menuId,
                'name' => 'block06',
                'display_name' => 'block09',
                'sort_order' => $sortOrder,
                'block_type' => 'block09',
                'table_data' => 'block09',
                'image' => '/layouts/01/images/about/1.jpg'
            ],
            [
                'name_data' => ['Sứ mệnh', 'Mission', '使命'],
                'content' => [$content04, $content04_en, $content04_ch],
                'description' => ['', '', '']
            ]
        );
    }
}
