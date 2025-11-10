import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Select, message, Space, Popconfirm, Tag, Card, Row, Col, Statistic, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, DollarOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import API from '@/common/api';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

interface TaxRule {
    id: number;
    name: string;
    rate: number;
    type: string;
    country?: string;
    state?: string;
    compound: boolean;
    priority: number;
    is_active: boolean;
    description?: string;
}

const TaxManagement: React.FC = () => {
    const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
    const [statistics, setStatistics] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [editingTax, setEditingTax] = useState<TaxRule | null>(null);
    const [reportData, setReportData] = useState<any>(null);
    const [form] = Form.useForm();
    const [reportForm] = Form.useForm();

    useEffect(() => {
        fetchTaxRules();
        fetchStatistics();
    }, []);

    const fetchTaxRules = async () => {
        setLoading(true);
        try {
            const result = await axios.get(API.whmcsTaxList);
            if (result.data.success) {
                setTaxRules(result.data.data);
            }
        } catch {
            message.error('Failed to load tax rules');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const result = await axios.get(API.whmcsTaxStatistics);
            if (result.data.success) {
                setStatistics(result.data.data);
            }
        } catch {
            console.error('Failed to load statistics');
        }
    };

    const handleAdd = () => {
        setEditingTax(null);
        form.resetFields();
        form.setFieldsValue({
            is_active: true,
            compound: false,
            priority: 1,
            type: 'percentage',
        });
        setModalVisible(true);
    };

    const handleEdit = (record: TaxRule) => {
        setEditingTax(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            if (editingTax) {
                await axios.put(API.whmcsTaxUpdate(editingTax.id), values);
                message.success('Tax rule updated successfully');
            } else {
                await axios.post(API.whmcsTaxStore, values);
                message.success('Tax rule created successfully');
            }
            
            setModalVisible(false);
            fetchTaxRules();
            fetchStatistics();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(API.whmcsTaxDelete(id));
            message.success('Tax rule deleted successfully');
            fetchTaxRules();
            fetchStatistics();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to delete tax rule');
        }
    };

    const handleGenerateReport = async () => {
        try {
            const values = await reportForm.validateFields();
            const result = await axios.get(API.whmcsTaxReport, {
                params: {
                    start_date: values.dateRange[0].format('YYYY-MM-DD'),
                    end_date: values.dateRange[1].format('YYYY-MM-DD'),
                },
            });
            
            if (result.data.success) {
                setReportData(result.data.data);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to generate report');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Rate',
            dataIndex: 'rate',
            key: 'rate',
            render: (rate: number, record: TaxRule) => (
                record.type === 'percentage' ? `${rate}%` : `$${rate}`
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => (
                <Tag color={type === 'percentage' ? 'blue' : 'green'}>
                    {type.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Location',
            key: 'location',
            render: (_: any, record: TaxRule) => {
                if (!record.country) return <Tag>Global</Tag>;
                return (
                    <Space>
                        <Tag color="purple">{record.country}</Tag>
                        {record.state && <Tag>{record.state}</Tag>}
                    </Space>
                );
            },
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
        },
        {
            title: 'Compound',
            dataIndex: 'compound',
            key: 'compound',
            render: (compound: boolean) => (
                compound ? <Tag color="orange">Yes</Tag> : <Tag>No</Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (active: boolean) => (
                <Tag color={active ? 'green' : 'red'}>
                    {active ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: TaxRule) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Are you sure to delete this tax rule?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <h1>Tax Management</h1>

            {/* Statistics */}
            {statistics && (
                <Card style={{ marginBottom: 24 }}>
                    <Row gutter={16}>
                        <Col span={6}>
                            <Statistic
                                title="Tax This Month"
                                value={statistics.tax_this_month}
                                prefix="$"
                                precision={2}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="Tax Last Month"
                                value={statistics.tax_last_month}
                                prefix="$"
                                precision={2}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="Active Rules"
                                value={statistics.active_rules}
                                suffix={`/ ${statistics.total_rules}`}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="Growth"
                                value={statistics.growth}
                                precision={2}
                                suffix="%"
                                valueStyle={{ color: statistics.growth >= 0 ? '#3f8600' : '#cf1322' }}
                            />
                        </Col>
                    </Row>
                </Card>
            )}

            <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Add Tax Rule
                </Button>
                <Button icon={<FileTextOutlined />} onClick={() => setReportModalVisible(true)}>
                    Generate Report
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={taxRules}
                rowKey="id"
                loading={loading}
            />

            {/* Add/Edit Modal */}
            <Modal
                title={editingTax ? 'Edit Tax Rule' : 'Add Tax Rule'}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Tax Name" rules={[{ required: true }]}>
                        <Input placeholder="VAT, GST, Sales Tax, etc." />
                    </Form.Item>

                    <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                        <Select>
                            <Option value="percentage">Percentage</Option>
                            <Option value="fixed">Fixed Amount</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="rate" label="Rate" rules={[{ required: true }]}>
                        <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="country" label="Country Code">
                                <Input placeholder="US, VN, SG (2 letters)" maxLength={2} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="state" label="State/Province">
                                <Input placeholder="Optional" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="compound" label="Compound Tax" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item name="is_active" label="Active" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Report Modal */}
            <Modal
                title="Tax Report"
                open={reportModalVisible}
                onCancel={() => setReportModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form form={reportForm} layout="vertical">
                    <Form.Item name="dateRange" label="Date Range" rules={[{ required: true }]}>
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Button type="primary" onClick={handleGenerateReport} block>
                        Generate Report
                    </Button>
                </Form>

                {reportData && (
                    <div style={{ marginTop: 24 }}>
                        <Card title="Report Summary">
                            <p><strong>Period:</strong> {reportData.period.start} to {reportData.period.end}</p>
                            <p><strong>Total Tax Collected:</strong> ${reportData.total_tax_collected?.toFixed(2)}</p>
                            <p><strong>Total Invoices:</strong> {reportData.total_invoices}</p>
                            
                            {reportData.by_tax_type && Object.keys(reportData.by_tax_type).length > 0 && (
                                <>
                                    <h4 style={{ marginTop: 16 }}>By Tax Type:</h4>
                                    {Object.entries(reportData.by_tax_type).map(([name, data]: [string, any]) => (
                                        <p key={name}>{name}: ${data.total_tax?.toFixed(2)} ({data.count} invoices)</p>
                                    ))}
                                </>
                            )}
                        </Card>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TaxManagement;
