import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Select, Space } from 'antd';
import { Column, Pie } from '@ant-design/plots';
import axios from 'axios';
import StatCard from '@/components/whmcs/StatCard';

interface PerformanceData {
    total_affiliates: number;
    active_affiliates: number;
    total_referrals: number;
    total_commissions: number;
    top_performers: {
        name: string;
        referrals: number;
        commissions: number;
        conversion_rate: number;
    }[];
    referrals_by_month: { month: string; count: number }[];
    commissions_by_tier: { tier: string; amount: number }[];
}

const AffiliatePerformance: React.FC = () => {
    const [data, setData] = useState<PerformanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('12months');

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/whmcs/affiliates/performance', {
                params: { period },
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

    const referralConfig = {
        data: data?.referrals_by_month || [],
        xField: 'month',
        yField: 'count',
        color: '#1890ff',
        label: {
            position: 'top' as const,
        },
    };

    const commissionConfig = {
        data: data?.commissions_by_tier || [],
        angleField: 'amount',
        colorField: 'tier',
        radius: 0.8,
        label: {
            type: 'outer',
            content: '{name} {percentage}',
        },
    };

    const topPerformerColumns = [
        {
            title: 'Affiliate',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Referrals',
            dataIndex: 'referrals',
            key: 'referrals',
        },
        {
            title: 'Hoa Hồng',
            dataIndex: 'commissions',
            key: 'commissions',
            render: (value: number) => `${value.toLocaleString()} VND`,
        },
        {
            title: 'Tỷ Lệ Chuyển Đổi',
            dataIndex: 'conversion_rate',
            key: 'conversion_rate',
            render: (rate: number) => `${rate.toFixed(2)}%`,
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card
                    title="Hiệu Suất Affiliate"
                    extra={
                        <Select value={period} onChange={setPeriod} style={{ width: 150 }}>
                            <Select.Option value="3months">3 Tháng</Select.Option>
                            <Select.Option value="6months">6 Tháng</Select.Option>
                            <Select.Option value="12months">12 Tháng</Select.Option>
                        </Select>
                    }
                >
                    <Row gutter={16}>
                        <Col span={6}>
                            <StatCard
                                title="Tổng Affiliates"
                                value={data?.total_affiliates || 0}
                                prefix=""
                                loading={loading}
                            />
                        </Col>
                        <Col span={6}>
                            <StatCard
                                title="Affiliates Hoạt Động"
                                value={data?.active_affiliates || 0}
                                prefix=""
                                loading={loading}
                            />
                        </Col>
                        <Col span={6}>
                            <StatCard
                                title="Tổng Referrals"
                                value={data?.total_referrals || 0}
                                prefix=""
                                loading={loading}
                            />
                        </Col>
                        <Col span={6}>
                            <StatCard
                                title="Tổng Hoa Hồng"
                                value={data?.total_commissions || 0}
                                loading={loading}
                            />
                        </Col>
                    </Row>
                </Card>

                <Row gutter={16}>
                    <Col span={16}>
                        <Card title="Referrals Theo Tháng" loading={loading}>
                            <Column {...referralConfig} />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Hoa Hồng Theo Tier" loading={loading}>
                            <Pie {...commissionConfig} />
                        </Card>
                    </Col>
                </Row>

                <Card title="Top Performers" loading={loading}>
                    <Table
                        columns={topPerformerColumns}
                        dataSource={data?.top_performers || []}
                        rowKey="name"
                        pagination={false}
                    />
                </Card>
            </Space>
        </div>
    );
};

export default AffiliatePerformance;
