import React, { useState, useEffect } from 'react';
import { Tabs, Button, Dropdown, Space } from 'antd';
import type { TabsProps, MenuProps } from 'antd';
import {
    DashboardOutlined,
    DollarOutlined,
    ShoppingOutlined,
    UserOutlined,
    CalendarOutlined,
    TeamOutlined,
    InboxOutlined,
    GiftOutlined,
    StarOutlined,
    LineChartOutlined,
    DownOutlined,
} from '@ant-design/icons';

// Import report components
import DashboardOverview from './components/DashboardOverview';
import RevenueReport from './components/RevenueReport';
import ServiceReport from './components/ServiceReport';
import CustomerReport from './components/CustomerReport';
import ScheduleReport from './components/ScheduleReport';
import StaffReport from './components/StaffReport';
import InventoryReport from './components/InventoryReport';
import PackageReport from './components/PackageReport';
import FeedbackReport from './components/FeedbackReport';
import GrowthReport from './components/GrowthReport';

const SpaAnalytics: React.FC = () => {
    let key = 1;

    const tabItems = [
        {
            key: (key++).toString(),
            label: 'Dashboard Tổng quan',
            icon: <DashboardOutlined />,
            children: <DashboardOverview />,
        },
        {
            key: (key++).toString(),
            label: 'Doanh thu & Lợi nhuận',
            icon: <DollarOutlined />,
            children: <RevenueReport />,
        },
        {
            key: (key++).toString(),
            label: 'Báo cáo Dịch vụ',
            icon: <ShoppingOutlined />,
            children: <ServiceReport />,
        },
        {
            key: (key++).toString(),
            label: 'Báo cáo Khách hàng',
            icon: <UserOutlined />,
            children: <CustomerReport />,
        },
        {
            key: (key++).toString(),
            label: 'Lịch trình & Công suất',
            icon: <CalendarOutlined />,
            children: <ScheduleReport />,
        },
        {
            key: (key++).toString(),
            label: 'Báo cáo Nhân viên',
            icon: <TeamOutlined />,
            children: <StaffReport />,
        },
        {
            key: (key++).toString(),
            label: 'Tồn kho & Nguyên liệu',
            icon: <InboxOutlined />,
            children: <InventoryReport />,
        },
        {
            key: (key++).toString(),
            label: 'Gói dịch vụ & Thẻ',
            icon: <GiftOutlined />,
            children: <PackageReport />,
        },
        {
            key: (key++).toString(),
            label: 'Đánh giá & Feedback',
            icon: <StarOutlined />,
            children: <FeedbackReport />,
        },
        {
            key: (key++).toString(),
            label: 'So sánh & Tăng trưởng',
            icon: <LineChartOutlined />,
            children: <GrowthReport />,
        },
    ];

    type TabPosition = 'left' | 'right' | 'top' | 'bottom';
    const [mode, setMode] = useState<TabPosition>('left');
    const [activeKey, setActiveKey] = useState('1');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            setMode(mobile ? 'top' : 'left');
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Dropdown menu items for mobile
    const dropdownMenuItems: MenuProps['items'] = tabItems.map(item => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
        onClick: () => setActiveKey(item.key)
    }));

    const currentTab = tabItems.find(item => item.key === activeKey);

    // Desktop items with icons
    const desktopItems: TabsProps['items'] = tabItems.map(item => ({
        key: item.key,
        label: (
            <span>
                {item.icon} {item.label}
            </span>
        ),
        children: item.children,
    }));

    // Mobile items with icons only
    const mobileItems: TabsProps['items'] = tabItems.map(item => ({
        key: item.key,
        label: item.icon,
        children: item.children,
    }));

    return (
        <div style={{ padding: isMobile ? 12 : 24 }}>
            <style>
                {`
                    @media (max-width: 768px) {
                        .ant-tabs-nav {
                            margin-bottom: 8px !important;
                        }
                        .ant-tabs-tab {
                            padding: 8px 12px !important;
                            margin: 0 4px !important;
                        }
                        .ant-tabs-tab-btn {
                            font-size: 16px !important;
                        }
                        .mobile-tab-header {
                            margin-bottom: 12px;
                            padding: 8px;
                            background: #fafafa;
                            border-radius: 4px;
                        }
                    }
                    @media (min-width: 769px) {
                        .mobile-tab-header {
                            display: none !important;
                        }
                    }
                `}
            </style>

            {/* Mobile Header with Dropdown */}
            {isMobile && (
                <div className="mobile-tab-header">
                    <Dropdown menu={{ items: dropdownMenuItems }} trigger={['click']}>
                        <Button block size="large">
                            <Space>
                                {currentTab?.icon}
                                <span style={{ flex: 1, textAlign: 'left' }}>{currentTab?.label}</span>
                                <DownOutlined />
                            </Space>
                        </Button>
                    </Dropdown>
                </div>
            )}

            {/* Tabs */}
            <Tabs
                tabPosition={mode}
                activeKey={activeKey}
                onChange={setActiveKey}
                items={isMobile ? mobileItems : desktopItems}
                size={isMobile ? 'small' : 'middle'}
            />
        </div>
    );
};

export default SpaAnalytics;
