<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use App\Services\Service;
use App\Models\Admin\Table;
use App\Models\Admin\Column;
use App\Models\Admin\FileManager;
use App\Models\Web\Menu;

/**
 * Class CompanyService
 * @package App\Services\Users
 */
class CommonService extends Service
{
    protected $staticFunctions = [
        'getSubMenu', 'getParentId', 'unsetByValue', 'isJson', 'formatDataSelect', 'createDir', 'getEditorFolder', 'formatNumber02'
    ];
    /**
     * CommonService constructor.
     */
    public function __construct()
    {
    }

    /**
     * getSubMenu
     * @param $menu
     * @return menu, submenus, parentMenu
     */
    protected function getSubMenu($menuId)
    {
        $parent = $menu = Menu::find($menuId);
        $result['menu'] = $menu;
        if ($menu->parent_id > 0) {
            $parent = Menu::find($menu->parent_id);
            $subMenus = Menu::where('parent_id', $parent->id)->get();
        } else {
            $subMenuId = [];
            $subMenus = Menu::where('parent_id', $parent->id)->get();
            foreach ($subMenus as $sub) {
                $subMenuId[] = $sub->id;
            }
            $subMenuId[] = $menu->id;
        }
        $result['subMenus'] = $subMenus;
        $result['parent'] = $parent;
        return $result;
    }

    protected function isJson($string)
    {
        try {
            $result = json_decode($string, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $result;
            }
            return false;
        } catch (\Throwable $th) {
            return false;
        }
        
    }

    protected function getParentId($tableName, $id)
    {
        $result = [];
        $current = DB::table($tableName)->find($id);
        if (empty($current)) {
            return [];
        }
        $result[] = ['id' => $current->id, 'name' => $current->name];

        $parent = DB::table($tableName)->find($current->parent_id);

        if (empty($parent)) {
            return $result;
        }

        $result[] = ['id' => $parent->id, 'name' => $parent->name];

        if (intval($parent->parent_id) > 0) {
            $result = array_merge($result, self::getParentId($tableName, $parent->parent_id));
        }
        return $result;
    }

    protected function unsetByValue($array, $val) {
        foreach($array as $key => $value) {
            if($val == $value) {
                unset($array[$key]);
            }
        }
        return $array;
    }
    
    /**
     * formatDataSelect
     * @param $menu
     * @return menu, submenus, parentMenu
     */
    protected function formatDataSelect($names = ['name'], $datas, $prefix = ' - ') {
        $result = [];
        foreach($datas as $data) {
            $name = '';
            $count = count($names) - 1;
            foreach($names as $idx => $n) {
                if($idx == $count) {
                    $name = $data[$n];
                    continue;
                }
                $name = $data[$n] . $prefix;
            }
            $result[] = [
                'value' => $data->id,
                'label' => $name
            ];
        }
        return $result;
    }

    protected function createDir($directory, $permission = 0755) {
        if (!file_exists($directory)) {
            mkdir($directory, $permission, true);
        }
    }

    protected function getEditorFolder() {
        $editor = FileManager::where('name', 'editor')->first();
        if(!empty($editor)) {
            return $editor;
        }
        // tạo thư mục cho Editor
        CommonService::createDir('editor');
        // Lưu thư mục cho Editor trên db
        $fileManager = new FileManager();
        $fileManager->is_share_all = 1;
        $fileManager->name = 'editor';
        $fileManager->size = 0;
        $fileManager->type = 'folder';
        $fileManager->path = '';
        $fileManager->url = '';
        $fileManager->parent_id = 0;
        $fileManager->create_by = 1;
        $fileManager->save();
        return $fileManager;
    }

    protected function formatNumber02($value, $count = 2) {
        $result = $value;
        for($i = 1; $i <= $count; $i++) {
            if(strlen($value) <= $i) {
                $result = '0' . $result;
            }
        }
        return $result;
    }    

}
