<?php

namespace App\Services\LandingpageData;

use Illuminate\Support\Facades\DB;
use App\Services\Service;
use App\Models\Web\Landingpage;
use App\Models\Web\Menu;
use App\Services\MigrateService;

use function PHPSTORM_META\type;

/**
 * Class CompanyService
 * @package App\Services\Users
 */
class Layout62 extends Service
{

    static function block06($sortOrder = 0, $menuId = 0)
    {
        MigrateService::createData(
            'page_setting',
            [
                'name' => 'Slider hình ảnh banner',
                'block_type' => 'banner',
                'sort_order' => $sortOrder,
                'table_data' => 'images',
                'table_edit' => 'images'
            ],
            []
        );
        for ($i = 1; $i < 5; $i++) {
            MigrateService::createImages(
                ['slide', 'slide'],
                '/layouts/01/images/slide0' . $i . '.jpg',
                1,
                [],
                [
                    'name_data' => ['Slide 0' . $i, 'Slide 0' . $i, 'Slide 0' . $i],
                    'description' => ['description 0' . $i, 'description 0' . $i, 'description 0' . $i],
                    'content' => ['content 0' . $i, 'content 0' . $i, 'content 0' . $i],
                ]
            );
        } 
    }
}
