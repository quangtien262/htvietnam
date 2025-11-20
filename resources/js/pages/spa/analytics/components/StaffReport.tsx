import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Rate, Tag, message } from 'antd';
import axios from 'axios';
import { API_SPA } from '@/common/api_spa';
import { Column } from '@ant-design/charts';

const StaffReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_SPA.spaAnalyticsStaff);
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const staffPerformance = data?.staffPerformance || [
        { name: 'Nguyễn Văn A', services: 145, revenue: 58000000, rating: 4.8, skills: ['Massage', 'Chăm sóc da'] },
        { name: 'Trần Thị B', services: 132, revenue: 52000000, rating: 4.9, skills: ['Nail', 'Massage chân'] },
        { name: 'Lê Văn C', services: 118, revenue: 45000000, rating: 4.7, skills: ['Chăm sóc da', 'Gội đầu'] },
    ];

    return (
        <div>
            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <Card title="Hiệu suất Nhân viên">
                        <Table
                            dataSource={staffPerformance}
                            columns={[
                                { title: 'Nhân viên', dataIndex: 'name', key: 'name' },
                                { title: 'Dịch vụ', dataIndex: 'services', key: 'services', align: 'center' },
                                { title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue', render: (v: number) => `${(v/1000000).toFixed(1)}M` },
                                { title: 'Đánh giá', dataIndex: 'rating', key: 'rating', render: (v: number) => <Rate disabled value={v} /> },
                                {
                                    title: 'Kỹ năng',
                                    dataIndex: 'skills',
                                    key: 'skills',
                                    render: (skills: string[]) => skills.map(s => <Tag key={s}>{s}</Tag>)
                                },
                            ]}
                            pagination={false}
                        />
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                    <Card title="So sánh Doanh thu theo Nhân viên">
                        <Column
                            data={staffPerformance}
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

export default StaffReport;
