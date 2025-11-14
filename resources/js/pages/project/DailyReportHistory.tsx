import React, { useEffect, useState } from 'react';
import {
    Card,
    Row,
    Col,
    Calendar,
    Badge,
    List,
    Statistic,
    Button,
    Space,
    Spin,
    Empty,
    DatePicker,
    Tag,
    Divider,
    message,
} from 'antd';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CalendarOutlined,
    LeftOutlined,
    FileTextOutlined,
    BarChartOutlined,
} from '@ant-design/icons';
import { reportApi } from '../../common/api/projectApi';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import ROUTE from '../../common/route';
import type { BadgeProps } from 'antd';

const { RangePicker } = DatePicker;

interface DailyHistoryItem {
    date: string;
    date_formatted: string;
    total_hours: number;
    total_duration_formatted: string;
    tasks_count: number;
    is_submitted: boolean;
    submitted_at: string | null;
    status: 'draft' | 'submitted' | 'approved';
}

const DailyReportHistory: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [historyData, setHistoryData] = useState<DailyHistoryItem[]>([]);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().subtract(30, 'day'),
        dayjs(),
    ]);

    useEffect(() => {
        loadHistory();
    }, [dateRange]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const response = await reportApi.getDailyHistory({
                start_date: dateRange[0].format('YYYY-MM-DD'),
                end_date: dateRange[1].format('YYYY-MM-DD'),
            });
            if (response.data.success) {
                setHistoryData(response.data.data);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể tải lịch sử báo cáo');
        } finally {
            setLoading(false);
        }
    };

    const getListData = (value: Dayjs) => {
        const dateStr = value.format('YYYY-MM-DD');
        const item = historyData.find((h) => h.date === dateStr);

        if (!item) return [];

        const listData: { type: BadgeProps['status']; content: string }[] = [];

        if (item.total_hours > 0) {
            listData.push({
                type: 'processing',
                content: `${item.total_hours.toFixed(1)}h`,
            });
        }

        if (item.is_submitted) {
            listData.push({
                type: item.status === 'approved' ? 'success' : 'warning',
                content: item.status === 'approved' ? 'Đã duyệt' : 'Đã gửi',
            });
        } else if (item.total_hours > 0) {
            listData.push({
                type: 'error',
                content: 'Chưa gửi',
            });
        }

        return listData;
    };

    const dateCellRender = (value: Dayjs) => {
        const listData = getListData(value);
        return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {listData.map((item, index) => (
                    <li key={index}>
                        <Badge status={item.type} text={item.content} />
                    </li>
                ))}
            </ul>
        );
    };

    const handleDateSelect = (date: Dayjs) => {
        setSelectedDate(date);
        navigate(ROUTE.daily_report + '?date=' + date.format('YYYY-MM-DD') + '&p=projects');
    };

    const handleRangeChange = (dates: any) => {
        if (dates && dates[0] && dates[1]) {
            setDateRange([dates[0], dates[1]]);
        }
    };

    const getStatusTag = (status: string, isSubmitted: boolean) => {
        if (!isSubmitted) return <Tag color="default">Chưa gửi</Tag>;
        if (status === 'approved') return <Tag color="success">Đã duyệt</Tag>;
        if (status === 'submitted') return <Tag color="processing">Đã gửi</Tag>;
        return <Tag color="default">Nháp</Tag>;
    };

    const totalHours = historyData.reduce((sum, item) => sum + item.total_hours, 0);
    const submittedCount = historyData.filter((item) => item.is_submitted).length;
    const approvedCount = historyData.filter((item) => item.status === 'approved').length;

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
                                <FileTextOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 8 }} />
                                <span style={{ fontSize: 24, fontWeight: 600 }}>Lịch sử báo cáo</span>
                            </div>
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <RangePicker
                                value={dateRange}
                                onChange={handleRangeChange}
                                format="DD/MM/YYYY"
                            />
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
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng số giờ"
                            value={totalHours}
                            precision={1}
                            suffix="giờ"
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Báo cáo đã gửi"
                            value={submittedCount}
                            suffix={`/ ${historyData.length}`}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Đã được duyệt"
                            value={approvedCount}
                            suffix={`/ ${submittedCount}`}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                {/* Calendar View */}
                <Col xs={24} lg={16}>
                    <Card title="📅 Lịch làm việc" loading={loading}>
                        <Calendar
                            cellRender={dateCellRender}
                            onSelect={handleDateSelect}
                            value={selectedDate}
                        />
                    </Card>
                </Col>

                {/* List View */}
                <Col xs={24} lg={8}>
                    <Card
                        title="📋 Danh sách báo cáo"
                        loading={loading}
                        bodyStyle={{ maxHeight: 800, overflowY: 'auto' }}
                    >
                        {historyData.length > 0 ? (
                            <List
                                dataSource={[...historyData].reverse()}
                                renderItem={(item) => (
                                    <List.Item
                                        style={{ cursor: 'pointer' }}
                                        onClick={() =>
                                            navigate(ROUTE.daily_report + '?date=' + item.date + '&p=projects')
                                        }
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <div
                                                    style={{
                                                        width: 48,
                                                        height: 48,
                                                        background: '#1890ff',
                                                        color: 'white',
                                                        borderRadius: 8,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 'bold', fontSize: 16 }}>
                                                        {dayjs(item.date).format('DD')}
                                                    </div>
                                                    <div>{dayjs(item.date).format('MMM')}</div>
                                                </div>
                                            }
                                            title={
                                                <Space>
                                                    <span>{item.date_formatted}</span>
                                                    {getStatusTag(item.status, item.is_submitted)}
                                                </Space>
                                            }
                                            description={
                                                <Space direction="vertical" size={4}>
                                                    <div>
                                                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                                                        {item.total_duration_formatted} ({item.total_hours.toFixed(1)}h)
                                                    </div>
                                                    <div>
                                                        <CheckCircleOutlined style={{ marginRight: 4 }} />
                                                        {item.tasks_count} công việc
                                                    </div>
                                                    {item.submitted_at && (
                                                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                                                            Gửi lúc: {dayjs(item.submitted_at).format('HH:mm DD/MM/YYYY')}
                                                        </div>
                                                    )}
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="Không có dữ liệu trong khoảng thời gian này" />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DailyReportHistory;
