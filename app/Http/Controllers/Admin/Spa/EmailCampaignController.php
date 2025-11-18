<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmailCampaignController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('spa_email_campaign');

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('ten_campaign', 'like', '%' . $request->search . '%')
                  ->orWhere('muc_dich', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('trang_thai')) {
            // Map frontend status to database status
            $statusMap = [
                'nhap' => 'draft',
                'dang_gui' => 'sending',
                'da_gui' => 'sent',
                'da_len_lich' => 'scheduled',
            ];
            $dbStatus = $statusMap[$request->trang_thai] ?? $request->trang_thai;
            $query->where('trang_thai', $dbStatus);
        }

        $perPage = $request->per_page ?? $request->limit ?? 20;
        $campaigns = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Transform data to match frontend format
        $transformedData = collect($campaigns->items())->map(function ($campaign) {
            $segmentFilter = json_decode($campaign->segment_filter, true) ?? [];
            $danhSachGui = json_decode($campaign->danh_sach_gui, true) ?? [];

            // Map status back to frontend
            $statusMap = [
                'draft' => 'nhap',
                'sending' => 'dang_gui',
                'sent' => 'da_gui',
                'scheduled' => 'da_len_lich',
            ];

            return [
                'id' => $campaign->id,
                'ten_chien_dich' => $campaign->ten_campaign,
                'loai_chien_dich' => $segmentFilter['loai_chien_dich'] ?? 'email',
                'chu_de' => $campaign->subject,
                'noi_dung' => $campaign->noi_dung_html,
                'doi_tuong_muc_tieu' => $segmentFilter['doi_tuong_muc_tieu'] ?? 'all',
                'danh_sach_muc_tieu' => $danhSachGui,
                'ngay_gui' => $campaign->ngay_gui,
                'trang_thai' => $statusMap[$campaign->trang_thai] ?? $campaign->trang_thai,
                'da_gui' => $campaign->da_gui,
                'thanh_cong' => $campaign->thanh_cong,
                'that_bai' => $campaign->that_bai,
                'tong_doi_tuong' => $campaign->da_gui,
                'ty_le_mo' => (float)$campaign->ty_le_mo,
                'ty_le_click' => (float)$campaign->ty_le_click,
                'created_at' => $campaign->created_at,
            ];
        });

        // Calculate stats
        $stats = [
            'totalCampaigns' => DB::table('spa_email_campaign')->count(),
            'activeCampaigns' => DB::table('spa_email_campaign')->where('trang_thai', 'sending')->count(),
            'completedCampaigns' => DB::table('spa_email_campaign')->where('trang_thai', 'sent')->count(),
            'totalSent' => DB::table('spa_email_campaign')->sum('da_gui') ?? 0,
        ];

        return $this->sendSuccessResponse([
            'data' => $transformedData,
            'total' => $campaigns->total(),
            'current_page' => $campaigns->currentPage(),
            'per_page' => $campaigns->perPage(),
            'last_page' => $campaigns->lastPage(),
            'stats' => $stats,
        ]);
    }

    public function createOrUpdate(Request $request)
    {
        $request->validate([
            'ten_chien_dich' => 'required|string|max:255',
            'loai_chien_dich' => 'required|in:email,sms,zalo,mixed',
            'noi_dung' => 'required|string',
        ]);

        // Build segment_filter JSON to store additional info
        $segmentFilter = [
            'loai_chien_dich' => $request->loai_chien_dich,
            'doi_tuong_muc_tieu' => $request->doi_tuong_muc_tieu ?? 'all',
            'muc_dich' => $request->muc_dich ?? '',
        ];

        // Map frontend status to database status
        $statusMap = [
            'nhap' => 'draft',
            'dang_gui' => 'sending',
            'da_gui' => 'sent',
            'da_len_lich' => 'scheduled',
        ];
        $trangThai = $statusMap[$request->trang_thai ?? 'nhap'] ?? 'draft';

        $data = [
            'ten_campaign' => $request->ten_chien_dich,
            'muc_dich' => $request->muc_dich,
            'subject' => $request->chu_de ?? $request->ten_chien_dich,
            'noi_dung_html' => $request->noi_dung,
            'segment_filter' => json_encode($segmentFilter),
            'danh_sach_gui' => $request->danh_sach_muc_tieu ? json_encode($request->danh_sach_muc_tieu) : null,
            'ngay_gui' => $request->ngay_gui,
            'trang_thai' => $trangThai,
            'updated_at' => now(),
        ];

        if ($request->filled('id')) {
            // Update existing campaign
            DB::table('spa_email_campaign')->where('id', $request->id)->update($data);
            return $this->sendSuccessResponse(null, 'Cập nhật chiến dịch thành công');
        } else {
            // Create new campaign
            $data['created_at'] = now();
            $data['da_gui'] = 0;
            $data['thanh_cong'] = 0;
            $data['that_bai'] = 0;
            $data['ty_le_mo'] = 0;
            $data['ty_le_click'] = 0;

            $id = DB::table('spa_email_campaign')->insertGetId($data);
            return $this->sendSuccessResponse(['id' => $id], 'Tạo chiến dịch mới thành công');
        }
    }

    public function delete(Request $request)
    {
        $request->validate(['id' => 'required|integer']);

        $campaign = DB::table('spa_email_campaign')->where('id', $request->id)->first();
        if ($campaign && in_array($campaign->trang_thai, ['sending', 'sent'])) {
            return $this->sendErrorResponse('Không thể xóa chiến dịch đã/đang gửi', 400);
        }

        DB::table('spa_email_campaign')->where('id', $request->id)->delete();
        return $this->sendSuccessResponse(null, 'Xóa chiến dịch thành công');
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

        // Transform to match frontend format
        $segmentFilter = json_decode($campaign->segment_filter, true) ?? [];
        $danhSachGui = json_decode($campaign->danh_sach_gui, true) ?? [];

        $statusMap = [
            'draft' => 'nhap',
            'sending' => 'dang_gui',
            'sent' => 'da_gui',
            'scheduled' => 'da_len_lich',
        ];

        $transformed = [
            'id' => $campaign->id,
            'ten_chien_dich' => $campaign->ten_campaign,
            'loai_chien_dich' => $segmentFilter['loai_chien_dich'] ?? 'email',
            'chu_de' => $campaign->subject,
            'noi_dung' => $campaign->noi_dung_html,
            'doi_tuong_muc_tieu' => $segmentFilter['doi_tuong_muc_tieu'] ?? 'all',
            'danh_sach_muc_tieu' => $danhSachGui,
            'ngay_gui' => $campaign->ngay_gui,
            'trang_thai' => $statusMap[$campaign->trang_thai] ?? $campaign->trang_thai,
            'da_gui' => $campaign->da_gui,
            'thanh_cong' => $campaign->thanh_cong,
            'that_bai' => $campaign->that_bai,
            'created_at' => $campaign->created_at,
        ];

        return $this->sendSuccessResponse($transformed);
    }

    public function send(Request $request)
    {
        $request->validate(['id' => 'required|integer']);

        $campaign = DB::table('spa_email_campaign')->where('id', $request->id)->first();
        if (!$campaign) {
            return $this->sendErrorResponse('Không tìm thấy chiến dịch', 404);
        }

        // Get segment filter
        $segmentFilter = json_decode($campaign->segment_filter, true) ?? [];
        $doiTuongMucTieu = $segmentFilter['doi_tuong_muc_tieu'] ?? 'all';

        // Get recipients based on target
        $recipients = $this->getRecipients($doiTuongMucTieu, $campaign->danh_sach_gui);

        DB::table('spa_email_campaign')->where('id', $request->id)->update([
            'trang_thai' => 'sending',
            'ngay_gui' => now(),
            'da_gui' => count($recipients),
            'updated_at' => now(),
        ]);

        // TODO: Implement actual email sending logic here
        // Queue emails for sending

        return $this->sendSuccessResponse([
            'recipients_count' => count($recipients)
        ], 'Bắt đầu gửi email');
    }

    public function countTarget(Request $request)
    {
        $target = $request->doi_tuong_muc_tieu ?? 'all';
        $customList = $request->danh_sach_muc_tieu;

        $count = $this->getRecipientsCount($target, $customList);

        return $this->sendSuccessResponse(['count' => $count]);
    }

    public function destroy($id)
    {
        $campaign = DB::table('spa_email_campaign')->where('id', $id)->first();
        if ($campaign && in_array($campaign->trang_thai, ['sending', 'sent'])) {
            return $this->sendErrorResponse('Không thể xóa chiến dịch đã/đang gửi', 400);
        }

        DB::table('spa_email_campaign')->where('id', $id)->delete();
        return $this->sendSuccessResponse(null, 'Xóa thành công');
    }

    private function getRecipients($target, $customList = null)
    {
        if ($target === 'custom' && $customList) {
            $ids = is_string($customList) ? json_decode($customList, true) : $customList;
            return DB::table('users')
                ->whereIn('id', $ids)
                ->whereNotNull('email')
                ->pluck('email')
                ->toArray();
        }

        $query = DB::table('users')->whereNotNull('email');

        if ($target === 'membership') {
            $query->whereExists(function($q) {
                $q->select(DB::raw(1))
                  ->from('spa_membership')
                  ->whereColumn('spa_membership.khach_hang_id', 'users.id')
                  ->where('spa_membership.trang_thai', 'active');
            });
        } elseif ($target === 'vip') {
            $query->where('customer_level', 'vip');
        } elseif ($target === 'birthday_month') {
            $currentMonth = now()->month;
            $query->whereRaw('MONTH(birthday) = ?', [$currentMonth]);
        }

        return $query->pluck('email')->toArray();
    }

    private function getRecipientsCount($target, $customList = null)
    {
        if ($target === 'custom' && $customList) {
            $ids = is_string($customList) ? json_decode($customList, true) : $customList;
            return DB::table('users')
                ->whereIn('id', $ids)
                ->whereNotNull('email')
                ->count();
        }

        $query = DB::table('users')->whereNotNull('email');

        if ($target === 'membership') {
            $query->whereExists(function($q) {
                $q->select(DB::raw(1))
                  ->from('spa_membership')
                  ->whereColumn('spa_membership.khach_hang_id', 'users.id')
                  ->where('spa_membership.trang_thai', 'active');
            });
        } elseif ($target === 'vip') {
            $query->where('customer_level', 'vip');
        } elseif ($target === 'birthday_month') {
            $currentMonth = now()->month;
            $query->whereRaw('MONTH(birthday) = ?', [$currentMonth]);
        }

        return $query->count();
    }
}
