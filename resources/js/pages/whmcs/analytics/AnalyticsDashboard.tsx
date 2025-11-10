import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Select, Space } from 'antd';
import { Line } from '@ant-design/plots';
import dayjs from 'dayjs';
import axios from 'axios';
import StatCard from '@/components/whmcs/StatCard';

const { RangePicker } = DatePicker;

interface DashboardData {
    total_revenue: number;
    revenue_growth: number;
    total_clients: number;
    client_growth: number;
    total_services: number;
    service_growth: number;
    active_subscriptions: number;
    subscription_growth: number;
    revenue_chart: { date: string; value: number }[];
    client_chart: { date: string; value: number }[];
}

const AnalyticsDashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<any>([
        dayjs().subtract(30, 'days'),
        dayjs(),
    ]);
    const [period, setPeriod] = useState('daily');

    useEffect(() => {
        fetchData();
    }, [dateRange, period]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/whmcs/analytics/dashboard', {
                params: {
                    start_date: dateRange[0].format('YYYY-MM-DD'),
                    end_date: dateRange[1].format('YYYY-MM-DD'),
                    period,
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

    const revenueConfig = {
        data: data?.revenue_chart || [],
        xField: 'date',
        yField: 'value',
        smooth: true,
        color: '#1890ff',
        point: {
            size: 4,
            shape: 'circle',
        },
        tooltip: {
            formatter: (datum: any) => ({
                name: 'Doanh Thu',
                value: `${datum.value.toLocaleString()} VND`,
            }),
        },
    };

    const clientConfig = {
        data: data?.client_chart || [],
        xField: 'date',
        yField: 'value',
        smooth: true,
        color: '#52c41a',
        point: {
            size: 4,
            shape: 'circle',
        },
    };

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card>
                    <Space>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates)}
                        />
                        <Select
                            value={period}
                            onChange={setPeriod}
                            style={{ width: 120 }}
                        >
                            <Select.Option value="daily">Ngày</Select.Option>
                            <Select.Option value="weekly">Tuần</Select.Option>
                            <Select.Option value="monthly">Tháng</Select.Option>
                        </Select>
                    </Space>
                </Card>

                <Row gutter={16}>
                    <Col span={6}>
                        <StatCard
                            title="Tổng Doanh Thu"
                            value={data?.total_revenue || 0}
                            trend={data?.revenue_growth}
                            loading={loading}
                        />
                    </Col>
                    <Col span={6}>
                        <StatCard
                            title="Tổng Khách Hàng"
                            value={data?.total_clients || 0}
                            prefix=""
                            trend={data?.client_growth}
                            loading={loading}
                        />
                    </Col>
                    <Col span={6}>
                        <StatCard
                            title="Tổng Dịch Vụ"
                            value={data?.total_services || 0}
                            prefix=""
                            trend={data?.service_growth}
                            loading={loading}
                        />
                    </Col>
                    <Col span={6}>
                        <StatCard
                            title="Active Subscriptions"
                            value={data?.active_subscriptions || 0}
                            prefix=""
                            trend={data?.subscription_growth}
                            loading={loading}
                        />
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Card title="Biểu Đồ Doanh Thu" loading={loading}>
                            <Line {...revenueConfig} />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="Biểu Đồ Khách Hàng" loading={loading}>
                            <Line {...clientConfig} />
                        </Card>
                    </Col>
                </Row>
            </Space>
        </div>
    );
};

export default AnalyticsDashboard;
