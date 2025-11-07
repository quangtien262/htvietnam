<?php

namespace App\Http\Controllers\Admin;

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
use Illuminate\Support\Facades\DB;

class AitilenInvoiceController extends Controller
{
    public function dashboard(Request $request)
    {
        $soLuongSPTheoLoai = [];


        $chiNhanh = ChiNhanh::where('chi_nhanh_status_id', 1)->get();
        $nhanVien = AdminUser::where('admin_user_status_id', 1)->get();

        // tính tổng doanh thu trong 7 ngày gần nhất

        if (empty($request->khoangThoiGian)) {
            // mặc định là khoảng thời gian 7 ngày gần nhất
            $khoangThoiGian = [now()->subDays(7)->startOfDay()->format('Y-m-d H:i:s'), now()->endOfDay()->format('Y-m-d H:i:s')];
        } else {
            $khoangThoiGian = $request->khoangThoiGian;
        }

        $props = [
            'soLuongSPTheoLoai' => $soLuongSPTheoLoai,
            'chiNhanh' => $chiNhanh,
            'nhanVien' => $nhanVien,
            'khoangThoiGian' => $khoangThoiGian,
        ];
        return Inertia::render('Admin/Dashboard/sales', $props);
    }

    public function searchApi_bds(Request $request)
    {
        $searchData = $request->all();
        $datas = AitilenInvoice::getInvoice($searchData);

        $pageConfig = [
            'currentPage' => $datas->currentPage(),
            'perPage' => $datas->perPage(),
            'total' => $datas->total(),
            'lastPage' => $datas->lastPage(),
            'count' => count($datas->items()),
        ];
        $props = [
            'datas' => $datas->items(),
            'pageConfig' => $pageConfig,
            'csrf_token' => csrf_token(),
            'p' => $request->p ?? 0,
        ];

        return $this->sendSuccessResponse($props, 'successfully');
    }

    public function indexApi_bds(Request $request)
    {
        $searchData = $request->all();

        // mặc định tháng năm hiện tại
        if (empty($request->month)) {
            $searchData['month'] = now()->month;
        }
        if (empty($request->year)) {
            $searchData['year'] = now()->year;
        }
        // status mặc định là chua thanh toán
        if (empty($request->status)) {
            $searchData['status'] = '2';
        }

        $datas = AitilenInvoice::getInvoice($searchData);

        $pageConfig = [
            'currentPage' => $datas->currentPage(),
            'perPage' => $datas->perPage(),
            'total' => $datas->total(),
            'lastPage' => $datas->lastPage(),
            'count' => count($datas->items()),
        ];

        // select
        $room = TblService::formatData('room', ['room_status_id' => 1]);
        $contract = TblService::formatData('contract', ['contract_status_id' => 1]);
        $status = TblService::formatData('aitilen_invoice_status', []);
        $service = TblService::formatData('aitilen_service');
        $apm = TblService::formatData('apartment');
        $serviceDefault = AitilenService::where('is_invoice_default', 1)
            ->orderBy('sort_order', 'asc')->get()->toArray();
        //
        $props = [
            'searchData' => $searchData,
            'datas' => $datas->items(),
            'pageConfig' => $pageConfig,
            'room' => $room,
            'contract' => $contract,
            'status' => $status,
            'service' => $service,
            'apm' => $apm,
            'serviceDefault' => $serviceDefault,
            'csrf_token' => csrf_token(),
            'p' => $request->p ?? 0,
        ];

        return $this->sendSuccessResponse($props, 'successfully');
    }

    public function updateInvoice(Request $request)
    {
        // save hoa don
        if (empty($request->id)) {
            $invoice = new AitilenInvoice();
        } else {
            $invoice = AitilenInvoice::find($request->id);
            if (!$invoice) {
                return $this->sendErrorResponse('Hóa đơn không tồn tại !');
            }
        }

        $invoice->name = $request->name;
        $invoice->aitilen_invoice_status_id = $request->aitilen_invoice_status_id;
        $invoice->ngay_hen_dong_tien = $request->ngay_hen_dong_tien;
        $invoice->so_ngay_thue = $request->so_ngay_thue;
        $invoice->so_nguoi = $request->so_nguoi;
        $invoice->total = $request->total;
        $invoice->month = $request->month;
        $invoice->year = $request->year;
        $invoice->services = $request->services;
        $invoice->tien_phong = $request->tien_phong;
        $invoice->tien_coc = $request->tien_coc;
        $invoice->tra_coc = $request->tra_coc;
        $invoice->giam_gia = $request->giam_gia;

        if (!empty($request->contract_id)) {
            $contract = Contract::find($request->contract_id);
            if ($contract) {
                $invoice->contract_id = $contract->id;
                $invoice->user_id = $contract->user_id;
            }
        }

        if (!empty($request->room_id)) {
            $room = Room::find($request->room_id);
            if ($room) {
                $invoice->apartment_id = $room->apartment_id;
                $invoice->room_id = $room->id;
            }
        }
        // set create_by
        $adminUser = auth()->guard('admin_users')->user();
        $invoice->create_by = $adminUser->id;

        $invoice->save();
        if (empty($invoice->code)) {
            $invoice->code = 'AHD' . str_pad($invoice->id, 5, '0', STR_PAD_LEFT);
            $invoice->save();
        }
        // end save hoa don

        // Xóa dịch vụ cũ trước khi thêm mới (tránh duplicate)
        AitilenInvoiceService::where('invoice_id', $invoice->id)->delete();

        // save aitilen_invoice_service
        $invoiceServices = $request->services;
        // dd($invoiceServices);
        foreach ($invoiceServices as $service) {
            $invoiceService = new AitilenInvoiceService();
            $invoiceService->invoice_id = $invoice->id;
            $invoiceService->service_id = $service['aitilen_service_id'] ?? null;
            $invoiceService->price = $service['price_default'];
            $invoiceService->per = $service['per_default'];
            $invoiceService->so_nguoi = $request->so_nguoi;
            $invoiceService->total = $service['price_total'];
            $invoiceService->save();
        }

        return $this->sendSuccessResponse([], 'Cập nhật hóa đơn thành công!');
    }

    public function changeInvoiceStatus(Request $request)
    {
        $invoice = AitilenInvoice::find($request->id);
        if (!$invoice) {
            return $this->sendErrorResponse('Hóa đơn không tồn tại !');
        }
        // update status
        $invoice->aitilen_invoice_status_id = $request->status_id;
        $invoice->save();
        // update sổ quỹ
        SoQuy::saveSoQuy_hoaDonAitilen($invoice);
        return $this->sendSuccessResponse($invoice, 'Cập nhật trạng thái hóa đơn thành công!');
    }
    public function dienNuoc(Request $request)
    {

        $searchData = $request->all();
        $searchData['month'] = date('m');
        if (!empty($request->month)) {
            $searchData['month'] = $request->month;
        }

        $searchData['year'] = date('Y');
        if (!empty($request->year)) {
            $searchData['year'] =  $request->year;
        }
        $datas = AitilenDienNuoc::getDatas($searchData);

        $room = TblService::formatData('room', ['room_status_id' => 1]);
        $apm = TblService::formatData('apartment');

        $pageConfig = [
            'currentPage' => $datas->currentPage(),
            'perPage' => $datas->perPage(),
            'total' => $datas->total(),
            'lastPage' => $datas->lastPage(),
            'count' => count($datas->items()),
        ];

        $props = [
            'searchData' => $searchData,
            'datas' => $datas->items(),
            'room' => $room,
            'apm' => $apm,
            'csrf_token' => csrf_token(),
            'p' => $request->p ?? 0,
            'pageConfig' => $pageConfig,
        ];
        return Inertia::render('Admin/Aitilen/dien_nuoc', $props);
    }

    function saveDienNuoc(Request $request)
    {
        if (empty($request->month) || empty($request->year)) {
            return $this->sendErrorResponse('Chưa chọn tháng/năm!');
        }
        $datas = $request->datas;

        foreach ($datas as $data) {
            if (empty($data['room_id'])) {
                continue;
            }
            if (empty($data['id'])) {
                $dienNuoc = new AitilenDienNuoc();
            } else {
                $dienNuoc = AitilenDienNuoc::find($data['id']);
                if (!$dienNuoc) {
                    $dienNuoc = new AitilenDienNuoc();
                }
            }
            $room = Room::find($data['room_id']);
            if (!$room) {
                continue;
            }
            $dienNuoc->year = $request->year;
            $dienNuoc->month = $request->month;
            $dienNuoc->apartment_id = $room->apartment_id;
            $dienNuoc->room_id = $data['room_id'] ?? null;

            $dienNuoc->dien_start = $data['dien_start'] ?? null;
            $dienNuoc->dien_end = $data['dien_end'] ?? null;

            $dienNuoc->nuoc_start = $data['nuoc_start'] ?? null;
            $dienNuoc->nuoc_end = $data['nuoc_end'] ?? null;

            $dienNuoc->nonglanh_start = $data['nonglanh_start'] ?? null;
            $dienNuoc->nonglanh_end = $data['nonglanh_end'] ?? null;

            $dienNuoc->maybom_start = $data['maybom_start'] ?? null;
            $dienNuoc->maybom_end = $data['maybom_end'] ?? null;

            $dienNuoc->save();
        }
        return $this->sendSuccessResponse([], 'Lưu dữ liệu thành công!');
    }

    public function deleteDienNuoc(Request $request)
    {
        if (empty($request->ids)) {
            return $this->sendErrorResponse('Dữ liệu không tồn tại!');
        }
        foreach ($request->ids as $id) {
            $dienNuoc = AitilenDienNuoc::find($id);
            if ($dienNuoc) {
                $dienNuoc->is_recycle_bin = 1;
                $dienNuoc->save();
            }
        }
        return $this->sendSuccessResponse([], 'Xóa dữ liệu thành công!');
    }

    public function fastEditDienNuoc(Request $request)
    {
        if (empty($request->id) || empty($request->field) || !isset($request->value)) {
            return $this->sendErrorResponse('Dữ liệu không hợp lệ');
        }
        $dienNuoc = AitilenDienNuoc::find($request->id);
        if (!$dienNuoc) {
            return $this->sendErrorResponse('Dữ liệu không tồn tại!');
        }
        $field = $request->field;
        $value = $request->value;

        if (!in_array($field, [
            'room_id',
            'dien_start',
            'dien_end',
            'nuoc_start',
            'nuoc_end',
            'nonglanh_start',
            'nonglanh_end',
            'maybom_start',
            'maybom_end',
        ])) {
            return $this->sendErrorResponse('Trường dữ liệu không hợp lệ!');
        }

        $dienNuoc->{$field} = $value;
        $dienNuoc->save();

        return $this->sendSuccessResponse($dienNuoc, 'Cập nhật dữ liệu thành công!');
    }

    public function deleteInvoice(Request $request) {
        if (empty($request->ids)) {
            return $this->sendErrorResponse('Dữ liệu không hợp lệ');
        }
        foreach ($request->ids as $id) {
            $invoice = AitilenInvoice::find($id);
            if ($invoice) {
                $invoice->is_recycle_bin = 1;
                $invoice->save();
            }
        }

        $datas = AitilenInvoice::getInvoice($request->searchData ?? []);
        $pageConfig = [
            'currentPage' => $datas->currentPage(),
            'perPage' => $datas->perPage(),
            'total' => $datas->total(),
            'lastPage' => $datas->lastPage(),
            'count' => count($datas->items()),
        ];
        $props = [
            'datas' => $datas->items(),
            'pageConfig' => $pageConfig,
        ];

        return $this->sendSuccessResponse($props, 'successfully');
    }

    public function activeCurrentInvoice(Request $request) {
        if (empty($request->ids)) {
            return $this->sendErrorResponse('Dữ liệu không hợp lệ');
        }
        // update is_active = 1 cho các hóa đơn được chọn
        DB::table('aitilen_invoice')
            ->whereIn('id', $request->ids)
            ->update(['is_active' => 1]);

        $datas = AitilenInvoice::getInvoice($request->searchData ?? []);
        $pageConfig = [
            'currentPage' => $datas->currentPage(),
            'perPage' => $datas->perPage(),
            'total' => $datas->total(),
            'lastPage' => $datas->lastPage(),
            'count' => count($datas->items()),
        ];
        $props = [
            'datas' => $datas->items(),
            'pageConfig' => $pageConfig,
        ];

        return $this->sendSuccessResponse($props, 'successfully');
    }

    public function activeAllInvoice(Request $request) {
        DB::table('aitilen_invoice')
            ->where('month', $request->month)
            ->where('year', $request->year)
            ->update(['is_active' => 1]);

        $datas = AitilenInvoice::getInvoice($request->searchData ?? []);
        $pageConfig = [
            'currentPage' => $datas->currentPage(),
            'perPage' => $datas->perPage(),
            'total' => $datas->total(),
            'lastPage' => $datas->lastPage(),
            'count' => count($datas->items()),
        ];
        $props = [
            'datas' => $datas->items(),
            'pageConfig' => $pageConfig,
        ];

        return $this->sendSuccessResponse($props, 'successfully');
    }
}
