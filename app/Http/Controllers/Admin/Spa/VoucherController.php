<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VoucherController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('spa_voucher')->select('*');

        if ($request->filled('trang_thai')) {
            $query->where('trang_thai', $request->trang_thai);
        }
        if ($request->filled('search')) {
            $query->where('ma_voucher', 'like', '%' . $request->search . '%');
        }

        $vouchers = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return $this->sendSuccessResponse($vouchers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'gia_tri' => 'required|numeric|min:0',
            'so_luong' => 'required|integer|min:1',
            'ngay_het_han' => 'required|date',
        ]);

        $vouchers = [];
        for ($i = 0; $i < $request->so_luong; $i++) {
            $vouchers[] = [
                'ma_voucher' => strtoupper(Str::random(8)),
                'gia_tri' => $request->gia_tri,
                'loai_gia_tri' => $request->loai_gia_tri ?? 'tien_mat',
                'gia_tri_don_hang_toi_thieu' => $request->gia_tri_don_hang_toi_thieu ?? 0,
                'ngay_het_han' => $request->ngay_het_han,
                'trang_thai' => 'chua_su_dung',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('spa_voucher')->insert($vouchers);

        return $this->sendSuccessResponse(['created' => count($vouchers)], 'Tạo voucher thành công');
    }

    public function show($id)
    {
        $voucher = DB::table('spa_voucher as v')
            ->leftJoin('users as u', 'v.khach_hang_id', '=', 'u.id')
            ->select('v.*', 'u.name as khach_hang_ten', 'u.phone as khach_hang_sdt')
            ->where('v.id', $id)
            ->first();

        if (!$voucher) {
            return $this->sendErrorResponse('Không tìm thấy voucher', 404);
        }

        return $this->sendSuccessResponse($voucher);
    }

    public function verify(Request $request)
    {
        $request->validate(['ma_voucher' => 'required|string']);

        $voucher = DB::table('spa_voucher')
            ->where('ma_voucher', $request->ma_voucher)
            ->first();

        if (!$voucher) {
            return $this->sendErrorResponse('Mã voucher không tồn tại', 404);
        }

        if ($voucher->trang_thai !== 'chua_su_dung') {
            return $this->sendErrorResponse('Voucher đã được sử dụng', 400);
        }

        if (now() > $voucher->ngay_het_han) {
            return $this->sendErrorResponse('Voucher đã hết hạn', 400);
        }

        if ($request->filled('gia_tri_don_hang')) {
            if ($request->gia_tri_don_hang < $voucher->gia_tri_don_hang_toi_thieu) {
                return $this->sendErrorResponse('Giá trị đơn hàng không đủ điều kiện', 400);
            }
        }

        return $this->sendSuccessResponse($voucher, 'Voucher hợp lệ');
    }

    public function apply(Request $request, $id)
    {
        $request->validate([
            'khach_hang_id' => 'required|integer',
            'hoa_don_id' => 'required|integer',
        ]);

        DB::table('spa_voucher')->where('id', $id)->update([
            'khach_hang_id' => $request->khach_hang_id,
            'hoa_don_id' => $request->hoa_don_id,
            'ngay_su_dung' => now(),
            'trang_thai' => 'da_su_dung',
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(null, 'Áp dụng voucher thành công');
    }

    public function destroy($id)
    {
        $voucher = DB::table('spa_voucher')->where('id', $id)->first();
        if ($voucher && $voucher->trang_thai === 'da_su_dung') {
            return $this->sendErrorResponse('Không thể xóa voucher đã sử dụng', 400);
        }

        DB::table('spa_voucher')->where('id', $id)->delete();
        return $this->sendSuccessResponse(null, 'Xóa thành công');
    }
}