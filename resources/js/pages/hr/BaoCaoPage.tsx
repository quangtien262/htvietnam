import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Form } from 'antd';
import { UserOutlined, TeamOutlined, DollarOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';

export default function BaoCaoPage() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>({});
    const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());

    useEffect(() => {
        loadData();
    }, [selectedMonth]);

    const loadData = () => {
        setLoading(true);
        const thang = selectedMonth.month() + 1;
        const nam = selectedMonth.year();

        axios.get('/aio/api/hr/bao-cao/dashboard', {
            params: { thang, nam }
        })
        .then((res: any) => {
            if (res.data.message === 'success') {
                setData(res.data.data || {});
            }
        })
        .finally(() => setLoading(false));
    };

    const handleMonthChange = (date: Dayjs | null) => {
        if (date) {
            setSelectedMonth(date);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <h2>Báo cáo nhân sự</h2>

            <Card style={{ marginBottom: 24 }}>
                <Form layout="inline">
                    <Form.Item label="Chọn tháng/năm">
                        <DatePicker
                            picker="month"
                            value={selectedMonth}
                            onChange={handleMonthChange}
                            format="MM/YYYY"
                            placeholder="Chọn tháng"
                            style={{ width: 200 }}
                        />
                    </Form.Item>
                </Form>
            </Card>

            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng nhân viên"
                            value={data.tong_nhan_vien || 0}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Nhân viên mới"
                            value={data.nhan_vien_moi || 0}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Nghỉ việc"
                            value={data.nhan_vien_nghi_viec || 0}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng lương"
                            value={data.tong_luong || 0}
                            prefix={<DollarOutlined />}
                            suffix="VNĐ"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={12}>
                    <Card title="Chấm công" loading={loading}>
                        <Statistic title="Số nhân viên" value={data.cham_cong?.so_nhan_vien || 0} />
                        <Statistic title="Đi làm" value={data.cham_cong?.di_lam || 0} />
                        <Statistic title="Nghỉ phép" value={data.cham_cong?.nghi_phep || 0} />
                        <Statistic title="Đi muộn" value={data.cham_cong?.di_muon || 0} />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Nghỉ phép" loading={loading}>
                        <Statistic title="Tổng đơn" value={data.nghi_phep?.tong_don || 0} />
                        <Statistic title="Chờ duyệt" value={data.nghi_phep?.cho_duyet || 0} valueStyle={{ color: '#faad14' }} />
                        <Statistic title="Đã duyệt" value={data.nghi_phep?.da_duyet || 0} valueStyle={{ color: '#52c41a' }} />
                        <Statistic title="Từ chối" value={data.nghi_phep?.tu_choi || 0} valueStyle={{ color: '#f5222d' }} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
