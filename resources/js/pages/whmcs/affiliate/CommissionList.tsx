import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, DatePicker, Space, Select } from 'antd';
import dayjs from 'dayjs';
import axios from 'axios';
import ExportButton from '@/components/whmcs/ExportButton';

const { RangePicker } = DatePicker;

interface Commission {
    id: number;
    affiliate_name: string;
    referral_name: string;
    order_amount: number;
    commission_amount: number;
    commission_rate: number;
    status: 'pending' | 'approved' | 'paid';
    created_at: string;
}

const CommissionList: React.FC = () => {
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(30, 'days'),
        dayjs(),
    ]);
    const [status, setStatus] = useState('');

    useEffect(() => {
        fetchCommissions();
    }, [pagination.current, dateRange, status]);

    const fetchCommissions = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/whmcs/affiliates/commissions', {
                params: {
                    page: pagination.current,
                    per_page: pagination.pageSize,
                    start_date: dateRange[0].format('YYYY-MM-DD'),
                    end_date: dateRange[1].format('YYYY-MM-DD'),
                    status,
                },
            });
            if (response.data.success) {
                setCommissions(response.data.data);
                setPagination(prev => ({ ...prev, total: response.data.meta?.total || 0 }));
            }
        } catch {
            setCommissions([]);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Affiliate',
            dataIndex: 'affiliate_name',
            key: 'affiliate_name',
        },
        {
            title: 'Khách Hàng',
            dataIndex: 'referral_name',
            key: 'referral_name',
        },
        {
            title: 'Giá Trị Đơn',
            dataIndex: 'order_amount',
            key: 'order_amount',
            render: (value: number) => `${value.toLocaleString()} VND`,
        },
        {
            title: 'Hoa Hồng',
            dataIndex: 'commission_amount',
            key: 'commission_amount',
            render: (value: number) => <strong>{value.toLocaleString()} VND</strong>,
        },
        {
            title: 'Tỷ Lệ',
            dataIndex: 'commission_rate',
            key: 'commission_rate',
            render: (rate: number) => `${rate}%`,
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors = { pending: 'orange', approved: 'blue', paid: 'green' };
                return <Tag color={colors[status as keyof typeof colors]}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Ngày',
            dataIndex: 'created_at',
            key: 'created_at',
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card
                title="Danh Sách Hoa Hồng"
                extra={
                    <Space>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                        />
                        <Select
                            value={status}
                            onChange={setStatus}
                            style={{ width: 150 }}
                            placeholder="Trạng thái"
                        >
                            <Select.Option value="">Tất cả</Select.Option>
                            <Select.Option value="pending">Pending</Select.Option>
                            <Select.Option value="approved">Approved</Select.Option>
                            <Select.Option value="paid">Paid</Select.Option>
                        </Select>
                        <ExportButton
                            endpoint="/aio/api/whmcs/affiliates/commissions/export"
                            params={{
                                start_date: dateRange[0].format('YYYY-MM-DD'),
                                end_date: dateRange[1].format('YYYY-MM-DD'),
                                status,
                            }}
                        />
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={commissions}
                    rowKey="id"
                    loading={loading}
                    pagination={pagination}
                    onChange={(newPagination) => setPagination(newPagination as typeof pagination)}
                />
            </Card>
        </div>
    );
};

export default CommissionList;
