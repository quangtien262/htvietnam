<?php

namespace App\Services\LandingpageData;

use Exception;

class Land
{
    const COMMENT =[
        'display_name' =>'Tên người comment',
        'type' =>'text',
    ];
    const DIEU_HUONG = [
        'display_name' =>'Thanh đổi hướng',
        'type' =>'text',
    ];
    const NAVIGATION =[
        'display_name' =>'Đường dẫn chi tiết (nếu có)',
        'type' =>'text',
    ];
    const NAME_DEFAULT = [
        'display_name' => 'Tiêu đề',
        'type' => 'text',
    ];
    const DE_NAME_DEFAULT = [
        'display_name' => 'Mô tả tiêu đề',
        'type' => 'text',
    ];
    const NAME_C = [
        'display_name' => 'Tiêu đề',
        'type' => 'text',
    ];
    const SUB_TITLE_DEFAULT = [
        'display_name' => 'Mô tả',
        'type' => 'text',
    ];
    const LINK_Youtube = [
        'display_name' => 'Link từ Youtube',
        'type' => 'text',
    ];
    const DES_DEFAULT = [
        'display_name' => 'Mô tả',
        'type' => 'textarea',
    ];
    const DES_EDITOR = [
        'display_name' => 'Mô tả',
        'type' => 'editor',
    ];
    const DES_EDITOR_COMMENT = [
        'display_name' => 'Nội dung bình luận',
        'type' => 'editor',
    ];
    const JSON_DEFAULT = [
        'display_name' => 'Nội dung',
        'setting' => [
            'key' => ['display_name' => 'Mô tả 01', 'type' => 'text'],
            'value' => ['display_name' => 'Mô tả 02', 'type' => 'text'],
        ]
    ];
    const JSON_JSON = [
        'display_name' => 'Comment',
        'setting' => [
            'name' => ['display_name' => 'Tên', 'type' => 'text'],
            'company' => ['display_name' => 'Công ty', 'type' => 'text'],
            'value' => ['display_name' => 'Nội dung', 'type' => 'text'],
        ]
    ];
    const JSON_D = [
        'display_name' => 'Nội dung',
        'setting' => [
            'title' => ['display_name' => 'Tiêu đề', 'type' => 'text'],
            'value' => ['display_name' => 'Nội dung', 'type' => 'text'],
        ]
    ];
    const JSON_DEFAULT1 = [
        'display_name' => 'Nội dung',
        'setting' => [
            'value' => ['display_name' => 'Mô tả 02', 'type' => 'text'],
        ]
    ];
    const JSON_02 = [
        'display_name' => 'Nội dung',
        'setting' => [
            'image' => ['display_name' => 'Ảnh tỷ lệ 1:1', 'type' => 'image'],
            'title' => ['display_name' => 'Tiêu đề', 'type' => 'textarea'],
            'value' => ['display_name' => 'Mô tả', 'type' => 'textarea'],
        ]
    ];
    const COL_DEFAULT = [
        'name' => self::NAME_DEFAULT,
        'sub_title' => self::SUB_TITLE_DEFAULT,
        'sub_title01' => self::NAME_DEFAULT,
        'sub_title02' => self::NAME_DEFAULT,
        'sub_title03' => self::NAME_DEFAULT,
        'sub_title04' => self::NAME_DEFAULT,
        'description01' => self::DES_DEFAULT,
        'description02' => self::DES_DEFAULT,
        'description03' => self::DES_DEFAULT,
        'description04' => self::DES_DEFAULT,
    ];

    const CHECKBOX_SHOW_REGIS = [
        'display_name' => 'Hiển thị nút "Đăng Ký"',
        'type' => 'checkbox',
    ];

    const CHECKBOX_SHOW_HOTLINE = [
        'display_name' => 'Hiển thị "HOTLINE"',
        'type' => 'checkbox',
    ];

    const IMAGE_DEFAULT = [
        'display_name' => 'Nội dung',
        'setting' => [
            'key' => ['display_name' => 'Mô tả 01', 'type' => 'text'],
        ]
    ];
}
