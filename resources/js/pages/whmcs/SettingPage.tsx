import React, { useState, useEffect } from 'react';
import { Tabs, Card, Table, Button, Form, Input, InputNumber, Select, Switch, Modal, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { callApi } from '@/function/api';
import API from '@/common/api';

const { TabPane } = Tabs;
const { Option } = Select;

const SettingPage = () => {
    const [activeTab, setActiveTab] = useState('currencies');
    const [loading, setLoading] = useState(false);

    // Currencies
    const [currencies, setCurrencies] = useState([]);
    const [currencyModal, setCurrencyModal] = useState({ visible: false, data: null });
    const [currencyForm] = Form.useForm();

    // Tax Rules
    const [taxRules, setTaxRules] = useState([]);
    const [taxModal, setTaxModal] = useState({ visible: false, data: null });
    const [taxForm] = Form.useForm();

    // Promo Codes
    const [promoCodes, setPromoCodes] = useState([]);
    const [promoModal, setPromoModal] = useState({ visible: false, data: null });
    const [promoForm] = Form.useForm();

    useEffect(() => {
        if (activeTab === 'currencies') fetchCurrencies();
        if (activeTab === 'tax') fetchTaxRules();
        if (activeTab === 'promo') fetchPromoCodes();
    }, [activeTab]);

    // ==== CURRENCIES ====
    const fetchCurrencies = async () => {
        setLoading(true);
        const res = await callApi(API.whmcs_currenciesList, {});
        if (res?.success) setCurrencies(res.data);
        setLoading(false);
    };

    const handleCurrency = async (values: any) => {
        const isEdit = currencyModal.data;
        const endpoint = isEdit 
            ? API.whmcs_currenciesUpdate((currencyModal.data as any).id)
            : API.whmcs_currenciesCreate;
        
        const res = await callApi(endpoint, values);
        if (res?.success) {
            message.success(isEdit ? 'Cập nhật thành công' : 'Tạo mới thành công');
            setCurrencyModal({ visible: false, data: null });
            currencyForm.resetFields();
            fetchCurrencies();
        }
    };

    const deleteCurrency = async (id: any) => {
        const res = await callApi(API.whmcs_currenciesDelete(id), {});
        if (res?.success) {
            message.success('Xóa thành công');
            fetchCurrencies();
        }
    };

    // ==== TAX RULES ====
    const fetchTaxRules = async () => {
        setLoading(true);
        const res = await callApi(API.whmcs_taxRulesList, {});
        if (res?.success) setTaxRules(res.data);
        setLoading(false);
    };

    const handleTaxRule = async (values: any) => {
        const isEdit = taxModal.data;
        const endpoint = isEdit 
            ? API.whmcs_taxRulesUpdate((taxModal.data as any).id)
            : API.whmcs_taxRulesCreate;
        
        const res = await callApi(endpoint, values);
        if (res?.success) {
            message.success(isEdit ? 'Cập nhật thành công' : 'Tạo mới thành công');
            setTaxModal({ visible: false, data: null });
            taxForm.resetFields();
            fetchTaxRules();
        }
    };

    const deleteTaxRule = async (id: any) => {
        const res = await callApi(API.whmcs_taxRulesDelete(id), {});
        if (res?.success) {
            message.success('Xóa thành công');
            fetchTaxRules();
        }
    };

    // ==== PROMO CODES ====
    const fetchPromoCodes = async () => {
        setLoading(true);
        const res = await callApi(API.whmcs_promoCodesList, {});
        if (res?.success) setPromoCodes(res.data);
        setLoading(false);
    };

    const handlePromoCode = async (values: any) => {
        const isEdit = promoModal.data;
        const endpoint = isEdit 
            ? API.whmcs_promoCodesUpdate((promoModal.data as any).id)
            : API.whmcs_promoCodesCreate;
        
        const res = await callApi(endpoint, values);
        if (res?.success) {
            message.success(isEdit ? 'Cập nhật thành công' : 'Tạo mới thành công');
            setPromoModal({ visible: false, data: null });
            promoForm.resetFields();
            fetchPromoCodes();
        }
    };

    const deletePromoCode = async (id: any) => {
        const res = await callApi(API.whmcs_promoCodesDelete(id), {});
        if (res?.success) {
            message.success('Xóa thành công');
            fetchPromoCodes();
        }
    };

    const currencyColumns = [
        { title: 'Code', dataIndex: 'code', width: 100 },
        { title: 'Tên', dataIndex: 'name', width: 150 },
        { title: 'Ký hiệu', dataIndex: 'symbol', width: 100 },
        { title: 'Tỷ giá', dataIndex: 'rate', width: 120 },
        { 
            title: 'Mặc định', 
            dataIndex: 'is_default',
            width: 100,
            render: (v: boolean) => v ? 'Có' : 'Không'
        },
        {
            title: 'Hành động',
            width: 120,
            render: (_: any, record: any) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => {
                        setCurrencyModal({ visible: true, data: record });
                        currencyForm.setFieldsValue(record);
                    }}>Sửa</Button>
                    <Popconfirm title="Xóa?" onConfirm={() => deleteCurrency(record.id)}>
                        <Button icon={<DeleteOutlined />} size="small" danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const taxColumns = [
        { title: 'Tên', dataIndex: 'name', width: 200 },
        { title: 'Quốc gia', dataIndex: 'country', width: 150 },
        { title: 'Tỉnh/TP', dataIndex: 'state', width: 150 },
        { title: 'Thuế (%)', dataIndex: 'rate', width: 100 },
        {
            title: 'Hành động',
            width: 120,
            render: (_: any, record: any) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => {
                        setTaxModal({ visible: true, data: record });
                        taxForm.setFieldsValue(record);
                    }}>Sửa</Button>
                    <Popconfirm title="Xóa?" onConfirm={() => deleteTaxRule(record.id)}>
                        <Button icon={<DeleteOutlined />} size="small" danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const promoColumns = [
        { title: 'Mã', dataIndex: 'code', width: 120 },
        { title: 'Loại', dataIndex: 'type', width: 100 },
        { title: 'Giảm giá', dataIndex: 'value', width: 100 },
        { title: 'Ngày bắt đầu', dataIndex: 'start_date', width: 120 },
        { title: 'Ngày hết hạn', dataIndex: 'end_date', width: 120 },
        { title: 'Số lần dùng', dataIndex: 'max_uses', width: 100 },
        { title: 'Đã dùng', dataIndex: 'uses', width: 100 },
        {
            title: 'Hành động',
            width: 120,
            render: (_: any, record: any) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => {
                        setPromoModal({ visible: true, data: record });
                        promoForm.setFieldsValue(record);
                    }}>Sửa</Button>
                    <Popconfirm title="Xóa?" onConfirm={() => deletePromoCode(record.id)}>
                        <Button icon={<DeleteOutlined />} size="small" danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <h2>Cài đặt WHMCS</h2>

            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="Tiền tệ" key="currencies">
                    <Card 
                        title="Quản lý tiền tệ"
                        extra={
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                                setCurrencyModal({ visible: true, data: null });
                                currencyForm.resetFields();
                            }}>
                                Thêm mới
                            </Button>
                        }
                    >
                        <Table 
                            columns={currencyColumns}
                            dataSource={currencies}
                            loading={loading}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="Thuế" key="tax">
                    <Card 
                        title="Quản lý thuế"
                        extra={
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                                setTaxModal({ visible: true, data: null });
                                taxForm.resetFields();
                            }}>
                                Thêm mới
                            </Button>
                        }
                    >
                        <Table 
                            columns={taxColumns}
                            dataSource={taxRules}
                            loading={loading}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="Mã khuyến mãi" key="promo">
                    <Card 
                        title="Quản lý mã khuyến mãi"
                        extra={
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                                setPromoModal({ visible: true, data: null });
                                promoForm.resetFields();
                            }}>
                                Thêm mới
                            </Button>
                        }
                    >
                        <Table 
                            columns={promoColumns}
                            dataSource={promoCodes}
                            loading={loading}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </TabPane>
            </Tabs>

            {/* Currency Modal */}
            <Modal
                title={currencyModal.data ? 'Sửa tiền tệ' : 'Thêm tiền tệ'}
                open={currencyModal.visible}
                onOk={() => currencyForm.submit()}
                onCancel={() => setCurrencyModal({ visible: false, data: null })}
            >
                <Form form={currencyForm} layout="vertical" onFinish={handleCurrency}>
                    <Form.Item name="code" label="Mã" rules={[{ required: true }]}>
                        <Input placeholder="VND, USD, EUR..." />
                    </Form.Item>
                    <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
                        <Input placeholder="Vietnam Dong" />
                    </Form.Item>
                    <Form.Item name="symbol" label="Ký hiệu" rules={[{ required: true }]}>
                        <Input placeholder="₫, $, €..." />
                    </Form.Item>
                    <Form.Item name="rate" label="Tỷ giá" rules={[{ required: true }]}>
                        <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="is_default" label="Mặc định" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Tax Modal */}
            <Modal
                title={taxModal.data ? 'Sửa thuế' : 'Thêm thuế'}
                open={taxModal.visible}
                onOk={() => taxForm.submit()}
                onCancel={() => setTaxModal({ visible: false, data: null })}
            >
                <Form form={taxForm} layout="vertical" onFinish={handleTaxRule}>
                    <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
                        <Input placeholder="VAT 10%" />
                    </Form.Item>
                    <Form.Item name="country" label="Quốc gia" rules={[{ required: true }]}>
                        <Input placeholder="Vietnam" />
                    </Form.Item>
                    <Form.Item name="state" label="Tỉnh/TP">
                        <Input placeholder="Hồ Chí Minh" />
                    </Form.Item>
                    <Form.Item name="rate" label="Thuế suất (%)" rules={[{ required: true }]}>
                        <InputNumber min={0} max={100} step={0.1} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Promo Code Modal */}
            <Modal
                title={promoModal.data ? 'Sửa mã khuyến mãi' : 'Thêm mã khuyến mãi'}
                open={promoModal.visible}
                onOk={() => promoForm.submit()}
                onCancel={() => setPromoModal({ visible: false, data: null })}
            >
                <Form form={promoForm} layout="vertical" onFinish={handlePromoCode}>
                    <Form.Item name="code" label="Mã" rules={[{ required: true }]}>
                        <Input placeholder="SUMMER2024" />
                    </Form.Item>
                    <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
                        <Select>
                            <Option value="Percentage">Phần trăm (%)</Option>
                            <Option value="Fixed Amount">Số tiền cố định</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="value" label="Giá trị" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="start_date" label="Ngày bắt đầu" rules={[{ required: true }]}>
                        <Input type="date" />
                    </Form.Item>
                    <Form.Item name="end_date" label="Ngày hết hạn" rules={[{ required: true }]}>
                        <Input type="date" />
                    </Form.Item>
                    <Form.Item name="max_uses" label="Số lần dùng tối đa">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SettingPage;
