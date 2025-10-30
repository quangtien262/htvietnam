<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ContactRequest extends FormRequest
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
            'phone' => 'required|min:10|max:10',
            'content' => 'required|min:10|max:500',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Vui lòng nhập họ tên',
            'name.min' =>  'Họ tên tối thiểu là 5 ký tự',
            'name.max' =>  'Họ tên không được vượt quá là 100 ký tự',
            'email.required' => 'Vui lòng nhập địa chỉ email',
            'email.email' => __('validation.email', ['attribute' => __('user.email')]),
            'email.unique' => 'Địa chỉ email này đã tồn tại',
            'phone.required' =>  'Vui lòng nhập số điện thoại',
            'phone.min' =>  'Số điện thoại tối thiểu là 10 ký tự',
            'phone.max' =>  'Số điện thoại không được vượt quá 10 ký tự',
            'content.required' =>  'Vui lòng nhập nội dung liên hệ',
            'content.min' =>  'Nội dung tối thiểu là 10 ký tự',
            'content.max' =>  'Nội dung không được vượt quá là 500 ký tự',
        ];
    }
}
