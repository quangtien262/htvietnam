import React, { useState, useEffect } from 'react';
import {
    Card, Table, Button, Space, Input, Modal, Form, message, Popconfirm, Row, Col,
    Divider, Drawer, Descriptions, Tag, Badge, Statistic, Switch, Select, InputNumber
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, HomeOutlined,
    EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, UserOutlined,
    CalendarOutlined, ShopOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

interface Room {
    id: number;
    chi_nhanh_id: number;
    ten_chi_nhanh?: string;
    ma_phong: string;
    ten_phong: string;
    loai_phong: string; // 'vip', 'standard', 'couple', 'group'
    suc_chua: number;
    tien_nghi?: string[];
    trang_thai: string; // 'san_sang', 'dang_su_dung', 'bao_tri'
    booking_hom_nay: number;
    doanh_thu_thang: number;
    created_at: string;
}

const RoomList: React.FC = () => {
    // State
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    // Filters
    const [searchText, setSearchText] = useState('');
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

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
        totalRooms: 0,
        availableRooms: 0,
        inUseRooms: 0,
        maintenanceRooms: 0,
    });

    // Branches list
    const [branches, setBranches] = useState<any[]>([]);

    useEffect(() => {
        loadBranches();
    }, []);

    useEffect(() => {
        loadRooms();
    }, [pagination.current, pagination.pageSize, searchText, selectedBranch, selectedType, selectedStatus]);

    const loadBranches = async () => {
        try {
            const response = await axios.post('/aio/api/admin/spa/branches/list', { limit: 100 });
            if (response.data.success) {
                setBranches(response.data.data.data || []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const loadRooms = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/aio/api/admin/spa/rooms/list', {
                page: pagination.current,
                limit: pagination.pageSize,
                search: searchText,
                chi_nhanh_id: selectedBranch,
                loai_phong: selectedType,
                trang_thai: selectedStatus,
            });

            if (response.data.success) {
                const data = response.data.data;
                setRooms(data.data || []);
                setPagination({
                    ...pagination,
                    total: data.total || 0,
                });

                if (data.stats) {
                    setStats(data.stats);
                }
            }
        } catch (error) {
            message.error('Không thể tải danh sách phòng');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        form.resetFields();
        setSelectedRoom(null);
        setModalVisible(true);
    };

    const handleEdit = (record: Room) => {
        setSelectedRoom(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleView = (record: Room) => {
        setSelectedRoom(record);
        setDetailDrawerVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                id: selectedRoom?.id,
                ...values,
            };

            const response = await axios.post('/aio/api/admin/spa/rooms/create-or-update', payload);

            if (response.data.success) {
                message.success(selectedRoom ? 'Cập nhật phòng thành công' : 'Tạo phòng mới thành công');
                setModalVisible(false);
                loadRooms();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await axios.post('/aio/api/admin/spa/rooms/delete', { id });
            if (response.data.success) {
                message.success('Xóa phòng thành công');
                loadRooms();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể xóa phòng');
        }
    };

    const handleStatusChange = async (record: Room, newStatus: string) => {
        try {
            const response = await axios.post('/aio/api/admin/spa/rooms/create-or-update', {
                id: record.id,
                trang_thai: newStatus,
            });

            if (response.data.success) {
                message.success('Cập nhật trạng thái thành công');
                loadRooms();
            }
        } catch (error) {
            message.error('Không thể cập nhật trạng thái');
        }
    };

    const getRoomTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'vip': 'VIP',
            'standard': 'Tiêu chuẩn',
            'couple': 'Đôi',
            'group': 'Nhóm',
        };
        return labels[type] || type;
    };

    const getRoomTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'vip': 'gold',
            'standard': 'blue',
            'couple': 'purple',
            'group': 'green',
        };
        return colors[type] || 'default';
    };

    const getRoomStatus = (status: string) => {
        const statuses: Record<string, { text: string; color: string; icon: React.ReactNode }> = {
            'san_sang': { text: 'Sẵn sàng', color: 'green', icon: <CheckCircleOutlined /> },
            'dang_su_dung': { text: 'Đang sử dụng', color: 'blue', icon: <UserOutlined /> },
            'bao_tri': { text: 'Bảo trì', color: 'red', icon: <CloseCircleOutlined /> },
        };
        return statuses[status] || statuses['san_sang'];
    };

    const columns: ColumnsType<Room> = [
        {
            title: 'Mã phòng',
            dataIndex: 'ma_phong',
            key: 'ma_phong',
            width: 120,
            fixed: 'left',
            render: (value: string) => (
                <Tag color="blue" style={{ fontSize: 13, fontWeight: 'bold' }}>
                    {value}
                </Tag>
            ),
        },
        {
            title: 'Tên phòng',
            dataIndex: 'ten_phong',
            key: 'ten_phong',
            width: 200,
            render: (text: string, record) => (
                <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                        <HomeOutlined /> {text}
                    </div>
                    <Tag color={getRoomTypeColor(record.loai_phong)}>
                        {getRoomTypeLabel(record.loai_phong)}
                    </Tag>
                </div>
            ),
        },
        {
            title: 'Chi nhánh',
            dataIndex: 'ten_chi_nhanh',
            key: 'ten_chi_nhanh',
            width: 180,
            render: (text?: string) => (
                <Space>
                    <ShopOutlined />
                    <span>{text || '-'}</span>
                </Space>
            ),
        },
        {
            title: 'Sức chứa',
            dataIndex: 'suc_chua',
            key: 'suc_chua',
            align: 'center',
            width: 100,
            render: (value: number) => (
                <Tag color="purple">
                    <UserOutlined /> {value} người
                </Tag>
            ),
        },
        {
            title: 'Booking hôm nay',
            dataIndex: 'booking_hom_nay',
            key: 'booking_hom_nay',
            align: 'center',
            width: 130,
            render: (value: number) => (
                <Badge count={value} showZero color="green" />
            ),
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
            title: 'Trạng thái',
            key: 'status',
            width: 180,
            render: (_, record) => {
                const status = getRoomStatus(record.trang_thai);
                return (
                    <Select
                        value={record.trang_thai}
                        style={{ width: '100%' }}
                        onChange={(value) => handleStatusChange(record, value)}
                    >
                        <Option value="san_sang">
                            <Tag color="green" icon={<CheckCircleOutlined />}>Sẵn sàng</Tag>
                        </Option>
                        <Option value="dang_su_dung">
                            <Tag color="blue" icon={<UserOutlined />}>Đang sử dụng</Tag>
                        </Option>
                        <Option value="bao_tri">
                            <Tag color="red" icon={<CloseCircleOutlined />}>Bảo trì</Tag>
                        </Option>
                    </Select>
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
                        title="Xác nhận xóa phòng này?"
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
                            title="Tổng phòng"
                            value={stats.totalRooms}
                            prefix={<HomeOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Sẵn sàng"
                            value={stats.availableRooms}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đang sử dụng"
                            value={stats.inUseRooms}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Bảo trì"
                            value={stats.maintenanceRooms}
                            prefix={<CloseCircleOutlined />}
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title={
                    <Space>
                        <HomeOutlined />
                        <span>Quản lý Phòng</span>
                        <Badge count={pagination.total} showZero />
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Thêm phòng
                    </Button>
                }
            >
                {/* Filters */}
                <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={6}>
                            <Input.Search
                                placeholder="Tìm kiếm mã, tên phòng..."
                                allowClear
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                prefix={<SearchOutlined />}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="Chọn chi nhánh"
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
                                placeholder="Loại phòng"
                                allowClear
                                style={{ width: '100%' }}
                                value={selectedType}
                                onChange={setSelectedType}
                            >
                                <Option value="vip">VIP</Option>
                                <Option value="standard">Tiêu chuẩn</Option>
                                <Option value="couple">Đôi</Option>
                                <Option value="group">Nhóm</Option>
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
                                <Option value="san_sang">Sẵn sàng</Option>
                                <Option value="dang_su_dung">Đang sử dụng</Option>
                                <Option value="bao_tri">Bảo trì</Option>
                            </Select>
                        </Col>
                    </Row>
                </Space>

                <Table
                    columns={columns}
                    dataSource={rooms}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} phòng`,
                        onChange: (page, pageSize) => {
                            setPagination({ ...pagination, current: page, pageSize });
                        },
                    }}
                    scroll={{ x: 1400 }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={selectedRoom ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                width={700}
                okText={selectedRoom ? 'Cập nhật' : 'Thêm mới'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="ma_phong"
                                label="Mã phòng"
                                rules={[{ required: true, message: 'Vui lòng nhập mã phòng' }]}
                            >
                                <Input placeholder="VD: P101" style={{ textTransform: 'uppercase' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="ten_phong"
                                label="Tên phòng"
                                rules={[{ required: true, message: 'Vui lòng nhập tên phòng' }]}
                            >
                                <Input placeholder="VD: Phòng VIP 1" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="chi_nhanh_id"
                                label="Chi nhánh"
                                rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}
                            >
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
                                name="loai_phong"
                                label="Loại phòng"
                                rules={[{ required: true }]}
                            >
                                <Select>
                                    <Option value="vip">VIP</Option>
                                    <Option value="standard">Tiêu chuẩn</Option>
                                    <Option value="couple">Đôi</Option>
                                    <Option value="group">Nhóm</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="suc_chua"
                                label="Sức chứa (người)"
                                rules={[{ required: true, message: 'Vui lòng nhập sức chứa' }]}
                            >
                                <InputNumber min={1} max={10} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="trang_thai"
                                label="Trạng thái"
                                initialValue="san_sang"
                            >
                                <Select>
                                    <Option value="san_sang">Sẵn sàng</Option>
                                    <Option value="dang_su_dung">Đang sử dụng</Option>
                                    <Option value="bao_tri">Bảo trì</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="tien_nghi"
                                label="Tiện nghi"
                            >
                                <Select mode="tags" placeholder="Nhập và nhấn Enter để thêm">
                                    <Option value="Điều hòa">Điều hòa</Option>
                                    <Option value="TV">TV</Option>
                                    <Option value="Âm nhạc">Âm nhạc</Option>
                                    <Option value="Ghế massage">Ghế massage</Option>
                                    <Option value="Tủ lạnh mini">Tủ lạnh mini</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Detail Drawer */}
            <Drawer
                title="Chi tiết phòng"
                placement="right"
                onClose={() => setDetailDrawerVisible(false)}
                open={detailDrawerVisible}
                width={500}
            >
                {selectedRoom && (
                    <div>
                        <Divider>Thông tin cơ bản</Divider>
                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Mã phòng">
                                <Tag color="blue" style={{ fontSize: 14, fontWeight: 'bold' }}>
                                    {selectedRoom.ma_phong}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tên phòng">
                                {selectedRoom.ten_phong}
                            </Descriptions.Item>
                            <Descriptions.Item label="Chi nhánh">
                                <ShopOutlined /> {selectedRoom.ten_chi_nhanh || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại phòng">
                                <Tag color={getRoomTypeColor(selectedRoom.loai_phong)}>
                                    {getRoomTypeLabel(selectedRoom.loai_phong)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Sức chứa">
                                <UserOutlined /> {selectedRoom.suc_chua} người
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                {(() => {
                                    const status = getRoomStatus(selectedRoom.trang_thai);
                                    return (
                                        <Tag color={status.color} icon={status.icon}>
                                            {status.text}
                                        </Tag>
                                    );
                                })()}
                            </Descriptions.Item>
                        </Descriptions>

                        {selectedRoom.tien_nghi && selectedRoom.tien_nghi.length > 0 && (
                            <>
                                <Divider>Tiện nghi</Divider>
                                <Space wrap>
                                    {selectedRoom.tien_nghi.map((item, index) => (
                                        <Tag key={index} color="green">{item}</Tag>
                                    ))}
                                </Space>
                            </>
                        )}

                        <Divider>Thống kê</Divider>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Card size="small">
                                    <Statistic
                                        title="Booking hôm nay"
                                        value={selectedRoom.booking_hom_nay}
                                        prefix={<CalendarOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small">
                                    <Statistic
                                        title="Doanh thu tháng"
                                        value={selectedRoom.doanh_thu_thang}
                                        suffix="VNĐ"
                                        valueStyle={{ color: '#f5222d' }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <Divider />
                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Ngày tạo">
                                {dayjs(selectedRoom.created_at).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default RoomList;
