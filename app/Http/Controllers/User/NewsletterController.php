<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Web\NewsletterSubcriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NewsletterController extends Controller
{

    public function addSubcriber(Request $request)
    {
        $validate = $request->validate(['subcriber_email' => 'required|email']);
        $data = $request->all();

        if ($validate) {
            $subscriberCount = NewsletterSubcriber::where('email', $data['subcriber_email'])->count();
        }
        if ($subscriberCount > 0) {
            return redirect()->route('home')->with('error', 'Email đã được sử dụng');
        } else {
            $newsletter = new NewsletterSubcriber;
            $newsletter->email = $data['subcriber_email'];
            $newsletter->status = 1;
            $newsletter->save();
            return redirect()->route('home')->with('success', 'Đăng kí thành công!');
        }
    }
}
