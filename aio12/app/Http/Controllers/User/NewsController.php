<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\CommonService;

use App\Models\Web\Image;
use App\Models\Web\News;
use App\Models\Web\Product;
use App\Models\Web\Menu;
use App\Services\User\UserService;
use App\Models\Web\WebConfig;
use App\Models\Web\Tags;
use Illuminate\Support\Facades\App;

class NewsController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, $sluggable, $menuId)
    {
        $config = WebConfig::query()->find(1);
        $menu = UserService::getMenuDetail($menuId);
        $news = News::query()->whereIn('news.menu_id', $menu['subMenuId'])
            ->orderBy('news.updated_at', 'desc')
            ->paginate(config('constant.paginate'));
        $seo = [
            'title' => $menu['menu']->name,
            'keywords' => $menu['menu']->meta_keyword,
            'description' => $menu['menu']->meta_description,
        ];
        $param = [
            'news' => $news,
            'menu' => $menu,
            'config' => $config,
            'seo' => $seo,
        ];
        return View('layouts.layout' . $config->layout . '.news.index', $param);
    }


    public function detail(Request $request, $sluggableNews, $newsId)
    {
        $config = WebConfig::query()->find(1);

        $news = News::query(false)->where('news.id', $newsId)->first();
        
        $menu = UserService::getMenuDetail($news->menu_id);
        
        $newsLatest = News::query()->where('news.id', '!=', $newsId)->orderBy('news.create_date', 'desc')->limit(10)->get();
        
        $seo = [
            'title' => $news->name,
            'keywords' => $news->meta_keyword,
            'description' => $news->meta_description,
        ];
        $param = [
            'news' => $news,
            'newsLatest' => $newsLatest,
            'menu' => $menu,
            'config' => $config,
            'seo' => $seo,
        ];
        return View('layouts.layout' . $config->layout . '.news.detail', $param);
    }



    public function tags(Request $request, $sluggable, $tagId)
    {
        $config = app('Helper')->getConfig();
        $viewData = [];
        $tags = Tags::find($tagId);
        $news = News::where('tags', 'like', '%'.$tags->name.'%')->orderBy('id', 'desc')->paginate(config('constant.paginate'));
        $products = Product::query()->orderBy('id', 'desc')->paginate(10);
        $seo = [
            'title' => $tags->name,
            'keywords' => $config->meta_keyword,
            'description' => $config->meta_description,
        ];
        return View('layouts.layout' . $config->layout . '.news.tags', compact('news', 'products', 'config', 'tags', 'seo'));
    }

}

