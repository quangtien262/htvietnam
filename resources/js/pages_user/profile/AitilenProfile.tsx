import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { API_USER } from "../../common/api_user";
import {
    Card, Row, Col, Tabs, Avatar, Descriptions, Button, Space, Tag,
    Form, Input, Select, DatePicker, Upload, message, Modal, Table,
    Typography, Divider, Alert, Badge, Popconfirm, Switch
} from "antd";
import {
    UserOutlined, EditOutlined, LockOutlined, CarOutlined,
    CameraOutlined, SaveOutlined, EyeInvisibleOutlined, EyeTwoTone,
    PhoneOutlined, MailOutlined, CalendarOutlined, EnvironmentOutlined,
    IdcardOutlined, ManOutlined, WomanOutlined, CheckCircleOutlined,
    ExclamationCircleOutlined, PlusOutlined, DeleteOutlined,
    InfoCircleOutlined, WarningOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Interface definitions
interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    birthday?: string;
    gender?: 'male' | 'female' | 'other';
    address?: string;
    id_card?: string;
    image?: string;
    created_at: string;
    email_verified_at: string | null;
    phone_verified: boolean;
}

interface VehicleRegistration {
    id: string;
    license_plate: string;
    vehicle_type: 'car' | 'motorbike' | 'bicycle';
    vehicle_brand?: string;
    vehicle_model?: string;
    color?: string;
    owner_name: string;
    status: 'pending' | 'approved' | 'rejected';
    registered_date: string;
    approved_date?: string;
    notes?: string;
}

const AitilenProfile: React.FC = () => {
    // State management
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [vehicleRegistrations, setVehicleRegistrations] = useState<VehicleRegistration[]>([]);

    // Form states
    const [editMode, setEditMode] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleRegistration | null>(null);

    // Forms
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [vehicleForm] = Form.useForm();

    const mockVehicleRegistrations: VehicleRegistration[] = [
        {
            id: "VEH-001",
            license_plate: "30A-12345",
            vehicle_type: 'car',
            vehicle_brand: "Toyota",
            vehicle_model: "Camry",
            color: "Trắng",
            owner_name: "Nguyễn Văn A",
            status: 'approved',
            registered_date: "2025-01-15",
            approved_date: "2025-01-16",
            notes: "Xe đã được xác minh và phê duyệt"
        },
        {
            id: "VEH-002",
            license_plate: "30B-67890",
            vehicle_type: 'motorbike',
            vehicle_brand: "Honda",
            vehicle_model: "Wave Alpha",
            color: "Đỏ",
            owner_name: "Nguyễn Văn A",
            status: 'pending',
            registered_date: "2025-11-01",
            notes: "Đang chờ xác minh thông tin"
        }
    ];

    // Functions
    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.post(API_USER.profileIndex);
            const data = response.data.data.user;
            setUserProfile(data);

            profileForm.setFieldValue('name', data.name);
            profileForm.setFieldValue('email', data.email);
            profileForm.setFieldValue('phone', data.phone);
            profileForm.setFieldValue('ngay_sinh', data.ngay_sinh ? dayjs(data.ngay_sinh) : null);
            profileForm.setFieldValue('gioi_tinh_id', data.gioi_tinh_id ? data.gioi_tinh_id : null);
            profileForm.setFieldValue('address', data.address);
            profileForm.setFieldValue('cccd', data.cccd);
            profileForm.setFieldValue('image', data.image);

        } catch (error) {
            console.error('Error fetching user profile:', error);
            message.error('Không thể tải thông tin người dùng');
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicleRegistrations = async () => {
        try {
            // Thay thế bằng API call thực tế
            // const response = await axios.post(API.getVehicleRegistrations);
            setVehicleRegistrations(mockVehicleRegistrations);
        } catch (error) {
            console.error('Error fetching vehicle registrations:', error);
        }
    };

    useEffect(() => {
        fetchUserProfile();
        // fetchVehicleRegistrations();
    }, []);

    const handleSaveProfile = async (values: any) => {
        setLoading(true);
        try {
            values.ngay_sinh = values.ngay_sinh ? values.ngay_sinh.format('YYYY-MM-DD') : null;
            // Thay thế bằng API call thực tế
            await axios.post(API_USER.updateUserProfile, values);
            setUserProfile({ ...userProfile!, ...values });
            setEditMode(false);
            message.success('Cập nhật thông tin thành công!');
        } catch (error) {
            console.error('Error updating profile:', error);
            message.error('Cập nhật thông tin thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (values: any) => {
        setLoading(true);
        try {
            // Thay thế bằng API call thực tế
            await axios.post(API_USER.changePassword, values);
            setPasswordModalVisible(false);
            passwordForm.resetFields();
            message.success('Đổi mật khẩu thành công!');
        } catch (error) {
            console.error('Error changing password:', error);
            message.error('Đổi mật khẩu thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterVehicle = async (values: any) => {
        setLoading(true);
        try {
            const newVehicle: VehicleRegistration = {
                id: `VEH-${Date.now()}`,
                ...values,
                owner_name: userProfile?.name || '',
                status: 'pending',
                registered_date: dayjs().format('YYYY-MM-DD')
            };

            // Thay thế bằng API call thực tế
            // await axios.post(API.registerVehicle, newVehicle);
            setVehicleRegistrations([...vehicleRegistrations, newVehicle]);
            setVehicleModalVisible(false);
            vehicleForm.resetFields();
            message.success('Đăng ký biển số xe thành công!');
        } catch (error) {
            console.error('Error registering vehicle:', error);
            message.error('Đăng ký biển số xe thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVehicle = async (vehicleId: string) => {
        try {
            // Thay thế bằng API call thực tế
            // await axios.delete(API.deleteVehicle, { vehicleId });
            setVehicleRegistrations(vehicleRegistrations.filter(v => v.id !== vehicleId));
            message.success('Xóa đăng ký xe thành công!');
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            message.error('Xóa đăng ký xe thất bại!');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'success';
            case 'pending': return 'warning';
            case 'rejected': return 'error';
            default: return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved': return 'Đã phê duyệt';
            case 'pending': return 'Chờ phê duyệt';
            case 'rejected': return 'Đã từ chối';
            default: return 'Không xác định';
        }
    };

    const getVehicleTypeText = (type: string) => {
        switch (type) {
            case 'car': return 'Ô tô';
            case 'motorbike': return 'Xe máy';
            case 'bicycle': return 'Xe đạp';
            default: return 'Khác';
        }
    };

    const getGenderText = (gender?: number) => {
        switch (gender) {
            case 1: return <div><ManOutlined style={{ color: '#1890ff' }} /> Nam</div>;
            case 2: return <div><WomanOutlined style={{ color: '#ff4d4f' }} /> Nữ</div>;
            case 3: return <div><OtherOutlined style={{ color: '#faad14' }} /> Khác</div>;
            default: return 'Chưa xác định';
        }
    };

    // Render profile info
    const renderProfileInfo = () => {
        if (!userProfile) return null;

        return (
            <Row gutter={[16, 16]}>
                {/* Avatar & Basic Info */}
                <Col span={24}>
                    <Card size="small">
                        <Row gutter={[16, 16]} align="middle">
                            <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
                                <Avatar
                                    size={100}
                                    src={userProfile.image}
                                    icon={<UserOutlined />}
                                />
                                <div style={{ marginTop: 8 }}>
                                    <Button
                                        type="link"
                                        icon={<CameraOutlined />}
                                        style={{ fontSize: '12px' }}
                                    >
                                        Thay đổi ảnh
                                    </Button>
                                </div>
                            </Col>
                            <Col xs={24} sm={18}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                    <div>
                                        <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                                            {userProfile.name}
                                        </Title>
                                        <Text type="secondary">ID: {userProfile.code}</Text>
                                    </div>
                                    <Space>
                                        {/* <Badge
                                            status={userProfile.email_verified_at ? "success" : "error"}
                                            text={userProfile.email_verified_at ? "Đã xác minh" : "Chưa xác minh"}
                                        /> */}
                                        <Button
                                            type="primary"
                                            icon={<EditOutlined />}
                                            size="small"
                                            onClick={() => setEditMode(true)}
                                        >
                                            Chỉnh sửa
                                        </Button>

                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<LockOutlined />}
                                            onClick={() => setPasswordModalVisible(true)}
                                        >
                                            Đổi mật khẩu
                                        </Button>

                                    </Space>
                                </div>

                                <Row gutter={[16, 8]}>
                                    <Col xs={24} sm={12}>
                                        <Space>
                                            <MailOutlined style={{ color: '#1890ff' }} />
                                            <Text>{userProfile.email ? userProfile.email : 'Chưa cập nhật'}</Text>
                                            {/* {userProfile.email_verified_at && <CheckCircleOutlined style={{ color: '#52c41a' }} />} */}
                                        </Space>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Space>
                                            <PhoneOutlined style={{ color: '#1890ff' }} />
                                            <Text>{userProfile.phone}</Text>
                                            {/* {userProfile.phone_verified && <CheckCircleOutlined style={{ color: '#52c41a' }} />} */}
                                        </Space>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Space>
                                            <CalendarOutlined style={{ color: '#1890ff' }} />
                                            <Text>{userProfile.ngay_sinh ? dayjs(userProfile.ngay_sinh).format('DD/MM/YYYY') : 'Chưa cập nhật'}</Text>
                                        </Space>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Space>{userProfile.gioi_tinh_id}
                                            {getGenderText(userProfile.gioi_tinh_id)}
                                        </Space>
                                    </Col>
                                    <Col span={24}>
                                        <Space align="start">
                                            <EnvironmentOutlined style={{ color: '#1890ff', marginTop: 4 }} />
                                            <Text>{userProfile.address || 'Chưa cập nhật địa chỉ'}</Text>
                                        </Space>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                {/* Detailed Information */}
                <Col span={24}>
                    <Card title={<Space><InfoCircleOutlined />Thông tin chi tiết</Space>} size="small">
                        <Descriptions
                            bordered
                            column={{ xs: 1, sm: 1, md: 2 }}
                            size="small"
                            labelStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                            contentStyle={{ fontSize: '13px' }}
                        >
                            <Descriptions.Item label="Họ và tên">
                                {userProfile.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="CCCD/CMND">
                                {userProfile.cccd || 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                <Space>
                                    {userProfile.email}
                                    {/* <Tag color={userProfile.email_verified_at ? 'success' : 'warning'}>
                                        {userProfile.email_verified_at ? 'Đã xác minh' : 'Chưa xác minh'}
                                    </Tag> */}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                <Space>
                                    {userProfile.phone}
                                    {/* <Tag color={userProfile.phone_verified ? 'success' : 'warning'}>
                                        {userProfile.phone_verified ? 'Đã xác minh' : 'Chưa xác minh'}
                                    </Tag> */}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày sinh">
                                {userProfile.ngay_sinh ? dayjs(userProfile.ngay_sinh).format('DD/MM/YYYY') : 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giới tính">
                                {getGenderText(userProfile.gioi_tinh_id)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ" span={2}>
                                {userProfile.address || 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo tài khoản">
                                {dayjs(userProfile.created_at).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>
        );
    };

    // Render edit profile form
    const renderEditProfile = () => {
        return (
            <Card title={<Space><EditOutlined />Chỉnh sửa thông tin cá nhân</Space>} size="small">
                <Form
                    form={profileForm}
                    layout="vertical"
                    onFinish={handleSaveProfile}
                    initialValues={userProfile || {}}
                >
                    <Row gutter={[16, 0]}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Họ và tên"
                                name="name"
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                            >
                                <Input placeholder="Nhập họ và tên" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input placeholder="Nhập email" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Số điện thoại"
                                name="phone"
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                            >
                                <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="CCCD/CMND"
                                name="cccd"
                            >
                                <Input placeholder="Nhập số CCCD/CMND" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Ngày sinh"
                                name="ngay_sinh"
                            >
                                <DatePicker
                                    placeholder="Chọn ngày sinh"
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Giới tính"
                                name="gioi_tinh_id"
                            >
                                <Select placeholder="Chọn giới tính">
                                    <Option value={1}>Nam</Option>
                                    <Option value={2}>Nữ</Option>
                                    <Option value={3}>Khác</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="Địa chỉ"
                                name="address"
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Nhập địa chỉ đầy đủ"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    <Space>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<SaveOutlined />}
                        >
                            Lưu thay đổi
                        </Button>
                        <Button onClick={() => setEditMode(false)}>
                            Hủy
                        </Button>
                    </Space>
                </Form>
            </Card>
        );
    };

    // Render vehicle registrations
    const renderVehicleRegistrations = () => {
        const columns = [
            {
                title: 'Biển số xe',
                dataIndex: 'license_plate',
                key: 'license_plate',
                render: (text: string) => <Text strong>{text}</Text>
            },
            {
                title: 'Loại xe',
                dataIndex: 'vehicle_type',
                key: 'vehicle_type',
                render: (type: string) => getVehicleTypeText(type)
            },
            {
                title: 'Thông tin xe',
                key: 'vehicle_info',
                render: (record: VehicleRegistration) => (
                    <div>
                        <div>{record.vehicle_brand} {record.vehicle_model}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Màu: {record.color}
                        </Text>
                    </div>
                )
            },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => (
                    <Tag color={getStatusColor(status)}>
                        {getStatusText(status)}
                    </Tag>
                )
            },
            {
                title: 'Ngày đăng ký',
                dataIndex: 'registered_date',
                key: 'registered_date',
                render: (date: string) => dayjs(date).format('DD/MM/YYYY')
            },
            {
                title: 'Thao tác',
                key: 'actions',
                render: (record: VehicleRegistration) => (
                    <Space>
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setSelectedVehicle(record);
                                vehicleForm.setFieldsValue(record);
                                setVehicleModalVisible(true);
                            }}
                        >
                            Sửa
                        </Button>
                        {record.status === 'pending' && (
                            <Popconfirm
                                title="Bạn có chắc muốn xóa đăng ký này?"
                                onConfirm={() => handleDeleteVehicle(record.id)}
                            >
                                <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                >
                                    Xóa
                                </Button>
                            </Popconfirm>
                        )}
                    </Space>
                )
            }
        ];

        // Mobile card view for vehicles
        const renderMobileVehicleCard = (vehicle: VehicleRegistration) => (
            <Card
                key={vehicle.id}
                size="small"
                style={{ marginBottom: 12 }}
                actions={[
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setSelectedVehicle(vehicle);
                            vehicleForm.setFieldsValue(vehicle);
                            setVehicleModalVisible(true);
                        }}
                    >
                        Sửa
                    </Button>,
                    vehicle.status === 'pending' && (
                        <Popconfirm
                            title="Xóa đăng ký này?"
                            onConfirm={() => handleDeleteVehicle(vehicle.id)}
                        >
                            <Button type="link" danger icon={<DeleteOutlined />}>
                                Xóa
                            </Button>
                        </Popconfirm>
                    )
                ].filter(Boolean)}
            >
                <Row gutter={[8, 4]}>
                    <Col span={24}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong style={{ fontSize: '16px' }}>{vehicle.license_plate}</Text>
                            <Tag color={getStatusColor(vehicle.status)}>
                                {getStatusText(vehicle.status)}
                            </Tag>
                        </div>
                    </Col>
                    <Col span={12}>
                        <Text style={{ fontSize: '13px' }}>
                            Loại: {getVehicleTypeText(vehicle.vehicle_type)}
                        </Text>
                    </Col>
                    <Col span={12}>
                        <Text style={{ fontSize: '13px' }}>
                            Màu: {vehicle.color}
                        </Text>
                    </Col>
                    <Col span={24}>
                        <Text style={{ fontSize: '13px' }}>
                            {vehicle.vehicle_brand} {vehicle.vehicle_model}
                        </Text>
                    </Col>
                    <Col span={24}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Đăng ký: {dayjs(vehicle.registered_date).format('DD/MM/YYYY')}
                        </Text>
                    </Col>
                    {vehicle.notes && (
                        <Col span={24}>
                            <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>
                                {vehicle.notes}
                            </Text>
                        </Col>
                    )}
                </Row>
            </Card>
        );

        return (
            <Card
                title={<Space><CarOutlined />Đăng ký biển số xe</Space>}
                size="small"
                extra={
                    <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setSelectedVehicle(null);
                            vehicleForm.resetFields();
                            setVehicleModalVisible(true);
                        }}
                    >
                        Đăng ký mới
                    </Button>
                }
            >
                {vehicleRegistrations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <CarOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: 16 }} />
                        <div>
                            <Text type="secondary">Chưa có xe nào được đăng ký</Text>
                        </div>
                        <Button
                            type="primary"
                            style={{ marginTop: 16 }}
                            onClick={() => {
                                setSelectedVehicle(null);
                                vehicleForm.resetFields();
                                setVehicleModalVisible(true);
                            }}
                        >
                            Đăng ký xe đầu tiên
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="d-none d-md-block">
                            <Table
                                columns={columns}
                                dataSource={vehicleRegistrations}
                                rowKey="id"
                                size="small"
                                scroll={{ x: 'max-content' }}
                                pagination={{
                                    pageSize: 5,
                                    showSizeChanger: false,
                                    simple: true
                                }}
                            />
                        </div>

                        {/* Mobile Cards */}
                        <div className="d-block d-md-none">
                            {vehicleRegistrations.map(renderMobileVehicleCard)}
                        </div>
                    </>
                )}
            </Card>
        );
    };

    return (
        <div style={{ padding: '8px', background: '#f0f2f5', minHeight: '100vh' }}>
            <style>
                {`
                    @media (max-width: 768px) {
                        .ant-card-head-title {
                            font-size: 14px !important;
                        }
                        .ant-descriptions-item-label {
                            text-align: left !important;
                            padding: 6px !important;
                        }
                        .ant-descriptions-item-content {
                            padding: 6px !important;
                        }
                        .ant-modal {
                            margin: 0 !important;
                            max-width: 100vw !important;
                        }
                        .ant-modal-content {
                            border-radius: 8px 8px 0 0 !important;
                        }
                        .d-none {
                            display: none !important;
                        }
                        .d-block {
                            display: block !important;
                        }
                    }
                    @media (min-width: 769px) {
                        .d-md-block {
                            display: block !important;
                        }
                        .d-md-none {
                            display: none !important;
                        }
                    }
                `}
            </style>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 8px' }}>
                {/* Header */}
                <div style={{ marginBottom: 16, padding: '8px 0' }}>
                    <Title level={3} style={{ margin: 0, fontSize: '18px' }}>
                        <UserOutlined /> Thông tin cá nhân
                    </Title>
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                        Quản lý thông tin tài khoản và đăng ký phương tiện
                    </Text>
                </div>

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    size="small"
                    items={[
                        {
                            key: 'info',
                            label: (
                                <Space size={4}>
                                    <UserOutlined />
                                    <span style={{ fontSize: '14px' }}>Thông tin cá nhân</span>
                                </Space>
                            ),
                            children: editMode ? renderEditProfile() : renderProfileInfo()
                        },
                        {
                            key: 'vehicles',
                            label: (
                                <Space size={4}>
                                    <CarOutlined />
                                    <span style={{ fontSize: '14px' }}>Biển số xe</span>
                                    <Badge count={vehicleRegistrations.length} showZero />
                                </Space>
                            ),
                            children: renderVehicleRegistrations()
                        }
                    ]}
                />

                {/* Change Password Modal */}
                <Modal
                    title={
                        <Space size={4}>
                            <LockOutlined />
                            <span style={{ fontSize: '16px' }}>Đổi mật khẩu</span>
                        </Space>
                    }
                    open={passwordModalVisible}
                    onCancel={() => {
                        setPasswordModalVisible(false);
                        passwordForm.resetFields();
                    }}
                    footer={null}
                    width="90%"
                    style={{ maxWidth: 500 }}
                >
                    <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handleChangePassword}
                    >
                        <Form.Item
                            label="Mật khẩu hiện tại"
                            name="current_password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                        >
                            <Input.Password
                                placeholder="Nhập mật khẩu hiện tại"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu mới"
                            name="new_password"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                            ]}
                        >
                            <Input.Password
                                placeholder="Nhập mật khẩu mới"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Xác nhận mật khẩu mới"
                            name="confirm_password"
                            dependencies={['new_password']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('new_password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                placeholder="Xác nhận mật khẩu mới"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </Form.Item>

                        <Alert
                            message="Lưu ý bảo mật"
                            description="Mật khẩu nên có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />

                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setPasswordModalVisible(false);
                                passwordForm.resetFields();
                            }}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                            >
                                Đổi mật khẩu
                            </Button>
                        </Space>
                    </Form>
                </Modal>

                {/* Vehicle Registration Modal */}
                <Modal
                    title={
                        <Space size={4}>
                            <CarOutlined />
                            <span style={{ fontSize: '16px' }}>
                                {selectedVehicle ? 'Chỉnh sửa đăng ký xe' : 'Đăng ký biển số xe'}
                            </span>
                        </Space>
                    }
                    open={vehicleModalVisible}
                    onCancel={() => {
                        setVehicleModalVisible(false);
                        setSelectedVehicle(null);
                        vehicleForm.resetFields();
                    }}
                    footer={null}
                    width="90%"
                    style={{ maxWidth: 600 }}
                >
                    <Form
                        form={vehicleForm}
                        layout="vertical"
                        onFinish={handleRegisterVehicle}
                    >
                        <Row gutter={[16, 0]}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Biển số xe"
                                    name="license_plate"
                                    rules={[{ required: true, message: 'Vui lòng nhập biển số xe!' }]}
                                >
                                    <Input placeholder="VD: 30A-12345" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Loại xe"
                                    name="vehicle_type"
                                    rules={[{ required: true, message: 'Vui lòng chọn loại xe!' }]}
                                >
                                    <Select placeholder="Chọn loại xe">
                                        <Option value="car">Ô tô</Option>
                                        <Option value="motorbike">Xe máy</Option>
                                        <Option value="bicycle">Xe đạp</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Hãng xe"
                                    name="vehicle_brand"
                                >
                                    <Select
                                        showSearch
                                        placeholder="Chọn hãng xe"
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        options={[
                                            { value: 'Honda', label: 'Honda' },
                                            { value: 'VinFast', label: 'VinFast' },
                                            { value: 'Toyota', label: 'Toyota' },
                                            { value: 'Yamaha', label: 'Yamaha' },
                                            { value: 'Suzuki', label: 'Suzuki' },
                                            { value: 'Ford', label: 'Ford' },
                                            { value: 'Kia', label: 'Kia' },
                                            { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
                                            { value: 'BMW', label: 'BMW' },
                                            { value: 'Other', label: 'Khác' },
                                        ]}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Model xe"
                                    name="vehicle_model"
                                >
                                    <Select
                                        showSearch
                                        placeholder="Chọn model xe"
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        options={[
                                            { value: 'Vision', label: 'Vision' },
                                            { value: 'Air Blade', label: 'Air Blade' },
                                            { value: 'SH', label: 'SH' },
                                            { value: 'Wave', label: 'Wave' },
                                            { value: 'Dream', label: 'Dream' },
                                            { value: 'Lead', label: 'Lead' },
                                            { value: 'WinnerX', label: 'WinnerX' },
                                            { value: 'Vario', label: 'Vario' },
                                            { value: 'Future', label: 'Future' },
                                            { value: 'CBR', label: 'CBR' },
                                            { value: 'CB350 ', label: 'CB350 ' },
                                            { value: 'Yamaha XMAX', label: 'Yamaha XMAX' },
                                            { value: 'Janus', label: 'Yamaha Janus' },
                                            { value: 'NVX', label: 'Yamaha NVX' },
                                            { value: 'Grand', label: 'Yamaha Grand' },
                                            { value: 'Freego', label: 'amaha Freego' },
                                            { value: 'Latte', label: 'Yamaha Latte' },
                                            { value: 'Exciter', label: 'Yamaha Exciter' },
                                            { value: 'Jupiter', label: 'Yamaha Jupiter' },
                                            { value: 'Sirius', label: 'Sirius' },
                                            { value: 'Klara S2', label: 'Klara S2' },
                                            { value: 'Feliz S', label: 'Feliz S' },
                                            { value: 'Other', label: 'Khác' },
                                        ]}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label="Màu xe"
                                    name="color"
                                >
                                    <Select placeholder="Chọn màu xe">
                                        <Option value="Trắng">Trắng</Option>
                                        <Option value="Trắng">Trắng đen</Option>
                                        <Option value="Đen">Đen</Option>
                                        <Option value="Xám">Xám</Option>
                                        <Option value="Đỏ">Đỏ</Option>
                                        <Option value="Đỏ - Đen">Đỏ - Đen</Option>
                                        <Option value="Xanh">Xanh</Option>
                                        <Option value="Vàng">Vàng</Option>
                                        <Option value="Khác">Khác</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label="Ghi chú"
                                    name="notes"
                                >
                                    <Input.TextArea
                                        rows={3}
                                        placeholder="Thông tin bổ sung về xe (tùy chọn)"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Alert
                            message="Lưu ý đăng ký xe"
                            description="Việc đăng ký biển số xe giúp quản lý tòa nhà xác định và quản lý phương tiện ra vào. Thông tin sẽ được xác minh trước khi phê duyệt."
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />

                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setVehicleModalVisible(false);
                                setSelectedVehicle(null);
                                vehicleForm.resetFields();
                            }}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                            >
                                {selectedVehicle ? 'Cập nhật' : 'Đăng ký'}
                            </Button>
                        </Space>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default AitilenProfile;
