import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Popconfirm, Switch, Tooltip, Modal, Form, Input, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ApiOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ROUTE } from '@/common/route';
import { AVAILABLE_EVENTS } from './constants';

interface Webhook {
    id: number;
    name: string;
    url: string;
    events: string[];
    is_active: boolean;
    secret_key: string;
    created_at: string;
    last_triggered_at: string | null;
}

interface WebhookLog {
    id: number;
    event: string;
    url: string;
    payload: unknown;
    response_code: number | null;
    response_body: string | null;
    success: boolean;
    error_message: string | null;
    created_at: string;
}

interface ApiResponse {
    success: boolean;
    data?: unknown;
    message?: string;
}

// Helper function to call API
const callApi = async (url: string, method: string = 'GET', data?: unknown): Promise<ApiResponse> => {
    try {
        const response = await axios({
            method,
            url,
            data,
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            }
        });

        return {
            success: true,
            data: response.data.data || response.data,
            message: response.data.message
        };
    } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        return {
            success: false,
            message: err.response?.data?.message || 'An error occurred'
        };
    }
};

const WebhookList: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
    const [logsLoading, setLogsLoading] = useState(false);
    const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
    const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const fetchWebhooks = async () => {
        setLoading(true);
        try {
            const response = await callApi('/aio/api/whmcs/webhooks');
            if (response.success) {
                setWebhooks(response.data as Webhook[]);
            }
        } catch {
            message.error('Không thể tải danh sách webhooks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWebhooks();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            const response = await callApi(`/aio/api/whmcs/webhooks/${id}`, 'DELETE');
            if (response.success) {
                message.success('Đã xóa webhook');
                fetchWebhooks();
            }
        } catch {
            message.error('Không thể xóa webhook');
        }
    };

    const handleToggleActive = async (id: number, is_active: boolean) => {
        try {
            const response = await callApi(`/aio/api/whmcs/webhooks/${id}`, 'PUT', {
                is_active: !is_active
            });
            if (response.success) {
                message.success(is_active ? 'Đã tắt webhook' : 'Đã bật webhook');
                fetchWebhooks();
            }
        } catch {
            message.error('Không thể cập nhật webhook');
        }
    };

    const handleTest = async (id: number) => {
        try {
            const response = await callApi(`/aio/api/whmcs/webhooks/${id}/test`, 'POST');
            if (response.success) {
                message.success('Webhook test thành công!');
            } else {
                message.error('Webhook test thất bại: ' + response.message);
            }
        } catch {
            message.error('Không thể test webhook');
        }
    };

    const handleCreateWebhook = async (values: unknown) => {
        try {
            const response = await callApi('/aio/api/whmcs/webhooks', 'POST', values);
            if (response.success) {
                message.success('Tạo webhook thành công!');
                setIsModalOpen(false);
                form.resetFields();
                fetchWebhooks();
            } else {
                message.error(response.message || 'Tạo webhook thất bại!');
            }
        } catch {
            message.error('Tạo webhook thất bại!');
        }
    };

    const handleViewLogs = async (webhook: Webhook) => {
        setSelectedWebhook(webhook);
        setIsLogsModalOpen(true);
        setLogsLoading(true);

        try {
            const response = await callApi(`/aio/api/whmcs/webhooks/${webhook.id}/logs`);
            if (response.success) {
                const data = response.data as { data?: WebhookLog[] };
                setWebhookLogs(data.data || []);
            } else {
                message.error('Không thể tải logs');
                setWebhookLogs([]);
            }
        } catch {
            message.error('Không thể tải logs');
            setWebhookLogs([]);
        } finally {
            setLogsLoading(false);
        }
    };

    const columns = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            width: 200,
        },
        {
            title: 'URL',
            dataIndex: 'url',
            key: 'url',
            ellipsis: true,
            render: (url: string) => (
                <Tooltip title={url}>
                    <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                </Tooltip>
            )
        },
        {
            title: 'Events',
            dataIndex: 'events',
            key: 'events',
            width: 300,
            render: (events: string[]) => (
                <Space size={[0, 8]} wrap>
                    {events.map((event, index) => (
                        <Tag key={index} color="blue">{event}</Tag>
                    ))}
                </Space>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 100,
            render: (is_active: boolean, record: Webhook) => (
                <Switch
                    checked={is_active}
                    onChange={() => handleToggleActive(record.id, is_active)}
                />
            )
        },
        {
            title: 'Lần cuối gọi',
            dataIndex: 'last_triggered_at',
            key: 'last_triggered_at',
            width: 150,
            render: (date: string | null) => date ? new Date(date).toLocaleString('vi-VN') : '-'
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 250,
            render: (_: unknown, record: Webhook) => (
                <Space>
                    <Tooltip title="Test Webhook">
                        <Button
                            type="default"
                            size="small"
                            icon={<ApiOutlined />}
                            onClick={() => handleTest(record.id)}
                        >
                            Test
                        </Button>
                    </Tooltip>
                    <Tooltip title="Xem Logs">
                        <Button
                            type="default"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewLogs(record)}
                        >
                            Logs
                        </Button>
                    </Tooltip>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`${ROUTE.whmcsWebhooks}${record.id}/edit`)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa webhook này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button
                            type="primary"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <h2>Quản lý Webhooks</h2>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchWebhooks}
                    >
                        Làm mới
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Thêm Webhook
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={webhooks}
                loading={loading}
                rowKey="id"
                pagination={{
                    pageSize: 20,
                    showTotal: (total) => `Tổng ${total} webhooks`
                }}
            />

            {/* Modal tạo webhook */}
            <Modal
                title="Tạo Webhook Mới"
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                okText="Tạo Webhook"
                cancelText="Hủy"
                width={900}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateWebhook}
                    initialValues={{ is_active: true }}
                >
                    <Space.Compact block style={{ display: 'flex', gap: 16 }}>
                        <Form.Item
                            label="Tên Webhook"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng nhập tên webhook' }]}
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="VD: Invoice Payment Notification" />
                        </Form.Item>

                        <Form.Item
                            label="URL"
                            name="url"
                            rules={[
                                { required: true, message: 'Vui lòng nhập URL' },
                                { type: 'url', message: 'URL không hợp lệ' }
                            ]}
                            style={{ flex: 2 }}
                        >
                            <Input placeholder="https://your-domain.com/webhook" />
                        </Form.Item>
                    </Space.Compact>

                    <Form.Item
                        label="Events (Chọn ít nhất 1 event)"
                        name="events"
                        rules={[{
                            required: true,
                            message: 'Vui lòng chọn ít nhất 1 event',
                            type: 'array',
                            min: 1
                        }]}
                    >
                        <Checkbox.Group
                            options={AVAILABLE_EVENTS}
                            style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="is_active"
                        valuePropName="checked"
                    >
                        <Checkbox>Kích hoạt ngay sau khi tạo</Checkbox>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal xem Logs */}
            <Modal
                title={
                    <div>
                        <EyeOutlined style={{ marginRight: 8 }} />
                        Webhook Logs: {selectedWebhook?.name}
                    </div>
                }
                open={isLogsModalOpen}
                onCancel={() => {
                    setIsLogsModalOpen(false);
                    setSelectedWebhook(null);
                    setWebhookLogs([]);
                }}
                footer={[
                    <Button key="close" onClick={() => setIsLogsModalOpen(false)}>
                        Đóng
                    </Button>
                ]}
                width={1200}
            >
                <Table
                    dataSource={webhookLogs}
                    loading={logsLoading}
                    rowKey="id"
                    size="small"
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng ${total} logs`
                    }}
                    scroll={{ x: 1000 }}
                    columns={[
                        {
                            title: 'Time',
                            dataIndex: 'created_at',
                            key: 'created_at',
                            width: 160,
                            render: (date: string) => new Date(date).toLocaleString('vi-VN')
                        },
                        {
                            title: 'Event',
                            dataIndex: 'event',
                            key: 'event',
                            width: 150,
                            render: (event: string) => <Tag color="blue">{event}</Tag>
                        },
                        {
                            title: 'Status',
                            dataIndex: 'success',
                            key: 'success',
                            width: 100,
                            render: (success: boolean, record: WebhookLog) => (
                                <Tooltip title={record.response_code ? `HTTP ${record.response_code}` : 'No response'}>
                                    <Tag color={success ? 'green' : 'red'}>
                                        {success ? 'Success' : 'Failed'}
                                    </Tag>
                                </Tooltip>
                            )
                        },
                        {
                            title: 'Response Code',
                            dataIndex: 'response_code',
                            key: 'response_code',
                            width: 120,
                            render: (code: number | null) => code || '-'
                        },
                        {
                            title: 'Error',
                            dataIndex: 'error_message',
                            key: 'error_message',
                            ellipsis: true,
                            render: (error: string | null) => (
                                error ? (
                                    <Tooltip title={error}>
                                        <Tag color="red">{error.substring(0, 50)}...</Tag>
                                    </Tooltip>
                                ) : '-'
                            )
                        },
                        {
                            title: 'Actions',
                            key: 'actions',
                            width: 100,
                            render: (_: unknown, record: WebhookLog) => (
                                <Button
                                    size="small"
                                    onClick={() => {
                                        Modal.info({
                                            title: 'Log Details',
                                            width: 800,
                                            content: (
                                                <div>
                                                    <p><strong>Event:</strong> {record.event}</p>
                                                    <p><strong>URL:</strong> {record.url}</p>
                                                    <p><strong>Response Code:</strong> {record.response_code || 'N/A'}</p>
                                                    <p><strong>Time:</strong> {new Date(record.created_at).toLocaleString('vi-VN')}</p>

                                                    {record.error_message && (
                                                        <>
                                                            <p><strong>Error:</strong></p>
                                                            <pre style={{
                                                                background: '#f5f5f5',
                                                                padding: 12,
                                                                borderRadius: 4,
                                                                maxHeight: 200,
                                                                overflow: 'auto'
                                                            }}>
                                                                {record.error_message}
                                                            </pre>
                                                        </>
                                                    )}

                                                    <p><strong>Payload:</strong></p>
                                                    <pre style={{
                                                        background: '#f5f5f5',
                                                        padding: 12,
                                                        borderRadius: 4,
                                                        maxHeight: 300,
                                                        overflow: 'auto'
                                                    }}>
                                                        {JSON.stringify(record.payload, null, 2)}
                                                    </pre>

                                                    {record.response_body && (
                                                        <>
                                                            <p><strong>Response:</strong></p>
                                                            <pre style={{
                                                                background: '#f5f5f5',
                                                                padding: 12,
                                                                borderRadius: 4,
                                                                maxHeight: 300,
                                                                overflow: 'auto'
                                                            }}>
                                                                {record.response_body}
                                                            </pre>
                                                        </>
                                                    )}
                                                </div>
                                            ),
                                        });
                                    }}
                                >
                                    Chi tiết
                                </Button>
                            )
                        }
                    ]}
                />
            </Modal>
        </div>
    );
};

export default WebhookList;
