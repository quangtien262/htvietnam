import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, message, Space, Popconfirm, Tag, Card, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, StarOutlined, StarFilled, SyncOutlined, DollarOutlined } from '@ant-design/icons';
import axios from 'axios';
import API from '@/common/api';

interface Currency {
    id: number;
    code: string;
    name: string;
    symbol: string;
    format: string;
    exchange_rate: number;
    is_base: boolean;
    is_active: boolean;
    decimal_places: number;
    position: string;
}

interface CurrencyStats {
    id: number;
    code: string;
    name: string;
    symbol: string;
    is_base: boolean;
    invoices_count: number;
    services_count: number;
    total_invoices_value: number;
    total_services_value: number;
    formatted_invoice_value: string;
    formatted_service_value: string;
}

const CurrencyManagement: React.FC = () => {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [statistics, setStatistics] = useState<CurrencyStats[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchCurrencies();
        fetchStatistics();
    }, []);

    const fetchCurrencies = async () => {
        setLoading(true);
        try {
            const result = await axios.get(API.whmcsCurrencyList);
            if (result.data.success) {
                setCurrencies(result.data.data);
            }
        } catch (error) {
            message.error('Failed to load currencies');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const result = await axios.get(API.whmcsCurrencyStatistics);
            if (result.data.success) {
                setStatistics(result.data.data);
            }
        } catch (error) {
            console.error('Failed to load statistics:', error);
        }
    };

    const handleAdd = () => {
        setEditingCurrency(null);
        form.resetFields();
        form.setFieldsValue({
            is_active: true,
            is_base: false,
            decimal_places: 2,
            position: 'before',
            format: '{symbol}{amount}',
        });
        setModalVisible(true);
    };

    const handleEdit = (record: Currency) => {
        setEditingCurrency(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            if (editingCurrency) {
                await axios.put(API.whmcsCurrencyUpdate(editingCurrency.id), values);
                message.success('Currency updated successfully');
            } else {
                await axios.post(API.whmcsCurrencyStore, values);
                message.success('Currency created successfully');
            }
            
            setModalVisible(false);
            fetchCurrencies();
            fetchStatistics();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(API.whmcsCurrencyDelete(id));
            message.success('Currency deleted successfully');
            fetchCurrencies();
            fetchStatistics();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to delete currency');
        }
    };

    const handleSetBase = async (id: number) => {
        try {
            await axios.post(API.whmcsCurrencySetBase(id));
            message.success('Base currency updated successfully');
            fetchCurrencies();
        } catch (error) {
            message.error('Failed to set base currency');
        }
    };

    const handleUpdateRates = async () => {
        setLoading(true);
        try {
            const result = await axios.post(API.whmcsCurrencyUpdateRates);
            if (result.data.success) {
                message.success(`Updated ${result.data.updated_count} exchange rates`);
                fetchCurrencies();
            } else {
                message.error(result.data.message);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to update exchange rates');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            render: (code: string, record: Currency) => (
                <Space>
                    {code}
                    {record.is_base && <StarFilled style={{ color: '#faad14' }} />}
                </Space>
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Symbol',
            dataIndex: 'symbol',
            key: 'symbol',
        },
        {
            title: 'Format',
            dataIndex: 'format',
            key: 'format',
            render: (format: string, record: Currency) => {
                const example = format
                    .replace('{symbol}', record.symbol)
                    .replace('{amount}', '1,234.56');
                return <code>{example}</code>;
            },
        },
        {
            title: 'Exchange Rate',
            dataIndex: 'exchange_rate',
            key: 'exchange_rate',
            render: (rate: number, record: Currency) => (
                record.is_base ? <Tag color="gold">Base</Tag> : rate.toFixed(6)
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
            title: 'Usage',
            key: 'usage',
            render: (_: any, record: Currency) => {
                const stats = statistics.find(s => s.id === record.id);
                if (!stats) return '-';
                return (
                    <Space direction="vertical" size="small">
                        <div>Invoices: {stats.invoices_count}</div>
                        <div>Services: {stats.services_count}</div>
                    </Space>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Currency) => (
                <Space>
                    {!record.is_base && (
                        <Button
                            icon={<StarOutlined />}
                            size="small"
                            onClick={() => handleSetBase(record.id)}
                            title="Set as base currency"
                        >
                            Set Base
                        </Button>
                    )}
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    />
                    {!record.is_base && (
                        <Popconfirm
                            title="Are you sure to delete this currency?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button icon={<DeleteOutlined />} size="small" danger />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    const baseCurrency = currencies.find(c => c.is_base);

    return (
        <div style={{ padding: 24 }}>
            <h1>Currency Management</h1>

            {/* Statistics Overview */}
            {baseCurrency && (
                <Card style={{ marginBottom: 24 }}>
                    <Row gutter={16}>
                        <Col span={6}>
                            <Statistic
                                title="Base Currency"
                                value={baseCurrency.code}
                                prefix={<DollarOutlined />}
                                suffix={baseCurrency.name}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="Active Currencies"
                                value={currencies.filter(c => c.is_active).length}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="Total Currencies"
                                value={currencies.length}
                            />
                        </Col>
                        <Col span={6}>
                            <Button
                                icon={<SyncOutlined />}
                                onClick={handleUpdateRates}
                                loading={loading}
                                type="primary"
                                style={{ marginTop: 16 }}
                            >
                                Update Exchange Rates
                            </Button>
                        </Col>
                    </Row>
                </Card>
            )}

            <div style={{ marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Add Currency
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={currencies}
                rowKey="id"
                loading={loading}
                pagination={false}
            />

            <Modal
                title={editingCurrency ? 'Edit Currency' : 'Add Currency'}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="code"
                        label="Currency Code"
                        rules={[
                            { required: true, message: 'Please enter currency code' },
                            { len: 3, message: 'Code must be 3 characters' },
                        ]}
                    >
                        <Input placeholder="USD" maxLength={3} style={{ textTransform: 'uppercase' }} />
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label="Currency Name"
                        rules={[{ required: true, message: 'Please enter currency name' }]}
                    >
                        <Input placeholder="US Dollar" />
                    </Form.Item>

                    <Form.Item
                        name="symbol"
                        label="Symbol"
                        rules={[{ required: true, message: 'Please enter symbol' }]}
                    >
                        <Input placeholder="$" maxLength={10} />
                    </Form.Item>

                    <Form.Item
                        name="format"
                        label="Display Format"
                        rules={[{ required: true, message: 'Please enter format' }]}
                        extra="Use {symbol} and {amount} placeholders"
                    >
                        <Input placeholder="{symbol}{amount}" />
                    </Form.Item>

                    <Form.Item
                        name="position"
                        label="Symbol Position"
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="before or after" />
                    </Form.Item>

                    <Form.Item
                        name="exchange_rate"
                        label="Exchange Rate (to base currency)"
                        rules={[{ required: true, message: 'Please enter exchange rate' }]}
                    >
                        <InputNumber min={0} step={0.000001} precision={6} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="decimal_places"
                        label="Decimal Places"
                        rules={[{ required: true }]}
                    >
                        <InputNumber min={0} max={8} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="is_base" label="Base Currency" valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Form.Item name="is_active" label="Active" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CurrencyManagement;
