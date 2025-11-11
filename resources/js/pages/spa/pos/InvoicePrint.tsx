import React from 'react';
import { Descriptions, Divider, Table, Typography } from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface InvoicePrintProps {
    invoice: any;
}

const InvoicePrint: React.FC<InvoicePrintProps> = ({ invoice }) => {
    if (!invoice) return null;

    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            width: 50,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Tên sản phẩm/Dịch vụ',
            dataIndex: 'ten',
            key: 'ten',
        },
        {
            title: 'SL',
            dataIndex: 'so_luong',
            key: 'so_luong',
            width: 60,
            align: 'center' as const,
        },
        {
            title: 'Đơn giá',
            dataIndex: 'don_gia',
            key: 'don_gia',
            width: 120,
            align: 'right' as const,
            render: (value: number) => value.toLocaleString(),
        },
        {
            title: 'Thành tiền',
            key: 'thanh_tien',
            width: 120,
            align: 'right' as const,
            render: (record: any) => (record.don_gia * record.so_luong).toLocaleString(),
        },
    ];

    const chiTiets = invoice.chiTiets?.map((ct: any) => ({
        ten: ct.dichVu?.ten_dich_vu || ct.sanPham?.ten_san_pham || 'N/A',
        so_luong: ct.so_luong,
        don_gia: ct.don_gia,
    })) || [];

    return (
        <div style={{ padding: 40, background: 'white' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <Title level={2}>SPA & BEAUTY</Title>
                <Text>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</Text>
                <br />
                <Text>Điện thoại: 0123-456-789</Text>
                <br />
                <Title level={3} style={{ marginTop: 20 }}>HÓA ĐƠN THANH TOÁN</Title>
                <Text type="secondary">Số: {invoice.ma_hoa_don}</Text>
            </div>

            <Divider />

            {/* Customer Info */}
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 20 }}>
                <Descriptions.Item label="Khách hàng" span={2}>
                    {invoice.khachHang?.ho_ten || 'Khách lẻ'}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                    {invoice.khachHang?.so_dien_thoai || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày">
                    {dayjs(invoice.ngay_tao).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
            </Descriptions>

            {/* Items Table */}
            <Table
                dataSource={chiTiets}
                columns={columns}
                pagination={false}
                size="small"
                bordered
                style={{ marginBottom: 20 }}
            />

            {/* Payment Summary */}
            <div style={{ marginLeft: 'auto', width: 400, float: 'right' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>Tạm tính:</Text>
                    <Text strong>{(invoice.tong_thanh_toan || 0).toLocaleString()} VNĐ</Text>
                </div>

                {invoice.giam_gia_thanh_vien > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text>Giảm giá thành viên:</Text>
                        <Text type="danger">-{invoice.giam_gia_thanh_vien.toLocaleString()} VNĐ</Text>
                    </div>
                )}

                {invoice.giam_gia_voucher > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text>Giảm giá voucher:</Text>
                        <Text type="danger">-{invoice.giam_gia_voucher.toLocaleString()} VNĐ</Text>
                    </div>
                )}

                {invoice.diem_su_dung > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text>Điểm sử dụng ({invoice.diem_su_dung} điểm):</Text>
                        <Text type="danger">-{(invoice.diem_su_dung * 10000).toLocaleString()} VNĐ</Text>
                    </div>
                )}

                {invoice.tien_tip > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text>Tiền tip:</Text>
                        <Text>+{invoice.tien_tip.toLocaleString()} VNĐ</Text>
                    </div>
                )}

                <Divider style={{ margin: '12px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Title level={4}>Tổng cộng:</Title>
                    <Title level={4} style={{ color: '#52c41a' }}>
                        {(invoice.tong_thanh_toan || 0).toLocaleString()} VNĐ
                    </Title>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>Thanh toán:</Text>
                    <Text strong>{invoice.phuong_thuc_thanh_toan || 'Tiền mặt'}</Text>
                </div>
            </div>

            <div style={{ clear: 'both', paddingTop: 60 }}>
                <Divider />
                <div style={{ textAlign: 'center' }}>
                    <Text type="secondary">
                        Cảm ơn quý khách đã sử dụng dịch vụ!
                        <br />
                        Hẹn gặp lại quý khách!
                    </Text>
                </div>
            </div>
        </div>
    );
};

export default InvoicePrint;
