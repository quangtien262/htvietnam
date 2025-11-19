import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { API } from "../common/api";
import {
    Modal,
    Card,
    Row,
    Col,
    Descriptions,
    Statistic,
    Divider,
    Table,
    Tag,
    Typography,
    Tabs,
    List,
    message,
    Button,
    Space
} from "antd";
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    HomeOutlined,
    FileTextOutlined,
    DollarOutlined,
    IdcardOutlined,
    CloseOutlined
} from "@ant-design/icons";
import { numberFormat } from "../function/common";

interface CustomerDetailModalProps {
    visible: boolean;
    customerId: number | null;
    onClose: () => void;
    onEdit?: (customerId: number) => void;
    onLogin?: (customerId: number) => void;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
    visible,
    customerId,
    onClose,
    onEdit,
    onLogin
}) => {
    const [loading, setLoading] = useState(false);
    const [customerData, setCustomerData] = useState<any>(null);

    useEffect(() => {
        if (visible && customerId) {
            fetchCustomerDetail();
        } else {
            setCustomerData(null);
        }
    }, [visible, customerId]);

    const fetchCustomerDetail = async () => {
        if (!customerId) return;

        setLoading(true);
        try {
            const response = await axios.post(API.customerDetail, { id: customerId });
            if (response.status === 200) {
                setCustomerData(response.data.data);
            }
        } catch (error) {
            message.error("Lỗi tải thông tin khách hàng");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const khachHang = customerData?.khachHang;
    const hoaDon = customerData?.hoaDon || [];

    // Columns for invoice history table
    const invoiceColumns = [
        {
            title: 'Mã HĐ',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Kỳ',
            key: 'period',
            render: (_: any, record: any) => `${String(record.month).padStart(2, '0')}/${record.year}`
        },
        {
            title: 'Tiền phòng',
            dataIndex: 'tien_phong',
            key: 'tien_phong',
            // align: 'right' as const,
            render: (val: number) => numberFormat(val)
        },
        {
            title: 'Dịch vụ',
            key: 'services',
            render: (_: any, record: any) => {
                const totalService = record.services?.reduce((sum: number, s: any) => sum + (s.price_total || 0), 0) || 0;
                return numberFormat(totalService);
            }
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            key: 'total',
            // align: 'right' as const,
            render: (val: number) => (
                <Typography.Text strong style={{ color: '#1890ff' }}>
                    {numberFormat(val)}
                </Typography.Text>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'aitilen_invoice_status_id',
            key: 'aitilen_invoice_status_id',
            render: (text: string) => {
                return text === '1' ? <Tag color="green">Đã thanh toán</Tag>: text === '2' ? <Tag color="red">Chưa thanh toán</Tag> : <Tag color="orange">Còn công nợ</Tag>;
            }
        },
        {
            title: 'Ngày hẹn',
            dataIndex: 'ngay_hen_dong_tien',
            key: 'ngay_hen_dong_tien',
            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
        }
    ];

    return (
        <Modal
            title={
                <Space>
                    <UserOutlined />
                    <span>Thông tin khách hàng {khachHang?.code ? `- ${khachHang.code}` : ''}</span>
                </Space>
            }
            open={visible}
            onCancel={onClose}
            width="90%"
            style={{ maxWidth: 1200, top: 20 }}
            footer={[
                <Button key="close" onClick={onClose} icon={<CloseOutlined />}>
                    Đóng
                </Button>,
                ...(onEdit ? [
                    <Button key="edit" type="primary" onClick={() => customerId && onEdit(customerId)}>
                        Cập nhật thông tin
                    </Button>
                ] : []),
                ...(onLogin ? [
                    <Button key="login" onClick={() => customerId && onLogin(customerId)}>
                        Login
                    </Button>
                ] : [])
            ]}
            loading={loading}
        >
            {customerData && (
                <Tabs
                    defaultActiveKey="info"
                    items={[
                        {
                            key: 'info',
                            label: (
                                <span>
                                    <UserOutlined />
                                    Thông tin khách hàng
                                </span>
                            ),
                            children: (
                                <Row gutter={[16, 16]}>
                                    {/* Thông tin cơ bản */}
                                    <Col xs={24} md={12}>
                                        <Card title="Thông tin cơ bản" size="small">
                                            <Descriptions column={1} size="small">
                                                <Descriptions.Item label={<><IdcardOutlined /> Mã KH</>}>
                                                    {khachHang?.code}
                                                </Descriptions.Item>
                                                <Descriptions.Item label={<><UserOutlined /> Họ tên</>}>
                                                    <Typography.Text strong>{khachHang?.name}</Typography.Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label={<><PhoneOutlined /> Điện thoại</>}>
                                                    {khachHang?.phone}
                                                </Descriptions.Item>
                                                <Descriptions.Item label={<><MailOutlined /> Email</>}>
                                                    {khachHang?.email || '-'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Giới tính">
                                                    {khachHang?.gioi_tinh_id === 1 ? 'Nam' : khachHang?.gioi_tinh_id === 2 ? 'Nữ' : '-'}
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Card>
                                    </Col>

                                    {/* Thông tin tài chính */}
                                    <Col xs={24} md={12}>
                                        <Card title="Thông tin CCCD" size="small">
                                            <Descriptions column={1} size="small">
                                                <Descriptions.Item label="CCCD">
                                                    {khachHang?.cccd || '-'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Ngày sinh">
                                                    {khachHang?.ngay_sinh || '-'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Nơi cấp">
                                                    {khachHang?.noi_cap || '-'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="HKTT">
                                                    {khachHang?.hktt || '-'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label={<><HomeOutlined /> Mã số thuế</>}>
                                                    {khachHang?.ma_so_thue || '-'}
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Card>
                                    </Col>

                                    {/* Thông tin bổ sung */}
                                    {(khachHang?.cong_ty || khachHang?.mst || khachHang?.note) && (
                                        <Col xs={24}>
                                            <Card title="Thông tin bổ sung" size="small">
                                                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                                                    {khachHang?.cong_ty && (
                                                        <Descriptions.Item label="Công ty">
                                                            {khachHang.cong_ty}
                                                        </Descriptions.Item>
                                                    )}
                                                    {khachHang?.mst && (
                                                        <Descriptions.Item label="MST">
                                                            {khachHang.mst}
                                                        </Descriptions.Item>
                                                    )}
                                                    {khachHang?.note && (
                                                        <Descriptions.Item label="Ghi chú" span={2}>
                                                            {khachHang.note}
                                                        </Descriptions.Item>
                                                    )}
                                                </Descriptions>
                                            </Card>
                                        </Col>
                                    )}
                                </Row>
                            )
                        },
                        {
                            key: 'invoice',
                            label: (
                                <span>
                                    <FileTextOutlined />
                                    Lịch sử hóa đơn ({hoaDon.length})
                                </span>
                            ),
                            children: (
                                <Card size="small">
                                    <Table
                                        columns={invoiceColumns}
                                        dataSource={hoaDon}
                                        rowKey="id"
                                        size="small"
                                        pagination={{ pageSize: 5 }}
                                        scroll={{ x: 800 }}
                                        expandable={{
                                            expandedRowRender: (invoiceRecord: any) => (
                                                <div style={{ padding: '8px', backgroundColor: '#fafafa' }}>
                                                    <Typography.Text strong>Chi tiết dịch vụ:</Typography.Text>
                                                    <List
                                                        size="small"
                                                        dataSource={invoiceRecord.services || []}
                                                        renderItem={(service: any) => (
                                                            <List.Item>
                                                                <List.Item.Meta
                                                                    title={service.name}
                                                                    description={service.note}
                                                                />
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <div>
                                                                        <Typography.Text type="secondary">
                                                                            Đơn giá: {numberFormat(service.price_default)}/{service.per_default}
                                                                        </Typography.Text>
                                                                    </div>
                                                                    <div>
                                                                        <Typography.Text strong>
                                                                            {numberFormat(service.price_total)}
                                                                        </Typography.Text>
                                                                    </div>
                                                                </div>
                                                            </List.Item>
                                                        )}
                                                        style={{ marginTop: 8 }}
                                                    />
                                                </div>
                                            ),
                                        }}
                                    />
                                </Card>
                            )
                        }
                    ]}
                />
            )}
        </Modal>
    );
};

export default CustomerDetailModal;
