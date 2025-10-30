<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Web\Library;
use App\Models\Web\Menu;
use App\Models\Web\News;
use App\Models\Web\WebConfig;
use App\Services\User\UserService;
use Illuminate\Http\Request;

class LibsController extends Controller
{
    public function index(Request $request, $sluggable, $menuId)
    {
        $config = WebConfig::query()->find(1);
        $menu = UserService::getMenuDetail($menuId);
        $parent = $menu['parent'];
        
        if(empty($menu['parent'])){
            $parent = $menu['menu'];
            $subMenu = $menu['subMenu'];
        } else {
            $subMenu = Menu::query()->where('menus.parent_id', $parent->id)->get(); 
        }
        $libs = Library::query()
        ->whereIn('library.menu_id', $menu['subMenuId'])
        ->orderBy('library.id', 'desc')
        ->paginate(config('constant.paginate'));

        $news = News::query()->get();
        $seo = [
            'title' => $menu['menu']->name,
            'keywords' => $menu['menu']->meta_keyword,
            'description' => $menu['menu']->meta_description,
        ];

        $param = [
            'menu' => $menu,
            'libs' => $libs,
            'config' => $config,
            'news' => $news,
            'seo' => $seo,
            'subMenu' => $subMenu
        ];

        return View('layouts.layout' . $config->layout . '.library.index', $param);
    }
    public function detail($sluggable, $libId)
    {
        $config = WebConfig::query()->find(1);

        $lib = Library::query()->where('library.id', $libId)->first();
        $menu = UserService::getMenuDetail($lib->menu_id);
        $parent = $menu['parent'];
        
        if(empty($menu['parent'])){
            $parent = $menu['menu'];
            $subMenu = $menu['subMenu'];
        } else{
            $subMenu = Menu::query()->where('menus.parent_id', $parent->id)->get();
        }
        $images = $lib->images['images'] ?? [];
        $lib_lienquan = Library::query()->where('library.id', '!=', $libId)->orderBy('library.id', 'desc')->paginate(9);
        $libLatest = Library::query()->orderBy('library.id', 'desc')->offset(0)->limit(10)->get();

        $seo = [
            'title' => $lib->name,
            'keywords' => $lib->meta_keyword,
            'description' => $lib->meta_description,
        ];
        $param = [
            'menu' => $menu,
            'config' => $config,
            'lib' => $lib,
            'images' => $images,
            'lib_lienquan' => $lib_lienquan,
            'libLatest' => $libLatest,
            'subMenu' => $subMenu,
            'seo' => $seo
        ];
        return View('layouts.layout' . $config->layout . '.library.detail', $param);
    }
}
