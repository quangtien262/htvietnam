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
} from 'antd';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CalendarOutlined,
    LeftOutlined,
    TeamOutlined,
    UserOutlined,
    WarningOutlined,
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

const TeamDailyReport: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [reportDate, setReportDate] = useState<Dayjs>(dayjs());
    const [reportData, setReportData] = useState<TeamReportData | null>(null);

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
            render: (_, record) => getStatusTag(record),
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
        </div>
    );
};

export default TeamDailyReport;
