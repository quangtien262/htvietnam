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
  DatePicker,
  InputNumber,
  Tag
} from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  FileDoneOutlined,
  DollarOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import API from '../../common/api';
import TextArea from 'antd/es/input/TextArea';
import dayjs from 'dayjs';
import '../../../css/common-responsive.css';

interface Supplier {
  id: number;
  name: string;
  code: string;
}

interface OrderItem {
  product_name: string;
  product_code?: string;
  unit: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  discount_rate: number;
  amount: number;
  note?: string;
}

interface PurchaseOrder {
  id: number;
  code: string;
  supplier_id: number;
  supplier?: Supplier;
  order_date: string;
  expected_date?: string;
  total_amount: number;
  tax: number;
  discount: number;
  grand_total: number;
  status: string;
  payment_status: string;
  paid_amount: number;
  notes?: string;
  items?: OrderItem[];
}

interface Statistics {
  total_orders: number;
  draft_orders: number;
  sent_orders: number;
  completed_orders: number;
  total_amount: number;
  unpaid_amount: number;
}

const PurchaseOrderList: React.FC = () => {
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // Filter states
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterSupplierId, setFilterSupplierId] = useState<number | undefined>(undefined);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string | undefined>(undefined);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PurchaseOrder | null>(null);
  const [form] = Form.useForm();

  // Dropdown data
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [statusList, setStatusList] = useState<{value: string, label: string}[]>([]);

  // Statistics
  const [statistics, setStatistics] = useState<Statistics>({
    total_orders: 0,
    draft_orders: 0,
    sent_orders: 0,
    completed_orders: 0,
    total_amount: 0,
    unpaid_amount: 0
  });

  useEffect(() => {
    loadData();
    loadStatistics();
    loadSuppliers();
    loadStatusList();
  }, [page, pageSize, search, filterStatus, filterSupplierId, filterPaymentStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await axios.post(API.purchaseOrderList, {
        page,
        pageSize,
        search,
        status: filterStatus,
        supplier_id: filterSupplierId,
        payment_status: filterPaymentStatus
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
      const res = await axios.post(API.purchaseOrderStatistics, {});
      if (res.data.status_code === 200) {
        setStatistics(res.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await axios.post(API.purchaseOrderSupplierList, {});
      if (res.data.status_code === 200) {
        setSuppliers(res.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải NCC:', error);
    }
  };

  const loadStatusList = async () => {
    try {
      const res = await axios.post(API.purchaseOrderStatusList, {});
      if (res.data.status_code === 200) {
        setStatusList(res.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải trạng thái:', error);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      order_date: dayjs(),
      status: 'draft',
      payment_status: 'unpaid',
      tax: 0,
      discount: 0,
      items: [{
        product_name: '',
        unit: 'Cái',
        quantity: 1,
        unit_price: 0,
        tax_rate: 0,
        discount_rate: 0
      }]
    });
    setIsModalVisible(true);
  };

  const handleEdit = (record: PurchaseOrder) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      order_date: record.order_date ? dayjs(record.order_date) : null,
      expected_date: record.expected_date ? dayjs(record.expected_date) : null
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (ids: number[]) => {
    try {
      const res = await axios.post(API.purchaseOrderDelete, { ids });
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

      // Convert dates
      const payload = {
        ...values,
        order_date: values.order_date ? values.order_date.format('YYYY-MM-DD') : null,
        expected_date: values.expected_date ? values.expected_date.format('YYYY-MM-DD') : null
      };

      const apiUrl = editingRecord ? API.purchaseOrderUpdate : API.purchaseOrderAdd;
      if (editingRecord) {
        payload.id = editingRecord.id;
      }

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'default',
      sent: 'processing',
      receiving: 'warning',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      unpaid: 'error',
      partial: 'warning',
      paid: 'success'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'code',
      key: 'code',
      width: 130,
      fixed: 'left' as const
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: ['supplier', 'name'],
      key: 'supplier',
      width: 200
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'order_date',
      key: 'order_date',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Ngày dự kiến',
      dataIndex: 'expected_date',
      key: 'expected_date',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'grand_total',
      key: 'grand_total',
      width: 150,
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString('vi-VN') + ' đ'
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'paid_amount',
      key: 'paid_amount',
      width: 150,
      align: 'right' as const,
      render: (value: number) => value?.toLocaleString('vi-VN') + ' đ'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => {
        const label = statusList.find(s => s.value === status)?.label || status;
        return <Tag color={getStatusColor(status)}>{label}</Tag>;
      }
    },
    {
      title: 'TT Thanh toán',
      dataIndex: 'payment_status',
      key: 'payment_status',
      width: 130,
      render: (status: string) => {
        const labels: Record<string, string> = {
          unpaid: 'Chưa TT',
          partial: 'TT 1 phần',
          paid: 'Đã TT'
        };
        return <Tag color={getPaymentStatusColor(status)}>{labels[status]}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: PurchaseOrder) => {
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
                content: `Bạn có chắc chắn muốn xóa đơn hàng "${record.code}"?`,
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
        Quản lý Đơn mua hàng
      </Divider>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="Tổng đơn"
              value={statistics.total_orders}
              prefix={<FileDoneOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="Nháp"
              value={statistics.draft_orders}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="Đã gửi"
              value={statistics.sent_orders}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="Hoàn thành"
              value={statistics.completed_orders}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={16} md={12} lg={8}>
          <Card size="small">
            <Statistic
              title="Tổng giá trị"
              value={statistics.total_amount}
              prefix={<DollarOutlined />}
              suffix="đ"
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
                placeholder="Mã đơn, NCC..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Nhà cung cấp</label>
              <Select
                placeholder="Chọn NCC"
                value={filterSupplierId}
                onChange={setFilterSupplierId}
                allowClear
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
              >
                {suppliers.map(s => (
                  <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                ))}
              </Select>
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
                {statusList.map(s => (
                  <Select.Option key={s.value} value={s.value}>{s.label}</Select.Option>
                ))}
              </Select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>TT Thanh toán</label>
              <Select
                placeholder="Chọn"
                value={filterPaymentStatus}
                onChange={setFilterPaymentStatus}
                allowClear
                style={{ width: '100%' }}
              >
                <Select.Option value="unpaid">Chưa thanh toán</Select.Option>
                <Select.Option value="partial">TT một phần</Select.Option>
                <Select.Option value="paid">Đã thanh toán</Select.Option>
              </Select>
            </div>

            <Button
              block
              onClick={() => {
                setSearch('');
                setFilterStatus(undefined);
                setFilterSupplierId(undefined);
                setFilterPaymentStatus(undefined);
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
        >
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Tìm kiếm</label>
            <Input
              placeholder="Mã đơn, NCC..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Nhà cung cấp</label>
            <Select
              placeholder="Chọn NCC"
              value={filterSupplierId}
              onChange={setFilterSupplierId}
              allowClear
              style={{ width: '100%' }}
            >
              {suppliers.map(s => (
                <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
              ))}
            </Select>
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
              {statusList.map(s => (
                <Select.Option key={s.value} value={s.value}>{s.label}</Select.Option>
              ))}
            </Select>
          </div>
        </Drawer>

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Tạo đơn mua hàng
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
              showTotal: (total) => `Tổng ${total} đơn hàng`,
              onChange: (page, pageSize) => {
                setPage(page);
                setPageSize(pageSize);
              }
            }}
            scroll={{ x: 1400 }}
          />
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={editingRecord ? 'Sửa đơn mua hàng' : 'Tạo đơn mua hàng'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={1200}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Nhà cung cấp" name="supplier_id" rules={[{ required: true, message: 'Vui lòng chọn NCC!' }]}>
                <Select placeholder="Chọn nhà cung cấp" showSearch optionFilterProp="children">
                  {suppliers.map(s => (
                    <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Ngày đặt hàng" name="order_date" rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Ngày dự kiến nhận" name="expected_date">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Trạng thái" name="status">
                <Select>
                  {statusList.map(s => (
                    <Select.Option key={s.value} value={s.value}>{s.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Sản phẩm</Divider>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={16} align="middle">
                    <Col xs={24} sm={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'product_name']}
                        rules={[{ required: true, message: 'Nhập tên SP!' }]}
                      >
                        <Input placeholder="Tên sản phẩm" />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={4}>
                      <Form.Item {...restField} name={[name, 'unit']}>
                        <Input placeholder="Đơn vị" />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={3}>
                      <Form.Item {...restField} name={[name, 'quantity']}>
                        <InputNumber min={1} placeholder="SL" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={4}>
                      <Form.Item {...restField} name={[name, 'unit_price']}>
                        <InputNumber min={0} placeholder="Đơn giá" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={3}>
                      <Form.Item {...restField} name={[name, 'tax_rate']}>
                        <InputNumber min={0} max={100} placeholder="Thuế%" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={2}>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Thêm sản phẩm
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Row gutter={16}>
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

export default PurchaseOrderList;
