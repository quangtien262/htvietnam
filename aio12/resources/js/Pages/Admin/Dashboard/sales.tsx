import { useState } from "react";
import AdminLayout from '@/layouts/AdminLayout';

import {
    Select, Col, Row, Descriptions, Card, Button, Input, InputNumber, Form, Statistic,
    Space, DatePicker, Upload, message, Tabs, Calendar, Modal, Checkbox, List, Popconfirm,
    Divider, Table, Spin, Badge, Menu, Switch
} from 'antd';

import type { GetProp, MenuProps } from 'antd';

import {
    SoundOutlined, MonitorOutlined,
    MessageOutlined, AppstoreOutlined,
    CalendarOutlined,
    LinkOutlined,
    MailOutlined,
    SettingOutlined,
} from "@ant-design/icons";

import {
    Tooltip, Cell, Pie, PieChart, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';


import "../../../../css/home.css";
import { numberFormat } from "../../../Function/common";
import { routeQLKho } from "../../../Function/config_route";
import { report_kho_nhapHang, report_kho_tongQuan, report_kho_tonKho, report_kho_kiemKeKho, report_kho_congNo, history } from "../../../Function/report";

export default function Dashboard(props: any) {
    const [nhapHangData, setNhapHangData] = useState([]);
    const [loadingTable, setLoadingTable] = useState(false);

    type MenuTheme = GetProp<MenuProps, 'theme'>;

    type MenuItem = GetProp<MenuProps, 'items'>[number];

    let key = 1;
    const items: MenuItem[] = [
        {
            key: key++,
            label: 'Doanh thu & lợi nhuận',
            icon: <AppstoreOutlined />,
            children: [
                { key: key++, label: 'Theo thời gian' },
                { key: key++, label: 'Theo sản phẩm' },
                { key: key++, label: 'Theo danh mục' },
                { key: key++, label: 'Theo nhân viên bán hàng' },
                { key: key++, label: 'Theo chi nhánh/khu vực' },
                { key: key++, label: 'Lợi nhuận gộp' },
                { key: key++, label: 'Lợi nhuận ròng' },
                { key: key++, label: 'So sánh' },
            ],
        },
        {
            key: key++,
            label: 'Bán hàng chi tiết',
            icon: <SettingOutlined />,
            children: [
                { key: key++, label: '' },
                { key: key++, label: '' },
                { key: key++, label: '' },
                { key: key++, label: '' },
            ],
        },
        {
            key: key++,
            label: 'Tài chính – chi phí',
            icon: <SettingOutlined />,
            children: [
                { key: key++, label: '' },
                { key: key++, label: '' },
                { key: key++, label: '' },
                { key: key++, label: '' },
            ],
        },
        {
            key: key++,
            label: 'Báo cáo hiệu suất',
            icon: <SettingOutlined />,
            children: [
                { key: key++, label: '' },
                { key: key++, label: '' },
                { key: key++, label: '' },
                { key: key++, label: '' },
            ],
        },
        {
            key: key++,
            label: 'Lịch sử sử dụng',
            icon: <SettingOutlined />,
            children: [
                { key: key++, label: '' },
                { key: key++, label: '' },
                { key: key++, label: '' },
                { key: key++, label: '' },
            ],
        },
    ];

    return (
        <AdminLayout
            auth={props.auth}
            header='Trang chủ'
            tables={routeQLKho}
            content={
                <>
                    <Row>
                        <Col sm={6}>
                            <Menu className="menu-report"
                                style={{ width: 256 }}
                                // defaultSelectedKeys={['1']}
                                defaultOpenKeys={['sub1']}
                                mode={'inline'}
                                theme={'light'}
                                items={items}
                            />
                        </Col>
                        <Col sm={18}>
                            <div style={{ padding: 20 }} className='content-home'>
                                {/* Bảng nhập hàng */}
                                <div className='sub-item-home'>
                                    <h3>
                                        <MonitorOutlined />
                                        Báo cáo nhập hàng
                                    </h3>
                                </div>
                            </div>
                        </Col>
                    </Row>

                </>
            }
        />
    );
}
