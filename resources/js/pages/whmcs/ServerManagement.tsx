import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, Switch, message, Statistic, Row, Col, Popconfirm, Tag, Space, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ApiOutlined, HddOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { callApi } from '@/function/api';
import { API } from '@/common/api';

const { Option } = Select;
const { TextArea } = Input;

interface Server {
  id: number;
  name: string;
  type: 'cpanel' | 'plesk' | 'directadmin' | 'custom';
  hostname: string;
  ip_address: string;
  port: number;
  username: string;
  max_accounts: number;
  current_accounts: number;
  nameserver1?: string;
  nameserver2?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ServerManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Server[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Server | null>(null);
  const [form] = Form.useForm();
  const [testingConnection, setTestingConnection] = useState<number | null>(null);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalAccounts: 0,
    capacity: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await callApi(API.whmcs_serversList, {});
      if (response?.success) {
        setData(response.data || []);
        calculateStats(response.data || []);
      }
    } catch (error) {
      message.error('Không thể tải danh sách server');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (servers: Server[]) => {
    const total = servers.length;
    const active = servers.filter(s => s.is_active).length;
    const totalAccounts = servers.reduce((sum, s) => sum + (s.current_accounts || 0), 0);
    const maxAccounts = servers.reduce((sum, s) => sum + (s.max_accounts || 0), 0);
    const capacity = maxAccounts > 0 ? (totalAccounts / maxAccounts) * 100 : 0;

    setStats({ total, active, totalAccounts, capacity });
  };

  const openModal = (record?: Server) => {
    if (record) {
      setEditingRecord(record);
      form.setFieldsValue({
        ...record,
        password: '', // Don't populate password for security
      });
    } else {
      setEditingRecord(null);
      form.resetFields();
      form.setFieldsValue({
        is_active: true,
        port: 2087, // Default cPanel port
        type: 'cpanel'
      });
    }
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      let response;

      if (editingRecord) {
        response = await callApi(API.whmcs_serversUpdate(editingRecord.id), values);
      } else {
        response = await callApi(API.whmcs_serversAdd, values);
      }

      if (response?.success) {
        message.success(editingRecord ? 'Cập nhật server thành công' : 'Thêm server thành công');
        setModalVisible(false);
        form.resetFields();
        fetchData();
      } else {
        message.error(response?.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu server');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await callApi(API.whmcs_serversDelete(id), { id });
      if (response?.success) {
        message.success('Xóa server thành công');
        fetchData();
      } else {
        message.error(response?.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa server');
    }
  };

  const testConnection = async (record: Server) => {
    setTestingConnection(record.id);
    try {
      const response = await callApi(API.whmcs_serversTestConnection(record.id), {});
      if (response?.success) {
        message.success('Kết nối server thành công!');
      } else {
        message.error(response?.message || 'Không thể kết nối đến server');
      }
    } catch (error) {
      message.error('Lỗi khi test kết nối');
    } finally {
      setTestingConnection(null);
    }
  };

  const getServerTypeTag = (type: string) => {
    const colors: Record<string, string> = {
      cpanel: 'blue',
      plesk: 'green',
      directadmin: 'orange',
      custom: 'default'
    };
    return <Tag color={colors[type] || 'default'}>{type.toUpperCase()}</Tag>;
  };

  const getCapacityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return '#ff4d4f';
    if (percentage >= 70) return '#faad14';
    return '#52c41a';
  };

  const columns = [
    {
      title: 'Tên Server',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => getServerTypeTag(type),
    },
    {
      title: 'Hostname',
      dataIndex: 'hostname',
      key: 'hostname',
      width: 180,
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 130,
    },
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port',
      width: 80,
    },
    {
      title: 'Tài khoản',
      key: 'accounts',
      width: 120,
      render: (_: any, record: Server) => (
        <span style={{ color: getCapacityColor(record.current_accounts || 0, record.max_accounts || 100) }}>
          {record.current_accounts || 0}/{record.max_accounts || 0}
        </span>
      ),
    },
    {
      title: 'Nameservers',
      key: 'nameservers',
      width: 180,
      render: (_: any, record: Server) => (
        <div style={{ fontSize: '12px' }}>
          {record.nameserver1 && <div>NS1: {record.nameserver1}</div>}
          {record.nameserver2 && <div>NS2: {record.nameserver2}</div>}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (is_active: boolean) => (
        is_active ?
        <Tag icon={<CheckCircleOutlined />} color="success">Active</Tag> :
        <Tag icon={<CloseCircleOutlined />} color="default">Inactive</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: Server) => (
        <Space size="small">
          <Tooltip title="Test kết nối">
            <Button
              type="link"
              size="small"
              icon={<ApiOutlined />}
              loading={testingConnection === record.id}
              onClick={() => testConnection(record)}
            />
          </Tooltip>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa server?"
            description="Server sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số Server"
              value={stats.total}
              prefix={<HddOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Server hoạt động"
              value={stats.active}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng tài khoản"
              value={stats.totalAccounts}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Công suất sử dụng"
              value={stats.capacity}
              precision={1}
              suffix="%"
              valueStyle={{ color: stats.capacity >= 80 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Server List */}
      <Card
        title="Quản lý Server"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Thêm Server
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} server`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingRecord ? 'Sửa Server' : 'Thêm Server'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên Server"
                rules={[{ required: true, message: 'Vui lòng nhập tên server' }]}
              >
                <Input placeholder="VD: Server 1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Loại Server"
                rules={[{ required: true, message: 'Vui lòng chọn loại server' }]}
              >
                <Select placeholder="Chọn loại server">
                  <Option value="cpanel">cPanel</Option>
                  <Option value="plesk">Plesk</Option>
                  <Option value="directadmin">DirectAdmin</Option>
                  <Option value="custom">Custom</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="hostname"
                label="Hostname"
                rules={[{ required: true, message: 'Vui lòng nhập hostname' }]}
              >
                <Input placeholder="server1.example.com" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="port"
                label="Port"
                rules={[{ required: true, message: 'Vui lòng nhập port' }]}
              >
                <Input type="number" placeholder="2087" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="ip_address"
            label="IP Address"
            rules={[{ required: true, message: 'Vui lòng nhập IP address' }]}
          >
            <Input placeholder="192.168.1.1" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Vui lòng nhập username' }]}
              >
                <Input placeholder="root" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="password"
                label={editingRecord ? "Password (để trống nếu không đổi)" : "Password"}
                rules={editingRecord ? [] : [{ required: true, message: 'Vui lòng nhập password' }]}
              >
                <Input.Password placeholder="••••••••" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nameserver1"
                label="Nameserver 1"
              >
                <Input placeholder="ns1.example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nameserver2"
                label="Nameserver 2"
              >
                <Input placeholder="ns2.example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="max_accounts"
            label="Số tài khoản tối đa"
            rules={[{ required: true, message: 'Vui lòng nhập số tài khoản tối đa' }]}
          >
            <Input type="number" placeholder="100" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea rows={3} placeholder="Ghi chú về server..." />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServerManagement;
