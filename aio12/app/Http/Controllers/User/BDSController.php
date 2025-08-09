<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use App\Models\Web\BDS;
use App\Models\Web\Menu;
use App\Models\Web\News;
use App\Services\User\UserService;
use App\Services\User\BDSService;
use App\Models\Web\WebConfig;

class BDSController extends Controller
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
        $bds =BDS::where('menu_id', $menuId)->orderBy('id', 'asc')->paginate(config('constant.paginate'));
        $news = News::query()->orderBy('news.id', 'desc')->paginate(10);
        return View('layouts.layout' . $config->layout . '.bds.index', compact('config', 'bds', 'menu', 'news'));
    }


    public function detail(Request $request, $sluggable, $bdsId)
    {
        $config = WebConfig::query()->find(1);
        $bds = BDS::find($bdsId);
        $images = $bds->images;
        $menu = UserService::getMenuDetail($bds->menu_id);
        $bdsLatest =BDS::orderBy('id', 'asc')->paginate(config('constant.paginate'));
        return View('layouts.layout' . $config->layout . '.bds.detail', compact('config', 'bds', 'bdsLatest', 'menu', 'images'));
    }

    public function search(Request $request)
    {
        $viewData['config'] = app('Helper')->getConfig();
        $viewData = BDSService::getDataSearch($request, $viewData);
        return View('layouts.layout' . $viewData['config']->layout . '.bds.search', $viewData);
    }
}

