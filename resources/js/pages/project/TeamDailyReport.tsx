import React, { useEffect, useState } from 'react';
import {
    Card,
    Row,
    Col,
    Table,
    DatePicker,
    Button,
    Space,
    Spin,
    Tag,
    Statistic,
    Empty,
    message,
    Avatar,
    Modal,
    Descriptions,
    Timeline,
    Progress,
} from 'antd';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CalendarOutlined,
    LeftOutlined,
    TeamOutlined,
    UserOutlined,
    WarningOutlined,
    EyeOutlined,
    ProjectOutlined,
    CheckSquareOutlined,
} from '@ant-design/icons';
import { reportApi } from '../../common/api/projectApi';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import ROUTE from '../../common/route';
import type { ColumnsType } from 'antd/es/table';

interface TeamMemberReport {
    user_id: number;
    user_name: string;
    total_hours: number;
    tasks_count: number;
    is_submitted: boolean;
    status: string;
}

interface TeamReportData {
    date: string;
    date_formatted: string;
    reports: TeamMemberReport[];
}

interface UserReportDetail {
    user: {
        id: number;
        name: string;
    };
    date: string;
    date_formatted: string;
    total_hours: number;
    total_duration_formatted: string;
    time_by_project: Array<{
        project_name: string;
        project_id: number;
        hours: number;
    }>;
    tasks: Array<{
        task_id: number;
        task_code: string;
        task_title: string;
        project_name: string;
        time_spent_formatted: string;
        progress: number;
        status: string;
        status_color: string;
        priority: string;
        priority_color: string;
    }>;
    tasks_count: number;
    report?: {
        notes: string | null;
        blockers: string | null;
        plan_tomorrow: string | null;
        status: string;
        submitted_at: string | null;
    } | null;
}

const TeamDailyReport: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [reportDate, setReportDate] = useState<Dayjs>(dayjs());
    const [reportData, setReportData] = useState<TeamReportData | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedUserReport, setSelectedUserReport] = useState<UserReportDetail | null>(null);

    useEffect(() => {
        loadTeamReports();
    }, [reportDate]);

    const loadTeamReports = async () => {
        setLoading(true);
        try {
            const response = await reportApi.getTeamDailyReports(reportDate.format('YYYY-MM-DD'));
            if (response.data.success) {
                setReportData(response.data.data);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể tải báo cáo team');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (date: Dayjs | null) => {
        if (date) {
            setReportDate(date);
        }
    };

    const handleViewDetail = async (record: TeamMemberReport) => {
        setDetailModalVisible(true);
        setDetailLoading(true);
        setSelectedUserReport(null);

        try {
            const response = await reportApi.getUserDailyReport(record.user_id, reportDate.format('YYYY-MM-DD'));
            if (response.data.success) {
                setSelectedUserReport(response.data.data);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể tải chi tiết báo cáo');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleApproveReport = async () => {
        if (!selectedUserReport) return;

        try {
            const response = await reportApi.approveDailyReport(
                selectedUserReport.user.id,
                selectedUserReport.date
            );

            if (response.data.success) {
                message.success('Đã phê duyệt báo cáo');
                // Reload detail
                await handleViewDetail({
                    user_id: selectedUserReport.user.id,
                    user_name: selectedUserReport.user.name,
                    total_hours: selectedUserReport.total_hours,
                    tasks_count: selectedUserReport.tasks_count,
                    is_submitted: true,
                    status: 'approved'
                });
                // Reload list
                loadTeamReports();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể phê duyệt báo cáo');
        }
    };

    const getStatusTag = (record: TeamMemberReport) => {
        if (!record.is_submitted) {
            return <Tag color="error" icon={<WarningOutlined />}>Chưa gửi</Tag>;
        }
        if (record.status === 'approved') {
            return <Tag color="success" icon={<CheckCircleOutlined />}>Đã duyệt</Tag>;
        }
        if (record.status === 'submitted') {
            return <Tag color="processing" icon={<ClockCircleOutlined />}>Đã gửi</Tag>;
        }
        return <Tag color="default">Nháp</Tag>;
    };

    const columns: ColumnsType<TeamMemberReport> = [
        {
            title: 'Nhân viên',
            dataIndex: 'user_name',
            key: 'user_name',
            width: 250,
            render: (text, record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                    <span style={{ fontWeight: 500 }}>{text}</span>
                </Space>
            ),
        },
        {
            title: 'Tổng giờ làm',
            dataIndex: 'total_hours',
            key: 'total_hours',
            width: 150,
            align: 'center',
            sorter: (a, b) => a.total_hours - b.total_hours,
            render: (hours) => (
                <div>
                    <ClockCircleOutlined style={{ color: '#1890ff', marginRight: 4 }} />
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}>
                        {hours.toFixed(1)}h
                    </span>
                </div>
            ),
        },
        {
            title: 'Số tasks',
            dataIndex: 'tasks_count',
            key: 'tasks_count',
            width: 120,
            align: 'center',
            sorter: (a, b) => a.tasks_count - b.tasks_count,
            render: (count) => (
                <div style={{ fontSize: 16, fontWeight: 600, color: '#52c41a' }}>{count}</div>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 150,
            align: 'center',
            filters: [
                { text: 'Chưa gửi', value: 'not_submitted' },
                { text: 'Đã gửi', value: 'submitted' },
                { text: 'Đã duyệt', value: 'approved' },
            ],
            onFilter: (value, record) => {
                if (value === 'not_submitted') return !record.is_submitted;
                return record.status === value;
            },
            render: (_, record) => (
                <div>
                    {getStatusTag(record)}
                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(record)}
                    >
                        Chi tiết
                    </Button>
                </div>
            ),
        },
    ];

    // Calculate summary statistics
    const totalMembers = reportData?.reports.length || 0;
    const totalHours = reportData?.reports.reduce((sum, r) => sum + r.total_hours, 0) || 0;
    const submittedCount = reportData?.reports.filter((r) => r.is_submitted).length || 0;
    const notSubmittedCount = totalMembers - submittedCount;

    if (loading && !reportData) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            {/* Header */}
            <Card style={{ marginBottom: 24 }} bodyStyle={{ padding: '16px 24px' }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space size="large">
                            <Button
                                icon={<LeftOutlined />}
                                onClick={() => navigate(ROUTE.daily_report + '?p=projects')}
                            >
                                Quay lại
                            </Button>
                            <div>
                                <TeamOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 8 }} />
                                <span style={{ fontSize: 24, fontWeight: 600 }}>Báo cáo Team</span>
                            </div>
                            <DatePicker
                                value={reportDate}
                                onChange={handleDateChange}
                                format="DD/MM/YYYY"
                                allowClear={false}
                                style={{ width: 180 }}
                            />
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Summary Statistics */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng thành viên"
                            value={totalMembers}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng giờ làm việc"
                            value={totalHours}
                            precision={1}
                            suffix="giờ"
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đã gửi báo cáo"
                            value={submittedCount}
                            suffix={`/ ${totalMembers}`}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Chưa gửi"
                            value={notSubmittedCount}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: notSubmittedCount > 0 ? '#ff4d4f' : '#8c8c8c' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Team Reports Table */}
            <Card title={`📋 Báo cáo ngày ${reportData?.date_formatted || ''}`}>
                {reportData?.reports && reportData.reports.length > 0 ? (
                    <Table
                        columns={columns}
                        dataSource={reportData.reports}
                        rowKey="user_id"
                        pagination={false}
                        loading={loading}
                        bordered
                        summary={() => (
                            <Table.Summary fixed>
                                <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                                    <Table.Summary.Cell index={0}>
                                        <strong>Tổng cộng</strong>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="center">
                                        <strong style={{ color: '#1890ff' }}>
                                            {totalHours.toFixed(1)}h
                                        </strong>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={2} align="center">
                                        <strong style={{ color: '#52c41a' }}>
                                            {reportData.reports.reduce((sum, r) => sum + r.tasks_count, 0)}
                                        </strong>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={3} align="center">
                                        <strong>{submittedCount}/{totalMembers} đã gửi</strong>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            </Table.Summary>
                        )}
                    />
                ) : (
                    <Empty description="Không có dữ liệu báo cáo cho ngày này" />
                )}
            </Card>

            {/* Detail Modal */}
            <Modal
                title={
                    <Space>
                        <UserOutlined />
                        <span>Chi tiết báo cáo - {selectedUserReport?.user.name}</span>
                    </Space>
                }
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    selectedUserReport?.report?.status === 'submitted' && (
                        <Button
                            key="approve"
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={handleApproveReport}
                        >
                            Phê duyệt
                        </Button>
                    ),
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>,
                ]}
                width={900}
            >
                {detailLoading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Spin />
                    </div>
                ) : selectedUserReport ? (
                    <div>
                        {/* Summary */}
                        <Card size="small" style={{ marginBottom: 16 }}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Statistic
                                        title="Ngày báo cáo"
                                        value={selectedUserReport.date_formatted}
                                        prefix={<CalendarOutlined />}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Tổng thời gian"
                                        value={selectedUserReport.total_duration_formatted}
                                        prefix={<ClockCircleOutlined />}
                                        valueStyle={{ color: '#1890ff' }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Số tasks"
                                        value={selectedUserReport.tasks_count}
                                        prefix={<CheckSquareOutlined />}
                                        valueStyle={{ color: '#52c41a' }}
                                    />
                                </Col>
                            </Row>
                        </Card>

                        {/* Time by Project */}
                        {selectedUserReport.time_by_project.length > 0 && (
                            <Card title={<><ProjectOutlined /> Thời gian theo dự án</>} size="small" style={{ marginBottom: 16 }}>
                                <Timeline
                                    items={selectedUserReport.time_by_project.map((proj) => ({
                                        children: (
                                            <div>
                                                <strong>{proj.project_name}</strong>
                                                <div style={{ color: '#1890ff', marginTop: 4 }}>
                                                    <ClockCircleOutlined /> {proj.hours.toFixed(1)} giờ
                                                </div>
                                            </div>
                                        ),
                                    }))}
                                />
                            </Card>
                        )}

                        {/* Daily Report Submission */}
                        {selectedUserReport.report && (
                            <Card
                                title="📝 Báo cáo ngày"
                                size="small"
                                style={{ marginBottom: 16 }}
                                extra={
                                    <Tag color={
                                        selectedUserReport.report.status === 'approved' ? 'success' :
                                        selectedUserReport.report.status === 'submitted' ? 'processing' : 'default'
                                    }>
                                        {selectedUserReport.report.status === 'approved' ? 'Đã duyệt' :
                                         selectedUserReport.report.status === 'submitted' ? 'Đã gửi' : 'Nháp'}
                                    </Tag>
                                }
                            >
                                <Descriptions column={1} size="small" bordered>
                                    {selectedUserReport.report.notes && (
                                        <Descriptions.Item label="Công việc đã làm">
                                            <div style={{ whiteSpace: 'pre-wrap' }}>{selectedUserReport.report.notes}</div>
                                        </Descriptions.Item>
                                    )}
                                    {selectedUserReport.report.blockers && (
                                        <Descriptions.Item label="Vấn đề gặp phải">
                                            <div style={{ whiteSpace: 'pre-wrap', color: '#ff4d4f' }}>
                                                {selectedUserReport.report.blockers}
                                            </div>
                                        </Descriptions.Item>
                                    )}
                                    {selectedUserReport.report.plan_tomorrow && (
                                        <Descriptions.Item label="Kế hoạch ngày mai">
                                            <div style={{ whiteSpace: 'pre-wrap', color: '#52c41a' }}>
                                                {selectedUserReport.report.plan_tomorrow}
                                            </div>
                                        </Descriptions.Item>
                                    )}
                                    {selectedUserReport.report.submitted_at && (
                                        <Descriptions.Item label="Thời gian gửi">
                                            {dayjs(selectedUserReport.report.submitted_at).format('DD/MM/YYYY HH:mm')}
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>
                            </Card>
                        )}

                        {/* Tasks */}
                        {selectedUserReport.tasks.length > 0 && (
                            <Card title={<><CheckSquareOutlined /> Chi tiết công việc</>} size="small">
                                {selectedUserReport.tasks.map((task) => (
                                    <Card
                                        key={task.task_id}
                                        size="small"
                                        style={{ marginBottom: 12 }}
                                        bodyStyle={{ padding: 12 }}
                                    >
                                        <Row gutter={16} align="middle">
                                            <Col flex="auto">
                                                <div style={{ marginBottom: 4 }}>
                                                    <Tag color="blue">{task.task_code}</Tag>
                                                    <span style={{ fontWeight: 500 }}>{task.task_title}</span>
                                                </div>
                                                <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                                    <ProjectOutlined /> {task.project_name}
                                                </div>
                                            </Col>
                                            <Col>
                                                <Space direction="vertical" size={4} style={{ textAlign: 'right' }}>
                                                    <div>
                                                        <Tag color={task.status_color}>{task.status}</Tag>
                                                        <Tag color={task.priority_color}>{task.priority}</Tag>
                                                    </div>
                                                    <div style={{ color: '#1890ff', fontWeight: 500 }}>
                                                        <ClockCircleOutlined /> {task.time_spent_formatted}
                                                    </div>
                                                </Space>
                                            </Col>
                                        </Row>
                                        <div style={{ marginTop: 8 }}>
                                            <Progress
                                                percent={task.progress}
                                                size="small"
                                                strokeColor={{ from: '#108ee9', to: '#87d068' }}
                                            />
                                        </div>
                                    </Card>
                                ))}
                            </Card>
                        )}

                        {selectedUserReport.tasks.length === 0 && (
                            <Empty description="Không có công việc nào được ghi nhận" />
                        )}
                    </div>
                ) : null}
            </Modal>
        </div>
    );
};

export default TeamDailyReport;
