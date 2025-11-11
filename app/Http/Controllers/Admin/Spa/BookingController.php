<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Services\Spa\BookingService;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    protected $service;

    public function __construct(BookingService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        try {
            $bookings = $this->service->getList($request->all());
            return response()->json([
                'success' => true,
                'data' => $bookings,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'khach_hang_id' => 'required|exists:users,id',
            'chi_nhanh_id' => 'required|exists:spa_chi_nhanh,id',
            'ngay_hen' => 'required|date',
            'gio_hen' => 'required',
            'nguon_booking' => 'required|in:web,app,dien_thoai,truc_tiep',
            'dich_vus' => 'required|array|min:1',
            'dich_vus.*.dich_vu_id' => 'required|exists:spa_dich_vu,id',
            'dich_vus.*.ktv_id' => 'nullable|exists:spa_ktv,id',
            'dich_vus.*.phong_id' => 'nullable|exists:spa_phong,id',
            'tien_coc' => 'nullable|numeric|min:0',
            'ghi_chu' => 'nullable|string',
        ]);

        try {
            $booking = $this->service->create($validated);
            return response()->json([
                'success' => true,
                'data' => $booking,
                'message' => 'Tạo lịch hẹn thành công',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'ngay_hen' => 'sometimes|required|date',
            'gio_hen' => 'sometimes|required',
            'dich_vus' => 'sometimes|required|array|min:1',
            'ghi_chu' => 'nullable|string',
        ]);

        try {
            $booking = $this->service->update($id, $validated);
            return response()->json([
                'success' => true,
                'data' => $booking,
                'message' => 'Cập nhật lịch hẹn thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function confirm($id)
    {
        try {
            $booking = $this->service->confirm($id);
            return response()->json([
                'success' => true,
                'data' => $booking,
                'message' => 'Xác nhận lịch hẹn thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function start($id)
    {
        try {
            $booking = $this->service->start($id);
            return response()->json([
                'success' => true,
                'data' => $booking,
                'message' => 'Bắt đầu thực hiện',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function complete($id)
    {
        try {
            $booking = $this->service->complete($id);
            return response()->json([
                'success' => true,
                'data' => $booking,
                'message' => 'Hoàn thành dịch vụ',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function cancel(Request $request, $id)
    {
        $validated = $request->validate([
            'ly_do' => 'required|string',
        ]);

        try {
            $booking = $this->service->cancel($id, $validated['ly_do']);
            return response()->json([
                'success' => true,
                'data' => $booking,
                'message' => 'Đã hủy lịch hẹn',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function calendar(Request $request)
    {
        try {
            $calendar = $this->service->getCalendar($request->all());
            return response()->json([
                'success' => true,
                'data' => $calendar,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function availableKTVs(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'time' => 'required',
            'duration' => 'required|integer|min:15',
        ]);

        try {
            $ktvs = $this->service->getAvailableKTVs(
                $validated['date'],
                $validated['time'],
                $validated['duration']
            );
            return response()->json([
                'success' => true,
                'data' => $ktvs,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function availableRooms(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'time' => 'required',
            'duration' => 'required|integer|min:15',
            'room_type' => 'nullable|string',
        ]);

        try {
            $rooms = $this->service->getAvailableRooms(
                $validated['date'],
                $validated['time'],
                $validated['duration'],
                $validated['room_type'] ?? null
            );
            return response()->json([
                'success' => true,
                'data' => $rooms,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
