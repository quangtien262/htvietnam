<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

use App\Services\Admin\TblService;

class DemoController extends Controller
{
    public function dashboard(Request $request)
    {
        $viewData = [];
        return Inertia::render('Admin/Dashboard/demo', $viewData);
    }

    public function index(Request $request)
    {
        // truyền tên bảng tương ứng vào getDataIndexDefault
        $viewData = TblService::getDataIndexDefault('table_name', $request, false, false);

        return Inertia::render('Admin/Demo/index', $viewData);
    }

    public function saveTaiSan(Request $rq)
    { 
        // truyền tên bảng tương ứng vào saveDataBasic
        $data = TblService::saveDataBasic('table_name', $rq);

        return $this->sendSuccessResponse($data, 'success');
    }
}
