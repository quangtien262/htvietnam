import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Select, Input, InputNumber, Space, message, Tag, DatePicker } from 'antd';
import { PlusOutlined, PhoneOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

interface CuocGoi {
  id: number;
  ma_cuoc_goi: string;
  data_khach_hang_id: number;
  ten_khach_hang?: string;
  sdt?: string;
  nhan_vien_telesale_id: number;
  ten_nhan_vien?: string;
  thoi_gian_bat_dau: string;
  thoi_gian_ket_thuc?: string;
  thoi_luong?: number;
  ket_qua: string;
  noi_dung_cuoc_goi?: string;
  ghi_chu?: string;
  ngay_hen_goi_lai?: string;
  file_ghi_am?: string;
}

interface DataKhachHang {
  id: number;
  ma_data: string;
  ten_khach_hang: string;
  sdt: string;
  email?: string;
}

interface NhanVien {
  id: number;
  name: string;
}

const KET_QUA_MAP = {
  thanh_cong: { text: 'Thành công', color: 'green' },
  khong_nghe_may: { text: 'Không nghe máy', color: 'orange' },
  tu_choi: { text: 'Từ chối', color: 'red' },
  hen_goi_lai: { text: 'Hẹn gọi lại', color: 'blue' },
  sai_so: { text: 'Sai số', color: 'default' },
};

const CuocGoiPage: React.FC = () => {
  const [data, setData] = useState<CuocGoi[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [khachHangs, setKhachHangs] = useState<DataKhachHang[]>([]);
  const [nhanViens, setNhanViens] = useState<NhanVien[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/aio/api/api/telesale/cuoc-goi');
      setData(res.data.data || res.data);
    } catch (error) {
      message.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const fetchKhachHangs = async () => {
    try {
      const res = await axios.get('/aio/api/api/telesale/data-khach-hang');
      setKhachHangs(res.data.data || res.data);
    } catch (error) {
      message.error('Lỗi tải danh sách khách hàng');
    }
  };

  const fetchNhanViens = async () => {
    try {
      const res = await axios.get('/aio/api/api/admin/users');
      setNhanViens(res.data.data || res.data);
    } catch (error) {
      message.error('Lỗi tải danh sách nhân viên');
    }
  };

  useEffect(() => {
    fetchData();
    fetchKhachHangs();
    fetchNhanViens();
  }, []);

  const handleCreate = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        thoi_gian_bat_dau: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        thoi_gian_ket_thuc: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };
      // Convert ngay_hen_goi_lai dayjs to string if exists
      if (values.ngay_hen_goi_lai) {
        payload.ngay_hen_goi_lai = dayjs(values.ngay_hen_goi_lai).format('YYYY-MM-DD HH:mm:ss');
      }
      await axios.post('/aio/api/api/telesale/cuoc-goi/store', payload);
      message.success('Ghi nhận cuộc gọi thành công');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Lỗi lưu dữ liệu');
    }
  };

  const columns = [
    { title: 'Mã cuộc gọi', dataIndex: 'ma_cuoc_goi', key: 'ma_cuoc_goi', width: 120 },
    { title: 'Khách hàng', dataIndex: 'ten_khach_hang', key: 'ten_khach_hang' },
    { title: 'SĐT', dataIndex: 'sdt', key: 'sdt', width: 120 },
    {
      title: 'Kết quả',
      dataIndex: 'ket_qua',
      key: 'ket_qua',
      render: (val: string) => {
        const config = KET_QUA_MAP[val as keyof typeof KET_QUA_MAP];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      },
    },
    {
      title: 'Thời lượng',
      dataIndex: 'thoi_luong',
      key: 'thoi_luong',
      render: (val: number) => (val ? `${val}s` : '-'),
      width: 100,
    },
    { title: 'Thời gian', dataIndex: 'thoi_gian_bat_dau', key: 'thoi_gian_bat_dau', width: 160 },
    { title: 'NV gọi', dataIndex: 'ten_nhan_vien', key: 'ten_nhan_vien' },
    { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Quản lý Cuộc gọi Telesale"
        extra={
          <Button type="primary" icon={<PhoneOutlined />} onClick={handleCreate}>
            Ghi nhận cuộc gọi
          </Button>
        }
      >
        <Table columns={columns} dataSource={data} loading={loading} rowKey="id" pagination={{ pageSize: 20 }} />
      </Card>

      <Modal
        title="Ghi nhận Cuộc gọi"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="data_khach_hang_id" label="Khách hàng" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn khách hàng"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={khachHangs.map(kh => ({
                value: kh.id,
                label: `${kh.ten_khach_hang} - ${kh.sdt}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="nhan_vien_telesale_id" label="NV Telesale" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn nhân viên"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={nhanViens.map(nv => ({
                value: nv.id,
                label: nv.name,
              }))}
            />
          </Form.Item>
          <Form.Item name="thoi_luong" label="Thời lượng (giây)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="ket_qua" label="Kết quả" rules={[{ required: true }]}>
            <Select>
              {Object.entries(KET_QUA_MAP).map(([key, val]) => (
                <Option key={key} value={key}>{val.text}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="noi_dung_cuoc_goi" label="Nội dung cuộc gọi">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="ghi_chu" label="Ghi chú">
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item name="ngay_hen_goi_lai" label="Ngày hẹn gọi lại (nếu có)">
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              placeholder="Chọn ngày giờ"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CuocGoiPage;
