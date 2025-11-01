import React from "react";
import { Select, DatePicker, Space, Button } from "antd";
import { Dayjs } from "dayjs";

export interface FilterBarProps {
    quick: string;
    dateRange: [Dayjs | null, Dayjs | null];
    onQuickChange: (value: string) => void;
    onDateChange: (dates: [Dayjs, Dayjs]) => void;
    onFilter: () => void;
    quickOptions: { label: string; value: string }[];
    extraFilters?: React.ReactNode; // truyền thêm các trường filter động
}

const FilterBar: React.FC<FilterBarProps> = ({
    quick,
    dateRange,
    onQuickChange,
    onDateChange,
    onFilter,
    quickOptions,
    extraFilters,
}) => (
    <Space direction="horizontal" style={{ marginBottom: 16 }}>
        <Select
            style={{ width: 160 }}
            placeholder="Chọn nhanh"
            options={quickOptions}
            value={quick || undefined}
            onChange={onQuickChange}
        />
        <DatePicker.RangePicker
            format="YYYY-MM-DD"
            value={dateRange[0] && dateRange[1] ? [dateRange[0], dateRange[1]] : undefined}
            onChange={(dates) => onDateChange(dates as [Dayjs, Dayjs])}
            style={{ width: 240 }}
        />
        {extraFilters}
        <Button type="primary" onClick={onFilter}>Lọc dữ liệu</Button>
    </Space>
);

export default FilterBar;
