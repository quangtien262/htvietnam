<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Web\Menu;
use App\Models\Web\News;
use App\Models\Web\Product;
use App\Models\Web\Video;
use App\Services\User\UserService;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    public function index(Request $request, $sluggable, $menuId)
    {
        $config = app('Helper')->getConfig();
        $menu = UserService::getMenuDetail($menuId);
        $parent = $menu['parent'];
        
        if(empty($menu['parent'])){
            $parent = $menu['menu'];
            $subMenu = $menu['subMenu'];
        } else {
            $subMenu = Menu::query()->where('menus.parent_id', $parent->id)->get(); 
        }
        $videos = Video::query()
        ->whereIn('video.menu_id', $menu['subMenuId'])
        ->orderBy('video.id', 'desc')
        ->paginate(config('constant.paginate'));

        if ($config->layout == 89 && count($videos) == 1) {
            $linkVideo = app('Helper')->getLinkVideo($videos[0]);
            return redirect( $linkVideo);
        }
        $news = News::query()->get();
        $seo = [
            'title' => $menu['menu']->name,
            'keywords' => $menu['menu']->meta_keyword,
            'description' => $menu['menu']->meta_description,
        ];

        return View('layouts.layout' . $config->layout . '.video.index', compact('menu', 'videos', 'config', 'news', 'seo','subMenu'));
    }
    public function detail($sluggable, $VideoId)
    {
        $config = app('Helper')->getConfig();
        
        $video = Video::query(false)->where('video.id', $VideoId)->first();
        $menu = UserService::getMenuDetail($video->menu_id);
        $parent = $menu['parent'];
        
        if(empty($menu['parent'])){
            $parent = $menu['menu'];
            $subMenu = $menu['subMenu'];
        } else{
            $subMenu = Menu::query()->where('menus.parent_id', $parent->id)->get();
        }
        $fullUrl = \URL::current();
        $images = $video->images;
        $video_lienquan = Video::query()->where('video.id', '!=', $VideoId)->orderBy('video.create_date', 'desc')->paginate(9);
        $videoLatest = Video::query()->orderBy('id', 'desc')->offset(0)->limit(10)->get();

        $seo = [
            'title' => $video->name,
            'keywords' => $video->meta_keyword,
            'description' => $video->meta_description,
        ];
        return View('layouts.layout' . $config->layout . '.video.detail', compact('fullUrl','config', 'video', 'menu','subMenu', 'images', 'video_lienquan', 'videoLatest', 'seo'));
    }
}
