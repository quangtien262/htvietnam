
import ROUTE from './route';
import {
    UserOutlined, DownOutlined,
    DashboardOutlined,
    UnorderedListOutlined,
    LockOutlined,
    LogoutOutlined,
    HomeOutlined
} from "@ant-design/icons";

let key = 1;
export const MENU = {
    bds: {
        0: {
            label: 'Báo cáo',
            link: ROUTE.dashboard_aitilen,
            icon: <HomeOutlined />,
            key: (key++).toString(),
        },
        1: {
            label: 'Công việc',
            link: ROUTE.taskKanban_all,
            mobile: ROUTE.taskList_all,
            key: (key++).toString(),
            icon: <HomeOutlined />,
        }
    },
};

export default MENU;
