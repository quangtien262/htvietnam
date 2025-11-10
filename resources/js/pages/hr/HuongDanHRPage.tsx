import React from 'react';
import { Collapse, Typography, Divider, Steps, Card, Row, Col, Table, Alert } from 'antd';
import {
    CalendarOutlined,
    DollarOutlined,
    FileTextOutlined,
    BarChartOutlined,
    TeamOutlined,
    SettingOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

export default function HuongDanHRPage() {
    const chamCongColumns = [
        { title: 'Loại', dataIndex: 'type', key: 'type' },
        { title: 'Mô tả', dataIndex: 'desc', key: 'desc' },
    ];

    const chamCongData = [
        { key: '1', type: 'Đi làm', desc: 'Ghi nhận giờ vào/ra, tự động tính KPI dựa trên ca làm việc' },
        { key: '2', type: 'Nghỉ phép', desc: 'Nghỉ có phép, trừ vào phép năm' },
        { key: '3', type: 'Nghỉ không phép', desc: 'Vắng mặt không lý do, ảnh hưởng lương' },
        { key: '4', type: 'Nghỉ lễ', desc: 'Ngày lễ, tết, không tính công' },
    ];

    const luongColumns = [
        { title: 'Khoản', dataIndex: 'item', key: 'item' },
        { title: 'Công thức', dataIndex: 'formula', key: 'formula' },
    ];

    const luongData = [
        { key: '1', item: 'Lương ngày công', formula: '(Lương cơ bản / Số ngày công chuẩn) × Số ngày công thực tế' },
        { key: '2', item: 'Tiền làm thêm', formula: '(Lương cơ bản / Ngày công chuẩn / 8h) × Giờ làm thêm × 1.5' },
        { key: '3', item: 'BHXH (8%)', formula: 'Lương cơ bản × 8%' },
        { key: '4', item: 'BHYT (1.5%)', formula: 'Lương cơ bản × 1.5%' },
        { key: '5', item: 'Thuế TNCN', formula: '(Lương trước thuế - 11tr) × 10%' },
        { key: '6', item: 'Thực nhận', formula: 'Lương ngày công + Làm thêm - BHXH - BHYT - Thuế' },
    ];

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2}>📖 Hướng dẫn sử dụng Hệ thống Quản lý Nhân sự (HR)</Title>

            <Alert
                message="Chào mừng!"
                description="Hệ thống HR giúp quản lý chấm công, tính lương, nghỉ phép và báo cáo nhân sự một cách tự động và chính xác."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
            />

            <Collapse defaultActiveKey={['1']} accordion>
                <Panel header={<><CalendarOutlined /> Chấm công</>} key="1">
                    <Title level={4}>1. Cách chấm công</Title>
                    <Steps
                        direction="vertical"
                        current={-1}
                        items={[
                            {
                                title: 'Chọn ngày',
                                description: 'Click vào ngày trên lịch để mở form chấm công',
                            },
                            {
                                title: 'Chọn loại',
                                description: 'Chọn loại: Đi làm / Nghỉ phép / Nghỉ không phép / Nghỉ lễ',
                            },
                            {
                                title: 'Nhập giờ (nếu đi làm)',
                                description: 'Nhập giờ check-in, check-out và giờ làm thêm (nếu có)',
                            },
                            {
                                title: 'Xác nhận',
                                description: 'Hệ thống tự động tính KPI và lưu dữ liệu',
                            },
                        ]}
                    />

                    <Divider />

                    <Title level={4}>2. Các loại chấm công</Title>
                    <Table columns={chamCongColumns} dataSource={chamCongData} pagination={false} size="small" />

                    <Divider />

                    <Title level={4}>3. Quy tắc tính KPI</Title>
                    <Paragraph>
                        <ul>
                            <li>Check-in <Text code>sau 9h00</Text>: KPI = 1 (Đi muộn)</li>
                            <li>Check-out <Text code>trước 17h30</Text>: KPI = 1 (Về sớm)</li>
                            <li>Đúng giờ: KPI = 0</li>
                            <li>Làm thêm: Tính theo giờ, hệ số 1.5</li>
                        </ul>
                    </Paragraph>
                </Panel>

                <Panel header={<><DollarOutlined /> Bảng lương</>} key="2">
                    <Title level={4}>1. Quy trình tính lương</Title>
                    <Steps
                        direction="vertical"
                        current={-1}
                        items={[
                            {
                                title: 'Tính lương',
                                description: 'Chọn tháng/năm, click "Tính lương" để hệ thống tự động tính toán',
                            },
                            {
                                title: 'Kiểm tra',
                                description: 'Xem chi tiết từng bảng lương, kiểm tra các khoản trừ/cộng',
                            },
                            {
                                title: 'Duyệt',
                                description: 'Click "Duyệt" để xác nhận bảng lương',
                            },
                            {
                                title: 'Thanh toán',
                                description: 'Đánh dấu "Đã thanh toán" sau khi chuyển khoản',
                            },
                        ]}
                    />

                    <Divider />

                    <Title level={4}>2. Công thức tính lương</Title>
                    <Table columns={luongColumns} dataSource={luongData} pagination={false} size="small" />

                    <Divider />

                    <Title level={4}>3. Lưu ý</Title>
                    <Alert
                        message="Quan trọng"
                        description={
                            <ul>
                                <li>Phải chấm công đầy đủ trước khi tính lương</li>
                                <li>Ngày công chuẩn mặc định: 22 ngày/tháng</li>
                                <li>Bảng lương đã duyệt không thể chỉnh sửa</li>
                                <li>Kiểm tra kỹ trước khi duyệt</li>
                            </ul>
                        }
                        type="warning"
                        showIcon
                    />
                </Panel>

                <Panel header={<><FileTextOutlined /> Nghỉ phép</>} key="3">
                    <Title level={4}>1. Đăng ký nghỉ phép</Title>
                    <Steps
                        direction="vertical"
                        current={-1}
                        items={[
                            {
                                title: 'Tạo đơn',
                                description: 'Click "Đăng ký nghỉ phép", chọn loại nghỉ và khoảng thời gian',
                            },
                            {
                                title: 'Nhập lý do',
                                description: 'Ghi rõ lý do nghỉ phép',
                            },
                            {
                                title: 'Gửi duyệt',
                                description: 'Đơn được gửi đến quản lý để duyệt',
                            },
                            {
                                title: 'Chờ phản hồi',
                                description: 'Quản lý sẽ duyệt/từ chối đơn',
                            },
                        ]}
                    />

                    <Divider />

                    <Title level={4}>2. Các loại nghỉ phép</Title>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Card title="Phép năm" size="small">
                                <Paragraph>12 ngày/năm, tính lương 100%</Paragraph>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card title="Ốm đau" size="small">
                                <Paragraph>Có giấy bác sĩ, tính lương 75%</Paragraph>
                            </Card>
                        </Col>
                    </Row>
                    <Row gutter={16} style={{ marginTop: 16 }}>
                        <Col span={12}>
                            <Card title="Thai sản" size="small">
                                <Paragraph>6 tháng, BHXH chi trả</Paragraph>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card title="Không lương" size="small">
                                <Paragraph>Nghỉ riêng, không tính lương</Paragraph>
                            </Card>
                        </Col>
                    </Row>
                </Panel>

                <Panel header={<><BarChartOutlined /> Báo cáo</>} key="4">
                    <Title level={4}>Dashboard HR</Title>
                    <Paragraph>
                        Dashboard cung cấp cái nhìn tổng quan về:
                    </Paragraph>
                    <ul>
                        <li><strong>Nhân sự:</strong> Tổng số nhân viên, nhân viên mới, nghỉ việc</li>
                        <li><strong>Chấm công:</strong> Thống kê đi làm, nghỉ phép, đi muộn, giờ làm thêm</li>
                        <li><strong>Lương:</strong> Tổng quỹ lương tháng, phân bổ theo chi nhánh</li>
                        <li><strong>Nghỉ phép:</strong> Đơn chờ duyệt, đã duyệt, từ chối</li>
                    </ul>

                    <Divider />

                    <Title level={4}>Lọc dữ liệu</Title>
                    <Paragraph>
                        Có thể lọc theo <Text code>Tháng/Năm</Text> để xem báo cáo chi tiết từng kỳ.
                    </Paragraph>
                </Panel>

                <Panel header={<><TeamOutlined /> Quản lý nhân viên</>} key="5">
                    <Title level={4}>Thông tin nhân viên</Title>
                    <Paragraph>
                        Vào <Text strong>Cài đặt → Nhân viên</Text> để quản lý:
                    </Paragraph>
                    <ul>
                        <li>Thông tin cá nhân (họ tên, CCCD, địa chỉ)</li>
                        <li>Thông tin công việc (chức vụ, phòng ban, lương)</li>
                        <li>Hợp đồng lao động</li>
                        <li>Tài sản được giao</li>
                        <li>Đánh giá KPI</li>
                    </ul>
                </Panel>

                <Panel header={<><SettingOutlined /> Cài đặt hệ thống</>} key="6">
                    <Title level={4}>Cài đặt HR</Title>
                    <Paragraph>
                        <strong>Ca làm việc:</strong> Định nghĩa giờ vào/ra, giờ nghỉ trưa
                    </Paragraph>
                    <Paragraph>
                        <strong>Hợp đồng:</strong> Mẫu hợp đồng, thời hạn, điều khoản
                    </Paragraph>
                    <Paragraph>
                        <strong>Tài sản:</strong> Quản lý laptop, thiết bị được giao cho nhân viên
                    </Paragraph>
                    <Paragraph>
                        <strong>KPI:</strong> Thiết lập tiêu chí đánh giá hiệu suất
                    </Paragraph>
                </Panel>
            </Collapse>

            <Divider />

            <Card title="❓ Câu hỏi thường gặp (FAQ)" style={{ marginTop: 24 }}>
                <Collapse ghost>
                    <Panel header="Làm sao chỉnh sửa chấm công đã lưu?" key="faq1">
                        <Paragraph>
                            Click lại vào ngày đó trên lịch, sửa thông tin và click "Xác nhận". Dữ liệu sẽ được cập nhật.
                        </Paragraph>
                    </Panel>
                    <Panel header="Tính lương bị sai, phải làm gì?" key="faq2">
                        <Paragraph>
                            Kiểm tra lại dữ liệu chấm công và thông tin lương cơ bản của nhân viên.
                            Nếu bảng lương chưa duyệt, có thể xóa và tính lại.
                        </Paragraph>
                    </Panel>
                    <Panel header="Đơn nghỉ phép bị từ chối, có thể đăng ký lại không?" key="faq3">
                        <Paragraph>
                            Có, bạn có thể tạo đơn mới với lý do rõ ràng hơn hoặc thời gian khác.
                        </Paragraph>
                    </Panel>
                    <Panel header="Làm sao xuất báo cáo Excel?" key="faq4">
                        <Paragraph>
                            Tại trang Báo cáo, chọn kỳ cần xuất, click nút "Xuất Excel" ở góc phải màn hình.
                        </Paragraph>
                    </Panel>
                </Collapse>
            </Card>

            <Alert
                message="Cần hỗ trợ?"
                description="Liên hệ IT Support qua email: support@company.com hoặc Hotline: 1900-xxxx"
                type="success"
                showIcon
                style={{ marginTop: 24 }}
            />
        </div>
    );
}
