import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Card, Statistic, Row, Col, Tag, Space, Drawer, Descriptions, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, DollarOutlined, UserOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { callApi } from '@/Function/api';
import { API } from '@/common/api';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { TabPane } = Tabs;

interface User {
    id: number;
    name: string;
    email: string;
}

interface Affiliate {
    id: number;
    user_id: number;
    code: string;
    commission_rate: number;
    commission_type: 'percentage' | 'fixed';
    total_earnings: number;
    pending_earnings: number;
    paid_earnings: number;
    total_referrals: number;
    successful_referrals: number;
    is_active: boolean;
    created_at: string;
    user?: User;
}

interface Payout {
    id: number;
    affiliate_id: number;
    amount: number;
    status: 'pending' | 'paid' | 'rejected';
    payment_method: string;
    payment_details: any;
    requested_at: string;
    processed_at?: string;
    processed_by?: number;
    rejection_reason?: string;
    affiliate?: {
        id: number;
        code: string;
        user?: User;
    };
    processor?: User;
}

interface AffiliateStatistics {
    total_affiliates: number;
    active_affiliates: number;
    total_earnings: number;
    pending_earnings: number;
    paid_earnings: number;
    total_referrals: number;
    converted_referrals: number;
    conversion_rate: number;
    pending_payouts: number;
    pending_payouts_count: number;
}

const AffiliateManagement: React.FC = () => {
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
    const [statistics, setStatistics] = useState<AffiliateStatistics | null>(null);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [payoutDrawerVisible, setPayoutDrawerVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        loadAffiliates();
        loadStatistics();
        loadPayouts();
    }, []);

    const loadAffiliates = async () => {
        setLoading(true);
        try {
            const response = await callApi(API.whmcsAffiliateList);
            if (response.success) {
                setAffiliates(response.data.data);
            }
        } catch (error) {
            message.error('Failed to load affiliates');
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const response = await callApi(API.whmcsAffiliateOverview);
            if (response.success) {
                setStatistics(response.data);
            }
        } catch (error) {
            console.error('Failed to load statistics', error);
        }
    };

    const loadPayouts = async () => {
        try {
            const response = await callApi(API.whmcsAffiliatePayouts);
            if (response.success) {
                setPayouts(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load payouts', error);
        }
    };

    const handleAdd = () => {
        setEditingAffiliate(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record: Affiliate) => {
        setEditingAffiliate(record);
        form.setFieldsValue({
            user_id: record.user_id,
            code: record.code,
            commission_rate: record.commission_rate,
            commission_type: record.commission_type,
            is_active: record.is_active,
        });
        setModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this affiliate?',
            content: 'This action cannot be undone',
            onOk: async () => {
                try {
                    const response = await callApi(API.whmcsAffiliateDelete(id), {}, 'DELETE');
                    if (response.success) {
                        message.success('Affiliate deleted successfully');
                        loadAffiliates();
                        loadStatistics();
                    }
                } catch (error: any) {
                    message.error(error.message || 'Failed to delete affiliate');
                }
            },
        });
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingAffiliate) {
                const response = await callApi(API.whmcsAffiliateUpdate(editingAffiliate.id), values, 'PUT');
                if (response.success) {
                    message.success('Affiliate updated successfully');
                }
            } else {
                const response = await callApi(API.whmcsAffiliateStore, values, 'POST');
                if (response.success) {
                    message.success('Affiliate created successfully');
                }
            }
            setModalVisible(false);
            loadAffiliates();
            loadStatistics();
        } catch (error: any) {
            message.error(error.message || 'Failed to save affiliate');
        }
    };

    const handleApprovePayout = async (id: number) => {
        try {
            const response = await callApi(API.whmcsAffiliateApprovePayout(id), {}, 'POST');
            if (response.success) {
                message.success('Payout approved successfully');
                loadPayouts();
                loadStatistics();
            }
        } catch (error: any) {
            message.error(error.message || 'Failed to approve payout');
        }
    };

    const handleRejectPayout = async (id: number) => {
        Modal.confirm({
            title: 'Reject Payout',
            content: (
                <Form id="rejectForm">
                    <Form.Item name="reason" label="Rejection Reason">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            ),
            onOk: async () => {
                const reason = (document.getElementById('rejectForm') as any)?.reason?.value;
                try {
                    const response = await callApi(API.whmcsAffiliateRejectPayout(id), { reason }, 'POST');
                    if (response.success) {
                        message.success('Payout rejected successfully');
                        loadPayouts();
                    }
                } catch (error: any) {
                    message.error(error.message || 'Failed to reject payout');
                }
            },
        });
    };

    const columns: ColumnsType<Affiliate> = [
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'User',
            key: 'user',
            render: (_, record) => (
                <div>
                    <div>{record.user?.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{record.user?.email}</div>
                </div>
            ),
        },
        {
            title: 'Commission',
            key: 'commission',
            render: (_, record) => (
                <span>
                    {record.commission_type === 'percentage' ? `${record.commission_rate}%` : `$${record.commission_rate}`}
                </span>
            ),
        },
        {
            title: 'Earnings',
            key: 'earnings',
            render: (_, record) => (
                <div>
                    <div>Total: ${record.total_earnings.toFixed(2)}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                        Pending: ${record.pending_earnings.toFixed(2)} | Paid: ${record.paid_earnings.toFixed(2)}
                    </div>
                </div>
            ),
        },
        {
            title: 'Referrals',
            key: 'referrals',
            render: (_, record) => (
                <div>
                    <div>Total: {record.total_referrals}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                        Successful: {record.successful_referrals}
                    </div>
                </div>
            ),
        },
        {
            title: 'Conversion Rate',
            key: 'conversion_rate',
            render: (_, record) => {
                const rate = record.total_referrals > 0 
                    ? ((record.successful_referrals / record.total_referrals) * 100).toFixed(1)
                    : '0.0';
                return <span>{rate}%</span>;
            },
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (is_active) => (
                <Tag color={is_active ? 'green' : 'red'}>
                    {is_active ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            ),
        },
    ];

    const payoutColumns: ColumnsType<Payout> = [
        {
            title: 'Affiliate',
            key: 'affiliate',
            render: (_, record) => (
                <div>
                    <div><Tag color="blue">{record.affiliate?.code}</Tag></div>
                    <div style={{ fontSize: '12px' }}>{record.affiliate?.user?.name}</div>
                </div>
            ),
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `$${amount.toFixed(2)}`,
        },
        {
            title: 'Payment Method',
            dataIndex: 'payment_method',
            key: 'payment_method',
        },
        {
            title: 'Requested At',
            dataIndex: 'requested_at',
            key: 'requested_at',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = { pending: 'orange', paid: 'green', rejected: 'red' };
                return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                if (record.status === 'pending') {
                    return (
                        <Space>
                            <Button
                                icon={<CheckOutlined />}
                                size="small"
                                type="primary"
                                onClick={() => handleApprovePayout(record.id)}
                            >
                                Approve
                            </Button>
                            <Button
                                icon={<CloseOutlined />}
                                size="small"
                                danger
                                onClick={() => handleRejectPayout(record.id)}
                            >
                                Reject
                            </Button>
                        </Space>
                    );
                }
                return <span>-</span>;
            },
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <h2>Affiliate Management</h2>

            {statistics && (
                <Row gutter={16} style={{ marginBottom: '24px' }}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Affiliates"
                                value={statistics.total_affiliates}
                                prefix={<UserOutlined />}
                            />
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                                Active: {statistics.active_affiliates}
                            </div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Earnings"
                                value={statistics.total_earnings}
                                prefix={<DollarOutlined />}
                                precision={2}
                            />
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                                Pending: ${statistics.pending_earnings.toFixed(2)}
                            </div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Referrals"
                                value={statistics.total_referrals}
                            />
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                                Converted: {statistics.converted_referrals}
                            </div>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Conversion Rate"
                                value={statistics.conversion_rate}
                                suffix="%"
                                precision={2}
                            />
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                                Pending Payouts: {statistics.pending_payouts_count}
                            </div>
                        </Card>
                    </Col>
                </Row>
            )}

            <Tabs defaultActiveKey="1">
                <TabPane tab="Affiliates" key="1">
                    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                        >
                            Add Affiliate
                        </Button>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={affiliates}
                        loading={loading}
                        rowKey="id"
                        pagination={{ pageSize: 20 }}
                    />
                </TabPane>

                <TabPane tab={`Payouts (${payouts.filter(p => p.status === 'pending').length} pending)`} key="2">
                    <Table
                        columns={payoutColumns}
                        dataSource={payouts}
                        rowKey="id"
                        pagination={{ pageSize: 20 }}
                    />
                </TabPane>
            </Tabs>

            <Modal
                title={editingAffiliate ? 'Edit Affiliate' : 'Add Affiliate'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="user_id"
                        label="User ID"
                        rules={[{ required: true, message: 'Please enter user ID' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={1} />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="Affiliate Code"
                    >
                        <Input placeholder="Leave empty to auto-generate" />
                    </Form.Item>

                    <Form.Item
                        name="commission_type"
                        label="Commission Type"
                        rules={[{ required: true, message: 'Please select commission type' }]}
                        initialValue="percentage"
                    >
                        <Select>
                            <Option value="percentage">Percentage</Option>
                            <Option value="fixed">Fixed Amount</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="commission_rate"
                        label="Commission Rate"
                        rules={[{ required: true, message: 'Please enter commission rate' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            step={0.1}
                            placeholder="e.g., 10 for 10% or 5 for $5"
                        />
                    </Form.Item>

                    <Form.Item
                        name="is_active"
                        label="Status"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Select>
                            <Option value={true}>Active</Option>
                            <Option value={false}>Inactive</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AffiliateManagement;
