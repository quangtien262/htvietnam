import React, { useState, useEffect } from 'react';
import {
    Card, Table, Button, Space, Input, Select, Tag, Modal, Form, InputNumber,
    message, Popconfirm, Row, Col, Divider, Drawer, Descriptions, DatePicker,
    Switch, Badge, Statistic, Radio, Checkbox, Alert, Progress, Steps, Typography
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, SendOutlined,
    EyeOutlined, MailOutlined, PhoneOutlined, UserOutlined, CalendarOutlined,
    CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, BarChartOutlined,
    TeamOutlined, DollarOutlined, RiseOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import API_SPA from '../../common/api_spa';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;
const { Step } = Steps;

interface Campaign {
    id: number;
    ten_chien_dich: string;
    loai_chien_dich: string; // 'email', 'sms', 'zalo', 'mixed'
    doi_tuong_muc_tieu: string; // 'tat_ca', 'khach_hang_moi', 'khach_quen', 'cap_do_thanh_vien', 'custom'
    danh_sach_muc_tieu?: number[];
    noi_dung: string;
    tieu_de?: string;
    ngay_gui?: string;
    gio_gui?: string;
    trang_thai: string; // 'nhap', 'cho_gui', 'dang_gui', 'da_gui', 'huy'
    tong_doi_tuong: number;
    da_gui: number;
    thanh_cong: number;
    that_bai: number;
    da_xem: number;
    da_click: number;
    doanh_thu_tao_ra: number;
    created_at: string;
    sent_at?: string;
}

const MarketingCampaign: React.FC = () => {
    // State
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

    // Filters
    const [searchText, setSearchText] = useState('');
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
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalSent: 0,
        totalRevenue: 0,
    });

    // Target customers
    const [targetCount, setTargetCount] = useState(0);
    const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);

    // Load data
    useEffect(() => {
        loadCampaigns();
    }, [pagination.current, pagination.pageSize, searchText, selectedType, selectedStatus]);

    const loadCampaigns = async () => {
        setLoading(true);
        try {
            const response = await axios.post(API_SPA.spaCampaignList, {
                page: pagination.current,
                limit: pagination.pageSize,
                search: searchText,
                loai_chien_dich: selectedType,
                trang_thai: selectedStatus,
            });

            if (response.data.success) {
                const data = response.data.data;
                setCampaigns(data.data || []);
                setPagination({
                    ...pagination,
                    total: data.total || 0,
                });

                if (data.stats) {
                    setStats(data.stats);
                }
            }
        } catch (error) {
            message.error('Không thể tải danh sách chiến dịch');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const handleCreate = () => {
        form.resetFields();
        setSelectedCampaign(null);
        setTargetCount(0);
        setSelectedCustomers([]);
        setModalVisible(true);
    };

    const handleEdit = (record: Campaign) => {
        setSelectedCampaign(record);
        form.setFieldsValue({
            ...record,
            ngay_gui: record.ngay_gui ? dayjs(record.ngay_gui) : null,
        });
        setModalVisible(true);
    };

    const handleView = (record: Campaign) => {
        setSelectedCampaign(record);
        setDetailDrawerVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                id: selectedCampaign?.id,
                ...values,
                ngay_gui: values.ngay_gui ? values.ngay_gui.format('YYYY-MM-DD') : null,
                danh_sach_muc_tieu: values.doi_tuong_muc_tieu === 'custom' ? selectedCustomers : null,
            };

            const response = await axios.post(API_SPA.spaCampaignCreateOrUpdate, payload);

            if (response.data.success) {
                message.success(selectedCampaign ? 'Cập nhật chiến dịch thành công' : 'Tạo chiến dịch mới thành công');
                setModalVisible(false);
                loadCampaigns();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await axios.post(API_SPA.spaCampaignDelete, { id });
            if (response.data.success) {
                message.success('Xóa chiến dịch thành công');
                loadCampaigns();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể xóa chiến dịch');
        }
    };

    const handleSend = async (record: Campaign) => {
        Modal.confirm({
            title: 'Xác nhận gửi chiến dịch',
            content: `Bạn có chắc muốn gửi chiến dịch "${record.ten_chien_dich}" đến ${record.tong_doi_tuong} đối tượng?`,
            okText: 'Gửi ngay',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const response = await axios.post(API_SPA.spaCampaignSend, { id: record.id });
                    if (response.data.success) {
                        message.success('Chiến dịch đã được gửi thành công');
                        loadCampaigns();
                    }
                } catch (error: any) {
                    message.error(error.response?.data?.message || 'Không thể gửi chiến dịch');
                }
            },
        });
    };

    const handleTargetChange = async (target: string) => {
        if (target === 'custom') {
            return;
        }

        try {
            const response = await axios.post(API_SPA.spaCampaignCountTarget, {
                doi_tuong_muc_tieu: target,
            });

            if (response.data.success) {
                setTargetCount(response.data.count || 0);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getCampaignTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'email': 'Email',
            'sms': 'SMS',
            'zalo': 'Zalo',
            'mixed': 'Đa kênh',
        };
        return labels[type] || type;
    };

    const getCampaignTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'email': 'blue',
            'sms': 'green',
            'zalo': 'cyan',
            'mixed': 'purple',
        };
        return colors[type] || 'default';
    };

    const getCampaignTypeIcon = (type: string) => {
        const icons: Record<string, React.ReactNode> = {
            'email': <MailOutlined />,
            'sms': <PhoneOutlined />,
            'zalo': <SendOutlined />,
            'mixed': <SendOutlined />,
        };
        return icons[type] || <SendOutlined />;
    };

    const getCampaignStatus = (campaign: Campaign) => {
        const statuses: Record<string, { text: string; color: string; icon: React.ReactNode }> = {
            'nhap': { text: 'Bản nháp', color: 'default', icon: <EditOutlined /> },
            'cho_gui': { text: 'Chờ gửi', color: 'orange', icon: <ClockCircleOutlined /> },
            'dang_gui': { text: 'Đang gửi', color: 'blue', icon: <SendOutlined /> },
            'da_gui': { text: 'Đã gửi', color: 'green', icon: <CheckCircleOutlined /> },
            'huy': { text: 'Đã hủy', color: 'red', icon: <CloseCircleOutlined /> },
        };
        return statuses[campaign.trang_thai] || statuses['nhap'];
    };

    const calculateSuccessRate = (campaign: Campaign) => {
        if (campaign.da_gui === 0) return 0;
        return Math.round((campaign.thanh_cong / campaign.da_gui) * 100);
    };

    const calculateOpenRate = (campaign: Campaign) => {
        if (campaign.da_gui === 0) return 0;
        return Math.round((campaign.da_xem / campaign.da_gui) * 100);
    };

    const calculateClickRate = (campaign: Campaign) => {
        if (campaign.da_gui === 0) return 0;
        return Math.round((campaign.da_click / campaign.da_gui) * 100);
    };

    // Table columns
    const columns: ColumnsType<Campaign> = [
        {
            title: 'Tên chiến dịch',
            dataIndex: 'ten_chien_dich',
            key: 'ten_chien_dich',
            width: 250,
            fixed: 'left',
            render: (text: string, record) => (
                <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{text}</div>
                    <Space size={4}>
                        <Tag color={getCampaignTypeColor(record.loai_chien_dich)} icon={getCampaignTypeIcon(record.loai_chien_dich)}>
                            {getCampaignTypeLabel(record.loai_chien_dich)}
                        </Tag>
                    </Space>
                </div>
            ),
        },
        {
            title: 'Đối tượng',
            key: 'target',
            width: 150,
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 500, fontSize: 18, color: '#1890ff' }}>
                        {record.tong_doi_tuong.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                        <TeamOutlined /> Người nhận
                    </div>
                </div>
            ),
        },
        {
            title: 'Tiến độ gửi',
            key: 'progress',
            width: 200,
            render: (_, record) => {
                if (record.trang_thai === 'nhap' || record.trang_thai === 'cho_gui') {
                    return <Tag color="default">Chưa gửi</Tag>;
                }

                const percent = record.tong_doi_tuong > 0
                    ? Math.round((record.da_gui / record.tong_doi_tuong) * 100)
                    : 0;

                return (
                    <div>
                        <div style={{ marginBottom: 4 }}>
                            <Space>
                                <Badge count={record.da_gui} showZero color="blue" />
                                <span>/</span>
                                <Badge count={record.tong_doi_tuong} showZero color="green" />
                            </Space>
                        </div>
                        <Progress
                            percent={percent}
                            size="small"
                            status={record.trang_thai === 'dang_gui' ? 'active' : 'normal'}
                        />
                    </div>
                );
            },
        },
        {
            title: 'Kết quả',
            key: 'result',
            width: 180,
            render: (_, record) => {
                if (record.da_gui === 0) {
                    return <Tag color="default">Chưa có dữ liệu</Tag>;
                }

                return (
                    <div>
                        <div style={{ marginBottom: 4 }}>
                            <Space size={4}>
                                <Badge count={record.thanh_cong} showZero color="green" />
                                <Badge count={record.that_bai} showZero color="red" />
                            </Space>
                        </div>
                        <div style={{ fontSize: 12, color: '#52c41a' }}>
                            <CheckCircleOutlined /> {calculateSuccessRate(record)}% thành công
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Tương tác',
            key: 'engagement',
            width: 150,
            render: (_, record) => {
                if (record.da_gui === 0) {
                    return <Tag color="default">-</Tag>;
                }

                return (
                    <div>
                        <div style={{ fontSize: 12, marginBottom: 2 }}>
                            <EyeOutlined /> Xem: {calculateOpenRate(record)}%
                        </div>
                        <div style={{ fontSize: 12 }}>
                            <SendOutlined /> Click: {calculateClickRate(record)}%
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Doanh thu',
            dataIndex: 'doanh_thu_tao_ra',
            key: 'doanh_thu_tao_ra',
            width: 140,
            align: 'right',
            render: (value: number) => (
                <div>
                    <div style={{ fontWeight: 500, color: '#f5222d', fontSize: 15 }}>
                        {(value || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>VNĐ</div>
                </div>
            ),
        },
        {
            title: 'Thời gian',
            key: 'time',
            width: 180,
            render: (_, record) => (
                <div>
                    {record.ngay_gui ? (
                        <div>
                            <div style={{ fontSize: 12 }}>
                                <CalendarOutlined /> {dayjs(record.ngay_gui).format('DD/MM/YYYY')}
                            </div>
                            {record.gio_gui && (
                                <div style={{ fontSize: 12, marginTop: 2 }}>
                                    <ClockCircleOutlined /> {record.gio_gui}
                                </div>
                            )}
                        </div>
                    ) : (
                        <Tag color="default">Chưa lên lịch</Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 130,
            render: (_, record) => {
                const status = getCampaignStatus(record);
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
            width: 200,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small" direction="vertical">
                    <Space size="small">
                        <Button
                            type="link"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                        >
                            Xem
                        </Button>
                        {(record.trang_thai === 'nhap' || record.trang_thai === 'cho_gui') && (
                            <Button
                                type="link"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => handleEdit(record)}
                            >
                                Sửa
                            </Button>
                        )}
                    </Space>
                    <Space size="small">
                        {(record.trang_thai === 'nhap' || record.trang_thai === 'cho_gui') && (
                            <Button
                                type="link"
                                size="small"
                                icon={<SendOutlined />}
                                onClick={() => handleSend(record)}
                                style={{ color: '#52c41a' }}
                            >
                                Gửi
                            </Button>
                        )}
                        <Popconfirm
                            title="Xác nhận xóa chiến dịch này?"
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
                            title="Tổng chiến dịch"
                            value={stats.totalCampaigns}
                            prefix={<SendOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đang hoạt động"
                            value={stats.activeCampaigns}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng đã gửi"
                            value={stats.totalSent}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Doanh thu tạo ra"
                            value={stats.totalRevenue}
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
                        <SendOutlined />
                        <span>Quản lý Chiến dịch Marketing</span>
                        <Badge count={pagination.total} showZero />
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Tạo chiến dịch
                    </Button>
                }
            >
                {/* Filters */}
                <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={8}>
                            <Input.Search
                                placeholder="Tìm kiếm tên chiến dịch..."
                                allowClear
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                prefix={<SearchOutlined />}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Select
                                placeholder="Loại chiến dịch"
                                allowClear
                                style={{ width: '100%' }}
                                value={selectedType}
                                onChange={setSelectedType}
                            >
                                <Option value="email">Email</Option>
                                <Option value="sms">SMS</Option>
                                <Option value="zalo">Zalo</Option>
                                <Option value="mixed">Đa kênh</Option>
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
                                <Option value="nhap">Bản nháp</Option>
                                <Option value="cho_gui">Chờ gửi</Option>
                                <Option value="dang_gui">Đang gửi</Option>
                                <Option value="da_gui">Đã gửi</Option>
                                <Option value="huy">Đã hủy</Option>
                            </Select>
                        </Col>
                    </Row>
                </Space>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={campaigns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} chiến dịch`,
                        onChange: (page, pageSize) => {
                            setPagination({ ...pagination, current: page, pageSize });
                        },
                    }}
                    scroll={{ x: 1800 }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={selectedCampaign ? 'Chỉnh sửa chiến dịch' : 'Tạo chiến dịch mới'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSubmit}
                width={900}
                okText={selectedCampaign ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="ten_chien_dich"
                                label="Tên chiến dịch"
                                rules={[{ required: true, message: 'Vui lòng nhập tên chiến dịch' }]}
                            >
                                <Input placeholder="VD: Khuyến mãi tháng 11" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="loai_chien_dich"
                                label="Loại chiến dịch"
                                rules={[{ required: true }]}
                            >
                                <Select placeholder="Chọn kênh gửi">
                                    <Option value="email">Email</Option>
                                    <Option value="sms">SMS</Option>
                                    <Option value="zalo">Zalo</Option>
                                    <Option value="mixed">Đa kênh</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                name="doi_tuong_muc_tieu"
                                label="Đối tượng mục tiêu"
                                rules={[{ required: true }]}
                            >
                                <Radio.Group onChange={(e) => handleTargetChange(e.target.value)}>
                                    <Space direction="vertical">
                                        <Radio value="tat_ca">Tất cả khách hàng</Radio>
                                        <Radio value="khach_hang_moi">Khách hàng mới (chưa từng mua)</Radio>
                                        <Radio value="khach_quen">Khách quen (đã mua từ 3 lần trở lên)</Radio>
                                        <Radio value="cap_do_thanh_vien">Theo cấp độ thành viên</Radio>
                                        <Radio value="custom">Tùy chọn khách hàng</Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>
                            {targetCount > 0 && (
                                <Alert
                                    message={`Số lượng đối tượng: ${targetCount.toLocaleString()} khách hàng`}
                                    type="info"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                />
                            )}
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                name="tieu_de"
                                label="Tiêu đề (Email/Zalo)"
                            >
                                <Input placeholder="Tiêu đề của email hoặc tin nhắn Zalo" />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                name="noi_dung"
                                label="Nội dung"
                                rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                            >
                                <TextArea
                                    rows={6}
                                    placeholder="Nội dung tin nhắn marketing..."
                                    showCount
                                    maxLength={500}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="ngay_gui"
                                label="Ngày gửi"
                                tooltip="Để trống nếu muốn gửi ngay"
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="gio_gui"
                                label="Giờ gửi"
                                tooltip="VD: 09:00"
                            >
                                <Input placeholder="HH:mm" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="trang_thai"
                                label="Trạng thái"
                                initialValue="nhap"
                            >
                                <Select>
                                    <Option value="nhap">Bản nháp</Option>
                                    <Option value="cho_gui">Chờ gửi</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Detail Drawer */}
            <Drawer
                title="Chi tiết chiến dịch"
                placement="right"
                onClose={() => setDetailDrawerVisible(false)}
                open={detailDrawerVisible}
                width={700}
            >
                {selectedCampaign && (
                    <div>
                        {/* Status Alert */}
                        <Alert
                            message={getCampaignStatus(selectedCampaign).text}
                            type={
                                selectedCampaign.trang_thai === 'da_gui' ? 'success' :
                                selectedCampaign.trang_thai === 'dang_gui' ? 'info' :
                                selectedCampaign.trang_thai === 'huy' ? 'error' : 'warning'
                            }
                            showIcon
                            icon={getCampaignStatus(selectedCampaign).icon}
                            style={{ marginBottom: 24 }}
                        />

                        {/* Campaign Info */}
                        <Divider>Thông tin chiến dịch</Divider>
                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Tên chiến dịch">
                                {selectedCampaign.ten_chien_dich}
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại chiến dịch">
                                <Tag color={getCampaignTypeColor(selectedCampaign.loai_chien_dich)} icon={getCampaignTypeIcon(selectedCampaign.loai_chien_dich)}>
                                    {getCampaignTypeLabel(selectedCampaign.loai_chien_dich)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Đối tượng mục tiêu">
                                <Badge count={selectedCampaign.tong_doi_tuong} showZero color="blue" />
                                <span style={{ marginLeft: 8 }}>người</span>
                            </Descriptions.Item>
                            {selectedCampaign.tieu_de && (
                                <Descriptions.Item label="Tiêu đề">
                                    {selectedCampaign.tieu_de}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        {/* Content */}
                        <Divider>Nội dung</Divider>
                        <Card size="small" style={{ backgroundColor: '#f5f5f5' }}>
                            <Text>{selectedCampaign.noi_dung}</Text>
                        </Card>

                        {/* Schedule */}
                        {(selectedCampaign.ngay_gui || selectedCampaign.gio_gui) && (
                            <>
                                <Divider>Lịch gửi</Divider>
                                <Descriptions bordered column={1} size="small">
                                    {selectedCampaign.ngay_gui && (
                                        <Descriptions.Item label="Ngày gửi">
                                            <CalendarOutlined /> {dayjs(selectedCampaign.ngay_gui).format('DD/MM/YYYY')}
                                        </Descriptions.Item>
                                    )}
                                    {selectedCampaign.gio_gui && (
                                        <Descriptions.Item label="Giờ gửi">
                                            <ClockCircleOutlined /> {selectedCampaign.gio_gui}
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>
                            </>
                        )}

                        {/* Results (if sent) */}
                        {selectedCampaign.da_gui > 0 && (
                            <>
                                <Divider>Kết quả gửi</Divider>
                                <Row gutter={16} style={{ marginBottom: 16 }}>
                                    <Col span={12}>
                                        <Card size="small">
                                            <Statistic
                                                title="Đã gửi"
                                                value={selectedCampaign.da_gui}
                                                suffix={`/ ${selectedCampaign.tong_doi_tuong}`}
                                                valueStyle={{ color: '#1890ff' }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card size="small">
                                            <Statistic
                                                title="Thành công"
                                                value={calculateSuccessRate(selectedCampaign)}
                                                suffix="%"
                                                valueStyle={{ color: '#52c41a' }}
                                                prefix={<CheckCircleOutlined />}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card size="small">
                                            <Statistic
                                                title="Đã xem"
                                                value={calculateOpenRate(selectedCampaign)}
                                                suffix="%"
                                                valueStyle={{ color: '#faad14' }}
                                                prefix={<EyeOutlined />}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card size="small">
                                            <Statistic
                                                title="Đã click"
                                                value={calculateClickRate(selectedCampaign)}
                                                suffix="%"
                                                valueStyle={{ color: '#722ed1' }}
                                                prefix={<SendOutlined />}
                                            />
                                        </Card>
                                    </Col>
                                </Row>

                                <Descriptions bordered column={1} size="small">
                                    <Descriptions.Item label="Số lượng thành công">
                                        <Badge count={selectedCampaign.thanh_cong} showZero color="green" />
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số lượng thất bại">
                                        <Badge count={selectedCampaign.that_bai} showZero color="red" />
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Doanh thu tạo ra">
                                        <Text strong style={{ color: '#f5222d', fontSize: 16 }}>
                                            {selectedCampaign.doanh_thu_tao_ra.toLocaleString()} VNĐ
                                        </Text>
                                    </Descriptions.Item>
                                    {selectedCampaign.sent_at && (
                                        <Descriptions.Item label="Thời gian gửi">
                                            {dayjs(selectedCampaign.sent_at).format('DD/MM/YYYY HH:mm')}
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>
                            </>
                        )}

                        <Divider />
                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Ngày tạo">
                                {dayjs(selectedCampaign.created_at).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default MarketingCampaign;
