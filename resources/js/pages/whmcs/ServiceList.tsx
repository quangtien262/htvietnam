import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Tag, Space, Input, Select, message, Modal, Form, InputNumber, Drawer, Descriptions, Alert } from 'antd';
import { PlusOutlined, SearchOutlined, PlayCircleOutlined, PauseCircleOutlined, StopOutlined, KeyOutlined, SwapOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;

interface Service {
  id: number;
  client_id: number;
  product_id: number;
  server_id?: number;
  domain: string;
  username?: string;
  status: 'pending' | 'active' | 'suspended' | 'terminated' | 'cancelled';
  billing_cycle: string;
  recurring_amount: number;
  registration_date: string;
  next_due_date: string;
  client?: { company_name: string };
  product?: { name: string; type: string };
  server?: { name: string; hostname: string };
}

const ServiceList: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string> | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    fetchServices();
  }, [pagination.current, filters]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/aio/api/whmcs/services', {
        params: {
          page: pagination.current,
          per_page: pagination.pageSize,
          ...filters,
        },
      });
      setServices(response.data.data);
      setPagination({ ...pagination, total: response.data.total });
    } catch {
      message.error('Không thể tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleProvision = async (service: Service) => {
    Modal.confirm({
      title: 'Provision Service',
      content: `Bạn có chắc muốn provision service cho ${service.domain}?`,
      onOk: async () => {
        try {
          const response = await axios.post(`/aio/api/whmcs/services/${service.id}/provision`, {
            domain: service.domain,
          });
          message.success(response.data.message);
          fetchServices();
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            message.error(error.response?.data?.message || 'Không thể provision');
          }
        }
      },
    });
  };

  const handleSuspend = async (service: Service) => {
    Modal.confirm({
      title: 'Suspend Service',
      content: (
        <Form onFinish={async (values) => {
          try {
            await axios.post(`/aio/api/whmcs/services/${service.id}/suspend`, values);
            message.success('Service đã bị tạm ngưng');
            fetchServices();
            Modal.destroyAll();
          } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
              message.error(error.response?.data?.message || 'Không thể suspend');
            }
          }
        }}>
          <Form.Item label="Lý do" name="reason" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Nhập lý do suspend..." />
          </Form.Item>
          <Button type="primary" htmlType="submit">Xác nhận</Button>
        </Form>
      ),
      footer: null,
    });
  };

  const handleUnsuspend = async (service: Service) => {
    try {
      await axios.post(`/aio/api/whmcs/services/${service.id}/unsuspend`);
      message.success('Service đã được khôi phục');
      fetchServices();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        message.error(error.response?.data?.message || 'Không thể unsuspend');
      }
    }
  };

  const handleTerminate = async (service: Service) => {
    Modal.confirm({
      title: 'Terminate Service',
      content: 'CẢNH BÁO: Hành động này sẽ XÓA VĨNH VIỄN service! Bạn có chắc chắn?',
      okText: 'Xóa vĩnh viễn',
      okType: 'danger',
      onOk: async () => {
        try {
          await axios.post(`/aio/api/whmcs/services/${service.id}/terminate`, {
            delete_backups: false,
          });
          message.success('Service đã bị terminate');
          fetchServices();
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            message.error(error.response?.data?.message || 'Không thể terminate');
          }
        }
      },
    });
  };

  const handleViewCredentials = async (service: Service) => {
    try {
      const response = await axios.get(`/aio/api/whmcs/services/${service.id}/credentials`);
      setCredentials(response.data.data);
      setSelectedService(service);
      setIsCredentialsModalOpen(true);
    } catch {
      message.error('Không thể lấy thông tin đăng nhập');
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'default',
    active: 'success',
    suspended: 'warning',
    terminated: 'error',
    cancelled: 'default',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Chờ provision',
    active: 'Hoạt động',
    suspended: 'Tạm ngưng',
    terminated: 'Đã xóa',
    cancelled: 'Đã hủy',
  };

  const columns = [
    {
      title: 'Domain',
      dataIndex: 'domain',
      key: 'domain',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Khách hàng',
      dataIndex: ['client', 'company_name'],
      key: 'client',
    },
    {
      title: 'Sản phẩm',
      dataIndex: ['product', 'name'],
      key: 'product',
    },
    {
      title: 'Server',
      dataIndex: ['server', 'name'],
      key: 'server',
      render: (text: string) => text || <Tag>Chưa assign</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'recurring_amount',
      key: 'price',
      render: (amount: number, record: Service) => (
        <div>
          <div>{amount.toLocaleString()} VNĐ</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.billing_cycle}</div>
        </div>
      ),
    },
    {
      title: 'Hạn gia hạn',
      dataIndex: 'next_due_date',
      key: 'next_due_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: Service) => (
        <Space>
          {record.status === 'pending' && (
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleProvision(record)}
            >
              Provision
            </Button>
          )}
          {record.status === 'active' && (
            <>
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewCredentials(record)}
              >
                Thông tin
              </Button>
              <Button
                danger
                size="small"
                icon={<PauseCircleOutlined />}
                onClick={() => handleSuspend(record)}
              >
                Suspend
              </Button>
            </>
          )}
          {record.status === 'suspended' && (
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleUnsuspend(record)}
            >
              Unsuspend
            </Button>
          )}
          {(record.status === 'active' || record.status === 'suspended') && (
            <Button
              danger
              size="small"
              icon={<StopOutlined />}
              onClick={() => handleTerminate(record)}
            >
              Terminate
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title={<h2 className="text-xl font-semibold">Quản lý Services (Hosting/Domain)</h2>}
      >
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Tìm domain hoặc username"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            allowClear
          />
          <Select
            placeholder="Trạng thái"
            style={{ width: 150 }}
            onChange={(value) => setFilters({ ...filters, status: value })}
            allowClear
          >
            <Option value="pending">Chờ provision</Option>
            <Option value="active">Hoạt động</Option>
            <Option value="suspended">Tạm ngưng</Option>
            <Option value="terminated">Đã xóa</Option>
          </Select>
        </Space>

        <Table
          dataSource={services}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            onChange: (page) => setPagination({ ...pagination, current: page }),
          }}
        />
      </Card>

      {/* Credentials Modal */}
      <Modal
        title={`Thông tin đăng nhập - ${selectedService?.domain}`}
        open={isCredentialsModalOpen}
        onCancel={() => {
          setIsCredentialsModalOpen(false);
          setCredentials(null);
          setSelectedService(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsCredentialsModalOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        {credentials && (
          <>
            <Alert
              message="Thông tin nhạy cảm"
              description="Vui lòng không chia sẻ thông tin này với người khác"
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Username">{credentials.username}</Descriptions.Item>
              <Descriptions.Item label="Password">
                <Input.Password value={credentials.password} readOnly />
              </Descriptions.Item>
              <Descriptions.Item label="Server IP">{credentials.server_ip}</Descriptions.Item>
              <Descriptions.Item label="Control Panel URL">
                <a href={credentials.control_panel_url} target="_blank" rel="noopener noreferrer">
                  {credentials.control_panel_url}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="Nameserver 1">{credentials.nameserver1}</Descriptions.Item>
              <Descriptions.Item label="Nameserver 2">{credentials.nameserver2}</Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ServiceList;
