import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Descriptions, Tag, Space, message, Modal, Input } from 'antd';
import { ArrowLeftOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import StatCard from '@/components/whmcs/StatCard';

interface Webhook {
    id: number;
    name: string;
    url: string;
    events: string[];
    is_active: boolean;
    secret_key: string;
    total_calls: number;
    success_calls: number;
    failed_calls: number;
    created_at: string;
    updated_at: string;
}

const WebhookDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [webhook, setWebhook] = useState<Webhook | null>(null);
    const [loading, setLoading] = useState(true);
    const [testModalVisible, setTestModalVisible] = useState(false);
    const [testPayload, setTestPayload] = useState('{\n  "test": true\n}');
    const [testLoading, setTestLoading] = useState(false);

    useEffect(() => {
        fetchWebhook();
    }, [id]);

    const fetchWebhook = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/aio/api/whmcs/webhooks/${id}`);
            if (response.data.success) {
                setWebhook(response.data.data);
            }
        } catch {
            message.error('Không thể tải webhook!');
        } finally {
            setLoading(false);
        }
    };

    const handleTest = async () => {
        setTestLoading(true);
        try {
            const payload = JSON.parse(testPayload);
            const response = await axios.post(`/aio/api/whmcs/webhooks/${id}/test`, { payload });
            if (response.data.success) {
                message.success('Test webhook thành công!');
                setTestModalVisible(false);
                fetchWebhook();
            }
        } catch {
            message.error('Test webhook thất bại!');
        } finally {
            setTestLoading(false);
        }
    };

    if (loading || !webhook) {
        return <div style={{ padding: 24 }}>Loading...</div>;
    }

    const successRate = webhook.total_calls > 0 
        ? ((webhook.success_calls / webhook.total_calls) * 100).toFixed(2) 
        : '0';

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate(-1)}
                        style={{ marginBottom: 16 }}
                    >
                        Quay Lại
                    </Button>
                    <h2>{webhook.name}</h2>
                </div>

                <Row gutter={16}>
                    <Col span={6}>
                        <StatCard
                            title="Total Calls"
                            value={webhook.total_calls}
                            prefix=""
                        />
                    </Col>
                    <Col span={6}>
                        <StatCard
                            title="Success"
                            value={webhook.success_calls}
                            prefix=""
                        />
                    </Col>
                    <Col span={6}>
                        <StatCard
                            title="Failed"
                            value={webhook.failed_calls}
                            prefix=""
                        />
                    </Col>
                    <Col span={6}>
                        <StatCard
                            title="Success Rate"
                            value={parseFloat(successRate)}
                            suffix="%"
                        />
                    </Col>
                </Row>

                <Card title="Webhook Information">
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="URL">{webhook.url}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={webhook.is_active ? 'green' : 'red'}>
                                {webhook.is_active ? 'Active' : 'Inactive'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Secret Key">{webhook.secret_key}</Descriptions.Item>
                        <Descriptions.Item label="Events">
                            {webhook.events.map(event => (
                                <Tag key={event}>{event}</Tag>
                            ))}
                        </Descriptions.Item>
                        <Descriptions.Item label="Created At">{webhook.created_at}</Descriptions.Item>
                        <Descriptions.Item label="Updated At">{webhook.updated_at}</Descriptions.Item>
                    </Descriptions>

                    <div style={{ marginTop: 16 }}>
                        <Button 
                            type="primary" 
                            icon={<ThunderboltOutlined />}
                            onClick={() => setTestModalVisible(true)}
                        >
                            Test Webhook
                        </Button>
                    </div>
                </Card>
            </Space>

            <Modal
                title="Test Webhook"
                open={testModalVisible}
                onOk={handleTest}
                onCancel={() => setTestModalVisible(false)}
                confirmLoading={testLoading}
            >
                <p>Nhập payload để test webhook (JSON format):</p>
                <Input.TextArea
                    rows={8}
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default WebhookDetail;
