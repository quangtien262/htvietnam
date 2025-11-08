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
use Illuminate\Support\Facades\Log;

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

        // xóa dịch vụ cũ trước khi thêm mới (tránh duplicate)
        ContractService::where('contract_id', $hopDong->id)->delete();

        // save aitilen_invoice_service
        $services = [];
        foreach ($request->services as $service) {
            // lưu thông tin dịch vụ
            $serInfo = AitilenService::find($service['id']);
            $services[] = [
                'id' => $service['id'],
                'service_id' => $service['id'],
                'name' => $serInfo->name,
                'code' => $serInfo->code,
                'so_nguoi' => $request->so_nguoi,
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
        }
        // save dịch vụ vào hợp đồng, để phục vụ tối ưu cho hiển thị
        $hopDong->services = $services;
        $hopDong->save();

        $contract = Contract::baseQuery()->find($hopDong->id);

        return $this->sendSuccessResponse($contract, 'Cập nhật hóa đơn thành công!');
    }

    function createFirstInvoiceByContract(Request $request)
    {
        $contract = Contract::find($request->contract_id);
        if (!$contract) {
            return $this->sendErrorResponse('Hợp đồng không tồn tại !');
        }
        // tạo hóa đơn từ hợp đồng
        $soNguoi = $contract->so_nguoi ?? 0;
        $invoice = new AitilenInvoice();
        $invoice->name = $contract->name;
        $invoice->user_id = $contract->user_id;
        $invoice->room_id = $contract->room_id;
        $invoice->apartment_id = $contract->apartment_id;
        $invoice->tien_coc = $contract->tien_coc;
        $invoice->so_nguoi = $soNguoi;
        $invoice->ngay_hen_dong_tien = $contract->start_date;
        $invoice->aitilen_invoice_status_id = 2; // mặc định là chưa thanh toán
        $date = \Carbon\Carbon::parse($contract->start_date);
        $invoice->month = $date->format('m');
        $invoice->year = $date->format('Y');
        // set create_by
        $adminUser = auth()->guard('admin_users')->user();
        $invoice->create_by = $adminUser->id;
        $invoice->save();
        $invoice->code = 'AHD' . str_pad($invoice->id, 5, '0', STR_PAD_LEFT);
        $invoice->save();

        // cập nhật lại hợp đồng
        $contract->aitilen_invoice_id = $invoice->id;
        $contract->save();


        //
        foreach ($request->services as $service) {
            // lưu thông tin dịch vụ
            $serInfo = AitilenService::find($service['id']);
            $services[] = [
                'id' => $service['id'],
                'service_id' => $service['id'],
                'name' => $serInfo->name,
                'code' => $serInfo->code,
                'so_nguoi' => $request->so_nguoi,
                'per_default' => $service['per_default'],
                'price_default' => $service['price_default'],
                'price_total' => $service['price_total'],
            ];

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
        $invoice->services = $services;
        $invoice->save();
        return $this->sendSuccessResponse([], 'Tạo hóa đơn từ hợp đồng thành công!');
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

    public function getContractStatistics(Request $request)
    {
        try {
            // Lấy điều kiện search từ request
            $searchData = $request->searchData ?? [];

            // Build query
            $query = Contract::query();

            // Filter theo status
            if (!empty($searchData['status'])) {
                $query->where('contract_status_id', $searchData['status']);
            }

            // Filter theo room_id
            if (!empty($searchData['room_id'])) {
                $query->where('room_id', $searchData['room_id']);
            }

            // Filter theo apartment_id
            if (!empty($searchData['apartment_id'])) {
                $query->where('apartment_id', $searchData['apartment_id']);
            }

            // Lấy tất cả hợp đồng theo điều kiện
            $contracts = $query->get();
            $contractIds = $contracts->pluck('id')->toArray();

            // Tính tổng tiền phòng
            $totalGiaThue = (float) $contracts->sum('gia_thue');

            // Tính tổng tiền cọc
            $totalTienCoc = (float) $contracts->sum('tien_coc');

            // Tính tổng dịch vụ theo từng loại từ bảng contract_service
            $serviceStats = [];
            $totalServiceAmount = 0;

            if (!empty($contractIds)) {
                $contractServices = ContractService::whereIn('contract_id', $contractIds)
                    ->whereNotNull('service_id') // Bỏ qua record không có service_id
                    ->leftJoin('aitilen_service', 'contract_service.service_id', '=', 'aitilen_service.id')
                    ->select(
                        'contract_service.service_id',
                        'aitilen_service.name as service_name',
                        'contract_service.price',
                        'contract_service.contract_id'
                    )
                    ->get();

                // Debug: Log dữ liệu
                Log::info('Contract Services Data:', [
                    'contract_ids_count' => count($contractIds),
                    'services_count' => $contractServices->count(),
                    'sample' => $contractServices->take(5)->toArray()
                ]);

                foreach ($contractServices as $contractService) {
                    $serviceId = $contractService->service_id;
                    $serviceName = $contractService->service_name;
                    $price = floatval($contractService->price ?? 0);
                    $contractId = $contractService->contract_id;

                    // Bỏ qua nếu service_id null hoặc không có tên
                    if (!$serviceId) {
                        continue;
                    }

                    // Nếu không có tên từ bảng master, dùng 'Unknown'
                    if (!$serviceName) {
                        $serviceName = 'Unknown Service (ID: ' . $serviceId . ')';
                    }

                    // Group theo service_id
                    if (!isset($serviceStats[$serviceId])) {
                        $serviceStats[$serviceId] = [
                            'service_id' => $serviceId,
                            'name' => $serviceName,
                            'total_amount' => 0,
                            'count' => 0,
                            'contract_ids' => [], // Track unique contracts
                        ];
                    }

                    $serviceStats[$serviceId]['total_amount'] += $price;

                    // Đếm số hợp đồng UNIQUE (không đếm trùng)
                    if (!in_array($contractId, $serviceStats[$serviceId]['contract_ids'])) {
                        $serviceStats[$serviceId]['contract_ids'][] = $contractId;
                        $serviceStats[$serviceId]['count']++;
                    }

                    $totalServiceAmount += $price;
                }

                // Remove contract_ids before return (chỉ dùng để đếm)
                foreach ($serviceStats as $key => $stat) {
                    unset($serviceStats[$key]['contract_ids']);
                }
            }

            // Convert associative array to indexed array và sort by total_amount desc
            $serviceList = array_values($serviceStats);
            usort($serviceList, function($a, $b) {
                return $b['total_amount'] <=> $a['total_amount'];
            });

            // Debug: Log kết quả
            Log::info('Contract Service Statistics Result:', [
                'total_services' => count($serviceList),
                'serviceList' => $serviceList
            ]);

            // Tính tổng cộng (tiền phòng + dịch vụ + cọc)
            $grandTotal = $totalGiaThue + $totalServiceAmount + $totalTienCoc;            $result = [
                'total_contracts' => $contracts->count(),
                'total_gia_thue' => $totalGiaThue,
                'total_tien_coc' => $totalTienCoc,
                'total_service_amount' => $totalServiceAmount,
                'grand_total' => $grandTotal,
                'service_breakdown' => $serviceList,
                'filters' => $searchData,
            ];

            return $this->sendSuccessResponse($result);

        } catch (\Exception $e) {
            Log::error('Error in getContractStatistics: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return $this->sendErrorResponse('Lỗi lấy thống kê: ' . $e->getMessage(), 500);
        }
    }

    public function getContractStatisticsByApartment(Request $request)
    {
        try {
            $searchData = $request->searchData ?? [];

            // Build query
            $query = Contract::query();

            // Lấy tất cả hợp đồng
            $contracts = $query->get();

            // Group by apartment_id
            $apartmentStats = [];

            foreach ($contracts as $contract) {
                $apartmentId = $contract->apartment_id;

                // Skip nếu apartment_id null hoặc 0
                if (empty($apartmentId)) {
                    continue;
                }

                if (!isset($apartmentStats[$apartmentId])) {
                    // Lấy thông tin apartment
                    $apartment = \App\Models\Admin\Apartment::find($apartmentId);

                    // Skip nếu không tìm thấy apartment
                    if (!$apartment) {
                        continue;
                    }

                    $apartmentStats[$apartmentId] = [
                        'apartment_id' => $apartmentId,
                        'apartment_name' => $apartment->name,
                        'total_contracts' => 0,
                        'total_gia_thue' => 0,
                        'total_tien_coc' => 0,
                        'total_service_amount' => 0,
                        'grand_total' => 0,
                    ];
                }

                $apartmentStats[$apartmentId]['total_contracts']++;
                $apartmentStats[$apartmentId]['total_gia_thue'] += (float) $contract->gia_thue;
                $apartmentStats[$apartmentId]['total_tien_coc'] += (float) $contract->tien_coc;

                // Tính service amount
                $services = [];
                if (is_string($contract->services)) {
                    $services = json_decode($contract->services, true) ?? [];
                } elseif (is_array($contract->services)) {
                    $services = $contract->services;
                }

                if (is_array($services)) {
                    foreach ($services as $service) {
                        if (is_array($service)) {
                            $total = floatval($service['total'] ?? 0);
                            $apartmentStats[$apartmentId]['total_service_amount'] += $total;
                        }
                    }
                }

                $apartmentStats[$apartmentId]['grand_total'] =
                    $apartmentStats[$apartmentId]['total_gia_thue'] +
                    $apartmentStats[$apartmentId]['total_tien_coc'] +
                    $apartmentStats[$apartmentId]['total_service_amount'];
            }

            // Convert to indexed array và sort by grand_total desc
            $result = array_values($apartmentStats);
            usort($result, function($a, $b) {
                return $b['grand_total'] <=> $a['grand_total'];
            });

            return $this->sendSuccessResponse($result);

        } catch (\Exception $e) {
            Log::error('Error in getContractStatisticsByApartment: ' . $e->getMessage());
            return $this->sendErrorResponse('Lỗi lấy thống kê theo tòa nhà: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Lấy danh sách hợp đồng theo dịch vụ
     * Query từ contract_service với join
     */
    public function getContractsByService(Request $request)
    {
        try {
            $searchData = $request->input('searchData', []);
            $serviceId = $searchData['service_id'] ?? null;

            // Query từ contract_service
            $query = ContractService::query()
                ->leftJoin('contract', 'contract_service.contract_id', '=', 'contract.id')
                ->leftJoin('room', 'contract.room_id', '=', 'room.id')
                ->leftJoin('aitilen_service', 'contract_service.service_id', '=', 'aitilen_service.id')
                ->select(
                    'contract_service.id',
                    'contract_service.contract_id',
                    'contract_service.service_id',
                    'contract_service.name as service_name',
                    'contract_service.price',
                    'contract.code',
                    'contract.ho_ten',
                    'contract.gia_thue',
                    'contract.tien_coc',
                    'contract.start_date',
                    'contract.end_date',
                    'room.name as room_name',
                    'aitilen_service.name as service_full_name'
                );

            // Filter by service_id
            if ($serviceId) {
                $query->where('contract_service.service_id', $serviceId);
            }

            // Order by latest
            $query->orderBy('contract.id', 'desc');

            $result = $query->get();

            return $this->sendSuccessResponse([
                'datas' => $result,
                'total' => $result->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Error in getContractsByService: ' . $e->getMessage());
            return $this->sendErrorResponse('Lỗi lấy danh sách hợp đồng theo dịch vụ: ' . $e->getMessage(), 500);
        }
    }
}


