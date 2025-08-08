<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Web\Landingpage;
use App\Services\Admin\TblService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Events\Registered;

class AuthController extends Controller
{
    /**
     * Display the login view.
     *
     * @return view
     */
    public function login(Request $request)
    {
        $config = app('Helper')->getConfig();
        $message = $request->session()->all();
        $menuId = 0;
        return View('auth.login', compact('config', 'message', 'menuId'));
    }

// public function postLogin(LoginRequest $request)
    public function postLogin(Request $request)
    {
        //Authentication passed...

        // if (Auth::guard('admin_users')->attempt($request->only('username', 'password'), $request->filled('remember'))) {
        if (Auth::guard('admin_users')->attempt($request->only('username', 'password'), true)) {
            //save table 2 session
            // $tables = TblService::getAdminMenu(0);
            return redirect()
                ->intended(route('dashboard'))
                ->with('status', 'You are Logged in as Admin!');
        }

        if (Auth::guard('web')->attempt($request->only('username', 'password'), true)) {
            return redirect()
                ->intended(route('home'))
                ->with('status', 'You are Logged in as web!');
        }

        return back()->with('error', 'Tên đăng nhập hoặc mật khẩu không đúng');
    }

    /**
     * Display the register view.
     *
     * @return view
     */
    public function register(Request $request)
    {
        $config = app('Helper')->getConfig();
        $message = $request->session()->all();
        $menuId = 0;
        return View('auth.register', compact('config', 'message', 'menuId'));
    }

    /**
     * Display the register view.
     *
     * @return view
     */
    public function postRegister(RegisterRequest $request)
    {
        $user = new User();
        $user->name = $request->name;
        $user->username = $request->email;
        $user->email = $request->email;
        $user->phone = $request->phone;
        $user->password = bcrypt($request->password);
        $user->save();
        if (Auth::guard('web')->attempt($request->only('email', 'password'), true)) {
            try {
                event(new Registered($user));
            } catch (\Throwable $th) {
                //throw $th;
            }
        }
        return redirect()->route('home')->with('status', 'Đăng nhập thành công');
    }

    public function logout()
    {
        Auth::guard('web')->logout();
        return redirect()
            ->route('home')
            ->with('status', 'Admin has been logged out!');
    }

    public function logoutAdmin()
    {
        Auth::guard('admin_users')->logout();
        return redirect()
            ->route('home')
            ->with('status', 'Admin has been logged out!');
    }
}
