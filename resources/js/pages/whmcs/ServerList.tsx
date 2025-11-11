import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Tag, Space, Input, Select, message, Modal, Form, InputNumber, Switch, Badge, Tooltip, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined, CloudServerOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, ApiOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

interface Server {
  id: number;
  name: string;
  hostname: string;
  ip_address: string;
  type: 'cpanel' | 'plesk' | 'directadmin' | 'other';
  active: boolean;
  max_accounts?: number;
  max_disk_space?: number;
  max_bandwidth?: number;
  usage_stats?: {
    disk_usage: number;
    account_count: number;
    bandwidth_usage: number;
    accounts_available: number;
  };
  group?: { id: number; name: string };
}

const ServerList: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/aio/api/whmcs/servers');
      setServers(response.data.data);
    } catch (error) {
      message.error('Không thể tải danh sách server');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveServer = async (values: any) => {
    try {
      if (editingServer) {
        await axios.put(`/aio/api/whmcs/servers/${editingServer.id}`, values);
        message.success('Cập nhật server thành công');
      } else {
        await axios.post('/aio/api/whmcs/servers', values);
        message.success('Tạo server thành công');
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingServer(null);
      fetchServers();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể lưu server');
    }
  };

  const handleTestConnection = async (server: Server) => {
    try {
      message.loading({ content: 'Đang kiểm tra kết nối...', key: 'test-connection' });
      const response = await axios.post(`/aio/api/whmcs/servers/${server.id}/test-connection`);
      
      if (response.data.success) {
        message.success({
          content: `Kết nối thành công! Version: ${response.data.data.version}, Thời gian phản hồi: ${response.data.data.response_time}s`,
          key: 'test-connection',
          duration: 5,
        });
      } else {
        message.error({
          content: `Kết nối thất bại: ${response.data.data.message}`,
          key: 'test-connection',
        });
      }
    } catch (error: any) {
      message.error({
        content: error.response?.data?.message || 'Không thể kiểm tra kết nối',
        key: 'test-connection',
      });
    }
  };

  const handleSyncAccounts = async (server: Server) => {
    try {
      message.loading({ content: 'Đang đồng bộ...', key: 'sync-accounts' });
      const response = await axios.post(`/aio/api/whmcs/servers/${server.id}/sync-accounts`);
      
      message.success({
        content: `Đã đồng bộ ${response.data.data.synced} accounts, ${response.data.data.failed} thất bại`,
        key: 'sync-accounts',
        duration: 5,
      });
      
      fetchServers();
    } catch (error) {
      message.error({
        content: 'Không thể đồng bộ accounts',
        key: 'sync-accounts',
      });
    }
  };

  const handleToggleStatus = async (server: Server) => {
    try {
      await axios.post(`/aio/api/whmcs/servers/${server.id}/update-status`, {
        active: !server.active,
        reason: !server.active ? 'Enabled by admin' : 'Disabled by admin',
      });
      message.success(`Server đã ${!server.active ? 'bật' : 'tắt'}`);
      fetchServers();
    } catch (error) {
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const handleEdit = (server: Server) => {
    setEditingServer(server);
    form.setFieldsValue(server);
    setIsModalOpen(true);
  };

  const handleDelete = (server: Server) => {
    Modal.confirm({
      title: 'Xóa server',
      content: `Bạn có chắc muốn xóa server ${server.name}?`,
      onOk: async () => {
        try {
          await axios.delete(`/aio/api/whmcs/servers/${server.id}`);
          message.success('Xóa server thành công');
          fetchServers();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Không thể xóa server');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Tên Server',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Server) => (
        <Space>
          <CloudServerOutlined />
          <strong>{text}</strong>
          {!record.active && <Tag color="red">Tắt</Tag>}
        </Space>
      ),
    },
    {
      title: 'Hostname / IP',
      key: 'host',
      render: (_: any, record: Server) => (
        <div>
          <div>{record.hostname}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.ip_address}</div>
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="blue">{type.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Accounts',
      key: 'accounts',
      render: (_: any, record: Server) => {
        const stats = record.usage_stats;
        if (!stats) return '-';
        
        return (
          <Tooltip title={`${stats.account_count} / ${record.max_accounts || '∞'} accounts`}>
            <Badge
              count={`${stats.account_count}/${record.max_accounts || '∞'}`}
              style={{
                backgroundColor: stats.account_count_percentage > 80 ? '#ff4d4f' : '#52c41a',
              }}
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Disk Usage',
      key: 'disk',
      render: (_: any, record: Server) => {
        const stats = record.usage_stats;
        if (!stats) return '-';
        
        const color = stats.disk_usage > 80 ? 'red' : stats.disk_usage > 60 ? 'orange' : 'green';
        return (
          <Tooltip title={`${stats.disk_usage.toFixed(1)}% used`}>
            <Tag color={color}>{stats.disk_usage.toFixed(1)}%</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Bandwidth',
      key: 'bandwidth',
      render: (_: any, record: Server) => {
        const stats = record.usage_stats;
        if (!stats) return '-';
        
        const color = stats.bandwidth_usage > 80 ? 'red' : stats.bandwidth_usage > 60 ? 'orange' : 'green';
        return (
          <Tooltip title={`${stats.bandwidth_usage.toFixed(1)}% used`}>
            <Tag color={color}>{stats.bandwidth_usage.toFixed(1)}%</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Server) => (
        <Space>
          <Tooltip title="Test kết nối">
            <Button
              size="small"
              icon={<ApiOutlined />}
              onClick={() => handleTestConnection(record)}
            />
          </Tooltip>
          <Tooltip title="Đồng bộ accounts">
            <Button
              size="small"
              icon={<SyncOutlined />}
              onClick={() => handleSyncAccounts(record)}
            />
          </Tooltip>
          <Tooltip title={record.active ? 'Tắt server' : 'Bật server'}>
            <Button
              size="small"
              icon={record.active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              onClick={() => handleToggleStatus(record)}
              type={record.active ? 'primary' : 'default'}
            />
          </Tooltip>
          <Button size="small" onClick={() => handleEdit(record)}>Sửa</Button>
          <Button size="small" danger onClick={() => handleDelete(record)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title={<h2 className="text-xl font-semibold">Quản lý Servers</h2>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingServer(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            <span className="hidden sm:inline">Thêm Server mới</span>
            <span className="sm:hidden">Thêm</span>
          </Button>
        }
      >
        <Table
          dataSource={servers}
          columns={columns}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Server Form Modal */}
      <Modal
        title={editingServer ? 'Chỉnh sửa Server' : 'Thêm Server mới'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingServer(null);
        }}
        onOk={() => form.submit()}
        width="100%"
        style={{ maxWidth: 1000, top: 20 }}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveServer}>
          <Row gutter={[16, 0]}>
            {/* Row 1 */}
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Tên Server"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên server' }]}
              >
                <Input placeholder="VD: Server-HN-01" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Hostname"
                name="hostname"
                rules={[{ required: true, message: 'Vui lòng nhập hostname' }]}
              >
                <Input placeholder="VD: server1.example.com" />
              </Form.Item>
            </Col>

            {/* Row 2 */}
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="IP Address"
                name="ip_address"
                rules={[{ required: true, message: 'Vui lòng nhập IP' }]}
              >
                <Input placeholder="VD: 103.123.456.789" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Loại"
                name="type"
                rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
              >
                <Select placeholder="Chọn loại control panel">
                  <Option value="cpanel">cPanel/WHM</Option>
                  <Option value="plesk">Plesk</Option>
                  <Option value="directadmin">DirectAdmin</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Row 3 */}
            <Col xs={24} sm={24} md={12}>
              <Form.Item label="Username" name="username" rules={[{ required: true }]}>
                <Input placeholder="API Username" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12}>
              <Form.Item label="Active" name="active" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>
            </Col>

            {/* Row 4 - Access Hash full width */}
            <Col span={24}>
              <Form.Item label="Access Hash/Token" name="access_hash">
                <Input.TextArea rows={3} placeholder="API Key hoặc Access Hash" />
              </Form.Item>
            </Col>

            {/* Row 5 */}
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Max Accounts" name="max_accounts">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Unlimited" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Max Disk Space (MB)" name="max_disk_space">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Unlimited" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Max Bandwidth (MB)" name="max_bandwidth">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Unlimited" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ServerList;
