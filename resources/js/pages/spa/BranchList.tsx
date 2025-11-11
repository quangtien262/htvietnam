import React, { useState, useEffect } from 'react';
import {
    Card, Table, Button, Space, Input, Modal, Form, message, Popconfirm, Row, Col,
    Divider, Drawer, Descriptions, Tag, Badge, Statistic, Switch, TimePicker, Select
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EnvironmentOutlined,
    EyeOutlined, PhoneOutlined, MailOutlined, ClockCircleOutlined, CheckCircleOutlined,
    ShopOutlined, UserOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

interface Branch {
    id: number;
    ten_chi_nhanh: string;
    dia_chi: string;
    thanh_pho: string;
    so_dien_thoai: string;
    email?: string;
    gio_mo_cua: string;
    gio_dong_cua: string;
    so_phong: number;
    so_nhan_vien: number;
    doanh_thu_thang: number;
    trang_thai: string;
    created_at: string;
}

const BranchList: React.FC = () => {
    // State
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

    // Filters
    const [searchText, setSearchText] = useState('');

    // Pagination
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Form
    const [form] = Form.useForm();

    // Stats
    const [stats, setStats] = useState({
        totalBranches: 0,
        activeBranches: 0,
        totalRooms: 0,
        totalStaff: 0,
    });

    useEffect(() => {
        loadBranches();
    }, [pagination.current, pagination.pageSize, searchText]);

    const loadBranches = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/aio/api/admin/spa/branches/list', {
                page: pagination.current,
                limit: pagination.pageSize,
                search: searchText,
            });

            if (response.data.success) {
                const data = response.data.data;
                setBranches(data.data || []);
                setPagination({
                    ...pagination,
                    total: data.total || 0,
                });

                if (data.stats) {
                    setStats(data.stats);
                }
            }
        } catch (error) {
            message.error('Không thể tải danh sách chi nhánh');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        form.resetFields();
        setSelectedBranch(null);
        setModalVisible(true);
    };

    const handleEdit = (record: Branch) => {
        setSelectedBranch(record);
        form.setFieldsValue({
            ...record,
            gio_mo_cua: dayjs(record.gio_mo_cua, 'HH:mm'),
            gio_dong_cua: dayjs(record.gio_dong_cua, 'HH:mm'),
        });
        setModalVisible(true);
    };

    const handleView = (record: Branch) => {
        setSelectedBranch(record);
        setDetailDrawerVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                id: selectedBranch?.id,
                ...values,
                gio_mo_cua: values.gio_mo_cua.format('HH:mm'),
                gio_dong_cua: values.gio_dong_cua.format('HH:mm'),
            };

            const response = await axios.post('/aio/api/admin/spa/branches/create-or-update', payload);

            if (response.data.success) {
                message.success(selectedBranch ? 'Cập nhật chi nhánh thành công' : 'Tạo chi nhánh mới thành công');
                setModalVisible(false);
                loadBranches();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await axios.post('/aio/api/admin/spa/branches/delete', { id });
            if (response.data.success) {
                message.success('Xóa chi nhánh thành công');
                loadBranches();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể xóa chi nhánh');
        }
    };

    const handleStatusToggle = async (record: Branch) => {
        try {
            const newStatus = record.trang_thai === 'hoat_dong' ? 'tam_ngung' : 'hoat_dong';
            const response = await axios.post('/aio/api/admin/spa/branches/create-or-update', {
                id: record.id,
                trang_thai: newStatus,
            });

            if (response.data.success) {
                message.success('Cập nhật trạng thái thành công');
                loadBranches();
            }
        } catch (error) {
            message.error('Không thể cập nhật trạng thái');
        }
    };

    const columns: ColumnsType<Branch> = [
        {
            title: 'Chi nhánh',
            dataIndex: 'ten_chi_nhanh',
            key: 'ten_chi_nhanh',
            width: 200,
            fixed: 'left',
            render: (text: string, record) => (
                <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                        <ShopOutlined /> {text}
                    </div>
                    <Tag color={record.trang_thai === 'hoat_dong' ? 'green' : 'red'}>
                        {record.trang_thai === 'hoat_dong' ? 'Hoạt động' : 'Tạm ngừng'}
                    </Tag>
                </div>
            ),
        },
        {
            title: 'Địa chỉ',
            key: 'address',
            width: 300,
            render: (_, record) => (
                <div>
                    <div style={{ marginBottom: 4 }}>
                        <EnvironmentOutlined /> {record.dia_chi}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                        {record.thanh_pho}
                    </div>
                </div>
            ),
        },
        {
            title: 'Liên hệ',
            key: 'contact',
            width: 200,
            render: (_, record) => (
                <div>
                    <div style={{ marginBottom: 4 }}>
                        <PhoneOutlined /> {record.so_dien_thoai}
                    </div>
                    {record.email && (
                        <div style={{ fontSize: 12, color: '#666' }}>
                            <MailOutlined /> {record.email}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Giờ hoạt động',
            key: 'hours',
            width: 150,
            render: (_, record) => (
                <div>
                    <ClockCircleOutlined />
                    <span style={{ marginLeft: 4 }}>
                        {record.gio_mo_cua} - {record.gio_dong_cua}
                    </span>
                </div>
            ),
        },
        {
            title: 'Phòng',
            dataIndex: 'so_phong',
            key: 'so_phong',
            align: 'center',
            width: 100,
            render: (value: number) => <Badge count={value} showZero color="blue" />,
        },
        {
            title: 'Nhân viên',
            dataIndex: 'so_nhan_vien',
            key: 'so_nhan_vien',
            align: 'center',
            width: 100,
            render: (value: number) => <Badge count={value} showZero color="green" />,
        },
        {
            title: 'Doanh thu tháng',
            dataIndex: 'doanh_thu_thang',
            key: 'doanh_thu_thang',
            align: 'right',
            width: 150,
            render: (value: number) => (
                <div>
                    <div style={{ fontWeight: 500, color: '#f5222d', fontSize: 14 }}>
                        {value.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>VNĐ</div>
                </div>
            ),
        },
        {
            title: 'Kích hoạt',
            key: 'active',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Switch
                    checked={record.trang_thai === 'hoat_dong'}
                    onChange={() => handleStatusToggle(record)}
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
                        title="Xác nhận xóa chi nhánh này?"
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
                            title="Tổng chi nhánh"
                            value={stats.totalBranches}
                            prefix={<ShopOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đang hoạt động"
                            value={stats.activeBranches}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng phòng"
                            value={stats.totalRooms}
                            prefix={<EnvironmentOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng nhân viên"
                            value={stats.totalStaff}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title={
                    <Space>
                        <ShopOutlined />
                        <span>Quản lý Chi nhánh</span>
                        <Badge count={pagination.total} showZero />
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Thêm chi nhánh
                    </Button>
                }
            >
                <Space style={{ marginBottom: 16, width: '100%' }}>
                    <Input.Search
                        placeholder="Tìm kiếm tên, địa chỉ chi nhánh..."
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        prefix={<SearchOutlined />}
                        style={{ width: 400 }}
                    />
                </Space>

                <Table
                    columns={columns}
                    dataSource={branches}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} chi nhánh`,
                        onChange: (page, pageSize) => {
                            setPagination({ ...pagination, current: page, pageSize });
                        },
                    }}
                    scroll={{ x: 1600 }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={selectedBranch ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh mới'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                width={800}
                okText={selectedBranch ? 'Cập nhật' : 'Thêm mới'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="ten_chi_nhanh"
                                label="Tên chi nhánh"
                                rules={[{ required: true, message: 'Vui lòng nhập tên chi nhánh' }]}
                            >
                                <Input placeholder="VD: Spa Hà Nội" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="thanh_pho"
                                label="Thành phố"
                                rules={[{ required: true, message: 'Vui lòng chọn thành phố' }]}
                            >
                                <Select placeholder="Chọn thành phố">
                                    <Option value="Hà Nội">Hà Nội</Option>
                                    <Option value="Hồ Chí Minh">Hồ Chí Minh</Option>
                                    <Option value="Đà Nẵng">Đà Nẵng</Option>
                                    <Option value="Hải Phòng">Hải Phòng</Option>
                                    <Option value="Cần Thơ">Cần Thơ</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="dia_chi"
                                label="Địa chỉ"
                                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                            >
                                <Input placeholder="Số nhà, tên đường, quận/huyện" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="so_dien_thoai"
                                label="Số điện thoại"
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                            >
                                <Input placeholder="0123456789" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
                            >
                                <Input placeholder="spa@example.com" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="gio_mo_cua"
                                label="Giờ mở cửa"
                                rules={[{ required: true, message: 'Vui lòng chọn giờ mở cửa' }]}
                            >
                                <TimePicker format="HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="gio_dong_cua"
                                label="Giờ đóng cửa"
                                rules={[{ required: true, message: 'Vui lòng chọn giờ đóng cửa' }]}
                            >
                                <TimePicker format="HH:mm" style={{ width: '100%' }} />
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
                                    <Option value="tam_ngung">Tạm ngừng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Detail Drawer */}
            <Drawer
                title="Chi tiết chi nhánh"
                placement="right"
                onClose={() => setDetailDrawerVisible(false)}
                open={detailDrawerVisible}
                width={600}
            >
                {selectedBranch && (
                    <div>
                        <Divider>Thông tin cơ bản</Divider>
                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Tên chi nhánh">
                                {selectedBranch.ten_chi_nhanh}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ">
                                {selectedBranch.dia_chi}, {selectedBranch.thanh_pho}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                <PhoneOutlined /> {selectedBranch.so_dien_thoai}
                            </Descriptions.Item>
                            {selectedBranch.email && (
                                <Descriptions.Item label="Email">
                                    <MailOutlined /> {selectedBranch.email}
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Giờ hoạt động">
                                <ClockCircleOutlined /> {selectedBranch.gio_mo_cua} - {selectedBranch.gio_dong_cua}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={selectedBranch.trang_thai === 'hoat_dong' ? 'green' : 'red'}>
                                    {selectedBranch.trang_thai === 'hoat_dong' ? 'Hoạt động' : 'Tạm ngừng'}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider>Thống kê</Divider>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Card size="small">
                                    <Statistic
                                        title="Số phòng"
                                        value={selectedBranch.so_phong}
                                        prefix={<EnvironmentOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small">
                                    <Statistic
                                        title="Nhân viên"
                                        value={selectedBranch.so_nhan_vien}
                                        prefix={<UserOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={24} style={{ marginTop: 16 }}>
                                <Card size="small">
                                    <Statistic
                                        title="Doanh thu tháng này"
                                        value={selectedBranch.doanh_thu_thang}
                                        suffix="VNĐ"
                                        valueStyle={{ color: '#f5222d' }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <Divider />
                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Ngày tạo">
                                {dayjs(selectedBranch.created_at).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default BranchList;
