import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, Select, Switch, message, Statistic, Row, Col, Popconfirm, Tag, Space, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CloudServerOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { callApi } from '@/function/api';
import { API } from '@/common/api';

const { Option } = Select;
const { TextArea } = Input;

interface HostingProduct {
  id: number;
  name: string;
  description?: string;
  disk_space: number; // MB
  bandwidth: number; // GB
  email_accounts: number;
  databases: number;
  ftp_accounts: number;
  subdomains: number;
  parked_domains: number;
  addon_domains: number;
  ssl_enabled: boolean;
  daily_backups: boolean;
  billing_cycle: 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
  price: number;
  setup_fee?: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const HostingProducts: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<HostingProduct[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HostingProduct | null>(null);
  const [form] = Form.useForm();

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    avgPrice: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await callApi(API.hostingProductsList, {});
      if (response?.success) {
        setData(response.data || []);
        calculateStats(response.data || []);
      }
    } catch (error) {
      message.error('Không thể tải danh sách gói hosting');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (products: HostingProduct[]) => {
    const total = products.length;
    const active = products.filter(p => p.is_active).length;
    const avgPrice = products.length > 0
      ? products.reduce((sum, p) => sum + p.price, 0) / products.length
      : 0;
    const totalRevenue = products.reduce((sum, p) => sum + p.price, 0);

    setStats({ total, active, avgPrice, totalRevenue });
  };

  const openModal = (record?: HostingProduct) => {
    if (record) {
      setEditingRecord(record);
      form.setFieldsValue(record);
    } else {
      setEditingRecord(null);
      form.resetFields();
      form.setFieldsValue({
        is_active: true,
        ssl_enabled: true,
        daily_backups: false,
        billing_cycle: 'monthly',
        sort_order: 0,
        disk_space: 1000, // 1GB
        bandwidth: 10, // 10GB
        email_accounts: 10,
        databases: 1,
        ftp_accounts: 1,
        subdomains: 5,
        parked_domains: 1,
        addon_domains: 0,
      });
    }
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      let response;

      if (editingRecord) {
        response = await callApi(API.hostingProductsUpdate(editingRecord.id), values);
      } else {
        response = await callApi(API.hostingProductsAdd, values);
      }

      if (response?.success) {
        message.success(editingRecord ? 'Cập nhật gói hosting thành công' : 'Thêm gói hosting thành công');
        setModalVisible(false);
        form.resetFields();
        fetchData();
      } else {
        message.error(response?.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu gói hosting');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await callApi(API.hostingProductsDelete(id), { id });
      if (response?.success) {
        message.success('Xóa gói hosting thành công');
        fetchData();
      } else {
        message.error(response?.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa gói hosting');
    }
  };

  const getBillingCycleText = (cycle: string) => {
    const cycles: Record<string, string> = {
      monthly: 'Tháng',
      quarterly: 'Quý',
      'semi-annually': '6 tháng',
      annually: 'Năm',
    };
    return cycles[cycle] || cycle;
  };

  const formatBytes = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  const columns = [
    {
      title: 'Tên gói',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left' as const,
    },
    {
      title: 'Dung lượng',
      dataIndex: 'disk_space',
      key: 'disk_space',
      width: 100,
      render: (mb: number) => formatBytes(mb),
    },
    {
      title: 'Băng thông',
      dataIndex: 'bandwidth',
      key: 'bandwidth',
      width: 100,
      render: (gb: number) => `${gb} GB`,
    },
    {
      title: 'Email',
      dataIndex: 'email_accounts',
      key: 'email_accounts',
      width: 80,
    },
    {
      title: 'Database',
      dataIndex: 'databases',
      key: 'databases',
      width: 90,
    },
    {
      title: 'Subdomain',
      dataIndex: 'subdomains',
      key: 'subdomains',
      width: 100,
    },
    {
      title: 'Addon Domain',
      dataIndex: 'addon_domains',
      key: 'addon_domains',
      width: 120,
    },
    {
      title: 'Tính năng',
      key: 'features',
      width: 150,
      render: (_: any, record: HostingProduct) => (
        <Space direction="vertical" size="small">
          {record.ssl_enabled && <Tag color="green">SSL</Tag>}
          {record.daily_backups && <Tag color="blue">Backup</Tag>}
        </Space>
      ),
    },
    {
      title: 'Chu kỳ',
      dataIndex: 'billing_cycle',
      key: 'billing_cycle',
      width: 100,
      render: (cycle: string) => getBillingCycleText(cycle),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number, record: HostingProduct) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{price.toLocaleString('vi-VN')} ₫</div>
          {record.setup_fee && record.setup_fee > 0 && (
            <div style={{ fontSize: '12px', color: '#999' }}>
              Phí cài đặt: {record.setup_fee.toLocaleString('vi-VN')} ₫
            </div>
          )}
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
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: HostingProduct) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa gói hosting?"
            description="Gói hosting sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?"
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
              title="Tổng số gói"
              value={stats.total}
              prefix={<CloudServerOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Gói đang bán"
              value={stats.active}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Giá trung bình"
              value={stats.avgPrice}
              precision={0}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu (dự kiến)"
              value={stats.totalRevenue}
              precision={0}
              suffix="₫"
            />
          </Card>
        </Col>
      </Row>

      {/* Hosting Products List */}
      <Card
        title="Quản lý Gói Hosting"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Thêm Gói Hosting
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1800 }}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} gói hosting`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingRecord ? 'Sửa Gói Hosting' : 'Thêm Gói Hosting'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Tên gói"
                rules={[{ required: true, message: 'Vui lòng nhập tên gói' }]}
              >
                <Input placeholder="VD: Basic Hosting, Pro Hosting" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sort_order"
                label="Thứ tự hiển thị"
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={3} placeholder="Mô tả về gói hosting..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="disk_space"
                label="Dung lượng (MB)"
                rules={[{ required: true, message: 'Vui lòng nhập dung lượng' }]}
              >
                <InputNumber style={{ width: '100%' }} min={100} placeholder="1000" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="bandwidth"
                label="Băng thông (GB)"
                rules={[{ required: true, message: 'Vui lòng nhập băng thông' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} placeholder="10" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="email_accounts"
                label="Số email"
                rules={[{ required: true, message: 'Vui lòng nhập số email' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="10" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="databases"
                label="Số database"
                rules={[{ required: true, message: 'Vui lòng nhập số database' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="1" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="ftp_accounts"
                label="Số FTP"
                rules={[{ required: true, message: 'Vui lòng nhập số FTP' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="1" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="subdomains"
                label="Số subdomain"
                rules={[{ required: true, message: 'Vui lòng nhập số subdomain' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="5" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="parked_domains"
                label="Parked domains"
                rules={[{ required: true, message: 'Vui lòng nhập số parked domain' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="addon_domains"
                label="Addon domains"
                rules={[{ required: true, message: 'Vui lòng nhập số addon domain' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="billing_cycle"
                label="Chu kỳ thanh toán"
                rules={[{ required: true, message: 'Vui lòng chọn chu kỳ' }]}
              >
                <Select placeholder="Chọn chu kỳ">
                  <Option value="monthly">Tháng</Option>
                  <Option value="quarterly">Quý (3 tháng)</Option>
                  <Option value="semi-annually">6 tháng</Option>
                  <Option value="annually">Năm</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Giá (VNĐ)"
                rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/,/g, '')}
                  placeholder="100000"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="setup_fee"
                label="Phí cài đặt (VNĐ)"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/,/g, '')}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="ssl_enabled"
                label="SSL miễn phí"
                valuePropName="checked"
              >
                <Switch checkedChildren="Có" unCheckedChildren="Không" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="daily_backups"
                label="Sao lưu hàng ngày"
                valuePropName="checked"
              >
                <Switch checkedChildren="Có" unCheckedChildren="Không" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="is_active"
                label="Trạng thái"
                valuePropName="checked"
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default HostingProducts;
