import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Select, Space, Tag } from 'antd';
import { Column, Pie } from '@ant-design/plots';
import axios from 'axios';
import StatCard from '@/components/whmcs/StatCard';

interface ClientData {
    total_clients: number;
    active_clients: number;
    inactive_clients: number;
    average_ltv: number;
    client_by_country: { country: string; count: number }[];
    client_acquisition: { month: string; count: number }[];
    client_segments: { segment: string; count: number; percentage: number }[];
}

const ClientAnalytics: React.FC = () => {
    const [data, setData] = useState<ClientData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('12months');

    useEffect(() => {
        fetchData();
    }, [timeRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/whmcs/analytics/clients', {
                params: { range: timeRange },
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

    const acquisitionConfig = {
        data: data?.client_acquisition || [],
        xField: 'month',
        yField: 'count',
        color: '#52c41a',
        label: {
            position: 'top' as const,
        },
    };

    const segmentColumns = [
        {
            title: 'Phân Khúc',
            dataIndex: 'segment',
            key: 'segment',
            render: (text: string) => <Tag color="blue">{text}</Tag>,
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

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card
                    title="Phân Tích Khách Hàng"
                    extra={
                        <Select value={timeRange} onChange={setTimeRange} style={{ width: 150 }}>
                            <Select.Option value="3months">3 Tháng</Select.Option>
                            <Select.Option value="6months">6 Tháng</Select.Option>
                            <Select.Option value="12months">12 Tháng</Select.Option>
                            <Select.Option value="all">Tất Cả</Select.Option>
                        </Select>
                    }
                >
                    <Row gutter={16}>
                        <Col span={6}>
                            <StatCard
                                title="Tổng Khách Hàng"
                                value={data?.total_clients || 0}
                                prefix=""
                                loading={loading}
                            />
                        </Col>
                        <Col span={6}>
                            <StatCard
                                title="Khách Hàng Hoạt Động"
                                value={data?.active_clients || 0}
                                prefix=""
                                loading={loading}
                            />
                        </Col>
                        <Col span={6}>
                            <StatCard
                                title="Khách Hàng Không Hoạt Động"
                                value={data?.inactive_clients || 0}
                                prefix=""
                                loading={loading}
                            />
                        </Col>
                        <Col span={6}>
                            <StatCard
                                title="LTV Trung Bình"
                                value={data?.average_ltv || 0}
                                loading={loading}
                            />
                        </Col>
                    </Row>
                </Card>

                <Row gutter={16}>
                    <Col span={16}>
                        <Card title="Xu Hướng Tăng Trưởng Khách Hàng" loading={loading}>
                            <Column {...acquisitionConfig} />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Phân Khúc Khách Hàng" loading={loading}>
                            <Table
                                columns={segmentColumns}
                                dataSource={data?.client_segments || []}
                                rowKey="segment"
                                pagination={false}
                                size="small"
                            />
                        </Card>
                    </Col>
                </Row>
            </Space>
        </div>
    );
};

export default ClientAnalytics;
