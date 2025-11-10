import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, Input, Select, Badge, Tabs } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const TicketList: React.FC = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchTickets();
    }, [filterStatus]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filterStatus !== 'all') {
                params.status = filterStatus;
            }

            const response = await axios.get('/aio/api/whmcs/tickets', { params });
            setTickets(response.data.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const viewTicketDetail = async (ticketId: number) => {
        try {
            const response = await axios.get(`/aio/api/whmcs/tickets/${ticketId}`);
            setSelectedTicket(response.data);
            setDetailModalVisible(true);
        } catch (error) {
            console.error('Error fetching ticket detail:', error);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;

        try {
            await axios.post(`/aio/api/whmcs/tickets/${selectedTicket.id}/reply`, {
                message: replyText,
                is_internal: false,
                admin_user_id: 1, // TODO: Get from auth
            });

            setReplyText('');
            viewTicketDetail(selectedTicket.id); // Refresh
        } catch (error) {
            console.error('Error sending reply:', error);
        }
    };

    const updateStatus = async (ticketId: number, status: string) => {
        try {
            await axios.put(`/aio/api/whmcs/tickets/${ticketId}/status`, { status });
            fetchTickets();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const columns = [
        {
            title: 'Ticket #',
            dataIndex: 'ticket_number',
            key: 'ticket_number',
            width: 120,
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
        },
        {
            title: 'Client',
            dataIndex: ['client', 'company_name'],
            key: 'client',
            render: (text: string, record: any) => text || record.client?.user?.name,
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
            render: (dept: string) => <Tag color="blue">{dept.toUpperCase()}</Tag>,
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority: string) => {
                const colors: Record<string, string> = {
                    low: 'green',
                    medium: 'orange',
                    high: 'red',
                    urgent: 'purple',
                };
                return <Tag color={colors[priority]}>{priority.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors: Record<string, string> = {
                    open: 'blue',
                    awaiting_reply: 'orange',
                    in_progress: 'cyan',
                    answered: 'green',
                    closed: 'gray',
                };
                return <Tag color={colors[status]}>{status.replace('_', ' ').toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Assigned To',
            dataIndex: ['assigned_to_user', 'name'],
            key: 'assigned_to',
            render: (name: string) => name || <span style={{ color: '#ccc' }}>Unassigned</span>,
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right' as const,
            width: 150,
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => viewTicketDetail(record.id)}
                    >
                        View
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h1>🎫 Support Tickets</h1>
            </div>

            <Tabs activeKey={filterStatus} onChange={setFilterStatus}>
                <TabPane tab={<Badge count={tickets.length}>All Tickets</Badge>} key="all" />
                <TabPane tab="Open" key="open" />
                <TabPane tab="In Progress" key="in_progress" />
                <TabPane tab="Answered" key="answered" />
                <TabPane tab="Closed" key="closed" />
            </Tabs>

            <Table
                columns={columns}
                dataSource={tickets}
                loading={loading}
                rowKey="id"
                scroll={{ x: 1200 }}
            />

            {/* Ticket Detail Modal */}
            <Modal
                title={`Ticket #${selectedTicket?.ticket_number}`}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                width={800}
                footer={null}
            >
                {selectedTicket && (
                    <div>
                        <div style={{ marginBottom: '16px' }}>
                            <strong>Subject:</strong> {selectedTicket.subject}
                            <br />
                            <strong>Client:</strong> {selectedTicket.client?.company_name || selectedTicket.client?.user?.name}
                            <br />
                            <strong>Department:</strong> <Tag>{selectedTicket.department}</Tag>
                            <br />
                            <strong>Priority:</strong> <Tag>{selectedTicket.priority}</Tag>
                            <br />
                            <strong>Status:</strong> <Tag>{selectedTicket.status}</Tag>
                        </div>

                        <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '16px' }}>
                            {selectedTicket.replies?.map((reply: any, index: number) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '12px',
                                        marginBottom: '8px',
                                        background: reply.author_type.includes('Client') ? '#f0f0f0' : '#e6f7ff',
                                        borderRadius: '4px',
                                    }}
                                >
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                                        <strong>{reply.author?.name || 'Client'}</strong> - {new Date(reply.created_at).toLocaleString()}
                                    </div>
                                    <div>{reply.message}</div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <TextArea
                                rows={4}
                                placeholder="Type your reply..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                            />
                            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                                <Button type="primary" onClick={handleReply}>
                                    Send Reply
                                </Button>
                                <Select
                                    style={{ width: 150 }}
                                    placeholder="Change Status"
                                    onChange={(value) => updateStatus(selectedTicket.id, value)}
                                >
                                    <Option value="open">Open</Option>
                                    <Option value="in_progress">In Progress</Option>
                                    <Option value="answered">Answered</Option>
                                    <Option value="closed">Closed</Option>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TicketList;
