import React, { useState, useEffect } from 'react';
import {
    Card, Table, Button, Space, Input, Select, Tag, Modal, Form, InputNumber,
    message, Popconfirm, Upload, Image, Row, Col, Divider, Drawer, Descriptions,
    Switch, Badge, Alert, Progress, Tooltip, Statistic, Rate, Avatar
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, TeamOutlined,
    UploadOutlined, EyeOutlined, PhoneOutlined, MailOutlined, IdcardOutlined,
    StarOutlined, CalendarOutlined, DollarOutlined, TrophyOutlined, UserOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface Staff {
    id: number;
    ma_nhan_vien: string;
    ho_ten: string;
    gioi_tinh: string;
    ngay_sinh?: string;
    so_dien_thoai: string;
    email?: string;
    dia_chi?: string;
    hinh_anh?: string;
    chi_nhanh_id?: number;
    chi_nhanh?: {
        id: number;
        ten_chi_nhanh: string;
    };
    chuc_vu: string;
    chuyen_mon?: string;
    kinh_nghiem_nam?: number;
    luong_co_ban: number;
    ty_le_hoa_hong: number;
    trang_thai: string;
    rating?: number;
    so_gio_lam_viec: number;
    so_khach_hang_phuc_vu: number;
    doanh_thu: number;
    tong_hoa_hong: number;
    created_at: string;
}

interface Branch {
    id: number;
    ten_chi_nhanh: string;
}

const StaffList: React.FC = () => {
    // State
    const [staff, setStaff] = useState<Staff[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

    // Filters
    const [searchText, setSearchText] = useState('');
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
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

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        topPerformer: 0,
        totalCommission: 0,
    });

    // Load data
    useEffect(() => {
        loadStaff();
        loadBranches();
    }, [pagination.current, pagination.pageSize, searchText, selectedBranch, selectedPosition, selectedStatus]);

    const loadStaff = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/aio/api/admin/spa/staff/list', {
                page: pagination.current,
                limit: pagination.pageSize,
                search: searchText,
                chi_nhanh_id: selectedBranch,
                chuc_vu: selectedPosition,
                trang_thai: selectedStatus,
            });

            if (response.data.success) {
                const data = response.data.data;
                setStaff(data.data || []);
                setPagination({
                    ...pagination,
                    total: data.total || 0,
                });

                if (data.stats) {
                    setStats(data.stats);
                }
            }
        } catch (error) {
            message.error('Không thể tải danh sách nhân viên');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadBranches = async () => {
        try {
            const response = await axios.post('/aio/api/admin/spa/branches/list');
            if (response.data.success) {
                setBranches(response.data.data.data || []);
            }
        } catch (error) {
            console.error('Load branches error:', error);
        }
    };

    // Handlers
    const handleCreate = () => {
        form.resetFields();
        setImageUrl('');
        setSelectedStaff(null);
        setModalVisible(true);
    };

    const handleEdit = (record: Staff) => {
        setSelectedStaff(record);
        form.setFieldsValue({
            ...record,
            ngay_sinh: record.ngay_sinh ? dayjs(record.ngay_sinh) : null,
        });
        setImageUrl(record.hinh_anh || '');
        setModalVisible(true);
    };

    const handleView = (record: Staff) => {
        setSelectedStaff(record);
        setDetailDrawerVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                id: selectedStaff?.id,
                ...values,
                hinh_anh: imageUrl,
                ngay_sinh: values.ngay_sinh ? dayjs(values.ngay_sinh).format('YYYY-MM-DD') : null,
            };

            const response = await axios.post('/aio/api/admin/spa/staff/create-or-update', payload);

            if (response.data.success) {
                message.success(selectedStaff ? 'Cập nhật nhân viên thành công' : 'Tạo nhân viên mới thành công');
                setModalVisible(false);
                loadStaff();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await axios.post('/aio/api/admin/spa/staff/delete', { id });
            if (response.data.success) {
                message.success('Xóa nhân viên thành công');
                loadStaff();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể xóa nhân viên');
        }
    };

    const handleStatusToggle = async (record: Staff) => {
        try {
            const newStatus = record.trang_thai === 'dang_lam_viec' ? 'nghi_viec' : 'dang_lam_viec';
            const response = await axios.post('/aio/api/admin/spa/staff/create-or-update', {
                id: record.id,
                trang_thai: newStatus,
            });

            if (response.data.success) {
                message.success('Cập nhật trạng thái thành công');
                loadStaff();
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

    const getPerformanceLevel = (staff: Staff) => {
        if (staff.doanh_thu >= 50000000) {
            return { text: 'Xuất sắc', color: 'gold', icon: <TrophyOutlined /> };
        } else if (staff.doanh_thu >= 30000000) {
            return { text: 'Giỏi', color: 'green', icon: <StarOutlined /> };
        } else if (staff.doanh_thu >= 15000000) {
            return { text: 'Khá', color: 'blue', icon: <StarOutlined /> };
        }
        return { text: 'Trung bình', color: 'default', icon: <StarOutlined /> };
    };

    // Table columns
    const columns: ColumnsType<Staff> = [
        {
            title: 'Mã NV',
            dataIndex: 'ma_nhan_vien',
            key: 'ma_nhan_vien',
            width: 100,
            fixed: 'left',
        },
        {
            title: 'Nhân viên',
            key: 'info',
            width: 250,
            fixed: 'left',
            render: (_, record: Staff) => (
                <Space>
                    <Avatar
                        size={48}
                        src={record.hinh_anh}
                        icon={<UserOutlined />}
                    />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.ho_ten}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                            <PhoneOutlined /> {record.so_dien_thoai}
                        </div>
                        {record.rating && (
                            <Rate disabled value={record.rating} style={{ fontSize: 12 }} />
                        )}
                    </div>
                </Space>
            ),
        },
        {
            title: 'Chức vụ',
            dataIndex: 'chuc_vu',
            key: 'chuc_vu',
            width: 140,
            render: (value: string) => {
                const colorMap: Record<string, string> = {
                    'quan_ly': 'red',
                    'ky_thuat_vien': 'blue',
                    'nhan_vien_tu_van': 'green',
                    'le_tan': 'orange',
                    'thu_ngan': 'purple',
                };
                const labelMap: Record<string, string> = {
                    'quan_ly': 'Quản lý',
                    'ky_thuat_vien': 'Kỹ thuật viên',
                    'nhan_vien_tu_van': 'Tư vấn',
                    'le_tan': 'Lễ tân',
                    'thu_ngan': 'Thu ngân',
                };
                return <Tag color={colorMap[value]}>{labelMap[value] || value}</Tag>;
            },
            filters: [
                { text: 'Quản lý', value: 'quan_ly' },
                { text: 'Kỹ thuật viên', value: 'ky_thuat_vien' },
                { text: 'Tư vấn', value: 'nhan_vien_tu_van' },
                { text: 'Lễ tân', value: 'le_tan' },
                { text: 'Thu ngân', value: 'thu_ngan' },
            ],
        },
        {
            title: 'Chi nhánh',
            key: 'branch',
            width: 140,
            render: (_, record) => record.chi_nhanh?.ten_chi_nhanh || 'N/A',
        },
        {
            title: 'Chuyên môn',
            dataIndex: 'chuyen_mon',
            key: 'chuyen_mon',
            width: 150,
            render: (value?: string) => value || 'N/A',
        },
        {
            title: 'Kinh nghiệm',
            dataIndex: 'kinh_nghiem_nam',
            key: 'kinh_nghiem_nam',
            width: 100,
            align: 'center',
            render: (value?: number) => value ? `${value} năm` : 'N/A',
            sorter: (a, b) => (a.kinh_nghiem_nam || 0) - (b.kinh_nghiem_nam || 0),
        },
        {
            title: 'Lương CB',
            dataIndex: 'luong_co_ban',
            key: 'luong_co_ban',
            width: 130,
            align: 'right',
            render: (value: number) => `${value.toLocaleString()} VNĐ`,
        },
        {
            title: 'Hoa hồng',
            dataIndex: 'ty_le_hoa_hong',
            key: 'ty_le_hoa_hong',
            width: 90,
            align: 'center',
            render: (value: number) => <Tag color="green">{value}%</Tag>,
        },
        {
            title: 'Giờ làm',
            dataIndex: 'so_gio_lam_viec',
            key: 'so_gio_lam_viec',
            width: 90,
            align: 'center',
            render: (value: number) => `${value}h`,
            sorter: (a, b) => a.so_gio_lam_viec - b.so_gio_lam_viec,
        },
        {
            title: 'KH phục vụ',
            dataIndex: 'so_khach_hang_phuc_vu',
            key: 'so_khach_hang_phuc_vu',
            width: 110,
            align: 'center',
            render: (value: number) => <Badge count={value} showZero color="blue" overflowCount={999} />,
            sorter: (a, b) => a.so_khach_hang_phuc_vu - b.so_khach_hang_phuc_vu,
        },
        {
            title: 'Doanh thu',
            dataIndex: 'doanh_thu',
            key: 'doanh_thu',
            width: 150,
            align: 'right',
            render: (value: number) => (
                <span style={{ fontWeight: 500, color: '#52c41a' }}>
                    {value.toLocaleString()} VNĐ
                </span>
            ),
            sorter: (a, b) => a.doanh_thu - b.doanh_thu,
        },
        {
            title: 'Hiệu suất',
            key: 'performance',
            width: 120,
            render: (_, record) => {
                const perf = getPerformanceLevel(record);
                return (
                    <Tag color={perf.color} icon={perf.icon}>
                        {perf.text}
                    </Tag>
                );
            },
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 140,
            render: (_, record: Staff) => (
                <Switch
                    checked={record.trang_thai === 'dang_lam_viec'}
                    onChange={() => handleStatusToggle(record)}
                    checkedChildren="Đang làm"
                    unCheckedChildren="Nghỉ việc"
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
                        title="Xác nhận xóa nhân viên này?"
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

    return (
        <div style={{ padding: 24 }}>
            {/* Stats Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng nhân viên"
                            value={stats.total}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đang làm việc"
                            value={stats.active}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Xuất sắc"
                            value={stats.topPerformer}
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng hoa hồng"
                            value={stats.totalCommission}
                            prefix={<DollarOutlined />}
                            suffix="VNĐ"
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title={
                    <Space>
                        <TeamOutlined />
                        <span>Quản lý Nhân viên</span>
                        <Badge count={pagination.total} showZero />
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Thêm nhân viên
                    </Button>
                }
            >
                {/* Filters */}
                <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={6}>
                            <Input.Search
                                placeholder="Tìm kiếm tên, SĐT, mã NV..."
                                allowClear
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                prefix={<SearchOutlined />}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="Chi nhánh"
                                allowClear
                                style={{ width: '100%' }}
                                value={selectedBranch}
                                onChange={setSelectedBranch}
                            >
                                {branches.map(branch => (
                                    <Option key={branch.id} value={branch.id}>
                                        {branch.ten_chi_nhanh}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="Chức vụ"
                                allowClear
                                style={{ width: '100%' }}
                                value={selectedPosition}
                                onChange={setSelectedPosition}
                            >
                                <Option value="quan_ly">Quản lý</Option>
                                <Option value="ky_thuat_vien">Kỹ thuật viên</Option>
                                <Option value="nhan_vien_tu_van">Tư vấn</Option>
                                <Option value="le_tan">Lễ tân</Option>
                                <Option value="thu_ngan">Thu ngân</Option>
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
                                <Option value="dang_lam_viec">Đang làm việc</Option>
                                <Option value="nghi_viec">Nghỉ việc</Option>
                            </Select>
                        </Col>
                    </Row>
                </Space>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={staff}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} nhân viên`,
                        onChange: (page, pageSize) => {
                            setPagination({ ...pagination, current: page, pageSize });
                        },
                    }}
                    scroll={{ x: 2000 }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={selectedStaff ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                width={900}
                okText={selectedStaff ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="ma_nhan_vien"
                                label="Mã nhân viên"
                                rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
                            >
                                <Input placeholder="VD: NV001" prefix={<IdcardOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item
                                name="ho_ten"
                                label="Họ và tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                            >
                                <Input placeholder="VD: Nguyễn Văn A" prefix={<UserOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="gioi_tinh"
                                label="Giới tính"
                                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                            >
                                <Select placeholder="Chọn giới tính">
                                    <Option value="nam">Nam</Option>
                                    <Option value="nu">Nữ</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="ngay_sinh" label="Ngày sinh">
                                <Input type="date" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="so_dien_thoai"
                                label="Số điện thoại"
                                rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
                            >
                                <Input placeholder="0987654321" prefix={<PhoneOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
                            >
                                <Input placeholder="email@example.com" prefix={<MailOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="chi_nhanh_id" label="Chi nhánh">
                                <Select placeholder="Chọn chi nhánh">
                                    {branches.map(branch => (
                                        <Option key={branch.id} value={branch.id}>
                                            {branch.ten_chi_nhanh}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="chuc_vu"
                                label="Chức vụ"
                                rules={[{ required: true, message: 'Vui lòng chọn chức vụ' }]}
                            >
                                <Select placeholder="Chọn chức vụ">
                                    <Option value="quan_ly">Quản lý</Option>
                                    <Option value="ky_thuat_vien">Kỹ thuật viên</Option>
                                    <Option value="nhan_vien_tu_van">Tư vấn</Option>
                                    <Option value="le_tan">Lễ tân</Option>
                                    <Option value="thu_ngan">Thu ngân</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="chuyen_mon" label="Chuyên môn">
                                <Input placeholder="VD: Chăm sóc da, Massage..." />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="kinh_nghiem_nam" label="Kinh nghiệm (năm)">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="luong_co_ban"
                                label="Lương cơ bản"
                                rules={[{ required: true, message: 'Vui lòng nhập lương' }]}
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
                                name="ty_le_hoa_hong"
                                label="Tỷ lệ hoa hồng (%)"
                                initialValue={10}
                            >
                                <InputNumber style={{ width: '100%' }} min={0} max={100} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="dia_chi" label="Địa chỉ">
                                <TextArea rows={2} placeholder="Địa chỉ thường trú..." />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="trang_thai" label="Trạng thái" initialValue="dang_lam_viec">
                                <Select>
                                    <Option value="dang_lam_viec">Đang làm việc</Option>
                                    <Option value="nghi_viec">Nghỉ việc</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="rating" label="Đánh giá">
                                <Rate />
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
                                            Upload ảnh đại diện
                                        </Button>
                                    </Upload>
                                    {imageUrl && (
                                        <Image src={imageUrl} width={120} />
                                    )}
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Detail Drawer */}
            <Drawer
                title="Hồ sơ nhân viên"
                placement="right"
                onClose={() => setDetailDrawerVisible(false)}
                open={detailDrawerVisible}
                width={600}
            >
                {selectedStaff && (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <Avatar
                                size={120}
                                src={selectedStaff.hinh_anh}
                                icon={<UserOutlined />}
                            />
                            <h2 style={{ marginTop: 16, marginBottom: 8 }}>{selectedStaff.ho_ten}</h2>
                            <Tag color="blue" style={{ fontSize: 14 }}>
                                {selectedStaff.ma_nhan_vien}
                            </Tag>
                            {selectedStaff.rating && (
                                <div style={{ marginTop: 8 }}>
                                    <Rate disabled value={selectedStaff.rating} />
                                </div>
                            )}
                        </div>

                        <Alert
                            message={getPerformanceLevel(selectedStaff).text}
                            description={`Doanh thu: ${selectedStaff.doanh_thu.toLocaleString()} VNĐ`}
                            type={selectedStaff.doanh_thu >= 30000000 ? 'success' : 'info'}
                            showIcon
                            icon={getPerformanceLevel(selectedStaff).icon}
                            style={{ marginBottom: 16 }}
                        />

                        {/* Performance Stats */}
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={8}>
                                <Card size="small">
                                    <Statistic
                                        title="Giờ làm"
                                        value={selectedStaff.so_gio_lam_viec}
                                        suffix="h"
                                        valueStyle={{ fontSize: 20 }}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card size="small">
                                    <Statistic
                                        title="Khách hàng"
                                        value={selectedStaff.so_khach_hang_phuc_vu}
                                        valueStyle={{ fontSize: 20 }}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card size="small">
                                    <Statistic
                                        title="Hoa hồng"
                                        value={selectedStaff.tong_hoa_hong}
                                        suffix="VNĐ"
                                        valueStyle={{ fontSize: 16 }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <Divider>Thông tin cá nhân</Divider>

                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Mã nhân viên">{selectedStaff.ma_nhan_vien}</Descriptions.Item>
                            <Descriptions.Item label="Họ và tên">{selectedStaff.ho_ten}</Descriptions.Item>
                            <Descriptions.Item label="Giới tính">
                                {selectedStaff.gioi_tinh === 'nam' ? 'Nam' : 'Nữ'}
                            </Descriptions.Item>
                            {selectedStaff.ngay_sinh && (
                                <Descriptions.Item label="Ngày sinh">
                                    {dayjs(selectedStaff.ngay_sinh).format('DD/MM/YYYY')}
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Số điện thoại">
                                <PhoneOutlined /> {selectedStaff.so_dien_thoai}
                            </Descriptions.Item>
                            {selectedStaff.email && (
                                <Descriptions.Item label="Email">
                                    <MailOutlined /> {selectedStaff.email}
                                </Descriptions.Item>
                            )}
                            {selectedStaff.dia_chi && (
                                <Descriptions.Item label="Địa chỉ">{selectedStaff.dia_chi}</Descriptions.Item>
                            )}
                        </Descriptions>

                        <Divider>Thông tin công việc</Divider>

                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Chi nhánh">
                                {selectedStaff.chi_nhanh?.ten_chi_nhanh || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Chức vụ">
                                <Tag color="blue">{selectedStaff.chuc_vu}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Chuyên môn">
                                {selectedStaff.chuyen_mon || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Kinh nghiệm">
                                {selectedStaff.kinh_nghiem_nam ? `${selectedStaff.kinh_nghiem_nam} năm` : 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lương cơ bản">
                                {selectedStaff.luong_co_ban.toLocaleString()} VNĐ
                            </Descriptions.Item>
                            <Descriptions.Item label="Tỷ lệ hoa hồng">
                                <Tag color="green">{selectedStaff.ty_le_hoa_hong}%</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={selectedStaff.trang_thai === 'dang_lam_viec' ? 'green' : 'red'}>
                                    {selectedStaff.trang_thai === 'dang_lam_viec' ? 'Đang làm việc' : 'Nghỉ việc'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày vào làm">
                                {dayjs(selectedStaff.created_at).format('DD/MM/YYYY')}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default StaffList;
