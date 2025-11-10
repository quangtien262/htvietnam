import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Descriptions, Tag, Table, Space, Button, message } from 'antd';
import { ArrowLeftOutlined, CopyOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Line } from '@ant-design/plots';
import axios from 'axios';
import StatCard from '@/components/whmcs/StatCard';

interface AffiliateDetail {
    id: number;
    user_name: string;
    code: string;
    referral_link: string;
    commission_rate: number;
    status: string;
    total_referrals: number;
    total_commissions: number;
    total_paid: number;
    pending_commissions: number;
    recent_referrals: { name: string; date: string; status: string }[];
    commission_chart: { month: string; amount: number }[];
    created_at: string;
}

const AffiliateDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [affiliate, setAffiliate] = useState<AffiliateDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAffiliate();
    }, [id]);

    const fetchAffiliate = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/aio/api/whmcs/affiliates/${id}`);
            if (response.data.success) {
                setAffiliate(response.data.data);
            }
        } catch {
            message.error('Không thể tải thông tin affiliate!');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        if (affiliate?.referral_link) {
            navigator.clipboard.writeText(affiliate.referral_link);
            message.success('Đã copy link referral!');
        }
    };

    if (loading || !affiliate) {
        return <div style={{ padding: 24 }}>Loading...</div>;
    }

    const chartConfig = {
        data: affiliate.commission_chart || [],
        xField: 'month',
        yField: 'amount',
        smooth: true,
        color: '#52c41a',
    };

    const referralColumns = [
        { title: 'Khách Hàng', dataIndex: 'name', key: 'name' },
        { title: 'Ngày', dataIndex: 'date', key: 'date' },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <Tag color="green">{status}</Tag>,
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                        Quay Lại
                    </Button>
                </div>

                <Row gutter={16}>
                    <Col span={6}>
                        <StatCard title="Tổng Referrals" value={affiliate.total_referrals} prefix="" />
                    </Col>
                    <Col span={6}>
                        <StatCard title="Tổng Hoa Hồng" value={affiliate.total_commissions} />
                    </Col>
                    <Col span={6}>
                        <StatCard title="Đã Thanh Toán" value={affiliate.total_paid} />
                    </Col>
                    <Col span={6}>
                        <StatCard title="Chờ Thanh Toán" value={affiliate.pending_commissions} />
                    </Col>
                </Row>

                <Card title="Thông Tin Affiliate">
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="Tên">{affiliate.user_name}</Descriptions.Item>
                        <Descriptions.Item label="Code">
                            <Tag color="blue">{affiliate.code}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng Thái">
                            <Tag color="green">{affiliate.status}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tỷ Lệ Hoa Hồng">
                            {affiliate.commission_rate}%
                        </Descriptions.Item>
                        <Descriptions.Item label="Referral Link" span={2}>
                            <Space>
                                <span>{affiliate.referral_link}</span>
                                <Button
                                    size="small"
                                    icon={<CopyOutlined />}
                                    onClick={handleCopyLink}
                                >
                                    Copy
                                </Button>
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày Tham Gia">
                            {affiliate.created_at}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card title="Biểu Đồ Hoa Hồng">
                    <Line {...chartConfig} />
                </Card>

                <Card title="Referrals Gần Đây">
                    <Table
                        columns={referralColumns}
                        dataSource={affiliate.recent_referrals}
                        rowKey="name"
                        pagination={false}
                    />
                </Card>
            </Space>
        </div>
    );
};

export default AffiliateDetail;
