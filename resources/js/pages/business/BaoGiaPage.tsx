import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Space, message, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

interface BaoGia {
  id: number;
  ma_bao_gia: string;
  user_id: number;
  co_hoi_kinh_doanh_id?: number;
  ngay_bao_gia: string;
  hieu_luc_den: string;
  trang_thai: string;
  tong_tien: number;
  tien_giam_gia: number;
  tong_cong: number;
  chi_tiets?: ChiTiet[];
}

interface ChiTiet {
  san_pham_id?: number;
  ten_san_pham: string;
  mo_ta?: string;
  so_luong: number;
  don_gia: number;
  thanh_tien: number;
}

const TRANG_THAI_MAP = {
  draft: 'Nháp',
  sent: 'Đã gửi',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  expired: 'Hết hạn',
};

const BaoGiaPage: React.FC = () => {
  const [data, setData] = useState<BaoGia[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [chiTiets, setChiTiets] = useState<ChiTiet[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/business/bao-gia');
      setData(res.data);
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

  const handleEdit = (record: BaoGia) => {
    form.setFieldsValue({
      ...record,
      ngay_bao_gia: record.ngay_bao_gia ? dayjs(record.ngay_bao_gia) : null,
      hieu_luc_den: record.hieu_luc_den ? dayjs(record.hieu_luc_den) : null,
    });
    setChiTiets(record.chi_tiets || []);
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        ngay_bao_gia: values.ngay_bao_gia ? values.ngay_bao_gia.format('YYYY-MM-DD') : null,
        hieu_luc_den: values.hieu_luc_den ? values.hieu_luc_den.format('YYYY-MM-DD') : null,
        chi_tiets: chiTiets,
      };

      if (editingId) {
        await axios.post(`/api/business/bao-gia/update/${editingId}`, payload);
        message.success('Cập nhật thành công');
      } else {
        await axios.post('/api/business/bao-gia/store', payload);
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
      await axios.post(`/api/business/bao-gia/delete/${id}`);
      message.success('Xóa thành công');
      fetchData();
    } catch (error) {
      message.error('Lỗi xóa dữ liệu');
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
    { title: 'Mã báo giá', dataIndex: 'ma_bao_gia', key: 'ma_bao_gia', width: 120 },
    { title: 'Ngày báo giá', dataIndex: 'ngay_bao_gia', key: 'ngay_bao_gia', width: 120 },
    { title: 'Hiệu lực đến', dataIndex: 'hieu_luc_den', key: 'hieu_luc_den', width: 120 },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
      render: (val: string) => TRANG_THAI_MAP[val as keyof typeof TRANG_THAI_MAP],
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'tong_tien',
      key: 'tong_tien',
      render: (val: number) => val?.toLocaleString('vi-VN') + ' đ',
    },
    {
      title: 'Giảm giá',
      dataIndex: 'tien_giam_gia',
      key: 'tien_giam_gia',
      render: (val: number) => val?.toLocaleString('vi-VN') + ' đ',
    },
    {
      title: 'Tổng cộng',
      dataIndex: 'tong_cong',
      key: 'tong_cong',
      render: (val: number) => val?.toLocaleString('vi-VN') + ' đ',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_: any, record: BaoGia) => (
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
        title="Quản lý Báo giá"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>Tạo báo giá</Button>}
      >
        <Table columns={columns} dataSource={data} loading={loading} rowKey="id" pagination={{ pageSize: 20 }} />
      </Card>

      <Modal
        title={editingId ? 'Cập nhật Báo giá' : 'Tạo Báo giá mới'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={900}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="user_id" label="Khách hàng ID" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="co_hoi_kinh_doanh_id" label="Cơ hội kinh doanh ID">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="ngay_bao_gia" label="Ngày báo giá" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="hieu_luc_den" label="Hiệu lực đến">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="trang_thai" label="Trạng thái" rules={[{ required: true }]}>
            <Select>
              {Object.entries(TRANG_THAI_MAP).map(([key, val]) => (
                <Option key={key} value={key}>{val}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="tien_giam_gia" label="Giảm giá">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="dieu_khoan" label="Điều khoản">
            <TextArea rows={2} />
          </Form.Item>

          <Divider>Chi tiết báo giá</Divider>
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

export default BaoGiaPage;
