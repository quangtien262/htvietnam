import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Link, router } from "@inertiajs/react";
import {
    Select, Col, Row, Descriptions, Card, Button, Input, InputNumber, Form, Statistic,
    Space, DatePicker, Upload, message, Tabs, Calendar, Modal, Checkbox, List, Popconfirm,
    Divider, Table, Spin, Badge
} from 'antd';
import type { TabsProps } from 'antd';

import {
    UsergroupAddOutlined,
    UserSwitchOutlined,
    UserOutlined, ArrowUpOutlined,
    PlusOutlined, ArrowDownOutlined,
    MinusOutlined,
    SoundOutlined, MonitorOutlined,
    MessageOutlined, CalendarOutlined, RightSquareOutlined,
    EuroOutlined, FundProjectionScreenOutlined
} from "@ant-design/icons";

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    Cell, Pie, PieChart, ResponsiveContainer, BarChart, Bar
} from 'recharts';

import "../../../../css/home.css";


import { routeTaiSan } from "../../../Function/config_route";


// Dữ liệu mẫu cho báo cáo tài sản
const dataOverview = [
  { key: 1, name: "Tổng số tài sản", value: 120 },
  { key: 2, name: "Tài sản đang sử dụng", value: 95 },
  { key: 3, name: "Tài sản đã thanh lý", value: 10 },
  { key: 4, name: "Tài sản hỏng", value: 5 },
  { key: 5, name: "Tài sản sắp hết khấu hao", value: 8 },
];
const dataType = [
  { type: "Máy tính", value: 40 },
  { type: "Xe máy", value: 20 },
  { type: "Điện thoại", value: 30 },
  { type: "Khác", value: 30 },
];
const dataChange = [
  { month: "2025-06", added: 5, liquidated: 2 },
  { month: "2025-07", added: 8, liquidated: 1 },
  { month: "2025-08", added: 3, liquidated: 4 },
  { month: "2025-09", added: 6, liquidated: 2 },
];
const dataDept = [
  { dept: "Phòng IT", value: 35 },
  { dept: "Phòng Kế toán", value: 25 },
  { dept: "Phòng HCNS", value: 30 },
  { dept: "Phòng KD", value: 20 },
];
const dataDepreciation = [
  { asset: "Laptop A", remain: 2 },
  { asset: "Xe máy B", remain: 1 },
  { asset: "Điện thoại C", remain: 3 },
];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

interface DashboardProps {
    auth?: any;
}
export default function Dashboard(props: DashboardProps) {
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Tổng quan tài sản',
            children: (
                <Row gutter={16}>
                    <Col span={12}>
                        <Card title="Bảng tổng quan tài sản">
                            <Table
                                dataSource={dataOverview}
                                columns={[
                                    { title: "Chỉ số", dataIndex: "name", key: "name" },
                                    { title: "Giá trị", dataIndex: "value", key: "value" },
                                ]}
                                pagination={false}
                                rowClassName={(_, idx) => (idx % 2 === 0 ? "even-row" : "odd-row")}
                            />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="Phân loại tài sản">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={dataType}
                                        dataKey="value"
                                        nameKey="type"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {dataType.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>
            ),
        },
        {
            key: '2',
            label: 'Biến động tài sản',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Biểu đồ biến động tài sản">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={dataChange} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="added" name="Tăng mới" fill="#52c41a" />
                                    <Bar dataKey="liquidated" name="Thanh lý" fill="#f5222d" />
                                </BarChart>
                            </ResponsiveContainer>
                            <Table
                                dataSource={dataChange}
                                columns={[
                                    { title: "Tháng", dataIndex: "month", key: "month" },
                                    { title: "Tăng mới", dataIndex: "added", key: "added" },
                                    { title: "Thanh lý", dataIndex: "liquidated", key: "liquidated" },
                                ]}
                                pagination={false}
                                rowClassName={(_, idx) => (idx % 2 === 0 ? "even-row" : "odd-row")}
                                style={{ marginTop: 16 }}
                            />
                        </Card>
                    </Col>
                </Row>
            ),
        },
        {
            key: '3',
            label: 'Tài sản theo phòng ban',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Phân bổ tài sản theo phòng ban">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={dataDept} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="dept" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" name="Số lượng tài sản" fill="#1890ff" />
                                </BarChart>
                            </ResponsiveContainer>
                            <Table
                                dataSource={dataDept}
                                columns={[
                                    { title: "Phòng ban", dataIndex: "dept", key: "dept" },
                                    { title: "Số lượng tài sản", dataIndex: "value", key: "value" },
                                ]}
                                pagination={false}
                                rowClassName={(_, idx) => (idx % 2 === 0 ? "even-row" : "odd-row")}
                                style={{ marginTop: 16 }}
                            />
                        </Card>
                    </Col>
                </Row>
            ),
        },
        {
            key: '4',
            label: 'Tài sản sắp hết khấu hao',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Danh sách tài sản sắp hết khấu hao">
                            <Table
                                dataSource={dataDepreciation}
                                columns={[
                                    { title: "Tên tài sản", dataIndex: "asset", key: "asset" },
                                    { title: "Số năm còn lại", dataIndex: "remain", key: "remain" },
                                ]}
                                pagination={false}
                                rowClassName={(_, idx) => (idx % 2 === 0 ? "even-row" : "odd-row")}
                            />
                        </Card>
                    </Col>
                </Row>
            ),
        },
    ];
    return (
        <AdminLayout
            auth={props.auth}
            header='Trang chủ'
            tables={routeTaiSan}
            content={
                <div>
                    <Tabs tabPosition="left" defaultActiveKey="1" items={items} />
                    <style>{`
                        .even-row { background: #fafafa; }
                        .odd-row { background: #fff; }
                    `}</style>
                </div>
            }
        />
    );
}
