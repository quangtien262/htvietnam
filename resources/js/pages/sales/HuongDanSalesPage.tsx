import React from 'react';
import { Collapse, Typography, Steps, Card, Table, Alert } from 'antd';
import { ShoppingCartOutlined, UserOutlined, DollarOutlined, GiftOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

export default function HuongDanSalesPage() {
    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2}>📖 Hướng dẫn Quản lý Bán hàng</Title>
            
            <Alert
                message="Hệ thống quản lý bán hàng toàn diện"
                description="Quản lý khách hàng, đơn hàng, xuất kho, thu tiền, khuyến mãi và báo cáo doanh số."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
            />

            <Collapse defaultActiveKey={['1']}>
                <Panel header={<><UserOutlined /> Quản lý Khách hàng</>} key="1">
                    <Title level={4}>1. Thêm khách hàng</Title>
                    <Steps
                        direction="vertical"
                        current={-1}
                        items={[
                            { title: 'Vào trang Khách hàng', description: 'Click "Thêm khách hàng"' },
                            { title: 'Nhập thông tin', description: 'Tên, SĐT, email, địa chỉ' },
                            { title: 'Phân loại', description: 'VIP, Thường, Mới, Tiềm năng' },
                            { title: 'Lưu', description: 'Hệ thống tự tạo mã KH' },
                        ]}
                    />
                </Panel>

                <Panel header={<><ShoppingCartOutlined /> Đơn hàng</>} key="2">
                    <Title level={4}>Quy trình tạo đơn hàng</Title>
                    <Steps
                        direction="vertical"
                        current={-1}
                        items={[
                            { title: 'Chọn khách hàng', description: 'Tìm kiếm theo tên/SĐT' },
                            { title: 'Thêm sản phẩm', description: 'Chọn SP, số lượng, đơn giá' },
                            { title: 'Áp dụng khuyến mãi', description: 'Nhập mã voucher (nếu có)' },
                            { title: 'Xác nhận', description: 'Gửi đơn hàng' },
                            { title: 'Xuất kho → Giao hàng → Thu tiền', description: 'Hoàn tất quy trình' },
                        ]}
                    />
                    
                    <Title level={4} style={{ marginTop: 16 }}>Trạng thái đơn hàng</Title>
                    <Table
                        size="small"
                        pagination={false}
                        columns={[
                            { title: 'Trạng thái', dataIndex: 'status' },
                            { title: 'Mô tả', dataIndex: 'desc' },
                        ]}
                        dataSource={[
                            { key: '1', status: 'Draft', desc: 'Nháp' },
                            { key: '2', status: 'Pending', desc: 'Chờ xác nhận' },
                            { key: '3', status: 'Confirmed', desc: 'Đã xác nhận' },
                            { key: '4', status: 'Shipping', desc: 'Đang giao hàng' },
                            { key: '5', status: 'Delivered', desc: 'Đã giao' },
                            { key: '6', status: 'Completed', desc: 'Hoàn tất' },
                        ]}
                    />
                </Panel>

                <Panel header={<><DollarOutlined /> Thu tiền</>} key="3">
                    <Title level={4}>Phương thức thanh toán</Title>
                    <ul>
                        <li>Tiền mặt</li>
                        <li>Chuyển khoản</li>
                        <li>Thẻ (Credit/Debit)</li>
                        <li>COD (thu khi giao hàng)</li>
                    </ul>
                    
                    <Alert
                        message="Lưu ý"
                        description="Có thể thanh toán từng phần. Hệ thống tự động cập nhật công nợ."
                        type="warning"
                        showIcon
                    />
                </Panel>

                <Panel header={<><GiftOutlined /> Khuyến mãi</>} key="4">
                    <Title level={4}>Loại khuyến mãi</Title>
                    <ul>
                        <li>Giảm giá % (ví dụ: giảm 10%)</li>
                        <li>Giảm giá tiền (ví dụ: giảm 100,000đ)</li>
                        <li>Mua X tặng Y</li>
                        <li>Combo sản phẩm</li>
                    </ul>
                    
                    <Title level={4}>Mã giảm giá (Voucher)</Title>
                    <Paragraph>
                        Tạo mã voucher với điều kiện: giá trị đơn tối thiểu, số lượng giới hạn, thời gian áp dụng.
                    </Paragraph>
                </Panel>
            </Collapse>

            <Card title="❓ FAQ" style={{ marginTop: 24 }}>
                <Collapse ghost>
                    <Panel header="Làm sao hủy đơn hàng?" key="faq1">
                        <Paragraph>
                            Vào chi tiết đơn hàng, click "Hủy đơn", nhập lý do. 
                            Đơn đã xuất kho không thể hủy, chỉ có thể tạo phiếu trả hàng.
                        </Paragraph>
                    </Panel>
                    <Panel header="Khách hàng trả hàng thì làm sao?" key="faq2">
                        <Paragraph>
                            Tạo "Phiếu trả hàng", chọn sản phẩm trả, số lượng, lý do. 
                            Hệ thống sẽ hoàn tiền hoặc đổi sản phẩm khác.
                        </Paragraph>
                    </Panel>
                </Collapse>
            </Card>

            <Alert
                message="Cần hỗ trợ?"
                description="Liên hệ IT Support: support@company.com | Hotline: 1900-xxxx"
                type="success"
                showIcon
                style={{ marginTop: 24 }}
            />
        </div>
    );
}
