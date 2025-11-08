<?php

namespace App\Models\Admin;

use App\Casts\Json;
use App\Services\Admin\TblService;
use Illuminate\Database\Eloquent\Model;

class SoQuy extends Model
{
    protected $table = 'so_quy';

    // Relationships
    public function soQuyType()
    {
        return $this->belongsTo(SoQuyType::class, 'so_quy_type_id');
    }

    public function soQuyStatus()
    {
        return $this->belongsTo(SoQuyStatus::class, 'so_quy_status_id');
    }

    public function loaiThu()
    {
        return $this->belongsTo(LoaiThu::class, 'loai_thu_id');
    }

    public function loaiChi()
    {
        return $this->belongsTo(LoaiChi::class, 'loai_chi_id');
    }

    public function chiNhanh()
    {
        return $this->belongsTo(ChiNhanh::class, 'chi_nhanh_id');
    }

    public function khachHang()
    {
        return $this->belongsTo(User::class, 'khach_hang_id');
    }

    static function saveSoQuy_NhapHang($soTien, $nhapHang)
    {
        $now = date('d/m/Y H:i:s');
        $nowDB = date('Y-m-d H:i:s');
        $soQuy = new SoQuy();
        $soQuy->name = 'Thanh toán trả nợ cho nhà cung cấp (Nhập hàng)';
        $soQuy->loai_chung_tu = 'product_nhap_hang';
        $soQuy->chung_tu_id = $nhapHang->id;
        $soQuy->ma_chung_tu = $nhapHang->code;
        $soQuy->chi_nhanh_id = $nhapHang->chi_nhanh_id;
        // $soQuy->khach_hang_id = $rq->khach_hang_id;
        $soQuy->nha_cung_cap_id = $nhapHang->nha_cung_cap_id;
        $soQuy->nhan_vien_id = $nhapHang->nhan_vien_id;
        $soQuy->so_tien = $soTien;
        $soQuy->so_quy_status_id = 1;
        $soQuy->so_quy_type_id = config('constant.so_quy_type.chi_tien_ncc');
        $soQuy->thoi_gian = $nowDB;

        $soQuy->nhom_nguoi_nhan_id = config('constant.nhom_nguoi_nhan.ncc'); // 1 là khách hàng

        $soQuy->save();
        $soQuy->code = 'SQ' . TblService::formatNumberByLength($soQuy->id, 5);
        $soQuy->save();
    }

    static function saveSoQuy_KhachTraHang($soTien, $khachTraHang)
    {
        $nowDB = date('Y-m-d H:i:s');
        $soQuy = new SoQuy();
        $soQuy->name = 'Thanh toán trả nợ cho khách hàng (Trả hàng)';
        $soQuy->loai_chung_tu = 'product_khach_tra_hang';
        $soQuy->chung_tu_id = $khachTraHang->id;
        $soQuy->ma_chung_tu = $khachTraHang->code;
        $soQuy->chi_nhanh_id = $khachTraHang->chi_nhanh_id;

        $soQuy->khach_hang_id = $khachTraHang->khach_hang_id;

        $soQuy->nhan_vien_id = $khachTraHang->nhan_vien_id;
        $soQuy->so_tien = $soTien;
        $soQuy->so_quy_status_id = 1;
        $soQuy->so_quy_type_id = config('constant.so_quy_type.khach_tra_hang');
        $soQuy->thoi_gian = $nowDB;

        $soQuy->nhom_nguoi_nhan_id = config('constant.nhom_nguoi_nhan.khach_hang'); // 1 là khách hàng

        $soQuy->save();
        $soQuy->code = 'SQ' . TblService::formatNumberByLength($soQuy->id, 5);
        $soQuy->save();
        return $soQuy;
    }

    static function saveSoQuy_TraHangNCC($soTien, $traHangNCC)
    {
        $nowDB = date('Y-m-d H:i:s');
        $soQuy = new SoQuy();
        $soQuy->name = 'Thanh toán thu nợ cho nhà cung cấp (Trả hàng)';
        $soQuy->loai_chung_tu = 'product_tra_hang_ncc';
        $soQuy->chung_tu_id = $traHangNCC->id;
        $soQuy->ma_chung_tu = $traHangNCC->code;
        $soQuy->chi_nhanh_id = $traHangNCC->chi_nhanh_id;

        $soQuy->khach_hang_id = $traHangNCC->khach_hang_id;

        $soQuy->nhan_vien_id = $traHangNCC->nhan_vien_id;
        $soQuy->so_tien = $soTien;
        $soQuy->so_quy_status_id = 1;
        $soQuy->so_quy_type_id = config('constant.so_quy_type.thu_tien_ncc');
        $soQuy->thoi_gian = $nowDB;

        $soQuy->nhom_nguoi_nhan_id = config('constant.nhom_nguoi_nhan.cty'); // 1 là khách hàng

        $soQuy->save();
        $soQuy->code = 'SQ' . TblService::formatNumberByLength($soQuy->id, 5);
        $soQuy->save();
        return $soQuy;
    }

    static function saveSoQuy_hoaDon($soTien, $hoaDon)
    {
        $nowDB = date('Y-m-d H:i:s');
        $soQuy = new SoQuy();
        $soQuy->name = 'Khách thanh toán công nợ (Hóa đơn bán lẻ)';
        $soQuy->loai_chung_tu = 'hoa_don';
        $soQuy->chung_tu_id = $hoaDon->id;
        $soQuy->ma_chung_tu = $hoaDon->code;
        $soQuy->chi_nhanh_id = $hoaDon->chi_nhanh_id;

        $soQuy->khach_hang_id = $hoaDon->khach_hang_id;

        $soQuy->nhan_vien_id = $hoaDon->nhan_vien_id;
        $soQuy->so_tien = $soTien;
        $soQuy->so_quy_status_id = 1;
        $soQuy->so_quy_type_id = config('constant.so_quy_type.khach_tt_hdon');
        $soQuy->thoi_gian = $nowDB;

        $soQuy->nhom_nguoi_nhan_id = config('constant.nhom_nguoi_nhan.cty'); // 1 là khách hàng

        $soQuy->save();
        $soQuy->code = 'SQ' . TblService::formatNumberByLength($soQuy->id, 5);
        $soQuy->save();
        return $soQuy;
    }

    static function saveSoQuy_hoaDonAitilen($invoice)
    {
        $nowDB = date('Y-m-d H:i:s');
        // check tồn tại sổ quỹ cho hóa đơn này chưa
        $existingSoQuy = SoQuy::where('loai_chung_tu', 'aitilen_invoice')
            ->where('chung_tu_id', $invoice->id)
            ->first();
        if ($existingSoQuy) {
            $soQuy = $existingSoQuy;
        } else {
            $soQuy = new SoQuy();
        }
        $soQuy->name = 'Khách thanh toán hóa đơn tiền phòng';
        $soQuy->loai_chung_tu = 'aitilen_invoice';
        $soQuy->chung_tu_id = $invoice->id;
        $soQuy->ma_chung_tu = $invoice->code;
        $soQuy->khach_hang_id = $invoice->user_id;
        $soQuy->nhan_vien_id = $invoice->create_by;
        $soQuy->so_tien = $invoice->total;
        $soQuy->so_quy_status_id = $invoice->aitilen_invoice_status_id;
        $soQuy->so_quy_type_id = config('constant.so_quy_type.khach_tt_hdon');
        $soQuy->thoi_gian = $nowDB;
        $soQuy->nhom_nguoi_nhan_id = config('constant.nhom_nguoi_nhan.cty'); // 1 là khách hàng

        $soQuy->save();
        if (empty($soQuy->code)) {
            $soQuy->code = 'SQ' . TblService::formatNumberByLength($soQuy->id, 5);
        }
        $soQuy->save();
        return $soQuy;
    }
}
