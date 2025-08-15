<?php

namespace App\Services\LandingpageData;

use App\Services\MigrateService;
use DB;
use Exception;

class Layout01
{

    static function createBlocks($menuId = 0)
    {
        $sort_order = 0;
        MigrateService::createData(
            'list_landingpage',
            [
                'name' => 'banner',
                'display_name' => 'banner',
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
    static function banner($sortOrder = 0, $menuId = 0)
    {
        $page = MigrateService::createData(
            'page_setting',
            [
                'name' => 'banner',
                'display_name' => 'Slider hình ảnh banner',
                'block_type' => 'banner',
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
        MigrateService::createData(
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
    }

    static function doiTac($sortOrder = 0, $menuId = 0)
    {
        $page = MigrateService::createData(
            'page_setting',
            [
                'menu_id' => $menuId,
                'name' => 'doiTac',
                'display_name' => 'Đối tác',
                'sort_order' => $sortOrder,
                'block_type' => 'doiTac',
                'table_data' => 'doi_tac'
            ],
            [
                'name_data' => ['Đối tác', 'Partner', '合作伙伴']
            ]
        );

        // content data
        for ($i = 1; $i <= 6; $i++) {
            DB::table('doi_tac')->insert([
                'name' => 'Đối tác ' . $i,
                'image' => '/layouts/01/images/brand/' . $i . '.png',
                'parent_id' => '0',
                'sort_order' => $i,
                'menu_id' => $menuId,
                'page_setting_id' => $page->id
            ]);
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
            ['icon' => '<i class="fas fa-text-width"></i>', 'page_setting_id' => $page->id],
            [
                'name_data' => ['Ép phun', 'Injection Molding', '注塑'],
                'description' => ['Phương pháp này được sử dụng rộng rãi trong gia công nhựa, đặc biệt là trong các chi tiết phức tạp.', 'This method is widely used in plastic processing, especially for complex details.', '这种方法广泛用于塑料加工，特别是复杂细节。']
            ]
        );
        MigrateService::createData(
            'block04',
            ['icon' => '<i class="fas fa-suitcase-rolling"></i>', 'page_setting_id' => $page->id],
            [
                'name_data' => ['Dệt bao PP', 'PP Woven Fabric', 'PP编织布'],
                'description' => ['Phương pháp này có thể được sử dụng với nhiều loại vật liệu nhựa, bao gồm polyethylene mật độ thấp (LDPE), polyethylene mật độ cao (HDPE), polypropylene (PP) và polystyrene (PS).', 'Extrusion can be used with a wide range of plastic materials, including low-density polyethylene (LDPE), high-density polyethylene (HDPE), polypropylene (PP), and polystyrene (PS).', '挤出可以与多种塑料材料一起使用，包括低密度聚乙烯（LDPE）、高密度聚乙烯（HDPE）、聚丙烯（PP）和聚苯乙烯（PS）。']
            ]
        );
        MigrateService::createData(
            'block04',
            ['icon' => '<i class="fas fa-tag"></i>', 'page_setting_id' => $page->id],
            [
                'name_data' => ['Vải không dệt', 'Non-woven Fabric', '无纺布'],
                'description' => ['Vải không dệt là loại vải được sản xuất không qua quá trình dệt truyền thống, Sử dụng các hạt nhựa tổng hợp như polypropylene (PP), polyester (PET), v.v.', 'Non-woven fabric is a type of fabric produced without traditional weaving processes, using synthetic plastic particles such as polypropylene (PP), polyester (PET), etc.', '无纺布是一种不经过传统织造工艺生产的面料，使用聚丙烯（PP）、聚酯（PET）等合成塑料颗粒。']
            ]
        );
        MigrateService::createData(
            'block04',
            ['icon' => '<i class="fas fa-syringe"></i>', 'page_setting_id' => $page->id],
            [
                'name_data' => ['Đùn thổi màng', 'Blown Film Extrusion', '吹膜挤出'],
                'description' => ['Đùn thổi màng (Blown Film Extrusion) là một phương pháp sản xuất màng nhựa mỏng, thường dùng để làm bao bì, túi nilon, màng phủ nông nghiệp, v.v.', 'Blown film extrusion is a method of producing thin plastic films, commonly used for packaging, plastic bags, agricultural covers, etc.', '吹膜挤出是一种生产薄塑料膜的方法，通常用于包装、塑料袋、农业覆盖物等。']
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
                'display_name' => 'Dự án hoàn thành',
                'block_type' => 'block05',
                'table_data' => 'block05',
                'table_edit' => 'block05',
                'sort_order' => $sortOrder,
            ],
            [
                'name_data' => ['DỰ ÁN HOÀN THÀNH', 'Project Completed', '完成的项目'],
                'description' => ['Các dự án đã hoàn thành', 'Completed projects', '已完成的项目'],
                'content' => ['Nội dung dự án hoàn thành', 'Content of completed projects', '已完成项目的内容']
            ]
        );

        MigrateService::createData(
            'block05',
            ['note' => 1888, 'page_setting_id' => $page->id],
            ['name_data' => ['DỰ ÁN HOÀN THÀNH', 'Project Completed', '完成的项目']],
        );
        MigrateService::createData(
            'block05',
            ['note' => 1888, 'page_setting_id' => $page->id],
            ['name_data' => ['KHÁCH HÀNG', 'CUSTOMER', '客户']],
        );
        MigrateService::createData(
            'block05',
            ['note' => 1888, 'page_setting_id' => $page->id],
            ['name_data' => ['ĐỐI TÁC UY TÍN', 'PRESTIGIOUS PARTNER', '优质合作伙伴']],
        );
        MigrateService::createData(
            'block05',
            ['note' => 200, 'page_setting_id' => $page->id],
            ['name_data' => ['Nhân sự', 'Human Resources', '人力资源']]
        );
        MigrateService::createData(
            'block05',
            ['note' => 1888, 'page_setting_id' => $page->id],
            ['name_data' => ['Mẫu sản phẩm', 'Product Template', '产品模板']],
        );
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
                'images' => json_encode([
                    'avatar' => '/layouts/01/images/about/3.jpg',
                    'images' => ['/layouts/01/images/about/3.jpg']
                ])
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
                'images' => json_encode([
                    'avatar' => '/layouts/01/images/about/2.jpg',
                    'images' => ['/layouts/01/images/about/2.jpg']
                ])
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
                'images' => json_encode([
                    'avatar' => '/layouts/01/images/about/1.jpg',
                    'images' => ['/layouts/01/images/about/1.jpg']
                ])
            ],
            [
                'name_data' => ['Sứ mệnh', 'Mission', '使命'],
                'content' => [$content04, $content04_en, $content04_ch],
                'description' => ['', '', '']
            ]
        );
    }
}
