<?php

namespace App\Services;

use App\Models\Admin\Column;
use App\Models\Admin\Language;
use App\Models\Admin\Table;
use App\Models\Web\About;
use App\Models\Web\BDS;
use App\Models\Web\Block;
use App\Models\Web\BlockInfo;
use App\Models\Web\DiscountCode;
use App\Models\Web\Image;
use App\Models\Web\LinkFooter;
use App\Models\Web\WebConfig;
use Illuminate\Support\Facades\DB;
use App\Models\Web\Menu;
use App\Models\Web\News;
use App\Models\Web\Product;
use App\Models\Web\ProductInfo;
use App\Models\Web\ProductSetting;
use App\Models\Web\WebConfigData;


class
MigrateService
{

    static function createTable02(
        $name,
        $displayName,
        $dataConfig = []
    ) {
        $data = [
            'name' => $name,
            'display_name' => $displayName,
            'sort_order' => 0,
            'type_show' => 0, // kiểu show dữ liệu: 0: basic, dạng danh sách; 1 kiểu drop & drag; 6: data master
            'count_item_of_page' => '30',
            'is_edit' => 0, // có cho phép sửa ko
            'show_in_menu' => 1, // có hiển thị ở menu ko
            'is_multiple_language' => 0, // có phải là dữ liệu kiểu đa ngôn ngữ ko,
            'table_data' => '', // tên bảng data tương ứng
            'form_data_type' => 2,
            'have_delete' => 1, // có cho phép xóa ko
            'have_add_new' => 1, // có cho phép thêm mới ko
            'parent_id' => 0,
            'is_show_btn_edit' => 1, // có show nút sửa ko
            'is_show_btn_detail'=>1, // có show nút detail ko
            'tab_table_id' => 0, //  id của table cần chia tab
            'tab_table_name' => '',
            'route_name' => '',
            'is_label' => 0, // có fai là label ko
            'add_btn_from_route'=> '',
            'smart_search' => 1, // có smart search ko? chỉ 1 ô nhập từ khóa và tìm kiếm tất cả
            'config_show_data'=>'', // cài đặt show data liên quan
            'search_position' => 1,
        ];

        if(!empty($dataConfig)) {
            foreach($dataConfig as $key => $val) {
                $data[$key] = $val;
            }
        }
        $data['show_in_menu'] = $data['is_edit'];

        $result = new Table();
        foreach ($data as $key => $val) {
            $result->{$key} = $val;
        }
        $result->save();
        return $result;
    }

    static function createColumn02(
        $tableId,
        $name,
        $displayName,
        $typeData,
        $typeEdit,
        $order = 0,
        $dataConfig = []
    ) {
        $isEdit = 1;
        if ($name == 'id') {
            $isEdit = 0;
        }
        $value_default = '';
        $conditions = '';
        // check menu news
        if ($name == 'menu_id' && $tableId == 1) {
            $conditions == '{"display_type":"news"}';
        }
        if (in_array($name, ['images_crop', 'images'])) {
            $conditions  = 10;
        }
        if (in_array($name, ['image', 'image'])) {
            $conditions  = 10;
        }
        if (in_array($name, ['date', 'datetime'])) {
            $value_default = null;
        }

        $data = [
            'table_id' => $tableId, //id
            'name' => $name, // tên bảng
            'display_name' => $displayName, // tên hiển thị
            'type' => $typeData, // kiểu hiển thị
            'search_type' => 1, // 1 là tương đối , 2 là tuyệt đói, chú ý (seclect) thường là tuyệt đối
            'type_edit' => $typeEdit, // kiểu nhập liệu, tham khảo trong constant.php
            'edit' => $isEdit, // có cho phép sửa hay ko: 0/1
            'add2search' => 0,  // có hiển thị ở form search hay không: 0/1
            'show_in_list' => 0, // hiển thị trang danh sách không: 0/1
            'show_in_detail' => 1,  // hiển thị trang chi tiết không: 0/1
            'require' => 0, // Có require khi nhập liệu ko: 0/1
            'sort_order' => $order, // thứ tự sắp xếp
            'parent_id' => 0, // id cha
            'select_table_id' => 0, // id của table cần select, áp dụng cho kiểu nhập liệu là select, selects
            'data_select' => '', // cài đặt data cần select: {"value":"id", "name":{"0":"code", "1":"name"}}
            'is_view_detail' => 0, // có truyền link chi tiết khi click vào từ trang danh sách không 0/1
            'conditions' => $conditions, // điều kiện select bổ xung nếu có
            'ratio_crop' => 1, // tỷ lệ crop hình ảnh
            'fast_edit' => 0, // có cho phép sửa nhanh từ trang list ko 0/1
            'add_express' => 0, // có cheo phép thêm nhanh từ form nhập liệu ko 0/1
            'col'=>12, // độ rộng của form nhập liệu, áp dụng cho column tương ứng, gird = 24
            'block_type'=> '', // tab, block_basic
            'value_default' => $value_default, // giá trị mặc định
            'auto_generate_code'=>'', // có tự động generate ra mã ko, vd mã sản phẩm, nếu có cần tự động gen thì nhập format, ví dụ: SP thì sẽ gen ra mã là SP0001, SP0002....
            // 'is_show_id' => '',
            // 'show_length' => '',
            // 'links' => '',
            // 'is_show_total' => '',
            // 'is_show_btn_auto_get_total' => '',
            // 'table_link' => '',
            // 'class' => '',
            // 'column_table_link' => '',
            // 'sub_list' => '',
            // 'sub_column_name' => '',
            // 'config_add_sub_table' => '',
            // 'bg_in_list' => '',
            // 'is_null' => '30',
            // 'max_length' => 1,
            'placeholder' => '',
        ];

        // set data config
        if(in_array($name, ['id', 'is_draft', 'parent_id', 'sort_order', 'create_by', 'is_recycle_bin', 'created_at', 'updated_at'])) {
            $dataConfig['show_in_detail'] = isset($dataConfig['show_in_detail']) ? $dataConfig['show_in_detail']:0;
        }
        if(!empty($dataConfig)) {
            foreach($dataConfig as $key => $val) {
                $data[$key] = $val;
            }
        }

        Column::create($data);

        return Column::where('table_id', $tableId)->where('name', $data['name'])->first();

    }

    /**
     * $tableNames = []
     * tableParentId = tableId
     */
    static function setParentId2Tbl($tableNames, $tableParentId)
    {
        if (empty($tableParentId)) {
            return [
                'msg' => 'ParentId is not exist: ' . $tableParentId,
                'status' => 'error',
            ];
        }
        $table = Table::whereIn('name', $tableNames)->update(['parent_id' => $tableParentId]);
        return [
            'msg' => 'successfully',
            'status' => 'info'
        ];
    }

    /**
     * $tableNames = []
     * tableParentId = tableId
     */
    static function setParentId2Tbl_UseName($tableNames, $tableParentName)
    {
        $tableParent = Table::where('name', $tableParentName)->first();
        if (empty($tableParent)) {
            return [
                'msg' => 'ParentId is not exist: ' . $tableParentName,
                'status' => 'error',
            ];
        }
        return self::setParentId2Tbl($tableNames, $tableParent->id);
    }

    /**
     * $config (web_config) = ['column_name' => 'Tên theo lang02']
     * $configLang (web_config_data) = ['column_name' => 'Tên theo lang02']
     */
    static function webconfig($layout = '',$config = [], $configLang = [])
    {
        if(empty($layout)) {
            $layout = env('APP_LAYOUT');
        }
        $conf = [
            // 'id' => 1,
            'layout' => $layout,
            'name' => 'HT Viet Nam Demo website',
            'logo' => 'https://htvietnam.vn/images/logo/logo_vn_noslogan.png',
            'code' => '',
            'email' => 'info@htvietnam.vn',
            'phone' => '0399162342',
            'facebook_id' => 'https://www.facebook.com/htvietnamcompany',
            'currency' => 'đ',
            'currency_name' => 'VNĐ'
        ];
        foreach ($config as $key => $val) {
            $conf[$key] = $val;
        }

        WebConfig::create($conf);

        $languages = Language::get();

        foreach ($languages as $key => $lang) {
            $webConfigData = [
                'data_id' => 1,
                'languages_id' => $lang->id,
                'name_data' => 'HT Viet Nam Demo website',
                'title' => 'HT Viet Nam Demo website',
                'meta_keyword' => '',
                'meta_description' => '',
                'address' => '10/115 Định công, Quận Hoàng Mai, TP Hà Nội.',
            ];
            // set other
            foreach ($configLang as $k => $v) {
                $webConfigData[$k] = $v[$key];
            }
            WebConfigData::create($webConfigData);
        }
    }

    /**
     * $name = ['Tên theo lang01', 'Tên theo lang02']
     * $displayType = route_name
     * $data (menu) = ['image' => 'xxx']...
     * $dataLang (menus_data) = ['column_name' => ['lang01', 'lang02']]...
     */
    static function createMenu($name, $displayType, $data = [], $datasLang = [])
    {
        $default = [
            'name' => $name[0],
            'display_type' => $displayType, // bài viết đơn theo menu
            'parent_id' => 0,
            'is_active' => 1
        ];
        $menu = new Menu();
        // set default value
        foreach ($default as $k => $v) {
            $menu->{$k} = $v;
        }

        // set new
        foreach ($data as $key => $val) {
            $menu->{$key} = $val;
        }
        $menu->save();

        $language = Language::orderBy('id', 'asc')->get();
        foreach ($language as $key => $lang) {
            $dataLanguage = [
                'data_id' => $menu->id,
                'languages_id' => $lang->id,
            ];

            if(!empty($name[$key])) {
                $dataLanguage['name_data'] = $name[$key];
            }

            // set other
            foreach ($datasLang as $k => $v) {
                $dataLanguage[$k] = !empty($v[$key]) ? $v[$key] : '';
            }

            DB::table('menus_data')->insert($dataLanguage);
        }
        return $menu;
    }

    /**
     * $name = ['Tên theo lang01', 'Tên theo lang02']
     * $price
     * $images = ['/xxx.png', '/yyy.png']
     * $content = ['nội dung 01', 'content01']
     * $dataLang (products_data) = ['column_name' => ['lang01','lang02']]
     * $data (product) = ['name' => 'name']
     */
    static function createProduct($name, $price, $images, $content = [], $datas = [], $datasLang = [])
    {
        $default = [
            'name' => $name[0],
            'gia_ban' => $price, // bài viết đơn theo menu
            'images' => $images,
            'is_front' => 1,
            'views' =>10
        ];
        $product = new Product();

        foreach ($default as $k => $v) {
            $product->{$k} = $v;
        }

        foreach ($datas as $key => $val) {
            $product->{$key} = $val;
        }

        $product->save();

        // save by language
        $language = Language::orderBy('id', 'asc')->get();
        foreach ($language as $key => $lang) {
            $dataLanguage = [
                'data_id' => $product->id,
                'languages_id' => $lang->id,
            ];

            // set name,
            if(!empty($name[$key])) {
                $dataLanguage['name_data'] = $name[$key];
            }

            // set content
            if(!empty($content[$key])) {
                $dataLanguage['content'] = $content[$key];
            }

            // set other
            foreach ($datasLang as $k => $v) {
                $dataLanguage[$k] = !empty($v[$key]) ? $v[$key] : '';;
            }

            DB::table('products_data')->insert($dataLanguage);
        }
        return $product;
    }
    /**
     * $name = ['Tên theo lang01', 'Tên theo lang02']
     * $price
     * $images = ['/xxx.png', '/yyy.png']
     * $content = ['nội dung 01', 'content01']
     * $dataLang (products_data) = ['column_name' => ['lang01','lang02']]
     * $data (product) = ['name' => 'name']
     */
    static function createBDS($name, $images, $content = [], $datas = [], $datasLang = [])
    {
        $default = [
            'name' => $name[0],
            'images' => $images,
        ];
        $bds = new BDS();

        foreach ($default as $k => $v) {
            $bds->{$k} = $v;
        }

        foreach ($datas as $key => $val) {
            $bds->{$key} = $val;
        }

        $bds->save();

        // save by language
        $language = Language::orderBy('id', 'asc')->get();
        foreach ($language as $key => $lang) {
            $dataLanguage = [
                'data_id' => $bds->id,
                'languages_id' => $lang->id,
            ];

            // set name,
            if(!empty($name[$key])) {
                $dataLanguage['name_data'] = $name[$key];
            }

            // set content
            if(!empty($content[$key])) {
                $dataLanguage['content'] = $content[$key];
            }

            // set other
            foreach ($datasLang as $k => $v) {
                $dataLanguage[$k] = !empty($v[$key]) ? $v[$key] : '';;
            }

            DB::table('bds_data')->insert($dataLanguage);
        }
        return $bds;
    }

    /**
     * $name = ['Tên theo lang01', 'Tên theo lang02']
     * $image = '/xxx.png'
     * $content = ['nội dung 01', 'content01']
     * $datasLang (news_data) = ['column_name' => ['lang01','lang02']]
     * $datas (news) = ['name' => 'name']
     */
    static function createNews($name, $image, $content = [], $datas = [], $datasLang = [])
    {
        $default = [
            'name' => $name[0],
            'image' => $image,
            'is_front' => 1,
            'views' =>10
        ];

        $news = new News();

        foreach ($default as $k => $v) {
            $news->{$k} = $v;
        }

        foreach ($datas as $key => $val) {
            $news->{$key} = $val;
        }

        $news->save();

        // save by language
        $language = Language::orderBy('id', 'asc')->get();
        foreach ($language as $key => $lang) {
            $dataLanguage = [
                'data_id' => $news->id,
                'languages_id' => $lang->id,
            ];

            // set name,
            if(!empty($name[$key])) {
                $dataLanguage['name_data'] = $name[$key];
            }

            // set content
            if(!empty($content[$key])) {
                $dataLanguage['content'] = $content[$key];
            }

            // set other
            foreach ($datasLang as $k => $v) {
                $dataLanguage[$k] = !empty($v[$key]) ? $v[$key] : '';;
            }

            DB::table('news_data')->insert($dataLanguage);
        }

        return $news;
    }

    /**
     * $name = ['Tên theo lang01', 'Tên theo lang02']
     * $image = '/xxx.png'
     * $content = ['nội dung 01', 'content01']
     * $datasLang (news_data) = ['column_name' => ['lang01','lang02']]
     * $datas (news) = ['name' => 'name']
     */
    static function createImages($name, $img, $type = 1 , $datas = [], $datasLang = [])
    {
        $default = [
            'name' => $name[0],
            'type' => $type,
            'image' => $img,
            'link' =>''
        ];

        $image = new Image();

        foreach ($default as $k => $v) {
            $image->{$k} = $v;
        }

        foreach ($datas as $key => $val) {
            $image->{$key} = $val;
        }

        $image->save();

        // save by language
        $language = Language::orderBy('id', 'asc')->get();
        foreach ($language as $key => $lang) {
            $dataLanguage = [
                'data_id' => $image->id,
                'languages_id' => $lang->id,
            ];

            // set name,
            if(!empty($name[$key])) {
                $dataLanguage['name_data'] = $name[$key];
            }

            // set other
            foreach ($datasLang as $k => $v) {
                $dataLanguage[$k] = !empty($v[$key]) ? $v[$key] : '';
            }
            DB::table('images_data')->insert($dataLanguage);
        }
        return $image;
    }

    /**
     * $name = ['Tên theo lang01', 'Tên theo lang02']
     * $image = '/xxx.png'
     * $content = ['nội dung 01', 'content01']
     * $datasLang (news_data) = ['column_name' => ['lang01','lang02']]
     * $datas (news) = ['name' => 'name']
     */
    static function createAbout($name, $image, $content = [], $description = [] , $datas = [], $datasLang = [])
    {
        $default = [
            'name' => $name[0],
            'image' => $image,
            'menu_id' => 0
        ];

        $about = new About();

        foreach ($default as $k => $v) {
            $about->{$k} = $v;
        }

        foreach ($datas as $key => $val) {
            $about->{$key} = $val;
        }

        $about->save();

        // save by language
        $language = Language::orderBy('id', 'asc')->get();
        foreach ($language as $key => $lang) {
            $dataLanguage = [
                'data_id' => $about->id,
                'languages_id' => $lang->id,
                'name_data' => !empty($name[$key]) ? $name[$key]:'',
                'content' => !empty($content[$key]) ? $content[$key]:'',
                'description' => !empty($description[$key]) ? $description[$key]:'',
            ];
            // set other
            foreach ($datasLang as $k => $v) {
                $dataLanguage[$k] = !empty($v[$key]) ? $v[$key] : '';;
            }
            DB::table('about_data')->insert($dataLanguage);
        }

        return $about;
    }

    /**
     * $name = ['Tên theo lang01', 'Tên theo lang02']
     * $image = '/xxx.png'
     * $content = ['nội dung 01', 'content01']
     * $datasLang (news_data) = ['column_name' => ['lang01','lang02']]
     * $datas (news) = ['name' => 'name']
     */
    static function createProductInfo($name, $image , $datas = [], $datasLang = [])
    {
        $default = [
            'name' => $name[0],
            'image' => $image
        ];

        $info = new ProductInfo();

        foreach ($default as $k => $v) {
            $info->{$k} = $v;
        }

        foreach ($datas as $key => $val) {
            $info->{$key} = $val;
        }

        $info->save();

        // save by language
        $language = Language::orderBy('id', 'asc')->get();
        foreach ($language as $key => $lang) {
            $dataLanguage = [
                'data_id' => $info->id,
                'languages_id' => $lang->id,
                'name_data' => !empty($name[$key]) ? $name[$key]:'',
            ];

            // set other
            foreach ($datasLang as $k => $v) {
                $dataLanguage[$k] = !empty($v[$key]) ? $v[$key] : '';
            }
            DB::table('product_info_data')->insert($dataLanguage);
        }
        return $info;
    }

    /**
     * $name = ['Tên theo lang01', 'Tên theo lang02']
     * $image = '/xxx.png'
     * $content = ['nội dung 01', 'content01']
     * $datasLang (news_data) = ['column_name' => ['lang01','lang02']]
     * $datas (news) = ['name' => 'name']
     */
    static function createProductSetting($name, $image , $datas = [], $datasLang = [])
    {
        $default = [
            'name' => $name[0],
            'image' => $image
        ];

        $setting = new ProductSetting();

        foreach ($default as $k => $v) {
            $setting->{$k} = $v;
        }

        foreach ($datas as $key => $val) {
            $setting->{$key} = $val;
        }

        $setting->save();

        // save by language
        $language = Language::orderBy('id', 'asc')->get();
        foreach ($language as $key => $lang) {
            $dataLanguage = [
                'data_id' => $setting->id,
                'languages_id' => $lang->id,
                'name_data' => !empty($name[$key]) ? $name[$key]:'',
            ];

            // set other
            foreach ($datasLang as $k => $v) {
                $dataLanguage[$k] = !empty($v[$key]) ? $v[$key] : '';
            }
            DB::table('product_setting_data')->insert($dataLanguage);
        }
        return $setting;
    }

    /**
     * $name = ['Tên theo lang01', 'Tên theo lang02']
     * $image = '/xxx.png'
     * $content = ['nội dung 01', 'content01']
     * $datasLang (news_data) = ['column_name' => ['lang01','lang02']]
     * $datas (news) = ['name' => 'name']
     */
    static function createBlock($name, $image , $datas = [], $datasLang = [])
    {
        $default = [
            'name' => $name[0],
            'image' => $image
        ];

        $block = new Block();

        foreach ($default as $k => $v) {
            $block->{$k} = $v;
        }

        foreach ($datas as $key => $val) {
            $block->{$key} = $val;
        }

        $block->save();

        // save by language
        $language = Language::orderBy('id', 'asc')->get();
        foreach ($language as $key => $lang) {
            $dataLanguage = [
                'data_id' => $block->id,
                'languages_id' => $lang->id,
                'name_data' => !empty($name[$key]) ? $name[$key]:'',
            ];

            // set other
            foreach ($datasLang as $k => $v) {
                $dataLanguage[$k] = !empty($v[$key]) ? $v[$key] : '';
            }
            DB::table('block_data')->insert($dataLanguage);
        }
        return $block;
    }

    /**
     * $name = ['Tên theo lang01', 'Tên theo lang02']
     * $image = '/xxx.png'
     * $content = ['nội dung 01', 'content01']
     * $datasLang (news_data) = ['column_name' => ['lang01','lang02']]
     * $datas (news) = ['name' => 'name']
     */
    static function createBlockInfo($name, $image , $datas = [], $datasLang = [])
    {
        $default = [
            'name' => $name[0],
            'image' => $image
        ];

        $block = new BlockInfo();

        foreach ($default as $k => $v) {
            $block->{$k} = $v;
        }

        foreach ($datas as $key => $val) {
            $block->{$key} = $val;
        }

        $block->save();

        // save by language
        $language = Language::orderBy('id', 'asc')->get();
        foreach ($language as $key => $lang) {
            $dataLanguage = [
                'data_id' => $block->id,
                'languages_id' => $lang->id,
                'name_data' => !empty($name[$key]) ? $name[$key]:'',
            ];

            // set other
            foreach ($datasLang as $k => $v) {
                $dataLanguage[$k] = !empty($v[$key]) ? $v[$key] : '';
            }
            DB::table('block_info_data')->insert($dataLanguage);
        }
        return $block;
    }

    /**
     * $name = ['Tên theo lang01', 'Tên theo lang02']
     * $image = '/xxx.png'
     * $content = ['nội dung 01', 'content01']
     * $datasLang (news_data) = ['column_name' => ['lang01','lang02']]
     * $datas (news) = ['name' => 'name']
     */
    static function createLinkFooter($name, $link , $datas = [], $datasLang = [])
    {
        $default = [
            'name' => $name[0],
            'link' => $link,
        ];

        $footer = new LinkFooter();

        foreach ($default as $k => $v) {
            $footer->{$k} = $v;
        }

        foreach ($datas as $key => $val) {
            $footer->{$key} = $val;
        }

        $footer->save();

        // save by language
        $language = Language::orderBy('id', 'asc')->get();
        foreach ($language as $key => $lang) {
            $dataLanguage = [
                'data_id' => $footer->id,
                'languages_id' => $lang->id,
                'name_data' => !empty($name[$key]) ? $name[$key]:'',
            ];

            // set other
            foreach ($datasLang as $k => $v) {
                $dataLanguage[$k] = !empty($v[$key]) ? $v[$key] : '';;
            }
            DB::table('link_footer_data')->insert($dataLanguage);
        }
        return $footer;
    }

    static function showInAdminMenu($tableNames = []) {

        foreach($tableNames as $idx => $name){
            $data = [
                'parent_id'=>0,
                'is_edit'=>1,
                'sort_order' => $idx,
                'show_in_menu'=>1,
            ];

            DB::table('tables')->where('name', $name)->update($data);
        }

    }
    static function createLabel($name, $display, $sortOrder = 1, $show = 1) {
        $label = new Table();
        $label->name = $name;
        $label->display_name = $display;
        $label->sort_order = $sortOrder;
        $label->is_label = 1;
        $label->parent_id = 0;
        $label->is_edit = $show;
        $label->show_in_menu = $show;
        $label->save();
        return $label;
    }

    /**
     * setting column
     */
    static function configColumn($tableName, $column, $configs) {
        $table = Table::where('name', $tableName)->first();
        DB::table('table_column')
                ->where('table_id', $table->id)
                ->where('name', $column)
                ->update($configs);
    }

    /**
     * setting table
     */
    static function configTable($tableName, $configs) {
        DB::table('tables')
                ->where('name', $tableName)
                ->update($configs);
    }

    /**
     * $tblName = table Name
     * $datas = ['name' => 'name']
     * $datasLang = ['column_name' => ['lang01','lang02']]
     */
    static function createData($tblName, $datas = [], $datasLang = []){

        $dataInsert = [];

        foreach ($datas as $key => $val) {
            $dataInsert[$key] = $val;
        }

        if(!isset($datas['name']) && !empty($datasLang['name_data'])) {
            $dataInsert['name'] = $datasLang['name_data'][0];
        }

        $dataId = DB::table($tblName)->insertGetId($dataInsert);
        $data = DB::table($tblName)->where('id', $dataId)->first();

        if(!$datasLang) return;

        // save by language
        $tableData = $tblName . '_data';
        $language = Language::orderBy('id', 'asc')->get();
        foreach ($language as $key => $lang) {
            $dataLanguage = [
                'data_id' => $data->id,
                'languages_id' => $lang->id,
            ];

            // set other
            foreach ($datasLang as $k => $v) {
                $dataLanguage[$k] = !empty($v[$key]) ? $v[$key] : '';;
            }

            DB::table($tableData)->insert($dataLanguage);
        }
        return $data;
    }

    static function createBaseColumn($table) {
        $table->integer('parent_id')->default(0)->nullable();
        $table->integer('sort_order')->default(0)->nullable();
        $table->integer('create_by')->default(0)->nullable(); // nguoi tao
        $table->integer('is_draft')->default(0)->nullable();
        $table->integer('is_recycle_bin')->default(0)->nullable();
        $table->text('history')->nullable(); // log edit
        $table->timestamps();
    }

    static function baseColumn($table, $order = 100, $isTableData = false) {
        if($isTableData) {
            self::createColumn02($table->id, 'languages_id', 'languages_id', 'INT', 'number', $order++, ['edit' => 0, 'is_view_detail' => 0]);
            self::createColumn02($table->id, 'data_id', 'data_id', 'INT', 'number', $order++, ['edit' => 0, 'is_view_detail' => 0]);
        }
        // self::createColumn02($table->id, 'color', 'color', 'TEXT', 'color', $order++, ['edit' => $isEditColor, 'is_view_detail' => 0]);
        self::createColumn02($table->id, 'id', 'id', 'INT', 'number', $order++, ['edit' => 0, 'is_view_detail' => 0]);
        self::createColumn02($table->id, 'is_recycle_bin', 'is_recycle_bin', 'INT', 'number', $order++, ['edit' => 0, 'is_view_detail' => 0]);
        self::createColumn02($table->id, 'create_by', 'Tạo bởi', 'INT', config('constant.config_table.type_edit.select'), $order++, ['edit' => 0, 'is_view_detail' => 0]);
        self::createColumn02($table->id, 'sort_order', 'sort_order', 'INT', 'number', $order++, ['edit' => 0, 'is_view_detail' => 0]);
        self::createColumn02($table->id, 'created_at', 'Ngày tạo', 'INT', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0, 'is_view_detail' => 0]);
        self::createColumn02($table->id, 'updated_at', 'Ngày tạo', 'INT', config('constant.config_table.type_edit.date'), $order++, ['edit' => 0, 'is_view_detail' => 0]);

        // self::createColumn02($table->id, 'history', 'Lịch sử thay đổi', 'INT', config('constant.config_table.type_edit.date'), $order++,
        // ['edit' => 0, 'is_view_detail' => 0]);
    }

    static function columnSEO($table, $order = 20) {
        self::createColumn02(
            $table->id,
            'meta_keyword',
            '[SEO] Từ khóa',
            'TEXT',
            'textarea',
            $order++,
            ['col' => 12, 'require' => 0]
        );
        self::createColumn02(
            $table->id,
            'meta_description',
            '[SEO] Mô tả',
            'TEXT',
            'textarea',
            $order++,
            ['col' => 12, 'require' => 0]
        );
    }

    static function columnContent($table, $order = 20) {
        self::createColumn02(
            $table->id,
            'description',
            'Mô tả ngắn',
            'TEXT',
            'textarea',
            $order++,
            ['show_in_list' => 1, 'col' => 24]
        );
        self::createColumn02(
            $table->id,
            'content',
            'Nội dung',
            'LONGTEXT',
            'tiny',
            $order++,
            ['show_in_list' => 0, 'col' => 24]
        );
    }

    /**
     * $name = ['Tên theo lang01', 'Tên theo lang02']
     * $image = '/xxx.png'
     * $content = ['nội dung 01', 'content01']
     * $datasLang (news_data) = ['column_name' => ['lang01','lang02']]
     * $datas (news) = ['name' => 'name']
     */
    static function createDiscountCode($name, $code , $datas = [], $datasLang = [])
    {
        $default = [
            'name' => $name[0],
            'code' => $code,
        ];

        $data = new DiscountCode();

        foreach ($default as $k => $v) {
            $data->{$k} = $v;
        }

        foreach ($datas as $key => $val) {
            $data->{$key} = $val;
        }

        $data->save();

        // save by language
        $language = Language::orderBy('id', 'asc')->get();
        foreach ($language as $key => $lang) {
            $dataLanguage = [
                'data_id' => $data->id,
                'languages_id' => $lang->id,
                'name_data' => $name[$key],
            ];

            // set other
            foreach ($datasLang as $k => $v) {
                $dataLanguage[$k] = !empty($v[$key]) ? $v[$key] : '';;
            }
            DB::table('discount_code_data')->insert($dataLanguage);
        }
        return $data;
    }

    static function createTable(
        $id,
        $name,
        $displayName,
        $sort_order = 0,
        $type_show = 0,
        $isEdit = 1,
        $parentId = 0,
        $isMultipleLang = 0,
        $table_data = '',
        $is_label = 0
    ) {
        $tab_table_id = 0;
        $tab_table_name = '';
        $isMultipleLang = 0;
        $route_name = '';

        $data = [
            'name' => $name,
            'display_name' => $displayName,
            'sort_order' => $sort_order,
            'type_show' => $type_show,
            'count_item_of_page' => 30,
            'is_edit' => $isEdit,
            'form_data_type' => 2,
            'have_delete' => 1,
            'have_add_new' => 1,
            'parent_id' => $parentId,
            'is_show_btn_edit' => 1,
            'is_show_btn_detail'=>1,
            'tab_table_id' => $tab_table_id,
            'tab_table_name' => $tab_table_name,
            'is_multiple_language' => $isMultipleLang,
            'table_data' => $table_data,
            'route_name' => $route_name,
            'is_label' => $is_label,
        ];
        if (!empty($id)) {
            $data['id'] = $id;
        }

        // Table::create($data);
        $result = new Table();
        foreach ($data as $key => $val) {
            $result->{$key} = $val;
        }
        $result->save();
        return $result;
    }
    static function createColumn(
        $tableId,
        $name,
        $displayName,
        $type,
        $typeEdit,
        $sort_order,
        $show_in_list = 0,
        $add2search = 0,
        $is_view_detail = 0,
        $isEdit = 1,
        $select_table_id = 0,
        $data_select = '',
        $require = 0,
        $addExpress = 0,
        $dataConfig = []
    ) {
        if ($name == 'id') {
            $isEdit = 0;
        }
        $conditions = '';
        // check menu news
        if ($name == 'menu_id' && $tableId == 1) {
            $conditions == '{"display_type":"news"}';
        }
        if (in_array($name, ['images_crop', 'images'])) {
            $conditions  = 10;
        }
        if (in_array($name, ['image', 'image'])) {
            $conditions  = 10;
        }
        $data = [
            'table_id' => $tableId,
            'name' => $name,
            'display_name' => $displayName,
            'type' => $type,
            // 'value_default' => 1,
            // 'is_null' => '30',
            // 'max_length' => 1,
            'edit' => $isEdit,
            'add2search' => $add2search,
            'search_type' => 1,
            'type_edit' => $typeEdit,
            'show_in_list' => $show_in_list,
            'require' => $require,
            'sort_order' => $sort_order,
            'parent_id' => 0,
            'select_table_id' => $select_table_id,
            'data_select' => $data_select,
            // 'table_link' => '',
            // 'class' => '',
            // 'column_table_link' => '',
            // 'sub_list' => '',
            // 'sub_column_name' => '',
            // 'config_add_sub_table' => '',
            // 'bg_in_list' => '',
            'add_column_in_list' => '',
            // 'is_show_total' => '',
            // 'is_show_btn_auto_get_total' => '',
            'is_view_detail' => $is_view_detail,
            // 'is_show_id' => '',
            // 'show_length' => '',
            // 'links' => '',
            'conditions' => $conditions,
            'ratio_crop' => 1,
            'fast_edit' => 1,
            'add_express' => $addExpress,
            'col'=>6,
            'auto_generate_code'=>''
        ];

        // set data config
        foreach ($dataConfig as $key => $val) {
            $data[$key] = $val;
        }

        Column::create($data);

        return Column::where('table_id', $tableId)->where('name', $data['name'])->first();
    }


    static function sortOrder($tableNames)
    {
        $order = 1;
        foreach ($tableNames as $name) {
            $tbl = Table::where('name', $name)->first();
            $tbl->sort_order = $order++;
            $tbl->save();
        }
    }

    static function setParent($parentId, $subTableName, $sortOrder) {
        $data = Table::where('name', $subTableName)->first();
        $data->parent_id = $parentId;
        $data->sort_order = $sortOrder;
        $data->save();
    }

    static function createLanguage($langName, $langCode, $is_key = 0, $icon= '')
    {
        $language = new Language();
        $language->name = $langName;
        $language->code = $langCode;
        $language->is_key = $is_key;
        $language->icon = $icon;
        $language->save();
        return $language;
    }
}
