<?php

namespace App\Services\User;

use App\Models\Admin\Language;
use App\Models\Web\Menu;
use Illuminate\Support\Facades\DB;
use App\Services\Service;
use Illuminate\Support\Facades\App;

/**
 * Class CompanyService
 * @package App\Services\Users
 */
class UserService extends Service
{
    static function getLang() {
        $currentLocale = app()->getLocale();
        $lang = Language::where('code', $currentLocale)->first();
        return $lang;
    }
    static function getMenuDetail($menuId) {
        $lang = self::getLang();
        $menu = Menu::select(
            'menus.id as id',
            'menus_data.name_data as name',
        )
        ->leftJoin('menus_data', 'menus.id', '=', 'menus_data.data_id')
        ->where('menus.id', $menuId)
        ->first();

        $parent = Menu::select(
            'menus.id as id',
            'menus_data.name_data as name',
        )
        ->leftJoin('menus_data', 'menus.id', '=', 'menus_data.data_id')
        ->where('menus.id', intval($menu->parent_id))
        ->first();

        $subMenu = Menu::select(
            'menus.id as id',
            'menus_data.name_data as name',
        )
        ->leftJoin('menus_data', 'menus.id', '=', 'menus_data.data_id')
        ->where('menus.parent_id', $menuId)
        ->where('menus_data.languages_id', $lang->id)
        ->get();

        $subMenuId = [$menu->id];
        if(count($subMenu) > 0) {
            foreach($subMenu as $s) {
                $subMenuId[] = $s->id;
            }
        }

        $menuRelative = [];
        if(!empty($parent)) {
            $menuRelative = Menu::select(
                'menus.id as id',
                'menus.parent_id as parent_id',
                'menus_data.data_name as name',
            )
            ->leftJoin('menus_data', 'menus.id', '=', 'menus_data.data_id')
            ->where('menus.parent_id', $parent->id)
            ->get();
        }
        return [
            'parent' => $parent,
            'menu' => $menu,
            'subMenu' => $subMenu,
            'subMenuId' => $subMenuId,
            'menuRelative' => $menuRelative
        ];
    }

    static function getSubmenuId($menu)
    {
        $submenu[] = $menu->id;
        $menus = Menu::where('parent_id', $menu->id)->get();
        if (count($menus) == 0) {
            return $submenu;
        }
        foreach ($menus as $m) {
            $submenu[] = $m->id;
        }
        return $submenu;
    }
}
