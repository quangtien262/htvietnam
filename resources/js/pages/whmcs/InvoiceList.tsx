import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Tag, Space, Input, Select, DatePicker, message, Modal, Form, InputNumber, Drawer, Dropdown, Col, Row } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, SearchOutlined, DollarOutlined, SendOutlined, CloseCircleOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';
import axios from 'axios';
import API from '@/common/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Invoice {
  id: number;
  number: string;
  user_id: number;
  user?: { id: number; name: string; email: string };
  status: 'unpaid' | 'paid' | 'cancelled' | 'refunded';
  subtotal: number;
  tax_total: number;
  total: number;
  credit_applied: number;
  created_at: string;
  due_date: string | null;
  paid_at: string | null;
  notes?: string;
}

const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState<any>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [clients, setClients] = useState<Array<{ value: number; label: string }>>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [paymentForm] = Form.useForm();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchInvoices();
    fetchClients();
    fetchProducts();
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

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/aio/api/whmcs/products');
      // Handle different response structures
      let productsData = response.data;
      
      // If response has data property, use it
      if (productsData && productsData.data) {
        productsData = productsData.data;
      }
      
      // Ensure it's an array
      if (!Array.isArray(productsData)) {
        productsData = [];
      }
      
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]); // Set empty array on error
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

  const handleUpdateInvoice = async (values: any) => {
    if (!selectedInvoice) return;
    
    try {
      await axios.put(`/aio/api/whmcs/invoices/${selectedInvoice.id}`, values);
      message.success('Cập nhật hóa đơn thành công');
      setIsEditModalOpen(false);
      editForm.resetFields();
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể cập nhật hóa đơn');
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
      content: `Bạn có chắc muốn hủy hóa đơn ${invoice.number}?`,
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
      dataIndex: 'number',
      key: 'number',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Khách hàng',
      dataIndex: ['user', 'name'],
      key: 'user',
      render: (_: any, record: any) => record.user?.name || '-',
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
      render: (total: number) => total ? `${Number(total).toLocaleString()} VNĐ` : '0 VNĐ',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: 'Hạn thanh toán',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string, record: Invoice) => {
        if (!date) return '-';
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
      width: 120,
      render: (_: any, record: Invoice) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'edit',
            label: 'Sửa',
            icon: <EditOutlined />,
            onClick: () => {
              setSelectedInvoice(record);
              editForm.setFieldsValue({
                user_id: record.user_id,
                status: record.status,
                due_date: record.due_date ? dayjs(record.due_date) : null,
                notes: record.notes,
              });
              setIsEditModalOpen(true);
            },
          },
        ];

        // Chỉ thêm các action này nếu invoice chưa thanh toán
        if (record.status === 'unpaid') {
          menuItems.push(
            {
              key: 'payment',
              label: 'Thanh toán',
              icon: <DollarOutlined />,
              onClick: () => {
                setSelectedInvoice(record);
                setIsPaymentModalOpen(true);
              },
            },
            {
              key: 'reminder',
              label: 'Nhắc nhở',
              icon: <SendOutlined />,
              onClick: () => handleSendReminder(record),
            },
            {
              type: 'divider',
            },
            {
              key: 'cancel',
              label: 'Hủy hóa đơn',
              icon: <CloseCircleOutlined />,
              danger: true,
              onClick: () => handleCancelInvoice(record),
            }
          );
        }

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button size="small" icon={<MoreOutlined />}>
              Thao tác
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className={isMobile ? "p-2" : "p-6"}>
      <Card
        title={
          <div style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 600 }}>
            Quản lý Hóa đơn WHMCS
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
            size={isMobile ? 'middle' : 'large'}
          >
            {isMobile ? 'Tạo mới' : 'Tạo hóa đơn mới'}
          </Button>
        }
      >
        {/* Filters - Responsive layout */}
        <Space 
          direction={isMobile ? 'vertical' : 'horizontal'} 
          style={{ marginBottom: 16, width: isMobile ? '100%' : 'auto' }} 
          wrap
        >
          <Input
            placeholder="Tìm kiếm số hóa đơn"
            prefix={<SearchOutlined />}
            style={{ width: isMobile ? '100%' : 250 }}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            allowClear
          />
          <Select
            placeholder="Trạng thái"
            style={{ width: isMobile ? '100%' : 150 }}
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
          scroll={{ x: isMobile ? 800 : undefined }}
          pagination={{
            ...pagination,
            onChange: (page) => setPagination({ ...pagination, current: page }),
            pageSize: isMobile ? 10 : 20,
            showSizeChanger: !isMobile,
            size: isMobile ? 'small' : 'default',
          }}
          size={isMobile ? 'small' : 'middle'}
        />
      </Card>

      {/* Create Invoice Modal/Drawer */}
      {isMobile ? (
        <Drawer
          title="Tạo hóa đơn mới"
          placement="bottom"
          height="90vh"
          open={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            form.resetFields();
          }}
          footer={
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsCreateModalOpen(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" onClick={() => form.submit()}>
                Tạo hóa đơn
              </Button>
            </Space>
          }
        >
          <Form form={form} layout="vertical" onFinish={handleCreateInvoice}>
            {/* Khách hàng và Hạn thanh toán trên cùng 1 hàng */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '16px' }}>
              <Form.Item
                label="Khách hàng"
                name="user_id"
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

              <Form.Item label="Hạn thanh toán" name="due_date">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </div>

            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} style={{ 
                      padding: isMobile ? '12px' : '16px', 
                      marginBottom: '16px', 
                      border: '1px solid #d9d9d9', 
                      borderRadius: '4px',
                      backgroundColor: '#fafafa'
                    }}>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                        gap: '16px', 
                        marginBottom: '16px' 
                      }}>
                      <Form.Item
                        {...restField}
                        label="Sản phẩm/Dịch vụ"
                        name={[name, 'product_id']}
                        rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                      >
                        <Select
                          placeholder="Chọn sản phẩm"
                          onChange={(productId) => {
                            const product = products.find(p => p.id === productId);
                            if (product && product.pricings && product.pricings.length > 0) {
                              // Clear billing cycle khi đổi product
                              const items = form.getFieldValue('items');
                              items[name].billing_cycle = undefined;
                              items[name].unit_price = undefined;
                              items[name].setup_fee = undefined;
                              form.setFieldsValue({ items });
                            }
                          }}
                        >
                          {Array.isArray(products) && products.map(product => (
                            <Option key={product.id} value={product.id}>
                              {product.name} ({product.type})
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label="Kỳ thanh toán"
                        name={[name, 'billing_cycle']}
                        rules={[{ required: true, message: 'Chọn kỳ thanh toán' }]}
                      >
                        <Select
                          placeholder="Chọn kỳ thanh toán"
                          onChange={(cycle) => {
                            const items = form.getFieldValue('items');
                            const productId = items[name].product_id;
                            const product = products.find(p => p.id === productId);
                            
                            if (product && product.pricings) {
                              const pricing = product.pricings.find((p: any) => p.cycle === cycle);
                              if (pricing) {
                                items[name].unit_price = pricing.price;
                                items[name].setup_fee = pricing.setup_fee || 0;
                                form.setFieldsValue({ items });
                              }
                            }
                          }}
                        >
                          {(() => {
                            const items = form.getFieldValue('items') || [];
                            const productId = items[name]?.product_id;
                            const product = products.find(p => p.id === productId);
                            
                            if (!product || !product.pricings) return null;
                            
                            return product.pricings.map((pricing: any) => (
                              <Option key={pricing.id} value={pricing.cycle}>
                                {pricing.cycle} - {Number(pricing.price).toLocaleString()} VNĐ
                              </Option>
                            ));
                          })()}
                        </Select>
                      </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px' }}>
                      <Form.Item
                        {...restField}
                        label="Mô tả"
                        name={[name, 'description']}
                        rules={[{ required: true, message: 'Nhập mô tả' }]}
                      >
                        <Input placeholder="Mô tả chi tiết" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label="Giá"
                        name={[name, 'unit_price']}
                        rules={[{ required: true, message: 'Nhập giá' }]}
                      >
                        <InputNumber 
                          placeholder="Giá" 
                          style={{ width: '100%' }}
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label="Phí cài đặt"
                        name={[name, 'setup_fee']}
                        initialValue={0}
                      >
                        <InputNumber 
                          placeholder="Phí cài đặt" 
                          style={{ width: '100%' }}
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label="Số lượng"
                        name={[name, 'qty']}
                        initialValue={1}
                        rules={[{ required: true, message: 'Nhập SL' }]}
                      >
                        <InputNumber 
                          placeholder="SL" 
                          min={1}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </div>

                    <Button 
                      danger 
                      onClick={() => remove(name)}
                      style={{ marginTop: '8px' }}
                    >
                      Xóa item này
                    </Button>
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Thêm item
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
        </Drawer>
      ) : (
        <Modal
          title="Tạo hóa đơn mới"
          open={isCreateModalOpen}
          onCancel={() => {
            setIsCreateModalOpen(false);
            form.resetFields();
          }}
          onOk={() => form.submit()}
          width={1000}
        >
          <Form form={form} layout="vertical" onFinish={handleCreateInvoice}>
            {/* Khách hàng và Hạn thanh toán trên cùng 1 hàng */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <Form.Item
                label="Khách hàng"
                name="user_id"
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

              <Form.Item label="Hạn thanh toán" name="due_date">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </div>

            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} style={{ 
                      padding: '16px', 
                      marginBottom: '16px', 
                      border: '1px solid #d9d9d9', 
                      borderRadius: '4px',
                      backgroundColor: '#fafafa'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <Form.Item
                          {...restField}
                          label="Sản phẩm/Dịch vụ"
                          name={[name, 'product_id']}
                          rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                        >
                          <Select
                            placeholder="Chọn sản phẩm"
                            onChange={(productId) => {
                              const product = products.find(p => p.id === productId);
                              if (product && product.pricings && product.pricings.length > 0) {
                                const items = form.getFieldValue('items');
                                items[name].billing_cycle = undefined;
                                items[name].unit_price = undefined;
                                items[name].setup_fee = undefined;
                                form.setFieldsValue({ items });
                              }
                            }}
                          >
                            {Array.isArray(products) && products.map(product => (
                              <Option key={product.id} value={product.id}>
                                {product.name} ({product.type})
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label="Kỳ thanh toán"
                          name={[name, 'billing_cycle']}
                          rules={[{ required: true, message: 'Chọn kỳ thanh toán' }]}
                        >
                          <Select
                            placeholder="Chọn kỳ thanh toán"
                            onChange={(cycle) => {
                              const items = form.getFieldValue('items');
                              const productId = items[name].product_id;
                              const product = products.find(p => p.id === productId);
                              
                              if (product && product.pricings) {
                                const pricing = product.pricings.find((p: any) => p.cycle === cycle);
                                if (pricing) {
                                  items[name].unit_price = pricing.price;
                                  items[name].setup_fee = pricing.setup_fee || 0;
                                  form.setFieldsValue({ items });
                                }
                              }
                            }}
                          >
                            {(() => {
                              const items = form.getFieldValue('items');
                              if (!items || !items[name]) return null;
                              
                              const productId = items[name].product_id;
                              const product = products.find(p => p.id === productId);
                              
                              if (!product || !product.pricings) return null;
                              
                              return product.pricings.map((pricing: any) => (
                                <Option key={pricing.cycle} value={pricing.cycle}>
                                  {pricing.cycle_display} - {pricing.price.toLocaleString()} VNĐ
                                </Option>
                              ));
                            })()}
                          </Select>
                        </Form.Item>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <Form.Item
                          {...restField}
                          label="Đơn giá"
                          name={[name, 'unit_price']}
                          rules={[{ required: true, message: 'Nhập giá' }]}
                        >
                          <InputNumber 
                            placeholder="Đơn giá" 
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label="Phí cài đặt"
                          name={[name, 'setup_fee']}
                          initialValue={0}
                        >
                          <InputNumber 
                            placeholder="Phí cài đặt" 
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          label="Số lượng"
                          name={[name, 'qty']}
                          initialValue={1}
                          rules={[{ required: true, message: 'Nhập SL' }]}
                        >
                          <InputNumber 
                            placeholder="SL" 
                            min={1}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </div>

                      <Button 
                        danger 
                        onClick={() => remove(name)}
                        style={{ marginTop: '8px' }}
                      >
                        Xóa item này
                      </Button>
                    </div>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Thêm item
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item label="Ghi chú" name="notes">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Modal>
      )}

      {/* Payment Modal/Drawer */}
      {isMobile ? (
        <Drawer
          title={`Thanh toán - ${selectedInvoice?.number}`}
          placement="bottom"
          height="70vh"
          open={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            paymentForm.resetFields();
            setSelectedInvoice(null);
          }}
          footer={
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsPaymentModalOpen(false);
                paymentForm.resetFields();
                setSelectedInvoice(null);
              }}>
                Hủy
              </Button>
              <Button type="primary" onClick={() => paymentForm.submit()}>
                Xác nhận
              </Button>
            </Space>
          }
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
        </Drawer>
      ) : (
        <Modal
          title={`Ghi nhận thanh toán - ${selectedInvoice?.number}`}
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
      )}

      {/* Edit Invoice Modal/Drawer */}
      {isMobile ? (
        <Drawer
          title={`Sửa - ${selectedInvoice?.number}`}
          placement="bottom"
          height="80vh"
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            editForm.resetFields();
            setSelectedInvoice(null);
          }}
          footer={
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsEditModalOpen(false);
                editForm.resetFields();
                setSelectedInvoice(null);
              }}>
                Hủy
              </Button>
              <Button type="primary" onClick={() => editForm.submit()}>
                Cập nhật
              </Button>
            </Space>
          }
        >
          <Form form={editForm} layout="vertical" onFinish={handleUpdateInvoice}>
            <Form.Item
              label="Khách hàng"
              name="user_id"
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

            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="unpaid">Chưa thanh toán</Option>
                <Option value="paid">Đã thanh toán</Option>
                <Option value="cancelled">Đã hủy</Option>
                <Option value="refunded">Đã hoàn tiền</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Hạn thanh toán" name="due_date">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item label="Ghi chú" name="notes">
              <Input.TextArea rows={3} placeholder="Ghi chú cho hóa đơn" />
            </Form.Item>
          </Form>
        </Drawer>
      ) : (
        <Modal
          title={`Sửa hóa đơn - ${selectedInvoice?.number}`}
          open={isEditModalOpen}
          onCancel={() => {
            setIsEditModalOpen(false);
            editForm.resetFields();
            setSelectedInvoice(null);
          }}
          onOk={() => editForm.submit()}
          width={800}
        >
          <Form form={editForm} layout="vertical" onFinish={handleUpdateInvoice}>
          <Form.Item
            label="Khách hàng"
            name="user_id"
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

          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="unpaid">Chưa thanh toán</Option>
              <Option value="paid">Đã thanh toán</Option>
              <Option value="cancelled">Đã hủy</Option>
              <Option value="refunded">Đã hoàn tiền</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Hạn thanh toán" name="due_date">
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea rows={3} placeholder="Ghi chú cho hóa đơn" />
          </Form.Item>
        </Form>
      </Modal>
      )}
    </div>
  );
};

export default InvoiceList;
