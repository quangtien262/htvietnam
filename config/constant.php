<?php

return [
    'config_file' => '../config/seeder.json',
    'return' => [
        'success' => 'success',
        'error' => 'error',
        'warning' => 'warning',
    ],
    'routes' => [
        'web.news' => 'News list',
        'web.video' => 'Video list'
    ],
    'item_of_pages' => 30,
    'msg' => [
        'update_sort_order_success' => 'Cập nhật thứ tự thành công',
        'update_sort_order_error' => 'Cập nhật thứ tự thất bại',
    ],
    'type_edit' => [
        'basic' => 0,
        'drag_drop' => 1,
        'drag_drop_multiple' => 8,
        '1data' => 5,
        'landingpage' => 3,
        'block' => 4,
        'calendar' => 6,
        'file_manager' => 7
	],
    'type_show' => [
        'basic' => 0,
        'drag_drop' => 1,
        'drag_drop_multiple' => 8,
        '1data' => 5,
        'landingpage' => 3,
        'block' => 4,
        'calendar' => 6,
        'file_manager' => 7
	],

    'config_table' => [
        'type_show' => [
            0 => 'Table basic',
            1 => 'Kiểu kéo thả bảng',
            6 => 'Calendar',
            7 => 'File manager',
            8 => 'Kiểu kéo thả đa cấp',
            3 => 'Landingpage',
            4 => 'Block for Landingpage',
            5 => 'Chỉ có 1 data master',
        ],
        'data_type' => [
            1 => 'Mở sang 1 cửa sổ mới',
            2 => 'Mở dưới dang popup',
        ],
        'columl_type' => ['INT', 'VARCHAR', 'TEXT', 'LONGTEXT', 'DATE', 'DATETIME', 'FLOAT', 'TIMESTAMP'],
        'search_type' => [
            1 => 'Like',
            2 => 'equal',
            3 => 'different',
            4 => '% Like',
            5 => 'Like %',
            6 => 'between dates',
        ],
        'type_edit' => [
            'text' => 'text',
            'number' => 'number',
            'textarea' => 'textarea',
            'select' => 'select',
            'select_col_name' => 'select_name: tên cột trùng với tên col select của table select',
            'selects' => 'Multiple select',
            'selects_normal' => 'Multiple select (Normal)',
            'tags' => 'Tags',
            'tiny' => 'tiny',
            'image_laravel' => 'Image <Laravel file manager>',
            'images_laravel' => 'Images <Laravel file manager>',
            'image' => 'Image',
            'images' => 'Images',
            'images_no_db' => 'images_no_db',
            'video' => 'File Video <laravel file manager>',
            'pdf' => 'File pdf <laravel file manager>',
            'files' => 'Multiple file',
            'password' => 'Password',
            'encryption' => 'Password <Encryption>',
            'date' => 'date',
            'hidden' => 'hidden',
            'invisible' => 'invisible',
            'input' => 'Select Input',
            'block' => 'Block (Cần tạo sẵn 2 bảng:block & block_item)',
            'color' => 'Màu sắc',
            'comment' => 'comment ("Tên cột" phải là "comment")',
            'permission_list' => 'Danh sách quyền',
            'service' => 'Gía dịch vụ',
            'review_SEO' => 'review_SEO',
            'cascader' => 'Cascader', // data_select: json config: {{"column": {"0": "col_01","1": "col_02"} } } --- Column fai là col kiểu select
            // 'cascader_table' => 'Cascader - multiple Table',

            'data_detail' => 'data detail',
        ]
    ],
    'product_service' => [
        'logo_design' => 73,
        'ht_care' => 74,
        'web_express_basic' => 71,
        'web_express_advanced' => 72,
        'email_ht' => 38,
        'email_google' => 42,
    ],

    'cart_type' => [
        'hosting' => 1,
        'vps' => 3,
        'server' => 4,
        'domain' => 2,
        'web_layout' => 5,
        'web_express' => 6,
        'email_ht' => 7,
        'email_google' => 8,
        'ht_care' => 9,
    ],

    'type_cham_cong' => [
        'di_lam' => 1,
        'nghi_co_phep' => 2,
        'nghi_ko_phep' => 3,
        'nghi_le' => 4,
        'nghi_cuoi_tuan' => 5,
    ],
    'paginate' => 30,
    'curency_html' => '<sup>đ</sup>',
    'curency' => 'đ',
    'no_image' => '/layouts/layout02/imgs/no-img.jpg',
    'per_col' => ['col_add','col_edit','col_delete','col_view','col_create_by','col_share'],
    'per_table' => ['table_add','table_edit','table_delete','table_view','table_create_by','table_share'],
    'sort' => ['price-asc', 'price-desc', 'name'],

    // Loaị chứng từ
    'ten_loai_chung_tu' => [
        1 => 'Phiếu nhập mua',
        2 => 'Phiếu nhập kho',
        3 => 'Phiếu xuất kho',
        4 => 'Hoá đơn bán',
        5 => 'Điều chuyển kho',
        6 => 'Đổi, trả lại hàng bán',
        7 => 'Hàng trả lại nhà cung cấp',
        8 => 'Hóa đơn bán lẻ',
        9 => 'Phiếu thu',
        10 => 'Phiếu chi',
        11 => 'Thẻ khách hàng',
        12 => 'Tăng giá trị thẻ',
        13 => 'CheckIn khách sạn',
        14 => 'Phiếu đặt mua',
        15 => 'Phiếu đặt bán - Báo giá',
        16 => 'Phiếu tập luyện'
	],
    'loai_chung_tu' => [
        1 => 'Phiếu nhập mua',
        2 => 'Phiếu nhập kho',
        3 => 'Phiếu xuất kho',
        4 => 'Hoá đơn bán',
        5 => 'Điều chuyển kho',
        6 => 'Đổi, trả lại hàng bán',
        7 => 'Hàng trả lại nhà cung cấp',
        8 => 'hoa_don',
        9 => 'phieu_thu',
        10 => 'phieu_chi',
        11 => 'card',
        12 => 'tang_gia_tri_the',
        13 => 'CheckIn khách sạn',
        14 => 'Phiếu đặt mua',
        15 => 'Phiếu đặt bán - Báo giá',
        16 => 'Phiếu tập luyện'
	],
    'loai_chung_tu_chi_tiet' => [
        1 => 'Phiếu nhập mua',
        2 => 'Phiếu nhập kho',
        3 => 'Phiếu xuất kho',
        4 => 'Hoá đơn bán',
        5 => 'Điều chuyển kho',
        6 => 'Đổi, trả lại hàng bán',
        7 => 'Hàng trả lại nhà cung cấp',
        8 => 'hoa_don_chi_tiet',
        9 => 'phieu_thu_chi_tiet',
        10 => 'phieu_chi_chi_tiet',
        11 => 'card_service',
        12 => 'tang_gia_tri_the',
        13 => 'CheckIn khách sạn',
        14 => 'Phiếu đặt mua',
        15 => 'Phiếu đặt bán - Báo giá',
        16 => 'Phiếu tập luyện'
	],


    'status__type_submit_hoa_don' => [
        'submit' => 'submit',
        'draft' => 'draft',
        'cancel' => 'cancel'
	],

    'search_position' => [
        1 => 'top',
        2 => 'left',
	],
    'type_product' => [
        1 => 'Hàng hóa',
        2 => 'Dịch vụ',
        3 => 'Gói dịch vụ, liệu trình',
        4 => 'Thẻ khách hàng'
	],
    'hinh_thuc_thanh_toan' => [
        1 => 'Tiền mặt',
        2 => 'Thẻ',
        3 => 'Chuyển khoản'
	],


    'product__lich_trinh_sd' => [
        1 => 'Tự do',
        2 => 'Theo Ngày',
        3 => 'Theo tuần',
        4 => 'Theo tháng'
	],
    'product__lich_trinh_sd__donvi' => [
        1 => 'Tự do',
        2 => 'Ngày',
        3 => 'Tuần',
        4 => 'Tháng'
	],

    'product__han_su_dung' => [
        1 => 'Vô hạn',
        2 => 'Ngày cụ thể',
        3 => 'Khoảng thời gian'
	],

    'card_group' => [
        1 => 'VIP',
        2 => 'Gói dịch vụ',
	],

    'so_quy_status' => [
        'da_thanh_toan' => 1,
        'chua_thanh_toan' => 2,
        'cong_no' => 3,
        'luu_nhap' => 3,
	],

    'so_quy_type' => [
        'khach_tt_hdon' => 1,
        'khach_tra_hang' => 2,
        'chi_tien_ncc' => 3,
        'thu_tien_ncc' => 4,
        'phieu_thu_other' => 5,
        'phieu_chi_other' => 5,
	],
    'nhom_nguoi_nhan' => [
        'khach_hang' => 1,
        'ncc' => 2,
        'nv' => 3,
        'cty' => 4,
	],
    'card_group' => [
        'the_gia_tri' => 1,
        'the_lieu_trinh' => 2,
	],
    // Đơn vị dịch vụ
    'service_per' => [
        'Phòng' => 'Phòng',
        'Người' => 'Người',
        'KWH' => 'KWH',
        'M3' => 'M3',
        'Xe' => 'Xe',
    ]
];
