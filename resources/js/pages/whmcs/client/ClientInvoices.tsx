import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Input, Select, message } from 'antd';
import { SearchOutlined, EyeOutlined, FilePdfOutlined, DollarOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

interface Invoice {
  id: number;
  invoice_number: string;
  date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  created_at: string;
}

const ClientInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    fetchInvoices();
  }, [pagination.current, filters]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/aio/api/whmcs/client/invoices', {
        params: {
          page: pagination.current,
          per_page: pagination.pageSize,
          ...filters,
        },
      });
      setInvoices(response.data.data);
      setPagination({ ...pagination, total: response.data.total });
    } catch {
      message.error('Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (invoice: Invoice) => {
    try {
      const response = await axios.post(`/aio/api/whmcs/client/invoices/${invoice.id}/pay`);
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        message.success('Thanh toán thành công');
        fetchInvoices();
      }
    } catch {
      message.error('Không thể thực hiện thanh toán');
    }
  };

  const statusColors: Record<string, string> = {
    paid: 'success',
    unpaid: 'error',
    cancelled: 'default',
    refunded: 'warning',
    draft: 'default',
  };

  const statusLabels: Record<string, string> = {
    paid: 'Đã thanh toán',
    unpaid: 'Chưa thanh toán',
    cancelled: 'Đã hủy',
    refunded: 'Đã hoàn tiền',
    draft: 'Nháp',
  };

  const columns: ColumnsType<Invoice> = [
    {
      title: 'Số hóa đơn',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày đến hạn',
      dataIndex: 'due_date',
      key: 'due_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => `${total.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            href={`/aio/whmcs/invoices/${record.id}`}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<FilePdfOutlined />}
            href={`/aio/api/whmcs/client/invoices/${record.id}/pdf`}
            target="_blank"
          >
            PDF
          </Button>
          {record.status === 'unpaid' && (
            <Button
              type="primary"
              size="small"
              icon={<DollarOutlined />}
              onClick={() => handlePayment(record)}
            >
              Thanh toán
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Hóa đơn của tôi"
      extra={
        <Space>
          <Input
            placeholder="Tìm kiếm số hóa đơn..."
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            placeholder="Trạng thái"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => setFilters({ ...filters, status: value })}
          >
            <Option value="unpaid">Chưa thanh toán</Option>
            <Option value="paid">Đã thanh toán</Option>
            <Option value="cancelled">Đã hủy</Option>
          </Select>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={invoices}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page) => setPagination({ ...pagination, current: page }),
        }}
      />
    </Card>
  );
};

export default ClientInvoices;
