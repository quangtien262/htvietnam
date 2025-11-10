<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SMSCampaignController extends Controller
{
    public function index(Request $request)
    {
        $campaigns = DB::table('spa_sms_campaign')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return $this->sendSuccessResponse($campaigns);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ten_chien_dich' => 'required|string|max:255',
            'noi_dung' => 'required|string|max:160',
        ]);

        $id = DB::table('spa_sms_campaign')->insertGetId([
            'ma_chien_dich' => 'SMS' . now()->format('YmdHis'),
            'ten_chien_dich' => $request->ten_chien_dich,
            'noi_dung' => $request->noi_dung,
            'doi_tuong_gui' => $request->doi_tuong_gui ?? 'all',
            'trang_thai' => 'nhap',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(['id' => $id], 'Tạo chiến dịch SMS thành công');
    }

    public function update(Request $request, $id)
    {
        $data = [];
        if ($request->filled('ten_chien_dich')) $data['ten_chien_dich'] = $request->ten_chien_dich;
        if ($request->filled('noi_dung')) $data['noi_dung'] = $request->noi_dung;
        if ($request->filled('doi_tuong_gui')) $data['doi_tuong_gui'] = $request->doi_tuong_gui;
        $data['updated_at'] = now();

        DB::table('spa_sms_campaign')->where('id', $id)->update($data);

        return $this->sendSuccessResponse(null, 'Cập nhật thành công');
    }

    public function show($id)
    {
        $campaign = DB::table('spa_sms_campaign')->where('id', $id)->first();
        if (!$campaign) {
            return $this->sendErrorResponse('Không tìm thấy chiến dịch', 404);
        }

        return $this->sendSuccessResponse($campaign);
    }

    public function send(Request $request, $id)
    {
        $campaign = DB::table('spa_sms_campaign')->where('id', $id)->first();
        if (!$campaign) {
            return $this->sendErrorResponse('Không tìm thấy chiến dịch', 404);
        }

        // Get recipients based on target
        $recipients = $this->getRecipients($campaign->doi_tuong_gui);

        DB::table('spa_sms_campaign')->where('id', $id)->update([
            'trang_thai' => 'dang_gui',
            'ngay_gui' => now(),
            'so_sms_gui' => count($recipients),
            'updated_at' => now(),
        ]);

        // TODO: Implement actual SMS sending logic here
        // Integrate with SMS gateway

        return $this->sendSuccessResponse([
            'recipients_count' => count($recipients)
        ], 'Bắt đầu gửi SMS');
    }

    public function destroy($id)
    {
        $campaign = DB::table('spa_sms_campaign')->where('id', $id)->first();
        if ($campaign && in_array($campaign->trang_thai, ['dang_gui', 'da_gui'])) {
            return $this->sendErrorResponse('Không thể xóa chiến dịch đã/đang gửi', 400);
        }

        DB::table('spa_sms_campaign')->where('id', $id)->delete();
        return $this->sendSuccessResponse(null, 'Xóa thành công');
    }

    private function getRecipients($target)
    {
        $query = DB::table('users')->whereNotNull('phone');

        if ($target === 'membership') {
            $query->whereExists(function($q) {
                $q->select(DB::raw(1))
                  ->from('spa_membership')
                  ->whereColumn('spa_membership.khach_hang_id', 'users.id')
                  ->where('spa_membership.trang_thai', 'active');
            });
        } elseif ($target === 'birthday') {
            $query->whereRaw('DAY(ngay_sinh) = DAY(CURDATE()) AND MONTH(ngay_sinh) = MONTH(CURDATE())');
        }

        return $query->pluck('phone')->toArray();
    }
}