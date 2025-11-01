
import { Link } from 'react-router-dom';
import ROUTE from './route';
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
    FileDoneOutlined
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
            label: <Link to="/?p=home">Home</Link>,
            icon: <HomeOutlined />,
            key: (key++).toString(),
        },
    ],
    bds: [
        {
            label: <Link className='normal' to="/?p=home">Home</Link>,
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
                    label: <Link to={`${ROUTE.taskKanban_all}?p=bds`}>Task</Link>,
                    key: (key++).toString(),
                    icon: <UnorderedListOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.taskKanban_all}?p=bds`}>Meeting</Link>,
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
                    label: <Link to={`${ROUTE.taskKanban_all}?p=bds`}>Hóa đơn</Link>,
                    key: (key++).toString(),
                    icon: <CopyOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.taskKanban_all}?p=bds`}>Hợp đồng</Link>,
                    key: (key++).toString(),
                    icon: <BookOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.taskKanban_all}?p=bds`}>Chốt điện/nước</Link>,
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
                    label: <Link to={`${ROUTE.taskKanban_all}?p=bds`}>Phòng trống</Link>,
                    key: (key++).toString(),
                    icon: <DashboardOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.taskKanban_all}?p=bds`}>Khách xem phòng</Link>,
                    key: (key++).toString(),
                    icon: <TeamOutlined />,
                },
            ],
        },
        {
            label: <span>Khách hàng</span>,
            key: (key++).toString(),
            icon: <UserOutlined />,
            children: [],
        },
        // Website
        {
            label: <span>Website</span>,
            key: (key++).toString(),
            icon: <GlobalOutlined />,
            children: [
                {
                    label: <Link to={`${ROUTE.taskKanban_all}?p=bds`}>Tin tức</Link>,
                    key: (key++).toString(),
                    icon: <FileTextOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.taskKanban_all}?p=bds`}>Phòng mẫu</Link>,
                    key: (key++).toString(),
                    icon: <FileImageOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.taskKanban_all}?p=bds`}>Phòng trống</Link>,
                    key: (key++).toString(),
                    icon: <DashboardOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.taskKanban_all}?p=bds`}>Video</Link>,
                    key: (key++).toString(),
                    icon: <VideoCameraOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.taskKanban_all}?p=bds`}>Thư viện ảnh</Link>,
                    key: (key++).toString(),
                    icon: <FileImageOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.taskKanban_all}?p=bds`}>Landingpage</Link>,
                    key: (key++).toString(),
                    icon: <GlobalOutlined />,
                },
                {
                    label: <Link to={`${ROUTE.taskKanban_all}?p=bds`}>Liên hệ</Link>,
                    key: (key++).toString(),
                    icon: <MessageOutlined />,
                },
            ],
        }
    ],
    pro: [
        {
            label: <Link to="/?p=home">Báo cáo</Link>,
            icon: <BarChartOutlined />,
            key: (key++).toString(),
        },
        {
            label: <Link to="/?p=home">Dự án</Link>,
            icon: <ApartmentOutlined />,
            key: (key++).toString(),
        },
        {
            label: <Link to={`${ROUTE.dashboard_aitilen}?p=pro`}>Công việc chung</Link>,
            icon: <UnorderedListOutlined />,
            key: (key++).toString(),
        },
        {
            label: <Link to="/?p=home">Meeting</Link>,
            icon: <TeamOutlined />,
            key: (key++).toString(),
        },
        {
            label: <Link to="/?p=home">Lịch</Link>,
            icon: <CalendarOutlined />,
            key: (key++).toString(),
        },
        {
            label: <Link to="/?p=home">Ghi chú</Link>,
            icon: <FileTextOutlined />,
            key: (key++).toString(),
        },
    ]
}


export default MENU;
