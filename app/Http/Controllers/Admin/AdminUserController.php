<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Admin\Table;
use App\Services\Admin\TblService;
use Illuminate\Support\Facades\Auth;

class AdminUserController extends Controller
{

    public function dashboard(Request $request)
    {
        // dd($soLuongSPTheoLoai);
        $viewData = [
        ];
        return Inertia::render('Admin/Dashboard/nhan_su', $viewData);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function index()
    {
        $table = Table::where('name', 'admin_users')->first();
        $user = Auth::guard('admin_users')->user();
        $viewData = TblService::getDataDetail($table->id, $user->id);
        return Inertia::render('Admin/Profile/detail', $viewData);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function edit()
    {
        $table = Table::where('name', 'admin_users')->first();
        $user = Auth::guard('admin_users')->user();
        $viewData = TblService::getDataEdit($table->id, $user->id);
        return Inertia::render('Admin/Profile/edit', $viewData);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function changePassword()
    {
        $table = Table::where('name', 'admin_users')->first();
        $user = Auth::guard('admin_users')->user();
        $viewData = TblService::getDataEdit($table->id, $user->id);
        return Inertia::render('Admin/Profile/change_password', $viewData);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function logout()
    {
        Auth::guard('admin_users')->logout();
        return redirect()
            ->route('home')
            ->with('status', 'Admin has been logged out!');
    }
}
