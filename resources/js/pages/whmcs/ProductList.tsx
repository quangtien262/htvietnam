import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, Row, Col, Select, Popconfirm, message, Switch, InputNumber } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { callApi } from '@/function/api';
import API from '@/common/api';

const { Option } = Select;
const { TextArea } = Input;

const ProductList = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [groups, setGroups] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [search, setSearch] = useState('');
    const [groupFilter, setGroupFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchData();
        fetchGroups();
    }, []);

    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const res = await callApi(API.whmcs_productsList, {
                perPage: pagination.pageSize,
                page,
                search,
                group_id: groupFilter,
                type: typeFilter
            });
            if (res?.success) {
                setData(res.data.data);
                setPagination({ ...pagination, current: page, total: res.data.total });
            }
        } catch (error) {
            message.error('Không thể tải dữ liệu');
        }
        setLoading(false);
    };

    const fetchGroups = async () => {
        const res = await callApi(API.whmcs_productsGroups, {});
        if (res?.success) {
            setGroups(res.data);
        }
    };

    const handleAdd = () => {
        setEditingProduct(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingProduct(record);
        form.setFieldsValue({
            ...record,
            hidden: record.hidden === 1
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const res = await callApi(API.whmcs_productsDelete(id), {});
            if (res?.success) {
                message.success('Xóa sản phẩm thành công');
                fetchData(pagination.current);
            } else {
                message.error(res?.message || 'Xóa thất bại');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const submitData = {
                ...values,
                hidden: values.hidden ? 1 : 0
            };

            const apiUrl = editingProduct
                ? API.whmcs_productsUpdate(editingProduct.id)
                : API.whmcs_productsAdd;

            const res = await callApi(apiUrl, submitData);
            if (res?.success) {
                message.success(editingProduct ? 'Cập nhật thành công' : 'Thêm sản phẩm thành công');
                setIsModalVisible(false);
                fetchData(pagination.current);
            } else {
                message.error(res?.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 80,
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            width: 250
        },
        {
            title: 'Nhóm',
            dataIndex: ['group', 'name'],
            width: 150
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            width: 120,
            render: (type) => {
                const labels = {
                    'shared-hosting': 'Shared Hosting',
                    'vps-hosting': 'VPS Hosting',
                    'dedicated-server': 'Dedicated Server',
                    'domain': 'Domain Registration',
                    'ssl': 'SSL Certificate',
                    'email': 'Email Hosting',
                    'reseller': 'Reseller Hosting',
                    'addon': 'Addon/Service',
                    'other': 'Khác'
                };
                const colors = {
                    'shared-hosting': 'blue',
                    'vps-hosting': 'cyan',
                    'dedicated-server': 'purple',
                    'domain': 'green',
                    'ssl': 'orange',
                    'email': 'magenta',
                    'reseller': 'geekblue',
                    'addon': 'default',
                    'other': 'default'
                };
                return <Tag color={colors[type] || 'default'}>{labels[type] || type}</Tag>;
            }
        },
        {
            title: 'Auto Setup',
            dataIndex: 'auto_setup',
            width: 120,
            render: (v) => v || 'Manual'
        },
        {
            title: 'Kho',
            dataIndex: 'stock_control',
            width: 100,
            render: (stock, record) => stock ? `${record.qty || 0}` : '∞'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'hidden',
            width: 120,
            render: (hidden) => (
                <Tag color={hidden ? 'red' : 'green'}>
                    {hidden ? 'Ẩn' : 'Hiển thị'}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        size="small"
                    />
                    <Popconfirm
                        title="Bạn có chắc muốn xóa?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
                <Space>
                    <Input
                        placeholder="Tìm kiếm sản phẩm..."
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onPressEnter={() => fetchData(1)}
                        style={{ width: 250 }}
                    />
                    <Select
                        placeholder="Nhóm sản phẩm"
                        style={{ width: 180 }}
                        allowClear
                        value={groupFilter}
                        onChange={(v) => setGroupFilter(v)}
                    >
                        <Option value="">Tất cả nhóm</Option>
                        {groups.map(g => (
                            <Option key={g.id} value={g.id}>{g.name}</Option>
                        ))}
                    </Select>
                    <Select
                        placeholder="Loại sản phẩm"
                        style={{ width: 180 }}
                        allowClear
                        value={typeFilter}
                        onChange={(v) => setTypeFilter(v)}
                    >
                        <Option value="">Tất cả loại</Option>
                        <Option value="shared-hosting">Shared Hosting</Option>
                        <Option value="vps-hosting">VPS Hosting</Option>
                        <Option value="dedicated-server">Dedicated Server</Option>
                        <Option value="domain">Domain Registration</Option>
                        <Option value="ssl">SSL Certificate</Option>
                        <Option value="email">Email Hosting</Option>
                        <Option value="reseller">Reseller Hosting</Option>
                        <Option value="addon">Addon/Service</Option>
                        <Option value="other">Khác</Option>
                    </Select>
                    <Button type="primary" onClick={() => fetchData(1)}>Tìm kiếm</Button>
                </Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm sản phẩm
                </Button>
            </Space>

            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={pagination}
                onChange={(p) => fetchData(p.current)}
                rowKey="id"
                scroll={{ x: 1200 }}
            />

            {/* Add/Edit Modal */}
            <Modal
                title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="group_id" label="Nhóm sản phẩm" rules={[{ required: true }]}>
                                <Select>
                                    {groups.map(g => (
                                        <Option key={g.id} value={g.id}>{g.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="type" label="Loại sản phẩm" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="hosting">Hosting</Option>
                                    <Option value="reseller">Reseller</Option>
                                    <Option value="server">Server</Option>
                                    <Option value="addon">Addon</Option>
                                    <Option value="other">Khác</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="auto_setup" label="Auto Setup">
                                <Select>
                                    <Option value="">Manual</Option>
                                    <Option value="on">Ngay lập tức</Option>
                                    <Option value="payment">Khi thanh toán</Option>
                                    <Option value="order">Khi đặt hàng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="description" label="Mô tả">
                        <TextArea rows={4} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="stock_control" label="Kiểm soát kho" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="qty" label="Số lượng">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="hidden" label="Ẩn sản phẩm" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="order" label="Thứ tự" initialValue={0}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                            <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductList;
