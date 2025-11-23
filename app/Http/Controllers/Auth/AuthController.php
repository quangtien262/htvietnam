<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\Auth\LoginRequest;
// use App\Providers\RouteServiceProvider;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Web\Landingpage;
use App\Services\Admin\TblService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Events\Registered;
use thiagoalessio\TesseractOCR\TesseractOCR;

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
            return redirect()->route('dashboard', ['p' => 'home'])->with('status', 'Đăng nhập thành công');
            // return $this->sendSuccessResponse(['role' => 'admin'], 'Đăng nhập thành công!');
        }

        if (Auth::guard('web')->attempt($request->only('username', 'password'), true)) {
            return redirect()->route('user.index')->with('status', 'Đăng nhập thành công');
        }

        return back()->with('error', 'Tên đăng nhập hoặc mật khẩu không đúng');
    }

    public function postLogin_api(Request $request)
    {


        // if (Auth::guard('admin_users')->attempt($request->only('username', 'password'), $request->filled('remember'))) {
        if (Auth::guard('admin_users')->attempt($request->only('username', 'password'), true)) {
            // save table 2 session
            // $tables = TblService::getAdminMenu(0);
            return $this->sendSuccessResponse(['role' => 'admin'], 'You are Logged in as admin!');
        }

        // check user existence
        //Authentication passed...
        $user = User::where('username', $request->username)->first();

        // sai tên đăng nhập
        if (empty($user)) {
            return $this->sendErrorResponse('Tên đăng nhập hoặc mật khẩu không đúng');
        }

        // trường hợp require_changepw thì yêu cầu đổi mật khẩu mới luôn
        if ($user->require_changepw == 1) {
            return $this->sendSuccessResponse(['change_pw' => true, 'role' => 'user', 'username' => $user->username]);
            // Auth::guard('web')->login($customer);
        }

        // check pw correctness
        if ($user->password != bcrypt($request->password)) {
            // return $this->sendErrorResponse('Mật khẩu đăng nhập không đúng');
        }

        // LOGIN AS USER
        if (Auth::guard('web')->attempt($request->only('username', 'password'), true)) {
            return $this->sendSuccessResponse(['role' => 'user'], 'You are Logged in as user!');
        }

        return $this->sendErrorResponse('Tên đăng nhập hoặc mật khẩu không đúng');
    }

//phamthid
    /**
     * Summary of requireChangePassword
     * @param Request $request: username, password_new, password_confirm
     * @return \Illuminate\Http\JsonResponse
     */
    public function requireChangePassword(Request $request)
    {
        $user = User::where('username', $request->username_changepw)->first();

        if (empty($user)) {
            return $this->sendErrorResponse('Không tìm thấy người dùng');
        }

        // check passwords match
        if ($request->password_new !== $request->password_confirm) {
            return $this->sendErrorResponse('Mật khẩu mới và xác nhận mật khẩu không khớp');
        }

        // update password
        $user->password = bcrypt($request->password_new);
        $user->require_changepw = 0;
        $user->save();

        // login user
        Auth::guard('web')->login($user);

        return $this->sendSuccessResponse(['role' => 'user'], 'Đã đổi mật khẩu thành công, đang chuyển hướng...');
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

    /**
     * Display the register view.
     *
     * @return view
     */
    public function postRegister_api(Request $request)
    {
        // Kiểm tra trùng email, username, phone
        $existUser = User::where('username', $request->username)
            ->orWhere('phone', $request->phone)
            ->first();
        if ($existUser) {
            return $this->sendErrorResponse('Số điện thoại đã được đăng ký');
        }

        // Trường hợp đăng ký bằng ảnh CCCD
        if ($request->input_method === 'camera') {
            if (!$request->hasFile('cccd_front') || !$request->hasFile('cccd_back')) {
                return $this->sendErrorResponse('Vui lòng upload đủ 2 mặt ảnh CCCD');
            }

            // Lưu file ảnh
            $frontPath = $request->file('cccd_front')->store('cccd', 'public');
            $backPath = $request->file('cccd_back')->store('cccd', 'public');
            // Kiểm tra file tồn tại và lấy realpath (Windows cần chuyển \ -> /)
            $frontFull = 'files/' . $frontPath;
            $backFull  = 'files/' . $backPath;

            if (!file_exists($frontFull) || !file_exists($backFull)) {
                return $this->sendErrorResponse('File ảnh CCCD không tìm thấy trên server');
            }

            $frontReal = realpath($frontFull);
            $backReal  = realpath($backFull);
            // đảm bảo dùng dấu / để tránh một số kiểm tra của thư viện
            $frontReal = str_replace('\\', '/', $frontReal);
            $backReal  = str_replace('\\', '/', $backReal);

            // Kiểm tra Tesseract có cài trên hệ thống
            exec('tesseract --version', $tOut, $tRet);
            if ($tRet !== 0) {
                return $this->sendErrorResponse('Tesseract OCR chưa được cài hoặc không khả dụng trên server');
            }

            // Đọc thông tin từ ảnh CCCD bằng Tesseract OCR
            $frontText = (new TesseractOCR($frontReal))->lang('vie')->run();
            $backText  = (new TesseractOCR($backReal))->lang('vie')->run();
            // echo $frontText;
            // echo $backText;
            // die;
            $noi_cap = '';
            if (preg_match('/Nơi cấp[:\- ]*(.+)/i', $backText, $matches)) {
                $noi_cap = trim($matches[1]);
            }

            // Số CCCD
            $cccd = '';
            if (preg_match('/(?:ms|ss)[:\s]*([0-9]{9,12})/i', $frontText, $matches)) {
                $cccd = $matches[1];
            }
            if (!$cccd && preg_match('/\b[0-9]{9,12}\b/', $frontText, $matches)) {
                $cccd = $matches[0];
            }

            // Họ tên
            $hoTen = '';
            if (preg_match('/Họ và tên\s*\/\s*Full name:\s*([^\n]+)/iu', $frontText, $matches)) {
                $hoTen = trim($matches[1]);
            } elseif (preg_match('/Full name:\s*([^\n]+)/iu', $frontText, $matches)) {
                $hoTen = trim($matches[1]);
            }

            // Ngày sinh
            $ngaySinh = '';
            if (preg_match('/Ngày sinh\s*\/\s*Dafe of birth:\s*(\d{2}\/\d{2}\/\d{4})/iu', $frontText, $matches)) {
                $ngaySinh = $matches[1];
            } elseif (preg_match('/Date of birth:\s*(\d{2}\/\d{2}\/\d{4})/iu', $frontText, $matches)) {
                $ngaySinh = $matches[1];
            }

            // Nơi thường trú
            $hktt = '';
            if (preg_match('/Nơi thường trú\s*\/\s*Place of residence:\s*([^\n<]+)/iu', $frontText, $matches)) {
                $hktt = trim($matches[1]);
            } elseif (preg_match('/Place of residence:\s*([^\n<]+)/iu', $frontText, $matches)) {
                $hktt = trim($matches[1]);
            }

            $ngay_cap = '';
            if (preg_match('/Ngày cấp\s*[:\- ]*(\d{2}\/\d{2}\/\d{4})/iu', $backText, $matches)) {
                $ngay_cap = $matches[1];
            } elseif (preg_match('/Date of issue\s*[:\- ]*(\d{2}\/\d{2}\/\d{4})/iu', $backText, $matches)) {
                $ngay_cap = $matches[1];
            }

            $hoTen = '';
            if (preg_match('/Họ và tên\s*\/\s*Full name:\s*:?\s*([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠ-ỹ\s]+)\s*[\n\r]/iu', $frontText, $matches)) {
                $hoTen = trim($matches[1]);
            } elseif (preg_match('/Full name:\s*:?\s*([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠ-ỹ\s]+)\s*[\n\r]/iu', $frontText, $matches)) {
                $hoTen = trim($matches[1]);
            }

            $user = new User();
            $user->username = $request->username;
            $user->phone = $request->username;
            $user->password = bcrypt($request->password);
            $user->user_type = env('USER_TYPE', 'Aitilen');
            $user->cccd_front = $frontPath;
            $user->cccd_back = $backPath;
            $user->cccd = $cccd;
            $user->name = $hoTen;
            $user->email = $request->email;
            $user->user_type = env('USER_TYPE', 'Aitilen');

            // Xử lý ngày cấp
            if ($ngay_cap && preg_match('/\d{2}\/\d{2}\/\d{4}/', $ngay_cap)) {
                $parts = explode('/', $ngay_cap);
                $user->ngay_cap = $parts[2] . '-' . $parts[1] . '-' . $parts[0];
            } else {
                $user->ngay_cap = null;
            }

            $user->noi_cap = $noi_cap;
            $user->hktt = $hktt;
            $user->save();

            Auth::guard('web')->login($user);

            return $this->sendSuccessResponse(['user' => $user], 'Đăng ký thành công bằng CCCD');
        }

        // Trường hợp nhập thủ công
        if ($request->input_method === 'manual') {
            $user = new User();
            $user->name = $request->name;
            $user->email = $request->email;
            $user->phone = $request->username;
            $user->username = $request->username;
            $user->password = bcrypt($request->password);

            $user->cccd = $request->cccd;
            $user->ngay_cap = $request->ngay_cap;
            $user->noi_cap = $request->noi_cap;
            $user->hktt = $request->hktt;
            $user->address = $request->hktt;

            // user type: aitilen, htvietnam, spa, tmdt, step
            $user->user_type = env('USER_TYPE', 'Aitilen');

            $user->save();

            Auth::guard('web')->login($user);

            return $this->sendSuccessResponse(['user' => $user], 'Đăng ký thành công');
        }

        return $this->sendErrorResponse('Vui lòng chọn phương thức đăng ký hợp lệ');
    }

    public function logoutUser()
    {
        Auth::guard('web')->logout();
        return redirect()
            ->route('home')
            ->with('status', 'User has been logged out!');
    }

    public function logoutAdmin()
    {
        Auth::guard('admin_users')->logout();
        return redirect()
            ->route('home')
            ->with('status', 'Admin has been logged out!');
    }



    public function loginExpress(Request $request)
    {
        if (empty($request->id)) {
            return $this->sendErrorResponse('empty');
        }
        $customer = User::find($request->id);
        if (!$customer) {
            return $this->sendErrorResponse('not_found');
        }
        // Login as customer
        Auth::guard('web')->login($customer);
        return $this->sendSuccessResponse('success');
    }
}
