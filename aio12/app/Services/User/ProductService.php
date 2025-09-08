<?php

namespace App\Services\User;

use Illuminate\Support\Facades\DB;
use App\Services\Service;

use App\Models\Web\Menu;
use App\Models\Web\Product;
use App\Models\Web\Image;
use App\Models\Web\News;

/**
 * Class CompanyService
 * @package App\Services\Users
 */
class ProductService extends Service
{

    static function search($request) {
        $products = new Product();

        $products = $products->orderBy('id', 'desc');

        // if(!empty($request->bds)) {
        //     $products = $products->whereIn('menu_id', $request->name);
        // }

        // if(!empty($request->tinh_thanh)) {
        //     $products = $products->whereIn('province_id', $request->tinh_thanh);
        // }

        // if(!empty($request->bds_type)) {
        //     $products = $products->whereIn('bds_type_id', $request->bds_type);
        // }

        if(!empty($request->keyword)) {
            $products = $products->where('name', 'like', '%'.$request->keyword.'%');
        }

        $products = $products->paginate(8);
        $data['products'] = $products;
        $data['news'] = News::orderBy('id', 'desc')->paginate(10);
        return $products;
    }
}
