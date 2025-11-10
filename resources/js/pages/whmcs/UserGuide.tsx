import React, { useState } from 'react';
import {
    Card,
    Collapse,
    Typography,
    Row,
    Col,
    Steps,
    Alert,
    Tag,
    Tabs,
    List,
    Space,
    Button,
    Divider,
} from 'antd';
import {
    BookOutlined,
    VideoCameraOutlined,
    QuestionCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    InfoCircleOutlined,
    RocketOutlined,
    UserOutlined,
    CreditCardOutlined,
    CloudCloudServerOutlined,
    ShoppingOutlined,
    ApiOutlined,
    LineChartOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { TabPane } = Tabs;

const WhmcsUserGuide: React.FC = () => {
    const [activeTab, setActiveTab] = useState('1');

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Row align="middle">
                    <Col flex="auto">
                        <Title level={2} style={{ color: 'white', margin: 0 }}>
                            <BookOutlined /> Tài liệu Hướng dẫn Sử dụng WHMCS
                        </Title>
                        <Paragraph style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 0, marginTop: 8 }}>
                            Hệ thống quản lý Billing & Hosting toàn diện
                        </Paragraph>
                    </Col>
                    <Col>
                        <Tag color="success" style={{ fontSize: 14, padding: '4px 12px' }}>
                            Version 3.0 - Phase 3
                        </Tag>
                    </Col>
                </Row>
            </Card>

            {/* Quick Start Guide */}
            <Card title={<><RocketOutlined /> Quick Start Guide</>} style={{ marginBottom: 24 }}>
                <Steps
                    direction="vertical"
                    current={-1}
                    items={[
                        {
                            title: 'Bước 1: Đăng nhập hệ thống',
                            description: 'Truy cập trang quản trị và đăng nhập với tài khoản được cấp',
                            icon: <UserOutlined />,
                        },
                        {
                            title: 'Bước 2: Tạo sản phẩm/gói dịch vụ',
                            description: 'Vào menu WHMCS > Gói sản phẩm để tạo các package hosting',
                            icon: <ShoppingOutlined />,
                        },
                        {
                            title: 'Bước 3: Cấu hình máy chủ',
                            description: 'Thêm server vào hệ thống tại WHMCS > Máy chủ',
                            icon: <CloudServerOutlined />,
                        },
                        {
                            title: 'Bước 4: Quản lý khách hàng & hóa đơn',
                            description: 'Theo dõi dịch vụ, hóa đơn và thanh toán',
                            icon: <CreditCardOutlined />,
                        },
                    ]}
                />
            </Card>

            {/* Main Content Tabs */}
            <Card>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    {/* Module Documentation */}
                    <TabPane
                        tab={
                            <span>
                                <BookOutlined />
                                Hướng dẫn Modules
                            </span>
                        }
                        key="1"
                    >
                        <ModuleDocumentation />
                    </TabPane>

                    {/* Admin Panel Guide */}
                    <TabPane
                        tab={
                            <span>
                                <UserOutlined />
                                Admin Panel
                            </span>
                        }
                        key="2"
                    >
                        <AdminPanelGuide />
                    </TabPane>

                    {/* Client Portal Guide */}
                    <TabPane
                        tab={
                            <span>
                                <UserOutlined />
                                Client Portal
                            </span>
                        }
                        key="3"
                    >
                        <ClientPortalGuide />
                    </TabPane>

                    {/* API Documentation */}
                    <TabPane
                        tab={
                            <span>
                                <ApiOutlined />
                                API Documentation
                            </span>
                        }
                        key="4"
                    >
                        <ApiDocumentation />
                    </TabPane>

                    {/* FAQ */}
                    <TabPane
                        tab={
                            <span>
                                <QuestionCircleOutlined />
                                FAQ
                            </span>
                        }
                        key="5"
                    >
                        <FAQ />
                    </TabPane>

                    {/* Video Tutorials */}
                    <TabPane
                        tab={
                            <span>
                                <VideoCameraOutlined />
                                Video Tutorials
                            </span>
                        }
                        key="6"
                    >
                        <VideoTutorials />
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

// Module Documentation Component
const ModuleDocumentation: React.FC = () => {
    return (
        <div>
            <Alert
                message="Tổng quan Modules"
                description="Hệ thống WHMCS bao gồm 7 module chính giúp quản lý toàn bộ quy trình billing và hosting"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Collapse defaultActiveKey={['1']} ghost>
                {/* Invoice Management */}
                <Panel
                    header={
                        <Title level={4} style={{ margin: 0 }}>
                            <CreditCardOutlined style={{ color: '#1890ff' }} /> 1. Quản lý Hóa đơn (Invoices)
                        </Title>
                    }
                    key="1"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Card size="small" title="Chức năng chính">
                                <List
                                    size="small"
                                    dataSource={[
                                        'Tạo hóa đơn tự động cho dịch vụ định kỳ',
                                        'Quản lý trạng thái: Unpaid, Paid, Cancelled, Refunded',
                                        'Ghi nhận thanh toán qua VNPay/MoMo',
                                        'Áp dụng credit vào hóa đơn',
                                        'Gửi email nhắc nhở tự động',
                                        'Xem báo cáo doanh thu theo thời gian',
                                    ]}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                            {item}
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card size="small" title="Hướng dẫn sử dụng">
                                <Paragraph>
                                    <Text strong>Tạo hóa đơn thủ công:</Text>
                                </Paragraph>
                                <ol>
                                    <li>Vào menu "WHMCS {'>'} Hóa đơn"</li>
                                    <li>Click nút "Tạo hóa đơn mới"</li>
                                    <li>Chọn khách hàng và nhập các items</li>
                                    <li>Xác định ngày đến hạn và phương thức thanh toán</li>
                                    <li>Click "Lưu" để tạo hóa đơn</li>
                                </ol>
                                <Alert
                                    message="Lưu ý"
                                    description="Hệ thống tự động tạo hóa đơn định kỳ vào 02:00 AM mỗi ngày"
                                    type="warning"
                                    showIcon
                                    icon={<WarningOutlined />}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Panel>

                {/* Service Management */}
                <Panel
                    header={
                        <Title level={4} style={{ margin: 0 }}>
                            <CloudServerOutlined style={{ color: '#52c41a' }} /> 2. Quản lý Dịch vụ (Services)
                        </Title>
                    }
                    key="2"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Card size="small" title="Chức năng chính">
                                <List
                                    size="small"
                                    dataSource={[
                                        'Kích hoạt dịch vụ hosting tự động',
                                        'Tạm ngưng/Hủy dịch vụ khi quá hạn',
                                        'Thay đổi gói hosting (upgrade/downgrade)',
                                        'Đổi mật khẩu cPanel/Plesk',
                                        'Xem thông tin đăng nhập dịch vụ',
                                        'Tích hợp WHM/cPanel API',
                                    ]}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                            {item}
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card size="small" title="Vòng đời dịch vụ">
                                <Steps
                                    direction="vertical"
                                    size="small"
                                    current={-1}
                                    items={[
                                        { title: 'Pending', description: 'Chờ thanh toán' },
                                        { title: 'Active', description: 'Đang hoạt động' },
                                        { title: 'Suspended', description: 'Tạm ngưng do quá hạn' },
                                        { title: 'Terminated', description: 'Đã hủy bỏ' },
                                    ]}
                                />
                                <Divider />
                                <Alert
                                    message="Automation"
                                    description="Hệ thống tự động suspend dịch vụ sau 7 ngày quá hạn vào lúc 03:00 AM"
                                    type="info"
                                    showIcon
                                />
                            </Card>
                        </Col>
                    </Row>
                </Panel>

                {/* Server Management */}
                <Panel
                    header={
                        <Title level={4} style={{ margin: 0 }}>
                            <CloudServerOutlined style={{ color: '#722ed1' }} /> 3. Quản lý Máy chủ (Servers)
                        </Title>
                    }
                    key="3"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Card size="small" title="Cấu hình Server">
                                <Paragraph>
                                    <Text strong>Thông tin cần nhập:</Text>
                                </Paragraph>
                                <List
                                    size="small"
                                    dataSource={[
                                        'Tên server (vd: Server01-VN)',
                                        'Hostname/IP (vd: 103.56.158.199)',
                                        'Loại: WHM, cPanel, Plesk, DirectAdmin',
                                        'Username & Password hoặc API Token',
                                        'Port (mặc định: 2087 cho WHM)',
                                        'Secure connection (SSL)',
                                    ]}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <Text>{item}</Text>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card size="small" title="Test Connection">
                                <Paragraph>
                                    Sau khi thêm server, click nút <Tag color="blue">Test Connection</Tag> để kiểm tra
                                    kết nối.
                                </Paragraph>
                                <Alert
                                    message="Kết quả mong đợi"
                                    description={
                                        <div>
                                            <CheckCircleOutlined style={{ color: '#52c41a' }} /> API connection
                                            successful
                                            <br />
                                            <CheckCircleOutlined style={{ color: '#52c41a' }} /> Server reachable
                                            <br />
                                            <InfoCircleOutlined style={{ color: '#1890ff' }} /> Available slots: 95/100
                                        </div>
                                    }
                                    type="success"
                                />
                                <Divider />
                                <Paragraph>
                                    <Text strong>Server Groups:</Text> Nhóm các server theo vùng địa lý hoặc mục đích
                                    (VN, US, Reseller...)
                                </Paragraph>
                            </Card>
                        </Col>
                    </Row>
                </Panel>

                {/* Product Management */}
                <Panel
                    header={
                        <Title level={4} style={{ margin: 0 }}>
                            <ShoppingOutlined style={{ color: '#fa8c16' }} /> 4. Gói sản phẩm (Products)
                        </Title>
                    }
                    key="4"
                >
                    <Card size="small" title="Tạo gói hosting">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Paragraph>
                                    <Text strong>Thông tin cơ bản:</Text>
                                </Paragraph>
                                <ul>
                                    <li>Tên gói (vd: Hosting Basic)</li>
                                    <li>Nhóm sản phẩm (Shared Hosting, VPS, Cloud...)</li>
                                    <li>Mô tả ngắn & chi tiết</li>
                                    <li>Module provisioning (WHM/cPanel)</li>
                                    <li>Chọn server group</li>
                                </ul>
                            </Col>
                            <Col span={12}>
                                <Paragraph>
                                    <Text strong>Pricing (Định giá):</Text>
                                </Paragraph>
                                <List
                                    size="small"
                                    dataSource={[
                                        'Monthly: 100,000 VNĐ',
                                        'Quarterly (3 tháng): 270,000 VNĐ (giảm 10%)',
                                        'Semi-Annually (6 tháng): 510,000 VNĐ (giảm 15%)',
                                        'Annually (12 tháng): 960,000 VNĐ (giảm 20%)',
                                    ]}
                                    renderItem={(item) => <List.Item>{item}</List.Item>}
                                />
                            </Col>
                        </Row>
                        <Divider />
                        <Alert
                            message="Configurable Options"
                            description="Có thể thêm các addon: RAM tăng cường, SSL certificate, Email marketing..."
                            type="info"
                            showIcon
                        />
                    </Card>
                </Panel>

                {/* Ticket System */}
                <Panel
                    header={
                        <Title level={4} style={{ margin: 0 }}>
                            <QuestionCircleOutlined style={{ color: '#eb2f96' }} /> 5. Hệ thống Ticket Support
                        </Title>
                    }
                    key="5"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Card size="small" title="Quản lý Tickets (Admin)">
                                <List
                                    size="small"
                                    dataSource={[
                                        'Xem tất cả tickets từ khách hàng',
                                        'Phân công ticket cho staff',
                                        'Trả lời và theo dõi conversation',
                                        'Thay đổi priority: Low, Medium, High, Urgent',
                                        'Đóng/Mở lại ticket',
                                        'Thống kê: Response time, resolution rate',
                                    ]}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                            {item}
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card size="small" title="Trạng thái Ticket">
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <div>
                                        <Tag color="blue">Open</Tag> - Ticket mới, chờ xử lý
                                    </div>
                                    <div>
                                        <Tag color="orange">In Progress</Tag> - Đang xử lý
                                    </div>
                                    <div>
                                        <Tag color="purple">Waiting Reply</Tag> - Chờ khách hàng phản hồi
                                    </div>
                                    <div>
                                        <Tag color="green">Resolved</Tag> - Đã giải quyết
                                    </div>
                                    <div>
                                        <Tag color="default">Closed</Tag> - Đã đóng
                                    </div>
                                </Space>
                                <Divider />
                                <Alert
                                    message="Email Notification"
                                    description="Tự động gửi email cho khách hàng khi có reply mới"
                                    type="info"
                                />
                            </Card>
                        </Col>
                    </Row>
                </Panel>

                {/* API Keys */}
                <Panel
                    header={
                        <Title level={4} style={{ margin: 0 }}>
                            <ApiOutlined style={{ color: '#13c2c2' }} /> 6. API Key Management (Phase 3)
                        </Title>
                    }
                    key="6"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Card size="small" title="Tạo API Key">
                                <Paragraph>
                                    <Text strong>Bước tạo key:</Text>
                                </Paragraph>
                                <ol>
                                    <li>Vào "WHMCS {'>'} API Keys"</li>
                                    <li>Click "Tạo API Key"</li>
                                    <li>Nhập tên (vd: Mobile App API)</li>
                                    <li>Chọn permissions: invoices.read, services.write...</li>
                                    <li>
                                        (Tùy chọn) Thêm IP whitelist: <code>1.2.3.4, 5.6.7.8</code>
                                    </li>
                                    <li>
                                        (Tùy chọn) Đặt ngày hết hạn: <code>31/12/2025</code>
                                    </li>
                                    <li>Click "Tạo"</li>
                                </ol>
                                <Alert
                                    message="⚠️ LƯU Ý QUAN TRỌNG"
                                    description="Secret chỉ hiển thị MỘT LẦN duy nhất! Lưu trữ an toàn ngay."
                                    type="error"
                                    showIcon
                                />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card size="small" title="Sử dụng API">
                                <Paragraph>
                                    <Text strong>Xác thực request:</Text>
                                </Paragraph>
                                <pre
                                    style={{
                                        background: '#f5f5f5',
                                        padding: 12,
                                        borderRadius: 4,
                                        fontSize: 12,
                                    }}
                                >
                                    {`curl -X GET https://api.example.com/invoices \\
  -H "X-API-Key: whmcs_abc123..." \\
  -H "X-API-Secret: def456..."`}
                                </pre>
                                <Divider />
                                <Paragraph>
                                    <Text strong>Permissions có sẵn:</Text>
                                </Paragraph>
                                <Space wrap>
                                    <Tag color="blue">invoices.read</Tag>
                                    <Tag color="blue">invoices.write</Tag>
                                    <Tag color="green">services.read</Tag>
                                    <Tag color="green">services.write</Tag>
                                    <Tag color="purple">servers.read</Tag>
                                    <Tag color="orange">* (Full Access)</Tag>
                                </Space>
                            </Card>
                        </Col>
                    </Row>
                </Panel>

                {/* Payment Gateway */}
                <Panel
                    header={
                        <Title level={4} style={{ margin: 0 }}>
                            <CreditCardOutlined style={{ color: '#f5222d' }} /> 7. Payment Gateway
                        </Title>
                    }
                    key="7"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Card size="small" title="VNPay Integration">
                                <Paragraph>
                                    <Text strong>Cấu hình:</Text>
                                </Paragraph>
                                <List
                                    size="small"
                                    dataSource={[
                                        'TMN Code: Website ID từ VNPay',
                                        'Hash Secret: Mã bảo mật SHA-512',
                                        'Sandbox mode: Test trước khi go live',
                                        'Return URL: Trang sau khi thanh toán',
                                    ]}
                                    renderItem={(item) => <List.Item>{item}</List.Item>}
                                />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card size="small" title="MoMo E-Wallet">
                                <Paragraph>
                                    <Text strong>Cấu hình:</Text>
                                </Paragraph>
                                <List
                                    size="small"
                                    dataSource={[
                                        'Partner Code: Mã đối tác MoMo',
                                        'Access Key & Secret Key',
                                        'Signature: SHA-256 HMAC',
                                        'Webhook URL: Nhận thông báo thanh toán',
                                    ]}
                                    renderItem={(item) => <List.Item>{item}</List.Item>}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Panel>
            </Collapse>
        </div>
    );
};

// Admin Panel Guide Component
const AdminPanelGuide: React.FC = () => {
    return (
        <div>
            <Alert
                message="Admin Panel - Quản trị viên"
                description="Tất cả chức năng quản lý nội bộ dành cho Admin/Staff"
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Row gutter={16}>
                <Col span={24}>
                    <Card title="Dashboard Overview">
                        <Paragraph>Dashboard hiển thị các chỉ số quan trọng:</Paragraph>
                        <Row gutter={16}>
                            <Col span={6}>
                                <Card size="small" bordered>
                                    <LineChartOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                                    <Title level={4}>Doanh thu tháng</Title>
                                    <Text type="secondary">Tổng revenue từ invoices</Text>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card size="small" bordered>
                                    <CloudServerOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                                    <Title level={4}>Active Services</Title>
                                    <Text type="secondary">Số dịch vụ đang hoạt động</Text>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card size="small" bordered>
                                    <CreditCardOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
                                    <Title level={4}>Unpaid Invoices</Title>
                                    <Text type="secondary">Hóa đơn chưa thanh toán</Text>
                                </Card>
                            </Col>
                            <Col span={6}>
                                <Card size="small" bordered>
                                    <QuestionCircleOutlined style={{ fontSize: 24, color: '#eb2f96' }} />
                                    <Title level={4}>Open Tickets</Title>
                                    <Text type="secondary">Ticket chờ xử lý</Text>
                                </Card>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            <Divider />

            <Card title="Các Module Quản lý">
                <List
                    dataSource={[
                        {
                            title: 'Quản lý Hóa đơn',
                            description: 'Tạo, chỉnh sửa, xóa hóa đơn. Ghi nhận thanh toán. Xuất báo cáo doanh thu.',
                        },
                        {
                            title: 'Quản lý Dịch vụ',
                            description:
                                'Kích hoạt, suspend, terminate dịch vụ. Thay đổi gói. Reset password cPanel.',
                        },
                        {
                            title: 'Quản lý Máy chủ',
                            description: 'Thêm/sửa server. Test connection. Xem tình trạng tải server.',
                        },
                        {
                            title: 'Quản lý Sản phẩm',
                            description: 'Tạo gói hosting. Định giá theo chu kỳ. Cấu hình addon options.',
                        },
                        {
                            title: 'Support Tickets',
                            description: 'Trả lời tickets. Phân công cho staff. Theo dõi SLA.',
                        },
                        {
                            title: 'API Keys',
                            description: 'Tạo API credentials. Quản lý permissions. Xem usage logs.',
                        },
                    ]}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<CheckCircleOutlined style={{ fontSize: 20, color: '#52c41a' }} />}
                                title={<Text strong>{item.title}</Text>}
                                description={item.description}
                            />
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

// Client Portal Guide Component
const ClientPortalGuide: React.FC = () => {
    return (
        <div>
            <Alert
                message="Client Portal - Khách hàng"
                description="Cổng thông tin tự phục vụ dành cho khách hàng"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Card title="Tính năng cho Client">
                <Row gutter={16}>
                    <Col span={12}>
                        <Card size="small" title="Dashboard">
                            <List
                                size="small"
                                dataSource={[
                                    'Xem tổng quan tài khoản',
                                    'Danh sách dịch vụ đang sử dụng',
                                    'Hóa đơn gần đây',
                                    'Thông báo quan trọng',
                                ]}
                                renderItem={(item) => (
                                    <List.Item>
                                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                        {item}
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>

                    <Col span={12}>
                        <Card size="small" title="My Services">
                            <List
                                size="small"
                                dataSource={[
                                    'Xem chi tiết dịch vụ',
                                    'Login vào cPanel/Plesk',
                                    'Gia hạn dịch vụ',
                                    'Upgrade/Downgrade package',
                                ]}
                                renderItem={(item) => (
                                    <List.Item>
                                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                        {item}
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>

                    <Col span={12}>
                        <Card size="small" title="My Invoices">
                            <List
                                size="small"
                                dataSource={[
                                    'Xem lịch sử hóa đơn',
                                    'Thanh toán online (VNPay/MoMo)',
                                    'Tải xuống PDF',
                                    'Xem chi tiết items',
                                ]}
                                renderItem={(item) => (
                                    <List.Item>
                                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                        {item}
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>

                    <Col span={12}>
                        <Card size="small" title="Support">
                            <List
                                size="small"
                                dataSource={[
                                    'Tạo ticket mới',
                                    'Theo dõi ticket đang mở',
                                    'Trả lời conversation',
                                    'Xem Knowledge Base',
                                ]}
                                renderItem={(item) => (
                                    <List.Item>
                                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                        {item}
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                </Row>
            </Card>

            <Divider />

            <Card title="Hướng dẫn thanh toán">
                <Steps
                    direction="vertical"
                    current={-1}
                    items={[
                        {
                            title: 'Bước 1: Chọn hóa đơn cần thanh toán',
                            description: 'Vào "My Invoices", click vào hóa đơn có trạng thái "Unpaid"',
                        },
                        {
                            title: 'Bước 2: Chọn phương thức thanh toán',
                            description: 'VNPay (QR/ATM/Visa) hoặc MoMo E-Wallet',
                        },
                        {
                            title: 'Bước 3: Thanh toán',
                            description: 'Làm theo hướng dẫn trên cổng thanh toán',
                        },
                        {
                            title: 'Bước 4: Xác nhận',
                            description: 'Hệ thống tự động cập nhật trạng thái hóa đơn sau khi thanh toán thành công',
                        },
                    ]}
                />
            </Card>
        </div>
    );
};

// API Documentation Component
const ApiDocumentation: React.FC = () => {
    return (
        <div>
            <Alert
                message="RESTful API Documentation"
                description="Tài liệu API cho developers muốn tích hợp với hệ thống WHMCS"
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Card title="Authentication">
                <Paragraph>
                    <Text strong>API sử dụng Header-based authentication:</Text>
                </Paragraph>
                <pre
                    style={{
                        background: '#1e1e1e',
                        color: '#d4d4d4',
                        padding: 16,
                        borderRadius: 4,
                        fontSize: 12,
                    }}
                >
                    {`X-API-Key: whmcs_abc123456789...
X-API-Secret: def456789abc123...`}
                </pre>
            </Card>

            <Divider />

            <Collapse defaultActiveKey={['1']}>
                <Panel header="Invoices API" key="1">
                    <Card size="small" title="GET /api/whmcs/invoices">
                        <Paragraph>Lấy danh sách hóa đơn</Paragraph>
                        <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12 }}>
                            {`// Request
GET /api/whmcs/invoices?status=unpaid&page=1

// Response
{
  "success": true,
  "data": {
    "data": [...],
    "total": 150,
    "current_page": 1
  }
}`}
                        </pre>
                        <Paragraph>
                            <Text strong>Permissions:</Text> <Tag color="blue">invoices.read</Tag>
                        </Paragraph>
                    </Card>

                    <Divider />

                    <Card size="small" title="POST /api/whmcs/invoices">
                        <Paragraph>Tạo hóa đơn mới</Paragraph>
                        <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12 }}>
                            {`// Request
POST /api/whmcs/invoices
{
  "client_id": 123,
  "due_date": "2025-12-31",
  "items": [
    {
      "description": "Hosting Basic - Monthly",
      "amount": 100000,
      "quantity": 1
    }
  ]
}

// Response
{
  "success": true,
  "message": "Invoice created",
  "data": { ... }
}`}
                        </pre>
                        <Paragraph>
                            <Text strong>Permissions:</Text> <Tag color="blue">invoices.write</Tag>
                        </Paragraph>
                    </Card>
                </Panel>

                <Panel header="Services API" key="2">
                    <Card size="small" title="POST /api/whmcs/services/{id}/provision">
                        <Paragraph>Kích hoạt dịch vụ hosting</Paragraph>
                        <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12 }}>
                            {`// Request
POST /api/whmcs/services/456/provision
{
  "server_id": 1,
  "username": "client123",
  "password": "SecurePass@123"
}

// Response
{
  "success": true,
  "message": "Service provisioned",
  "data": {
    "cpanel_url": "https://server.example.com:2083",
    "username": "client123"
  }
}`}
                        </pre>
                        <Paragraph>
                            <Text strong>Permissions:</Text> <Tag color="green">services.write</Tag>
                        </Paragraph>
                    </Card>
                </Panel>

                <Panel header="Servers API" key="3">
                    <Card size="small" title="GET /api/whmcs/servers">
                        <Paragraph>Danh sách servers</Paragraph>
                        <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12 }}>
                            {`// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Server01-VN",
      "hostname": "103.56.158.199",
      "type": "whm",
      "active_accounts": 45,
      "max_accounts": 100
    }
  ]
}`}
                        </pre>
                        <Paragraph>
                            <Text strong>Permissions:</Text> <Tag color="purple">servers.read</Tag>
                        </Paragraph>
                    </Card>
                </Panel>
            </Collapse>

            <Divider />

            <Alert
                message="Rate Limiting"
                description="API giới hạn 60 requests/phút. Header X-RateLimit-Remaining sẽ hiển thị số request còn lại."
                type="warning"
                showIcon
            />
        </div>
    );
};

// FAQ Component
const FAQ: React.FC = () => {
    return (
        <div>
            <Alert
                message="Các câu hỏi thường gặp"
                description="Giải đáp nhanh những thắc mắc phổ biến"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Collapse accordion>
                <Panel header="❓ Làm sao để tạo hóa đơn tự động cho dịch vụ định kỳ?" key="1">
                    <Paragraph>
                        Hệ thống đã cấu hình sẵn <Text code>whmcs:generate-invoices</Text> command chạy tự động lúc
                        02:00 AM mỗi ngày qua Laravel Scheduler.
                    </Paragraph>
                    <Paragraph>
                        Command này sẽ quét tất cả dịch vụ Active và tạo hóa đơn cho chu kỳ tiếp theo (monthly,
                        quarterly, annually...)
                    </Paragraph>
                    <Alert message="Không cần cấu hình thêm, đã tự động!" type="success" />
                </Panel>

                <Panel header="❓ Dịch vụ bị suspend khi nào?" key="2">
                    <Paragraph>
                        Dịch vụ tự động suspend sau <Text strong>7 ngày</Text> kể từ khi hóa đơn quá hạn.
                    </Paragraph>
                    <Paragraph>
                        Command <Text code>whmcs:auto-suspend</Text> chạy lúc 03:00 AM sẽ:
                    </Paragraph>
                    <ul>
                        <li>Tìm tất cả hóa đơn Unpaid quá hạn {'>'}= 7 ngày</li>
                        <li>Suspend dịch vụ liên quan</li>
                        <li>Gửi email thông báo cho khách hàng</li>
                        <li>Log event vào hệ thống</li>
                    </ul>
                </Panel>

                <Panel header="❓ Khách hàng quên mật khẩu cPanel/Plesk?" key="3">
                    <Paragraph>Admin có thể reset password:</Paragraph>
                    <ol>
                        <li>
                            Vào "WHMCS {'>'} Dịch vụ Hosting"
                        </li>
                        <li>Tìm service của khách hàng</li>
                        <li>Click "Actions" {'>'} "Change Password"</li>
                        <li>Nhập mật khẩu mới (tối thiểu 8 ký tự, có chữ hoa, số, ký tự đặc biệt)</li>
                        <li>Click "Cập nhật" - hệ thống sẽ đồng bộ qua WHM API</li>
                    </ol>
                </Panel>

                <Panel header="❓ Cách thêm domain vào hệ thống?" key="4">
                    <Paragraph>Tính năng Domain Management cho phép:</Paragraph>
                    <ul>
                        <li>Check domain availability qua VNNIC API</li>
                        <li>Đăng ký domain mới</li>
                        <li>Gia hạn domain</li>
                        <li>Cập nhật nameservers</li>
                        <li>Quản lý DNS records</li>
                    </ul>
                    <Alert
                        message="Cần cấu hình VNNIC API credentials trong file .env"
                        type="warning"
                        showIcon
                    />
                </Panel>

                <Panel header="❓ Tích hợp thêm payment gateway mới?" key="5">
                    <Paragraph>Hiện tại hỗ trợ VNPay và MoMo. Để thêm gateway mới:</Paragraph>
                    <ol>
                        <li>
                            Tạo class implements <Text code>PaymentGatewayInterface</Text>
                        </li>
                        <li>
                            Implement các methods: <Text code>createPayment()</Text>,{' '}
                            <Text code>verifyCallback()</Text>
                        </li>
                        <li>Đăng ký trong config/constant.php</li>
                        <li>Thêm credentials vào .env</li>
                    </ol>
                    <Alert message="Liên hệ dev team để được hỗ trợ" type="info" />
                </Panel>

                <Panel header="❓ API key bị lộ, phải làm sao?" key="6">
                    <Paragraph>
                        <Text strong style={{ color: '#f5222d' }}>
                            Ngay lập tức:
                        </Text>
                    </Paragraph>
                    <ol>
                        <li>
                            Vào "WHMCS {'>'} API Keys"
                        </li>
                        <li>Tìm key bị lộ</li>
                        <li>
                            Click <Tag color="red">Revoke</Tag> để vô hiệu hóa
                        </li>
                        <li>
                            Hoặc click <Tag color="orange">Regenerate Secret</Tag> để tạo secret mới
                        </li>
                    </ol>
                    <Alert
                        message="Key bị revoke không thể khôi phục. Phải tạo key mới."
                        type="error"
                        showIcon
                    />
                </Panel>

                <Panel header="❓ Xem logs API requests?" key="7">
                    <Paragraph>Mỗi API key có riêng usage logs:</Paragraph>
                    <ol>
                        <li>
                            Vào "WHMCS {'>'} API Keys"
                        </li>
                        <li>
                            Click icon <Tag color="blue">Logs</Tag> của key cần xem
                        </li>
                        <li>Xem chi tiết: endpoint, method, response code, execution time, IP address</li>
                    </ol>
                    <Alert message="Logs lưu vĩnh viễn để audit và debug" type="info" />
                </Panel>

                <Panel header="❓ Backup dữ liệu WHMCS?" key="8">
                    <Paragraph>Nên backup định kỳ:</Paragraph>
                    <ul>
                        <li>
                            Database: <Text code>mysqldump whmcs {'>'} backup.sql</Text>
                        </li>
                        <li>File uploads (nếu có): /storage/app/whmcs/</li>
                        <li>Email templates: resources/views/emails/</li>
                        <li>Cấu hình: .env, config/whmcs.php</li>
                    </ul>
                    <Alert message="Khuyến nghị backup hàng ngày vào 4:00 AM" type="warning" />
                </Panel>
            </Collapse>
        </div>
    );
};

// Video Tutorials Component
const VideoTutorials: React.FC = () => {
    return (
        <div>
            <Alert
                message="Video Hướng dẫn"
                description="Các video tutorial chi tiết cho từng tính năng (Coming soon)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Row gutter={16}>
                <Col span={8}>
                    <Card
                        hoverable
                        cover={
                            <div
                                style={{
                                    height: 200,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <VideoCameraOutlined style={{ fontSize: 48, color: 'white' }} />
                            </div>
                        }
                    >
                        <Card.Meta
                            title="Giới thiệu tổng quan WHMCS"
                            description={
                                <div>
                                    <Tag color="blue">15:30</Tag>
                                    <Paragraph style={{ marginTop: 8 }}>
                                        Tổng quan về hệ thống, các module chính, workflow cơ bản
                                    </Paragraph>
                                    <Button type="primary" block disabled>
                                        Đang cập nhật
                                    </Button>
                                </div>
                            }
                        />
                    </Card>
                </Col>

                <Col span={8}>
                    <Card
                        hoverable
                        cover={
                            <div
                                style={{
                                    height: 200,
                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <CloudServerOutlined style={{ fontSize: 48, color: 'white' }} />
                            </div>
                        }
                    >
                        <Card.Meta
                            title="Cấu hình Server & Provisioning"
                            description={
                                <div>
                                    <Tag color="green">22:15</Tag>
                                    <Paragraph style={{ marginTop: 8 }}>
                                        Thêm server WHM/cPanel, test connection, auto provisioning
                                    </Paragraph>
                                    <Button type="primary" block disabled>
                                        Đang cập nhật
                                    </Button>
                                </div>
                            }
                        />
                    </Card>
                </Col>

                <Col span={8}>
                    <Card
                        hoverable
                        cover={
                            <div
                                style={{
                                    height: 200,
                                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <CreditCardOutlined style={{ fontSize: 48, color: 'white' }} />
                            </div>
                        }
                    >
                        <Card.Meta
                            title="Quản lý Hóa đơn & Thanh toán"
                            description={
                                <div>
                                    <Tag color="orange">18:45</Tag>
                                    <Paragraph style={{ marginTop: 8 }}>
                                        Tạo hóa đơn, tích hợp VNPay/MoMo, xử lý payment callback
                                    </Paragraph>
                                    <Button type="primary" block disabled>
                                        Đang cập nhật
                                    </Button>
                                </div>
                            }
                        />
                    </Card>
                </Col>

                <Col span={8}>
                    <Card
                        hoverable
                        cover={
                            <div
                                style={{
                                    height: 200,
                                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <ApiOutlined style={{ fontSize: 48, color: 'white' }} />
                            </div>
                        }
                    >
                        <Card.Meta
                            title="Sử dụng API & Integration"
                            description={
                                <div>
                                    <Tag color="purple">25:00</Tag>
                                    <Paragraph style={{ marginTop: 8 }}>
                                        Tạo API keys, authentication, request examples, best practices
                                    </Paragraph>
                                    <Button type="primary" block disabled>
                                        Đang cập nhật
                                    </Button>
                                </div>
                            }
                        />
                    </Card>
                </Col>

                <Col span={8}>
                    <Card
                        hoverable
                        cover={
                            <div
                                style={{
                                    height: 200,
                                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <QuestionCircleOutlined style={{ fontSize: 48, color: '#666' }} />
                            </div>
                        }
                    >
                        <Card.Meta
                            title="Xử lý Support Tickets"
                            description={
                                <div>
                                    <Tag color="cyan">12:30</Tag>
                                    <Paragraph style={{ marginTop: 8 }}>
                                        Quản lý tickets, phân công staff, SLA tracking
                                    </Paragraph>
                                    <Button type="primary" block disabled>
                                        Đang cập nhật
                                    </Button>
                                </div>
                            }
                        />
                    </Card>
                </Col>

                <Col span={8}>
                    <Card
                        hoverable
                        cover={
                            <div
                                style={{
                                    height: 200,
                                    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <LineChartOutlined style={{ fontSize: 48, color: '#666' }} />
                            </div>
                        }
                    >
                        <Card.Meta
                            title="Báo cáo & Analytics"
                            description={
                                <div>
                                    <Tag color="magenta">14:20</Tag>
                                    <Paragraph style={{ marginTop: 8 }}>
                                        Revenue reports, customer metrics, server utilization
                                    </Paragraph>
                                    <Button type="primary" block disabled>
                                        Đang cập nhật
                                    </Button>
                                </div>
                            }
                        />
                    </Card>
                </Col>
            </Row>

            <Divider />

            <Alert
                message="📹 Các video sẽ được cập nhật dần"
                description="Liên hệ team technical support để yêu cầu video hướng dẫn cụ thể cho module bạn quan tâm"
                type="warning"
                showIcon
            />
        </div>
    );
};

export default WhmcsUserGuide;
