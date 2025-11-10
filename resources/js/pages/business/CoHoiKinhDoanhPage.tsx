import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Tag, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

interface CoHoi {
  id: number;
  ma_co_hoi: string;
  ten_co_hoi: string;
  user_id: number;
  ten_khach_hang?: string;
  nguon_khach_hang: string;
  giai_doan: string;
  gia_tri_du_kien: number;
  xac_suat_thanh_cong: number;
  nhan_vien_phu_trach_id: number;
  ten_nhan_vien?: string;
  ngay_du_kien_chot: string;
  ngay_chot_thuc_te?: string;
  ly_do_that_bai?: string;
  ghi_chu?: string;
}

const GIAI_DOAN_MAP = {
  lead: { text: 'Lead', color: 'default' },
  prospect: { text: 'Tiềm năng', color: 'blue' },
  qualified: { text: 'Đủ điều kiện', color: 'cyan' },
  proposal: { text: 'Đề xuất', color: 'orange' },
  negotiation: { text: 'Đàm phán', color: 'purple' },
  won: { text: 'Thành công', color: 'green' },
  lost: { text: 'Thất bại', color: 'red' },
};

const CoHoiKinhDoanhPage: React.FC = () => {
  const [data, setData] = useState<CoHoi[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/business/co-hoi');
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
    setModalVisible(true);
  };

  const handleEdit = (record: CoHoi) => {
    form.setFieldsValue({
      ...record,
      ngay_du_kien_chot: record.ngay_du_kien_chot ? dayjs(record.ngay_du_kien_chot) : null,
    });
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        ngay_du_kien_chot: values.ngay_du_kien_chot ? values.ngay_du_kien_chot.format('YYYY-MM-DD') : null,
      };

      if (editingId) {
        await axios.post(`/api/business/co-hoi/update/${editingId}`, payload);
        message.success('Cập nhật thành công');
      } else {
        await axios.post('/api/business/co-hoi/store', payload);
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
      await axios.post(`/api/business/co-hoi/delete/${id}`);
      message.success('Xóa thành công');
      fetchData();
    } catch (error) {
      message.error('Lỗi xóa dữ liệu');
    }
  };

  const handleUpdateGiaiDoan = async (id: number, giaiDoan: string) => {
    try {
      await axios.post(`/api/business/co-hoi/update-giai-doan/${id}`, { giai_doan: giaiDoan });
      message.success('Cập nhật giai đoạn thành công');
      fetchData();
    } catch (error) {
      message.error('Lỗi cập nhật giai đoạn');
    }
  };

  const columns = [
    { title: 'Mã cơ hội', dataIndex: 'ma_co_hoi', key: 'ma_co_hoi', width: 120 },
    { title: 'Tên cơ hội', dataIndex: 'ten_co_hoi', key: 'ten_co_hoi' },
    { title: 'Khách hàng', dataIndex: 'ten_khach_hang', key: 'ten_khach_hang' },
    {
      title: 'Giai đoạn',
      dataIndex: 'giai_doan',
      key: 'giai_doan',
      render: (giai_doan: string) => {
        const config = GIAI_DOAN_MAP[giai_doan as keyof typeof GIAI_DOAN_MAP];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      },
    },
    {
      title: 'Giá trị dự kiến',
      dataIndex: 'gia_tri_du_kien',
      key: 'gia_tri_du_kien',
      render: (val: number) => val?.toLocaleString('vi-VN') + ' đ',
    },
    {
      title: 'Xác suất (%)',
      dataIndex: 'xac_suat_thanh_cong',
      key: 'xac_suat_thanh_cong',
      width: 100,
    },
    { title: 'NV phụ trách', dataIndex: 'ten_nhan_vien', key: 'ten_nhan_vien' },
    { title: 'Ngày chốt dự kiến', dataIndex: 'ngay_du_kien_chot', key: 'ngay_du_kien_chot', width: 120 },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_: any, record: CoHoi) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          <Select
            size="small"
            value={record.giai_doan}
            onChange={(val) => handleUpdateGiaiDoan(record.id, val)}
            style={{ width: 140 }}
          >
            {Object.entries(GIAI_DOAN_MAP).map(([key, val]) => (
              <Option key={key} value={key}>
                {val.text}
              </Option>
            ))}
          </Select>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Quản lý Cơ hội Kinh doanh"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>Thêm mới</Button>}
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Modal
        title={editingId ? 'Cập nhật Cơ hội' : 'Tạo mới Cơ hội'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="ten_co_hoi" label="Tên cơ hội" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="user_id" label="Khách hàng ID" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="nguon_khach_hang" label="Nguồn khách hàng">
            <Input />
          </Form.Item>
          <Form.Item name="giai_doan" label="Giai đoạn" rules={[{ required: true }]}>
            <Select>
              {Object.entries(GIAI_DOAN_MAP).map(([key, val]) => (
                <Option key={key} value={key}>{val.text}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="gia_tri_du_kien" label="Giá trị dự kiến">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="xac_suat_thanh_cong" label="Xác suất thành công (%)">
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="nhan_vien_phu_trach_id" label="NV phụ trách ID">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="ngay_du_kien_chot" label="Ngày chốt dự kiến">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="ghi_chu" label="Ghi chú">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CoHoiKinhDoanhPage;
