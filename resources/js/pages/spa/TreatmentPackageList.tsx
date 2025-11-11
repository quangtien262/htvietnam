import React, { useState, useEffect } from 'react';
import {
    Card, Table, Button, Space, Input, Select, Tag, Modal, Form, InputNumber,
    message, Popconfirm, Upload, Image, Row, Col, Divider, Drawer, Descriptions,
    Switch, Badge, Alert, Progress, Tooltip, Statistic, Timeline, List
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, GiftOutlined,
    UploadOutlined, EyeOutlined, DollarOutlined, AppstoreOutlined, BarsOutlined,
    ClockCircleOutlined, CheckCircleOutlined, FireOutlined, UserOutlined,
    CalendarOutlined, PercentageOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface Service {
    id: number;
    ten_dich_vu: string;
    gia: number;
}

interface TreatmentPackage {
    id: number;
    ma_lieu_trinh: string;
    ten_lieu_trinh: string;
    mo_ta?: string;
    danh_muc_id?: number;
    danh_muc?: {
        id: number;
        ten_danh_muc: string;
    };
    gia_goc: number;
    gia_ban: number;
    giam_gia_phan_tram: number;
    so_buoi: number;
    thoi_han_su_dung: number; // days
    hinh_anh?: string;
    trang_thai: string;
    hot: boolean;
    dich_vu_ids?: number[];
    dich_vu?: Service[];
    so_khach_hang_mua: number;
    doanh_thu: number;
    created_at: string;
}

interface Category {
    id: number;
    ten_danh_muc: string;
}

const TreatmentPackageList: React.FC = () => {
    // State
    const [packages, setPackages] = useState<TreatmentPackage[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<TreatmentPackage | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    // Filters
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [hotFilter, setHotFilter] = useState<boolean | null>(null);

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
        active: 0,
        hot: 0,
        totalRevenue: 0,
    });

    // Load data
    useEffect(() => {
        loadPackages();
        loadCategories();
        loadServices();
    }, [pagination.current, pagination.pageSize, searchText, selectedCategory, selectedStatus, hotFilter]);

    const loadPackages = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/aio/api/admin/spa/treatment-packages/list', {
                page: pagination.current,
                limit: pagination.pageSize,
                search: searchText,
                danh_muc_id: selectedCategory,
                trang_thai: selectedStatus,
                hot: hotFilter,
            });

            if (response.data.success) {
                const data = response.data.data;
                setPackages(data.data || []);
                setPagination({
                    ...pagination,
                    total: data.total || 0,
                });

                if (data.stats) {
                    setStats(data.stats);
                }
            }
        } catch (error) {
            message.error('Không thể tải danh sách liệu trình');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await axios.post('/aio/api/admin/spa/service-categories/list');
            if (response.data.success) {
                setCategories(response.data.data.data || []);
            }
        } catch (error) {
            console.error('Load categories error:', error);
        }
    };

    const loadServices = async () => {
        try {
            const response = await axios.post('/aio/api/admin/spa/services/list', {
                limit: 1000,
                trang_thai: 'hoat_dong',
            });
            if (response.data.success) {
                setServices(response.data.data.data || []);
            }
        } catch (error) {
            console.error('Load services error:', error);
        }
    };

    // Handlers
    const handleCreate = () => {
        form.resetFields();
        setImageUrl('');
        setSelectedPackage(null);
        setModalVisible(true);
    };

    const handleEdit = (record: TreatmentPackage) => {
        setSelectedPackage(record);
        form.setFieldsValue({
            ...record,
            dich_vu_ids: record.dich_vu?.map(s => s.id) || [],
        });
        setImageUrl(record.hinh_anh || '');
        setModalVisible(true);
    };

    const handleView = (record: TreatmentPackage) => {
        setSelectedPackage(record);
        setDetailDrawerVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
  // Calculate discount percentage
            const giamGia = values.gia_goc > 0
               ? ((values.gia_goc - values.gia_ban) / values.gia_goc) * 100
                           : 0;

            const payload = {
                id: selectedPackage?.id,
                 ...values,
                hinh_anh: imageUrl,
                giam_gia_phan_tram: Math.round(giamGia),
            };

            const response = await axios.post('/aio/api/admin/spa/treatment-packages/create-or-update', payload);

            if (response.data.success) {
                message.success(selectedPackage ? 'Cập nhật liệu trình thành công' : 'Tạo liệu trình mới thành công');
                setModalVisible(false);
                loadPackages();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await axios.post('/aio/api/admin/spa/treatment-packages/delete', { id });
            if (response.data.success) {
                message.success('Xóa liệu trình thành công');
                loadPackages();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể xóa liệu trình');
        }
    };

    const handleStatusToggle = async (record: TreatmentPackage) => {
        try {
            const newStatus = record.trang_thai === 'hoat_dong' ? 'ngung_hoat_dong' : 'hoat_dong';
            const response = await axios.post('/aio/api/admin/spa/treatment-packages/create-or-update', {
                id: record.id,
                trang_thai: newStatus,
            });

            if (response.data.success) {
                message.success('Cập nhật trạng thái thành công');
                loadPackages();
            }
        } catch (error) {
            message.error('Không thể cập nhật trạng thái');
        }
    };

    const handleHotToggle = async (record: TreatmentPackage) => {
        try {
            const response = await axios.post('/aio/api/admin/spa/treatment-packages/create-or-update', {
                id: record.id,
                hot: !record.hot,
            });

            if (response.data.success) {
                message.success(record.hot ? 'Đã bỏ đánh dấu HOT' : 'Đã đánh dấu HOT');
                loadPackages();
            }
        } catch (error) {
            message.error('Không thể cập nhật');
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

    const calculateSavings = (pkg: TreatmentPackage) => {
        return pkg.gia_goc - pkg.gia_ban;
    };

    // Watch form values for auto-calculation
    const watchGiaGoc = Form.useWatch('gia_goc', form);
    const watchGiaBan = Form.useWatch('gia_ban', form);

    useEffect(() => {
        if (watchGiaGoc && watchGiaBan && watchGiaGoc > 0) {
            const discount = ((watchGiaGoc - watchGiaBan) / watchGiaGoc) * 100;
            form.setFieldValue('giam_gia_phan_tram', Math.round(discount));
        }
    }, [watchGiaGoc, watchGiaBan]);

    // Table columns
    const columns: ColumnsType<TreatmentPackage> = [
        {
            title: 'Mã LT',
            dataIndex: 'ma_lieu_trinh',
            key: 'ma_lieu_trinh',
            width: 100,
            fixed: 'left',
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'hinh_anh',
            key: 'hinh_anh',
            width: 80,
            render: (url: string, record) => (
                <Badge dot={record.hot} color="red">
                    {url ? (
                        <Image src={url} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
                    ) : (
                        <div style={{ width: 50, height: 50, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <GiftOutlined style={{ fontSize: 20, color: '#999' }} />
                        </div>
                    )}
                </Badge>
            ),
        },
        {
            title: 'Tên liệu trình',
            dataIndex: 'ten_lieu_trinh',
            key: 'ten_lieu_trinh',
            width: 250,
            render: (text: string, record: TreatmentPackage) => (
                <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                        {text}
                        {record.hot && (
                            <Tag color="red" icon={<FireOutlined />} style={{ marginLeft: 8 }}>
                                HOT
                            </Tag>
                        )}
                    </div>
                    {record.danh_muc && (
                        <Tag color="blue">{record.danh_muc.ten_danh_muc}</Tag>
                    )}
                    <Tag color="purple">{record.so_buoi} buổi</Tag>
                </div>
            ),
        },
        {
            title: 'Giá gốc',
            dataIndex: 'gia_goc',
            key: 'gia_goc',
            width: 130,
            align: 'right',
            render: (value: number) => (
                <span style={{ textDecoration: 'line-through', color: '#999' }}>
                    {value.toLocaleString()} VNĐ
                </span>
            ),
        },
        {
            title: 'Giá bán',
            dataIndex: 'gia_ban',
            key: 'gia_ban',
            width: 130,
            align: 'right',
            render: (value: number) => (
                <span style={{ fontWeight: 500, color: '#52c41a', fontSize: 15 }}>
                    {value.toLocaleString()} VNĐ
                </span>
            ),
        },
        {
            title: 'Tiết kiệm',
            key: 'savings',
            width: 150,
            align: 'center',
            render: (_, record) => {
                const savings = calculateSavings(record);
                return (
                    <div>
                        <Tag color="red" style={{ fontSize: 13 }}>
                            -{record.giam_gia_phan_tram}%
                        </Tag>
                        <div style={{ fontSize: 12, color: '#f5222d', marginTop: 4 }}>
                            Tiết kiệm: {savings.toLocaleString()} VNĐ
                        </div>
                    </div>
                );
            },
            sorter: (a, b) => calculateSavings(b) - calculateSavings(a),
        },
        {
            title: 'Thời hạn',
            dataIndex: 'thoi_han_su_dung',
            key: 'thoi_han_su_dung',
            width: 100,
            align: 'center',
            render: (days: number) => (
                <Tooltip title={`${days} ngày kể từ ngày mua`}>
                    <Tag color="orange" icon={<CalendarOutlined />}>
                        {days} ngày
                    </Tag>
                </Tooltip>
            ),
        },
        {
            title: 'Khách hàng',
            dataIndex: 'so_khach_hang_mua',
            key: 'so_khach_hang_mua',
            width: 100,
            align: 'center',
            render: (value: number) => (
                <Badge count={value} showZero color="blue" overflowCount={999} />
            ),
            sorter: (a, b) => a.so_khach_hang_mua - b.so_khach_hang_mua,
        },
        {
            title: 'Doanh thu',
            dataIndex: 'doanh_thu',
            key: 'doanh_thu',
            width: 150,
            align: 'right',
            render: (value: number) => `${value.toLocaleString()} VNĐ`,
            sorter: (a, b) => a.doanh_thu - b.doanh_thu,
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            align: 'center',
            render: (_, record: TreatmentPackage) => (
                <Space direction="vertical" size="small">
                    <Switch
                        checked={record.trang_thai === 'hoat_dong'}
                        onChange={() => handleStatusToggle(record)}
                        checkedChildren="Hoạt động"
                        unCheckedChildren="Tạm dừng"
                    />
                    <Switch
                        checked={record.hot}
                        onChange={() => handleHotToggle(record)}
                        checkedChildren="HOT"
                        unCheckedChildren="Thường"
                        style={{ background: record.hot ? '#f5222d' : undefined }}
                    />
                </Space>
            ),
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
                        title="Xác nhận xóa liệu trình này?"
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
            {packages.map(pkg => {
                const savings = calculateSavings(pkg);

                return (
                    <Col xs={24} sm={12} md={8} lg={6} key={pkg.id}>
                        <Badge.Ribbon
                            text={pkg.hot ? 'HOT' : `-${pkg.giam_gia_phan_tram}%`}                            color={pkg.hot ? 'red' : 'volcano'}
                        >
                            <Card
                                hoverable
                                cover={
                                    pkg.hinh_anh ? (
                                        <Image
                                            src={pkg.hinh_anh}
                                             height={200}
                                            style={{ objectFit: 'cover' }}
                                            preview={false}
                                        />
                                    ) : (
                                        <div style={{ height: 200, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <GiftOutlined style={{ fontSize: 48, color: '#999' }} />
                                        </div>
                                    )
                                }
                                actions={[
                                    <EyeOutlined key="view" onClick={() => handleView(pkg)} />,
                                    <EditOutlined key="edit" onClick={() => handleEdit(pkg)} />,
                                    <Popconfirm
                                        title="Xác nhận xóa?"
                                        onConfirm={() => handleDelete(pkg.id)}
                                        key="delete"
                                    >
                                        <DeleteOutlined />
                                    </Popconfirm>,
                                ]}
                            >
                                <Card.Meta
                                    title={
                                        <div style={{ marginBottom: 8 }}>
                                            {pkg.ten_lieu_trinh}
                                        </div>
                                    }
                                    description={
                                        <div>
                                            {pkg.danh_muc && (
                                                <Tag color="blue" style={{ marginBottom: 8 }}>{pkg.danh_muc.ten_danh_muc}</Tag>
                                            )}
                                            <Tag color="purple">{pkg.so_buoi} buổi</Tag>
                                            <Tag color="orange">{pkg.thoi_han_su_dung} ngày</Tag>
  <div style={{ marginTop: 12 }}>
                                                <div style={{ textDecoration: 'line-through', color: '#999', fontSize: 12 }}>
                                                    {pkg.gia_goc.toLocaleString()} VNĐ
                                                </div>
                                                <div style={{ fontWeight: 500, color: '#52c41a', fontSize: 18, marginTop: 4 }}>
                                                    {pkg.gia_ban.toLocaleString()} VNĐ
                                                </div>
                                                <div style={{ color: '#f5222d', fontSize: 12, marginTop: 4 }}>
                                                    Tiết kiệm: {savings.toLocaleString()} VNĐ
                                                </div>
                                            </div>

                                            <Divider style={{ margin: '12px 0' }} />

                                            <div style={{ fontSize: 12, color: '#666' }}>
                                                <UserOutlined /> {pkg.so_khach_hang_mua} khách hàng
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
                            title="Tổng liệu trình"
                            value={stats.total}
                            prefix={<GiftOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đang hoạt động"
                            value={stats.active}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Liệu trình HOT"
                            value={stats.hot}
                            prefix={<FireOutlined />}
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={stats.totalRevenue}
                            prefix={<DollarOutlined />}
                            suffix="VNĐ"
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title={
                    <Space>
                        <GiftOutlined />
                        <span>Quản lý Liệu trình</span>
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
                            Thêm liệu trình
                        </Button>
                    </Space>
                }
            >
                {/* Filters */}
                <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={6}>
                            <Input.Search
                                placeholder="Tìm kiếm tên, mã liệu trình..."
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
                                placeholder="Trạng thái"
                                allowClear
                                style={{ width: '100%' }}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                            >
                                <Option value="hoat_dong">Hoạt động</Option>
                                <Option value="ngung_hoat_dong">Tạm dừng</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="Lọc HOT"
                                allowClear
                                style={{ width: '100%' }}
                                value={hotFilter}
                                onChange={setHotFilter}
                            >
                                <Option value={true}>Liệu trình HOT</Option>
                                <Option value={false}>Liệu trình thường</Option>
                            </Select>
                        </Col>
                    </Row>
                </Space>

                {/* Content */}
                {viewMode === 'table' ? (
                    <Table
                        columns={columns}
                        dataSource={packages}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} liệu trình`,
                            onChange: (page, pageSize) => {
                                setPagination({ ...pagination, current: page, pageSize });
                            },
                        }}
                        scroll={{ x: 1800 }}
                    />
                ) : (
                    renderGridView()
                )}
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={selectedPackage ? 'Chỉnh sửa liệu trình' : 'Thêm liệu trình mới'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                width={1000}
                okText={selectedPackage ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="ma_lieu_trinh"
                                label="Mã liệu trình"
                                rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
                            >
                                <Input placeholder="VD: LT001" />
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item
                                name="ten_lieu_trinh"
                                label="Tên liệu trình"
                                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                            >
                                <Input placeholder="VD: Liệu trình chăm sóc da mặt..." />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
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
                        <Col span={6}>
                            <Form.Item
                                name="so_buoi"
                                label="Số buổi"
                                rules={[{ required: true, message: 'Vui lòng nhập số buổi' }]}
                                initialValue={10}
                            >
                                <InputNumber style={{ width: '100%' }} min={1} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name="thoi_han_su_dung"
                                label="Thời hạn (ngày)"
                                rules={[{ required: true, message: 'Vui lòng nhập thời hạn' }]}
                                initialValue={90}
                            >
                                <InputNumber style={{ width: '100%' }} min={1} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="gia_goc"
                                label="Giá gốc"
                                rules={[{ required: true, message: 'Vui lòng nhập giá gốc' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
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
                        <Col span={8}>
                            <Form.Item
                                name="giam_gia_phan_tram"
                                label="Giảm giá (%)"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={100}
                                    disabled
                                    suffix="%"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="dich_vu_ids"
                                label="Dịch vụ bao gồm"
                                rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 dịch vụ' }]}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Chọn các dịch vụ trong liệu trình"
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.children as string).toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {services.map(service => (
                                        <Option key={service.id} value={service.id}>
                                            {service.ten_dich_vu} - {service.gia.toLocaleString()} VNĐ
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="mo_ta" label="Mô tả">
                                <TextArea rows={4} placeholder="Mô tả chi tiết về liệu trình..." />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="trang_thai" label="Trạng thái" initialValue="hoat_dong">
                                <Select>
                                    <Option value="hoat_dong">Hoạt động</Option>
                                    <Option value="ngung_hoat_dong">Tạm dừng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="hot" label="Đánh dấu HOT" valuePropName="checked">
                                <Switch checkedChildren="HOT" unCheckedChildren="Thường" />
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
                title="Chi tiết liệu trình"
                placement="right"
                onClose={() => setDetailDrawerVisible(false)}
                open={detailDrawerVisible}
                width={600}
            >
                {selectedPackage && (
                    <div>
                        {selectedPackage.hinh_anh && (
                            <Image
                                src={selectedPackage.hinh_anh}
                                style={{ width: '100%', marginBottom: 16, borderRadius: 8 }}
                            />
                        )}

                        <Alert
                            message={
                                <div>
                                    <strong style={{ fontSize: 18, color: '#f5222d' }}>
                                        Tiết kiệm: {calculateSavings(selectedPackage).toLocaleString()} VNĐ
                                    </strong>
                                    <div style={{ fontSize: 14, marginTop: 4 }}>
                                        Giảm {selectedPackage.giam_gia_phan_tram}% so với giá gốc
                                    </div>
                                </div>
                            }
                            type="success"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />

                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Mã liệu trình">{selectedPackage.ma_lieu_trinh}</Descriptions.Item>
                            <Descriptions.Item label="Tên liệu trình">{selectedPackage.ten_lieu_trinh}</Descriptions.Item>
                            <Descriptions.Item label="Danh mục">
                                {selectedPackage.danh_muc?.ten_danh_muc || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số buổi">
                                <Tag color="purple">{selectedPackage.so_buoi} buổi</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời hạn sử dụng">
                                <Tag color="orange">{selectedPackage.thoi_han_su_dung} ngày</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá gốc">
                                <span style={{ textDecoration: 'line-through' }}>
                                    {selectedPackage.gia_goc.toLocaleString()} VNĐ
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá bán">
                                <strong style={{ color: '#52c41a', fontSize: 18 }}>
                                    {selectedPackage.gia_ban.toLocaleString()} VNĐ
                                </strong>
                            </Descriptions.Item>
                            <Descriptions.Item label="Khách hàng mua">
                                {selectedPackage.so_khach_hang_mua} khách hàng
                            </Descriptions.Item>
                            <Descriptions.Item label="Doanh thu">
                                {selectedPackage.doanh_thu.toLocaleString()} VNĐ
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Space>
                                    <Tag color={selectedPackage.trang_thai === 'hoat_dong' ? 'green' : 'red'}>
                                        {selectedPackage.trang_thai === 'hoat_dong' ? 'Hoạt động' : 'Tạm dừng'}
                                    </Tag>
                                    {selectedPackage.hot && (
                                        <Tag color="red" icon={<FireOutlined />}>HOT</Tag>
                                    )}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {dayjs(selectedPackage.created_at).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedPackage.mo_ta && (
                            <div style={{ marginTop: 16 }}>
                                <Divider>Mô tả</Divider>
                                <p>{selectedPackage.mo_ta}</p>
                            </div>
                        )}

                        {selectedPackage.dich_vu && selectedPackage.dich_vu.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <Divider>Dịch vụ bao gồm ({selectedPackage.dich_vu.length})</Divider>
                                <List
                                    size="small"
                                    bordered
                                    dataSource={selectedPackage.dich_vu}
                                    renderItem={(item, index) => (
                                        <List.Item>
                                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                                <span>
                                                    <Badge count={index + 1} style={{ marginRight: 8 }} />
                                                    {item.ten_dich_vu}
                                                </span>
                                                <span style={{ color: '#52c41a' }}>
                                                    {item.gia.toLocaleString()} VNĐ
                                                </span>
                                            </Space>
                                        </List.Item>
                                    )}
                                />
                            </div>
                        )}
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default TreatmentPackageList;
