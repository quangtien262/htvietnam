import React, { useEffect, useState } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Button,
    Space,
    Spin,
    Empty,
    DatePicker,
    Input,
    message,
    Tag,
    Progress,
    Divider,
    Timeline,
    Badge,
} from 'antd';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    MessageOutlined,
    PaperClipOutlined,
    CalendarOutlined,
    SaveOutlined,
    SendOutlined,
    BarChartOutlined,
    HistoryOutlined,
} from '@ant-design/icons';
import { reportApi } from '../../common/api/projectApi';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ROUTE from '../../common/route';

const { TextArea } = Input;

interface TaskWorkedOn {
    task_id: number;
    task_code: string;
    task_title: string;
    project_name: string;
    project_id: number;
    time_spent_seconds: number;
    time_spent_formatted: string;
    progress: number;
    status: string;
    status_color: string;
    priority: string;
    priority_color: string;
}

interface DailyReportData {
    date: string;
    date_formatted: string;
    user_id: number;
    total_hours: number;
    total_duration_formatted: string;
    tasks_completed: number;
    tasks_assigned: number;
    activities_count: number;
    time_by_project: Array<{
        project_name: string;
        project_id: number;
        hours: number;
    }>;
    tasks_worked_on: TaskWorkedOn[];
    activities: {
        total: number;
        comments: number;
        file_uploads: number;
        status_changes: number;
    };
    is_submitted: boolean;
    submitted_at: string | null;
    notes: string;
    blockers: string;
    plan_tomorrow: string;
    status: 'draft' | 'submitted' | 'approved';
}

const DailyReport: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Đọc date từ URL query parameter, nếu không có thì dùng ngày hiện tại
    const initialDate = searchParams.get('date') 
        ? dayjs(searchParams.get('date'), 'YYYY-MM-DD')
        : dayjs();
    
    const [reportDate, setReportDate] = useState<Dayjs>(initialDate);
    const [reportData, setReportData] = useState<DailyReportData | null>(null);

    // Form fields
    const [notes, setNotes] = useState('');
    const [blockers, setBlockers] = useState('');
    const [planTomorrow, setPlanTomorrow] = useState('');

    useEffect(() => {
        loadDailyReport();
    }, [reportDate]);

    const loadDailyReport = async () => {
        setLoading(true);
        try {
            const response = await reportApi.getMyDailyReport(reportDate.format('YYYY-MM-DD'));
            if (response.data.success) {
                const data = response.data.data;
                setReportData(data);
                setNotes(data.notes || '');
                setBlockers(data.blockers || '');
                setPlanTomorrow(data.plan_tomorrow || '');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể tải báo cáo');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (status: 'draft' | 'submitted') => {
        if (!reportData) return;

        setSubmitting(true);
        try {
            const data = {
                report_date: reportData.date,
                notes,
                blockers,
                plan_tomorrow: planTomorrow,
                status,
            };

            const response = await reportApi.submitDailyReport(data);
            if (response.data.success) {
                message.success(status === 'submitted' ? 'Đã gửi báo cáo thành công' : 'Đã lưu nháp');
                loadDailyReport();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể lưu báo cáo');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDateChange = (date: Dayjs | null) => {
        if (date) {
            setReportDate(date);
            // Cập nhật URL với date mới
            setSearchParams({ date: date.format('YYYY-MM-DD'), p: 'projects' });
        }
    };

    if (loading && !reportData) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!reportData) {
        return (
            <Card>
                <Empty description="Không có dữ liệu báo cáo" />
            </Card>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            {/* Header */}
            <Card
                style={{ marginBottom: 24 }}
                bodyStyle={{ padding: '16px 24px' }}
            >
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space size="large">
                            <div>
                                <CalendarOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 8 }} />
                                <span style={{ fontSize: 24, fontWeight: 600 }}>Báo cáo công việc</span>
                            </div>
                            <DatePicker
                                value={reportDate}
                                onChange={handleDateChange}
                                format="DD/MM/YYYY"
                                allowClear={false}
                                style={{ width: 180 }}
                            />
                            {reportData.is_submitted && (
                                <Badge
                                    status={reportData.status === 'approved' ? 'success' : 'processing'}
                                    text={reportData.status === 'approved' ? 'Đã duyệt' : 'Đã gửi'}
                                />
                            )}
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                icon={<HistoryOutlined />}
                                onClick={() => navigate(ROUTE.daily_report_history + '?p=projects')}
                            >
                                Lịch sử
                            </Button>
                            <Button
                                icon={<BarChartOutlined />}
                                onClick={() => navigate(ROUTE.daily_report_stats + '?p=projects')}
                            >
                                Thống kê
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Summary Statistics */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng thời gian"
                            value={reportData.total_hours}
                            precision={2}
                            suffix="giờ"
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                            {reportData.total_duration_formatted}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tasks hoàn thành"
                            value={reportData.tasks_completed}
                            suffix={`/ ${reportData.tasks_assigned}`}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                        <Progress
                            percent={reportData.tasks_assigned > 0 ? Math.round((reportData.tasks_completed / reportData.tasks_assigned) * 100) : 0}
                            showInfo={false}
                            strokeColor="#52c41a"
                            style={{ marginTop: 8 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Hoạt động"
                            value={reportData.activities_count}
                            prefix={<SyncOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                        <Space size="small" style={{ marginTop: 8, fontSize: 12 }}>
                            <span><MessageOutlined /> {reportData.activities.comments}</span>
                            <span><PaperClipOutlined /> {reportData.activities.file_uploads}</span>
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tasks đã làm"
                            value={reportData.tasks_worked_on.length}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Time by Project */}
            {reportData.time_by_project.length > 0 && (
                <Card title="⏱️ Thời gian theo dự án" style={{ marginBottom: 24 }}>
                    <Row gutter={[16, 16]}>
                        {reportData.time_by_project.map((project, index) => (
                            <Col xs={24} sm={12} md={8} key={index}>
                                <div
                                    style={{
                                        padding: 16,
                                        background: '#fafafa',
                                        borderRadius: 8,
                                        borderLeft: '4px solid #1890ff',
                                    }}
                                >
                                    <div style={{ fontWeight: 600, marginBottom: 8 }}>
                                        {project.project_name}
                                    </div>
                                    <div style={{ fontSize: 24, color: '#1890ff', fontWeight: 600 }}>
                                        {project.hours}h
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Card>
            )}

            {/* Tasks Worked On */}
            <Card title="📊 Công việc đã làm" style={{ marginBottom: 24 }}>
                {reportData.tasks_worked_on.length > 0 ? (
                    <Timeline>
                        {reportData.tasks_worked_on.map((task) => (
                            <Timeline.Item
                                key={task.task_id}
                                color={task.status_color}
                                dot={
                                    task.status === 'Hoàn thành' ? (
                                        <CheckCircleOutlined style={{ fontSize: 16 }} />
                                    ) : (
                                        <SyncOutlined spin style={{ fontSize: 16 }} />
                                    )
                                }
                            >
                                <Card
                                    size="small"
                                    style={{
                                        borderLeft: `4px solid ${task.status_color}`,
                                        marginBottom: 12,
                                    }}
                                >
                                    <Row justify="space-between" align="top">
                                        <Col flex="auto">
                                            <div style={{ fontWeight: 600, marginBottom: 8 }}>
                                                [{task.project_name}] {task.task_title}
                                            </div>
                                            <Space size="small" wrap>
                                                <Tag color={task.status_color}>{task.status}</Tag>
                                                <Tag color={task.priority_color}>{task.priority}</Tag>
                                                <Tag icon={<ClockCircleOutlined />}>
                                                    {task.time_spent_formatted}
                                                </Tag>
                                            </Space>
                                        </Col>
                                        <Col>
                                            <div style={{ textAlign: 'center' }}>
                                                <Progress
                                                    type="circle"
                                                    percent={task.progress}
                                                    width={60}
                                                    strokeColor={{
                                                        '0%': '#108ee9',
                                                        '100%': '#87d068',
                                                    }}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                ) : (
                    <Empty description="Chưa có công việc nào được thực hiện" />
                )}
            </Card>

            {/* Notes and Plans */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} md={12}>
                    <Card title="📝 Ghi chú" style={{ height: '100%' }}>
                        <TextArea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ghi chú về công việc hôm nay..."
                            rows={4}
                            disabled={reportData.is_submitted && reportData.status === 'approved'}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="🚧 Vấn đề / Blockers" style={{ height: '100%' }}>
                        <TextArea
                            value={blockers}
                            onChange={(e) => setBlockers(e.target.value)}
                            placeholder="Các vấn đề gặp phải, cần hỗ trợ..."
                            rows={4}
                            disabled={reportData.is_submitted && reportData.status === 'approved'}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="🎯 Kế hoạch ngày mai" style={{ marginBottom: 24 }}>
                <TextArea
                    value={planTomorrow}
                    onChange={(e) => setPlanTomorrow(e.target.value)}
                    placeholder="Những công việc dự kiến làm vào ngày mai..."
                    rows={4}
                    disabled={reportData.is_submitted && reportData.status === 'approved'}
                />
            </Card>

            {/* Action Buttons */}
            {reportData.status !== 'approved' && (
                <Card>
                    <Row justify="end">
                        <Space>
                            <Button
                                icon={<SaveOutlined />}
                                onClick={() => handleSubmit('draft')}
                                loading={submitting}
                            >
                                Lưu nháp
                            </Button>
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={() => handleSubmit('submitted')}
                                loading={submitting}
                            >
                                Gửi báo cáo
                            </Button>
                        </Space>
                    </Row>
                </Card>
            )}
        </div>
    );
};

export default DailyReport;
