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
            ->orderBy('thu_tu')
            ->get();

        // Add member count for each tier
        foreach ($tiers as $tier) {
            $tier->member_count = DB::table('spa_khach_hang_the')
                ->where('membership_tier_id', $tier->id)
                ->where('trang_thai', 'active')
                ->count();
        }

        return $this->sendSuccessResponse($tiers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ten_cap' => 'required|string|max:255',
            'chi_tieu_toi_thieu' => 'required|numeric|min:0',
        ]);

        $id = DB::table('spa_membership_tier')->insertGetId([
            'ten_cap' => $request->ten_cap,
            'thu_tu' => $request->thu_tu ?? 0,
            'chi_tieu_toi_thieu' => $request->chi_tieu_toi_thieu,
            'phan_tram_giam_dich_vu' => $request->phan_tram_giam_dich_vu ?? 0,
            'phan_tram_giam_san_pham' => $request->phan_tram_giam_san_pham ?? 0,
            'he_so_tich_diem' => $request->he_so_tich_diem ?? 1,
            'uu_dai_dac_biet' => $request->uu_dai_dac_biet ? json_encode($request->uu_dai_dac_biet) : null,
            'mau_the' => $request->mau_the ?? '#CCCCCC',
            'icon' => $request->icon,
            'is_active' => $request->is_active ?? 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(['id' => $id], 'Tạo cấp bậc thành công');
    }

    public function update(Request $request, $id)
    {
        $data = [];
        if ($request->filled('ten_cap')) $data['ten_cap'] = $request->ten_cap;
        if ($request->filled('thu_tu')) $data['thu_tu'] = $request->thu_tu;
        if ($request->filled('chi_tieu_toi_thieu')) $data['chi_tieu_toi_thieu'] = $request->chi_tieu_toi_thieu;
        if ($request->has('phan_tram_giam_dich_vu')) $data['phan_tram_giam_dich_vu'] = $request->phan_tram_giam_dich_vu;
        if ($request->has('phan_tram_giam_san_pham')) $data['phan_tram_giam_san_pham'] = $request->phan_tram_giam_san_pham;
        if ($request->has('he_so_tich_diem')) $data['he_so_tich_diem'] = $request->he_so_tich_diem;
        if ($request->has('uu_dai_dac_biet')) $data['uu_dai_dac_biet'] = $request->uu_dai_dac_biet ? json_encode($request->uu_dai_dac_biet) : null;
        if ($request->has('mau_the')) $data['mau_the'] = $request->mau_the;
        if ($request->has('icon')) $data['icon'] = $request->icon;
        if ($request->has('is_active')) $data['is_active'] = $request->is_active;
        $data['updated_at'] = now();

        DB::table('spa_membership_tier')->where('id', $id)->update($data);

        return $this->sendSuccessResponse(null, 'Cập nhật thành công');
    }

    public function destroy($id)
    {
        // Check if tier has active members
        $memberCount = DB::table('spa_khach_hang_the')
            ->where('membership_tier_id', $id)
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
        $tier->member_count = DB::table('spa_khach_hang_the')
            ->where('membership_tier_id', $id)
            ->where('trang_thai', 'active')
            ->count();

        $tier->total_revenue = DB::table('spa_hoa_don as hd')
            ->join('spa_khach_hang_the as kht', 'hd.khach_hang_id', '=', 'kht.khach_hang_id')
            ->where('kht.membership_tier_id', $id)
            ->where('hd.trang_thai', 'da_thanh_toan')
            ->sum('hd.tong_tien');

        return $this->sendSuccessResponse($tier);
    }
}
