import React, { useState, useEffect } from "react";
import { Card, Statistic, Row, Col, Table, DatePicker, Select, Space, Button } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import dayjs, { Dayjs } from "dayjs";

import FilterBar from "./FilterBar";

const quickOptions = [
    { label: "Tuần này", value: "this_week" },
    { label: "Tuần trước", value: "last_week" },
    { label: "Tháng này", value: "this_month" },
    { label: "Tháng trước", value: "last_month" },
    { label: "Quý 1", value: "q1" },
    { label: "Quý 2", value: "q2" },
    { label: "Quý 3", value: "q3" },
    { label: "Quý 4", value: "q4" },
    { label: "Năm nay", value: "this_year" },
    { label: "Năm ngoái", value: "last_year" },
];

function getRange(option: string): [Dayjs, Dayjs] {
    const now = dayjs();
    switch (option) {
        case "this_week":
            return [now.startOf("week"), now.endOf("week")];
        case "last_week":
            return [now.subtract(1, "week").startOf("week"), now.subtract(1, "week").endOf("week")];
        case "this_month":
            return [now.startOf("month"), now.endOf("month")];
        case "last_month":
            return [now.subtract(1, "month").startOf("month"), now.subtract(1, "month").endOf("month")];
        case "q1":
            return [now.year(now.year()).month(0).date(1), now.year(now.year()).month(2).endOf("month")];
        case "q2":
            return [now.year(now.year()).month(3).date(1), now.year(now.year()).month(5).endOf("month")];
        case "q3":
            return [now.year(now.year()).month(6).date(1), now.year(now.year()).month(8).endOf("month")];
        case "q4":
            return [now.year(now.year()).month(9).date(1), now.year(now.year()).month(11).endOf("month")];
        case "this_year":
            return [now.startOf("year"), now.endOf("year")];
        case "last_year":
            return [now.subtract(1, "year").startOf("year"), now.subtract(1, "year").endOf("year")];
        default:
            return [now.startOf("month"), now.endOf("month")];
    }
}

const revenueData = [
    { month: "Tháng 1", revenue: 15000000 },
    { month: "Tháng 2", revenue: 18000000 },
    { month: "Tháng 3", revenue: 21000000 },
    { month: "Tháng 4", revenue: 17000000 },
    { month: "Tháng 5", revenue: 25000000 },
];

const tableData = [
    { key: 1, name: "Phòng A", revenue: 7000000 },
    { key: 2, name: "Phòng B", revenue: 9000000 },
    { key: 3, name: "Phòng C", revenue: 6000000 },
];

const columns = [
    { title: "Tên phòng", dataIndex: "name", key: "name" },
    { title: "Tiền thu về", dataIndex: "revenue", key: "revenue", render: (value: number) => value.toLocaleString() + " ₫" },
];

const ThuChiReport: React.FC = () => {
    const summary = {
        totalThu: 120000000,
        totalChi: 65000000,
        net: 55000000,
    };
    const chartData = [
        { month: "Tháng 1", thu: 15000000, chi: 8000000 },
        { month: "Tháng 2", thu: 18000000, chi: 9000000 },
        { month: "Tháng 3", thu: 21000000, chi: 12000000 },
        { month: "Tháng 4", thu: 17000000, chi: 10000000 },
        { month: "Tháng 5", thu: 25000000, chi: 15000000 },
    ];
    const tableData = [
        { key: 1, name: "Phòng A", thu: 7000000, chi: 3000000 },
        { key: 2, name: "Phòng B", thu: 9000000, chi: 4000000 },
        { key: 3, name: "Phòng C", thu: 6000000, chi: 2500000 },
    ];
    const columns = [
        { title: "Tên phòng", dataIndex: "name", key: "name" },
        { title: "Tiền thu", dataIndex: "thu", key: "thu", render: (value: number) => value.toLocaleString() + " ₫" },
        { title: "Tiền chi", dataIndex: "chi", key: "chi", render: (value: number) => value.toLocaleString() + " ₫" },
    ];

    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
    const [quick, setQuick] = useState<string>("");

    const handleQuickChange = (value: string) => {
        setQuick(value);
        const range = getRange(value);
        setDateRange(range);
    };

    const handleDateChange = (dates: [Dayjs, Dayjs]) => {
        setDateRange(dates);
    };

    const handleFilter = () => {
        // TODO: fetch/filter data theo dateRange, quick
    };

    return (
        <Card title="Báo cáo thu/chi" bordered={false}>
            <div>Hiển thị dữ liệu theo khoảng: {dateRange[0]?.format("YYYY-MM-DD")} - {dateRange[1]?.format("YYYY-MM-DD")}</div>
            <FilterBar
                quick={quick}
                dateRange={dateRange}
                onQuickChange={handleQuickChange}
                onDateChange={handleDateChange}
                onFilter={handleFilter}
                quickOptions={quickOptions}
            />

            <Row gutter={24}>
                <Col span={8}>
                    <Statistic title="Tổng thu" value={summary.totalThu} suffix="₫" />
                </Col>
                <Col span={8}>
                    <Statistic title="Tổng chi" value={summary.totalChi} suffix="₫" />
                </Col>
                <Col span={8}>
                    <Statistic title="Lợi nhuận ròng" value={summary.net} suffix="₫" />
                </Col>
            </Row>
            <br />
            <Row gutter={24}>
                <Col span={12}>
                    <Card title="Biểu đồ thu/chi theo tháng" size="small">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="thu" fill="#52c41a" name="Thu" />
                                <Bar dataKey="chi" fill="#f5222d" name="Chi" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Chi tiết thu/chi từng phòng" size="small">
                        <Table columns={columns} dataSource={tableData} pagination={false} />
                    </Card>
                </Col>
            </Row>
        </Card>
    );
};

export default ThuChiReport;
