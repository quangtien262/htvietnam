<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use App\Models\Web\Product;
use App\Models\Web\Menu;
use App\Models\Web\News;
use App\Models\Web\WebConfig;
use App\Services\User\UserService;
use App\Services\User\ProductService;

class ProductController extends Controller
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
        $subMenu = $menu['subMenu'];

        $products = Product::getProduct($menu, $request);
        
        $news = News::query()->get();
        $seo = [
            'title' => $menu['menu']->name,
            'keywords' => $menu['menu']->meta_keyword,
            'description' => $menu['menu']->meta_description,
        ];

        return View('layouts.layout' . $config->layout . '.product.index', compact('menu', 'products', 'config', 'news', 'seo','subMenu'));
    }


    public function detail($sluggable, $productId)
    {
        $config = WebConfig::query()->find(1);
        $product = Product::query(false)->where('products.id', $productId)->first();
        $menu = UserService::getMenuDetail($product->menu_id);
        $subMenu = $menu['subMenu'];
        $fullUrl = \URL::current();
        $images = $product->images;
        $product_lienquan = Product::query()->where('products.id', '!=', $productId)->orderBy('products.create_date', 'desc')->paginate(9);
        $productLatest = Product::query()->limit(10)->get();

        $seo = [
            'title' => $product->name,
            'keywords' => $product->meta_keyword,
            'description' => $product->meta_description,
        ];
        return View('layouts.layout' . $config->layout . '.product.detail', compact('fullUrl','config', 'product', 'menu','subMenu', 'images', 'product_lienquan', 'productLatest', 'seo'));
    }

    public function search(Request $request)
    {
        $config = WebConfig::query()->find(1);
        $viewData['config'] = $config;
        $viewData['products'] = ProductService::getDataSearch($request, $viewData);
        $seo = [
            'title' => !empty($request->keyword) ? $request->keyword : $config->title,
            'keywords' => $config->meta_keyword,
            'description' => $config->meta_description,
        ];
        $viewData['seo'] = $seo;

        return View('layouts.layout' . $config->layout . '.product.search', $viewData);
    }

    public function all(Request $request)
    {
        $config = WebConfig::query()->find(1);
        $viewData['config'] = $config;
        $viewData['products'] = Product::paginate(config('constant.paginate'));
        $seo = [
            'title' => !empty($request->keyword) ? $request->keyword : $config->title,
            'keywords' => $config->meta_keyword,
            'description' => $config->meta_description,
        ];
        $viewData['seo'] = $seo;

        return View('layouts.layout' . $config->layout . '.product.all', $viewData);
    }

    public function productLatest(Request $request)
    {
        $config = WebConfig::query()->find(1);
        $viewData['config'] = $config;
        $viewData['products'] = Product::orderBy('updated_at', 'desc')->paginate(config('constant.paginate'));
        $seo = [
            'title' => !empty($request->keyword) ? $request->keyword : $config->title,
            'keywords' => $config->meta_keyword,
            'description' => $config->meta_description,
        ];
        $viewData['seo'] = $seo;

        return View('layouts.layout' . $config->layout . '.product.all', $viewData);
    }

    public function promotion(Request $request)
    {
        $config = WebConfig::query()->find(1);
        $viewData['config'] = $config;
        $viewData['products'] = Product::where('promo_price', '>', 0)->orderBy('updated_at', 'desc')->paginate(config('constant.paginate'));
        $seo = [
            'title' => !empty($request->keyword) ? $request->keyword : $config->title,
            'keywords' => $config->meta_keyword,
            'description' => $config->meta_description,
        ];
        $viewData['seo'] = $seo;

        return View('layouts.layout' . $config->layout . '.product.all', $viewData);
    }

    public function productHot(Request $request)
    {
        $config = WebConfig::query()->find(1);
        $viewData['config'] = $config;
        $viewData['products'] = Product::orderBy('updated_at', 'desc')->paginate(config('constant.paginate'));
        $seo = [
            'title' => !empty($request->keyword) ? $request->keyword : $config->title,
            'keywords' => $config->meta_keyword,
            'description' => $config->meta_description,
        ];
        $viewData['seo'] = $seo;

        return View('layouts.layout' . $config->layout . '.product.all', $viewData);
    }
}
