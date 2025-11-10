import React, { useState } from 'react';
import { Card, Row, Col, Table, Button, InputNumber, Select, Space, Divider, Statistic, message, Modal, Form, Input } from 'antd';
import { PlusOutlined, DeleteOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';

interface CartItem {
    key: string;
    type: 'service' | 'product';
    id: number;
    name: string;
    price: number;
    quantity: number;
    ktv_id?: number;
    ktv_name?: string;
}

const SpaPOSScreen: React.FC = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [discount, setDiscount] = useState(0);
    const [pointsUsed, setPointsUsed] = useState(0);
    const [tip, setTip] = useState(0);
    const [loading, setLoading] = useState(false);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [form] = Form.useForm();

    const addToCart = (item: { id: number; name: string; price: number; type: 'service' | 'product' }) => {
        const newItem: CartItem = {
            key: `${item.type}-${item.id}-${Date.now()}`,
            type: item.type,
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
        };
        setCart([...cart, newItem]);
    };

    const updateQuantity = (key: string, quantity: number) => {
        setCart(cart.map(item => item.key === key ? { ...item, quantity } : item));
    };

    const removeFromCart = (key: string) => {
        setCart(cart.filter(item => item.key !== key));
    };

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const pointDiscount = pointsUsed * 10000; // 1 point = 10,000 VND
        return subtotal - discount - pointDiscount + tip;
    };

    const handlePayment = async () => {
        if (cart.length === 0) {
            message.error('Giỏ hàng trống');
            return;
        }

        setPaymentModalVisible(true);
    };

    const handleConfirmPayment = async () => {
        try {
            const values = await form.validateFields();
            
            const invoiceData = {
                khach_hang_id: selectedCustomer?.id,
                chi_nhanh_id: 1, // Default branch
                chi_tiets: cart.map(item => ({
                    dich_vu_id: item.type === 'service' ? item.id : null,
                    san_pham_id: item.type === 'product' ? item.id : null,
                    ktv_id: item.ktv_id,
                    so_luong: item.quantity,
                })),
                thanh_toan: true,
                phuong_thuc_thanh_toan: values.payment_methods,
                giam_gia: discount,
                diem_su_dung: pointsUsed,
                tien_tip: tip,
                nguoi_ban: 'Admin', // TODO: Get from auth
            };

            const response = await axios.post('/api/admin/spa/pos/invoices', invoiceData);
            
            if (response.data.success) {
                message.success('Thanh toán thành công!');
                // Reset form
                setCart([]);
                setSelectedCustomer(null);
                setDiscount(0);
                setPointsUsed(0);
                setTip(0);
                setPaymentModalVisible(false);
                form.resetFields();
            }
        } catch (error) {
            console.error('Payment error:', error);
            message.error('Lỗi khi thanh toán');
        }
    };

    const cartColumns = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' đ',
        },
        {
            title: 'SL',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (qty: number, record: CartItem) => (
                <InputNumber
                    min={1}
                    value={qty}
                    onChange={(value) => updateQuantity(record.key, value || 1)}
                    style={{ width: 60 }}
                />
            ),
        },
        {
            title: 'Thành tiền',
            key: 'total',
            render: (_: any, record: CartItem) => 
                new Intl.NumberFormat('vi-VN').format(record.price * record.quantity) + ' đ',
        },
        {
            title: '',
            key: 'action',
            render: (_: any, record: CartItem) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeFromCart(record.key)}
                />
            ),
        },
    ];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div style={{ padding: '24px' }}>
            <h1>POS Bán hàng</h1>
            <Row gutter={16}>
                {/* Products & Services List */}
                <Col span={16}>
                    <Card title="Dịch vụ" style={{ marginBottom: 16 }}>
                        <Space wrap>
                            <Button onClick={() => addToCart({ id: 1, name: 'Massage toàn thân 90 phút', price: 500000, type: 'service' })}>
                                Massage toàn thân - 500k
                            </Button>
                            <Button onClick={() => addToCart({ id: 2, name: 'Chăm sóc da mặt 60 phút', price: 300000, type: 'service' })}>
                                Chăm sóc da - 300k
                            </Button>
                            <Button onClick={() => addToCart({ id: 3, name: 'Tắm trắng toàn thân 120 phút', price: 800000, type: 'service' })}>
                                Tắm trắng - 800k
                            </Button>
                        </Space>
                    </Card>

                    <Card title="Sản phẩm">
                        <Space wrap>
                            <Button onClick={() => addToCart({ id: 1, name: 'Kem dưỡng da cao cấp', price: 450000, type: 'product' })}>
                                Kem dưỡng da - 450k
                            </Button>
                            <Button onClick={() => addToCart({ id: 2, name: 'Serum Vitamin C', price: 350000, type: 'product' })}>
                                Serum Vit C - 350k
                            </Button>
                            <Button onClick={() => addToCart({ id: 3, name: 'Mặt nạ collagen', price: 250000, type: 'product' })}>
                                Mặt nạ - 250k
                            </Button>
                        </Space>
                    </Card>
                </Col>

                {/* Cart & Payment */}
                <Col span={8}>
                    <Card title="Hóa đơn" style={{ marginBottom: 16 }}>
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <Select
                                placeholder="Chọn khách hàng"
                                style={{ width: '100%' }}
                                onChange={(value, option: any) => setSelectedCustomer(option.data)}
                                showSearch
                                allowClear
                            >
                                <Select.Option value={1} data={{ id: 1, name: 'Nguyễn Văn A', points: 100 }}>
                                    Nguyễn Văn A - 100 điểm
                                </Select.Option>
                                <Select.Option value={2} data={{ id: 2, name: 'Trần Thị B', points: 250 }}>
                                    Trần Thị B - 250 điểm
                                </Select.Option>
                            </Select>

                            <Table
                                dataSource={cart}
                                columns={cartColumns}
                                pagination={false}
                                size="small"
                            />

                            <Divider />

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span>Tạm tính:</span>
                                    <strong>{formatCurrency(calculateSubtotal())}</strong>
                                </div>

                                <Space direction="vertical" style={{ width: '100%' }} size="small">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Giảm giá:</span>
                                        <InputNumber
                                            value={discount}
                                            onChange={(value) => setDiscount(value || 0)}
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                            style={{ width: 150 }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Dùng điểm ({selectedCustomer?.points || 0}):</span>
                                        <InputNumber
                                            value={pointsUsed}
                                            onChange={(value) => setPointsUsed(value || 0)}
                                            max={selectedCustomer?.points || 0}
                                            style={{ width: 150 }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Tiền tip:</span>
                                        <InputNumber
                                            value={tip}
                                            onChange={(value) => setTip(value || 0)}
                                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                            style={{ width: 150 }}
                                        />
                                    </div>
                                </Space>

                                <Divider />

                                <Statistic
                                    title="Tổng cộng"
                                    value={calculateTotal()}
                                    valueStyle={{ color: '#3f8600', fontSize: 24 }}
                                    prefix={<DollarOutlined />}
                                    formatter={(value) => formatCurrency(Number(value))}
                                />

                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    style={{ marginTop: 16 }}
                                    onClick={handlePayment}
                                    disabled={cart.length === 0}
                                >
                                    Thanh toán
                                </Button>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Modal
                title="Xác nhận thanh toán"
                visible={paymentModalVisible}
                onOk={handleConfirmPayment}
                onCancel={() => setPaymentModalVisible(false)}
                width={500}
            >
                <Form form={form} layout="vertical">
                    <Statistic
                        title="Tổng tiền thanh toán"
                        value={calculateTotal()}
                        valueStyle={{ color: '#3f8600', fontSize: 28 }}
                        formatter={(value) => formatCurrency(Number(value))}
                        style={{ marginBottom: 24 }}
                    />

                    <Form.Item
                        name="payment_methods"
                        label="Phương thức thanh toán"
                        rules={[{ required: true, message: 'Vui lòng chọn phương thức' }]}
                    >
                        <Select mode="multiple" placeholder="Chọn phương thức">
                            <Select.Option value="tien_mat">Tiền mặt</Select.Option>
                            <Select.Option value="chuyen_khoan">Chuyển khoản</Select.Option>
                            <Select.Option value="the">Thẻ</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SpaPOSScreen;
