import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
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
import type { MenuProps, ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  DollarOutlined,
  BankOutlined,
  WalletOutlined
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

interface PurchaseOrder {
  id: number;
  code: string;
  grand_total: number;
  paid_amount: number;
}

interface SupplierPayment {
  id: number;
  code: string;
  supplier_id: number;
  supplier?: Supplier;
  purchase_order_id?: number;
  purchase_order?: PurchaseOrder;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number?: string;
  notes?: string;
}

interface Statistics {
  total_payments: number;
  total_amount: number;
  by_method: Array<{
    payment_method: string;
    count: number;
    total: number;
  }>;
}

const SupplierPaymentList: React.FC = () => {
  const [data, setData] = useState<SupplierPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // Filter states
  const [search, setSearch] = useState('');
  const [filterSupplierId, setFilterSupplierId] = useState<number | undefined>(undefined);
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string | undefined>(undefined);
  const [filterDateRange, setFilterDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SupplierPayment | null>(null);
  const [form] = Form.useForm();

  // Dropdown data
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [unpaidOrders, setUnpaidOrders] = useState<PurchaseOrder[]>([]);

  // Statistics
  const [statistics, setStatistics] = useState<Statistics>({
    total_payments: 0,
    total_amount: 0,
    by_method: []
  });

  useEffect(() => {
    loadData();
    loadStatistics();
    loadSuppliers();
  }, [page, pageSize, search, filterSupplierId, filterPaymentMethod, filterDateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        pageSize,
        search,
        supplier_id: filterSupplierId,
        payment_method: filterPaymentMethod
      };

      if (filterDateRange && filterDateRange[0] && filterDateRange[1]) {
        params.from_date = filterDateRange[0].format('YYYY-MM-DD');
        params.to_date = filterDateRange[1].format('YYYY-MM-DD');
      }

      const response = await axios.post(API.supplierPaymentList, params);
      if (response.data.status === 'success') {
        setData(response.data.data);
        setTotal(response.data.total);
      }
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const params: any = {};
      if (filterDateRange && filterDateRange[0] && filterDateRange[1]) {
        params.from_date = filterDateRange[0].format('YYYY-MM-DD');
        params.to_date = filterDateRange[1].format('YYYY-MM-DD');
      }

      const response = await axios.post(API.supplierPaymentStatistics, params);
      if (response.data.status === 'success') {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await axios.post(API.supplierPaymentSupplierList, {});
      if (response.data.status === 'success') {
        setSuppliers(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách NCC:', error);
    }
  };

  const loadUnpaidOrders = async (supplierId: number) => {
    try {
      const response = await axios.post(API.supplierPaymentUnpaidOrders, { supplier_id: supplierId });
      if (response.data.status === 'success') {
        setUnpaidOrders(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng chưa thanh toán:', error);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setUnpaidOrders([]);
    form.resetFields();
    form.setFieldsValue({
      payment_date: dayjs(),
      payment_method: 'bank_transfer'
    });
    setIsModalVisible(true);
  };

  const handleEdit = async (record: SupplierPayment) => {
    setEditingRecord(record);
    if (record.supplier_id) {
      await loadUnpaidOrders(record.supplier_id);
    }
    form.setFieldsValue({
      ...record,
      payment_date: dayjs(record.payment_date)
    });
    setIsModalVisible(true);
  };

  const handleDelete = (record: SupplierPayment) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa thanh toán ${record.code}?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await axios.post(API.supplierPaymentDelete, { id: record.id });
          if (response.data.status === 'success') {
            message.success('Xóa thanh toán thành công');
            loadData();
            loadStatistics();
          } else {
            message.error(response.data.message);
          }
        } catch (error) {
          message.error('Lỗi khi xóa thanh toán');
        }
      }
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const params = {
        ...values,
        payment_date: values.payment_date.format('YYYY-MM-DD')
      };

      let response;
      if (editingRecord) {
        params.id = editingRecord.id;
        response = await axios.post(API.supplierPaymentUpdate, params);
      } else {
        response = await axios.post(API.supplierPaymentAdd, params);
      }

      if (response.data.status === 'success') {
        message.success(editingRecord ? 'Cập nhật thanh toán thành công' : 'Tạo thanh toán thành công');
        setIsModalVisible(false);
        loadData();
        loadStatistics();
      } else {
        message.error(response.data.message);
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi khi lưu thanh toán');
    }
  };

  const handleSupplierChange = async (supplierId: number) => {
    await loadUnpaidOrders(supplierId);
    form.setFieldsValue({ purchase_order_id: undefined });
  };

  const resetFilters = () => {
    setSearch('');
    setFilterSupplierId(undefined);
    setFilterPaymentMethod(undefined);
    setFilterDateRange(null);
    setPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  };

  const columns: ColumnsType<SupplierPayment> = [
    {
      title: 'Mã TT',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left'
    },
    {
      title: 'Nhà cung cấp',
      key: 'supplier',
      width: 180,
      render: (_, record) => record.supplier?.name || '-'
    },
    {
      title: 'Đơn hàng',
      key: 'purchase_order',
      width: 140,
      render: (_, record) => record.purchase_order?.code || '-'
    },
    {
      title: 'Ngày TT',
      dataIndex: 'payment_date',
      key: 'payment_date',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (amount) => <span style={{ fontWeight: 600, color: '#52c41a' }}>{formatCurrency(amount)}</span>
    },
    {
      title: 'Phương thức',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 150,
      render: (method) => {
        const methodMap: any = {
          cash: { label: 'Tiền mặt', color: 'green', icon: <WalletOutlined /> },
          bank_transfer: { label: 'Chuyển khoản', color: 'blue', icon: <BankOutlined /> },
          credit_card: { label: 'Thẻ tín dụng', color: 'purple', icon: <DollarOutlined /> },
          other: { label: 'Khác', color: 'default', icon: <DollarOutlined /> }
        };
        const config = methodMap[method] || methodMap.other;
        return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
      }
    },
    {
      title: 'Số tham chiếu',
      dataIndex: 'reference_number',
      key: 'reference_number',
      width: 150,
      ellipsis: true
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      width: 200,
      ellipsis: true
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
            label: 'Sửa',
            icon: <EditOutlined />,
            onClick: () => handleEdit(record)
          },
          {
            key: 'delete',
            label: 'Xóa',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDelete(record)
          }
        ];

        return (
          <Space size="small">
            <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
              <Button type="text" icon={<MoreOutlined />} size="small" />
            </Dropdown>
          </Space>
        );
      }
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={16}>
        {/* Left Sidebar - Desktop Filter */}
        <Col xs={0} sm={0} md={0} lg={6} xl={5} className="desktop-only">
          <div style={{ position: 'sticky', top: 20 }}>
            <Card title="Bộ lọc" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Input
                  placeholder="Tìm kiếm mã TT, số tham chiếu..."
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  allowClear
                />
                <Select
                  placeholder="Nhà cung cấp"
                  value={filterSupplierId}
                  onChange={setFilterSupplierId}
                  allowClear
                  style={{ width: '100%' }}
                  showSearch
                  optionFilterProp="children"
                >
                  {suppliers.map(supplier => (
                    <Select.Option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </Select.Option>
                  ))}
                </Select>
                <Select
                  placeholder="Phương thức TT"
                  value={filterPaymentMethod}
                  onChange={setFilterPaymentMethod}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Select.Option value="cash">Tiền mặt</Select.Option>
                  <Select.Option value="bank_transfer">Chuyển khoản</Select.Option>
                  <Select.Option value="credit_card">Thẻ tín dụng</Select.Option>
                  <Select.Option value="other">Khác</Select.Option>
                </Select>
                <DatePicker.RangePicker
                  value={filterDateRange}
                  onChange={(dates) => setFilterDateRange(dates)}
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  placeholder={['Từ ngày', 'Đến ngày']}
                />
                <Button onClick={resetFilters} block>
                  Xóa bộ lọc
                </Button>
              </Space>
            </Card>
          </div>
        </Col>

        {/* Right Content */}
        <Col xs={24} sm={24} md={24} lg={18} xl={19}>
          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Card>
                <Statistic
                  title="Tổng thanh toán"
                  value={statistics.total_payments}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Card>
                <Statistic
                  title="Tổng số tiền"
                  value={statistics.total_amount}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
              </Card>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} xl={8}>
              <Card>
                <div style={{ fontSize: 14, color: '#8c8c8c', marginBottom: 8 }}>Theo phương thức</div>
                {statistics.by_method.slice(0, 2).map((method, index) => (
                  <div key={index} style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 12 }}>{method.payment_method}: </span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(method.total)}</span>
                  </div>
                ))}
              </Card>
            </Col>
          </Row>

          {/* Mobile Filter Button */}
          <div className="mobile-only" style={{ marginBottom: 16 }}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFilterDrawerVisible(true)}
              block
            >
              Bộ lọc
            </Button>
          </div>

          {/* Action Bar */}
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Tạo thanh toán
            </Button>
          </div>

          {/* Table */}
          <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} thanh toán`,
          onChange: (page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          }
        }}
      />

      {/* Filter Drawer for Mobile */}
      <Drawer
        title="Bộ lọc"
        placement="left"
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        width={300}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Input
            placeholder="Tìm kiếm mã TT, số tham chiếu..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Nhà cung cấp"
            value={filterSupplierId}
            onChange={setFilterSupplierId}
            allowClear
            style={{ width: '100%' }}
            showSearch
            optionFilterProp="children"
          >
            {suppliers.map(supplier => (
              <Select.Option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Phương thức TT"
            value={filterPaymentMethod}
            onChange={setFilterPaymentMethod}
            allowClear
            style={{ width: '100%' }}
          >
            <Select.Option value="cash">Tiền mặt</Select.Option>
            <Select.Option value="bank_transfer">Chuyển khoản</Select.Option>
            <Select.Option value="credit_card">Thẻ tín dụng</Select.Option>
            <Select.Option value="other">Khác</Select.Option>
          </Select>
          <DatePicker.RangePicker
            value={filterDateRange}
            onChange={(dates) => setFilterDateRange(dates)}
            format="DD/MM/YYYY"
            style={{ width: '100%' }}
            placeholder={['Từ ngày', 'Đến ngày']}
          />
          <Button onClick={resetFilters} block>
            Xóa bộ lọc
          </Button>
          <Button type="primary" onClick={() => setFilterDrawerVisible(false)} block>
            Áp dụng
          </Button>
        </Space>
      </Drawer>

      {/* Add/Edit Modal */}
      <Modal
        title={editingRecord ? 'Cập nhật thanh toán' : 'Tạo thanh toán'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
        okText={editingRecord ? 'Cập nhật' : 'Tạo'}
        cancelText="Hủy"
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nhà cung cấp"
                name="supplier_id"
                rules={[{ required: true, message: 'Vui lòng chọn NCC' }]}
              >
                <Select
                  placeholder="Chọn nhà cung cấp"
                  showSearch
                  optionFilterProp="children"
                  onChange={handleSupplierChange}
                  disabled={!!editingRecord}
                >
                  {suppliers.map(supplier => (
                    <Select.Option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Đơn hàng (tùy chọn)"
                name="purchase_order_id"
              >
                <Select
                  placeholder="Chọn đơn hàng"
                  allowClear
                  disabled={unpaidOrders.length === 0}
                >
                  {unpaidOrders.map(order => (
                    <Select.Option key={order.id} value={order.id}>
                      {order.code} - Còn nợ: {formatCurrency(order.grand_total - order.paid_amount)}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Ngày thanh toán"
                name="payment_date"
                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số tiền"
                name="amount"
                rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="₫"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Phương thức thanh toán"
                name="payment_method"
                rules={[{ required: true, message: 'Vui lòng chọn phương thức' }]}
              >
                <Select>
                  <Select.Option value="cash">Tiền mặt</Select.Option>
                  <Select.Option value="bank_transfer">Chuyển khoản</Select.Option>
                  <Select.Option value="credit_card">Thẻ tín dụng</Select.Option>
                  <Select.Option value="other">Khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Số tham chiếu" name="reference_number">
                <Input placeholder="Mã GD, Số chứng từ..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Ghi chú" name="notes">
                <TextArea rows={3} placeholder="Nhập ghi chú" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
        </Col>
      </Row>
    </div>
  );
};

export default SupplierPaymentList;
