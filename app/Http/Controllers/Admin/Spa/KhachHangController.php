<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use App\Services\Spa\KhachHangService;
use Illuminate\Http\Request;

class KhachHangController extends Controller
{
    protected $service;

    public function __construct(KhachHangService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        try {
            $customers = $this->service->getList($request->all());
            return response()->json([
                'success' => true,
                'data' => $customers,
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
            'ho_ten' => 'required|string|max:255',
            'so_dien_thoai' => 'required|string|max:20|unique:users,phone',
            'email' => 'nullable|email|unique:users',
            'ngay_sinh' => 'nullable|date',
            'gioi_tinh' => 'nullable|in:1,2,3,Nam,Nữ,Khác',
            'dia_chi' => 'nullable|string',
            'loai_khach' => 'nullable|string',
            'nguon_khach' => 'nullable|string',
            'ghi_chu' => 'nullable|string',
        ]);

        try {
            $customer = $this->service->create($validated);
            return response()->json([
                'success' => true,
                'data' => $customer,
                'message' => 'Tạo khách hàng thành công',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $customer = $this->service->getDetail($id);
            return response()->json([
                'success' => true,
                'data' => $customer,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'ho_ten' => 'sometimes|required|string|max:255',
            'so_dien_thoai' => 'sometimes|required|string|max:20|unique:users,phone,' . $id . ',id',
            'email' => 'nullable|email|unique:users,email,' . $id . ',id',
            'ngay_sinh' => 'nullable|date',
            'gioi_tinh' => 'nullable|in:1,2,3,Nam,Nữ,Khác',
            'dia_chi' => 'nullable|string',
            'loai_khach' => 'nullable|string',
            'nguon_khach' => 'nullable|string',
            'ghi_chu' => 'nullable|string',
        ]);

        try {
            $customer = $this->service->update($id, $validated);
            return response()->json([
                'success' => true,
                'data' => $customer,
                'message' => 'Cập nhật khách hàng thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $this->service->delete($id);
            return response()->json([
                'success' => true,
                'message' => 'Xóa khách hàng thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function statistics($id)
    {
        try {
            $stats = $this->service->getStatistics($id);
            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function segment(Request $request)
    {
        try {
            $segment = $request->input('segment', 'vip');
            $customers = $this->service->getCustomersBySegment($segment);
            return response()->json([
                'success' => true,
                'data' => $customers,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get customer purchase history
     */
    public function purchaseHistory($id)
    {
        try {
            $history = \App\Models\Spa\HoaDon::where('khach_hang_id', $id)
                ->with(['chiTiets.dichVu', 'chiTiets.sanPham'])
                ->orderBy('ngay_ban', 'desc')
                ->get()
                ->map(function ($hoaDon) {
                    return [
                        'id' => $hoaDon->id,
                        'ma_hoa_don' => $hoaDon->ma_hoa_don,
                        'ngay_ban' => $hoaDon->ngay_ban->format('Y-m-d H:i:s'),
                        'tong_tien' => $hoaDon->tong_thanh_toan,
                        'trang_thai' => $hoaDon->trang_thai,
                        'chi_tiet' => $hoaDon->chiTiets->map(function ($ct) {
                            return [
                                'id' => $ct->id,
                                'ten' => $ct->dich_vu ? $ct->dich_vu->ten_dich_vu : ($ct->san_pham ? $ct->san_pham->ten_san_pham : ''),
                                'so_luong' => $ct->so_luong,
                                'don_gia' => $ct->don_gia,
                                'thanh_tien' => $ct->thanh_tien,
                                'loai' => $ct->dich_vu_id ? 'dich_vu' : 'san_pham',
                            ];
                        })->toArray(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $history,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get customer gift card history
     */
    public function giftCardHistory($id)
    {
        try {
            $history = \App\Models\Spa\GiaoDichVi::where('khach_hang_id', $id)
                ->whereIn('loai_giao_dich', ['nap', 'code'])
                ->whereNotNull('the_gia_tri_id')
                ->with('theGiaTri')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($giaoDich) {
                    $theGiaTri = $giaoDich->theGiaTri;
                    return [
                        'id' => $giaoDich->id,
                        'ma_the' => $giaoDich->ma_code ?? ($theGiaTri ? $theGiaTri->ma_the : ''),
                        'ten_the' => $theGiaTri ? $theGiaTri->ten_the : 'Thẻ giá trị',
                        'menh_gia' => $theGiaTri ? $theGiaTri->menh_gia : 0,
                        'so_du' => $giaoDich->so_du_sau,
                        'ngay_mua' => $giaoDich->created_at->format('Y-m-d H:i:s'),
                        'ngay_het_han' => $theGiaTri && $theGiaTri->han_su_dung
                            ? $giaoDich->created_at->addDays($theGiaTri->han_su_dung)->format('Y-m-d')
                            : null,
                        'trang_thai' => $giaoDich->so_du_sau > 0 ? 'active' : 'used',
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $history,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get customer service history (purchased services and products)
     */
    public function serviceHistory($id)
    {
        try {
            $history = \App\Models\Spa\HoaDonChiTiet::whereHas('hoaDon', function ($query) use ($id) {
                    $query->where('khach_hang_id', $id);
                })
                ->with(['hoaDon', 'dichVu', 'sanPham', 'ktv'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($chiTiet) {
                    return [
                        'id' => $chiTiet->id,
                        'ma_hoa_don' => $chiTiet->hoaDon ? $chiTiet->hoaDon->ma_hoa_don : '',
                        'loai' => $chiTiet->dich_vu_id ? 'dich_vu' : 'san_pham',
                        'ten_item' => $chiTiet->dich_vu_id
                            ? ($chiTiet->dichVu ? $chiTiet->dichVu->ten_dich_vu : '')
                            : ($chiTiet->sanPham ? $chiTiet->sanPham->ten_san_pham : ''),
                        'so_luong' => $chiTiet->so_luong,
                        'don_gia' => $chiTiet->don_gia,
                        'thanh_tien' => $chiTiet->thanh_tien,
                        'ngay_su_dung' => $chiTiet->hoaDon ? $chiTiet->hoaDon->ngay_ban->format('Y-m-d H:i:s') : '',
                        'nhan_vien' => $chiTiet->ktv ? $chiTiet->ktv->name : '',
                        'ghi_chu' => $chiTiet->ghi_chu,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $history,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get customer service package history (purchased packages)
     */
    public function servicePackageHistory($id)
    {
        try {
            $history = \App\Models\Spa\CustomerPackage::where('khach_hang_id', $id)
                ->with('goiDichVu')
                ->orderBy('ngay_mua', 'desc')
                ->get()
                ->map(function ($package) {
                    return [
                        'id' => $package->id,
                        'ma_goi' => $package->goiDichVu ? $package->goiDichVu->ma_goi : '',
                        'ten_goi' => $package->ten_goi,
                        'gia_mua' => $package->gia_mua,
                        'so_luong_tong' => $package->so_luong_tong,
                        'so_luong_da_dung' => $package->so_luong_da_dung,
                        'so_luong_con_lai' => $package->so_luong_tong - $package->so_luong_da_dung,
                        'ngay_mua' => $package->ngay_mua->format('Y-m-d'),
                        'ngay_het_han' => $package->ngay_het_han ? $package->ngay_het_han->format('Y-m-d') : null,
                        'trang_thai' => $package->trang_thai,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $history,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }    /**
     * Get customer package usage history
     */
    public function packageUsageHistory($id)
    {
        try {
            $history = \App\Models\Spa\HoaDonChiTiet::whereHas('hoaDon', function ($query) use ($id) {
                    $query->where('khach_hang_id', $id);
                })
                ->whereNotNull('su_dung_goi')
                ->with(['hoaDon', 'dichVu', 'ktv'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($chiTiet) {
                    $package = \App\Models\Spa\CustomerPackage::find($chiTiet->su_dung_goi);
                    return [
                        'id' => $chiTiet->id,
                        'ten_goi' => $package ? $package->ten_goi : 'Gói dịch vụ',
                        'ten_dich_vu' => $chiTiet->dichVu ? $chiTiet->dichVu->ten_dich_vu : '',
                        'ngay_su_dung' => $chiTiet->hoaDon ? $chiTiet->hoaDon->ngay_ban->format('Y-m-d H:i:s') : '',
                        'nhan_vien' => $chiTiet->ktv ? $chiTiet->ktv->name : '',
                        'ghi_chu' => $chiTiet->ghi_chu,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $history,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get customer debt history
     */
    public function debtHistory($id)
    {
        try {
            $history = \App\Models\Admin\CongNo::where('users_id', $id)
                ->where('loai_cong_no', 1) // Receivable from customer
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($congNo) {
                    return [
                        'id' => $congNo->id,
                        'ma_cong_no' => $congNo->code,
                        'so_tien' => $congNo->tong_tien_hoa_don,
                        'so_tien_da_tra' => $congNo->so_tien_da_thanh_toan,
                        'so_tien_con_lai' => $congNo->so_tien_no,
                        'ngay_tao' => $congNo->created_at->format('Y-m-d H:i:s'),
                        'han_thanh_toan' => $congNo->ngay_hen_tat_toan ? $congNo->ngay_hen_tat_toan->format('Y-m-d') : null,
                        'trang_thai' => $congNo->cong_no_status_id == 1 ? 'da_thanh_toan' : ($congNo->cong_no_status_id == 2 ? 'thanh_toan_mot_phan' : 'chua_thanh_toan'),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $history,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
