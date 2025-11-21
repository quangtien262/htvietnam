
import { Link } from 'react-router-dom';
import ROUTE from './route';

import SoQuyList from './../pages/aitilen/SoQuyList';
import {
    UserOutlined,CalendarOutlined,
    GlobalOutlined,DeleteOutlined ,
    CopyOutlined,GiftOutlined,
    UnorderedListOutlined,
    BookOutlined,
    DashboardOutlined,
    HomeOutlined,
    FileTextOutlined,
    TeamOutlined,
    BarChartOutlined,
    ApartmentOutlined,
    FileImageOutlined,
    VideoCameraOutlined,
    MessageOutlined,
    FileDoneOutlined,
    ShopOutlined,
    InboxOutlined,
    DollarOutlined,
    TagsOutlined,
    SettingFilled,
    PhoneOutlined,
    FolderOutlined,
    StarOutlined,
    ClockCircleOutlined,
    CheckSquareOutlined,
    SettingOutlined,
    QuestionCircleOutlined,
    KeyOutlined
} from "@ant-design/icons";
/**
 * @typedef {Object} MenuItem
 * @property {React.ReactNode} label
 * @property {string | number} key
 * @property {React.ReactNode} icon
 * @property {MenuItem[]} [children]
 */
let key = 0;
export const MENU = {
    home: [
        {
            label: <Link to={`${ROUTE.dashboard}?p=home`}>Home</Link>,
            icon: <HomeOutlined />,
            key: (key++).toString(),
        },
    ],
    // Bất động sản Aitilen
    bds: [
        {
            label: <Link className='normal' to={`${ROUTE.dashboard_aitilen}?p=bds`}>Báo cáo</Link>,
            icon: <BarChartOutlined />,
            key: (key++).toString(),
        },
        // Quản lý phòng
        {
            label: "Phòng",
            key: (key++).toString(),
            icon: <ApartmentOutlined />,
            children: [
                {
                    label: <Link to={`${ROUTE.invoice_bds}?p=bds`}>Hóa đơn</Link>,
                    key: (key++).toString(),
                    icon: <CopyOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.contactList_BDS}?p=bds`}>Hợp đồng</Link>,
                    key: (key++).toString(),
                    icon: <BookOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.aitilen_DienNuoc}?p=bds`}>Chốt điện/nước</Link>,
                    key: (key++).toString(),
                    icon: <FileDoneOutlined />,
                },
            ],
        },

        // Đẩy phòng
        {
            label: "Đẩy phòng",
            key: (key++).toString(),
            icon: <DashboardOutlined />,
            children: [
                {
                    label: <a href={`${ROUTE.taskKanban_phongTrong}?p=bds`}>Phòng trống</a>,
                    key: (key++).toString(),
                    icon: <DashboardOutlined />,
                },
                {
                    label: <a href={`${ROUTE.taskKanban_aitilenSales}?p=bds`}>Khách xem phòng</a>,
                    key: (key++).toString(),
                    icon: <TeamOutlined />,
                },
            ],
        },
        // Khách hàng
        {
            label: <Link to={`${ROUTE.customerList}?p=bds`}>Khách hàng</Link>,
            key: (key++).toString(),
            icon: <UserOutlined />,
            children: [],
        },
        // Tòa nhà
        {
            label: <Link to={`${ROUTE.apartment_bds}?p=bds`}>Tòa nhà</Link>,
            key: (key++).toString(),
            icon: <ApartmentOutlined />,
            children: [
                {
                    label: <Link to={`${ROUTE.apartment_bds}?p=bds`}>QL Tòa nhà</Link>,
                    key: (key++).toString(),
                    icon: <HomeOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.aitilen_dauTu}?p=bds`}>Đầu tư</Link>,
                    key: (key++).toString(),
                    icon: <DollarOutlined />,
                },

            ],
        },
        {
            label: <Link to={`${ROUTE.apartment_bds}?p=bds`}>Cài đặt</Link>,
            key: (key++).toString(),
            icon: <ApartmentOutlined />,
            children: [
                {
                    label: <Link to={`${ROUTE.baseRoute}setting/note?p=bds`}>Ghi chú</Link>,
                    key: (key++).toString(),
                    icon: <HomeOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.baseRoute}setting/loai_chi?p=bds`}>Loại chi</Link>,
                    key: (key++).toString(),
                    icon: <HomeOutlined />,
                },

            ],
        },
    ],
    // project
    pro: [
        {
            label: <Link to={`${ROUTE.dashboardProject}?p=pro`}>Báo cáo</Link>,
            icon: <BarChartOutlined />,
            key: (key++).toString(),
        },
        {
            label: <Link to={`${ROUTE.projectList}?p=pro`}>Dự án</Link>,
            icon: <ApartmentOutlined />,
            key: (key++).toString(),
        },
        {
            label: <a href={`${ROUTE.projectTaskKanban_all}?p=pro`}>Công việc chung</a>,
            icon: <UnorderedListOutlined />,
            key: (key++).toString(),
        },
        {
            label: <Link to={`${ROUTE.taskKanban_all}?p=pro`}>Meeting</Link>,
            icon: <TeamOutlined />,
            key: (key++).toString(),
        },
        {
            label: <Link to={`${ROUTE.taskKanban_all}?p=pro`}>Lịch</Link>,
            icon: <CalendarOutlined />,
            key: (key++).toString(),
        },
        {
            label: <Link to={`${ROUTE.taskKanban_all}?p=pro`}>Ghi chú</Link>,
            icon: <FileTextOutlined />,
            key: (key++).toString(),
        },
    ],
    // website
    web: [
        {
            label: <Link to={`${ROUTE.menuManagement}?p=web`}>menu</Link>,
            key: (key++).toString(),
            icon: <FileTextOutlined />,
        },
        {
            label: <Link to={`${ROUTE.newsManagement}?p=web`}>Tin tức</Link>,
            key: (key++).toString(),
            icon: <FileTextOutlined />,
        },
        {
            label: <Link to={`${ROUTE.productManagement}?p=web`}>Sản phẩm</Link>,
            key: (key++).toString(),
            icon: <FileTextOutlined />,
        },
        {
            label: <Link to={`${ROUTE.taskKanban_all}?p=web`}>Phòng mẫu</Link>,
            key: (key++).toString(),
            icon: <FileImageOutlined />,
        },
        {
            label: <Link to={`${ROUTE.taskKanban_all}?p=web`}>Phòng trống</Link>,
            key: (key++).toString(),
            icon: <DashboardOutlined />,
        },
        {
            label: <span>Media</span>,
            key: (key++).toString(),
            icon: <VideoCameraOutlined />,
            children: [
                {
                    label: <Link to={`${ROUTE.taskKanban_all}?p=web`}>Video</Link>,
                    key: (key++).toString(),
                    icon: <VideoCameraOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.taskKanban_all}?p=web`}>Thư viện ảnh</Link>,
                    key: (key++).toString(),
                    icon: <FileImageOutlined />,
                }
            ],
        },
        {
            label: <Link to={`${ROUTE.taskKanban_all}?p=web`}>Landingpage</Link>,
            key: (key++).toString(),
            icon: <GlobalOutlined />,
        },
        {
            label: <Link to={`${ROUTE.taskKanban_all}?p=web`}>Liên hệ</Link>,
            key: (key++).toString(),
            icon: <MessageOutlined />,
        },
    ],
    // Tài chính
    erp: [
        {
            label: <Link to={`${ROUTE.erpDashboard}?p=erp`}>Dashboard</Link>,
            key: (key++).toString(),
            icon: <DashboardOutlined />,
        },
        {
            label: "Giao dịch",
            key: (key++).toString(),
            icon: <FileTextOutlined />,
            children: [
                {
                    label: <Link to={`${ROUTE.aitilen_soQuy}?p=erp`}>Sổ quỹ (Thu/Chi)</Link>,
                    key: (key++).toString(),
                    icon: <DollarOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.bankTransaction}?p=erp`}>Giao dịch ngân hàng</Link>,
                    key: (key++).toString(),
                    icon: <ShopOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.invoiceManagement}?p=erp`}>Hóa đơn</Link>,
                    key: (key++).toString(),
                    icon: <FileDoneOutlined />,
                },
            ],
        },
        {
            label: <Link to={`${ROUTE.congNoManagement}?p=erp`}>Công nợ</Link>,
            key: (key++).toString(),
            icon: <TagsOutlined />,
        },
        {
            label: "Cài đặt",
            key: (key++).toString(),
            icon: <SettingFilled />,
            children: [
                {
                    label: <Link to={`${ROUTE.bankAccount}?p=erp`}>Tài khoản ngân hàng</Link>,
                    key: (key++).toString(),
                    icon: <ShopOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.baseRoute}setting/nha_cung_cap?p=erp`}>Đối tác</Link>,
                    key: (key++).toString(),
                    icon: <TeamOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.baseRoute}setting/loai_thu?p=erp`}>Loại thu</Link>,
                    key: (key++).toString(),
                    icon: <ShopOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.baseRoute}setting/loai_chi?p=erp`}>Loại chi</Link>,
                    key: (key++).toString(),
                    icon: <ShopOutlined />,
                },
            ],
        },
    ],
    // QL mua hàng / kho, tài sản
    purchase: [
        {
            label: <Link to={`${ROUTE.purchaseReportManagement}?p=purchase`}>Báo cáo</Link>,
            key: (key++).toString(),
            icon: <BarChartOutlined />,
        },
        {
            label: <Link to={`${ROUTE.supplierManagement}?p=purchase`}>Nhà cung cấp</Link>,
            key: (key++).toString(),
            icon: <ShopOutlined />,
        },
        {
            label: <Link to={`${ROUTE.hangHoaManagement}?p=purchase`}>Hàng hóa</Link>,
            key: (key++).toString(),
            icon: <TagsOutlined />,
        },
        {
            label: <Link to={`${ROUTE.purchaseOrderManagement}?p=purchase`}>Đơn mua hàng</Link>,
            key: (key++).toString(),
            icon: <FileDoneOutlined />,
        },
        {
            label: <Link to={`${ROUTE.stockReceiptManagement}?p=purchase`}>Nhập kho</Link>,
            key: (key++).toString(),
            icon: <InboxOutlined />,
        },
        {
            label: <Link to={`${ROUTE.supplierPaymentManagement}?p=purchase`}>Thanh toán NCC</Link>,
            key: (key++).toString(),
            icon: <DollarOutlined />,
        },
        {
            label: "Cài đặt",
            key: (key++).toString(),
            icon: <BarChartOutlined />,
            children: [
                {
                    label: <Link to={`${ROUTE.baseRoute}setting/loai_hang_hoa?p=purchase`}>Loại hàng hóa</Link>,
                    key: (key++).toString(),
                },
                {
                    label: <Link to={`${ROUTE.baseRoute}setting/purchase_order_statuses?p=purchase`}>Trạng thái đơn mua hàng</Link>,
                    key: (key++).toString(),
                },
                {
                    label: <Link to={`${ROUTE.purchaseHuongDan}?p=purchase`}>📖 Hướng dẫn sử dụng</Link>,
                    key: (key++).toString(),
                    icon: <BookOutlined />,
                },
            ],
        },
    ],

    // QL nhân sự
    hr: [
        {
            label: <Link to={`${ROUTE.hrBaoCao}?p=hr`}>Dashboard</Link>,
            key: (key++).toString(),
            icon: <DashboardOutlined />,
        },
        {
            label: <Link to={`${ROUTE.hrChamCong}?p=hr`}>Chấm công</Link>,
            key: (key++).toString(),
            icon: <CalendarOutlined />,
        },
        {
            label: <Link to={`${ROUTE.hrBangLuong}?p=hr`}>Bảng lương</Link>,
            key: (key++).toString(),
            icon: <DollarOutlined />,
        },
        {
            label: <Link to={`${ROUTE.hrNghiPhep}?p=hr`}>Nghỉ phép</Link>,
            key: (key++).toString(),
            icon: <FileTextOutlined />,
        },
        {
            label: <Link to={`${ROUTE.spa_admin_users}?p=hr`}>Nhân viên</Link>,
            key: (key++).toString(),
            icon: <TeamOutlined />,
        },
        {
            label: "Cài đặt",
            key: (key++).toString(),
            icon: <SettingFilled />,
            children: [
                {
                    label: <Link to={`${ROUTE.baseRoute}setting/ca_lam_viec?p=hr`}>Ca làm việc</Link>,
                    key: (key++).toString(),
                    icon: <CalendarOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.baseRoute}setting/hop_dong_lao_dong?p=hr`}>Hợp đồng lao động</Link>,
                    key: (key++).toString(),
                    icon: <FileDoneOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.baseRoute}setting/tai_san_cong_ty?p=hr`}>Tài sản công ty</Link>,
                    key: (key++).toString(),
                    icon: <InboxOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.baseRoute}setting/kpi_danh_gia?p=hr`}>Đánh giá KPI</Link>,
                    key: (key++).toString(),
                    icon: <BarChartOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.hrHuongDan}?p=hr`}>📖 Hướng dẫn sử dụng</Link>,
                    key: (key++).toString(),
                    icon: <BookOutlined />,
                },
            ],
        },
    ],

    sales: [
        {
            label: <Link to={`${ROUTE.salesBaoCao}?p=sales`}>Báo cáo</Link>,
            key: (key++).toString(),
            icon: <BarChartOutlined />,
        },
        {
            label: <Link to={`${ROUTE.salesKhachHang}?p=sales`}>Khách hàng</Link>,
            key: (key++).toString(),
            icon: <UserOutlined />,
        },
        {
            label: <Link to={`${ROUTE.salesDonHang}?p=sales`}>Đơn hàng</Link>,
            key: (key++).toString(),
            icon: <FileDoneOutlined />,
        },
        {
            label: <Link to={`${ROUTE.salesPhieuThu}?p=sales`}>Thu tiền</Link>,
            key: (key++).toString(),
            icon: <DollarOutlined />,
        },
        {
            label: <Link to={`${ROUTE.salesKhuyenMai}?p=sales`}>Khuyến mãi</Link>,
            key: (key++).toString(),
            icon: <TagsOutlined />,
        },
        {
            label: "Cài đặt",
            key: (key++).toString(),
            icon: <SettingFilled />,
            children: [
                {
                    label: <Link to={`${ROUTE.baseRoute}setting/loai_khach_hang?p=sales`}>Loại khách hàng</Link>,
                    key: (key++).toString(),
                },
                {
                    label: <Link to={`${ROUTE.baseRoute}setting/trang_thai_don_hang?p=sales`}>Trạng thái đơn hàng</Link>,
                    key: (key++).toString(),
                },
                {
                    label: <Link to={`${ROUTE.salesHuongDan}?p=sales`}>📖 Hướng dẫn sử dụng</Link>,
                    key: (key++).toString(),
                    icon: <BookOutlined />,
                },
            ],
        },
    ],

    business: [
        {
            label: <Link to={`${ROUTE.businessCoHoi}?p=business`}>🎯 Cơ hội Kinh doanh</Link>,
            key: (key++).toString(),
        },
        {
            label: <Link to={`${ROUTE.businessBaoGia}?p=business`}>📋 Báo giá</Link>,
            key: (key++).toString(),
        },
        {
            label: <Link to={`${ROUTE.businessBaoCao}?p=business`}>📊 Báo cáo</Link>,
            key: (key++).toString(),
            // icon: <BarChartOutlined />,
        },
        {
            label: <Link to={`${ROUTE.businessHuongDan}?p=business`}>📖 Hướng dẫn sử dụng</Link>,
            key: (key++).toString(),
            // icon: <BookOutlined />,
        },
    ],

    // telesale
    telesale: [
        {
            label: <Link to={`${ROUTE.telesaleBaoCao}?p=telesale`}>📊 Báo cáo & KPI</Link>,
            key: (key++).toString(),
            icon: <BarChartOutlined />,
        },
        {
            label: <Link to={`${ROUTE.telesaleData}?p=telesale`}>📁 Data Khách hàng</Link>,
            key: (key++).toString(),
        },
        {
            label: <Link to={`${ROUTE.telesaleCuocGoi}?p=telesale`}>📞 Cuộc gọi</Link>,
            key: (key++).toString(),
        },
        {
            label: <Link to={`${ROUTE.telesaleDonHang}?p=telesale`}>🛒 Đơn hàng</Link>,
            key: (key++).toString(),
        },
        {
            label: 'Cài đặt',
            key: (key++).toString(),
            icon: <PhoneOutlined />,
            children: [

                {
                    label: <Link to={`${ROUTE.telesaleHuongDan}?p=telesale`}>📖 Hướng dẫn sử dụng</Link>,
                    key: (key++).toString(),
                    icon: null,
                },
            ],
        },
    ],

    // quản lý tài liệu
    docs: [
        {
            label: <Link to={`${ROUTE.documentsExplorer}?p=docs`}>📂 Trình duyệt File</Link>,
            key: (key++).toString(),
            icon: null,
        },
        {
            label: <Link to={`${ROUTE.documentsStarred}?p=docs`}>⭐ File đã gắn sao</Link>,
            key: (key++).toString(),
            icon: null,
        },
        {
            label: <Link to={`${ROUTE.documentsRecent}?p=docs`}>🕒 File gần đây</Link>,
            key: (key++).toString(),
            icon: null,
        },
        {
            label: <Link to={`${ROUTE.documentsTrash}?p=docs`}>🗑️ Thùng rác</Link>,
            key: (key++).toString(),
            icon: null,
        },
        {
            label: 'Cài đặt',
            key: (key++).toString(),
            icon: <FolderOutlined />,
            children: [
                {
                    label: <Link to={`${ROUTE.documentsSettings}?p=docs`}>⚙️ Cài đặt & Quota</Link>,
                    key: (key++).toString(),
                    icon: <SettingOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.documentsUserGuide}?p=docs`}>📖 Hướng dẫn sử dụng</Link>,
                    key: (key++).toString(),
                    icon: <QuestionCircleOutlined />,
                },
            ],
        },
    ],

    // SPA
    spa: [
        {
            label: <Link className='normal' to={`${ROUTE.spa_analytics}?p=spa`}>Dashboard</Link>,
            icon: <DashboardOutlined />,
            key: (key++).toString(),
        },
        {
            label: <Link className='normal' to={`${ROUTE.spa_pos}?p=spa`}>Thu ngân</Link>,
            icon: <ShopOutlined />,
            key: (key++).toString(),
        },
        {
            label: <Link className='normal' to={`${ROUTE.spa_shifts}?p=spa`}>QL Ca Làm</Link>,
            icon: <ShopOutlined />,
            key: (key++).toString(),
        },
        {
            label: <Link className='normal' to={`${ROUTE.spa_invoices}?p=spa`}>Hóa đơn</Link>,
            icon: <FileTextOutlined />,
            key: (key++).toString(),
        },
        // Khách hàng
        {
            label: "Khách hàng",
            key: (key++).toString(),
            icon: <UserOutlined />,
            children: [
                {
                    label: <Link to={`${ROUTE.spa_customers}?p=spa`}>Danh sách KH</Link>,
                    key: (key++).toString(),
                    icon: <TeamOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.spa_membership}?p=spa`}>Thẻ thành viên</Link>,
                    key: (key++).toString(),
                    icon: <StarOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.spa_gift_cards}?p=spa`}>🎁 Thẻ Giá Trị & Ví</Link>,
                    key: (key++).toString(),
                    icon: <GiftOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.spa_wallet_reports}?p=spa`}>📊 Báo cáo Ví</Link>,
                    key: (key++).toString(),
                    icon: <BarChartOutlined />,
                },
            ],
        },
        // Sản phẩm
        {
            label: "Sản phẩm & Dịch vụ",
            key: (key++).toString(),
            icon: <InboxOutlined />,
            children: [
                {
                    label: <Link to={`${ROUTE.spa_products}?p=spa`}>Sản phẩm</Link>,
                    key: (key++).toString(),
                    icon: <UnorderedListOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.spa_services}?p=spa`}>Dịch vụ</Link>,
                    key: (key++).toString(),
                    icon: <UnorderedListOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.spa_service_packages}?p=spa`}>Gói dịch vụ</Link>,
                    key: (key++).toString(),
                    icon: <GiftOutlined />,
                },
            ],
        },

        // Quản lý kho đa chi nhánh
        // {
        //     label: <Link to={`${ROUTE.spa_inventory}?p=spa`}>Kho</Link>,
        //     key: (key++).toString(),
        //     icon: <InboxOutlined />,
        //     children: [
        //         {
        //             label: <Link to={`${ROUTE.spa_branch_inventory}?p=spa`}>Tồn kho chi nhánh</Link>,
        //             key: (key++).toString(),
        //             icon: <InboxOutlined />,
        //         },
        //         {
        //             label: <Link to={`${ROUTE.spa_inventory}?p=spa`}>Nhập kho</Link>,
        //             key: (key++).toString(),
        //             icon: <InboxOutlined />,
        //         },
        //         {
        //             label: <Link to={`${ROUTE.spa_stock_transfer}?p=spa`}>Chuyển kho</Link>,
        //             key: (key++).toString(),
        //             icon: <ApartmentOutlined />,
        //         },
        //         {
        //             label: <Link to={`${ROUTE.spa_inventory_count}?p=spa`}>Kiểm kê</Link>,
        //             key: (key++).toString(),
        //             icon: <FileTextOutlined />,
        //         },
        //         {
        //             label: <Link to={`${ROUTE.spa_purchase_return}?p=spa`}>Trả hàng nhập</Link>,
        //             key: (key++).toString(),
        //             icon: <UnorderedListOutlined />,
        //         },
        //         {
        //             label: <Link to={`${ROUTE.spa_disposal}?p=spa`}>Xuất hủy</Link>,
        //             key: (key++).toString(),
        //             icon: <DeleteOutlined />,
        //         },
        //         {
        //             label: <Link to={`${ROUTE.spa_suppliers}?p=spa`}>Nhà cung cấp</Link>,
        //             key: (key++).toString(),
        //             icon: <TeamOutlined />,
        //         },
        //     ],
        // },
        // Marketing
        {
            label: "Marketing",
            key: (key++).toString(),
            icon: <MessageOutlined />,
            children: [
                {
                    label: <Link to={`${ROUTE.spa_vouchers}?p=spa`}>Voucher</Link>,
                    key: (key++).toString(),
                    icon: <TagsOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.spa_campaigns}?p=spa`}>Chiến dịch</Link>,
                    key: (key++).toString(),
                    icon: <MessageOutlined />,
                },
                {
                    label: <Link className='normal' to={`${ROUTE.spa_booking_calendar}?p=spa`}>Lịch hẹn</Link>,
                    icon: <CalendarOutlined />,
                    key: (key++).toString(),
                },
            ],
        },
        // Cài đặt
        {
            label: "Cài đặt",
            key: (key++).toString(),
            icon: <SettingOutlined />,
            children: [
                {
                    label: <Link to={`${ROUTE.spa_settings}?p=spa`}>Cấu hình</Link>,
                    key: (key++).toString(),
                    icon: <SettingFilled />,
                },
                {
                    label: <Link to={`${ROUTE.spa_documentation}?p=spa`}>Hướng dẫn sử dụng</Link>,
                    icon: <QuestionCircleOutlined />,
                    key: (key++).toString(),
                },
                {
                    label: <Link to={`${ROUTE.spa_branches}?p=spa`}>Chi nhánh</Link>,
                    key: (key++).toString(),
                    icon: <ShopOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.spa_rooms}?p=spa`}>Phòng</Link>,
                    key: (key++).toString(),
                    icon: <ApartmentOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.baseRoute}setting/spa_lich_trinh_su_dung?p=spa`}>Loại chi</Link>,
                    key: (key++).toString(),
                    icon: <HomeOutlined />,
                },
            ],
        },
    ],

    // Project Management System
    projects: [
        {
            label: <Link className='normal' to={`${ROUTE.project_dashboard}?p=projects`}>Dashboard</Link>,
            icon: <DashboardOutlined />,
            key: (key++).toString(),
        },
        {
            label: <Link to={`${ROUTE.project_list}?p=projects`}>Dự án</Link>,
            key: (key++).toString(),
            icon: <ApartmentOutlined />,
        },
        {
            label: <Link to={`${ROUTE.project_my_tasks}?p=projects`}>Công việc của tôi</Link>,
            key: (key++).toString(),
            icon: <CheckSquareOutlined />,
        },
        {
            label: <Link to={`${ROUTE.project_meetings}?p=projects`}>Meeting</Link>,
            key: (key++).toString(),
            icon: <TeamOutlined />,
        },
        {
            label: "Báo cáo công việc",
            key: (key++).toString(),
            icon: <FileTextOutlined />,
            children: [
                {
                    label: <Link to={`${ROUTE.daily_report}?p=projects`}>📝 Hôm nay</Link>,
                    key: (key++).toString(),
                    icon: <CalendarOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.daily_report_history}?p=projects`}>📋 Lịch sử</Link>,
                    key: (key++).toString(),
                    icon: <ClockCircleOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.daily_report_stats}?p=projects`}>📊 Thống kê</Link>,
                    key: (key++).toString(),
                    icon: <BarChartOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.daily_report_team}?p=projects`}>👥 Báo cáo Team</Link>,
                    key: (key++).toString(),
                    icon: <TeamOutlined />,
                },
            ],
        },
        {
            label: "Cài đặt",
            key: (key++).toString(),
            icon: <SettingFilled />,
            children: [
                {
                    label: <Link to={`/project/1/permissions?p=projects`}>Quản lý phân quyền</Link>,
                    key: (key++).toString(),
                    icon: <KeyOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.baseRoute}setting/pro___project_statuses?p=projects`}>Trạng thái dự án</Link>,
                    key: (key++).toString(),
                    icon: <UnorderedListOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.baseRoute}setting/pro___project_types?p=projects`}>Loại dự án</Link>,
                    key: (key++).toString(),
                    icon: <UnorderedListOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.baseRoute}setting/pro___priorities?p=projects`}>Mức độ ưu tiên</Link>,
                    key: (key++).toString(),
                    icon: <UnorderedListOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.baseRoute}setting/pro___task_statuses?p=projects`}>Trạng thái task</Link>,
                    key: (key++).toString(),
                    icon: <UnorderedListOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.project_task_templates}?p=projects`}>Trạng thái task</Link>,
                    key: (key++).toString(),
                    icon: <UnorderedListOutlined />,
                },
            ],
        },
        {
            label: <Link to={`${ROUTE.project_guide}?p=projects`}>Hướng dẫn</Link>,
            key: (key++).toString(),
            icon: <QuestionCircleOutlined />,
        },
    ],

    warehouse: [
        {
            label: <Link to={`${ROUTE.spa_products}?p=warehouse`}>Sản phẩm</Link>,
            key: (key++).toString(),
            icon: <UnorderedListOutlined />,
        },
        {
            label: <Link to={`${ROUTE.spa_branch_inventory}?p=warehouse`}>Tồn kho</Link>,
            key: (key++).toString(),
            icon: <InboxOutlined />,
        },
        {
            label: <Link to={`${ROUTE.spa_inventory}?p=warehouse`}>Nhập kho</Link>,
            key: (key++).toString(),
            icon: <InboxOutlined />,
        },
        {
            label: <Link to={`${ROUTE.spa_stock_transfer}?p=warehouse`}>Chuyển kho</Link>,
            key: (key++).toString(),
            icon: <ApartmentOutlined />,
        },
        {
            label: <Link to={`${ROUTE.spa_inventory_count}?p=warehouse`}>Kiểm kê</Link>,
            key: (key++).toString(),
            icon: <FileTextOutlined />,
        },
        {
            label: <Link to={`${ROUTE.spa_purchase_return}?p=warehouse`}>Trả hàng nhập</Link>,
            key: (key++).toString(),
            icon: <UnorderedListOutlined />,
        },
        {
            label: <Link to={`${ROUTE.spa_disposal}?p=kho`}>Xuất hủy</Link>,
            key: (key++).toString(),
            icon: <DeleteOutlined />,
        },
        {
            label: <Link to={`${ROUTE.spa_suppliers}?p=warehouse`}>Nhà cung cấp</Link>,
            key: (key++).toString(),
            icon: <TeamOutlined />,
        },
    ]
}


export default MENU;
