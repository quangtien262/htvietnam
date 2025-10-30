import react, { useState } from "react";
import AdminLayout from '@/layouts/AdminLayout';

import {
    Select, Col, Row, Descriptions, Card, Button, Input, InputNumber, Form, Statistic,
    Space, DatePicker, Upload, message, Tabs, Calendar, Modal, Checkbox, List, Popconfirm,
    Divider, Table, Spin, Badge, Menu, Switch
} from 'antd';


import { motion } from "framer-motion";
import dayjs from 'dayjs';
import { Inertia } from "@inertiajs/inertia";
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
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    LineChart, Line
} from 'recharts';

import "../../../../css/home.css";
import { numberFormat } from "../../../Function/common";

import { history } from "../../../Function/report";
import { routeReport, tblReport } from "../../../Function/config_route";
import type { GetProp, MenuProps } from 'antd';

export default function Dashboard(props: any) {
    const [nhapHangData, setNhapHangData] = useState([]);
    const [loadingTable, setLoadingTable] = useState(false);

    type MenuItem = GetProp<MenuProps, 'items'>[number];
    let key = 1;
    const items: MenuItem[] = [
        {
            key: key++,
            label: 'BC Tổng quan',
            icon: <AppstoreOutlined />,
        },
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
                { key: key++, label: 'Danh sách hóa đơn' },
                { key: key++, label: 'Chi tiết sản phẩm đã bán' },
                { key: key++, label: 'Số lượng khách hàng mua theo ngày' },
                { key: key++, label: 'BC lợi nhuận gộp' },
                { key: key++, label: 'BC giảm giá / khuyến mãi' },
            ],
        },
        {
            key: key++,
            label: 'Tài chính – chi phí',
            icon: <SettingOutlined />,
            children: [
                { key: key++, label: 'Thu – Chi tiền mặt' },
                { key: key++, label: 'BC sổ quỹ' },
                { key: key++, label: 'BC lãi lỗ tổng hợp' },
                { key: key++, label: 'Chi phí vận hành' },
                { key: key++, label: 'BC tổng hợp lợi nhuận – chi phí' },
            ],
        },
        {
            key: key++,
            label: 'BC hiệu suất',
            icon: <SettingOutlined />,
            children: [
                { key: key++, label: 'BC năng suất nhân viên' },
                { key: key++, label: 'BC tỷ lệ chuyển đổi đơn hàng' },
                { key: key++, label: 'So sánh doanh số giữa các nhóm hàng' },
            ],
        },
        {
            key: key++,
            label: 'BC công nợ',
            icon: <SettingOutlined />,
            children: [
                { key: key++, label: 'Nơ phải thu' },
                { key: key++, label: 'Nợ phải trả' },
                { key: key++, label: 'Công nợ quá hạn, sắp đến hạn' },
                { key: key++, label: 'Lịch sử thanh toán công nợ' },
            ],
        },
        {
            key: key++,
            label: 'BC khách hàng',
            icon: <SettingOutlined />,
            children: [
                { key: key++, label: 'Khách hàng mới' },
                { key: key++, label: 'Tần suất mua hàng của khách' },
                { key: key++, label: 'Doanh thu theo khách hàng' },
                { key: key++, label: <span>'BC nhóm khách hàng'</span> },
            ],
        },
        {
            key: key++,
            label: 'Lịch sử sử dụng',
            icon: <SettingOutlined />,
        },
    ];


    const fallback = {
        totals: {
            revenue: 1245320.5,
            orders: 3241,
            customers: 1450,
            profit: 342120.25,
        },
        revenueSeries: [
            { date: "2025-07-01", revenue: 20000 },
            { date: "2025-07-02", revenue: 25000 },
            { date: "2025-07-03", revenue: 18000 },
            { date: "2025-07-04", revenue: 32000 },
            { date: "2025-07-05", revenue: 28000 },
            { date: "2025-07-06", revenue: 30000 },
            { date: "2025-07-07", revenue: 35000 },
        ],
        topProducts: [
            { key: 1, name: "Product A", sku: "PA-001", sold: 420, revenue: 84000 },
            { key: 2, name: "Product B", sku: "PB-002", sold: 380, revenue: 57000 },
            { key: 3, name: "Product C", sku: "PC-003", sold: 330, revenue: 49500 },
        ],
        paymentBreakdown: [
            { name: "Cash", value: 540000 },
            { name: "Card", value: 420000 },
            { name: "E-wallet", value: 285320.5 },
        ],
    };

    // Merge props with fallback (prefer server-provided values)
    const data = { ...fallback, ...(props?.overview || {}) };

    // Memoized computed values
    const pieColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50"];

    const tableColumns = [
        { title: "Product", dataIndex: "name", key: "name" },
        { title: "SKU", dataIndex: "sku", key: "sku" },
        { title: "Units Sold", dataIndex: "sold", key: "sold" },
        {
            title: "Revenue",
            dataIndex: "revenue",
            key: "revenue",
            render: (val: number) => formatCurrency(val),
        },
    ];

    // Helper to format currency consistently
    function formatCurrency(amount = 0) {
    return amount.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
    }

    // Simple control handlers — using Inertia to request filtered data (server-side)
    function onFilterChange(values) {
        // Example: send the selected filters to the server to reload overview data
        // This call assumes you have a named route '/reports/overview' that accepts query params.
        Inertia.get(route("reports.overview"), values, { preserveState: true, replace: true });
    }

    return (
        <AdminLayout  
                auth={props.auth}
                header='Trang chủ'
                tables={tblReport}
                content={
                    <>
                        <Row>
                            {/* menu */}
                            <Col sm={6}>
                                <Menu className="menu-report"
                                    style={{ width: 256 }}
                                    defaultSelectedKeys={['1']}
                                    defaultOpenKeys={['1']}
                                    mode={'inline'}
                                    theme={'light'}
                                    items={items}
                                />
                            </Col>
                            {/* content */}
                            <Col sm={18}>
                                <div style={{ padding: 20 }} className='content-home'>
                                    {/* Bảng nhập hàng */}
                                    <div className='sub-item-home'>
                                        <h3>
                                            <MonitorOutlined />
                                            Báo cáo tổng quan
                                        </h3>
                                        <div className="p-6">
                                            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }}>
                                                {/* Filters row */}
                                                <Card className="mb-6">
                                                    <Row gutter={[16, 16]} align="middle">
                                                        <Col xs={24} md={10} lg={8}>
                                                            <label className="block mb-1 text-sm text-gray-600">Thời gian</label>
                                                            <DatePicker.RangePicker onChange={(dates, dateStrings) => onFilterChange({ from: dateStrings[0], to: dateStrings[1] })} />
                                                        </Col>
                                                    </Row>
                                                </Card>
                                                {/* KPI cards */}
                                                <Row gutter={[16, 16]} className="mb-6">
                                                    <Col xs={24} sm={12} md={8}>
                                                        <Card className="rounded-2xl shadow-md p-4">
                                                            <Statistic title="Tổng doanh thu" value={props.doanhThu} />
                                                        </Card>
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <Card className="rounded-2xl shadow-md p-4">
                                                            <Statistic title="Tổng đơn hàng" value={props.slDonHangMoi} />
                                                        </Card>
                                                    </Col>
                                                    <Col xs={24} sm={12} md={8}>
                                                        <Card className="rounded-2xl shadow-md p-4">
                                                            <Statistic title="Khách hàng mới" value={props.slKhachHangMoi} />
                                                        </Card>
                                                    </Col>
                                                </Row>

                                                <Row><br/></Row>
                                                
                                                {/* Charts and tables grid */}
                                                <Row gutter={[16, 16]}>
                                                    <Col xs={24} lg={16}>
                                                        <Card className="rounded-2xl shadow-md">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h3 className="text-lg font-medium">Doanh thu trong 7 ngày qua</h3>
                                                                <div className="text-sm text-gray-500 sub-title">Từ 25/07/2025 - 01/08/2025</div>
                                                            </div>
                                                            <div style={{ width: "100%", height: 300 }}>
                                                                <ResponsiveContainer>
                                                                    <LineChart data={data.revenueSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                                        <CartesianGrid strokeDasharray="3 3" />
                                                                        <XAxis dataKey="date" />
                                                                        <YAxis />
                                                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                                                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} />
                                                                    </LineChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                        </Card>
                                                        <Card className="rounded-2xl shadow-md mt-4">
                                                            <h3 className="text-lg font-medium mb-3">Top sản phẩm bán chạy nhất</h3>
                                                            <Table dataSource={data.topProducts} columns={tableColumns} pagination={false} />
                                                        </Card>
                                                    </Col>
                                                    <Col xs={24} lg={8}>
                                                        <Card className="rounded-2xl shadow-md mb-4">
                                                            <h3 className="text-lg font-medium mb-3">Phương thức thanh toán</h3>
                                                            <div style={{ width: "100%", height: 240 }}>
                                                                <ResponsiveContainer>
                                                                    <PieChart>
                                                                        <Pie data={data.paymentBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                                                                            {data.paymentBreakdown.map((entry: any, index: number) => (
                                                                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                                                            ))}
                                                                        </Pie>
                                                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                                                    </PieChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                        </Card>
                                                        <Card className="rounded-2xl shadow-md">
                                                            <h3 className="text-lg font-medium mb-3">Khách hàng mới</h3>
                                                            <div className="flex flex-col gap-2">
                                                                <List
                                                                    dataSource={props.khachHangMoi}
                                                                    renderItem={(item: any) => (
                                                                        <List.Item>
                                                                            <List.Item.Meta
                                                                                title={item.name}
                                                                                description={`SĐT: ${item.phone}`}
                                                                            />
                                                                        </List.Item>
                                                                    )}
                                                                />
                                                            </div>
                                                        </Card>
                                                    </Col>
                                                </Row>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </>
                }
            />
    );
}
