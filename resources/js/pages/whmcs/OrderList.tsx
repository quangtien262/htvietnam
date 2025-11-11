import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Tag, Select, Modal, Form, InputNumber, message, Card, Statistic, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { callApi } from '@/function/api';
import API from '@/common/api';
import moment from 'moment';

const { Option } = Select;

const OrderList = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [detailVisible, setDetailVisible] = useState(false);
    const [addVisible, setAddVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [form] = Form.useForm();

    const fetchData = async (page = 1) => {
        setLoading(true);
        const res = await callApi(API.whmcs_ordersList, {
            perPage: pagination.pageSize,
            page,
            search,
            status
        });
        if (res?.success) {
            setData(res.data.data);
            setPagination({ ...pagination, current: page, total: res.data.total });
        }
        setLoading(false);
    };

    const fetchClients = async () => {
        const res = await callApi(API.whmcs_clientsList, { perPage: 1000 });
        if (res?.success) {
            setClients(res.data.data);
        }
    };

    const fetchProducts = async () => {
        const res = await callApi(API.whmcs_productsList, { perPage: 1000 });
        if (res?.success) {
            setProducts(res.data.data);
        }
    };

    useEffect(() => {
        fetchData();
        fetchClients();
        fetchProducts();
    }, []);

    const viewDetail = async (id: number) => {
        const res = await callApi(API.whmcs_ordersDetail(id), {});
        if (res?.success) {
            setSelectedOrder(res.data);
            setDetailVisible(true);
        }
    };

    const handleAdd = async (values: any) => {
        const res = await callApi(API.whmcs_ordersAdd, values);
        if (res?.success) {
            message.success('Tạo đơn hàng thành công');
            setAddVisible(false);
            form.resetFields();
            fetchData();
        } else {
            message.error(res.message || 'Có lỗi xảy ra');
        }
    };

    const updateStatus = async (id: number, newStatus: string) => {
        Modal.confirm({
            title: 'Xác nhận',
            content: `Bạn có chắc muốn ${newStatus === 'Active' ? 'kích hoạt' : 'hủy'} đơn hàng này?`,
            onOk: async () => {
                const res = await callApi(API.whmcs_ordersUpdateStatus(id), { status: newStatus });
                if (res?.success) {
                    message.success('Cập nhật trạng thái thành công');
                    fetchData();
                } else {
                    message.error(res.message || 'Có lỗi xảy ra');
                }
            }
        });
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc muốn xóa đơn hàng này?',
            okText: 'Xóa',
            okType: 'danger',
            onOk: async () => {
                const res = await callApi(API.whmcs_ordersDelete(id), {});
                if (res?.success) {
                    message.success('Xóa đơn hàng thành công');
                    fetchData();
                } else {
                    message.error(res.message || 'Không thể xóa đơn hàng');
                }
            }
        });
    };

    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: 'order_number',
            width: 150,
            fixed: 'left' as const
        },
        {
            title: 'Khách hàng',
            render: (r: any) => r.client ? `${r.client.firstname} ${r.client.lastname}` : '-',
            width: 180
        },
        {
            title: 'Tổng tiền',
            render: (r: any) => `${Number(r.total).toLocaleString()} ${r.currency?.code || 'VND'}`,
            width: 120,
            align: 'right' as const
        },
        {
            title: 'Giảm giá',
            render: (r: any) => `${Number(r.discount).toLocaleString()} ${r.currency?.code || 'VND'}`,
            width: 120,
            align: 'right' as const
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 120,
            render: (status: string) => {
                const colors: any = {
                    'Pending': 'orange',
                    'Active': 'green',
                    'Cancelled': 'red',
                    'Fraud': 'purple'
                };
                return <Tag color={colors[status] || 'default'}>{status}</Tag>;
            }
        },
        {
            title: 'Phương thức TT',
            dataIndex: 'payment_method',
            width: 130
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            width: 150,
            render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Thao tác',
            width: 200,
            fixed: 'right' as const,
            render: (r: any) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => viewDetail(r.id)}
                    >
                        Xem
                    </Button>
                    {r.status === 'Pending' && (
                        <>
                            <Button
                                size="small"
                                type="primary"
                                icon={<CheckOutlined />}
                                onClick={() => updateStatus(r.id, 'Active')}
                            >
                                Duyệt
                            </Button>
                            <Button
                                size="small"
                                danger
                                icon={<CloseOutlined />}
                                onClick={() => updateStatus(r.id, 'Cancelled')}
                            >
                                Hủy
                            </Button>
                        </>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div>
            <h2>Quản lý Đơn hàng</h2>

            <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
                <Space>
                    <Input
                        placeholder="Tìm mã đơn..."
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onPressEnter={() => fetchData(1)}
                        style={{ width: 250 }}
                    />
                    <Select
                        placeholder="Trạng thái"
                        value={status || undefined}
                        onChange={setStatus}
                        style={{ width: 150 }}
                        allowClear
                    >
                        <Option value="Pending">Pending</Option>
                        <Option value="Active">Active</Option>
                        <Option value="Cancelled">Cancelled</Option>
                        <Option value="Fraud">Fraud</Option>
                    </Select>
                    <Button onClick={() => fetchData(1)}>Tìm kiếm</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddVisible(true)}>
                        Tạo đơn hàng
                    </Button>
                </Space>
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

            {/* Modal Chi tiết */}
            <Modal
                title="Chi tiết Đơn hàng"
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                width={800}
                footer={null}
            >
                {selectedOrder && (
                    <div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <p><strong>Mã đơn:</strong> {selectedOrder.order_number}</p>
                                <p><strong>Khách hàng:</strong> {selectedOrder.client?.firstname} {selectedOrder.client?.lastname}</p>
                                <p><strong>Email:</strong> {selectedOrder.client?.email}</p>
                                <p><strong>Trạng thái:</strong> <Tag color={selectedOrder.status === 'Active' ? 'green' : 'orange'}>{selectedOrder.status}</Tag></p>
                            </Col>
                            <Col span={12}>
                                <p><strong>Tổng phụ:</strong> {Number(selectedOrder.subtotal).toLocaleString()} {selectedOrder.currency?.code}</p>
                                <p><strong>Giảm giá:</strong> {Number(selectedOrder.discount).toLocaleString()} {selectedOrder.currency?.code}</p>
                                <p><strong>Tổng tiền:</strong> {Number(selectedOrder.total).toLocaleString()} {selectedOrder.currency?.code}</p>
                                <p><strong>Ngày tạo:</strong> {moment(selectedOrder.created_at).format('DD/MM/YYYY HH:mm')}</p>
                            </Col>
                        </Row>

                        <h4 style={{ marginTop: 20 }}>Chi tiết sản phẩm</h4>
                        <Table
                            dataSource={selectedOrder.items || []}
                            columns={[
                                { title: 'Sản phẩm', render: (r: any) => r.product?.name },
                                { title: 'Chu kỳ', dataIndex: 'billing_cycle' },
                                { title: 'Số lượng', dataIndex: 'quantity', align: 'center' as const },
                                { title: 'Giá', dataIndex: 'amount', render: (v: any) => Number(v).toLocaleString(), align: 'right' as const }
                            ]}
                            pagination={false}
                            rowKey="id"
                            size="small"
                        />

                        {selectedOrder.invoice && (
                            <div style={{ marginTop: 20, padding: 10, background: '#f0f0f0', borderRadius: 4 }}>
                                <p><strong>Hóa đơn:</strong> {selectedOrder.invoice.invoice_number}</p>
                                <p><strong>Trạng thái HĐ:</strong> <Tag color={selectedOrder.invoice.status === 'Paid' ? 'green' : 'red'}>{selectedOrder.invoice.status}</Tag></p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Modal Thêm đơn hàng */}
            <Modal
                title="Tạo đơn hàng mới"
                open={addVisible}
                onCancel={() => {
                    setAddVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleAdd}>
                    <Form.Item name="client_id" label="Khách hàng" rules={[{ required: true }]}>
                        <Select
                            placeholder="Chọn khách hàng"
                            showSearch
                            filterOption={(input, option: any) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {clients.map((c: any) => (
                                <Option key={c.id} value={c.id}>
                                    {c.firstname} {c.lastname} ({c.email})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="currency_id" label="Tiền tệ" rules={[{ required: true }]} initialValue={1}>
                        <Select placeholder="Chọn tiền tệ">
                            <Option value={1}>VND</Option>
                            <Option value={2}>USD</Option>
                        </Select>
                    </Form.Item>

                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map((field, index) => (
                                    <Card
                                        key={field.key}
                                        size="small"
                                        title={`Sản phẩm ${index + 1}`}
                                        extra={<Button size="small" danger onClick={() => remove(field.name)}>Xóa</Button>}
                                        style={{ marginBottom: 10 }}
                                    >
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'product_id']}
                                            label="Sản phẩm"
                                            rules={[{ required: true }]}
                                        >
                                            <Select placeholder="Chọn sản phẩm">
                                                {products.map((p: any) => (
                                                    <Option key={p.id} value={p.id}>{p.name}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'billing_cycle']}
                                            label="Chu kỳ"
                                            rules={[{ required: true }]}
                                        >
                                            <Select placeholder="Chọn chu kỳ">
                                                <Option value="Monthly">Monthly</Option>
                                                <Option value="Quarterly">Quarterly</Option>
                                                <Option value="Semi-Annually">Semi-Annually</Option>
                                                <Option value="Annually">Annually</Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            {...field}
                                            name={[field.name, 'quantity']}
                                            label="Số lượng"
                                            initialValue={1}
                                        >
                                            <InputNumber min={1} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Card>
                                ))}
                                <Button type="dashed" onClick={() => add()} block>
                                    + Thêm sản phẩm
                                </Button>
                            </>
                        )}
                    </Form.List>

                    <Form.Item name="payment_method" label="Phương thức thanh toán">
                        <Select placeholder="Chọn phương thức">
                            <Option value="banktransfer">Chuyển khoản</Option>
                            <Option value="paypal">PayPal</Option>
                            <Option value="stripe">Stripe</Option>
                            <Option value="cash">Tiền mặt</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="promo_code" label="Mã giảm giá">
                        <Input placeholder="Nhập mã giảm giá (nếu có)" />
                    </Form.Item>

                    <Form.Item name="notes" label="Ghi chú">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default OrderList;
