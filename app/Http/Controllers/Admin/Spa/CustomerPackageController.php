<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerPackageController extends Controller
{
    /**
     * Get customer's active packages
     */
    public function getCustomerPackages(Request $request)
    {
        $request->validate([
            'khach_hang_id' => 'required|integer',
        ]);

        $packages = DB::table('spa_customer_packages as cp')
            ->where('cp.khach_hang_id', $request->khach_hang_id)
            ->where('cp.trang_thai', 'dang_dung')
            ->where(function($query) {
                $query->whereNull('ngay_het_han')
                      ->orWhere('ngay_het_han', '>=', now());
            })
            ->whereRaw('so_luong_da_dung < so_luong_tong')
            ->select('cp.*')
            ->orderBy('cp.ngay_mua', 'asc')
            ->get();

        // Parse dich_vu_ids and get service names
        $packages = $packages->map(function ($package) {
            $dichVuIds = json_decode($package->dich_vu_ids, true) ?? [];

            if (!empty($dichVuIds)) {
                $services = DB::table('spa_dich_vu')
                    ->whereIn('id', $dichVuIds)
                    ->select('id', 'ten_dich_vu', 'gia_ban')
                    ->get();

                $package->dich_vu_list = $services;
            } else {
                $package->dich_vu_list = [];
            }

            $package->so_luong_con_lai = $package->so_luong_tong - $package->so_luong_da_dung;

            return $package;
        });

        return $this->sendSuccessResponse($packages);
    }

    /**
     * Use package service (decrease usage count)
     */
    public function usePackage(Request $request)
    {
        $request->validate([
            'customer_package_id' => 'required|integer',
            'dich_vu_id' => 'required|integer',
            'hoa_don_id' => 'required|integer',
        ]);

        DB::beginTransaction();
        try {
            $package = DB::table('spa_customer_packages')
                ->where('id', $request->customer_package_id)
                ->first();

            if (!$package) {
                return $this->sendErrorResponse('Gói dịch vụ không tồn tại', 404);
            }

            // Check if package still has uses left
            if ($package->so_luong_da_dung >= $package->so_luong_tong) {
                return $this->sendErrorResponse('Gói dịch vụ đã hết lượt sử dụng', 400);
            }

            // Check if service is in package
            $dichVuIds = json_decode($package->dich_vu_ids, true) ?? [];
            if (!in_array($request->dich_vu_id, $dichVuIds)) {
                return $this->sendErrorResponse('Dịch vụ không thuộc gói này', 400);
            }

            // Check expiry
            if ($package->ngay_het_han && now() > $package->ngay_het_han) {
                return $this->sendErrorResponse('Gói dịch vụ đã hết hạn', 400);
            }

            // Increment usage count
            $soLuongMoi = $package->so_luong_da_dung + 1;
            $trangThaiMoi = ($soLuongMoi >= $package->so_luong_tong) ? 'da_het' : 'dang_dung';

            DB::table('spa_customer_packages')
                ->where('id', $package->id)
                ->update([
                    'so_luong_da_dung' => $soLuongMoi,
                    'trang_thai' => $trangThaiMoi,
                    'updated_at' => now(),
                ]);

            // Log usage in invoice detail
            DB::table('spa_hoa_don_chi_tiet')
                ->where('hoa_don_id', $request->hoa_don_id)
                ->where('dich_vu_id', $request->dich_vu_id)
                ->update([
                    'su_dung_goi' => $package->id,
                    'ghi_chu' => 'Sử dụng từ gói: ' . $package->ten_goi,
                ]);

            DB::commit();

            return $this->sendSuccessResponse([
                'package_id' => $package->id,
                'so_luong_con_lai' => $package->so_luong_tong - $soLuongMoi,
            ], 'Sử dụng gói dịch vụ thành công');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendErrorResponse('Lỗi: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Add package when customer purchases it
     */
    public function purchasePackage(Request $request)
    {
        $request->validate([
            'khach_hang_id' => 'required|integer',
            'goi_dich_vu_id' => 'required|integer',
            'hoa_don_id' => 'nullable|integer',
        ]);

        DB::beginTransaction();
        try {
            // Get package details
            $goiDichVu = DB::table('spa_goi_dich_vu')
                ->where('id', $request->goi_dich_vu_id)
                ->first();

            if (!$goiDichVu) {
                return $this->sendErrorResponse('Gói dịch vụ không tồn tại', 404);
            }

            // Get dich_vu_ids from spa_goi_dich_vu_chi_tiet
            $chiTiet = DB::table('spa_goi_dich_vu_chi_tiet')
                ->where('goi_dich_vu_id', $request->goi_dich_vu_id)
                ->pluck('dich_vu_id')
                ->toArray();

            // Calculate expiry date based on han_su_dung
            $ngayHetHan = null;
            if (isset($goiDichVu->han_su_dung) && $goiDichVu->han_su_dung > 0) {
                $ngayHetHan = now()->addDays($goiDichVu->han_su_dung);
            }

            // Insert customer package
            $customerPackageId = DB::table('spa_customer_packages')->insertGetId([
                'khach_hang_id' => $request->khach_hang_id,
                'goi_dich_vu_id' => $goiDichVu->id,
                'ten_goi' => $goiDichVu->ten_goi,
                'gia_mua' => $goiDichVu->gia_ban,
                'so_luong_tong' => $goiDichVu->so_luong ?? 1,
                'so_luong_da_dung' => 0,
                'dich_vu_ids' => json_encode($chiTiet),
                'ngay_mua' => now(),
                'ngay_het_han' => $ngayHetHan,
                'trang_thai' => 'dang_dung',
                'hoa_don_id' => $request->hoa_don_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            return $this->sendSuccessResponse([
                'customer_package_id' => $customerPackageId,
            ], 'Thêm gói dịch vụ cho khách hàng thành công');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->sendErrorResponse('Lỗi: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get package usage history
     */
    public function getPackageHistory(Request $request)
    {
        $request->validate([
            'khach_hang_id' => 'required|integer',
        ]);

        $packages = DB::table('spa_customer_packages as cp')
            ->leftJoin('spa_goi_dich_vu as goi', 'cp.goi_dich_vu_id', '=', 'goi.id')
            ->where('cp.khach_hang_id', $request->khach_hang_id)
            ->select(
                'cp.*',
                'goi.ten_goi as ten_goi_goc'
            )
            ->orderBy('cp.created_at', 'desc')
            ->get();

        return $this->sendSuccessResponse($packages);
    }
}
