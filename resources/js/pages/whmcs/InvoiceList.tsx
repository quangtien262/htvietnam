import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Tag, Space, Input, Select, DatePicker, message, Modal, Form, InputNumber, Drawer } from 'antd';
import { PlusOutlined, SearchOutlined, DollarOutlined, SendOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import API from '@/common/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Invoice {
  id: number;
  invoice_number: string;
  client_id: number;
  client?: { id: number; company_name: string; email: string };
  status: 'unpaid' | 'paid' | 'cancelled' | 'refunded';
  subtotal: number;
  tax: number;
  total: number;
  amount_paid: number;
  date: string;
  due_date: string;
  date_paid?: string;
  items?: Array<{ description: string; amount: number; quantity: number }>;
}

const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState<any>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [clients, setClients] = useState<Array<{ value: number; label: string }>>([]);
  const [form] = Form.useForm();
  const [paymentForm] = Form.useForm();

  useEffect(() => {
    fetchInvoices();
    fetchClients();
  }, [pagination.current, filters]);

  const fetchClients = async () => {
    try {
      const response = await axios.post(API.congNoUsers);
      // API trả về { status_code, message, data: { datas: [...] } }
      const users = response.data?.data?.datas || [];
      setClients(users.map((u: any) => ({ value: u.id, label: `${u.name} (${u.phone || ''})` })));
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/aio/api/whmcs/invoices', {
        params: {
          page: pagination.current,
          per_page: pagination.pageSize,
          ...filters,
        },
      });
      setInvoices(response.data.data);
      setPagination({ ...pagination, total: response.data.total });
    } catch (error) {
      message.error('Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (values: any) => {
    try {
      await axios.post('/aio/api/whmcs/invoices', values);
      message.success('Tạo hóa đơn thành công');
      setIsCreateModalOpen(false);
      form.resetFields();
      fetchInvoices();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể tạo hóa đơn');
    }
  };

  const handleRecordPayment = async (values: any) => {
    if (!selectedInvoice) return;
    
    try {
      await axios.post(`/aio/api/whmcs/invoices/${selectedInvoice.id}/payment`, values);
      message.success('Ghi nhận thanh toán thành công');
      setIsPaymentModalOpen(false);
      paymentForm.resetFields();
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể ghi nhận thanh toán');
    }
  };

  const handleCancelInvoice = (invoice: Invoice) => {
    Modal.confirm({
      title: 'Hủy hóa đơn',
      content: `Bạn có chắc muốn hủy hóa đơn ${invoice.invoice_number}?`,
      onOk: async () => {
        try {
          await axios.post(`/aio/api/whmcs/invoices/${invoice.id}/cancel`, {
            reason: 'Cancelled by admin',
          });
          message.success('Hủy hóa đơn thành công');
          fetchInvoices();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Không thể hủy hóa đơn');
        }
      },
    });
  };

  const handleSendReminder = async (invoice: Invoice) => {
    try {
      await axios.post(`/aio/api/whmcs/invoices/${invoice.id}/send-reminder`, {
        type: 'first',
      });
      message.success('Đã gửi email nhắc nhở');
    } catch (error) {
      message.error('Không thể gửi email');
    }
  };

  const statusColors: Record<string, string> = {
    unpaid: 'warning',
    paid: 'success',
    cancelled: 'default',
    refunded: 'processing',
  };

  const statusLabels: Record<string, string> = {
    unpaid: 'Chưa thanh toán',
    paid: 'Đã thanh toán',
    cancelled: 'Đã hủy',
    refunded: 'Đã hoàn tiền',
  };

  const columns = [
    {
      title: 'Số hóa đơn',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Khách hàng',
      dataIndex: ['client', 'company_name'],
      key: 'client',
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
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => `${total.toLocaleString()} VNĐ`,
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'amount_paid',
      key: 'amount_paid',
      render: (amount: number) => `${amount.toLocaleString()} VNĐ`,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Hạn thanh toán',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string, record: Invoice) => {
        const isOverdue = dayjs(date).isBefore(dayjs()) && record.status === 'unpaid';
        return (
          <span style={{ color: isOverdue ? 'red' : 'inherit' }}>
            {dayjs(date).format('DD/MM/YYYY')}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Invoice) => (
        <Space>
          {record.status === 'unpaid' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<DollarOutlined />}
                onClick={() => {
                  setSelectedInvoice(record);
                  setIsPaymentModalOpen(true);
                }}
              >
                Thanh toán
              </Button>
              <Button
                size="small"
                icon={<SendOutlined />}
                onClick={() => handleSendReminder(record)}
              >
                Nhắc nhở
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleCancelInvoice(record)}
              >
                Hủy
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title={<h2 className="text-xl font-semibold">Quản lý Hóa đơn WHMCS</h2>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Tạo hóa đơn mới
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Tìm kiếm số hóa đơn"
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
            <Option value="unpaid">Chưa thanh toán</Option>
            <Option value="paid">Đã thanh toán</Option>
            <Option value="cancelled">Đã hủy</Option>
          </Select>
        </Space>

        <Table
          dataSource={invoices}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            onChange: (page) => setPagination({ ...pagination, current: page }),
          }}
        />
      </Card>

      {/* Create Invoice Modal */}
      <Modal
        title="Tạo hóa đơn mới"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateInvoice}>
          <Form.Item
            label="Khách hàng"
            name="client_id"
            rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
          >
            <Select
              showSearch
              placeholder="Chọn khách hàng"
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={clients}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      rules={[{ required: true, message: 'Nhập mô tả' }]}
                    >
                      <Input placeholder="Mô tả" style={{ width: 300 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'amount']}
                      rules={[{ required: true, message: 'Nhập số tiền' }]}
                    >
                      <InputNumber placeholder="Số tiền" style={{ width: 150 }} />
                    </Form.Item>
                    <Button onClick={() => remove(name)}>Xóa</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Thêm item
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item label="Hạn thanh toán" name="due_date">
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        title={`Ghi nhận thanh toán - ${selectedInvoice?.invoice_number}`}
        open={isPaymentModalOpen}
        onCancel={() => {
          setIsPaymentModalOpen(false);
          paymentForm.resetFields();
          setSelectedInvoice(null);
        }}
        onOk={() => paymentForm.submit()}
      >
        <Form form={paymentForm} layout="vertical" onFinish={handleRecordPayment}>
          <Form.Item
            label="Số tiền"
            name="amount"
            rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VNĐ"
            />
          </Form.Item>

          <Form.Item
            label="Phương thức thanh toán"
            name="payment_method"
            rules={[{ required: true, message: 'Vui lòng chọn phương thức' }]}
          >
            <Select placeholder="Chọn phương thức">
              <Option value="bank_transfer">Chuyển khoản ngân hàng</Option>
              <Option value="vnpay">VNPay</Option>
              <Option value="momo">MoMo</Option>
              <Option value="cash">Tiền mặt</Option>
              <Option value="credit">Credit Balance</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Mã giao dịch" name="transaction_id">
            <Input placeholder="Mã giao dịch (nếu có)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InvoiceList;
