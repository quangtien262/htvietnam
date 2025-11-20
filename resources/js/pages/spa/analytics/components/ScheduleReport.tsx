import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Progress, Table, message } from 'antd';
import axios from 'axios';
import { API_SPA } from '@/common/api_spa';
import { Column, Heatmap } from '@ant-design/charts';

const ScheduleReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_SPA.spaAnalyticsSchedule);
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const roomUsage = data?.roomUsage || [
        { room: 'Phòng 1', usage: 85, hours: 204 },
        { room: 'Phòng 2', usage: 78, hours: 187 },
        { room: 'Phòng 3', usage: 92, hours: 221 },
        { room: 'Phòng 4', usage: 67, hours: 161 },
    ];

    return (
        <div>
            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <Card title="Tỷ lệ Sử dụng Phòng">
                        <Table
                            dataSource={roomUsage}
                            columns={[
                                { title: 'Phòng', dataIndex: 'room', key: 'room' },
                                { title: 'Giờ hoạt động', dataIndex: 'hours', key: 'hours', align: 'center' },
                                {
                                    title: 'Tỷ lệ sử dụng',
                                    dataIndex: 'usage',
                                    key: 'usage',
                                    render: (v: number) => <Progress percent={v} />
                                },
                            ]}
                            pagination={false}
                        />
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
                    <Card title="So sánh Sử dụng Phòng">
                        <Column
                            data={roomUsage}
                            xField="room"
                            yField="usage"
                            height={300}
                            label={{ position: 'top' }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ScheduleReport;
