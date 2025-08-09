<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\CommonService;
use App\Services\User\UserService;

use App\Models\Web\Image;
use App\Models\Web\News;
use App\Models\Web\WebConfig;
use App\Models\Web\Menu;
use App\Models\Web\DoiTac;
use App\Models\Web\Product;
use App\Models\Web\BDS;
use App\Services\User\BDSService;
use App\Services\User\ProductService;
use App\Models\Web\About;
use App\Models\Web\Address;
use App\Models\Web\Landingpage;
use App\Models\Web\Page;
use App\Models\Web\QA;
use App\Services\User\NewsService;
use App\Services\User\VideoService;

class PagesController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        die();
        $config = WebConfig::query()->find(1);
        $langId = UserService::getLang();
        $images = Image::query()->orderBy('images.sort_order', 'asc')->get();
        $news = News::query()->orderBy('news.id', 'desc')->paginate(config('constant.item_of_pages'));
        $products = Product::query()->orderBy('products.id', 'desc')->paginate(config('constant.item_of_pages'));
        $bds = Bds::orderBy('id', 'desc')->paginate(9);
        $menu = Menu::query()->where('is_front', 1)->orderBy('menus.sort_order', 'asc')->get();
        $doiTac = DoiTac::orderBy('sort_order', 'asc')->get();
        $landingPage = Landingpage::query()->where('menu_id', 0)->orderBy('sort_order', 'asc')->get();
        $menuId = 0;
        return View(
            'layouts.layout' . $config->layout . '.pages.index',
            compact('config', 'images', 'news', 'products', 'menu', 'doiTac', 'landingPage', 'menuId')
        );
    }

    public function singlePage(Request $request, $sluggable, $menuId)
    {
        $config = WebConfig::query()->find(1);
        $langId = UserService::getLang();
        $menu = UserService::getMenuDetail($menuId);
        $seo = [
            'title' => $menu['menu']->name,
            'keywords' => $menu['menu']->meta_keyword,
            'description' => $menu['menu']->meta_description,
        ];

        if (count($menu['subMenuId']) > 1) {
            unset($menu['subMenuId'][0]);
            $menuData = Menu::query()->whereIn('menus.id', $menu['subMenuId'])->get();
            return View('layouts.layout' . $config->layout . '.pages.list', compact('menu','langId', 'config', 'seo','menuData'));
        }

        $menu = $menu['menu'];
        return View('layouts.layout' . $config->layout . '.pages.single_page', compact('config', 'menu', 'seo'));
    }

    public function pageList($menuId)
    {
        $config = WebConfig::query()->find(1);
        $menu = UserService::getMenuDetail($menuId);
        $menus = Menu::whereIn('menu_id', $menu['subMenuId'])->orderBy('id', 'desc')->paginate(config('constant.paginate'));
        $seo = [
            'title' => $menu['menu']->name,
            'keywords' => $menu['menu']->meta_keyword,
            'description' => $menu['menu']->meta_description,
        ];

        return View('layouts.layout' . $config->layout . '.page.list', compact('news', 'menu', 'config', 'seo'));
    }

    public function currentPage(Request $request, $sluggable, $pageId)
    {
        $config = WebConfig::query()->find(1);
        $langId = UserService::getLang();
        $page = Page::query()->where('id', $pageId)->first();
        $seo = [
            'title' => $page->name,
            'keywords' => $page->meta_keyword,
            'description' => $page->meta_description,
        ];

        return View('layouts.layout' . $config->layout . '.pages.current_page', compact('config', 'page', 'seo'));
    }

    public function services(Request $request, $sluggable, $menuId)
    {
        $config = WebConfig::query()->find(1);
        $menu = UserService::getMenuDetail($menuId);
        $seo = [
            'title' => $menu['menu']->name,
            'keywords' => $menu['menu']->meta_keyword,
            'description' => $menu['menu']->meta_description,
        ];
        if (count($menu['subMenuId']) > 1) {
            return View('layouts.layout' . $config->layout . '.pages.list', compact('menu', 'config', 'seo'));
        }
        $menu = $menu['menu'];
        return View('layouts.layout' . $config->layout . '.pages.single_page', compact('config', 'menu', 'seo'));
    }


    public function about(Request $request, $sluggable, $menuId)
    {
        $config = WebConfig::query()->find(1);
        $menu = About::find(1);
        $seo = [];
        if (!empty($menu)) {
            $seo = [
                'title' => $menu->name,
                'keywords' => $menu->meta_keyword,
                'description' => $menu->meta_description,
            ];
        }
        return View('layouts.layout' . $config->layout . '.pages.about', compact('config', 'menu', 'seo'));
    }

    public function search(Request $request)
    {
        $config = WebConfig::query()->find(1);
        $products = ProductService::search($request);
        $bds = BDSService::search($request);
        $videos = VideoService::search($request);
        $videos = NewsService::search($request);
        $seo = [
            'title' => !empty($request->keyword) ? $request->keyword : $config->title,
            'keywords' => $config->meta_keyword,
            'description' => $config->meta_description,
        ];
        return View('layouts.layout' . $config->layout . '.pages.search', compact('config',  'products', 'seo', 'bds','videos'));
    }


    public function landingpage(Request $request, $sluggable, $menuId = 0)
    {
        $config = WebConfig::query()->find(1);
        $landingPage = Landingpage::query()->where('menu_id', $menuId)->orderBy('sort_order', 'asc')->get();
        return View('layouts.layout' . $config->layout . '.landingpage.index', compact('config', 'landingPage', 'menuId'));
    }

    public function address(Request $request, $sluggable, $menuId)
    {
        $config = WebConfig::query()->find(1);
        $langId = UserService::getLang();
        $menu = UserService::getMenuDetail($menuId);
        $address = Address::query()->where('address.menu_id', $menuId)->paginate(config('constant.paginate'));
        $seo = [
            'title' => $menu['menu']->name,
            'keywords' => $menu['menu']->meta_keyword,
            'description' => $menu['menu']->meta_description,
        ];
        return View('layouts.layout' . $config->layout . '.address.index', compact('config', 'menu', 'seo'));
    }

    public function addressDetail(Request $request, $sluggable, $pageId)
    {
        $config = WebConfig::query()->find(1);
        $langId = UserService::getLang();
        $address = Address::query()->where('id', $pageId)->first();
        $seo = [
            'title' => $address->name,
            'keywords' => $address->meta_keyword,
            'description' => $address->meta_description,
        ];

        return View('layouts.layout' . $config->layout . '.address.detail', compact('config', 'address', 'seo'));
    }

    public function qa(Request $request, $sluggable, $menuId)
    {
        $config = WebConfig::query()->find(1);
        $langId = UserService::getLang();
        $menu = UserService::getMenuDetail($menuId);
        $qa = QA::query()->where('qa.menu_id', $menuId)->paginate(config('constant.paginate'));
        $seo = [
            'title' => $menu['menu']->name,
            'keywords' => $menu['menu']->meta_keyword,
            'description' => $menu['menu']->meta_description,
        ];
        return View('layouts.layout' . $config->layout . '.qa.index', compact('config', 'menu', 'seo', 'qa'));
    }

    public function qaDetail(Request $request, $sluggable, $qaId)
    {
        $config = WebConfig::query()->find(1);
        $langId = UserService::getLang();
        $qa = QA::query()->find($qaId);
        $seo = [
            'title' => $qa->name,
            'keywords' => $qa->meta_keyword,
            'description' => $qa->meta_description,
        ];

        return View('layouts.layout' . $config->layout . '.qa.detail', compact('config', 'qa', 'seo'));
    }
}
