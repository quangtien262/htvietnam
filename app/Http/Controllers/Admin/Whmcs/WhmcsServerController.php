<?php

namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WhmcsServerController extends Controller
{
    public function apiList(Request $request)
    {
        try {
            // Mock data for now - replace with actual database queries later
            $data = [
                [
                    'id' => 1,
                    'name' => 'Server 1',
                    'type' => 'cpanel',
                    'hostname' => 'server1.example.com',
                    'ip_address' => '192.168.1.100',
                    'port' => 2087,
                    'username' => 'root',
                    'max_accounts' => 100,
                    'current_accounts' => 45,
                    'nameserver1' => 'ns1.example.com',
                    'nameserver2' => 'ns2.example.com',
                    'notes' => 'Main cPanel server',
                    'is_active' => true,
                    'created_at' => now()->subDays(30),
                    'updated_at' => now(),
                ],
                [
                    'id' => 2,
                    'name' => 'Server 2',
                    'type' => 'plesk',
                    'hostname' => 'server2.example.com',
                    'ip_address' => '192.168.1.101',
                    'port' => 8443,
                    'username' => 'admin',
                    'max_accounts' => 50,
                    'current_accounts' => 20,
                    'nameserver1' => 'ns3.example.com',
                    'nameserver2' => 'ns4.example.com',
                    'notes' => 'Plesk backup server',
                    'is_active' => true,
                    'created_at' => now()->subDays(20),
                    'updated_at' => now(),
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Danh sách server'
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
            // Mock data
            $server = [
                'id' => $id,
                'name' => 'Server ' . $id,
                'type' => 'cpanel',
                'hostname' => 'server' . $id . '.example.com',
                'ip_address' => '192.168.1.' . (100 + $id),
                'port' => 2087,
                'username' => 'root',
                'max_accounts' => 100,
                'current_accounts' => 45,
                'nameserver1' => 'ns1.example.com',
                'nameserver2' => 'ns2.example.com',
                'notes' => 'Server detail',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            return response()->json([
                'success' => true,
                'data' => $server
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
                'type' => 'required|in:cpanel,plesk,directadmin,custom',
                'hostname' => 'required|string|max:255',
                'ip_address' => 'required|ip',
                'port' => 'required|integer',
                'username' => 'required|string|max:255',
                'password' => 'required|string',
                'max_accounts' => 'required|integer|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Mock success response
            return response()->json([
                'success' => true,
                'message' => 'Thêm server thành công',
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
                'type' => 'in:cpanel,plesk,directadmin,custom',
                'hostname' => 'string|max:255',
                'ip_address' => 'ip',
                'port' => 'integer',
                'username' => 'string|max:255',
                'max_accounts' => 'integer|min:0',
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
                'message' => 'Cập nhật server thành công'
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
                'message' => 'Xóa server thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    public function apiTestConnection($id)
    {
        try {
            // Mock test connection - in real implementation, test actual connection
            sleep(1); // Simulate connection delay

            $success = rand(0, 1); // Random success/fail for demo

            if ($success) {
                return response()->json([
                    'success' => true,
                    'message' => 'Kết nối server thành công!'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể kết nối đến server. Vui lòng kiểm tra thông tin đăng nhập.'
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }
}
