import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Tag, Space, message, Upload, DatePicker, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, UserAddOutlined, DownloadOutlined, PhoneOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import dayjs from 'dayjs';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

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
  const [cuocGoiVisible, setCuocGoiVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedKhachHang, setSelectedKhachHang] = useState<DataKhachHang | null>(null);
  const [form] = Form.useForm();
  const [phanBoForm] = Form.useForm();
  const [cuocGoiForm] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [nhanViens, setNhanViens] = useState<NhanVien[]>([]);

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
    fetchNhanViens();
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

  const handleOpenCuocGoi = (record: DataKhachHang) => {
    setSelectedKhachHang(record);
    cuocGoiForm.resetFields();
    cuocGoiForm.setFieldsValue({
      data_khach_hang_id: record.id,
    });
    setCuocGoiVisible(true);
  };

  const handleSubmitCuocGoi = async () => {
    try {
      const values = await cuocGoiForm.validateFields();
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
      setCuocGoiVisible(false);
      fetchData();
    } catch (error) {
      message.error('Lỗi lưu dữ liệu');
    }
  };

  const handleDownloadTemplate = () => {
    window.open('/aio/api/api/telesale/data-khach-hang/template', '_blank');
  };

  const uploadProps: UploadProps = {
    name: 'file',
    accept: '.xlsx,.xls,.csv',
    showUploadList: false,
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                      file.type === 'application/vnd.ms-excel' ||
                      file.type === 'text/csv';
      if (!isExcel) {
        message.error('Chỉ chấp nhận file Excel (.xlsx, .xls) hoặc CSV!');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File phải nhỏ hơn 10MB!');
        return false;
      }
      return true;
    },
    customRequest: async ({ file, onSuccess, onError }) => {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file as File);

      try {
        const res = await axios.post('/aio/api/api/telesale/data-khach-hang/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success(res.data.message || 'Import thành công!');
        if (res.data.errors && res.data.errors.length > 0) {
          console.warn('Import errors:', res.data.errors);
          Modal.warning({
            title: 'Có một số lỗi khi import',
            content: res.data.errors.slice(0, 5).join('\n'),
          });
        }
        onSuccess?.(res.data);
        fetchData();
      } catch (error: any) {
        const errMsg = error.response?.data?.message || 'Lỗi import file';
        message.error(errMsg);
        onError?.(error);
      } finally {
        setUploading(false);
      }
    },
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
      width: 150,
      render: (_: any, record: DataKhachHang) => (
        <Space>
          <Button size="small" icon={<PhoneOutlined />} onClick={() => handleOpenCuocGoi(record)} title="Ghi nhận cuộc gọi" />
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
            <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
              Tải mẫu Excel
            </Button>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} loading={uploading}>
                Import Excel
              </Button>
            </Upload>
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
        title={`Ghi nhận Cuộc gọi - ${selectedKhachHang?.ten_khach_hang || ''}`}
        open={cuocGoiVisible}
        onOk={handleSubmitCuocGoi}
        onCancel={() => setCuocGoiVisible(false)}
        width={700}
      >
        <Form form={cuocGoiForm} layout="vertical">
          <Form.Item name="data_khach_hang_id" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="Khách hàng">
            <Input value={`${selectedKhachHang?.ten_khach_hang} - ${selectedKhachHang?.sdt}`} disabled />
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

      <Modal
        title="Phân bổ Data cho Telesale"
        open={phanBoVisible}
        onOk={handlePhanBo}
        onCancel={() => setPhanBoVisible(false)}
      >
        <Form form={phanBoForm} layout="vertical">
          <Form.Item name="nhan_vien_telesale_id" label="Nhân viên Telesale" rules={[{ required: true }]}>
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
        </Form>
      </Modal>
    </div>
  );
};

export default DataKhachHangPage;
