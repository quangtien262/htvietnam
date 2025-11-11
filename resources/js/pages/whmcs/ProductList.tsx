import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Tag, Space, Input, Select, message, Modal, Form, InputNumber, Switch, Tabs } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TabPane } = Tabs;

interface Product {
  id: number;
  name: string;
  description?: string;
  type: 'hosting' | 'reseller' | 'server' | 'domain' | 'ssl' | 'other';
  active: boolean;
  disk_space?: number;
  bandwidth?: number;
  group_id?: number;
  pricings?: Array<{ id?: number; cycle: string; price: number; setup_fee: number }>;
  group?: { id: number; name: string };
}

interface ProductGroup {
  id: number;
  name: string;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProducts();
    fetchProductGroups();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/aio/api/whmcs/products');
      setProducts(response.data.data);
    } catch {
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductGroups = async () => {
    try {
      const response = await axios.get('/aio/api/whmcs/product-groups');
      setProductGroups(response.data.data || response.data);
    } catch {
      // Nếu không load được, để empty array
      setProductGroups([]);
    }
  };

  const handleSaveProduct = async (values: Record<string, unknown>) => {
    try {
      if (editingProduct) {
        await axios.put(`/aio/api/whmcs/products/${editingProduct.id}`, values);
        message.success('Cập nhật sản phẩm thành công');
      } else {
        await axios.post('/aio/api/whmcs/products', values);
        message.success('Tạo sản phẩm thành công');
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingProduct(null);
      fetchProducts();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        message.error(error.response?.data?.message || 'Không thể lưu sản phẩm');
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      ...product,
      pricings: product.pricings || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    Modal.confirm({
      title: 'Xóa sản phẩm',
      content: `Bạn có chắc muốn xóa sản phẩm ${product.name}?`,
      onOk: async () => {
        try {
          await axios.delete(`/aio/api/whmcs/products/${product.id}`);
          message.success('Xóa sản phẩm thành công');
          fetchProducts();
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            message.error(error.response?.data?.message || 'Không thể xóa sản phẩm');
          }
        }
      },
    });
  };

  const productTypeLabels: Record<string, string> = {
    hosting: 'Web Hosting',
    reseller: 'Reseller Hosting',
    server: 'VPS/Server',
    domain: 'Tên miền',
    ssl: 'SSL Certificate',
    other: 'Khác',
  };

  const billingCycleLabels: Record<string, string> = {
    monthly: 'Hàng tháng',
    quarterly: 'Hàng quý (3 tháng)',
    semiannually: 'Nửa năm (6 tháng)',
    annually: 'Hàng năm',
    biennially: '2 năm',
    triennially: '3 năm',
    one_time: 'Một lần',
  };

  const columns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Product) => (
        <div>
          <strong>{text}</strong>
          {!record.active && <Tag color="red" style={{ marginLeft: 8 }}>Tắt</Tag>}
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="blue">{productTypeLabels[type]}</Tag>
      ),
    },
    {
      title: 'Nhóm',
      dataIndex: ['group', 'name'],
      key: 'group',
      render: (text: string) => text || '-',
    },
    {
      title: 'Tài nguyên',
      key: 'resources',
      render: (_: unknown, record: Product) => {
        if (record.type === 'hosting' || record.type === 'reseller') {
          return (
            <div style={{ fontSize: 12 }}>
              <div>Disk: {record.disk_space ? `${record.disk_space} MB` : '∞'}</div>
              <div>BW: {record.bandwidth ? `${record.bandwidth} MB` : '∞'}</div>
            </div>
          );
        }
        return '-';
      },
    },
    {
      title: 'Giá',
      key: 'pricing',
      render: (_: unknown, record: Product) => {
        if (!record.pricings || record.pricings.length === 0) {
          return <Tag color="default">Chưa set giá</Tag>;
        }
        const lowestPrice = Math.min(...record.pricings.map(p => p.price));
        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>{lowestPrice ? Number(lowestPrice).toLocaleString() : '0'} VNĐ</div>
            <div style={{ fontSize: 11, color: '#888' }}>
              {record.pricings.length} gói giá
            </div>
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: Product) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title={<h2 className="text-xl font-semibold">Quản lý Sản phẩm / Dịch vụ</h2>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingProduct(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Thêm sản phẩm mới
          </Button>
        }
      >
        <Table
          dataSource={products}
          columns={columns}
          loading={loading}
          rowKey="id"
        />
      </Card>

      {/* Product Form Modal */}
      <Modal
        title={editingProduct ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingProduct(null);
        }}
        onOk={() => form.submit()}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveProduct}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Thông tin cơ bản" key="1">
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
              >
                <Input placeholder="VD: Hosting Basic" />
              </Form.Item>

              <Form.Item label="Mô tả" name="description">
                <Input.TextArea rows={3} placeholder="Mô tả sản phẩm..." />
              </Form.Item>

              <Form.Item
                label="Loại sản phẩm"
                name="type"
                rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
              >
                <Select placeholder="Chọn loại sản phẩm">
                  {Object.entries(productTypeLabels).map(([key, label]) => (
                    <Option key={key} value={key}>{label}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Nhóm sản phẩm" name="group_id">
                <Select placeholder="Chọn nhóm (không bắt buộc)" allowClear>
                  {productGroups.map((group) => (
                    <Option key={group.id} value={group.id}>{group.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Disk Space (MB)" name="disk_space">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0 = Unlimited" />
              </Form.Item>

              <Form.Item label="Bandwidth (MB)" name="bandwidth">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0 = Unlimited" />
              </Form.Item>

              <Form.Item label="Server Package Name" name="server_package_name">
                <Input placeholder="Tên gói trong cPanel/Plesk (nếu có)" />
              </Form.Item>

              <Form.Item label="Active" name="active" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
            </TabPane>

            <TabPane tab="Bảng giá" key="2">
              <Form.List name="pricings">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...restField}
                          name={[name, 'cycle']}
                          rules={[{ required: true, message: 'Chọn chu kỳ' }]}
                        >
                          <Select placeholder="Chu kỳ" style={{ width: 150 }}>
                            {Object.entries(billingCycleLabels).map(([key, label]) => (
                              <Option key={key} value={key}>{label}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'price']}
                          rules={[{ required: true, message: 'Nhập giá' }]}
                        >
                          <InputNumber placeholder="Giá" style={{ width: 150 }} min={0} />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'setup_fee']}>
                          <InputNumber placeholder="Phí cài đặt" style={{ width: 120 }} min={0} />
                        </Form.Item>
                        <Button onClick={() => remove(name)}>Xóa</Button>
                      </Space>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Thêm bảng giá
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductList;
