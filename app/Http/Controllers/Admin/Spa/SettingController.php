<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingController extends Controller
{
    /**
     * Get all spa settings
     */
    public function get(Request $request)
    {
        try {
            $settings = DB::table('spa_settings')->first();

            if (!$settings) {
                // Return default settings if none exist
                return response()->json([
                    'success' => true,
                    'data' => [
                        'general' => [],
                        'business' => [],
                        'payment' => [],
                        'notification' => [],
                        'loyalty' => [],
                    ],
                ]);
            }

            // Parse JSON fields
            $data = [
                'general' => json_decode($settings->general ?? '{}', true),
                'business' => json_decode($settings->business ?? '{}', true),
                'payment' => json_decode($settings->payment ?? '{}', true),
                'notification' => json_decode($settings->notification ?? '{}', true),
                'loyalty' => json_decode($settings->loyalty ?? '{}', true),
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể tải cấu hình: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update spa settings
     */
    public function update(Request $request)
    {
        try {
            $category = $request->input('category');
            $settings = $request->input('settings', []);

            // Check if settings record exists
            $existing = DB::table('spa_settings')->first();

            if ($existing) {
                // Update existing record
                DB::table('spa_settings')->update([
                    $category => json_encode($settings),
                    'updated_at' => now(),
                ]);
            } else {
                // Create new record
                $data = [
                    'general' => '{}',
                    'business' => '{}',
                    'payment' => '{}',
                    'notification' => '{}',
                    'loyalty' => '{}',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $data[$category] = json_encode($settings);

                DB::table('spa_settings')->insert($data);
            }

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật cấu hình thành công',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể cập nhật cấu hình: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload image (for logo, etc.)
     */
    public function uploadImage(Request $request)
    {
        try {
            if (!$request->hasFile('image')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không có file được upload',
                ], 400);
            }

            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('spa/settings', $filename, 'public');

            return response()->json([
                'success' => true,
                'url' => '/storage/' . $path,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload thất bại: ' . $e->getMessage(),
            ], 500);
        }
    }
}
