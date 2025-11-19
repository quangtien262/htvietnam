import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { API } from "../../common/api";
import {
    Card, Row, Col, Tabs, Button, Space, Tag, Table, Modal, Form,
    Input, Select, Upload, message, Timeline, Avatar, Divider,
    Typography, Alert, Badge, Popconfirm, Progress, Empty, Rate,
    Descriptions, List, Spin
} from "antd";
import {
    CustomerServiceOutlined, PlusOutlined, EyeOutlined, MessageOutlined,
    FileTextOutlined, BugOutlined, QuestionCircleOutlined, WarningOutlined,
    ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined,
    SendOutlined, PaperClipOutlined, UserOutlined, CalendarOutlined,
    ExclamationCircleOutlined, InfoCircleOutlined, EditOutlined,
    ReloadOutlined, FilterOutlined, SearchOutlined
} from '@ant-design/icons';

import icon from '../../components/comp_icon';
import API_USER from "../../common/api_user";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

// Interface definitions
interface SupportComment {
    id: string;
    author: string;
    author_type: 'customer' | 'admin';
    content: string;
    created_at: string;
    attachments?: string[];
}

// interface SupportTicket {
//     id: string;
//     title: string;
//     description: string;
//     category: 'maintenance' | 'complaint' | 'inquiry' | 'emergency' | 'other';
//     priority: 'low' | 'medium' | 'high' | 'urgent';
//     status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
//     created_at: string;
//     updated_at: string;
//     assigned_to?: string;
//     resolved_at?: string;
//     customer_rating?: number;
//     attachments?: string[];
//     comments: SupportComment[];
// }

const AitilenSupport: React.FC = () => {
    // State management
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('list');
    const [supportTickets, setSupportTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);

    // Modal states
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [commentModalVisible, setCommentModalVisible] = useState(false);

    const [selectedTicket, setSelectedTicket] = useState(null);

    // Filter states
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');


    const [category, setCategory] = useState([]);
    const [status, setStatus] = useState([]);
    const [priority, setPriority] = useState([]);
    const [contract, setContract] = useState([]);
    const [comments, setComments] = useState([]);

    // Forms
    const [createForm] = Form.useForm();
    const [commentForm] = Form.useForm();

    // Mock data - sẽ thay thế bằng API thực tế
    const mockSupportTickets: any = [
        {
            id: "TICKET-001",
            title: "Điều hòa phòng 101 không hoạt động",
            description: "Điều hòa trong phòng đã không hoạt động từ 2 ngày nay. Đã thử reset nhưng không có kết quả. Rất cần được hỗ trợ khẩn cấp vì thời tiết nóng.",
            category: 'maintenance',
            priority: 'high',
            status: 'in_progress',
            created_at: "2025-11-03T10:30:00",
            updated_at: "2025-11-05T14:20:00",
            assigned_to: "Nguyễn Văn B - Kỹ thuật",
            attachments: ["dieu_hoa_loi.jpg", "phong_101.jpg"],
            comments: [
                {
                    id: "COMMENT-001",
                    author: "Nguyễn Văn A",
                    author_type: 'customer',
                    content: "Cảm ơn team đã tiếp nhận. Khi nào có thể sửa chữa được ạ?",
                    created_at: "2025-11-04T09:00:00"
                },
                {
                    id: "COMMENT-002",
                    author: "Nguyễn Văn B - Kỹ thuật",
                    author_type: 'admin',
                    content: "Chúng tôi sẽ cử thợ lên kiểm tra vào chiều nay. Dự kiến hoàn thành trong hôm nay.",
                    created_at: "2025-11-04T10:15:00"
                }
            ]
        },
        {
            id: "TICKET-002",
            title: "Khiếu nại về tiếng ồn từ tầng trên",
            description: "Căn hộ tầng trên thường xuyên có tiếng ồn lớn vào ban đêm, ảnh hưởng đến việc nghỉ ngơi của gia đình. Tình trạng này đã kéo dài 1 tuần.",
            category: 'complaint',
            priority: 'medium',
            status: 'open',
            created_at: "2025-11-02T22:45:00",
            updated_at: "2025-11-02T22:45:00",
            comments: []
        },
        {
            id: "TICKET-003",
            title: "Thắc mắc về hóa đơn điện tháng 10",
            description: "Hóa đơn điện tháng 10 cao bất thường so với các tháng trước. Muốn được giải thích chi tiết về cách tính toán.",
            category: 'inquiry',
            priority: 'low',
            status: 'resolved',
            created_at: "2025-10-28T16:20:00",
            updated_at: "2025-10-30T11:00:00",
            resolved_at: "2025-10-30T11:00:00",
            customer_rating: 5,
            comments: [
                {
                    id: "COMMENT-003",
                    author: "Phòng Kế toán",
                    author_type: 'admin',
                    content: "Hóa đơn tháng 10 bao gồm phí điều chỉnh chỉ số đồng hồ điện theo quy định mới. Chúng tôi đã gửi email chi tiết đến quý khách.",
                    created_at: "2025-10-29T09:30:00"
                }
            ]
        }
    ];

    // Functions
    const fetchSupportTickets = async () => {
        setLoading(true);
        try {
            // Thay thế bằng API call thực tế
            const response = await axios.post(API_USER.supportIndex);
            setSupportTickets(response.data.data.tasks);
            setFilteredTickets(response.data.data.tasks);
            setCategory(response.data.data.category);
            setStatus(response.data.data.status);
            setPriority(response.data.data.priority);
            setContract(response.data.data.contract);
        } catch (error) {
            console.error('Error fetching support tickets:', error);
            message.error('Không thể tải danh sách yêu cầu hỗ trợ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupportTickets();
    }, []);

    // Filter tickets
    useEffect(() => {
        let filtered = supportTickets;

        if (filterStatus !== 'all') {
            filtered = filtered.filter(ticket => ticket.status === filterStatus);
        }

        if (filterCategory !== 'all') {
            filtered = filtered.filter(ticket => ticket.category === filterCategory);
        }

        if (searchKeyword) {
            filtered = filtered.filter(ticket =>
                ticket.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                ticket.description.toLowerCase().includes(searchKeyword.toLowerCase())
            );
        }

        setFilteredTickets(filtered);
    }, [supportTickets, filterStatus, filterCategory, searchKeyword]);

    const handleCreateTicket = async (values: any) => {
        setLoading(true);
        try {
            const newTicket = {
                id: `TICKET-${Date.now()}`,
                ...values,
                status: 'open',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                comments: []
            };

            // Thay thế bằng API call thực tế
            await axios.post(API_USER.createSupportTask, newTicket);
            setSupportTickets([newTicket, ...supportTickets]);
            setCreateModalVisible(false);
            createForm.resetFields();
            message.success('Tạo yêu cầu hỗ trợ thành công!');
        } catch (error) {
            console.error('Error creating support ticket:', error);
            message.error('Tạo yêu cầu hỗ trợ thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (values: any) => {
        if (!selectedTicket) return;

        setLoading(true);
        try {
            values.task_id = selectedTicket.id;
            //TODO: Thay thế bằng API call thực tế
            const res = await axios.post(API_USER.editTaskComment, values);
            console.log(res.data);
            setComments(res.data.data.comments);
            setCommentModalVisible(false);
            commentForm.resetFields();
            message.success('Thêm comment thành công!');
        } catch (error) {
            console.error('Error adding comment:', error);
            message.error('Thêm comment thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'blue';
            case 'in_progress': return 'orange';
            case 'pending': return 'yellow';
            case 'resolved': return 'green';
            case 'closed': return 'gray';
            default: return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'open': return 'Mới tạo';
            case 'in_progress': return 'Đang xử lý';
            case 'pending': return 'Chờ phản hồi';
            case 'resolved': return 'Đã giải quyết';
            case 'closed': return 'Đã đóng';
            default: return 'Không xác định';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low': return 'green';
            case 'medium': return 'blue';
            case 'high': return 'orange';
            case 'urgent': return 'red';
            default: return 'default';
        }
    };

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case 'low': return 'Thấp';
            case 'medium': return 'Trung bình';
            case 'high': return 'Cao';
            case 'urgent': return 'Khẩn cấp';
            default: return 'Không xác định';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'maintenance': return <BugOutlined />;
            case 'complaint': return <WarningOutlined />;
            case 'inquiry': return <QuestionCircleOutlined />;
            case 'emergency': return <ExclamationCircleOutlined />;
            default: return <FileTextOutlined />;
        }
    };

    const getCategoryText = (category: string) => {
        switch (category) {
            case 'maintenance': return 'Bảo trì/Sửa chữa';
            case 'complaint': return 'Khiếu nại';
            case 'inquiry': return 'Thắc mắc';
            case 'emergency': return 'Khẩn cấp';
            case 'other': return 'Khác';
            default: return 'Không xác định';
        }
    };

    const showTicketDetail = (ticket: any) => {
        console.log('tic', ticket);
        setDetailModalVisible(true);
        // call API to get comments
        axios.post(API_USER.getTaskInfo, { id: ticket.id }).then((response: any) => {
            console.log(response.data.data);
            setComments(response.data.data.comments);
            setSelectedTicket(response.data.data.task);
        }).catch((error: any) => {
            message.error('Không thể tải thông tin chi tiết yêu cầu hỗ trợ');
        });
    };

    const showCommentModal = (ticket: any) => {
        setSelectedTicket(ticket);
        setCommentModalVisible(true);
    };

    // Render ticket list
    const renderTicketList = () => {
        const columns = [
            {
                title: 'ID',
                dataIndex: 'code',
                key: 'code',
                width: 120,
                render: (text: string) => (
                    <Text style={{ fontSize: '12px', fontWeight: 'bold' }}>{text}</Text>
                )
            },
            {
                title: 'Tiêu đề',
                dataIndex: 'name',
                key: 'name',
                render: (text: string, record: any) => (
                    <div>
                        <Button
                            type="link"
                            onClick={() => showTicketDetail(record)}
                            style={{ padding: 0, fontSize: '14px', textAlign: 'left' }}
                        >
                            {text}
                        </Button>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.description.length > 50
                                ? record.description.substring(0, 50) + '...'
                                : record.description
                            }
                        </div>
                    </div>
                )
            },
            {
                title: 'Danh mục',
                dataIndex: 'category_name',
                key: 'category_name',
                width: 130,
                render: (category: string, record: any) => (
                    <Space>
                        <Text style={{ fontSize: '12px' }}>{category}</Text>
                    </Space>
                )
            },
            {
                title: 'Độ ưu tiên',
                dataIndex: 'priority',
                key: 'priority',
                width: 100,
                render: (priority: string) => (
                    <Tag color={getPriorityColor(priority)} style={{ fontSize: '11px' }}>
                        {getPriorityText(priority)}
                    </Tag>
                )
            },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                width: 120,
                render: (status: string) => (
                    <Tag color={getStatusColor(status)} style={{ fontSize: '11px' }}>
                        {getStatusText(status)}
                    </Tag>
                )
            },
            {
                title: 'Ngày tạo',
                dataIndex: 'created_at',
                key: 'created_at',
                width: 120,
                render: (date: string) => dayjs(date).format('DD/MM/YYYY')
            },
            {
                title: 'Thao tác',
                key: 'actions',
                width: 120,
                render: (record: any) => (
                    <Space size={4}>
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => showTicketDetail(record)}
                        />
                        <Button
                            size="small"
                            icon={<MessageOutlined />}
                            onClick={() => showCommentModal(record)}
                        />
                    </Space>
                )
            }
        ];

        // Mobile card view
        const renderMobileTicketCard = (ticket: SupportTicket) => (
            <Card
                key={ticket.id}
                size="small"
                style={{ marginBottom: 12 }}
                actions={[
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => showTicketDetail(ticket)}
                    >
                        Chi tiết
                    </Button>,
                    <Button
                        type="link"
                        icon={<MessageOutlined />}
                        onClick={() => showCommentModal(ticket)}
                    >
                        Comment
                    </Button>
                ]}
            >
                <Row gutter={[8, 4]}>
                    <Col span={24}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <Text strong style={{ fontSize: '14px' }}>{ticket.title}</Text>
                                <div style={{ fontSize: '11px', color: '#999' }}>{ticket.id}</div>
                            </div>
                            <Tag color={getStatusColor(ticket.status)} style={{ fontSize: '10px' }}>
                                {getStatusText(ticket.status)}
                            </Tag>
                        </div>
                    </Col>
                    <Col span={24}>
                        <Text style={{ fontSize: '12px', color: '#666' }}>
                            {ticket.description.length > 80
                                ? ticket.description.substring(0, 80) + '...'
                                : ticket.description
                            }
                        </Text>
                    </Col>
                    <Col span={12}>
                        <Space size={4}>
                            {getCategoryIcon(ticket.category)}
                            <Text style={{ fontSize: '11px' }}>{getCategoryText(ticket.category)}</Text>
                        </Space>
                    </Col>
                    <Col span={12}>
                        <Tag color={getPriorityColor(ticket.priority)} style={{ fontSize: '10px' }}>
                            {getPriorityText(ticket.priority)}
                        </Tag>
                    </Col>
                    <Col span={24}>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            Tạo: {dayjs(ticket.created_at).format('DD/MM/YYYY HH:mm')}
                        </Text>
                        {comments.length > 0 && (
                            <Text type="secondary" style={{ fontSize: '11px', marginLeft: 12 }}>
                                • {comments.length} comment
                            </Text>
                        )}
                    </Col>
                </Row>
            </Card>
        );

        return (
            <Card size="small">
                {/* Filters */}
                <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={6}>
                        <Input
                            placeholder="Tìm kiếm..."
                            prefix={<SearchOutlined />}
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={12} sm={4}>
                        <Select showSearch className='ht-select'
                            style={{ width: '100%' }}
                            placeholder="Chọn trạng thái"
                            optionFilterProp="children"
                            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                            options={status}
                            allowClear={true}
                            onChange={setFilterCategory}
                            value={filterStatus}
                        />
                    </Col>
                    <Col xs={12} sm={4}>
                        <Select showSearch className='ht-select'
                            style={{ width: '100%' }}
                            placeholder="Chọn danh mục"
                            optionFilterProp="children"
                            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                            options={category}
                            allowClear={true}
                            onChange={setFilterCategory}
                            value={filterCategory}
                        />
                    </Col>
                    <Col xs={24} sm={4}>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchSupportTickets}
                            loading={loading}
                        >
                            Làm mới
                        </Button>
                    </Col>
                </Row>

                {/* Desktop Table */}
                <div className="d-none d-md-block">
                    <Table
                        columns={columns}
                        dataSource={filteredTickets}
                        rowKey="id"
                        loading={loading}
                        size="small"
                        scroll={{ x: 'max-content' }}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: false,
                            showTotal: (total) => `Tổng ${total} yêu cầu`
                        }}
                    />
                </div>

                {/* Mobile Cards */}
                <div className="d-block d-md-none">
                    {filteredTickets.length > 0 ? (
                        filteredTickets.map(renderMobileTicketCard)
                    ) : (
                        <Empty description="Không có yêu cầu nào" />
                    )}
                </div>
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
                        .ant-modal {
                            margin: 0 !important;
                            max-width: 100vw !important;
                        }
                        .ant-modal-content {
                            border-radius: 8px 8px 0 0 !important;
                        }
                        .ant-table-tbody > tr > td {
                            padding: 6px 4px !important;
                        }
                        .ant-table-thead > tr > th {
                            padding: 6px 4px !important;
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
                        <CustomerServiceOutlined /> Hỗ trợ khách hàng
                    </Title>
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                        Quản lý yêu cầu hỗ trợ và theo dõi tiến độ xử lý
                    </Text>
                </div>

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    size="small"
                    tabBarExtraContent={
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="small"
                            onClick={() => setCreateModalVisible(true)}
                        >
                            Tạo yêu cầu
                        </Button>
                    }
                    items={[
                        {
                            key: 'list',
                            label: (
                                <Space size={4}>
                                    <FileTextOutlined />
                                    <span style={{ fontSize: '14px' }}>Danh sách yêu cầu</span>
                                    <Badge count={filteredTickets.length} showZero />
                                </Space>
                            ),
                            children: renderTicketList()
                        }
                    ]}
                />

                {/* Create Ticket Modal */}
                <Modal
                    title={
                        <Space size={4}>
                            <span style={{ fontSize: '18px', color: '#0966bb' }}><PlusOutlined /> Tạo yêu cầu hỗ trợ mới</span>
                        </Space>
                    }
                    open={createModalVisible}
                    onCancel={() => {
                        setCreateModalVisible(false);
                        createForm.resetFields();
                    }}
                    footer={null}
                    width="90%"
                    style={{ maxWidth: 800 }}
                >
                    <Form
                        form={createForm}
                        layout="vertical"
                        onFinish={handleCreateTicket}
                    >
                        <Row gutter={[16, 0]}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label={<b>Danh mục</b>}
                                    name="task_category_id"
                                    rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                                >
                                    <Select showSearch className='ht-select'
                                        style={{ width: '100%' }}
                                        placeholder="Search to Select"
                                        optionFilterProp="children"
                                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                        options={category}
                                        allowClear={true}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Form.Item
                                    label={<b>Hợp đồng</b>}
                                    name="contract_id"
                                    rules={[{ required: true, message: 'Vui lòng chọn hợp đồng!' }]}
                                >
                                    <Select showSearch className='ht-select'
                                        style={{ width: '100%' }}
                                        placeholder="Search to Select"
                                        optionFilterProp="children"
                                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                        options={contract}
                                        allowClear={true}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Form.Item
                                    label={<b>Tiêu đề</b>}
                                    name="name"
                                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                                >
                                    <Input placeholder="Nhập tiêu đề ngắn gọn mô tả vấn đề" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={<b>Mô tả chi tiết</b>}
                                    name="description"
                                >
                                    <TextArea
                                        rows={5}
                                        placeholder="Mô tả chi tiết vấn đề, thời gian xảy ra, địa điểm và các thông tin liên quan..."
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label={<div>
                                        <b>Tệp đính kèm (Video, hình ảnh liên quan)</b>
                                        <br />
                                        (<em>Tính năng này đang <b>tạm khóa</b>, vui lòng gửi vào nhóm zalo của phòng</em>)
                                    </div>}
                                    name="attachments"
                                >
                                    <Upload
                                        listType="picture"
                                        maxCount={5}
                                        beforeUpload={() => false}
                                        disabled={true}
                                    >
                                        <Button icon={<PaperClipOutlined />}>
                                            Chọn tệp (tùy chọn)
                                        </Button>
                                    </Upload>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Alert
                            message="Lưu ý"
                            description="Vui lòng mô tả chi tiết vấn đề để chúng tôi có thể hỗ trợ bạn nhanh nhất. Đối với các trường hợp khẩn cấp, vui lòng liên hệ hotline: 0886.196.886"
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />

                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setCreateModalVisible(false);
                                createForm.resetFields();
                            }}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                            >
                                Tạo yêu cầu
                            </Button>
                        </Space>
                    </Form>
                </Modal>

                {/* Ticket Detail Modal */}
                <Modal
                    title={
                        <Space size={4}>
                            <EyeOutlined />
                            <span style={{ fontSize: '16px' }}>Chi tiết yêu cầu {selectedTicket?.code}</span>
                        </Space>
                    }
                    open={detailModalVisible}
                    onCancel={() => setDetailModalVisible(false)}
                    footer={[
                        <Button key="close" onClick={() => setDetailModalVisible(false)}>
                            Đóng
                        </Button>,
                        selectedTicket?.status !== 'closed' && (
                            <Button
                                key="comment"
                                type="primary"
                                icon={<MessageOutlined />}
                                onClick={() => {
                                    setDetailModalVisible(false);
                                    showCommentModal(selectedTicket!);
                                }}
                            >
                                Thêm comment
                            </Button>
                        )
                    ].filter(Boolean)}
                    width="90%"
                    style={{ maxWidth: 900 }}
                >
                    {selectedTicket && (
                        <div>
                            {/* Ticket Info */}
                            <Card size="small" style={{ marginBottom: 16 }}>
                                <Descriptions
                                    column={{ xs: 1, sm: 2 }}
                                    size="small"
                                >
                                    <Descriptions.Item label="Tiêu đề">
                                        {selectedTicket.name}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Trạng thái">
                                        <Tag color={selectedTicket.status_background}>
                                            {selectedTicket.status_name}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Danh mục">
                                        <Tag color={selectedTicket.category_color}>
                                            {icon[selectedTicket.category_icon]} {selectedTicket.category_name}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Độ ưu tiên">
                                        <Tag color={selectedTicket.priority_color}>
                                            {selectedTicket.priority_name}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày tạo">
                                        {dayjs(selectedTicket.created_at).format('DD/MM/YYYY HH:mm')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Cập nhật lần cuối">
                                        {dayjs(selectedTicket.updated_at).format('DD/MM/YYYY HH:mm')}
                                    </Descriptions.Item>
                                    {selectedTicket.assigned_to && (
                                        <Descriptions.Item label="Người phụ trách">
                                            {selectedTicket.assigned_to}
                                        </Descriptions.Item>
                                    )}
                                    {selectedTicket.resolved_at && (
                                        <Descriptions.Item label="Thời gian hoàn thành">
                                            {selectedTicket.end ? dayjs(selectedTicket.end).format('DD/MM/YYYY HH:mm') : ''}
                                        </Descriptions.Item>
                                    )}
                                    <Descriptions.Item label="Mô tả chi tiết" span={2}>
                                        <Paragraph>{selectedTicket.description}</Paragraph>
                                    </Descriptions.Item>

                                </Descriptions>
                            </Card>

                            {/* Comments */}
                            <Card
                                title={`Lịch sử trao đổi (${comments.length})`}
                                size="small"
                            >
                                {comments && comments.length > 0 ? (
                                    <Timeline>
                                        {comments.map((comment) => (
                                            <Timeline.Item
                                                key={comment.id}
                                                dot={
                                                    <Avatar
                                                        size="small"
                                                        icon={<UserOutlined />}
                                                        style={{
                                                            backgroundColor: comment.author_type === 'admin' ? '#1890ff' : '#52c41a'
                                                        }}
                                                    />
                                                }
                                            >
                                                <div style={{ marginLeft: 8 }}>
                                                    <div style={{ marginBottom: 4 }}>
                                                        <Text strong style={{ fontSize: '14px' }}>{comment.author}</Text>
                                                        <Tag
                                                            color={comment.author_type === 'admin' ? 'blue' : 'green'}
                                                            style={{ marginLeft: 8, fontSize: '11px' }}
                                                        >
                                                            {comment.admin_user_id  ? comment.admin_users_name : ''}
                                                            {comment.user_id  ? comment.users_name : ''}
                                                        </Tag>
                                                        <Text
                                                            type="secondary"
                                                            style={{ fontSize: '12px', marginLeft: 8 }}
                                                        >
                                                            {dayjs(comment.created_at).format('DD/MM/YYYY HH:mm')}
                                                        </Text>
                                                    </div>
                                                    <textarea readOnly style={{
                                                        background: '#f5f5f5',
                                                        padding: 8,
                                                        borderRadius: 6,
                                                        fontSize: '13px',
                                                        width: '100%',
                                                        border: 'none',
                                                    }}>
                                                        {comment.content}
                                                    </textarea>
                                                </div>
                                            </Timeline.Item>
                                        ))}
                                    </Timeline>
                                ) : (
                                    <Empty description="Chưa có trao đổi nào" />
                                )}
                            </Card>
                        </div>
                    )}
                </Modal>

                {/* Add Comment Modal */}
                <Modal
                    title={
                        <Space size={4}>
                            <MessageOutlined />
                            <span style={{ fontSize: '16px' }}>Comment cho {selectedTicket?.code}</span>
                        </Space>
                    }
                    open={commentModalVisible}
                    onCancel={() => {
                        setCommentModalVisible(false);
                        commentForm.resetFields();
                    }}
                    footer={null}
                    width="90%"
                    style={{ maxWidth: 600 }}
                >
                    <Form
                        form={commentForm}
                        layout="vertical"
                        onFinish={handleAddComment}
                    >
                        <Form.Item
                            label="Nội dung comment"
                            name="content"
                            rules={[{ required: true, message: 'Vui lòng nhập nội dung comment!' }]}
                        >
                            <TextArea
                                rows={4}
                                placeholder="Nhập nội dung comment, phản hồi hoặc thông tin bổ sung..."
                            />
                        </Form.Item>

                        {/* <Form.Item
                            label="Tệp đính kèm"
                            name="attachments"
                        >
                            <Upload
                                listType="picture"
                                maxCount={3}
                                beforeUpload={() => false}
                            >
                                <Button icon={<PaperClipOutlined />}>
                                    Chọn tệp (tùy chọn)
                                </Button>
                            </Upload>
                        </Form.Item> */}

                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setCommentModalVisible(false);
                                commentForm.resetFields();
                            }}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                icon={<SendOutlined />}
                            >
                                Gửi comment
                            </Button>
                        </Space>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default AitilenSupport;
