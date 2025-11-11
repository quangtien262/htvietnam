import React, { useState, useEffect } from 'react';
import {
    Drawer, Input, List, Avatar, Space, Tag, Button, Empty, Spin, Form, Modal,
    Row, Col, DatePicker, Radio, Divider
} from 'antd';
import {
    UserOutlined, SearchOutlined, PhoneOutlined, CrownOutlined,
    StarOutlined, PlusOutlined, CloseOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;

interface Customer {
    id: number;
    ma_khach_hang: string;
    ho_ten: string;
    so_dien_thoai: string;
    email?: string;
    avatar?: string;
    diem_tich_luy: number;
    tong_chi_tieu: number;
    membershipCard?: {
        tier: {
            ten_cap_bac: string;
            ti_le_giam_gia: number;
            ti_le_tich_diem: number;
            mau_the: string;
        };
    };
}

interface CustomerSelectorProps {
    visible?: boolean;
    customer?: Customer | null;
    onClose?: () => void;
    onSelect?: (customer: Customer) => void;
    onRemove?: () => void;
    onOpen?: () => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
    visible,
    customer,
    onClose,
    onSelect,
    onRemove,
    onOpen
}) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [newCustomerModalVisible, setNewCustomerModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            loadCustomers();
        }
    }, [visible]);

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/aio/api/admin/spa/customers/list', {
                limit: 100,
                trang_thai: 'active',
            });
            if (response.data.success) {
                setCustomers(response.data.data.data || []);
            }
        } catch (error) {
            console.error('Load customers error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCustomer = async (values: any) => {
        try {
            const response = await axios.post('/aio/api/admin/spa/customers/create-or-update', values);
            if (response.data.success) {
                const newCustomer = response.data.data;
                setCustomers([newCustomer, ...customers]);
                if (onSelect) onSelect(newCustomer);
                setNewCustomerModalVisible(false);
                form.resetFields();
            }
        } catch (error) {
            console.error('Create customer error:', error);
        }
    };

    const filteredCustomers = customers.filter(c => {
        if (!searchText) return true;
        const search = searchText.toLowerCase();
        return (
            c.ho_ten?.toLowerCase().includes(search) ||
            c.so_dien_thoai?.toLowerCase().includes(search) ||
            c.ma_khach_hang?.toLowerCase().includes(search)
        );
    });

    // If used inline (not drawer mode)
    if (customer && !visible) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Space onClick={onOpen} style={{ cursor: 'pointer', flex: 1 }}>
                    <Avatar src={customer.avatar} icon={<UserOutlined />} />
                    <div>
                        <div>
                            <strong>{customer.ho_ten}</strong>
                            {customer.membershipCard && (
                                <Tag color="gold" style={{ marginLeft: 8 }}>
                                    <CrownOutlined /> {customer.membershipCard.tier.ten_cap_bac}
                                </Tag>
                            )}
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                            <PhoneOutlined /> {customer.so_dien_thoai} | Điểm: {customer.diem_tich_luy}
                        </div>
                    </div>
                </Space>
                {onRemove && (
                    <Button
                        type="text"
                        danger
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={onRemove}
                    />
                )}
            </div>
        );
    }

    // Drawer mode
    return (
        <>
            <Drawer
                title="Chọn khách hàng"
                placement="right"
                onClose={onClose}
                open={visible}
                width={450}
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setNewCustomerModalVisible(true)}
                    >
                        Tạo mới
                    </Button>
                }
            >
                <Input.Search
                    placeholder="Tìm theo tên, SĐT, mã KH..."
                    size="large"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    prefix={<SearchOutlined />}
                    allowClear
                    style={{ marginBottom: 16 }}
                />

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 50 }}>
                        <Spin size="large" />
                    </div>
                ) : filteredCustomers.length > 0 ? (
                    <List
                        dataSource={filteredCustomers}
                        renderItem={(customer) => (
                            <List.Item
                                style={{ cursor: 'pointer', padding: '12px 8px' }}
                                onClick={() => onSelect && onSelect(customer)}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar src={customer.avatar} icon={<UserOutlined />} size={48} />}
                                    title={
                                        <Space>
                                            <span>{customer.ho_ten}</span>
                                            {customer.membershipCard && (
                                                <Tag color="gold" size="small">
                                                    <CrownOutlined /> {customer.membershipCard.tier.ten_cap_bac}
                                                </Tag>
                                            )}
                                        </Space>
                                    }
                                    description={
                                        <div>
                                            <div><PhoneOutlined /> {customer.so_dien_thoai}</div>
                                            <div style={{ fontSize: 12 }}>
                                                <span>Mã: {customer.ma_khach_hang}</span>
                                                <Divider type="vertical" />
                                                <span><StarOutlined /> Điểm: {customer.diem_tich_luy}</span>
                                                <Divider type="vertical" />
                                                <span>Chi tiêu: {customer.tong_chi_tieu.toLocaleString()} VNĐ</span>
                                            </div>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty description="Không tìm thấy khách hàng" />
                )}
            </Drawer>

            {/* New Customer Modal */}
            <Modal
                title="Tạo khách hàng mới"
                open={newCustomerModalVisible}
                onCancel={() => {
                    setNewCustomerModalVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleCreateCustomer}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="ho_ten"
                                label="Họ tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                            >
                                <Input prefix={<UserOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="so_dien_thoai"
                                label="Số điện thoại"
                                rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
                            >
                                <Input prefix={<PhoneOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="email" label="Email">
                                <Input type="email" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="gioi_tinh" label="Giới tính">
                                <Radio.Group>
                                    <Radio value="Nam">Nam</Radio>
                                    <Radio value="Nữ">Nữ</Radio>
                                    <Radio value="Khác">Khác</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="dia_chi" label="Địa chỉ">
                                <TextArea rows={2} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="nguon_khach" label="Nguồn khách">
                                <Radio.Group>
                                    <Radio value="walk_in">Walk-in</Radio>
                                    <Radio value="referral">Giới thiệu</Radio>
                                    <Radio value="online">Online</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    );
};

export default CustomerSelector;
