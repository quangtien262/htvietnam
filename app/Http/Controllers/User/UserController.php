<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\ChangePassRequest;
use App\Http\Requests\User\ChangeProfileRequest;
use App\Http\Requests\User\TakePasswordRequest;
use App\Models\Aitilen\HopDong;
use App\Models\User;
use App\Models\Web\Orders;
use App\Models\Web\WebConfig;
use App\Services\Admin\TblService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserController extends Controller
{
public function index()
    {
        $config = WebConfig::query()->find(1);
        $user = Auth::guard('web')->user();
        // $hopDong = HopDong::where('user_id', $user->id)->count();
        // hoa_don
        $props = [
            'config' => $config,
            'user' => $user,
        ];
        return Inertia::render('User/Pages/home_aitilen', $props);
    }
    public function profile(Request $request)
    {
        $config = WebConfig::query()->find(1);
        $user = Auth::guard('web')->user();
        $props = [
            'config' => $config,
            'user' => $user,
        ];
        return Inertia::render('user/pages/home', $props);
    }
    public function edit()
    {
        $config = WebConfig::query()->find(1);
        return view('user.profile.edit',compact('config'));
    }
    public function setting()
    {
        $config = WebConfig::query()->find(1);
        return view('user.profile.setting',compact('config'));
    }

    public function update(ChangeProfileRequest $request)
    {
        try {
            $user = Auth::guard('web')->user();
            $user->name = $request->name;
            $user->gender = $request->gender;
            $user->phone = $request->phone;
            $user->birthday = $request->birthday;
            $user->address = $request->address;
            $file = $request->image;
            if ($request->hasFile('image')) {
                $fileExtension = $file->getClientOriginalName();
                //Lưu file vào thư mục storage/app/public/image với tên mới
                $request->file('image')->storeAs('public/images/user', time() . $fileExtension);
                // Gán trường image của đối tượng task với tên mới
                $user->image = time() . $fileExtension;
            }
            $user->save();
            return redirect()->route('profile')->with('status', 'Đổi thông tin thành công !');
        } catch (\Throwable $th) {
            throw $th;
        }
    }
    public function updatepass(ChangePassRequest $request)
    {
        if ($request->renewpassword == $request->newpassword) {
            if ((Hash::check($request->password, Auth::guard('web')->user()->password))) {
                $item = Auth::guard('web')->user();
                $item->password = bcrypt($request->newpassword);
                $item->save();
                return redirect()->route('setting')->with('status', 'Đổi mật khẩu thành công !');
            }
            return redirect()->back()->with('error', 'Mật khẩu hiện tại không chính xác !');
        }
        return redirect()->back()->with('error', 'Xác nhận mật khẩu không trùng khớp !');
    }
    public function order()
    {
        $config = WebConfig::query()->find(1);
        $items = DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->join('products', 'orders.product_id', '=', 'products.id')
            ->select('orders.*', 'users.address', 'products.name')
            ->paginate(30);
        return view('user.order.index', compact('items','config'));
    }
    public function detail($id)
    {
        $config = WebConfig::query()->find(1);
        $items = DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->join('products', 'orders.product_id', '=', 'products.id')
            ->select('orders.*', 'users.address', 'products.name')
            ->where('orders.id', '=', $id)->first();
        return view('user.order.detail', compact('items','config'));
    }

    public function takePassword(TakePasswordRequest $request)
    {
        $user = DB::table('users')->where('email', $request->email)->first();
        if (!$user) {
            return redirect()->route('takepassword')->with('error', 'Vui lòng nhập đúng email đăng kí của bạn !');
        }
        if ($user->email == $request->email) {
            try {

                $password = Str::random(8);
                $item = User::find($user->id);
                $item->password = bcrypt($password);
                $item->save();
                $params = [
                    'name' => $user->name,
                    'password' => $password,
                ];
                Mail::send('user.takepassword.mailuserPass', compact('params'), function ($email) use ($user) {
                    $email->subject('Xacnhanmatkhau');
                    $email->to($user->email, $user->name);
                });
                return redirect()->route('login')->with('status', 'Vui lòng kiểm tra email để nhận mật khẩu mới !');
            } catch (\Exception $e) {
            }
        }
    }

    function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('home');
    }
}
