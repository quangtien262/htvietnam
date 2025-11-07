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
    public function searchDienNuoc(Request $request)
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
        // Tính tháng trước để lấy dữ liệu điện nước
        $prevMonth = $request->month;
        $prevYear = $request->year;
        if ($prevMonth == 1) {
            $prevMonth = 12;
            $prevYear = $prevYear - 1;
        } else {
            $prevMonth = $prevMonth - 1;
        }

        // Lấy tất cả hợp đồng đang active làm base
        $contracts = Contract::where('is_active', 1)
            ->where('contract_status_id', 1)
            ->where('is_recycle_bin', '!=', 1)
            ->get();

        foreach ($contracts as $contract) {
            // Kiểm tra xem hóa đơn của tháng này đã tồn tại chưa
            $existingInvoice = AitilenInvoice::where('contract_id', $contract->id)
                ->where('month', $request->month)
                ->where('year', $request->year)
                ->where('is_recycle_bin', '!=', 1)
                ->first();

            if ($existingInvoice) {
                // Kiểm tra có replace không
                if (!empty($request->is_replace_all_contract) && $request->is_replace_all_contract == 1) {
                    // Xóa dịch vụ cũ trong bảng aitilen_invoice_service
                    AitilenInvoiceService::where('invoice_id', $existingInvoice->id)->delete();

                    // Sử dụng invoice cũ để update
                    $invoice = $existingInvoice;
                } else {
                    // Nếu không replace, bỏ qua
                    continue;
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
            $invoice->year = $request->year;
            $invoice->month = $request->month;
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
        }

        return $this->sendSuccessResponse([], 'Tạo hóa đơn tháng thành công!');
    }
}
