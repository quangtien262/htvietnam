import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, DatePicker, Space, Select } from 'antd';
import { Column } from '@ant-design/plots';
import dayjs from 'dayjs';
import axios from 'axios';
import StatCard from '@/components/whmcs/StatCard';
import ExportButton from '@/components/whmcs/ExportButton';

const { RangePicker } = DatePicker;

interface TaxReportData {
    total_tax: number;
    total_taxable_amount: number;
    tax_collected: number;
    tax_pending: number;
    tax_by_rule: {
        rule_name: string;
        taxable_amount: number;
        tax_amount: number;
        transaction_count: number;
    }[];
    tax_by_month: { month: string; amount: number }[];
}

const TaxReport: React.FC = () => {
    const [data, setData] = useState<TaxReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(12, 'months'),
        dayjs(),
    ]);
    const [groupBy, setGroupBy] = useState('rule');

    useEffect(() => {
        fetchData();
    }, [dateRange, groupBy]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/whmcs/taxes/report', {
                params: {
                    start_date: dateRange[0].format('YYYY-MM-DD'),
                    end_date: dateRange[1].format('YYYY-MM-DD'),
                    group_by: groupBy,
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

    const chartConfig = {
        data: data?.tax_by_month || [],
        xField: 'month',
        yField: 'amount',
        color: '#13c2c2',
        label: {
            position: 'top' as const,
            formatter: (datum: { amount: number }) => `${(datum.amount / 1000000).toFixed(1)}M`,
        },
    };

    const columns = [
        {
            title: 'Tax Rule',
            dataIndex: 'rule_name',
            key: 'rule_name',
        },
        {
            title: 'Số Giao Dịch',
            dataIndex: 'transaction_count',
            key: 'transaction_count',
        },
        {
            title: 'Giá Trị Chịu Thuế',
            dataIndex: 'taxable_amount',
            key: 'taxable_amount',
            render: (value: number) => `${value.toLocaleString()} VND`,
        },
        {
            title: 'Thuế',
            dataIndex: 'tax_amount',
            key: 'tax_amount',
            render: (value: number) => <strong>{value.toLocaleString()} VND</strong>,
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card
                    title="Báo Cáo Thuế"
                    extra={
                        <Space>
                            <RangePicker
                                value={dateRange}
                                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                            />
                            <Select value={groupBy} onChange={setGroupBy} style={{ width: 150 }}>
                                <Select.Option value="rule">Theo Tax Rule</Select.Option>
                                <Select.Option value="country">Theo Quốc Gia</Select.Option>
                                <Select.Option value="month">Theo Tháng</Select.Option>
                            </Select>
                            <ExportButton
                                endpoint="/aio/api/whmcs/taxes/report/export"
                                params={{
                                    start_date: dateRange[0].format('YYYY-MM-DD'),
                                    end_date: dateRange[1].format('YYYY-MM-DD'),
                                    group_by: groupBy,
                                }}
                            />
                        </Space>
                    }
                >
                    <Row gutter={16}>
                        <Col span={6}>
                            <StatCard
                                title="Tổng Thuế"
                                value={data?.total_tax || 0}
                                loading={loading}
                            />
                        </Col>
                        <Col span={6}>
                            <StatCard
                                title="Giá Trị Chịu Thuế"
                                value={data?.total_taxable_amount || 0}
                                loading={loading}
                            />
                        </Col>
                        <Col span={6}>
                            <StatCard
                                title="Đã Thu"
                                value={data?.tax_collected || 0}
                                loading={loading}
                            />
                        </Col>
                        <Col span={6}>
                            <StatCard
                                title="Chờ Thu"
                                value={data?.tax_pending || 0}
                                loading={loading}
                            />
                        </Col>
                    </Row>
                </Card>

                <Card title="Biểu Đồ Thuế Theo Tháng" loading={loading}>
                    <Column {...chartConfig} />
                </Card>

                <Card title="Chi Tiết Theo Tax Rule" loading={loading}>
                    <Table
                        columns={columns}
                        dataSource={data?.tax_by_rule || []}
                        rowKey="rule_name"
                        pagination={false}
                    />
                </Card>
            </Space>
        </div>
    );
};

export default TaxReport;
