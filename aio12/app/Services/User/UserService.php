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
        if(empty(session()->get('locale'))) {
            App::setLocale(config('app.locale'));
            session()->put('locale', config('app.locale'));
        }
        $lang = Language::where('code', session()->get('locale'))->first();
        if(empty($lang)) {
            $langId = 1;
        } else {
            $langId = $lang->id;
        }
        return $langId;
    }
    static function getMenuDetail($menuId) {
        $langId = self::getLang();
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
        ->where('menus_data.languages_id', $langId)
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
