<?php

namespace App\Http\Controllers\Admin;

use App\Casts\LeftJoin;
use App\Models\Admin\ContractService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\AitilenDienNuoc;
use App\Models\Admin\AitilenInvoice;
use App\Models\Admin\AitilenInvoiceService;
use App\Models\Admin\AitilenService;
use App\Models\Admin\ChiNhanh;
use App\Models\Admin\Contract;
use App\Models\Admin\HoaDon;
use App\Models\Admin\NhanVienThucHien;
use App\Models\Admin\NhanVienTuVan;
use App\Models\Admin\Room;
use App\Models\Admin\SoQuy;
use App\Models\AdminUser;
use App\Models\User;
use App\Services\Admin\TblService;

class AitilenReportController extends Controller
{
    public function tongLoiNhuan(Request $request)
    {
        $result = [];
        return $this->sendSuccessResponse($result);
    }

    public function loiNhuanTheoTienPhong(Request $request)
    {
        $result = [];
        return $this->sendSuccessResponse($result);
    }

    public function loiNhuanTheoDichVu(Request $request)
    {
        $result = [];
        return $this->sendSuccessResponse($result);
    }

    public function baoCaoThuChi(Request $request)
    {
        $result = [];
        return $this->sendSuccessResponse($result);
    }

    public function baoCaoCongNo(Request $request)
    {
        $result = [];
        return $this->sendSuccessResponse($result);
    }

    public function baoCaoTaiSan(Request $request)
    {
        $result = [];
        return $this->sendSuccessResponse($result);
    }
}
