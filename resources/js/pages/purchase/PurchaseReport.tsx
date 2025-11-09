import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  DatePicker,
  Select,
  Space,
  Tabs,
  Tag
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  ShopOutlined,
  InboxOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import axios from 'axios';
import API from '../../common/api';
import dayjs from 'dayjs';
import '../../../css/common-responsive.css';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface Overview {
  total_orders: number;
  total_value: number;
  total_paid: number;
  total_debt: number;
  total_suppliers: number;
  total_receipts: number;
}

interface SupplierReport {
  id: number;
  name: string;
  code: string;
  total_orders: number;
  total_value: number;
  total_paid: number;
  total_debt: number;
}

interface TimeReport {
  period: string;
  total_orders: number;
  total_value: number;
  total_paid: number;
  total_debt: number;
}

interface StatusReport {
  status: string;
  count: number;
  total_value: number;
}

const PurchaseReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [groupBy, setGroupBy] = useState('day');

  // Overview data
  const [overview, setOverview] = useState<Overview>({
    total_orders: 0,
    total_value: 0,
    total_paid: 0,
    total_debt: 0,
    total_suppliers: 0,
    total_receipts: 0
  });

  // Report data
  const [supplierReport, setSupplierReport] = useState<SupplierReport[]>([]);
  const [timeReport, setTimeReport] = useState<TimeReport[]>([]);
  const [statusReport, setStatusReport] = useState<StatusReport[]>([]);
  const [topSuppliers, setTopSuppliers] = useState<SupplierReport[]>([]);

  useEffect(() => {
    loadOverview();
    loadSupplierReport();
    loadTimeReport();
    loadStatusReport();
    loadTopSuppliers();
  }, [dateRange, groupBy]);

  const getDateParams = () => {
    const params: any = {};
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.from_date = dateRange[0].format('YYYY-MM-DD');
      params.to_date = dateRange[1].format('YYYY-MM-DD');
    }
    return params;
  };

  const loadOverview = async () => {
    try {
      const response = await axios.post(API.purchaseReportOverview, getDateParams());
      if (response.data.status === 'success') {
        setOverview(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải báo cáo tổng quan:', error);
    }
  };

  const loadSupplierReport = async () => {
    setLoading(true);
    try {
      const response = await axios.post(API.purchaseReportBySupplier, getDateParams());
      if (response.data.status === 'success') {
        setSupplierReport(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải báo cáo theo NCC:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeReport = async () => {
    try {
      const params = { ...getDateParams(), group_by: groupBy };
      const response = await axios.post(API.purchaseReportByTime, params);
      if (response.data.status === 'success') {
        setTimeReport(response.data.data.orders_by_time || []);
      }
    } catch (error) {
      console.error('Lỗi khi tải báo cáo theo thời gian:', error);
    }
  };

  const loadStatusReport = async () => {
    try {
      const response = await axios.post(API.purchaseReportByStatus, getDateParams());
      if (response.data.status === 'success') {
        setStatusReport(response.data.data.by_status || []);
      }
    } catch (error) {
      console.error('Lỗi khi tải báo cáo trạng thái:', error);
    }
  };

  const loadTopSuppliers = async () => {
    try {
      const params = { ...getDateParams(), limit: 10 };
      const response = await axios.post(API.purchaseReportTopSuppliers, params);
      if (response.data.status === 'success') {
        setTopSuppliers(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải top NCC:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  };

  const supplierColumns: ColumnsType<SupplierReport> = [
    {
      title: 'Mã NCC',
      dataIndex: 'code',
      key: 'code',
      width: 120
    },
    {
      title: 'Tên NCC',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: 'Số đơn',
      dataIndex: 'total_orders',
      key: 'total_orders',
      width: 100,
      align: 'center'
    },
    {
      title: 'Tổng giá trị',
      dataIndex: 'total_value',
      key: 'total_value',
      width: 150,
      align: 'right',
      render: (value) => formatCurrency(value || 0)
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'total_paid',
      key: 'total_paid',
      width: 150,
      align: 'right',
      render: (value) => <span style={{ color: '#52c41a' }}>{formatCurrency(value || 0)}</span>
    },
    {
      title: 'Công nợ',
      dataIndex: 'total_debt',
      key: 'total_debt',
      width: 150,
      align: 'right',
      render: (value) => <span style={{ color: value > 0 ? '#ff4d4f' : '#52c41a' }}>{formatCurrency(value || 0)}</span>
    }
  ];

  const timeColumns: ColumnsType<TimeReport> = [
    {
      title: 'Thời gian',
      dataIndex: 'period',
      key: 'period',
      width: 120
    },
    {
      title: 'Số đơn',
      dataIndex: 'total_orders',
      key: 'total_orders',
      width: 100,
      align: 'center'
    },
    {
      title: 'Tổng giá trị',
      dataIndex: 'total_value',
      key: 'total_value',
      width: 150,
      align: 'right',
      render: (value) => formatCurrency(value || 0)
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'total_paid',
      key: 'total_paid',
      width: 150,
      align: 'right',
      render: (value) => <span style={{ color: '#52c41a' }}>{formatCurrency(value || 0)}</span>
    },
    {
      title: 'Công nợ',
      dataIndex: 'total_debt',
      key: 'total_debt',
      width: 150,
      align: 'right',
      render: (value) => <span style={{ color: value > 0 ? '#ff4d4f' : '#52c41a' }}>{formatCurrency(value || 0)}</span>
    }
  ];

  const statusColumns: ColumnsType<StatusReport> = [
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        const statusMap: any = {
          draft: { label: 'Nháp', color: 'default' },
          sent: { label: 'Đã gửi', color: 'processing' },
          receiving: { label: 'Đang nhận', color: 'warning' },
          completed: { label: 'Hoàn thành', color: 'success' },
          cancelled: { label: 'Đã hủy', color: 'error' }
        };
        const config = statusMap[status] || { label: status, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      }
    },
    {
      title: 'Số lượng',
      dataIndex: 'count',
      key: 'count',
      width: 120,
      align: 'center'
    },
    {
      title: 'Tổng giá trị',
      dataIndex: 'total_value',
      key: 'total_value',
      width: 180,
      align: 'right',
      render: (value) => formatCurrency(value || 0)
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      {/* Filter Bar */}
      <Card style={{ marginBottom: 20 }}>
        <Space size="large" wrap>
          <div>
            <span style={{ marginRight: 8 }}>Thời gian:</span>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </div>
          <div>
            <span style={{ marginRight: 8 }}>Nhóm theo:</span>
            <Select value={groupBy} onChange={setGroupBy} style={{ width: 150 }}>
              <Select.Option value="day">Ngày</Select.Option>
              <Select.Option value="month">Tháng</Select.Option>
              <Select.Option value="year">Năm</Select.Option>
            </Select>
          </div>
        </Space>
      </Card>

      {/* Overview Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={8} md={8} lg={4} xl={4}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={overview.total_orders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={8} lg={5} xl={5}>
          <Card>
            <Statistic
              title="Tổng giá trị"
              value={overview.total_value}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: 18 }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={8} lg={5} xl={5}>
          <Card>
            <Statistic
              title="Đã thanh toán"
              value={overview.total_paid}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: 18 }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={8} lg={5} xl={5}>
          <Card>
            <Statistic
              title="Công nợ"
              value={overview.total_debt}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#ff4d4f', fontSize: 18 }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={8} lg={2} xl={2}>
          <Card>
            <Statistic
              title="NCC"
              value={overview.total_suppliers}
              prefix={<ShopOutlined />}
              valueStyle={{ fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={8} lg={3} xl={3}>
          <Card>
            <Statistic
              title="Phiếu nhập"
              value={overview.total_receipts}
              prefix={<InboxOutlined />}
              valueStyle={{ fontSize: 20 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Reports Tabs */}
      <Card>
        <Tabs defaultActiveKey="supplier" type="card">
          <TabPane tab="Báo cáo theo NCC" key="supplier">
            <Table
              columns={supplierColumns}
              dataSource={supplierReport}
              rowKey="id"
              loading={loading}
              scroll={{ x: 800 }}
              pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Tổng ${total} NCC` }}
            />
          </TabPane>

          <TabPane tab="Báo cáo theo thời gian" key="time">
            <Table
              columns={timeColumns}
              dataSource={timeReport}
              rowKey="period"
              scroll={{ x: 700 }}
              pagination={{ pageSize: 20, showSizeChanger: true }}
            />
          </TabPane>

          <TabPane tab="Báo cáo trạng thái" key="status">
            <Table
              columns={statusColumns}
              dataSource={statusReport}
              rowKey="status"
              scroll={{ x: 500 }}
              pagination={false}
            />
          </TabPane>

          <TabPane tab="Top 10 NCC" key="top">
            <Table
              columns={supplierColumns}
              dataSource={topSuppliers}
              rowKey="id"
              scroll={{ x: 800 }}
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default PurchaseReport;
