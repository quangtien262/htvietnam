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
        $products = Product::getProduct($menu, $request);
        $seo = [
            'title' => $menu['menu']->name,
            'keywords' => $menu['menu']->meta_keyword,
            'description' => $menu['menu']->meta_description,
        ];
        $param = [
            'products' => $products,
            'menu' => $menu,
            'config' => $config,
            'seo' => $seo,
        ];
        return View('layouts.layout' . $config->layout . '.product.index', $param);
    }


    public function detail($sluggable, $productId)
    {
        $config = WebConfig::query()->find(1);
        $product = Product::query(false)->where('products.id', $productId)->first();
        $menu = UserService::getMenuDetail($product->menu_id);
        $subMenu = $menu['subMenu'];
        $images = [];
        if (!empty($product->images) && !empty($product->images['images'])) {
            $images = $product->images['images'];
        }
        $product_lienquan = Product::query()->where('products.id', '!=', $productId)
            ->orderBy('products.updated_at', 'desc')
            ->paginate(9);
        $productLatest = Product::query()->limit(10)->get();

        $seo =
            $param = [
                'config' => $config,
                'product' => $product,
                'menu' => $menu,
                'subMenu' => $subMenu,
                'images' => $images,
                'product_lienquan' => $product_lienquan,
                'productLatest' => $productLatest,
                'seo' => [
                    'title' => $product->name,
                    'keywords' => $product->meta_keyword,
                    'description' => $product->meta_description,
                ]
            ];
        return View('layouts.layout' . $config->layout . '.product.detail', $param);
    }

    public function search(Request $request)
    {
        $config = WebConfig::query()->find(1);

        $viewData['config'] = $config;
        $products = Product::query();

        if (!empty($request->keyword)) {
            $products = $products->where('name', 'like', '%' . $request->keyword . '%');
        }

        $products = $products->paginate(config('constant.paginate'));

        $seo = [
            'title' => !empty($request->keyword) ? $request->keyword : $config->title,
            'keywords' => $config->meta_keyword,
            'description' => $config->meta_description,
        ];
        $viewData['seo'] = $seo;
        $viewData['products'] = $products;

        return View('layouts.layout' . $config->layout . '.product.index', $viewData);
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

    public function download(Request $request, $id = 0)
    {
        if(empty($id)) {
            return $this->sendErrorResponse('Sản phẩm không tồn tại');
        }
        $product = Product::find($id);
        if (!$product) {
            return $this->sendErrorResponse('Sản phẩm không có file để tải về');
        }
        if(empty($product->file)) {
            return $this->sendErrorResponse('Sản phẩm không có file để tải về');
        }

        // code download file
        return response()->download(public_path($product->file));
    }
}
