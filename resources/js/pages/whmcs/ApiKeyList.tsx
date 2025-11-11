import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    Switch,
    Tag,
    Space,
    Card,
    Row,
    Col,
    Statistic,
    message,
    Popconfirm,
    Tooltip,
    Descriptions,
} from 'antd';
import {
    PlusOutlined,
    KeyOutlined,
    DeleteOutlined,
    EditOutlined,
    ReloadOutlined,
    StopOutlined,
    BarChartOutlined,
    FileTextOutlined,
    CopyOutlined,
} from '@ant-design/icons';
import { callApi } from '../../function/api';
import dayjs from 'dayjs';

// Ziggy route() is globally available via @routes directive in app.blade.php
declare function route(name: string, params?: any): string;

const { Option } = Select;
const { TextArea } = Input;

const ApiKeyList: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [apiKeys, setApiKeys] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
    const [filters, setFilters] = useState({});
    
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [editingKey, setEditingKey] = useState<any>(null);
    
    const [statisticsModalVisible, setStatisticsModalVisible] = useState(false);
    const [logsModalVisible, setLogsModalVisible] = useState(false);
    const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null);
    const [statistics, setStatistics] = useState<any>(null);
    const [logs, setLogs] = useState([]);
    
    const [form] = Form.useForm();

    useEffect(() => {
        fetchApiKeys();
    }, [pagination.current, filters]);

    const fetchApiKeys = async () => {
        setLoading(true);
        try {
            const response = await callApi(
                route('whmcs.api-keys.index', {
                    page: pagination.current,
                    per_page: pagination.pageSize,
                    ...filters,
                })
            );

            if (response.success) {
                setApiKeys(response.data.data);
                setPagination({
                    ...pagination,
                    total: response.data.total,
                });
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách API keys');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setModalMode('create');
        setEditingKey(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record: any) => {
        setModalMode('edit');
        setEditingKey(record);
        form.setFieldsValue({
            name: record.name,
            permissions: record.permissions,
            allowed_ips: record.allowed_ips,
            status: record.status,
            expires_at: record.expires_at ? dayjs(record.expires_at) : null,
        });
        setModalVisible(true);
    };

    const handleSubmit = async (values: any) => {
        try {
            const data = {
                ...values,
                expires_at: values.expires_at ? values.expires_at.format('YYYY-MM-DD') : null,
            };

            let response;
            if (modalMode === 'create') {
                response = await callApi(route('whmcs.api-keys.store'), 'POST', data);
            } else {
                response = await callApi(
                    route('whmcs.api-keys.update', [editingKey.id]),
                    'PUT',
                    data
                );
            }

            if (response.success) {
                message.success(response.message);
                
                // Show credentials modal for new keys
                if (modalMode === 'create' && response.data.secret) {
                    Modal.success({
                        title: 'API Key Created Successfully',
                        width: 600,
                        content: (
                            <div>
                                <p style={{ color: 'red', fontWeight: 'bold' }}>
                                    ⚠️ Store these credentials securely. The secret will not be shown again!
                                </p>
                                <Descriptions bordered column={1} size="small">
                                    <Descriptions.Item label="Key">
                                        <code>{response.data.key}</code>
                                        <Button
                                            size="small"
                                            icon={<CopyOutlined />}
                                            onClick={() => {
                                                navigator.clipboard.writeText(response.data.key);
                                                message.success('Key copied!');
                                            }}
                                            style={{ marginLeft: 8 }}
                                        >
                                            Copy
                                        </Button>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Secret">
                                        <code>{response.data.secret}</code>
                                        <Button
                                            size="small"
                                            icon={<CopyOutlined />}
                                            onClick={() => {
                                                navigator.clipboard.writeText(response.data.secret);
                                                message.success('Secret copied!');
                                            }}
                                            style={{ marginLeft: 8 }}
                                        >
                                            Copy
                                        </Button>
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        ),
                    });
                }
                
                setModalVisible(false);
                fetchApiKeys();
            }
        } catch (error) {
            message.error('Lỗi khi lưu API key');
        }
    };

    const handleRevoke = async (id: number) => {
        try {
            const response = await callApi(
                route('whmcs.api-keys.revoke', [id]),
                'POST'
            );

            if (response.success) {
                message.success('API key đã được thu hồi');
                fetchApiKeys();
            }
        } catch (error) {
            message.error('Lỗi khi thu hồi API key');
        }
    };

    const handleRegenerateSecret = async (id: number) => {
        try {
            const response = await callApi(
                route('whmcs.api-keys.regenerate', [id]),
                'POST'
            );

            if (response.success) {
                Modal.success({
                    title: 'Secret Regenerated',
                    width: 600,
                    content: (
                        <div>
                            <p style={{ color: 'red', fontWeight: 'bold' }}>
                                ⚠️ Store the new secret securely. It will not be shown again!
                            </p>
                            <Descriptions bordered column={1} size="small">
                                <Descriptions.Item label="New Secret">
                                    <code>{response.data.secret}</code>
                                    <Button
                                        size="small"
                                        icon={<CopyOutlined />}
                                        onClick={() => {
                                            navigator.clipboard.writeText(response.data.secret);
                                            message.success('Secret copied!');
                                        }}
                                        style={{ marginLeft: 8 }}
                                    >
                                        Copy
                                    </Button>
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    ),
                });
            }
        } catch (error) {
            message.error('Lỗi khi tạo lại secret');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await callApi(
                route('whmcs.api-keys.destroy', [id]),
                'DELETE'
            );

            if (response.success) {
                message.success('Đã xóa API key');
                fetchApiKeys();
            }
        } catch (error) {
            message.error('Lỗi khi xóa API key');
        }
    };

    const showStatistics = async (id: number) => {
        setSelectedKeyId(id);
        setStatisticsModalVisible(true);
        
        try {
            const response = await callApi(route('whmcs.api-keys.statistics', [id]));
            if (response.success) {
                setStatistics(response.data);
            }
        } catch (error) {
            message.error('Lỗi khi tải thống kê');
        }
    };

    const showLogs = async (id: number) => {
        setSelectedKeyId(id);
        setLogsModalVisible(true);
        
        try {
            const response = await callApi(route('whmcs.api-keys.logs', [id]));
            if (response.success) {
                setLogs(response.data.data);
            }
        } catch (error) {
            message.error('Lỗi khi tải logs');
        }
    };

    const columns = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Key',
            dataIndex: 'key',
            key: 'key',
            render: (key: string) => (
                <code style={{ fontSize: 12 }}>{key.substring(0, 20)}...</code>
            ),
        },
        {
            title: 'Loại',
            key: 'type',
            render: (record: any) => (
                <Tag color={record.client_id ? 'blue' : 'green'}>
                    {record.client_id ? 'Client' : 'Admin'}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors = {
                    active: 'success',
                    inactive: 'default',
                    revoked: 'error',
                };
                return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Lần cuối sử dụng',
            dataIndex: 'last_used_at',
            key: 'last_used_at',
            render: (date: string) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'),
        },
        {
            title: 'Hết hạn',
            dataIndex: 'expires_at',
            key: 'expires_at',
            render: (date: string) => (date ? dayjs(date).format('DD/MM/YYYY') : 'Không giới hạn'),
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (record: any) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Thống kê">
                        <Button
                            size="small"
                            icon={<BarChartOutlined />}
                            onClick={() => showStatistics(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Logs">
                        <Button
                            size="small"
                            icon={<FileTextOutlined />}
                            onClick={() => showLogs(record.id)}
                        />
                    </Tooltip>
                    {record.status === 'active' && (
                        <>
                            <Tooltip title="Tạo lại Secret">
                                <Popconfirm
                                    title="Tạo lại secret sẽ vô hiệu hóa secret cũ. Tiếp tục?"
                                    onConfirm={() => handleRegenerateSecret(record.id)}
                                >
                                    <Button size="small" icon={<ReloadOutlined />} />
                                </Popconfirm>
                            </Tooltip>
                            <Tooltip title="Thu hồi">
                                <Popconfirm
                                    title="Thu hồi API key?"
                                    onConfirm={() => handleRevoke(record.id)}
                                >
                                    <Button size="small" danger icon={<StopOutlined />} />
                                </Popconfirm>
                            </Tooltip>
                        </>
                    )}
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa API key vĩnh viễn?"
                            onConfirm={() => handleDelete(record.id)}
                        >
                            <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const logsColumns = [
        {
            title: 'Endpoint',
            dataIndex: 'endpoint',
            key: 'endpoint',
        },
        {
            title: 'Method',
            dataIndex: 'method',
            key: 'method',
            render: (method: string) => <Tag>{method}</Tag>,
        },
        {
            title: 'Status',
            dataIndex: 'response_code',
            key: 'response_code',
            render: (code: number) => (
                <Tag color={code < 300 ? 'success' : code < 400 ? 'warning' : 'error'}>
                    {code}
                </Tag>
            ),
        },
        {
            title: 'Execution Time',
            dataIndex: 'execution_time',
            key: 'execution_time',
            render: (time: number) => `${time.toFixed(2)} ms`,
        },
        {
            title: 'IP Address',
            dataIndex: 'ip_address',
            key: 'ip_address',
        },
        {
            title: 'Time',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
        },
    ];

    return (
        <div className="p-6">
            <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>
                        <KeyOutlined /> Quản lý API Keys
                    </h2>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        <span className="hidden sm:inline">Tạo API Key</span>
                        <span className="sm:hidden">Tạo</span>
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={apiKeys}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        ...pagination,
                        onChange: (page) => setPagination({ ...pagination, current: page }),
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={modalMode === 'create' ? 'Tạo API Key mới' : 'Chỉnh sửa API Key'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width="100%"
                style={{ maxWidth: 1000, top: 20 }}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={[16, 0]}>
                        <Col xs={24} sm={24} md={12}>
                            <Form.Item
                                name="name"
                                label="Tên API Key"
                                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                            >
                                <Input placeholder="Ví dụ: Mobile App API" />
                            </Form.Item>
                        </Col>

                        {modalMode === 'create' && (
                            <>
                                <Col xs={24} sm={24} md={12}>
                                    <Form.Item
                                        name="client_id"
                                        label="Client ID (tùy chọn)"
                                    >
                                        <Input type="number" placeholder="Để trống nếu là Admin API key" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={24} md={12}>
                                    <Form.Item
                                        name="admin_user_id"
                                        label="Admin User ID (tùy chọn)"
                                    >
                                        <Input type="number" placeholder="Để trống nếu là Client API key" />
                                    </Form.Item>
                                </Col>
                            </>
                        )}

                        {modalMode === 'edit' && (
                            <Col xs={24} sm={24} md={12}>
                                <Form.Item name="status" label="Trạng thái">
                                    <Select>
                                        <Option value="active">Active</Option>
                                        <Option value="inactive">Inactive</Option>
                                        <Option value="revoked">Revoked</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        )}

                        <Col xs={24} sm={24} md={12}>
                            <Form.Item name="expires_at" label="Ngày hết hạn (tùy chọn)">
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item name="permissions" label="Permissions">
                                <Select mode="tags" placeholder="Nhập permissions (VD: invoices.read, services.create)">
                                    <Option value="*">* (Full Access)</Option>
                                    <Option value="invoices.read">invoices.read</Option>
                                    <Option value="invoices.write">invoices.write</Option>
                                    <Option value="services.read">services.read</Option>
                                    <Option value="services.write">services.write</Option>
                                    <Option value="servers.read">servers.read</Option>
                                    <Option value="servers.write">servers.write</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item name="allowed_ips" label="Allowed IPs (tùy chọn)">
                                <TextArea
                                    rows={3}
                                    placeholder="1.2.3.4, 5.6.7.8 (phân cách bằng dấu phẩy, để trống = cho phép tất cả)"
                                />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item>
                                <Space>
                                    <Button type="primary" htmlType="submit">
                                        {modalMode === 'create' ? 'Tạo' : 'Cập nhật'}
                                    </Button>
                                    <Button onClick={() => setModalVisible(false)}>Hủy</Button>
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Statistics Modal */}
            <Modal
                title="API Usage Statistics"
                open={statisticsModalVisible}
                onCancel={() => setStatisticsModalVisible(false)}
                footer={null}
                width="100%"
                style={{ maxWidth: 800, top: 20 }}
            >
                {statistics && (
                    <div>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8}>
                                <Card>
                                    <Statistic title="Total Requests" value={statistics.total_requests} />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Card>
                                    <Statistic
                                        title="Success Rate"
                                        value={
                                            statistics.total_requests > 0
                                                ? (
                                                      (statistics.successful_requests /
                                                          statistics.total_requests) *
                                                      100
                                                  ).toFixed(2)
                                                : 0
                                        }
                                        suffix="%"
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Card>
                                    <Statistic
                                        title="Avg Response Time"
                                        value={statistics.avg_execution_time}
                                        suffix="ms"
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </div>
                )}
            </Modal>

            {/* Logs Modal */}
            <Modal
                title="API Request Logs"
                open={logsModalVisible}
                onCancel={() => setLogsModalVisible(false)}
                footer={null}
                width="100%"
                style={{ maxWidth: 1200, top: 20 }}
            >
                <Table
                    columns={logsColumns}
                    dataSource={logs}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 20 }}
                    scroll={{ x: 900 }}
                />
            </Modal>
        </div>
    );
};

export default ApiKeyList;
