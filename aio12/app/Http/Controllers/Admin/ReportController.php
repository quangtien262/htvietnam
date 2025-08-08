<?php

namespace App\Http\Controllers\Admin;

use App\Models\Admin\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;

use App\Services\Admin\TblService;
use App\Models\Admin\Table;
use App\Models\Admin\HoaDon;

class ReportController extends Controller
{


    public function report_banHang(Request $request)
    {
        $tables = TblService::getAdminMenu(0);
        // $table = Table::find(236);

        $hoaDon = HoaDon::where('is_draft', '=', 0)->paginate(10);
        $viewData = [
            'tables'=>$tables,
            'hoaDon' =>$hoaDon
        ];
        // dd($hoaDon);
        return Inertia::render('Admin/Report/hoa_don', $viewData);
    }

    public function report_theDichVu(Request $request)
    {
        
    }

    public function report_khachHang(Request $request)
    {
        
    }

}
