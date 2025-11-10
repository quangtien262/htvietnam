import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, DatePicker, Select, Space } from 'antd';
import { Column, Pie } from '@ant-design/plots';
import dayjs from 'dayjs';
import axios from 'axios';
import StatCard from '@/components/whmcs/StatCard';
import ExportButton from '@/components/whmcs/ExportButton';

const { RangePicker } = DatePicker;

interface RevenueData {
    total_revenue: number;
    total_paid: number;
    total_unpaid: number;
    average_order_value: number;
    revenue_by_product: { name: string; value: number }[];
    revenue_by_month: { month: string; value: number }[];
    top_clients: { name: string; total: number }[];
}

const RevenueReport: React.FC = () => {
    const [data, setData] = useState<RevenueData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(12, 'months'),
        dayjs(),
    ]);

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/whmcs/analytics/revenue', {
                params: {
                    start_date: dateRange[0].format('YYYY-MM-DD'),
                    end_date: dateRange[1].format('YYYY-MM-DD'),
                },
            });
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch {
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const columnConfig = {
        data: data?.revenue_by_month || [],
        xField: 'month',
        yField: 'value',
        label: {
            position: 'top' as const,
            formatter: (datum: { value: number }) => `${(datum.value / 1000000).toFixed(1)}M`,
        },
        color: '#1890ff',
    };

    const pieConfig = {
        data: data?.revenue_by_product || [],
        angleField: 'value',
        colorField: 'name',
        radius: 0.8,
        label: {
            type: 'outer',
            content: '{name} {percentage}',
        },
        interactions: [{ type: 'element-active' }],
    };

    const topClientsColumns = [
        {
            title: 'Khách Hàng',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Tổng Doanh Thu',
            dataIndex: 'total',
            key: 'total',
            render: (value: number) => `${value.toLocaleString()} VND`,
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card
                    title="Báo Cáo Doanh Thu"
                    extra={
                        <Space>
                            <RangePicker
                                value={dateRange}
                                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                            />
                            <ExportButton
                                endpoint="/aio/api/whmcs/analytics/revenue/export"
                                params={{
                                    start_date: dateRange[0].format('YYYY-MM-DD'),
                                    end_date: dateRange[1].format('YYYY-MM-DD'),
                                }}
                            />
                        </Space>
                    }
                >
                    <Row gutter={16}>
                        <Col span={6}>
                            <StatCard
                                title="Tổng Doanh Thu"
                                value={data?.total_revenue || 0}
                                loading={loading}
                            />
                        </Col>
                        <Col span={6}>
                            <StatCard
                                title="Đã Thanh Toán"
                                value={data?.total_paid || 0}
                                loading={loading}
                            />
                        </Col>
                        <Col span={6}>
                            <StatCard
                                title="Chưa Thanh Toán"
                                value={data?.total_unpaid || 0}
                                loading={loading}
                            />
                        </Col>
                        <Col span={6}>
                            <StatCard
                                title="Giá Trị TB/Đơn"
                                value={data?.average_order_value || 0}
                                loading={loading}
                            />
                        </Col>
                    </Row>
                </Card>

                <Row gutter={16}>
                    <Col span={16}>
                        <Card title="Doanh Thu Theo Tháng" loading={loading}>
                            <Column {...columnConfig} />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Doanh Thu Theo Sản Phẩm" loading={loading}>
                            <Pie {...pieConfig} />
                        </Card>
                    </Col>
                </Row>

                <Card title="Top Khách Hàng" loading={loading}>
                    <Table
                        columns={topClientsColumns}
                        dataSource={data?.top_clients || []}
                        rowKey="name"
                        pagination={false}
                    />
                </Card>
            </Space>
        </div>
    );
};

export default RevenueReport;
