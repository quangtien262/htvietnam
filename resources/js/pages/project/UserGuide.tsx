import React, { useState, useEffect } from 'react';
import { Card, Tabs, Typography, Steps, Divider, Tag, Space, Alert, Collapse, List, Table, Row, Col } from 'antd';
import {
    ProjectOutlined,
    FileTextOutlined,
    TeamOutlined,
    ClockCircleOutlined,
    BarChartOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined,
    BulbOutlined,
    SafetyOutlined,
    SettingOutlined,
    QuestionCircleOutlined,
    WarningOutlined,
    RocketOutlined,
    KeyOutlined,
    HistoryOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

/**
 * User Guide Component
 *
 * Interactive guide for Project Management module.
 * Provides step-by-step tutorials for all major features.
 * Optimized for mobile with vertical tabs and responsive layout.
 */
const UserGuide: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Detect screen size changes
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{
            padding: isMobile ? '12px' : '24px',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            <Card>
                <Title level={isMobile ? 3 : 2} style={{ marginBottom: isMobile ? '12px' : '24px' }}>
                    <BulbOutlined /> Hướng Dẫn - Quản Lý Dự Án
                </Title>
                <Paragraph style={{ fontSize: isMobile ? '13px' : '16px' }}>
                    Chào mừng bạn đến với hệ thống Quản Lý Dự Án! Tài liệu này sẽ hướng dẫn bạn cách sử dụng
                    tất cả các tính năng của module.
                </Paragraph>

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    tabPosition={isMobile ? 'top' : 'left'}
                    type="card"
                    style={{
                        minHeight: isMobile ? 'auto' : '600px',
                    }}
                    tabBarStyle={{
                        width: isMobile ? '100%' : '200px',
                    }}
                >
                    {/* Overview Tab */}
                    <Tabs.TabPane
                        tab={
                            <span style={{ fontSize: isMobile ? '11px' : '14px', display: 'block', padding: isMobile ? '4px 8px' : '8px 12px' }}>
                                <InfoCircleOutlined style={{ marginRight: isMobile ? 4 : 8 }} />
                                {isMobile ? 'Tổng Quan' : 'Tổng Quan'}
                            </span>
                        }
                        key="overview"
                    >
                        <div style={{ padding: isMobile ? '8px' : '16px' }}>
                            <Title level={isMobile ? 4 : 3}>Tổng Quan Hệ Thống</Title>
                            <Paragraph style={{ fontSize: isMobile ? '13px' : '14px' }}>
                                Module Quản Lý Dự Án cung cấp các tính năng toàn diện để quản lý dự án và nhiệm vụ:
                            </Paragraph>

                            <Space direction="vertical" size={isMobile ? 'middle' : 'large'} style={{ width: '100%' }}>
                                <Card type="inner" title="🎯 Các Tính Năng Chính">
                                    <List
                                        size="small"
                                        dataSource={[
                                            'Quản lý dự án: Tạo, chỉnh sửa, theo dõi tiến độ',
                                            'Quản lý nhiệm vụ: Kanban board, Table view, Gantt chart',
                                            'Time Tracking: Đếm thời gian tự động hoặc nhập thủ công',
                                            'Dashboard: Biểu đồ thống kê theo trạng thái, độ ưu tiên',
                                            'Quản lý team: Thêm/xóa thành viên, phân quyền',
                                            'File attachments: Upload, xem trước, tải xuống',
                                            'Comments: Thảo luận, reply comments',
                                            'Checklists: To-do list trong từng nhiệm vụ',
                                        ]}
                                        renderItem={(item) => (
                                            <List.Item style={{ padding: isMobile ? '4px 0' : '8px 0' }}>
                                                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                                <Text style={{ fontSize: isMobile ? '12px' : '14px' }}>{item}</Text>
                                            </List.Item>
                                        )}
                                    />
                                </Card>

                                <Card type="inner" title="📋 Cấu Trúc Module">
                                    <Paragraph style={{ fontSize: isMobile ? '12px' : '14px', marginBottom: 8 }}>
                                        <Text strong>1. Dashboard:</Text> Trang chủ hiển thị tổng quan tất cả dự án
                                    </Paragraph>
                                    <Paragraph style={{ fontSize: isMobile ? '12px' : '14px', marginBottom: 8 }}>
                                        <Text strong>2. Danh Sách Dự Án:</Text> Quản lý tất cả dự án (tạo, sửa, xóa)
                                    </Paragraph>
                                    <Paragraph style={{ fontSize: isMobile ? '12px' : '14px', marginBottom: 8 }}>
                                        <Text strong>3. Chi Tiết Dự Án:</Text> Xem chi tiết, quản lý nhiệm vụ, thành viên
                                    </Paragraph>
                                    <Paragraph style={{ fontSize: isMobile ? '12px' : '14px', marginBottom: 8 }}>
                                        <Text strong>4. Kanban Board:</Text> Quản lý nhiệm vụ theo dạng bảng
                                    </Paragraph>
                                    <Paragraph style={{ fontSize: isMobile ? '12px' : '14px', marginBottom: 0 }}>
                                        <Text strong>5. Gantt Chart:</Text> Timeline dự án
                                    </Paragraph>
                                </Card>

                                <Alert
                                    message="💡 Mẹo"
                                    description={
                                        <span style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                            Sử dụng các tab {isMobile ? 'ở trên' : 'bên trái'} để xem hướng dẫn chi tiết cho từng tính năng.
                                        </span>
                                    }
                                    type="info"
                                    showIcon
                                />
                            </Space>
                        </div>
                    </Tabs.TabPane>

                    {/* Project Management Tab */}
                    <Tabs.TabPane
                        tab={
                            <span style={{ fontSize: isMobile ? '11px' : '14px', display: 'block', padding: isMobile ? '4px 8px' : '8px 12px' }}>
                                <ProjectOutlined style={{ marginRight: isMobile ? 4 : 8 }} />
                                {isMobile ? 'Dự Án' : 'Quản Lý Dự Án'}
                            </span>
                        }
                        key="project"
                    >
                        <div style={{ padding: isMobile ? '8px' : '16px' }}>
                            <Title level={isMobile ? 4 : 3}>Quản Lý Dự Án</Title>

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px' }}>
                                1. Tạo Dự Án Mới
                            </Divider>
                            <Steps
                                direction="vertical"
                                current={-1}
                                items={[
                                    {
                                        title: 'Mở Form Tạo Dự Án',
                                        description: (
                                            <Paragraph style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                                Nhấn nút <Tag color="blue">+ Tạo Dự Án</Tag> ở góc trên bên phải.
                                            </Paragraph>
                                        ),
                                    },
                                    {
                                        title: 'Điền Thông Tin Cơ Bản',
                                        description: (
                                            <div>
                                                <Paragraph style={{ fontSize: isMobile ? '12px' : '14px' }}>Các trường bắt buộc:</Paragraph>
                                                <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                    <List.Item>• <Text strong>Tên dự án:</Text> Tên hiển thị</List.Item>
                                                    <List.Item>• <Text strong>Mã dự án:</Text> Mã định danh</List.Item>
                                                    <List.Item>• <Text strong>Khách hàng:</Text> Tên khách hàng/đối tác</List.Item>
                                                    <List.Item>• <Text strong>Ngày bắt đầu:</Text> Ngày khởi động</List.Item>
                                                    <List.Item>• <Text strong>Ngày kết thúc:</Text> Deadline</List.Item>
                                                </List>
                                            </div>
                                        ),
                                    },
                                    {
                                        title: 'Chọn Trạng Thái & Độ Ưu Tiên',
                                        description: (
                                            <Paragraph style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                                Chọn <Text strong>Trạng thái</Text>, <Text strong>Loại dự án</Text>, và <Text strong>Độ ưu tiên</Text>.
                                            </Paragraph>
                                        ),
                                    },
                                    {
                                        title: 'Thêm Quản Lý & Thành Viên',
                                        description: (
                                            <Paragraph style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                                Chọn <Text strong>Quản lý dự án</Text> và thêm thành viên vào team.
                                            </Paragraph>
                                        ),
                                    },
                                    {
                                        title: 'Lưu Dự Án',
                                        description: (
                                            <Paragraph style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                                Nhấn <Tag color="green">Lưu</Tag> để tạo dự án.
                                            </Paragraph>
                                        ),
                                    },
                                ]}
                            />

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px', marginTop: 24 }}>
                                2. Chỉnh Sửa & Xóa
                            </Divider>
                            <Paragraph style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                <Text strong>Sửa:</Text> Nhấn <Tag color="orange">Sửa</Tag> → Thay đổi → <Tag color="green">Cập nhật</Tag>
                            </Paragraph>
                            <Alert
                                message="⚠️ Cảnh báo"
                                description={
                                    <span style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        Xóa dự án sẽ xóa tất cả nhiệm vụ, comments, attachments liên quan!
                                    </span>
                                }
                                type="warning"
                                showIcon
                            />
                        </div>
                    </Tabs.TabPane>

                    {/* Task Management Tab */}
                    <Tabs.TabPane
                        tab={
                            <span style={{ fontSize: isMobile ? '11px' : '14px', display: 'block', padding: isMobile ? '4px 8px' : '8px 12px' }}>
                                <FileTextOutlined style={{ marginRight: isMobile ? 4 : 8 }} />
                                {isMobile ? 'Task' : 'Nhiệm Vụ'}
                            </span>
                        }
                        key="task"
                    >
                        <div style={{ padding: isMobile ? '8px' : '16px' }}>
                            <Title level={isMobile ? 4 : 3}>Quản Lý Nhiệm Vụ</Title>

                            <Collapse defaultActiveKey={['kanban']} accordion={isMobile}>
                                <Panel header="📊 Kanban Board" key="kanban">
                                    <List size="small" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                        <List.Item>• Kéo thả card để đổi trạng thái</List.Item>
                                        <List.Item>• Click card để xem chi tiết</List.Item>
                                        <List.Item>• Màu sắc theo độ ưu tiên</List.Item>
                                    </List>
                                </Panel>

                                <Panel header="📋 Table View" key="table">
                                    <List size="small" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                        <List.Item>• Hiển thị dạng bảng</List.Item>
                                        <List.Item>• Tìm kiếm & lọc nhanh</List.Item>
                                        <List.Item>• Sắp xếp theo nhiều tiêu chí</List.Item>
                                    </List>
                                </Panel>

                                <Panel header="📅 Gantt Chart" key="gantt">
                                    <List size="small" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                        <List.Item>• Timeline dự án</List.Item>
                                        <List.Item>• Xem dependencies</List.Item>
                                        <List.Item>• Hiển thị % tiến độ</List.Item>
                                    </List>
                                </Panel>

                                <Panel header="✏️ Chi Tiết Task" key="detail">
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                        <Card type="inner" size="small" title="Tab: Thông Tin">
                                            <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                Sửa tiêu đề, mô tả, trạng thái, người thực hiện, tiến độ
                                            </Text>
                                        </Card>

                                        <Card type="inner" size="small" title="Tab: Checklist">
                                            <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                Tạo to-do list, check/uncheck items
                                            </Text>
                                        </Card>

                                        <Card type="inner" size="small" title="Tab: Comments">
                                            <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                Thảo luận, reply comments
                                            </Text>
                                        </Card>

                                        <Card type="inner" size="small" title="Tab: Files">
                                            <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                Upload, download, xem trước files
                                            </Text>
                                        </Card>

                                        <Card type="inner" size="small" title="Tab: Time Tracking">
                                            <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                Theo dõi thời gian làm việc
                                            </Text>
                                        </Card>
                                    </Space>
                                </Panel>
                            </Collapse>
                        </div>
                    </Tabs.TabPane>

                    {/* Time Tracking Tab */}
                    <Tabs.TabPane
                        tab={
                            <span style={{ fontSize: isMobile ? '11px' : '14px', display: 'block', padding: isMobile ? '4px 8px' : '8px 12px' }}>
                                <ClockCircleOutlined style={{ marginRight: isMobile ? 4 : 8 }} />
                                {isMobile ? 'Timer' : 'Time Tracking'}
                            </span>
                        }
                        key="time"
                    >
                        <div style={{ padding: isMobile ? '8px' : '16px' }}>
                            <Title level={isMobile ? 4 : 3}>Time Tracking</Title>

                            <Alert
                                message="📌 Lưu ý"
                                description={
                                    <span style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        Mỗi user chỉ có thể chạy 1 timer tại một thời điểm.
                                    </span>
                                }
                                type="info"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px' }}>
                                Cách 1: Timer Tự Động
                            </Divider>
                            <Steps
                                direction="vertical"
                                current={-1}
                                items={[
                                    {
                                        title: 'Mở Task Detail',
                                        description: <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>Chọn tab "Time Tracking"</Text>,
                                    },
                                    {
                                        title: 'Bắt Đầu Timer',
                                        description: <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>Nhấn <Tag color="green">▶ Bắt đầu</Tag></Text>,
                                    },
                                    {
                                        title: 'Làm Việc',
                                        description: <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>Timer chạy ngầm, có thể đóng drawer</Text>,
                                    },
                                    {
                                        title: 'Dừng Timer',
                                        description: <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>Nhấn <Tag color="red">⏹ Dừng</Tag> khi xong</Text>,
                                    },
                                ]}
                            />

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px', marginTop: 24 }}>
                                Cách 2: Nhập Thủ Công
                            </Divider>
                            <Paragraph style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                Nhấn <Tag color="blue">+ Thêm Log</Tag> → Chọn thời gian bắt đầu/kết thúc → Lưu
                            </Paragraph>

                            <Alert
                                message="💡 Mẹo"
                                description={
                                    <span style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        Timer đang chạy sẽ hiển thị icon ⏱️ màu xanh bên cạnh task.
                                    </span>
                                }
                                type="success"
                                showIcon
                            />
                        </div>
                    </Tabs.TabPane>

                    {/* Dashboard Tab */}
                    <Tabs.TabPane
                        tab={
                            <span style={{ fontSize: isMobile ? '11px' : '14px', display: 'block', padding: isMobile ? '4px 8px' : '8px 12px' }}>
                                <BarChartOutlined style={{ marginRight: isMobile ? 4 : 8 }} />
                                {isMobile ? 'Báo Cáo' : 'Dashboard'}
                            </span>
                        }
                        key="dashboard"
                    >
                        <div style={{ padding: isMobile ? '8px' : '16px' }}>
                            <Title level={isMobile ? 4 : 3}>Dashboard & Báo Cáo</Title>

                            <Space direction="vertical" size={isMobile ? 'middle' : 'large'} style={{ width: '100%' }}>
                                <Card type="inner" title="📊 Overview Cards">
                                    <List size="small" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                        <List.Item>• Tổng nhiệm vụ & tỷ lệ hoàn thành</List.Item>
                                        <List.Item>• Task hoàn thành / đang làm / chưa bắt đầu</List.Item>
                                        <List.Item>• Thời gian đã log & số thành viên</List.Item>
                                    </List>
                                </Card>

                                <Card type="inner" title="📈 Biểu Đồ">
                                    <List size="small" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                        <List.Item>• <Text strong>Pie Chart:</Text> Tasks theo trạng thái</List.Item>
                                        <List.Item>• <Text strong>Bar Chart:</Text> Tasks theo độ ưu tiên</List.Item>
                                        <List.Item>• <Text strong>Bar Chart:</Text> Thời gian theo thành viên</List.Item>
                                    </List>
                                </Card>

                                <Alert
                                    message="💡 Mẹo"
                                    description={
                                        <span style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                            Sử dụng Date Range Picker để lọc dữ liệu theo thời gian.
                                        </span>
                                    }
                                    type="info"
                                    showIcon
                                />
                            </Space>
                        </div>
                    </Tabs.TabPane>

                    {/* Meeting Management Tab - NEW */}
                    <Tabs.TabPane
                        tab={
                            <span style={{ fontSize: isMobile ? '11px' : '14px', display: 'block', padding: isMobile ? '4px 8px' : '8px 12px' }}>
                                <TeamOutlined style={{ marginRight: isMobile ? 4 : 8 }} />
                                {isMobile ? 'Meeting' : 'Quản Lý Meeting'}
                            </span>
                        }
                        key="meeting"
                    >
                        <div style={{ padding: isMobile ? '8px' : '16px' }}>
                            <Title level={isMobile ? 4 : 3}>Quản Lý Meeting</Title>

                            <Alert
                                message="📌 Giới thiệu"
                                description="Tính năng Meeting giúp bạn tổ chức cuộc họp, ghi chú nội dung, liên kết tasks/projects và theo dõi kết quả."
                                type="info"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px' }}>
                                1. Tạo Meeting Mới
                            </Divider>
                            <Steps
                                direction="vertical"
                                current={-1}
                                items={[
                                    {
                                        title: 'Mở Form',
                                        description: <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>Nhấn <Tag color="blue">+ Tạo Meeting</Tag></Text>,
                                    },
                                    {
                                        title: 'Điền Thông Tin',
                                        description: (
                                            <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                <List.Item>• <Text strong>Tiêu đề:</Text> Tên cuộc họp</List.Item>
                                                <List.Item>• <Text strong>Thời gian:</Text> Ngày giờ diễn ra</List.Item>
                                                <List.Item>• <Text strong>Địa điểm:</Text> Phòng họp hoặc link online</List.Item>
                                                <List.Item>• <Text strong>Người tham gia:</Text> Chọn thành viên</List.Item>
                                                <List.Item>• <Text strong>Nội dung:</Text> Rich text editor (SunEditor)</List.Item>
                                            </List>
                                        ),
                                    },
                                    {
                                        title: 'Chọn Trạng Thái & Loại',
                                        description: <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>Chọn trạng thái (Scheduled/Completed) và loại meeting</Text>,
                                    },
                                ]}
                            />

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px', marginTop: 24 }}>
                                2. Thêm Tasks & Projects
                            </Divider>
                            <Card type="inner" size="small" style={{ marginBottom: 16 }}>
                                <Space direction="vertical" style={{ width: '100%' }} size="small">
                                    <Paragraph style={{ fontSize: isMobile ? '12px' : '14px', marginBottom: 0 }}>
                                        <Text strong>Trong Meeting Detail:</Text>
                                    </Paragraph>
                                    <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <List.Item>
                                            • Click nút <Tag color="green">+</Tag> ở header "Tasks trong meeting" → Chọn nhiều tasks → Thêm
                                        </List.Item>
                                        <List.Item>
                                            • Click nút <Tag color="green">+</Tag> ở header "Projects trong meeting" → Chọn nhiều projects → Thêm
                                        </List.Item>
                                        <List.Item>
                                            • Nếu chưa có tasks/projects, click button "Thêm Task"/"Thêm Project" trong Empty state
                                        </List.Item>
                                        <List.Item>
                                            • Xóa items: Click nút <Tag color="red">Xóa</Tag> bên cạnh task/project
                                        </List.Item>
                                    </List>
                                </Space>
                            </Card>

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px' }}>
                                3. Sửa Nhanh (Quick Edit)
                            </Divider>
                            <Card type="inner" size="small" style={{ marginBottom: 16 }}>
                                <Paragraph style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                    <Text strong>Trong Meeting Detail Drawer:</Text>
                                </Paragraph>
                                <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                    <List.Item>
                                        • Click vào <Text strong>Tiêu đề/Địa điểm/Thời gian</Text> → Popconfirm hiện ra → Sửa → Lưu
                                    </List.Item>
                                    <List.Item>
                                        • Click vào <Text strong>Trạng thái/Loại meeting</Text> → Select trong Popconfirm → Lưu
                                    </List.Item>
                                    <List.Item>
                                        • Click vào <Text strong>Nội dung</Text> → Modal SunEditor mở ra → Soạn thảo rich text → Lưu
                                    </List.Item>
                                    <List.Item>
                                        • <Text strong>Trạng thái project:</Text> Click tag trạng thái → Chọn trạng thái mới
                                    </List.Item>
                                </List>
                            </Card>

                            <Alert
                                message="💡 Mẹo"
                                description={
                                    <span style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        • Dùng SunEditor để format nội dung đẹp (bold, list, table, màu sắc...)<br/>
                                        • Liên kết tasks để theo dõi các nhiệm vụ được bàn trong meeting<br/>
                                        • Xem chi tiết task/project bằng cách click nút "Chi tiết"
                                    </span>
                                }
                                type="success"
                                showIcon
                            />
                        </div>
                    </Tabs.TabPane>

                    {/* Daily Report Tab - NEW */}
                    <Tabs.TabPane
                        tab={
                            <span style={{ fontSize: isMobile ? '11px' : '14px', display: 'block', padding: isMobile ? '4px 8px' : '8px 12px' }}>
                                <FileTextOutlined style={{ marginRight: isMobile ? 4 : 8 }} />
                                {isMobile ? 'Báo Cáo' : 'Báo Cáo Công Việc'}
                            </span>
                        }
                        key="daily-report"
                    >
                        <div style={{ padding: isMobile ? '8px' : '16px' }}>
                            <Title level={isMobile ? 4 : 3}>Báo Cáo Công Việc Hàng Ngày</Title>

                            <Alert
                                message="📋 Mục đích"
                                description="Daily Report tự động tổng hợp hoạt động của bạn trong ngày: tasks đã làm, thời gian, tiến độ. Giúp quản lý theo dõi công việc và đánh giá hiệu suất."
                                type="info"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px' }}>
                                1. Thông Tin Tự Động Thu Thập
                            </Divider>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <Card size="small" type="inner" title="📊 Thống Kê">
                                        <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                            <List.Item>• <Text strong>Tổng thời gian:</Text> Giờ đã log trong ngày</List.Item>
                                            <List.Item>• <Text strong>Tasks hoàn thành:</Text> Số task chuyển sang Done</List.Item>
                                            <List.Item>• <Text strong>Hoạt động:</Text> Comments, file uploads</List.Item>
                                            <List.Item>• <Text strong>Tasks đã làm:</Text> Danh sách task có time log</List.Item>
                                        </List>
                                    </Card>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Card size="small" type="inner" title="⏱️ Thời Gian Theo Dự Án">
                                        <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                            Hệ thống tự động nhóm thời gian theo từng dự án,
                                            hiển thị biểu đồ phân bổ thời gian.
                                        </Paragraph>
                                    </Card>
                                </Col>
                            </Row>

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px', marginTop: 24 }}>
                                2. Ghi Chú & Kế Hoạch
                            </Divider>
                            <Steps
                                direction="vertical"
                                current={-1}
                                items={[
                                    {
                                        title: 'Ghi Chú Công Việc',
                                        description: <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>Ghi lại những việc đã làm trong ngày, kết quả đạt được</Text>,
                                    },
                                    {
                                        title: 'Vấn Đề / Blockers',
                                        description: <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>Liệt kê khó khăn gặp phải, cần hỗ trợ gì</Text>,
                                    },
                                    {
                                        title: 'Kế Hoạch Ngày Mai',
                                        description: <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>Dự kiến công việc sẽ làm vào ngày hôm sau</Text>,
                                    },
                                    {
                                        title: 'Lưu hoặc Gửi',
                                        description: (
                                            <div>
                                                <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                    • <Tag color="blue">Lưu nháp</Tag>: Lưu để sửa sau<br/>
                                                    • <Tag color="green">Gửi báo cáo</Tag>: Submit chính thức cho quản lý
                                                </Text>
                                            </div>
                                        ),
                                    },
                                ]}
                            />

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px', marginTop: 24 }}>
                                3. Xem Lịch Sử & Thống Kê
                            </Divider>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <Card size="small" type="inner" title="📅 Lịch Sử Báo Cáo">
                                        <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                            Click <Tag icon={<HistoryOutlined />}>Lịch sử</Tag> để xem các báo cáo đã gửi.
                                            Có thể filter theo tháng, xem chi tiết từng ngày.
                                        </Paragraph>
                                    </Card>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Card size="small" type="inner" title="📈 Thống Kê">
                                        <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                            Click <Tag icon={<BarChartOutlined />}>Thống kê</Tag> để xem:
                                            Biểu đồ thời gian, tỷ lệ hoàn thành, xu hướng làm việc.
                                        </Paragraph>
                                    </Card>
                                </Col>
                            </Row>

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px', marginTop: 24 }}>
                                4. Trạng Thái Báo Cáo
                            </Divider>
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                <Card size="small" type="inner">
                                    <Tag color="gray">Draft</Tag>
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px', marginTop: 8, marginBottom: 0 }}>
                                        Nháp - Chưa gửi, có thể sửa bất cứ lúc nào
                                    </Paragraph>
                                </Card>
                                <Card size="small" type="inner">
                                    <Tag color="blue">Submitted</Tag>
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px', marginTop: 8, marginBottom: 0 }}>
                                        Đã gửi - Quản lý đã nhận, vẫn có thể sửa nếu chưa approved
                                    </Paragraph>
                                </Card>
                                <Card size="small" type="inner">
                                    <Tag color="green">Approved</Tag>
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px', marginTop: 8, marginBottom: 0 }}>
                                        Đã duyệt - Không thể sửa, đã được quản lý xác nhận
                                    </Paragraph>
                                </Card>
                            </Space>

                            <Alert
                                message="⏰ Best Practice"
                                description={
                                    <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <List.Item>✅ Gửi báo cáo cuối mỗi ngày làm việc (trước 18h)</List.Item>
                                        <List.Item>✅ Ghi chú cụ thể, tránh viết chung chung</List.Item>
                                        <List.Item>✅ Nếu blocked, mô tả rõ vấn đề để được hỗ trợ</List.Item>
                                        <List.Item>✅ Plan ngày mai giúp tổ chức công việc tốt hơn</List.Item>
                                    </List>
                                }
                                type="success"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </div>
                    </Tabs.TabPane>

                    {/* My Tasks Tab - NEW */}
                    <Tabs.TabPane
                        tab={
                            <span style={{ fontSize: isMobile ? '11px' : '14px', display: 'block', padding: isMobile ? '4px 8px' : '8px 12px' }}>
                                <CheckCircleOutlined style={{ marginRight: isMobile ? 4 : 8 }} />
                                {isMobile ? 'My Tasks' : 'Nhiệm Vụ Của Tôi'}
                            </span>
                        }
                        key="my-tasks"
                    >
                        <div style={{ padding: isMobile ? '8px' : '16px' }}>
                            <Title level={isMobile ? 4 : 3}>My Tasks - Quản Lý Nhiệm Vụ Cá Nhân</Title>

                            <Alert
                                message="🎯 Mục đích"
                                description="Trang My Tasks cho phép bạn xem TẤT CẢ nhiệm vụ trong hệ thống, với khả năng lọc theo người thực hiện. Mặc định hiển thị nhiệm vụ của bạn, nhưng bạn có thể xem nhiệm vụ của đồng nghiệp để theo dõi tiến độ team."
                                type="info"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px' }}>
                                1. Tổng Quan
                            </Divider>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={8}>
                                    <Card size="small" type="inner" title="📊 Thống Kê Nhanh">
                                        <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                            <List.Item>• Tổng số task</List.Item>
                                            <List.Item>• Tasks đang thực hiện</List.Item>
                                            <List.Item>• Tasks deadline hôm nay</List.Item>
                                            <List.Item>• Tasks quá hạn</List.Item>
                                        </List>
                                    </Card>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Card size="small" type="inner" title="🎨 Chế Độ Xem">
                                        <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                            <Text strong>Table View:</Text> Hiển thị danh sách chi tiết
                                        </Paragraph>
                                        <Paragraph style={{ fontSize: isMobile ? '11px' : '13px', marginBottom: 0 }}>
                                            <Text strong>Kanban View:</Text> Quản lý theo trạng thái, kéo thả để thay đổi
                                        </Paragraph>
                                    </Card>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Card size="small" type="inner" title="🔍 Filter Nâng Cao">
                                        <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                            Lọc theo người thực hiện, dự án, trạng thái,
                                            độ ưu tiên, khoảng thời gian. Tìm kiếm nhanh theo tên task.
                                        </Paragraph>
                                    </Card>
                                </Col>
                            </Row>

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px', marginTop: 24 }}>
                                2. Các Chế Độ Hiển Thị
                            </Divider>
                            <Collapse defaultActiveKey={['table']}>
                                <Panel header="📋 Table View (Bảng)" key="table">
                                    <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <List.Item>
                                            <Text strong>Hiển thị:</Text> Danh sách tasks dạng bảng với đầy đủ thông tin
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>Thông tin task:</Text> Tiêu đề, Dự án (tên + mã), Trạng thái, Độ ưu tiên, Tiến độ (%), Deadline, Người giao việc
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>Click vào task:</Text> Mở drawer chi tiết với đầy đủ thông tin, comments, files, checklist, time logs
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>Sắp xếp:</Text> Click vào header cột "Deadline" để sắp xếp theo ngày
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>Phân trang:</Text> Mặc định 20 tasks/trang, có thể điều chỉnh
                                        </List.Item>
                                    </List>
                                    <Alert
                                        message="💡 Mẹo"
                                        description="Deadline hiển thị màu đỏ nếu quá hạn, màu cam nếu là hôm nay"
                                        type="info"
                                        showIcon
                                        style={{ marginTop: 12 }}
                                    />
                                </Panel>

                                <Panel header="📊 Kanban View" key="kanban">
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <Text strong>Cách sử dụng:</Text>
                                    </Paragraph>
                                    <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <List.Item>
                                            <Text strong>Hiển thị:</Text> Tasks được nhóm theo trạng thái (To Do, In Progress, Testing, Done...)
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>Kéo thả:</Text> Drag & drop task từ cột này sang cột khác để thay đổi trạng thái
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>Thông tin card:</Text> Hiển thị độ ưu tiên (tag màu), tên task, dự án, tiến độ (progress bar), deadline
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>Click vào card:</Text> Mở drawer chi tiết task
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>Badge số:</Text> Mỗi cột hiển thị số lượng tasks
                                        </List.Item>
                                    </List>
                                    <Alert
                                        message="🎨 Giao diện đẹp"
                                        description="Kanban board với màu sắc rõ ràng, hiệu ứng drag & drop mượt mà, thích hợp cho việc quản lý trực quan"
                                        type="success"
                                        showIcon
                                        style={{ marginTop: 12 }}
                                    />
                                </Panel>
                            </Collapse>

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px', marginTop: 24 }}>
                                3. Bộ Lọc & Tìm Kiếm
                            </Divider>
                            <Card type="inner" size="small" style={{ marginBottom: 16 }}>
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} md={12}>
                                        <Text strong style={{ fontSize: isMobile ? '11px' : '13px', display: 'block', marginBottom: 8 }}>
                                            Các bộ lọc:
                                        </Text>
                                        <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                            <List.Item>
                                                🔹 <Text strong>Tìm kiếm:</Text> Gõ tên task để tìm nhanh
                                            </List.Item>
                                            <List.Item>
                                                👤 <Text strong>Người thực hiện:</Text> Lọc theo nhân viên (mặc định là bạn)
                                            </List.Item>
                                            <List.Item>
                                                📁 <Text strong>Dự án:</Text> Chọn dự án cụ thể
                                            </List.Item>
                                            <List.Item>
                                                🏷️ <Text strong>Trạng thái:</Text> To Do, In Progress, Done...
                                            </List.Item>
                                            <List.Item>
                                                🚩 <Text strong>Độ ưu tiên:</Text> Critical, High, Medium, Low
                                            </List.Item>
                                            <List.Item>
                                                📅 <Text strong>Khoảng thời gian:</Text> Từ ngày - Đến ngày
                                            </List.Item>
                                        </List>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Text strong style={{ fontSize: isMobile ? '11px' : '13px', display: 'block', marginBottom: 8 }}>
                                            Thao tác:
                                        </Text>
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Card size="small">
                                                <Tag color="blue">Tìm kiếm</Tag>
                                                <Paragraph style={{ fontSize: isMobile ? '11px' : '13px', marginTop: 8, marginBottom: 0 }}>
                                                    Áp dụng các filter đã chọn
                                                </Paragraph>
                                            </Card>
                                            <Card size="small">
                                                <Tag color="default">Làm mới</Tag>
                                                <Paragraph style={{ fontSize: isMobile ? '11px' : '13px', marginTop: 8, marginBottom: 0 }}>
                                                    Reset về filter mặc định (tasks của bạn)
                                                </Paragraph>
                                            </Card>
                                            <Card size="small">
                                                <Tag color="geekblue">Bảng</Tag> / <Tag color="purple">Kanban</Tag>
                                                <Paragraph style={{ fontSize: isMobile ? '11px' : '13px', marginTop: 8, marginBottom: 0 }}>
                                                    Chuyển đổi chế độ hiển thị
                                                </Paragraph>
                                            </Card>
                                        </Space>
                                    </Col>
                                </Row>
                            </Card>

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px' }}>
                                4. Xem Chi Tiết Task
                            </Divider>
                            <Card type="inner" size="small">
                                <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                    <Text strong>Cách mở:</Text> Click vào task (cả ở Table view và Kanban view)
                                </Paragraph>
                                <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                    <Text strong>Drawer hiển thị:</Text>
                                </Paragraph>
                                <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                    <List.Item>• Thông tin đầy đủ: Tiêu đề, Mô tả, Dự án, Trạng thái, Độ ưu tiên, Người thực hiện, Người giao việc</List.Item>
                                    <List.Item>• Ngày bắt đầu, Deadline, Tiến độ (%)</List.Item>
                                    <List.Item>• Tab Checklist: Danh sách công việc con</List.Item>
                                    <List.Item>• Tab Comments: Thảo luận, trao đổi</List.Item>
                                    <List.Item>• Tab Files: Tài liệu đính kèm</List.Item>
                                    <List.Item>• Tab Time Logs: Lịch sử tracking thời gian</List.Item>
                                    <List.Item>• Tab Activity: Lịch sử thay đổi</List.Item>
                                </List>
                                <Alert
                                    message="✨ Tính năng mới"
                                    description="Drawer mở trực tiếp tại trang My Tasks, không cần chuyển sang trang khác"
                                    type="success"
                                    showIcon
                                    style={{ marginTop: 12 }}
                                />
                            </Card>

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px', marginTop: 24 }}>
                                5. Workflow Khuyến Nghị
                            </Divider>
                            <Steps
                                direction="vertical"
                                current={-1}
                                items={[
                                    {
                                        title: 'Mở đầu ngày (8h)',
                                        description: (
                                            <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                Vào My Tasks → Xem tasks của bạn → Kiểm tra tasks quá hạn (màu đỏ)
                                            </Text>
                                        ),
                                    },
                                    {
                                        title: 'Lọc & Sắp xếp',
                                        description: (
                                            <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                Lọc theo "Hôm nay" hoặc "Tuần này" → Sắp xếp theo độ ưu tiên
                                            </Text>
                                        ),
                                    },
                                    {
                                        title: 'Chọn chế độ xem phù hợp',
                                        description: (
                                            <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                Kanban view để có overview → Table view để xem chi tiết
                                            </Text>
                                        ),
                                    },
                                    {
                                        title: 'Làm việc với task',
                                        description: (
                                            <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                Click vào task → Xem chi tiết → Start Timer (nếu có) → Bắt đầu làm
                                            </Text>
                                        ),
                                    },
                                    {
                                        title: 'Cập nhật tiến độ',
                                        description: (
                                            <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                Kéo thả sang cột khác (Kanban) hoặc cập nhật % tiến độ trong drawer
                                            </Text>
                                        ),
                                    },
                                    {
                                        title: 'Theo dõi team (nếu cần)',
                                        description: (
                                            <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                Chọn "Người thực hiện" → Xem tasks của đồng nghiệp để nắm tiến độ team
                                            </Text>
                                        ),
                                    },
                                ]}
                            />

                            <Alert
                                message="💡 Pro Tips"
                                description={
                                    <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <List.Item>⭐ Dùng filter "Người thực hiện" để xem tasks của đồng nghiệp khi cần phối hợp</List.Item>
                                        <List.Item>⭐ Kanban view giúp thao tác nhanh, Table view phù hợp xem chi tiết</List.Item>
                                        <List.Item>⭐ Click vào task để mở drawer ngay tại trang, không cần chuyển trang</List.Item>
                                        <List.Item>⭐ Sử dụng kéo thả trong Kanban để cập nhật trạng thái nhanh chóng</List.Item>
                                        <List.Item>⭐ Bookmark trang My Tasks để truy cập nhanh hàng ngày</List.Item>
                                        <List.Item>⭐ Kiểm tra tasks quá hạn (màu đỏ) mỗi sáng để ưu tiên xử lý</List.Item>
                                    </List>
                                }
                                type="success"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </div>
                    </Tabs.TabPane>

                    {/* Team Management Tab */}
                    <Tabs.TabPane
                        tab={
                            <span style={{ fontSize: isMobile ? '11px' : '14px', display: 'block', padding: isMobile ? '4px 8px' : '8px 12px' }}>
                                <TeamOutlined style={{ marginRight: isMobile ? 4 : 8 }} />
                                {isMobile ? 'Team' : 'Quản Lý Team'}
                            </span>
                        }
                        key="team"
                    >
                        <div style={{ padding: isMobile ? '8px' : '16px' }}>
                            <Title level={isMobile ? 4 : 3}>Quản Lý Thành Viên</Title>

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px' }}>
                                Thêm Thành Viên
                            </Divider>
                            <Steps
                                direction="vertical"
                                current={-1}
                                items={[
                                    {
                                        title: 'Vào Tab Thành Viên',
                                        description: <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>Chi tiết dự án → Tab "Thành viên"</Text>,
                                    },
                                    {
                                        title: 'Nhấn + Thêm',
                                        description: <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>Chọn nhân viên và vai trò</Text>,
                                    },
                                    {
                                        title: 'Lưu',
                                        description: <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>Thành viên được thêm vào dự án</Text>,
                                    },
                                ]}
                            />

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px', marginTop: 24 }}>
                                Vai Trò & Quyền Hạn
                            </Divider>
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                <Card size="small" type="inner">
                                    <Tag color="red">👑 Admin (Priority: 100)</Tag>
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px', marginTop: 8, marginBottom: 0 }}>
                                        <Text strong>Toàn quyền:</Text> Quản lý dự án, phân quyền, thêm/xóa thành viên, quản lý tất cả nhiệm vụ, xem báo cáo
                                    </Paragraph>
                                </Card>

                                <Card size="small" type="inner">
                                    <Tag color="orange">📋 Manager (Priority: 80)</Tag>
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px', marginTop: 8, marginBottom: 0 }}>
                                        <Text strong>Quản lý cao cấp:</Text> Sửa dự án, quản lý thành viên (priority thấp hơn), tạo/sửa/xóa task, xem báo cáo
                                    </Paragraph>
                                </Card>

                                <Card size="small" type="inner">
                                    <Tag color="blue">👤 Member (Priority: 50)</Tag>
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px', marginTop: 8, marginBottom: 0 }}>
                                        <Text strong>Thành viên:</Text> Tạo task, sửa task của mình, comment, upload file, log time
                                    </Paragraph>
                                </Card>

                                <Card size="small" type="inner">
                                    <Tag color="green">👁️ Viewer (Priority: 10)</Tag>
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px', marginTop: 8, marginBottom: 0 }}>
                                        <Text strong>Chỉ xem:</Text> Xem dự án, task, dashboard - không tạo/sửa/xóa
                                    </Paragraph>
                                </Card>
                            </Space>

                            <Alert
                                message="📌 Lưu ý về Priority"
                                description={
                                    <span style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        Chỉ có thể phân quyền role có priority thấp hơn. Ví dụ: Manager (80) chỉ có thể gán role Member (50) hoặc Viewer (10).
                                    </span>
                                }
                                type="info"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </div>
                    </Tabs.TabPane>

                    {/* RBAC & Permissions Tab - NEW */}
                    <Tabs.TabPane
                        tab={
                            <span style={{ fontSize: isMobile ? '11px' : '14px', display: 'block', padding: isMobile ? '4px 8px' : '8px 12px' }}>
                                <SafetyOutlined style={{ marginRight: isMobile ? 4 : 8 }} />
                                {isMobile ? 'Phân Quyền' : 'Hệ Thống Phân Quyền'}
                            </span>
                        }
                        key="rbac"
                    >
                        <div style={{ padding: isMobile ? '8px' : '16px' }}>
                            <Title level={isMobile ? 4 : 3}>Hệ Thống Phân Quyền (RBAC)</Title>

                            <Alert
                                message="🔐 Bảo mật"
                                description="Hệ thống sử dụng Role-Based Access Control (RBAC) để quản lý quyền truy cập chi tiết cho từng dự án."
                                type="success"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px' }}>
                                Ma Trận Quyền Hạn
                            </Divider>

                            <div style={{ overflowX: 'auto' }}>
                                <Table
                                    size="small"
                                    pagination={false}
                                    dataSource={[
                                        { key: '1', permission: 'Xem dự án', admin: '✅', manager: '✅', member: '✅', viewer: '✅' },
                                        { key: '2', permission: 'Sửa dự án', admin: '✅', manager: '✅', member: '❌', viewer: '❌' },
                                        { key: '3', permission: 'Xóa dự án', admin: '✅', manager: '❌', member: '❌', viewer: '❌' },
                                        { key: '4', permission: 'Quản lý thành viên', admin: '✅', manager: '✅*', member: '❌', viewer: '❌' },
                                        { key: '5', permission: 'Tạo task', admin: '✅', manager: '✅', member: '✅', viewer: '❌' },
                                        { key: '6', permission: 'Sửa task (bất kỳ)', admin: '✅', manager: '✅', member: '❌', viewer: '❌' },
                                        { key: '7', permission: 'Sửa task của mình', admin: '✅', manager: '✅', member: '✅', viewer: '❌' },
                                        { key: '8', permission: 'Xóa task', admin: '✅', manager: '✅', member: '❌', viewer: '❌' },
                                        { key: '9', permission: 'Tạo comment', admin: '✅', manager: '✅', member: '✅', viewer: '❌' },
                                        { key: '10', permission: 'Upload file', admin: '✅', manager: '✅', member: '✅', viewer: '❌' },
                                        { key: '11', permission: 'Xóa file', admin: '✅', manager: '✅', member: '❌', viewer: '❌' },
                                        { key: '12', permission: 'Log time', admin: '✅', manager: '✅', member: '✅', viewer: '❌' },
                                        { key: '13', permission: 'Xem báo cáo', admin: '✅', manager: '✅', member: '✅', viewer: '✅' },
                                    ]}
                                    columns={[
                                        { title: 'Quyền', dataIndex: 'permission', key: 'permission', width: isMobile ? 150 : 200 },
                                        { title: 'Admin', dataIndex: 'admin', key: 'admin', align: 'center', width: isMobile ? 60 : 80 },
                                        { title: 'Manager', dataIndex: 'manager', key: 'manager', align: 'center', width: isMobile ? 70 : 90 },
                                        { title: 'Member', dataIndex: 'member', key: 'member', align: 'center', width: isMobile ? 70 : 90 },
                                        { title: 'Viewer', dataIndex: 'viewer', key: 'viewer', align: 'center', width: isMobile ? 60 : 80 },
                                    ]}
                                    scroll={{ x: isMobile ? 500 : undefined }}
                                />
                            </div>

                            <Alert
                                message="* Manager chỉ quản lý được thành viên có priority thấp hơn"
                                type="info"
                                showIcon
                                style={{ marginTop: 12, fontSize: isMobile ? '11px' : '13px' }}
                            />

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px', marginTop: 24 }}>
                                Cơ Chế Phân Quyền
                            </Divider>

                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <Card size="small" type="inner" title="1️⃣ Super Admin Protection">
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px', marginBottom: 0 }}>
                                        Tài khoản Admin (ID=1) có <Text strong>toàn quyền tuyệt đối</Text> - bỏ qua mọi kiểm tra phân quyền.
                                        Không thể bị giới hạn bởi bất kỳ rule nào.
                                    </Paragraph>
                                </Card>

                                <Card size="small" type="inner" title="2️⃣ Project-Level Permissions">
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px', marginBottom: 0 }}>
                                        Quyền được gán <Text strong>theo từng dự án</Text>. Một user có thể là Manager ở dự án A,
                                        nhưng chỉ là Member ở dự án B.
                                    </Paragraph>
                                </Card>

                                <Card size="small" type="inner" title="3️⃣ Permission Caching">
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px', marginBottom: 0 }}>
                                        Quyền được cache <Text strong>3600 giây (1 giờ)</Text> để tối ưu hiệu năng.
                                        Sau khi đổi role, có thể mất vài phút mới cập nhật.
                                    </Paragraph>
                                </Card>

                                <Card size="small" type="inner" title="4️⃣ Authorization Layers">
                                    <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <List.Item>• <Text strong>Middleware:</Text> Kiểm tra quyền truy cập route</List.Item>
                                        <List.Item>• <Text strong>Policy:</Text> Kiểm tra quyền trên model (Project, Task)</List.Item>
                                        <List.Item>• <Text strong>Service:</Text> Logic kiểm tra quyền chi tiết</List.Item>
                                        <List.Item>• <Text strong>Controller:</Text> Xác thực 403 Forbidden</List.Item>
                                        <List.Item>• <Text strong>Frontend:</Text> Ẩn/hiện button dựa trên quyền</List.Item>
                                    </List>
                                </Card>
                            </Space>

                            <Divider orientation="left" style={{ fontSize: isMobile ? '13px' : '14px', marginTop: 24 }}>
                                Cách Kiểm Tra Quyền
                            </Divider>

                            <Steps
                                direction="vertical"
                                current={-1}
                                items={[
                                    {
                                        title: 'Xem Role của bạn',
                                        description: <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>Vào Chi tiết dự án → Tab "Thành viên" → Tìm tên bạn</Text>,
                                    },
                                    {
                                        title: 'Kiểm tra quyền',
                                        description: <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>Đối chiếu với Ma trận quyền hạn ở trên</Text>,
                                    },
                                    {
                                        title: 'Nếu thiếu quyền',
                                        description: <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>Liên hệ Quản lý dự án hoặc Admin để xin cấp quyền cao hơn</Text>,
                                    },
                                ]}
                            />
                        </div>
                    </Tabs.TabPane>

                    {/* Advanced Features Tab - NEW */}
                    <Tabs.TabPane
                        tab={
                            <span style={{ fontSize: isMobile ? '11px' : '14px', display: 'block', padding: isMobile ? '4px 8px' : '8px 12px' }}>
                                <RocketOutlined style={{ marginRight: isMobile ? 4 : 8 }} />
                                {isMobile ? 'Nâng Cao' : 'Tính Năng Nâng Cao'}
                            </span>
                        }
                        key="advanced"
                    >
                        <div style={{ padding: isMobile ? '8px' : '16px' }}>
                            <Title level={isMobile ? 4 : 3}>Tính Năng Nâng Cao</Title>

                            <Collapse defaultActiveKey={['filter']}>
                                <Panel header="🔍 Tìm Kiếm & Lọc Nâng Cao" key="filter">
                                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                        <Card size="small" type="inner" title="Lọc Task">
                                            <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                <List.Item>• <Text strong>Theo trạng thái:</Text> To Do, In Progress, Done, Blocked</List.Item>
                                                <List.Item>• <Text strong>Theo độ ưu tiên:</Text> Critical, High, Medium, Low</List.Item>
                                                <List.Item>• <Text strong>Theo người thực hiện:</Text> Chọn từ danh sách thành viên</List.Item>
                                                <List.Item>• <Text strong>Theo ngày:</Text> Start date, Due date, Date range</List.Item>
                                                <List.Item>• <Text strong>Theo tag:</Text> Frontend, Backend, Bug, Feature...</List.Item>
                                            </List>
                                        </Card>

                                        <Card size="small" type="inner" title="Tìm Kiếm Nhanh">
                                            <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                Dùng ô tìm kiếm để tìm theo: <Text strong>Tiêu đề task, Mô tả, Mã task, Tên người thực hiện</Text>
                                            </Paragraph>
                                            <Alert
                                                message="💡 Mẹo: Gõ # + số để tìm task theo ID (vd: #123)"
                                                type="info"
                                                showIcon
                                                style={{ fontSize: isMobile ? '10px' : '12px' }}
                                            />
                                        </Card>
                                    </Space>
                                </Panel>

                                <Panel header="⚡ Shortcuts & Tips" key="shortcuts">
                                    <Table
                                        size="small"
                                        pagination={false}
                                        dataSource={[
                                            { key: '1', action: 'Tạo task nhanh', shortcut: 'Ctrl + N hoặc Cmd + N' },
                                            { key: '2', action: 'Lưu thay đổi', shortcut: 'Ctrl + S hoặc Cmd + S' },
                                            { key: '3', action: 'Tìm kiếm', shortcut: 'Ctrl + F hoặc Cmd + F' },
                                            { key: '4', action: 'Đóng modal/drawer', shortcut: 'ESC' },
                                            { key: '5', action: 'Kéo thả task', shortcut: 'Click & Drag' },
                                            { key: '6', action: 'Chọn nhiều', shortcut: 'Ctrl + Click' },
                                        ]}
                                        columns={[
                                            { title: 'Thao tác', dataIndex: 'action', key: 'action' },
                                            { title: 'Phím tắt', dataIndex: 'shortcut', key: 'shortcut' },
                                        ]}
                                    />
                                </Panel>

                                <Panel header="📎 Quản Lý File" key="files">
                                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                        <Card size="small" type="inner" title="Upload">
                                            <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                <List.Item>• Hỗ trợ: Hình ảnh (JPG, PNG, GIF), Documents (PDF, DOCX, XLSX), Code (ZIP)</List.Item>
                                                <List.Item>• Kích thước tối đa: <Text strong>10MB/file</Text></List.Item>
                                                <List.Item>• Upload nhiều file: Kéo thả hoặc chọn nhiều file cùng lúc</List.Item>
                                            </List>
                                        </Card>

                                        <Card size="small" type="inner" title="Xem Trước">
                                            <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                Click vào file để xem trước. Hỗ trợ preview cho: <Text strong>Hình ảnh, PDF, Text files</Text>
                                            </Paragraph>
                                        </Card>

                                        <Alert
                                            message="⚠️ Lưu ý: File sẽ bị xóa vĩnh viễn khi xóa task hoặc dự án!"
                                            type="warning"
                                            showIcon
                                            style={{ fontSize: isMobile ? '10px' : '12px' }}
                                        />
                                    </Space>
                                </Panel>

                                <Panel header="🔔 Thông Báo & Nhắc Nhở" key="notifications">
                                    <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <List.Item>• <Text strong>Được assign task mới:</Text> Nhận email & thông báo trong app</List.Item>
                                        <List.Item>• <Text strong>Task sắp deadline:</Text> Nhắc trước 1 ngày</List.Item>
                                        <List.Item>• <Text strong>Có comment mới:</Text> Thông báo real-time</List.Item>
                                        <List.Item>• <Text strong>Task thay đổi trạng thái:</Text> Nhận update</List.Item>
                                        <List.Item>• <Text strong>Thêm vào dự án:</Text> Email welcome với link</List.Item>
                                    </List>
                                </Panel>

                                <Panel header="📊 Export & Import" key="export">
                                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                        <Card size="small" type="inner" title="Export Dự Án">
                                            <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                Xuất danh sách task ra file: <Tag color="green">Excel</Tag> <Tag color="blue">CSV</Tag> <Tag color="red">PDF</Tag>
                                            </Paragraph>
                                            <Paragraph style={{ fontSize: isMobile ? '11px' : '13px', marginBottom: 0 }}>
                                                <Text strong>Cách làm:</Text> Dashboard → Nhấn "Export" → Chọn format
                                            </Paragraph>
                                        </Card>

                                        <Card size="small" type="inner" title="Import Tasks (Beta)">
                                            <Paragraph style={{ fontSize: isMobile ? '11px' : '13px', marginBottom: 0 }}>
                                                Nhập hàng loạt task từ Excel template. Liên hệ Admin để lấy file mẫu.
                                            </Paragraph>
                                        </Card>
                                    </Space>
                                </Panel>

                                <Panel header="🔗 Integrations" key="integrations">
                                    <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <List.Item>• <Text strong>Email:</Text> Gửi task qua email → Tự động tạo task</List.Item>
                                        <List.Item>• <Text strong>Calendar:</Text> Sync deadline với Google Calendar</List.Item>
                                        <List.Item>• <Text strong>Slack:</Text> Nhận thông báo task trên Slack</List.Item>
                                        <List.Item>• <Text strong>Webhooks:</Text> Tích hợp với hệ thống bên ngoài</List.Item>
                                    </List>
                                    <Alert
                                        message="📌 Liên hệ Admin để bật các tích hợp này"
                                        type="info"
                                        showIcon
                                        style={{ marginTop: 12, fontSize: isMobile ? '10px' : '12px' }}
                                    />
                                </Panel>
                            </Collapse>
                        </div>
                    </Tabs.TabPane>

                    {/* Troubleshooting Tab - NEW */}
                    <Tabs.TabPane
                        tab={
                            <span style={{ fontSize: isMobile ? '11px' : '14px', display: 'block', padding: isMobile ? '4px 8px' : '8px 12px' }}>
                                <WarningOutlined style={{ marginRight: isMobile ? 4 : 8 }} />
                                {isMobile ? 'Lỗi' : 'Xử Lý Lỗi'}
                            </span>
                        }
                        key="troubleshooting"
                    >
                        <div style={{ padding: isMobile ? '8px' : '16px' }}>
                            <Title level={isMobile ? 4 : 3}>Xử Lý Sự Cố & Lỗi Thường Gặp</Title>

                            <Collapse defaultActiveKey={['403']}>
                                <Panel header="🚫 Lỗi 403: Bạn không có quyền" key="403">
                                    <Alert
                                        message="Nguyên nhân"
                                        description={
                                            <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                <List.Item>• Role của bạn không đủ quyền thực hiện hành động này</List.Item>
                                                <List.Item>• Bạn không phải thành viên của dự án</List.Item>
                                                <List.Item>• Đang cố sửa task của người khác (chỉ Manager trở lên được phép)</List.Item>
                                            </List>
                                        }
                                        type="error"
                                        showIcon
                                        style={{ marginBottom: 12 }}
                                    />
                                    <Alert
                                        message="Giải pháp"
                                        description={
                                            <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                <List.Item>✅ Kiểm tra role của bạn trong tab Thành viên</List.Item>
                                                <List.Item>✅ Liên hệ Manager/Admin để xin cấp quyền cao hơn</List.Item>
                                                <List.Item>✅ Đảm bảo bạn đã được thêm vào dự án</List.Item>
                                            </List>
                                        }
                                        type="success"
                                        showIcon
                                    />
                                </Panel>

                                <Panel header="⏱️ Timer không chạy hoặc bị dừng" key="timer">
                                    <Alert
                                        message="Nguyên nhân"
                                        description={
                                            <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                <List.Item>• Đã có timer khác đang chạy (mỗi user chỉ chạy 1 timer)</List.Item>
                                                <List.Item>• Mất kết nối mạng khi timer đang chạy</List.Item>
                                                <List.Item>• Session hết hạn (timeout)</List.Item>
                                            </List>
                                        }
                                        type="error"
                                        showIcon
                                        style={{ marginBottom: 12 }}
                                    />
                                    <Alert
                                        message="Giải pháp"
                                        description={
                                            <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                <List.Item>✅ Dừng timer cũ trước khi bắt đầu timer mới</List.Item>
                                                <List.Item>✅ Refresh trang và kiểm tra timer còn chạy không</List.Item>
                                                <List.Item>✅ Nếu mất data, dùng "Thêm Log Thủ Công" để bù thời gian</List.Item>
                                            </List>
                                        }
                                        type="success"
                                        showIcon
                                    />
                                </Panel>

                                <Panel header="📎 Upload file bị lỗi" key="upload">
                                    <Alert
                                        message="Nguyên nhân"
                                        description={
                                            <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                <List.Item>• File quá lớn ({'>'}10MB)</List.Item>
                                                <List.Item>• Định dạng file không được hỗ trợ</List.Item>
                                                <List.Item>• Không đủ quyền upload (Viewer không được upload)</List.Item>
                                                <List.Item>• Lỗi server hoặc mạng</List.Item>
                                            </List>
                                        }
                                        type="error"
                                        showIcon
                                        style={{ marginBottom: 12 }}
                                    />
                                    <Alert
                                        message="Giải pháp"
                                        description={
                                            <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                <List.Item>✅ Nén file nếu {'>'}10MB (dùng ZIP/RAR)</List.Item>
                                                <List.Item>✅ Kiểm tra định dạng: JPG, PNG, PDF, DOCX, XLSX, ZIP</List.Item>
                                                <List.Item>✅ Kiểm tra quyền của bạn (tối thiểu Member)</List.Item>
                                                <List.Item>✅ Thử upload lại sau vài phút</List.Item>
                                            </List>
                                        }
                                        type="success"
                                        showIcon
                                    />
                                </Panel>

                                <Panel header="🔄 Dữ liệu không cập nhật" key="refresh">
                                    <Alert
                                        message="Nguyên nhân"
                                        description={
                                            <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                <List.Item>• Cache trình duyệt</List.Item>
                                                <List.Item>• Permission cache (1 giờ)</List.Item>
                                                <List.Item>• Nhiều tab cùng mở</List.Item>
                                            </List>
                                        }
                                        type="error"
                                        showIcon
                                        style={{ marginBottom: 12 }}
                                    />
                                    <Alert
                                        message="Giải pháp"
                                        description={
                                            <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                                <List.Item>✅ Nhấn F5 hoặc Ctrl+R để refresh</List.Item>
                                                <List.Item>✅ Xóa cache: Ctrl+Shift+Delete</List.Item>
                                                <List.Item>✅ Đợi vài phút để permission cache hết hạn</List.Item>
                                                <List.Item>✅ Đóng các tab cũ, chỉ giữ 1 tab</List.Item>
                                            </List>
                                        }
                                        type="success"
                                        showIcon
                                    />
                                </Panel>

                                <Panel header="🐛 Lỗi khác / Bug" key="bug">
                                    <Steps
                                        direction="vertical"
                                        current={-1}
                                        items={[
                                            {
                                                title: 'Chụp màn hình lỗi',
                                                description: <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>Screenshot toàn bộ trang kèm thông báo lỗi</Text>,
                                            },
                                            {
                                                title: 'Mở Console',
                                                description: <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>F12 → Tab Console → Chụp ảnh log màu đỏ</Text>,
                                            },
                                            {
                                                title: 'Ghi lại các bước tái hiện',
                                                description: <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>Viết chi tiết: Bước 1 làm gì → Bước 2 → Kết quả lỗi</Text>,
                                            },
                                            {
                                                title: 'Báo cáo',
                                                description: <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>Email tới support@example.com với các thông tin trên</Text>,
                                            },
                                        ]}
                                    />
                                </Panel>
                            </Collapse>

                            <Divider />

                            <Card type="inner" title="🆘 Liên Hệ Khẩn Cấp">
                                <Paragraph style={{ fontSize: isMobile ? '12px' : '14px' }}>
                                    Nếu gặp lỗi nghiêm trọng ảnh hưởng công việc:
                                </Paragraph>
                                <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                    <List.Item>📞 <Text strong>Hotline:</Text> 1900-xxxx (24/7)</List.Item>
                                    <List.Item>💬 <Text strong>Chat:</Text> Widget góc dưới phải</List.Item>
                                    <List.Item>📧 <Text strong>Email:</Text> urgent@example.com</List.Item>
                                </List>
                            </Card>
                        </div>
                    </Tabs.TabPane>

                    {/* Best Practices Tab - NEW */}
                    <Tabs.TabPane
                        tab={
                            <span style={{ fontSize: isMobile ? '11px' : '14px', display: 'block', padding: isMobile ? '4px 8px' : '8px 12px' }}>
                                <CheckCircleOutlined style={{ marginRight: isMobile ? 4 : 8 }} />
                                {isMobile ? 'Best Practices' : 'Thực Hành Tốt'}
                            </span>
                        }
                        key="best-practices"
                    >
                        <div style={{ padding: isMobile ? '8px' : '16px' }}>
                            <Title level={isMobile ? 4 : 3}>Best Practices - Cách Làm Việc Hiệu Quả</Title>

                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <Card type="inner" title="✅ Tạo Task Hiệu Quả">
                                    <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <List.Item>
                                            <Text strong>1. Tiêu đề rõ ràng:</Text> Dùng động từ + đối tượng.
                                            VD: "Thiết kế màn hình login" thay vì "Login"
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>2. Mô tả chi tiết:</Text> Ghi rõ yêu cầu, acceptance criteria, link tài liệu
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>3. Ước lượng thời gian:</Text> Điền estimated hours để dễ quản lý workload
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>4. Gán người thực hiện:</Text> Đừng để task không có owner
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>5. Set deadline hợp lý:</Text> Tránh deadline quá gấp hoặc quá xa
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>6. Dùng checklist:</Text> Chia task lớn thành các subtask nhỏ
                                        </List.Item>
                                    </List>
                                </Card>

                                <Card type="inner" title="⏰ Quản Lý Thời Gian">
                                    <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <List.Item>
                                            <Text strong>✅ BẬT timer ngay khi bắt đầu:</Text> Đừng quên log time
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>✅ TẮT timer khi nghỉ:</Text> Đi ăn, họp → Dừng timer
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>✅ Cập nhật tiến độ thường xuyên:</Text> Mỗi ngày cập nhật % progress
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>✅ Review time log cuối ngày:</Text> Kiểm tra đã log đủ chưa
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>❌ TRÁNH:</Text> Log time ẩu, log thiếu, hoặc log quá nhiều
                                        </List.Item>
                                    </List>
                                </Card>

                                <Card type="inner" title="💬 Communication & Comments">
                                    <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <List.Item>
                                            <Text strong>✅ Tag người liên quan:</Text> Dùng @tên để notify
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>✅ Comment khi đổi trạng thái:</Text> Giải thích lý do Done, Blocked...
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>✅ Hỏi rõ ràng:</Text> Thay vì "Cái này làm sao?", hãy hỏi cụ thể
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>✅ Upload ảnh minh họa:</Text> Screenshot lỗi, mockup design...
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>❌ TRÁNH:</Text> Spam comments, off-topic, hoặc không reply
                                        </List.Item>
                                    </List>
                                </Card>

                                <Card type="inner" title="📊 Sử Dụng Kanban Board">
                                    <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <List.Item>
                                            <Text strong>To Do:</Text> Task đã plan rõ, có đủ thông tin, sẵn sàng làm
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>In Progress:</Text> Đang làm NGAY BÂY GIỜ (giới hạn 2-3 task/người)
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>Review:</Text> Đã code xong, đang chờ review/test
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>Done:</Text> Hoàn thành 100%, đã test, merged code
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>Blocked:</Text> Bị chặn, cần hỗ trợ → Comment lý do
                                        </List.Item>
                                    </List>
                                    <Alert
                                        message="💡 Nguyên tắc WIP Limit: Không nên có quá 2-3 task In Progress cùng lúc!"
                                        type="warning"
                                        showIcon
                                        style={{ marginTop: 12, fontSize: isMobile ? '10px' : '12px' }}
                                    />
                                </Card>

                                <Card type="inner" title="🎯 Làm Việc Nhóm Hiệu Quả">
                                    <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <List.Item>
                                            <Text strong>Daily Standup:</Text> Mỗi sáng update trạng thái task vào comment
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>Review Deadline:</Text> Kiểm tra task sắp tới hạn mỗi ngày
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>Hỗ trợ đồng đội:</Text> Nhìn Kanban, xem ai bị Blocked → Giúp đỡ
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>Chia sẻ kiến thức:</Text> Comment tips, link tài liệu hữu ích
                                        </List.Item>
                                        <List.Item>
                                            <Text strong>Celebrate wins:</Text> Comment khen khi team hoàn thành milestone 🎉
                                        </List.Item>
                                    </List>
                                </Card>
                            </Space>
                        </div>
                    </Tabs.TabPane>

                    {/* FAQ Tab - NEW */}
                    <Tabs.TabPane
                        tab={
                            <span style={{ fontSize: isMobile ? '11px' : '14px', display: 'block', padding: isMobile ? '4px 8px' : '8px 12px' }}>
                                <QuestionCircleOutlined style={{ marginRight: isMobile ? 4 : 8 }} />
                                {isMobile ? 'FAQ' : 'Câu Hỏi Thường Gặp'}
                            </span>
                        }
                        key="faq"
                    >
                        <div style={{ padding: isMobile ? '8px' : '16px' }}>
                            <Title level={isMobile ? 4 : 3}>Câu Hỏi Thường Gặp (FAQ)</Title>

                            <Collapse accordion>
                                <Panel header="❓ Tôi có thể tham gia bao nhiêu dự án?" key="q1">
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <Text strong>Không giới hạn.</Text> Bạn có thể là thành viên của nhiều dự án,
                                        với role khác nhau ở mỗi dự án. Ví dụ: Admin ở Dự án A, Member ở Dự án B.
                                    </Paragraph>
                                </Panel>

                                <Panel header="❓ Làm sao để xem tất cả task được giao cho tôi?" key="q2">
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        Vào <Text strong>Dashboard</Text> → Dùng filter <Text strong>"Người thực hiện = Tôi"</Text> →
                                        Sẽ hiển thị tất cả task của bạn từ mọi dự án.
                                    </Paragraph>
                                </Panel>

                                <Panel header="❓ Task bị quá hạn thì sao?" key="q3">
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        Task quá hạn sẽ <Text strong>đổi màu đỏ</Text> và hiển thị biểu tượng cảnh báo.
                                        Bạn nên:
                                    </Paragraph>
                                    <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <List.Item>1. Comment giải thích lý do</List.Item>
                                        <List.Item>2. Update tiến độ hiện tại</List.Item>
                                        <List.Item>3. Thương lượng deadline mới với Manager</List.Item>
                                    </List>
                                </Panel>

                                <Panel header="❓ Có thể xóa comment đã gửi không?" key="q4">
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <Text strong>Có.</Text> Bạn có thể xóa comment của mình trong vòng 5 phút sau khi gửi.
                                        Sau 5 phút, chỉ Manager/Admin mới xóa được.
                                    </Paragraph>
                                </Panel>

                                <Panel header="❓ Tại sao tôi không thấy nút Sửa/Xóa?" key="q5">
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        Do <Text strong>quyền hạn</Text> của bạn. Nếu bạn là:
                                    </Paragraph>
                                    <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <List.Item>• <Text strong>Viewer:</Text> Chỉ xem, không có nút Sửa/Xóa</List.Item>
                                        <List.Item>• <Text strong>Member:</Text> Chỉ sửa task của mình</List.Item>
                                        <List.Item>• <Text strong>Manager/Admin:</Text> Sửa/xóa tất cả</List.Item>
                                    </List>
                                </Panel>

                                <Panel header="❓ Timer có tự động dừng khi đóng trình duyệt?" key="q6">
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <Text strong>KHÔNG.</Text> Timer chạy trên server, không phụ thuộc vào trình duyệt.
                                        Bạn có thể đóng tab/máy tính, timer vẫn chạy. Nhớ <Text strong>BẤM DỪNG</Text> khi xong việc!
                                    </Paragraph>
                                </Panel>

                                <Panel header="❓ Có thể chuyển task sang dự án khác không?" key="q7">
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <Text strong>Chưa hỗ trợ.</Text> Bạn cần tạo task mới ở dự án đích,
                                        copy nội dung, rồi xóa task cũ. Hoặc liên hệ Admin để xử lý.
                                    </Paragraph>
                                </Panel>

                                <Panel header="❓ Làm sao để nhận notification qua email?" key="q8">
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        Vào <Text strong>Profile → Settings → Notifications</Text> → Bật các tùy chọn:
                                    </Paragraph>
                                    <List size="small" style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <List.Item>✉️ Email khi được assign task</List.Item>
                                        <List.Item>✉️ Email khi có comment mới</List.Item>
                                        <List.Item>✉️ Daily digest (tổng hợp cuối ngày)</List.Item>
                                    </List>
                                </Panel>

                                <Panel header="❓ Dữ liệu có được backup không?" key="q9">
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <Text strong>CÓ.</Text> Hệ thống tự động backup mỗi ngày lúc 2h sáng.
                                        Data được lưu trữ <Text strong>30 ngày</Text>. Nếu cần khôi phục, liên hệ Admin.
                                    </Paragraph>
                                </Panel>

                                <Panel header="❓ Có app mobile không?" key="q10">
                                    <Paragraph style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        <Text strong>Đang phát triển.</Text> Hiện tại hãy dùng <Text strong>trình duyệt mobile</Text>.
                                        Giao diện đã được tối ưu responsive, hoạt động tốt trên điện thoại.
                                    </Paragraph>
                                </Panel>
                            </Collapse>

                            <Divider />

                            <Alert
                                message="💡 Không tìm thấy câu trả lời?"
                                description={
                                    <span style={{ fontSize: isMobile ? '11px' : '13px' }}>
                                        Gửi câu hỏi của bạn tới <Text strong>support@example.com</Text> hoặc dùng Chat widget.
                                        Chúng tôi sẽ trả lời trong 24h!
                                    </span>
                                }
                                type="info"
                                showIcon
                            />
                        </div>
                    </Tabs.TabPane>
                </Tabs>

                <Divider />

                <Card type="inner" title="🆘 Hỗ Trợ & Liên Hệ">
                    <Paragraph style={{ fontSize: isMobile ? '12px' : '14px', marginBottom: 8 }}>
                        Nếu gặp vấn đề hoặc cần hỗ trợ, vui lòng liên hệ:
                    </Paragraph>
                    <List size="small" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                        <List.Item>📧 Email: support@example.com</List.Item>
                        <List.Item>📞 Hotline: 1900-xxxx</List.Item>
                        <List.Item>💬 Chat: Widget chat ở góc dưới phải</List.Item>
                    </List>
                </Card>
            </Card>
        </div>
    );
};

export default UserGuide;

