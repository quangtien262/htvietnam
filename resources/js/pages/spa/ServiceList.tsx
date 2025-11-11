import React, { useState, useEffect } from 'react';
import {
    Card, Table, Button, Space, Input, Select, Tag, Modal, Form, InputNumber,
    message, Popconfirm, Upload, Image, Row, Col, Divider, Drawer, Descriptions,
    Switch, TreeSelect, Badge
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
    thoi_gian_thuc_hien: number;
    mo_ta?: string;
    hinh_anh?: string;
    trang_thai: string;
    yeu_cau_ky_nang?: string[];
    so_luong_da_su_dung: number;
    doanh_thu: number;
    created_at: string;
}

interface Category {
    id: number;
    ten_danh_muc: string;
    mo_ta?: string;
    thu_tu: number;
}

const ServiceList: React.FC = () => {
    // State
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

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
        loadCategories();
    }, [pagination.current, pagination.pageSize, searchText, selectedCategory, selectedStatus]);

    const loadServices = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/aio/api/admin/spa/services/list', {
                page: pagination.current,
                limit: pagination.pageSize,
                search: searchText,
                danh_muc_id: selectedCategory,
                trang_thai: selectedStatus,
            });

            if (response.data.success) {
                setServices(response.data.data.data || []);
                setPagination({
                    ...pagination,
                    total: response.data.data.total || 0,
                });
            }
        } catch (error) {
            message.error('Không thể tải danh sách dịch vụ');
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

    // Handlers
    const handleCreate = () => {
        form.resetFields();
        setImageUrl('');
        setSelectedService(null);
        setModalVisible(true);
    };

    const handleEdit = (record: Service) => {
        setSelectedService(record);
        form.setFieldsValue({
            ...record,
            yeu_cau_ky_nang: record.yeu_cau_ky_nang || [],
        });
        setImageUrl(record.hinh_anh || '');
        setModalVisible(true);
    };

    const handleView = (record: Service) => {
        setSelectedService(record);
        setDetailDrawerVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                id: selectedService?.id,
                ...values,
                hinh_anh: imageUrl,
            };

            const response = await axios.post('/aio/api/admin/spa/services/create-or-update', payload);

            if (response.data.success) {
                message.success(selectedService ? 'Cập nhật dịch vụ thành công' : 'Tạo dịch vụ mới thành công');
                setModalVisible(false);
                loadServices();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await axios.post('/aio/api/admin/spa/services/delete', { id });
            if (response.data.success) {
                message.success('Xóa dịch vụ thành công');
                loadServices();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể xóa dịch vụ');
        }
    };

    const handleStatusToggle = async (record: Service) => {
        try {
            const newStatus = record.trang_thai === 'hoat_dong' ? 'ngung_hoat_dong' : 'hoat_dong';
            const response = await axios.post('/aio/api/admin/spa/services/create-or-update', {
                id: record.id,
                trang_thai: newStatus,
            });

            if (response.data.success) {
                message.success('Cập nhật trạng thái thành công');
                loadServices();
            }
        } catch (error) {
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
                        <Tag size="small" color="blue">{record.danh_muc.ten_danh_muc}</Tag>
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
                    <DollarOutlined /> {value.toLocaleString()} VNĐ
                </span>
            ),
            sorter: (a, b) => a.gia - b.gia,
        },
        {
            title: 'Thời gian',
            dataIndex: 'thoi_gian_thuc_hien',
            key: 'thoi_gian_thuc_hien',
            width: 100,
            render: (value: number) => (
                <span>
                    <ClockCircleOutlined /> {value} phút
                </span>
            ),
            sorter: (a, b) => a.thoi_gian_thuc_hien - b.thoi_gian_thuc_hien,
        },
        {
            title: 'Số lần sử dụng',
            dataIndex: 'so_luong_da_su_dung',
            key: 'so_luong_da_su_dung',
            width: 120,
            align: 'center',
            render: (value: number) => <Badge count={value} showZero color="blue" />,
            sorter: (a, b) => a.so_luong_da_su_dung - b.so_luong_da_su_dung,
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
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                width={800}
                okText={selectedService ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="ma_dich_vu"
                                label="Mã dịch vụ"
                                rules={[{ required: true, message: 'Vui lòng nhập mã dịch vụ' }]}
                            >
                                <Input placeholder="VD: DV001" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
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
                                label="Yêu cầu kỹ năng"
                            >
                                <Select mode="tags" placeholder="Nhập và Enter để thêm kỹ năng">
                                    <Option value="Massage">Massage</Option>
                                    <Option value="Chăm sóc da">Chăm sóc da</Option>
                                    <Option value="Tắm trắng">Tắm trắng</Option>
                                    <Option value="Triệt lông">Triệt lông</Option>
                                </Select>
                            </Form.Item>
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
                width={500}
            >
                {selectedService && (
                    <div>
                        {selectedService.hinh_anh && (
                            <Image
                                src={selectedService.hinh_anh}
                                style={{ width: '100%', marginBottom: 16, borderRadius: 8 }}
                            />
                        )}
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Mã dịch vụ">{selectedService.ma_dich_vu}</Descriptions.Item>
                            <Descriptions.Item label="Tên dịch vụ">{selectedService.ten_dich_vu}</Descriptions.Item>
                            <Descriptions.Item label="Danh mục">
                                {selectedService.danh_muc?.ten_danh_muc || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá">
                                <strong style={{ color: '#52c41a', fontSize: 16 }}>
                                    {selectedService.gia.toLocaleString()} VNĐ
                                </strong>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian">
                                {selectedService.thoi_gian_thuc_hien} phút
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
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={selectedService.trang_thai === 'hoat_dong' ? 'green' : 'red'}>
                                    {selectedService.trang_thai === 'hoat_dong' ? 'Hoạt động' : 'Ngừng hoạt động'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số lần sử dụng">
                                {selectedService.so_luong_da_su_dung} lần
                            </Descriptions.Item>
                            <Descriptions.Item label="Doanh thu">
                                {selectedService.doanh_thu.toLocaleString()} VNĐ
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {dayjs(selectedService.created_at).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        </Descriptions>
                        {selectedService.mo_ta && (
                            <div style={{ marginTop: 16 }}>
                                <Divider>Mô tả</Divider>
                                <p>{selectedService.mo_ta}</p>
                            </div>
                        )}
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default ServiceList;
