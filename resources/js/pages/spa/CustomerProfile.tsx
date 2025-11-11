import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, Row, Col, Tabs, Avatar, Descriptions, Tag, Button, Space, Statistic,
    Timeline, Table, Image, Upload, Form, Input, DatePicker, Select, message,
    Modal, Radio, Divider, Progress, Badge, Empty, Spin
} from 'antd';
import {
    UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined,
    CalendarOutlined, DollarOutlined, TrophyOutlined, EditOutlined,
    CameraOutlined, HistoryOutlined, StarOutlined, GiftOutlined,
    MedicineBoxOutlined, SkinOutlined, FileTextOutlined, CrownOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import axios from 'axios';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { TextArea } = Input;

interface Customer {
    id: number;
    ma_khach_hang: string;
    ho_ten: string;
    ngay_sinh?: string;
    gioi_tinh?: string;
    so_dien_thoai?: string;
    email?: string;
    dia_chi?: string;
    avatar?: string;
    nguon_khach?: string;
    loai_khach?: string;
    tong_chi_tieu: number;
    diem_tich_luy: number;
    so_lan_su_dung_dich_vu: number;
    lan_mua_cuoi?: string;
    trang_thai: string;
}

interface HealthProfile {
    tien_su_benh?: string[];
    di_ung?: string[];
    thuoc_dang_dung?: string[];
    benh_da_lieu?: string;
    phau_thuat_tham_my?: string;
    ghi_chu_suc_khoe?: string;
}

interface SkinProfile {
    loai_da?: string;
    van_de_da?: string[];
    muc_tieu_dieu_tri?: string;
    san_pham_dang_dung?: string[];
    anh_truoc_dieu_tri?: string[];
    anh_sau_dieu_tri?: string[];
    ghi_chu?: string;
}

interface Membership {
    ma_the: string;
    tier: {
        ten_cap_bac: string;
        cap_do: number;
        ti_le_giam_gia: number;
        ti_le_tich_diem: number;
        mau_the: string;
    };
    diem_tich_luy: number;
    trang_thai: string;
}

const CustomerProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [healthProfile, setHealthProfile] = useState<HealthProfile>({});
    const [skinProfile, setSkinProfile] = useState<SkinProfile>({});
    const [membership, setMembership] = useState<Membership | null>(null);
    const [bookingHistory, setBookingHistory] = useState([]);
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [treatmentPackages, setTreatmentPackages] = useState([]);
    const [rfmAnalysis, setRfmAnalysis] = useState<any>(null);

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editHealthModalVisible, setEditHealthModalVisible] = useState(false);
    const [editSkinModalVisible, setEditSkinModalVisible] = useState(false);

    const [form] = Form.useForm();
    const [healthForm] = Form.useForm();
    const [skinForm] = Form.useForm();

    useEffect(() => {
        if (id) {
            loadCustomerProfile();
        }
    }, [id]);

    const loadCustomerProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`/aio/api/admin/spa/customers/${id}/profile`);
            if (response.data.success) {
                const data = response.data.data;
                setCustomer(data.customer);
                setHealthProfile(data.customer.hoSoSucKhoe || {});
                setSkinProfile(data.customer.hoSoDa || {});
                setMembership(data.customer.membershipCard || null);
                setBookingHistory(data.customer.bookings || []);
                setPurchaseHistory(data.customer.hoaDons || []);
                setTreatmentPackages(data.customer.lieuTrinhs || []);
                setRfmAnalysis(data.rfm_analysis || null);
            }
        } catch (error) {
            message.error('Không thể tải thông tin khách hàng');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCustomer = async (values: any) => {
        try {
            const response = await axios.post('/aio/api/admin/spa/customers/create-or-update', {
                id: customer?.id,
                ...values,
                ngay_sinh: values.ngay_sinh ? dayjs(values.ngay_sinh).format('YYYY-MM-DD') : null,
            });

            if (response.data.success) {
                message.success('Cập nhật thông tin thành công');
                setEditModalVisible(false);
                loadCustomerProfile();
            }
        } catch (error) {
            message.error('Cập nhật thất bại');
        }
    };

    const handleUpdateHealthProfile = async (values: any) => {
        try {
            const response = await axios.post(`/aio/api/admin/spa/customers/${id}/health-profile`, values);
            if (response.data.success) {
                message.success('Cập nhật hồ sơ sức khỏe thành công');
                setEditHealthModalVisible(false);
                loadCustomerProfile();
            }
        } catch (error) {
            message.error('Cập nhật thất bại');
        }
    };

    const handleUpdateSkinProfile = async (values: any) => {
        try {
            const response = await axios.post(`/aio/api/admin/spa/customers/${id}/skin-profile`, values);
            if (response.data.success) {
                message.success('Cập nhật hồ sơ da thành công');
                setEditSkinModalVisible(false);
                loadCustomerProfile();
            }
        } catch (error) {
            message.error('Cập nhật thất bại');
        }
    };

    const uploadBeforePhoto = async (file: File) => {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('type', 'before');
        formData.append('khach_hang_id', id!);

        try {
            const response = await axios.post('/aio/api/admin/spa/customers/upload-photo', formData);
            if (response.data.success) {
                message.success('Upload ảnh thành công');
                loadCustomerProfile();
            }
        } catch (error) {
            message.error('Upload ảnh thất bại');
        }
    };

    const getRFMBadge = () => {
        if (!rfmAnalysis) return null;

        const colors: any = {
            'VIP': 'gold',
            'Loyal': 'blue',
            'New': 'green',
            'Potential': 'cyan',
            'At Risk': 'orange',
            'Lost': 'red',
        };

        return <Tag color={colors[rfmAnalysis.segment] || 'default'} style={{ fontSize: 14, padding: '4px 12px' }}>
            {rfmAnalysis.segment}
        </Tag>;
    };

    const getMembershipCard = () => {
        if (!membership) {
            return (
                <Card size="small" style={{ background: '#f0f0f0' }}>
                    <Empty description="Chưa có thẻ thành viên" />
                </Card>
            );
        }

        return (
            <Card
                style={{
                    background: membership.tier.mau_the || '#FFD700',
                    color: 'white',
                    borderRadius: 12,
                    border: 'none',
                }}
                bodyStyle={{ padding: 24 }}
            >
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space direction="vertical" size={0}>
                            <span style={{ fontSize: 12, opacity: 0.8 }}>SPA MEMBERSHIP CARD</span>
                            <h2 style={{ color: 'white', margin: 0 }}>
                                <CrownOutlined /> {membership.tier.ten_cap_bac}
                            </h2>
                        </Space>
                    </Col>
                    <Col>
                        <Statistic
                            title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Điểm tích lũy</span>}
                            value={membership.diem_tich_luy}
                            valueStyle={{ color: 'white' }}
                            suffix={<StarOutlined />}
                        />
                    </Col>
                </Row>
                <Divider style={{ borderColor: 'rgba(255,255,255,0.3)', margin: '16px 0' }} />
                <Row justify="space-between">
                    <Col>
                        <span style={{ opacity: 0.8 }}>Mã thẻ: {membership.ma_the}</span>
                    </Col>
                    <Col>
                        <span style={{ opacity: 0.8 }}>
                            Giảm giá: {membership.tier.ti_le_giam_gia}% | Tích điểm: x{membership.tier.ti_le_tich_diem}
                        </span>
                    </Col>
                </Row>
            </Card>
        );
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
    }

    if (!customer) {
        return <Empty description="Không tìm thấy khách hàng" />;
    }

    return (
        <div style={{ padding: 24 }}>
            {/* Header Section */}
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={24} align="middle">
                    <Col>
                        <Avatar
                            size={120}
                            src={customer.avatar}
                            icon={<UserOutlined />}
                            style={{ border: '4px solid #f0f0f0' }}
                        />
                    </Col>
                    <Col flex="auto">
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                            <div>
                                <h1 style={{ margin: 0, display: 'inline-block', marginRight: 12 }}>
                                    {customer.ho_ten}
                                </h1>
                                {getRFMBadge()}
                                <Tag color={customer.trang_thai === 'active' ? 'green' : 'red'}>
                                    {customer.trang_thai === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                </Tag>
                            </div>
                            <Space size={24}>
                                <span><PhoneOutlined /> {customer.so_dien_thoai || 'N/A'}</span>
                                <span><MailOutlined /> {customer.email || 'N/A'}</span>
                                <span><EnvironmentOutlined /> {customer.dia_chi || 'N/A'}</span>
                            </Space>
                            <div>
                                <Tag>Mã KH: {customer.ma_khach_hang}</Tag>
                                <Tag>Nguồn: {customer.nguon_khach || 'N/A'}</Tag>
                                <Tag>Loại: {customer.loai_khach || 'N/A'}</Tag>
                            </div>
                        </Space>
                    </Col>
                    <Col>
                        <Button type="primary" icon={<EditOutlined />} onClick={() => {
                            form.setFieldsValue({
                                ...customer,
                                ngay_sinh: customer.ngay_sinh ? dayjs(customer.ngay_sinh) : null,
                            });
                            setEditModalVisible(true);
                        }}>
                            Chỉnh sửa
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng chi tiêu"
                            value={customer.tong_chi_tieu}
                            suffix="VNĐ"
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Điểm tích lũy"
                            value={customer.diem_tich_luy}
                            prefix={<GiftOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Số lần sử dụng DV"
                            value={customer.so_lan_su_dung_dich_vu}
                            prefix={<TrophyOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Lần mua cuối"
                            value={customer.lan_mua_cuoi ? dayjs(customer.lan_mua_cuoi).format('DD/MM/YYYY') : 'Chưa có'}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Membership Card */}
            <div style={{ marginBottom: 24 }}>
                {getMembershipCard()}
            </div>

            {/* Tabs Content */}
            <Tabs defaultActiveKey="info">
                <TabPane tab={<span><FileTextOutlined />Thông tin chi tiết</span>} key="info">
                    <Card title="Thông tin cá nhân">
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Họ tên">{customer.ho_ten}</Descriptions.Item>
                            <Descriptions.Item label="Mã KH">{customer.ma_khach_hang}</Descriptions.Item>
                            <Descriptions.Item label="Ngày sinh">
                                {customer.ngay_sinh ? dayjs(customer.ngay_sinh).format('DD/MM/YYYY') : 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giới tính">{customer.gioi_tinh || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{customer.so_dien_thoai || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Email">{customer.email || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ" span={2}>{customer.dia_chi || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Nguồn khách">{customer.nguon_khach || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Loại khách">{customer.loai_khach || 'N/A'}</Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {rfmAnalysis && (
                        <Card title="Phân tích RFM" style={{ marginTop: 16 }}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Card size="small">
                                        <Statistic title="Recency (Ngày từ lần mua cuối)" value={rfmAnalysis.recency} suffix="ngày" />
                                        <Progress percent={rfmAnalysis.r_score * 20} status="active" />
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card size="small">
                                        <Statistic title="Frequency (Số lần mua)" value={rfmAnalysis.frequency} />
                                        <Progress percent={rfmAnalysis.f_score * 20} status="active" />
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card size="small">
                                        <Statistic title="Monetary (Tổng chi tiêu)" value={rfmAnalysis.monetary} suffix="VNĐ" />
                                        <Progress percent={rfmAnalysis.m_score * 20} status="active" />
                                    </Card>
                                </Col>
                            </Row>
                            <Divider />
                            <Row justify="center">
                                <Col>
                                    <Statistic
                                        title="Phân khúc khách hàng"
                                        value={rfmAnalysis.segment}
                                        valueStyle={{ fontSize: 32 }}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    )}
                </TabPane>

                <TabPane tab={<span><MedicineBoxOutlined />Hồ sơ sức khỏe</span>} key="health">
                    <Card
                        title="Thông tin sức khỏe"
                        extra={
                            <Button type="primary" onClick={() => {
                                healthForm.setFieldsValue(healthProfile);
                                setEditHealthModalVisible(true);
                            }}>
                                Chỉnh sửa
                            </Button>
                        }
                    >
                        {healthProfile.di_ung && healthProfile.di_ung.length > 0 && (
                            <div style={{ background: '#fff2e8', border: '1px solid #ffbb96', padding: 16, marginBottom: 16, borderRadius: 4 }}>
                                <h4 style={{ color: '#d4380d', margin: '0 0 8px 0' }}>⚠️ CẢNH BÁO DỊ ỨNG</h4>
                                <Space wrap>
                                    {healthProfile.di_ung.map((item, idx) => (
                                        <Tag color="red" key={idx} style={{ fontSize: 14, padding: '4px 12px' }}>
                                            {item}
                                        </Tag>
                                    ))}
                                </Space>
                            </div>
                        )}

                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Tiền sử bệnh">
                                {healthProfile.tien_su_benh && healthProfile.tien_su_benh.length > 0 ? (
                                    <Space wrap>
                                        {healthProfile.tien_su_benh.map((item, idx) => (
                                            <Tag key={idx}>{item}</Tag>
                                        ))}
                                    </Space>
                                ) : 'Không có'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thuốc đang sử dụng">
                                {healthProfile.thuoc_dang_dung && healthProfile.thuoc_dang_dung.length > 0 ? (
                                    <Space wrap>
                                        {healthProfile.thuoc_dang_dung.map((item, idx) => (
                                            <Tag color="blue" key={idx}>{item}</Tag>
                                        ))}
                                    </Space>
                                ) : 'Không có'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Bệnh da liễu">{healthProfile.benh_da_lieu || 'Không có'}</Descriptions.Item>
                            <Descriptions.Item label="Phẫu thuật thẩm mỹ">{healthProfile.phau_thuat_tham_my || 'Không có'}</Descriptions.Item>
                            <Descriptions.Item label="Ghi chú">
                                {healthProfile.ghi_chu_suc_khoe || 'Không có ghi chú'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </TabPane>

                <TabPane tab={<span><SkinOutlined />Hồ sơ da</span>} key="skin">
                    <Card
                        title="Phân tích da & Hình ảnh"
                        extra={
                            <Button type="primary" onClick={() => {
                                skinForm.setFieldsValue(skinProfile);
                                setEditSkinModalVisible(true);
                            }}>
                                Chỉnh sửa
                            </Button>
                        }
                    >
                        <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
                            <Descriptions.Item label="Loại da">{skinProfile.loai_da || 'Chưa xác định'}</Descriptions.Item>
                            <Descriptions.Item label="Mục tiêu điều trị">{skinProfile.muc_tieu_dieu_tri || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Vấn đề da" span={2}>
                                {skinProfile.van_de_da && skinProfile.van_de_da.length > 0 ? (
                                    <Space wrap>
                                        {skinProfile.van_de_da.map((item, idx) => (
                                            <Tag color="orange" key={idx}>{item}</Tag>
                                        ))}
                                    </Space>
                                ) : 'Không có vấn đề'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Sản phẩm đang dùng" span={2}>
                                {skinProfile.san_pham_dang_dung && skinProfile.san_pham_dang_dung.length > 0 ? (
                                    <Space wrap>
                                        {skinProfile.san_pham_dang_dung.map((item, idx) => (
                                            <Tag color="green" key={idx}>{item}</Tag>
                                        ))}
                                    </Space>
                                ) : 'Không có'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú" span={2}>
                                {skinProfile.ghi_chu || 'Không có ghi chú'}
                            </Descriptions.Item>
                        </Descriptions>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Card size="small" title="Ảnh trước điều trị" extra={
                                    <Upload
                                        showUploadList={false}
                                        beforeUpload={(file) => {
                                            uploadBeforePhoto(file);
                                            return false;
                                        }}
                                    >
                                        <Button size="small" icon={<CameraOutlined />}>Thêm ảnh</Button>
                                    </Upload>
                                }>
                                    {skinProfile.anh_truoc_dieu_tri && skinProfile.anh_truoc_dieu_tri.length > 0 ? (
                                        <Image.PreviewGroup>
                                            <Row gutter={[8, 8]}>
                                                {skinProfile.anh_truoc_dieu_tri.map((url, idx) => (
                                                    <Col span={8} key={idx}>
                                                        <Image src={url} style={{ width: '100%', borderRadius: 4 }} />
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Image.PreviewGroup>
                                    ) : (
                                        <Empty description="Chưa có ảnh" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                    )}
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" title="Ảnh sau điều trị" extra={
                                    <Upload
                                        showUploadList={false}
                                        beforeUpload={(file) => {
                                            // Similar upload for after photos
                                            return false;
                                        }}
                                    >
                                        <Button size="small" icon={<CameraOutlined />}>Thêm ảnh</Button>
                                    </Upload>
                                }>
                                    {skinProfile.anh_sau_dieu_tri && skinProfile.anh_sau_dieu_tri.length > 0 ? (
                                        <Image.PreviewGroup>
                                            <Row gutter={[8, 8]}>
                                                {skinProfile.anh_sau_dieu_tri.map((url, idx) => (
                                                    <Col span={8} key={idx}>
                                                        <Image src={url} style={{ width: '100%', borderRadius: 4 }} />
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Image.PreviewGroup>
                                    ) : (
                                        <Empty description="Chưa có ảnh" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                    )}
                                </Card>
                            </Col>
                        </Row>
                    </Card>
                </TabPane>

                <TabPane tab={<span><HistoryOutlined />Lịch sử</span>} key="history">
                    <Card title="Lịch sử đặt hẹn" style={{ marginBottom: 16 }}>
                        <Table
                            dataSource={bookingHistory}
                            rowKey="id"
                            columns={[
                                { title: 'Mã', dataIndex: 'ma_booking', width: 120 },
                                { title: 'Dịch vụ', dataIndex: ['dichVu', 'ten_dich_vu'] },
                                { title: 'Ngày hẹn', dataIndex: 'ngay_hen', render: (val) => dayjs(val).format('DD/MM/YYYY HH:mm') },
                                { title: 'KTV', dataIndex: ['ktv', 'ten_ktv'] },
                                {
                                    title: 'Trạng thái',
                                    dataIndex: 'trang_thai',
                                    render: (status) => {
                                        const colors: any = {
                                            'cho_xac_nhan': 'orange',
                                            'da_xac_nhan': 'blue',
                                            'dang_thuc_hien': 'cyan',
                                            'hoan_thanh': 'green',
                                            'da_huy': 'red',
                                        };
                                        return <Tag color={colors[status]}>{status}</Tag>;
                                    }
                                },
                            ]}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>

                    <Card title="Lịch sử mua hàng">
                        <Table
                            dataSource={purchaseHistory}
                            rowKey="id"
                            columns={[
                                { title: 'Mã HĐ', dataIndex: 'ma_hoa_don', width: 120 },
                                { title: 'Ngày', dataIndex: 'ngay_tao', render: (val) => dayjs(val).format('DD/MM/YYYY') },
                                { title: 'Tổng tiền', dataIndex: 'tong_thanh_toan', render: (val) => `${Number(val).toLocaleString()} VNĐ` },
                                {
                                    title: 'Trạng thái',
                                    dataIndex: 'trang_thai',
                                    render: (status) => (
                                        <Tag color={status === 'da_thanh_toan' ? 'green' : 'orange'}>{status}</Tag>
                                    )
                                },
                            ]}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </TabPane>

                <TabPane tab={<span><FileTextOutlined />Liệu trình</span>} key="packages">
                    <Row gutter={16}>
                        {treatmentPackages.map((pkg: any) => (
                            <Col span={8} key={pkg.id}>
                                <Card
                                    title={pkg.ten_lieu_trinh}
                                    extra={<Tag color={pkg.trang_thai === 'dang_thuc_hien' ? 'green' : 'orange'}>{pkg.trang_thai}</Tag>}
                                >
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Số buổi">{pkg.so_buoi}</Descriptions.Item>
                                        <Descriptions.Item label="Đã thực hiện">{pkg.so_buoi_da_thuc_hien}</Descriptions.Item>
                                        <Descriptions.Item label="Còn lại">{pkg.so_buoi - pkg.so_buoi_da_thuc_hien}</Descriptions.Item>
                                    </Descriptions>
                                    <Progress
                                        percent={Math.round((pkg.so_buoi_da_thuc_hien / pkg.so_buoi) * 100)}
                                        status="active"
                                        style={{ marginTop: 16 }}
                                    />
                                </Card>
                            </Col>
                        ))}
                        {treatmentPackages.length === 0 && (
                            <Col span={24}>
                                <Empty description="Chưa có liệu trình nào" />
                            </Col>
                        )}
                    </Row>
                </TabPane>
            </Tabs>

            {/* Edit Modals */}
            <Modal
                title="Chỉnh sửa thông tin khách hàng"
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                onOk={() => form.submit()}
                width={800}
            >
                <Form form={form} layout="vertical" onFinish={handleUpdateCustomer}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="ho_ten" label="Họ tên" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="ngay_sinh" label="Ngày sinh">
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="gioi_tinh" label="Giới tính">
                                <Radio.Group>
                                    <Radio value="Nam">Nam</Radio>
                                    <Radio value="Nữ">Nữ</Radio>
                                    <Radio value="Khác">Khác</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="so_dien_thoai" label="Số điện thoại">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="email" label="Email">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="nguon_khach" label="Nguồn khách">
                                <Select>
                                    <Select.Option value="walk_in">Walk-in</Select.Option>
                                    <Select.Option value="facebook">Facebook</Select.Option>
                                    <Select.Option value="google">Google</Select.Option>
                                    <Select.Option value="referral">Giới thiệu</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="dia_chi" label="Địa chỉ">
                                <TextArea rows={2} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Modal
                title="Chỉnh sửa hồ sơ sức khỏe"
                open={editHealthModalVisible}
                onCancel={() => setEditHealthModalVisible(false)}
                onOk={() => healthForm.submit()}
                width={800}
            >
                <Form form={healthForm} layout="vertical" onFinish={handleUpdateHealthProfile}>
                    <Form.Item name="tien_su_benh" label="Tiền sử bệnh (có thể chọn nhiều)">
                        <Select mode="tags" placeholder="Nhập và Enter để thêm">
                            <Select.Option value="Tim mạch">Tim mạch</Select.Option>
                            <Select.Option value="Tiểu đường">Tiểu đường</Select.Option>
                            <Select.Option value="Cao huyết áp">Cao huyết áp</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="di_ung" label="Dị ứng (có thể chọn nhiều)">
                        <Select mode="tags" placeholder="Nhập và Enter để thêm">
                            <Select.Option value="Hải sản">Hải sản</Select.Option>
                            <Select.Option value="Thuốc kháng sinh">Thuốc kháng sinh</Select.Option>
                            <Select.Option value="Phấn hoa">Phấn hoa</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="thuoc_dang_dung" label="Thuốc đang sử dụng">
                        <Select mode="tags" placeholder="Nhập và Enter để thêm" />
                    </Form.Item>
                    <Form.Item name="benh_da_lieu" label="Bệnh da liễu">
                        <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="phau_thuat_tham_my" label="Phẫu thuật thẩm mỹ">
                        <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="ghi_chu_suc_khoe" label="Ghi chú">
                        <TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Chỉnh sửa hồ sơ da"
                open={editSkinModalVisible}
                onCancel={() => setEditSkinModalVisible(false)}
                onOk={() => skinForm.submit()}
                width={800}
            >
                <Form form={skinForm} layout="vertical" onFinish={handleUpdateSkinProfile}>
                    <Form.Item name="loai_da" label="Loại da">
                        <Radio.Group>
                            <Radio value="Khô">Khô</Radio>
                            <Radio value="Dầu">Dầu</Radio>
                            <Radio value="Hỗn hợp">Hỗn hợp</Radio>
                            <Radio value="Nhạy cảm">Nhạy cảm</Radio>
                            <Radio value="Bình thường">Bình thường</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item name="van_de_da" label="Vấn đề da">
                        <Select mode="tags" placeholder="Nhập và Enter để thêm">
                            <Select.Option value="Mụn">Mụn</Select.Option>
                            <Select.Option value="Thâm">Thâm</Select.Option>
                            <Select.Option value="Nám">Nám</Select.Option>
                            <Select.Option value="Lão hóa">Lão hóa</Select.Option>
                            <Select.Option value="Sẹo">Sẹo</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="muc_tieu_dieu_tri" label="Mục tiêu điều trị">
                        <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="san_pham_dang_dung" label="Sản phẩm đang sử dụng">
                        <Select mode="tags" placeholder="Nhập và Enter để thêm" />
                    </Form.Item>
                    <Form.Item name="ghi_chu" label="Ghi chú">
                        <TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CustomerProfile;
