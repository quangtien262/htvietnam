<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'name' => 'required|min:5|max:100',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|max:100',
            'phone' => 'required|min:10|max:10',
            'password_confirm' => 'required|min:8|max:100',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Vui lòng nhập họ tên',
            'name.min' =>  'Họ tên tối thiểu là 5 ký tự',
            'name.max' =>  'Họ tên tối thiểu là 100 ký tự',

            'email.required' => 'Vui lòng nhập địa chỉ email',
            'email.email' => 'Định dạng email không đúng',
            'email.unique' => 'Địa chỉ email này đã tồn tại',

            'phone.required' =>  'Vui lòng nhập số điện thoại',
            'phone.min' =>  'Số điện thoại tối thiểu là 10 ký tự',
            'phone.max' =>  'Số điện thoại tối thiểu là 10 ký tự',

            'password.required' =>  'Vui lòng nhập mật khẩu',
            'password.min' => 'Mật khẩu tối thiểu là 8 ký tự',
            'password.max' => 'Mật khẩu tối đa là 100 ký tự',
            
            'password_confirm.required' => 'Vui lòng nhập mật khẩu xác nhận',
            'password_confirm.min' => 'Mật khẩu tối thiểu là 8 ký tự',
            'password_confirm.max' => 'Mật khẩu tối đa là 100 ký tự',
        ];
    }
}
