<?php

namespace App\Http\Controllers\Admin;

use App\Models\Admin\NhapHangDetail;
use App\Models\Admin\Product;
use App\Models\Admin\TraHangNCC;
use App\Models\Admin\XuatHuy;
use App\Models\Admin\XuatHuyDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\ChiNhanh;
use App\Models\Admin\Column;
use App\Models\Admin\KhachTraHang;
use App\Models\Admin\KhachTraHangDetail;
use App\Models\Admin\KiemKho;
use App\Models\Admin\KiemKhoDetail;
use App\Models\Admin\NhapHang;
use App\Models\Admin\PhieuChi;
use App\Models\Admin\PhieuThu;
use App\Models\Admin\SoQuy;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;

use App\Services\Admin\TblService;
use App\Models\Admin\Table;
use App\Models\Admin\TraHangNCCDetail;
use App\Models\AdminUser;
use App\Models\User;
use App\Services\Admin\HimalayaService;
use Illuminate\Support\Facades\Auth;

class KhachHangController extends Controller
{
    
    public function info(Request $request, $id)
    {
        $khachHang = User::find($id);
        return $khachHang;
    }

}

