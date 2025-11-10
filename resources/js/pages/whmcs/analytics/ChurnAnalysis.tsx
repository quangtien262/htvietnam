import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Select, Space } from 'antd';
import { Line } from '@ant-design/plots';
import axios from 'axios';
import StatCard from '@/components/whmcs/StatCard';

interface ChurnData {
    churn_rate: number;
    churned_clients: number;
    retained_clients: number;
    average_lifetime: number;
    churn_by_month: { month: string; rate: number }[];
    churn_reasons: { reason: string; count: number; percentage: number }[];
    at_risk_clients: { name: string; risk_score: number; last_activity: string }[];
}

const ChurnAnalysis: React.FC = () => {
    const [data, setData] = useState<ChurnData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('12months');

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/whmcs/analytics/churn', {
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

    const chartConfig = {
        data: data?.churn_by_month || [],
        xField: 'month',
        yField: 'rate',
        smooth: true,
        color: '#ff4d4f',
        point: {
            size: 4,
            shape: 'circle',
        },
    };

    const reasonColumns = [
        {
            title: 'Lý Do Churn',
            dataIndex: 'reason',
            key: 'reason',
        },
        {
            title: 'Số Lượng',
            dataIndex: 'count',
            key: 'count',
        },
        {
            title: 'Tỷ Lệ',
            dataIndex: 'percentage',
            key: 'percentage',
            render: (value: number) => `${value.toFixed(2)}%`,
        },
    ];

    const riskColumns = [
        {
            title: 'Khách Hàng',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Risk Score',
            dataIndex: 'risk_score',
            key: 'risk_score',
            render: (score: number) => (
                <span style={{ 
                    color: score > 70 ? '#ff4d4f' : score > 40 ? '#faad14' : '#52c41a' 
                }}>
                    {score}%
                </span>
            ),
        },
        {
            title: 'Hoạt Động Cuối',
            dataIndex: 'last_activity',
            key: 'last_activity',
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card
                    title="Phân Tích Churn Rate"
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
                                title="Churn Rate"
                                value={data?.churn_rate || 0}
                                suffix="%"
                                loading={loading}
                            />
                        </Col>
                        <Col span={6}>
                            <StatCard
                                title="Khách Hàng Rời Đi"
                                value={data?.churned_clients || 0}
                                prefix=""
                                loading={loading}
                            />
                        </Col>
                        <Col span={6}>
                            <StatCard
                                title="Khách Hàng Giữ Chân"
                                value={data?.retained_clients || 0}
                                prefix=""
                                loading={loading}
                            />
                        </Col>
                        <Col span={6}>
                            <StatCard
                                title="Lifetime TB (tháng)"
                                value={data?.average_lifetime || 0}
                                prefix=""
                                loading={loading}
                            />
                        </Col>
                    </Row>
                </Card>

                <Card title="Xu Hướng Churn Rate" loading={loading}>
                    <Line {...chartConfig} />
                </Card>

                <Row gutter={16}>
                    <Col span={12}>
                        <Card title="Lý Do Churn" loading={loading}>
                            <Table
                                columns={reasonColumns}
                                dataSource={data?.churn_reasons || []}
                                rowKey="reason"
                                pagination={false}
                            />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="Khách Hàng Có Nguy Cơ Cao" loading={loading}>
                            <Table
                                columns={riskColumns}
                                dataSource={data?.at_risk_clients || []}
                                rowKey="name"
                                pagination={false}
                            />
                        </Card>
                    </Col>
                </Row>
            </Space>
        </div>
    );
};

export default ChurnAnalysis;
