<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\AitilenInvoice;
use App\Models\Admin\AitilenInvoiceService;
use App\Models\Admin\AitilenService;
use App\Models\Admin\Contract;
use App\Models\Admin\ContractService;
use App\Models\Admin\Room;
use App\Models\AdminUser;
use App\Models\User;
use App\Services\Admin\TblService;

class ContractController extends Controller
{
    public function index(Request $request)
    {
        $searchData = $request->all();

        $datas = Contract::getContract($searchData);

        $pageConfig = [
            'currentPage' => $datas->currentPage(),
            'perPage' => $datas->perPage(),
            'total' => $datas->total(),
            'lastPage' => $datas->lastPage(),
            'count' => count($datas->items()),
        ];

        // select
        $room = TblService::formatData('room', []);
        $status = TblService::formatData('contract_status', []);
        $service = TblService::formatData('aitilen_service');
        $apm = TblService::formatData('apartment');
        $serviceDefault = AitilenService::where('is_invoice_default', 1)
            ->orderBy('sort_order', 'asc')->get()->toArray();


        $users_db = User::orderBy('id', 'desc')->get();
        $users_select = [];
        foreach ($users_db as $user) {
            $users_select[] = [
                'value' => $user->id . '',
                'label' => '[' . $user->code . ']' . $user->name . ' - ' . $user->created_at->format('d/m/Y'),
            ];
        }

        $props = [
            'searchData' => $searchData,
            'datas' => $datas->items(),
            'pageConfig' => $pageConfig,
            'room' => $room,
            'status' => $status,
            'service' => $service,
            'apm' => $apm,
            'serviceDefault' => $serviceDefault,
            'users' => $users_select,
            'csrf_token' => csrf_token(),
            'p' => $request->p ?? 0,
        ];
        return Inertia::render('Admin/Contract/index', $props);
    }

    private function ucwords_unicode($str)
    {
        return mb_convert_case($str, MB_CASE_TITLE, "UTF-8");
    }

    public function update(Request $request)
    {
        // save hoa don
        if (empty($request->id)) {
            $data = new Contract();
        } else {
            $data = Contract::find($request->id);
            if (!$data) {
                return $this->sendErrorResponse('Hợp đồng không tồn tại !');
            }
        }
        $user = User::find($request->user_id);
        $hoTen = '';
        if (!empty($user)) {
            if (!empty($user->name)) {
                $hoTen = $this->ucwords_unicode($user->name);
            }
            $data->user_id = $request->user_id;
            $data->ho_ten = $hoTen;
            $data->dob = $user->dob;
            $data->phone = $user->phone;
            $data->email = $user->email;
            $data->cccd = $user->cccd;
            $data->ngay_cap = $user->ngay_cap;
            $data->noi_cap = $user->noi_cap;
            $data->hktt = $user->hktt;
        }
        if (!empty($request->room_id)) {
            $room = Room::find($request->room_id);
            if ($room) {
                $data->apartment_id = $room->apartment_id;
                $data->room_id = $room->id;
                $data->name = $hoTen . ' - ' . $room->name;
            }
        }
        $data->contract_status_id = $request->contract_status_id;
        $data->ngay_hen_dong_tien = $request->ngay_hen_dong_tien;
        $data->so_nguoi = $request->so_nguoi;
        $data->total = $request->total;
        $data->services = $request->services;


        // set create_by
        $adminUser = auth()->guard('admin_users')->user();
        $data->create_by = $adminUser->id;
        $data->save();
        if (empty($request->id)) {
            $data->code = 'AHD' . str_pad($data->id, 6, '0', STR_PAD_LEFT);
        }
        // end save hợp đồng

        // save hoa đon
        if (empty($data->aitilen_invoice_id)) {
            $invoice = new AitilenInvoice();
        } else {
            $invoice = AitilenInvoice::find($data->aitilen_invoice_id);
            if (!$invoice) {
                return $this->sendErrorResponse('Hóa đơn không tồn tại !');
            }
        }

        $invoice->name = $request->name;
        $invoice->aitilen_invoice_status_id = $request->aitilen_invoice_status_id;
        $invoice->ngay_hen_dong_tien = $request->start_date;
        $invoice->so_ngay_thue = $request->so_ngay_thue;
        $invoice->so_nguoi = $request->so_nguoi;
        $invoice->total = $request->total;

        $invoice->services = $request->services;
        $invoice->tien_phong = $request->tien_phong;
        $invoice->tien_coc = $request->tien_coc;
        $invoice->tra_coc = $request->tra_coc;
        $invoice->giam_gia = $request->giam_gia;

        $date = \Carbon\Carbon::parse($request->start_date);
        $invoice->month = $date->format('m');
        $invoice->year = $date->format('Y');


        if ($user) {
            $invoice->user_id = $user->id;
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

        $data->aitilen_invoice_id = $invoice->id;
        $data->save();
        // end save hoa don


        // save aitilen_invoice_service
        $services = $request->services;
        foreach ($services as $service) {
            // save dịch vụ trong hợp đồng
            $invoiceService = new ContractService();
            $invoiceService->contract_id = $data->id;
            $invoiceService->service_id = $service['id'];
            $invoiceService->price = $service['price_default'];
            $invoiceService->per = $service['per_default'];
            $invoiceService->so_nguoi = $request->so_nguoi;
            $invoiceService->total = $service['price_total'];
            $invoiceService->save();

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
