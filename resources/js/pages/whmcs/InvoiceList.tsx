import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, DatePicker, message, Popconfirm } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { callApi } from '@/function/api';
import API from '@/common/api';
import dayjs from 'dayjs';

const InvoiceList = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [paymentModal, setPaymentModal] = useState({ visible: false, invoice: null });
    const [form] = Form.useForm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const res = await callApi(API.whmcs_invoicesList, {
                perPage: pagination.pageSize,
                page
            });
            if (res?.success) {
                setData(res.data.data);
                setPagination({ ...pagination, current: page, total: res.data.total });
            }
        } catch (error) {
            message.error('Không thể tải dữ liệu');
        }
        setLoading(false);
    };

    const openPaymentModal = (invoice: any) => {
        setPaymentModal({ visible: true, invoice });
        form.setFieldsValue({
            amount: invoice.total,
            payment_date: dayjs(),
            payment_method: 'Bank Transfer',
            transaction_id: 'TXN-' + Date.now()
        });
    };

    const handleMarkPaid = async (values: any) => {
        try {
            const res = await callApi(
                API.whmcs_invoicesMarkPaid((paymentModal.invoice as any).id),
                {
                    ...values,
                    payment_date: values.payment_date.format('YYYY-MM-DD')
                }
            );
            if (res?.success) {
                message.success('Đánh dấu đã thanh toán thành công');
                setPaymentModal({ visible: false, invoice: null });
                fetchData(pagination.current);
            } else {
                message.error(res?.message || 'Thao tác thất bại');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    const columns = [
        { title: 'Mã HĐ', dataIndex: 'invoice_number', width: 140 },
        {
            title: 'Khách hàng',
            render: (_: any, r: any) => `${r.client?.firstname} ${r.client?.lastname}`,
            width: 180
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'date',
            width: 120
        },
        {
            title: 'Hạn thanh toán',
            dataIndex: 'due_date',
            width: 120,
            render: (date: string, record: any) => {
                const isOverdue = record.status === 'Unpaid' && dayjs(date).isBefore(dayjs());
                return <span style={{ color: isOverdue ? 'red' : 'inherit' }}>{date}</span>;
            }
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            width: 120,
            render: (v: number) => <strong>{v?.toLocaleString()} VNĐ</strong>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 120,
            render: (s: string) => {
                const colors: any = {
                    Paid: 'green',
                    Unpaid: 'red',
                    Cancelled: 'default',
                    Refunded: 'orange'
                };
                return <Tag color={colors[s]}>{s}</Tag>;
            }
        },
        {
            title: 'Ngày thanh toán',
            dataIndex: 'date_paid',
            width: 120,
            render: (v: string) => v || '-'
        },
        {
            title: 'Hành động',
            width: 150,
            fixed: 'right' as const,
            render: (_: any, record: any) => (
                <Space>
                    {record.status === 'Unpaid' && (
                        <Button
                            type="link"
                            icon={<DollarOutlined />}
                            onClick={() => openPaymentModal(record)}
                            size="small"
                        >
                            Thanh toán
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <h2>Quản lý hóa đơn</h2>

            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={pagination}
                onChange={(p) => fetchData(p.current)}
                rowKey="id"
                scroll={{ x: 1200 }}
            />

            <Modal
                title="Đánh dấu đã thanh toán"
                open={paymentModal.visible}
                onCancel={() => setPaymentModal({ visible: false, invoice: null })}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleMarkPaid}>
                    <Form.Item
                        name="amount"
                        label="Số tiền"
                        rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
                    >
                        <Input type="number" suffix="VNĐ" />
                    </Form.Item>

                    <Form.Item
                        name="payment_date"
                        label="Ngày thanh toán"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>

                    <Form.Item
                        name="payment_method"
                        label="Phương thức thanh toán"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="transaction_id"
                        label="Mã giao dịch"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Xác nhận
                            </Button>
                            <Button onClick={() => setPaymentModal({ visible: false, invoice: null })}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default InvoiceList;
