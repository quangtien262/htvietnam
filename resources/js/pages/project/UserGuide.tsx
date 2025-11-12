import React, { useState } from 'react';
import { Card, Tabs, Typography, Steps, Divider, Tag, Space, Alert, Collapse, List } from 'antd';
import {
    ProjectOutlined,
    FileTextOutlined,
    TeamOutlined,
    ClockCircleOutlined,
    BarChartOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined,
    BulbOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

/**
 * User Guide Component
 *
 * Interactive guide for Project Management module.
 * Provides step-by-step tutorials for all major features.
 */
const UserGuide: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Card>
                <Title level={2}>
                    <BulbOutlined /> Hướng Dẫn Sử Dụng - Quản Lý Dự Án
                </Title>
                <Paragraph>
                    Chào mừng bạn đến với hệ thống Quản Lý Dự Án! Tài liệu này sẽ hướng dẫn bạn cách sử dụng
                    tất cả các tính năng của module.
                </Paragraph>

                <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
                    {/* Overview Tab */}
                    <TabPane
                        tab={
                            <span>
                                <InfoCircleOutlined />
                                Tổng Quan
                            </span>
                        }
                        key="overview"
                    >
                        <Title level={3}>Tổng Quan Hệ Thống</Title>
                        <Paragraph>
                            Module Quản Lý Dự Án cung cấp các tính năng toàn diện để quản lý dự án và nhiệm vụ:
                        </Paragraph>

                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Card type="inner" title="🎯 Các Tính Năng Chính">
                                <List
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
                                        <List.Item>
                                            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                            {item}
                                        </List.Item>
                                    )}
                                />
                            </Card>

                            <Card type="inner" title="📋 Cấu Trúc Module">
                                <Paragraph>
                                    <Text strong>1. Dashboard:</Text> Trang chủ hiển thị tổng quan tất cả dự án
                                </Paragraph>
                                <Paragraph>
                                    <Text strong>2. Danh Sách Dự Án:</Text> Quản lý tất cả dự án (tạo, sửa, xóa)
                                </Paragraph>
                                <Paragraph>
                                    <Text strong>3. Chi Tiết Dự Án:</Text> Xem chi tiết, quản lý nhiệm vụ, thành viên
                                </Paragraph>
                                <Paragraph>
                                    <Text strong>4. Kanban Board:</Text> Quản lý nhiệm vụ theo dạng bảng
                                </Paragraph>
                                <Paragraph>
                                    <Text strong>5. Gantt Chart:</Text> Timeline dự án
                                </Paragraph>
                            </Card>

                            <Alert
                                message="💡 Mẹo"
                                description="Sử dụng các tab bên trên để xem hướng dẫn chi tiết cho từng tính năng."
                                type="info"
                                showIcon
                            />
                        </Space>
                    </TabPane>

                    {/* Project Management Tab */}
                    <TabPane
                        tab={
                            <span>
                                <ProjectOutlined />
                                Quản Lý Dự Án
                            </span>
                        }
                        key="project"
                    >
                        <Title level={3}>Quản Lý Dự Án</Title>

                        <Divider orientation="left">1. Tạo Dự Án Mới</Divider>
                        <Steps
                            direction="vertical"
                            current={-1}
                            items={[
                                {
                                    title: 'Mở Form Tạo Dự Án',
                                    description: (
                                        <Paragraph>
                                            Nhấn nút <Tag color="blue">+ Tạo Dự Án</Tag> ở góc trên bên phải.
                                        </Paragraph>
                                    ),
                                },
                                {
                                    title: 'Điền Thông Tin Cơ Bản',
                                    description: (
                                        <div>
                                            <Paragraph>Các trường bắt buộc:</Paragraph>
                                            <List size="small">
                                                <List.Item>• <Text strong>Tên dự án:</Text> Tên hiển thị của dự án</List.Item>
                                                <List.Item>• <Text strong>Mã dự án:</Text> Mã định danh (tự động tạo nếu để trống)</List.Item>
                                                <List.Item>• <Text strong>Khách hàng:</Text> Tên khách hàng/đối tác</List.Item>
                                                <List.Item>• <Text strong>Ngày bắt đầu:</Text> Ngày khởi động dự án</List.Item>
                                                <List.Item>• <Text strong>Ngày kết thúc dự kiến:</Text> Deadline của dự án</List.Item>
                                            </List>
                                        </div>
                                    ),
                                },
                                {
                                    title: 'Chọn Trạng Thái & Độ Ưu Tiên',
                                    description: (
                                        <Paragraph>
                                            Chọn <Text strong>Trạng thái</Text> (Planning, In Progress, Completed...),{' '}
                                            <Text strong>Loại dự án</Text>, và <Text strong>Độ ưu tiên</Text>.
                                        </Paragraph>
                                    ),
                                },
                                {
                                    title: 'Thêm Quản Lý & Thành Viên',
                                    description: (
                                        <Paragraph>
                                            Chọn <Text strong>Quản lý dự án</Text> và thêm các thành viên vào team.
                                            Mỗi thành viên có thể có vai trò: Quản lý, Thành viên, hoặc Xem.
                                        </Paragraph>
                                    ),
                                },
                                {
                                    title: 'Lưu Dự Án',
                                    description: (
                                        <Paragraph>
                                            Nhấn <Tag color="green">Lưu</Tag> để tạo dự án. Hệ thống sẽ tự động thêm
                                            quản lý dự án vào danh sách thành viên.
                                        </Paragraph>
                                    ),
                                },
                            ]}
                        />

                        <Divider orientation="left">2. Chỉnh Sửa Dự Án</Divider>
                        <Paragraph>
                            Nhấn vào dự án trong danh sách → Nhấn nút <Tag color="orange">Sửa</Tag> → Thay đổi thông tin
                            → Nhấn <Tag color="green">Cập nhật</Tag>.
                        </Paragraph>

                        <Divider orientation="left">3. Xóa Dự Án</Divider>
                        <Alert
                            message="⚠️ Cảnh báo"
                            description="Xóa dự án sẽ xóa tất cả nhiệm vụ, comments, attachments liên quan. Hành động này không thể hoàn tác!"
                            type="warning"
                            showIcon
                        />
                    </TabPane>

                    {/* Task Management Tab */}
                    <TabPane
                        tab={
                            <span>
                                <FileTextOutlined />
                                Quản Lý Nhiệm Vụ
                            </span>
                        }
                        key="task"
                    >
                        <Title level={3}>Quản Lý Nhiệm Vụ</Title>

                        <Collapse defaultActiveKey={['kanban']}>
                            <Panel header="📊 Kanban Board - Quản lý trực quan" key="kanban">
                                <Steps
                                    direction="vertical"
                                    current={-1}
                                    items={[
                                        {
                                            title: 'Truy cập Kanban Board',
                                            description: 'Vào chi tiết dự án → Tab "Nhiệm vụ" → Chọn view "Kanban"',
                                        },
                                        {
                                            title: 'Tạo Nhiệm Vụ Mới',
                                            description: (
                                                <div>
                                                    <Paragraph>Nhấn <Tag>+ Thêm</Tag> ở cột trạng thái tương ứng.</Paragraph>
                                                    <Paragraph>Hoặc nhấn nút <Tag color="blue">+ Tạo Nhiệm Vụ</Tag> ở góc trên.</Paragraph>
                                                </div>
                                            ),
                                        },
                                        {
                                            title: 'Kéo Thả Để Đổi Trạng Thái',
                                            description: (
                                                <Paragraph>
                                                    Kéo card nhiệm vụ từ cột này sang cột khác để thay đổi trạng thái.
                                                    Hệ thống tự động lưu vị trí và trạng thái mới.
                                                </Paragraph>
                                            ),
                                        },
                                        {
                                            title: 'Click Vào Card',
                                            description: 'Click vào card để mở drawer chi tiết nhiệm vụ.',
                                        },
                                    ]}
                                />

                                <Alert
                                    message="💡 Mẹo"
                                    description="Sử dụng màu sắc của thẻ để phân biệt độ ưu tiên: Đỏ (Urgent), Cam (High), Vàng (Medium), Xanh (Low)"
                                    type="info"
                                    showIcon
                                    style={{ marginTop: 16 }}
                                />
                            </Panel>

                            <Panel header="📋 Table View - Xem danh sách" key="table">
                                <Paragraph>
                                    <Text strong>Tính năng:</Text>
                                </Paragraph>
                                <List size="small">
                                    <List.Item>• Hiển thị tất cả nhiệm vụ dạng bảng</List.Item>
                                    <List.Item>• Tìm kiếm theo mã nhiệm vụ, tiêu đề</List.Item>
                                    <List.Item>• Lọc theo trạng thái, độ ưu tiên, người thực hiện</List.Item>
                                    <List.Item>• Sắp xếp theo ngày tạo, deadline, tiến độ</List.Item>
                                    <List.Item>• Phân trang (20 tasks/page)</List.Item>
                                </List>
                            </Panel>

                            <Panel header="📅 Gantt Chart - Timeline" key="gantt">
                                <Paragraph>
                                    Gantt Chart hiển thị timeline của tất cả nhiệm vụ:
                                </Paragraph>
                                <List size="small">
                                    <List.Item>• Trục thời gian từ ngày bắt đầu → ngày kết thúc</List.Item>
                                    <List.Item>• Mỗi task là một thanh ngang theo thời gian</List.Item>
                                    <List.Item>• Màu sắc theo độ ưu tiên</List.Item>
                                    <List.Item>• Hiển thị % tiến độ trên thanh</List.Item>
                                    <List.Item>• Xem dependencies giữa các task</List.Item>
                                </List>
                            </Panel>

                            <Panel header="✏️ Chi Tiết Nhiệm Vụ" key="detail">
                                <Paragraph>Khi click vào nhiệm vụ, drawer sẽ mở với các tab:</Paragraph>

                                <Card type="inner" size="small" title="Tab 1: Thông Tin" style={{ marginBottom: 8 }}>
                                    <List size="small">
                                        <List.Item>• Chỉnh sửa tiêu đề, mô tả</List.Item>
                                        <List.Item>• Đổi trạng thái, độ ưu tiên</List.Item>
                                        <List.Item>• Chọn người thực hiện</List.Item>
                                        <List.Item>• Cập nhật ngày bắt đầu/kết thúc</List.Item>
                                        <List.Item>• Điều chỉnh tiến độ (0-100%)</List.Item>
                                    </List>
                                </Card>

                                <Card type="inner" size="small" title="Tab 2: Checklist" style={{ marginBottom: 8 }}>
                                    <List size="small">
                                        <List.Item>• Thêm checklist items</List.Item>
                                        <List.Item>• Check/uncheck items</List.Item>
                                        <List.Item>• Xóa items</List.Item>
                                        <List.Item>• Hiển thị % hoàn thành checklist</List.Item>
                                    </List>
                                </Card>

                                <Card type="inner" size="small" title="Tab 3: Comments" style={{ marginBottom: 8 }}>
                                    <List size="small">
                                        <List.Item>• Viết comments</List.Item>
                                        <List.Item>• Reply comments (nested)</List.Item>
                                        <List.Item>• Xóa comment của mình</List.Item>
                                        <List.Item>• Hiển thị user & timestamp</List.Item>
                                    </List>
                                </Card>

                                <Card type="inner" size="small" title="Tab 4: Files" style={{ marginBottom: 8 }}>
                                    <List size="small">
                                        <List.Item>• Upload files (kéo thả hoặc chọn file)</List.Item>
                                        <List.Item>• Xem trước ảnh</List.Item>
                                        <List.Item>• Thêm mô tả cho file</List.Item>
                                        <List.Item>• Download file</List.Item>
                                        <List.Item>• Xóa file</List.Item>
                                    </List>
                                </Card>

                                <Card type="inner" size="small" title="Tab 5: Time Tracking">
                                    <Paragraph>Xem phần "Time Tracking" bên dưới</Paragraph>
                                </Card>
                            </Panel>
                        </Collapse>
                    </TabPane>

                    {/* Time Tracking Tab */}
                    <TabPane
                        tab={
                            <span>
                                <ClockCircleOutlined />
                                Time Tracking
                            </span>
                        }
                        key="time"
                    >
                        <Title level={3}>Time Tracking - Theo Dõi Thời Gian</Title>

                        <Alert
                            message="📌 Lưu ý"
                            description="Mỗi user chỉ có thể chạy 1 timer tại một thời điểm. Phải dừng timer hiện tại trước khi start timer mới."
                            type="info"
                            showIcon
                            style={{ marginBottom: 24 }}
                        />

                        <Divider orientation="left">Cách 1: Timer Tự Động</Divider>
                        <Steps
                            direction="vertical"
                            current={-1}
                            items={[
                                {
                                    title: 'Mở Task Detail',
                                    description: 'Click vào nhiệm vụ → Chọn tab "Time Tracking"',
                                },
                                {
                                    title: 'Bắt Đầu Timer',
                                    description: (
                                        <Paragraph>
                                            Nhấn nút <Tag color="green">▶ Bắt đầu</Tag>. Timer sẽ bắt đầu đếm và
                                            hiển thị thời gian real-time (cập nhật mỗi giây).
                                        </Paragraph>
                                    ),
                                },
                                {
                                    title: 'Làm Việc',
                                    description: (
                                        <Paragraph>
                                            Timer chạy ngầm, bạn có thể đóng drawer hoặc chuyển tab. Timer vẫn tiếp tục chạy.
                                            Icon ⏱️ màu xanh sẽ hiển thị bên cạnh task đang có timer chạy.
                                        </Paragraph>
                                    ),
                                },
                                {
                                    title: 'Dừng Timer',
                                    description: (
                                        <Paragraph>
                                            Nhấn nút <Tag color="red">⏹ Dừng</Tag> khi hoàn thành. Hệ thống tự động
                                            tính thời gian và lưu vào time log.
                                        </Paragraph>
                                    ),
                                },
                            ]}
                        />

                        <Divider orientation="left">Cách 2: Nhập Thủ Công</Divider>
                        <Steps
                            direction="vertical"
                            current={-1}
                            items={[
                                {
                                    title: 'Mở Form Nhập Thủ Công',
                                    description: (
                                        <Paragraph>
                                            Trong tab Time Tracking, nhấn nút <Tag color="blue">+ Thêm Log Thời Gian</Tag>
                                        </Paragraph>
                                    ),
                                },
                                {
                                    title: 'Chọn Thời Gian',
                                    description: (
                                        <div>
                                            <Paragraph>Điền thông tin:</Paragraph>
                                            <List size="small">
                                                <List.Item>• <Text strong>Bắt đầu:</Text> Chọn ngày giờ bắt đầu</List.Item>
                                                <List.Item>• <Text strong>Kết thúc:</Text> Chọn ngày giờ kết thúc</List.Item>
                                                <List.Item>• <Text strong>Mô tả:</Text> (Optional) Ghi chú về công việc</List.Item>
                                            </List>
                                        </div>
                                    ),
                                },
                                {
                                    title: 'Lưu Log',
                                    description: (
                                        <Paragraph>
                                            Nhấn <Tag color="green">Lưu</Tag>. Hệ thống kiểm tra thời gian kết thúc
                                            phải sau thời gian bắt đầu.
                                        </Paragraph>
                                    ),
                                },
                            ]}
                        />

                        <Divider orientation="left">Xem & Quản Lý Time Logs</Divider>
                        <Paragraph>
                            Danh sách time logs hiển thị:
                        </Paragraph>
                        <List size="small">
                            <List.Item>• Thời gian bắt đầu - kết thúc</List.Item>
                            <List.Item>• Tổng thời gian (format: Xh Ym)</List.Item>
                            <List.Item>• Người thực hiện</List.Item>
                            <List.Item>• Mô tả (nếu có)</List.Item>
                            <List.Item>• Nút xóa (chỉ xóa được log của mình)</List.Item>
                        </List>

                        <Alert
                            message="💡 Mẹo"
                            description="Timer đang chạy sẽ hiển thị thời gian real-time và nút Dừng màu đỏ. Các log đã hoàn thành chỉ hiển thị thông tin tĩnh."
                            type="success"
                            showIcon
                            style={{ marginTop: 16 }}
                        />
                    </TabPane>

                    {/* Dashboard Tab */}
                    <TabPane
                        tab={
                            <span>
                                <BarChartOutlined />
                                Dashboard
                            </span>
                        }
                        key="dashboard"
                    >
                        <Title level={3}>Dashboard & Báo Cáo</Title>

                        <Divider orientation="left">Dashboard Tổng Quan (All Projects)</Divider>
                        <Paragraph>
                            Trang chủ hiển thị thống kê của tất cả dự án:
                        </Paragraph>
                        <List>
                            <List.Item>
                                <Text strong>Tổng số dự án:</Text> Số lượng dự án trong hệ thống
                            </List.Item>
                            <List.Item>
                                <Text strong>Dự án đang hoạt động:</Text> Dự án có trạng thái In Progress
                            </List.Item>
                            <List.Item>
                                <Text strong>Dự án hoàn thành:</Text> Dự án có trạng thái Completed
                            </List.Item>
                            <List.Item>
                                <Text strong>Dự án trễ hạn:</Text> Dự án quá deadline nhưng chưa hoàn thành
                            </List.Item>
                        </List>

                        <Divider orientation="left">Dashboard Chi Tiết Dự Án</Divider>
                        <Paragraph>
                            Vào chi tiết dự án → Tab "Dashboard" để xem thống kê của 1 dự án:
                        </Paragraph>

                        <Card type="inner" size="small" title="📊 Overview Cards" style={{ marginBottom: 16 }}>
                            <List size="small">
                                <List.Item>• <Text strong>Tổng nhiệm vụ:</Text> Tổng số task trong dự án</List.Item>
                                <List.Item>• <Text strong>Hoàn thành:</Text> Số task đã done</List.Item>
                                <List.Item>• <Text strong>Đang làm:</Text> Số task in progress</List.Item>
                                <List.Item>• <Text strong>Chưa bắt đầu:</Text> Số task chưa làm</List.Item>
                                <List.Item>• <Text strong>Tỷ lệ hoàn thành:</Text> % (Hoàn thành / Tổng)</List.Item>
                                <List.Item>• <Text strong>Thời gian đã log:</Text> Tổng giờ làm việc</List.Item>
                                <List.Item>• <Text strong>Số thành viên:</Text> Số người trong team</List.Item>
                            </List>
                        </Card>

                        <Card type="inner" size="small" title="📈 Biểu Đồ Tròn: Tasks by Status" style={{ marginBottom: 16 }}>
                            <Paragraph>
                                Phân bổ nhiệm vụ theo trạng thái. Mỗi trạng thái có màu riêng theo cấu hình
                                trong database. Hover vào phần để xem số lượng và %.
                            </Paragraph>
                        </Card>

                        <Card type="inner" size="small" title="📊 Biểu Đồ Cột: Tasks by Priority" style={{ marginBottom: 16 }}>
                            <Paragraph>
                                Số lượng nhiệm vụ theo độ ưu tiên (Low, Medium, High, Urgent).
                                Màu cột tương ứng với màu của priority.
                            </Paragraph>
                        </Card>

                        <Card type="inner" size="small" title="⏱️ Biểu Đồ Cột: Time by Member" style={{ marginBottom: 16 }}>
                            <Paragraph>
                                Tổng thời gian làm việc của từng thành viên (tính theo giờ).
                                Giúp đánh giá workload và đóng góp của mỗi người.
                            </Paragraph>
                        </Card>

                        <Divider orientation="left">Lọc Theo Thời Gian</Divider>
                        <Paragraph>
                            Sử dụng <Text strong>Date Range Picker</Text> để lọc dữ liệu:
                        </Paragraph>
                        <Steps
                            direction="vertical"
                            size="small"
                            current={-1}
                            items={[
                                {
                                    title: 'Click vào Date Range Picker',
                                    description: 'Ở góc trên dashboard',
                                },
                                {
                                    title: 'Chọn khoảng thời gian',
                                    description: 'Click ngày bắt đầu, sau đó click ngày kết thúc',
                                },
                                {
                                    title: 'Apply',
                                    description: 'Dashboard tự động reload với dữ liệu trong khoảng thời gian đã chọn',
                                },
                                {
                                    title: 'Xóa filter',
                                    description: 'Click vào icon X trong date picker để xem tất cả dữ liệu',
                                },
                            ]}
                        />
                    </TabPane>

                    {/* Team Management Tab */}
                    <TabPane
                        tab={
                            <span>
                                <TeamOutlined />
                                Quản Lý Team
                            </span>
                        }
                        key="team"
                    >
                        <Title level={3}>Quản Lý Thành Viên</Title>

                        <Divider orientation="left">Thêm Thành Viên Vào Dự Án</Divider>
                        <Steps
                            direction="vertical"
                            current={-1}
                            items={[
                                {
                                    title: 'Vào Tab Thành Viên',
                                    description: 'Chi tiết dự án → Tab "Thành viên"',
                                },
                                {
                                    title: 'Nhấn Nút Thêm',
                                    description: <Paragraph>Nhấn <Tag color="blue">+ Thêm Thành Viên</Tag></Paragraph>,
                                },
                                {
                                    title: 'Chọn User & Vai Trò',
                                    description: (
                                        <div>
                                            <Paragraph>Điền thông tin:</Paragraph>
                                            <List size="small">
                                                <List.Item>• <Text strong>Chọn nhân viên:</Text> Dropdown tất cả users</List.Item>
                                                <List.Item>
                                                    • <Text strong>Vai trò:</Text>
                                                    <ul>
                                                        <li><Tag>Quản lý</Tag>: Toàn quyền quản lý dự án</li>
                                                        <li><Tag>Thành viên</Tag>: Tạo/sửa nhiệm vụ, log time</li>
                                                        <li><Tag>Xem</Tag>: Chỉ xem, không chỉnh sửa</li>
                                                    </ul>
                                                </List.Item>
                                                <List.Item>• <Text strong>Ngày tham gia:</Text> (Optional) Ngày join vào dự án</List.Item>
                                            </List>
                                        </div>
                                    ),
                                },
                                {
                                    title: 'Lưu',
                                    description: (
                                        <Paragraph>
                                            Nhấn <Tag color="green">Thêm</Tag>. Hệ thống kiểm tra member không bị trùng.
                                        </Paragraph>
                                    ),
                                },
                            ]}
                        />

                        <Divider orientation="left">Xóa Thành Viên</Divider>
                        <Paragraph>
                            Trong danh sách thành viên, nhấn icon <Tag color="red">🗑️</Tag> để xóa.
                        </Paragraph>
                        <Alert
                            message="⚠️ Lưu ý"
                            description="Xóa thành viên không xóa dữ liệu (tasks, comments, time logs) mà họ đã tạo."
                            type="warning"
                            showIcon
                        />

                        <Divider orientation="left">Phân Quyền</Divider>
                        <Card type="inner" title="Quyền của từng vai trò">
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Card size="small" type="inner" title={<Tag color="red">👑 Quản Lý</Tag>}>
                                    <List size="small">
                                        <List.Item>✅ Chỉnh sửa thông tin dự án</List.Item>
                                        <List.Item>✅ Thêm/xóa thành viên</List.Item>
                                        <List.Item>✅ Tạo/sửa/xóa nhiệm vụ</List.Item>
                                        <List.Item>✅ Xem dashboard & báo cáo</List.Item>
                                        <List.Item>✅ Upload/xóa files</List.Item>
                                        <List.Item>✅ Tất cả các quyền của Thành viên</List.Item>
                                    </List>
                                </Card>

                                <Card size="small" type="inner" title={<Tag color="blue">👤 Thành Viên</Tag>}>
                                    <List size="small">
                                        <List.Item>✅ Tạo nhiệm vụ mới</List.Item>
                                        <List.Item>✅ Sửa nhiệm vụ được assign cho mình</List.Item>
                                        <List.Item>✅ Comment, upload files</List.Item>
                                        <List.Item>✅ Start/stop timer</List.Item>
                                        <List.Item>✅ Xem dashboard</List.Item>
                                        <List.Item>❌ Không thể xóa dự án/thành viên</List.Item>
                                    </List>
                                </Card>

                                <Card size="small" type="inner" title={<Tag color="green">👁️ Xem</Tag>}>
                                    <List size="small">
                                        <List.Item>✅ Xem danh sách dự án, nhiệm vụ</List.Item>
                                        <List.Item>✅ Xem dashboard, báo cáo</List.Item>
                                        <List.Item>✅ Download files</List.Item>
                                        <List.Item>❌ Không tạo/sửa/xóa</List.Item>
                                        <List.Item>❌ Không comment, upload</List.Item>
                                    </List>
                                </Card>
                            </Space>
                        </Card>
                    </TabPane>
                </Tabs>

                <Divider />

                <Card type="inner" title="🆘 Hỗ Trợ & Liên Hệ">
                    <Paragraph>
                        Nếu gặp vấn đề hoặc cần hỗ trợ, vui lòng liên hệ:
                    </Paragraph>
                    <List size="small">
                        <List.Item>📧 Email: support@example.com</List.Item>
                        <List.Item>📞 Hotline: 1900-xxxx</List.Item>
                        <List.Item>💬 Chat: Sử dụng widget chat ở góc dưới phải</List.Item>
                    </List>
                </Card>
            </Card>
        </div>
    );
};

export default UserGuide;
