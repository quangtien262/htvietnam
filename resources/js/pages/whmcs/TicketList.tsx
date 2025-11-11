import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, message, Descriptions, List, Drawer } from 'antd';
import { PlusOutlined, EyeOutlined, MessageOutlined, CloseOutlined } from '@ant-design/icons';
import { callApi } from '@/function/api';
import API from '@/common/api';

const { Option } = Select;
const { TextArea } = Input;

const TicketList = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [replyDrawer, setReplyDrawer] = useState({ visible: false, ticket: null });
    const [form] = Form.useForm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const res = await callApi(API.whmcs_ticketsList, {
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

    const viewTicket = async (ticket: any) => {
        const res = await callApi(API.whmcs_ticketsDetail(ticket.id), {});
        if (res?.success) {
            setReplyDrawer({ visible: true, ticket: res.data });
        }
    };

    const handleReply = async (values: any) => {
        try {
            const res = await callApi(
                API.whmcs_ticketsReply((replyDrawer.ticket as any).id),
                {
                    ...values,
                    admin_id: 1 // Should get from auth context
                }
            );
            if (res?.success) {
                message.success('Gửi phản hồi thành công');
                form.resetFields();
                viewTicket(replyDrawer.ticket); // Reload ticket
            } else {
                message.error(res?.message || 'Gửi thất bại');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    const closeTicket = async (id: any) => {
        const res = await callApi(API.whmcs_ticketsClose(id), {});
        if (res?.success) {
            message.success('Đóng ticket thành công');
            setReplyDrawer({ visible: false, ticket: null });
            fetchData(pagination.current);
        }
    };

    const columns = [
        { title: 'Mã Ticket', dataIndex: 'ticket_number', width: 140 },
        {
            title: 'Khách hàng',
            render: (_: any, r: any) => `${r.client?.firstname} ${r.client?.lastname}`,
            width: 180
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'subject',
            width: 300
        },
        {
            title: 'Phòng ban',
            dataIndex: ['department', 'name'],
            width: 150
        },
        {
            title: 'Ưu tiên',
            dataIndex: ['priority', 'name'],
            width: 100,
            render: (name: string, record: any) => {
                const colors: any = { Low: 'green', Medium: 'orange', High: 'red' };
                return <Tag color={colors[name]}>{name}</Tag>;
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 120,
            render: (s: string) => {
                const colors: any = {
                    Open: 'blue',
                    Answered: 'green',
                    'Customer-Reply': 'orange',
                    Closed: 'default'
                };
                return <Tag color={colors[s]}>{s}</Tag>;
            }
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            width: 120
        },
        {
            title: 'Hành động',
            width: 120,
            fixed: 'right' as const,
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => viewTicket(record)}
                        size="small"
                    >
                        Xem
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <h2>Quản lý Tickets Hỗ trợ</h2>

            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={pagination}
                onChange={(p) => fetchData(p.current)}
                rowKey="id"
                scroll={{ x: 1300 }}
            />

            <Drawer
                title={`Ticket: ${(replyDrawer.ticket as any)?.ticket_number}`}
                placement="right"
                width={700}
                open={replyDrawer.visible}
                onClose={() => setReplyDrawer({ visible: false, ticket: null })}
                extra={
                    replyDrawer.ticket && (replyDrawer.ticket as any).status !== 'Closed' && (
                        <Button type="primary" danger onClick={() => closeTicket((replyDrawer.ticket as any).id)}>
                            Đóng Ticket
                        </Button>
                    )
                }
            >
                {replyDrawer.ticket && (
                    <div>
                        <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
                            <h4>Thông tin Ticket</h4>
                            <p><strong>Khách hàng:</strong> {(replyDrawer.ticket as any).client?.firstname} {(replyDrawer.ticket as any).client?.lastname}</p>
                            <p><strong>Email:</strong> {(replyDrawer.ticket as any).client?.email}</p>
                            <p><strong>Tiêu đề:</strong> {(replyDrawer.ticket as any).subject}</p>
                            <p><strong>Trạng thái:</strong> <Tag color="blue">{(replyDrawer.ticket as any).status}</Tag></p>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <h4>Nội dung ban đầu</h4>
                            <div style={{ padding: 12, background: '#fff', border: '1px solid #d9d9d9', borderRadius: 4 }}>
                                {(replyDrawer.ticket as any).message}
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <h4>Phản hồi ({(replyDrawer.ticket as any).replies?.length || 0})</h4>
                            {(replyDrawer.ticket as any).replies?.map((reply: any) => (
                                <div
                                    key={reply.id}
                                    style={{
                                        padding: 12,
                                        marginBottom: 8,
                                        background: reply.admin_reply ? '#e6f7ff' : '#fff',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: 4
                                    }}
                                >
                                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                                        {reply.admin_reply ? (
                                            <strong>Admin</strong>
                                        ) : (
                                            <strong>Khách hàng</strong>
                                        )} - {reply.created_at}
                                    </div>
                                    <div>{reply.message}</div>
                                </div>
                            ))}
                        </div>

                        {(replyDrawer.ticket as any).status !== 'Closed' && (
                            <Form form={form} layout="vertical" onFinish={handleReply}>
                                <Form.Item
                                    name="message"
                                    label="Phản hồi của bạn"
                                    rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                                >
                                    <TextArea rows={4} placeholder="Nhập phản hồi..." />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" icon={<MessageOutlined />}>
                                        Gửi phản hồi
                                    </Button>
                                </Form.Item>
                            </Form>
                        )}
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default TicketList;
