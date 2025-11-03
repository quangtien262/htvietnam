import React, { useState } from "react";
import { Card, Table, Row, Col, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import FilterBar from "./FilterBar";

const quickOptions = [
    { label: "Tuần này", value: "this_week" },
    { label: "Tháng này", value: "this_month" },
    { label: "Năm nay", value: "this_year" },
];

function getRange(option: string): [Dayjs, Dayjs] {
    const now = dayjs();
    switch (option) {
        case "this_week":
            return [now.startOf("week"), now.endOf("week")];
        case "this_month":
            return [now.startOf("month"), now.endOf("month")];
        case "this_year":
            return [now.startOf("year"), now.endOf("year")];
        default:
            return [now.startOf("month"), now.endOf("month")];
    }
}

const tableData = [
    { key: 1, name: "Máy lạnh", type: "Thiết bị", value: 12000000 },
    { key: 2, name: "Tivi", type: "Thiết bị", value: 8000000 },
    { key: 3, name: "Giường", type: "Nội thất", value: 5000000 },
];

const columns = [
    { title: "Tên tài sản", dataIndex: "name", key: "name" },
    { title: "Loại", dataIndex: "type", key: "type" },
    { title: "Giá trị", dataIndex: "value", key: "value", render: (v: number) => v.toLocaleString() + " ₫" },
];

const AssetReport: React.FC = () => {
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
    const [quick, setQuick] = useState<string>("");
    const [assetType, setAssetType] = useState<string>("");

    const handleQuickChange = (value: string) => {
        setQuick(value);
        const range = getRange(value);
        setDateRange(range);
    };
    const handleDateChange = (dates: [Dayjs, Dayjs]) => {
        setDateRange(dates);
    };
    const handleAssetTypeChange = (value: string) => {
        setAssetType(value);
    };
    const handleFilter = () => {
        // TODO: fetch/filter data theo dateRange, quick, assetType
    };

    return (
        <Card title="Báo cáo tài sản" bordered={false}>
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
                        placeholder="Loại tài sản"
                        value={assetType || undefined}
                        onChange={handleAssetTypeChange}
                        options={[{ label: "Tất cả", value: "" }, { label: "Thiết bị", value: "Thiết bị" }, { label: "Nội thất", value: "Nội thất" }]}
                    />
                }
            />
            <Row gutter={24}>
                <Col span={24}>
                    <Table columns={columns} dataSource={tableData} pagination={false} />
                </Col>
            </Row>
        </Card>
    );
};

export default AssetReport;
