import React, { useState } from 'react';
import { Card, Collapse, Typography, Steps, Table, Tag, Space, Alert, Divider, Row, Col, Timeline } from 'antd';
import {
    ClockCircleOutlined,
    DollarOutlined,
    FileTextOutlined,
    UserOutlined,
    SettingOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    InfoCircleOutlined,
    CalendarOutlined,
    TeamOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

export default function HuongDanHRPage() {
    const [activeKey, setActiveKey] = useState<string[]>(['1']);

    // Dữ liệu bảng ví dụ cho các loại chấm công
    const loaiChamCongColumns = [
        { title: 'Loại', dataIndex: 'type', key: 'type' },
        { title: 'Mô tả', dataIndex: 'desc', key: 'desc' },
        { title: 'KPI', dataIndex: 'kpi', key: 'kpi', render: (kpi: number) => (
            <Tag color={kpi === 0 ? 'green' : kpi === -1 ? 'red' : 'default'}>{kpi === 0 ? 'Bình thường' : kpi === -1 ? 'Trừ KPI' : 'Nghỉ'}</Tag>
        )},
    ];

    const loaiChamCongData = [
        { key: '1', type: 'Đi làm', desc: 'Check-in/out bình thường (8:50 - 17:10)', kpi: 0 },
        { key: '2', type: 'Đi muộn/Về sớm', desc: 'Check-in sau 8:50 hoặc check-out trước 17:10', kpi: -1 },
        { key: '3', type: 'Nghỉ phép', desc: 'Nghỉ có đơn được duyệt', kpi: 1 },
        { key: '4', type: 'Nghỉ không phép', desc: 'Nghỉ không báo trước', kpi: 1 },
        { key: '5', type: 'Nghỉ lễ', desc: 'Nghỉ theo lịch nhà nước', kpi: 1 },
    ];

    // Bảng công thức tính lương
    const congThucLuongColumns = [
        { title: 'Hạng mục', dataIndex: 'item', key: 'item' },
        { title: 'Công thức', dataIndex: 'formula', key: 'formula' },
        { title: 'Ví dụ', dataIndex: 'example', key: 'example' },
    ];

    const congThucLuongData = [
        { 
            key: '1', 
            item: 'Lương theo ngày công', 
            formula: '(Lương cơ bản ÷ Số ngày công chuẩn) × Số ngày công thực tế',
            example: '(10,000,000 ÷ 26) × 24 = 9,230,769 VNĐ'
        },
        { 
            key: '2', 
            item: 'Làm thêm ngày thường', 
            formula: 'Lương 1 ngày × 150% × Số giờ làm thêm ÷ 8',
            example: '384,615 × 1.5 × 4 ÷ 8 = 288,461 VNĐ'
        },
        { 
            key: '3', 
            item: 'Làm thêm thứ 7', 
            formula: 'Lương 1 ngày × 200% × Số giờ làm thêm ÷ 8',
            example: '384,615 × 2.0 × 8 ÷ 8 = 769,230 VNĐ'
        },
        { 
            key: '4', 
            item: 'BHXH (8%)', 
            formula: 'Lương đóng bảo hiểm × 8%',
            example: '10,000,000 × 8% = 800,000 VNĐ'
        },
        { 
            key: '5', 
            item: 'BHYT (1.5%)', 
            formula: 'Lương đóng bảo hiểm × 1.5%',
            example: '10,000,000 × 1.5% = 150,000 VNĐ'
        },
        { 
            key: '6', 
            item: 'Thuế TNCN', 
            formula: 'Thu nhập chịu thuế × Thuế suất lũy tiến (5-35%)',
            example: '(Thu nhập - 11tr - Giảm trừ) × Thuế suất'
        },
    ];

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', background: '#f0f2f5' }}>
            <Card 
                style={{ marginBottom: 24, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
                bordered={false}
            >
                <TeamOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <Title level={2} style={{ color: 'white', marginBottom: 8 }}>HƯỚNG DẪN SỬ DỤNG HỆ THỐNG QUẢN LÝ NHÂN SỰ</Title>
                <Paragraph style={{ color: 'white', fontSize: 16, marginBottom: 0 }}>
                    Chấm công - Tính lương - Nghỉ phép - Báo cáo
                </Paragraph>
            </Card>

            {/* TỔNG QUAN */}
            <Card style={{ marginBottom: 24 }} title={<><InfoCircleOutlined /> Tổng quan hệ thống</>}>
                <Paragraph>
                    Hệ thống quản lý nhân sự giúp nhân viên và quản lý theo dõi, quản lý các hoạt động liên quan đến:
                </Paragraph>
                <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={6}>
                        <Card size="small" style={{ textAlign: 'center', background: '#e6f7ff', borderColor: '#1890ff' }}>
                            <ClockCircleOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                            <Title level={4} style={{ marginTop: 8 }}>Chấm công</Title>
                            <Text type="secondary">Theo dõi giờ làm việc</Text>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card size="small" style={{ textAlign: 'center', background: '#f6ffed', borderColor: '#52c41a' }}>
                            <DollarOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                            <Title level={4} style={{ marginTop: 8 }}>Bảng lương</Title>
                            <Text type="secondary">Tính lương tự động</Text>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card size="small" style={{ textAlign: 'center', background: '#fff7e6', borderColor: '#fa8c16' }}>
                            <FileTextOutlined style={{ fontSize: 32, color: '#fa8c16' }} />
                            <Title level={4} style={{ marginTop: 8 }}>Nghỉ phép</Title>
                            <Text type="secondary">Quản lý đơn xin nghỉ</Text>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card size="small" style={{ textAlign: 'center', background: '#f9f0ff', borderColor: '#722ed1' }}>
                            <SettingOutlined style={{ fontSize: 32, color: '#722ed1' }} />
                            <Title level={4} style={{ marginTop: 8 }}>Báo cáo</Title>
                            <Text type="secondary">Thống kê, phân tích</Text>
                        </Card>
                    </Col>
                </Row>
            </Card>

            {/* HƯỚNG DẪN CHI TIẾT */}
            <Collapse 
                activeKey={activeKey} 
                onChange={(keys) => setActiveKey(keys as string[])}
                accordion={false}
            >
                {/* 1. CHẤM CÔNG */}
                <Panel 
                    header={<Title level={4} style={{ margin: 0 }}><ClockCircleOutlined /> 1. Chấm công hàng ngày</Title>} 
                    key="1"
                >
                    <Alert
                        message="Lưu ý quan trọng"
                        description="Chấm công đúng giờ để tránh bị trừ KPI. Giờ làm việc chuẩn: 8:50 - 17:10"
                        type="warning"
                        showIcon
                        icon={<WarningOutlined />}
                        style={{ marginBottom: 16 }}
                    />

                    <Title level={5}>Cách chấm công:</Title>
                    <Steps
                        direction="vertical"
                        current={-1}
                        items={[
                            {
                                title: 'Bước 1: Vào menu Chấm công',
                                description: 'Truy cập menu HR → Chấm công để mở giao diện lịch chấm công.',
                            },
                            {
                                title: 'Bước 2: Chọn ngày cần chấm',
                                description: 'Click vào ngày cần chấm công trên lịch. Có thể thay đổi tháng/năm ở phía trên.',
                            },
                            {
                                title: 'Bước 3: Nhập thông tin',
                                description: (
                                    <div>
                                        <Text>Chọn loại chấm công:</Text>
                                        <ul>
                                            <li><Text strong>Đi làm:</Text> Nhập giờ check-in, check-out và số giờ làm thêm (nếu có)</li>
                                            <li><Text strong>Nghỉ phép:</Text> Chọn nếu có đơn nghỉ phép đã được duyệt</li>
                                            <li><Text strong>Nghỉ không phép:</Text> Chọn nếu nghỉ không báo trước</li>
                                            <li><Text strong>Nghỉ lễ:</Text> Các ngày lễ, tết theo lịch nhà nước</li>
                                        </ul>
                                    </div>
                                ),
                            },
                            {
                                title: 'Bước 4: Lưu thông tin',
                                description: 'Click "Xác nhận" để lưu. Dữ liệu sẽ được quản lý duyệt sau.',
                            },
                        ]}
                    />

                    <Divider />

                    <Title level={5}>Các loại chấm công:</Title>
                    <Table 
                        columns={loaiChamCongColumns} 
                        dataSource={loaiChamCongData} 
                        pagination={false}
                        size="small"
                        style={{ marginTop: 16 }}
                    />

                    <Divider />

                    <Title level={5}>Quy định KPI:</Title>
                    <Timeline
                        items={[
                            {
                                color: 'green',
                                children: (
                                    <>
                                        <Text strong>KPI = 0 (Bình thường):</Text>
                                        <br />
                                        Check-in: 08:50 trở về trước
                                        <br />
                                        Check-out: 17:10 trở về sau
                                    </>
                                ),
                            },
                            {
                                color: 'red',
                                children: (
                                    <>
                                        <Text strong>KPI = -1 (Đi muộn/Về sớm):</Text>
                                        <br />
                                        Check-in sau 08:50 HOẶC Check-out trước 17:10
                                        <br />
                                        → Trừ 1/2 ngày lương
                                    </>
                                ),
                            },
                            {
                                color: 'orange',
                                children: (
                                    <>
                                        <Text strong>KPI = 1 (Nghỉ cả ngày):</Text>
                                        <br />
                                        Nghỉ phép, nghỉ không phép, nghỉ lễ
                                        <br />
                                        → Trừ cả ngày lương (trừ nghỉ phép có lương)
                                    </>
                                ),
                            },
                        ]}
                    />

                    <Alert
                        message="Mẹo hay"
                        description={
                            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                                <li>Xem thống kê tháng ở phía trên lịch (Tổng ngày, Đi làm, Nghỉ phép, Đi muộn, Giờ làm thêm)</li>
                                <li>Click vào ngày đã chấm để xem chi tiết hoặc chỉnh sửa (nếu chưa duyệt)</li>
                                <li>Màu badge: Xanh lá (đúng giờ), Vàng (muộn/sớm), Xanh dương (nghỉ phép), Đỏ (không phép), Xám (lễ)</li>
                            </ul>
                        }
                        type="info"
                        showIcon
                        style={{ marginTop: 16 }}
                    />
                </Panel>

                {/* 2. BẢNG LƯƠNG */}
                <Panel 
                    header={<Title level={4} style={{ margin: 0 }}><DollarOutlined /> 2. Bảng lương</Title>} 
                    key="2"
                >
                    <Alert
                        message="Thông tin"
                        description="Bảng lương được tính tự động từ dữ liệu chấm công. Nhân viên chỉ xem, không được chỉnh sửa."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    <Title level={5}>Quy trình tính lương:</Title>
                    <Steps
                        direction="vertical"
                        current={-1}
                        items={[
                            {
                                title: 'Cuối tháng: Quản lý tính lương',
                                description: 'Quản lý HR click "Tính lương tháng" hoặc "Tính toàn bộ" để hệ thống tự động tính.',
                                icon: <SettingOutlined />,
                            },
                            {
                                title: 'Hệ thống tự động tính toán',
                                description: (
                                    <div>
                                        <Text>Hệ thống sẽ tính:</Text>
                                        <ul>
                                            <li>Lương theo ngày công thực tế</li>
                                            <li>Tiền làm thêm giờ (theo loại ngày: thường/T7/CN/Lễ)</li>
                                            <li>Thưởng, hoa hồng, phụ cấp (từ cài đặt)</li>
                                            <li>Các khoản trừ: BHXH, BHYT, BHTN, Thuế TNCN</li>
                                            <li>Giảm trừ gia cảnh</li>
                                        </ul>
                                    </div>
                                ),
                                icon: <ClockCircleOutlined />,
                            },
                            {
                                title: 'Quản lý duyệt',
                                description: 'Sau khi kiểm tra, quản lý duyệt bảng lương. Trạng thái chuyển từ "Nháp" → "Đã duyệt".',
                                icon: <CheckCircleOutlined />,
                            },
                            {
                                title: 'Thanh toán',
                                description: 'Sau khi chuyển lương, kế toán đánh dấu "Đã thanh toán" với ngày thanh toán.',
                                icon: <DollarOutlined />,
                            },
                        ]}
                    />

                    <Divider />

                    <Title level={5}>Công thức tính lương chi tiết:</Title>
                    <Table 
                        columns={congThucLuongColumns} 
                        dataSource={congThucLuongData} 
                        pagination={false}
                        size="small"
                        style={{ marginTop: 16 }}
                    />

                    <Divider />

                    <Title level={5}>Bậc thuế TNCN lũy tiến:</Title>
                    <Table 
                        columns={[
                            { title: 'Bậc', dataIndex: 'bac', key: 'bac' },
                            { title: 'Thu nhập tính thuế/tháng', dataIndex: 'thu_nhap', key: 'thu_nhap' },
                            { title: 'Thuế suất', dataIndex: 'thue_suat', key: 'thue_suat', render: (val: string) => <Tag color="red">{val}</Tag> },
                        ]}
                        dataSource={[
                            { key: '1', bac: '1', thu_nhap: 'Đến 5 triệu', thue_suat: '5%' },
                            { key: '2', bac: '2', thu_nhap: 'Trên 5tr - 10tr', thue_suat: '10%' },
                            { key: '3', bac: '3', thu_nhap: 'Trên 10tr - 18tr', thue_suat: '15%' },
                            { key: '4', bac: '4', thu_nhap: 'Trên 18tr - 32tr', thue_suat: '20%' },
                            { key: '5', bac: '5', thu_nhap: 'Trên 32tr - 52tr', thue_suat: '25%' },
                            { key: '6', bac: '6', thu_nhap: 'Trên 52tr - 80tr', thue_suat: '30%' },
                            { key: '7', bac: '7', thu_nhap: 'Trên 80 triệu', thue_suat: '35%' },
                        ]}
                        pagination={false}
                        size="small"
                        style={{ marginTop: 16 }}
                    />

                    <Alert
                        message="Ví dụ tính lương"
                        description={
                            <div>
                                <Text strong>Nhân viên A - Tháng 11/2025:</Text>
                                <ul>
                                    <li>Lương cơ bản: 10,000,000 VNĐ</li>
                                    <li>Ngày công: 24/26 ngày</li>
                                    <li>Làm thêm: 8 giờ (ngày thường)</li>
                                    <li>Thưởng: 1,000,000 VNĐ</li>
                                    <li>Giảm trừ: 11,000,000 + 4,400,000 (bản thân + 1 người phụ thuộc)</li>
                                </ul>
                                <Text strong>Tính toán:</Text>
                                <ol>
                                    <li>Lương ngày công: (10,000,000 ÷ 26) × 24 = 9,230,769 VNĐ</li>
                                    <li>Làm thêm: (10,000,000 ÷ 26 ÷ 8) × 1.5 × 8 = 576,923 VNĐ</li>
                                    <li>Tổng thu nhập: 9,230,769 + 576,923 + 1,000,000 = 10,807,692 VNĐ</li>
                                    <li>BHXH (8%): 800,000 VNĐ</li>
                                    <li>BHYT (1.5%): 150,000 VNĐ</li>
                                    <li>BHTN (1%): 100,000 VNĐ</li>
                                    <li>Thu nhập chịu thuế: 10,807,692 - 1,050,000 - 15,400,000 = -5,642,308 (không đủ → thuế = 0)</li>
                                    <li><Text strong style={{ color: '#52c41a' }}>Thực nhận: 9,757,692 VNĐ</Text></li>
                                </ol>
                            </div>
                        }
                        type="success"
                        showIcon
                        style={{ marginTop: 16 }}
                    />
                </Panel>

                {/* 3. NGHỈ PHÉP */}
                <Panel 
                    header={<Title level={4} style={{ margin: 0 }}><FileTextOutlined /> 3. Đăng ký nghỉ phép</Title>} 
                    key="3"
                >
                    <Alert
                        message="Lưu ý"
                        description="Đơn nghỉ phép phải được gửi trước ít nhất 1 ngày và chờ quản lý duyệt."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    <Title level={5}>Cách đăng ký nghỉ phép:</Title>
                    <Steps
                        direction="vertical"
                        current={-1}
                        items={[
                            {
                                title: 'Bước 1: Vào menu Nghỉ phép',
                                description: 'Truy cập HR → Nghỉ phép',
                            },
                            {
                                title: 'Bước 2: Click "Đăng ký nghỉ phép"',
                                description: 'Click nút "+ Đăng ký nghỉ phép" ở góc trên bên trái',
                            },
                            {
                                title: 'Bước 3: Điền thông tin',
                                description: (
                                    <div>
                                        <Text>Điền đầy đủ:</Text>
                                        <ul>
                                            <li><Text strong>Loại nghỉ:</Text> Phép năm / Ốm đau / Thai sản / Không lương / Khác</li>
                                            <li><Text strong>Thời gian:</Text> Chọn từ ngày - đến ngày (tự động tính số ngày nghỉ)</li>
                                            <li><Text strong>Lý do:</Text> Mô tả ngắn gọn lý do nghỉ</li>
                                        </ul>
                                    </div>
                                ),
                            },
                            {
                                title: 'Bước 4: Gửi đơn',
                                description: 'Click "Gửi đơn". Đơn sẽ ở trạng thái "Chờ duyệt" màu cam.',
                            },
                            {
                                title: 'Bước 5: Chờ duyệt',
                                description: 'Quản lý sẽ duyệt hoặc từ chối đơn. Bạn sẽ thấy trạng thái thay đổi thành "Đã duyệt" (xanh) hoặc "Từ chối" (đỏ).',
                            },
                        ]}
                    />

                    <Divider />

                    <Title level={5}>Các loại nghỉ phép:</Title>
                    <Table 
                        columns={[
                            { title: 'Loại', dataIndex: 'loai', key: 'loai' },
                            { title: 'Mô tả', dataIndex: 'desc', key: 'desc' },
                            { title: 'Có lương?', dataIndex: 'luong', key: 'luong', render: (val: boolean) => (
                                <Tag color={val ? 'green' : 'red'}>{val ? 'Có' : 'Không'}</Tag>
                            )},
                        ]}
                        dataSource={[
                            { key: '1', loai: 'Phép năm', desc: '12 ngày/năm theo luật lao động', luong: true },
                            { key: '2', loai: 'Ốm đau', desc: 'Nghỉ vì lý do sức khỏe (cần giấy bác sĩ)', luong: true },
                            { key: '3', loai: 'Thai sản', desc: 'Nghỉ sinh con (6 tháng)', luong: true },
                            { key: '4', loai: 'Không lương', desc: 'Nghỉ không hưởng lương', luong: false },
                            { key: '5', loai: 'Khác', desc: 'Các loại nghỉ khác (hiếu, hỷ, v.v.)', luong: false },
                        ]}
                        pagination={false}
                        size="small"
                        style={{ marginTop: 16 }}
                    />

                    <Divider />

                    <Title level={5}>Quy trình duyệt đơn:</Title>
                    <Timeline
                        items={[
                            {
                                color: 'blue',
                                children: (
                                    <>
                                        <Tag color="orange">Chờ duyệt</Tag>
                                        <br />
                                        Nhân viên gửi đơn, đợi quản lý xem xét
                                    </>
                                ),
                            },
                            {
                                color: 'green',
                                children: (
                                    <>
                                        <Tag color="green">Đã duyệt</Tag>
                                        <br />
                                        Quản lý đồng ý, nhân viên được phép nghỉ
                                    </>
                                ),
                            },
                            {
                                color: 'red',
                                children: (
                                    <>
                                        <Tag color="red">Từ chối</Tag>
                                        <br />
                                        Quản lý không chấp nhận, có ghi chú lý do
                                    </>
                                ),
                            },
                        ]}
                    />

                    <Alert
                        message="Quy định quan trọng"
                        description={
                            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                                <li>Đơn nghỉ phép phải gửi ít nhất 1 ngày trước (trừ trường hợp đặc biệt)</li>
                                <li>Đơn ở trạng thái "Chờ duyệt" có thể xóa. Đơn đã duyệt/từ chối KHÔNG thể xóa</li>
                                <li>Phép năm còn lại sẽ hiển thị trong hồ sơ nhân viên</li>
                                <li>Nghỉ quá 3 ngày liên tục cần có giấy xác nhận</li>
                            </ul>
                        }
                        type="error"
                        showIcon
                        style={{ marginTop: 16 }}
                    />
                </Panel>

                {/* 4. BÁO CÁO */}
                <Panel 
                    header={<Title level={4} style={{ margin: 0 }}><SettingOutlined /> 4. Báo cáo & Thống kê</Title>} 
                    key="4"
                >
                    <Alert
                        message="Dành cho quản lý"
                        description="Trang báo cáo cung cấp các thống kê tổng hợp, chỉ quản lý HR mới có quyền truy cập."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    <Title level={5}>Các loại báo cáo:</Title>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Card title="Dashboard tổng quan" size="small" style={{ marginBottom: 16 }}>
                                <ul>
                                    <li>Tổng số nhân viên</li>
                                    <li>Nhân viên mới tuyển trong tháng</li>
                                    <li>Nhân viên nghỉ việc</li>
                                    <li>Tổng lương tháng</li>
                                    <li>Biểu đồ phân bổ nhân sự theo chi nhánh</li>
                                </ul>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card title="Báo cáo theo chi nhánh" size="small" style={{ marginBottom: 16 }}>
                                <ul>
                                    <li>Số lượng nhân viên/chi nhánh</li>
                                    <li>Tỷ lệ nam/nữ</li>
                                    <li>Lương trung bình</li>
                                    <li>Tổng lương chi nhánh</li>
                                </ul>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card title="Báo cáo chấm công" size="small" style={{ marginBottom: 16 }}>
                                <ul>
                                    <li>Tổng số ngày làm việc/nhân viên</li>
                                    <li>Số lần đi muộn, về sớm</li>
                                    <li>Tổng giờ làm thêm</li>
                                    <li>Tỷ lệ chấm công đúng giờ</li>
                                    <li>Export Excel</li>
                                </ul>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card title="Báo cáo lương" size="small" style={{ marginBottom: 16 }}>
                                <ul>
                                    <li>Chi tiết bảng lương từng nhân viên</li>
                                    <li>Tổng lương, BHXH, thuế</li>
                                    <li>Thực nhận</li>
                                    <li>So sánh theo tháng</li>
                                    <li>Export PDF/Excel</li>
                                </ul>
                            </Card>
                        </Col>
                    </Row>

                    <Divider />

                    <Title level={5}>Cách sử dụng báo cáo:</Title>
                    <Steps
                        direction="vertical"
                        current={-1}
                        items={[
                            {
                                title: 'Truy cập Dashboard',
                                description: 'Menu HR → Dashboard để xem tổng quan',
                            },
                            {
                                title: 'Chọn bộ lọc',
                                description: 'Chọn tháng, năm, chi nhánh cần xem báo cáo',
                            },
                            {
                                title: 'Xem chi tiết',
                                description: 'Click vào các card số liệu để xem chi tiết',
                            },
                            {
                                title: 'Export dữ liệu',
                                description: 'Click nút "Export Excel" hoặc "Export PDF" để tải về',
                            },
                        ]}
                    />
                </Panel>

                {/* 5. CÀI ĐẶT */}
                <Panel 
                    header={<Title level={4} style={{ margin: 0 }}><UserOutlined /> 5. Cài đặt & Quản lý</Title>} 
                    key="5"
                >
                    <Title level={5}>Các mục cài đặt (Dành cho Admin):</Title>
                    
                    <Collapse 
                        size="small"
                        items={[
                            {
                                key: 'ca',
                                label: <Text strong><CalendarOutlined /> Ca làm việc & Phân ca</Text>,
                                children: (
                                    <div>
                                        <Paragraph>Quản lý các ca làm việc trong công ty:</Paragraph>
                                        <ul>
                                            <li><Text strong>Ca sáng:</Text> 08:00 - 12:00</li>
                                            <li><Text strong>Ca chiều:</Text> 13:00 - 17:00</li>
                                            <li><Text strong>Ca hành chính:</Text> 08:00 - 17:00</li>
                                            <li><Text strong>Ca đêm:</Text> 18:00 - 22:00</li>
                                        </ul>
                                        <Paragraph>Phân ca cho từng nhân viên theo tuần/tháng</Paragraph>
                                    </div>
                                ),
                            },
                            {
                                key: 'hd',
                                label: <Text strong><FileTextOutlined /> Hợp đồng lao động</Text>,
                                children: (
                                    <div>
                                        <Paragraph>Quản lý hợp đồng lao động nhân viên:</Paragraph>
                                        <ul>
                                            <li>Mã hợp đồng tự động: HD-XXXXXX</li>
                                            <li>Loại: Thử việc, 1 năm, 3 năm, Không thời hạn</li>
                                            <li>Ngày ký, ngày hết hạn</li>
                                            <li>Lương cơ bản, phụ cấp, bảo hiểm</li>
                                            <li>Upload file PDF scan hợp đồng</li>
                                        </ul>
                                    </div>
                                ),
                            },
                            {
                                key: 'ts',
                                label: <Text strong><SettingOutlined /> Tài sản công ty</Text>,
                                children: (
                                    <div>
                                        <Paragraph>Quản lý tài sản và cấp phát cho nhân viên:</Paragraph>
                                        <ul>
                                            <li>Danh sách tài sản: Laptop, Điện thoại, Bàn ghế...</li>
                                            <li>Mã tài sản, tình trạng, giá trị</li>
                                            <li>Cấp phát cho nhân viên</li>
                                            <li>Theo dõi bảo trì, thu hồi</li>
                                        </ul>
                                    </div>
                                ),
                            },
                            {
                                key: 'kpi',
                                label: <Text strong><CheckCircleOutlined /> Đánh giá KPI</Text>,
                                children: (
                                    <div>
                                        <Paragraph>Đánh giá hiệu suất công việc nhân viên:</Paragraph>
                                        <ul>
                                            <li>Mã đánh giá tự động: KPI-XXXXXX</li>
                                            <li>Kỳ đánh giá: Tháng/Quý/Năm</li>
                                            <li>Điểm số: 0-100</li>
                                            <li>Xếp loại: Xuất sắc, Tốt, Khá, Trung bình, Yếu</li>
                                            <li>Nhận xét chi tiết</li>
                                            <li>Phần thưởng/Kỷ luật</li>
                                        </ul>
                                    </div>
                                ),
                            },
                        ]}
                    />
                </Panel>

                {/* 6. FAQ */}
                <Panel 
                    header={<Title level={4} style={{ margin: 0 }}><InfoCircleOutlined /> 6. Câu hỏi thường gặp (FAQ)</Title>} 
                    key="6"
                >
                    <Collapse 
                        size="small"
                        items={[
                            {
                                key: 'q1',
                                label: 'Q1: Tôi quên chấm công, làm sao bây giờ?',
                                children: (
                                    <Text>
                                        Bạn vẫn có thể chấm công cho các ngày trong quá khứ. Tuy nhiên, nếu quản lý đã duyệt thì không thể sửa. 
                                        Hãy liên hệ quản lý HR để được hỗ trợ.
                                    </Text>
                                ),
                            },
                            {
                                key: 'q2',
                                label: 'Q2: Tại sao lương tôi ít hơn lương cơ bản?',
                                children: (
                                    <Text>
                                        Lương thực nhận = Lương cơ bản + Làm thêm + Thưởng - BHXH - BHYT - BHTN - Thuế TNCN. 
                                        Ngoài ra, nếu bạn nghỉ không phép hoặc đi muộn, sẽ bị trừ lương theo quy định.
                                    </Text>
                                ),
                            },
                            {
                                key: 'q3',
                                label: 'Q3: Làm thêm giờ có được tính lương không?',
                                children: (
                                    <Text>
                                        Có. Làm thêm giờ được tính 150% (ngày thường), 200% (thứ 7), 300% (CN, lễ). 
                                        Bạn cần nhập số giờ làm thêm vào mục chấm công và chờ quản lý duyệt.
                                    </Text>
                                ),
                            },
                            {
                                key: 'q4',
                                label: 'Q4: Tôi có bao nhiêu ngày phép năm?',
                                children: (
                                    <Text>
                                        Theo luật lao động, mỗi nhân viên có 12 ngày phép/năm. Số ngày phép còn lại được hiển thị trong hồ sơ cá nhân.
                                    </Text>
                                ),
                            },
                            {
                                key: 'q5',
                                label: 'Q5: Đơn nghỉ phép bị từ chối, tôi làm gì?',
                                children: (
                                    <Text>
                                        Kiểm tra ghi chú từ chối của quản lý. Bạn có thể tạo đơn mới với lý do rõ ràng hơn hoặc điều chỉnh thời gian nghỉ. 
                                        Nếu cần thiết, hãy liên hệ trực tiếp quản lý để trao đổi.
                                    </Text>
                                ),
                            },
                            {
                                key: 'q6',
                                label: 'Q6: Tôi có thể xem lương của đồng nghiệp không?',
                                children: (
                                    <Text strong style={{ color: 'red' }}>
                                        KHÔNG. Thông tin lương là bí mật cá nhân. Bạn chỉ có thể xem lương của chính mình. 
                                        Quản lý HR/Admin mới có quyền xem toàn bộ.
                                    </Text>
                                ),
                            },
                            {
                                key: 'q7',
                                label: 'Q7: Tôi muốn thay đổi thông tin cá nhân (SĐT, email...)?',
                                children: (
                                    <Text>
                                        Vào menu Nhân viên → Tìm tên của bạn → Click chỉnh sửa. 
                                        Hoặc liên hệ HR để được hỗ trợ cập nhật thông tin.
                                    </Text>
                                ),
                            },
                            {
                                key: 'q8',
                                label: 'Q8: Hệ thống báo lỗi, tôi phải làm sao?',
                                children: (
                                    <Text>
                                        Chụp màn hình lỗi và gửi cho bộ phận IT hoặc HR. 
                                        Email: it@company.com hoặc hr@company.com. 
                                        Hoặc liên hệ qua Zalo/Telegram nhóm IT Support.
                                    </Text>
                                ),
                            },
                        ]}
                    />
                </Panel>
            </Collapse>

            {/* FOOTER */}
            <Card style={{ marginTop: 24, textAlign: 'center', background: '#fafafa' }} bordered={false}>
                <Paragraph>
                    <InfoCircleOutlined style={{ color: '#1890ff' }} /> 
                    {' '}Nếu có thắc mắc hoặc cần hỗ trợ, vui lòng liên hệ:
                </Paragraph>
                <Space size="large">
                    <Text strong>📧 Email: hr@company.com</Text>
                    <Text strong>📞 Hotline: 1900-xxxx</Text>
                    <Text strong>💬 Zalo: Nhóm HR Support</Text>
                </Space>
                <Divider />
                <Text type="secondary">
                    Phiên bản 1.0 - Cập nhật lần cuối: 10/11/2025
                </Text>
            </Card>
        </div>
    );
}
