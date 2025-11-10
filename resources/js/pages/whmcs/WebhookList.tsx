import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Tag, Space, Input, Switch, message, Modal, Form, Select, Drawer, Descriptions, Badge, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, ThunderboltOutlined, DeleteOutlined, EditOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import API from '@/common/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface Webhook {
  id: number;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  total_triggers: number;
  failed_triggers: number;
  last_triggered_at: string | null;
  created_at: string;
}

interface WebhookLog {
  id: number;
  event: string;
  http_status: number | null;
  success: boolean;
  duration_ms: number | null;
  error_message: string | null;
  sent_at: string;
  attempt_number: number;
}

const WebhookList: React.FC = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState<any>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Record<string, string>>({});
  const [form] = Form.useForm();

  useEffect(() => {
    fetchWebhooks();
    fetchAvailableEvents();
  }, [pagination.current, filters]);

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API.whmcsWebhookList, {
        params: {
          page: pagination.current,
          per_page: pagination.pageSize,
          ...filters,
        },
      });
      setWebhooks(response.data.data);
      setPagination({ ...pagination, total: response.data.total });
    } catch (error) {
      message.error('Không thể tải danh sách webhook');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableEvents = async () => {
    try {
      const response = await axios.get(API.whmcsWebhookEvents);
      setAvailableEvents(response.data.events);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchWebhookLogs = async (webhookId: number) => {
    try {
      const response = await axios.get(API.whmcsWebhookLogs(webhookId));
      setWebhookLogs(response.data.data);
    } catch (error) {
      message.error('Không thể tải logs');
    }
  };

  const handleCreateOrUpdate = async (values: any) => {
    try {
      if (editingWebhook) {
        await axios.put(API.whmcsWebhookUpdate(editingWebhook.id), values);
        message.success('Cập nhật webhook thành công');
      } else {
        await axios.post(API.whmcsWebhookStore, values);
        message.success('Tạo webhook thành công');
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingWebhook(null);
      fetchWebhooks();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = (webhook: Webhook) => {
    Modal.confirm({
      title: 'Xóa webhook',
      content: `Bạn có chắc muốn xóa webhook "${webhook.name}"?`,
      onOk: async () => {
        try {
          await axios.delete(API.whmcsWebhookDelete(webhook.id));
          message.success('Xóa webhook thành công');
          fetchWebhooks();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Không thể xóa webhook');
        }
      },
    });
  };

  const handleToggleActive = async (webhook: Webhook) => {
    try {
      await axios.post(API.whmcsWebhookToggle(webhook.id));
      message.success('Cập nhật trạng thái thành công');
      fetchWebhooks();
    } catch (error) {
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const handleTest = async (webhook: Webhook) => {
    try {
      const response = await axios.post(API.whmcsWebhookTest(webhook.id));
      if (response.data.success) {
        message.success('Test webhook thành công');
      } else {
        message.error('Test webhook thất bại');
      }
      fetchWebhooks();
    } catch (error) {
      message.error('Không thể test webhook');
    }
  };

  const handleRetryLog = async (webhook: Webhook, logId: number) => {
    try {
      const response = await axios.post(API.whmcsWebhookRetry(webhook.id, logId));
      if (response.data.success) {
        message.success('Retry thành công');
        fetchWebhookLogs(webhook.id);
      } else {
        message.error('Retry thất bại');
      }
    } catch (error) {
      message.error('Không thể retry webhook');
    }
  };

  const handleViewLogs = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    fetchWebhookLogs(webhook.id);
    setIsLogDrawerOpen(true);
  };

  const getSuccessRate = (webhook: Webhook) => {
    if (webhook.total_triggers === 0) return 0;
    const successful = webhook.total_triggers - webhook.failed_triggers;
    return ((successful / webhook.total_triggers) * 100).toFixed(1);
  };

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Webhook) => (
        <div>
          <div><strong>{text}</strong></div>
          <div style={{ fontSize: '12px', color: '#888' }}>{record.url}</div>
        </div>
      ),
    },
    {
      title: 'Events',
      dataIndex: 'events',
      key: 'events',
      render: (events: string[]) => (
        <div>
          {events.slice(0, 2).map((event) => (
            <Tag key={event} color="blue" style={{ marginBottom: 4 }}>
              {event}
            </Tag>
          ))}
          {events.length > 2 && <Tag>+{events.length - 2} more</Tag>}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean, record: Webhook) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: 'Thống kê',
      key: 'stats',
      render: (_: any, record: Webhook) => (
        <div>
          <div>Triggers: {record.total_triggers}</div>
          <div>Success: {getSuccessRate(record)}%</div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            {record.last_triggered_at
              ? `Last: ${dayjs(record.last_triggered_at).format('DD/MM/YYYY HH:mm')}`
              : 'Chưa trigger'}
          </div>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Webhook) => (
        <Space>
          <Tooltip title="Test webhook">
            <Button
              type="primary"
              size="small"
              icon={<ThunderboltOutlined />}
              onClick={() => handleTest(record)}
            >
              Test
            </Button>
          </Tooltip>
          <Tooltip title="Xem logs">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewLogs(record)}
            >
              Logs
            </Button>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingWebhook(record);
                form.setFieldsValue(record);
                setIsModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const logColumns = [
    {
      title: 'Event',
      dataIndex: 'event',
      key: 'event',
      render: (event: string) => <Tag color="purple">{event}</Tag>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: WebhookLog) => (
        <div>
          {record.success ? (
            <Badge status="success" text={`HTTP ${record.http_status}`} />
          ) : (
            <Badge status="error" text={record.error_message || 'Failed'} />
          )}
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration_ms',
      key: 'duration_ms',
      render: (ms: number | null) => (ms ? `${ms.toFixed(2)} ms` : 'N/A'),
    },
    {
      title: 'Attempt',
      dataIndex: 'attempt_number',
      key: 'attempt_number',
    },
    {
      title: 'Sent At',
      dataIndex: 'sent_at',
      key: 'sent_at',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: WebhookLog) =>
        !record.success && selectedWebhook ? (
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => handleRetryLog(selectedWebhook, record.id)}
          >
            Retry
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="p-6">
      <Card
        title={<h2 className="text-xl font-semibold">Quản lý Webhooks WHMCS</h2>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingWebhook(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Tạo Webhook
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Tìm kiếm tên, URL"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            allowClear
          />
        </Space>

        <Table
          dataSource={webhooks}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            onChange: (page) => setPagination({ ...pagination, current: page }),
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingWebhook ? 'Chỉnh sửa Webhook' : 'Tạo Webhook mới'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingWebhook(null);
        }}
        onOk={() => form.submit()}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateOrUpdate}>
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên webhook' }]}
          >
            <Input placeholder="My Webhook" />
          </Form.Item>

          <Form.Item
            label="URL"
            name="url"
            rules={[
              { required: true, message: 'Vui lòng nhập URL' },
              { type: 'url', message: 'URL không hợp lệ' },
            ]}
          >
            <Input placeholder="https://example.com/webhook" />
          </Form.Item>

          <Form.Item label="Secret Key" name="secret">
            <Input.Password placeholder="Dùng để xác thực webhook (optional)" />
          </Form.Item>

          <Form.Item
            label="Events"
            name="events"
            rules={[{ required: true, message: 'Chọn ít nhất 1 event' }]}
          >
            <Select mode="multiple" placeholder="Chọn events">
              {Object.entries(availableEvents).map(([key, label]) => (
                <Option key={key} value={key}>
                  {label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Custom Headers" name="custom_headers">
            <TextArea
              rows={3}
              placeholder='{"Authorization": "Bearer token", "X-Custom": "value"}'
            />
          </Form.Item>

          <Space>
            <Form.Item label="Retry Attempts" name="retry_attempts" initialValue={3}>
              <Input type="number" min={0} max={10} style={{ width: 100 }} />
            </Form.Item>

            <Form.Item label="Timeout (s)" name="timeout" initialValue={30}>
              <Input type="number" min={5} max={120} style={{ width: 100 }} />
            </Form.Item>

            <Form.Item label="Verify SSL" name="verify_ssl" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Modal>

      {/* Logs Drawer */}
      <Drawer
        title={`Webhook Logs - ${selectedWebhook?.name}`}
        placement="right"
        onClose={() => setIsLogDrawerOpen(false)}
        open={isLogDrawerOpen}
        width={900}
      >
        {selectedWebhook && (
          <>
            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="URL">{selectedWebhook.url}</Descriptions.Item>
              <Descriptions.Item label="Total Triggers">{selectedWebhook.total_triggers}</Descriptions.Item>
              <Descriptions.Item label="Failed Triggers">{selectedWebhook.failed_triggers}</Descriptions.Item>
              <Descriptions.Item label="Success Rate">{getSuccessRate(selectedWebhook)}%</Descriptions.Item>
            </Descriptions>

            <Table
              dataSource={webhookLogs}
              columns={logColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 10 }}
            />
          </>
        )}
      </Drawer>
    </div>
  );
};

export default WebhookList;
