import React from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Link, router } from "@inertiajs/react";

import {
    Select, Col, Row, Descriptions, Card, Button, Input, InputNumber, Form, Statistic,
    Space, DatePicker, Upload, message, Tabs, Calendar, Modal, Checkbox, List, Popconfirm,
    Divider, Table, Spin, TabsProps
} from 'antd';

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


import { routeTask, tblTask } from "../../../Function/config_route";

// Dữ liệu mẫu cho các báo cáo
const dataProgress = [
  { status: "Hoàn thành", value: 32 },
  { status: "Đang làm", value: 12 },
  { status: "Chưa bắt đầu", value: 8 },
];
const dataEmployee = [
  { name: "An", done: 12, overdue: 2 },
  { name: "Bình", done: 8, overdue: 1 },
  { name: "Cường", done: 15, overdue: 0 },
];
const dataProject = [
  { project: "Dự án A", total: 20, done: 15 },
  { project: "Dự án B", total: 10, done: 7 },
  { project: "Dự án C", total: 22, done: 20 },
];
const dataOverdue = [
  { task: "CV001", assignee: "An", deadline: "2025-09-10", status: "Quá hạn" },
  { task: "CV002", assignee: "Bình", deadline: "2025-09-12", status: "Quá hạn" },
];
const dataTime = [
  { date: "2025-09-01", created: 5, done: 3 },
  { date: "2025-09-02", created: 7, done: 4 },
  { date: "2025-09-03", created: 6, done: 5 },
  { date: "2025-09-04", created: 8, done: 7 },
];
const dataAssign = [
  { name: "An", assigned: 10 },
  { name: "Bình", assigned: 8 },
  { name: "Cường", assigned: 12 },
];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

interface DashboardProps {
    auth?: any;
}
export default function Dashboard(props: DashboardProps) {
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: 'Báo cáo tiến độ công việc',
            children: (
                <Row gutter={16}>
                    <Col span={12}>
                        <Card title="Biểu đồ tiến độ công việc">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={dataProgress}
                                        dataKey="value"
                                        nameKey="status"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {dataProgress.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="Bảng tiến độ công việc">
                            <Table
                                dataSource={dataProgress}
                                columns={[
                                    { title: "Trạng thái", dataIndex: "status", key: "status" },
                                    { title: "Số lượng", dataIndex: "value", key: "value" },
                                ]}
                                rowKey="status"
                                pagination={false}
                                rowClassName={(_, idx) => (idx % 2 === 0 ? "even-row" : "odd-row")}
                            />
                        </Card>
                    </Col>
                </Row>
            ),
        },
        {
            key: '2',
            label: 'Báo cáo tồn đọng công việc',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Công việc quá hạn">
                            <Table
                                dataSource={dataOverdue}
                                columns={[
                                    { title: "Mã CV", dataIndex: "task", key: "task" },
                                    { title: "Người phụ trách", dataIndex: "assignee", key: "assignee" },
                                    { title: "Hạn hoàn thành", dataIndex: "deadline", key: "deadline" },
                                    { title: "Trạng thái", dataIndex: "status", key: "status" },
                                ]}
                                rowKey="task"
                                pagination={false}
                                rowClassName={(_, idx) => (idx % 2 === 0 ? "even-row" : "odd-row")}
                            />
                        </Card>
                    </Col>
                </Row>
            ),
        },
        {
            key: '3',
            label: 'Báo cáo hiệu suất nhân viên',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Hiệu suất nhân viên">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={dataEmployee} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="done" name="Hoàn thành" fill="#52c41a" />
                                    <Bar dataKey="overdue" name="Quá hạn" fill="#f5222d" />
                                </BarChart>
                            </ResponsiveContainer>
                            <Table
                                dataSource={dataEmployee}
                                columns={[
                                    { title: "Nhân viên", dataIndex: "name", key: "name" },
                                    { title: "Hoàn thành", dataIndex: "done", key: "done" },
                                    { title: "Quá hạn", dataIndex: "overdue", key: "overdue" },
                                ]}
                                rowKey="name"
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
            label: 'Báo cáo theo dự án',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Tiến độ theo dự án">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={dataProject} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="project" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="total" name="Tổng số CV" fill="#1890ff" />
                                    <Bar dataKey="done" name="Hoàn thành" fill="#52c41a" />
                                </BarChart>
                            </ResponsiveContainer>
                            <Table
                                dataSource={dataProject}
                                columns={[
                                    { title: "Dự án", dataIndex: "project", key: "project" },
                                    { title: "Tổng số CV", dataIndex: "total", key: "total" },
                                    { title: "Hoàn thành", dataIndex: "done", key: "done" },
                                ]}
                                rowKey="project"
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
            label: 'Báo cáo theo thời gian',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Biểu đồ công việc theo thời gian">
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={dataTime} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="created" name="Tạo mới" stroke="#1890ff" />
                                    <Line type="monotone" dataKey="done" name="Hoàn thành" stroke="#52c41a" />
                                </LineChart>
                            </ResponsiveContainer>
                            <Table
                                dataSource={dataTime}
                                columns={[
                                    { title: "Ngày", dataIndex: "date", key: "date" },
                                    { title: "Tạo mới", dataIndex: "created", key: "created" },
                                    { title: "Hoàn thành", dataIndex: "done", key: "done" },
                                ]}
                                rowKey="date"
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
            key: '6',
            label: 'Báo cáo phân bổ công việc',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Phân bổ công việc theo nhân viên">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={dataAssign} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="assigned" name="Số lượng được giao" fill="#faad14" />
                                </BarChart>
                            </ResponsiveContainer>
                            <Table
                                dataSource={dataAssign}
                                columns={[
                                    { title: "Nhân viên", dataIndex: "name", key: "name" },
                                    { title: "Số lượng được giao", dataIndex: "assigned", key: "assigned" },
                                ]}
                                rowKey="name"
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
            key: '7',
            label: 'Báo cáo tổng hợp',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Tổng quan công việc">
                            <Table
                                dataSource={[
                                    { key: 1, name: "Tổng số công việc", value: 52 },
                                    { key: 2, name: "Đã hoàn thành", value: 32 },
                                    { key: 3, name: "Đang làm", value: 12 },
                                    { key: 4, name: "Chưa bắt đầu", value: 8 },
                                    { key: 5, name: "Quá hạn", value: 2 },
                                ]}
                                columns={[
                                    { title: "Chỉ số", dataIndex: "name", key: "name" },
                                    { title: "Giá trị", dataIndex: "value", key: "value" },
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
            tables={routeTask}
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
