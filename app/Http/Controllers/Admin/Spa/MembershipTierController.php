<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MembershipTierController extends Controller
{
    public function index()
    {
        $tiers = DB::table('spa_membership_tier')
            ->select('*')
            ->orderBy('cap_do')
            ->get();

        // Add member count for each tier
        foreach ($tiers as $tier) {
            $tier->member_count = DB::table('spa_membership')
                ->where('tier_id', $tier->id)
                ->where('trang_thai', 'active')
                ->count();
        }

        return $this->sendSuccessResponse($tiers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ten_cap_bac' => 'required|string|max:255',
            'cap_do' => 'required|integer',
            'chi_tieu_yeu_cau' => 'required|numeric|min:0',
        ]);

        $id = DB::table('spa_membership_tier')->insertGetId([
            'ten_cap_bac' => $request->ten_cap_bac,
            'cap_do' => $request->cap_do,
            'chi_tieu_yeu_cau' => $request->chi_tieu_yeu_cau,
            'ti_le_giam_gia' => $request->ti_le_giam_gia ?? 0,
            'ti_le_tich_diem' => $request->ti_le_tich_diem ?? 1,
            'uu_dai_khac' => $request->uu_dai_khac,
            'mau_the' => $request->mau_the ?? '#CCCCCC',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(['id' => $id], 'Tạo cấp bậc thành công');
    }

    public function update(Request $request, $id)
    {
        $data = [];
        if ($request->filled('ten_cap_bac')) $data['ten_cap_bac'] = $request->ten_cap_bac;
        if ($request->filled('cap_do')) $data['cap_do'] = $request->cap_do;
        if ($request->filled('chi_tieu_yeu_cau')) $data['chi_tieu_yeu_cau'] = $request->chi_tieu_yeu_cau;
        if ($request->has('ti_le_giam_gia')) $data['ti_le_giam_gia'] = $request->ti_le_giam_gia;
        if ($request->has('ti_le_tich_diem')) $data['ti_le_tich_diem'] = $request->ti_le_tich_diem;
        if ($request->has('uu_dai_khac')) $data['uu_dai_khac'] = $request->uu_dai_khac;
        if ($request->has('mau_the')) $data['mau_the'] = $request->mau_the;
        $data['updated_at'] = now();

        DB::table('spa_membership_tier')->where('id', $id)->update($data);

        return $this->sendSuccessResponse(null, 'Cập nhật thành công');
    }

    public function destroy($id)
    {
        // Check if tier has active members
        $memberCount = DB::table('spa_membership')
            ->where('tier_id', $id)
            ->where('trang_thai', 'active')
            ->count();

        if ($memberCount > 0) {
            return $this->sendErrorResponse('Không thể xóa cấp bậc đang có thành viên', 400);
        }

        DB::table('spa_membership_tier')->where('id', $id)->delete();
        return $this->sendSuccessResponse(null, 'Xóa thành công');
    }

    public function show($id)
    {
        $tier = DB::table('spa_membership_tier')->where('id', $id)->first();
        if (!$tier) {
            return $this->sendErrorResponse('Không tìm thấy cấp bậc', 404);
        }

        // Statistics
        $tier->member_count = DB::table('spa_membership')
            ->where('tier_id', $id)
            ->where('trang_thai', 'active')
            ->count();

        $tier->total_revenue = DB::table('spa_hoa_don as hd')
            ->join('spa_membership as m', 'hd.membership_id', '=', 'm.id')
            ->where('m.tier_id', $id)
            ->where('hd.trang_thai', 'da_thanh_toan')
            ->sum('hd.tong_tien');

        return $this->sendSuccessResponse($tier);
    }
}
