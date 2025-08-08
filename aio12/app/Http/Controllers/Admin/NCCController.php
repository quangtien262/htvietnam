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
use App\Models\Admin\NhaCungCap;
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
use App\Services\Admin\CardClass;
use App\Services\Admin\HimalayaService;
use Illuminate\Support\Facades\Auth;

class NCCController extends Controller
{
    public function index(Request $request)
    {
        $viewData = TblService::getDataIndexDefault('nha_cung_cap', $request);

        return Inertia::render('Admin/NhaCungCap/index', $viewData);
    }

    public function save(Request $rq)
    {
        if(empty($rq->id)) {
            $data = new NhaCungCap();
        } else {
            $data = NhaCungCap::find($rq->id);
        }

        $data->name = $rq->name;
        $data->code = !empty($rq->code) ? $rq->code : '';
        $data->tax_code = !empty($rq->tax_code) ? $rq->tax_code : '';
        $data->phone = !empty($rq->phone) ? $rq->phone : '';
        $data->user_contact = !empty($rq->user_contact) ? $rq->user_contact : '';
        $data->nha_cung_cap_status_id = !empty($rq->nha_cung_cap_status_id) ? $rq->nha_cung_cap_status_id : '';
        $data->email = !empty($rq->email) ? $rq->email : '';
        $data->address = !empty($rq->address) ? $rq->address : '';
        $data->link_web = !empty($rq->link_web) ? $rq->link_web : '';
        $data->note = !empty($rq->note) ? $rq->note : '';
        $data->create_by = Auth::guard('admin_users')->user()->id;

        $data->save();

        if(empty($rq->code)) {
            $data->code = 'NCC' . TblService::formatNumberByLength($data->id, 5);
            $data->save();
        }

        return $this->sendSuccessResponse($data, 'success');
    }
    public function detail(Request $rq)
    {
        $data = NhaCungCap::getNhaCungCapInfo($rq->id);
        return $this->sendSuccessResponse($data);
    }
}

