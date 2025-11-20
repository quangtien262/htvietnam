import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, InputNumber, Space, message, Tag, Divider } from 'antd';
import { PlusOutlined, EditOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

interface DonHang {
  id: number;
  ma_don_hang: string;
  data_khach_hang_id: number;
  ten_khach_hang?: string;
  sdt_nguoi_nhan: string;
  ten_nguoi_nhan: string;
  dia_chi_giao_hang: string;
  trang_thai: string;
  tong_tien: number;
  phi_ship: number;
  tong_thanh_toan: number;
  hinh_thuc_thanh_toan: string;
  chi_tiets?: ChiTiet[];
}

interface ChiTiet {
  san_pham_id?: number;
  ten_san_pham: string;
  so_luong: number;
  don_gia: number;
  thanh_tien: number;
}

const TRANG_THAI_MAP = {
  moi: { text: 'Mới', color: 'blue' },
  da_xac_nhan: { text: 'Đã xác nhận', color: 'cyan' },
  dang_giao: { text: 'Đang giao', color: 'orange' },
  thanh_cong: { text: 'Thành công', color: 'green' },
  hoan: { text: 'Hoàn', color: 'red' },
  huy: { text: 'Hủy', color: 'default' },
};

const DonHangTelesalePage: React.FC = () => {
  const [data, setData] = useState<DonHang[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [chiTiets, setChiTiets] = useState<ChiTiet[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/aio/api/api/telesale/don-hang');
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
    setChiTiets([{ ten_san_pham: '', so_luong: 1, don_gia: 0, thanh_tien: 0 }]);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, chi_tiets: chiTiets };

      await axios.post('/aio/api/api/telesale/don-hang/store', payload);
      message.success('Tạo đơn hàng thành công');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Lỗi lưu dữ liệu');
    }
  };

  const handleUpdateStatus = async (id: number, trangThai: string) => {
    try {
      await axios.post(`/aio/api/api/telesale/don-hang/update-status/${id}`, { trang_thai: trangThai });
      message.success('Cập nhật trạng thái thành công');
      fetchData();
    } catch (error) {
      message.error('Lỗi cập nhật');
    }
  };

  const handleAddChiTiet = () => {
    setChiTiets([...chiTiets, { ten_san_pham: '', so_luong: 1, don_gia: 0, thanh_tien: 0 }]);
  };

  const handleChiTietChange = (index: number, field: string, value: any) => {
    const newChiTiets = [...chiTiets];
    newChiTiets[index] = { ...newChiTiets[index], [field]: value };
    if (field === 'so_luong' || field === 'don_gia') {
      newChiTiets[index].thanh_tien = newChiTiets[index].so_luong * newChiTiets[index].don_gia;
    }
    setChiTiets(newChiTiets);
  };

  const handleRemoveChiTiet = (index: number) => {
    setChiTiets(chiTiets.filter((_, i) => i !== index));
  };

  const columns = [
    { title: 'Mã đơn hàng', dataIndex: 'ma_don_hang', key: 'ma_don_hang', width: 120 },
    { title: 'Khách hàng', dataIndex: 'ten_khach_hang', key: 'ten_khach_hang' },
    { title: 'Người nhận', dataIndex: 'ten_nguoi_nhan', key: 'ten_nguoi_nhan' },
    { title: 'SĐT nhận', dataIndex: 'sdt_nguoi_nhan', key: 'sdt_nguoi_nhan', width: 120 },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
      render: (val: string, record: DonHang) => (
        <Select
          size="small"
          value={val}
          onChange={(newVal) => handleUpdateStatus(record.id, newVal)}
          style={{ width: 140 }}
        >
          {Object.entries(TRANG_THAI_MAP).map(([key, config]) => (
            <Option key={key} value={key}>
              <Tag color={config.color}>{config.text}</Tag>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Tổng thanh toán',
      dataIndex: 'tong_thanh_toan',
      key: 'tong_thanh_toan',
      render: (val: number) => val?.toLocaleString('vi-VN') + ' đ',
    },
    { title: 'Hình thức TT', dataIndex: 'hinh_thuc_thanh_toan', key: 'hinh_thuc_thanh_toan', width: 120 },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Quản lý Đơn hàng Telesale"
        extra={
          <Button type="primary" icon={<ShoppingCartOutlined />} onClick={handleCreate}>
            Tạo đơn hàng
          </Button>
        }
      >
        <Table columns={columns} dataSource={data} loading={loading} rowKey="id" pagination={{ pageSize: 20 }} />
      </Card>

      <Modal
        title="Tạo Đơn hàng Telesale"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={900}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="cuoc_goi_id" label="Cuộc gọi liên quan">
            <Select placeholder="Chọn cuộc gọi">
              <Option value={1}>CG00001 - Nguyễn Văn A</Option>
            </Select>
          </Form.Item>
          <Form.Item name="data_khach_hang_id" label="Khách hàng" rules={[{ required: true }]}>
            <Select placeholder="Chọn khách hàng">
              <Option value={1}>Nguyễn Văn A - 0901234567</Option>
            </Select>
          </Form.Item>
          <Form.Item name="nhan_vien_telesale_id" label="NV Telesale" rules={[{ required: true }]}>
            <Select>
              <Option value={1}>Nhân viên 1</Option>
            </Select>
          </Form.Item>
          <Form.Item name="ten_nguoi_nhan" label="Tên người nhận" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sdt_nguoi_nhan" label="SĐT người nhận" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="dia_chi_giao_hang" label="Địa chỉ giao hàng" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phi_ship" label="Phí ship">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="hinh_thuc_thanh_toan" label="Hình thức thanh toán" rules={[{ required: true }]}>
            <Select>
              <Option value="cod">COD</Option>
              <Option value="chuyen_khoan">Chuyển khoản</Option>
              <Option value="the">Thẻ</Option>
            </Select>
          </Form.Item>

          <Divider>Chi tiết đơn hàng</Divider>
          {chiTiets.map((ct, idx) => (
            <Space key={idx} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
              <Input
                placeholder="Tên sản phẩm"
                value={ct.ten_san_pham}
                onChange={(e) => handleChiTietChange(idx, 'ten_san_pham', e.target.value)}
                style={{ width: 200 }}
              />
              <InputNumber
                placeholder="SL"
                value={ct.so_luong}
                onChange={(val) => handleChiTietChange(idx, 'so_luong', val)}
                min={1}
              />
              <InputNumber
                placeholder="Đơn giá"
                value={ct.don_gia}
                onChange={(val) => handleChiTietChange(idx, 'don_gia', val)}
                style={{ width: 150 }}
              />
              <span>{ct.thanh_tien?.toLocaleString('vi-VN')} đ</span>
              <Button danger onClick={() => handleRemoveChiTiet(idx)}>Xóa</Button>
            </Space>
          ))}
          <Button type="dashed" onClick={handleAddChiTiet} block icon={<PlusOutlined />}>
            Thêm sản phẩm
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default DonHangTelesalePage;
