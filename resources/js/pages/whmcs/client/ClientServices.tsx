import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Input, Select, message, Modal } from 'antd';
import { SearchOutlined, EyeOutlined, PlayCircleOutlined, PauseCircleOutlined, StopOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

interface Service {
  id: number;
  domain: string;
  product: {
    id: number;
    name: string;
    type: string;
  };
  status: string;
  billing_cycle: string;
  recurring_amount: number;
  next_due_date: string;
  registration_date: string;
}

const ClientServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    fetchServices();
  }, [pagination.current, filters]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/aio/api/whmcs/client/services', {
        params: {
          page: pagination.current,
          per_page: pagination.pageSize,
          ...filters,
        },
      });
      setServices(response.data.data);
      setPagination({ ...pagination, total: response.data.total });
    } catch {
      message.error('Không thể tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (service: Service) => {
    Modal.confirm({
      title: 'Gia hạn dịch vụ',
      content: `Bạn có muốn gia hạn dịch vụ ${service.domain}?`,
      onOk: async () => {
        try {
          await axios.post(`/aio/api/whmcs/client/services/${service.id}/renew`);
          message.success('Yêu cầu gia hạn thành công');
          fetchServices();
        } catch {
          message.error('Không thể gia hạn dịch vụ');
        }
      },
    });
  };

  const statusColors: Record<string, string> = {
    active: 'success',
    pending: 'warning',
    suspended: 'error',
    terminated: 'default',
    cancelled: 'default',
  };

  const statusLabels: Record<string, string> = {
    active: 'Hoạt động',
    pending: 'Chờ kích hoạt',
    suspended: 'Tạm ngưng',
    terminated: 'Đã hủy',
    cancelled: 'Đã hủy',
  };

  const cycleLabels: Record<string, string> = {
    monthly: 'Hàng tháng',
    quarterly: 'Hàng quý',
    semiannually: '6 tháng',
    annually: 'Hàng năm',
    biennially: '2 năm',
    triennially: '3 năm',
  };

  const columns: ColumnsType<Service> = [
    {
      title: 'Domain/Dịch vụ',
      dataIndex: 'domain',
      key: 'domain',
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'product',
      key: 'product',
      render: (product) => `${product.name} (${product.type})`,
    },
    {
      title: 'Chu kỳ thanh toán',
      dataIndex: 'billing_cycle',
      key: 'billing_cycle',
      render: (cycle: string) => cycleLabels[cycle] || cycle,
    },
    {
      title: 'Giá',
      dataIndex: 'recurring_amount',
      key: 'recurring_amount',
      render: (amount: number) => `${amount.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Ngày đến hạn',
      dataIndex: 'next_due_date',
      key: 'next_due_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
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
            href={`/aio/whmcs/services/${record.id}`}
          >
            Chi tiết
          </Button>
          {record.status === 'active' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleRenew(record)}
            >
              Gia hạn
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Dịch vụ của tôi"
      extra={
        <Space>
          <Input
            placeholder="Tìm kiếm domain..."
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
            <Option value="active">Hoạt động</Option>
            <Option value="pending">Chờ kích hoạt</Option>
            <Option value="suspended">Tạm ngưng</Option>
            <Option value="terminated">Đã hủy</Option>
          </Select>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={services}
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

export default ClientServices;
