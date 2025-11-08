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
use App\Models\Admin\Apartment;
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
use Carbon\Carbon;

class AitilenReportController extends Controller
{
    public function tongLoiNhuan(Request $request)
    {
        // tháng năm
        $month = $request->month;
        $year = $request->year;

        $countApartments = Apartment::count();
        // Thống kê tổng lợi nhuận theo từng tòa nhà
        $apartments = Apartment::get();
        $report = [];
        foreach ($apartments as $apartment) {
            // Lấy tất cả hợp đồng trong tòa nhà này
            $contracts = Contract::where('apartment_id', $apartment->id)->pluck('id')->toArray();

            // Lấy tất cả hóa đơn trong tháng/năm của các hợp đồng này
            $invoices = AitilenInvoice::whereIn('contract_id', $contracts)
                ->whereMonth('invoice_date', $month)
                ->whereYear('invoice_date', $year)
                ->get();

            $totalRevenue = 0;
            $totalCost = 0;

            foreach ($invoices as $invoice) {
                // Doanh thu từ hóa đơn
                $totalRevenue += $invoice->total_amount;

                // Tính chi phí dịch vụ liên quan đến hóa đơn
                $invoiceServices = AitilenInvoiceService::where('invoice_id', $invoice->id)->get();
                foreach ($invoiceServices as $invService) {
                    $service = AitilenService::find($invService->service_id);
                    if ($service) {
                        $totalCost += $service->cost_price * $invService->quantity;
                    }
                }
            }

            $profit = $totalRevenue - $totalCost;
            $report[] = [
                'apartment_id' => $apartment->id,
                'apartment_name' => $apartment->name,
                'total_revenue' => $totalRevenue,
                'total_cost' => $totalCost,
                'profit' => $profit,
            ];
        }

        $result = [
            'countApartments' => $countApartments,
            'report' => $report,
        ];
        return $this->sendSuccessResponse($result);
    }

    public function loiNhuanTheoTienPhong(Request $request)
    {
        // Filters: month/year (MM, YYYY) - Báo cáo cho TẤT CẢ các tòa nhà
        $month = $request->month ?: null;
        $year = $request->year ?: null;

        // Determine month date range if month/year provided
        try {
            $startOfMonth = null;
            $endOfMonth = null;
            if ($month && $year) {
                $startOfMonth = Carbon::createFromDate($year, $month, 1)->startOfDay();
                $endOfMonth = (clone $startOfMonth)->endOfMonth()->endOfDay();
            }
        } catch (\Exception $e) {
            return $this->sendErrorResponse('Invalid month/year', 422);
        }

        // Get ALL apartments - Lấy tất cả tòa nhà
        $apartments = Apartment::select('apartment.id', 'apartment.name', 'apartment.gia_thue')->get();

        $report = [];
        $totalIncome = 0;
        $totalCost = 0;

        foreach ($apartments as $apartment) {
            // Get all contracts for this apartment (không filter theo room)
            $contractsQuery = Contract::where('contract.apartment_id', $apartment->id);

            // If month filter provided, find contracts that are active (overlap) in that month
            if ($startOfMonth && $endOfMonth) {
                $contractsQuery->where(function ($q) use ($startOfMonth, $endOfMonth) {
                    // contract with no end_date and start_date <= endOfMonth
                    $q->where(function ($q2) use ($startOfMonth, $endOfMonth) {
                        $q2->whereNull('contract.end_date')
                            ->whereDate('contract.start_date', '<=', $endOfMonth->toDateString());
                    });

                    // or contract that overlaps the month interval
                    $q->orWhere(function ($q2) use ($startOfMonth, $endOfMonth) {
                        $q2->whereDate('contract.start_date', '<=', $endOfMonth->toDateString())
                            ->whereDate('contract.end_date', '>=', $startOfMonth->toDateString());
                    });
                });
            }

            $contracts = $contractsQuery->pluck('id')->toArray();
            $roomsRented = count($contracts);

            // Calculate income from aitilen_invoice.tien_phong (not total_amount)
            // Use created_at for date filtering since invoice_date doesn't exist
            $invoicesQuery = AitilenInvoice::whereIn('contract_id', $contracts);

            if ($startOfMonth && $endOfMonth) {
                $invoicesQuery->where('month', $month)->where('year', $year);
            }

            // Sum tien_phong as the room rental income
            $income = (float) $invoicesQuery->sum('tien_phong');

            // Calculate cost: apartment.gia_thue là giá thuê TOÀN BỘ tòa nhà từ chủ
            // KHÔNG nhân với số phòng vì đây là chi phí cố định cho cả tòa
            $apartmentCost = (float) ($apartment->gia_thue ?: 0);
            $cost = $apartmentCost; // Chi phí = giá thuê tòa nhà (fixed cost)
            $profit = $income - $cost;

            // Calculate ROI (rate_percent)
            $rate = $cost > 0 ? round(($profit / $cost) * 100, 2) : null;

            // Calculate occupancy rate
            $totalRoomsInApartment = Room::where('apartment_id', $apartment->id)->count();
            $occupancy = $totalRoomsInApartment > 0
                ? round(($roomsRented / $totalRoomsInApartment) * 100, 2)
                : 0;

            // Only include apartments with data (either has rooms rented or income)
            if ($roomsRented > 0 || $income > 0) {
                $report[] = [
                    'apartment_id' => $apartment->id,
                    'apartment_name' => $apartment->name,
                    'rooms_rented' => $roomsRented,
                    'total_rooms' => $totalRoomsInApartment,
                    'total_income' => $income,
                    'total_cost' => $cost,
                    'profit' => $profit,
                    'rate_percent' => $rate,
                    'occupancy_percent' => $occupancy,
                ];

                $totalIncome += $income;
                $totalCost += $cost;
            }
        }

        $totalProfit = $totalIncome - $totalCost;

        // Calculate average occupancy across all apartments in report
        $avgOccupancy = count($report) > 0
            ? round(array_sum(array_column($report, 'occupancy_percent')) / count($report), 2)
            : 0;

        $result = [
            'filters' => [
                'month' => $month,
                'year' => $year,
            ],
            'summary' => [
                'total_income' => $totalIncome,
                'total_cost' => $totalCost,
                'total_profit' => $totalProfit,
                'avg_occupancy' => $avgOccupancy,
                'total_apartments' => count($report),
            ],
            'report' => $report,
        ];

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
