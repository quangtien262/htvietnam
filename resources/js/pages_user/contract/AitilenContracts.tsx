import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { API_USER } from "../../common/api_user";
import {
    Card, Row, Col, Table, Tabs, Badge, Statistic,
    Typography, Divider, Button, Space, Tag, Modal,
    DatePicker, Descriptions, Alert, Timeline,
    Progress, Empty, Steps, Upload, message
} from "antd";
import {
    BookOutlined, CalendarOutlined, EyeOutlined, DownloadOutlined,
    CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
    UserOutlined, HomeOutlined, EditOutlined, FileTextOutlined,
    PrinterOutlined, FilePdfOutlined, HistoryOutlined,
    SafetyOutlined, DollarOutlined, PhoneOutlined, MailOutlined,
    EnvironmentOutlined, IdcardOutlined, AuditOutlined,
    UploadOutlined, CloudUploadOutlined, FileAddOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Step } = Steps;

// Interface definitions
interface ContractAddendum {
    id: string;
    title: string;
    type: 'rent_increase' | 'service_change' | 'term_extension' | 'other';
    description: string;
    effective_date: string;
    status: 'pending' | 'approved' | 'rejected';
    created_date: string;
    documents: string[];
}

interface Contract {
    id: string;
    contract_number: string;
    room_name: string;
    apartment_name: string;
    tenant_name: string;
    tenant_phone: string;
    tenant_email: string;
    tenant_id_card: string;
    start_date: string;
    end_date: string;
    monthly_rent: number;
    deposit_amount: number;
    status: 'active' | 'expired' | 'terminated';
    created_date: string;
    signed_date: string;
    addendums: ContractAddendum[];
}

const AitilenContracts: React.FC = () => {
    // get params
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    // state ....
    const [loading, setLoading] = useState(false);
    const [currentContract, setCurrentContract] = useState<any>(null);
    const [contractHistory, setContractHistory] = useState<Contract[]>([]);
    const [activeTab, setActiveTab] = useState('current');
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [dataAction, setDataAction] = useState<Contract | null>(null);
    const [addendumModalVisible, setAddendumModalVisible] = useState(false);
    const [selectedAddendum, setSelectedAddendum] = useState<ContractAddendum | null>(null);

    const [phuLucHopDong, setPhuLucHopDong] = useState([]);

    // Functions
    const fetchCurrentContract = async () => {
        setLoading(true);
        try {
            // Thay thế bằng API call thực tế
            const response = await axios.post(API_USER.contractIndex);
            setCurrentContract(response.data.data.contract);
            setContractHistory(response.data.data.contracts);
            setPhuLucHopDong(response.data.data.phuLucHopDong);
        } catch (error) {
            console.error('Error fetching current contract:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchContractHistory = async () => {
        setLoading(true);
        try {
            // Thay thế bằng API call thực tế
            // const response = await axios.post(API.getContractHistory);
            // setContractHistory(mockContractHistory);
        } catch (error) {
            console.error('Error fetching contract history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentContract();
        // fetchContractHistory();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'pending': return 'warning';
            case 'approved': return 'success';
            case 'rejected': return 'error';
            case 'expired': return 'default';
            case 'terminated': return 'error';
            default: return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Đang hiệu lực';
            case 'pending': return 'Chờ phê duyệt';
            case 'approved': return 'Đã phê duyệt';
            case 'rejected': return 'Đã từ chối';
            case 'expired': return 'Đã hết hạn';
            case 'terminated': return 'Đã chấm dứt';
            default: return 'Không xác định';
        }
    };

    const getAddendumTypeText = (type: string) => {
        switch (type) {
            case 'rent_increase': return 'Tăng tiền thuê';
            case 'service_change': return 'Thay đổi dịch vụ';
            case 'term_extension': return 'Gia hạn hợp đồng';
            case 'other': return 'Khác';
            default: return 'Không xác định';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const showContractDetail = (contract: any) => {
        setDataAction(contract);
        setDetailModalVisible(true);
    };

    const showAddendumDetail = (addendum: any) => {
        setSelectedAddendum(addendum);
        setAddendumModalVisible(true);
    };

    const calculateRemainingTime = (endDate: string) => {
        const now = dayjs();
        const end = dayjs(endDate);

        if (end.isBefore(now)) {
            return { isExpired: true, text: 'Đã hết hạn' };
        }

        const totalDays = end.diff(now, 'day');
        const months = Math.floor(totalDays / 30);
        const days = totalDays % 30;

        if (months > 0) {
            return {
                isExpired: false,
                totalDays,
                text: `${months} tháng ${days} ngày`
            };
        } else {
            return {
                isExpired: false,
                totalDays,
                text: `${days} ngày`
            };
        }
    };

    // Render current contract details
    const renderCurrentContractDetails = () => {
        if (!currentContract) {
            return <Empty description="Không có hợp đồng hiện tại" />;
        }

        const remainingTime = currentContract?.end_date ? calculateRemainingTime(currentContract.end_date) : { isExpired: false, totalDays: 0, text: '0 ngày' };

        return (
            <Row gutter={[8, 16]}>
                {/* Contract Overview */}
                <Col span={24}>
                    <Card
                        title={
                            <Space size={4} wrap>
                                <BookOutlined />
                                <span style={{ fontSize: '16px' }}>Hợp đồng hiện tại</span>
                                {currentContract?.contract_status_name ? <Tag color={currentContract.contract_status_color} style={{ fontSize: '12px' }}>{currentContract.contract_status_name}</Tag> : ''}
                            </Space>
                        }
                        size="small"
                    >
                        {!currentContract?.id ? <Empty description="Không có hợp đồng hiện tại" /> : (
                            <div>
                                <Row gutter={[8, 12]}>
                                    <Col xs={24} sm={12} md={12}>
                                        <Statistic
                                            title="Số hợp đồng"
                                            value={currentContract?.code || ''}
                                            valueStyle={{ color: '#1890ff', fontSize: '16px' }}
                                        />
                                    </Col>
                                    <Col xs={24} sm={12} md={12}>
                                        <Statistic
                                            title="Thời gian còn lại"
                                            value={remainingTime.isExpired ? 'Đã hết hạn' : remainingTime.text}
                                            valueStyle={{
                                                color: remainingTime.isExpired ? '#f5222d' :
                                                      ((remainingTime.totalDays || 0) < 30 ? '#f5222d' : '#52c41a'),
                                                fontSize: '16px'
                                            }}
                                        />
                                    </Col>
                                </Row>

                                <Divider style={{ margin: '12px 0' }} />

                                <Descriptions
                                    bordered
                                    column={{ xs: 1, sm: 1, md: 2 }}
                                    size="small"
                                >
                                    <Descriptions.Item label="Tên khách thuê">
                                        {currentContract?.ho_ten || ''}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số điện thoại">
                                        {currentContract?.phone || ''}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Email">
                                        {currentContract?.email || ''}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="CCCD/CMND">
                                        {currentContract?.cccd || ''}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Căn hộ">
                                        {currentContract?.apartment_name || ''}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Phòng">
                                        {currentContract?.room_name || ''}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày bắt đầu">
                                        {currentContract?.start_date ? dayjs(currentContract.start_date).format('DD/MM/YYYY') : ''}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày kết thúc">
                                        {currentContract?.end_date ? dayjs(currentContract.end_date).format('DD/MM/YYYY') : ''}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Tiền thuê hàng tháng">
                                        <Text strong style={{ color: '#f5222d' }}>
                                            {formatCurrency(currentContract?.gia_thue || 0)}
                                        </Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Tiền đặt cọc">
                                        <Text strong>
                                            {formatCurrency(currentContract?.tien_coc || 0)}
                                        </Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày ký hợp đồng">
                                        {currentContract?.signed_date ? dayjs(currentContract.signed_date).format('DD/MM/YYYY') : ''}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Thao tác">
                                        <Button
                                            type="primary"
                                            icon={<EyeOutlined />}
                                            onClick={() => showContractDetail(currentContract)}
                                        >
                                            Xem chi tiết
                                        </Button>
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        )}

                        {!remainingTime.isExpired && (remainingTime.totalDays || 0) < 30 && (
                            <Alert
                                message="Hợp đồng sắp hết hạn"
                                description={`Hợp đồng của bạn sẽ hết hạn sau ${remainingTime.text}. Vui lòng liên hệ quản lý để gia hạn hợp đồng.`}
                                type="warning"
                                showIcon
                                style={{ marginTop: 12 }}
                                action={
                                    <div style={{ marginTop: 8 }}>
                                        <Button size="small" type="primary" block>
                                            Liên hệ gia hạn
                                        </Button>
                                    </div>
                                }
                            />
                        )}
                        {remainingTime.isExpired && (
                            <Alert
                                message="Hợp đồng đã hết hạn"
                                description="Hợp đồng của bạn đã hết hạn. Vui lòng liên hệ quản lý để gia hạn hoặc ký hợp đồng mới."
                                type="error"
                                showIcon
                                style={{ marginTop: 12 }}
                                action={
                                    <div style={{ marginTop: 8 }}>
                                        <Button size="small" type="primary" danger block>
                                            Liên hệ ngay
                                        </Button>
                                    </div>
                                }
                            />
                        )}
                    </Card>
                </Col>

                {/* Phụ lục hợp đồng */}
                <Col span={24}>
                    <Card
                        title={
                            <Space size={4}>
                                <CalendarOutlined />
                                <span style={{ fontSize: '16px' }}>Lịch sử thay đổi hợp đồng</span>
                            </Space>
                        }
                        size="small"
                    >
                        {phuLucHopDong.length > 0 ? (
                            <Timeline mode="left" style={{ marginTop: 0 }}>
                                {currentContract?.addendums?.map((addendum: ContractAddendum) => (
                                    <Timeline.Item
                                        key={addendum.id}
                                        color={getStatusColor(addendum.status)}
                                        label={
                                            <Text style={{ fontSize: '12px' }}>
                                                {dayjs(addendum.created_date).format('DD/MM/YYYY')}
                                            </Text>
                                        }
                                    >
                                        <Card size="small" style={{ marginBottom: 8 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <div style={{ flex: 1 }}>
                                                    <Text strong style={{ fontSize: '14px' }}>{addendum.title}</Text>
                                                    <br />
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        {getAddendumTypeText(addendum.type)}
                                                    </Text>
                                                    <br />
                                                    <Text style={{ fontSize: '13px' }}>{addendum.description}</Text>
                                                    <br />
                                                    <Text style={{ fontSize: '12px' }}>
                                                        Hiệu lực từ: {dayjs(addendum.effective_date).format('DD/MM/YYYY')}
                                                    </Text>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Tag color={getStatusColor(addendum.status)} style={{ fontSize: '12px' }}>
                                                        {getStatusText(addendum.status)}
                                                    </Tag>
                                                    <Button
                                                        size="small"
                                                        type="link"
                                                        icon={<EyeOutlined />}
                                                        onClick={() => showAddendumDetail(addendum)}
                                                        style={{ padding: '0 4px' }}
                                                    >
                                                        Chi tiết
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </Timeline.Item>
                                ))}
                            </Timeline>
                        ) : (
                            <Empty description="Chưa có phụ lục hợp đồng nào" />
                        )}
                    </Card>
                </Col>
            </Row>
        );
    };

    // Render contract history
    const renderContractHistory = () => {
        // Desktop columns
        const desktopColumns = [
            {
                title: 'Số hợp đồng',
                dataIndex: 'code',
                key: 'code',
                render: (text: string, record: Contract) => (
                    <Button
                        type="link"
                        onClick={() => showContractDetail(record)}
                        style={{ padding: 0, fontSize: '13px' }}
                    >
                        {text}
                    </Button>
                )
            },
            {
                title: 'Căn hộ/Phòng',
                key: 'room_name',
                render: (record: Contract) => (
                    <div>
                        <div style={{ fontSize: '13px' }}>{record.apartment_name}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{record.room_name}</Text>
                    </div>
                )
            },
            {
                title: 'Thời gian thuê',
                key: 'create_date',
                render: (record: Contract) => (
                    <div>
                        <div style={{ fontSize: '12px' }}>{dayjs(record.start_date).format('DD/MM/YYYY')}</div>
                        <Text type="secondary" style={{ fontSize: '11px' }}>đến</Text>
                        <div style={{ fontSize: '12px' }}>{dayjs(record.end_date).format('DD/MM/YYYY')}</div>
                    </div>
                )
            },
            {
                title: 'Tiền thuê/tháng',
                dataIndex: 'gia_thue',
                key: 'monthly_rent',
                render: (amount: number) => (
                    <Text strong style={{ color: '#f5222d', fontSize: '13px' }}>
                        {formatCurrency(amount)}
                    </Text>
                )
            },
            {
                title: 'Trạng thái',
                dataIndex: 'contract_status_name',
                key: 'contract_status_name',
                render: (status: string, record: any) => (
                    <Tag color={record.contract_status_color} style={{ fontSize: '11px' }}>
                        {record.contract_status_name}
                    </Tag>
                )
            },
            {
                title: 'Thao tác',
                key: 'actions',
                render: (record: Contract) => (
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => showContractDetail(record)}
                    >
                        Xem
                    </Button>
                )
            }
        ];

        // Mobile card view
        const renderMobileCard = (record: Contract) => (
            <Card
                key={record.id}
                size="small"
                style={{ marginBottom: 12 }}
                actions={[
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => showContractDetail(record)}
                        block
                    >
                        Xem chi tiết
                    </Button>
                ]}
            >
                <Row gutter={[8, 4]}>
                    <Col span={24}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong style={{ fontSize: '14px' }}>{record.contract_number}</Text>
                            <Tag color={getStatusColor(record.status)} style={{ fontSize: '11px' }}>
                                {getStatusText(record.status)}
                            </Tag>
                        </div>
                    </Col>
                    <Col span={24}>
                        <Text style={{ fontSize: '13px' }}>{record.apartment_name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>{record.room_name}</Text>
                    </Col>
                    <Col span={24}>
                        <Text style={{ fontSize: '12px' }}>
                            {dayjs(record.start_date).format('DD/MM/YYYY')} - {dayjs(record.end_date).format('DD/MM/YYYY')}
                        </Text>
                    </Col>
                    <Col span={24}>
                        <Text strong style={{ color: '#f5222d', fontSize: '14px' }}>
                            {formatCurrency(record.monthly_rent)}/tháng
                        </Text>
                    </Col>
                </Row>
            </Card>
        );

        return (
            <Card
                title={
                    <Space size={4}>
                        <BookOutlined />
                        <span style={{ fontSize: '16px' }}>Lịch sử hợp đồng đã ký</span>
                    </Space>
                }
                size="small"
            >
                {/* Desktop Table */}
                <div className="d-none d-md-block">
                    <Table
                        columns={desktopColumns}
                        dataSource={contractHistory}
                        rowKey="id"
                        loading={loading}
                        size="small"
                        pagination={{
                            pageSize: 5,
                            showSizeChanger: false,
                            showTotal: (total) => `Tổng ${total} hợp đồng`,
                            simple: true
                        }}
                        scroll={{ x: 'max-content' }}
                    />
                </div>

                {/* Mobile Cards */}
                <div className="d-block d-md-none">
                    {contractHistory.map(renderMobileCard)}
                </div>
            </Card>
        );
    };

    return (
        <div className="contracts-page" style={{ padding: '0 8px' }}>
            <style>
                {`
                    @media (max-width: 768px) {
                        .ant-descriptions-item-label {
                            text-align: left !important;
                            padding: 8px !important;
                        }
                        .ant-descriptions-item-content {
                            padding: 8px !important;
                        }
                        .ant-card-head-title {
                            font-size: 14px !important;
                        }
                        .ant-statistic-title {
                            font-size: 12px !important;
                        }
                        .ant-timeline-item-content {
                            min-height: auto !important;
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
            <div className="page-header" style={{ marginBottom: 16, padding: '0 8px' }}>
                <Title level={3} style={{ marginBottom: 8, fontSize: '18px' }}>
                    <BookOutlined /> Quản lý hợp đồng
                </Title>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                    Quản lý thông tin hợp đồng thuê phòng và lịch sử xác nhận phụ lục hợp đồng tại Aitilen.
                </Text>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                size="small"
                items={[
                    {
                        key: 'current',
                        label: (
                            <Space size={4}>
                                <BookOutlined />
                                <span style={{ fontSize: '14px' }}>Hợp đồng hiện tại</span>
                            </Space>
                        ),
                        children: renderCurrentContractDetails()
                    },
                    {
                        key: 'history',
                        label: (
                            <Space size={4}>
                                <CalendarOutlined />
                                <span style={{ fontSize: '14px' }}>Lịch sử hợp đồng</span>
                                <Badge count={contractHistory.length} showZero style={{ fontSize: '11px' }} />
                            </Space>
                        ),
                        children: renderContractHistory()
                    }
                ]}
            />

            {/* Contract Detail Modal */}
            <Modal
                title={
                    <Space size={4}>
                        <BookOutlined />
                        <span style={{ fontSize: '16px' }}>Chi tiết hợp đồng</span>
                        {dataAction && (
                            <Tag color={getStatusColor(dataAction?.status || 'active')} style={{ fontSize: '12px' }}>
                                {getStatusText(dataAction?.status || 'active')}
                            </Tag>
                        )}
                    </Space>
                }
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                width="90%"
                style={{ maxWidth: 800 }}
                footer={[
                    <Button className="btn-default" key="close" onClick={() => setDetailModalVisible(false)} block>
                        Đóng
                    </Button>
                ]}
            >
                {dataAction && (
                    <div>
                        <Descriptions
                            bordered
                            column={1}
                            size="small"
                            labelStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                            contentStyle={{ fontSize: '13px' }}
                        >
                            <Descriptions.Item label="Số hợp đồng">
                                {dataAction?.code}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thông tin khách thuê">
                                <div>
                                    <strong>{dataAction?.ho_ten}</strong>
                                    <br />
                                    <Text>SĐT: {dataAction?.phone}</Text>
                                    <br />
                                    <Text>Email: {dataAction?.email}</Text>
                                    <br />
                                    <Text>CCCD: {dataAction?.cccd}</Text>
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thông tin căn hộ">
                                <div>
                                    <strong>{dataAction?.apartment_name}</strong>
                                    <br />
                                    <Text>{dataAction?.room_name}</Text>
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian hợp đồng">
                                {dataAction?.start_date ? dayjs(dataAction.start_date).format('DD/MM/YYYY') : ''} - {dataAction?.end_date ? dayjs(dataAction.end_date).format('DD/MM/YYYY') : ''}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tiền thuê hàng tháng">
                                <Text strong style={{ color: '#f5222d' }}>
                                    {formatCurrency(dataAction?.gia_thue || 0)}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tiền đặt cọc">
                                <Text strong>
                                    {formatCurrency(dataAction?.tien_coc || 0)}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày ký hợp đồng">
                                {dataAction?.start_date ? dayjs(dataAction.start_date).format('DD/MM/YYYY') : ''}
                            </Descriptions.Item>
                        </Descriptions>

                        {dataAction?.addendums?.length > 0 && (
                            <>
                                <Divider>Phụ lục hợp đồng</Divider>
                                <Timeline>
                                    {dataAction.addendums.map((addendum: ContractAddendum) => (
                                        <Timeline.Item
                                            key={addendum.id}
                                            color={getStatusColor(addendum.status)}
                                        >
                                            <Card size="small">
                                                <Space direction="vertical" style={{ width: '100%' }}>
                                                    <div>
                                                        <Text strong>{addendum.title}</Text>
                                                        <Tag color={getStatusColor(addendum.status)} style={{ marginLeft: 8 }}>
                                                            {getStatusText(addendum.status)}
                                                        </Tag>
                                                    </div>
                                                    <Text>{addendum.description}</Text>
                                                    <Text className="small" type="secondary">
                                                        Hiệu lực từ: {dayjs(addendum.effective_date).format('DD/MM/YYYY')}
                                                    </Text>
                                                </Space>
                                            </Card>
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            </>
                        )}
                    </div>
                )}
            </Modal>

            {/* Addendum Detail Modal */}
            <Modal
                title={
                    <Space size={4}>
                        <CalendarOutlined />
                        <span style={{ fontSize: '16px' }}>Chi tiết phụ lục</span>
                        {selectedAddendum && (
                            <Tag color={getStatusColor(selectedAddendum?.status || 'pending')} style={{ fontSize: '12px' }}>
                                {getStatusText(selectedAddendum?.status || 'pending')}
                            </Tag>
                        )}
                    </Space>
                }
                open={addendumModalVisible}
                onCancel={() => setAddendumModalVisible(false)}
                width="90%"
                style={{ maxWidth: 600 }}
                footer={[
                    <Button key="close" onClick={() => setAddendumModalVisible(false)} block>
                        Đóng
                    </Button>
                ]}
            >
                {selectedAddendum && (
                    <Descriptions
                        bordered
                        column={1}
                        size="small"
                        labelStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                        contentStyle={{ fontSize: '13px' }}
                    >
                        <Descriptions.Item label="Tiêu đề">
                            {selectedAddendum?.title}
                        </Descriptions.Item>
                        <Descriptions.Item label="Loại phụ lục">
                            <Tag>{getAddendumTypeText(selectedAddendum?.type || 'other')}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Mô tả">
                            {selectedAddendum?.description}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {selectedAddendum?.created_date ? dayjs(selectedAddendum.created_date).format('DD/MM/YYYY HH:mm') : ''}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày có hiệu lực">
                            {selectedAddendum?.effective_date ? dayjs(selectedAddendum.effective_date).format('DD/MM/YYYY') : ''}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tài liệu đính kèm">
                            {selectedAddendum?.documents?.length > 0 ? (
                                <Space direction="vertical">
                                    {selectedAddendum.documents.map((doc: string, index: number) => (
                                        <Button key={index} type="link" icon={<DownloadOutlined />}>
                                            {doc}
                                        </Button>
                                    ))}
                                </Space>
                            ) : (
                                <Text type="secondary">Không có tài liệu đính kèm</Text>
                            )}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default AitilenContracts;
