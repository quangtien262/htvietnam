let key = 1;

export const tblKhoHang = ['kho_hang', 'nha_cung_cap_status'];
export const tblSale = ['data_telesales', 'dat_lich', 'users'];
export const tblNhanSu = [];
export const tblTask = [];
export const tblSetting = [];
export const tblTaiChinh = ['hoa_don'];
export const tblReport = [];
export const tblTaiSan = ['tai_san_kiem_ke', 'tai_san_bao_tri', 'tai_san_thanh_ly', 'tai_san_cap_phat'];

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
    // {
    //     parent: {
    //         link: route('ncc.index'),
    //         display_name: 'Báo giá',
    //         key: key++
    //     },
    //     sub: []
    // },
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
    {
        parent: {
            link: route('nhanSu.dashboard'),
            display_name: 'Báo cáo',
            key: key++
        },
        sub: []
    },
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
            link: route('hoaDon.index'),
            display_name: 'Bảng lương',
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

interface Table {
  name: string;
}
export function itemMenu(tableName: string) {
    if (tblKhoHang.includes(tableName)) {
        return routeQLKho;
    }
    if (tblSale.includes(tableName)) {
        return routeSales;
    }
    if (tblKhoHang.includes(tableName)) {
        return routeQLKho;
    }
    if (tblTaiChinh.includes(tableName)) {
        return routeTaiChinh;
    }
    if (tblTaiSan.includes(tableName)) {
        return routeTaiSan;
    }
    return false;
}