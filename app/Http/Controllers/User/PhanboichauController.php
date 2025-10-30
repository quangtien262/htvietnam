<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\PBC\GiaoVien;
use App\Models\PBC\Review;
use App\Models\PBC\TuyenSinh;
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
use App\Services\User\NewsService;
use Illuminate\Support\Facades\Route;
use App\Models\Web\About;
use App\Models\Web\Landingpage;
use Illuminate\Support\Facades\Redirect;

class PhanboichauController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function giaoVien(Request $request, $sluggable, $menuId)
    {
        $config = WebConfig::query()->find(1);
        $giaoVien = GiaoVien::orderBy('sort_order', 'asc')->paginate(80);
        return View(
            'layouts.layout' . $config->layout . '.pages.giao_vien',
            compact('config', 'giaoVien')
        );
    }
    public function review(Request $request, $sluggable, $menuId)
    {
        $config = WebConfig::query()->find(1);
        $review = Review::orderBy('sort_order', 'desc')->paginate(20);
        return View(
            'layouts.layout' . $config->layout . '.pages.review',
            compact('config', 'review')
        );
    }
    public function sendTuyensinh(Request $request)
    {
        // dd($_POST);
        $fileFields = ['anh_6', 'anh_7', 'anh_8', 'anh_9', 'anh_chan_dung'];

        $data = [];

        // Xử lý các trường file
        foreach ($fileFields as $field) {
            $file = $request->file($field);

            if ($file) {
                $randomString = app('Helper')->generateRandomString(8);
                $fileName = $randomString . '_' . $file->getClientOriginalName();
                $file->move(public_path('/layouts/layout102/uploads/'), $fileName);
                $filePath = '/layouts/layout102/uploads/' . $fileName;
                $data[$field] = $filePath;
            }
        }

        // Xử lý các trường dữ liệu khác
        $data['ten_hoc_sinh'] = $request->input('ten_hoc_sinh');
        $data['ngay_sinh'] = $request->input('ngay_sinh');
        $data['gioi_tinh'] = $request->input('gioi_tinh');
        $data['ten_phu_huynh'] = $request->input('ten_phu_huynh');
        $data['sdt_phu_huynh'] = $request->input('sdt_phu_huynh');

        $data['dia_chi'] = $request->input('dia_chi');
        $data['truong_thcs'] = $request->input('truong_thcs');
        $data['ten_lop_9'] = $request->input('ten_lop_9');
        $data['hoc_luc_6'] = $request->input('hoc_luc_6');
        $data['hanh_kiem_6'] = $request->input('hanh_kiem_6');
        $data['hoc_luc_7'] = $request->input('hoc_luc_7');
        $data['hanh_kiem_7'] = $request->input('hanh_kiem_7');
        $data['hoc_luc_8'] = $request->input('hoc_luc_8');
        $data['hanh_kiem_8'] = $request->input('hanh_kiem_8');
        $data['hoc_luc_9'] = $request->input('hoc_luc_9');
        $data['hanh_kiem_9'] = $request->input('hanh_kiem_9');



        TuyenSinh::create($data);

        return $this->sendSuccessResponse([],'successfully');
    }


    public function search_pbc(Request $request)
    {
        $config = WebConfig::query()->find(1);
        $products = ProductService::search($request);
        $news = NewsService::search($request);
        return View('layouts.layout' . $config->layout . '.pages.search', compact('config', 'news',  'products',));
    }
}