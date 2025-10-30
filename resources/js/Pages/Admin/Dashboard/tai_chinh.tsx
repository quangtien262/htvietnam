
import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Link, router } from "@inertiajs/react";
import {
    Select, Col, Row, Descriptions, Card, Button, Input, InputNumber, Form, Statistic,
    Space, DatePicker, Upload, message, Tabs, Calendar, Modal, Checkbox, List, Popconfirm,
    Divider, Table, Spin
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
    Cell, Pie, PieChart, ResponsiveContainer
} from 'recharts';

import "../../../../css/home.css";



import { routeTaiChinh, tblTaiChinh } from "../../../Function/config_route";

export default function Dashboard(props: any) {
        // Dữ liệu mẫu cho báo cáo tài chính
        const dataOverview = [
            { key: 1, name: "Tổng thu", value: 120000000 },
            { key: 2, name: "Tổng chi", value: 95000000 },
            { key: 3, name: "Lợi nhuận", value: 25000000 },
            { key: 4, name: "Công nợ phải thu", value: 8000000 },
            { key: 5, name: "Công nợ phải trả", value: 6000000 },
        ];
        const dataMonth = [
            { month: "2025-06", thu: 30000000, chi: 22000000 },
            { month: "2025-07", thu: 35000000, chi: 25000000 },
            { month: "2025-08", thu: 25000000, chi: 20000000 },
            { month: "2025-09", thu: 30000000, chi: 28000000 },
        ];
        const dataCost = [
            { type: "Lương", value: 40000000 },
            { type: "Vật tư", value: 20000000 },
            { type: "Dịch vụ", value: 15000000 },
            { type: "Khác", value: 20000000 },
        ];
        const dataDebt = [
            { name: "Khách hàng A", thu: 5000000, tra: 0 },
            { name: "Khách hàng B", thu: 3000000, tra: 2000000 },
            { name: "Nhà cung cấp C", thu: 0, tra: 4000000 },
        ];
        const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

    // Dữ liệu mẫu bổ sung cho các báo cáo tài chính
    const dataCashFlow = [
      { month: "2025-06", in: 20000000, out: 15000000 },
      { month: "2025-07", in: 25000000, out: 18000000 },
      { month: "2025-08", in: 18000000, out: 17000000 },
      { month: "2025-09", in: 22000000, out: 21000000 },
    ];
    const dataBudget = [
      { name: "Lương", budget: 40000000, actual: 39000000 },
      { name: "Vật tư", budget: 20000000, actual: 21000000 },
      { name: "Dịch vụ", budget: 15000000, actual: 14000000 },
      { name: "Khác", budget: 20000000, actual: 18000000 },
    ];
    const dataAsset = [
      { name: "Máy tính", value: 40000000, depreciation: 10000000 },
      { name: "Xe máy", value: 20000000, depreciation: 5000000 },
    ];
    const dataFund = [
      { name: "Tiền mặt", value: 15000000 },
      { name: "Ngân hàng", value: 35000000 },
    ];
    const dataLoan = [
      { name: "Vay ngân hàng A", amount: 20000000, interest: 1500000 },
      { name: "Vay cá nhân B", amount: 10000000, interest: 800000 },
    ];
    const dataProfit = [
      { name: "Sản phẩm A", profit: 8000000 },
      { name: "Sản phẩm B", profit: 12000000 },
      { name: "Dịch vụ C", profit: 5000000 },
    ];

    const items: TabsProps['items'] = [
        // ...các tab cũ...
        {
            key: '1',
            label: 'Tổng quan thu chi',
            children: (
                <Row gutter={16}>
                    <Col span={12}>
                        <Card title="Bảng tổng quan thu chi">
                            <Table
                                dataSource={dataOverview}
                                columns={[
                                    { title: "Chỉ số", dataIndex: "name", key: "name" },
                                    { title: "Giá trị", dataIndex: "value", key: "value", render: (v: number) => v.toLocaleString() },
                                ]}
                                pagination={false}
                                rowClassName={(_, idx) => (idx % 2 === 0 ? "even-row" : "odd-row")}
                            />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="Cơ cấu chi phí">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={dataCost}
                                        dataKey="value"
                                        nameKey="type"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {dataCost.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: number) => v.toLocaleString()} />
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
            label: 'Thu chi theo tháng',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Biểu đồ thu chi theo tháng">
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={dataMonth} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(v: number) => v.toLocaleString()} />
                                    <Legend />
                                    <Line type="monotone" dataKey="thu" name="Thu" stroke="#52c41a" />
                                    <Line type="monotone" dataKey="chi" name="Chi" stroke="#f5222d" />
                                </LineChart>
                            </ResponsiveContainer>
                            <Table
                                dataSource={dataMonth}
                                columns={[
                                    { title: "Tháng", dataIndex: "month", key: "month" },
                                    { title: "Thu", dataIndex: "thu", key: "thu", render: (v: number) => v.toLocaleString() },
                                    { title: "Chi", dataIndex: "chi", key: "chi", render: (v: number) => v.toLocaleString() },
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
            label: 'Báo cáo công nợ',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Bảng công nợ">
                            <Table
                                dataSource={dataDebt}
                                columns={[
                                    { title: "Đối tượng", dataIndex: "name", key: "name" },
                                    { title: "Phải thu", dataIndex: "thu", key: "thu", render: (v: number) => v.toLocaleString() },
                                    { title: "Phải trả", dataIndex: "tra", key: "tra", render: (v: number) => v.toLocaleString() },
                                ]}
                                pagination={false}
                                rowClassName={(_, idx) => (idx % 2 === 0 ? "even-row" : "odd-row")}
                            />
                        </Card>
                    </Col>
                </Row>
            ),
        },
        {
            key: '4',
            label: 'Báo cáo dòng tiền',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Dòng tiền vào/ra">
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={dataCashFlow} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(v: number) => v.toLocaleString()} />
                                    <Legend />
                                    <Line type="monotone" dataKey="in" name="Tiền vào" stroke="#52c41a" />
                                    <Line type="monotone" dataKey="out" name="Tiền ra" stroke="#f5222d" />
                                </LineChart>
                            </ResponsiveContainer>
                            <Table
                                dataSource={dataCashFlow}
                                columns={[
                                    { title: "Tháng", dataIndex: "month", key: "month" },
                                    { title: "Tiền vào", dataIndex: "in", key: "in", render: (v: number) => v.toLocaleString() },
                                    { title: "Tiền ra", dataIndex: "out", key: "out", render: (v: number) => v.toLocaleString() },
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
            key: '5',
            label: 'Ngân sách & thực chi',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="So sánh ngân sách và thực chi">
                            <Table
                                dataSource={dataBudget}
                                columns={[
                                    { title: "Khoản mục", dataIndex: "name", key: "name" },
                                    { title: "Ngân sách", dataIndex: "budget", key: "budget", render: (v: number) => v.toLocaleString() },
                                    { title: "Thực chi", dataIndex: "actual", key: "actual", render: (v: number) => v.toLocaleString() },
                                ]}
                                pagination={false}
                                rowClassName={(_, idx) => (idx % 2 === 0 ? "even-row" : "odd-row")}
                            />
                        </Card>
                    </Col>
                </Row>
            ),
        },
        {
            key: '6',
            label: 'Tài sản cố định/khấu hao',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Tài sản cố định và khấu hao">
                            <Table
                                dataSource={dataAsset}
                                columns={[
                                    { title: "Tên tài sản", dataIndex: "name", key: "name" },
                                    { title: "Giá trị", dataIndex: "value", key: "value", render: (v: number) => v.toLocaleString() },
                                    { title: "Khấu hao", dataIndex: "depreciation", key: "depreciation", render: (v: number) => v.toLocaleString() },
                                ]}
                                pagination={false}
                                rowClassName={(_, idx) => (idx % 2 === 0 ? "even-row" : "odd-row")}
                            />
                        </Card>
                    </Col>
                </Row>
            ),
        },
        {
            key: '7',
            label: 'Quỹ tiền mặt/ngân hàng',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Quỹ tiền mặt và ngân hàng">
                            <Table
                                dataSource={dataFund}
                                columns={[
                                    { title: "Loại quỹ", dataIndex: "name", key: "name" },
                                    { title: "Số dư", dataIndex: "value", key: "value", render: (v: number) => v.toLocaleString() },
                                ]}
                                pagination={false}
                                rowClassName={(_, idx) => (idx % 2 === 0 ? "even-row" : "odd-row")}
                            />
                        </Card>
                    </Col>
                </Row>
            ),
        },
        {
            key: '8',
            label: 'Khoản vay/lãi vay',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Khoản vay và lãi vay">
                            <Table
                                dataSource={dataLoan}
                                columns={[
                                    { title: "Khoản vay", dataIndex: "name", key: "name" },
                                    { title: "Số tiền vay", dataIndex: "amount", key: "amount", render: (v: number) => v.toLocaleString() },
                                    { title: "Lãi vay", dataIndex: "interest", key: "interest", render: (v: number) => v.toLocaleString() },
                                ]}
                                pagination={false}
                                rowClassName={(_, idx) => (idx % 2 === 0 ? "even-row" : "odd-row")}
                            />
                        </Card>
                    </Col>
                </Row>
            ),
        },
        {
            key: '9',
            label: 'Phân tích lợi nhuận theo SP/DV',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Lợi nhuận theo sản phẩm/dịch vụ">
                            <Table
                                dataSource={dataProfit}
                                columns={[
                                    { title: "Tên SP/DV", dataIndex: "name", key: "name" },
                                    { title: "Lợi nhuận", dataIndex: "profit", key: "profit", render: (v: number) => v.toLocaleString() },
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
            tables={routeTaiChinh}
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
