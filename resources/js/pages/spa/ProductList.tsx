import React, { useState, useEffect } from 'react';
import {
    Card, Table, Button, Space, Input, Select, Tag, Modal, Form, InputNumber,
    message, Popconfirm, Upload, Image, Row, Col, Divider, Drawer, Descriptions,
    Switch, Badge, Alert, Progress, Tooltip, Statistic
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, SkinOutlined,
    UploadOutlined, EyeOutlined, DollarOutlined, AppstoreOutlined, BarsOutlined,
    WarningOutlined, CheckCircleOutlined, StockOutlined, BarChartOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs from 'dayjs';
import { API } from '../../common/api';

const { TextArea } = Input;
const { Option } = Select;

interface Product {
    id: number;
    ma_san_pham: string;
    ten_san_pham: string;
    danh_muc_id?: number;
    danh_muc?: {
        id: number;
        ten_danh_muc: string;
    };
    danh_muc_ten?: string;
    gia_nhap: number;
    gia_ban: number;
    ton_kho: number;
    ton_kho_toi_thieu: number;
    ton_kho_canh_bao?: number;
    don_vi_tinh: string;
    mo_ta?: string;
    mo_ta_ngan?: string;
    hinh_anh?: string;
    hinh_anh_ids?: string;
    trang_thai: string;
    is_active?: boolean;
    xuat_xu?: string;
    thuong_hieu?: string;
    thuong_hieu_id?: number;
    ten_thuong_hieu?: string;
    han_su_dung?: string;
    so_luong_da_ban: number;
    doanh_thu: number;
    created_at: string;
}

interface Category {
    id: number;
    ten_danh_muc: string;
    mo_ta?: string;
}

const ProductList: React.FC = () => {
    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    // Filters
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [stockFilter, setStockFilter] = useState<string | null>(null);

    // Pagination
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Form
    const [form] = Form.useForm();
    const [imageUrl, setImageUrl] = useState<string>('');
    const [uploading, setUploading] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0,
    });

    // Load data
    useEffect(() => {
        loadProducts();
        loadCategories();
    }, [pagination.current, pagination.pageSize, searchText, selectedCategory, selectedStatus, stockFilter]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API.spaProductList, {
                params: {
                    page: pagination.current,
                    per_page: pagination.pageSize,
                    search: searchText || undefined,
                    danh_muc_id: selectedCategory || undefined,
                    is_active: selectedStatus === 'con_hang' ? true : selectedStatus === 'het_hang' ? false : undefined,
                    stock_filter: stockFilter || undefined,
                }
            });

            console.log('Products response:', response.data);

            if (response.data.status_code === 200) {
                const data = response.data.data;
                const productsData = data.data || [];

                setProducts(productsData);
                setPagination({
                    ...pagination,
                    current: data.current_page || pagination.current,
                    total: data.total || 0,
                });

                // Calculate stats from loaded data
                const lowStock = productsData.filter((p: Product) => (p.ton_kho ?? 0) > 0 && (p.ton_kho ?? 0) <= (p.ton_kho_toi_thieu ?? 0)).length;
                const outOfStock = productsData.filter((p: Product) => (p.ton_kho ?? 0) === 0).length;
                const totalValue = productsData.reduce((sum: number, p: Product) => sum + ((p.ton_kho ?? 0) * (p.gia_nhap ?? 0)), 0);

                setStats({
                    total: data.total || 0,
                    lowStock,
                    outOfStock,
                    totalValue,
                });

                console.log('Products loaded:', productsData.length);
            } else {
                message.error(response.data.message || 'Không thể tải danh sách sản phẩm');
            }
        } catch (error: any) {
            console.error('Load products error:', error);
            message.error(error.response?.data?.message || 'Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await axios.get(API.spaProductCategoryList);
            console.log('Categories response:', response.data);

            if (response.data.status_code === 200) {
                const data = response.data.data?.data || response.data.data || [];
                setCategories(Array.isArray(data) ? data : []);
                console.log('Categories loaded:', data.length);
            }
        } catch (error) {
            console.error('Load categories error:', error);
        }
    };

    // Handlers
    const handleCreate = () => {
        form.resetFields();
        setImageUrl('');
        setSelectedProduct(null);
        setModalVisible(true);
    };

    const handleEdit = (record: Product) => {
        setSelectedProduct(record);
        form.setFieldsValue({
            ...record,
            han_su_dung: record.han_su_dung ? dayjs(record.han_su_dung) : null,
        });
        setImageUrl(record.hinh_anh || '');
        setModalVisible(true);
    };

    const handleView = (record: Product) => {
        setSelectedProduct(record);
        setDetailDrawerVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                hinh_anh: imageUrl,
                han_su_dung: values.han_su_dung ? dayjs(values.han_su_dung).format('YYYY-MM-DD') : null,
            };

            let response;
            if (selectedProduct) {
                // Update existing product
                response = await axios.put(API.spaProductUpdate(selectedProduct.id), payload);
            } else {
                // Create new product
                response = await axios.post(API.spaProductCreate, payload);
            }

            console.log('Submit response:', response.data);

            if (response.data.status_code === 200) {
                message.success(selectedProduct ? 'Cập nhật sản phẩm thành công' : 'Tạo sản phẩm mới thành công');
                setModalVisible(false);
                loadProducts();
            } else {
                message.error(response.data.message || 'Có lỗi xảy ra');
            }
        } catch (error: any) {
            console.error('Submit error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await axios.delete(API.spaProductDelete(id));
            console.log('Delete response:', response.data);

            if (response.data.status_code === 200) {
                message.success('Xóa sản phẩm thành công');
                loadProducts();
            } else {
                message.error(response.data.message || 'Không thể xóa sản phẩm');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            message.error(error.response?.data?.message || 'Không thể xóa sản phẩm');
        }
    };

    const handleStatusToggle = async (record: Product) => {
        try {
            const newStatus = !record.is_active;
            const response = await axios.put(API.spaProductUpdate(record.id), {
                is_active: newStatus,
            });

            if (response.data.status_code === 200) {
                message.success('Cập nhật trạng thái thành công');
                loadProducts();
            } else {
                message.error(response.data.message || 'Không thể cập nhật trạng thái');
            }
        } catch (error: any) {
            console.error('Status toggle error:', error);
            message.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
        }
    };

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post('/aio/api/admin/spa/upload-image', formData);
            if (response.data.success) {
                setImageUrl(response.data.data.url);
                message.success('Upload ảnh thành công');
            }
        } catch (error) {
            message.error('Upload ảnh thất bại');
        } finally {
            setUploading(false);
        }
        return false;
    };

    const getStockStatus = (product: Product) => {
        const tonKho = product.ton_kho ?? 0;
        const tonKhoToiThieu = product.ton_kho_toi_thieu ?? 0;

        if (tonKho === 0) {
            return { text: 'Hết hàng', color: 'red', icon: <WarningOutlined /> };
        } else if (tonKho <= tonKhoToiThieu) {
            return { text: 'Sắp hết', color: 'orange', icon: <WarningOutlined /> };
        }
        return { text: 'Còn hàng', color: 'green', icon: <CheckCircleOutlined /> };
    };

    const calculateProfit = (product: Product) => {
        const giaBan = product.gia_ban ?? 0;
        const giaNhap = product.gia_nhap ?? 0;
        return giaBan - giaNhap;
    };

    const calculateProfitMargin = (product: Product) => {
        const giaNhap = product.gia_nhap ?? 0;
        const giaBan = product.gia_ban ?? 0;
        if (giaNhap === 0) return 0;
        return ((giaBan - giaNhap) / giaNhap) * 100;
    };

    // Table columns
    const columns: ColumnsType<Product> = [
        {
            title: 'Mã SP',
            dataIndex: 'ma_san_pham',
            key: 'ma_san_pham',
            width: 100,
            fixed: 'left',
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'hinh_anh',
            key: 'hinh_anh',
            width: 80,
            render: (url: string) => url ? (
                <Image src={url} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
            ) : (
                <div style={{ width: 50, height: 50, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SkinOutlined style={{ fontSize: 20, color: '#999' }} />
                </div>
            ),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'ten_san_pham',
            key: 'ten_san_pham',
            width: 250,
            render: (text: string, record: Product) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{text}</div>
                    {record.danh_muc && (
                        <Tag color="blue">{record.danh_muc.ten_danh_muc}</Tag>
                    )}
                    {record.thuong_hieu && (
                        <Tag color="purple">{record.thuong_hieu}</Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Giá nhập',
            dataIndex: 'gia_nhap',
            key: 'gia_nhap',
            width: 120,
            align: 'right',
            render: (value: number) => `${(value ?? 0).toLocaleString()} VNĐ`,
        },
        {
            title: 'Giá bán',
            dataIndex: 'gia_ban',
            key: 'gia_ban',
            width: 120,
            align: 'right',
            render: (value: number) => (
                <span style={{ fontWeight: 500, color: '#52c41a' }}>
                    {(value ?? 0).toLocaleString()} VNĐ
                </span>
            ),
        },
        {
            title: 'Lợi nhuận',
            key: 'profit',
            width: 120,
            align: 'right',
            render: (_, record) => {
                const profit = calculateProfit(record);
                const margin = calculateProfitMargin(record);
                return (
                    <Tooltip title={`Tỷ suất: ${margin.toFixed(1)}%`}>
                        <span style={{ color: profit > 0 ? '#52c41a' : '#999' }}>
                            {profit.toLocaleString()} VNĐ
                        </span>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Tồn kho',
            dataIndex: 'ton_kho',
            key: 'ton_kho',
            width: 120,
            align: 'center',
            render: (value: number, record: Product) => {
                const status = getStockStatus(record);
                return (
                    <Tooltip title={`Tối thiểu: ${record.ton_kho_toi_thieu ?? 0}`}>
                        <Badge
                            count={value ?? 0}
                            showZero
                            color={status.color}
                            style={{ fontSize: 14 }}
                        />
                    </Tooltip>
                );
            },
            sorter: (a, b) => (a.ton_kho ?? 0) - (b.ton_kho ?? 0),
        },
        {
            title: 'Đã bán',
            dataIndex: 'so_luong_da_ban',
            key: 'so_luong_da_ban',
            width: 100,
            align: 'center',
            render: (value: number) => <Badge count={value ?? 0} showZero color="blue" />,
            sorter: (a, b) => (a.so_luong_da_ban ?? 0) - (b.so_luong_da_ban ?? 0),
        },
        {
            title: 'Doanh thu',
            dataIndex: 'doanh_thu',
            key: 'doanh_thu',
            width: 150,
            align: 'right',
            render: (value: number) => `${(value ?? 0).toLocaleString()} VNĐ`,
            sorter: (a, b) => (a.doanh_thu ?? 0) - (b.doanh_thu ?? 0),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            render: (_, record: Product) => {
                const status = getStockStatus(record);
                return (
                    <Tag color={status.color} icon={status.icon}>
                        {status.text}
                    </Tag>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    >
                        Xem
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa sản phẩm này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button
                            type="link"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Grid view
    const renderGridView = () => (
        <Row gutter={[16, 16]}>
            {products.map(product => {
                const stockStatus = getStockStatus(product);
                const profit = calculateProfit(product);
                const margin = calculateProfitMargin(product);

                return (
                    <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                        <Badge.Ribbon text={stockStatus.text} color={stockStatus.color}>
                            <Card
                                hoverable
                                cover={
                                    product.hinh_anh ? (
                                        <Image
                                            src={product.hinh_anh}
                                            height={200}
                                            style={{ objectFit: 'cover' }}
                                            preview={false}
                                        />
                                    ) : (
                                        <div style={{ height: 200, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <SkinOutlined style={{ fontSize: 48, color: '#999' }} />
                                        </div>
                                    )
                                }
                                actions={[
                                    <EyeOutlined key="view" onClick={() => handleView(product)} />,
                                    <EditOutlined key="edit" onClick={() => handleEdit(product)} />,
                                    <Popconfirm
                                        title="Xác nhận xóa?"
                                        onConfirm={() => handleDelete(product.id)}
                                        key="delete"
                                    >
                                        <DeleteOutlined />
                                    </Popconfirm>,
                                ]}
                            >
                                <Card.Meta
                                    title={<div style={{ marginBottom: 8 }}>{product.ten_san_pham}</div>}
                                    description={
                                        <div>
                                            {product.danh_muc && (
                                                <Tag color="blue" style={{ marginBottom: 8 }}>{product.danh_muc.ten_danh_muc}</Tag>
                                            )}
                                            <div style={{ marginBottom: 4 }}>
                                                <strong style={{ color: '#52c41a', fontSize: 16 }}>
                                                    {(product.gia_ban ?? 0).toLocaleString()} VNĐ
                                                </strong>
                                            </div>
                                            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                                                Tồn kho: <strong>{product.ton_kho ?? 0}</strong> {product.don_vi_tinh}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#666' }}>
                                                Đã bán: {product.so_luong_da_ban ?? 0} {product.don_vi_tinh}
                                            </div>
                                            <div style={{ fontSize: 12, color: profit > 0 ? '#52c41a' : '#999', marginTop: 4 }}>
                                                Lợi nhuận: {(profit ?? 0).toLocaleString()} VNĐ ({(margin ?? 0).toFixed(1)}%)
                                            </div>
                                        </div>
                                    }
                                />
                            </Card>
                        </Badge.Ribbon>
                    </Col>
                );
            })}
        </Row>
    );

    return (
        <div style={{ padding: 24 }}>
            {/* Stats Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng sản phẩm"
                            value={stats.total}
                            prefix={<StockOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Sắp hết hàng"
                            value={stats.lowStock}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Hết hàng"
                            value={stats.outOfStock}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Giá trị tồn kho"
                            value={stats.totalValue}
                            prefix={<DollarOutlined />}
                            suffix="VNĐ"
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title={
                    <Space>
                        <SkinOutlined />
                        <span>Quản lý Sản phẩm</span>
                        <Badge count={pagination.total} showZero />
                    </Space>
                }
                extra={
                    <Space>
                        <Button
                            type={viewMode === 'table' ? 'primary' : 'default'}
                            icon={<BarsOutlined />}
                            onClick={() => setViewMode('table')}
                        />
                        <Button
                            type={viewMode === 'grid' ? 'primary' : 'default'}
                            icon={<AppstoreOutlined />}
                            onClick={() => setViewMode('grid')}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                        >
                            Thêm sản phẩm
                        </Button>
                    </Space>
                }
            >
                {/* Filters */}
                <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={6}>
                            <Input.Search
                                placeholder="Tìm kiếm tên, mã sản phẩm..."
                                allowClear
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                prefix={<SearchOutlined />}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="Danh mục"
                                allowClear
                                style={{ width: '100%' }}
                                value={selectedCategory}
                                onChange={setSelectedCategory}
                            >
                                {categories.map(cat => (
                                    <Option key={cat.id} value={cat.id}>
                                        {cat.ten_danh_muc}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="Tồn kho"
                                allowClear
                                style={{ width: '100%' }}
                                value={stockFilter}
                                onChange={setStockFilter}
                            >
                                <Option value="in_stock">Còn hàng</Option>
                                <Option value="low_stock">Sắp hết</Option>
                                <Option value="out_of_stock">Hết hàng</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="Trạng thái"
                                allowClear
                                style={{ width: '100%' }}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                            >
                                <Option value="con_hang">Còn hàng</Option>
                                <Option value="het_hang">Hết hàng</Option>
                            </Select>
                        </Col>
                    </Row>
                </Space>

                {/* Low Stock Warning */}
                {stats.lowStock > 0 && (
                    <Alert
                        message={`Cảnh báo: Có ${stats.lowStock} sản phẩm sắp hết hàng`}
                        type="warning"
                        showIcon
                        closable
                        style={{ marginBottom: 16 }}
                    />
                )}

                {/* Content */}
                {viewMode === 'table' ? (
                    <Table
                        columns={columns}
                        dataSource={products}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} sản phẩm`,
                            onChange: (page, pageSize) => {
                                setPagination({ ...pagination, current: page, pageSize });
                            },
                        }}
                        scroll={{ x: 1600 }}
                    />
                ) : (
                    renderGridView()
                )}
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                width={900}
                okText={selectedProduct ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="ma_san_pham"
                                label="Mã sản phẩm"
                                rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
                            >
                                <Input placeholder="VD: SP001" />
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item
                                name="ten_san_pham"
                                label="Tên sản phẩm"
                                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                            >
                                <Input placeholder="VD: Kem dưỡng da..." />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="danh_muc_id"
                                label="Danh mục"
                                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                            >
                                <Select placeholder="Chọn danh mục">
                                    {categories.map(cat => (
                                        <Option key={cat.id} value={cat.id}>
                                            {cat.ten_danh_muc}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="thuong_hieu" label="Thương hiệu">
                                <Input placeholder="VD: L'Oréal" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="xuat_xu" label="Xuất xứ">
                                <Input placeholder="VD: Pháp" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name="gia_nhap"
                                label="Giá nhập"
                                rules={[{ required: true, message: 'Vui lòng nhập giá nhập' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name="gia_ban"
                                label="Giá bán"
                                rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name="ton_kho"
                                label="Tồn kho"
                                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                            >
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name="ton_kho_toi_thieu"
                                label="Tồn kho tối thiểu"
                                initialValue={10}
                            >
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="don_vi_tinh"
                                label="Đơn vị tính"
                                initialValue="Chai"
                            >
                                <Select>
                                    <Option value="Chai">Chai</Option>
                                    <Option value="Hộp">Hộp</Option>
                                    <Option value="Tuýp">Tuýp</Option>
                                    <Option value="Lọ">Lọ</Option>
                                    <Option value="Cái">Cái</Option>
                                    <Option value="Gói">Gói</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="han_su_dung" label="Hạn sử dụng">
                                <Input type="date" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="trang_thai" label="Trạng thái" initialValue="con_hang">
                                <Select>
                                    <Option value="con_hang">Còn hàng</Option>
                                    <Option value="het_hang">Hết hàng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="mo_ta" label="Mô tả">
                                <TextArea rows={3} placeholder="Mô tả sản phẩm..." />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Hình ảnh">
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Upload
                                        showUploadList={false}
                                        beforeUpload={handleImageUpload}
                                        accept="image/*"
                                    >
                                        <Button icon={<UploadOutlined />} loading={uploading}>
                                            Upload hình ảnh
                                        </Button>
                                    </Upload>
                                    {imageUrl && (
                                        <Image src={imageUrl} width={200} />
                                    )}
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Detail Drawer */}
            <Drawer
                title="Chi tiết sản phẩm"
                placement="right"
                onClose={() => setDetailDrawerVisible(false)}
                open={detailDrawerVisible}
                width={500}
            >
                {selectedProduct && (
                    <div>
                        {selectedProduct.hinh_anh && (
                            <Image
                                src={selectedProduct.hinh_anh}
                                style={{ width: '100%', marginBottom: 16, borderRadius: 8 }}
                            />
                        )}

                        <Alert
                            message={getStockStatus(selectedProduct).text}
                            type={(selectedProduct.ton_kho ?? 0) === 0 ? 'error' : (selectedProduct.ton_kho ?? 0) <= (selectedProduct.ton_kho_toi_thieu ?? 0) ? 'warning' : 'success'}
                            showIcon
                            style={{ marginBottom: 16 }}
                        />

                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Mã sản phẩm">{selectedProduct.ma_san_pham}</Descriptions.Item>
                            <Descriptions.Item label="Tên sản phẩm">{selectedProduct.ten_san_pham}</Descriptions.Item>
                            <Descriptions.Item label="Danh mục">
                                {selectedProduct.danh_muc?.ten_danh_muc || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thương hiệu">{selectedProduct.thuong_hieu || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Xuất xứ">{selectedProduct.xuat_xu || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Giá nhập">
                                {(selectedProduct.gia_nhap ?? 0).toLocaleString()} VNĐ
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá bán">
                                <strong style={{ color: '#52c41a', fontSize: 16 }}>
                                    {(selectedProduct.gia_ban ?? 0).toLocaleString()} VNĐ
                                </strong>
                            </Descriptions.Item>
                            <Descriptions.Item label="Lợi nhuận">
                                <span style={{ color: '#52c41a' }}>
                                    {(calculateProfit(selectedProduct) ?? 0).toLocaleString()} VNĐ
                                    ({(calculateProfitMargin(selectedProduct) ?? 0).toFixed(1)}%)
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tồn kho">
                                <strong>{selectedProduct.ton_kho ?? 0}</strong> {selectedProduct.don_vi_tinh}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tồn kho tối thiểu">
                                {selectedProduct.ton_kho_toi_thieu ?? 0} {selectedProduct.don_vi_tinh}
                            </Descriptions.Item>
                            <Descriptions.Item label="Đã bán">
                                {selectedProduct.so_luong_da_ban ?? 0} {selectedProduct.don_vi_tinh}
                            </Descriptions.Item>
                            <Descriptions.Item label="Doanh thu">
                                {(selectedProduct.doanh_thu ?? 0).toLocaleString()} VNĐ
                            </Descriptions.Item>
                            {selectedProduct.han_su_dung && (
                                <Descriptions.Item label="Hạn sử dụng">
                                    {dayjs(selectedProduct.han_su_dung).format('DD/MM/YYYY')}
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Ngày tạo">
                                {dayjs(selectedProduct.created_at).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedProduct.mo_ta && (
                            <div style={{ marginTop: 16 }}>
                                <Divider>Mô tả</Divider>
                                <p>{selectedProduct.mo_ta}</p>
                            </div>
                        )}
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default ProductList;
