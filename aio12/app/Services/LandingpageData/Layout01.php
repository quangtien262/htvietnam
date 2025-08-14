<?php

namespace App\Services\LandingpageData;

use App\Services\MigrateService;
use DB;
use Exception;

class Layout01
{

    static function createBlocks()
    {
        $sort_order = 0;
        MigrateService::createData(
            'list_landingpage',
            [
                'name' => 'banner',
                'display_name' => 'banner',
                'image' => '/layouts/01/images/block/10.png',
                'sort_order' => $sort_order
            ]
        );
        MigrateService::createData(
            'list_landingpage',
            [
                'name' => 'news',
                'display_name' => 'news',
                'image' => '/layouts/01/images/block/7.png',
                'sort_order' => $sort_order++
            ]
        );
        MigrateService::createData(
            'list_landingpage',
            [
                'name' => 'products',
                'display_name' => 'Product',
                'image' => '/layouts/01/images/block/11.png',
                'sort_order' => $sort_order++
            ]
        );
        MigrateService::createData(
            'list_landingpage',
            [
                'name' => 'doiTac',
                'display_name' => 'Đối tác',
                'image' => '/layouts/01/images/block/9.png',
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
        MigrateService::createData(
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
                    'menu_id' => $menuId
                    
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
        MigrateService::createData(
            'page_setting',
            [
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
        MigrateService::createData(
            'page_setting',
            [
                'name' => 'doiTac',
                'display_name' => 'Đối tác',
                'sort_order' => $sortOrder,
                'block_type' => 'doiTac',
                'table_data' => 'doi_tac'
            ], [
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
                'menu_id' => $menuId
            ]);
        }
    }

    static function block04($sortOrder = 0, $menuId = 0)
    {
        $content04_vi = 'Sản phẩm của chúng tôi đã và đang được ứng dụng hiệu quả trong nhiều lĩnh vực thực tế, góp phần nâng cao chất lượng cuộc sống và đáp ứng đa dạng nhu cầu của khách hàng.';
        $content04_en = 'Our products are effectively applied in many practical fields, contributing to improving the quality of life and meeting diverse customer needs.';
        $content04_ch = '我们的产品在多个实际领域得到有效应用，为提高生活质量和满足客户多样化需求做出贡献。';
        MigrateService::createData(
            'page_setting',
            [
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
    }

    static function block05($sortOrder = 0, $menuId = 0)
    {
        MigrateService::createData(
            'page_setting',
            [
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
            ['note' => 1888],
            ['name_data' => ['DỰ ÁN HOÀN THÀNH', 'Project Completed', '完成的项目']],
        );
        MigrateService::createData(
            'block05',
            ['note' => 1888],
            ['name_data' => ['KHÁCH HÀNG', 'CUSTOMER', '客户']],
        );
        MigrateService::createData(
            'block05',
            ['note' => 1888],
            ['name_data' => ['ĐỐI TÁC UY TÍN', 'PRESTIGIOUS PARTNER', '优质合作伙伴']],
        );
        MigrateService::createData(
            'block05',
            ['note' => 200],
            ['name_data' => ['Nhân sự', 'Human Resources', '人力资源']]
        );
        MigrateService::createData(
            'block05',
            ['note' => 1888],
            ['name_data' => ['Mẫu sản phẩm', 'Product Template', '产品模板']],
        );
    }

    static function block06($sortOrder = 0, $menuId = 0)
    {
        $content04 = '"Quy trình thực hiện" chặt chẽ giúp khách hàng hiểu rõ các bước làm việc chuyên nghiệp, minh bạch và hiệu quả của công ty. Tại đây, mọi giai đoạn từ tư vấn, triển khai đến bàn giao đều được trình bày rõ ràng, giúp khách hàng yên tâm khi hợp tác cùng doanh nghiệp.';
        $content04_en = '"Implementation Process" helps customers understand the professional, transparent and effective working steps of the company. Here, every stage from consulting, implementation to handover is clearly presented, helping customers feel secure when cooperating with the enterprise.';
        $content04_ch = '"实施过程"帮助客户清楚了解公司的专业、透明和高效的工作步骤。在这里，从咨询、实施到交付的每个阶段都得到了清晰的展示，帮助客户在与企业合作时感到安心。';
        MigrateService::createData(
            'page_setting',
            [
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
            ['note' => 1888],
            ['name_data' => ['Phân tích nhu cầu khách hàng', 'Customer Needs Analysis', '客户需求分析']],
        );
        MigrateService::createData(
            'block06',
            ['note' => 1888],
            ['name_data' => ['Tư vấn sản phẩm phù hợp', 'Product Consultation', '产品咨询']],
        );
        MigrateService::createData(
            'block06',
            ['note' => 1888],
            ['name_data' => ['Báo giá sản phẩm', 'Product Pricing', '产品定价']],
        );
    }
}
