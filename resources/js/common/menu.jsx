
import { Link } from 'react-router-dom';
import ROUTE from './route';

import SoQuyList from './../pages/aitilen/SoQuyList';
import {
    UserOutlined,CalendarOutlined,
    GlobalOutlined,
    CopyOutlined,
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
    DollarOutlined
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
    // Bất động sản
    bds: [
        {
            label: <Link className='normal' to={`${ROUTE.dashboard}?p=home`}>Home</Link>,
            icon: <HomeOutlined />,
            key: (key++).toString(),
        },
        {
            label: <Link className='normal' to={`${ROUTE.dashboard_aitilen}?p=bds`}>Báo cáo</Link>,
            icon: <BarChartOutlined />,
            key: (key++).toString(),
        },
        // Công việc
        {
            label: <span>Công việc</span>,
            key: (key++).toString(),
            icon: <UnorderedListOutlined />,
            children: [
                {
                    label: <a href={`${ROUTE.taskKanban_all}?p=bds`}>Task</a>, // check mobile, show dang list
                    key: (key++).toString(),
                    icon: <UnorderedListOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.meeting}?p=bds`}>Meeting</Link>,
                    key: (key++).toString(),
                    icon: <TeamOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.projectList}?p=bds`}>Project</Link>,
                    key: (key++).toString(),
                    icon: <TeamOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.taskKanban_all}?p=bds`}>Lịch</Link>,
                    key: (key++).toString(),
                    icon: <BarChartOutlined />,
                },
            ],
        },
        // Quản lý phòng
        {
            label: <span>Phòng</span>,
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
            label: <span>Đẩy phòng</span>,
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
        {
            label: <Link to={`${ROUTE.customerList}?p=bds`}>Khách hàng</Link>,
            key: (key++).toString(),
            icon: <UserOutlined />,
            children: [],
        },
        {
            label: <Link to={`${ROUTE.apartment_bds}?p=bds`}>Tòa nhà</Link>,
            key: (key++).toString(),
            icon: <UserOutlined />,
            children: [],
        },
        {
            label: <Link to={`${ROUTE.aitilen_soQuy}?p=bds`}>Sổ quỹ</Link>,
            key: (key++).toString(),
            icon: <UserOutlined />,
            children: [],
        },
        {
            label: <Link to={`${ROUTE.congNoManagement}?p=bds`}>Công nợ</Link>,
            key: (key++).toString(),
            icon: <UserOutlined />,
            children: [],
        },

    ],
    // project
    pro: [
        {
            label: <Link to={`${ROUTE.dashboard}?p=home`}>Home</Link>,
            icon: <HomeOutlined />,
            key: (key++).toString(),
        },
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
            label: <Link to={`${ROUTE.dashboard}?p=home`}>Home</Link>,
            icon: <HomeOutlined />,
            key: (key++).toString(),
        },
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
            label: <Link to={`${ROUTE.dashboard}?p=home`}>Home</Link>,
            icon: <HomeOutlined />,
            key: (key++).toString(),
        },
        {
            label: <Link to={`${ROUTE.congNoManagement}?p=erp`}>Công nợ</Link>,
            key: (key++).toString(),
            icon: <FileTextOutlined />,
        },
        {
            label: <Link to={`${ROUTE.aitilen_soQuy}?p=erp`}>Sổ quỹ</Link>,
            key: (key++).toString(),
            icon: <FileTextOutlined />,
        },
        {
            label: <Link to={`${ROUTE.aitilen_soQuy}?p=erp`}>Chi tiêu</Link>,
            key: (key++).toString(),
            icon: <FileTextOutlined />,
        },
    ],
    // QL mua hàng / kho
    purchase: [
        {
            label: <Link to={`${ROUTE.dashboard}?p=home`}>Home</Link>,
            icon: <HomeOutlined />,
            key: (key++).toString(),
        },
        {
            label: <Link to={`${ROUTE.supplierManagement}?p=purchase`}>Nhà cung cấp</Link>,
            key: (key++).toString(),
            icon: <ShopOutlined />,
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
            label: <Link to={`${ROUTE.purchaseReportManagement}?p=purchase`}>Báo cáo</Link>,
            key: (key++).toString(),
            icon: <BarChartOutlined />,
        },
    ],
}


export default MENU;
