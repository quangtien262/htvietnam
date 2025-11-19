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
import { HTBankingQR } from "../../function/generateQR";
import { numberFormat } from "../../function/common";

const { Title, Text } = Typography;
const { MonthPicker } = DatePicker;

const AitilenInvoices: React.FC = () => {
    // get params

    // state ....
    const [loading, setLoading] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState<any>(null);
    const [invoiceHistory, setInvoiceHistory] = useState<any[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [activeTab, setActiveTab] = useState('current');
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [token, setToken] = useState('');

    // Functions
    const fetchCurrentInvoice = async () => {
        setLoading(true);
        try {
            // Thay thế bằng API call thực tế
            const response = await axios.post(API_USER.aitilen_invoiceIndexApi);
            console.log('Thông tin hóa đơn:', response.data.data.currentInvoice);
            setCurrentInvoice(response.data.data.currentInvoice);
            setInvoiceHistory(response.data.data.invoices);
            // Lưu token CSRF
            setToken(response.data.data.csrf_token);
        } catch (error) {
            console.error('Không tải được thông tin hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentInvoice();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case '1': return 'success';
            case '2': return 'error';
            case '3': return 'warning';
            default: return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case '1': return 'Đã thanh toán';
            case '2': return 'chưa thanh toán';
            case '3': return 'Còn công nợ';
            default: return 'Không xác định';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case '1': return <CheckCircleOutlined />;
            case '2': return <ClockCircleOutlined />;
            case '3': return <ExclamationCircleOutlined />;
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
        if (!items || items.length === 0) {
            return <Empty description="Không có mục hóa đơn" />;
        }
        return items.map((item: any) => (
            <Card key={item.id} size="small" style={{ marginBottom: 8 }}>
                <Row gutter={[8, 4]}>
                    <Col span={24}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong style={{ fontSize: '14px' }}>{item.name}</Text>
                            <Text strong style={{ color: '#f5222d', fontSize: '14px' }}>
                                {formatCurrency(item.price_total)}
                            </Text>
                        </div>
                    </Col>
                    <Col span={24}>
                        <Text style={{ fontSize: '12px' }}>
                            {item.note}
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
                            <Tag color={getStatusColor(invoice.aitilen_invoice_status_id)} style={{ fontSize: '11px' }}>
                                {getStatusText(invoice.aitilen_invoice_status_id)}
                            </Tag>
                        </div>
                    </Col>
                    <Col span={24}>
                        <Text style={{ fontSize: '13px' }}>{invoice.room_name}</Text>
                    </Col>
                    <Col span={12}>
                        <Text style={{ fontSize: '12px' }}>
                            Tổng tiền: <Text strong style={{ color: '#f5222d' }}>
                                {formatCurrency(invoice.total)}
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
            render: (_: any, record: any) => (
                <Text strong>{String(record.month).padStart(2, '0')}/{record.year}</Text>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            key: 'total',
            render: (amount: number) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {formatCurrency(amount)}
                </Text>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'aitilen_invoice_status_id',
            key: 'aitilen_invoice_status_id',
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
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    size="small"
                    items={[
                        {
                            key: 'current',
                            label: (
                                <span style={{ fontSize: '14px' }}>
                                    <CalendarOutlined />
                                    Hóa đơn hiện tại
                                </span>
                            ),
                            children: (
                                <>
                                    {/* Current Invoice */}
                                    {currentInvoice && currentInvoice.id ? (
                                        <Row gutter={[8, 16]}>
                                            {/* Thông tin tổng quan */}
                                            <Col span={24}>
                                                <Card size="small">
                                                    <Row gutter={[8, 12]}>
                                                        <Col xs={12} sm={12} md={8}>
                                                            <Statistic
                                                                title="Tổng tiền"
                                                                value={currentInvoice?.total || 0}
                                                                formatter={(value) => formatCurrency(Number(value))}
                                                                prefix={<DollarOutlined />}
                                                                valueStyle={{ color: '#1890ff' }}
                                                            />
                                                        </Col>
                                                        <Col xs={24} sm={12} md={8}>
                                                            <Statistic
                                                                title="Hạn thanh toán"
                                                                value={currentInvoice?.ngay_hen_dong_tien ? dayjs(currentInvoice.ngay_hen_dong_tien).format('DD/MM/YYYY') : '-'}
                                                                prefix={<ClockCircleOutlined />}
                                                                valueStyle={{ color: currentInvoice?.ngay_hen_dong_tien && dayjs().isAfter(currentInvoice.ngay_hen_dong_tien) ? '#ff4d4f' : '#52c41a' }}
                                                            />
                                                        </Col>
                                                        <Col xs={24} sm={12} md={8}>
                                                            <div style={{ textAlign: 'center' }}>
                                                                <div style={{ marginBottom: '8px' }}>
                                                                    <Text strong>Trạng thái</Text>
                                                                </div>
                                                                <Tag
                                                                    color={getStatusColor(currentInvoice?.aitilen_invoice_status_id || '4')}
                                                                    icon={getStatusIcon(currentInvoice?.aitilen_invoice_status_id || '4')}
                                                                    style={{ fontSize: '14px', padding: '4px 12px' }}
                                                                >
                                                                    {getStatusText(currentInvoice?.aitilen_invoice_status_id || '4')}
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
                                                    // extra={
                                                    //     <Space>
                                                    //         <Button
                                                    //             type="primary"
                                                    //             icon={<PayCircleOutlined />}
                                                    //             onClick={() => showPaymentModal(currentInvoice)}
                                                    //             disabled={currentInvoice?.aitilen_invoice_status_id === '1'}
                                                    //         >
                                                    //             Thanh toán
                                                    //         </Button>
                                                    //     </Space>
                                                    // }
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

                                                    {/* Bảng chi tiết các khoản phí dịch vụ - Desktop */}
                                                    <Row>
                                                        <Col xs={24} md={12}>
                                                            <HTBankingQR
                                                                bankCode="TPB"
                                                                accountNumber="00299941001"
                                                                accountName="LUU QUANG TIEN"
                                                                amount={currentInvoice.total}
                                                                description="2013017"
                                                                csrf_token={token}
                                                            />
                                                        </Col>
                                                        <Col xs={24} md={12}>
                                                            <Card size="small" style={{ marginTop: 8, background: '#f0f9ff', width: '100%'  }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <Text strong style={{ fontSize: '14px' }}>Kỳ hóa đơn:</Text>
                                                                    <Text strong style={{ fontSize: '15px', color: '#1890ff' }}> {`${String(currentInvoice?.month || 0).padStart(2, '0')}/${currentInvoice?.year || 0}`}</Text>
                                                                </div>
                                                            </Card>

                                                            <Card size="small" style={{ marginTop: 8, background: '#f0f9ff', width: '100%' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <Text strong style={{ fontSize: '14px' }}>Tiền phòng:</Text>
                                                                    <Text strong style={{ fontSize: '15px', color: '#1890ff' }}> {currentInvoice?.tien_phong ? numberFormat(currentInvoice.tien_phong) : ''}</Text>
                                                                </div>
                                                            </Card>

                                                            {currentInvoice?.tien_coc ? (
                                                                <Card size="small" style={{ marginTop: 8, background: '#f0f9ff', width: '100%' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <Text strong style={{ fontSize: '14px' }}>Tiền cọc:</Text>
                                                                        <Text strong style={{ fontSize: '15px', color: '#1890ff' }}> {currentInvoice?.tien_coc ? numberFormat(currentInvoice.tien_coc) : ''}</Text>
                                                                    </div>
                                                                </Card>
                                                            ) : null}



                                                            {currentInvoice?.tra_coc ? (
                                                                <Card size="small" style={{ marginTop: 8, background: '#f0f9ff', width: '100%' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <Text strong style={{ fontSize: '14px' }}>Tiền cọc:</Text>
                                                                        <Text strong style={{ fontSize: '15px', color: '#1890ff' }}> {currentInvoice?.tra_coc ? numberFormat(currentInvoice.tra_coc) : ''}</Text>
                                                                    </div>
                                                                </Card>
                                                            ) : null}
                                                        </Col>
                                                    </Row>

                                                    <div className="d-none d-md-block">
                                                        <br />
                                                        <Table
                                                            dataSource={currentInvoice?.services || []}
                                                            rowKey="id"
                                                            pagination={false}
                                                            size="small"
                                                            columns={[
                                                                {
                                                                    title: <b style={{ color: '#c93f07' }}>DỊCH VỤ</b>,
                                                                    dataIndex: 'name',
                                                                    key: 'name',
                                                                    render: (text: string, record: any) => (
                                                                        <div>
                                                                            <Text strong>{text}</Text>
                                                                            {record.note && (
                                                                                <div>
                                                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                                        {record.note}
                                                                                    </Text>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ),
                                                                },
                                                                {
                                                                    title: <b style={{ color: '#c93f07' }}>THÀNH TIỀN</b>,
                                                                    dataIndex: 'price_total',
                                                                    key: 'price_total',
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
                                                                        <Table.Summary.Cell index={0} colSpan={1}>
                                                                            <Text strong className="_red" style={{ fontSize: '18px' }}>Tổng cộng</Text>
                                                                        </Table.Summary.Cell>
                                                                        <Table.Summary.Cell index={1} align="right">
                                                                            <Text className="_red" strong style={{ fontSize: '18px' }}>
                                                                                {formatCurrency(currentInvoice?.total || 0)}
                                                                            </Text>
                                                                        </Table.Summary.Cell>
                                                                    </Table.Summary.Row>
                                                                </Table.Summary>
                                                            )}
                                                        />
                                                    </div>

                                                    {/* Mobile Cards */}
                                                    <div className="d-block d-md-none">
                                                        <br />
                                                        <Text strong style={{ fontSize: '14px', marginBottom: 8, display: 'block' }}>
                                                            Chi tiết các khoản phí dịch vụ:
                                                        </Text>
                                                        {renderMobileInvoiceItems(currentInvoice?.services || [])}

                                                        {/* Mobile Total */}
                                                        <Card size="small" style={{ marginTop: 8, background: '#f0f9ff' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Text strong style={{ fontSize: '16px' }}>Tổng cộng:</Text>
                                                                <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                                                                    {formatCurrency(currentInvoice?.total || 0)}
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
                                </>
                            )
                        },
                        {
                            key: 'history',
                            label: (
                                <span style={{ fontSize: '14px' }}>
                                    <HistoryOutlined />
                                    Lịch sử hóa đơn
                                </span>
                            ),
                            children: (
                                <>
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
                                </>
                            )
                        }
                    ]}
                />

                {/* Modal chi tiết hóa đơn */}
                <Modal
                    title={
                        <Space size={4}>
                            <FileProtectOutlined />
                            <span style={{ fontSize: '16px' }}>Chi tiết hóa đơn</span>
                        </Space>
                    }
                    open={detailModalVisible}
                    onCancel={() => setDetailModalVisible(false)}
                    footer={null}
                    width="95%"
                    style={{ maxWidth: 900, top: 20 }}
                >
                    {selectedInvoice && (
                        <div>
                            {/* Thông tin tổng quan */}
                            <Card size="small" style={{ marginBottom: 16 }}>
                                <Row gutter={[8, 12]}>
                                    <Col xs={12} sm={12} md={6}>
                                        <Statistic
                                            title="Kỳ hóa đơn"
                                            value={`${String(selectedInvoice?.month || 0).padStart(2, '0')}/${selectedInvoice?.year || 0}`}
                                            prefix={<CalendarOutlined />}
                                        />
                                    </Col>
                                    <Col xs={12} sm={12} md={6}>
                                        <Statistic
                                            title="Tổng tiền"
                                            value={selectedInvoice?.total || 0}
                                            formatter={(value) => formatCurrency(Number(value))}
                                            prefix={<DollarOutlined />}
                                            valueStyle={{ color: '#1890ff' }}
                                        />
                                    </Col>
                                    <Col xs={12} sm={12} md={6}>
                                        <Statistic
                                            title="Hạn thanh toán"
                                            value={selectedInvoice?.due_date ? dayjs(selectedInvoice.due_date).format('DD/MM/YYYY') : '-'}
                                            prefix={<ClockCircleOutlined />}
                                            valueStyle={{ color: selectedInvoice?.due_date && dayjs().isAfter(selectedInvoice.due_date) ? '#ff4d4f' : '#52c41a' }}
                                        />
                                    </Col>
                                    <Col xs={12} sm={12} md={6}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ marginBottom: '8px' }}>
                                                <Text strong>Trạng thái</Text>
                                            </div>
                                            <Tag
                                                color={getStatusColor(selectedInvoice?.status || 'pending')}
                                                icon={getStatusIcon(selectedInvoice?.status || 'pending')}
                                                style={{ fontSize: '14px', padding: '4px 12px' }}
                                            >
                                                {getStatusText(selectedInvoice?.status || 'pending')}
                                            </Tag>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>

                            {/* Alert nếu quá hạn */}
                            {selectedInvoice?.status === 'overdue' && (
                                <Alert
                                    message="Hóa đơn đã quá hạn thanh toán"
                                    description="Vui lòng thanh toán sớm để tránh bị cắt dịch vụ."
                                    type="error"
                                    showIcon
                                    style={{ marginBottom: '16px' }}
                                />
                            )}

                            {/* Chi tiết các khoản phí */}
                            <Card
                                title={
                                    <Space>
                                        <DiffOutlined />
                                        <span>Chi tiết các khoản phí</span>
                                    </Space>
                                }
                                size="small"
                                style={{ marginBottom: 16 }}
                            >
                                {/* Bảng chi tiết - Desktop */}
                                <div className="d-none d-md-block">
                                    <Table
                                        dataSource={selectedInvoice?.items || []}
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
                                                            {formatCurrency(selectedInvoice?.total || 0)}
                                                        </Text>
                                                    </Table.Summary.Cell>
                                                </Table.Summary.Row>
                                            </Table.Summary>
                                        )}
                                    />
                                </div>

                                {/* Mobile Cards */}
                                <div className="d-block d-md-none">
                                    {renderMobileInvoiceItems(selectedInvoice?.items || [])}

                                    {/* Mobile Total */}
                                    <Card size="small" style={{ marginTop: 8, background: '#f0f9ff' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text strong style={{ fontSize: '16px' }}>Tổng cộng:</Text>
                                            <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                                                {formatCurrency(selectedInvoice?.total || 0)}
                                            </Text>
                                        </div>
                                    </Card>
                                </div>
                            </Card>

                            {/* Thông tin bổ sung */}
                            <Descriptions
                                bordered
                                column={{ xs: 1, sm: 2 }}
                                size="small"
                                labelStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                                contentStyle={{ fontSize: '13px' }}
                                style={{ marginBottom: 16 }}
                            >
                                <Descriptions.Item label="Mã hóa đơn">
                                    {selectedInvoice.id}
                                </Descriptions.Item>
                                <Descriptions.Item label="Phòng">
                                    {selectedInvoice.room_name}
                                </Descriptions.Item>
                                {selectedInvoice.payment_date && (
                                    <Descriptions.Item label="Ngày thanh toán" span={2}>
                                        <Text strong style={{ color: '#52c41a' }}>
                                            {dayjs(selectedInvoice.payment_date).format('DD/MM/YYYY HH:mm')}
                                        </Text>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>

                            {/* Buttons */}
                            <div style={{ textAlign: 'right' }}>
                                <Space>
                                    <Button onClick={() => setDetailModalVisible(false)}>
                                        Đóng
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
                                        <div>Số tiền: <Text strong style={{ color: '#1890ff' }}>{formatCurrency(selectedInvoice.total)}</Text></div>
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
                                        onClick={() => {/* Handle online payment */ }}
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
                                        onClick={() => {/* Handle bank transfer */ }}
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
