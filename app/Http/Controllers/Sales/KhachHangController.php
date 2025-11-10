<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class KhachHangController extends Controller
{
    public function index(Request $request)
    {
        $query = User::khachHang()->with('nhanVienPhuTrach');

        if ($request->nhom) {
            $query->where('nhom_khach_hang', $request->nhom);
        }

        if ($request->keyword) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%'.$request->keyword.'%')
                  ->orWhere('phone', 'like', '%'.$request->keyword.'%')
                  ->orWhere('email', 'like', '%'.$request->keyword.'%')
                  ->orWhere('ma_khach_hang', 'like', '%'.$request->keyword.'%');
            });
        }

        $khachHangs = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['message' => 'success', 'data' => $khachHangs]);
    }

    public function store(Request $request)
    {
        $data = $request->all();
        
        // Set role khách hàng
        $data['role'] = 'khach_hang';
        
        // Mã khách hàng sẽ auto-generate trong model
        
        // Tạo username từ phone hoặc email nếu không có
        if (empty($data['username'])) {
            $data['username'] = $data['phone'] ?? $data['email'];
        }
        
        // Set password mặc định nếu không có
        if (empty($data['password'])) {
            $data['password'] = Hash::make('123456'); // Password mặc định
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $khachHang = User::create($data);
        
        return response()->json(['message' => 'success', 'data' => $khachHang]);
    }

    public function update(Request $request, $id)
    {
        $khachHang = User::khachHang()->findOrFail($id);
        
        $data = $request->all();
        
        // Nếu có password mới thì hash
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']); // Không update password nếu không có
        }
        
        $khachHang->update($data);
        
        return response()->json(['message' => 'success', 'data' => $khachHang]);
    }

    public function destroy($id)
    {
        User::khachHang()->findOrFail($id)->delete();
        return response()->json(['message' => 'success']);
    }
}
