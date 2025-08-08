<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\TaiSan;
use App\Models\Admin\TaiSanCapPhat;
use App\Services\Admin\TblService;
use Illuminate\Support\Facades\DB;

class TaiSanController extends Controller
{
    public function dashboard(Request $request)
    {
        $viewData = [];
        return Inertia::render('Admin/Dashboard/tai_san', $viewData);
    }

    public function index(Request $request)
    {
        $viewData = TblService::getDataIndexDefault('tai_san', $request, false, false);
        return Inertia::render('Admin/TaiSan/index', $viewData);
    }

    public function saveTaiSan(Request $rq)
    {
        $data = TblService::saveDataBasic('tai_san', $rq);

        // save log
        if (!empty($rq->id)) {
            $title = 'Đã sửa lại thông tin tài sản: ' . $data->name;
            $isNew = 0;
        } else {
            $title = 'Đã Tạo mới tài sản: ' . $data->name;
            $isNew = 1;
        }
        $infoCapPhat = [
            'titleLog' => $title
        ];
        TblService::saveLogColumn('tai_san', $data->id, '', $infoCapPhat,  $isNew, 'log_tai_san');

        return $this->sendSuccessResponse($data, 'success');
    }

    public function nhanBan(Request $rq)
    {
        $data = $rq->data;
        foreach ($rq->data as $data) {
            $taiSan = new TaiSan();
            $taiSan->name = $data['name'];
            $taiSan->kho_tai_san_id = $data['kho_tai_san_id']['id'];
            $taiSan->gia_mua = $data['gia_mua'];
            $taiSan->tai_san_status_id = $data['tai_san_status_id']['id'];
            $taiSan->tai_san_type_id = $data['tai_san_type_id']['id'];
            $taiSan->tai_san_status_used_id = 1; // 1: đang trong kho
            $taiSan->save();

            $dataId = TblService::formatNumberByLength($taiSan->id, 5);
            $taiSan->code = 'TS' . $dataId;
            $taiSan->save();

            $title = 'Đã nhân bản tài sản "' . $data->name . ' Từ tài sản có mã ' . $rq->ma_nhan_ban;
            $isNew = 1;
            $infoCapPhat = [
                'titleLog' => $title
            ];
            TblService::saveLogColumn('tai_san', $data->id, '', $infoCapPhat,  $isNew, 'log_tai_san');
        }

        return $this->sendSuccessResponse([], 'success');
    }

    /**
     * Summary of capPhat
     * @param \Illuminate\Http\Request $rq: 
     * $rq->name : tên col cần update, nhan_vien_id hoặc chi_nhanh_id
     * $rq->value : là value của $rq->name
     * $rq->note : là col note của bảng tai_san_cap_phat
     * $rq->tai_san_id : là col tai_san_id của bảng tai_san_cap_phat
     * @return \Illuminate\Http\JsonResponse
     */
    public function capPhat(Request $rq)
    {
        try {
            DB::beginTransaction();
            // save 2 tbl tai_san_cap_phat
            $capPhat = new TaiSanCapPhat();
            $capPhat->tai_san_id = $rq->tai_san_id;
            $capPhat->{$rq->name} = $rq->value;
            $capPhat->note = $rq->note;
            $capPhat->save();

            // update code 2 tbl tai_san_cap_phat
            $dataId = TblService::formatNumberByLength($capPhat->id, 5);
            $capPhat->code = 'TS' . $dataId;
            $capPhat->save();

            // update status bảng tai_san
            $taiSan = TaiSan::find($rq->tai_san_id);
            $taiSan->chi_nhanh_id = 0; // reset chi nhánh
            $taiSan->nhan_vien_id = 0; // reset nhân viên
            $taiSan->{$rq->name} = $rq->value; // lưu vào nhân viên hoặc chi nhánh
            $taiSan->tai_san_status_used_id = 2; //2: Đang sử dụng
            
            $taiSan->save();


            $user = \Auth::guard('admin_users')->user();

            // save log
            $infoCapPhat = [
                'titleLog' => 'Đã cấp phát tài sản "('  . $taiSan->code . ') ' . $taiSan->name . '" cho ' . $user->name,
            ];
            TblService::saveLogColumn('tai_san_cap_phat', $capPhat->id, '', $infoCapPhat,  1, 'log_tai_san');
            TblService::saveLogColumn('tai_san', $taiSan->id, '', $infoCapPhat,  1, 'log_tai_san');

            // commit
            DB::commit();
            return $this->sendSuccessResponse([], 'success');
        } catch (\Exception $e) {
            DB::rollBack(); //
            throw $e;
            return $this->sendErrorResponse([], 'error');
        }
    }
}
