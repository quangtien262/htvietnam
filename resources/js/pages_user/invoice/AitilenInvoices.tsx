import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { API } from "../../common/api";
import {
    Card, Row, Col, Table, Tabs, Badge, Statistic,
    Typography, Divider, Button, Space, Tag, Modal,
    DatePicker, Select, Descriptions, Alert, Timeline,
    Progress, Empty
} from "antd";
import {
    FileProtectOutlined, PayCircleOutlined, DiffOutlined,
    CalendarOutlined, EyeOutlined, DownloadOutlined,
    CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
    DollarOutlined, HistoryOutlined, InfoCircleOutlined,
    PrinterOutlined, CreditCardOutlined, BankOutlined,
    IdcardFilled, TeamOutlined, ProjectOutlined,
    SolutionOutlined, AppstoreOutlined
} from '@ant-design/icons';
import API_USER from "../../common/api_user";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { MonthPicker } = DatePicker;

// Interface definitions
// interface InvoiceItem {
//     id: string;
//     service_name: string;
//     quantity: number;
//     unit_price: number;
//     total_amount: number;
//     description?: string;
// }

// interface Invoice {
//     id: string;
//     month: number;
//     year: number;
//     room_name: string;
//     total_amount: number;
//     paid_amount: number;
//     remaining_amount: number;
//     due_date: string;
//     payment_date?: string;
//     status: 'pending' | 'paid' | 'overdue';
//     items: InvoiceItem[];
//     created_at: string;
// }

const AitilenInvoices: React.FC = () => {
    // get params
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    // state ....
    const [loading, setLoading] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState<any>(null);
    const [invoiceHistory, setInvoiceHistory] = useState<any[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [activeTab, setActiveTab] = useState('current');
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);

    // Mock data - sẽ thay thế bằng API thực tế
    const mockCurrentInvoice = {
        id: "INV-2025-11",
        month: 11,
        year: 2025,
        room_name: "Phòng 101 - Tòa A",
        total_amount: 2500000,
        paid_amount: 0,
        remaining_amount: 2500000,
        due_date: "2025-11-15",
        status: 'pending',
        created_at: "2025-11-01",
        items: [
            {
                id: "1",
                service_name: "Tiền phòng",
                quantity: 1,
                unit_price: 1500000,
                total_amount: 1500000,
                description: "Tiền thuê phòng tháng 11/2025"
            },
            {
                id: "2",
                service_name: "Tiền điện",
                quantity: 150,
                unit_price: 3500,
                total_amount: 525000,
                description: "150 số điện x 3,500đ"
            },
            {
                id: "3",
                service_name: "Tiền nước",
                quantity: 25,
                unit_price: 15000,
                total_amount: 375000,
                description: "25 khối nước x 15,000đ"
            },
            {
                id: "4",
                service_name: "Phí quản lý",
                quantity: 1,
                unit_price: 100000,
                total_amount: 100000,
                description: "Phí quản lý chung cư"
            }
        ]
    };

    const mockInvoiceHistory = [
        {
            id: "INV-2025-10",
            month: 10,
            year: 2025,
            room_name: "Phòng 101 - Tòa A",
            total_amount: 2300000,
            paid_amount: 2300000,
            remaining_amount: 0,
            due_date: "2025-10-15",
            payment_date: "2025-10-12",
            status: 'paid',
            created_at: "2025-10-01",
            items: []
        },
        {
            id: "INV-2025-09",
            month: 9,
            year: 2025,
            room_name: "Phòng 101 - Tòa A",
            total_amount: 2400000,
            paid_amount: 2400000,
            remaining_amount: 0,
            due_date: "2025-09-15",
            payment_date: "2025-09-14",
            status: 'paid',
            created_at: "2025-09-01",
            items: []
        },
        {
            id: "INV-2025-08",
            month: 8,
            year: 2025,
            room_name: "Phòng 101 - Tòa A",
            total_amount: 2600000,
            paid_amount: 2600000,
            remaining_amount: 0,
            due_date: "2025-08-15",
            payment_date: "2025-08-18",
            status: 'overdue',
            created_at: "2025-08-01",
            items: []
        }
    ];

    // Functions
    const fetchCurrentInvoice = async () => {
        setLoading(true);
        try {
            // Thay thế bằng API call thực tế
            const response = await axios.post(API_USER.aitilen_invoiceIndexApi);
            console.log('Thông tin hóa đơn:', response);
            setCurrentInvoice(response.data.data.currentInvoice);
            setInvoiceHistory(response.data.data.invoices);
        } catch (error) {
            console.error('Không tải được thông tin hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    const fetchInvoiceHistory = async () => {
        setLoading(true);
        try {
            // Thay thế bằng API call thực tế
            // const response = await axios.post(API.getInvoiceHistory);
            setInvoiceHistory(mockInvoiceHistory);
        } catch (error) {
            console.error('Error fetching invoice history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentInvoice();
        fetchInvoiceHistory();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'success';
            case 'pending': return 'warning';
            case 'overdue': return 'error';
            default: return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid': return 'Đã thanh toán';
            case 'pending': return 'Chờ thanh toán';
            case 'overdue': return 'Quá hạn';
            default: return 'Không xác định';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircleOutlined />;
            case 'pending': return <ClockCircleOutlined />;
            case 'overdue': return <ExclamationCircleOutlined />;
            default: return <InfoCircleOutlined />;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const showInvoiceDetail = (invoice: any) => {
        setSelectedInvoice(invoice);
        setDetailModalVisible(true);
    };

    const showPaymentModal = (invoice: any) => {
        setSelectedInvoice(invoice);
        setPaymentModalVisible(true);
    };

    // Render mobile-friendly invoice items
    const renderMobileInvoiceItems = (items: any) => {
        if(!items || items.length === 0) {
            return <Empty description="Không có mục hóa đơn" />;
        }
        return items.map((item: any) => (
            <Card key={item.id} size="small" style={{ marginBottom: 8 }}>
                <Row gutter={[8, 4]}>
                    <Col span={24}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong style={{ fontSize: '14px' }}>{item.service_name}</Text>
                            <Text strong style={{ color: '#f5222d', fontSize: '14px' }}>
                                {formatCurrency(item.total_amount)}
                            </Text>
                        </div>
                    </Col>
                    {item.description && (
                        <Col span={24}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {item.description}
                            </Text>
                        </Col>
                    )}
                    <Col span={12}>
                        <Text style={{ fontSize: '12px' }}>
                            Số lượng: {item.quantity}
                        </Text>
                    </Col>
                    <Col span={12}>
                        <Text style={{ fontSize: '12px' }}>
                            Đơn giá: {formatCurrency(item.unit_price)}
                        </Text>
                    </Col>
                </Row>
            </Card>
        ));
    };

    // Render mobile-friendly invoice history
    const renderMobileInvoiceHistory = (invoices: any[]) => {
        return invoices.map((invoice) => (
            <Card
                key={invoice.id}
                size="small"
                style={{ marginBottom: 12 }}
                actions={[
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => showInvoiceDetail(invoice)}
                        size="small"
                    >
                        Chi tiết
                    </Button>,
                    invoice.status === 'pending' && (
                        <Button
                            type="primary"
                            icon={<PayCircleOutlined />}
                            onClick={() => showPaymentModal(invoice)}
                            size="small"
                        >
                            Thanh toán
                        </Button>
                    )
                ].filter(Boolean)}
            >
                <Row gutter={[8, 4]}>
                    <Col span={24}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong style={{ fontSize: '14px' }}>
                                {String(invoice.month).padStart(2, '0')}/{invoice.year}
                            </Text>
                            <Tag color={getStatusColor(invoice.status)} style={{ fontSize: '11px' }}>
                                {getStatusText(invoice.status)}
                            </Tag>
                        </div>
                    </Col>
                    <Col span={24}>
                        <Text style={{ fontSize: '13px' }}>{invoice.room_name}</Text>
                    </Col>
                    <Col span={12}>
                        <Text style={{ fontSize: '12px' }}>
                            Tổng tiền: <Text strong style={{ color: '#f5222d' }}>
                                {formatCurrency(invoice.total_amount)}
                            </Text>
                        </Text>
                    </Col>
                    <Col span={12}>
                        <Text style={{ fontSize: '12px' }}>
                            Hạn thanh toán: {dayjs(invoice.due_date).format('DD/MM/YYYY')}
                        </Text>
                    </Col>
                    {invoice.remaining_amount > 0 && (
                        <Col span={24}>
                            <Text type="danger" style={{ fontSize: '12px' }}>
                                Còn thiếu: {formatCurrency(invoice.remaining_amount)}
                            </Text>
                        </Col>
                    )}
                </Row>
            </Card>
        ));
    };

    // Table columns for invoice history
    const historyColumns = [
        {
            title: 'Kỳ hóa đơn',
            dataIndex: 'month',
            key: 'month',
            render: (month: number, record: any) => (
                <Text strong>{String(month).padStart(2, '0')}/{record.year}</Text>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount: number) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {formatCurrency(amount)}
                </Text>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Badge
                    status={getStatusColor(status) as any}
                    text={getStatusText(status)}
                />
            ),
        },
        {
            title: 'Hạn thanh toán',
            dataIndex: 'due_date',
            key: 'due_date',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Ngày thanh toán',
            dataIndex: 'payment_date',
            key: 'payment_date',
            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => showInvoiceDetail(record)}
                    >
                        Xem chi tiết
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '8px', background: '#f0f2f5', minHeight: '100vh' }}>
            <style>
                {`
                    @media (max-width: 768px) {
                        .ant-card-head-title {
                            font-size: 14px !important;
                        }
                        .ant-statistic-title {
                            font-size: 12px !important;
                        }
                        .ant-statistic-content {
                            font-size: 16px !important;
                        }
                        .ant-table-tbody > tr > td {
                            padding: 8px 4px !important;
                        }
                        .ant-table-thead > tr > th {
                            padding: 8px 4px !important;
                        }
                        .ant-modal {
                            margin: 0 !important;
                            max-width: 100vw !important;
                        }
                        .ant-modal-content {
                            border-radius: 8px 8px 0 0 !important;
                        }
                        .ant-descriptions-item-label {
                            text-align: left !important;
                            padding: 6px !important;
                        }
                        .ant-descriptions-item-content {
                            padding: 6px !important;
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
                        <FileProtectOutlined /> Quản lý hóa đơn
                    </Title>
                    <Text type="secondary" style={{ fontSize: '14px' }}>Theo dõi và quản lý các hóa đơn thanh toán hàng tháng</Text>
                </div>

                {/* Tabs */}
                <Tabs activeKey={activeTab} onChange={setActiveTab} size="small">
                    <TabPane
                        tab={
                            <span style={{ fontSize: '14px' }}>
                                <CalendarOutlined />
                                Hóa đơn hiện tại
                            </span>
                        }
                        key="current"
                    >
                        {/* Current Invoice */}
                        {currentInvoice && currentInvoice.id ? (
                            <Row gutter={[8, 16]}>
                                {/* Thông tin tổng quan */}
                                <Col span={24}>
                                    <Card size="small">
                                        <Row gutter={[8, 12]}>
                                            <Col xs={12} sm={12} md={6}>
                                                <Statistic
                                                    title="Kỳ hóa đơn"
                                                    value={`${String(currentInvoice?.month || 0).padStart(2, '0')}/${currentInvoice?.year || 0}`}
                                                    prefix={<CalendarOutlined />}
                                                />
                                            </Col>
                                            <Col xs={12} sm={12} md={6}>
                                                <Statistic
                                                    title="Tổng tiền"
                                                    value={currentInvoice?.total_amount || 0}
                                                    formatter={(value) => formatCurrency(Number(value))}
                                                    prefix={<DollarOutlined />}
                                                    valueStyle={{ color: '#1890ff' }}
                                                />
                                            </Col>
                                            <Col xs={24} sm={12} md={6}>
                                                <Statistic
                                                    title="Hạn thanh toán"
                                                    value={currentInvoice?.due_date ? dayjs(currentInvoice.due_date).format('DD/MM/YYYY') : '-'}
                                                    prefix={<ClockCircleOutlined />}
                                                    valueStyle={{ color: currentInvoice?.due_date && dayjs().isAfter(currentInvoice.due_date) ? '#ff4d4f' : '#52c41a' }}
                                                />
                                            </Col>
                                            <Col xs={24} sm={12} md={6}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ marginBottom: '8px' }}>
                                                        <Text strong>Trạng thái</Text>
                                                    </div>
                                                    <Tag
                                                        color={getStatusColor(currentInvoice?.status || 'pending')}
                                                        icon={getStatusIcon(currentInvoice?.status || 'pending')}
                                                        style={{ fontSize: '14px', padding: '4px 12px' }}
                                                    >
                                                        {getStatusText(currentInvoice?.status || 'pending')}
                                                    </Tag>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>

                                {/* Chi tiết hóa đơn */}
                                <Col span={24}>
                                    <Card
                                        title={
                                            <Space>
                                                <DiffOutlined />
                                                <span>Chi tiết hóa đơn</span>
                                            </Space>
                                        }
                                        extra={
                                            <Space>
                                                <Button
                                                    type="primary"
                                                    icon={<PayCircleOutlined />}
                                                    onClick={() => showPaymentModal(currentInvoice)}
                                                    disabled={currentInvoice?.status === 'paid'}
                                                >
                                                    Thanh toán
                                                </Button>
                                            </Space>
                                        }
                                    >
                                        {/* Alert nếu quá hạn */}
                                        {currentInvoice?.status === 'overdue' && (
                                            <Alert
                                                message="Hóa đơn đã quá hạn thanh toán"
                                                description="Vui lòng thanh toán sớm để tránh bị cắt dịch vụ."
                                                type="error"
                                                showIcon
                                                style={{ marginBottom: '16px' }}
                                            />
                                        )}

                                        {/* Bảng chi tiết các khoản phí - Desktop */}
                                        <div className="d-none d-md-block">
                                            <Table
                                                dataSource={currentInvoice?.items || []}
                                                rowKey="id"
                                                pagination={false}
                                                size="small"
                                            columns={[
                                                {
                                                    title: 'Dịch vụ',
                                                    dataIndex: 'service_name',
                                                    key: 'service_name',
                                                    render: (text: string, record: any) => (
                                                        <div>
                                                            <Text strong>{text}</Text>
                                                            {record.description && (
                                                                <div>
                                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                        {record.description}
                                                                    </Text>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ),
                                                },
                                                {
                                                    title: 'Số lượng',
                                                    dataIndex: 'quantity',
                                                    key: 'quantity',
                                                    align: 'center',
                                                    width: 100,
                                                },
                                                {
                                                    title: 'Đơn giá',
                                                    dataIndex: 'unit_price',
                                                    key: 'unit_price',
                                                    align: 'right',
                                                    width: 120,
                                                    render: (price: number) => formatCurrency(price),
                                                },
                                                {
                                                    title: 'Thành tiền',
                                                    dataIndex: 'total_amount',
                                                    key: 'total_amount',
                                                    align: 'right',
                                                    width: 150,
                                                    render: (amount: number) => (
                                                        <Text strong style={{ color: '#1890ff' }}>
                                                            {formatCurrency(amount)}
                                                        </Text>
                                                    ),
                                                },
                                            ]}
                                            summary={(data) => (
                                                <Table.Summary fixed>
                                                    <Table.Summary.Row>
                                                        <Table.Summary.Cell index={0} colSpan={3}>
                                                            <Text strong>Tổng cộng</Text>
                                                        </Table.Summary.Cell>
                                                        <Table.Summary.Cell index={1} align="right">
                                                            <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                                                                {formatCurrency(currentInvoice?.total_amount || 0)}
                                                            </Text>
                                                        </Table.Summary.Cell>
                                                    </Table.Summary.Row>
                                                </Table.Summary>
                                            )}
                                        />
                                        </div>

                                        {/* Mobile Cards */}
                                        <div className="d-block d-md-none">
                                            <Text strong style={{ fontSize: '14px', marginBottom: 8, display: 'block' }}>
                                                Chi tiết các khoản phí:
                                            </Text>
                                            {renderMobileInvoiceItems(currentInvoice?.items || [])}

                                            {/* Mobile Total */}
                                            <Card size="small" style={{ marginTop: 8, background: '#f0f9ff' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Text strong style={{ fontSize: '16px' }}>Tổng cộng:</Text>
                                                    <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                                                        {formatCurrency(currentInvoice?.total_amount || 0)}
                                                    </Text>
                                                </div>
                                            </Card>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        ) : (
                            <Empty description="Chưa có hóa đơn tháng hiện tại" />
                        )}
                    </TabPane>

                    <TabPane
                        tab={
                            <span style={{ fontSize: '14px' }}>
                                <HistoryOutlined />
                                Lịch sử hóa đơn
                            </span>
                        }
                        key="history"
                    >
                        {/* Invoice History */}
                        <Card size="small">
                            <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
                                    Lịch sử thanh toán
                                </Title>
                                <MonthPicker
                                    placeholder="Chọn tháng"
                                    value={selectedMonth}
                                    onChange={(date) => setSelectedMonth(date || dayjs())}
                                    style={{ width: '100%', maxWidth: 200 }}
                                    size="small"
                                />
                            </div>

                            {/* Desktop Table */}
                            <div className="d-none d-md-block">
                                <Table
                                    dataSource={invoiceHistory}
                                    columns={historyColumns}
                                    rowKey="id"
                                    loading={loading}
                                    size="small"
                                    scroll={{ x: 'max-content' }}
                                    pagination={{
                                        pageSize: 5,
                                        showSizeChanger: false,
                                        simple: true,
                                        showTotal: (total) => `Tổng ${total} hóa đơn`,
                                    }}
                                />
                            </div>

                            {/* Mobile Cards */}
                            <div className="d-block d-md-none">
                                {renderMobileInvoiceHistory(invoiceHistory)}
                            </div>
                        </Card>
                    </TabPane>
                </Tabs>

                {/* Modal chi tiết hóa đơn */}
                <Modal
                    title={
                        <Space size={4}>
                            <FileProtectOutlined />
                            <span style={{ fontSize: '16px' }}>Chi tiết hóa đơn {selectedInvoice?.id}</span>
                        </Space>
                    }
                    open={detailModalVisible}
                    onCancel={() => setDetailModalVisible(false)}
                    footer={[
                        <Button key="close" onClick={() => setDetailModalVisible(false)} block>
                            Đóng
                        </Button>
                    ]}
                    width="90%"
                    style={{ maxWidth: 800 }}
                >
                    {selectedInvoice && (
                        <div>
                            <Descriptions
                                bordered
                                column={{ xs: 1, sm: 1, md: 2 }}
                                size="small"
                                labelStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                                contentStyle={{ fontSize: '13px' }}
                            >
                                <Descriptions.Item label="Mã hóa đơn">
                                    {selectedInvoice.id}
                                </Descriptions.Item>
                                <Descriptions.Item label="Kỳ hóa đơn">
                                    {String(selectedInvoice.month).padStart(2, '0')}/{selectedInvoice.year}
                                </Descriptions.Item>
                                <Descriptions.Item label="Phòng">
                                    {selectedInvoice.room_name}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    <Badge
                                        status={getStatusColor(selectedInvoice.status) as any}
                                        text={getStatusText(selectedInvoice.status)}
                                    />
                                </Descriptions.Item>
                                <Descriptions.Item label="Tổng tiền">
                                    <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                                        {formatCurrency(selectedInvoice.total_amount)}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Hạn thanh toán">
                                    {dayjs(selectedInvoice.due_date).format('DD/MM/YYYY')}
                                </Descriptions.Item>
                                {selectedInvoice.payment_date && (
                                    <Descriptions.Item label="Ngày thanh toán">
                                        {dayjs(selectedInvoice.payment_date).format('DD/MM/YYYY')}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>

                            <div style={{ marginTop: '24px', textAlign: 'right' }}>
                                <Space>
                                    <Button icon={<DownloadOutlined />}>
                                        Tải PDF
                                    </Button>
                                    <Button icon={<PrinterOutlined />}>
                                        In hóa đơn
                                    </Button>
                                    {selectedInvoice.status !== 'paid' && (
                                        <Button
                                            type="primary"
                                            icon={<PayCircleOutlined />}
                                            onClick={() => {
                                                setDetailModalVisible(false);
                                                showPaymentModal(selectedInvoice);
                                            }}
                                        >
                                            Thanh toán
                                        </Button>
                                    )}
                                </Space>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Modal thanh toán */}
                <Modal
                    title={
                        <Space size={4}>
                            <PayCircleOutlined />
                            <span style={{ fontSize: '16px' }}>Thanh toán hóa đơn</span>
                        </Space>
                    }
                    open={paymentModalVisible}
                    onCancel={() => setPaymentModalVisible(false)}
                    footer={[
                        <Button key="cancel" onClick={() => setPaymentModalVisible(false)} block>
                            Hủy
                        </Button>
                    ]}
                    width="90%"
                    style={{ maxWidth: 600 }}
                >
                    {selectedInvoice && (
                        <div>
                            <Alert
                                message={`Thanh toán hóa đơn tháng ${String(selectedInvoice.month).padStart(2, '0')}/${selectedInvoice.year}`}
                                description={
                                    <div>
                                        <div>Số tiền: <Text strong style={{ color: '#1890ff' }}>{formatCurrency(selectedInvoice.total_amount)}</Text></div>
                                        <div>Phòng: <Text strong>{selectedInvoice.room_name}</Text></div>
                                    </div>
                                }
                                type="info"
                                showIcon
                                style={{ marginBottom: '24px' }}
                            />

                            <Title level={5} style={{ fontSize: '14px' }}>Chọn phương thức thanh toán:</Title>
                            <Row gutter={[8, 12]}>
                                <Col xs={24} sm={12} md={12}>
                                    <Card
                                        hoverable
                                        size="small"
                                        style={{ textAlign: 'center', minHeight: '100px' }}
                                        onClick={() => {/* Handle online payment */}}
                                    >
                                        <CreditCardOutlined style={{ fontSize: '28px', color: '#1890ff' }} />
                                        <div style={{ marginTop: 6 }}>
                                            <Text strong style={{ fontSize: '13px' }}>Thanh toán online</Text>
                                        </div>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '11px' }}>
                                                Visa, Mastercard, ATM
                                            </Text>
                                        </div>
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={12}>
                                    <Card
                                        hoverable
                                        size="small"
                                        style={{ textAlign: 'center', minHeight: '100px' }}
                                        onClick={() => {/* Handle bank transfer */}}
                                    >
                                        <BankOutlined style={{ fontSize: '28px', color: '#52c41a' }} />
                                        <div style={{ marginTop: 6 }}>
                                            <Text strong style={{ fontSize: '13px' }}>Chuyển khoản</Text>
                                        </div>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '11px' }}>
                                                Internet Banking
                                            </Text>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default AitilenInvoices;
