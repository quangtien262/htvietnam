<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\AitilenInvoice;
use App\Models\Admin\AitilenInvoiceService;
use App\Models\Admin\AitilenService;
use App\Models\Admin\ChiNhanh;
use App\Models\Admin\Contract;
use App\Models\Admin\HoaDon;
use App\Models\Admin\NhanVienThucHien;
use App\Models\Admin\NhanVienTuVan;
use App\Models\Admin\Room;
use App\Models\AdminUser;
use App\Models\User;
use App\Services\Admin\TblService;

class AitilenController extends Controller
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

    public function invoiceList(Request $request)
    {
        $datas = AitilenInvoice::baseQuery()->paginate(220);
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
        $serviceDefault = AitilenService::where('is_invoice_default', 1)
            ->orderBy('sort_order', 'asc')->get()->toArray();
        //
        $props = [
            'searchData' => $request->all(),
            'datas' => $datas->items(),
            'pageConfig' => $pageConfig,
            'room' => $room,
            'contract' => $contract,
            'status' => $status,
            'service' => $service,
            'serviceDefault' => $serviceDefault,
        ];
        return Inertia::render('Admin/Aitilen/invoice', $props);
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
        $invoice->services = $request->services;

        if(!empty($request->room_id)) {
            $room = Room::find($request->room_id);
            if($room) {
                $invoice->apartment_id = $room->apartment_id;
                $invoice->room_id = $room->id;
            }
        }

        if(!empty($request->contract_id)) {
            $contract = Contract::find($request->contract_id);
            if($contract) {
                $invoice->contract_id = $contract->id;
                $invoice->user_id = $contract->user_id;
            }
        }

        $invoice->user_id = $request->user_id;

        $invoice->save();
        if (empty($request->id)) {
            $invoice->code = 'AHD' . str_pad($invoice->id, 6, '0', STR_PAD_LEFT);
        }
        // end save hoa don

        // save aitilen_invoice_service
        $invoiceServices = $request->services;
            // dd($invoiceServices);

        foreach ($invoiceServices as $service) {
            $invoiceService = new AitilenInvoiceService();
            $invoiceService->invoice_id = $invoice->id;
            $invoiceService->service_id = $service['id'];
            $invoiceService->price = $service['price_default'];
            $invoiceService->per = $service['per_default'];
            $invoiceService->so_nguoi = $request->so_nguoi;
            $invoiceService->total = $service['price_total'];
            $invoiceService->save();
        }

        return $this->sendSuccessResponse([], 'Cập nhật hóa đơn thành công!');
    }
}
