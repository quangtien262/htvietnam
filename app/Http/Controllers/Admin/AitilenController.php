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

    public function apartmentList(Request $request) {
        $searchData = $request->all();

        $query = \App\Models\Admin\Apartment::where('is_recycle_bin', '!=', 1);

        // Filter by keyword (search name, code)
        if (!empty($searchData['keyword'])) {
            $keyword = $searchData['keyword'];
            $query->where(function($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                  ->orWhere('code', 'like', "%{$keyword}%");
            });
        }

        // Pagination
        $perPage = $request->per_page ?? 20;
        $datas = $query->orderBy('id', 'desc')->paginate($perPage);

        // Count total rooms per apartment
        foreach ($datas->items() as $apartment) {
            $apartment->total_rooms = Room::where('apartment_id', $apartment->id)
                ->where('is_recycle_bin', '!=', 1)
                ->count();

            $apartment->active_contracts = Contract::where('apartment_id', $apartment->id)
                ->where('is_recycle_bin', '!=', 1)
                ->where('is_active', 1)
                ->count();
        }

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
            'searchData' => $searchData,
        ];

        return $this->sendSuccessResponse($props);
    }

    public function saveApartment(Request $request) {
        if (empty($request->id)) {
            $apartment = new \App\Models\Admin\Apartment();
        } else {
            $apartment = \App\Models\Admin\Apartment::find($request->id);
            if (!$apartment) {
                return $this->sendErrorResponse('Tòa nhà không tồn tại!');
            }
        }

        $apartment->name = $request->name ?? null;
        $apartment->code = $request->code ?? null;
        $apartment->gia_thue = $request->gia_thue ?? 0;
        $apartment->tien_coc = $request->tien_coc ?? 0;
        $apartment->ky_thanh_toan = $request->ky_thanh_toan ?? 0;
        $apartment->tien_moi_gioi = $request->tien_moi_gioi ?? 0;
        $apartment->tien_mua_nhuong = $request->tien_mua_nhuong ?? 0;
        $apartment->gia_thue_tang = $request->gia_thue_tang ?? 0;
        $apartment->start = $request->start ?? null;
        $apartment->end = $request->end ?? null;
        $apartment->thoi_gian_tang_gia = $request->thoi_gian_tang_gia ?? null;
        $apartment->password = $request->password ?? null;
        $apartment->description = $request->description ?? null;
        $apartment->color = $request->color ?? null;

        $apartment->save();

        return $this->sendSuccessResponse($apartment, empty($request->id) ? 'Thêm tòa nhà thành công!' : 'Cập nhật tòa nhà thành công!');
    }

    public function deleteApartment(Request $request) {
        if (empty($request->ids)) {
            return $this->sendErrorResponse('Vui lòng chọn tòa nhà cần xóa!');
        }

        foreach ($request->ids as $id) {
            $apartment = \App\Models\Admin\Apartment::find($id);
            if ($apartment) {
                // Check if apartment has rooms
                $hasRooms = Room::where('apartment_id', $id)
                    ->where('is_recycle_bin', '!=', 1)
                    ->exists();

                if ($hasRooms) {
                    return $this->sendErrorResponse("Không thể xóa tòa nhà '{$apartment->name}' vì còn phòng đang hoạt động!");
                }

                $apartment->is_recycle_bin = 1;
                $apartment->save();
            }
        }

        return $this->sendSuccessResponse([], 'Xóa tòa nhà thành công!');
    }

    public function fastEditApartment(Request $request) {
        if (empty($request->id) || empty($request->field) || !isset($request->value)) {
            return $this->sendErrorResponse('Dữ liệu không hợp lệ!');
        }

        $apartment = \App\Models\Admin\Apartment::find($request->id);
        if (!$apartment) {
            return $this->sendErrorResponse('Tòa nhà không tồn tại!');
        }

        $field = $request->field;
        $value = $request->value;

        $allowedFields = [
            'name', 'code', 'gia_thue', 'tien_coc', 'ky_thanh_toan',
            'tien_moi_gioi', 'tien_mua_nhuong', 'gia_thue_tang',
            'start', 'end', 'thoi_gian_tang_gia', 'password', 'description', 'color'
        ];

        if (!in_array($field, $allowedFields)) {
            return $this->sendErrorResponse('Trường dữ liệu không hợp lệ!');
        }

        $apartment->{$field} = $value;
        $apartment->save();

        return $this->sendSuccessResponse($apartment, 'Cập nhật thành công!');
    }

    public function getApartmentDetail(Request $request) {
        if (empty($request->id)) {
            return $this->sendErrorResponse('Vui lòng chọn tòa nhà!');
        }

        $apartment = \App\Models\Admin\Apartment::find($request->id);
        if (!$apartment) {
            return $this->sendErrorResponse('Tòa nhà không tồn tại!');
        }

        // Count rooms and contracts
        $apartment->total_rooms = Room::where('apartment_id', $apartment->id)
            ->where('is_recycle_bin', '!=', 1)
            ->count();

        $apartment->active_contracts = Contract::where('apartment_id', $apartment->id)
            ->where('is_recycle_bin', '!=', 1)
            ->where('is_active', 1)
            ->count();

        return $this->sendSuccessResponse($apartment);
    }

    public function getApartmentRooms(Request $request) {
        if (empty($request->apartment_id)) {
            return $this->sendErrorResponse('Vui lòng chọn tòa nhà!');
        }

        $rooms = Room::where('apartment_id', $request->apartment_id)
            ->where('is_recycle_bin', '!=', 1)
            ->get();

        // Get contract info for each room
        foreach ($rooms as $room) {
            $contract = Contract::where('room_id', $room->id)
                ->where('is_recycle_bin', '!=', 1)
                ->where('is_active', 1)
                ->first();

            if ($contract) {
                $room->contract_status = 'active';
                $room->contract_id = $contract->id;
                $room->contract_name = $contract->name;
                $room->tenant_name = $contract->user_id ? User::find($contract->user_id)->name ?? '' : '';
            } else {
                $room->contract_status = 'empty';
                $room->contract_id = null;
                $room->contract_name = null;
                $room->tenant_name = null;
            }
        }

        return $this->sendSuccessResponse($rooms);
    }

    public function saveRoom(Request $request) {
        if (empty($request->apartment_id)) {
            return $this->sendErrorResponse('Vui lòng chọn tòa nhà!');
        }

        if (empty($request->id)) {
            $room = new Room();
        } else {
            $room = Room::find($request->id);
            if (!$room) {
                return $this->sendErrorResponse('Phòng không tồn tại!');
            }
        }

        $room->name = $request->name ?? null;
        $room->apartment_id = $request->apartment_id;
        $room->price_base = $request->price_base ?? 0;
        $room->price_expect = $request->price_expect ?? 0;
        $room->price_actual = $request->price_actual ?? 0;
        $room->room_status_id = $request->room_status_id ?? 1;
        $room->description = $request->description ?? null;

        $room->save();

        return $this->sendSuccessResponse($room, empty($request->id) ? 'Thêm phòng thành công!' : 'Cập nhật phòng thành công!');
    }

    public function deleteRoom(Request $request) {
        if (empty($request->ids)) {
            return $this->sendErrorResponse('Vui lòng chọn phòng cần xóa!');
        }

        foreach ($request->ids as $id) {
            $room = Room::find($id);
            if ($room) {
                // Check if room has active contract
                $hasContract = Contract::where('room_id', $id)
                    ->where('is_recycle_bin', '!=', 1)
                    ->where('is_active', 1)
                    ->exists();

                if ($hasContract) {
                    return $this->sendErrorResponse("Không thể xóa phòng '{$room->name}' vì còn hợp đồng đang hoạt động!");
                }

                $room->is_recycle_bin = 1;
                $room->save();
            }
        }

        return $this->sendSuccessResponse([], 'Xóa phòng thành công!');
    }    public function searchDienNuoc(Request $request)
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
        return $this->sendSuccessResponse($props);
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
        return $this->sendSuccessResponse($props);
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

    function createDataDienNuocThang(Request $request)
    {
        if (empty($request->month) || empty($request->year)) {
            return $this->sendErrorResponse('Chưa chọn tháng/năm!');
        }

        // xóa dữ liệu cũ (nếu có)
        $existingDatas = AitilenDienNuoc::where('month', $request->month)
            ->where('year', $request->year)
            ->where('is_recycle_bin', '!=', 1)
            ->get();
        foreach ($existingDatas as $data) {
            $data->is_recycle_bin = 1;
            $data->save();
        }

        // lấy dữ liệu tháng trước đó
        $previousMonth = $request->month - 1;
        $previousYear = $request->year;
        if ($previousMonth == 0) {
            $previousMonth = 12;
            $previousYear -= 1;
        }

        $previousDatas = AitilenDienNuoc::where('month', $previousMonth)
            ->where('year', $previousYear)
            ->where('is_recycle_bin', '!=', 1)
            ->get();

        // tạo dữ liệu mới dựa trên dữ liệu tháng trước đó
        foreach ($previousDatas as $prevData) {
            $newData = new AitilenDienNuoc();
            $newData->year = $request->year;
            $newData->month = $request->month;
            $newData->apartment_id = $prevData->apartment_id;
            $newData->room_id = $prevData->room_id;

            $newData->dien_start = $prevData->dien_end;
            $newData->dien_end = null;

            $newData->nuoc_start = $prevData->nuoc_end;
            $newData->nuoc_end = null;

            $newData->nonglanh_start = $prevData->nonglanh_end;
            $newData->nonglanh_end = null;

            $newData->maybom_start = $prevData->maybom_end;
            $newData->maybom_end = null;

            $newData->save();
        }

        return $this->sendSuccessResponse([], 'Tạo dữ liệu tháng thành công!');
    }

    public function createInvoiceMonth(Request $request)
    {
        // Lấy tất cả hợp đồng đang active làm base
        $contracts = Contract::where('is_active', 1)
            ->where('contract_status_id', 1)
            ->where('is_recycle_bin', '!=', 1)
            ->get();

        $isReplace = !empty($request->is_replace_all_contract) && $request->is_replace_all_contract == 1;

        foreach ($contracts as $contract) {
            // Gọi hàm tính toán và lưu hóa đơn
            $this->calculateAndSaveInvoice(
                $contract,
                $request->month,
                $request->year,
                $isReplace
            );
        }

        return $this->sendSuccessResponse([], 'Tạo hóa đơn tháng thành công!');
    }

    /**
     * Tính lại tiền phòng cho những hợp đồng được chỉ định
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function recalculateInvoiceByContracts(Request $request)
    {
        if (empty($request->contract_ids) || !is_array($request->contract_ids)) {
            return $this->sendErrorResponse('Vui lòng chọn hợp đồng cần tính lại!');
        }

        if (empty($request->month) || empty($request->year)) {
            return $this->sendErrorResponse('Vui lòng chọn tháng/năm!');
        }

        // Lấy các hợp đồng được chỉ định
        $contracts = Contract::whereIn('id', $request->contract_ids)
            ->where('is_recycle_bin', '!=', 1)
            ->get();

        if ($contracts->isEmpty()) {
            return $this->sendErrorResponse('Không tìm thấy hợp đồng nào!');
        }

        $successCount = 0;
        $errorCount = 0;
        $errors = [];

        foreach ($contracts as $contract) {
            try {
                // Gọi hàm tính toán và lưu hóa đơn (luôn replace)
                $invoice = $this->calculateAndSaveInvoice(
                    $contract,
                    $request->month,
                    $request->year,
                    true // Luôn replace
                );

                if ($invoice) {
                    $successCount++;
                } else {
                    $errorCount++;
                    $errors[] = "Hợp đồng {$contract->name}: Không thể tạo/cập nhật hóa đơn";
                }
            } catch (\Exception $e) {
                $errorCount++;
                $errors[] = "Hợp đồng {$contract->name}: {$e->getMessage()}";
            }
        }

        $message = "Đã tính lại thành công {$successCount} hóa đơn";
        if ($errorCount > 0) {
            $message .= ", {$errorCount} lỗi";
        }

        return $this->sendSuccessResponse([
            'success_count' => $successCount,
            'error_count' => $errorCount,
            'errors' => $errors,
        ], $message);
    }

    /**
     * Tính lại tiền phòng cho những phòng được chỉ định
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function recalculateInvoiceByRooms(Request $request)
    {

        if (empty($request->ids)) {
            return $this->sendErrorResponse('Vui lòng chọn hóa đơn cần tính lại!');
        }

        $hoadon = AitilenInvoice::whereIn('id', $request->ids)
            ->where('is_recycle_bin', '!=', 1)
            ->get();
        foreach ($hoadon as $hd) {

            $contract = Contract::find($hd->contract_id);
            if (empty($contract)) {
                continue;
            }
            $this->calculateAndSaveInvoice(
                $contract,
                $hd->month,
                $hd->year,
                true // Luôn replace
            );
        }
        return $this->sendSuccessResponse($request->ids, 'Tính lại tiền phòng thành công!');
    }

    /**
     * Tính toán và lưu hóa đơn cho 1 hợp đồng cụ thể
     *
     * @param Contract $contract Hợp đồng cần tính
     * @param int $month Tháng hóa đơn
     * @param int $year Năm hóa đơn
     * @param bool $isReplace Có replace hóa đơn cũ không (mặc định: false)
     * @return AitilenInvoice|null Trả về invoice đã tạo/update hoặc null nếu skip
     */
    private function calculateAndSaveInvoice($contract, $month, $year, $isReplace = false)
    {
        // Tính tháng trước để lấy dữ liệu điện nước
        $prevMonth = $month;
        $prevYear = $year;
        if ($prevMonth == 1) {
            $prevMonth = 12;
            $prevYear = $prevYear - 1;
        } else {
            $prevMonth = $prevMonth - 1;
        }

        // Kiểm tra xem hóa đơn của tháng này đã tồn tại chưa
        $existingInvoice = AitilenInvoice::where('contract_id', $contract->id)
            ->where('month', $month)
            ->where('year', $year)
            ->where('is_recycle_bin', '!=', 1)
            ->first();

        if ($existingInvoice) {
            // Kiểm tra có replace không
            if ($isReplace) {
                // Xóa dịch vụ cũ trong bảng aitilen_invoice_service
                AitilenInvoiceService::where('invoice_id', $existingInvoice->id)->delete();

                // Sử dụng invoice cũ để update
                $invoice = $existingInvoice;
            } else {
                // Nếu không replace, bỏ qua
                return null;
            }
        } else {
            // Khởi tạo hóa đơn mới
            $invoice = new AitilenInvoice();
        }

        $soNguoi = $contract->so_nguoi ?? 0;

        // Lấy dữ liệu điện nước của tháng trước (nếu có)
        $dienNuocData = AitilenDienNuoc::where('room_id', $contract->room_id)
            ->where('month', $prevMonth)
            ->where('year', $prevYear)
            ->where('is_recycle_bin', '!=', 1)
            ->first();

        // Cập nhật/Khởi tạo thông tin hóa đơn
        $invoice->contract_id = $contract->id;
        $invoice->user_id = $contract->user_id;
        $invoice->apartment_id = $contract->apartment_id;
        $invoice->room_id = $contract->room_id;
        $invoice->year = $year;
        $invoice->month = $month;
        $invoice->so_nguoi = $soNguoi;
        $invoice->tien_phong = $contract->gia_thue ?? 0;
        $invoice->aitilen_invoice_status_id = 2;
        $invoice->add2soquy = 1; // xử lý update 2 sổ quỹ khi đổi sang status đã thu tiền
        $invoice->save();

        // Lấy dịch vụ từ hợp đồng
        $services = ContractService::select(
                'contract_service.id as contract_service_id',
                'contract_service.price as service_price',
                'contract_service.per as service_per',
                'aitilen_service.name as service_name'
            )
            ->leftJoin('aitilen_service', 'aitilen_service.id', '=', 'contract_service.service_id')
            ->where('contract_service.contract_id', $contract->id)
            ->where('contract_service.is_recycle_bin', '!=', 1)
            ->get();

        $serviceData = [];
        $total = $contract->gia_thue ?? 0; // Tiền thuê cứng

        foreach ($services as $service) {
            $serviceItem = [
                'name' => $service->service_name,
                'price_default' => $service->service_price,
                'per_default' => $service->service_per,
                'so_nguoi' => $contract->so_nguoi,
            ];

            // Tính tổng tiền dịch vụ dựa trên đơn vị tính
            $priceCurrentServiceTotal = 0;
            if ($service->service_per == 'Người') {
                $priceCurrentServiceTotal = $service->service_price * $soNguoi;
            } elseif ($service->service_per == 'Phòng') {
                $priceCurrentServiceTotal = $service->service_price;
            } elseif ($service->service_per == 'Xe') {
                $priceCurrentServiceTotal = $service->service_price * $contract->so_luong_xe;
            }  elseif ($service->service_per == 'KWH' || $service->service_per == 'KWh') {
                // Tính điện (nếu có dữ liệu điện nước)
                if ($dienNuocData && $dienNuocData->dien_end && $dienNuocData->dien_start) {
                    $soDien = $dienNuocData->dien_end - $dienNuocData->dien_start;
                    $priceCurrentServiceTotal = $service->service_price * $soDien;
                } else {
                    // Nếu chưa có dữ liệu điện, để 0 hoặc giá trị mặc định
                    $priceCurrentServiceTotal = 0;
                }
            } elseif ($service->service_per == 'M3') {
                // Tính nước (nếu có dữ liệu điện nước)
                if ($dienNuocData && $dienNuocData->nuoc_end && $dienNuocData->nuoc_start) {
                    $soNuoc = $dienNuocData->nuoc_end - $dienNuocData->nuoc_start;
                    $priceCurrentServiceTotal = $service->service_price * $soNuoc;
                } else {
                    // Nếu chưa có dữ liệu nước, để 0 hoặc giá trị mặc định
                    $priceCurrentServiceTotal = 0;
                }
            }

            $serviceItem['price_total'] = $priceCurrentServiceTotal;

            // Cộng dồn tổng tiền
            $total += $priceCurrentServiceTotal;

            // Lưu dữ liệu dịch vụ vào mảng
            $serviceData[] = $serviceItem;

            // Lưu chi tiết dịch vụ vào bảng aitilen_invoice_service
            $invoiceService = new AitilenInvoiceService();
            $invoiceService->invoice_id = $invoice->id;
            $invoiceService->service_id = $service->contract_service_id;
            $invoiceService->price = $service->service_price;
            $invoiceService->per = $service->service_per;
            $invoiceService->so_nguoi = $soNguoi;
            $invoiceService->total = $priceCurrentServiceTotal;
            $invoiceService->save();
        }

        // Update thông tin hóa đơn
        $invoice->total = $total;
        $invoice->services = $serviceData;

        // Chỉ tạo code mới nếu chưa có
        if (empty($invoice->code)) {
            $invoice->code = 'TP' . str_pad($invoice->id, 6, '0', STR_PAD_LEFT);
        }

        $invoice->save();

        return $invoice;
    }
}
