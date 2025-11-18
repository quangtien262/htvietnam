import React, { useState } from 'react';
import {
    Layout, Menu, Input, Card, Collapse, Typography, Space, Tag, Button, Row, Col,
    Tabs, Timeline, Steps, Alert, Divider, List, Avatar, Badge, Empty
} from 'antd';
import {
    BookOutlined, SearchOutlined, VideoCameraOutlined, QuestionCircleOutlined,
    RocketOutlined, UserOutlined, ShoppingCartOutlined, BellOutlined,
    TeamOutlined, GiftOutlined, BarChartOutlined, SettingOutlined,
    PlayCircleOutlined, FileTextOutlined, BulbOutlined, ThunderboltOutlined,
    CheckCircleOutlined, DollarOutlined, InfoCircleOutlined
} from '@ant-design/icons';

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Step } = Steps;

interface DocSection {
    key: string;
    title: string;
    icon: React.ReactNode;
    content: React.ReactNode;
}

const Documentation: React.FC = () => {
    const [selectedKey, setSelectedKey] = useState('getting-started');
    const [searchText, setSearchText] = useState('');
    const [collapsed, setCollapsed] = useState(false);

    // Documentation sections
    const sections: DocSection[] = [
        {
            key: 'getting-started',
            title: 'Bắt đầu',
            icon: <RocketOutlined />,
            content: (
                <div>
                    <Title level={2}>
                        <RocketOutlined /> Hướng dẫn bắt đầu
                    </Title>
                    <Paragraph>
                        Chào mừng bạn đến với hệ thống quản lý Spa! Hướng dẫn này sẽ giúp bạn làm quen với các tính năng chính.
                    </Paragraph>

                    <Alert
                        message="Lưu ý quan trọng"
                        description="Hãy đọc kỹ phần Bắt đầu trước khi sử dụng các tính năng khác để hiểu rõ luồng công việc."
                        type="info"
                        showIcon
                        icon={<InfoCircleOutlined />}
                        style={{ marginBottom: 24 }}
                    />

                    <Card title="Các bước thiết lập ban đầu" style={{ marginBottom: 24 }}>
                        <Steps direction="vertical" current={-1}>
                            <Step
                                title="Cấu hình hệ thống"
                                description="Vào Settings để thiết lập thông tin công ty, giờ làm việc, phương thức thanh toán"
                                icon={<SettingOutlined />}
                            />
                            <Step
                                title="Thêm chi nhánh & phòng"
                                description="Tạo danh sách chi nhánh và các phòng điều trị"
                                icon={<ShoppingCartOutlined />}
                            />
                            <Step
                                title="Thêm nhân viên"
                                description="Thêm thông tin nhân viên, thiết lập lịch làm việc và tỷ lệ hoa hồng"
                                icon={<TeamOutlined />}
                            />
                            <Step
                                title="Tạo dịch vụ & sản phẩm"
                                description="Xây dựng danh mục dịch vụ spa, sản phẩm và các liệu trình"
                                icon={<GiftOutlined />}
                            />
                            <Step
                                title="Thiết lập chương trình khách hàng thân thiết"
                                description="Cấu hình cấp độ thành viên, tích điểm, voucher"
                                icon={<UserOutlined />}
                            />
                            <Step
                                title="Bắt đầu sử dụng"
                                description="Tạo booking, sử dụng POS để bán hàng, theo dõi báo cáo"
                                icon={<CheckCircleOutlined />}
                            />
                        </Steps>
                    </Card>

                    <Card title="Video hướng dẫn" style={{ marginBottom: 24 }}>
                        <List
                            itemLayout="horizontal"
                            dataSource={[
                                { title: 'Giới thiệu tổng quan hệ thống', duration: '5:30' },
                                { title: 'Cách thiết lập cấu hình ban đầu', duration: '8:15' },
                                { title: 'Hướng dẫn sử dụng POS', duration: '12:00' },
                            ]}
                            renderItem={(item) => (
                                <List.Item
                                    actions={[
                                        <Button type="link" icon={<PlayCircleOutlined />}>
                                            Xem video
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<VideoCameraOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                                        title={item.title}
                                        description={`Thời lượng: ${item.duration}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </div>
            ),
        },
        {
            key: 'customer-booking',
            title: 'Khách hàng & Booking',
            icon: <UserOutlined />,
            content: (
                <div>
                    <Title level={2}>
                        <UserOutlined /> Quản lý Khách hàng & Booking
                    </Title>

                    <Collapse defaultActiveKey={['1']} style={{ marginBottom: 24 }}>
                        <Panel header="Tạo hồ sơ khách hàng mới" key="1">
                            <Paragraph>
                                <strong>Bước 1:</strong> Vào menu <Tag color="blue">Khách hàng → Hồ sơ khách hàng</Tag>
                            </Paragraph>
                            <Paragraph>
                                <strong>Bước 2:</strong> Click nút "Thêm khách hàng"
                            </Paragraph>
                            <Paragraph>
                                <strong>Bước 3:</strong> Điền thông tin cơ bản (Họ tên, SĐT, Email, Ngày sinh)
                            </Paragraph>
                            <Paragraph>
                                <strong>Bước 4:</strong> Thêm thông tin sức khỏe & da (tùy chọn nhưng khuyến nghị)
                            </Paragraph>
                            <Alert
                                message="Mẹo"
                                description="Sử dụng tính năng OCR để quét CCCD tự động điền thông tin khách hàng"
                                type="success"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </Panel>

                        <Panel header="Tạo booking cho khách hàng" key="2">
                            <Paragraph>
                                <strong>Bước 1:</strong> Vào <Tag color="green">Booking → Tạo booking mới</Tag>
                            </Paragraph>
                            <Paragraph>
                                <strong>Bước 2:</strong> Chọn khách hàng (hoặc tạo mới nếu chưa có)
                            </Paragraph>
                            <Paragraph>
                                <strong>Bước 3:</strong> Chọn dịch vụ/liệu trình cần đặt
                            </Paragraph>
                            <Paragraph>
                                <strong>Bước 4:</strong> Chọn ngày giờ & nhân viên phục vụ
                            </Paragraph>
                            <Paragraph>
                                <strong>Bước 5:</strong> Xác nhận thông tin và tạo booking
                            </Paragraph>
                            <Alert
                                message="Lưu ý"
                                description="Hệ thống sẽ tự động kiểm tra lịch trống của nhân viên và phòng"
                                type="info"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </Panel>

                        <Panel header="Phân tích RFM khách hàng" key="3">
                            <Paragraph>
                                <strong>RFM là gì?</strong> Recency (Gần đây), Frequency (Tần suất), Monetary (Giá trị)
                            </Paragraph>
                            <Paragraph>
                                Vào tab "Phân tích RFM" trong hồ sơ khách hàng để xem:
                            </Paragraph>
                            <ul>
                                <li>Lần cuối đến spa (Recency)</li>
                                <li>Số lần sử dụng dịch vụ (Frequency)</li>
                                <li>Tổng chi tiêu (Monetary)</li>
                                <li>Phân loại khách hàng: VIP, Trung thành, Tiềm năng, Cần chăm sóc</li>
                            </ul>
                        </Panel>
                    </Collapse>

                    <Card title="Video hướng dẫn">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button icon={<PlayCircleOutlined />} block>
                                Cách tạo và quản lý hồ sơ khách hàng (7:20)
                            </Button>
                            <Button icon={<PlayCircleOutlined />} block>
                                Hướng dẫn tạo booking và quản lý lịch hẹn (9:45)
                            </Button>
                        </Space>
                    </Card>
                </div>
            ),
        },
        {
            key: 'pos-system',
            title: 'Hệ thống POS',
            icon: <ShoppingCartOutlined />,
            content: (
                <div>
                    <Title level={2}>
                        <ShoppingCartOutlined /> Hướng dẫn sử dụng POS
                    </Title>

                    <Alert
                        message="POS là gì?"
                        description="Point of Sale - Điểm bán hàng. Dùng để tạo hóa đơn, tính tiền, thanh toán cho khách hàng."
                        type="info"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />

                    <Collapse defaultActiveKey={['1']} style={{ marginBottom: 24 }}>
                        <Panel header="Tạo hóa đơn bán hàng" key="1">
                            <Timeline>
                                <Timeline.Item color="blue">
                                    <strong>Chọn khách hàng:</strong> Click "Chọn khách hàng" để tìm hoặc tạo mới
                                </Timeline.Item>
                                <Timeline.Item color="blue">
                                    <strong>Thêm sản phẩm/dịch vụ:</strong> Click vào sản phẩm trong danh mục hoặc quét mã vạch
                                </Timeline.Item>
                                <Timeline.Item color="blue">
                                    <strong>Điều chỉnh số lượng:</strong> Sử dụng nút +/- trong giỏ hàng
                                </Timeline.Item>
                                <Timeline.Item color="blue">
                                    <strong>Chọn nhân viên phục vụ:</strong> Chỉ định nhân viên cho từng dịch vụ
                                </Timeline.Item>
                                <Timeline.Item color="green">
                                    <strong>Thanh toán:</strong> Click "Thanh toán" → Chọn phương thức → Hoàn tất
                                </Timeline.Item>
                            </Timeline>
                        </Panel>

                        <Panel header="Các phương thức thanh toán" key="2">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Card size="small" title="Tiền mặt">
                                        <Paragraph>
                                            - Nhập số tiền khách đưa<br/>
                                            - Hệ thống tự tính tiền thừa<br/>
                                            - In hóa đơn
                                        </Paragraph>
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card size="small" title="Chuyển khoản">
                                        <Paragraph>
                                            - Quét QR code<br/>
                                            - Nhập mã giao dịch<br/>
                                            - Xác nhận thanh toán
                                        </Paragraph>
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card size="small" title="Thẻ">
                                        <Paragraph>
                                            - Quẹt thẻ qua máy POS<br/>
                                            - Nhập mã xác thực<br/>
                                            - In biên lai
                                        </Paragraph>
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card size="small" title="Kết hợp">
                                        <Paragraph>
                                            - Thanh toán nhiều phương thức<br/>
                                            - VD: 50% tiền mặt + 50% thẻ<br/>
                                            - Linh hoạt theo nhu cầu
                                        </Paragraph>
                                    </Card>
                                </Col>
                            </Row>
                        </Panel>

                        <Panel header="Sử dụng Voucher & Giảm giá" key="3">
                            <Paragraph>
                                <strong>Áp dụng voucher:</strong>
                            </Paragraph>
                            <ol>
                                <li>Nhập mã voucher vào ô "Mã giảm giá"</li>
                                <li>Hệ thống tự động kiểm tra tính hợp lệ</li>
                                <li>Giảm giá được áp dụng ngay vào tổng tiền</li>
                            </ol>
                            <Alert
                                message="Lưu ý"
                                description="Một số voucher có điều kiện áp dụng (đơn tối thiểu, dịch vụ cụ thể...)"
                                type="warning"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </Panel>

                        <Panel header="Hold & Recall hóa đơn" key="4">
                            <Paragraph>
                                <strong>Hold (Giữ hóa đơn):</strong> Khi cần tạm dừng để phục vụ khách khác
                            </Paragraph>
                            <Paragraph>
                                <strong>Recall (Gọi lại):</strong> Lấy lại hóa đơn đã giữ để tiếp tục xử lý
                            </Paragraph>
                            <Paragraph>
                                Hữu ích khi: Khách hàng cần thêm thời gian suy nghĩ, đợi người khác thanh toán...
                            </Paragraph>
                        </Panel>
                    </Collapse>

                    <Card title="Phím tắt hữu ích" style={{ marginBottom: 24 }}>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Tag color="blue">F1</Tag> Chọn khách hàng
                            </Col>
                            <Col span={12}>
                                <Tag color="blue">F2</Tag> Quét barcode
                            </Col>
                            <Col span={12}>
                                <Tag color="blue">F3</Tag> Hold hóa đơn
                            </Col>
                            <Col span={12}>
                                <Tag color="blue">F4</Tag> Recall hóa đơn
                            </Col>
                            <Col span={12}>
                                <Tag color="green">F9</Tag> Thanh toán
                            </Col>
                            <Col span={12}>
                                <Tag color="red">ESC</Tag> Hủy hóa đơn
                            </Col>
                        </Row>
                    </Card>

                    <Card title="Video demo">
                        <Button icon={<PlayCircleOutlined />} type="primary" size="large" block>
                            Xem hướng dẫn chi tiết sử dụng POS (15:30)
                        </Button>
                    </Card>
                </div>
            ),
        },
        {
            key: 'services-products',
            title: 'Dịch vụ & Sản phẩm',
            icon: <GiftOutlined />,
            content: (
                <div>
                    <Title level={2}>
                        <GiftOutlined /> Quản lý Dịch vụ & Sản phẩm
                    </Title>

                    <Tabs
                        items={[
                            {
                                key: '1',
                                label: 'Dịch vụ',
                                children: (
                                    <div>
                                        <Paragraph>
                                            <strong>Tạo dịch vụ mới:</strong>
                                        </Paragraph>
                                        <ol>
                                            <li>Vào <Tag>Dịch vụ → Danh sách dịch vụ</Tag></li>
                                            <li>Click "Thêm dịch vụ"</li>
                                            <li>Điền thông tin: Tên, Mô tả, Giá, Thời gian thực hiện</li>
                                            <li>Chọn danh mục (Chăm sóc da, Massage, Nail...)</li>
                                            <li>Upload hình ảnh minh họa</li>
                                            <li>Thiết lập hoa hồng cho nhân viên</li>
                                        </ol>

                                        <Alert
                                            message="Mẹo"
                                            description="Thêm mô tả chi tiết và hình ảnh đẹp để khách hàng dễ hiểu và quyết định"
                                            type="success"
                                            showIcon
                                            style={{ marginTop: 16 }}
                                        />
                                    </div>
                                ),
                            },
                            {
                                key: '2',
                                label: 'Sản phẩm',
                                children: (
                                    <div>
                                        <Paragraph>
                                            <strong>Quản lý tồn kho:</strong>
                                        </Paragraph>
                                        <ul>
                                            <li>Nhập hàng: Cập nhật số lượng khi nhập về</li>
                                            <li>Theo dõi tồn kho realtime</li>
                                            <li>Cảnh báo khi sắp hết hàng</li>
                                            <li>Báo cáo xuất nhập tồn</li>
                                        </ul>

                                        <Card title="Barcode & Mã SKU" size="small" style={{ marginTop: 16 }}>
                                            <Paragraph>
                                                - Mỗi sản phẩm nên có mã SKU riêng<br/>
                                                - In barcode để quét nhanh khi bán<br/>
                                                - Tích hợp máy quét barcode với POS
                                            </Paragraph>
                                        </Card>
                                    </div>
                                ),
                            },
                            {
                                key: '3',
                                label: 'Liệu trình',
                                children: (
                                    <div>
                                        <Paragraph>
                                            <strong>Tạo gói liệu trình:</strong>
                                        </Paragraph>
                                        <ol>
                                            <li>Chọn nhiều dịch vụ kết hợp</li>
                                            <li>Đặt giá ưu đãi cho gói (thấp hơn mua lẻ)</li>
                                            <li>Thiết lập số buổi/tháng</li>
                                            <li>Hạn sử dụng (VD: 3 tháng)</li>
                                        </ol>

                                        <Alert
                                            message="Ví dụ"
                                            description="Gói Chăm sóc da 10 buổi: 5 buổi Facial + 3 buổi Massage + 2 buổi Trị liệu. Giá ưu đãi 5.000.000đ thay vì 6.500.000đ khi mua lẻ."
                                            type="info"
                                            showIcon
                                            style={{ marginTop: 16 }}
                                        />
                                    </div>
                                ),
                            },
                        ]}
                    />
                </div>
            ),
        },
        {
            key: 'staff',
            title: 'Nhân viên',
            icon: <TeamOutlined />,
            content: (
                <div>
                    <Title level={2}>
                        <TeamOutlined /> Quản lý Nhân viên
                    </Title>

                    <Collapse defaultActiveKey={['1']}>
                        <Panel header="Thêm nhân viên mới" key="1">
                            <Steps direction="vertical" size="small" current={-1}>
                                <Step title="Thông tin cơ bản" description="Họ tên, SĐT, Email, Ngày sinh, Địa chỉ" />
                                <Step title="Chức vụ & Trình độ" description="KTV, Chuyên viên, Trưởng nhóm..." />
                                <Step title="Tỷ lệ hoa hồng" description="% hoặc số tiền cố định cho từng dịch vụ" />
                                <Step title="Lịch làm việc" description="Ca sáng/chiều/tối, ngày nghỉ trong tuần" />
                                <Step title="Upload ảnh" description="Ảnh đại diện để khách hàng nhận biết" />
                            </Steps>
                        </Panel>

                        <Panel header="Quản lý lịch làm việc" key="2">
                            <Paragraph>
                                <strong>Xem lịch:</strong> Calendar view hiển thị lịch tất cả nhân viên
                            </Paragraph>
                            <Paragraph>
                                <strong>Phân ca:</strong>
                            </Paragraph>
                            <ul>
                                <li><Tag color="orange">Sáng</Tag> 8:00 - 12:00</li>
                                <li><Tag color="blue">Chiều</Tag> 13:00 - 17:00</li>
                                <li><Tag color="purple">Tối</Tag> 17:00 - 21:00</li>
                                <li><Tag color="green">Full</Tag> 8:00 - 21:00</li>
                            </ul>
                            <Alert
                                message="Lưu ý"
                                description="Hệ thống chỉ cho phép booking nhân viên khi họ đang trong ca làm việc"
                                type="info"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </Panel>

                        <Panel header="Báo cáo hoa hồng" key="3">
                            <Paragraph>
                                Xem chi tiết:
                            </Paragraph>
                            <ul>
                                <li>Doanh thu từng nhân viên tạo ra</li>
                                <li>Hoa hồng được hưởng (đã trả/chưa trả)</li>
                                <li>Số lượng khách phục vụ</li>
                                <li>Đánh giá trung bình từ khách hàng</li>
                            </ul>
                            <Paragraph>
                                <strong>Xuất báo cáo:</strong> Excel/PDF theo tháng để tính lương
                            </Paragraph>
                        </Panel>
                    </Collapse>
                </div>
            ),
        },
        {
            key: 'loyalty',
            title: 'Chương trình khách hàng thân thiết',
            icon: <GiftOutlined />,
            content: (
                <div>
                    <Title level={2}>
                        <GiftOutlined /> Khách hàng thân thiết
                    </Title>

                    <Tabs
                        items={[
                            {
                                key: '1',
                                label: 'Cấp độ thành viên',
                                children: (
                                    <div>
                                        <Paragraph>
                                            Thiết lập các cấp độ dựa trên chi tiêu tích lũy:
                                        </Paragraph>
                                        <List
                                            dataSource={[
                                                { tier: 'Đồng', spending: '0 - 5tr', discount: '5%', points: '1x' },
                                                { tier: 'Bạc', spending: '5tr - 20tr', discount: '10%', points: '1.5x' },
                                                { tier: 'Vàng', spending: '20tr - 50tr', discount: '15%', points: '2x' },
                                                { tier: 'Kim cương', spending: '>50tr', discount: '20%', points: '3x' },
                                            ]}
                                            renderItem={(item) => (
                                                <List.Item>
                                                    <List.Item.Meta
                                                        title={<Tag color="blue">{item.tier}</Tag>}
                                                        description={
                                                            <Space split="|">
                                                                <span>Chi tiêu: {item.spending}</span>
                                                                <span>Giảm giá: {item.discount}</span>
                                                                <span>Điểm: {item.points}</span>
                                                            </Space>
                                                        }
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                ),
                            },
                            {
                                key: '2',
                                label: 'Tích điểm',
                                children: (
                                    <div>
                                        <Card title="Quy tắc tích điểm" size="small" style={{ marginBottom: 16 }}>
                                            <Paragraph>
                                                - Mỗi 10.000đ chi tiêu = 1 điểm<br/>
                                                - Điểm nhân lên theo cấp độ thành viên<br/>
                                                - Điểm thưởng sinh nhật: 50 điểm<br/>
                                                - Điểm check-in: 5 điểm/lần
                                            </Paragraph>
                                        </Card>

                                        <Card title="Quy đổi điểm" size="small">
                                            <Paragraph>
                                                - 1 điểm = 1.000đ<br/>
                                                - Tối thiểu đổi: 100 điểm<br/>
                                                - Hạn sử dụng: 12 tháng
                                            </Paragraph>
                                        </Card>
                                    </div>
                                ),
                            },
                            {
                                key: '3',
                                label: 'Voucher',
                                children: (
                                    <div>
                                        <Paragraph>
                                            <strong>Tạo voucher giảm giá:</strong>
                                        </Paragraph>
                                        <ol>
                                            <li>Đặt mã voucher (VD: SUMMER2024)</li>
                                            <li>Chọn loại giảm: % hoặc số tiền</li>
                                            <li>Giới hạn số lượng & thời gian</li>
                                            <li>Điều kiện áp dụng (đơn tối thiểu...)</li>
                                        </ol>

                                        <Alert
                                            message="Ví dụ"
                                            description="Voucher WELCOME20: Giảm 20% tối đa 200.000đ cho khách hàng mới, áp dụng cho đơn từ 500.000đ, số lượng 100 mã, hết hạn 31/12/2024"
                                            type="success"
                                            showIcon
                                            style={{ marginTop: 16 }}
                                        />
                                    </div>
                                ),
                            },
                        ]}
                    />
                </div>
            ),
        },
        {
            key: 'marketing',
            title: 'Marketing',
            icon: <BellOutlined />,
            content: (
                <div>
                    <Title level={2}>
                        <BellOutlined /> Chiến dịch Marketing
                    </Title>

                    <Collapse defaultActiveKey={['1']}>
                        <Panel header="Tạo chiến dịch Email/SMS/Zalo" key="1">
                            <Steps direction="vertical" current={-1}>
                                <Step
                                    title="Chọn kênh gửi"
                                    description="Email, SMS, Zalo hoặc Đa kênh"
                                />
                                <Step
                                    title="Chọn đối tượng"
                                    description="Tất cả, Khách mới, Khách quen, Theo cấp độ, Tùy chọn"
                                />
                                <Step
                                    title="Soạn nội dung"
                                    description="Tiêu đề, nội dung tin nhắn (tối đa 500 ký tự cho SMS)"
                                />
                                <Step
                                    title="Lên lịch gửi"
                                    description="Gửi ngay hoặc đặt lịch gửi tự động"
                                />
                                <Step
                                    title="Theo dõi kết quả"
                                    description="Số lượng gửi, đã xem, đã click, doanh thu tạo ra"
                                />
                            </Steps>
                        </Panel>

                        <Panel header="Mẫu tin nhắn Marketing" key="2">
                            <Card title="Khuyến mãi" size="small" style={{ marginBottom: 16 }}>
                                <Paragraph>
                                    🎉 [Tên Spa] ưu đãi đặc biệt! Giảm 30% tất cả dịch vụ Facial từ 15-20/11.
                                    Đặt lịch ngay: 0123456789. Số lượng có hạn!
                                </Paragraph>
                            </Card>

                            <Card title="Sinh nhật" size="small" style={{ marginBottom: 16 }}>
                                <Paragraph>
                                    🎂 Chúc mừng sinh nhật [Tên KH]! [Tên Spa] tặng bạn voucher 200K + 50 điểm thưởng.
                                    Sử dụng trong tháng này nhé! ❤️
                                </Paragraph>
                            </Card>

                            <Card title="Nhắc lịch hẹn" size="small">
                                <Paragraph>
                                    ⏰ Nhắc lịch hẹn: Ngày mai 14:00, [Tên KH] có lịch [Tên dịch vụ] tại [Tên Spa].
                                    KTV: [Tên NV]. Hotline: 0123456789.
                                </Paragraph>
                            </Card>
                        </Panel>
                    </Collapse>
                </div>
            ),
        },
        {
            key: 'analytics',
            title: 'Báo cáo & Phân tích',
            icon: <BarChartOutlined />,
            content: (
                <div>
                    <Title level={2}>
                        <BarChartOutlined /> Báo cáo & Phân tích
                    </Title>

                    <Tabs
                        items={[
                            {
                                key: '1',
                                label: 'Dashboard',
                                children: (
                                    <div>
                                        <Paragraph>
                                            <strong>Analytics Dashboard</strong> hiển thị tổng quan:
                                        </Paragraph>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Card size="small" title="📊 Biểu đồ doanh thu">
                                                    - Line chart theo ngày/tuần/tháng<br/>
                                                    - So sánh với kỳ trước<br/>
                                                    - Dự đoán xu hướng
                                                </Card>
                                            </Col>
                                            <Col span={12}>
                                                <Card size="small" title="🥧 Doanh thu theo danh mục">
                                                    - Pie chart phân bổ doanh thu<br/>
                                                    - Dịch vụ nào bán chạy nhất<br/>
                                                    - Tỷ lệ % từng loại
                                                </Card>
                                            </Col>
                                            <Col span={12}>
                                                <Card size="small" title="👥 Hiệu suất nhân viên">
                                                    - Ranking theo doanh thu<br/>
                                                    - Số khách phục vụ<br/>
                                                    - Đánh giá trung bình
                                                </Card>
                                            </Col>
                                            <Col span={12}>
                                                <Card size="small" title="⏰ Phân bố theo giờ">
                                                    - Giờ nào đông khách nhất<br/>
                                                    - Tối ưu phân ca nhân viên<br/>
                                                    - Doanh thu theo khung giờ
                                                </Card>
                                            </Col>
                                        </Row>
                                    </div>
                                ),
                            },
                            {
                                key: '2',
                                label: 'Báo cáo',
                                children: (
                                    <div>
                                        <Paragraph>
                                            <strong>4 loại báo cáo chính:</strong>
                                        </Paragraph>
                                        <List>
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={<Avatar icon={<DollarOutlined />} style={{ backgroundColor: '#f5222d' }} />}
                                                    title="Báo cáo doanh thu"
                                                    description="Tổng quan doanh thu theo ngày/tuần/tháng, chi tiết từng nguồn"
                                                />
                                            </List.Item>
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={<Avatar icon={<FileTextOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                                                    title="Chi tiết giao dịch"
                                                    description="Danh sách tất cả hóa đơn, khách hàng, dịch vụ đã bán"
                                                />
                                            </List.Item>
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={<Avatar icon={<TeamOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                                                    title="Báo cáo nhân viên"
                                                    description="Doanh thu, hoa hồng, hiệu suất từng nhân viên"
                                                />
                                            </List.Item>
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={<Avatar icon={<GiftOutlined />} style={{ backgroundColor: '#faad14' }} />}
                                                    title="Báo cáo tồn kho"
                                                    description="Nhập/xuất/tồn sản phẩm, giá trị tồn kho"
                                                />
                                            </List.Item>
                                        </List>

                                        <Alert
                                            message="Xuất báo cáo"
                                            description="Tất cả báo cáo đều có thể xuất ra file Excel hoặc PDF, kèm biểu đồ nếu cần"
                                            type="success"
                                            showIcon
                                            style={{ marginTop: 16 }}
                                        />
                                    </div>
                                ),
                            },
                        ]}
                    />
                </div>
            ),
        },
        {
            key: 'settings',
            title: 'Cài đặt',
            icon: <SettingOutlined />,
            content: (
                <div>
                    <Title level={2}>
                        <SettingOutlined /> Cài đặt hệ thống
                    </Title>

                    <Collapse defaultActiveKey={['1']}>
                        <Panel header="Cài đặt chung" key="1">
                            <Paragraph>
                                - Tên công ty, logo, slogan<br/>
                                - Địa chỉ, số điện thoại, email, website<br/>
                                - Múi giờ, ngôn ngữ
                            </Paragraph>
                        </Panel>

                        <Panel header="Quy tắc kinh doanh" key="2">
                            <Paragraph>
                                <strong>Giờ hoạt động:</strong> Mở cửa - Đóng cửa
                            </Paragraph>
                            <Paragraph>
                                <strong>Booking:</strong>
                            </Paragraph>
                            <ul>
                                <li>Thời gian mỗi slot (15/30/60 phút)</li>
                                <li>Thời gian nghỉ giữa slot</li>
                                <li>Cho phép booking online</li>
                                <li>Thời gian được hủy booking</li>
                                <li>Phí hủy booking</li>
                            </ul>
                        </Panel>

                        <Panel header="Thanh toán" key="3">
                            <Paragraph>
                                - Phương thức: Tiền mặt, Chuyển khoản, Thẻ, Ví điện tử<br/>
                                - Yêu cầu đặt cọc & tỷ lệ đặt cọc<br/>
                                - Cho phép trả góp<br/>
                                - Số ngày công nợ tối đa
                            </Paragraph>
                        </Panel>

                        <Panel header="Thông báo" key="4">
                            <Paragraph>
                                <strong>Email:</strong>
                            </Paragraph>
                            <ul>
                                <li>Gửi email khi có booking mới</li>
                                <li>Email sinh nhật khách hàng</li>
                            </ul>
                            <Paragraph>
                                <strong>SMS:</strong>
                            </Paragraph>
                            <ul>
                                <li>SMS nhắc lịch (2 giờ trước)</li>
                                <li>SMS khuyến mãi</li>
                            </ul>
                        </Panel>

                        <Panel header="Điểm thưởng" key="5">
                            <Paragraph>
                                - Bật/tắt tính năng tích điểm<br/>
                                - Tỷ lệ tích điểm (10.000đ = 1 điểm)<br/>
                                - Tỷ lệ đổi điểm (1 điểm = 1.000đ)<br/>
                                - Hạn sử dụng điểm (12 tháng)<br/>
                                - Điểm tặng sinh nhật (50 điểm)
                            </Paragraph>
                        </Panel>
                    </Collapse>
                </div>
            ),
        },
        {
            key: 'faq',
            title: 'FAQ - Câu hỏi thường gặp',
            icon: <QuestionCircleOutlined />,
            content: (
                <div>
                    <Title level={2}>
                        <QuestionCircleOutlined /> Câu hỏi thường gặp
                    </Title>

                    <Collapse>
                        <Panel header="❓ Làm sao để khôi phục hóa đơn đã xóa?" key="1">
                            <Paragraph>
                                Hệ thống không cho phép xóa hóa đơn đã thanh toán. Chỉ có thể hủy hóa đơn và ghi chú lý do.
                                Dữ liệu vẫn được lưu trong báo cáo để đối chiếu.
                            </Paragraph>
                        </Panel>

                        <Panel header="❓ Tại sao không thể tạo booking cho nhân viên?" key="2">
                            <Paragraph>
                                Kiểm tra:
                            </Paragraph>
                            <ul>
                                <li>Nhân viên có đang trong ca làm việc không?</li>
                                <li>Khung giờ đó đã có booking khác chưa?</li>
                                <li>Phòng còn trống không?</li>
                            </ul>
                        </Panel>

                        <Panel header="❓ Cách thay đổi giá dịch vụ cho từng khách hàng VIP?" key="3">
                            <Paragraph>
                                Có 2 cách:
                            </Paragraph>
                            <ol>
                                <li>Thiết lập giảm giá tự động theo cấp độ thành viên</li>
                                <li>Tạo voucher riêng cho khách VIP</li>
                            </ol>
                        </Panel>

                        <Panel header="❓ Xuất báo cáo cho nhiều chi nhánh cùng lúc?" key="4">
                            <Paragraph>
                                Có. Trong màn hình báo cáo, bỏ chọn chi nhánh (để trống) sẽ hiển thị dữ liệu tất cả chi nhánh.
                                Xuất Excel sẽ có sheet riêng cho từng chi nhánh.
                            </Paragraph>
                        </Panel>

                        <Panel header="❓ Khách hàng quên mã voucher, tìm lại như thế nào?" key="5">
                            <Paragraph>
                                Vào <Tag>Khách hàng → Hồ sơ</Tag>, tìm khách hàng, xem tab "Voucher".
                                Hệ thống hiển thị tất cả voucher khách đang có (cả đã dùng và chưa dùng).
                            </Paragraph>
                        </Panel>

                        <Panel header="❓ Backup dữ liệu định kỳ?" key="6">
                            <Paragraph>
                                Hệ thống tự động backup mỗi ngày lúc 2h sáng. Dữ liệu lưu trữ 30 ngày gần nhất.
                                Admin có thể download backup thủ công tại <Tag>Cài đặt → Sao lưu & Khôi phục</Tag>.
                            </Paragraph>
                        </Panel>

                        <Panel header="❓ Thay đổi logo và màu sắc giao diện?" key="7">
                            <Paragraph>
                                Vào <Tag>Cài đặt → Cài đặt chung</Tag>:
                            </Paragraph>
                            <ul>
                                <li>Upload logo mới (khuyến nghị PNG, nền trong suốt)</li>
                                <li>Chọn màu chủ đạo (primary color)</li>
                                <li>Lưu và refresh trang</li>
                            </ul>
                        </Panel>

                        <Panel header="❓ Nhập kho hàng loạt bị lỗi, làm sao khắc phục?" key="8">
                            <Paragraph>
                                <strong>Kiểm tra các lỗi thường gặp:</strong>
                            </Paragraph>
                            <ul>
                                <li><strong>File sai định dạng:</strong> Đảm bảo file là .xlsx hoặc .xls, không phải .csv</li>
                                <li><strong>Mã sản phẩm không tồn tại:</strong> Kiểm tra SKU trong hệ thống trước khi nhập</li>
                                <li><strong>Số lượng hoặc giá sai:</strong> Phải là số dương, không để trống</li>
                                <li><strong>Nhà cung cấp không hợp lệ:</strong> Tạo nhà cung cấp trước hoặc để trống</li>
                            </ul>
                            <Alert
                                message="Mẹo"
                                description="Download file mẫu từ hệ thống và điền theo đúng cấu trúc để tránh lỗi."
                                type="success"
                                showIcon
                                style={{ marginTop: 8 }}
                            />
                        </Panel>

                        <Panel header="❓ Tại sao không thể chuyển kho cho sản phẩm?" key="9">
                            <Paragraph>
                                <strong>Nguyên nhân thường gặp:</strong>
                            </Paragraph>
                            <ul>
                                <li>Chi nhánh xuất không có đủ tồn kho</li>
                                <li>Số lượng chuyển vượt quá số lượng hiện có</li>
                                <li>Sản phẩm đã bị khóa hoặc ngừng kinh doanh</li>
                                <li>Chưa chọn chi nhánh nhận hoặc trùng với chi nhánh xuất</li>
                            </ul>
                        </Panel>

                        <Panel header="❓ Lịch sử giao dịch không hiển thị đầy đủ thông tin?" key="10">
                            <Paragraph>
                                <strong>Kiểm tra:</strong>
                            </Paragraph>
                            <ul>
                                <li>Refresh trang để cập nhật dữ liệu mới nhất</li>
                                <li>Kiểm tra phiếu nhập có đầy đủ thông tin nhà cung cấp, người nhập</li>
                                <li>Với phiếu cũ chưa có giá, cần cập nhật lại giá trong chi tiết phiếu</li>
                            </ul>
                            <Paragraph>
                                Lịch sử giao dịch hiển thị tất cả các loại: Nhập kho, Xuất bán, Chuyển kho, Kiểm kê, Trả hàng, Hủy hàng.
                            </Paragraph>
                        </Panel>

                        <Panel header="❓ Trả hàng nhập bị lỗi validation?" key="11">
                            <Paragraph>
                                <strong>Các trường bắt buộc khi trả hàng:</strong>
                            </Paragraph>
                            <ul>
                                <li><strong>Chi nhánh:</strong> Tự động lấy từ phiếu nhập gốc, không cần điền thủ công</li>
                                <li><strong>Lý do trả hàng:</strong> Bắt buộc nhập (hàng lỗi, sai quy cách, đổi mã...)</li>
                                <li><strong>Chi tiết sản phẩm:</strong> Phải chọn ít nhất 1 sản phẩm với số lượng {'>'} 0</li>
                                <li><strong>Giá:</strong> Tự động lấy từ phiếu nhập gốc</li>
                            </ul>
                            <Alert
                                message="Lưu ý"
                                description="Số lượng trả không được vượt quá số lượng đã nhập từ phiếu gốc."
                                type="warning"
                                showIcon
                                style={{ marginTop: 8 }}
                            />
                        </Panel>

                        <Panel header="❓ Kiểm kê kho: Khi nào nên điều chỉnh tồn kho?" key="12">
                            <Paragraph>
                                <strong>Chỉ điều chỉnh khi:</strong>
                            </Paragraph>
                            <ul>
                                <li>Có chênh lệch thực tế so với hệ thống</li>
                                <li>Đã kiểm tra kỹ và xác nhận số liệu đúng</li>
                                <li>Có giải trình rõ ràng về nguyên nhân chênh lệch</li>
                            </ul>
                            <Alert
                                message="Cảnh báo"
                                description="Sau khi xác nhận phiếu kiểm kê, tồn kho sẽ thay đổi ngay lập tức. Không thể hoàn tác!"
                                type="error"
                                showIcon
                                style={{ marginTop: 8 }}
                            />
                        </Panel>
                    </Collapse>
                </div>
            ),
        },
        {
            key: 'inventory',
            title: 'Quản lý Kho',
            icon: <ShoppingCartOutlined />,
            content: (
                <div>
                    <Title level={2}>
                        <ShoppingCartOutlined /> Quản lý Kho hàng
                    </Title>

                    <Alert
                        message="Module Quản lý Kho"
                        description="Hệ thống quản lý kho đầy đủ với theo dõi nhập/xuất/tồn, chuyển kho, kiểm kê, và trả hàng nhập."
                        type="info"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />

                    <Collapse defaultActiveKey={['1']} style={{ marginBottom: 24 }}>
                        <Panel header="📦 Nhập kho hàng loạt (Bulk Import)" key="1">
                            <Paragraph>
                                <strong>Tính năng:</strong> Nhập nhiều sản phẩm cùng lúc qua file Excel
                            </Paragraph>
                            <Paragraph>
                                <strong>Bước 1:</strong> Vào <Tag color="blue">Kho → Nhập kho hàng loạt</Tag>
                            </Paragraph>
                            <Paragraph>
                                <strong>Bước 2:</strong> Download file Excel mẫu
                            </Paragraph>
                            <Paragraph>
                                <strong>Bước 3:</strong> Điền thông tin:
                            </Paragraph>
                            <ul>
                                <li>Mã sản phẩm (SKU)</li>
                                <li>Tên sản phẩm</li>
                                <li>Số lượng nhập</li>
                                <li>Đơn giá</li>
                                <li>Nhà cung cấp (tùy chọn)</li>
                            </ul>
                            <Paragraph>
                                <strong>Bước 4:</strong> Upload file và nhấn "Nhập kho"
                            </Paragraph>
                            <Alert
                                message="Tính năng mới"
                                description="Hệ thống tự động tạo phiếu nhập kho và cập nhật tồn kho cho tất cả chi nhánh. Mỗi dòng trong file sẽ được tạo thành chi tiết phiếu nhập với đầy đủ thông tin giá và thành tiền."
                                type="success"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </Panel>

                        <Panel header="🔄 Chuyển kho giữa chi nhánh" key="2">
                            <Paragraph>
                                <strong>Chuyển sản phẩm từ chi nhánh này sang chi nhánh khác:</strong>
                            </Paragraph>
                            <Steps direction="vertical" size="small" current={-1}>
                                <Step title="Chọn chi nhánh xuất" description="Chi nhánh đang có hàng" />
                                <Step title="Chọn chi nhánh nhận" description="Chi nhánh cần nhập hàng" />
                                <Step title="Chọn sản phẩm" description="Chọn từ danh sách tồn kho chi nhánh xuất" />
                                <Step title="Nhập số lượng chuyển" description="Không vượt quá tồn kho hiện tại" />
                                <Step title="Ghi chú lý do" description="Mô tả mục đích chuyển kho" />
                                <Step title="Xác nhận" description="Hệ thống tự động trừ kho chi nhánh xuất, cộng kho chi nhánh nhận" />
                            </Steps>
                            <Alert
                                message="Lưu ý"
                                description="Hệ thống kiểm tra số lượng tồn kho thực tế, không cho phép chuyển vượt quá số lượng hiện có."
                                type="warning"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </Panel>

                        <Panel header="📊 Kiểm kê kho" key="3">
                            <Paragraph>
                                <strong>Kiểm tra và đối chiếu tồn kho thực tế:</strong>
                            </Paragraph>
                            <Paragraph>
                                <strong>Các loại kiểm kê:</strong>
                            </Paragraph>
                            <ul>
                                <li><Tag color="blue">Kiểm kê định kỳ</Tag> - Theo lịch hàng tháng/quý</li>
                                <li><Tag color="orange">Kiểm kê đột xuất</Tag> - Khi phát hiện sai lệch</li>
                                <li><Tag color="green">Kiểm kê cuối kỳ</Tag> - Cuối năm tài chính</li>
                            </ul>
                            <Paragraph>
                                <strong>Quy trình:</strong>
                            </Paragraph>
                            <ol>
                                <li>Tạo phiếu kiểm kê, chọn chi nhánh và loại kiểm kê</li>
                                <li>Chọn danh sách sản phẩm cần kiểm</li>
                                <li>Nhập số lượng thực tế đếm được</li>
                                <li>Hệ thống tự động tính chênh lệch (thực tế - hệ thống)</li>
                                <li>Ghi chú nguyên nhân nếu có chênh lệch</li>
                                <li>Xác nhận để cập nhật số liệu vào hệ thống</li>
                            </ol>
                            <Alert
                                message="Quan trọng"
                                description="Sau khi xác nhận phiếu kiểm kê, số lượng tồn kho trong hệ thống sẽ được điều chỉnh theo số thực tế."
                                type="error"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </Panel>

                        <Panel header="↩️ Trả hàng nhập" key="4">
                            <Paragraph>
                                <strong>Trả lại sản phẩm cho nhà cung cấp:</strong>
                            </Paragraph>
                            <Paragraph>
                                <strong>Tính năng mới:</strong>
                            </Paragraph>
                            <ul>
                                <li>Tự động lấy chi nhánh từ phiếu nhập gốc</li>
                                <li>Hiển thị đầy đủ thông tin giá (đơn giá, thành tiền)</li>
                                <li>Tự động tính tổng tiền trả hàng</li>
                            </ul>
                            <Paragraph>
                                <strong>Quy trình:</strong>
                            </Paragraph>
                            <ol>
                                <li>Vào <Tag>Kho → Trả hàng nhập</Tag></li>
                                <li>Chọn nhà cung cấp → Hệ thống hiển thị danh sách phiếu nhập</li>
                                <li>Chọn phiếu nhập cần trả (chi nhánh tự động điền từ phiếu gốc)</li>
                                <li>Chọn sản phẩm và nhập số lượng trả</li>
                                <li>Nhập lý do trả hàng (hàng lỗi, sai quy cách, đổi mã...)</li>
                                <li>Xác nhận → Hệ thống tự động trừ tồn kho</li>
                            </ol>
                            <Alert
                                message="Lưu ý"
                                description="Chỉ có thể trả hàng với số lượng không vượt quá số lượng đã nhập. Giá trả hàng tự động lấy từ đơn giá nhập ban đầu."
                                type="info"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </Panel>

                        <Panel header="📋 Lịch sử nhập/xuất sản phẩm" key="5">
                            <Paragraph>
                                <strong>Theo dõi toàn bộ giao dịch của từng sản phẩm:</strong>
                            </Paragraph>
                            <Paragraph>
                                Vào trang chi tiết sản phẩm → Tab "Lịch sử giao dịch" để xem:
                            </Paragraph>
                            <ul>
                                <li><Tag color="green">Nhập kho</Tag> - Từ nhà cung cấp, chuyển kho đến</li>
                                <li><Tag color="red">Xuất kho</Tag> - Bán hàng, chuyển kho đi, trả hàng</li>
                                <li><Tag color="blue">Kiểm kê</Tag> - Điều chỉnh tồn kho</li>
                                <li><Tag color="orange">Hủy/Hỏng</Tag> - Sản phẩm hư hỏng, hết hạn</li>
                            </ul>
                            <Paragraph>
                                <strong>Thông tin hiển thị:</strong>
                            </Paragraph>
                            <ul>
                                <li>Mã phiếu (click để xem chi tiết phiếu)</li>
                                <li>Loại giao dịch</li>
                                <li>Chi nhánh thực hiện</li>
                                <li>Nhà cung cấp (nếu có)</li>
                                <li>Người thực hiện</li>
                                <li>Ngày thực hiện</li>
                                <li>Số lượng, đơn giá, thành tiền</li>
                            </ul>
                            <Alert
                                message="Tính năng mới"
                                description="Lịch sử giao dịch giúp truy xuất nguồn gốc hàng hóa, kiểm tra giá nhập theo từng lần, và phân tích xu hướng tiêu thụ sản phẩm."
                                type="success"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </Panel>

                        <Panel header="📈 Tồn kho tổng hợp" key="6">
                            <Paragraph>
                                <strong>Xem tồn kho toàn hệ thống:</strong>
                            </Paragraph>
                            <Paragraph>
                                Vào <Tag>Kho → Tồn kho</Tag> để xem:
                            </Paragraph>
                            <ul>
                                <li><strong>Tồn kho theo chi nhánh:</strong> Chi tiết số lượng tại từng chi nhánh</li>
                                <li><strong>Tồn kho tổng:</strong> Tổng hợp tất cả chi nhánh</li>
                                <li><strong>Giá trị tồn kho:</strong> Số lượng × Giá vốn</li>
                                <li><strong>Cảnh báo:</strong> Sản phẩm dưới mức tồn kho tối thiểu</li>
                            </ul>
                            <Alert
                                message="Tính năng tổng hợp"
                                description="Hệ thống tự động tính toán tồn kho từ tất cả chi nhánh, giúp quản lý tập trung và quyết định nhập hàng chính xác hơn."
                                type="info"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </Panel>

                        <Panel header="🗑️ Hủy/Hỏng hàng" key="7">
                            <Paragraph>
                                <strong>Xử lý sản phẩm hư hỏng, hết hạn:</strong>
                            </Paragraph>
                            <Paragraph>
                                <strong>Quy trình:</strong>
                            </Paragraph>
                            <ol>
                                <li>Vào <Tag>Kho → Hủy hàng</Tag></li>
                                <li>Chọn chi nhánh</li>
                                <li>Chọn sản phẩm cần hủy từ tồn kho</li>
                                <li>Nhập số lượng hủy</li>
                                <li>Chọn lý do: Hết hạn, Hư hỏng, Mất mát, Khác</li>
                                <li>Ghi chú chi tiết (bắt buộc)</li>
                                <li>Xác nhận → Tồn kho tự động giảm</li>
                            </ol>
                            <Alert
                                message="Báo cáo hủy hàng"
                                description="Theo dõi tỷ lệ hủy hàng để đánh giá hiệu quả quản lý kho, phát hiện vấn đề về bảo quản hoặc dự trú quá mức."
                                type="warning"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </Panel>
                    </Collapse>

                    <Card title="Video hướng dẫn" style={{ marginBottom: 24 }}>
                        <List
                            itemLayout="horizontal"
                            dataSource={[
                                { title: 'Nhập kho hàng loạt bằng Excel', duration: '5:20' },
                                { title: 'Cách chuyển kho giữa chi nhánh', duration: '4:15' },
                                { title: 'Hướng dẫn kiểm kê kho định kỳ', duration: '8:30' },
                                { title: 'Quy trình trả hàng nhập cho nhà cung cấp', duration: '6:45' },
                            ]}
                            renderItem={(item) => (
                                <List.Item
                                    actions={[
                                        <Button type="link" icon={<PlayCircleOutlined />}>
                                            Xem video
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<VideoCameraOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                                        title={item.title}
                                        description={`Thời lượng: ${item.duration}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </div>
            ),
        },
        {
            key: 'admin-management',
            title: 'Quản lý Nhân sự',
            icon: <TeamOutlined />,
            content: (
                <div>
                    <Title level={2}>
                        <TeamOutlined /> Quản lý Nhân sự & Lương
                    </Title>

                    <Alert
                        message="Module Quản lý Nhân sự"
                        description="Hệ thống quản lý nhân viên toàn diện với thông tin cá nhân, chức vụ, lương, hoa hồng, phụ cấp và giảm trừ."
                        type="info"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />

                    <Collapse defaultActiveKey={['1']} style={{ marginBottom: 24 }}>
                        <Panel header="👤 Hồ sơ nhân viên" key="1">
                            <Paragraph>
                                <strong>Thông tin cá nhân:</strong>
                            </Paragraph>
                            <ul>
                                <li>Mã nhân viên (tự động hoặc tùy chỉnh)</li>
                                <li>Họ tên, tên đăng nhập, mật khẩu</li>
                                <li>Ngày sinh, giới tính</li>
                                <li>Số điện thoại, Email</li>
                                <li>CMND/CCCD: Số, ngày cấp, nơi cấp</li>
                            </ul>
                            <Paragraph>
                                <strong>Thông tin công việc:</strong>
                            </Paragraph>
                            <ul>
                                <li>Chi nhánh làm việc</li>
                                <li>Chức vụ (Nhân viên, Trưởng phòng, Giám đốc...)</li>
                                <li>Ngày vào làm</li>
                                <li>Trạng thái (Đang làm việc, Tạm nghỉ, Đã nghỉ)</li>
                            </ul>
                        </Panel>

                        <Panel header="💰 Cấu hình lương & hoa hồng" key="2">
                            <Paragraph>
                                <strong>Lương cơ bản:</strong>
                            </Paragraph>
                            <ul>
                                <li>Mức lương (VNĐ/tháng)</li>
                                <li>Loại lương: Theo giờ, Theo ngày, Theo tháng</li>
                            </ul>
                            <Paragraph>
                                <strong>Lương làm thêm giờ:</strong>
                            </Paragraph>
                            <ul>
                                <li>Thứ 2-6: Hệ số lương (ví dụ: 1.5x)</li>
                                <li>Thứ 7: Hệ số lương (ví dụ: 2.0x)</li>
                                <li>Chủ nhật: Hệ số lương (ví dụ: 3.0x)</li>
                            </ul>
                            <Paragraph>
                                <strong>Hoa hồng dịch vụ:</strong>
                            </Paragraph>
                            <ul>
                                <li>% hoặc số tiền cố định theo từng dịch vụ</li>
                                <li>Thiết lập theo nhóm dịch vụ hoặc từng dịch vụ riêng</li>
                                <li>Hoa hồng bậc thang theo doanh thu</li>
                            </ul>
                            <Alert
                                message="Ví dụ hoa hồng"
                                description="Dịch vụ Massage: 100.000đ → Hoa hồng 15% = 15.000đ. Hoặc cố định 20.000đ/lần thực hiện."
                                type="success"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </Panel>

                        <Panel header="🎁 Thưởng & Phụ cấp" key="3">
                            <Paragraph>
                                <strong>Thưởng (thuong_setting):</strong>
                            </Paragraph>
                            <ul>
                                <li>Thưởng KPI đạt chỉ tiêu</li>
                                <li>Thưởng lễ tết</li>
                                <li>Thưởng hoàn thành dự án đặc biệt</li>
                                <li>Lưu dưới dạng JSON để linh hoạt</li>
                            </ul>
                            <Paragraph>
                                <strong>Phụ cấp (phu_cap_setting):</strong>
                            </Paragraph>
                            <ul>
                                <li>Phụ cấp xăng xe</li>
                                <li>Phụ cấp điện thoại</li>
                                <li>Phụ cấp ăn trưa</li>
                                <li>Phụ cấp trách nhiệm</li>
                            </ul>
                            <Paragraph>
                                <strong>Giảm trừ (giam_tru_setting):</strong>
                            </Paragraph>
                            <ul>
                                <li>Bảo hiểm xã hội (10.5%)</li>
                                <li>Bảo hiểm y tế (4.5%)</li>
                                <li>Thuế thu nhập cá nhân (theo bậc)</li>
                                <li>Khấu trừ khác (đi muộn, vắng mặt...)</li>
                            </ul>
                        </Panel>

                        <Panel header="📊 Báo cáo lương & công" key="4">
                            <Paragraph>
                                <strong>Bảng chấm công:</strong>
                            </Paragraph>
                            <ul>
                                <li>Xem công theo tháng từng nhân viên</li>
                                <li>Số ngày làm việc, nghỉ phép, nghỉ không lương</li>
                                <li>Giờ làm thêm (Thứ 7, CN)</li>
                                <li>Xuất Excel để tính lương</li>
                            </ul>
                            <Paragraph>
                                <strong>Bảng lương chi tiết:</strong>
                            </Paragraph>
                            <ul>
                                <li>Lương cơ bản</li>
                                <li>Hoa hồng dịch vụ</li>
                                <li>Thưởng & Phụ cấp</li>
                                <li>Giảm trừ (BHXH, BHYT, Thuế)</li>
                                <li><strong>Thực lãnh</strong> = Tổng cộng - Giảm trừ</li>
                            </ul>
                            <Alert
                                message="Xuất phiếu lương"
                                description="Có thể gửi phiếu lương qua Email cho từng nhân viên hoặc in hàng loạt cuối tháng."
                                type="info"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </Panel>

                        <Panel header="🔍 Tìm kiếm & Lọc nhân viên" key="5">
                            <Paragraph>
                                <strong>Tìm kiếm nhanh:</strong>
                            </Paragraph>
                            <ul>
                                <li>Theo tên, email, username</li>
                                <li>Theo mã nhân viên</li>
                                <li>Theo số điện thoại</li>
                            </ul>
                            <Paragraph>
                                <strong>Lọc nâng cao:</strong>
                            </Paragraph>
                            <ul>
                                <li>Theo chi nhánh</li>
                                <li>Theo chức vụ</li>
                                <li>Theo trạng thái (Đang làm, Đã nghỉ)</li>
                                <li>Theo ngày vào làm (từ ngày... đến ngày...)</li>
                            </ul>
                            <Alert
                                message="Tính năng mới"
                                description="API quản lý nhân viên hỗ trợ tìm kiếm đa điều kiện, phân trang, và sắp xếp linh hoạt."
                                type="success"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </Panel>
                    </Collapse>

                    <Card title="Video hướng dẫn" style={{ marginBottom: 24 }}>
                        <List
                            itemLayout="horizontal"
                            dataSource={[
                                { title: 'Thêm hồ sơ nhân viên mới', duration: '6:30' },
                                { title: 'Cấu hình lương & hoa hồng', duration: '9:15' },
                                { title: 'Chấm công và tính lương hàng tháng', duration: '12:20' },
                            ]}
                            renderItem={(item) => (
                                <List.Item
                                    actions={[
                                        <Button type="link" icon={<PlayCircleOutlined />}>
                                            Xem video
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<VideoCameraOutlined />} style={{ backgroundColor: '#722ed1' }} />}
                                        title={item.title}
                                        description={`Thời lượng: ${item.duration}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </div>
            ),
        },
        {
            key: 'shortcuts',
            title: 'Phím tắt',
            icon: <ThunderboltOutlined />,
            content: (
                <div>
                    <Title level={2}>
                        <ThunderboltOutlined /> Danh sách phím tắt
                    </Title>

                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card title="🛒 Màn hình POS" size="small">
                                <Row gutter={[8, 8]}>
                                    <Col span={8}><Tag color="blue">F1</Tag> Chọn khách hàng</Col>
                                    <Col span={8}><Tag color="blue">F2</Tag> Quét barcode</Col>
                                    <Col span={8}><Tag color="blue">F3</Tag> Hold hóa đơn</Col>
                                    <Col span={8}><Tag color="blue">F4</Tag> Recall hóa đơn</Col>
                                    <Col span={8}><Tag color="green">F9</Tag> Thanh toán</Col>
                                    <Col span={8}><Tag color="red">ESC</Tag> Hủy hóa đơn</Col>
                                    <Col span={8}><Tag color="orange">Ctrl + P</Tag> In hóa đơn</Col>
                                    <Col span={8}><Tag color="purple">Ctrl + D</Tag> Áp dụng giảm giá</Col>
                                </Row>
                            </Card>
                        </Col>

                        <Col span={24}>
                            <Card title="📋 Thao tác chung" size="small">
                                <Row gutter={[8, 8]}>
                                    <Col span={8}><Tag color="blue">Ctrl + S</Tag> Lưu form</Col>
                                    <Col span={8}><Tag color="blue">Ctrl + N</Tag> Tạo mới</Col>
                                    <Col span={8}><Tag color="blue">Ctrl + F</Tag> Tìm kiếm</Col>
                                    <Col span={8}><Tag color="blue">Ctrl + E</Tag> Export</Col>
                                    <Col span={8}><Tag color="red">ESC</Tag> Đóng modal</Col>
                                    <Col span={8}><Tag color="orange">Alt + Left</Tag> Quay lại</Col>
                                </Row>
                            </Card>
                        </Col>

                        <Col span={24}>
                            <Card title="📅 Booking & Lịch" size="small">
                                <Row gutter={[8, 8]}>
                                    <Col span={8}><Tag color="blue">Ctrl + B</Tag> Tạo booking mới</Col>
                                    <Col span={8}><Tag color="blue">T</Tag> Về hôm nay</Col>
                                    <Col span={8}><Tag color="blue">→</Tag> Ngày tiếp theo</Col>
                                    <Col span={8}><Tag color="blue">←</Tag> Ngày trước đó</Col>
                                    <Col span={8}><Tag color="blue">M</Tag> Xem theo tháng</Col>
                                    <Col span={8}><Tag color="blue">W</Tag> Xem theo tuần</Col>
                                </Row>
                            </Card>
                        </Col>

                        <Col span={24}>
                            <Alert
                                message="Mẹo"
                                description="Hover chuột lên các nút bấm để xem phím tắt tương ứng"
                                type="info"
                                showIcon
                            />
                        </Col>
                    </Row>
                </div>
            ),
        },
    ];

    // Filter sections by search
    const filteredSections = sections.filter(section =>
        searchText === '' ||
        section.title.toLowerCase().includes(searchText.toLowerCase())
    );

    // Find current section
    const currentSection = sections.find(s => s.key === selectedKey);

    return (
        <div style={{ padding: 24 }}>
            <Card style={{ marginBottom: 16 }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                        <BookOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                        <Title level={3} style={{ margin: 0 }}>
                            Tài liệu hướng dẫn sử dụng
                        </Title>
                    </Space>
                    <Input.Search
                        placeholder="Tìm kiếm tài liệu..."
                        allowClear
                        style={{ width: 300 }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        prefix={<SearchOutlined />}
                    />
                </Space>
            </Card>

            <Layout style={{ background: '#fff' }}>
                <Sider
                    width={280}
                    style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
                    collapsible
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                >
                    <Menu
                        mode="inline"
                        selectedKeys={[selectedKey]}
                        onClick={({ key }) => setSelectedKey(key)}
                        style={{ height: '100%', borderRight: 0 }}
                    >
                        {filteredSections.map(section => (
                            <Menu.Item key={section.key} icon={section.icon}>
                                {section.title}
                            </Menu.Item>
                        ))}
                    </Menu>
                </Sider>

                <Content style={{ padding: '0 24px', minHeight: 600, maxWidth: 1200 }}>
                    {filteredSections.length === 0 ? (
                        <Empty description="Không tìm thấy tài liệu phù hợp" />
                    ) : (
                        currentSection?.content
                    )}

                    <Divider />

                    <Alert
                        message="Cần hỗ trợ thêm?"
                        description={
                            <Space direction="vertical">
                                <Text>📞 Hotline hỗ trợ: 1900-xxxx (24/7)</Text>
                                <Text>📧 Email: support@spa.com</Text>
                                <Text>💬 Live chat: Click vào biểu tượng góc phải màn hình</Text>
                            </Space>
                        }
                        type="warning"
                        showIcon
                    />
                </Content>
            </Layout>
        </div>
    );
};

export default Documentation;
