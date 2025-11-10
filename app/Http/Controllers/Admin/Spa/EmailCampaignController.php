<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmailCampaignController extends Controller
{
    public function index(Request $request)
    {
        $campaigns = DB::table('spa_email_campaign')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return $this->sendSuccessResponse($campaigns);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ten_chien_dich' => 'required|string|max:255',
            'chu_de' => 'required|string',
            'noi_dung' => 'required|string',
        ]);

        $id = DB::table('spa_email_campaign')->insertGetId([
            'ma_chien_dich' => 'EC' . now()->format('YmdHis'),
            'ten_chien_dich' => $request->ten_chien_dich,
            'chu_de' => $request->chu_de,
            'noi_dung' => $request->noi_dung,
            'doi_tuong_gui' => $request->doi_tuong_gui ?? 'all',
            'trang_thai' => 'nhap',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->sendSuccessResponse(['id' => $id], 'Tạo chiến dịch email thành công');
    }

    public function update(Request $request, $id)
    {
        $data = [];
        if ($request->filled('ten_chien_dich')) $data['ten_chien_dich'] = $request->ten_chien_dich;
        if ($request->filled('chu_de')) $data['chu_de'] = $request->chu_de;
        if ($request->filled('noi_dung')) $data['noi_dung'] = $request->noi_dung;
        if ($request->filled('doi_tuong_gui')) $data['doi_tuong_gui'] = $request->doi_tuong_gui;
        $data['updated_at'] = now();

        DB::table('spa_email_campaign')->where('id', $id)->update($data);

        return $this->sendSuccessResponse(null, 'Cập nhật thành công');
    }

    public function show($id)
    {
        $campaign = DB::table('spa_email_campaign')->where('id', $id)->first();
        if (!$campaign) {
            return $this->sendErrorResponse('Không tìm thấy chiến dịch', 404);
        }

        return $this->sendSuccessResponse($campaign);
    }

    public function send(Request $request, $id)
    {
        $campaign = DB::table('spa_email_campaign')->where('id', $id)->first();
        if (!$campaign) {
            return $this->sendErrorResponse('Không tìm thấy chiến dịch', 404);
        }

        // Get recipients based on target
        $recipients = $this->getRecipients($campaign->doi_tuong_gui);

        DB::table('spa_email_campaign')->where('id', $id)->update([
            'trang_thai' => 'dang_gui',
            'ngay_gui' => now(),
            'so_email_gui' => count($recipients),
            'updated_at' => now(),
        ]);

        // TODO: Implement actual email sending logic here
        // Queue emails for sending

        return $this->sendSuccessResponse([
            'recipients_count' => count($recipients)
        ], 'Bắt đầu gửi email');
    }

    public function destroy($id)
    {
        $campaign = DB::table('spa_email_campaign')->where('id', $id)->first();
        if ($campaign && in_array($campaign->trang_thai, ['dang_gui', 'da_gui'])) {
            return $this->sendErrorResponse('Không thể xóa chiến dịch đã/đang gửi', 400);
        }

        DB::table('spa_email_campaign')->where('id', $id)->delete();
        return $this->sendSuccessResponse(null, 'Xóa thành công');
    }

    private function getRecipients($target)
    {
        $query = DB::table('users')->whereNotNull('email');

        if ($target === 'membership') {
            $query->whereExists(function($q) {
                $q->select(DB::raw(1))
                  ->from('spa_membership')
                  ->whereColumn('spa_membership.khach_hang_id', 'users.id')
                  ->where('spa_membership.trang_thai', 'active');
            });
        }

        return $query->pluck('email')->toArray();
    }
}