let key = 1;

export const tblKhoHang = ['kho_hang', 'nha_cung_cap_status'];
export const tblSale = ['data_telesales', 'dat_lich', 'users'];
export const tblNhanSu = ['permission_group', 'admin_user', 'khoa_hoc'];
export const tblTask = [];
export const tblSetting = [];
export const tblTaiChinh = ['hoa_don'];
export const tblReport = [];
export const tblTaiSan = ['tai_san_kiem_ke', 'tai_san_bao_tri', 'tai_san_thanh_ly', 'tai_san_cap_phat'];
export const tblWeb = ['images', 'contact', 'orders', 'news', 'doi_tac',
    'products', 'menus', 'admin_user.edit', 'admin_user.index',
    'admin_user.change_password', 'web_config', 'video','emails', 'countries','library'
];

// export const tblConfig = {
//     tblWeb: {
//         name: 'Quản lý website',
//         data:['images', 'contact', 'orders', 'news', 'doi_tac', 
//             'products', 'menus', 'admin_user.edit', 'admin_user.index', 
//             'admin_user.change_password','web_config','video']
//     },
//     tblNhanSu: {
//         name: 'Quản lý nhân sự',
//         data:['permission_group', 'admin_user', 'khoa_hoc']
//     },
//     tblKhoHang: {
//         name: 'Quản lý kho hàng',
//         data:['kho_hang', 'nha_cung_cap_status']
//     },
//     tblSale: {
//         name: 'Quản lý bán hàng',
//         data:['data_telesales', 'dat_lich', 'users']
//     },
//     tblTaiChinh: {
//         name: 'Quản lý tài chính',
//         data:['hoa_don']
//     },
//     tblReport: {
//         name: 'Báo cáo',
//         data:[]
//     },
//     tblTaiSan: {
//         name: 'Quản lý tài sản',
//         data:['tai_san_kiem_ke', 'tai_san_bao_tri', 'tai_san_thanh_ly', 'tai_san_cap_phat']
//     },
//     tblTask: {
//         name: 'Quản lý công việc',
//         data:[]
//     },
// };

export const tblConfig = {
    tblWeb: {
        name: 'Quản lý website',
        active: true,
        data: ['images', 'contact', 'orders', 'news', 'doi_tac',
            'products', 'menus', 'admin_user.edit', 'admin_user.index',
            'admin_user.change_password', 'web_config', 'video','emails', 'countries','library']

    },
    tblNhanSu: {
        name: 'Quản lý nhân sự',
        active: true,
        data: ['permission_group', 'admin_user', 'khoa_hoc', 'chi_nhanh']
    },
    tblKhoHang: {
        name: 'Quản lý kho hàng',
        active: false,
        data: ['kho_hang', 'nha_cung_cap_status']
    },
    tblSale: {
        name: 'Quản lý bán hàng',
        active: false,
        data: ['data_telesales', 'dat_lich', 'users']
    },
    tblTaiChinh: {
        name: 'Quản lý tài chính',
        active: false,
        data: ['hoa_don']
    },
    tblReport: {
        name: 'Báo cáo',
        active: false,
        data: []
    },
    tblTaiSan: {
        name: 'Quản lý tài sản',
        active: false,
        data: ['tai_san_kiem_ke', 'tai_san_bao_tri', 'tai_san_thanh_ly', 'tai_san_cap_phat']
    },
    tblTask: {
        name: 'Quản lý công việc',
        active: false,
        data: []
    },
};


export const routeHome = [];

export const routeQLKho = [
    {
        parent: {
            link: route('khoHang.dashboard'),
            display_name: 'Báo cáo',
            key: key++
        },
        sub: {}
    },
    {
        parent: {
            link: route('product.list'),
            display_name: 'Hàng hóa',
            key: key++
        },
        sub: {}
    },
    {
        parent: {
            link: route('khoHang.dashboard'),
            display_name: 'Quản lý kho',
            key: key++
        },
        sub: [
            {
                link: route('kiemKho'),
                display_name: 'Kiểm kho',
                key: key++
            },
            {
                link: route('nhapHang'),
                display_name: 'Nhập hàng',
                key: key++
            },
            {
                link: route('traHangNCC'),
                display_name: 'Trả hàng nhập',
                key: key++
            },
            {
                link: route('xuatHuy'),
                display_name: 'Xuất hủy',
                key: key++
            },
        ]
    },
    {
        parent: {
            link: route('ncc.index'),
            display_name: 'Nhà cung cấp',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: '/',
            display_name: 'Cài đặt kho',
            key: key++
        },
        sub: [
            {
                link: route('data.tblName', ['kho_hang']),
                display_name: 'Danh sách kho',
                key: key++
            },
            {
                link: route('data.tblName', ['nha_cung_cap_status']),
                display_name: 'Cài đặt trạng thái NCC',
                key: key++
            },
        ]
    }

];

export const routeSales = [
    {
        parent: {
            link: route('sale.dashboard'),
            display_name: 'Báo cáo',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('hoaDon.create'),
            display_name: 'Thu ngân',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('hoaDon.index'),
            display_name: 'Hóa đơn',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('data.tblName', ['data_telesales']),
            display_name: 'Data telesale',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('data.tblName', ['dat_lich']),
            display_name: 'Lịch hẹn',
            key: key++
        },
        sub: {}
    },
    {
        parent: {
            link: route('customer.index'),
            display_name: 'Khách hàng',
            key: key++
        },
        sub: {}
    },

];

export const routeNhanSu = [
    // {
    //     parent: {
    //         link: route('nhanSu.dashboard'),
    //         display_name: 'Báo cáo',
    //         key: key++
    //     },
    //     sub: []
    // },
    {
        parent: {
            link: route('nhanVien.index'),
            display_name: 'Nhân viên',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('data.tblName', ['permission_group']),
            display_name: 'Nhóm quyền',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('data.tblName', ['chi_nhanh']),
            display_name: 'Chi nhánh',
            key: key++
        },
        sub: []
    },
    // {
    //     parent: {
    //         link: route('hoaDon.index'),
    //         display_name: 'Bảng lương',
    //         key: key++
    //     },
    //     sub: []
    // },

];

export const routeTask = [
    {
        parent: {
            link: route('task.dashboard'),
            display_name: 'Báo cáo',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('hoaDon.index'),
            display_name: 'Nhóm công việc',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('task.list'),
            display_name: 'Công việc',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('task.list'),
            display_name: 'Nhóm checklist',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('hoaDon.index'),
            display_name: 'Milestones',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('data.tblName', ['data_telesales']),
            display_name: 'Cài đặt',
            key: key++
        },
        sub: []
    },

];
export const routeTaiChinh = [
    {
        parent: {
            link: route('task.dashboard'),
            display_name: 'Báo cáo',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('hoaDon.index'),
            display_name: 'Hóa Đơn',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('task.list'),
            display_name: 'Thu chi',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('hoaDon.index'),
            display_name: 'Công nợ',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('data.tblName', ['data_telesales']),
            display_name: 'Cài đặt',
            key: key++
        },
        sub: []
    },

];

export const routeSetting = [
    {
        parent: {
            link: route('task.dashboard'),
            display_name: 'Báo cáo',
            key: key++
        },
        sub: []
    },
];

export const routeReport = [
    {
        parent: {
            link: route('task.dashboard'),
            display_name: 'Báo cáo',
            key: key++
        },
        sub: []
    },
];
export const routeTaiSan = [
    {
        parent: {
            link: route('task.dashboard'),
            display_name: 'Báo cáo',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('taiSan.index'),
            display_name: 'Tài sản',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('data.tblName', ['tai_san_kiem_ke']),
            display_name: 'Kiểm kê',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('data.tblName', ['tai_san_bao_tri']),
            display_name: 'Bảo trì',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('data.tblName', ['tai_san_thanh_ly']),
            display_name: 'Thanh lý',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('data.tblName', ['tai_san_cap_phat']),
            display_name: 'Cấp phát',
            key: key++
        },
        sub: []
    },
];

export const routeFiles = [
];

export const routeWeb = [
    {
        parent: {
            link: route('web.dashboard'),
            display_name: 'Tổng quan',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('data.tblName', ['menus']),
            display_name: 'Menu',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('data.tblName', ['news']),
            display_name: 'Tin tức',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('data.tblName', ['products']),
            display_name: 'Sản phẩm',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('data.tblName', ['video']),
            display_name: 'Media',
            key: key++
        },
        sub: [
            {
                link: route('data.tblName', ['video']),
                display_name: 'Video',
                key: key++
            },
            {
                link: route('data.tblName', ['library']),
                display_name: 'Thư viện ảnh',
                key: key++
            }
        ]
    },
    {
        parent: {
            link: route('adm.landingpage.index'),
            display_name: 'Landingpage',
            key: key++
        },
        sub: []
    },

    {
        parent: {
            link: route('data.tblName', ['contact']),
            display_name: 'Liên hệ',
            key: key++
        },
        sub: []
    },
    {
        parent: {
            link: route('data.tblName', ['web_config']),
            display_name: 'Cài đặt',
            key: key++
        },
        sub: [
            {
                link: route('data.tblName', ['web_config']),
                display_name: 'Cấu hình web',
                key: key++
            },
            {
                link: route('data.tblName', ['emails']),
                display_name: 'Email',
                key: key++
            },
            {
                link: route('data.tblName', ['countries']),
                display_name: 'Quốc gia',
                key: key++
            }
        ]
    },
];

export function itemMenu(tableName: string) {

    if (tblConfig.tblKhoHang.data.includes(tableName)) {
        return routeQLKho;
    }
    if (tblConfig.tblSale.data.includes(tableName)) {
        return routeSales;
    }
    if (tblConfig.tblTaiChinh.data.includes(tableName)) {
        return routeTaiChinh;
    }
    if (tblConfig.tblTaiSan.data.includes(tableName)) {
        return routeTaiSan;
    }
    if (tblConfig.tblWeb.data.includes(tableName)) {
        return routeWeb;
    }
    if (tblConfig.tblNhanSu.data.includes(tableName)) {
        return routeNhanSu;
    }

    return false;
}

