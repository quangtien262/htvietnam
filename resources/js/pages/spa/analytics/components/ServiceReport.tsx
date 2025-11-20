import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Progress, Tag, message } from 'antd';
import axios from 'axios';
import { API_SPA } from '@/common/api_spa';
import { Column, Pie } from '@ant-design/charts';

const ServiceReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_SPA.spaAnalyticsServices);
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const services = data?.services || [
        { name: 'Massage toàn thân', uses: 145, revenue: 72500000, avgTime: 90, growth: 12 },
        { name: 'Chăm sóc da mặt', uses: 98, revenue: 49000000, avgTime: 60, growth: 8 },
        { name: 'Nail gel', uses: 156, revenue: 31200000, avgTime: 45, growth: -3 },
    ];

    const categories = [
        { category: 'Massage', count: 8, revenue: 180000000 },
        { category: 'Chăm sóc da', count: 5, revenue: 95000000 },
        { category: 'Nail', count: 3, revenue: 48000000 },
    ];

    return (
        <div>
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card title="Hiệu suất Dịch vụ">
                        <Table
                            dataSource={services}
                            columns={[
                                { title: 'Dịch vụ', dataIndex: 'name', key: 'name' },
                                { title: 'Số lần sử dụng', dataIndex: 'uses', key: 'uses', align: 'center' },
                                { title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue', render: (v: number) => `${(v/1000000).toFixed(1)}M` },
                                { title: 'TG TB (phút)', dataIndex: 'avgTime', key: 'avgTime', align: 'center' },
                                {
                                    title: 'Tăng trưởng',
                                    dataIndex: 'growth',
                                    key: 'growth',
                                    render: (v: number) => (
                                        <Tag color={v > 0 ? 'green' : 'red'}>{v > 0 ? '+' : ''}{v}%</Tag>
                                    )
                                },
                            ]}
                            pagination={false}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Phân bố theo Danh mục">
                        <Pie
                            data={categories}
                            angleField="revenue"
                            colorField="category"
                            radius={0.8}
                            label={{ type: 'outer' }}
                            height={300}
                        />
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                    <Card title="So sánh Doanh thu theo Dịch vụ">
                        <Column
                            data={services}
                            xField="name"
                            yField="revenue"
                            height={300}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ServiceReport;
