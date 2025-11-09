import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Popconfirm,
  DatePicker,
  InputNumber,
  Tag,
  Divider,
  Checkbox,
  Row,
  Col,
  Drawer,
  Dropdown,
  Menu
} from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  DollarOutlined,
  DownloadOutlined,
  FilterOutlined,
  MoreOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import API from '../../common/api';
import dayjs from 'dayjs';
import PaymentModal from './PaymentModal';
import CongNoStatistics from './CongNoStatistics';
import '../../../css/congno-responsive.css';

interface CongNo {
  id: number;
  name: string;
  code: string;
  loai_cong_no: string;
  users_id: number;
  nha_cung_cap_id: number;
  loai_chung_tu: string;
  chung_tu_id: number;
  ma_chung_tu: string;
  product_id: number;
  product_code: string;
  tong_tien_hoa_don: number;
  so_tien_da_thanh_toan: number;
  so_tien_no: number;
  cong_no_status_id: number;
  ngay_hen_tat_toan: string;
  ngay_tat_toan: string;
  info: string;
}

interface NhaCungCap {
  id: number;
  name: string;
  code: string;
}

interface User {
  id: number;
  name: string;
  phone: string;
}

interface Status {
  id: number;
  name: string;
}

const CongNoList: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<CongNo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [filterNhaCungCapId, setFilterNhaCungCapId] = useState<number | undefined>(undefined);
  const [filterUsersId, setFilterUsersId] = useState<number | undefined>(undefined);
  const [filterLoaiChungTu, setFilterLoaiChungTu] = useState<string | undefined>(undefined);
  const [filterStatusId, setFilterStatusId] = useState<number | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loaiCongNo, setLoaiCongNo] = useState<'receivable' | 'payable' | null>(null);

  const [nhaCungCapList, setNhaCungCapList] = useState<NhaCungCap[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);

  // States cho tính năng nâng cao
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedCongNo, setSelectedCongNo] = useState<CongNo | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkStatusId, setBulkStatusId] = useState<number | undefined>(undefined);

  // State cho mobile filter drawer
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);  useEffect(() => {
    loadNhaCungCap();
    loadUsers();
    loadStatus();
  }, []);

  useEffect(() => {
    loadData();
  }, [page, pageSize, search, filterNhaCungCapId, filterUsersId, filterLoaiChungTu, filterStatusId]);

  const loadNhaCungCap = async () => {
    try {
      const res = await axios.post(API.congNoNhaCungCap, {});
      if (res.data.status_code === 200) {
        setNhaCungCapList(res.data.data?.datas || []);
      }
    } catch (error) {
      console.error('Lỗi khi tải nhà cung cấp:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await axios.post(API.congNoUsers, {});
      if (res.data.status_code === 200) {
        setUsersList(res.data.data?.datas || []);
      }
    } catch (error) {
      console.error('Lỗi khi tải khách hàng:', error);
    }
  };

  const loadStatus = async () => {
    try {
      const res = await axios.post(API.congNoStatus, {});
      if (res.data.status_code === 200) {
        setStatusList(res.data.data?.datas || []);
      }
    } catch (error) {
      console.error('Lỗi khi tải trạng thái:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await axios.post(API.congNoList, {
        searchData: {
          page,
          pageSize,
          search,
          nha_cung_cap_id: filterNhaCungCapId,
          users_id: filterUsersId,
          loai_chung_tu: filterLoaiChungTu,
          cong_no_status_id: filterStatusId
        }
      });

      if (res.data.status_code === 200) {
        setDataSource(res.data.data.list);
        setTotal(res.data.data.total);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách công nợ');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleAddReceivable = () => {
    setEditingId(null);
    setLoaiCongNo('receivable');
    form.resetFields();
    form.setFieldsValue({ loai_cong_no: 'receivable' });
    setModalVisible(true);
  };

  const handleAddPayable = () => {
    setEditingId(null);
    setLoaiCongNo('payable');
    form.resetFields();
    form.setFieldsValue({ loai_cong_no: 'payable' });
    setModalVisible(true);
  };

  const handleEdit = async (record: CongNo) => {
    setEditingId(record.id);

    try {
      const res = await axios.post(API.congNoDetail, { id: record.id });

      if (res.data.status_code === 200) {
        const { cong_no } = res.data.data;

        setLoaiCongNo(cong_no.loai_cong_no || null);

        form.setFieldsValue({
          name: cong_no.name,
          loai_cong_no: cong_no.loai_cong_no,
          users_id: cong_no.users_id || undefined,
          nha_cung_cap_id: cong_no.nha_cung_cap_id || undefined,
          loai_chung_tu: cong_no.loai_chung_tu,
          chung_tu_id: cong_no.chung_tu_id,
          ma_chung_tu: cong_no.ma_chung_tu,
          product_id: cong_no.product_id,
          product_code: cong_no.product_code,
          tong_tien_hoa_don: cong_no.tong_tien_hoa_don,
          so_tien_da_thanh_toan: cong_no.so_tien_da_thanh_toan,
          so_tien_no: cong_no.so_tien_no,
          cong_no_status_id: cong_no.cong_no_status_id,
          ngay_hen_tat_toan: cong_no.ngay_hen_tat_toan ? dayjs(cong_no.ngay_hen_tat_toan) : null,
          info: cong_no.info
        });

        setModalVisible(true);
      }
    } catch (error) {
      message.error('Lỗi khi tải chi tiết công nợ');
    }
  };

  const handleDelete = async (ids: number[]) => {
    try {
      const res = await axios.post(API.congNoDelete, { ids });

      if (res.data.status_code === 200) {
        message.success('Xóa công nợ thành công');
        loadData();
      }
    } catch (error) {
      message.error('Lỗi khi xóa công nợ');
    }
  };

  // Handlers cho tính năng nâng cao
  const handlePayment = (record: CongNo) => {
    setSelectedCongNo(record);
    setPaymentModalVisible(true);
  };

  const handleBulkUpdateStatus = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một công nợ');
      return;
    }
    if (!bulkStatusId) {
      message.warning('Vui lòng chọn trạng thái');
      return;
    }

    try {
      const res = await axios.post(API.congNoBulkUpdateStatus, {
        ids: selectedRowKeys,
        cong_no_status_id: bulkStatusId
      });
      if (res.data.status_code === 200) {
        message.success('Cập nhật trạng thái thành công');
        setSelectedRowKeys([]);
        setBulkStatusId(undefined);
        loadData();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một công nợ');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} công nợ đã chọn?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          for (const id of selectedRowKeys) {
            await axios.post(API.congNoDelete, { ids: [id] });
          }
          message.success('Xóa thành công');
          setSelectedRowKeys([]);
          loadData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
      }
    });
  };

  const handleExport = async () => {
    try {
      const res = await axios.post(API.congNoExport, {
        searchData: {
          search,
          nha_cung_cap_id: filterNhaCungCapId,
          users_id: filterUsersId,
          loai_chung_tu: filterLoaiChungTu,
          cong_no_status_id: filterStatusId
        }
      });

      if (res.data.status_code === 200) {
        const data = res.data.data;

        // Tạo CSV
        const headers = ['Mã CN', 'Tiêu đề', 'NCC', 'Khách hàng', 'Loại chứng từ', 'Mã chứng từ', 'Tổng tiền HĐ', 'Đã thanh toán', 'Còn nợ', 'Trạng thái', 'Ngày hẹn', 'Ngày tất toán'];
        const rows = data.map((item: any) => [
          item.code,
          item.name,
          item.nha_cung_cap_name || '',
          item.user_name || '',
          item.loai_chung_tu,
          item.ma_chung_tu,
          item.tong_tien_hoa_don,
          item.so_tien_da_thanh_toan,
          item.so_tien_no,
          item.status_name || '',
          item.ngay_hen_tat_toan || '',
          item.ngay_tat_toan || ''
        ]);

        let csvContent = headers.join(',') + '\n';
        rows.forEach((row: any[]) => {
          csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
        });

        // Download file
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `cong_no_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
        link.click();

        message.success('Export thành công');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      const payload = {
        name: values.name || '',
        loai_cong_no: values.loai_cong_no || '',
        users_id: values.users_id || 0,
        nha_cung_cap_id: values.nha_cung_cap_id || 0,
        loai_chung_tu: values.loai_chung_tu || '',
        chung_tu_id: values.chung_tu_id || 0,
        ma_chung_tu: values.ma_chung_tu || '',
        product_id: values.product_id || 0,
        product_code: values.product_code || '',
        tong_tien_hoa_don: values.tong_tien_hoa_don || 0,
        so_tien_da_thanh_toan: values.so_tien_da_thanh_toan || 0,
        so_tien_no: values.so_tien_no || 0,
        cong_no_status_id: values.cong_no_status_id || 0,
        ngay_hen_tat_toan: values.ngay_hen_tat_toan ? values.ngay_hen_tat_toan.format('YYYY-MM-DD') : null,
        info: values.info || null
      };

      if (editingId) {
        const res = await axios.post(API.congNoUpdate, { id: editingId, ...payload });
        if (res.data.status_code === 200) {
          message.success('Cập nhật công nợ thành công');
        }
      } else {
        const res = await axios.post(API.congNoAdd, payload);
        if (res.data.status_code === 200) {
          message.success('Thêm công nợ thành công');
        }
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error('Vui lòng kiểm tra lại thông tin');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getLoaiChungTuText = (loai: string) => {
    const map: { [key: string]: string } = {
      'product_tra_hang_ncc': 'Trả hàng NCC',
      'product_nhap_hang': 'Nhập hàng',
      'hoa_don': 'Hóa đơn',
      'product_khach_tra_hang': 'Khách trả hàng'
    };
    return map[loai] || loai;
  };

  const columns: ColumnsType<CongNo> = [
    {
      title: 'Mã CN',
      dataIndex: 'code',
      key: 'code',
      width: 100
    },
    {
      title: 'Loại',
      dataIndex: 'loai_cong_no',
      key: 'loai_cong_no',
      width: 150,
      render: (loai: string) => {
        if (loai === 'receivable') {
          return <Tag color="green">Nợ cần thu</Tag>;
        } else if (loai === 'payable') {
          return <Tag color="orange">Nợ phải trả</Tag>;
        }
        return <Tag>-</Tag>;
      }
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: 'Loại chứng từ',
      dataIndex: 'loai_chung_tu',
      key: 'loai_chung_tu',
      width: 150,
      render: (loai: string) => <Tag>{getLoaiChungTuText(loai)}</Tag>
    },
    {
      title: 'Số tiền nợ',
      dataIndex: 'so_tien_no',
      key: 'so_tien_no',
      width: 150,
      render: (value: number) => (
        <span style={{ color: value > 0 ? 'green' : 'red', fontWeight: 'bold' }}>
          {formatCurrency(value)}
        </span>
      )
    },
    {
      title: 'Tổng tiền HĐ',
      dataIndex: 'tong_tien_hoa_don',
      key: 'tong_tien_hoa_don',
      width: 150,
      render: (value: number) => formatCurrency(value)
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'so_tien_da_thanh_toan',
      key: 'so_tien_da_thanh_toan',
      width: 150,
      render: (value: number) => formatCurrency(value)
    },
    {
      title: 'Ngày hẹn',
      dataIndex: 'ngay_hen_tat_toan',
      key: 'ngay_hen_tat_toan',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : ''
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'payment',
            icon: <DollarOutlined />,
            label: 'Thanh toán',
            disabled: record.so_tien_no <= 0,
            onClick: () => handlePayment(record)
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Sửa',
            onClick: () => handleEdit(record)
          },
          {
            type: 'divider'
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Xóa',
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: 'Xác nhận xóa',
                content: 'Bạn có chắc chắn muốn xóa công nợ này?',
                okText: 'Có',
                cancelText: 'Không',
                onOk: () => handleDelete([record.id])
              });
            }
          }
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="link" icon={<MoreOutlined />}>
              Thao tác
            </Button>
          </Dropdown>
        );
      }
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys)
  };

  const getFilterValues = () => ({
    nha_cung_cap_id: filterNhaCungCapId,
    users_id: filterUsersId,
    loai_chung_tu: filterLoaiChungTu,
    cong_no_status_id: filterStatusId
  });

  return (
    <div className="cong-no-container" style={{ padding: 24 }}>
      <Divider orientation="left" style={{ fontSize: 20, fontWeight: 'bold', marginTop: 0 }}>
        Quản lý Công nợ
      </Divider>

      {/* Statistics Dashboard */}
      <div className="cong-no-statistics">
        <CongNoStatistics filters={getFilterValues()} />
      </div>

      {/* Mobile Filter Button */}
      <div className="mobile-only" style={{ marginBottom: 16 }}>
        <Button
          icon={<FilterOutlined />}
          onClick={() => setFilterDrawerVisible(true)}
          block
          size="large"
        >
          Bộ lọc & Tìm kiếm
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Filter Panel - Desktop only */}
        <div className="desktop-only" style={{ width: 280, flexShrink: 0 }}>
          <div style={{
            background: '#fff',
            padding: 16,
            borderRadius: 8,
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <Divider orientation="left" style={{ marginTop: 0 }}>Bộ lọc</Divider>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Tìm kiếm</label>
              <Input
                placeholder="Tìm kiếm..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Nhà cung cấp</label>
              <Select
                placeholder="Chọn NCC"
                value={filterNhaCungCapId}
                onChange={setFilterNhaCungCapId}
                allowClear
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
              >
                {nhaCungCapList.map((ncc) => (
                  <Select.Option key={ncc.id} value={ncc.id}>
                    {ncc.name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Khách hàng</label>
              <Select
                placeholder="Chọn KH"
                value={filterUsersId}
                onChange={setFilterUsersId}
                allowClear
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
              >
                {usersList.map((user) => (
                  <Select.Option key={user.id} value={user.id}>
                    {user.name} - {user.phone}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Loại chứng từ</label>
              <Select
                placeholder="Chọn loại"
                value={filterLoaiChungTu}
                onChange={setFilterLoaiChungTu}
                allowClear
                style={{ width: '100%' }}
              >
                <Select.Option value="product_tra_hang_ncc">Trả hàng NCC</Select.Option>
                <Select.Option value="product_nhap_hang">Nhập hàng</Select.Option>
                <Select.Option value="hoa_don">Hóa đơn</Select.Option>
                <Select.Option value="product_khach_tra_hang">Khách trả hàng</Select.Option>
              </Select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Trạng thái</label>
              <Select
                placeholder="Chọn trạng thái"
                value={filterStatusId}
                onChange={setFilterStatusId}
                allowClear
                style={{ width: '100%' }}
              >
                {statusList.map((status) => (
                  <Select.Option key={status.id} value={status.id}>
                    {status.name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <Button
              block
              onClick={() => {
                setSearch('');
                setFilterNhaCungCapId(undefined);
                setFilterUsersId(undefined);
                setFilterLoaiChungTu(undefined);
                setFilterStatusId(undefined);
                setPage(1);
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>

        {/* Filter Drawer - Mobile only */}
        <Drawer
          title="Bộ lọc & Tìm kiếm"
          placement="left"
          onClose={() => setFilterDrawerVisible(false)}
          open={filterDrawerVisible}
          width={300}
        >
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Tìm kiếm</label>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Nhà cung cấp</label>
            <Select
              placeholder="Chọn NCC"
              value={filterNhaCungCapId}
              onChange={setFilterNhaCungCapId}
              allowClear
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="children"
            >
              {nhaCungCapList.map((ncc) => (
                <Select.Option key={ncc.id} value={ncc.id}>
                  {ncc.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Khách hàng</label>
            <Select
              placeholder="Chọn KH"
              value={filterUsersId}
              onChange={setFilterUsersId}
              allowClear
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="children"
            >
              {usersList.map((user) => (
                <Select.Option key={user.id} value={user.id}>
                  {user.name} - {user.phone}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Loại chứng từ</label>
            <Select
              placeholder="Chọn loại"
              value={filterLoaiChungTu}
              onChange={setFilterLoaiChungTu}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value="product_tra_hang_ncc">Trả hàng NCC</Select.Option>
              <Select.Option value="product_nhap_hang">Nhập hàng</Select.Option>
              <Select.Option value="hoa_don">Hóa đơn</Select.Option>
              <Select.Option value="product_khach_tra_hang">Khách trả hàng</Select.Option>
            </Select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Trạng thái</label>
            <Select
              placeholder="Chọn trạng thái"
              value={filterStatusId}
              onChange={setFilterStatusId}
              allowClear
              style={{ width: '100%' }}
            >
              {statusList.map((status) => (
                <Select.Option key={status.id} value={status.id}>
                  {status.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Button
              block
              type="primary"
              onClick={() => setFilterDrawerVisible(false)}
            >
              Áp dụng
            </Button>
            <Button
              block
              onClick={() => {
                setSearch('');
                setFilterNhaCungCapId(undefined);
                setFilterUsersId(undefined);
                setFilterLoaiChungTu(undefined);
                setFilterStatusId(undefined);
                setPage(1);
                setFilterDrawerVisible(false);
              }}
            >
              Xóa bộ lọc
            </Button>
          </Space>
        </Drawer>

        {/* Main Content - Bên phải */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Action Buttons */}
          <div className="action-buttons-mobile" style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap'
          }}>
            <Space wrap>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'receivable',
                      label: 'Nợ cần thu',
                      icon: <PlusOutlined />,
                      onClick: handleAddReceivable
                    },
                    {
                      key: 'payable',
                      label: 'Nợ phải trả',
                      icon: <PlusOutlined />,
                      onClick: handleAddPayable
                    }
                  ]
                }}
                trigger={['click']}
              >
                <Button type="primary" icon={<PlusOutlined />}>
                  <span className="hide-on-mobile">Thêm công nợ</span>
                  <span className="desktop-only" style={{ display: 'none' }}>Thêm</span>
                </Button>
              </Dropdown>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                <span className="hide-on-mobile">Export</span>
                <span className="desktop-only" style={{ display: 'none' }}>Excel</span>
              </Button>
            </Space>

            {/* Bulk Operations */}
            {selectedRowKeys.length > 0 && (
              <Space wrap className="bulk-operations-mobile">
                <span style={{ fontSize: 12 }}>Đã chọn {selectedRowKeys.length}</span>
                <Select
                  placeholder="Trạng thái"
                  value={bulkStatusId}
                  onChange={setBulkStatusId}
                  style={{ width: 150 }}
                  size="small"
                >
                  {statusList.map((status) => (
                    <Select.Option key={status.id} value={status.id}>
                      {status.name}
                    </Select.Option>
                  ))}
                </Select>
                <Button size="small" type="primary" onClick={handleBulkUpdateStatus}>
                  Cập nhật
                </Button>
                <Button size="small" danger onClick={handleBulkDelete}>
                  Xóa
                </Button>
              </Space>
            )}
          </div>

          <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            rowKey="id"
            rowSelection={rowSelection}
            scroll={{ x: 1200 }}
            size="middle"
            pagination={{
              current: page,
              pageSize: pageSize,
              total: total,
              onChange: (newPage, newPageSize) => {
                setPage(newPage);
                setPageSize(newPageSize || 20);
              },
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} công nợ`
            }}
          />
        </div>
      </div>

      <Modal
        title={
          editingId
            ? 'Chỉnh sửa công nợ'
            : loaiCongNo === 'receivable'
              ? 'Thêm nợ cần thu'
              : 'Thêm nợ phải trả'
        }
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          setLoaiCongNo(null);
        }}
        width={900}
        okText={editingId ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          {/* Hidden field for loai_cong_no */}
          <Form.Item name="loai_cong_no" hidden>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Tiêu đề" name="name" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                <Input placeholder="Nhập tiêu đề" />
              </Form.Item>
            </Col>

            {/* Hiển thị Nhà cung cấp khi loại = payable */}
            {(loaiCongNo === 'payable' || editingId) && (
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Đối tác / NCC"
                  name="nha_cung_cap_id"
                //   rules={loaiCongNo === 'payable' ? [{ required: true, message: 'Vui lòng chọn nhà cung cấp' }] : []}
                >
                  <Select
                    placeholder="Chọn đối tác hoặc NCC"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    disabled={loaiCongNo === 'receivable'}
                  >
                    {nhaCungCapList.map((ncc) => (
                      <Select.Option key={ncc.id} value={ncc.id}>
                        {ncc.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}

            {/* Hiển thị Khách hàng khi loại = receivable */}
            {(loaiCongNo === 'receivable' || editingId) && (
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Khách hàng"
                  name="users_id"
                //   rules={loaiCongNo === 'receivable' ? [{ required: true, message: 'Vui lòng chọn khách hàng' }] : []}
                >
                  <Select
                    placeholder="Chọn khách hàng"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    disabled={loaiCongNo === 'payable'}
                  >
                    {usersList.map((user) => (
                      <Select.Option key={user.id} value={user.id}>
                        {user.name} - {user.phone}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}

            <Col xs={24} sm={12}>
              <Form.Item label="Loại chứng từ" name="loai_chung_tu">
                <Select placeholder="Chọn loại chứng từ">
                  <Select.Option value="product_tra_hang_ncc">Trả hàng NCC</Select.Option>
                  <Select.Option value="product_nhap_hang">Nhập hàng</Select.Option>
                  <Select.Option value="hoa_don">Hóa đơn</Select.Option>
                  <Select.Option value="product_khach_tra_hang">Khách trả hàng</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Mã chứng từ" name="ma_chung_tu">
                <Input placeholder="Nhập mã chứng từ" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Tổng tiền hóa đơn" name="tong_tien_hoa_don">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                  placeholder="Nhập tổng tiền"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Số tiền đã thanh toán" name="so_tien_da_thanh_toan">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                  placeholder="Nhập số tiền đã thanh toán"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Số tiền nợ" name="so_tien_no" rules={[{ required: true, message: 'Vui lòng nhập số tiền nợ' }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                  placeholder="Nhập số tiền nợ"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Trạng thái" name="cong_no_status_id" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
                <Select placeholder="Chọn trạng thái">
                  {statusList.map((status) => (
                    <Select.Option key={status.id} value={status.id}>
                      {status.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Ngày hẹn tất toán" name="ngay_hen_tat_toan">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày hẹn" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Thông tin" name="info">
                <Input.TextArea rows={3} placeholder="Nhập thông tin bổ sung" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Payment Modal */}
      <PaymentModal
        visible={paymentModalVisible}
        congNo={selectedCongNo}
        onClose={() => {
          setPaymentModalVisible(false);
          setSelectedCongNo(null);
        }}
        onSuccess={() => {
          setPaymentModalVisible(false);
          setSelectedCongNo(null);
          loadData();
        }}
      />
    </div>
  );
};

export default CongNoList;
