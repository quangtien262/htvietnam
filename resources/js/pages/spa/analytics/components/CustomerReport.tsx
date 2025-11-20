import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, message } from 'antd';
import axios from 'axios';
import { API_SPA } from '@/common/api_spa';
import { UserOutlined, RiseOutlined } from '@ant-design/icons';
import { Line, Column } from '@ant-design/charts';

const CustomerReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_SPA.spaAnalyticsCustomers);
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const topCustomers = data?.topCustomers || [
        { name: 'Nguyễn Thị A', visits: 25, spent: 15000000, lastVisit: '2025-11-18' },
        { name: 'Trần Văn B', visits: 18, spent: 12500000, lastVisit: '2025-11-19' },
        { name: 'Lê Thị C', visits: 22, spent: 11000000, lastVisit: '2025-11-20' },
    ];

    const customerTrend = [
        { month: 'T1', new: 45, returning: 120 },
        { month: 'T2', new: 52, returning: 135 },
        { month: 'T3', new: 48, returning: 142 },
        { month: 'T4', new: 61, returning: 158 },
        { month: 'T5', new: 55, returning: 165 },
        { month: 'T6', new: 68, returning: 178 },
    ];

    return (
        <div>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng khách hàng"
                            value={1245}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Khách mới tháng này"
                            value={68}
                            prefix={<RiseOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Giá trị TB/Khách"
                            value={2850000}
                            suffix="đ"
                        />
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                    <Card title="Top Khách hàng Thân thiết">
                        <Table
                            dataSource={topCustomers}
                            columns={[
                                { title: 'Khách hàng', dataIndex: 'name', key: 'name' },
                                { title: 'Số lần', dataIndex: 'visits', key: 'visits', align: 'center' },
                                { title: 'Chi tiêu', dataIndex: 'spent', key: 'spent', render: (v: number) => `${(v/1000000).toFixed(1)}M` },
                                { title: 'Lần cuối', dataIndex: 'lastVisit', key: 'lastVisit' },
                            ]}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Xu hướng Khách hàng Mới vs Cũ">
                        <Column
                            data={[...customerTrend.map(d => ({ ...d, type: 'Mới', value: d.new })), ...customerTrend.map(d => ({ ...d, type: 'Quay lại', value: d.returning }))]}
                            xField="month"
                            yField="value"
                            seriesField="type"
                            isGroup
                            height={280}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default CustomerReport;
