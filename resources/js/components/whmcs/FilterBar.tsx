import React from 'react';
import { Space, DatePicker, Select, Button } from 'antd';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import type { RangePickerProps } from 'antd/es/date-picker';

const { RangePicker } = DatePicker;

interface FilterBarProps {
    onDateChange?: (dates: RangePickerProps['value'], dateStrings: [string, string]) => void;
    onStatusChange?: (value: string) => void;
    onReset?: () => void;
    showDateFilter?: boolean;
    showStatusFilter?: boolean;
    statusOptions?: Array<{ label: string; value: string }>;
    extraFilters?: React.ReactNode;
}

const FilterBar: React.FC<FilterBarProps> = ({
    onDateChange,
    onStatusChange,
    onReset,
    showDateFilter = true,
    showStatusFilter = false,
    statusOptions = [],
    extraFilters,
}) => {
    return (
        <Space wrap style={{ marginBottom: 16 }}>
            <FilterOutlined style={{ fontSize: 16, color: '#999' }} />
            
            {showDateFilter && (
                <RangePicker
                    onChange={onDateChange as any}
                    format="DD/MM/YYYY"
                    placeholder={['Từ ngày', 'Đến ngày']}
                />
            )}

            {showStatusFilter && statusOptions.length > 0 && (
                <Select
                    placeholder="Trạng thái"
                    style={{ width: 150 }}
                    onChange={onStatusChange}
                    allowClear
                    options={statusOptions}
                />
            )}

            {extraFilters}

            {onReset && (
                <Button
                    icon={<ReloadOutlined />}
                    onClick={onReset}
                >
                    Đặt lại
                </Button>
            )}
        </Space>
    );
};

export default FilterBar;
