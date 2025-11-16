import React, { useState, useEffect } from 'react';
import {
    Card, Table, Button, Space, Input, Select, Tag, Modal, Form, InputNumber,
    message, Popconfirm, Upload, Image, Row, Col, Divider, Drawer, Descriptions,
    Switch, TreeSelect, Badge, Statistic
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ScissorOutlined,
    UploadOutlined, EyeOutlined, ClockCircleOutlined, DollarOutlined,
    AppstoreOutlined, BarsOutlined, FileTextOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface Service {
    id: number;
    ma_dich_vu: string;
    ten_dich_vu: string;
    danh_muc_id?: number;
    danh_muc?: {
        id: number;
        ten_danh_muc: string;
    };
    gia: number;
    gia_ban?: number;
    thoi_gian_thuc_hien: number;
    mo_ta?: string;
    hinh_anh?: string;
    trang_thai: string;
    is_active?: boolean;
    yeu_cau_ky_nang?: string[];
    nguyen_lieu?: NguyenLieu[];
    so_luong_da_su_dung: number;
    doanh_thu: number;
    created_at: string;
}

interface NguyenLieu {
    id?: number;
    san_pham_id: number;
    ma_san_pham?: string;
    ten_san_pham?: string;
    so_luong: number;
    don_vi: string;
    don_vi_goc?: string;
    don_vi_quy_doi_id?: number;
    gia_von: number;
    gia_von_goc?: number;
    ty_le_quy_doi: number;
    thanh_tien: number;
    ghi_chu?: string;
}

interface Product {
    id: number;
    ma_san_pham: string;
    ten_san_pham: string;
    don_vi_tinh: string;
    gia_von: number;
    ton_kho: number;
    don_vi_quy_doi?: Array<{
        id: number;
        don_vi: string;
        ty_le: number;
    }>;
}

interface Category {
    id: number;
    ten_danh_muc: string;
    mo_ta?: string;
    thu_tu: number;
}

interface Skill {
    id: number;
    name: string;
    color?: string;
    sort_order?: number;
}

const ServiceList: React.FC = () => {
    // State
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [materials, setMaterials] = useState<NguyenLieu[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [skillModalVisible, setSkillModalVisible] = useState(false);
    const [categoryForm] = Form.useForm();
    const [skillForm] = Form.useForm();

    // Filters
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

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

    // Load data
    useEffect(() => {
        loadServices();
    }, [pagination.current, pagination.pageSize, searchText, selectedCategory, selectedStatus]);

    // Load categories once on mount
    useEffect(() => {
        loadCategories();
        loadSkills();
        loadProducts();
    }, []);

    const loadServices = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/aio/api/spa/services', {
                params: {
                    page: pagination.current,
                    per_page: pagination.pageSize,
                    search: searchText,
                    danh_muc_id: selectedCategory,
                    is_active: selectedStatus,
                }
            });

            console.log('Services response:', response.data); // Debug log

            if (response.data) {
                // Backend returns: { status_code, message, data: { data: [...], total: X } }
                const servicesData = response.data.data?.data || response.data.data || [];
                const total = response.data.data?.total || 0;

                console.log('Services loaded:', servicesData.length, 'items'); // Debug log

                setServices(servicesData);
                setPagination({
                    ...pagination,
                    total: total,
                });
            }
        } catch (error) {
            console.error('Load services error:', error);
            message.error('Không thể tải danh sách dịch vụ');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await axios.post('/aio/api/spa/service-categories/list');
            console.log('Categories response:', response.data); // Debug log
            if (response.data) {
                // Response structure: { status_code, message, data: { data: [...] } }
                const categoriesData = response.data.data?.data || response.data.data || [];
                console.log('Categories loaded:', categoriesData); // Debug log
                setCategories(categoriesData);
            }
        } catch (error) {
            console.error('Load categories error:', error);
            message.error('Không thể tải danh mục dịch vụ');
        }
    };

    const loadSkills = async () => {
        try {
            const response = await axios.get('/aio/api/spa/skills');
            console.log('Skills response:', response.data);
            if (response.data && response.data.status_code === 200) {
                const skillsData = response.data.data || [];
                setSkills(skillsData);
            }
        } catch (error) {
            console.error('Load skills error:', error);
            message.error('Không thể tải danh sách kỹ năng');
        }
    };

    const loadProducts = async () => {
        try {
            const response = await axios.get('/aio/api/spa/products', {
                params: { per_page: 1000 } // Load all products
            });
            if (response.data && response.data.status_code === 200) {
                const productsData = response.data.data?.data || response.data.data || [];
                setProducts(productsData);
            }
        } catch (error) {
            console.error('Load products error:', error);
            message.error('Không thể tải danh sách sản phẩm');
        }
    };

    // Handlers
    const handleCreate = () => {
        form.resetFields();
        setImageUrl('');
        setSelectedService(null);
        setModalVisible(true);
    };

    const handleEdit = async (record: Service) => {
        setSelectedService(record);

        // Load full service details including materials
        try {
            const response = await axios.get(`/aio/api/spa/services/${record.id}`);
            const serviceData = response.data;

            form.setFieldsValue({
                ...serviceData,
                yeu_cau_ky_nang: serviceData.yeu_cau_ky_nang || [],
                nguyen_lieu: serviceData.nguyen_lieu || [],
            });
            setImageUrl(serviceData.hinh_anh || '');
        } catch (error) {
            console.error('Failed to load service details:', error);
            form.setFieldsValue({
                ...record,
                yeu_cau_ky_nang: record.yeu_cau_ky_nang || [],
                nguyen_lieu: [],
            });
            setImageUrl(record.hinh_anh || '');
        }

        setModalVisible(true);
    };

    const handleView = (record: Service) => {
        setSelectedService(record);
        setDetailDrawerVisible(true);
    };

    const handleSubmit = async () => {
        try {
            setUploading(true); // Show loading
            const values = await form.validateFields();

            // Validate materials required
            if (!values.nguyen_lieu || values.nguyen_lieu.length === 0) {
                message.error('Vui lòng chọn ít nhất 1 nguyên liệu tiêu hao');
                setUploading(false);
                return;
            }

            const payload = {
                ...values,
                hinh_anh: imageUrl,
            };

            let response;
            if (selectedService?.id) {
                // Update existing service
                response = await axios.put(`/aio/api/spa/services/${selectedService.id}`, payload);
            } else {
                // Create new service
                response = await axios.post('/aio/api/spa/services', payload);
            }

            // Backend returns: { status_code, message, data }
            if (response.data && response.data.status_code === 200) {
                message.success(selectedService ? 'Cập nhật dịch vụ thành công' : 'Tạo dịch vụ mới thành công');
                setModalVisible(false);
                form.resetFields();
                setImageUrl('');
                setSelectedService(null);
                await loadServices(); // Reload list
            } else {
                message.error(response.data?.message || 'Có lỗi xảy ra');
            }
        } catch (error: any) {
            console.error('Submit error:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setUploading(false); // Hide loading
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setLoading(true);
            const response = await axios.delete(`/aio/api/spa/services/${id}`);
            if (response.data && response.data.status_code === 200) {
                message.success('Xóa dịch vụ thành công');
                await loadServices();
            } else {
                message.error(response.data?.message || 'Không thể xóa dịch vụ');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            message.error(error.response?.data?.message || 'Không thể xóa dịch vụ');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (record: Service) => {
        try {
            const newStatus = !record.is_active;
            const response = await axios.put(`/aio/api/spa/services/${record.id}`, {
                is_active: newStatus,
            });

            if (response.data && response.data.status_code === 200) {
                message.success('Cập nhật trạng thái thành công');
                await loadServices();
            } else {
                message.error('Không thể cập nhật trạng thái');
            }
        } catch (error) {
            console.error('Toggle status error:', error);
            message.error('Không thể cập nhật trạng thái');
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

    // Handle quick create category
    const handleQuickCreateCategory = () => {
        categoryForm.resetFields();
        setCategoryModalVisible(true);
    };

    const handleCategorySubmit = async () => {
        try {
            const values = await categoryForm.validateFields();
            const response = await axios.post('/aio/api/spa/service-categories', values);

            if (response.data.success) {
                message.success('Tạo danh mục mới thành công');
                setCategoryModalVisible(false);
                await loadCategories();

                // Auto-select the newly created category
                const newCategoryId = response.data.data.id;
                form.setFieldsValue({ danh_muc_id: newCategoryId });
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    // Handle quick create skill
    const handleQuickCreateSkill = () => {
        skillForm.resetFields();
        setSkillModalVisible(true);
    };

    const handleSkillSubmit = async () => {
        try {
            const values = await skillForm.validateFields();
            const response = await axios.post('/aio/api/spa/skills', values);

            if (response.data.status_code === 200) {
                message.success('Tạo kỹ năng mới thành công');
                setSkillModalVisible(false);
                await loadSkills();

                // Auto-add the newly created skill to the form
                const currentSkills = form.getFieldValue('yeu_cau_ky_nang') || [];
                const newSkillName = response.data.data?.data?.name || values.name;
                form.setFieldsValue({ yeu_cau_ky_nang: [...currentSkills, newSkillName] });
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    // Table columns
    const columns: ColumnsType<Service> = [
        {
            title: 'Mã DV',
            dataIndex: 'ma_dich_vu',
            key: 'ma_dich_vu',
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
                    <ScissorOutlined style={{ fontSize: 20, color: '#999' }} />
                </div>
            ),
        },
        {
            title: 'Tên dịch vụ',
            dataIndex: 'ten_dich_vu',
            key: 'ten_dich_vu',
            width: 250,
            render: (text: string, record: Service) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{text}</div>
                    {record.danh_muc && (
                        <Tag color="blue">{record.danh_muc.ten_danh_muc}</Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Giá',
            dataIndex: 'gia',
            key: 'gia',
            width: 120,
            align: 'right',
            render: (value: number) => (
                <span style={{ fontWeight: 500, color: '#52c41a' }}>
                    <DollarOutlined /> {(value || 0).toLocaleString()} VNĐ
                </span>
            ),
            sorter: (a, b) => (a.gia || 0) - (b.gia || 0),
        },
        {
            title: 'Thời gian',
            dataIndex: 'thoi_gian_thuc_hien',
            key: 'thoi_gian_thuc_hien',
            width: 100,
            render: (value: number) => (
                <span>
                    <ClockCircleOutlined /> {value || 0} phút
                </span>
            ),
            sorter: (a, b) => (a.thoi_gian_thuc_hien || 0) - (b.thoi_gian_thuc_hien || 0),
        },
        {
            title: 'Số lần sử dụng',
            dataIndex: 'so_luong_da_su_dung',
            key: 'so_luong_da_su_dung',
            width: 120,
            align: 'center',
            render: (value: number) => <Badge count={value || 0} showZero color="blue" />,
            sorter: (a, b) => (a.so_luong_da_su_dung || 0) - (b.so_luong_da_su_dung || 0),
        },
        {
            title: 'Doanh thu',
            dataIndex: 'doanh_thu',
            key: 'doanh_thu',
            width: 150,
            align: 'right',
            render: (value: number) => `${(value || 0).toLocaleString()} VNĐ`,
            sorter: (a, b) => (a.doanh_thu || 0) - (b.doanh_thu || 0),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            width: 120,
            render: (status: string, record: Service) => (
                <Switch
                    checked={status === 'hoat_dong'}
                    onChange={() => handleStatusToggle(record)}
                    checkedChildren="Hoạt động"
                    unCheckedChildren="Ngừng"
                />
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
                        title="Xác nhận xóa dịch vụ này?"
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
            {services.map(service => (
                <Col xs={24} sm={12} md={8} lg={6} key={service.id}>
                    <Card
                        hoverable
                        cover={
                            service.hinh_anh ? (
                                <Image
                                    src={service.hinh_anh}
                                    height={200}
                                    style={{ objectFit: 'cover' }}
                                    preview={false}
                                />
                            ) : (
                                <div style={{ height: 200, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ScissorOutlined style={{ fontSize: 48, color: '#999' }} />
                                </div>
                            )
                        }
                        actions={[
                            <EyeOutlined key="view" onClick={() => handleView(service)} />,
                            <EditOutlined key="edit" onClick={() => handleEdit(service)} />,
                            <Popconfirm
                                title="Xác nhận xóa?"
                                onConfirm={() => handleDelete(service.id)}
                                key="delete"
                            >
                                <DeleteOutlined />
                            </Popconfirm>,
                        ]}
                    >
                        <Card.Meta
                            title={
                                <div>
                                    <div style={{ marginBottom: 8 }}>{service.ten_dich_vu}</div>
                                    <Tag color={service.trang_thai === 'hoat_dong' ? 'green' : 'red'}>
                                        {service.trang_thai === 'hoat_dong' ? 'Hoạt động' : 'Ngừng'}
                                    </Tag>
                                </div>
                            }
                            description={
                                <div>
                                    {service.danh_muc && (
                                        <Tag color="blue" style={{ marginBottom: 8 }}>{service.danh_muc.ten_danh_muc}</Tag>
                                    )}
                                    <div style={{ marginBottom: 4 }}>
                                        <strong style={{ color: '#52c41a', fontSize: 16 }}>
                                            {service.gia.toLocaleString()} VNĐ
                                        </strong>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#666' }}>
                                        <ClockCircleOutlined /> {service.thoi_gian_thuc_hien} phút
                                    </div>
                                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                                        Đã sử dụng: {service.so_luong_da_su_dung} lần
                                    </div>
                                </div>
                            }
                        />
                    </Card>
                </Col>
            ))}
        </Row>
    );

    return (
        <div style={{ padding: 24 }}>
            <Card
                title={
                    <Space>
                        <ScissorOutlined />
                        <span>Quản lý Dịch vụ</span>
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
                            Thêm dịch vụ
                        </Button>
                    </Space>
                }
            >
                {/* Filters */}
                <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={8}>
                            <Input.Search
                                placeholder="Tìm kiếm tên, mã dịch vụ..."
                                allowClear
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                prefix={<SearchOutlined />}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
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
                        <Col xs={24} sm={12} md={8}>
                            <Select
                                placeholder="Trạng thái"
                                allowClear
                                style={{ width: '100%' }}
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                            >
                                <Option value="hoat_dong">Hoạt động</Option>
                                <Option value="ngung_hoat_dong">Ngừng hoạt động</Option>
                            </Select>
                        </Col>
                    </Row>
                </Space>

                {/* Content */}
                {viewMode === 'table' ? (
                    <Table
                        columns={columns}
                        dataSource={services}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} dịch vụ`,
                            onChange: (page, pageSize) => {
                                setPagination({ ...pagination, current: page, pageSize });
                            },
                        }}
                        scroll={{ x: 1400 }}
                    />
                ) : (
                    renderGridView()
                )}
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={selectedService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setImageUrl('');
                    setSelectedService(null);
                }}
                onOk={handleSubmit}
                width={800}
                okText={selectedService ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
                confirmLoading={uploading}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        {selectedService && (
                            <Col span={12}>
                                <Form.Item
                                    name="ma_dich_vu"
                                    label="Mã dịch vụ"
                                >
                                    <Input disabled placeholder="Tự động tạo" />
                                </Form.Item>
                            </Col>
                        )}
                        <Col span={selectedService ? 12 : 24}>
                            <Form.Item
                                name="ten_dich_vu"
                                label="Tên dịch vụ"
                                rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ' }]}
                            >
                                <Input placeholder="VD: Massage body" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="danh_muc_id"
                                label={
                                    <Space>
                                        <span>Danh mục</span>
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={handleQuickCreateCategory}
                                            style={{ padding: 0, height: 'auto' }}
                                        >
                                            Thêm mới
                                        </Button>
                                    </Space>
                                }
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
                        <Col span={12}>
                            <Form.Item
                                name="gia"
                                label="Giá dịch vụ"
                                rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                    suffix="VNĐ"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="thoi_gian_thuc_hien"
                                label="Thời gian thực hiện (phút)"
                                rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    suffix="phút"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="trang_thai"
                                label="Trạng thái"
                                initialValue="hoat_dong"
                            >
                                <Select>
                                    <Option value="hoat_dong">Hoạt động</Option>
                                    <Option value="ngung_hoat_dong">Ngừng hoạt động</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="yeu_cau_ky_nang"
                                label={
                                    <Space>
                                        <span>Yêu cầu kỹ năng</span>
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={handleQuickCreateSkill}
                                        >
                                            Thêm nhanh
                                        </Button>
                                    </Space>
                                }
                            >
                                <Select mode="tags" placeholder="Nhập và Enter để thêm kỹ năng">
                                    {skills.map(skill => (
                                        <Option key={skill.id} value={skill.name}>
                                            {skill.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        {/* Nguyên liệu tiêu hao */}
                        <Col span={24}>
                            <Divider orientation="left">Nguyên liệu tiêu hao (Tùy chọn)</Divider>
                            <Form.List name="nguyen_lieu">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.length > 0 && (
                                            <Table
                                                dataSource={fields}
                                                pagination={false}
                                                size="small"
                                                style={{ marginBottom: 16 }}
                                                rowKey="key"
                                            >
                                                <Table.Column
                                                    title="Sản phẩm"
                                                    width="30%"
                                                    render={(_, field: any) => (
                                                        <Form.Item
                                                            {...field}
                                                            name={[field.name, 'san_pham_id']}
                                                            rules={[{ required: true, message: 'Chọn SP' }]}
                                                            style={{ marginBottom: 0 }}
                                                        >
                                                            <Select
                                                                showSearch
                                                                placeholder="Chọn sản phẩm"
                                                                optionFilterProp="label"
                                                                onChange={(value) => {
                                                                    const product = products.find(p => p.id === value);
                                                                    if (product) {
                                                                        const currentValues = form.getFieldValue('nguyen_lieu') || [];
                                                                        currentValues[field.name] = {
                                                                            ...currentValues[field.name],
                                                                            san_pham_id: value,
                                                                            don_vi: product.don_vi_tinh,
                                                                            gia_von: product.gia_von || 0,
                                                                            ty_le_quy_doi: 1,
                                                                            don_vi_quy_doi_id: null
                                                                        };
                                                                        form.setFieldsValue({ nguyen_lieu: currentValues });
                                                                    }
                                                                }}
                                                            >
                                                                {products.map(p => (
                                                                    <Option key={p.id} value={p.id} label={`${p.ma_san_pham} - ${p.ten_san_pham}`}>
                                                                        <div>
                                                                            <strong>{p.ma_san_pham}</strong> - {p.ten_san_pham}
                                                                            <br />
                                                                            <small style={{ color: '#666' }}>
                                                                                Tồn: {p.ton_kho} {p.don_vi_tinh} | Giá vốn: {p.gia_von?.toLocaleString()}đ
                                                                            </small>
                                                                        </div>
                                                                    </Option>
                                                                ))}
                                                            </Select>
                                                        </Form.Item>
                                                    )}
                                                />
                                                <Table.Column
                                                    title="SL"
                                                    width="12%"
                                                    render={(_, field: any) => (
                                                        <Form.Item
                                                            {...field}
                                                            name={[field.name, 'so_luong']}
                                                            rules={[{ required: true, message: 'SL' }]}
                                                            style={{ marginBottom: 0 }}
                                                        >
                                                            <InputNumber
                                                                min={0.0001}
                                                                step={0.01}
                                                                style={{ width: '100%' }}
                                                                onChange={() => {
                                                                    const values = form.getFieldValue('nguyen_lieu');
                                                                    const item = values[field.name];
                                                                    if (item?.so_luong && item?.gia_von) {
                                                                        item.thanh_tien = item.so_luong * item.gia_von;
                                                                        form.setFieldsValue({ nguyen_lieu: values });
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Item>
                                                    )}
                                                />
                                                <Table.Column
                                                    title="Đơn vị"
                                                    width="15%"
                                                    render={(_, field: any) => {
                                                        const sanPhamId = form.getFieldValue(['nguyen_lieu', field.name, 'san_pham_id']);
                                                        const product = products.find(p => p.id === sanPhamId);
                                                        const conversions = product?.don_vi_quy_doi || [];

                                                        return (
                                                            <Form.Item
                                                                {...field}
                                                                name={[field.name, 'don_vi']}
                                                                style={{ marginBottom: 0 }}
                                                            >
                                                                <Select
                                                                    onChange={(value) => {
                                                                        const values = form.getFieldValue('nguyen_lieu');
                                                                        const item = values[field.name];

                                                                        if (product) {
                                                                            if (value === product.don_vi_tinh) {
                                                                                // Base unit
                                                                                item.gia_von = product.gia_von || 0;
                                                                                item.ty_le_quy_doi = 1;
                                                                                item.don_vi_quy_doi_id = null;
                                                                            } else {
                                                                                // Conversion unit
                                                                                const conv = conversions.find(c => c.don_vi === value);
                                                                                if (conv) {
                                                                                    item.gia_von = (product.gia_von || 0) / conv.ty_le;
                                                                                    item.ty_le_quy_doi = conv.ty_le;
                                                                                    item.don_vi_quy_doi_id = conv.id;
                                                                                }
                                                                            }

                                                                            if (item.so_luong) {
                                                                                item.thanh_tien = item.so_luong * item.gia_von;
                                                                            }
                                                                            form.setFieldsValue({ nguyen_lieu: values });
                                                                        }
                                                                    }}
                                                                >
                                                                    {product && <Option value={product.don_vi_tinh}>{product.don_vi_tinh}</Option>}
                                                                    {conversions.map(c => (
                                                                        <Option key={c.id} value={c.don_vi}>{c.don_vi}</Option>
                                                                    ))}
                                                                </Select>
                                                            </Form.Item>
                                                        );
                                                    }}
                                                />
                                                <Table.Column
                                                    title="Giá vốn"
                                                    width="15%"
                                                    render={(_, field: any) => {
                                                        const giaVon = form.getFieldValue(['nguyen_lieu', field.name, 'gia_von']);
                                                        return (
                                                            <>
                                                                <Form.Item name={[field.name, 'gia_von']} hidden><InputNumber /></Form.Item>
                                                                <Form.Item name={[field.name, 'ty_le_quy_doi']} hidden><InputNumber /></Form.Item>
                                                                <Form.Item name={[field.name, 'don_vi_quy_doi_id']} hidden><InputNumber /></Form.Item>
                                                                <div style={{ textAlign: 'right' }}>
                                                                    {(giaVon || 0).toLocaleString()}đ
                                                                </div>
                                                            </>
                                                        );
                                                    }}
                                                />
                                                <Table.Column
                                                    title="Thành tiền"
                                                    width="18%"
                                                    render={(_, field: any) => {
                                                        const thanhTien = form.getFieldValue(['nguyen_lieu', field.name, 'thanh_tien']);
                                                        return (
                                                            <>
                                                                <Form.Item name={[field.name, 'thanh_tien']} hidden><InputNumber /></Form.Item>
                                                                <div style={{ textAlign: 'right', fontWeight: 500, color: '#52c41a' }}>
                                                                    {(thanhTien || 0).toLocaleString()}đ
                                                                </div>
                                                            </>
                                                        );
                                                    }}
                                                />
                                                <Table.Column
                                                    title=""
                                                    width="5%"
                                                    render={(_, field: any) => (
                                                        <DeleteOutlined
                                                            style={{ color: '#ff4d4f', cursor: 'pointer' }}
                                                            onClick={() => remove(field.name)}
                                                        />
                                                    )}
                                                />
                                            </Table>
                                        )}
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                        >
                                            Thêm nguyên liệu
                                        </Button>
                                    </>
                                )}
                            </Form.List>
                        </Col>

                        <Col span={24}>
                            <Form.Item name="mo_ta" label="Mô tả">
                                <TextArea rows={4} placeholder="Mô tả chi tiết về dịch vụ..." />
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
                title="Chi tiết dịch vụ"
                placement="right"
                onClose={() => setDetailDrawerVisible(false)}
                open={detailDrawerVisible}
                width={650}
            >
                {selectedService && (
                    <div style={{ marginTop: -24, marginLeft: -24, marginRight: -24 }}>
                        {/* Gradient Header Card */}
                        <Card
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: 0,
                                marginBottom: 16
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                {selectedService.hinh_anh ? (
                                    <Image
                                        src={selectedService.hinh_anh}
                                        style={{ width: 100, height: 100, borderRadius: 8, objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: 8,
                                        background: 'rgba(255,255,255,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 40,
                                        color: 'white'
                                    }}>
                                        💆
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <h2 style={{ color: 'white', margin: 0, fontSize: 20 }}>
                                        {selectedService.ten_dich_vu}
                                    </h2>
                                    <p style={{ color: 'rgba(255,255,255,0.9)', margin: '4px 0 0 0' }}>
                                        {selectedService.ma_dich_vu}
                                    </p>
                                    <Tag color={selectedService.trang_thai === 'hoat_dong' ? 'success' : 'error'} style={{ marginTop: 8 }}>
                                        {selectedService.trang_thai === 'hoat_dong' ? 'Hoạt động' : 'Ngừng hoạt động'}
                                    </Tag>
                                </div>
                            </div>
                        </Card>

                        <div style={{ padding: '0 24px' }}>
                            {/* Price & Performance Cards */}
                            <Row gutter={16} style={{ marginBottom: 16 }}>
                                <Col span={12}>
                                    <Card size="small">
                                        <Statistic
                                            title="Giá dịch vụ"
                                            value={selectedService.gia}
                                            suffix="VNĐ"
                                            valueStyle={{ color: '#3f8600', fontSize: 18 }}
                                        />
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card size="small">
                                        <Statistic
                                            title="Thời gian"
                                            value={selectedService.thoi_gian_thuc_hien}
                                            suffix="phút"
                                            valueStyle={{ color: '#1890ff', fontSize: 18 }}
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            {/* Performance Stats */}
                            <Card
                                title="Hiệu suất sử dụng"
                                size="small"
                                style={{ marginBottom: 16 }}
                            >
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Statistic
                                            title="Số lần sử dụng"
                                            value={selectedService.so_luong_da_su_dung}
                                            suffix="lần"
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="Doanh thu"
                                            value={selectedService.doanh_thu}
                                            suffix="VNĐ"
                                            valueStyle={{ color: '#52c41a' }}
                                        />
                                    </Col>
                                </Row>
                            </Card>

                            {/* Materials Section */}
                            {selectedService.nguyen_lieu && selectedService.nguyen_lieu.length > 0 && (
                                <Card
                                    title="Nguyên liệu tiêu hao"
                                    size="small"
                                    style={{ marginBottom: 16 }}
                                >
                                    <Table
                                        dataSource={selectedService.nguyen_lieu}
                                        pagination={false}
                                        size="small"
                                        rowKey={(record, index) => index || 0}
                                    >
                                        <Table.Column
                                            title="Sản phẩm"
                                            dataIndex="ten_san_pham"
                                            key="ten_san_pham"
                                            render={(text, record: any) => (
                                                <div>
                                                    <div>{record.ma_san_pham}</div>
                                                    <div style={{ fontSize: 12, color: '#666' }}>{text}</div>
                                                </div>
                                            )}
                                        />
                                        <Table.Column
                                            title="Số lượng"
                                            dataIndex="so_luong"
                                            key="so_luong"
                                            width={100}
                                            render={(text, record: any) => `${text} ${record.don_vi_su_dung || record.don_vi}`}
                                        />
                                        <Table.Column
                                            title="Giá vốn"
                                            dataIndex="gia_von"
                                            key="gia_von"
                                            width={120}
                                            render={(text) => `${Number(text || 0).toLocaleString()}đ`}
                                        />
                                        <Table.Column
                                            title="Thành tiền"
                                            dataIndex="thanh_tien"
                                            key="thanh_tien"
                                            width={120}
                                            render={(text) => (
                                                <strong style={{ color: '#52c41a' }}>
                                                    {Number(text || 0).toLocaleString()}đ
                                                </strong>
                                            )}
                                        />
                                    </Table>
                                </Card>
                            )}

                            {/* Service Info */}
                            <Card title="Thông tin dịch vụ" size="small" style={{ marginBottom: 16 }}>
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Danh mục">
                                        {selectedService.danh_muc?.ten_danh_muc || 'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Yêu cầu kỹ năng">
                                        {selectedService.yeu_cau_ky_nang && selectedService.yeu_cau_ky_nang.length > 0 ? (
                                            <Space wrap>
                                                {selectedService.yeu_cau_ky_nang.map((skill, idx) => (
                                                    <Tag key={idx} color="blue">{skill}</Tag>
                                                ))}
                                            </Space>
                                        ) : 'Không có'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày tạo">
                                        {dayjs(selectedService.created_at).format('DD/MM/YYYY HH:mm')}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>

                            {/* Description */}
                            {selectedService.mo_ta && (
                                <Card title="Mô tả" size="small">
                                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{selectedService.mo_ta}</p>
                                </Card>
                            )}
                        </div>
                    </div>
                )}
            </Drawer>

            {/* Quick Create Category Modal */}
            <Modal
                title="Thêm danh mục mới"
                open={categoryModalVisible}
                onCancel={() => setCategoryModalVisible(false)}
                onOk={handleCategorySubmit}
                width={500}
                okText="Tạo mới"
                cancelText="Hủy"
            >
                <Form form={categoryForm} layout="vertical">
                    <Form.Item
                        name="ten_danh_muc"
                        label="Tên danh mục"
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                    >
                        <Input placeholder="VD: Chăm sóc da mặt" />
                    </Form.Item>
                    <Form.Item
                        name="mo_ta"
                        label="Mô tả"
                    >
                        <TextArea rows={3} placeholder="Mô tả về danh mục..." />
                    </Form.Item>
                    <Form.Item
                        name="thu_tu"
                        label="Thứ tự"
                        initialValue={0}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Quick Create Skill Modal */}
            <Modal
                title="Thêm kỹ năng mới"
                open={skillModalVisible}
                onCancel={() => setSkillModalVisible(false)}
                onOk={handleSkillSubmit}
                width={500}
                okText="Tạo mới"
                cancelText="Hủy"
            >
                <Form form={skillForm} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên kỹ năng"
                        rules={[{ required: true, message: 'Vui lòng nhập tên kỹ năng' }]}
                    >
                        <Input placeholder="VD: Massage, Chăm sóc da..." />
                    </Form.Item>
                    <Form.Item
                        name="color"
                        label="Màu đánh dấu"
                    >
                        <Input type="color" />
                    </Form.Item>
                    <Form.Item
                        name="note"
                        label="Ghi chú"
                    >
                        <TextArea rows={3} placeholder="Ghi chú về kỹ năng..." />
                    </Form.Item>
                    <Form.Item
                        name="sort_order"
                        label="Thứ tự"
                        initialValue={0}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ServiceList;
