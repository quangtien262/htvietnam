import React, { useState, useEffect } from 'react';
import {
    Modal, Form, Input, InputNumber, Radio, Space, Divider, Button, Tag, Alert,
    Tabs, Row, Col, Statistic, message, Select
} from 'antd';
import {
    DollarOutlined, CreditCardOutlined, WalletOutlined, QrcodeOutlined,
    PercentageOutlined, GiftOutlined, StarOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { TextArea } = Input;

interface PaymentModalProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: (paymentData: any) => void;
    total: number;
    customer: any;
    cart: any[];
    discount: number;
    discountType: 'percent' | 'fixed';
    pointsUsed: number;
    tip: number;
    voucher: any;
    onDiscountChange: (value: number) => void;
    onDiscountTypeChange: (type: 'percent' | 'fixed') => void;
    onPointsChange: (value: number) => void;
    onTipChange: (value: number) => void;
    onVoucherApply: (code: string) => void;
    onVoucherRemove: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    visible,
    onCancel,
    onConfirm,
    total,
    customer,
    cart,
    discount,
    discountType,
    pointsUsed,
    tip,
    voucher,
    onDiscountChange,
    onDiscountTypeChange,
    onPointsChange,
    onTipChange,
    onVoucherApply,
    onVoucherRemove,
}) => {
    const [form] = Form.useForm();
    const [paymentMethod, setPaymentMethod] = useState<'tien_mat' | 'chuyen_khoan' | 'the' | 'ket_hop'>('tien_mat');
    const [tienMat, setTienMat] = useState(0);
    const [chuyenKhoan, setChuyenKhoan] = useState(0);
    const [the, setThe] = useState(0);
    const [voucherInput, setVoucherInput] = useState('');

    useEffect(() => {
        if (visible) {
            setTienMat(total);
            setChuyenKhoan(0);
            setThe(0);
            form.setFieldsValue({
                payment_method: 'tien_mat',
                tien_mat: total,
            });
        }
    }, [visible, total]);

    const handlePaymentMethodChange = (method: string) => {
        setPaymentMethod(method as any);

        if (method === 'tien_mat') {
            setTienMat(total);
            setChuyenKhoan(0);
            setThe(0);
        } else if (method === 'chuyen_khoan') {
            setTienMat(0);
            setChuyenKhoan(total);
            setThe(0);
        } else if (method === 'the') {
            setTienMat(0);
            setChuyenKhoan(0);
            setThe(total);
        } else {
            // Reset for combined payment
            setTienMat(0);
            setChuyenKhoan(0);
            setThe(0);
        }
    };

    const calculateChange = () => {
        const paid = tienMat + chuyenKhoan + the;
        return paid - total;
    };

    const handleConfirm = async () => {
        try {
            await form.validateFields();

            const paid = tienMat + chuyenKhoan + the;
            if (paid < total) {
                message.error('Số tiền thanh toán không đủ');
                return;
            }

            const paymentData = {
                payment_methods: paymentMethod,
                tien_mat: tienMat,
                chuyen_khoan: chuyenKhoan,
                the: the,
                tien_thua: calculateChange(),
                ghi_chu: form.getFieldValue('ghi_chu'),
            };

            onConfirm(paymentData);
        } catch (error) {
            console.error('Form validation error:', error);
        }
    };

    const quickTipButtons = [10000, 20000, 50000, 100000];
    const maxPoints = customer?.diem_tich_luy || 0;

    return (
        <Modal
            title="Thanh toán"
            open={visible}
            onCancel={onCancel}
            onOk={handleConfirm}
            width={800}
            okText="Xác nhận thanh toán"
            cancelText="Hủy"
        >
            <Tabs defaultActiveKey="payment">
                <TabPane tab="Thanh toán" key="payment">
                    <Form form={form} layout="vertical">
                        {/* Payment Method Selection */}
                        <Form.Item name="payment_method" label="Phương thức thanh toán">
                            <Radio.Group onChange={(e) => handlePaymentMethodChange(e.target.value)} value={paymentMethod}>
                                <Space direction="vertical">
                                    <Radio value="tien_mat">
                                        <WalletOutlined /> Tiền mặt
                                    </Radio>
                                    <Radio value="chuyen_khoan">
                                        <QrcodeOutlined /> Chuyển khoản
                                    </Radio>
                                    <Radio value="the">
                                        <CreditCardOutlined /> Quẹt thẻ
                                    </Radio>
                                    <Radio value="ket_hop">
                                        <DollarOutlined /> Kết hợp
                                    </Radio>
                                </Space>
                            </Radio.Group>
                        </Form.Item>

                        <Divider />

                        {/* Amount Inputs */}
                        <Row gutter={16}>
                            {(paymentMethod === 'tien_mat' || paymentMethod === 'ket_hop') && (
                                <Col span={paymentMethod === 'ket_hop' ? 8 : 24}>
                                    <Form.Item label="Tiền mặt" name="tien_mat">
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            value={tienMat}
                                            onChange={(value) => setTienMat(value || 0)}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                            suffix="VNĐ"
                                        />
                                    </Form.Item>
                                </Col>
                            )}

                            {(paymentMethod === 'chuyen_khoan' || paymentMethod === 'ket_hop') && (
                                <Col span={paymentMethod === 'ket_hop' ? 8 : 24}>
                                    <Form.Item label="Chuyển khoản" name="chuyen_khoan">
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            value={chuyenKhoan}
                                            onChange={(value) => setChuyenKhoan(value || 0)}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                            suffix="VNĐ"
                                        />
                                    </Form.Item>
                                </Col>
                            )}

                            {(paymentMethod === 'the' || paymentMethod === 'ket_hop') && (
                                <Col span={paymentMethod === 'ket_hop' ? 8 : 24}>
                                    <Form.Item label="Quẹt thẻ" name="the">
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            value={the}
                                            onChange={(value) => setThe(value || 0)}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                            suffix="VNĐ"
                                        />
                                    </Form.Item>
                                </Col>
                            )}
                        </Row>

                        {/* Change Calculation */}
                        <Alert
                            message={
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Statistic
                                            title="Tổng tiền"
                                            value={total}
                                            suffix="VNĐ"
                                            valueStyle={{ color: '#1890ff', fontSize: 20 }}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="Tiền thừa"
                                            value={calculateChange()}
                                            suffix="VNĐ"
                                            valueStyle={{
                                                color: calculateChange() >= 0 ? '#52c41a' : '#f5222d',
                                                fontSize: 20
                                            }}
                                        />
                                    </Col>
                                </Row>
                            }
                            type={calculateChange() >= 0 ? 'success' : 'error'}
                            style={{ marginBottom: 16 }}
                        />

                        {/* Note */}
                        <Form.Item name="ghi_chu" label="Ghi chú">
                            <TextArea rows={2} placeholder="Ghi chú thêm..." />
                        </Form.Item>
                    </Form>
                </TabPane>

                <TabPane tab="Giảm giá & Ưu đãi" key="discount">
                    <Space direction="vertical" style={{ width: '100%' }} size={16}>
                        {/* Manual Discount */}
                        <div>
                            <h4><PercentageOutlined /> Giảm giá thủ công</h4>
                            <Space>
                                <Radio.Group value={discountType} onChange={(e) => onDiscountTypeChange(e.target.value)}>
                                    <Radio value="percent">%</Radio>
                                    <Radio value="fixed">VNĐ</Radio>
                                </Radio.Group>
                                <InputNumber
                                    style={{ width: 200 }}
                                    value={discount}
                                    onChange={(value) => onDiscountChange(value || 0)}
                                    min={0}
                                    max={discountType === 'percent' ? 100 : undefined}
                                    suffix={discountType === 'percent' ? '%' : 'VNĐ'}
                                />
                            </Space>
                        </div>

                        <Divider />

                        {/* Voucher */}
                        <div>
                            <h4><GiftOutlined /> Mã giảm giá / Voucher</h4>
                            {voucher ? (
                                <Alert
                                    message={`Voucher: ${voucher.ma_voucher}`}
                                    description={`Giảm ${voucher.gia_tri_giam}${voucher.loai_giam === 'percent' ? '%' : ' VNĐ'}`}
                                    type="success"
                                    closable
                                    onClose={onVoucherRemove}
                                />
                            ) : (
                                <Space.Compact style={{ width: '100%' }}>
                                    <Input
                                        placeholder="Nhập mã voucher"
                                        value={voucherInput}
                                        onChange={(e) => setVoucherInput(e.target.value)}
                                    />
                                    <Button
                                        type="primary"
                                        onClick={() => {
                                            if (voucherInput) {
                                                onVoucherApply(voucherInput);
                                                setVoucherInput('');
                                            }
                                        }}
                                    >
                                        Áp dụng
                                    </Button>
                                </Space.Compact>
                            )}
                        </div>

                        <Divider />

                        {/* Points */}
                        {customer && (
                            <div>
                                <h4><StarOutlined /> Điểm tích lũy</h4>
                                <p>Điểm hiện tại: <strong>{maxPoints}</strong> điểm (1 điểm = 10,000 VNĐ)</p>
                                <Space>
                                    <span>Sử dụng:</span>
                                    <InputNumber
                                        min={0}
                                        max={maxPoints}
                                        value={pointsUsed}
                                        onChange={(value) => onPointsChange(value || 0)}
                                        style={{ width: 120 }}
                                        suffix="điểm"
                                    />
                                    <Button size="small" onClick={() => onPointsChange(maxPoints)}>
                                        Dùng tối đa
                                    </Button>
                                </Space>
                                {pointsUsed > 0 && (
                                    <Alert
                                        message={`Giảm ${(pointsUsed * 10000).toLocaleString()} VNĐ`}
                                        type="info"
                                        style={{ marginTop: 8 }}
                                    />
                                )}
                            </div>
                        )}

                        <Divider />

                        {/* Tip */}
                        <div>
                            <h4><DollarOutlined /> Tiền tip</h4>
                            <Space wrap>
                                {quickTipButtons.map((amount) => (
                                    <Button
                                        key={amount}
                                        type={tip === amount ? 'primary' : 'default'}
                                        onClick={() => onTipChange(amount)}
                                    >
                                        +{amount.toLocaleString()}
                                    </Button>
                                ))}
                                <InputNumber
                                    value={tip}
                                    onChange={(value) => onTipChange(value || 0)}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                    suffix="VNĐ"
                                    style={{ width: 150 }}
                                />
                                {tip > 0 && (
                                    <Button size="small" onClick={() => onTipChange(0)}>
                                        Xóa
                                    </Button>
                                )}
                            </Space>
                        </div>
                    </Space>
                </TabPane>

                <TabPane tab="Tóm tắt đơn hàng" key="summary">
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {customer && (
                            <Alert
                                message="Thông tin khách hàng"
                                description={
                                    <div>
                                        <p><strong>{customer.ho_ten}</strong></p>
                                        <p>{customer.so_dien_thoai}</p>
                                        {customer.membershipCard && (
                                            <Tag color="gold">
                                                {customer.membershipCard.tier.ten_cap_bac}
                                            </Tag>
                                        )}
                                    </div>
                                }
                                type="info"
                            />
                        )}

                        <div>
                            <h4>Danh sách sản phẩm/dịch vụ ({cart.length})</h4>
                            {cart.map((item, index) => (
                                <div key={item.key} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>
                                            {index + 1}. {item.name} x{item.quantity}
                                        </span>
                                        <strong>{(item.price * item.quantity).toLocaleString()} VNĐ</strong>
                                    </div>
                                    {item.ktv_name && (
                                        <div style={{ fontSize: 12, color: '#666', marginLeft: 20 }}>
                                            KTV: {item.ktv_name}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Space>
                </TabPane>
            </Tabs>
        </Modal>
    );
};

export default PaymentModal;
