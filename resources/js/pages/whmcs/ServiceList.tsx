import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Tag, Space, Input, Select, message, Modal, Form, InputNumber, Drawer, Descriptions, Alert, DatePicker, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined, PlayCircleOutlined, PauseCircleOutlined, StopOutlined, KeyOutlined, SwapOutlined, EyeOutlined, UnorderedListOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { ROUTE } from '@/common/route';

const { Option } = Select;

interface Service {
  id: number;
  user_id: number;
  product_id: number;
  server_id?: number;
  domain: string;
  username?: string;
  status: 'pending' | 'active' | 'suspended' | 'terminated' | 'cancelled';
  billing_cycle: string;
  recurring_amount: number;
  registration_date: string;
  next_due_date: string;
  user?: { name: string; email: string };
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [products, setProducts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    fetchServices();
    fetchProducts();
    fetchClients();
  }, [pagination.current, filters]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/aio/api/whmcs/products');
      const data = response.data.data || response.data;
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      message.error('Không thể tải danh sách sản phẩm');
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get('/aio/api/whmcs/clients');
      const data = response.data.data || response.data;
      setClients(Array.isArray(data) ? data : []);
    } catch {
      message.error('Không thể tải danh sách khách hàng');
    }
  };

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

  const handleCreateService = async (values: any) => {
    try {
      // Format date to YYYY-MM-DD
      const payload = {
        ...values,
        next_due_date: values.next_due_date ? dayjs(values.next_due_date).format('YYYY-MM-DD') : undefined,
      };
      
      await axios.post('/aio/api/whmcs/services', payload);
      message.success('Tạo service mới thành công');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      fetchServices();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errors = error.response?.data?.errors;
        if (errors) {
          // Hiển thị lỗi validation từng field
          Object.keys(errors).forEach((key) => {
            message.error(`${key}: ${errors[key][0]}`);
          });
        } else {
          message.error(error.response?.data?.message || 'Không thể tạo service');
        }
      }
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
      dataIndex: ['user', 'name'],
      key: 'user',
      render: (_: any, record: Service) => record.user?.name || '-',
    },
    {
      title: 'Sản phẩm',
      dataIndex: ['product', 'name'],
      key: 'product',
      render: (text: string) => text || '-',
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
          <div>{amount ? Number(amount).toLocaleString() : '0'} VNĐ</div>
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
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span className="hidden sm:inline">Tạo Service Mới</span>
            <span className="sm:hidden">Tạo mới</span>
          </Button>
        }
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
          scroll={{ x: 1200 }}
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

      {/* Create Service Modal */}
      <Modal
        title="Tạo Service Mới"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        width="100%"
        style={{ maxWidth: 1000, top: 20 }}
        okText="Tạo Service"
        cancelText="Hủy"
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateService}
        >
          <Row gutter={[16, 0]}>
            {/* Row 1 */}
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Khách hàng"
                name="user_id"
                rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
                extra={clients.length === 0 ? "Chưa có khách hàng nào trong hệ thống" : undefined}
              >
                <Select
                  placeholder={clients.length === 0 ? "Chưa có khách hàng" : "Chọn khách hàng"}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as string).toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {clients.map((client) => (
                    <Option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label={
                  <Space>
                    Sản phẩm/Gói dịch vụ
                    <a 
                      href={ROUTE.whmcsProducts} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      title="Quản lý sản phẩm"
                      style={{ color: '#1890ff' }}
                    >
                      <UnorderedListOutlined />
                    </a>
                  </Space>
                }
                name="product_id"
                rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
                extra={products.length === 0 ? "Chưa có sản phẩm nào. Vui lòng tạo sản phẩm trước." : undefined}
              >
                <Select
                  placeholder={products.length === 0 ? "Chưa có sản phẩm" : "Chọn sản phẩm"}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as string).toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {products.map((product) => (
                    <Option key={product.id} value={product.id}>
                      {product.name} ({product.type})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Row 2 */}
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Domain"
                name="domain"
                rules={[
                  { required: true, message: 'Vui lòng nhập domain' },
                  { pattern: /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, message: 'Domain không hợp lệ' }
                ]}
              >
                <Input placeholder="example.com" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Username (tùy chọn)"
                name="username"
                extra="Để trống để hệ thống tự động tạo"
              >
                <Input placeholder="Tự động tạo nếu để trống" />
              </Form.Item>
            </Col>

            {/* Row 3 */}
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Chu kỳ thanh toán"
                name="billing_cycle"
                rules={[{ required: true, message: 'Vui lòng chọn chu kỳ' }]}
                initialValue="monthly"
              >
                <Select>
                  <Option value="monthly">Hàng tháng</Option>
                  <Option value="quarterly">3 tháng</Option>
                  <Option value="semiannually">6 tháng</Option>
                  <Option value="annually">1 năm</Option>
                  <Option value="biennially">2 năm</Option>
                  <Option value="triennially">3 năm</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Giá định kỳ"
                name="recurring_amount"
                rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="VNĐ"
                />
              </Form.Item>
            </Col>

            {/* Row 4 */}
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Ngày đến hạn đầu tiên"
                name="next_due_date"
                rules={[{ required: true, message: 'Vui lòng chọn ngày đến hạn' }]}
                initialValue={dayjs().add(1, 'month')}
                extra="Ngày khách hàng cần thanh toán hóa đơn tiếp theo"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="YYYY-MM-DD"
                  placeholder="Chọn ngày đến hạn"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Server (tùy chọn)"
                name="server_id"
                extra="Để trống để hệ thống tự động chọn server phù hợp"
              >
                <Select placeholder="Tự động chọn" allowClear>
                  {/* TODO: Load servers from API */}
                  <Option value={1}>Server01-VN (103.56.158.199)</Option>
                  <Option value={2}>Server02-VN (103.56.158.200)</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Alert full width */}
            <Col span={24}>
              <Alert
                message="Lưu ý"
                description={
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>Service sẽ được tạo với trạng thái "Pending"</li>
                    <li>Cần provision service để kích hoạt trên server</li>
                    <li>Hóa đơn sẽ được tạo tự động khi provision thành công</li>
                  </ul>
                }
                type="info"
                showIcon
              />
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ServiceList;
