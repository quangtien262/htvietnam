import React from 'react';
import { Collapse, Typography, Divider, Steps, Card, Row, Col, Table, Alert, Tag } from 'antd';
import {
    ShopOutlined,
    TagsOutlined,
    FileDoneOutlined,
    InboxOutlined,
    DollarOutlined,
    BarChartOutlined,
    SettingOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

export default function HuongDanPurchasePage() {
    const trangThaiDonHangColumns = [
        { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
        { title: 'Mô tả', dataIndex: 'desc', key: 'desc' },
    ];

    const trangThaiDonHangData = [
        { key: '1', status: 'Draft', desc: 'Đơn hàng nháp, chưa gửi đi' },
        { key: '2', status: 'Pending', desc: 'Đã gửi, chờ NCC xác nhận' },
        { key: '3', status: 'Confirmed', desc: 'NCC đã xác nhận đơn hàng' },
        { key: '4', status: 'Partial', desc: 'Nhận hàng một phần' },
        { key: '5', status: 'Completed', desc: 'Hoàn tất, đã nhận đủ hàng' },
        { key: '6', status: 'Cancelled', desc: 'Đã hủy đơn hàng' },
    ];

    const chiPhiColumns = [
        { title: 'Loại chi phí', dataIndex: 'type', key: 'type' },
        { title: 'Cách tính', dataIndex: 'formula', key: 'formula' },
    ];

    const chiPhiData = [
        { key: '1', type: 'Tiền hàng', formula: 'Số lượng × Đơn giá' },
        { key: '2', type: 'VAT', formula: 'Tiền hàng × % VAT (thường 10%)' },
        { key: '3', type: 'Phí vận chuyển', formula: 'Nhập trực tiếp hoặc tính theo km/kg' },
        { key: '4', type: 'Chi phí khác', formula: 'Bốc xếp, kho bãi, hải quan...' },
        { key: '5', type: 'Tổng cộng', formula: 'Tiền hàng + VAT + Vận chuyển + Chi phí khác' },
    ];

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2}>📖 Hướng dẫn sử dụng Hệ thống Quản lý Mua hàng</Title>

            <Alert
                message="Chào mừng!"
                description="Hệ thống Quản lý Mua hàng giúp quản lý nhà cung cấp, hàng hóa, đơn mua hàng, nhập kho và thanh toán một cách chuyên nghiệp."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
            />

            <Collapse defaultActiveKey={['1']} accordion>
                <Panel header={<><ShopOutlined /> Quản lý Nhà cung cấp</>} key="1">
                    <Title level={4}>1. Thêm nhà cung cấp mới</Title>
                    <Steps
                        direction="vertical"
                        current={-1}
                        items={[
                            {
                                title: 'Vào trang Nhà cung cấp',
                                description: 'Click menu "Nhà cung cấp" bên trái',
                            },
                            {
                                title: 'Tạo mới',
                                description: 'Click nút "Thêm nhà cung cấp"',
                            },
                            {
                                title: 'Nhập thông tin',
                                description: 'Tên NCC, mã số thuế, địa chỉ, số điện thoại, email, người liên hệ',
                            },
                            {
                                title: 'Lưu',
                                description: 'Hệ thống tự động tạo mã NCC (ví dụ: NCC001)',
                            },
                        ]}
                    />

                    <Divider />

                    <Title level={4}>2. Thông tin quan trọng</Title>
                    <Paragraph>
                        <ul>
                            <li><strong>Mã số thuế:</strong> Bắt buộc để xuất hóa đơn VAT</li>
                            <li><strong>Người liên hệ:</strong> Ghi rõ tên + SĐT để dễ liên lạc</li>
                            <li><strong>Điều khoản thanh toán:</strong> COD, T/T 7 ngày, T/T 15 ngày, T/T 30 ngày</li>
                            <li><strong>Trạng thái:</strong> Đang hoạt động / Ngưng hợp tác</li>
                        </ul>
                    </Paragraph>

                    <Alert
                        message="Lưu ý"
                        description="Kiểm tra kỹ mã số thuế trước khi lưu. NCC có MST sai sẽ không xuất được hóa đơn đỏ."
                        type="warning"
                        showIcon
                    />
                </Panel>

                <Panel header={<><TagsOutlined /> Quản lý Hàng hóa</>} key="2">
                    <Title level={4}>1. Tạo hàng hóa mới</Title>
                    <Steps
                        direction="vertical"
                        current={-1}
                        items={[
                            {
                                title: 'Vào trang Hàng hóa',
                                description: 'Click menu "Hàng hóa"',
                            },
                            {
                                title: 'Thêm mới',
                                description: 'Click nút "Thêm hàng hóa"',
                            },
                            {
                                title: 'Nhập thông tin',
                                description: 'Tên, mã SKU, loại hàng, đơn vị tính, giá nhập, giá bán',
                            },
                            {
                                title: 'Upload ảnh (tùy chọn)',
                                description: 'Chọn ảnh sản phẩm để dễ nhận biết',
                            },
                            {
                                title: 'Lưu',
                                description: 'Hệ thống tự động tạo mã hàng hóa',
                            },
                        ]}
                    />

                    <Divider />

                    <Title level={4}>2. Phân loại hàng hóa</Title>
                    <Paragraph>
                        Vào <Text strong>Cài đặt → Loại hàng hóa</Text> để tạo các danh mục:
                    </Paragraph>
                    <ul>
                        <li>Nguyên vật liệu</li>
                        <li>Thiết bị văn phòng</li>
                        <li>Vật tư tiêu hao</li>
                        <li>Tài sản cố định</li>
                        <li>Hàng hóa khác</li>
                    </ul>

                    <Divider />

                    <Title level={4}>3. Quản lý tồn kho</Title>
                    <Paragraph>
                        Hệ thống tự động cập nhật số lượng tồn kho khi:
                    </Paragraph>
                    <ul>
                        <li><Tag color="green">Nhập kho</Tag> → Tăng tồn</li>
                        <li><Tag color="red">Xuất kho</Tag> → Giảm tồn</li>
                        <li><Tag color="orange">Kiểm kê</Tag> → Điều chỉnh tồn</li>
                    </ul>
                </Panel>

                <Panel header={<><FileDoneOutlined /> Đơn mua hàng</>} key="3">
                    <Title level={4}>1. Quy trình tạo đơn mua hàng</Title>
                    <Steps
                        direction="vertical"
                        current={-1}
                        items={[
                            {
                                title: 'Tạo đơn hàng',
                                description: 'Chọn NCC, chọn hàng hóa, nhập số lượng và đơn giá',
                            },
                            {
                                title: 'Kiểm tra chi phí',
                                description: 'Xem tổng tiền hàng, VAT, vận chuyển, tổng cộng',
                            },
                            {
                                title: 'Lưu nháp hoặc gửi',
                                description: 'Lưu nháp để chỉnh sửa sau, hoặc gửi ngay cho NCC',
                            },
                            {
                                title: 'Chờ xác nhận',
                                description: 'NCC xác nhận đơn hàng qua email/điện thoại',
                            },
                            {
                                title: 'Cập nhật trạng thái',
                                description: 'Đánh dấu "Confirmed" khi NCC xác nhận',
                            },
                        ]}
                    />

                    <Divider />

                    <Title level={4}>2. Các trạng thái đơn hàng</Title>
                    <Table columns={trangThaiDonHangColumns} dataSource={trangThaiDonHangData} pagination={false} size="small" />

                    <Divider />

                    <Title level={4}>3. Cách tính chi phí</Title>
                    <Table columns={chiPhiColumns} dataSource={chiPhiData} pagination={false} size="small" />

                    <Alert
                        message="Mẹo hay"
                        description="Sử dụng chức năng 'Nhân bản đơn hàng' để tạo đơn mới từ đơn cũ, tiết kiệm thời gian."
                        type="success"
                        showIcon
                        style={{ marginTop: 16 }}
                    />
                </Panel>

                <Panel header={<><InboxOutlined /> Nhập kho</>} key="4">
                    <Title level={4}>1. Quy trình nhập kho</Title>
                    <Steps
                        direction="vertical"
                        current={-1}
                        items={[
                            {
                                title: 'Nhận hàng',
                                description: 'Khi hàng về kho, kiểm đếm số lượng thực tế',
                            },
                            {
                                title: 'Tạo phiếu nhập',
                                description: 'Chọn đơn mua hàng tương ứng, nhập số lượng thực nhận',
                            },
                            {
                                title: 'Kiểm tra chất lượng',
                                description: 'Ghi chú hàng lỗi, hàng thiếu (nếu có)',
                            },
                            {
                                title: 'Xác nhận nhập kho',
                                description: 'Hệ thống tự động cập nhật tồn kho',
                            },
                            {
                                title: 'In phiếu nhập',
                                description: 'In phiếu để lưu trữ và đối chiếu',
                            },
                        ]}
                    />

                    <Divider />

                    <Title level={4}>2. Nhập từng phần (Partial Receipt)</Title>
                    <Paragraph>
                        Nếu NCC giao hàng nhiều đợt:
                    </Paragraph>
                    <ol>
                        <li>Tạo phiếu nhập cho đợt 1 với số lượng thực nhận</li>
                        <li>Đơn hàng tự động chuyển trạng thái "Partial"</li>
                        <li>Khi nhận đợt 2, tạo phiếu nhập mới</li>
                        <li>Khi nhận đủ, đơn hàng chuyển "Completed"</li>
                    </ol>

                    <Alert
                        message="Quan trọng"
                        description={
                            <ul style={{ marginBottom: 0 }}>
                                <li>Luôn kiểm đếm kỹ trước khi nhập vào hệ thống</li>
                                <li>Chụp ảnh hàng hóa khi có vấn đề để đối chiếu</li>
                                <li>Ghi rõ lý do nếu số lượng thực tế khác đơn hàng</li>
                            </ul>
                        }
                        type="warning"
                        showIcon
                    />
                </Panel>

                <Panel header={<><DollarOutlined /> Thanh toán NCC</>} key="5">
                    <Title level={4}>1. Quy trình thanh toán</Title>
                    <Steps
                        direction="vertical"
                        current={-1}
                        items={[
                            {
                                title: 'Xem công nợ',
                                description: 'Kiểm tra các đơn hàng chưa thanh toán của NCC',
                            },
                            {
                                title: 'Tạo phiếu thanh toán',
                                description: 'Chọn đơn hàng cần thanh toán, nhập số tiền',
                            },
                            {
                                title: 'Chọn phương thức',
                                description: 'Tiền mặt, Chuyển khoản, Séc, Thẻ',
                            },
                            {
                                title: 'Chuyển tiền',
                                description: 'Thực hiện chuyển khoản hoặc trả tiền mặt',
                            },
                            {
                                title: 'Xác nhận',
                                description: 'Upload hóa đơn/chứng từ, đánh dấu "Đã thanh toán"',
                            },
                        ]}
                    />

                    <Divider />

                    <Title level={4}>2. Thanh toán từng phần</Title>
                    <Paragraph>
                        Có thể thanh toán một phần cho đơn hàng:
                    </Paragraph>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Card size="small" title="Ví dụ">
                                <Paragraph>
                                    Đơn hàng: <Text strong>100,000,000 VNĐ</Text><br />
                                    Đợt 1: Thanh toán <Tag color="blue">30,000,000</Tag> (30%)<br />
                                    Đợt 2: Thanh toán <Tag color="blue">70,000,000</Tag> (70%)<br />
                                    Trạng thái: <Tag color="green">Đã thanh toán đủ</Tag>
                                </Paragraph>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card size="small" title="Lợi ích">
                                <ul>
                                    <li>Quản lý dòng tiền linh hoạt</li>
                                    <li>Theo dõi công nợ chính xác</li>
                                    <li>Đối chiếu dễ dàng</li>
                                </ul>
                            </Card>
                        </Col>
                    </Row>

                    <Divider />

                    <Title level={4}>3. Báo cáo công nợ</Title>
                    <Paragraph>
                        Xem báo cáo công nợ NCC theo:
                    </Paragraph>
                    <ul>
                        <li><strong>Theo NCC:</strong> Tổng nợ từng nhà cung cấp</li>
                        <li><strong>Theo thời gian:</strong> Nợ quá hạn, nợ trong hạn</li>
                        <li><strong>Theo đơn hàng:</strong> Chi tiết từng đơn chưa thanh toán</li>
                    </ul>
                </Panel>

                <Panel header={<><BarChartOutlined /> Báo cáo</>} key="6">
                    <Title level={4}>Dashboard Mua hàng</Title>
                    <Paragraph>
                        Báo cáo tổng quan bao gồm:
                    </Paragraph>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Card size="small" title="📊 Thống kê chung">
                                <ul>
                                    <li>Tổng giá trị mua hàng</li>
                                    <li>Số đơn hàng trong tháng</li>
                                    <li>Số NCC đang hợp tác</li>
                                    <li>Số hàng hóa đang quản lý</li>
                                </ul>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card size="small" title="💰 Tài chính">
                                <ul>
                                    <li>Tổng công nợ phải trả</li>
                                    <li>Đã thanh toán</li>
                                    <li>Chưa thanh toán</li>
                                    <li>Nợ quá hạn</li>
                                </ul>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card size="small" title="📦 Kho hàng">
                                <ul>
                                    <li>Tổng giá trị tồn kho</li>
                                    <li>Hàng sắp hết</li>
                                    <li>Hàng tồn kho lâu</li>
                                    <li>Nhập/Xuất trong tháng</li>
                                </ul>
                            </Card>
                        </Col>
                    </Row>

                    <Divider />

                    <Title level={4}>Biểu đồ trực quan</Title>
                    <ul>
                        <li>Biểu đồ cột: Giá trị mua hàng theo tháng</li>
                        <li>Biểu đồ tròn: Tỷ lệ mua hàng theo NCC</li>
                        <li>Biểu đồ đường: xu hướng tồn kho theo thời gian</li>
                    </ul>
                </Panel>

                <Panel header={<><SettingOutlined /> Cài đặt hệ thống</>} key="7">
                    <Title level={4}>Các cài đặt quan trọng</Title>

                    <Paragraph>
                        <strong>1. Loại hàng hóa:</strong> Phân loại hàng hóa theo mục đích sử dụng
                    </Paragraph>
                    <Paragraph>
                        <strong>2. Trạng thái đơn hàng:</strong> Tùy chỉnh quy trình phê duyệt đơn hàng
                    </Paragraph>
                    <Paragraph>
                        <strong>3. Phương thức thanh toán:</strong> Thêm/sửa các hình thức thanh toán
                    </Paragraph>
                    <Paragraph>
                        <strong>4. Thuế VAT:</strong> Cấu hình tỷ lệ thuế mặc định (0%, 5%, 10%)
                    </Paragraph>
                    <Paragraph>
                        <strong>5. Đơn vị tính:</strong> Cái, Hộp, Thùng, Kg, Lít, Mét...
                    </Paragraph>

                    <Divider />

                    <Title level={4}>Phân quyền người dùng</Title>
                    <Table
                        size="small"
                        pagination={false}
                        columns={[
                            { title: 'Vai trò', dataIndex: 'role' },
                            { title: 'Quyền hạn', dataIndex: 'permission' },
                        ]}
                        dataSource={[
                            { key: '1', role: 'Admin', permission: 'Toàn quyền, cấu hình hệ thống' },
                            { key: '2', role: 'Purchase Manager', permission: 'Tạo đơn, duyệt thanh toán' },
                            { key: '3', role: 'Warehouse Staff', permission: 'Nhập/xuất kho, kiểm kê' },
                            { key: '4', role: 'Accountant', permission: 'Xem báo cáo, theo dõi công nợ' },
                        ]}
                    />
                </Panel>
            </Collapse>

            <Divider />

            <Card title="❓ Câu hỏi thường gặp (FAQ)" style={{ marginTop: 24 }}>
                <Collapse ghost>
                    <Panel header="Làm sao sửa đơn hàng đã gửi?" key="faq1">
                        <Paragraph>
                            Nếu đơn hàng ở trạng thái "Pending" hoặc "Confirmed", liên hệ NCC để thay đổi.
                            Sau đó vào chi tiết đơn hàng, click "Chỉnh sửa" và cập nhật thông tin mới.
                        </Paragraph>
                    </Panel>
                    <Panel header="Hủy đơn hàng như thế nào?" key="faq2">
                        <Paragraph>
                            Vào chi tiết đơn hàng, click nút "Hủy đơn". Ghi rõ lý do hủy.
                            Lưu ý: Đơn hàng đã nhập kho không thể hủy, chỉ có thể tạo phiếu trả hàng.
                        </Paragraph>
                    </Panel>
                    <Panel header="Tồn kho âm là do đâu?" key="faq3">
                        <Paragraph>
                            Tồn kho âm xảy ra khi xuất kho nhiều hơn nhập kho. Nguyên nhân:
                        </Paragraph>
                        <ul>
                            <li>Chưa nhập phiếu nhập kho</li>
                            <li>Xuất kho nhầm số lượng</li>
                            <li>Chưa kiểm kê đầu kỳ</li>
                        </ul>
                        <Paragraph>
                            Giải pháp: Kiểm tra lại phiếu nhập/xuất, tạo phiếu kiểm kê điều chỉnh.
                        </Paragraph>
                    </Panel>
                    <Panel header="Làm sao theo dõi hàng sắp hết?" key="faq4">
                        <Paragraph>
                            Vào trang "Hàng hóa", sử dụng bộ lọc "Tồn kho thấp".
                            Hệ thống sẽ cảnh báo khi tồn kho {"<"} mức tồn tối thiểu (thiết lập trong thông tin hàng hóa).
                        </Paragraph>
                    </Panel>
                    <Panel header="Xuất báo cáo Excel như thế nào?" key="faq5">
                        <Paragraph>
                            Tại trang Báo cáo, chọn kỳ báo cáo, click nút "Xuất Excel" ở góc phải màn hình.
                            File Excel sẽ bao gồm: Danh sách đơn hàng, chi tiết nhập/xuất kho, công nợ NCC.
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
