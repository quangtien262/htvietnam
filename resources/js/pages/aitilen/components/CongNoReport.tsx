import React, { useState } from "react";
import { Card, Statistic, Row, Col, Table, Select } from "antd";
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

const chartData = [
    { month: "Tháng 1", debt: 5000000 },
    { month: "Tháng 2", debt: 7000000 },
    { month: "Tháng 3", debt: 6000000 },
    { month: "Tháng 4", debt: 8000000 },
    { month: "Tháng 5", debt: 9000000 },
];

const tableData = [
    { key: 1, name: "Phòng A", debt: 3000000 },
    { key: 2, name: "Phòng B", debt: 5000000 },
    { key: 3, name: "Phòng C", debt: 2000000 },
];

const columns = [
    { title: "Tên phòng", dataIndex: "name", key: "name" },
    { title: "Công nợ", dataIndex: "debt", key: "debt", render: (value: number) => value.toLocaleString() + " ₫" },
];

const CongNoReport: React.FC = () => {

    const [roomType, setRoomType] = useState<string>("");
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

    const handleRoomTypeChange = (value: string) => {
        setRoomType(value);
    };

    const handleFilter = () => {
        // TODO: fetch/filter data theo dateRange, quick, roomType
    };

    return (
        <Card title="Báo cáo công nợ" bordered={false}>
            <div>Hiển thị dữ liệu theo khoảng: {dateRange[0]?.format("YYYY-MM-DD")} - {dateRange[1]?.format("YYYY-MM-DD")}</div>
            <FilterBar
                quick={quick}
                dateRange={dateRange}
                onQuickChange={handleQuickChange}
                onDateChange={handleDateChange}
                onFilter={handleFilter}
                quickOptions={quickOptions}
                extraFilters={
                    <Select
                        style={{ width: 160 }}
                        placeholder="Loại phòng"
                        value={roomType || undefined}
                        onChange={handleRoomTypeChange}
                        options={[{ label: "Tất cả", value: "" }, { label: "VIP", value: "vip" }, { label: "Thường", value: "thuong" }]}
                    />
                }
            />
            <Row gutter={24}>
                <Col span={24}>
                    <Card title="Biểu đồ công nợ theo tháng" size="small">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="debt" fill="#faad14" name="Công nợ" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={24}>
                    <Card title="Chi tiết công nợ từng phòng" size="small">
                        <Table columns={columns} dataSource={tableData} pagination={false} />
                    </Card>
                </Col>
            </Row>
        </Card>
    );
};

export default CongNoReport;
