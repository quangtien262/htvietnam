import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, DatePicker, Space } from 'antd';
import { Column, Pie } from '@ant-design/plots';
import dayjs from 'dayjs';
import axios from 'axios';
import StatCard from '@/components/whmcs/StatCard';
import ExportButton from '@/components/whmcs/ExportButton';

const { RangePicker } = DatePicker;

interface TaxData {
    total_tax_collected: number;
    total_taxable_revenue: number;
    average_tax_rate: number;
    pending_tax: number;
    tax_by_rule: { rule: string; amount: number }[];
    tax_by_month: { month: string; amount: number }[];
}

const TaxDashboard: React.FC = () => {
    const [data, setData] = useState<TaxData | null>(null);
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
            const response = await axios.get('/aio/api/whmcs/taxes/dashboard', {
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
        data: data?.tax_by_month || [],
        xField: 'month',
        yField: 'amount',
        color: '#13c2c2',
        label: {
            position: 'top' as const,
            formatter: (datum: { amount: number }) => `${(datum.amount / 1000000).toFixed(1)}M`,
        },
    };

    const pieConfig = {
        data: data?.tax_by_rule || [],
        angleField: 'amount',
        colorField: 'rule',
        radius: 0.8,
        label: {
            type: 'outer',
            content: '{name} {percentage}',
        },
    };

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card
                    title="Tổng Quan Tax"
                    extra={
                        <Space>
                            <RangePicker
                                value={dateRange}
                                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                            />
                            <ExportButton
                                endpoint="/aio/api/whmcs/taxes/export"
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
                                title="Tổng Tax Đã Thu"
                                value={data?.total_tax_collected || 0}
                                loading={loading}
                            />
                        </Col>
                        <Col span={6}>
                            <StatCard
                                title="Doanh Thu Chịu Thuế"
                                value={data?.total_taxable_revenue || 0}
                                loading={loading}
                            />
                        </Col>
                        <Col span={6}>
                            <StatCard
                                title="Thuế Suất TB"
                                value={data?.average_tax_rate || 0}
                                suffix="%"
                                loading={loading}
                            />
                        </Col>
                        <Col span={6}>
                            <StatCard
                                title="Tax Chờ Xử Lý"
                                value={data?.pending_tax || 0}
                                loading={loading}
                            />
                        </Col>
                    </Row>
                </Card>

                <Row gutter={16}>
                    <Col span={16}>
                        <Card title="Tax Theo Tháng" loading={loading}>
                            <Column {...columnConfig} />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Tax Theo Quy Định" loading={loading}>
                            <Pie {...pieConfig} />
                        </Card>
                    </Col>
                </Row>
            </Space>
        </div>
    );
};

export default TaxDashboard;
