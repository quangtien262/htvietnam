import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Popconfirm, Switch, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ApiOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ROUTE } from '@/common/route';

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

interface ApiResponse {
    success: boolean;
    data?: any;
    message?: string;
}

const api = axios.create({
    baseURL: '',
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

const WebhookList: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const navigate = useNavigate();

    const fetchWebhooks = async () => {
        setLoading(true);
        try {
            const response = await callApi('/aio/api/whmcs/webhooks');
            if (response.success) {
                setWebhooks(response.data);
            }
        } catch (error) {
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
        } catch (error) {
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
        } catch (error) {
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
        } catch (error) {
            message.error('Không thể test webhook');
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
            render: (_: any, record: Webhook) => (
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
                            onClick={() => navigate(`${ROUTE.whmcsWebhooks}${record.id}/logs`)}
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
                        onClick={() => navigate(`${ROUTE.whmcsWebhooks}create`)}
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
        </div>
    );
};

export default WebhookList;
