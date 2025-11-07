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
    public function search(Request $request)
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
        $props = [
            'searchData' => $searchData,
            'datas' => $datas->items(),
            'pageConfig' => $pageConfig,
            'csrf_token' => csrf_token(),
            'p' => $request->p ?? 0,
        ];
        return $this->sendSuccessResponse($props);
    }
    public function indexBds(Request $request)
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
        $serviceDefault = AitilenService::where('is_contract_default', 1)
            ->orderBy('sort_order', 'asc')->get()->toArray();


        $users_db = User::select('id', 'name', 'username')->orderBy('id', 'desc')->get();
        $users_select = [];
        foreach ($users_db as $user) {
            $users_select[] = [
                'value' => $user->id . '',
                'label' => '[' . $user->id . ']' . $user->name,
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
        return $this->sendSuccessResponse($props);
    }

    private function ucwords_unicode($str)
    {
        return mb_convert_case($str, MB_CASE_TITLE, "UTF-8");
    }

    public function update(Request $request)
    {
        // save hợp đồng
        if (empty($request->id)) {
            $hopDong = new Contract();
        } else {
            $hopDong = Contract::find($request->id);
            if (!$hopDong) {
                return $this->sendErrorResponse('Hợp đồng không tồn tại !');
            }
        }
        $user = User::find($request->user_id);
        $hoTen = '';
        if (!empty($user)) {
            if (!empty($user->name)) {
                $hoTen = $this->ucwords_unicode($user->name);
            }
            $hopDong->user_id = $request->user_id;
            $hopDong->ho_ten = $hoTen;
            $hopDong->dob = $user->dob;
            $hopDong->phone = $user->phone;
            $hopDong->email = $user->email;
            $hopDong->cccd = $user->cccd;
            $hopDong->ngay_cap = $user->ngay_cap;
            $hopDong->noi_cap = $user->noi_cap;
            $hopDong->hktt = $user->hktt;
        }
        if (!empty($request->room_id)) {
            $room = Room::find($request->room_id);
            if ($room) {
                $hopDong->apartment_id = $room->apartment_id;
                $hopDong->room_id = $room->id;
                $hopDong->name = $hoTen . ' - ' . $room->name;
            }
        }


        $hopDong->gia_thue = $request->tien_phong;
        $hopDong->tien_coc = $request->tien_coc;

        $hopDong->contract_status_id = $request->contract_status_id;
        $hopDong->ngay_hen_dong_tien = $request->ngay_hen_dong_tien;
        $hopDong->so_nguoi = $request->so_nguoi;

        $hopDong->total = $request->total;
        $hopDong->total_service = $request->total_service;
        $hopDong->total_phi_co_dinh = $request->total_phi_co_dinh;

        $hopDong->end_date = $request->end_date;
        $hopDong->start_date = $request->start_date;


        // set create_by
        $adminUser = auth()->guard('admin_users')->user();
        $hopDong->create_by = $adminUser->id;
        $hopDong->save();
        if (empty($request->id)) {
            $hopDong->code = 'AHD' . str_pad($hopDong->id, 6, '0', STR_PAD_LEFT);
        }
        // end save hợp đồng

        // save hoa đon
        if (empty($hopDong->aitilen_invoice_id)) {
            $invoice = new AitilenInvoice();
        } else {
            $invoice = AitilenInvoice::find($hopDong->aitilen_invoice_id);
            if (!$invoice) {
                return $this->sendErrorResponse('Hóa đơn không tồn tại !');
            }
        }

        $invoice->name = $request->name;
        $invoice->aitilen_invoice_status_id = $request->aitilen_invoice_status_id;
        $invoice->ngay_hen_dong_tien = $request->start_date;
        $invoice->so_ngay_thue = $request->so_ngay_thue;
        $invoice->so_nguoi = $request->so_nguoi;

        // total
        $invoice->total = $request->total;

        // $invoice->services = $request->services;
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

        $hopDong->aitilen_invoice_id = $invoice->id;
        $hopDong->save();
        // end save hóa đơn

        $services = [];
        // save aitilen_invoice_service
        foreach ($request->services as $service) {
            // lưu thông tin dịch vụ
            $serInfo = AitilenService::find($service['id']);
            $services[] = [
                'id' => $service['id'],
                'service_id' => $service['id'],
                'name' => $serInfo->name,
                'code' => $serInfo->code,
                'so_nguoi'=> $request->so_nguoi,
                'per_default' => $service['per_default'],
                'price_default' => $service['price_default'],
                'price_total' => $service['price_total'],
            ];
            // save dịch vụ trong hợp đồng
            $contractService = new ContractService();
            $contractService->contract_id = $hopDong->id;
            $contractService->so_nguoi = $request->so_nguoi;
            $contractService->service_id = $service['id'];
            $contractService->price = $service['price_default'];
            $contractService->per = $service['per_default'];
            $contractService->total = $service['price_total'];
            $contractService->save();
            // save dịch vụ trong hóa đơn
            $invoiceService = new AitilenInvoiceService();
            $invoiceService->invoice_id = $invoice->id;
            $invoiceService->service_id = $service['id'];
            $invoiceService->price = $service['price_default'];
            $invoiceService->per = $service['per_default'];
            $invoiceService->so_nguoi = $request->so_nguoi;
            $invoiceService->total = $service['price_total'];
            $invoiceService->save();
        }
        // save dịch vụ vào hợp đồng, để phục vụ tối ưu cho hiển thị
        $hopDong->services = $services;
        $hopDong->save();

        $contract = Contract::baseQuery()->find($hopDong->id);

        return $this->sendSuccessResponse($contract, 'Cập nhật hóa đơn thành công!');
    }

    /**
     * fastEdit
     *
     * @param Request $request: id, column, value
     * @return void
     */
    function fastEdit(Request $request)
    {
        if (empty($request->id) || empty($request->column) || empty($request->value)) {
            return $this->sendErrorResponse('Dữ liệu truyền vào không hợp lệ !');
        }
        $data = Contract::find($request->id);
        if (!$data) {
            return $this->sendErrorResponse('Hợp đồng không tồn tại !');
        }
        $data->{$request->column} = $request->value;
        $data->save();

        return $this->sendSuccessResponse([], 'Cập nhật hợp đồng thành công!');
    }

    function delete(Request $request)
    {
        $ids = $request->ids;
        if (empty($ids) || !is_array($ids)) {
            return $this->sendErrorResponse('Dữ liệu truyền vào không hợp lệ !');
        }
        // update is_recycle_bin = 1
        Contract::whereIn('id', $ids)->update(['is_recycle_bin' => 1]);

        $contacts = Contract::getContract($request->searchData);

        return $this->sendSuccessResponse($contacts, 'Xóa hợp đồng thành công!');
    }
}
