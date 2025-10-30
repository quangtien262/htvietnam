
import AdminLayout from '@/layouts/AdminLayout';
import { router } from "@inertiajs/react";
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
    Cell, Pie, PieChart, ResponsiveContainer
} from 'recharts';

import "../../../../css/home.css";



import { routeNhanSu, tblNhanSu } from "../../../Function/config_route";

export default function Dashboard(props: any) {
        // Dữ liệu mẫu cho báo cáo nhân sự
        const dataOverview = [
            { key: 1, name: "Tổng số nhân sự", value: 80 },
            { key: 2, name: "Đang làm việc", value: 70 },
            { key: 3, name: "Nghỉ việc", value: 5 },
            { key: 4, name: "Sắp hết hạn HĐLĐ", value: 3 },
        ];
        const dataDept = [
            { dept: "Phòng IT", value: 20 },
            { dept: "Phòng Kế toán", value: 15 },
            { dept: "Phòng HCNS", value: 18 },
            { dept: "Phòng KD", value: 17 },
        ];
        const dataChange = [
            { month: "2025-06", joined: 2, left: 1 },
            { month: "2025-07", joined: 3, left: 0 },
            { month: "2025-08", joined: 1, left: 2 },
            { month: "2025-09", joined: 2, left: 1 },
        ];
        const dataContract = [
            { name: "Nguyễn Văn A", dept: "IT", end: "2025-09-20" },
            { name: "Trần Thị B", dept: "Kế toán", end: "2025-09-25" },
            { name: "Lê Văn C", dept: "HCNS", end: "2025-09-30" },
        ];
        const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

    // Dữ liệu mẫu bổ sung cho các báo cáo nhân sự
    const dataLeave = [
      { name: "Nguyễn Văn A", dept: "IT", days: 2 },
      { name: "Trần Thị B", dept: "Kế toán", days: 1 },
      { name: "Lê Văn C", dept: "HCNS", days: 3 },
    ];
    const dataLate = [
      { name: "Nguyễn Văn A", dept: "IT", late: 1, early: 0 },
      { name: "Trần Thị B", dept: "Kế toán", late: 0, early: 1 },
      { name: "Lê Văn C", dept: "HCNS", late: 2, early: 1 },
    ];
    const dataSalary = [
      { name: "Nguyễn Văn A", dept: "IT", salary: 15000000, bonus: 2000000 },
      { name: "Trần Thị B", dept: "Kế toán", salary: 12000000, bonus: 1500000 },
      { name: "Lê Văn C", dept: "HCNS", salary: 13000000, bonus: 1000000 },
    ];
    const dataTraining = [
      { name: "Nguyễn Văn A", dept: "IT", course: "ReactJS", date: "2025-08-10" },
      { name: "Trần Thị B", dept: "Kế toán", course: "Kế toán Excel", date: "2025-07-15" },
    ];
    const dataPerformance = [
      { name: "Nguyễn Văn A", dept: "IT", score: 95 },
      { name: "Trần Thị B", dept: "Kế toán", score: 88 },
      { name: "Lê Văn C", dept: "HCNS", score: 92 },
    ];
    const dataReward = [
      { name: "Nguyễn Văn A", dept: "IT", type: "Khen thưởng", note: "Hoàn thành dự án" },
      { name: "Trần Thị B", dept: "Kế toán", type: "Kỷ luật", note: "Đi muộn" },
    ];
    const dataInsurance = [
      { name: "Nguyễn Văn A", dept: "IT", bhxh: true, bhyt: true },
      { name: "Trần Thị B", dept: "Kế toán", bhxh: true, bhyt: false },
    ];

    const items: TabsProps['items'] = [
        // ...các tab cũ...
        {
            key: '1',
            label: 'Tổng quan nhân sự',
            children: (
                <Row gutter={16}>
                    <Col span={12}>
                        <Card title="Bảng tổng quan nhân sự">
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
                        <Card title="Phân bổ nhân sự theo phòng ban">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={dataDept}
                                        dataKey="value"
                                        nameKey="dept"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {dataDept.map((entry, index) => (
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
            label: 'Biến động nhân sự',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Biểu đồ biến động nhân sự">
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={dataChange} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="joined" name="Vào làm" stroke="#52c41a" />
                                    <Line type="monotone" dataKey="left" name="Nghỉ việc" stroke="#f5222d" />
                                </LineChart>
                            </ResponsiveContainer>
                            <Table
                                dataSource={dataChange}
                                columns={[
                                    { title: "Tháng", dataIndex: "month", key: "month" },
                                    { title: "Vào làm", dataIndex: "joined", key: "joined" },
                                    { title: "Nghỉ việc", dataIndex: "left", key: "left" },
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
            label: 'Nhân sự sắp hết hạn HĐLĐ',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Danh sách nhân sự sắp hết hạn hợp đồng">
                            <Table
                                dataSource={dataContract}
                                columns={[
                                    { title: "Họ tên", dataIndex: "name", key: "name" },
                                    { title: "Phòng ban", dataIndex: "dept", key: "dept" },
                                    { title: "Ngày hết hạn", dataIndex: "end", key: "end" },
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
            label: 'Báo cáo nghỉ phép',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Danh sách nghỉ phép">
                            <Table
                                dataSource={dataLeave}
                                columns={[
                                    { title: "Họ tên", dataIndex: "name", key: "name" },
                                    { title: "Phòng ban", dataIndex: "dept", key: "dept" },
                                    { title: "Số ngày nghỉ", dataIndex: "days", key: "days" },
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
            key: '5',
            label: 'Báo cáo đi muộn/về sớm',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Đi muộn/Về sớm">
                            <Table
                                dataSource={dataLate}
                                columns={[
                                    { title: "Họ tên", dataIndex: "name", key: "name" },
                                    { title: "Phòng ban", dataIndex: "dept", key: "dept" },
                                    { title: "Đi muộn", dataIndex: "late", key: "late" },
                                    { title: "Về sớm", dataIndex: "early", key: "early" },
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
            label: 'Báo cáo lương thưởng',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Lương thưởng nhân sự">
                            <Table
                                dataSource={dataSalary}
                                columns={[
                                    { title: "Họ tên", dataIndex: "name", key: "name" },
                                    { title: "Phòng ban", dataIndex: "dept", key: "dept" },
                                    { title: "Lương", dataIndex: "salary", key: "salary", render: (v: number) => v.toLocaleString() },
                                    { title: "Thưởng", dataIndex: "bonus", key: "bonus", render: (v: number) => v.toLocaleString() },
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
            label: 'Báo cáo đào tạo',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Đào tạo nhân sự">
                            <Table
                                dataSource={dataTraining}
                                columns={[
                                    { title: "Họ tên", dataIndex: "name", key: "name" },
                                    { title: "Phòng ban", dataIndex: "dept", key: "dept" },
                                    { title: "Khóa học", dataIndex: "course", key: "course" },
                                    { title: "Ngày học", dataIndex: "date", key: "date" },
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
            label: 'Báo cáo đánh giá hiệu suất',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Đánh giá hiệu suất nhân sự">
                            <Table
                                dataSource={dataPerformance}
                                columns={[
                                    { title: "Họ tên", dataIndex: "name", key: "name" },
                                    { title: "Phòng ban", dataIndex: "dept", key: "dept" },
                                    { title: "Điểm đánh giá", dataIndex: "score", key: "score" },
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
            label: 'Khen thưởng/Kỷ luật',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Khen thưởng/Kỷ luật nhân sự">
                            <Table
                                dataSource={dataReward}
                                columns={[
                                    { title: "Họ tên", dataIndex: "name", key: "name" },
                                    { title: "Phòng ban", dataIndex: "dept", key: "dept" },
                                    { title: "Loại", dataIndex: "type", key: "type" },
                                    { title: "Ghi chú", dataIndex: "note", key: "note" },
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
            key: '10',
            label: 'Báo cáo bảo hiểm/phúc lợi',
            children: (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Bảo hiểm và phúc lợi nhân sự">
                            <Table
                                dataSource={dataInsurance}
                                columns={[
                                    { title: "Họ tên", dataIndex: "name", key: "name" },
                                    { title: "Phòng ban", dataIndex: "dept", key: "dept" },
                                    { title: "BHXH", dataIndex: "bhxh", key: "bhxh", render: (v: boolean) => v ? 'Có' : 'Không' },
                                    { title: "BHYT", dataIndex: "bhyt", key: "bhyt", render: (v: boolean) => v ? 'Có' : 'Không' },
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
            tables={routeNhanSu}
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
