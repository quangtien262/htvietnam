import React from "react";
import { Card, Statistic, Row, Col, Table } from "antd";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const profitData = [
    { month: "Tháng 1", profit: 8000000 },
    { month: "Tháng 2", profit: 9500000 },
    { month: "Tháng 3", profit: 12000000 },
    { month: "Tháng 4", profit: 10000000 },
    { month: "Tháng 5", profit: 15000000 },
];

const tableData = [
    { key: 1, name: "Phòng A", profit: 5000000 },
    { key: 2, name: "Phòng B", profit: 7000000 },
    { key: 3, name: "Phòng C", profit: 3000000 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFE"];

const columns = [
    { title: "Tên phòng", dataIndex: "name", key: "name" },
    { title: "Lợi nhuận", dataIndex: "profit", key: "profit", render: (value: number) => value.toLocaleString() + " ₫" },
];

const TienPhongReport: React.FC = () => {
    const data = {
        totalProfit: 120000000,
        monthProfit: 10000000,
        growth: 12.5,
    };
    return (
        <Card title="Báo cáo lợi nhuận thực tế" bordered={false}>
            <Row gutter={24}>
                <Col span={8}>
                    <Statistic title="Tổng lợi nhuận" value={data.totalProfit} suffix="₫" />
                </Col>
                <Col span={8}>
                    <Statistic title="Lợi nhuận tháng này" value={data.monthProfit} suffix="₫" />
                </Col>
                <Col span={8}>
                    <Statistic title="Tăng trưởng" value={data.growth} suffix="%" precision={2} />
                </Col>
            </Row>
            <br />
            <Row gutter={24}>
                <Col span={24}>
                    <Card title="Biểu đồ lợi nhuận" size="small">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={profitData}
                                    dataKey="profit"
                                    nameKey="month"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label
                                >
                                    {profitData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={24}>
                    <Card title="Chi tiết lợi nhuận từng nhà" size="small">
                        <Table columns={columns} dataSource={tableData} pagination={false} />
                    </Card>
                </Col>
            </Row>
        </Card>
    );
};

export default TienPhongReport;
