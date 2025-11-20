import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Rate, message } from 'antd';
import axios from 'axios';
import { API_SPA } from '@/common/api_spa';
import { StarOutlined, SmileOutlined } from '@ant-design/icons';

const FeedbackReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_SPA.spaAnalyticsFeedback);
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const serviceRatings = data?.serviceRatings || [
        { service: 'Massage toàn thân', rating: 4.8, reviews: 145 },
        { service: 'Chăm sóc da mặt', rating: 4.9, reviews: 98 },
        { service: 'Nail gel', rating: 4.6, reviews: 156 },
    ];

    return (
        <div>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                    <Card>
                        <Statistic
                            title="Điểm đánh giá TB"
                            value={4.75}
                            precision={2}
                            prefix={<StarOutlined />}
                            suffix="/ 5"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card>
                        <Statistic
                            title="Tỷ lệ hài lòng"
                            value={92}
                            prefix={<SmileOutlined />}
                            suffix="%"
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                    <Card title="Đánh giá theo Dịch vụ">
                        <Table
                            dataSource={serviceRatings}
                            columns={[
                                { title: 'Dịch vụ', dataIndex: 'service', key: 'service' },
                                { title: 'Điểm', dataIndex: 'rating', key: 'rating', render: (v: number) => <Rate disabled value={v} allowHalf /> },
                                { title: 'Số đánh giá', dataIndex: 'reviews', key: 'reviews' },
                            ]}
                            pagination={false}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default FeedbackReport;
