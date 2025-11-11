import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, InputNumber, Modal, Form, Input, Select, message, DatePicker, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined, ShopOutlined, InboxOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs from 'dayjs';

const { Search } = Input;

interface InventoryItem {
    id: number;
    ma_san_pham: string;
    ten_san_pham: string;
    danh_muc_id?: number;
    danh_muc_ten?: string;
    don_vi_tinh: string;
    ton_kho: number;
    ton_kho_toi_thieu: number;
    gia_nhap: number;
    gia_ban: number;
    trang_thai: string;
}

interface InventoryTransaction {
    id: number;
    san_pham_id: number;
    loai: 'nhap' | 'xuat' | 'dieu_chinh';
    so_luong: number;
    gia_nhap?: number;
    nha_cung_cap?: string;
    ly_do?: string;
    nguoi_nhap: string;
    ngay_nhap: string;
    ghi_chu?: string;
}

const InventoryList: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [transactionModalVisible, setTransactionModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categories, setCategories] = useState<any[]>([]);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchInventory();
        fetchCategories();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/spa/products', {
                params: {
                    per_page: 1000,
                    trang_thai: statusFilter === 'all' ? undefined : statusFilter
                }
            });
            setInventoryData(response.data.data || []);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            message.error('Không thể tải dữ liệu kho');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/aio/api/spa/product-categories');
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchTransactions = async (productId: number) => {
        try {
            const response = await axios.get(`/aio/api/spa/inventory/${productId}/transactions`);
            setTransactions(response.data.data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const handleStockAdjustment = async (values: any) => {
        try {
            await axios.post('/aio/api/spa/inventory', {
                san_pham_id: selectedProduct?.id,
                loai: values.loai,
                so_luong: values.so_luong,
                gia_nhap: values.gia_nhap,
                nha_cung_cap: values.nha_cung_cap,
                ly_do: values.ly_do,
                nguoi_nhap: 'Admin', // TODO: Get from auth
                ngay_nhap: values.ngay_nhap?.format('YYYY-MM-DD HH:mm:ss') || dayjs().format('YYYY-MM-DD HH:mm:ss'),
                ghi_chu: values.ghi_chu,
            });
            
            message.success('Cập nhật tồn kho thành công');
            setModalVisible(false);
            form.resetFields();
            fetchInventory();
        } catch (error) {
            console.error('Error updating inventory:', error);
            message.error('Lỗi khi cập nhật tồn kho');
        }
    };

    const showStockModal = (record: InventoryItem) => {
        setSelectedProduct(record);
        setModalVisible(true);
        form.setFieldsValue({
            loai: 'nhap',
            ngay_nhap: dayjs(),
        });
    };

    const showTransactionHistory = (record: InventoryItem) => {
        setSelectedProduct(record);
        fetchTransactions(record.id);
        setTransactionModalVisible(true);
    };

    const getLowStockCount = () => {
        return inventoryData.filter(item => item.ton_kho <= item.ton_kho_toi_thieu).length;
    };

    const getTotalValue = () => {
        return inventoryData.reduce((sum, item) => sum + (item.ton_kho * item.gia_nhap), 0);
    };

    const columns: ColumnsType<InventoryItem> = [
        {
            title: 'Mã SP',
            dataIndex: 'ma_san_pham',
            key: 'ma_san_pham',
            width: 120,
            fixed: 'left',
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'ten_san_pham',
            key: 'ten_san_pham',
            width: 250,
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) =>
                record.ten_san_pham.toLowerCase().includes(String(value).toLowerCase()) ||
                record.ma_san_pham.toLowerCase().includes(String(value).toLowerCase()),
        },
        {
            title: 'Danh mục',
            dataIndex: 'danh_muc_ten',
            key: 'danh_muc_ten',
            width: 150,
            render: (text) => text ? <Tag color="blue">{text}</Tag> : '-',
            filteredValue: categoryFilter ? [categoryFilter] : null,
            onFilter: (value, record) => record.danh_muc_id === value,
        },
        {
            title: 'Tồn kho',
            dataIndex: 'ton_kho',
            key: 'ton_kho',
            width: 100,
            align: 'right',
            render: (ton_kho, record) => {
                const isLowStock = ton_kho <= record.ton_kho_toi_thieu;
                return (
                    <span style={{ color: isLowStock ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>
                        {ton_kho} {record.don_vi_tinh}
                        {isLowStock && <WarningOutlined style={{ marginLeft: 8, color: '#ff4d4f' }} />}
                    </span>
                );
            },
        },
        {
            title: 'Tồn tối thiểu',
            dataIndex: 'ton_kho_toi_thieu',
            key: 'ton_kho_toi_thieu',
            width: 120,
            align: 'right',
            render: (value, record) => `${value} ${record.don_vi_tinh}`,
        },
        {
            title: 'Giá nhập',
            dataIndex: 'gia_nhap',
            key: 'gia_nhap',
            width: 130,
            align: 'right',
            render: (value) => new Intl.NumberFormat('vi-VN').format(value) + ' đ',
        },
        {
            title: 'Giá bán',
            dataIndex: 'gia_ban',
            key: 'gia_ban',
            width: 130,
            align: 'right',
            render: (value) => new Intl.NumberFormat('vi-VN').format(value) + ' đ',
        },
        {
            title: 'Giá trị tồn',
            key: 'gia_tri_ton',
            width: 150,
            align: 'right',
            render: (_, record) => {
                const value = record.ton_kho * record.gia_nhap;
                return <strong>{new Intl.NumberFormat('vi-VN').format(value)} đ</strong>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            width: 120,
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 180,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showStockModal(record)}
                        size="small"
                    >
                        Nhập/Xuất
                    </Button>
                    <Button
                        icon={<InboxOutlined />}
                        onClick={() => showTransactionHistory(record)}
                        size="small"
                    >
                        Lịch sử
                    </Button>
                </Space>
            ),
        },
    ];

    const transactionColumns: ColumnsType<InventoryTransaction> = [
        {
            title: 'Ngày',
            dataIndex: 'ngay_nhap',
            key: 'ngay_nhap',
            width: 150,
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Loại',
            dataIndex: 'loai',
            key: 'loai',
            width: 100,
            render: (loai: 'nhap' | 'xuat' | 'dieu_chinh') => {
                const config: Record<'nhap' | 'xuat' | 'dieu_chinh', { color: string; text: string }> = {
                    nhap: { color: 'green', text: 'Nhập kho' },
                    xuat: { color: 'orange', text: 'Xuất kho' },
                    dieu_chinh: { color: 'blue', text: 'Điều chỉnh' },
                };
                const { color, text } = config[loai] || config.dieu_chinh;
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Số lượng',
            dataIndex: 'so_luong',
            key: 'so_luong',
            width: 100,
            align: 'right',
            render: (value, record) => (
                <span style={{ color: record.loai === 'nhap' ? '#52c41a' : '#ff4d4f' }}>
                    {record.loai === 'nhap' ? '+' : '-'}{value}
                </span>
            ),
        },
        {
            title: 'Giá nhập',
            dataIndex: 'gia_nhap',
            key: 'gia_nhap',
            width: 120,
            align: 'right',
            render: (value) => value ? new Intl.NumberFormat('vi-VN').format(value) + ' đ' : '-',
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'nha_cung_cap',
            key: 'nha_cung_cap',
            width: 150,
        },
        {
            title: 'Người thực hiện',
            dataIndex: 'nguoi_nhap',
            key: 'nguoi_nhap',
            width: 120,
        },
        {
            title: 'Ghi chú',
            dataIndex: 'ghi_chu',
            key: 'ghi_chu',
            width: 200,
            ellipsis: true,
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <h1>Quản lý kho hàng</h1>

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng sản phẩm"
                            value={inventoryData.length}
                            prefix={<ShopOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Cảnh báo tồn thấp"
                            value={getLowStockCount()}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<WarningOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Giá trị tồn kho"
                            value={getTotalValue()}
                            precision={0}
                            formatter={(value) => new Intl.NumberFormat('vi-VN').format(Number(value)) + ' đ'}
                            prefix={<InboxOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Button type="primary" icon={<PlusOutlined />} block size="large">
                            Nhập kho hàng loạt
                        </Button>
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                        <Search
                            placeholder="Tìm kiếm sản phẩm..."
                            allowClear
                            style={{ width: 300 }}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <Select
                            placeholder="Danh mục"
                            allowClear
                            style={{ width: 200 }}
                            value={categoryFilter}
                            onChange={setCategoryFilter}
                        >
                            {categories.map(cat => (
                                <Select.Option key={cat.id} value={cat.id}>
                                    {cat.ten_danh_muc}
                                </Select.Option>
                            ))}
                        </Select>
                        <Select
                            placeholder="Trạng thái"
                            style={{ width: 150 }}
                            value={statusFilter}
                            onChange={(value) => {
                                setStatusFilter(value);
                                fetchInventory();
                            }}
                        >
                            <Select.Option value="all">Tất cả</Select.Option>
                            <Select.Option value="active">Đang bán</Select.Option>
                            <Select.Option value="inactive">Ngừng bán</Select.Option>
                        </Select>
                    </Space>
                    <Button onClick={fetchInventory}>Làm mới</Button>
                </Space>
            </Card>

            {/* Inventory Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={inventoryData}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1500 }}
                    pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} sản phẩm`,
                    }}
                />
            </Card>

            {/* Stock Adjustment Modal */}
            <Modal
                title={`Nhập/Xuất kho: ${selectedProduct?.ten_san_pham}`}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form form={form} onFinish={handleStockAdjustment} layout="vertical">
                    <Form.Item name="loai" label="Loại giao dịch" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="nhap">Nhập kho</Select.Option>
                            <Select.Option value="xuat">Xuất kho</Select.Option>
                            <Select.Option value="dieu_chinh">Điều chỉnh</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="so_luong" label="Số lượng" rules={[{ required: true }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="gia_nhap" label="Giá nhập (cho nhập kho)">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="nha_cung_cap" label="Nhà cung cấp">
                        <Input />
                    </Form.Item>

                    <Form.Item name="ngay_nhap" label="Ngày" rules={[{ required: true }]}>
                        <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="ly_do" label="Lý do">
                        <Input />
                    </Form.Item>

                    <Form.Item name="ghi_chu" label="Ghi chú">
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Xác nhận
                            </Button>
                            <Button onClick={() => setModalVisible(false)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Transaction History Modal */}
            <Modal
                title={`Lịch sử nhập/xuất: ${selectedProduct?.ten_san_pham}`}
                open={transactionModalVisible}
                onCancel={() => setTransactionModalVisible(false)}
                footer={null}
                width={1000}
            >
                <Table
                    columns={transactionColumns}
                    dataSource={transactions}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 800 }}
                />
            </Modal>
        </div>
    );
};

export default InventoryList;
