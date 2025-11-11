<?php

namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WhmcsHostingProductController extends Controller
{
    public function apiList(Request $request)
    {
        try {
            // Mock data for now
            $data = [
                [
                    'id' => 1,
                    'name' => 'Basic Hosting',
                    'description' => 'Perfect for small websites and blogs',
                    'disk_space' => 5000, // 5GB in MB
                    'bandwidth' => 50, // GB
                    'email_accounts' => 10,
                    'databases' => 5,
                    'ftp_accounts' => 5,
                    'subdomains' => 10,
                    'parked_domains' => 2,
                    'addon_domains' => 1,
                    'ssl_enabled' => true,
                    'daily_backups' => true,
                    'billing_cycle' => 'monthly',
                    'price' => 99000,
                    'setup_fee' => 0,
                    'is_active' => true,
                    'sort_order' => 1,
                    'created_at' => now()->subDays(60),
                    'updated_at' => now(),
                ],
                [
                    'id' => 2,
                    'name' => 'Pro Hosting',
                    'description' => 'For growing businesses and e-commerce',
                    'disk_space' => 20000, // 20GB
                    'bandwidth' => 200,
                    'email_accounts' => 50,
                    'databases' => 20,
                    'ftp_accounts' => 20,
                    'subdomains' => 50,
                    'parked_domains' => 10,
                    'addon_domains' => 5,
                    'ssl_enabled' => true,
                    'daily_backups' => true,
                    'billing_cycle' => 'monthly',
                    'price' => 299000,
                    'setup_fee' => 0,
                    'is_active' => true,
                    'sort_order' => 2,
                    'created_at' => now()->subDays(60),
                    'updated_at' => now(),
                ],
                [
                    'id' => 3,
                    'name' => 'Enterprise Hosting',
                    'description' => 'Maximum performance for large applications',
                    'disk_space' => 100000, // 100GB
                    'bandwidth' => 1000,
                    'email_accounts' => 200,
                    'databases' => 100,
                    'ftp_accounts' => 100,
                    'subdomains' => 200,
                    'parked_domains' => 50,
                    'addon_domains' => 20,
                    'ssl_enabled' => true,
                    'daily_backups' => true,
                    'billing_cycle' => 'annually',
                    'price' => 5990000,
                    'setup_fee' => 500000,
                    'is_active' => true,
                    'sort_order' => 3,
                    'created_at' => now()->subDays(60),
                    'updated_at' => now(),
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Danh sách gói hosting'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    public function apiDetail($id)
    {
        try {
            $product = [
                'id' => $id,
                'name' => 'Hosting Package ' . $id,
                'description' => 'Package description',
                'disk_space' => 5000,
                'bandwidth' => 50,
                'email_accounts' => 10,
                'databases' => 5,
                'ftp_accounts' => 5,
                'subdomains' => 10,
                'parked_domains' => 2,
                'addon_domains' => 1,
                'ssl_enabled' => true,
                'daily_backups' => false,
                'billing_cycle' => 'monthly',
                'price' => 99000,
                'setup_fee' => 0,
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            return response()->json([
                'success' => true,
                'data' => $product
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    public function apiAdd(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'disk_space' => 'required|integer|min:0',
                'bandwidth' => 'required|integer|min:0',
                'email_accounts' => 'required|integer|min:0',
                'databases' => 'required|integer|min:0',
                'ftp_accounts' => 'required|integer|min:0',
                'subdomains' => 'required|integer|min:0',
                'parked_domains' => 'required|integer|min:0',
                'addon_domains' => 'required|integer|min:0',
                'billing_cycle' => 'required|in:monthly,quarterly,semi-annually,annually',
                'price' => 'required|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            return response()->json([
                'success' => true,
                'message' => 'Thêm gói hosting thành công',
                'data' => [
                    'id' => rand(100, 999),
                    ...$request->all()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    public function apiUpdate(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'string|max:255',
                'disk_space' => 'integer|min:0',
                'bandwidth' => 'integer|min:0',
                'email_accounts' => 'integer|min:0',
                'databases' => 'integer|min:0',
                'ftp_accounts' => 'integer|min:0',
                'subdomains' => 'integer|min:0',
                'parked_domains' => 'integer|min:0',
                'addon_domains' => 'integer|min:0',
                'billing_cycle' => 'in:monthly,quarterly,semi-annually,annually',
                'price' => 'numeric|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật gói hosting thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    public function apiDelete($id)
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Xóa gói hosting thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }
}
