<?php

namespace App\Services;

use App\Models\Admin\Language;
use App\Models\Web\Menu;
use App\Models\Web\Product;
use App\Models\Web\WebConfig;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Models\Web\BDS;
use App\Models\Web\Image;
use App\Models\Web\Languages;
use App\Models\Web\LinkFooter;
use App\Models\Web\PageSetting;
use App\Services\User\UserService;
use Illuminate\Support\Facades\App;
use PSpell\Config;

class Helper
{

    public function getConfig()
    {
        return WebConfig::find(1);
    }
    public function getCurrentLanguage()
    {
        return UserService::getLang();
    }
    public function getLinkLanguage($lang)
    {
        // return route('lang.switch', ['lang' => $lang]);
        return '';
    }

    public function getDataLang($table, $conditions = [], $orderBy = [], $limit = 0)
    {
        $tableLang = $table . '_data';
        $data = DB::table($table)->select(
            $table . '.*',
            $table . '.id as id',
            $tableLang . '.name_data as name_data',
            $tableLang . '.languages_id as languages_id',
            $tableLang . '.*',
        )
            ->leftJoin($tableLang, $tableLang . '.data_id', '=', $table . '.id')
            ->where($tableLang . '.languages_id', UserService::getLang()->id);

        if (!empty($conditions)) {
            foreach ($conditions as $key => $val) {
                $data = $data->where($key, $val);
            }
        }

        if (!empty($orderBy)) {
            foreach ($orderBy as $key => $val) {
                $data = $data->orderBy($key, $val);
            }
        }

        if ($limit == 0) {
            $data = $data->get();
        } else if ($limit == 1) {
            $data = $data->first();
        } else {
            $data = $data->paginate($limit);
        }

        return $data;
    }

    /**
     * condition = ['column_name' => 'value']
     * orderBy = ['column_name' => 'desc/asc']
     * limit: 0: get all; 1: get first; >1: get by limit
     */
    public function getDataByConditions($table, $conditions = [], $orderBy = ['id' => 'desc'], $limit = 0)
    {
        $data = DB::table($table);
        if (!empty($conditions)) {
            foreach ($conditions as $key => $val) {
                $data = $data->where($key, $val);
            }
        }

        if (!empty($orderBy)) {
            foreach ($orderBy as $key => $val) {
                $data = $data->orderBy($key, $val);
            }
        }

        if ($limit == 0) {
            $data = $data->get();
        } else if ($limit == 1) {
            $data = $data->first();
        } else {
            $data = $data->paginate($limit);
        }

        return $data;
    }



    /**
     * condition = ['column_name' => [value]]
     * orderBy = ['column_name' => 'desc/asc']
     * limit: 0: get all; 1: get first; >1: get by limit
     */
    public function getDataInArray($table, $conditions = null, $orderBy = ['sort_order' => 'asc'], $limit = 0)
    {
        $data = DB::table($table);
        if (!empty($conditions)) {
            foreach ($conditions as $key => $val) {
                $data = $data->whereIn($key, $val);
            }
        }

        if (!empty($orderBy)) {
            foreach ($orderBy as $key => $val) {
                $data = $data->orderBy($key, $val);
            }
        }

        if ($limit == 0) {
            $data = $data->get();
        } else if ($limit == 1) {
            $data = $data->first();
        } else {
            $data = $data->paginate($limit);
        }

        return $data;
    }

    /**
     * ids
     * condition = ['column_name' => 'value']
     */
    public function getMenuByIds($ids, $conditions = [])
    {
        $langId = UserService::getLang();

        $menu = Menu::query()->whereIn('menus.id', $ids);
        if (!empty($conditions)) {
            foreach ($conditions as $key => $val) {
                $menu = $menu->where($key, $val);
            }
        }
        $menu = $menu->orderBy('menus.sort_order', 'asc')->get();
        return $menu;
    }

    /**
     * parentID: menu id
     * condition = ['column_name' => 'value']
     */
    public function getMenuByParentId($parentId, $conditions = [])
    {
        $langId = UserService::getLang();
        $menu = Menu::query()->where('menus.parent_id', $parentId);
        if (!empty($conditions)) {
            foreach ($conditions as $key => $val) {
                $menu = $menu->where($key, $val);
            }
        }
        $menu = $menu->orderBy('menus.sort_order', 'asc')->get();
        return $menu;
    }

    public function getBDSByMenu($menu, $limit)
    {
        $menuIds = UserService::getSubmenuId($menu);
        return BDS::whereIn('menu_id', $menuIds)->orderBy('id', 'desc')->paginate($limit);
    }
    public function getLinkMenuId($id)
    {
        $menu = Menu::find($id);
        if (empty($menu)) {
            return '';
        }
        return self::getLinkMenu($menu);
    }
    public function getLinkMenu($menu)
    {
        
        if (empty($menu)) {
            return '';
        }
        $sluggable = 'data';
        $link = '';
        $lang = UserService::getLang();
        if (!empty($menu->name_data) && $lang->code != 'ch') {
            $sluggable = self::formatText($menu->name_data);
        }

        $displayType = $menu->display_type;

        switch ($displayType) {
            case 'landingpage':
            case 'product':
            case 'bds':
            case 'single_page':
            case 'news':
                $link = route($displayType, [$sluggable, $menu->id]);
                break;
            case 'contact':
            case 'home':
            case 'about':
                $link = route($displayType);
                break;
            default:
                # code...
                break;
        }

        return $link;
    }

    public function getLinkNews($news)
    {
        $lang = UserService::getLang();
        $sluggable = 'news';
        if(!empty($news->name_data) && $lang->code != 'ch') {
            $sluggable = self::formatText($news->name_data);
        }
        return route('news.detail', [$sluggable, $news->id]);
    }

    public function getLinkTags($tags)
    {
        $lang = UserService::getLang();
        $sluggable = 'tags';
        if (!empty($tags->name_data) && $lang->code != 'ch') {
            $sluggable = self::formatText($tags->name_data);
        }
        return route('news.tags', [$sluggable, $tags->id]);
    }

    public function getLinkProduct($product)
    {
        $lang = UserService::getLang();
        $sluggable = 'product';
        if (!empty($product->name_data) && $lang->code != 'ch') {
            $sluggable = self::formatText($product->name_data);
        }
        return route('product.detail', [$sluggable, $product->id]);
    }

    public function getLinkBDS($bds)
    {
        $sluggable = self::formatText($bds->name);
        return route('bds.detail', [$sluggable, $bds->id]);
    }


    public function getProducts($conditions = [], $orderBy = ['id' => 'desc'], $limit = 0)
    {
        $data = Product::query();

        if (!empty($conditions)) {
            foreach ($conditions as $key => $val) {
                $data = $data->where($key, $val);
            }
        }

        if (!empty($orderBy)) {
            foreach ($orderBy as $key => $val) {
                $data = $data->orderBy($key, $val);
            }
        }

        if ($limit == 0) {
            $data = $data->get();
        } else if ($limit == 1) {
            $data = $data->first();
        } else {
            $data = $data->limit($limit)->get();
        }

        return $data;
    }
    public function getProduct($id)
    {
        return Product::find($id);
    }

    function getCity() {}

    public function getName($tblName, $id = 0)
    {
        if (empty($id)) {
            return '';
        }
        $data = DB::table($tblName)->where('id', $id)->first();
        return !empty($data) ? $data->name : '';
    }

    public function getNamebyID($tblName, $id = 0)
    {
        if (empty($id)) {
            return '';
        }
        $data = DB::table($tblName)->where('id', $id)->first();
        return !empty($data) ? $data->id : '';
    }

    public function getMenuById($menuId)
    {
        return  Menu::find($menuId);
    }

    /**
     * getDataTbl
     *
     * @param [type] $tblName: tbl name
     * @param array $conditions: ['col_name' => 'value']
     * @param array $order: ['col', 'sort']
     * @param integer $limit: 0 - get all; 1 get 1; >1 -> pagiante($limit)
     * @return void
     */
    public function getBDS($conditions = [], $order = ['id', 'desc'], $limit = 0)
    {
        $data = new BDS();

        if (!empty($conditions)) {
            foreach ($conditions as $key => $val) {
                $data = $data->where($key, $val);
            }
        }

        // order
        if (!empty($order)) {
            $data = $data->orderBy($order[0], $order[1]);
        }

        // get
        switch ($limit) {
            case 0:
                $data = $data->get();
                break;
            case 1:
                $data = $data->first();
                break;
            default:
                $data = $data->paginate($limit);
                break;
        }
        return $data;
    }

    /**
     * getDataTbl
     *
     * @param [type] $tblName: tbl name
     * @param array $conditions: ['col_name' => 'value']
     * @param array $order: ['col', 'sort']
     * @param integer $limit: 0 - get all; 1 get 1; >1 -> pagiante($limit)
     * @return void
     */
    public function getDataTbl($tblName, $conditions = [], $order = ['id', 'desc'], $limit = 0)
    {
        $data = DB::table($tblName);

        if (!empty($conditions)) {
            foreach ($conditions as $key => $val) {
                $data = $data->where($key, $val);
            }
        }

        // order
        if (!empty($order)) {
            $data = $data->orderBy($order[0], $order[1]);
        }

        // get
        switch ($limit) {
            case 0:
                $data = $data->get();
                break;
            case 1:
                $data = $data->first();
                break;
            default:
                $data = $data->paginate($limit);
                break;
        }
        return $data;
    }

    public function formatText($string, $ext = '')
    {
        // remove all characters that aren"t a-z, 0-9, dash, underscore or space
        $string = strip_tags(str_replace('&nbsp;', ' ', $string));
        $string = str_replace('&quot;', '', $string);

        $string = self::_utf8ToAscii($string);
        $NOT_acceptable_characters_regex = '#[^-a-zA-Z0-9_ /]#';
        $string = preg_replace($NOT_acceptable_characters_regex, '', $string);
        // remove all leading and trailing spaces
        $string = trim($string);
        // change all dashes, underscores and spaces to dashes
        $string = preg_replace('#[-_]+#', '-', $string);
        $string = str_replace(' ', '-', $string);
        $string = preg_replace('#[-]+#', '-', $string);

        return strtolower($string . $ext);
    }

    public function formatText02($string, $ext = '')
    {
        // remove all characters that aren"t a-z, 0-9, dash, underscore or space
        $string = strip_tags(str_replace('&nbsp;', ' ', $string));
        $string = str_replace('&quot;', '', $string);

        $string = self::_utf8ToAscii($string);
        $NOT_acceptable_characters_regex = '#[^-a-zA-Z0-9_ /]#';
        $string = preg_replace($NOT_acceptable_characters_regex, '', $string);
        // remove all leading and trailing spaces
        $string = trim($string);
        // change all dashes, underscores and spaces to dashes
        $string = preg_replace('#[-_]+#', $ext, $string);
        $string = str_replace(' ', $ext, $string);
        $string = preg_replace('#[-]+#', $ext, $string);

        return strtolower($string);
    }

    protected function _utf8ToAscii($str)
    {
        $chars = array(
            'a' => array('ấ', 'ầ', 'ẩ', 'ẫ', 'ậ', 'Ấ', 'Ầ', 'Ẩ', 'Ẫ', 'Ậ', 'ắ', 'ằ', 'ẳ', 'ẵ', 'ặ', 'Ắ', 'Ằ', 'Ẳ', 'Ẵ', 'Ặ', 'á', 'à', 'ả', 'ã', 'ạ', 'â', 'ă', 'Á', 'À', 'Ả', 'Ã', 'Ạ', 'Â', 'Ă'),
            'e' => array('ế', 'ề', 'ể', 'ễ', 'ệ', 'Ế', 'Ề', 'Ể', 'Ễ', 'Ệ', 'é', 'è', 'ẻ', 'ẽ', 'ẹ', 'ê', 'É', 'È', 'Ẻ', 'Ẽ', 'Ẹ', 'Ê'),
            'i' => array('í', 'ì', 'ỉ', 'ĩ', 'ị', 'Í', 'Ì', 'Ỉ', 'Ĩ', 'Ị'),
            'o' => array('ố', 'ồ', 'ổ', 'ỗ', 'ộ', 'Ố', 'Ồ', 'Ổ', 'Ô', 'Ộ', 'ớ', 'ờ', 'ở', 'ỡ', 'ợ', 'Ớ', 'Ờ', 'Ở', 'Ỡ', 'Ợ', 'ó', 'ò', 'ỏ', 'õ', 'ọ', 'ô', 'ơ', 'Ó', 'Ò', 'Ỏ', 'Õ', 'Ọ', 'Ô', 'Ơ'),
            'u' => array('ứ', 'ừ', 'ử', 'ữ', 'ự', 'Ứ', 'Ừ', 'Ử', 'Ữ', 'Ự', 'ú', 'ù', 'ủ', 'ũ', 'ụ', 'ư', 'Ú', 'Ù', 'Ủ', 'Ũ', 'Ụ', 'Ư'),
            'y' => array('ý', 'ỳ', 'ỷ', 'ỹ', 'ỵ', 'Ý', 'Ỳ', 'Ỷ', 'Ỹ', 'Ỵ'),
            'd' => array('đ', 'Đ'),
        );
        foreach ($chars as $key => $arr) {
            $str = str_replace($arr, $key, $str);
        }
        $str = str_replace('/', '-', $str);
        return $str;
    }

    private function getLinkByRoute($routeName, $param = 0)
    {
        $result = '';
        switch ($routeName) {
            case 'home':
            case 'search':
            case 'series':
            case 'contact':
                $result = route($routeName);
                break;

            case 'news':
            case 'faq':
            case 'single':
                // $result = route($routeName, $param);
                break;
            default:
                # code...
                break;
        }
        return $result;
    }

    public function htmlMenuLayout02($id = 0)
    {
        $route = Route::currentRouteName();
        $html = '<div class="collapse navbar-collapse" id="myNavbar"><ul class="nav navbar-nav">';
        $menu = Menu::orderBy('sort_order', 'asc')->get();
        foreach ($menu as $idx => $m) {
            $link =  $this->getLinkByRoute($m->display_type, $m->id);
            $active = '';
            if ($route == $m->display_type) {
                // check active guild
                if ($m->display_type == 'single_page' && $m->id == $id) {
                    $active = 'active';
                }

                if ($m->display_type != 'single_page' && $m->display_type == $route) {
                    $active = 'active';
                }
            }

            // check active serie
            if ($route == 'video.series' && $m->id == 3) {
                $active = 'active';
            }
            $html .= '<li class="' . $active . '"><a href="' . $link . '"><p>' . $m->name . '</p></a></li>';
        }

        if (\Auth::guard('web')->check()) {
            $user = \Auth::guard('web')->user();
            $iconCart = '<svg width="71" height="24" viewBox="0 0 71 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 5.8H7.442C7.442 6.35067 7.42333 7.074 7.386 7.97H12.79V9.09C12.79 10.5553 12.762 11.764 12.706 12.716C12.6593 13.668 12.5847 14.4567 12.482 15.082C12.3793 15.698 12.2253 16.1647 12.02 16.482C11.8147 16.79 11.586 17 11.334 17.112C11.0913 17.224 10.774 17.28 10.382 17.28C9.64467 17.28 8.716 17.2193 7.596 17.098L7.722 15.74C8.618 15.8333 9.36467 15.88 9.962 15.88C10.3167 15.88 10.578 15.7587 10.746 15.516C10.914 15.264 11.04 14.7087 11.124 13.85C11.208 12.982 11.25 11.6287 11.25 9.79V9.3H7.302C7.12467 11.3627 6.72333 13.0053 6.098 14.228C5.482 15.4413 4.53 16.5473 3.242 17.546L2.318 16.524C3.438 15.6653 4.26867 14.7227 4.81 13.696C5.35133 12.66 5.706 11.1947 5.874 9.3H2.43V7.97H5.958C5.986 7.31667 6 6.59333 6 5.8ZM16.01 12.688V11.218H27.49V12.688H16.01ZM32.11 6.22H33.65V10.224C36.1793 10.8307 38.7553 11.6193 41.378 12.59L40.902 13.99C38.4473 13.0753 36.03 12.324 33.65 11.736V17.7H32.11V6.22Z" fill="white"/>
            <path d="M60.7498 3.66602C62.0759 3.66602 63.3477 4.1928 64.2854 5.13048C65.2231 6.06816 65.7498 7.33993 65.7498 8.66602V9.49935H69.0832V11.166H68.1107L67.4798 18.7352C67.4625 18.9434 67.3675 19.1375 67.2138 19.2791C67.0601 19.4206 66.8588 19.4992 66.6498 19.4993H54.8498C54.6409 19.4992 54.4396 19.4206 54.2859 19.2791C54.1321 19.1375 54.0372 18.9434 54.0198 18.7352L53.3882 11.166H52.4165V9.49935H55.7498V8.66602C55.7498 7.33993 56.2766 6.06816 57.2143 5.13048C58.152 4.1928 59.4238 3.66602 60.7498 3.66602ZM66.4382 11.166H55.0607L55.6165 17.8327H65.8823L66.4382 11.166ZM61.5832 12.8327V16.166H59.9165V12.8327H61.5832ZM58.2498 12.8327V16.166H56.5832V12.8327H58.2498ZM64.9165 12.8327V16.166H63.2498V12.8327H64.9165ZM60.7498 5.33268C59.8946 5.33268 59.0721 5.66138 58.4525 6.25079C57.8328 6.84019 57.4634 7.64522 57.4207 8.49935L57.4165 8.66602V9.49935H64.0832V8.66602C64.0832 7.81081 63.7545 6.98833 63.1651 6.36867C62.5757 5.74902 61.7706 5.37961 60.9165 5.33685L60.7498 5.33268Z" fill="white"/>
            </svg>';
            $iconUser = '<svg width="99" height="24" viewBox="0 0 99 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.792 9.048C11.0533 8.544 11.254 8.09133 11.394 7.69H9.322C9.58333 8.28733 9.77467 8.74 9.896 9.048H10.792ZM9.756 14.2C9.66267 15.236 9.35 16.0853 8.818 16.748C8.286 17.4013 7.49267 17.938 6.438 18.358L5.71 17.28C6.58733 16.916 7.23133 16.5053 7.642 16.048C8.05267 15.5813 8.30467 14.9653 8.398 14.2H7.53V10.77H13.13V14.2H11.66V16.552C11.66 16.7107 11.6693 16.804 11.688 16.832C11.7067 16.8507 11.7813 16.8693 11.912 16.888H12.094H12.276C12.416 16.8693 12.5047 16.7713 12.542 16.594C12.5793 16.4073 12.6027 15.8427 12.612 14.9L13.858 15.04C13.8487 15.4507 13.8347 15.7773 13.816 16.02C13.8067 16.2533 13.788 16.496 13.76 16.748C13.732 16.9907 13.7087 17.168 13.69 17.28C13.6713 17.4013 13.6293 17.5227 13.564 17.644C13.4987 17.7747 13.438 17.8587 13.382 17.896C13.3353 17.9333 13.2513 17.9753 13.13 18.022C13.0087 18.0687 12.892 18.0967 12.78 18.106C12.6773 18.1153 12.528 18.1247 12.332 18.134C12.2293 18.1433 12.0753 18.148 11.87 18.148C11.6553 18.148 11.5013 18.1433 11.408 18.134C10.904 18.1153 10.5867 18.05 10.456 17.938C10.3253 17.826 10.26 17.56 10.26 17.14V14.2H9.756ZM4.38 9.048C4.64133 8.544 4.842 8.09133 4.982 7.69H3.05C3.31133 8.28733 3.50267 8.74 3.624 9.048H4.38ZM3.134 16.566C2.77 17.2753 2.20533 17.8727 1.44 18.358L0.6 17.322C1.16 16.9673 1.58467 16.5473 1.874 16.062C2.17267 15.5673 2.35467 14.9467 2.42 14.2H1.37V10.77H6.802V14.2H5.822V15.432C6.37267 15.1987 6.83467 14.9887 7.208 14.802L7.39 16.006C6.06467 16.6967 4.70667 17.224 3.316 17.588L3.134 16.566ZM3.26 16.3C3.53067 16.2253 3.92733 16.104 4.45 15.936V14.2H3.722C3.666 15.012 3.512 15.712 3.26 16.3ZM7.362 10.21V9.048H8.468C8.20667 8.432 8.006 7.97933 7.866 7.69H7.39V6.5H9.56V5.38H11.03V6.5H13.48V7.69H12.808C12.64 8.18467 12.458 8.63733 12.262 9.048H13.662V10.21H7.362ZM11.66 13.052V11.932H8.958V13.052H11.66ZM0.838 10.21V9.048H2.238C1.97667 8.432 1.776 7.97933 1.636 7.69H1.02V6.5H3.26V5.38H4.73V6.5H6.942V7.69H6.368C6.2 8.18467 6.018 8.63733 5.822 9.048H6.97V10.21H0.838ZM5.36 11.932H2.77V13.052H5.36V11.932ZM15.118 6.794L15.986 5.786C16.91 6.46733 17.68 7.09733 18.296 7.676L17.428 8.726C16.7373 8.082 15.9673 7.438 15.118 6.794ZM17.05 12.016C16.2567 11.2693 15.4073 10.5553 14.502 9.874L15.356 8.866C16.308 9.54733 17.162 10.2473 17.918 10.966L17.05 12.016ZM18.142 13.626C17.6287 15.3153 16.924 16.818 16.028 18.134L14.838 17.336C15.678 16.0573 16.3593 14.6527 16.882 13.122L18.142 13.626ZM19.99 6.71L20.284 5.45C22.104 5.71133 23.8587 6.13133 25.548 6.71L25.1 7.956C23.476 7.396 21.7727 6.98067 19.99 6.71ZM20.102 16.86C20.9887 16.9067 21.5813 16.93 21.88 16.93C22.1787 16.93 22.3513 16.8973 22.398 16.832C22.454 16.7667 22.482 16.552 22.482 16.188V9.468H18.94V8.208H23.952C24.1667 9.14133 24.4467 10.0233 24.792 10.854C25.4453 10.1353 26.0987 9.23 26.752 8.138L27.872 8.852C27.1067 10.168 26.276 11.274 25.38 12.17C26.1733 13.766 27.088 15.0773 28.124 16.104L27.186 17.252C25.8793 15.8707 24.8013 14.088 23.952 11.904V16.16C23.952 17.056 23.8633 17.616 23.686 17.84C23.5087 18.0733 23.0793 18.19 22.398 18.19C22.09 18.19 21.3433 18.1667 20.158 18.12L20.102 16.86ZM18.17 11.96V10.728H21.88V11.96C21.3387 13.9013 20.256 15.6467 18.632 17.196L17.75 15.992C19.094 14.7693 20.0273 13.4253 20.55 11.96H18.17ZM37.532 10.448L38.988 10.014C39.772 12.114 40.486 14.4847 41.13 17.126L39.562 17.434C38.9367 14.8393 38.26 12.5107 37.532 10.448ZM31.89 7.116L33.43 7.214C33.1127 10.8727 32.072 14.2607 30.308 17.378L28.894 16.72C30.5553 13.752 31.554 10.5507 31.89 7.116ZM39.856 6.094C40.2387 6.47667 40.43 6.93867 40.43 7.48C40.43 8.02133 40.2387 8.48333 39.856 8.866C39.4733 9.24867 39.0113 9.44 38.47 9.44C37.9287 9.44 37.4667 9.24867 37.084 8.866C36.7013 8.48333 36.51 8.02133 36.51 7.48C36.51 6.93867 36.7013 6.47667 37.084 6.094C37.4667 5.71133 37.9287 5.52 38.47 5.52C39.0113 5.52 39.4733 5.71133 39.856 6.094ZM39.114 8.124C39.2913 7.94667 39.38 7.732 39.38 7.48C39.38 7.228 39.2913 7.01333 39.114 6.836C38.9367 6.65867 38.722 6.57 38.47 6.57C38.218 6.57 38.0033 6.65867 37.826 6.836C37.6487 7.01333 37.56 7.228 37.56 7.48C37.56 7.732 37.6487 7.94667 37.826 8.124C38.0033 8.30133 38.218 8.39 38.47 8.39C38.722 8.39 38.9367 8.30133 39.114 8.124ZM44.182 7.956L44.868 6.654C46.4453 7.41933 47.8827 8.18933 49.18 8.964L48.438 10.266C46.8793 9.35133 45.4607 8.58133 44.182 7.956ZM53.8 7.956L55.2 8.264C54.248 13.696 50.748 16.678 44.7 17.21L44.49 15.782C47.206 15.5207 49.3153 14.7553 50.818 13.486C52.33 12.2167 53.324 10.3733 53.8 7.956ZM67.38 6.808L68.85 6.892C68.794 9.26267 68.458 11.1713 67.842 12.618C67.2353 14.0647 66.3067 15.1707 65.056 15.936C63.8053 16.692 62.1113 17.21 59.974 17.49L59.708 16.132C61.1547 15.9267 62.34 15.6327 63.264 15.25C64.1973 14.858 64.972 14.2933 65.588 13.556C66.204 12.8187 66.6427 11.918 66.904 10.854C67.1747 9.78067 67.3333 8.432 67.38 6.808ZM57.622 7.564L59.05 7.256C59.4047 8.432 59.8247 9.98133 60.31 11.904L58.84 12.226C58.4013 10.378 57.9953 8.824 57.622 7.564ZM61.43 7.074L62.9 6.766C63.348 8.334 63.768 9.944 64.16 11.596L62.69 11.904C62.2513 10.1027 61.8313 8.49267 61.43 7.074Z" fill="white"/>
            <path d="M94.9168 20.334H81.5835V18.6673C81.5835 17.5622 82.0225 16.5024 82.8039 15.721C83.5853 14.9396 84.6451 14.5007 85.7502 14.5007H90.7502C91.8552 14.5007 92.915 14.9396 93.6964 15.721C94.4778 16.5024 94.9168 17.5622 94.9168 18.6673V20.334ZM88.2502 12.834C87.5936 12.834 86.9434 12.7047 86.3367 12.4534C85.7301 12.2021 85.1789 11.8338 84.7146 11.3695C84.2503 10.9052 83.882 10.354 83.6308 9.7474C83.3795 9.14077 83.2502 8.49059 83.2502 7.83398C83.2502 7.17737 83.3795 6.5272 83.6308 5.92057C83.882 5.31394 84.2503 4.76274 84.7146 4.29845C85.1789 3.83416 85.7301 3.46586 86.3367 3.21459C86.9434 2.96331 87.5936 2.83398 88.2502 2.83398C89.5762 2.83398 90.848 3.36077 91.7857 4.29845C92.7234 5.23613 93.2502 6.5079 93.2502 7.83398C93.2502 9.16007 92.7234 10.4318 91.7857 11.3695C90.848 12.3072 89.5762 12.834 88.2502 12.834V12.834Z" fill="white"/>
            </svg>';
            $iconLogout = '<svg width="375" height="48" viewBox="0 0 375 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="375" height="48" fill="#1F2937"/>
                <path d="M150.69 14H142.31C138.67 14 136.5 16.17 136.5 19.81V28.18C136.5 31.83 138.67 34 142.31 34H150.68C154.32 34 156.49 31.83 156.49 28.19V19.81C156.5 16.17 154.33 14 150.69 14ZM152.5 24.75H142.31L145.32 27.76C145.61 28.05 145.61 28.53 145.32 28.82C145.17 28.97 144.98 29.04 144.79 29.04C144.6 29.04 144.41 28.97 144.26 28.82L139.97 24.53C139.83 24.39 139.75 24.2 139.75 24C139.75 23.8 139.83 23.61 139.97 23.47L144.26 19.18C144.55 18.89 145.03 18.89 145.32 19.18C145.61 19.47 145.61 19.95 145.32 20.24L142.31 23.25H152.5C152.91 23.25 153.25 23.59 153.25 24C153.25 24.41 152.91 24.75 152.5 24.75Z" fill="white"/>
                <path d="M172.11 18.92H182.89V29H173.65H172.11V18.92ZM173.65 27.628H181.35V20.292H173.65V27.628ZM194.16 17.982L195.196 17.45C195.588 18.122 195.961 18.8127 196.316 19.522L195.84 19.76V19.83C195.84 23.0127 195.098 25.374 193.614 26.914C192.139 28.454 189.778 29.3593 186.53 29.63L186.32 28.3C189.027 28.0387 190.987 27.3573 192.2 26.256C193.423 25.1547 194.109 23.4093 194.258 21.02H189.274C188.705 22.5133 187.795 23.848 186.544 25.024L185.508 24.114C186.339 23.3207 187.011 22.4107 187.524 21.384C188.037 20.348 188.359 19.2653 188.49 18.136L189.918 18.234C189.853 18.794 189.773 19.2793 189.68 19.69H195.098C194.874 19.2513 194.561 18.682 194.16 17.982ZM196.148 17.772L197.212 17.24C197.651 17.996 198.033 18.7007 198.36 19.354L197.296 19.872C197.016 19.34 196.633 18.64 196.148 17.772ZM200.152 20.208V18.92H211.352V20.208C211.081 21.16 210.605 22.0467 209.924 22.868C209.243 23.68 208.44 24.3333 207.516 24.828L206.718 23.652C208.286 22.8027 209.303 21.6547 209.77 20.208H200.152ZM204.03 21.44H205.5C205.5 23.064 205.369 24.394 205.108 25.43C204.856 26.4567 204.45 27.292 203.89 27.936C203.339 28.58 202.574 29.1213 201.594 29.56L200.894 28.342C201.697 27.9873 202.317 27.544 202.756 27.012C203.204 26.4707 203.526 25.7613 203.722 24.884C203.927 24.0067 204.03 22.8587 204.03 21.44ZM214.18 19.9H218.66V17.73H220.13V19.9H224.82V22.35C224.82 24.5527 224.134 26.27 222.762 27.502C221.399 28.7247 219.402 29.4107 216.77 29.56L216.588 28.23C221.096 27.9687 223.35 26.0087 223.35 22.35V21.188H215.608V24.45H214.18V19.9ZM229.86 18.22H231.4V22.224C233.929 22.8307 236.505 23.6193 239.128 24.59L238.652 25.99C236.197 25.0753 233.78 24.324 231.4 23.736V29.7H229.86V18.22Z" fill="white"/>
                </svg>';
            $html .= '<li class="main-btn-menu">
                        <a class="btn btn-default coco-btn-default btn-point-menu">' . number_format($user->point) . config('constants.curency') . '</a>
                        <a type="button" class="btn btn-default btn-login btn-login02 btn-coco-03">' . $iconCart . '</a>
                        <a type="button" class="btn btn-default btn-login btn-login02 btn-coco-03">' . $iconUser . '</a>
                    </li>
                    <li class="menu-logout">
                        <a>' . $iconLogout . '</a>
                    </li>';
        } else {
            $html .= '<li class="main-btn-menu">
                        <a id="login-mobie" type="button" class="btn btn-default btn-login btn-login01 btn-coco-03" data-toggle="modal" data-target="#modalLogin" data-backdrop="static" data-keyboard="false">' . __('common.login') . '</a>
                        <a id="register-mobile" type="button" class="btn btn-default btn-register btn-coco-03" data-toggle="modal" data-target="#modalRegister" data-backdrop="static" data-keyboard="false">' . __('user.register') . '</a>
                    </li>';
        }


        $html .= '</ul></div>';
        return $html;
    }

    public function htmlItemProductLayout02($products)
    {
        $html = '';
        $today = strtotime(date('Y-m-d'));
        $time = strtotime(date('Y-m-d', strtotime('-7 day', $today)));
        foreach ($products as $product) {
            $image = config('constant.no_image');
            $image2 = config('constant.no_image');
            if (!empty($product->images)) {
                $image = $product->images['avatar'];
                $image2 = $product->images['images'][0];
                if ($image == $image2 && isset($product->images['images'][1])) {
                    $image2 = $product->images['images'][1];
                }
            }

            $icon = '';
            if (!empty($product->promo_price) && $product->price > $product->promo_price) {
                $icon = '<div class="item-new">' . config('constants.icon_sale') . '</div>';
            }

            $relsease = strtotime($product->release_date);
            if ($relsease >= $time) {
                $icon = '<div class="item-new">' . config('constants.icon_new') . '</div>';
            }

            $link = '';

            $price = $product->promo_price > 0 && $product->promo_price < $product->price ? number_format($product->promo_price) : number_format($product->price);
            $releaseDate = !empty($product->release_date) ? date('Y.m.d', strtotime($product->release_date)) : '';
            $html .= '<div class="col-sm-2 col-xs-6">
                        ' . $icon . '
                        <a class="img-video03" href="' . $link . '">
                            <img src="' . $image . '" class="img-responsive img-01"/>
                            <img src="' . $image2 . '" class="img-responsive img-02"/>
                        </a>
                        <p class="videos-price">' . $price . ' ' . config('constant.curency_html') . '</p>
                        <h3 class="videos-title"><a href="' . $link . '">' . $product->name . '</a></h3>
                    </div>';
        }
        return $html;
    }

    public function showPriceProduct($product, $classPrice = '', $classPromoPrice = '')
    {
        if ($product->promo_price > 0 && $product->promo_price < $product->price) {
            return '<span class="' . $classPromoPrice . '">' . number_format(intval($product->price), 0, '.', '.') . '₫</span>
            <span class="' . $classPrice . '">' . number_format(intval($product->promo_price), 0, '.', '.') . '₫</span>';
        }
        return '<span class="' . $classPrice . '">' . number_format(intval($product->price), 0, '.', '.')  . '₫</span>';
    }

    public function getAvatarProduct($product, $isShowNoImage = true)
    {
        $img = '';
        if (!empty($product) && !empty($product->images) && !empty($product->images['avatar'])) {
            $img = $product->images['avatar'];
        } else if ($isShowNoImage) {
            $img = '/images/no-image.jpg';
        }
        return $img;
    }

    public function showProductAvatar($product, $class = '', $id = '', $attr = '')
    {
        if (empty($product) || empty($product->images) || empty($product->images['avatar'])) {
            return '<img id="' . $id . '" class="' . $class . '" src="/images/no-image.jpg" alt="' . $product->name . '" title="' . $product->name . '" ' . $attr . '/>';
        }
        return '<img id="' . $id . '" class="' . $class . '" src="' . $product->images['avatar'] . '" alt="' . $product->name . '" title="' . $product->name . '" ' . $attr . '/>';
    }

    public function btnEditLandingpage($param, $class = '', $text = 'Sửa', $menuId = 0)
    {
        if (\Auth::guard('admin_users')->check()) {
            return '<span onclick="ajaxLoadUrl(\'' . route('land.form', $param) . '\', \'#content-modal-edit\')"
                    data-toggle="modal" data-target="#editModal"
                    class="btn btn-edit land-fast-edit ' . $class . '">
                ' . $text . '
            </span>';
        }
    }

    public function generateRandomString($length = 10)
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[random_int(0, $charactersLength - 1)];
        }
        return $randomString;
    }

    public function generateLandingpageId($land)
    {
        if (empty($land)) {
            return '';
        }
        if (!empty($land->name)) {
            return self::formatText($land->name);
        }
        return 'page-' . $land->id;
    }

    public function btnLandingpageSetting($menuId = 0)
    {
        if (\Auth::guard('admin_users')->check()) {
            return '<button id="sort_order_block"
                class="btn btn-edit land-fast-edit1"
                onclick="ajaxLoadUrl(\'' . route('land.sort_order', [$menuId]) . '\', \'#content-modal-sort-order\')"
                data-toggle="modal" data-target="#sortOrderModal"
                data-backdrop="static" data-keyboard="false">' . __('land.page_setting') . '</button>';
        }
    }

    public function getLinkFooter()
    {
        return LinkFooter::query()->orderBy('sort_order', 'asc')->get();
    }

    public function getPageSeting($menuId = 0) {
        return PageSetting::query()
            ->where('page_setting.menu_id', $menuId)
            ->orderBy('page_setting.sort_order', 'asc')
            ->get();
    }
}
