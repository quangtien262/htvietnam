import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, Row, Col, Select, Popconfirm, message, Drawer } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { callApi } from '@/function/api';
import API from '@/common/api';

const { Option } = Select;

const ClientList = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingClient, setEditingClient] = useState<any>(null);
    const [detailDrawer, setDetailDrawer] = useState({ visible: false, client: null });
    const [form] = Form.useForm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const res = await callApi(API.whmcs_clientsList, {
                perPage: pagination.pageSize,
                page,
                search,
                status: statusFilter
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

    const handleAdd = () => {
        setEditingClient(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingClient(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const res = await callApi(API.whmcs_clientsDelete(id), {});
            if (res?.success) {
                message.success('Xóa khách hàng thành công');
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
            const apiUrl = editingClient
                ? API.whmcs_clientsUpdate(editingClient.id)
                : API.whmcs_clientsAdd;

            const res = await callApi(apiUrl, values);
            if (res?.success) {
                message.success(editingClient ? 'Cập nhật thành công' : 'Thêm khách hàng thành công');
                setIsModalVisible(false);
                fetchData(pagination.current);
            } else {
                message.error(res?.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    const viewDetail = async (client) => {
        const res = await callApi(API.whmcs_clientsDetail(client.id), {});
        if (res?.success) {
            setDetailDrawer({ visible: true, client: res.data });
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 80,
            sorter: true
        },
        {
            title: 'Họ tên',
            render: (_, record) => `${record.firstname} ${record.lastname}`,
            width: 180
        },
        {
            title: 'Email',
            dataIndex: 'email',
            width: 200
        },
        {
            title: 'Công ty',
            dataIndex: 'company',
            width: 150
        },
        {
            title: 'Điện thoại',
            dataIndex: 'phone',
            width: 120
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 120,
            render: (status) => {
                const colors = { Active: 'green', Inactive: 'orange', Closed: 'red' };
                return <Tag color={colors[status]}>{status}</Tag>;
            }
        },
        {
            title: 'Credit',
            dataIndex: 'credit',
            width: 120,
            render: (v) => v?.toLocaleString() + ' VNĐ'
        },
        {
            title: 'Hành động',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => viewDetail(record)}
                        size="small"
                    />
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
                        placeholder="Tìm kiếm theo tên, email..."
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onPressEnter={() => fetchData(1)}
                        style={{ width: 300 }}
                    />
                    <Select
                        placeholder="Trạng thái"
                        style={{ width: 150 }}
                        allowClear
                        value={statusFilter}
                        onChange={(v) => { setStatusFilter(v); }}
                    >
                        <Option value="">Tất cả</Option>
                        <Option value="Active">Active</Option>
                        <Option value="Inactive">Inactive</Option>
                        <Option value="Closed">Closed</Option>
                    </Select>
                    <Button type="primary" onClick={() => fetchData(1)}>Tìm kiếm</Button>
                </Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm khách hàng
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
                title={editingClient ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng mới'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="firstname" label="Họ" rules={[{ required: true, message: 'Vui lòng nhập họ' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="lastname" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="company" label="Công ty">
                        <Input />
                    </Form.Item>

                    <Form.Item name="address1" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
                        <Input />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="city" label="Thành phố" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="postcode" label="Mã bưu điện">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="country" label="Quốc gia" rules={[{ required: true }]} initialValue="VN">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    {!editingClient && (
                        <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}>
                            <Input.Password />
                        </Form.Item>
                    )}

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="currency_id" label="Tiền tệ" initialValue={1}>
                                <Select>
                                    <Option value={1}>VND</Option>
                                    <Option value={2}>USD</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="status" label="Trạng thái" initialValue="Active">
                                <Select>
                                    <Option value="Active">Active</Option>
                                    <Option value="Inactive">Inactive</Option>
                                    <Option value="Closed">Closed</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingClient ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                            <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Detail Drawer */}
            <Drawer
                title="Chi tiết khách hàng"
                placement="right"
                width={600}
                open={detailDrawer.visible}
                onClose={() => setDetailDrawer({ visible: false, client: null })}
            >
                {detailDrawer.client && (
                    <ClientDetail client={detailDrawer.client} />
                )}
            </Drawer>
        </div>
    );
};

const ClientDetail = ({ client }) => {
    return (
        <div>
            <h3>Thông tin cơ bản</h3>
            <p><strong>Họ tên:</strong> {client.firstname} {client.lastname}</p>
            <p><strong>Email:</strong> {client.email}</p>
            <p><strong>Công ty:</strong> {client.company}</p>
            <p><strong>Điện thoại:</strong> {client.phone}</p>
            <p><strong>Địa chỉ:</strong> {client.address1}</p>
            <p><strong>Trạng thái:</strong> <Tag color={client.status === 'Active' ? 'green' : 'red'}>{client.status}</Tag></p>
            <p><strong>Credit:</strong> {client.credit?.toLocaleString()} VNĐ</p>

            <h3 style={{ marginTop: 24 }}>Dịch vụ ({client.services?.length || 0})</h3>
            {client.services?.map(s => (
                <div key={s.id} style={{ padding: 8, border: '1px solid #f0f0f0', marginBottom: 8 }}>
                    <div><strong>{s.product?.name}</strong></div>
                    <div>Trạng thái: <Tag>{s.status}</Tag></div>
                    <div>Giá: {s.amount?.toLocaleString()} VNĐ / {s.billing_cycle}</div>
                </div>
            ))}

            <h3 style={{ marginTop: 24 }}>Hóa đơn ({client.invoices?.length || 0})</h3>
            {client.invoices?.slice(0, 5).map(inv => (
                <div key={inv.id} style={{ padding: 8, border: '1px solid #f0f0f0', marginBottom: 8 }}>
                    <div><strong>{inv.invoice_number}</strong></div>
                    <div>Tổng: {inv.total?.toLocaleString()} VNĐ</div>
                    <div>Trạng thái: <Tag color={inv.status === 'Paid' ? 'green' : 'red'}>{inv.status}</Tag></div>
                </div>
            ))}
        </div>
    );
};

export default ClientList;
