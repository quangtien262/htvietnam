import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, message } from 'antd';
import axios from 'axios';
import { API_SPA } from '@/common/api_spa';
import { RiseOutlined, FallOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/charts';

const GrowthReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_SPA.spaAnalyticsGrowth);
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const comparison = data?.comparison || [
        { metric: 'Doanh thu', thisMonth: 320000000, lastMonth: 280000000, growth: 14.3 },
        { metric: 'Khách hàng', thisMonth: 856, lastMonth: 782, growth: 9.5 },
        { metric: 'Lịch hẹn', thisMonth: 1245, lastMonth: 1156, growth: 7.7 },
    ];

    const trend = [
        { month: 'T1', value: 280 },
        { month: 'T2', value: 295 },
        { month: 'T3', value: 310 },
        { month: 'T4', value: 285 },
        { month: 'T5', value: 305 },
        { month: 'T6', value: 320 },
    ];

    return (
        <div>
            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <Card title="So sánh Tháng này vs Tháng trước">
                        <Table
                            dataSource={comparison}
                            columns={[
                                { title: 'Chỉ số', dataIndex: 'metric', key: 'metric' },
                                { title: 'Tháng này', dataIndex: 'thisMonth', key: 'thisMonth', render: (v: number) => v.toLocaleString() },
                                { title: 'Tháng trước', dataIndex: 'lastMonth', key: 'lastMonth', render: (v: number) => v.toLocaleString() },
                                {
                                    title: 'Tăng trưởng',
                                    dataIndex: 'growth',
                                    key: 'growth',
                                    render: (v: number) => (
                                        <Tag color={v > 0 ? 'green' : 'red'}>
                                            {v > 0 ? <RiseOutlined /> : <FallOutlined />}
                                            {Math.abs(v)}%
                                        </Tag>
                                    )
                                },
                            ]}
                            pagination={false}
                        />
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                    <Card title="Xu hướng Doanh thu 6 tháng">
                        <Line
                            data={trend}
                            xField="month"
                            yField="value"
                            height={300}
                            point={{ size: 5, shape: 'diamond' }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default GrowthReport;
