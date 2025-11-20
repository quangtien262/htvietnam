import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Tag, Space, message, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, UserAddOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

interface DataKhachHang {
  id: number;
  ma_data: string;
  ten_khach_hang: string;
  sdt: string;
  email?: string;
  dia_chi?: string;
  nguon_data: string;
  phan_loai: string;
  trang_thai: string;
  nhan_vien_telesale_id?: number;
  ten_nhan_vien?: string;
  tags?: string[];
}

const NGUON_DATA_MAP = {
  mua_data: 'Mua data',
  website: 'Website',
  facebook: 'Facebook',
  landing_page: 'Landing Page',
  gioi_thieu: 'Giới thiệu',
};

const PHAN_LOAI_MAP = {
  nong: { text: 'Nóng', color: 'red' },
  am: { text: 'Ấm', color: 'orange' },
  lanh: { text: 'Lạnh', color: 'blue' },
};

const TRANG_THAI_MAP = {
  moi: { text: 'Mới', color: 'green' },
  dang_goi: { text: 'Đang gọi', color: 'blue' },
  da_goi: { text: 'Đã gọi', color: 'default' },
  thanh_cong: { text: 'Thành công', color: 'success' },
  that_bai: { text: 'Thất bại', color: 'error' },
  trung: { text: 'Trùng', color: 'warning' },
};

const DataKhachHangPage: React.FC = () => {
  const [data, setData] = useState<DataKhachHang[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [phanBoVisible, setPhanBoVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [form] = Form.useForm();
  const [phanBoForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/aio/api/api/telesale/data-khach-hang');
      setData(res.data.data || res.data);
    } catch (error) {
      message.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEdit = (record: DataKhachHang) => {
    form.setFieldsValue(record);
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await axios.post(`/aio/api/api/telesale/data-khach-hang/update/${editingId}`, values);
        message.success('Cập nhật thành công');
      } else {
        await axios.post('/aio/api/api/telesale/data-khach-hang/store', values);
        message.success('Tạo mới thành công');
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Lỗi lưu dữ liệu');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.post(`/aio/api/api/telesale/data-khach-hang/delete/${id}`);
      message.success('Xóa thành công');
      fetchData();
    } catch (error) {
      message.error('Lỗi xóa dữ liệu');
    }
  };

  const handlePhanBo = async () => {
    try {
      const values = await phanBoForm.validateFields();
      await axios.post('/aio/api/api/telesale/data-khach-hang/phan-bo', {
        data_ids: selectedIds,
        nhan_vien_telesale_id: values.nhan_vien_telesale_id,
      });
      message.success('Phân bổ thành công');
      setPhanBoVisible(false);
      setSelectedIds([]);
      fetchData();
    } catch (error) {
      message.error('Lỗi phân bổ dữ liệu');
    }
  };

  const columns = [
    { title: 'Mã data', dataIndex: 'ma_data', key: 'ma_data', width: 100 },
    { title: 'Tên khách hàng', dataIndex: 'ten_khach_hang', key: 'ten_khach_hang' },
    { title: 'SĐT', dataIndex: 'sdt', key: 'sdt', width: 120 },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Nguồn',
      dataIndex: 'nguon_data',
      key: 'nguon_data',
      render: (val: string) => NGUON_DATA_MAP[val as keyof typeof NGUON_DATA_MAP],
    },
    {
      title: 'Phân loại',
      dataIndex: 'phan_loai',
      key: 'phan_loai',
      render: (val: string) => {
        const config = PHAN_LOAI_MAP[val as keyof typeof PHAN_LOAI_MAP];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
      render: (val: string) => {
        const config = TRANG_THAI_MAP[val as keyof typeof TRANG_THAI_MAP];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      },
    },
    { title: 'NV phụ trách', dataIndex: 'ten_nhan_vien', key: 'ten_nhan_vien' },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_: any, record: DataKhachHang) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Quản lý Data Khách hàng Telesale"
        extra={
          <Space>
            <Button icon={<UploadOutlined />}>Import Excel</Button>
            <Button
              icon={<UserAddOutlined />}
              disabled={selectedIds.length === 0}
              onClick={() => setPhanBoVisible(true)}
            >
              Phân bổ ({selectedIds.length})
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Thêm data
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          rowSelection={{
            selectedRowKeys: selectedIds,
            onChange: (keys) => setSelectedIds(keys as number[]),
          }}
        />
      </Card>

      <Modal
        title={editingId ? 'Cập nhật Data' : 'Thêm Data mới'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="ten_khach_hang" label="Tên khách hàng" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sdt" label="Số điện thoại" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="dia_chi" label="Địa chỉ">
            <Input />
          </Form.Item>
          <Form.Item name="nguon_data" label="Nguồn data" rules={[{ required: true }]}>
            <Select>
              {Object.entries(NGUON_DATA_MAP).map(([key, val]) => (
                <Option key={key} value={key}>{val}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="phan_loai" label="Phân loại">
            <Select>
              {Object.entries(PHAN_LOAI_MAP).map(([key, val]) => (
                <Option key={key} value={key}>{val.text}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="trang_thai" label="Trạng thái">
            <Select>
              {Object.entries(TRANG_THAI_MAP).map(([key, val]) => (
                <Option key={key} value={key}>{val.text}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Phân bổ Data cho Telesale"
        open={phanBoVisible}
        onOk={handlePhanBo}
        onCancel={() => setPhanBoVisible(false)}
      >
        <Form form={phanBoForm} layout="vertical">
          <Form.Item name="nhan_vien_telesale_id" label="Nhân viên Telesale" rules={[{ required: true }]}>
            <Select placeholder="Chọn nhân viên">
              {/* TODO: Load from API */}
              <Option value={1}>Nhân viên 1</Option>
              <Option value={2}>Nhân viên 2</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DataKhachHangPage;
