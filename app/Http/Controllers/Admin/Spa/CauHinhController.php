<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CauHinhController extends Controller
{
    public function index()
    {
        $settings = DB::table('spa_cau_hinh')->get();

        // Convert to key-value pairs
        $config = [];
        foreach ($settings as $setting) {
            $config[$setting->config_key] = $setting->config_value;
        }

        return $this->sendSuccessResponse($config);
    }

    public function show($key)
    {
        $setting = DB::table('spa_cau_hinh')
            ->where('config_key', $key)
            ->first();

        if (!$setting) {
            return $this->sendErrorResponse('Không tìm thấy cấu hình', 404);
        }

        return $this->sendSuccessResponse($setting);
    }

    public function update(Request $request)
    {
        $request->validate(['settings' => 'required|array']);

        foreach ($request->settings as $key => $value) {
            DB::table('spa_cau_hinh')->updateOrInsert(
                ['config_key' => $key],
                [
                    'config_value' => $value,
                    'updated_at' => now(),
                ]
            );
        }

        return $this->sendSuccessResponse(null, 'Cập nhật cấu hình thành công');
    }

    public function updateSingle(Request $request, $key)
    {
        $request->validate(['value' => 'required']);

        DB::table('spa_cau_hinh')->updateOrInsert(
            ['config_key' => $key],
            [
                'config_value' => $request->value,
                'updated_at' => now(),
            ]
        );

        return $this->sendSuccessResponse(null, 'Cập nhật thành công');
    }

    public function destroy($key)
    {
        DB::table('spa_cau_hinh')->where('config_key', $key)->delete();
        return $this->sendSuccessResponse(null, 'Xóa cấu hình thành công');
    }

    // Predefined config keys
    public function getDefaults()
    {
        $defaults = [
            'booking_advance_days' => 30,
            'booking_cancel_hours' => 24,
            'working_hours_start' => '08:00',
            'working_hours_end' => '22:00',
            'commission_rate_ktv' => 30,
            'tax_rate' => 10,
            'loyalty_points_rate' => 1,
            'currency' => 'VND',
            'timezone' => 'Asia/Ho_Chi_Minh',
        ];

        return $this->sendSuccessResponse($defaults);
    }
}
