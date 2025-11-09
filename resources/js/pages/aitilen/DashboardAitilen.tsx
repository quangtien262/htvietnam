import React, { useState, useEffect } from "react";

import { useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { ROUTE } from "../../common/route";



import {
    Select, Col, Row, Descriptions, Card, Button, Input, InputNumber, Form, Statistic,
    Space, DatePicker, Upload, message, Tabs, Calendar, Modal, Checkbox, List, Popconfirm,
    Divider, Table, Spin, Badge, Menu, Switch, TabsProps, Tag, Dropdown
} from 'antd';


import { motion } from "framer-motion";
import dayjs from 'dayjs';
import {
    SoundOutlined, MonitorOutlined,
    MessageOutlined, AppstoreOutlined,
    CalendarOutlined,
    LinkOutlined,
    MailOutlined,
    SettingOutlined,
    TrophyOutlined,
    HomeOutlined,
    DollarOutlined,
    LineChartOutlined,
    FileTextOutlined,
    BankOutlined,
    MenuOutlined,
    DownOutlined,
    BarChartOutlined,
    FileDoneOutlined
} from "@ant-design/icons";
import {
    Tooltip, Cell, Pie, PieChart, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    LineChart, Line
} from 'recharts';

import "../../../css/home.css";
import { numberFormat, } from "../../function/common";
import { routeSales } from "../../function/config_route";
import { history } from "../../function/report";
import type { GetProp, MenuProps } from 'antd';

import TotalReport from "./components/TotalReport";
import TienPhongReport from "./components/TienPhongReport";
import DichVuReport from "./components/DichVuReport";
import ThuChiReport from "./components/ThuChiReport";
import CongNoReport from "./components/CongNoReport";
import AssetReport from "./components/AssetReport";
import TienPhongStatisticsReport from "./components/TienPhongStatisticsReport";
import ContractStatisticsReport from "./components/ContractStatisticsReport";


const DashboardAitilen: React.FC = () => {
    let key = 1;

    const tabItems = [
        {
            key: (key++).toString(),
            label: 'Lợi nhuận thực tế',
            icon: <TrophyOutlined />,
            children: <TotalReport />,
        },
        {
            key: (key++).toString(),
            label: 'Lợi nhuận theo tiền phòng',
            icon: <DollarOutlined />,
            children: <TienPhongReport />,
        },
        {
            key: (key++).toString(),
            label: 'Báo cáo tiền phòng',
            icon: <BarChartOutlined />,
            children: <TienPhongStatisticsReport />,
        },
        {
            key: (key++).toString(),
            label: 'Báo cáo hợp đồng',
            icon: <FileDoneOutlined />,
            children: <ContractStatisticsReport />,
        },
        {
            key: (key++).toString(),
            label: 'Báo cáo thu/chi',
            icon: <LineChartOutlined />,
            children: <ThuChiReport />,
        },
        {
            key: (key++).toString(),
            label: 'Báo cáo công nợ',
            icon: <FileTextOutlined />,
            children: <CongNoReport />,
        },
        {
            key: (key++).toString(),
            label: 'Báo cáo tài sản',
            icon: <BankOutlined />,
            children: <AssetReport />,
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
        <div>
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

export default DashboardAitilen;
