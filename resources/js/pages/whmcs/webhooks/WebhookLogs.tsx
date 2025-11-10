import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Card, Modal, message, Space, Drawer } from 'antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import FilterBar from '@/components/whmcs/FilterBar';

interface WebhookLog {
    id: number;
    event: string;
    status: 'success' | 'failed';
    response_code: number;
    response_time: number;
    error_message: string | null;
    payload: any;
    response: any;
    created_at: string;
}

const WebhookLogs: React.FC = () => {
    const { id } = useParams();
    const [logs, setLogs] = useState<WebhookLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [filters, setFilters] = useState<any>({ status: '' });
    const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
    const [drawerVisible, setDrawerVisible] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, [id, pagination.current, filters]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/aio/api/whmcs/webhooks/${id}/logs`, {
                params: {
                    page: pagination.current,
                    per_page: pagination.pageSize,
                    ...filters,
                },
            });
            if (response.data.success) {
                setLogs(response.data.data);
                setPagination(prev => ({ ...prev, total: response.data.meta.total }));
            }
        } catch {
            message.error('Không thể tải logs!');
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async (logId: number) => {
        try {
            const response = await axios.post(`/aio/api/whmcs/webhooks/${id}/retry`, { log_id: logId });
            if (response.data.success) {
                message.success('Retry thành công!');
                fetchLogs();
            }
        } catch {
            message.error('Retry thất bại!');
        }
    };

    const handleViewDetail = (log: WebhookLog) => {
        setSelectedLog(log);
        setDrawerVisible(true);
    };

    const columns = [
        {
            title: 'Event',
            dataIndex: 'event',
            key: 'event',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'success' ? 'green' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Response Code',
            dataIndex: 'response_code',
            key: 'response_code',
        },
        {
            title: 'Response Time',
            dataIndex: 'response_time',
            key: 'response_time',
            render: (time: number) => `${time}ms`,
        },
        {
            title: 'Time',
            dataIndex: 'created_at',
            key: 'created_at',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: WebhookLog) => (
                <Space>
                    <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
                        Chi Tiết
                    </Button>
                    {record.status === 'failed' && (
                        <Button size="small" onClick={() => handleRetry(record.id)}>
                            Retry
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card 
                title="Webhook Logs"
                extra={
                    <Button icon={<ReloadOutlined />} onClick={fetchLogs}>
                        Làm Mới
                    </Button>
                }
            >
                <FilterBar
                    filters={[
                        {
                            type: 'select',
                            name: 'status',
                            placeholder: 'Status',
                            options: [
                                { label: 'All', value: '' },
                                { label: 'Success', value: 'success' },
                                { label: 'Failed', value: 'failed' },
                            ],
                        },
                    ]}
                    onFilterChange={setFilters}
                />

                <Table
                    columns={columns}
                    dataSource={logs}
                    rowKey="id"
                    loading={loading}
                    pagination={pagination}
                    onChange={(newPagination) => setPagination(newPagination as any)}
                />
            </Card>

            <Drawer
                title="Log Detail"
                open={drawerVisible}
                onClose={() => setDrawerVisible(false)}
                width={600}
            >
                {selectedLog && (
                    <div>
                        <h3>Payload</h3>
                        <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                            {JSON.stringify(selectedLog.payload, null, 2)}
                        </pre>

                        <h3 style={{ marginTop: 24 }}>Response</h3>
                        <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                            {JSON.stringify(selectedLog.response, null, 2)}
                        </pre>

                        {selectedLog.error_message && (
                            <>
                                <h3 style={{ marginTop: 24 }}>Error Message</h3>
                                <pre style={{ background: '#fff2f0', padding: 12, borderRadius: 4, color: 'red' }}>
                                    {selectedLog.error_message}
                                </pre>
                            </>
                        )}
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default WebhookLogs;
