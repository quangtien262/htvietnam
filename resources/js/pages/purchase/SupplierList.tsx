import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Divider,
  Drawer,
  Dropdown,
  Row,
  Col,
  Card,
  Statistic,
  Select,
  InputNumber,
  Rate
} from 'antd';
import type { MenuProps, ColumnsType } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  ShopOutlined,
  DollarOutlined
} from '@ant-design/icons';
import axios from 'axios';
import API from '../../common/api';
import TextArea from 'antd/es/input/TextArea';
import '../../../css/common-responsive.css';

interface Supplier {
  id: number;
  code: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  tax_code?: string;
  payment_terms: number;
  status: number;
  rating: number;
  notes?: string;
  total_orders?: number;
  total_amount?: number;
  total_debt?: number;
}

interface Statistics {
  total_suppliers: number;
  active_suppliers: number;
  inactive_suppliers: number;
  total_debt: number;
}

const SupplierList: React.FC = () => {
  const [data, setData] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // Filter states
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | undefined>(undefined);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Supplier | null>(null);
  const [form] = Form.useForm();

  // Statistics
  const [statistics, setStatistics] = useState<Statistics>({
    total_suppliers: 0,
    active_suppliers: 0,
    inactive_suppliers: 0,
    total_debt: 0
  });

  useEffect(() => {
    loadData();
    loadStatistics();
  }, [page, pageSize, search, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await axios.post(API.supplierList, {
        page,
        pageSize,
        search,
        status: filterStatus
      });

      if (res.data.status_code === 200) {
        setData(res.data.data);
        setTotal(res.data.total);
      }
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const res = await axios.post(API.supplierStatistics, {});
      if (res.data.status_code === 200) {
        setStatistics(res.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      status: 1,
      rating: 0,
      payment_terms: 0
    });
    setIsModalVisible(true);
  };

  const handleEdit = (record: Supplier) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (ids: number[]) => {
    try {
      const res = await axios.post(API.supplierDelete, { ids });
      if (res.data.status_code === 200) {
        message.success('Xóa thành công');
        loadData();
        loadStatistics();
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const apiUrl = editingRecord ? API.supplierUpdate : API.supplierAdd;
      const payload = editingRecord ? { ...values, id: editingRecord.id } : values;

      const res = await axios.post(apiUrl, payload);

      if (res.data.status_code === 200) {
        message.success(editingRecord ? 'Cập nhật thành công' : 'Thêm mới thành công');
        setIsModalVisible(false);
        loadData();
        loadStatistics();
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const columns: ColumnsType<Supplier> = [
    {
      title: 'Mã NCC',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left'
    },
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left'
    },
    {
      title: 'Người liên hệ',
      dataIndex: 'contact_person',
      key: 'contact_person',
      width: 150
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 120
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 150,
      render: (rating) => <Rate disabled value={rating} />
    },
    {
      title: 'Số đơn hàng',
      dataIndex: 'total_orders',
      key: 'total_orders',
      width: 120,
      align: 'right'
    },
    {
      title: 'Tổng giá trị',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 150,
      align: 'right',
      render: (value) => value?.toLocaleString('vi-VN') + ' đ'
    },
    {
      title: 'Công nợ',
      dataIndex: 'total_debt',
      key: 'total_debt',
      width: 150,
      align: 'right',
      render: (value) => (
        <span style={{ color: value > 0 ? '#ff4d4f' : '#52c41a' }}>
          {value?.toLocaleString('vi-VN')} đ
        </span>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <span style={{ color: status === 1 ? '#52c41a' : '#ff4d4f' }}>
          {status === 1 ? 'Hoạt động' : 'Ngưng HĐ'}
        </span>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => {
        const items: MenuProps['items'] = [
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Sửa',
            onClick: () => handleEdit(record)
          },
          {
            type: 'divider'
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Xóa',
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: 'Xác nhận xóa',
                content: `Bạn có chắc chắn muốn xóa nhà cung cấp "${record.name}"?`,
                okText: 'Có',
                cancelText: 'Không',
                onOk: () => handleDelete([record.id])
              });
            }
          }
        ];

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="link" icon={<MoreOutlined />}>
              Thao tác
            </Button>
          </Dropdown>
        );
      }
    }
  ];

  return (
    <div className="page-container" style={{ padding: 24 }}>
      <Divider orientation="left" style={{ fontSize: 20, fontWeight: 'bold', marginTop: 0 }}>
        Quản lý Nhà cung cấp
      </Divider>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Tổng NCC"
              value={statistics.total_suppliers}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Đang HĐ"
              value={statistics.active_suppliers}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Ngưng HĐ"
              value={statistics.inactive_suppliers}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Tổng công nợ"
              value={statistics.total_debt}
              prefix={<DollarOutlined />}
              suffix="đ"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Mobile Filter Button */}
      <div className="mobile-only" style={{ marginBottom: 16 }}>
        <Button
          icon={<FilterOutlined />}
          onClick={() => setFilterDrawerVisible(true)}
          block
          size="large"
        >
          Bộ lọc & Tìm kiếm
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Desktop Filter Panel */}
        <div className="desktop-only" style={{ width: 280, flexShrink: 0 }}>
          <div style={{
            background: '#fff',
            padding: 16,
            borderRadius: 8,
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <Divider orientation="left" style={{ marginTop: 0 }}>Bộ lọc</Divider>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Tìm kiếm</label>
              <Input
                placeholder="Tên, mã, SĐT..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Trạng thái</label>
              <Select
                placeholder="Chọn trạng thái"
                value={filterStatus}
                onChange={setFilterStatus}
                allowClear
                style={{ width: '100%' }}
              >
                <Select.Option value={1}>Hoạt động</Select.Option>
                <Select.Option value={0}>Ngưng hoạt động</Select.Option>
              </Select>
            </div>

            <Button
              block
              onClick={() => {
                setSearch('');
                setFilterStatus(undefined);
                setPage(1);
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <Drawer
          title="Bộ lọc & Tìm kiếm"
          placement="left"
          onClose={() => setFilterDrawerVisible(false)}
          open={filterDrawerVisible}
          width={300}
          footer={
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block type="primary" onClick={() => setFilterDrawerVisible(false)}>
                Áp dụng
              </Button>
              <Button block onClick={() => {
                setSearch('');
                setFilterStatus(undefined);
                setPage(1);
                setFilterDrawerVisible(false);
              }}>
                Xóa bộ lọc
              </Button>
            </Space>
          }
        >
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Tìm kiếm</label>
            <Input
              placeholder="Tên, mã, SĐT..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Trạng thái</label>
            <Select
              placeholder="Chọn trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value={1}>Hoạt động</Select.Option>
              <Select.Option value={0}>Ngưng hoạt động</Select.Option>
            </Select>
          </div>
        </Drawer>

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm nhà cung cấp
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} nhà cung cấp`,
              onChange: (page, pageSize) => {
                setPage(page);
                setPageSize(pageSize);
              }
            }}
            scroll={{ x: 1500 }}
          />
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={editingRecord ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={900}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Tên nhà cung cấp" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                <Input placeholder="Nhập tên nhà cung cấp" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Người liên hệ" name="contact_person">
                <Input placeholder="Nhập tên người liên hệ" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Điện thoại" name="phone">
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Email" name="email">
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Địa chỉ" name="address">
                <TextArea rows={2} placeholder="Nhập địa chỉ" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Mã số thuế" name="tax_code">
                <Input placeholder="Nhập mã số thuế" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Điều khoản thanh toán (ngày)" name="payment_terms">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="Số ngày" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Đánh giá" name="rating">
                <Rate />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Trạng thái" name="status">
                <Select>
                  <Select.Option value={1}>Hoạt động</Select.Option>
                  <Select.Option value={0}>Ngưng hoạt động</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Ghi chú" name="notes">
                <TextArea rows={3} placeholder="Nhập ghi chú" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default SupplierList;
