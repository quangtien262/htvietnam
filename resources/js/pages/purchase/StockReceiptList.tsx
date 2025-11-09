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
  Tag,
  Descriptions
} from 'antd';
import type { MenuProps, ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import API from '../../common/api';
import TextArea from 'antd/es/input/TextArea';
import dayjs from 'dayjs';
import '../../../css/common-responsive.css';

interface PurchaseOrder {
  id: number;
  code: string;
  supplier?: {
    id: number;
    name: string;
    code: string;
  };
  items?: OrderItem[];
}

interface OrderItem {
  id: number;
  product_name: string;
  product_code?: string;
  unit: string;
  quantity: number;
  received_quantity: number;
  unit_price: number;
}

interface ReceiveItem {
  item_id: number;
  received_quantity: number;
}

interface StockReceipt {
  id: number;
  code: string;
  purchase_order_id: number;
  purchase_order?: PurchaseOrder;
  receipt_date: string;
  warehouse: string;
  status: number;
  notes?: string;
  received_by: string;
}

interface Statistics {
  total_receipts: number;
  completed: number;
  pending: number;
}

const StockReceiptList: React.FC = () => {
  const [data, setData] = useState<StockReceipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // Filter states
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | undefined>(undefined);
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterPurchaseOrderId, setFilterPurchaseOrderId] = useState<number | undefined>(undefined);
  const [filterDateRange, setFilterDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StockReceipt | null>(null);
  const [form] = Form.useForm();

  // Dropdown data
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [receiveItems, setReceiveItems] = useState<ReceiveItem[]>([]);

  // Statistics
  const [statistics, setStatistics] = useState<Statistics>({
    total_receipts: 0,
    completed: 0,
    pending: 0
  });

  useEffect(() => {
    loadData();
    loadStatistics();
    loadPurchaseOrders();
  }, [page, pageSize, search, filterStatus, filterWarehouse, filterPurchaseOrderId, filterDateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        pageSize,
        search,
        status: filterStatus,
        warehouse: filterWarehouse,
        purchase_order_id: filterPurchaseOrderId
      };

      if (filterDateRange && filterDateRange[0] && filterDateRange[1]) {
        params.from_date = filterDateRange[0].format('YYYY-MM-DD');
        params.to_date = filterDateRange[1].format('YYYY-MM-DD');
      }

      const response = await axios.post(API.stockReceiptList, params);
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

      const response = await axios.post(API.stockReceiptStatistics, params);
      if (response.data.status === 'success') {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
    }
  };

  const loadPurchaseOrders = async () => {
    try {
      const response = await axios.post(API.stockReceiptPurchaseOrderList, {});
      if (response.data.status === 'success') {
        setPurchaseOrders(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn hàng:', error);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setSelectedOrder(null);
    setReceiveItems([]);
    form.resetFields();
    form.setFieldsValue({
      receipt_date: dayjs(),
      status: 1
    });
    setIsModalVisible(true);
  };

  const handleEdit = async (record: StockReceipt) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      receipt_date: dayjs(record.receipt_date)
    });
    setIsModalVisible(true);
  };

  const handleDelete = (record: StockReceipt) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa phiếu nhập ${record.code}?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await axios.post(API.stockReceiptDelete, { id: record.id });
          if (response.data.status === 'success') {
            message.success('Xóa phiếu nhập kho thành công');
            loadData();
            loadStatistics();
          } else {
            message.error(response.data.message);
          }
        } catch (error) {
          message.error('Lỗi khi xóa phiếu nhập kho');
        }
      }
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const params = {
        ...values,
        receipt_date: values.receipt_date.format('YYYY-MM-DD'),
        items: receiveItems
      };

      let response;
      if (editingRecord) {
        params.id = editingRecord.id;
        response = await axios.post(API.stockReceiptUpdate, params);
      } else {
        response = await axios.post(API.stockReceiptAdd, params);
      }

      if (response.data.status === 'success') {
        message.success(editingRecord ? 'Cập nhật phiếu nhập kho thành công' : 'Tạo phiếu nhập kho thành công');
        setIsModalVisible(false);
        loadData();
        loadStatistics();
        loadPurchaseOrders();
      } else {
        message.error(response.data.message);
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi khi lưu phiếu nhập kho');
    }
  };

  const handlePurchaseOrderChange = (orderId: number) => {
    const order = purchaseOrders.find(o => o.id === orderId);
    setSelectedOrder(order || null);

    // Initialize receive items
    if (order && order.items) {
      const items = order.items.map(item => ({
        item_id: item.id,
        received_quantity: 0
      }));
      setReceiveItems(items);
    }
  };

  const handleReceiveQuantityChange = (itemId: number, quantity: number) => {
    setReceiveItems(prev => {
      const index = prev.findIndex(item => item.item_id === itemId);
      if (index >= 0) {
        const newItems = [...prev];
        newItems[index].received_quantity = quantity;
        return newItems;
      }
      return [...prev, { item_id: itemId, received_quantity: quantity }];
    });
  };

  const resetFilters = () => {
    setSearch('');
    setFilterStatus(undefined);
    setFilterWarehouse('');
    setFilterPurchaseOrderId(undefined);
    setFilterDateRange(null);
    setPage(1);
  };

  const columns: ColumnsType<StockReceipt> = [
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left'
    },
    {
      title: 'Đơn mua hàng',
      key: 'purchase_order',
      width: 140,
      render: (_, record) => record.purchase_order?.code || '-'
    },
    {
      title: 'Nhà cung cấp',
      key: 'supplier',
      width: 180,
      render: (_, record) => record.purchase_order?.supplier?.name || '-'
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'receipt_date',
      key: 'receipt_date',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Kho',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 150
    },
    {
      title: 'Người nhận',
      dataIndex: 'received_by',
      key: 'received_by',
      width: 150
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={status === 1 ? 'success' : 'default'} icon={status === 1 ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
          {status === 1 ? 'Hoàn thành' : 'Chờ xử lý'}
        </Tag>
      )
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
                  placeholder="Tìm kiếm mã phiếu, người nhận..."
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  allowClear
                />
                <Select
                  placeholder="Trạng thái"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Select.Option value={1}>Hoàn thành</Select.Option>
                  <Select.Option value={0}>Chờ xử lý</Select.Option>
                </Select>
                <Input
                  placeholder="Kho"
                  value={filterWarehouse}
                  onChange={(e) => setFilterWarehouse(e.target.value)}
                  allowClear
                />
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
            <Col xs={12} sm={8} md={8} lg={8} xl={8}>
              <Card>
                <Statistic
                  title="Tổng phiếu nhập"
                  value={statistics.total_receipts}
                  prefix={<InboxOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={8} lg={8} xl={8}>
              <Card>
                <Statistic
                  title="Hoàn thành"
                  value={statistics.completed}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={8} lg={8} xl={8}>
              <Card>
                <Statistic
                  title="Chờ xử lý"
                  value={statistics.pending}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
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
            >
              Bộ lọc
            </Button>
          </div>

          {/* Action Bar */}
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Tạo phiếu nhập kho
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
          showTotal: (total) => `Tổng ${total} phiếu`,
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
            placeholder="Tìm kiếm mã phiếu, người nhận..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Trạng thái"
            value={filterStatus}
            onChange={setFilterStatus}
            allowClear
            style={{ width: '100%' }}
          >
            <Select.Option value={1}>Hoàn thành</Select.Option>
            <Select.Option value={0}>Chờ xử lý</Select.Option>
          </Select>
          <Input
            placeholder="Kho"
            value={filterWarehouse}
            onChange={(e) => setFilterWarehouse(e.target.value)}
            allowClear
          />
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
        title={editingRecord ? 'Cập nhật phiếu nhập kho' : 'Tạo phiếu nhập kho'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        width={900}
        okText={editingRecord ? 'Cập nhật' : 'Tạo'}
        cancelText="Hủy"
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Đơn mua hàng"
                name="purchase_order_id"
                rules={[{ required: true, message: 'Vui lòng chọn đơn hàng' }]}
              >
                <Select
                  placeholder="Chọn đơn hàng"
                  disabled={!!editingRecord}
                  onChange={handlePurchaseOrderChange}
                  showSearch
                  optionFilterProp="children"
                >
                  {purchaseOrders.map(order => (
                    <Select.Option key={order.id} value={order.id}>
                      {order.code} - {order.supplier?.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày nhập"
                name="receipt_date"
                rules={[{ required: true, message: 'Vui lòng chọn ngày nhập' }]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Kho"
                name="warehouse"
                rules={[{ required: true, message: 'Vui lòng nhập tên kho' }]}
              >
                <Input placeholder="Nhập tên kho" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Người nhận"
                name="received_by"
                rules={[{ required: true, message: 'Vui lòng nhập người nhận' }]}
              >
                <Input placeholder="Nhập tên người nhận" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Trạng thái" name="status">
                <Select>
                  <Select.Option value={0}>Chờ xử lý</Select.Option>
                  <Select.Option value={1}>Hoàn thành</Select.Option>
                </Select>
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

          {/* Items to Receive */}
          {!editingRecord && selectedOrder && selectedOrder.items && selectedOrder.items.length > 0 && (
            <>
              <Divider>Danh sách sản phẩm nhập kho</Divider>
              <Table
                dataSource={selectedOrder.items}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ x: 600 }}
                columns={[
                  {
                    title: 'Sản phẩm',
                    dataIndex: 'product_name',
                    key: 'product_name',
                    width: 200,
                    render: (name: string, record: any) => (
                      <div>
                        <div style={{ fontWeight: 500 }}>{name}</div>
                        {record.product_code && (
                          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.product_code}</div>
                        )}
                      </div>
                    )
                  },
                  {
                    title: 'ĐVT',
                    dataIndex: 'unit',
                    key: 'unit',
                    width: 80
                  },
                  {
                    title: 'SL đặt',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    width: 100
                  },
                  {
                    title: 'Đã nhận',
                    dataIndex: 'received_quantity',
                    key: 'received_quantity',
                    width: 100
                  },
                  {
                    title: 'Còn lại',
                    key: 'remaining',
                    width: 100,
                    render: (_, record) => record.quantity - record.received_quantity
                  },
                  {
                    title: 'SL nhập',
                    key: 'receive_qty',
                    width: 120,
                    render: (_, record) => (
                      <InputNumber
                        min={0}
                        max={record.quantity - record.received_quantity}
                        defaultValue={0}
                        onChange={(value) => handleReceiveQuantityChange(record.id, value || 0)}
                        style={{ width: '100%' }}
                      />
                    )
                  }
                ]}
              />
            </>
          )}
        </Form>
      </Modal>
        </Col>
      </Row>
    </div>
  );
};

export default StockReceiptList;
