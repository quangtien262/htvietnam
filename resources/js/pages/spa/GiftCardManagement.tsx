import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Select, Space, message, Tag, Popconfirm, Card, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GiftOutlined, TagOutlined, DollarOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import API from '@/common/api';

const { TextArea } = Input;
const { Option } = Select;

interface GiftCard {
    id: number;
    ma_the: string;
    ten_the: string;
    menh_gia: number;
    gia_ban: number;
    ti_le_thuong: number;
    ngay_het_han: string | null;
    trang_thai: 'active' | 'inactive';
    mo_ta: string | null;
    ma_code: string | null;
    so_luong_code: number;
    so_luong_da_dung: number;
    code_het_han: string | null;
    so_tien_nap?: number;
    is_expired?: boolean;
}

const GiftCardManagement: React.FC = () => {
    const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCard, setEditingCard] = useState<GiftCard | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchGiftCards();
    }, []);

    const fetchGiftCards = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API.spaGiftCardList);
            // Ensure response.data is always an array
            const data = Array.isArray(response.data) ? response.data : [];
            setGiftCards(data);
        } catch (error) {
            message.error('Không thể tải danh sách thẻ giá trị');
            console.error(error);
            setGiftCards([]); // Reset to empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingCard(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (card: GiftCard) => {
        setEditingCard(card);
        form.setFieldsValue({
            ...card,
            ngay_het_han: card.ngay_het_han ? dayjs(card.ngay_het_han) : null,
            code_het_han: card.code_het_han ? dayjs(card.code_het_han) : null,
        });
        setModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(API.spaGiftCardDelete(id));
            message.success('Xóa thẻ giá trị thành công');
            fetchGiftCards();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể xóa thẻ giá trị');
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            const data = {
                ...values,
                ngay_het_han: values.ngay_het_han ? values.ngay_het_han.format('YYYY-MM-DD') : null,
                code_het_han: values.code_het_han ? values.code_het_han.format('YYYY-MM-DD') : null,
            };

            if (editingCard) {
                await axios.put(API.spaGiftCardUpdate(editingCard.id), data);
                message.success('Cập nhật thẻ giá trị thành công');
            } else {
                await axios.post(API.spaGiftCardCreate, data);
                message.success('Tạo thẻ giá trị thành công');
            }

            setModalVisible(false);
            fetchGiftCards();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const calculateBonusAmount = (menh_gia: number, ti_le_thuong: number) => {
        return menh_gia * (ti_le_thuong / 100);
    };

    const columns = [
        {
            title: 'Mã thẻ',
            dataIndex: 'ma_the',
            key: 'ma_the',
            width: 120,
            render: (text: string) => <Tag color="gold" icon={<GiftOutlined />}>{text}</Tag>,
        },
        {
            title: 'Tên thẻ',
            dataIndex: 'ten_the',
            key: 'ten_the',
            width: 200,
        },
        {
            title: 'Mệnh giá',
            dataIndex: 'menh_gia',
            key: 'menh_gia',
            width: 130,
            render: (value: number) => formatCurrency(value),
        },
        {
            title: 'Giá bán',
            dataIndex: 'gia_ban',
            key: 'gia_ban',
            width: 130,
            render: (value: number) => formatCurrency(value),
        },
        {
            title: 'Khuyến mãi',
            key: 'promotion',
            width: 150,
            render: (_: any, record: GiftCard) => {
                if (record.ti_le_thuong > 0) {
                    const bonus = calculateBonusAmount(record.menh_gia, record.ti_le_thuong);
                    return (
                        <Space direction="vertical" size={0}>
                            <Tag color="green">+{record.ti_le_thuong}%</Tag>
                            <span style={{ fontSize: '12px', color: '#888' }}>
                                Nạp: {formatCurrency(record.menh_gia + bonus)}
                            </span>
                        </Space>
                    );
                }
                return <Tag>Không KM</Tag>;
            },
        },
        {
            title: 'Mã Code',
            key: 'code',
            width: 150,
            render: (_: any, record: GiftCard) => {
                if (record.ma_code) {
                    const remaining = record.so_luong_code > 0
                        ? record.so_luong_code - record.so_luong_da_dung
                        : '∞';
                    return (
                        <Space direction="vertical" size={0}>
                            <Tag color="blue" icon={<TagOutlined />}>{record.ma_code}</Tag>
                            <span style={{ fontSize: '11px', color: '#666' }}>
                                Còn: {remaining} / {record.so_luong_code || '∞'}
                            </span>
                        </Space>
                    );
                }
                return <Tag color="default">Không có</Tag>;
            },
        },
        {
            title: 'Hạn sử dụng',
            key: 'expiry',
            width: 120,
            render: (_: any, record: GiftCard) => {
                if (record.ngay_het_han) {
                    const isExpired = dayjs(record.ngay_het_han).isBefore(dayjs());
                    return (
                        <Tag color={isExpired ? 'red' : 'green'}>
                            {dayjs(record.ngay_het_han).format('DD/MM/YYYY')}
                        </Tag>
                    );
                }
                return <Tag color="default">Không giới hạn</Tag>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            width: 100,
            render: (status: string) => (
                <Tag color={status === 'active' ? 'success' : 'default'}>
                    {status === 'active' ? 'Hoạt động' : 'Ngừng'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            fixed: 'right' as const,
            render: (_: any, record: GiftCard) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa?"
                        description="Bạn có chắc muốn xóa thẻ này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Calculate statistics
    const stats = {
        total: giftCards.length,
        active: giftCards.filter(c => c.trang_thai === 'active').length,
        withPromo: giftCards.filter(c => c.ti_le_thuong > 0).length,
        withCode: giftCards.filter(c => c.ma_code).length,
    };

    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng số thẻ"
                            value={stats.total}
                            prefix={<GiftOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đang hoạt động"
                            value={stats.active}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Có khuyến mãi"
                            value={stats.withPromo}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Có mã code"
                            value={stats.withCode}
                            prefix={<TagOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title="Quản lý Thẻ Giá Trị"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm thẻ mới
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={giftCards}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1200 }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} thẻ`,
                    }}
                />
            </Card>

            <Modal
                title={editingCard ? 'Sửa thẻ giá trị' : 'Thêm thẻ giá trị'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                width={800}
                okText={editingCard ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        trang_thai: 'active',
                        ti_le_thuong: 0,
                        so_luong_code: 0,
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Tên thẻ"
                                name="ten_the"
                                rules={[{ required: true, message: 'Vui lòng nhập tên thẻ' }]}
                            >
                                <Input placeholder="VD: Thẻ nạp 500K" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Trạng thái"
                                name="trang_thai"
                                rules={[{ required: true }]}
                            >
                                <Select>
                                    <Option value="active">Hoạt động</Option>
                                    <Option value="inactive">Ngừng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                label="Mệnh giá"
                                name="menh_gia"
                                rules={[{ required: true, message: 'Vui lòng nhập mệnh giá' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                    placeholder="500000"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Giá bán"
                                name="gia_ban"
                                rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                    placeholder="500000"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Tỷ lệ thưởng (%)"
                                name="ti_le_thuong"
                                tooltip="Khách mua thẻ 1 triệu, tỷ lệ 10% sẽ được nạp 1.1 triệu vào ví"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={100}
                                    placeholder="10"
                                    addonAfter="%"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Ngày hết hạn thẻ"
                                name="ngay_het_han"
                                tooltip="Để trống nếu thẻ không có hạn"
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Mô tả"
                                name="mo_ta"
                            >
                                <TextArea rows={1} placeholder="Mô tả ngắn về thẻ" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Card title="Cấu hình mã code (tùy chọn)" size="small" style={{ marginTop: 16 }}>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    label="Mã code"
                                    name="ma_code"
                                    tooltip="Mã để khách nhập vào POS (VD: NEWCUSTOMER, SALE50)"
                                >
                                    <Input placeholder="NEWCUSTOMER" maxLength={50} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Số lượng code"
                                    name="so_luong_code"
                                    tooltip="0 = không giới hạn"
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={0}
                                        placeholder="0 = không giới hạn"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Hạn code"
                                    name="code_het_han"
                                >
                                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                </Form>
            </Modal>
        </div>
    );
};

export default GiftCardManagement;
